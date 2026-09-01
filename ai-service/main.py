import os
import tempfile
import logging
import subprocess
from contextlib import asynccontextmanager
from fastapi import FastAPI, File, UploadFile, Form, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import dotenv

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

@asynccontextmanager
async def lifespan(app: FastAPI):
    global model_instance, device
    import torch
    
    device = "cuda" if torch.cuda.is_available() else "cpu"
    logger.info(f"Starting ASR Service on device: {device}")
    logger.info(f"Loading model '{MODEL_NAME}'...")
    
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
    
    yield
    logger.info("Shutting down ASR service.")

app = FastAPI(
    title="CraftAI IndicConformer ASR Service",
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
    return {
        "status": "ok",
        "model": MODEL_NAME,
        "device": current_device,
        "ready": is_ready,
        "note": "Ready for IndicConformer inference" if is_ready else "HF gated repo token required. Set HF_TOKEN in ai-service/.env"
    }

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

        # Transcribe audio using loaded IndicConformer model
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
                # Auto-detect language by evaluating candidate Indic languages
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

        else:
            return JSONResponse(
                status_code=503,
                content={
                    "success": False, 
                    "error": "IndicConformer model is not loaded. Please set your HF_TOKEN in ai-service/.env to access ai4bharat/indic-conformer-600m-multilingual."
                }
            )

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
