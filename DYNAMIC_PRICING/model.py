"""
Multimodal Dynamic Pricing Model for Indian Handicrafts.

FIXES applied:
  - [Task 3] Frozen ResNet50 BatchNorm layers forced into eval() via train() override.
  - [Task 4] Frozen BERT forced into eval() via train() override (dropout disabled).
  - [Task 6] Aspect-ratio-preserving Resize(256)+CenterCrop(224) instead of distorting Resize((224,224)).
  - [Task 7] Conservative training augmentation (mild H-flip + ColorJitter only).
  - [Task 8] Masked mean pooling over valid BERT tokens instead of [CLS] alone.
  - Robust device selection fallback to CPU if CUDA capability (sm_120) is unsupported.
"""

import os
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

import torch
import torch.nn as nn
from torchvision import models, transforms
from torchvision.models import ResNet50_Weights
from transformers import AutoModel, AutoTokenizer
from PIL import Image
import numpy as np


def get_default_device() -> torch.device:
    """Safe device detection that tests CUDA kernel availability."""
    if torch.cuda.is_available():
        try:
            _t = (torch.zeros(1, device="cuda") + 1).cpu()
            return torch.device("cuda")
        except Exception:
            return torch.device("cpu")
    return torch.device("cpu")


# ---------------------------------------------------------------------------
# Image Preprocessing
# ---------------------------------------------------------------------------

def get_train_transforms(image_size: int = 224) -> transforms.Compose:
    """Conservative training augmentation for handicraft images."""
    return transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(image_size),
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.ColorJitter(brightness=0.15, contrast=0.15, saturation=0.10, hue=0.03),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])


def get_inference_transforms(image_size: int = 224) -> transforms.Compose:
    """Deterministic eval/inference transform. No augmentation."""
    return transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(image_size),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])


# ---------------------------------------------------------------------------
# Model
# ---------------------------------------------------------------------------

class MultimodalPricePredictor(nn.Module):
    """
    Multimodal Neural Network for Handicraft Price Prediction.

    Architecture:
      ResNet50 (frozen) -> Image Projection
      BERT (frozen, shared) -> Name / Description / Market projections (Masked Mean Pooling)
      Concatenate -> Fusion MLP -> log1p(price) regression
    """

    def __init__(
        self,
        bert_model_name: str = "bert-base-uncased",
        freeze_backbones: bool = True,
        img_proj_dim: int = 256,
        name_proj_dim: int = 128,
        desc_proj_dim: int = 256,
        market_proj_dim: int = 128,
        hidden_dim: int = 256,
        dropout_p: float = 0.2
    ):
        super().__init__()
        self.bert_model_name = bert_model_name
        self.freeze_backbones = freeze_backbones

        # 1. Image Backbone
        resnet = models.resnet50(weights=ResNet50_Weights.DEFAULT)
        self.image_backbone = nn.Sequential(*list(resnet.children())[:-1])  # -> (B,2048,1,1)

        # 2. Text Backbone (shared BERT)
        self.text_backbone = AutoModel.from_pretrained(bert_model_name)

        # 3. Freeze backbones
        if freeze_backbones:
            for p in self.image_backbone.parameters():
                p.requires_grad = False
            for p in self.text_backbone.parameters():
                p.requires_grad = False

        # 4. Projection Heads (trainable)
        self.image_proj = nn.Sequential(
            nn.Linear(2048, img_proj_dim), nn.BatchNorm1d(img_proj_dim), nn.ReLU(), nn.Dropout(dropout_p)
        )
        self.name_proj = nn.Sequential(
            nn.Linear(768, name_proj_dim), nn.LayerNorm(name_proj_dim), nn.ReLU(), nn.Dropout(dropout_p)
        )
        self.desc_proj = nn.Sequential(
            nn.Linear(768, desc_proj_dim), nn.LayerNorm(desc_proj_dim), nn.ReLU(), nn.Dropout(dropout_p)
        )
        self.market_proj = nn.Sequential(
            nn.Linear(768, market_proj_dim), nn.LayerNorm(market_proj_dim), nn.ReLU(), nn.Dropout(dropout_p)
        )

        # 5. Fusion Regression Head (trainable)
        fusion_dim = img_proj_dim + name_proj_dim + desc_proj_dim + market_proj_dim  # 768
        self.fusion_head = nn.Sequential(
            nn.Linear(fusion_dim, hidden_dim), nn.ReLU(), nn.Dropout(dropout_p + 0.1),
            nn.Linear(hidden_dim, 64), nn.ReLU(), nn.Dropout(dropout_p),
            nn.Linear(64, 1)
        )

    def train(self, mode: bool = True):
        """
        Override train() to keep frozen backbones in eval mode.

        TASK 3 FIX: Frozen ResNet50 BatchNorm layers stay in eval() ->
          running_mean/running_var are NOT updated during training.
        TASK 4 FIX: Frozen BERT stays in eval() ->
          dropout is disabled, embeddings are deterministic.
        """
        super().train(mode)
        if mode and self.freeze_backbones:
            self.image_backbone.eval()
            self.text_backbone.eval()
        return self

    def extract_text_features(self, input_ids: torch.Tensor, attention_mask: torch.Tensor) -> torch.Tensor:
        """
        Masked mean pooling over valid BERT tokens (Task 8 fix).
        Averages last_hidden_state over all non-padding positions.
        Returns shape (B, 768).
        """
        outputs = self.text_backbone(input_ids=input_ids, attention_mask=attention_mask)
        token_embs = outputs.last_hidden_state  # (B, seq, 768)
        mask_exp = attention_mask.unsqueeze(-1).float()  # (B, seq, 1)
        sum_embs = (token_embs * mask_exp).sum(dim=1)     # (B, 768)
        sum_mask = mask_exp.sum(dim=1).clamp(min=1e-9)    # (B, 1)
        return sum_embs / sum_mask                         # (B, 768)

    def forward(
        self,
        images: torch.Tensor,
        name_input_ids: torch.Tensor,
        name_attention_mask: torch.Tensor,
        desc_input_ids: torch.Tensor,
        desc_attention_mask: torch.Tensor,
        market_input_ids: torch.Tensor,
        market_attention_mask: torch.Tensor,
    ) -> torch.Tensor:
        """Forward pass. Returns predicted log1p(price) tensor of shape (B,)."""
        # Image
        img_f = torch.flatten(self.image_backbone(images), 1)  # (B, 2048)
        img_p = self.image_proj(img_f)                         # (B, img_proj_dim)

        # Text (masked mean pooling)
        name_p   = self.name_proj(self.extract_text_features(name_input_ids, name_attention_mask))
        desc_p   = self.desc_proj(self.extract_text_features(desc_input_ids, desc_attention_mask))
        market_p = self.market_proj(self.extract_text_features(market_input_ids, market_attention_mask))

        # Fusion
        fused = torch.cat([img_p, name_p, desc_p, market_p], dim=1)
        return self.fusion_head(fused).squeeze(-1)  # (B,)


