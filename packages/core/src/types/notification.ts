export type NotificationType = 
  | 'product_created'
  | 'product_updated'
  | 'catalog_success'
  | 'catalog_failed'
  | 'image_enhanced_success'
  | 'image_enhanced_failed'
  | 'pricing_success'
  | 'pricing_failed'
  | 'enquiry_received'
  | 'general';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string | number | Date | any; // allow any for firestore timestamp
  relatedProductId?: string;
  metadata?: Record<string, any>;
}

export interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedProductId?: string;
  metadata?: Record<string, any>;
}
