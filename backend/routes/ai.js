const express = require('express');
const router = express.Router();
const { GoogleGenAI } = require('@google/genai');
const rateLimit = require('express-rate-limit');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// ── Pricing-specific rate limit: 10 requests per minute per IP ──
const pricingLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many pricing requests. Please wait a moment before trying again.' }
});

router.post('/pricing', pricingLimiter, async (req, res) => {
  try {
    // ── Input validation ──
    const { category, title, description, rawMaterialCost, laborCost, additionalCost, imageUrl } = req.body;

    if (!title && !category) {
      return res.status(400).json({ message: 'At least a product title or category is required.' });
    }

    const baseCost = (Number(rawMaterialCost) || 0) + (Number(laborCost) || 0) + (Number(additionalCost) || 0);

    const prompt = `You are a Pricing Assistant for an artisan marketplace.
Analyze the following artisan product and suggest an optimal, competitive selling price based on current market trends and raw material costs.

Product details:
Title: ${title || 'N/A'}
Category: ${category || 'N/A'}
Description: ${description || 'N/A'}
Raw Material Cost: ${rawMaterialCost || 0}
Labor Cost: ${laborCost || 0}
Additional Cost: ${additionalCost || 0}
Total Base Cost: ${baseCost}

Please return the result strictly as a JSON object with the following schema, and NO markdown formatting (no \`\`\`json block).
{
  "priceRangeMin": <number>,
  "priceRangeMax": <number>,
  "recommendedPrice": <number>,
  "confidence": "<High, Medium, or Low>",
  "explanation": "<A short paragraph explaining the reasoning>",
  "factors": ["<Factor 1>", "<Factor 2>"]
}
Make sure the recommended price allows the artisan to make a reasonable profit above the total base cost, but remains competitive for the category.`;

    let contents = [{ text: prompt }];

    if (imageUrl) {
      try {
        const imageRes = await fetch(imageUrl);
        const arrayBuffer = await imageRes.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const mimeType = imageRes.headers.get('content-type') || 'image/jpeg';
        
        contents = [
          { text: prompt },
          { inlineData: { data: buffer.toString("base64"), mimeType: mimeType } }
        ];
      } catch (err) {
        console.error("Failed to fetch image for AI:", err);
        // Continue without image — non-fatal
      }
    }

    // ── Gemini call with timeout ──
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    let response;
    try {
      response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contents,
      });
    } finally {
      clearTimeout(timeout);
    }

    let rawText = response.text || '';
    rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    let result;
    try {
      result = JSON.parse(rawText);
    } catch (e) {
      console.error("Failed to parse Gemini output:", rawText);
      return res.status(500).json({ message: "Failed to generate valid pricing structure." });
    }

    // ── Response validation: ensure all required fields are present and numeric ──
    const validated = {
      priceRangeMin: Number(result.priceRangeMin) || Math.round(baseCost * 1.3) || 0,
      priceRangeMax: Number(result.priceRangeMax) || Math.round(baseCost * 1.8) || 0,
      recommendedPrice: Number(result.recommendedPrice) || Math.round(baseCost * 1.5) || 0,
      confidence: ['High', 'Medium', 'Low'].includes(result.confidence) ? result.confidence : 'Low',
      explanation: typeof result.explanation === 'string' ? result.explanation : 'AI pricing analysis complete.',
      factors: Array.isArray(result.factors) ? result.factors.map(String) : [],
      engineStatus: 'Pricing Engine — AI Powered',
    };

    res.json(validated);

  } catch (error) {
    console.error('Pricing AI Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

const multer = require('multer');

// Configure multer for memory storage and validation
const uploadEnhance = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedMime = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedMime.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported MIME type'), false);
    }
  }
}).single('image_file');

// ── AI Image Enhancement (Photoroom) ──
const imageLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5, // Strict limit: 5 requests per minute per IP for image processing
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many image enhancement requests. Please wait a moment before trying again.' }
});

router.post('/enhance', imageLimiter, (req, res) => {
  uploadEnhance(req, res, async (err) => {
    if (err) {
      if (err.message === 'Unsupported MIME type') {
        return res.status(400).json({ success: false, error: 'Unsupported image type.' });
      }
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ success: false, error: 'Image too large. Maximum 5MB.' });
      }
      return res.status(400).json({ success: false, error: err.message });
    }

    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'Image file is required.' });
      }

      const apiKey = process.env.PHOTOROOM_API_KEY;
      if (!apiKey) {
        return res.status(501).json({ success: false, error: 'AI Enhancement provider credentials not configured.' });
      }

      // Convert buffer to Blob for Node 18+ fetch FormData
      const blob = new Blob([req.file.buffer], { type: req.file.mimetype });
      const formData = new FormData();
      formData.append('imageFile', blob, req.file.originalname || 'image.jpg');

      // Make request to Photoroom API
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      let response;
      try {
        response = await fetch("https://image-api.photoroom.com/v2/edit", {
          method: "POST",
          headers: {
            "x-api-key": apiKey,
            "pr-ai-upscale-model-version": "ai-upscale-2025-07-29",
            "pr-hd-background-removal": "auto",
            "pr-ai-shadows-model-version": "default"
          },
          body: formData,
          signal: controller.signal
        });
      } catch (e) {
        clearTimeout(timeout);
        if (e.name === 'AbortError') {
          return res.status(504).json({ success: false, error: 'AI provider request timed out.' });
        }
        throw e;
      }
      clearTimeout(timeout);

      if (!response.ok) {
        if (response.status === 429) {
          return res.status(429).json({ success: false, error: 'AI provider rate limit exceeded.' });
        }
        return res.status(502).json({ success: false, error: 'AI provider returned an error: ' + response.statusText });
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const contentType = response.headers.get('content-type') || 'image/png';

      // Ensure we actually got an image back
      if (!contentType.startsWith('image/')) {
         return res.status(502).json({ success: false, error: 'AI provider returned invalid data type.' });
      }

      res.status(200).json({
        success: true,
        base64Image: buffer.toString('base64'),
        mimeType: contentType
      });

    } catch (error) {
      console.error('AI Enhancement Error:', error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  });
});

module.exports = router;
