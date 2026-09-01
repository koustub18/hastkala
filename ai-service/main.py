import os
import tempfile
import logging
import subprocess
import io
import uuid
import base64
from PIL import Image
from contextlib import asynccontextmanager
from fastapi import FastAPI, File, UploadFile, Form, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
import dotenv

from image_service import BriaRMBG2Service, ImageEnhancementPipeline
from deblur.deblur_service import NAFNetDebblurService

dotenv.load_dotenv()
os.environ["HF_HUB_DISABLE_SYMLINKS_WARNING"] = "1"
os.environ["HF_HUB_DISABLE_SYMLINKS"] = "1"


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("indic_asr_service")

# Global variables for model and device
model_pipeline = None
model_instance = None
processor_instance = None
device = "cpu"

rmbg_service = BriaRMBG2Service()
deblur_service = NAFNetDebblurService()
image_pipeline = ImageEnhancementPipeline(rmbg_service, deblur_service)
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "static", "enhanced")
os.makedirs(UPLOAD_DIR, exist_ok=True)

MODEL_NAME = os.getenv("MODEL_NAME", "ai4bharat/indic-conformer-600m-multilingual")
ALLOWED_ORIGINS_STR = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000,http://localhost:5001,http://127.0.0.1:5173,http://localhost:8081")
ALLOWED_ORIGINS = [origin.strip() for origin in ALLOWED_ORIGINS_STR.split(",") if origin.strip()]

SUPPORTED_LANGUAGES = {
    "auto": "Auto Detect",
    "hi": "Hindi (हिंदी)",
    "or": "Odia (ଓଡ଼ିଆ)",
    "bn": "Bengali (বাংলা)",
    "ta": "Tamil (தமிழ்)",
    "te": "Telugu (తెలుగు)",
    "mr": "Marathi (मराठी)",
    "gu": "Gujarati (ગુજરાતી)",
    "kn": "Kannada (ಕನ್ನಡ)",
    "ml": "Malayalam (മലയാളം)",
    "pa": "Punjabi (ਪੰਜਾਬੀ)",
    "as": "Assamese (অসমীয়া)",
    "ur": "Urdu (اردو)",
    "brx": "Bodo",
    "doi": "Dogri",
    "kok": "Konkani",
    "ks": "Kashmiri",
    "mai": "Maithili",
    "mni": "Manipuri",
    "ne": "Nepali",
    "sa": "Sanskrit",
    "sat": "Santali",
    "sd": "Sindhi"
}


def get_ffmpeg_path():
    """Locate ffmpeg executable from imageio_ffmpeg or system PATH."""
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except Exception:
        return "ffmpeg"

def convert_to_wav_16k_mono(input_path: str, output_path: str):
    """Converts input audio file to 16kHz mono WAV using ffmpeg."""
    ffmpeg_exe = get_ffmpeg_path()
    cmd = [
        ffmpeg_exe,
        "-y",
        "-i", input_path,
        "-ac", "1",
        "-ar", "16000",
        "-f", "wav",
        output_path
    ]
    logger.info(f"Running conversion: {' '.join(cmd)}")
    result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    if result.returncode != 0:
        logger.error(f"FFmpeg error: {result.stderr.decode('utf-8', errors='ignore')}")
        raise RuntimeError("Failed to process audio file format.")

async def load_asr_model_async():
    global model_instance
    import asyncio
    def _load():
        global model_instance
        logger.info(f"Loading ASR model '{MODEL_NAME}'...")
        hf_token = os.getenv("HF_TOKEN") or None
        try:
            from transformers import AutoModel
            model_dir = "./model_cache" if os.path.exists("./model_cache") else MODEL_NAME
            model_instance = AutoModel.from_pretrained(
                model_dir, 
                trust_remote_code=True, 
                token=hf_token
            )
            logger.info("Successfully loaded IndicConformer AutoModel.")
        except Exception as e:
            logger.error(f"Failed to load IndicConformer model directly: {e}")
            logger.info("Notice: Access to ai4bharat/indic-conformer-600m-multilingual is gated. Set HF_TOKEN in ai-service/.env or log in via huggingface-cli.")
    await asyncio.to_thread(_load)

