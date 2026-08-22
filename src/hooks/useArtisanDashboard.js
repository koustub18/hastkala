import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { doc, getDoc, collection, query, where, getDocs, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth, storage } from '../utils/firebase';

const CATEGORIES = ['Textiles', 'Pottery', 'Decor', 'Paintings', 'Metalwork', 'Jewellery', 'Wood Carving'];

const useArtisanDashboard = () => {
  const [artisan, setArtisan] = useState(null);
  const [products, setProducts] = useState([]);
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

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserUid(user.uid);
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setArtisan(userDoc.data());
          }

          const q = query(collection(db, 'products'), where("artisanId", "==", user.uid));
          const querySnapshot = await getDocs(q);
          const productsList = querySnapshot.docs.map(d => ({ _id: d.id, ...d.data() }));
          setProducts(productsList);
        } catch (err) {
          console.error('Failed to fetch dashboard data', err);
        } finally {
          setIsLoading(false);
        }
      } else {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const uploadImage = async (file, field) => {
    console.log(`uploadImage called for field ${field} with file:`, file);
    setImageUploading(prev => ({ ...prev, [field]: true }));
    try {
      if (!userUid) {
        console.error("userUid is missing!");
        throw new Error("Not authenticated");
      }
      const storageRef = ref(storage, `products/${userUid}/${Date.now()}_${file.name}`);
      console.log("Uploading bytes to storageRef:", storageRef.fullPath);
      await uploadBytes(storageRef, file);
      console.log("Bytes uploaded, getting download URL...");
      const url = await getDownloadURL(storageRef);
      console.log("Got download URL:", url);
      setNewProduct(p => ({ ...p, [field]: url }));
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
        createdAt: new Date().toISOString()
      };

      if (isEditing) {
        await updateDoc(doc(db, 'products', editProductId), productData);
        setProducts(prev => prev.map(p => p._id === editProductId ? { _id: editProductId, ...productData } : p));
      } else {
        const docRef = await addDoc(collection(db, 'products'), productData);
        setProducts(prev => [...prev, { _id: docRef.id, ...productData }]);
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
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await deleteDoc(doc(db, 'products', id));
      setProducts(prev => prev.filter(p => p._id !== id));
      toast.success('Product deleted');
    } catch (err) {
      console.error('Failed to delete product', err);
      toast.error('Failed to delete product');
    }
  };

  const startEditProduct = (prod) => {
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
    CATEGORIES
  };
};

export default useArtisanDashboard;
