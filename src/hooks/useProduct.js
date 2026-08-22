import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { products as localProducts } from '../data/products';

export const useProduct = (id) => {
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, _id: docSnap.id, ...docSnap.data() });
        } else {
          // Fallback to local data
          const found = localProducts.find(
            p => String(p._id) === String(id) || String(p.id) === String(id)
          );
          setProduct(found || null);
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        // Fallback to local data on error
        const found = localProducts.find(
          p => String(p._id) === String(id) || String(p.id) === String(id)
        );
        setProduct(found || null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  return { product, isLoading };
};