async def load_rmbg_model_async():
    import asyncio
    def _load():
        try:
            rmbg_service.load_model()
        except Exception as rmbg_err:
            logger.error(f"Error during RMBG startup load: {rmbg_err}")
    await asyncio.to_thread(_load)

async def load_deblur_model_async():
    import asyncio
    def _load():
        try:
            deblur_service.load_model()
        except Exception as deblur_err:
            logger.error(f"Error during NAFNet Debblur startup load: {deblur_err}")
    await asyncio.to_thread(_load)

@asynccontextmanager
async def lifespan(app: FastAPI):
    global device
    import torch
    import asyncio
    
    device = "cuda" if torch.cuda.is_available() else "cpu"
    logger.info(f"Starting ASR & Image Enhancement Service on device: {device}")
    
    # Launch model loading in background tasks so server binds port 8000 immediately
    asyncio.create_task(load_asr_model_async())
    asyncio.create_task(load_rmbg_model_async())
    asyncio.create_task(load_deblur_model_async())

    yield
    logger.info("Shutting down ASR & Image Enhancement service.")


app = FastAPI(
    title="CraftAI IndicConformer, NAFNet Deblur & BRIA RMBG-2.0 Service",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    import torch
    current_device = "cuda" if torch.cuda.is_available() else "cpu"
    is_ready = model_instance is not None
    rmbg_ready = rmbg_service.is_ready()
    deblur_ready = deblur_service.is_ready()
    return {
        "status": "ok",
        "model": MODEL_NAME,
        "rmbg_model": rmbg_service.model_name,
        "deblur_model": "NAFNet-ONNX",
        "device": current_device,
        "ready": is_ready,
        "rmbg_ready": rmbg_ready,
        "deblur_ready": deblur_ready,
        "note": "Ready for IndicConformer, NAFNet Deblur & BRIA RMBG-2.0 inference"
    }

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/jpg"}
MAX_IMAGE_FILE_SIZE = 10 * 1024 * 1024  # 10MB

@app.post("/api/deblur")
@app.post("/api/deblur-image")
async def deblur_image_endpoint(
    file: UploadFile = File(None),
    image_file: UploadFile = File(None)
):
    """Step 1: Deblur input image using local NAFNet ONNX model."""
    upload = file or image_file
    if not upload:
        raise HTTPException(status_code=400, detail="Image file is required (form parameter 'file' or 'image_file').")

    try:
        contents = await upload.read()
        if len(contents) == 0:
            raise HTTPException(status_code=400, detail="Uploaded image file is empty.")

        input_image = Image.open(io.BytesIO(contents))
        output_image = image_pipeline.deblur_image(input_image)

        file_id = f"deblurred_{uuid.uuid4().hex[:12]}.png"
        file_path = os.path.join(UPLOAD_DIR, file_id)
        output_image.save(file_path, "PNG")

        buffer = io.BytesIO()
        output_image.save(buffer, format="PNG")
        base64_str = base64.b64encode(buffer.getvalue()).decode("utf-8")
        image_url = f"/api/image/{file_id}"

        return JSONResponse({
            "success": True,
            "image_url": image_url,
            "filename": file_id,
            "mimeType": "image/png",
            "base64Image": base64_str,
            "base64_image": f"data:image/png;base64,{base64_str}",
            "message": "Image deblurred successfully using NAFNet!"
        })
    except HTTPException:
        raise
    except Exception as err:
        logger.error(f"Debblurring error: {err}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to deblur image. Please try again.")

@app.post("/api/remove-bg")
@app.post("/api/removebg")
async def remove_bg_endpoint(
    file: UploadFile = File(None),
    image_file: UploadFile = File(None)
):
    """Step 2: Remove background from image and composite with clean white background."""
    upload = file or image_file
    if not upload:
        raise HTTPException(status_code=400, detail="Image file is required (form parameter 'file' or 'image_file').")

    try:
        contents = await upload.read()
        if len(contents) == 0:
            raise HTTPException(status_code=400, detail="Uploaded image file is empty.")

        input_image = Image.open(io.BytesIO(contents))
        output_image = image_pipeline.remove_background(input_image, add_white_bg=True)

        file_id = f"removebg_{uuid.uuid4().hex[:12]}.png"
        file_path = os.path.join(UPLOAD_DIR, file_id)
        output_image.save(file_path, "PNG")

        buffer = io.BytesIO()
        output_image.save(buffer, format="PNG")
        base64_str = base64.b64encode(buffer.getvalue()).decode("utf-8")
        image_url = f"/api/image/{file_id}"

        return JSONResponse({
            "success": True,
            "image_url": image_url,
            "filename": file_id,
            "mimeType": "image/png",
            "base64Image": base64_str,
            "base64_image": f"data:image/png;base64,{base64_str}",
            "message": "Background removed successfully with clean white background!"
        })
    except HTTPException:
        raise
    except Exception as err:
        logger.error(f"Remove BG error: {err}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to remove background. Please try again.")

@app.post("/api/improve-image")
@app.post("/api/ai/enhance")
@app.post("/api/enhance")
@app.post("/api/deblur-and-removebg")
async def improve_image(
    file: UploadFile = File(None),
    image_file: UploadFile = File(None)
):
    """Full Sequential Pipeline: Debblur (NAFNet) -> Remove Background (RMBG-2.0) -> White Background overlay."""
    upload = file or image_file
    if not upload:
        raise HTTPException(status_code=400, detail="Image file is required (form parameter 'file' or 'image_file').")
    
    if upload.content_type and upload.content_type.lower() not in ALLOWED_IMAGE_TYPES:
        ext = os.path.splitext(upload.filename or "")[1].lower()
        if ext not in [".jpg", ".jpeg", ".png", ".webp"]:
            raise HTTPException(status_code=400, detail="Unsupported image type. Accepted formats: JPG, JPEG, PNG, WEBP.")

    try:
        contents = await upload.read()
        if len(contents) > MAX_IMAGE_FILE_SIZE:
            raise HTTPException(status_code=413, detail="Image too large. Maximum 10MB allowed.")
        
        if len(contents) == 0:
            raise HTTPException(status_code=400, detail="Uploaded image file is empty.")

        input_image = Image.open(io.BytesIO(contents))
        
        # Execute sequential pipeline: Debblur -> Remove BG -> White Background
        output_image = image_pipeline.process_product_image(input_image)
        
        file_id = f"enhanced_{uuid.uuid4().hex[:12]}.png"
        file_path = os.path.join(UPLOAD_DIR, file_id)
        output_image.save(file_path, "PNG")
        
        buffer = io.BytesIO()
        output_image.save(buffer, format="PNG")
        base64_str = base64.b64encode(buffer.getvalue()).decode("utf-8")
        
        image_url = f"/api/image/{file_id}"
        
        return JSONResponse({
            "success": True,
            "image_url": image_url,
            "filename": file_id,
            "mimeType": "image/png",
            "base64Image": base64_str,
            "base64_image": f"data:image/png;base64,{base64_str}",
            "message": "Image deblurred, background removed, and white background applied successfully!"
        })
        
    except HTTPException:
        raise
    except Exception as err:
        logger.error(f"Image enhancement error: {err}", exc_info=True)
        raise HTTPException(status_code=500, detail="We couldn't improve this image right now. Please try another image.")

@app.get("/api/image/{filename}")
async def get_enhanced_image(filename: str):
    safe_filename = os.path.basename(filename)
    file_path = os.path.join(UPLOAD_DIR, safe_filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Enhanced image not found")
    return FileResponse(file_path, media_type="image/png")


def is_error_response(text: str) -> bool:
    """Check if the translated text is an HTTP error string (e.g. Google Translate 500 error page)."""
    if not text:
        return False
    lower = text.lower()
    error_keywords = [
        "error 500", "server error", "that's an error",
        "there was an error", "please try again later",
        "that's all we know", "500.that", "http error"
    ]
    return any(keyword in lower for keyword in error_keywords)

def generate_groq_seo_fields(native_text: str):
    """Use Groq API key securely to translate Indic speech and generate SEO-friendly product details."""
    groq_api_key = os.getenv("GROQ_API_KEY")
    if not groq_api_key:
        logger.warning("GROQ_API_KEY is not set.")
        return None

    import requests
    import json

    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {groq_api_key}",
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0"
    }

    prompt = (
        "You are an elite e-commerce copywriter and SEO specialist for HastKala, a luxury marketplace celebrating authentic Indian heritage handicrafts.\n"
        f"An artisan described their handcrafted product in their own words:\n\"{native_text}\"\n\n"
        "Your task is to transform this raw input into an irresistible, premium, high-converting e-commerce listing that captivates online buyers.\n"
        "Generate a structured JSON object with the following fields EXACTLY:\n"
        "{\n"
        "  \"english_text\": \"Clear, natural, fluent English translation of the spoken words\",\n"
        "  \"title\": \"A compelling, high-converting, SEO-optimized title (6-12 words). Include the craft name, material, style, and key aesthetic appeal. (e.g., Vibrant Red & Yellow Handloom Sambalpuri Cotton Saree – Traditional Ikat Elegance)\",\n"
        "  \"category\": \"Select the best matching category from: [Textiles, Pottery, Paintings, Jewelry, Woodwork, Metalware, Home Decor]\",\n"
        "  \"material\": \"Specific primary material (e.g., 100% Handloom Cotton, Pure Tassar Silk, Natural Terracotta Clay, Handcast Dokra Brass, Teak Wood)\",\n"
        "  \"description\": \"An engaging, persuasive 3-4 sentence e-commerce description crafted to drive online sales. Emphasize traditional handloom/artisan heritage, intricate craftsmanship, organic materials, tactile quality, and versatile use (festive celebrations, elegant home decor, or memorable gifting). Use evocative, sensory, and trust-building language.\"\n"
        "}\n"
        "Return ONLY valid JSON without markdown formatting or codeblocks."
    )

    models_to_try = ["groq/compound-mini", "groq/compound", "openai/gpt-oss-20b", "qwen/qwen3.8-27b"]
    for model in models_to_try:
        try:
            payload = {
                "model": model,
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.3,
                "max_tokens": 500
            }
            res = requests.post(url, headers=headers, json=payload, timeout=10)
            if res.status_code == 200:
                raw_out = res.json()["choices"][0]["message"]["content"].strip()
                raw_out = raw_out.replace("```json", "").replace("```", "").strip()
                parsed = json.loads(raw_out)
                
                english_text = parsed.get("english_text", "").strip()
                title = parsed.get("title", "").strip()
                category = parsed.get("category", "Textiles").strip()
                material = parsed.get("material", "").strip()
                description = parsed.get("description", "").strip()

                if not is_error_response(english_text) and not is_error_response(title) and not is_error_response(description):
                    logger.info(f"Successfully generated SEO fields via Groq using model {model}")
                    return {
                        "english_text": english_text or native_text,
                        "title": title,
                        "category": category or "Textiles",
                        "material": material,
                        "description": description or english_text or native_text
                    }
        except Exception as err:
            logger.warning(f"Groq API call with model {model} failed: {err}")
    
    return None

def extract_english_fields(native_text: str):
    """Translate native Indic speech transcription into English and extract product fields via Groq API."""
    if not native_text or not native_text.strip() or is_error_response(native_text):
        return {
            "english_text": "",
            "title": "",
            "category": "Textiles",
            "material": "",
            "description": ""
        }
    
    clean_native = native_text.strip()

    # 1. Try Groq API for translation and SEO-friendly product details generation
    groq_result = generate_groq_seo_fields(clean_native)
    if groq_result and groq_result.get("english_text"):
        return groq_result

    # 2. Fallback translation via GoogleTranslator with error sanitization
    english_text = clean_native
    try:
        from deep_translator import GoogleTranslator
        translated = GoogleTranslator(source='auto', target='en').translate(clean_native)
        if translated and not is_error_response(translated):
            english_text = translated.strip()
    except Exception as t_err:
        logger.warning(f"English translation warning: {t_err}")

    if is_error_response(english_text):
        english_text = clean_native

    # Heuristic fallback field extraction
    lower = english_text.lower()

    # Material Extraction
    material = ""
    materials_map = [
        ("cotton", "Natural Handloom Cotton"),
        ("silk", "Pure Tassar Silk"),
        ("terracotta", "Terracotta Clay"),
        ("clay", "Terracotta Clay"),
        ("brass", "Handcast Brass (Dokra)"),
        ("wood", "Natural Hardwood"),
        ("bamboo", "Bamboo & Cane"),
        ("jute", "Natural Jute Fiber"),
        ("canvas", "Handmade Canvas"),
        ("wool", "Pure Wool")
    ]
    for key, val in materials_map:
        if key in lower:
            material = val
            break

    # Category Extraction
    category = "Textiles"
    category_map = [
        (["saree", "sari", "stole", "dupatta", "handloom", "fabric", "cloth", "shawl", "towel", "gamucha", "kurta", "dress", "weaving", "cotton", "silk"], "Textiles"),
        (["pottery", "clay", "terracotta", "pot", "diya", "matka", "earthenware"], "Pottery"),
        (["painting", "pattachitra", "madhubani", "art", "wall art", "canvas", "drawing"], "Paintings"),
        (["jewelry", "jewel", "bangle", "necklace", "ring", "ornament", "bead"], "Jewelry"),
        (["wood", "wooden", "carving", "toy", "doll", "statue"], "Woodwork"),
        (["brass", "dokra", "dhokra", "metal", "bronze", "copper"], "Metalware")
    ]
    for keys, cat_val in category_map:
        if any(k in lower for k in keys):
            category = cat_val
            break

    # Title Extraction
    title = ""
    if "sambalpuri" in lower:
        title = "Handwoven Sambalpuri Handloom Saree"
    elif "pattachitra" in lower:
        title = "Traditional Hand-Painted Pattachitra Artwork"
    elif "madhubani" in lower:
        title = "Hand-Painted Madhubani Folk Art Painting"
    elif "terracotta" in lower:
        title = "Handcrafted Terracotta Decorative Craft"
    elif "dokra" in lower or "dhokra" in lower:
        title = "Authentic Tribal Dokra Brass Artifact"
    else:
        words = [w.capitalize() for w in english_text.split()[:6] if len(w) > 1 and not is_error_response(w)]
        title = " ".join(words) if words else "Handcrafted Artisan Product"

    description = english_text

    return {
        "english_text": english_text,
        "title": title,
        "category": category,
        "material": material,
        "description": description
    }

def transcribe_via_groq_whisper(audio_path: str, language: str = None) -> str:
    """Fallback audio transcription using Groq Whisper API."""
    groq_api_key = os.getenv("GROQ_API_KEY")
    if not groq_api_key:
        return ""
    
    import requests
    url = "https://api.groq.com/openai/v1/audio/transcriptions"
    headers = {
        "Authorization": f"Bearer {groq_api_key}"
    }
    
    try:
        with open(audio_path, "rb") as f:
            files = {"file": (os.path.basename(audio_path), f, "audio/wav")}
            data = {
                "model": "whisper-large-v3-turbo",
                "response_format": "json"
            }
            if language and language != "auto" and len(language) == 2:
                data["language"] = language
                
            res = requests.post(url, headers=headers, files=files, data=data, timeout=15)
            if res.status_code == 200:
                result = res.json()
                text = result.get("text", "").strip()
                logger.info(f"Groq Whisper transcription success: {text[:60]}...")
                return text
            else:
                logger.warning(f"Groq Whisper transcription error {res.status_code}: {res.text}")
    except Exception as err:
        logger.error(f"Groq Whisper transcription failed: {err}")
        
    return ""

@app.post("/transcribe")
async def transcribe_audio(
    audio: UploadFile = File(...),
    language: str = Form("or")
):
    if not audio:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Audio file is required."
        )

    # Save uploaded file to temp file
    temp_in = None
    temp_out = None
    try:
        suffix = os.path.splitext(audio.filename or "audio")[1] or ".tmp"
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp_in_file:
            temp_in = tmp_in_file.name
            content = await audio.read()
            if not content:
                return JSONResponse(
                    status_code=400,
                    content={"success": False, "error": "Empty audio file received."}
                )
            tmp_in_file.write(content)

        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp_out_file:
            temp_out = tmp_out_file.name

        # Convert to 16kHz mono WAV
        try:
            convert_to_wav_16k_mono(temp_in, temp_out)
        except Exception as conv_err:
            logger.error(f"Audio conversion failed: {conv_err}")
            return JSONResponse(
                status_code=400,
                content={"success": False, "error": "Invalid or unsupported audio format."}
            )

        # Transcribe audio using IndicConformer model or Groq Whisper fallback
        transcription_text = ""
        used_language = language
        
        if model_instance is not None:
            import torch
            import soundfile as sf
            
            try:
                wav_numpy, sr = sf.read(temp_out)
                wav = torch.from_numpy(wav_numpy).float()
                if wav.ndim == 1:
                    wav = wav.unsqueeze(0)
                elif wav.ndim == 2:
                    wav = wav.t()
            except Exception as load_err:
                logger.warning(f"soundfile read failed, falling back to torchaudio soundfile backend: {load_err}")
                import torchaudio
                wav, sr = torchaudio.load(temp_out, backend="soundfile")

            wav = torch.mean(wav, dim=0, keepdim=True)
            
            target_sample_rate = 16000
            if sr != target_sample_rate:
                import torchaudio
                resampler = torchaudio.transforms.Resample(orig_freq=sr, new_freq=target_sample_rate)
                wav = resampler(wav)
                
            def run_inference_for_lang(lang_code):
                try:
                    res = model_instance(wav, lang_code, "ctc")
                    t = str(res[0]) if isinstance(res, (list, tuple)) and len(res) > 0 else (res.get("text", str(res)) if isinstance(res, dict) else str(res))
                    return t.strip()
                except Exception as ctc_err:
                    try:
                        res = model_instance(wav, lang_code, "rnnt")
                        t = str(res[0]) if isinstance(res, (list, tuple)) and len(res) > 0 else str(res)
                        return t.strip()
                    except Exception:
                        return ""

            if language == "auto" or not language or language not in SUPPORTED_LANGUAGES:
                candidate_langs = ["or", "hi", "bn", "ta", "te", "mr", "gu", "kn", "ml", "pa", "as", "ur"]
                best_text = ""
                best_lang = "or"
                
                for candidate in candidate_langs:
                    cand_text = run_inference_for_lang(candidate)
                    if cand_text and len(cand_text) > len(best_text):
                        best_text = cand_text
                        best_lang = candidate
                
                transcription_text = best_text
                used_language = best_lang
            else:
                transcription_text = run_inference_for_lang(language)
                used_language = language

        # Fallback to Groq Whisper API if IndicConformer is unavailable or returned empty string
        if not transcription_text:
            logger.info("IndicConformer returned empty or unavailable. Running Groq Whisper ASR fallback...")
            transcription_text = transcribe_via_groq_whisper(temp_out, language)

        if not transcription_text:
            transcription_text = "Handcrafted traditional artisan product"


        transcription_text = transcription_text.strip()
        lang_name = SUPPORTED_LANGUAGES.get(used_language, used_language.upper())
        
        # Translate to English & extract product fields
        extracted = extract_english_fields(transcription_text)
        
        return {
            "success": True,
            "text": transcription_text,
            "english_text": extracted["english_text"],
            "language": used_language,
            "language_name": lang_name,
            "title": extracted["title"],
            "category": extracted["category"],
            "material": extracted["material"],
            "description": extracted["description"],
            "extracted_fields": {
                "title": extracted["title"],
                "category": extracted["category"],
                "material": extracted["material"],
                "description": extracted["description"]
            }
        }

    except Exception as err:
        logger.error(f"Transcription error: {err}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "Transcription failed. Please try again."}
        )

    finally:
        # Clean up temporary files
        if temp_in and os.path.exists(temp_in):
            try:
                os.remove(temp_in)
            except Exception:
                pass
        if temp_out and os.path.exists(temp_out):
            try:
                os.remove(temp_out)
            except Exception:
                pass

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    uvicorn.run(app, host=host, port=port)
