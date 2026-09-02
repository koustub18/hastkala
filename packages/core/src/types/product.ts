import { Timestamp } from 'firebase/firestore';

export interface Product {
  id?: string;
  _id?: string;
  artisanId: string;
  artisanName?: string;
  title: string;
  description?: string;
  
  // Multilingual Auto-Cataloger fields
  descriptionEnglish?: string;
  descriptionHindi?: string;
  seoKeywords?: string[];
  color?: string;
  craftType?: string;
  tags?: string[];
  
  material?: string;
  category?: string;
  price?: string | number;
  image?: string;
  image2?: string;
  
  // Origin & Regional Provenance
  originState?: string;
  region?: string;
  state?: string;

  // Inventory & Stock
  stockQuantity?: number;
  
  // Cost breakdown
  rawMaterialCost?: string | number;
  laborCost?: string | number;
  additionalCost?: string | number;
  
  // AI Pricing fields
  aiSuggestedPrice?: number | null;
  priceRangeMin?: number | null;
  priceRangeMax?: number | null;
  aiPricingConfidence?: string;
  aiPricingExplanation?: string;
  aiPricingFactors?: string[];
  pricingUpdatedAt?: Timestamp | string | null;
  
  createdAt?: Timestamp | string | null;
}

export interface GeneratedCatalog {
  title?: string;
  descriptionEnglish?: string;
  descriptionHindi?: string;
  seoKeywords?: string[];
  category?: string;
  material?: string;
  color?: string;
  craftType?: string;
  tags?: string[];
}

export interface CatalogGenerationRequest {
  // If sending as JSON instead of multipart/form-data
  audioBase64?: string;
  mimeType?: string;
  // For context, we might pass an artisan ID or similar in the future
  artisanId?: string;
}

export interface CatalogGenerationResponse {
  success: boolean;
  catalog?: GeneratedCatalog;
  error?: string;
}
