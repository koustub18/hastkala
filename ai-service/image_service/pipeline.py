"""
Extensible Image Enhancement Pipeline for HastKala AI Service.
Orchestrates NAFNet Debblurring model & RMBG-2.0 Background Removal with White Background composition.
"""

import logging
from PIL import Image
from .background_removal import BriaRMBG2Service, apply_white_background
from deblur.deblur_service import NAFNetDebblurService

logger = logging.getLogger("image_pipeline")


class ImageEnhancementPipeline:
    def __init__(self, rmbg_service: BriaRMBG2Service, deblur_service: NAFNetDebblurService = None):
        self.rmbg_service = rmbg_service
        self.deblur_service = deblur_service or NAFNetDebblurService()

    def deblur_image(self, input_image: Image.Image) -> Image.Image:
        """Applies NAFNet deblurring to restore blurry artisan image."""
        logger.info("Executing NAFNet Image Debblurring stage...")
        return self.deblur_service.deblur(input_image)

    def remove_background(self, input_image: Image.Image, add_white_bg: bool = True) -> Image.Image:
        """Removes background using RMBG-2.0 model and applies clean white background."""
        logger.info("Executing Background Removal stage with White Background overlay...")
        return self.rmbg_service.remove_background(input_image, add_white_bg=add_white_bg)

    def process_product_image(self, input_image: Image.Image) -> Image.Image:
        """
        Executes full combined pipeline:
        Stage 1: NAFNet Deblurring
        Stage 2: Background Removal with Clean White Background
        """
        logger.info("Starting Full Pipeline: Debblur -> Remove BG -> White BG...")
        deblurred = self.deblur_image(input_image)
        enhanced = self.remove_background(deblurred, add_white_bg=True)
        logger.info("Full Image Enhancement Pipeline completed.")
        return enhanced
