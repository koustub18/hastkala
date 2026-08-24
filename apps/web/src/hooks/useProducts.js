import { useState, useEffect } from 'react';
import { getProducts } from '@hastkala/core';

export const useProducts = (maxCount = null, artisanId = null) => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsList = await getProducts({ artisanId, limit: maxCount });
        
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
