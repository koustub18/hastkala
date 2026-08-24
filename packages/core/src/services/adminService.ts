import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../utils/firebase';
import { getSafeMillis } from '../utils/dateUtils';
import { User } from '../types/user';
import { Product } from '../types/product';
import { Enquiry } from '../types/enquiry';

export const getPendingArtisans = async (): Promise<User[]> => {
  const q = query(collection(db, 'users'), where('role', '==', 'artisan'));
  const querySnapshot = await getDocs(q);
  
  const fetchedArtisans: User[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data() as User;
    if (data.status === 'pending') {
      fetchedArtisans.push({ id: doc.id, ...data });
    }
  });
  
  fetchedArtisans.sort((a, b) => {
    const dateA = getSafeMillis(a.verification?.submittedAt) || 0;
    const dateB = getSafeMillis(b.verification?.submittedAt) || 0;
    return dateB - dateA;
  });

  return fetchedArtisans;
};

export const approveArtisan = async (uid: string): Promise<void> => {
  const artisanRef = doc(db, 'users', uid);
  await updateDoc(artisanRef, {
    status: 'active',
    'verification.status': 'approved',
    'verification.approvedAt': serverTimestamp(),
    'verification.reviewedBy': auth.currentUser?.uid || null
  });
};

export const rejectArtisan = async (uid: string, reason: string): Promise<void> => {
  const artisanRef = doc(db, 'users', uid);
  await updateDoc(artisanRef, {
    status: 'rejected',
    'verification.status': 'rejected',
    'verification.rejectedAt': serverTimestamp(),
    'verification.rejectionReason': reason,
    'verification.reviewedBy': auth.currentUser?.uid || null
  });
};

export const getAllUsers = async (): Promise<User[]> => {
  const querySnapshot = await getDocs(collection(db, 'users'));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
};

export const getAllProducts = async (): Promise<Product[]> => {
  const querySnapshot = await getDocs(collection(db, 'products'));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
};

export const getAllEnquiries = async (): Promise<Enquiry[]> => {
  const querySnapshot = await getDocs(collection(db, 'enquiries'));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Enquiry));
};

export const getActiveArtisans = async (): Promise<User[]> => {
  const q = query(collection(db, 'users'), where('role', '==', 'artisan'));
  const querySnapshot = await getDocs(q);
  const fetchedArtisans: User[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data() as User;
    if (data.status === 'active' || data.status === 'rejected') {
      fetchedArtisans.push({ id: doc.id, ...data });
    }
  });
  return fetchedArtisans;
};
