import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import { db } from '../utils/firebase';

export const useProducts = (maxCount = null, artisanId = null) => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
        
        if (artisanId) {
            q = query(collection(db, 'products'), where('artisanId', '==', artisanId), orderBy('createdAt', 'desc'));
        }
        
        if (maxCount) {
            // Need to recreate query to chain limit properly based on previous query state
            if (artisanId) {
                q = query(collection(db, 'products'), where('artisanId', '==', artisanId), orderBy('createdAt', 'desc'), limit(maxCount));
            } else {
                q = query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(maxCount));
            }
        }
        
        const querySnapshot = await getDocs(q);
        const productsList = [];
        querySnapshot.forEach((doc) => {
          productsList.push({ id: doc.id, ...doc.data() });
        });
        
        if (productsList.length === 0) {
          const { products: localProducts } = await import('../data/products');
          let local = [...localProducts];
          if (artisanId) {
            local = local.filter(p => String(p.artisanId) === String(artisanId));
          }
          if (maxCount) {
            local = local.slice(0, maxCount);
          }
          setProducts(local);
        } else {
          setProducts(productsList);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        const { products: localProducts } = await import('../data/products');
        let local = [...localProducts];
        if (artisanId) {
          local = local.filter(p => String(p.artisanId) === String(artisanId));
        }
        if (maxCount) {
          local = local.slice(0, maxCount);
        }
        setProducts(local);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [maxCount]);

  return { products, isLoading };
};
