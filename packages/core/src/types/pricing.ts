export interface PricingRequest {
  title: string;
  category: string;
  material?: string;
  description?: string;
  rawMaterialCost?: number;
  laborCost?: number;
  additionalCost?: number;
}

export interface PricingResponse {
  priceRangeMin: number;
  priceRangeMax: number;
  recommendedPrice: number;
  confidence: 'High' | 'Medium' | 'Low' | string;
  explanation: string;
  factors: string[];
  engineStatus?: string;
}
