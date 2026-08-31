import { useState, useEffect } from 'react';
import { getProductById } from '@hastkala/core';

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
          setProduct(null);
        }
      } catch (err) {
        setProduct(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  return { product, isLoading };
};
