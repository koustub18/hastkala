"""
Extensible Image Enhancement Pipeline for HastKala AI Service.
Orchestrates NAFNet Debblurring model & RMBG-2.0 Background Removal with White Background composition.
"""

import logging
from PIL import Image
from .background_removal import BriaRMBG2Service, apply_white_background
from .lighting_enhancer import AdaptiveLightingEnhancer, lighting_enhancer
from deblur.deblur_service import NAFNetDebblurService

logger = logging.getLogger("image_pipeline")


class ImageEnhancementPipeline:
    def __init__(
        self,
        rmbg_service: BriaRMBG2Service,
        deblur_service: NAFNetDebblurService = None,
        lighting_service: AdaptiveLightingEnhancer = None
    ):
        self.rmbg_service = rmbg_service
        self.deblur_service = deblur_service or NAFNetDebblurService()
        self.lighting_enhancer = lighting_service or lighting_enhancer

    def deblur_image(self, input_image: Image.Image) -> Image.Image:
        """Applies NAFNet deblurring to restore blurry artisan image."""
        logger.info("Executing Stage 1: NAFNet Image Deblurring...")
        return self.deblur_service.deblur(input_image)

    def enhance_lighting(self, input_image: Image.Image) -> Image.Image:
        """Applies OpenCV/NumPy LAB Adaptive Lighting & Contrast Enhancement."""
        logger.info("Executing Stage 2: OpenCV LAB Adaptive Lighting Enhancement...")
        return self.lighting_enhancer.enhance(input_image)

    def remove_background(self, input_image: Image.Image, add_white_bg: bool = True) -> Image.Image:
        """Removes background using RMBG-2.0 model and applies clean white background."""
        logger.info("Executing Stage 3: Background Removal with White Background overlay...")
        return self.rmbg_service.remove_background(input_image, add_white_bg=add_white_bg)

    def process_product_image(self, input_image: Image.Image) -> Image.Image:
        """
        Executes full combined 3-stage pipeline:
        Stage 1: NAFNet Deblurring
        Stage 2: OpenCV LAB Adaptive Lighting Enhancement
        Stage 3: Background Removal with Clean White Background
        """
        logger.info("Starting Full 3-Stage Pipeline: Debblur -> Lighting Enhance -> Remove BG + White BG...")
        deblurred = self.deblur_image(input_image)
        lighting_enhanced = self.enhance_lighting(deblurred)
        final_enhanced = self.remove_background(lighting_enhanced, add_white_bg=True)
        logger.info("Full 3-Stage Image Enhancement Pipeline completed.")
        return final_enhanced