# ---------------------------------------------------------------------------
# Checkpoint I/O
# ---------------------------------------------------------------------------

def load_trained_model(checkpoint_path: str, device: torch.device = None):
    """Load trained model + tokenizer from checkpoint. Returns (model, tokenizer, config)."""
    if device is None:
        device = get_default_device()
    if not os.path.exists(checkpoint_path):
        raise FileNotFoundError(f"Checkpoint not found: {checkpoint_path}")

    ckpt = torch.load(checkpoint_path, map_location=device, weights_only=False)
    cfg = ckpt.get("config", {})

    model = MultimodalPricePredictor(
        bert_model_name=cfg.get("bert_model_name", "bert-base-uncased"),
        freeze_backbones=True,
        img_proj_dim=cfg.get("img_proj_dim", 256),
        name_proj_dim=cfg.get("name_proj_dim", 128),
        desc_proj_dim=cfg.get("desc_proj_dim", 256),
        market_proj_dim=cfg.get("market_proj_dim", 128),
        hidden_dim=cfg.get("hidden_dim", 256),
    )
    model.load_state_dict(ckpt["model_state_dict"])
    model.to(device)
    model.eval()

    tokenizer = AutoTokenizer.from_pretrained(cfg.get("bert_model_name", "bert-base-uncased"))
    return model, tokenizer, cfg


# ---------------------------------------------------------------------------
# Production Inference API (Task 19)
# ---------------------------------------------------------------------------

def predict_price(
    image_path: str,
    product_name: str,
    description: str,
    market_info: str,
    checkpoint_path: str = "models/best_dynamic_pricing_model.pth",
    device: torch.device = None,
) -> float:
    """
    Production price prediction for a single handicraft product.

    Inputs:
        image_path   - path to product image (str)
        product_name - product title / name (str)
        description  - full description containing raw material info (str)
        market_info  - market metadata (region, demand, craft type) (str)
        checkpoint_path - path to saved model weights
        device       - target torch device (auto-detected if None)

    Returns:
        Predicted price in INR (float, >= 0.0).

    NOTE: Price is the training target and is strictly NOT an input.
          Raw material information is embedded inside `description`.
    """
    # 1. Input validation
    if not image_path or not isinstance(image_path, str):
        raise ValueError("Invalid image_path: must be a non-empty string path.")
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Product image not found at: {image_path}")
    if product_name is None or str(product_name).strip() == "":
        raise ValueError("product_name cannot be empty.")
    if description is None or str(description).strip() == "":
        raise ValueError("description cannot be empty.")
    if market_info is None or str(market_info).strip() == "":
        raise ValueError("market_info cannot be empty.")

    if device is None:
        device = get_default_device()

    # 2. Load model & tokenizer
    model, tokenizer, cfg = load_trained_model(checkpoint_path, device=device)

    # 3. Image preprocessing (aspect-ratio-preserving, deterministic)
    try:
        img = Image.open(image_path).convert("RGB")
    except Exception as e:
        raise ValueError(f"Failed to load image file {image_path}: {e}")

    img_tensor = get_inference_transforms(cfg.get("image_size", 224))(img).unsqueeze(0).to(device)

    # 4. Tokenize text
    max_name   = cfg.get("max_name_len", 32)
    max_desc   = cfg.get("max_desc_len", 256)
    max_market = cfg.get("max_market_len", 64)

    def tok(text, max_len):
        return tokenizer(str(text), max_length=max_len, padding="max_length",
                         truncation=True, return_tensors="pt")

    n_enc = tok(product_name, max_name)
    d_enc = tok(description, max_desc)
    m_enc = tok(market_info, max_market)

    # 5. Model forward pass
    with torch.no_grad():
        log_pred = model(
            images=img_tensor,
            name_input_ids=n_enc["input_ids"].to(device),
            name_attention_mask=n_enc["attention_mask"].to(device),
            desc_input_ids=d_enc["input_ids"].to(device),
            desc_attention_mask=d_enc["attention_mask"].to(device),
            market_input_ids=m_enc["input_ids"].to(device),
            market_attention_mask=m_enc["attention_mask"].to(device),
        )

    raw_val = log_pred.item()
    if np.isnan(raw_val) or np.isinf(raw_val):
        raise ValueError(f"Model generated an invalid numeric prediction: {raw_val}")

    price = float(np.expm1(raw_val))
    price = max(0.0, price)   # Clamp non-negative
    return round(price, 2)

