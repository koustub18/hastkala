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

      const aiServiceUrl = process.env.ASR_API_URL || 'http://localhost:8000';
      const formData = new FormData();
      const fileBlob = new Blob([req.file.buffer], { type: req.file.mimetype || 'image/jpeg' });
      formData.append('file', fileBlob, req.file.originalname || 'image.jpg');

      const response = await fetch(`${aiServiceUrl}/api/improve-image`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error('AI Service enhance HTTP error:', response.status, errText);
        return res.status(500).json({ success: false, error: "We couldn't improve this image right now. Please try another image." });
      }

      const data = await response.json();
      return res.status(200).json({
        success: true,
        image_url: data.image_url ? `${aiServiceUrl}${data.image_url}` : null,
        base64Image: data.base64Image || (data.base64_image ? data.base64_image.replace(/^data:image\/png;base64,/, '') : null),
        mimeType: data.mimeType || 'image/png',
        message: data.message || 'Background removed successfully using BRIA RMBG-2.0'
      });

    } catch (error) {
      console.error('AI Enhancement Error:', error);
      res.status(500).json({ success: false, error: "We couldn't improve this image right now. Please try another image." });
    }
  });
});


// Configure multer for audio upload
const uploadAudio = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedMime = [
      'audio/mp4', 'audio/aac', 'audio/x-m4a', 'audio/m4a',
      'audio/webm', 'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg',
      'video/mp4', 'video/webm' // Sometimes mobile recorders use these
    ];
    if (allowedMime.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported MIME type'), false);
    }
  }
}).single('audio_file');

// ── Catalog-specific rate limit: 5 requests per minute per IP ──
const catalogLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many catalog generation requests. Please wait a moment before trying again.' }
});

// ── AI Multilingual Auto-Cataloger ──
router.post('/catalog', catalogLimiter, (req, res) => {
  uploadAudio(req, res, async (err) => {
    if (err) {
      if (err.message === 'Unsupported MIME type') {
        return res.status(400).json({ success: false, error: 'Unsupported audio type.' });
      }
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ success: false, error: 'Audio too large. Maximum 5MB.' });
      }
      return res.status(400).json({ success: false, error: err.message });
    }

    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'Audio file is required.' });
      }

      const prompt = `You are an expert cataloger for an artisan e-commerce marketplace (Hastkala). 
Listen to the audio description of the artisan product (it may be in Hindi, Odia, Bengali, Telugu, Tamil, Kannada, Marathi, Gujarati, Punjabi, English, or mixed/code-switched). 
Extract the details to build a professional product catalog. Do NOT invent or hallucinate information that is not present in the audio (return empty strings or null for missing optional fields).

Create a structured JSON response matching the following schema EXACTLY:
{
  "title": "SEO-friendly product title in English",
  "descriptionEnglish": "Professional, marketplace-ready description in English",
  "descriptionHindi": "Natural, marketplace-ready description translated to Hindi",
  "seoKeywords": ["keyword1", "keyword2"],
  "category": "Main category string (e.g., Clothing, Home Decor, Art) or empty string",
  "material": "Material used (e.g., Cotton, Wood) or empty string",
  "color": "Primary color or empty string",
  "craftType": "Specific craft type (e.g., Ikat, Pattachitra) or empty string",
  "tags": ["tag1", "tag2"]
}

Keep descriptions concise and professional. SEO keywords and tags should be derived from the product and relevant to search, without keyword stuffing (max 10).`;

      const contents = [
        { text: prompt },
        { inlineData: { data: req.file.buffer.toString("base64"), mimeType: req.file.mimetype } }
      ];

      // ── Gemini call with timeout ──
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60000); // 60 second timeout for audio processing

      let response;
      try {
        response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: contents,
          config: {
            responseMimeType: 'application/json',
          }
        });
      } catch (e) {
        clearTimeout(timeout);
        console.error("Gemini API Error:", e);
        return res.status(502).json({ success: false, error: 'AI provider request failed or timed out.' });
      }
      clearTimeout(timeout);

      let rawText = response.text || '';
      rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      
      let result;
      try {
        result = JSON.parse(rawText);
      } catch (e) {
        console.error("Failed to parse Gemini output:", rawText);
        return res.status(500).json({ success: false, error: "Failed to generate valid catalog structure." });
      }

      // ── Validation ──
      const validated = {
        title: typeof result.title === 'string' ? result.title : '',
        descriptionEnglish: typeof result.descriptionEnglish === 'string' ? result.descriptionEnglish : '',
        descriptionHindi: typeof result.descriptionHindi === 'string' ? result.descriptionHindi : '',
        seoKeywords: Array.isArray(result.seoKeywords) ? result.seoKeywords.slice(0, 10).map(String) : [],
        category: typeof result.category === 'string' ? result.category : undefined,
        material: typeof result.material === 'string' ? result.material : undefined,
        color: typeof result.color === 'string' ? result.color : undefined,
        craftType: typeof result.craftType === 'string' ? result.craftType : undefined,
        tags: Array.isArray(result.tags) ? result.tags.slice(0, 10).map(String) : [],
      };

      res.status(200).json({
        success: true,
        catalog: validated
      });

    } catch (error) {
      console.error('Catalog AI Error:', error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  });
});

module.exports = router;
