import os
import torch
import logging
from PIL import Image
from torchvision import transforms
from transformers import AutoModelForImageSegmentation

logger = logging.getLogger("bria_rmbg_service")


def apply_white_background(rgba_image: Image.Image) -> Image.Image:
    """
    Overlays transparent RGBA image over a solid clean white background.
    No external APIs used - purely local PIL image compositing.
    """
    if rgba_image.mode != "RGBA":
        rgba_image = rgba_image.convert("RGBA")

    # Create solid white canvas
    white_bg = Image.new("RGBA", rgba_image.size, (255, 255, 255, 255))
    
    # Alpha composite transparent cutout on top of white background
    composite = Image.alpha_composite(white_bg, rgba_image)
    
    return composite.convert("RGB")


class BriaRMBG2Service:
    def __init__(self, model_name: str = "briaai/RMBG-2.0"):
        self.model_name = model_name
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model = None
        self.image_size = (1024, 1024)
        
        # Image transformation as per RMBG-2.0 specs
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
            logger.error(f"Error loading BRIA RMBG-2.0 model ({self.model_name}): {e}")
            self.model = None

    def is_ready(self) -> bool:
        return self.model is not None

    def remove_background(self, input_image: Image.Image, add_white_bg: bool = True) -> Image.Image:
        """
        Removes background from PIL Image using BRIA RMBG-2.0 (or rembg fallback).
        Applies white background composite if add_white_bg=True.
        """
        image = input_image.convert("RGB")
        
        if self.model is None:
            logger.warning("RMBG-2.0 model is not initialized yet.")
            try:
                # Try rembg fallback if available
                from rembg import remove
                rgba = remove(image)
                if add_white_bg:
                    return apply_white_background(rgba)
                return rgba
            except Exception:
                return input_image.convert("RGBA")

        try:
            input_images = self.transform_image(image).unsqueeze(0).to(self.device)

            with torch.no_grad():
                preds = self.model(input_images)[-1].sigmoid().cpu()

            pred = preds[0].squeeze()
            pred_pil = transforms.ToPILImage()(pred)
            mask = pred_pil.resize(image.size)

            image_rgba = image.convert("RGBA")
            image_rgba.putalpha(mask)

            logger.info("Background removed successfully using BRIA RMBG-2.0!")

            if add_white_bg:
                return apply_white_background(image_rgba)

            return image_rgba

        except Exception as err:
            logger.error(f"Error during RMBG-2.0 inference: {err}", exc_info=True)
            return input_image.convert("RGBA")
