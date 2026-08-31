import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, storage } from '@hastkala/core';
import { getArtisanProfile } from '@hastkala/core';
import { getProducts, createProduct, updateProduct, deleteProduct as serviceDeleteProduct } from '@hastkala/core';
import { deleteObject } from 'firebase/storage';
import { getEnquiriesByArtisan } from '@hastkala/core';

const CATEGORIES = ['Textiles', 'Pottery', 'Decor', 'Paintings', 'Metalwork', 'Jewellery', 'Wood Carving'];

const useArtisanDashboard = () => {
  const [artisan, setArtisan] = useState(null);
  const [products, setProducts] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editProductId, setEditProductId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [newProduct, setNewProduct] = useState({
    title: '', category: CATEGORIES[0],
    material: '', description: '', 
    rawMaterialCost: '', laborCost: '', additionalCost: '',
    price: '', aiSuggestedPrice: null, priceRangeMin: null, priceRangeMax: null, aiPricingConfidence: '', aiPricingExplanation: '', aiPricingFactors: [], pricingUpdatedAt: null,
    image: '', image2: ''
  });

  const [showIPShield, setShowIPShield] = useState(false);
  const [imageUploading, setImageUploading] = useState({ image: false, image2: false });
  const [userUid, setUserUid] = useState(null);

  // Removing useNavigate from hook
  const [authStatus, setAuthStatus] = useState('loading');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserUid(user.uid);
        try {
          const profile = await getArtisanProfile(user.uid);
          if (profile) setArtisan(profile);

          const productsList = await getProducts({ artisanId: user.uid });
          setProducts(productsList);

          const enquiriesList = await getEnquiriesByArtisan(user.uid);
          setEnquiries(enquiriesList);
          
          setAuthStatus('authenticated');
        } catch (err) {
          console.error('Failed to fetch dashboard data', err);
          setAuthStatus('error');
        } finally {
          setIsLoading(false);
        }
      } else {
        setAuthStatus('unauthenticated');
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // ── Image validation constants ──
  const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  const MAX_IMAGE_SIZE_MB = 5;
  const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
  const COMPRESS_TARGET_WIDTH = 1200;
  const COMPRESS_QUALITY = 0.8;

  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      // Skip compression for small files (< 500KB)
      if (file.size < 500 * 1024) {
        resolve(file);
        return;
      }

      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Scale down if wider than target
          if (width > COMPRESS_TARGET_WIDTH) {
            height = Math.round((height * COMPRESS_TARGET_WIDTH) / width);
            width = COMPRESS_TARGET_WIDTH;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                console.log(`Image compressed: ${(file.size / 1024).toFixed(0)}KB → ${(compressedFile.size / 1024).toFixed(0)}KB`);
                resolve(compressedFile);
              } else {
                resolve(file); // Fallback to original
              }
            },
            'image/jpeg',
            COMPRESS_QUALITY
          );
        };
        img.onerror = () => resolve(file); // Fallback to original
        img.src = e.target.result;
      };
      reader.onerror = () => resolve(file); // Fallback to original
      reader.readAsDataURL(file);
    });
  };

  const uploadImage = async (file, field) => {
    console.log(`uploadImage called for field ${field} with file:`, file);

    // ── Validate file type ──
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error(`Unsupported format. Please use JPEG, PNG, or WebP.`);
      return;
    }

    // ── Validate file size ──
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      toast.error(`Image too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum is ${MAX_IMAGE_SIZE_MB}MB.`);
      return;
    }

    setImageUploading(prev => ({ ...prev, [field]: true }));
    try {
      if (!userUid) {
        console.error("userUid is missing!");
        throw new Error("Not authenticated");
      }

      // ── Compress before upload ──
      const optimizedFile = await compressImage(file);

      const storageRef = ref(storage, `products/${userUid}/${Date.now()}_${file.name}`);
      console.log("Uploading bytes to storageRef:", storageRef.fullPath);
      await uploadBytes(storageRef, optimizedFile);
      console.log("Bytes uploaded, getting download URL...");
      const url = await getDownloadURL(storageRef);
      console.log("Got download URL:", url);
      setNewProduct(p => ({ ...p, [field]: url }));
      toast.success('Image uploaded successfully');
    } catch (err) {
      console.error('Upload failed with error:', err);
      toast.error('Could not upload image. Please try again.');
    } finally {
      setImageUploading(prev => ({ ...prev, [field]: false }));
    }
  };



  const handleAddProduct = async (e) => {
    if (e) e.preventDefault();
    if (!userUid || !artisan) return;
    setIsSubmitting(true);
    try {
        const productData = {
          ...newProduct,
          artisanId: userUid,
          artisanName: artisan.name,
        };

        if (isEditing) {
          await updateProduct(editProductId, productData);
          setProducts(prev => prev.map(p => p._id === editProductId ? { _id: editProductId, ...productData } : p));
        } else {
          const docRef = await createProduct(productData);
          setProducts(prev => [...prev, { _id: docRef._id, ...productData }]);
        }
      
      setSubmitSuccess(true);
      toast.success(isEditing ? 'Product updated successfully' : 'Product added successfully');
      
      setTimeout(() => {
        setShowModal(false);
        setSubmitSuccess(false);
        setIsEditing(false);
        setEditProductId(null);
        setNewProduct({
          title: '', category: CATEGORIES[0],
          material: '', image: '', image2: ''
        });
      }, 1500);
    } catch (err) {
      console.error('Product operation failed:', err);
      toast.error('Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteProduct = async (id) => {
    try {
      const product = products.find(p => p._id === id);
      await serviceDeleteProduct(id);
      setProducts(prev => prev.filter(p => p._id !== id));
      toast.success('Product deleted');
      
      // Client-side best-effort image cleanup
      if (product) {
        if (product.image) {
          try {
            await deleteObject(ref(storage, product.image));
          } catch (e) {
            console.warn('Failed to delete image 1:', e);
          }
        }
        if (product.image2) {
          try {
            await deleteObject(ref(storage, product.image2));
          } catch (e) {
            console.warn('Failed to delete image 2:', e);
          }
        }
      }
    } catch (err) {
      console.error('Failed to delete product', err);
      toast.error('Failed to delete product');
    }
  };

  const openAddProductModal = () => {
    setIsEditing(false);
    setEditProductId(null);
    setNewProduct({
      title: '', category: CATEGORIES[0],
      material: '', description: '', 
      rawMaterialCost: '', laborCost: '', additionalCost: '',
      price: '', aiSuggestedPrice: null, priceRangeMin: null, priceRangeMax: null, aiPricingConfidence: '', aiPricingExplanation: '', aiPricingFactors: [], pricingUpdatedAt: null,
      image: '', image2: ''
    });
    setShowModal(true);
  };

  const startEditProduct = (prod) => {
    if (!prod || !prod._id) {
      openAddProductModal();
      return;
    }
    setIsEditing(true);
    setEditProductId(prod._id);
    setNewProduct({
      title: prod.title || '',
      category: prod.category || CATEGORIES[0],
      material: prod.material || '',
      description: prod.description || '',
      rawMaterialCost: prod.rawMaterialCost || '',
      laborCost: prod.laborCost || '',
      additionalCost: prod.additionalCost || '',
      price: prod.price || '',
      aiSuggestedPrice: prod.aiSuggestedPrice || null,
      priceRangeMin: prod.priceRangeMin || null,
      priceRangeMax: prod.priceRangeMax || null,
      aiPricingConfidence: prod.aiPricingConfidence || '',
      aiPricingExplanation: prod.aiPricingExplanation || '',
      aiPricingFactors: prod.aiPricingFactors || [],
      pricingUpdatedAt: prod.pricingUpdatedAt || null,
      image: prod.image || '',
      image2: prod.image2 || ''
    });
    setShowModal(true);
  };

  return {
    artisan,
    products,
    isLoading,
    showModal,
    setShowModal,
    isEditing,
    setIsEditing,
    editProductId,
    isSubmitting,
    submitSuccess,
    newProduct,
    setNewProduct,
    imageUploading,
    uploadImage,
    handleAddProduct,
    deleteProduct,
    startEditProduct,
    openAddProductModal,
    CATEGORIES,
    enquiries
  };
};

export default useArtisanDashboard;
