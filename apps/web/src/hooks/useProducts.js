import { useState, useEffect } from 'react';
import { getProducts } from '@hastkala/core';

export const useProducts = (maxCount = null, artisanId = null) => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsList = await getProducts({ artisanId, limit: maxCount });
        setProducts(productsList || []);
      } catch (err) {
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [maxCount]);

  return { products, isLoading };
};
