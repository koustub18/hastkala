import { PricingRequest, PricingResponse } from '../types/pricing';

export const getMarketPricingContext = async (productData: Partial<PricingRequest>): Promise<Record<string, any>> => {
  // TODO: Integrate with real market data APIs or datasets.
  // Currently returning internal DEMO DATA for Hackathon demonstration.
  console.log("Fetching market pricing context for:", productData.category);
  
  // Fake network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  // DEMO DATA based on category
  const mockMarketData: Record<string, { avg: number; demand: string; trend: string }> = {
    'Textiles': { avg: 1200, demand: 'High', trend: 'Upward' },
    'Pottery': { avg: 800, demand: 'Medium', trend: 'Stable' },
    'Decor': { avg: 1500, demand: 'High', trend: 'Upward' },
    'Paintings': { avg: 2500, demand: 'Low', trend: 'Stable' },
    'Metalwork': { avg: 1800, demand: 'Medium', trend: 'Upward' },
    'Jewellery': { avg: 2200, demand: 'High', trend: 'Upward' },
    'Wood Carving': { avg: 1100, demand: 'Medium', trend: 'Stable' },
  };

  const marketInfo = mockMarketData[productData.category as string] || { avg: 1000, demand: 'Medium', trend: 'Stable' };

  return {
    averageMarketPrice: marketInfo.avg,
    demandTrend: marketInfo.demand,
    priceTrend: marketInfo.trend,
    contextProvided: true,
    source: "DEMO DATA"
  };
};

export const generatePricingAnalysis = async (productData: Partial<PricingRequest>, marketContext: Record<string, any>): Promise<PricingResponse | Record<string, any>> => {
  try {
    const response = await fetch('/api/ai/pricing', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: productData.title || (productData as any).name || '',
        category: productData.category || '',
        description: productData.description || '',
        rawMaterialCost: productData.rawMaterialCost || 0,
        laborCost: productData.laborCost || 0,
        additionalCost: productData.additionalCost || 0,
        imageUrl: (productData as any).image || null
      })
    });

    if (!response.ok) {
      throw new Error(`AI Pricing API returned status ${response.status}`);
    }

    const data = await response.json();

    // Validate response before trusting it
    if (
      typeof data.recommendedPrice !== 'number' || isNaN(data.recommendedPrice) ||
      typeof data.priceRangeMin !== 'number' || isNaN(data.priceRangeMin) ||
      typeof data.priceRangeMax !== 'number' || isNaN(data.priceRangeMax)
    ) {
      throw new Error('Invalid pricing response from backend');
    }

    return data;
  } catch (error) {
    console.error('Error generating AI pricing analysis:', error);
    
    // Fallback if backend AI fails
    const baseCost = Number(productData.rawMaterialCost) || 0;
    const laborCost = Number(productData.laborCost) || 0;
    const additionalCost = Number(productData.additionalCost) || 0;
    const totalCost = baseCost + laborCost + additionalCost;
    
    let recommended = 0;
    let suggestedMin = 0;
    let suggestedMax = 0;

    if (totalCost > 0) {
      suggestedMin = Math.round(totalCost * 1.3);
      suggestedMax = Math.round(totalCost * 1.8);
      recommended = Math.round(totalCost * 1.5);
    } else if (marketContext.contextProvided) {
      recommended = marketContext.averageMarketPrice;
      suggestedMin = Math.round(recommended * 0.8);
      suggestedMax = Math.round(recommended * 1.2);
    } else {
      recommended = 500;
      suggestedMin = 400;
      suggestedMax = 600;
    }

    return {
      priceRangeMin: suggestedMin,
      priceRangeMax: suggestedMax,
      recommendedPrice: recommended,
      confidence: "Very Low",
      explanation: "AI pricing service is currently unavailable. Displaying basic cost-plus estimation.",
      factors: ["Fallback Engine"],
      engineStatus: "Pricing Engine — Fallback Mode"
    };
  }
};

export const getPriceSuggestion = async (productData: Partial<PricingRequest>): Promise<Record<string, any>> => {
  const marketContext = await getMarketPricingContext(productData);
  const analysis = await generatePricingAnalysis(productData, marketContext);
  return {
    ...analysis,
    costBasis: (Number(productData.rawMaterialCost) || 0) + (Number(productData.laborCost) || 0) + (Number(productData.additionalCost) || 0),
    marketContext
  };
};
