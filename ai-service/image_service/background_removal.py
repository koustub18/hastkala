import os
import torch
import logging
from PIL import Image
from torchvision import transforms
from transformers import AutoModelForImageSegmentation

logger = logging.getLogger("bria_rmbg_service")

class BriaRMBG2Service:
    def __init__(self, model_name: str = "briaai/RMBG-2.0"):
        self.model_name = model_name
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model = None
        self.image_size = (1024, 1024)
        
        # Image transformation exactly as implemented in Colab notebook
        self.transform_image = transforms.Compose([
            transforms.Resize(self.image_size),
            transforms.ToTensor(),
            transforms.Normalize(
                [0.485, 0.456, 0.406],
                [0.229, 0.224, 0.225]
            )
        ])

    def load_model(self):
        """Loads BRIA RMBG-2.0 pretrained model onto designated device (CUDA or CPU)."""
        logger.info(f"Initializing BRIA RMBG-2.0 model '{self.model_name}' on device: {self.device}")
        hf_token = os.getenv("HF_TOKEN") or None
        
        try:
            self.model = AutoModelForImageSegmentation.from_pretrained(
                self.model_name,
                trust_remote_code=True,
                token=hf_token
            ).eval().to(self.device)
            logger.info("BRIA RMBG-2.0 model loaded successfully!")
        except Exception as e:
            logger.error(f"Error loading BRIA RMBG-2.0 model ({self.model_name}): {e}", exc_info=True)
            self.model = None

    def is_ready(self) -> bool:
        return self.model is not None

    def remove_background(self, input_image: Image.Image) -> Image.Image:
        """
        Removes background from PIL Image using BRIA RMBG-2.0.
        Implementation matches the Colab notebook:
          1. Convert to RGB
          2. Transform image tensor
          3. Perform model inference with sigmoid activation
          4. Convert prediction to PIL mask and resize to original dimensions
          5. Apply alpha mask to original image
        """
        image = input_image.convert("RGB")
        
        if self.model is None:
            logger.warning("RMBG-2.0 model is not initialized yet. Returning original image as RGBA.")
            return input_image.convert("RGBA")

        try:
            # Transform
            input_images = self.transform_image(image).unsqueeze(0).to(self.device)

            # Prediction
            with torch.no_grad():
                preds = self.model(input_images)[-1].sigmoid().cpu()

            pred = preds[0].squeeze()

            # Convert prediction to PIL mask
            pred_pil = transforms.ToPILImage()(pred)

            # Resize mask to original image dimensions
            mask = pred_pil.resize(image.size)

            # Add transparency
            image_rgba = image.convert("RGBA")
            image_rgba.putalpha(mask)

            logger.info("Background removed successfully using BRIA RMBG-2.0!")
            return image_rgba

        except Exception as err:
            logger.error(f"Error during RMBG-2.0 inference: {err}", exc_info=True)
            return input_image.convert("RGBA")
