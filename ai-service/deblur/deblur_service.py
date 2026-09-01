import os
import logging
import urllib.request
import numpy as np
from PIL import Image
import onnxruntime as ort

logger = logging.getLogger("deblur_service")

MODEL_PATH = os.path.join(os.path.dirname(__file__), "nafnet.onnx")
DOWNLOAD_URL = "https://drive.usercontent.google.com/download?id=1ZLRhkpCekNruJZggVpBgSoCx3k7bJ-5v&export=download"


class NAFNetDebblurService:
    def __init__(self, model_path: str = MODEL_PATH):
        self.model_path = model_path
        self.session = None
        self.input_name = None
        self.output_name = None

    def ensure_model_exists(self):
        """Downloads NAFNet ONNX model if not present locally."""
        if not os.path.exists(self.model_path) or os.path.getsize(self.model_path) < 10000000:
            logger.info(f"NAFNet model not found at {self.model_path}. Downloading...")
            os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
            urllib.request.urlretrieve(DOWNLOAD_URL, self.model_path)
            logger.info(f"NAFNet model downloaded successfully to {self.model_path}")

    def load_model(self):
        """Loads ONNX Runtime InferenceSession for NAFNet."""
        try:
            self.ensure_model_exists()
            providers = ["CUDAExecutionProvider", "CPUExecutionProvider"]
            self.session = ort.InferenceSession(self.model_path, providers=providers)
            self.input_name = self.session.get_inputs()[0].name
            self.output_name = self.session.get_outputs()[0].name
            logger.info(f"NAFNet Deblur model loaded successfully with providers: {self.session.get_providers()}")
        except Exception as err:
            logger.error(f"Failed to load NAFNet ONNX model: {err}", exc_info=True)
            self.session = None

    def is_ready(self) -> bool:
        return self.session is not None

    def deblur(self, input_image: Image.Image) -> Image.Image:
        """
        Applies NAFNet deblurring on PIL Image.
        Exact logic from Colab notebook:
          1. Convert to RGB & scale [0, 1] float32
          2. Transpose HWC -> CHW and expand batch dim to (1, 3, H, W)
          3. Run ONNX Session inference
          4. Squeeze batch dim, transpose CHW -> HWC
          5. Clip values [0, 1] and scale to 8-bit uint8 (0-255)
        """
        if self.session is None:
            self.load_model()

        if self.session is None:
            logger.warning("NAFNet session is not loaded. Returning original image.")
            return input_image

        try:
            orig_rgb = input_image.convert("RGB")
            orig_w, orig_h = orig_rgb.size

            # Ensure width & height are multiples of 64 for NAFNet downsampling blocks
            MULTIPLE = 64
            new_w = max(64, ((orig_w + MULTIPLE - 1) // MULTIPLE) * MULTIPLE)
            new_h = max(64, ((orig_h + MULTIPLE - 1) // MULTIPLE) * MULTIPLE)
            
            if (new_w, new_h) != (orig_w, orig_h):
                resized_img = orig_rgb.resize((new_w, new_h), Image.Resampling.BILINEAR)
            else:
                resized_img = orig_rgb

            img_np = np.array(resized_img).astype(np.float32) / 255.0

            # HWC -> CHW
            img_chw = np.transpose(img_np, (2, 0, 1))

            # Add batch dimension -> (1, 3, H, W)
            input_tensor = np.expand_dims(img_chw, axis=0)

            # Inference
            output = self.session.run([self.output_name], {self.input_name: input_tensor})[0]

            # Postprocessing: squeeze, CHW -> HWC
            output_sq = np.squeeze(output, axis=0)
            output_hwc = np.transpose(output_sq, (1, 2, 0))

            # Clip values between 0 and 1
            output_clipped = np.clip(output_hwc, 0.0, 1.0)
            output_uint8 = (output_clipped * 255.0).astype(np.uint8)

            deblurred_pil = Image.fromarray(output_uint8)

            # Resize back to original dimensions if resized
            if deblurred_pil.size != (orig_w, orig_h):
                deblurred_pil = deblurred_pil.resize((orig_w, orig_h), Image.Resampling.LANCZOS)

            logger.info(f"Successfully deblurred image of size {orig_w}x{orig_h} using NAFNet!")
            return deblurred_pil

        except Exception as err:
            logger.error(f"Error during NAFNet deblurring inference: {err}", exc_info=True)
            return input_image
