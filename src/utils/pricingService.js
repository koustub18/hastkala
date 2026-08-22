export const getMarketPricingContext = async (productData) => {
  // TODO: Integrate with real market data APIs or datasets.
  // Currently returning internal DEMO DATA for Hackathon demonstration.
  console.log("Fetching market pricing context for:", productData.category);
  
  // Fake network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  // DEMO DATA based on category
  const mockMarketData = {
    'Textiles': { avg: 1200, demand: 'High', trend: 'Upward' },
    'Pottery': { avg: 800, demand: 'Medium', trend: 'Stable' },
    'Decor': { avg: 1500, demand: 'High', trend: 'Upward' },
    'Paintings': { avg: 2500, demand: 'Low', trend: 'Stable' },
    'Metalwork': { avg: 1800, demand: 'Medium', trend: 'Upward' },
    'Jewellery': { avg: 2200, demand: 'High', trend: 'Upward' },
    'Wood Carving': { avg: 1100, demand: 'Medium', trend: 'Stable' },
  };

  const marketInfo = mockMarketData[productData.category] || { avg: 1000, demand: 'Medium', trend: 'Stable' };

  return {
    averageMarketPrice: marketInfo.avg,
    demandTrend: marketInfo.demand,
    priceTrend: marketInfo.trend,
    contextProvided: true,
    source: "DEMO DATA"
  };
};

export const generatePricingAnalysis = async (productData, marketContext) => {
  // TODO: Integrate actual AI provider (e.g., Vertex AI, OpenAI) here.
  // The backend/cloud function should handle the secure API calls.
  // For now, this is a RULE-BASED FALLBACK Engine.
  
  return new Promise((resolve) => {
    setTimeout(() => {
      const baseCost = Number(productData.rawMaterialCost) || 0;
      const laborCost = Number(productData.laborCost) || 0;
      const additionalCost = Number(productData.additionalCost) || 0;
      const totalCost = baseCost + laborCost + additionalCost;
      
      let recommended = 0;
      let suggestedMin = 0;
      let suggestedMax = 0;
      let confidence = "Medium";
      let factors = ["Raw Material Cost", "Labor Cost", "Category Markup"];

      // Basic fallback heuristic
      if (totalCost > 0) {
        suggestedMin = Math.round(totalCost * 1.3);
        suggestedMax = Math.round(totalCost * 1.8);
        recommended = Math.round(totalCost * 1.5);
      } else if (marketContext.contextProvided) {
        // Fallback to market average if no costs provided
        recommended = marketContext.averageMarketPrice;
        suggestedMin = Math.round(recommended * 0.8);
        suggestedMax = Math.round(recommended * 1.2);
        factors = ["Market Average", "Demand Trend"];
        confidence = "Low";
      } else {
        recommended = 500;
        suggestedMin = 400;
        suggestedMax = 600;
        factors = ["Default Pricing"];
        confidence = "Very Low";
      }

      // Adjust based on market context
      if (marketContext.demandTrend === 'High') {
        recommended = Math.round(recommended * 1.1);
        suggestedMax = Math.round(suggestedMax * 1.1);
        factors.push("High Market Demand");
      }

      resolve({
        priceRangeMin: suggestedMin,
        priceRangeMax: suggestedMax,
        recommendedPrice: recommended,
        confidence: confidence,
        explanation: "This is a basic cost-plus estimation because the AI ML model is not yet connected. It considers your base costs and current market trends.",
        factors: factors,
        engineStatus: "Pricing Engine — Demo/Fallback"
      });
    }, 1500);
  });
};

export const getPriceSuggestion = async (productData) => {
  const marketContext = await getMarketPricingContext(productData);
  const analysis = await generatePricingAnalysis(productData, marketContext);
  return {
    ...analysis,
    costBasis: (Number(productData.rawMaterialCost) || 0) + (Number(productData.laborCost) || 0) + (Number(productData.additionalCost) || 0),
    marketContext
  };
};
