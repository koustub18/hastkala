export interface ImageEnhancementRequest {
  originalUri: string;
  mimeType?: string;
  fileName?: string;
}

export interface ImageEnhancementResult {
  success: boolean;
  enhancedUri?: string;
  error?: string;
  provider?: string;
}

export interface ProcessedImage {
  originalUri: string;
  compressedUri: string | null;
  enhancedUri: string | null;
  mimeType: string;
  fileName: string;
  sizeBytes?: number;
}
