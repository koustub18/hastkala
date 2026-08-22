const express = require('express');
const router = express.Router();
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

router.post('/pricing', async (req, res) => {
  try {
    const { category, title, description, rawMaterialCost, laborCost, additionalCost, imageUrl } = req.body;

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
      }
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
    });

    let rawText = response.text || '';
    rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    let result;
    try {
      result = JSON.parse(rawText);
    } catch (e) {
      console.error("Failed to parse Gemini output:", rawText);
      return res.status(500).json({ message: "Failed to generate valid pricing structure." });
    }

    res.json({
      ...result,
      engineStatus: "Pricing Engine — AI Powered",
    });

  } catch (error) {
    console.error('Pricing AI Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
