import { Timestamp } from 'firebase/firestore';

export interface Enquiry {
  id?: string;
  _id?: string;
  productId: string;
  productTitle?: string;
  artisanId: string;
  customerName: string;
  customerEmail: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'archived' | string;
  createdAt?: Timestamp | string | null;
}

export interface CreateEnquiryInput {
  productId: string;
  productTitle?: string;
  artisanId: string;
  customerName: string;
  customerEmail: string;
  message: string;
}
