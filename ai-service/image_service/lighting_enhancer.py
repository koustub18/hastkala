import cv2
import numpy as np
from PIL import Image
import logging

logger = logging.getLogger(__name__)

class AdaptiveLightingEnhancer:
    """
    Automatic product-image lighting enhancement system using purely OpenCV and NumPy.
    Works in LAB color space to adaptively adjust gamma, local contrast (CLAHE), 
    shadows/highlights, and color cast without altering natural product colors.
    """

    def __init__(
        self,
        target_lightness: float = 135.0,
        dark_threshold: float = 105.0,
        bright_threshold: float = 175.0,
        low_contrast_threshold: float = 40.0,
        color_cast_threshold: float = 8.0,
        clahe_clip_limit: float = 2.0,
        clahe_tile_grid: tuple = (8, 8)
    ):
        self.target_lightness = target_lightness
        self.dark_threshold = dark_threshold
        self.bright_threshold = bright_threshold
        self.low_contrast_threshold = low_contrast_threshold
        self.color_cast_threshold = color_cast_threshold
        self.clahe_clip_limit = clahe_clip_limit
        self.clahe_tile_grid = clahe_tile_grid

    def _analyze_lighting(self, l_channel: np.ndarray, a_channel: np.ndarray, b_channel: np.ndarray) -> dict:
        """Analyzes lighting statistics of the image across LAB channels."""
        mean_l = float(np.mean(l_channel))
        std_l = float(np.std(l_channel))
        p5 = float(np.percentile(l_channel, 5))
        p95 = float(np.percentile(l_channel, 95))
        
        # Calculate shadow and highlight region lightness
        dark_mask = l_channel < 64
        bright_mask = l_channel > 192
        shadow_mean = float(np.mean(l_channel[dark_mask])) if np.any(dark_mask) else mean_l
        highlight_mean = float(np.mean(l_channel[bright_mask])) if np.any(bright_mask) else mean_l

        # Color cast detection (in OpenCV 8-bit LAB, A and B are centered around 128)
        mean_a = float(np.mean(a_channel))
        mean_b = float(np.mean(b_channel))
        dev_a = abs(mean_a - 128.0)
        dev_b = abs(mean_b - 128.0)

        is_dark = mean_l < self.dark_threshold
        is_bright = mean_l > self.bright_threshold
        is_low_contrast = std_l < self.low_contrast_threshold or (p95 - p5) < 90.0
        is_shadow_heavy = (highlight_mean - shadow_mean) > 100.0 or shadow_mean < 45.0
        has_color_cast = dev_a > self.color_cast_threshold or dev_b > self.color_cast_threshold

        return {
            "mean_l": mean_l,
            "std_l": std_l,
            "p5": p5,
            "p95": p95,
            "shadow_mean": shadow_mean,
            "highlight_mean": highlight_mean,
            "mean_a": mean_a,
            "mean_b": mean_b,
            "is_dark": is_dark,
            "is_bright": is_bright,
            "is_low_contrast": is_low_contrast,
            "is_shadow_heavy": is_shadow_heavy,
            "has_color_cast": has_color_cast
        }

    def _apply_gamma_correction(self, l_channel: np.ndarray, mean_l: float) -> np.ndarray:
        """Applies adaptive Gamma Correction to balance global lightness."""
        if mean_l <= 0:
            return l_channel
        
        # Calculate optimal gamma to bring mean_l close to target_lightness
        gamma = np.log(self.target_lightness / 255.0) / np.log(mean_l / 255.0)
        gamma = np.clip(gamma, 0.45, 2.2)

        # Build LUT for speed and precision
        inv_gamma = 1.0 / gamma
        lut = np.array([((i / 255.0) ** inv_gamma) * 255 for i in range(256)]).astype(np.uint8)
        return cv2.LUT(l_channel, lut)

    def _apply_clahe(self, l_channel: np.ndarray) -> np.ndarray:
        """Applies CLAHE for local contrast enhancement."""
        clahe = cv2.createCLAHE(clipLimit=self.clahe_clip_limit, tileGridSize=self.clahe_tile_grid)
        return clahe.apply(l_channel)

    def _apply_shadow_adjustment(self, l_channel: np.ndarray, shadow_mean: float) -> np.ndarray:
        """Boosts shadow details without over-exposing highlights."""
        l_norm = l_channel.astype(np.float32) / 255.0
        # Sigmoidal shadow lift factor
        shadow_weight = np.exp(-3.0 * l_norm)
        boost = 0.15 * shadow_weight * (1.0 - l_norm)
        l_boosted = np.clip((l_norm + boost) * 255.0, 0, 255).astype(np.uint8)
        return l_boosted

    def _apply_white_balance(self, bgr_img: np.ndarray) -> np.ndarray:
        """Applies Gray-World White Balance algorithm to remove color casts."""
        b, g, r = cv2.split(bgr_img.astype(np.float32))
        mean_b, mean_g, mean_r = np.mean(b), np.mean(g), np.mean(r)
        
        if mean_b == 0 or mean_g == 0 or mean_r == 0:
            return bgr_img
        
        gray_mean = (mean_b + mean_g + mean_r) / 3.0
        
        b = np.clip(b * (gray_mean / mean_b), 0, 255)
        g = np.clip(g * (gray_mean / mean_g), 0, 255)
        r = np.clip(r * (gray_mean / mean_r), 0, 255)

        return cv2.merge([b, g, r]).astype(np.uint8)

    def enhance(self, input_image: Image.Image) -> Image.Image:
        """
        Enhances the lighting and contrast of an image adaptively using OpenCV/NumPy.
        Input: PIL Image (RGB)
        Output: Enhanced PIL Image (RGB)
        """
        # Ensure RGB PIL image
        if input_image.mode != 'RGB':
            input_image = input_image.convert('RGB')

        # Convert to BGR array for OpenCV
        rgb_arr = np.array(input_image)
        bgr_arr = cv2.cvtColor(rgb_arr, cv2.COLOR_RGB2BGR)

        # 1. White Balance (Gray-World White Balance to remove color casts)
        bgr_arr = self._apply_white_balance(bgr_arr)

        # Convert to LAB color space
        lab = cv2.cvtColor(bgr_arr, cv2.COLOR_BGR2LAB)
        l_chan, a_chan, b_chan = cv2.split(lab)

        # Analyze image lighting properties
        stats = self._analyze_lighting(l_chan, a_chan, b_chan)
        logger.info(f"Lighting Analysis: {stats}")

        # 2. CLAHE Local Contrast Enhancement (Always applied for crisp details)
        l_chan = self._apply_clahe(l_chan)

        # 3. Adaptive Gamma Correction (Brings lightness near target 135)
        l_chan = self._apply_gamma_correction(l_chan, stats["mean_l"])

        # 4. Shadow Detail Lift (Boost dark shadow areas)
        l_chan = self._apply_shadow_adjustment(l_chan, stats["shadow_mean"])

        # Recombine LAB channels
        enhanced_lab = cv2.merge([l_chan, a_chan, b_chan])

        # Convert back to BGR and then RGB PIL Image
        enhanced_bgr = cv2.cvtColor(enhanced_lab, cv2.COLOR_LAB2BGR)
        enhanced_rgb = cv2.cvtColor(enhanced_bgr, cv2.COLOR_BGR2RGB)

        return Image.fromarray(enhanced_rgb)

# Singleton instance
lighting_enhancer = AdaptiveLightingEnhancer()
