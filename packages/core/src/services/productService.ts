import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit, serverTimestamp, DocumentData, Query } from 'firebase/firestore';
import { db, auth } from '../utils/firebase';
import { Product } from '../types/product';

export const getProducts = async (filters: { artisanId?: string; limit?: number } = {}): Promise<Product[]> => {
  let q: Query<DocumentData, DocumentData>;
  if (filters.artisanId) {
    q = query(collection(db, 'products'), where("artisanId", "==", filters.artisanId));
  } else if (filters.limit) {
    q = query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(filters.limit));
  } else {
    q = query(collection(db, 'products'));
  }
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
};

export const getProductById = async (id: string): Promise<Product | null> => {
  const docRef = doc(db, 'products', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Product;
  }
  return null;
};

export const createProduct = async (productData: Partial<Product>): Promise<Product> => {
  const data = {
    ...productData,
    artisanId: auth.currentUser?.uid,
    createdAt: serverTimestamp()
  };
  const docRef = await addDoc(collection(db, 'products'), data);
  return { _id: docRef.id, id: docRef.id, ...data } as Product;
};

export const updateProduct = async (id: string, productData: Partial<Product>): Promise<Product> => {
  const docRef = doc(db, 'products', id);
  await updateDoc(docRef, productData);
  return { _id: id, id, ...productData } as Product;
};

export const deleteProduct = async (id: string): Promise<string> => {
  await deleteDoc(doc(db, 'products', id));
  return id;
};

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../utils/firebase';

export const uploadProductImage = async (artisanId: string, fileName: string, fileBlob: Blob | File): Promise<string> => {
  const storageRef = ref(storage, `products/${artisanId}/${Date.now()}_${fileName}`);
  await uploadBytes(storageRef, fileBlob);
  return await getDownloadURL(storageRef);
};
