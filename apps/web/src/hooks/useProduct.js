import { useState, useEffect } from 'react';
import { getProductById } from '@hastkala/core';
import { products as localProducts } from '../data/products';

export const useProduct = (id) => {
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const fetchProduct = async () => {
      try {
        const fetchedProduct = await getProductById(id);
        
        if (fetchedProduct) {
          setProduct({ ...fetchedProduct, _id: fetchedProduct.id });
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
