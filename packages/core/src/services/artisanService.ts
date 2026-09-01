import { doc, getDoc, updateDoc, serverTimestamp, increment } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { User } from '../types/user';

export const getArtisanProfile = async (uid: string): Promise<User | null> => {
  const docRef = doc(db, 'users', uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { uid, ...docSnap.data() } as User;
  }
  return null;
};

export const incrementArtisanImpressions = async (uid: string): Promise<void> => {
  if (!uid) return;
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      'metrics.profileViews': increment(1)
    });
  } catch (err) {
    console.warn('Failed to increment artisan profile impressions:', err);
  }
};

export const submitOnboarding = async (uid: string, data: Record<string, any>): Promise<void> => {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    status: 'pending',
    businessName: data.businessName,
    businessDesc: data.businessDesc,
    address: data.address,
    city: data.city,
    state: data.state,
    pincode: data.pincode,
    upiId: data.upiId,
    phone: data.phone,
    verification: {
      aadhaarNumber: data.aadhaarNumber,
      aadhaarFile: data.aadhaarFileUrl, // Assumes uploaded file URL
      panNumber: data.panNumber,
      panFile: data.panFileUrl, // Assumes uploaded file URL
      submittedAt: serverTimestamp(),
      status: 'pending'
    }
  });
};
