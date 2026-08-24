import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { getSafeMillis } from '../utils/dateUtils';
import { Enquiry, CreateEnquiryInput } from '../types/enquiry';

export const createEnquiry = async (data: CreateEnquiryInput): Promise<string> => {
  const { productId, productTitle, artisanId, customerName, customerEmail, message } = data;
  
  if (!productId || !artisanId) {
    throw new Error('Product or artisan information is missing.');
  }

  const docRef = await addDoc(collection(db, 'enquiries'), {
    productId,
    productTitle,
    artisanId,
    customerName,
    customerEmail,
    message,
    status: 'new',
    createdAt: serverTimestamp()
  });

  return docRef.id;
};

export const getEnquiriesByArtisan = async (artisanId: string): Promise<Enquiry[]> => {
  if (!artisanId) return [];
  const enquiriesQuery = query(collection(db, 'enquiries'), where("artisanId", "==", artisanId));
  const enquiriesSnapshot = await getDocs(enquiriesQuery);
  const enquiries = enquiriesSnapshot.docs.map(d => ({ id: d.id, _id: d.id, ...d.data() } as Enquiry));
  return enquiries.sort((a, b) => {
    return getSafeMillis(b.createdAt) - getSafeMillis(a.createdAt);
  });
};

export const getEnquiriesByCustomer = async (customerEmail: string): Promise<Enquiry[]> => {
  if (!customerEmail) return [];
  const enquiriesQuery = query(collection(db, 'enquiries'), where("customerEmail", "==", customerEmail));
  const enquiriesSnapshot = await getDocs(enquiriesQuery);
  const enquiries = enquiriesSnapshot.docs.map(d => ({ id: d.id, _id: d.id, ...d.data() } as Enquiry));
  return enquiries.sort((a, b) => {
    return getSafeMillis(b.createdAt) - getSafeMillis(a.createdAt);
  });
};
