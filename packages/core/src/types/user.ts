import { Timestamp } from 'firebase/firestore';

export type UserRole = 'customer' | 'artisan' | 'admin';
export type UserStatus = 'active' | 'pending' | 'rejected';

export interface VerificationDetails {
  aadhaarNumber?: string;
  aadhaarFile?: string;
  panNumber?: string;
  panFile?: string;
  submittedAt?: Timestamp | string | null;
  reviewedAt?: Timestamp | string | null;
  reviewedBy?: string | null;
  status?: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string | null;
}

export interface User {
  uid?: string; // Sometimes document ID is used
  id?: string;
  email?: string;
  name?: string;
  role: UserRole;
  status: UserStatus;
  createdAt?: Timestamp | string | null;
  hasOnboarded?: boolean;

  // Artisan specific fields (stored on user document for now)
  businessName?: string;
  businessDesc?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  upiId?: string;
  phone?: string;
  verification?: VerificationDetails;
}
