const { GoogleGenAI } = require('@google/genai');
const Product = require('../models/Product');

const getPriceAdvice = async ({ category, material = '', workHours = 0, complexity = 'medium', imageUrl = '' }) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured in backend environment.');
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const claimedHours = Math.max(0, Number(workHours) || 0);

  // ── 1. Market calibration from DB (UNGAMEABLE — this is real data) ─────
  const dbProducts = await Product.find({ category }).select('price');
  const prices = dbProducts.map(p => p.price).sort((a, b) => a - b);
  const pct = (arr, p) => {
    if (!arr.length) return null;
    const idx = (p / 100) * (arr.length - 1);
    const lo = Math.floor(idx), hi = Math.ceil(idx);
    return Math.round(arr[lo] + (arr[hi] - arr[lo]) * (idx - lo));
  };
  const marketMedian = prices.length ? pct(prices, 50) : null;
  const marketP25    = prices.length ? pct(prices, 25) : null;
  const marketP75    = prices.length ? pct(prices, 75) : null;
  const marketP90    = prices.length ? pct(prices, 90) : null;
  const marketP10    = prices.length ? pct(prices, 10) : null;

  // ── 2. Build Vision-Verified Prompt ────────────────────────────────────
  const systemInstruction = `
You are an expert pricing analyst AND visual product assessor for Hastkala, an Indian artisan e-commerce platform.

## YOUR CRITICAL ROLE:
You must INDEPENDENTLY assess the product quality from the image (if provided) and cross-verify the artisan's self-reported claims. Artisans may exaggerate to get higher prices — your job is to be fair to BOTH the artisan AND the buyer.

## ARTISAN'S SELF-REPORTED CLAIMS (may be inflated):
- Category: ${category}
- Claimed Material: ${material || 'Not specified'}
- Claimed Work Hours: ${claimedHours > 0 ? claimedHours : 'Not specified'}
- Claimed Complexity: ${complexity}

## REAL MARKET DATA FROM OUR DATABASE (CANNOT BE GAMED):
- Market P10 (budget): ₹${marketP10 || 'N/A'}
- Market P25 (value): ₹${marketP25 || 'N/A'}
- Market Median: ₹${marketMedian || 'N/A'}
- Market P75 (premium): ₹${marketP75 || 'N/A'}  
- Market P90 (luxury): ₹${marketP90 || 'N/A'}
- Total products in category: ${prices.length}

## YOUR ASSESSMENT RULES:

### Step 1: Visual Assessment (if image provided)
Independently determine from the image:
- visualComplexity: "low" | "medium" | "high" | "expert" — based on detail, patterns, craftsmanship visible
- visualMaterialGuess: what material does it LOOK like?
- estimatedRealHours: your best estimate of actual hours based on the craft type and visible work

### Step 2: Cross-Validation & Trust Score
Compare artisan's claims vs your visual assessment:
- If claimed complexity matches visual → trustScore += 30
- If claimed hours are within ±50% of your estimate → trustScore += 30  
- If claimed material seems plausible from image → trustScore += 20
- Base trust: 20 (everyone starts with some trust)
- trustScore is 0-100

### Step 3: Market-Anchored Pricing
- The recommended price MUST be anchored to market data (70% weight)
- Artisan claims only influence within market bounds (30% weight)
- HARD CAP: recommended price can NEVER exceed Market P90 (₹${marketP90 || 'N/A'})
- HARD FLOOR: recommended price can NEVER go below Market P10 (₹${marketP10 || 'N/A'})
- Fair hourly wage baseline: ₹100-150/hour (NOT more)
- If trustScore < 50, price stays near Market Median
- If trustScore >= 80, price can go up to Market P75

### Step 4: Anomaly Detection
Set anomaly flags if:
- Claimed hours seem > 2x your visual estimate → flag "hours_inflated"
- Claimed complexity > visual complexity by 2+ levels → flag "complexity_inflated"
- Claimed premium material but image looks standard → flag "material_mismatch"
- No flags if everything checks out

Output strictly in the specified JSON schema.
`;

  const contentParts = [];
  contentParts.push({ text: 'Analyze this product, cross-verify the artisan claims, and generate fair pricing JSON.' });

  if (imageUrl && imageUrl.startsWith('http')) {
    contentParts.push({
      fileData: { fileUri: imageUrl, mimeType: 'image/jpeg' }
    });
  }

  let response;
  try {
    response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contentParts,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            recommended:    { type: "INTEGER", description: "Market-anchored recommended price in INR" },
            rangeLow:       { type: "INTEGER", description: "Lower sweet-spot boundary in INR" },
            rangeHigh:      { type: "INTEGER", description: "Upper sweet-spot boundary in INR" },
            min:            { type: "INTEGER", description: "Absolute minimum acceptable price in INR" },
            max:            { type: "INTEGER", description: "Absolute maximum price in INR (capped at market P90)" },
            trustScore:     { type: "INTEGER", description: "0-100 trust score based on claim verification" },
            breakdown: {
              type: "OBJECT",
              properties: {
                materialCost:   { type: "INTEGER", description: "Estimated material cost" },
                laborCost:      { type: "INTEGER", description: "Estimated labor cost based on verified hours" }
              },
              required: ["materialCost", "laborCost"]
            },
            verification: {
              type: "OBJECT",
              properties: {
                visualComplexity:   { type: "STRING", description: "AI-assessed complexity from image: low/medium/high/expert" },
                estimatedRealHours: { type: "INTEGER", description: "AI estimate of actual work hours" },
                visualMaterial:     { type: "STRING", description: "AI guess of material from image" },
                anomalies:          { type: "ARRAY", items: { type: "STRING" }, description: "List of anomaly flags: hours_inflated, complexity_inflated, material_mismatch, or empty" }
              },
              required: ["visualComplexity", "estimatedRealHours", "visualMaterial", "anomalies"]
            }
          },
          required: ["recommended", "rangeLow", "rangeHigh", "min", "max", "trustScore", "breakdown", "verification"]
        }
      }
    });
  } catch (aiErr) {
    console.warn('[AI Price v2] Vision call failed, falling back to text-only:', aiErr.message);
    response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Analyze the product based on text description only and generate fair pricing JSON. Since no image is available, set trustScore lower (max 60) and keep pricing conservative near market median.',
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            recommended:    { type: "INTEGER" },
            rangeLow:       { type: "INTEGER" },
            rangeHigh:      { type: "INTEGER" },
            min:            { type: "INTEGER" },
            max:            { type: "INTEGER" },
            trustScore:     { type: "INTEGER" },
            breakdown: {
              type: "OBJECT",
              properties: {
                materialCost:   { type: "INTEGER" },
                laborCost:      { type: "INTEGER" }
              },
              required: ["materialCost", "laborCost"]
            },
            verification: {
              type: "OBJECT",
              properties: {
                visualComplexity:   { type: "STRING" },
                estimatedRealHours: { type: "INTEGER" },
                visualMaterial:     { type: "STRING" },
                anomalies:          { type: "ARRAY", items: { type: "STRING" } }
              },
              required: ["visualComplexity", "estimatedRealHours", "visualMaterial", "anomalies"]
            }
          },
          required: ["recommended", "rangeLow", "rangeHigh", "min", "max", "trustScore", "breakdown", "verification"]
        }
      }
    });
  }

  const aiResult = JSON.parse(response.text);

  let recommended = aiResult.recommended;
  if (marketP90 && recommended > marketP90 * 1.1) {
    recommended = marketP90; 
  }
  if (marketP10 && recommended < marketP10 * 0.9) {
    recommended = marketP10; 
  }

  const trustScore = Math.min(100, Math.max(0, aiResult.trustScore || 50));
  if (trustScore < 50 && marketMedian) {
    recommended = Math.round((marketMedian * (100 - trustScore) + recommended * trustScore) / 100);
  }

  const snap = (v) => Math.round(v / 50) * 50;

  return {
    category,
    sampleSize: prices.length,
    recommended: snap(recommended),
    rangeLow:    snap(aiResult.rangeLow),
    rangeHigh:   snap(Math.min(aiResult.rangeHigh, marketP90 || aiResult.rangeHigh)),
    min:         snap(aiResult.min),
    max:         snap(Math.min(aiResult.max, marketP90 ? marketP90 * 1.1 : aiResult.max)),
    trustScore,
    breakdown: {
      ...aiResult.breakdown,
      hoursUsed:        aiResult.verification?.estimatedRealHours || claimedHours || 12,
      claimedHours:     claimedHours,
      complexity:       complexity,
      verifiedComplexity: aiResult.verification?.visualComplexity || complexity,
      skillPremium:     trustScore >= 70 ? 1.5 : trustScore >= 50 ? 1.2 : 1.0,
      marketSampleSize: prices.length,
    },
    verification: {
      trustScore,
      visualComplexity:   aiResult.verification?.visualComplexity || 'unknown',
      estimatedRealHours: aiResult.verification?.estimatedRealHours || 0,
      visualMaterial:     aiResult.verification?.visualMaterial || 'unknown',
      claimedComplexity:  complexity,
      claimedHours:       claimedHours,
      claimedMaterial:    material,
      anomalies:          aiResult.verification?.anomalies || [],
      imageAnalyzed:      !!(imageUrl && imageUrl.startsWith('http')),
    },
    isFallback: false,
  };
};

module.exports = {
  getPriceAdvice
};
