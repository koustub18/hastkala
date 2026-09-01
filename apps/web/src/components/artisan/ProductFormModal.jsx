import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IndianRupee, Sparkles, CheckCircle2, ChevronRight, X, Loader2, Upload, ImageIcon, Mic, Wand2, Calculator, Info, Camera, RefreshCw, Sun, MapPin, Layers, Package } from 'lucide-react';
import { getPriceSuggestion, createNotification } from '@hastkala/core';
import { useAuth } from '../../contexts/AuthContext';

const ProductFormModal = ({
  showModal,
  setShowModal,
  isEditing,
  submitSuccess,
  handleAddProduct,
  newProduct,
  setNewProduct,
  CATEGORIES,
  imageUploading,
  uploadImage,
  isSubmitting
}) => {
  const { user } = useAuth();
  const [isListening, setIsListening] = useState(false);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const [audioError, setAudioError] = useState('');
  const [transcriptionText, setTranscriptionText] = useState('');
  const [englishTranslationText, setEnglishTranslationText] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('auto');
  const [detectedLanguageName, setDetectedLanguageName] = useState('');
  const [voiceSuccess, setVoiceSuccess] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  
  // Multi-Stage Image Enhancement States
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isDeblurring, setIsDeblurring] = useState(false);
  const [isLightingEnhancing, setIsLightingEnhancing] = useState(false);
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  const [deblurredImage, setDeblurredImage] = useState(null);
  const [lightingImage, setLightingImage] = useState(null);
  const [enhancedImage, setEnhancedImage] = useState(null);
  const [originalImage, setOriginalImage] = useState(null);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [enhanceError, setEnhanceError] = useState('');

  // Live Camera States & Refs
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraFacingMode, setCameraFacingMode] = useState('environment'); // 'environment' (rear) or 'user' (front)
  const videoRef = useRef(null);
  const cameraStreamRef = useRef(null);

  const [isPricing, setIsPricing] = useState(false);
  const [pricingError, setPricingError] = useState('');

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        if (mediaRecorderRef.current.stream) {
          mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
        try { mediaRecorderRef.current.stop(); } catch (e) {}
      }
    };
  }, []);

  const startRecording = async () => {
    if (isListening || isProcessingAudio) return;
    setAudioError('');
    setTranscriptionText('');
    setVoiceSuccess(false);
    setRecordingTime(0);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Microphone is not available.');
      }

      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (err) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          throw new Error('Microphone permission is needed.');
        }
        throw new Error('Microphone is not available.');
      }
      
      const mimeTypes = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus', 'audio/mp3'];
      let selectedMimeType = '';
      for (const type of mimeTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          selectedMimeType = type;
          break;
        }
      }
      
      const options = selectedMimeType ? { mimeType: selectedMimeType } : {};
      const mediaRecorder = new MediaRecorder(stream, options);
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {

        stream.getTracks().forEach(track => track.stop());
        if (timerRef.current) clearInterval(timerRef.current);
        
        if (chunksRef.current.length === 0) {
            setAudioError('No voice was captured. Please try again.');
            setIsListening(false);
            return;
        }

        const audioType = selectedMimeType || 'audio/webm';
        const audioBlob = new Blob(chunksRef.current, { type: audioType });
        
        chunksRef.current = [];
        mediaRecorderRef.current = null;
        
        if (audioBlob.size === 0) {
            setAudioError('No voice was captured. Please try again.');
            setIsListening(false);
            return;
        }
        
        setIsListening(false);
        await processAudio(audioBlob);
      };

      mediaRecorder.start(200); // capture chunks every 200ms
      setIsListening(true);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 59) {
            stopRecording();
            return 60;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setAudioError(err.message || 'Microphone is not available.');
      setIsListening(false);
    }
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === 'inactive') {
      setIsListening(false);
      return;
    }
    
    try {
      recorder.requestData();
    } catch (e) {
      console.warn('requestData failed:', e);
    }
    recorder.stop();
  };

  const extractProductFieldsFromSpeech = (transcription, availableCategories = []) => {
    if (!transcription || !transcription.trim()) return {};
    const lower = transcription.toLowerCase();

    // 1. Material Extraction
    let material = '';
    const materialsMap = [
      { keys: ['sambalpuri', 'ikkat', 'ikat', 'handloom', 'cotton', 'ସୂତା', 'ସମ୍ବଲପୁରୀ', 'सूती', 'सूती वस्त्र'], val: 'Natural Handloom Cotton' },
      { keys: ['silk', 'tussar', 'tassar', 'ପାଟ', 'ସିଲ୍କ', 'रेशम', 'सिल्क', 'पाट'], val: 'Pure Tassar Silk' },
      { keys: ['terracotta', 'clay', 'earthen', 'ମାଟି', 'मिट्टी', 'टेराकोटा'], val: 'Terracotta Clay' },
      { keys: ['brass', 'dokra', 'dhokra', 'ପିତ୍ତଳ', 'पीतल', 'डोकरा'], val: 'Handcast Brass (Dokra)' },
      { keys: ['wood', 'timber', 'bamboo', 'କାଠ', 'लकड़ी', 'बांस'], val: 'Natural Hardwood & Bamboo' },
      { keys: ['jute', 'झूट'], val: 'Natural Jute Fiber' },
      { keys: ['canvas', 'paper', 'ପଟ୍ଟଚିତ୍ର', 'चित्र'], val: 'Handmade Canvas & Natural Colors' }
    ];

    for (const m of materialsMap) {
      if (m.keys.some(k => lower.includes(k))) {
        material = m.val;
        break;
      }
    }

    // 2. Category Extraction
    let category = (availableCategories && availableCategories[0]) || 'Textiles';
    const categoryMap = [
      { keys: ['saree', 'shati', 'शाड़ी', 'ଶାଢ଼ୀ', 'stole', 'dupatta', 'handloom', 'fabric', 'cloth', 'shawl', 'towel', 'gamucha', 'kurta', 'dress', 'weaved'], val: 'Textiles' },
      { keys: ['pottery', 'clay', 'terracotta', 'pot', 'diya', 'matka', 'ମାଟି', 'घड़ा', 'दीया'], val: 'Pottery' },
      { keys: ['painting', 'pattachitra', 'madhubani', 'art', 'wall art', 'चित्र', 'ଚିତ୍ର', 'canvas'], val: 'Paintings' },
      { keys: ['jewelry', 'jewel', 'bangle', 'necklace', 'ring', 'gehna', 'ମାଳି', 'गहने'], val: 'Jewelry' },
      { keys: ['wood', 'wooden', 'carving', 'toy', 'doll', 'ମୂର୍ତ୍ତି', 'खिलौना'], val: 'Woodwork' },
      { keys: ['brass', 'dokra', 'metal', 'bell', 'statue', 'धोकरा', 'metalware'], val: 'Metalware' }
    ];

    for (const c of categoryMap) {
      if (c.keys.some(k => lower.includes(k))) {
        if (availableCategories && availableCategories.includes(c.val)) {
          category = c.val;
        }
        break;
      }
    }

    // 3. Title Extraction
    let title = '';
    if (lower.includes('sambalpuri') || lower.includes('ସମ୍ବଲପୁରୀ')) {
      title = 'Handwoven Sambalpuri Handloom Saree';
    } else if (lower.includes('pattachitra') || lower.includes('ପଟ୍ଟଚିତ୍ର')) {
      title = 'Traditional Hand-Painted Pattachitra Artwork';
    } else if (lower.includes('madhubani') || lower.includes('मधुबनी')) {
      title = 'Hand-Painted Madhubani Folk Art';
    } else if (lower.includes('terracotta') || lower.includes('ମାଟି')) {
      title = 'Handcrafted Terracotta Decorative Craft';
    } else if (lower.includes('dokra') || lower.includes('dhokra') || lower.includes('ପିତ୍ତଳ')) {
      title = 'Authentic Tribal Dokra Brass Artifact';
    } else {
      const cleaned = transcription.trim().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '');
      const words = cleaned.split(/\s+/).slice(0, 6).join(' ');
      title = words ? words.charAt(0).toUpperCase() + words.slice(1) : 'Handcrafted Artisan Product';
    }

    // 4. Description Generation (E-Commerce Formatted Fallback)
    const description = `Discover this authentic handcrafted ${category.toLowerCase()} creation, masterfully crafted with ${material.toLowerCase() || 'natural materials'}. Each piece reflects Indian heritage and tradition, perfect for home decor, gifting, or festive celebrations.`;

    return { title, category, material, description };
  };

  const applyExtractedFields = (textToExtract) => {
    const targetText = textToExtract || transcriptionText;
    if (!targetText) return;
    const extracted = extractProductFieldsFromSpeech(targetText, CATEGORIES);
    setNewProduct(prev => ({
      ...prev,
      title: extracted.title || prev.title || '',
      category: extracted.category || prev.category || (CATEGORIES && CATEGORIES[0]),
      material: extracted.material || prev.material || '',
      description: extracted.description || prev.description || ''
    }));

    if (user?.uid) {
      createNotification({
        userId: user.uid,
        type: 'catalog_success',
        title: 'Form Auto-Filled',
        message: 'Product Title, Category, Material, and Description have been populated from your voice recording!'
      });
    }
  };

  const processAudio = async (audioBlob) => {
    setIsProcessingAudio(true);
    setAudioError('');
    setVoiceSuccess(false);
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('language', selectedLanguage);

      const asrBaseUrl = import.meta.env.VITE_ASR_API_URL || import.meta.env.NEXT_PUBLIC_ASR_API_URL || 'http://localhost:8000';
      
      const response = await fetch(`${asrBaseUrl}/transcribe`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('ASR API returned status ' + response.status);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to transcribe audio');
      }

      const transcribed = data.text || '';
      const englishText = data.english_text || transcribed;
      setTranscriptionText(transcribed);
      setEnglishTranslationText(englishText);
      setDetectedLanguageName(data.language_name || data.language || 'Auto Detected');
      
      // Extract fields from either extracted_fields object or top-level properties
      const fields = data.extracted_fields || data;
      const aiTitle = fields.title;
      const aiCategory = fields.category;
      const aiMaterial = fields.material;
      const aiDescription = fields.description;

      if (aiTitle || aiDescription || aiMaterial) {
        setNewProduct(prev => ({
          ...prev,
          title: aiTitle || prev.title || '',
          category: (CATEGORIES && CATEGORIES.includes(aiCategory)) ? aiCategory : (prev.category || (CATEGORIES && CATEGORIES[0])),
          material: aiMaterial || prev.material || '',
          description: aiDescription || prev.description || ''
        }));
      } else {
        applyExtractedFields(englishText);
      }
      
      setVoiceSuccess(true);
      setTimeout(() => setVoiceSuccess(false), 5000);
      
      if (user?.uid) {
        createNotification({
          userId: user.uid,
          type: 'catalog_success',
          title: 'Speech Transcribed',
          message: `Voice recording transcribed and translated into English (${data.language_name || 'Multi-lingual'}).`
        });
      }
    } catch (err) {
      console.error('Error processing audio:', err);
      setAudioError('Unable to transcribe the recording. Please try again.');
      if (user?.uid) {
        createNotification({
          userId: user.uid,
          type: 'catalog_failed',
          title: 'Transcription Failed',
          message: 'Something went wrong while transcribing your voice. Please try again.'
        });
      }
    } finally {
      setIsProcessingAudio(false);
    }
  };

  const handleVoiceCataloging = () => {
    if (isListening) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const getImageBlob = async (targetSrc) => {
    if (selectedImageFile && !targetSrc) return selectedImageFile;
    const srcToUse = targetSrc || originalImage || newProduct.image;
    if (!srcToUse) return null;

    if (srcToUse.startsWith('data:')) {
      const arr = srcToUse.split(',');
      const mime = arr[0].match(/:(.*?);/)[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while(n--){
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new File([u8arr], "product.png", { type: mime });
    } else {
      const res = await fetch(srcToUse);
      return await res.blob();
    }
  };

  const handleDeblurImage = async () => {
    if (!selectedImageFile && !newProduct.image && !originalImage) return;
    setIsDeblurring(true);
    setEnhanceError('');
    
    if (!originalImage) {
      setOriginalImage(selectedImageFile ? URL.createObjectURL(selectedImageFile) : newProduct.image);
    }
    
    try {
      const blob = await getImageBlob(deblurredImage || originalImage);
      if (!blob) throw new Error("Could not read image data");

      const formData = new FormData();
      formData.append('file', blob, 'image.png');
      formData.append('image_file', blob, 'image.png');

      const asrBaseUrl = import.meta.env.VITE_ASR_API_URL || import.meta.env.NEXT_PUBLIC_ASR_API_URL || 'http://localhost:8000';
      
      let response;
      try {
        response = await fetch(`${asrBaseUrl}/api/deblur`, {
          method: 'POST',
          body: formData,
        });
      } catch (e) {
        response = await fetch('/api/ai/deblur', {
          method: 'POST',
          body: formData,
        });
      }

      if (!response.ok) throw new Error('Failed to deblur image');

      const data = await response.json();
      if (data.success) {
        const deblurredSrc = data.base64_image || (data.base64Image ? `data:${data.mimeType || 'image/png'};base64,${data.base64Image}` : (data.image_url ? (data.image_url.startsWith('http') ? data.image_url : `${asrBaseUrl}${data.image_url}`) : null));
        if (!deblurredSrc) throw new Error("Deblur failed to produce image output");

        setDeblurredImage(deblurredSrc);
        if (user?.uid) {
          createNotification({
            userId: user.uid,
            type: 'image_deblurred_success',
            title: 'Image Deblurred',
            message: 'Image sharpened successfully using NAFNet ONNX model!'
          });
        }
      } else {
        throw new Error(data.error || "Deblur failed on server");
      }
    } catch (err) {
      console.error('Debblur error:', err);
      setEnhanceError("Could not deblur this image. Please try another photo.");
    } finally {
      setIsDeblurring(false);
    }
  };

  // Camera stream controls
  const openCamera = async (overrideFacingMode = null) => {
    const mode = overrideFacingMode || cameraFacingMode;
    setIsCameraOpen(true);
    setEnhanceError('');
    try {
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach(t => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      cameraStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Camera access error:', err);
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true });
        cameraStreamRef.current = fallbackStream;
        if (videoRef.current) videoRef.current.srcObject = fallbackStream;
      } catch (e) {
        setEnhanceError('Unable to access camera on this device. Please check permissions.');
        setIsCameraOpen(false);
      }
    }
  };

  const toggleCameraFacingMode = () => {
    const newMode = cameraFacingMode === 'environment' ? 'user' : 'environment';
    setCameraFacingMode(newMode);
    openCamera(newMode);
  };

  const closeCamera = () => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach(t => t.stop());
      cameraStreamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const captureCameraPhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'artisan_photo.jpg', { type: 'image/jpeg' });
        setSelectedImageFile(file);
        const objectUrl = URL.createObjectURL(blob);
        setOriginalImage(objectUrl);
        setDeblurredImage(null);
        setLightingImage(null);
        setEnhancedImage(null);
        closeCamera();
      }
    }, 'image/jpeg', 0.95);
  };

  const handleLightingEnhanceImage = async (overrideSrc = null) => {
    const inputSrc = overrideSrc || deblurredImage || originalImage || newProduct.image;
    if (!inputSrc && !selectedImageFile) return;
    
    setIsLightingEnhancing(true);
    setEnhanceError('');
    
    if (!originalImage) {
      setOriginalImage(selectedImageFile ? URL.createObjectURL(selectedImageFile) : newProduct.image);
    }
    
    try {
      const blob = await getImageBlob(inputSrc);
      if (!blob) throw new Error("Could not read image data");

      const formData = new FormData();
      formData.append('file', blob, 'image.png');
      formData.append('image_file', blob, 'image.png');

      const asrBaseUrl = import.meta.env.VITE_ASR_API_URL || import.meta.env.NEXT_PUBLIC_ASR_API_URL || 'http://localhost:8000';
      
      let response;
      try {
        response = await fetch(`${asrBaseUrl}/api/enhance-lighting`, {
          method: 'POST',
          body: formData,
        });
      } catch (e) {
        response = await fetch('/api/ai/enhance-lighting', {
          method: 'POST',
          body: formData,
        });
      }

      if (!response.ok) throw new Error('Failed to enhance lighting');

      const data = await response.json();
      if (data.success) {
        const lightingSrc = data.base64_image || (data.base64Image ? `data:${data.mimeType || 'image/png'};base64,${data.base64Image}` : (data.image_url ? (data.image_url.startsWith('http') ? data.image_url : `${asrBaseUrl}${data.image_url}`) : null));
        if (!lightingSrc) throw new Error("Lighting enhancement failed to produce output");

        setLightingImage(lightingSrc);
        if (user?.uid) {
          createNotification({
            userId: user.uid,
            type: 'lighting_enhanced_success',
            title: 'Lighting Enhanced',
            message: 'Image lighting and contrast enhanced using OpenCV LAB Adaptive Engine!'
          });
        }
      } else {
        throw new Error(data.error || "Lighting enhancement failed on server");
      }
    } catch (err) {
      console.error('Lighting enhance error:', err);
      setEnhanceError("Could not enhance lighting right now. Please try another photo.");
    } finally {
      setIsLightingEnhancing(false);
    }
  };

  const handleRemoveBgImage = async (overrideImageSrc = null) => {
    const inputSrc = overrideImageSrc || lightingImage || deblurredImage || originalImage || newProduct.image;
    if (!inputSrc && !selectedImageFile) return;
    
    setIsRemovingBg(true);
    setEnhanceError('');
    
    if (!originalImage) {
      setOriginalImage(selectedImageFile ? URL.createObjectURL(selectedImageFile) : newProduct.image);
    }
    
    try {
      const blob = await getImageBlob(inputSrc);
      if (!blob) throw new Error("Could not read image data");

      const formData = new FormData();
      formData.append('file', blob, 'image.png');
      formData.append('image_file', blob, 'image.png');

      const asrBaseUrl = import.meta.env.VITE_ASR_API_URL || import.meta.env.NEXT_PUBLIC_ASR_API_URL || 'http://localhost:8000';
      
      let response;
      try {
        response = await fetch(`${asrBaseUrl}/api/remove-bg`, {
          method: 'POST',
          body: formData,
        });
      } catch (e) {
        response = await fetch('/api/ai/remove-bg', {
          method: 'POST',
          body: formData,
        });
      }

      if (!response.ok) throw new Error('Failed to remove background');

      const data = await response.json();
      if (data.success) {
        const bgRemovedSrc = data.base64_image || (data.base64Image ? `data:${data.mimeType || 'image/png'};base64,${data.base64Image}` : (data.image_url ? (data.image_url.startsWith('http') ? data.image_url : `${asrBaseUrl}${data.image_url}`) : null));
        if (!bgRemovedSrc) throw new Error("Background removal failed to produce image output");

        setEnhancedImage(bgRemovedSrc);
        if (user?.uid) {
          createNotification({
            userId: user.uid,
            type: 'image_enhanced_success',
            title: 'Background Removed',
            message: 'Background removed with crisp white background overlay!'
          });
        }
      } else {
        throw new Error(data.error || "Background removal failed on server");
      }
    } catch (err) {
      console.error('Remove BG error:', err);
      setEnhanceError("We couldn't remove the background right now. Please try another image.");
    } finally {
      setIsRemovingBg(false);
    }
  };

  const handleEnhanceImage = async () => {
    if (!selectedImageFile && !newProduct.image && !originalImage) return;
    setIsEnhancing(true);
    setEnhanceError('');
    
    if (!originalImage) {
      setOriginalImage(selectedImageFile ? URL.createObjectURL(selectedImageFile) : newProduct.image);
    }
    
    try {
      const blob = await getImageBlob(originalImage);
      if (!blob) throw new Error("Could not read image data");

      const formData = new FormData();
      formData.append('file', blob, 'image.png');
      formData.append('image_file', blob, 'image.png');

      const asrBaseUrl = import.meta.env.VITE_ASR_API_URL || import.meta.env.NEXT_PUBLIC_ASR_API_URL || 'http://localhost:8000';
      
      let response;
      try {
        response = await fetch(`${asrBaseUrl}/api/improve-image`, {
          method: 'POST',
          body: formData,
        });
      } catch (e) {
        response = await fetch('/api/ai/enhance', {
          method: 'POST',
          body: formData,
        });
      }

      if (!response.ok) throw new Error('Failed to enhance image');

      const data = await response.json();
      if (data.success) {
        const enhancedSrc = data.base64_image || (data.base64Image ? `data:${data.mimeType || 'image/png'};base64,${data.base64Image}` : (data.image_url ? (data.image_url.startsWith('http') ? data.image_url : `${asrBaseUrl}${data.image_url}`) : null));
        
        if (!enhancedSrc) throw new Error("Enhancement failed to produce image output");

        setEnhancedImage(enhancedSrc);
        if (user?.uid) {
          createNotification({
            userId: user.uid,
            type: 'image_enhanced_success',
            title: 'Image Enhanced',
            message: 'Image deblurred & background removed with white background!'
          });
        }
      } else {
        throw new Error(data.error || "Enhancement failed on server");
      }
    } catch (err) {
      console.error('Enhancement error:', err);
      setEnhanceError("We couldn't improve this image right now. Please try another image.");
      if (user?.uid) {
        createNotification({
          userId: user.uid,
          type: 'image_enhanced_failed',
          title: 'Enhancement Failed',
          message: 'Could not improve photo. You can continue using your original photo.'
        });
      }
    } finally {
      setIsEnhancing(false);
    }
  };


  const handleSuggestPrice = async () => {
    setIsPricing(true);
    setPricingError('');
    try {
      const result = await getPriceSuggestion(newProduct);
      setNewProduct(p => ({
        ...p,
        aiSuggestedPrice: result.recommendedPrice,
        priceRangeMin: result.priceRangeMin,
        priceRangeMax: result.priceRangeMax,
        aiPricingConfidence: result.confidence,
        aiPricingExplanation: result.explanation,
        aiPricingFactors: result.factors || [],
        pricingUpdatedAt: new Date().toISOString()
      }));
      
      if (user?.uid) {
        createNotification({
          userId: user.uid,
          type: 'pricing_success',
          title: 'Price Suggestion Ready',
          message: 'AI has analyzed market trends and suggested a price for your product.'
        });
      }
    } catch (err) {
      console.error(err);
      setPricingError('Failed to get pricing suggestion. Please enter manually.');
      if (user?.uid) {
        createNotification({
          userId: user.uid,
          type: 'pricing_failed',
          title: 'Price Suggestion Failed',
          message: 'Failed to generate price suggestion. You can enter the price manually.'
        });
      }
    } finally {
      setIsPricing(false);
    }
  };

  if (!showModal) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-earth-900/70 backdrop-blur-sm px-4"
        onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
      >
        <motion.div
          initial={{ scale: 0.9, y: 30 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 30 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between p-6 border-b border-earth-200">
            <h2 className="text-2xl font-serif font-bold text-earth-900">
              {isEditing ? 'Edit Product Details' : 'Add to Catalog'}
            </h2>
            <button onClick={() => setShowModal(false)} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-earth-100 text-earth-500 transition-colors">
              <X size={20} />
            </button>
          </div>

          {submitSuccess ? (
            <div className="flex flex-col items-center justify-center py-20">
              <CheckCircle2 size={56} className="text-green-500 mb-4" />
              <h3 className="text-2xl font-serif font-bold text-earth-900">
                {isEditing ? 'Product Updated!' : 'Added to Catalog!'}
              </h3>
              <p className="text-earth-500 mt-2">
                {isEditing ? 'Your changes have been saved.' : 'Your product is now in your Virtual Manager.'}
              </p>
            </div>
          ) : (
            <form onSubmit={handleAddProduct} className="p-6 space-y-5">
              {/* IndicConformer Multilingual Voice Recording Feature */}
              <div className="bg-terracotta-50/50 border border-terracotta-200 rounded-xl p-4 flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-earth-900 flex items-center gap-1.5">
                      <Mic size={16} className="text-terracotta-500" /> Multilingual Voice Recording
                    </h4>
                    <p className="text-xs text-earth-500 mt-0.5">
                      {isListening ? (
                        <span className="text-red-600 font-semibold flex items-center gap-1">
                          🔴 Recording {String(Math.floor(recordingTime / 60)).padStart(2, '0')}:{String(recordingTime % 60).padStart(2, '0')}
                        </span>
                      ) : isProcessingAudio ? (
                        <span className="text-terracotta-600 font-medium">⏳ Transcribing...</span>
                      ) : (
                        'Speak in any Indian language to transcribe.'
                      )}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      disabled={isListening || isProcessingAudio}
                      className="px-2.5 py-1.5 bg-white border border-terracotta-200 rounded-lg text-xs font-semibold text-earth-800 focus:outline-none focus:border-terracotta-500 shadow-sm"
                    >
                      <option value="auto">🌐 Auto Detect</option>
                      <option value="or">🇮🇳 Odia (ଓଡ଼ିଆ)</option>
                      <option value="hi">🇮🇳 Hindi (हिंदी)</option>
                      <option value="bn">🇮🇳 Bengali (বাংলা)</option>
                      <option value="ta">🇮🇳 Tamil (தமிழ்)</option>
                      <option value="te">🇮🇳 Telugu (తెలుగు)</option>
                      <option value="mr">🇮🇳 Marathi (मराठी)</option>
                      <option value="gu">🇮🇳 Gujarati (ગુજરાતી)</option>
                      <option value="kn">🇮🇳 Kannada (ಕನ್ನಡ)</option>
                      <option value="ml">🇮🇳 Malayalam (മലയാളം)</option>
                      <option value="pa">🇮🇳 Punjabi (ਪੰਜਾਬੀ)</option>
                      <option value="as">🇮🇳 Assamese (অসমୀয়া)</option>
                      <option value="ur">🇮🇳 Urdu (اردو)</option>
                    </select>

                    <button
                      type="button"
                      onClick={handleVoiceCataloging}
                      disabled={isProcessingAudio}
                      className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 ${
                        isListening ? 'bg-red-500 text-white animate-pulse hover:bg-red-600 shadow-sm' : 
                        isProcessingAudio ? 'bg-terracotta-200 text-terracotta-700 cursor-not-allowed' : 
                        voiceSuccess ? 'bg-green-500 text-white shadow-sm hover:bg-green-600' :
                        'bg-terracotta-600 text-white hover:bg-terracotta-500 shadow-sm'
                      }`}
                    >
                      {isProcessingAudio ? (
                        <><Loader2 size={14} className="animate-spin" /> Transcribing...</>
                      ) : isListening ? (
                        <><Mic size={14} /> Listening... {recordingTime}s (Stop)</>
                      ) : voiceSuccess ? (
                        <><CheckCircle2 size={14} /> Transcribed!</>
                      ) : audioError ? (
                        <><Mic size={14} /> Try Again</>
                      ) : (
                        <><Mic size={14} /> Record Voice</>
                      )}
                    </button>
                  </div>
                </div>
                
                {audioError && (
                  <p className="text-xs text-red-500 font-medium">{audioError}</p>
                )}

                {/* Voice Transcription Preview Card directly below Record Voice */}
                <div className="bg-white p-4 rounded-xl border border-terracotta-200 text-xs shadow-sm mt-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-earth-900 flex items-center gap-1.5 text-xs">
                      📝 Voice Transcription
                    </span>
                    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-terracotta-100 text-terracotta-800 font-bold">
                      {detectedLanguageName || (selectedLanguage === 'auto' ? 'Auto Detect' : selectedLanguage.toUpperCase())}
                    </span>
                  </div>

                  {isProcessingAudio ? (
                    <p className="text-earth-500 italic py-2">⏳ Transcribing your voice...</p>
                  ) : isListening ? (
                    <p className="text-red-500 italic py-2">🔴 Recording...</p>
                  ) : transcriptionText ? (
                    <div className="flex flex-col gap-2.5">
                      <div className="bg-earth-50 p-3 rounded-lg border border-earth-200 text-earth-900 text-sm leading-relaxed select-all">
                        <span className="text-[10px] font-bold text-earth-500 uppercase tracking-wider block mb-1">Original Voice Audio:</span>
                        {transcriptionText}
                      </div>

                      {englishTranslationText && (
                        <div className="bg-terracotta-50/70 p-3 rounded-lg border border-terracotta-200 text-earth-900 text-sm leading-relaxed select-all">
                          <span className="text-[10px] font-bold text-terracotta-700 uppercase tracking-wider flex items-center gap-1 mb-1">
                            🇬🇧 English Translation:
                          </span>
                          {englishTranslationText}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-earth-400 italic py-1">Your voice transcription will appear here.</p>
                  )}
                </div>
              </div>

              {/* Artisan Guidance Banner */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 text-xs">
                <Info size={18} className="text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1 text-earth-800">
                  <span className="font-bold text-amber-900 block text-xs uppercase tracking-wider">
                    💡 Artisan Heritage Listing Tips
                  </span>
                  <p className="leading-relaxed">
                    Please specify your <strong>Raw Materials</strong>, <strong>Craft Region / Origin Village</strong>, and <strong>Primary Crafting Materials</strong>. Sharing your authentic origin helps buyers connect with your traditional art!
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-earth-700 uppercase tracking-wider mb-2">Product Title *</label>
                <input
                  required
                  type="text"
                  value={newProduct.title}
                  onChange={e => setNewProduct(p => ({ ...p, title: e.target.value }))}
                  className="w-full px-4 py-3 bg-earth-50 border border-earth-200 rounded-lg focus:outline-none focus:border-terracotta-500 focus:ring-1 focus:ring-terracotta-500"
                  placeholder="e.g., Hand-Painted Madhubani Wall Art"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-earth-700 uppercase tracking-wider mb-2">Category *</label>
                  <select
                    value={newProduct.category}
                    onChange={e => {
                      setNewProduct(p => ({ ...p, category: e.target.value }));
                    }}
                    className="w-full px-4 py-3 bg-earth-50 border border-earth-200 rounded-lg focus:outline-none focus:border-terracotta-500"
                  >
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-earth-700 uppercase tracking-wider mb-2">Craft Region / Origin</label>
                  <input
                    type="text"
                    value={newProduct.region || ''}
                    onChange={e => setNewProduct(p => ({ ...p, region: e.target.value }))}
                    className="w-full px-4 py-3 bg-earth-50 border border-earth-200 rounded-lg focus:outline-none focus:border-terracotta-500 focus:ring-1 focus:ring-terracotta-500"
                    placeholder="e.g., Sambalpur, Odisha"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-earth-700 uppercase tracking-wider mb-2">Primary Materials</label>
                  <input
                    type="text"
                    value={newProduct.material}
                    onChange={e => setNewProduct(p => ({ ...p, material: e.target.value }))}
                    className="w-full px-4 py-3 bg-earth-50 border border-earth-200 rounded-lg focus:outline-none focus:border-terracotta-500 focus:ring-1 focus:ring-terracotta-500"
                    placeholder="e.g., Natural Cotton, Terracotta Clay"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-earth-700 uppercase tracking-wider mb-2">Description</label>
                <textarea
                  value={newProduct.description}
                  onChange={e => setNewProduct(p => ({ ...p, description: e.target.value }))}
                  className="w-full px-4 py-3 bg-earth-50 border border-earth-200 rounded-lg focus:outline-none focus:border-terracotta-500 focus:ring-1 focus:ring-terracotta-500 min-h-[80px]"
                  placeholder="Describe your product..."
                />
              </div>

              <div className="bg-earth-50 rounded-xl p-4 border border-earth-200 space-y-4">
                <h4 className="text-sm font-bold text-earth-900 flex items-center gap-2">
                  <Calculator size={16} className="text-earth-500" /> Cost Breakdown (Optional)
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-earth-600 uppercase tracking-wider mb-1">Raw Material</label>
                    <input
                      type="number"
                      value={newProduct.rawMaterialCost}
                      onChange={e => setNewProduct(p => ({ ...p, rawMaterialCost: e.target.value }))}
                      className="w-full px-3 py-2 bg-white border border-earth-200 rounded-lg text-sm focus:outline-none focus:border-terracotta-500"
                      placeholder="₹"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-earth-600 uppercase tracking-wider mb-1">Labor Time</label>
                    <input
                      type="number"
                      value={newProduct.laborCost}
                      onChange={e => setNewProduct(p => ({ ...p, laborCost: e.target.value }))}
                      className="w-full px-3 py-2 bg-white border border-earth-200 rounded-lg text-sm focus:outline-none focus:border-terracotta-500"
                      placeholder="₹"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-earth-600 uppercase tracking-wider mb-1">Other Costs</label>
                    <input
                      type="number"
                      value={newProduct.additionalCost}
                      onChange={e => setNewProduct(p => ({ ...p, additionalCost: e.target.value }))}
                      className="w-full px-3 py-2 bg-white border border-earth-200 rounded-lg text-sm focus:outline-none focus:border-terracotta-500"
                      placeholder="₹"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-terracotta-50/30 border border-terracotta-200 rounded-xl p-5">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-earth-700 uppercase tracking-wider mb-2">Selling Price *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <IndianRupee size={16} className="text-earth-500" />
                      </div>
                      <input
                        id="selling-price-input"
                        required
                        type="number"
                        value={newProduct.price}
                        onChange={e => setNewProduct(p => ({ ...p, price: e.target.value }))}
                        className="w-full pl-9 pr-4 py-3 bg-white border border-earth-200 rounded-lg focus:outline-none focus:border-terracotta-500 focus:ring-1 focus:ring-terracotta-500 font-bold"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div className="shrink-0">
                    <button
                      type="button"
                      onClick={handleSuggestPrice}
                      disabled={isPricing}
                      className={`h-[50px] px-5 rounded-lg text-sm font-bold uppercase tracking-wider transition-colors flex items-center gap-2 ${
                        isPricing ? 'bg-terracotta-100 text-terracotta-500 cursor-not-allowed' : 'bg-terracotta-100 text-terracotta-700 hover:bg-terracotta-200'
                      }`}
                    >
                      {isPricing ? (
                        <><Loader2 size={16} className="animate-spin" /> Analyzing...</>
                      ) : (
                        <><Sparkles size={16} /> Suggest Fair Price</>
                      )}
                    </button>
                  </div>
                </div>

                {pricingError && (
                  <p className="text-sm text-red-500 mt-2">{pricingError}</p>
                )}

                {newProduct.aiSuggestedPrice && !isPricing && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-6 pt-5 border-t border-terracotta-200"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles size={20} className="text-terracotta-600" />
                      <h4 className="font-serif font-bold tracking-wider text-earth-900 uppercase text-sm">AI Price Assistant</h4>
                      <span className={`ml-auto text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border font-bold ${
                        newProduct.aiPricingConfidence === 'Medium' || newProduct.aiPricingConfidence === 'High' 
                          ? 'border-green-300 text-green-700 bg-green-50' 
                          : 'border-amber-300 text-amber-700 bg-amber-50'
                      }`}>
                        Confidence: {newProduct.aiPricingConfidence}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-white p-3 rounded-lg border border-terracotta-100">
                        <span className="block text-[10px] font-bold text-earth-500 uppercase tracking-wider mb-1">Cost Basis</span>
                        <span className="text-lg font-bold text-earth-900">
                          ₹{(Number(newProduct.rawMaterialCost) || 0) + (Number(newProduct.laborCost) || 0) + (Number(newProduct.additionalCost) || 0)}
                        </span>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-terracotta-100">
                        <span className="block text-[10px] font-bold text-earth-500 uppercase tracking-wider mb-1">Suggested Range</span>
                        <span className="text-lg font-bold text-terracotta-700">₹{newProduct.priceRangeMin} - ₹{newProduct.priceRangeMax}</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <span className="block text-xs font-bold text-earth-900 mb-1">Recommended Price: <span className="text-terracotta-600 text-lg">₹{newProduct.aiSuggestedPrice}</span></span>
                      <p className="text-xs text-earth-600 leading-relaxed">
                        {newProduct.aiPricingExplanation}
                      </p>
                    </div>

                    {newProduct.aiPricingFactors && newProduct.aiPricingFactors.length > 0 && (
                      <div className="mb-5">
                        <span className="block text-[10px] font-bold text-earth-500 uppercase tracking-wider mb-2">Why this price?</span>
                        <div className="flex flex-wrap gap-2">
                          {newProduct.aiPricingFactors.map((factor, idx) => (
                            <span key={idx} className="bg-white text-earth-700 border border-earth-200 text-[10px] px-2 py-1 rounded-full font-medium">
                              {factor}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setNewProduct(p => ({ ...p, price: p.aiSuggestedPrice }))}
                        className="flex-1 text-xs font-bold uppercase tracking-wider text-white bg-terracotta-600 hover:bg-terracotta-700 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 size={16} /> Use ₹{newProduct.aiSuggestedPrice}
                      </button>
                      <button
                        type="button"
                        onClick={() => document.getElementById('selling-price-input').focus()}
                        className="flex-1 text-xs font-bold uppercase tracking-wider text-earth-700 bg-white border border-earth-300 hover:bg-earth-50 py-3 rounded-lg transition-colors"
                      >
                        Edit Price Manually
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-earth-700 uppercase tracking-wider mb-2">Main Product Photo *</label>
                
                {/* Live Camera Overlay Modal */}
                {isCameraOpen && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
                    <div className="bg-earth-900 rounded-2xl p-4 max-w-md w-full flex flex-col items-center gap-4 shadow-2xl border border-earth-700">
                      <div className="flex items-center justify-between w-full text-white">
                        <span className="font-bold text-sm flex items-center gap-2">
                          <Camera size={18} className="text-terracotta-400" /> Capture Product Photo
                        </span>
                        <button type="button" onClick={closeCamera} className="p-1 rounded-full hover:bg-earth-800 text-earth-400 hover:text-white">
                          <X size={20} />
                        </button>
                      </div>

                      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black border border-earth-800 flex items-center justify-center">
                        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                        <span className="absolute top-2 left-2 bg-black/60 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded backdrop-blur-sm">
                          {cameraFacingMode === 'environment' ? 'Rear Camera 📷' : 'Front Camera 🤳'}
                        </span>
                      </div>

                      <div className="flex items-center justify-around w-full pt-2">
                        <button
                          type="button"
                          onClick={toggleCameraFacingMode}
                          className="px-4 py-2 bg-earth-800 hover:bg-earth-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors border border-earth-700"
                        >
                          <RefreshCw size={14} className="animate-spin-slow" /> Rotate Camera
                        </button>
                        
                        <button
                          type="button"
                          onClick={captureCameraPhoto}
                          className="px-6 py-3 bg-terracotta-600 hover:bg-terracotta-500 text-white rounded-full font-bold text-sm flex items-center gap-2 shadow-lg transition-transform active:scale-95"
                        >
                          <Camera size={18} /> Take Photo
                        </button>

                        <button
                          type="button"
                          onClick={closeCamera}
                          className="px-4 py-2 bg-earth-800 hover:bg-earth-700 text-earth-300 rounded-lg text-xs font-bold"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {originalImage ? (
                   <div className="bg-white p-4 rounded-xl border border-earth-200 shadow-sm space-y-4">
                      {isDeblurring || isLightingEnhancing || isRemovingBg || isEnhancing ? (
                         <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
                            <Loader2 size={36} className="text-terracotta-600 animate-spin" />
                            <div>
                               <p className="text-earth-900 font-bold text-base flex items-center justify-center gap-1.5">
                                  <Sparkles size={18} className="text-terracotta-500 animate-pulse" />
                                  {isDeblurring 
                                    ? "🔍 Stage 1: NAFNet deblurring..." 
                                    : isLightingEnhancing 
                                    ? "☀️ Stage 2: OpenCV LAB lighting & contrast enhancement..." 
                                    : isRemovingBg 
                                    ? "✨ Stage 3: Background removal with white studio canvas..." 
                                    : "⚡ Running Full 3-Stage AI Pipeline (Deblur + Lighting + White BG)..."}
                               </p>
                               <p className="text-xs text-earth-600 mt-1 font-medium">Processing locally with AI & OpenCV</p>
                               <p className="text-[11px] text-earth-400">Restoring quality, lighting & background</p>
                            </div>
                         </div>
                      ) : enhanceError ? (
                         <div className="flex flex-col items-center justify-center py-6 text-center">
                            <div className="text-red-500 font-bold text-sm mb-3">{enhanceError}</div>
                            <img src={enhancedImage || lightingImage || deblurredImage || originalImage} alt="Product Photo" className="w-32 h-32 object-contain rounded-lg border border-earth-200 mb-4 bg-earth-50" />
                            <button type="button" onClick={() => { 
                               if (selectedImageFile) uploadImage(selectedImageFile, 'image');
                               setOriginalImage(null); 
                               setDeblurredImage(null);
                               setLightingImage(null);
                               setEnhancedImage(null);
                               setEnhanceError(''); 
                            }} className="px-6 py-2.5 bg-earth-900 text-white rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-earth-800">Keep Original</button>
                         </div>
                      ) : (
                         <div className="flex flex-col items-center">
                            <div className="flex items-center justify-between w-full mb-3">
                               <h3 className="font-serif font-bold text-earth-900 text-sm flex items-center gap-2">
                                  <Sparkles size={16} className="text-terracotta-600" /> AI Image Studio (3-Stage)
                               </h3>
                               <span className="text-[11px] font-bold text-terracotta-700 bg-terracotta-50 px-2.5 py-0.5 rounded-full border border-terracotta-200">
                                  {enhancedImage ? "Stage 3: White Background ✓" : lightingImage ? "Stage 2: Lighting Fixed ✓" : deblurredImage ? "Stage 1: Deblurred ✓" : "Original Photo"}
                               </span>
                            </div>

                            {/* Image Grid Comparison */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 w-full">
                               <div className="bg-earth-50 p-2 rounded-xl border border-earth-200 flex flex-col items-center">
                                  <span className="text-[10px] font-bold text-earth-500 uppercase tracking-wider mb-1">
                                     Original Photo
                                  </span>
                                  <img src={originalImage} alt="Original" className="w-full h-36 object-contain rounded-lg bg-white" />
                               </div>

                               {enhancedImage ? (
                                  <div className="bg-green-50/60 p-2 rounded-xl border-2 border-green-500 shadow-sm flex flex-col items-center">
                                     <span className="text-[10px] font-bold text-green-700 uppercase tracking-wider mb-1">Final: Clean White Studio BG</span>
                                     <img src={enhancedImage} alt="Enhanced" className="w-full h-36 object-contain rounded-lg bg-white" />
                                  </div>
                               ) : lightingImage ? (
                                  <div className="bg-amber-50/60 p-2 rounded-xl border-2 border-amber-500 shadow-sm flex flex-col items-center">
                                     <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-1">Lighting Fixed (OpenCV LAB)</span>
                                     <img src={lightingImage} alt="Lighting Enhanced" className="w-full h-36 object-contain rounded-lg bg-white" />
                                  </div>
                               ) : deblurredImage ? (
                                  <div className="bg-blue-50/60 p-2 rounded-xl border-2 border-blue-500 shadow-sm flex flex-col items-center">
                                     <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider mb-1">Deblurred (NAFNet)</span>
                                     <img src={deblurredImage} alt="Deblurred" className="w-full h-36 object-contain rounded-lg bg-white" />
                                  </div>
                               ) : (
                                  <div className="bg-earth-50/50 p-2 rounded-xl border border-dashed border-earth-300 flex flex-col items-center justify-center text-center">
                                     <Sparkles size={24} className="text-earth-400 mb-1" />
                                     <p className="text-xs font-semibold text-earth-600">AI Enhancement Ready</p>
                                     <p className="text-[10px] text-earth-400">Click below to Debblur, Fix Lighting, or Remove BG</p>
                                  </div>
                               )}
                            </div>

                            {/* Step-by-Step AI Control Buttons */}
                            <div className="flex flex-col gap-2 w-full mb-3">
                               <div className="grid grid-cols-3 gap-2 w-full">
                                  <button
                                     type="button"
                                     onClick={handleDeblurImage}
                                     disabled={isDeblurring}
                                     className="py-2.5 px-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-[11px] flex items-center justify-center gap-1 transition-colors shadow-sm"
                                  >
                                     🔍 1. Deblur
                                  </button>
                                  <button
                                     type="button"
                                     onClick={() => handleLightingEnhanceImage(deblurredImage || originalImage)}
                                     disabled={isLightingEnhancing}
                                     className="py-2.5 px-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-[11px] flex items-center justify-center gap-1 transition-colors shadow-sm"
                                  >
                                     ☀️ 2. Fix Lighting
                                  </button>
                                  <button
                                     type="button"
                                     onClick={() => handleRemoveBgImage(lightingImage || deblurredImage || originalImage)}
                                     disabled={isRemovingBg}
                                     className="py-2.5 px-2 bg-terracotta-600 hover:bg-terracotta-700 text-white rounded-lg font-bold text-[11px] flex items-center justify-center gap-1 transition-colors shadow-sm"
                                  >
                                     ✨ 3. Remove BG
                                  </button>
                               </div>

                               <button
                                  type="button"
                                  onClick={handleEnhanceImage}
                                  disabled={isEnhancing}
                                  className="w-full py-2.5 bg-earth-900 hover:bg-earth-800 text-white rounded-lg font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors shadow-md"
                               >
                                  ⚡ Full 3-Stage Pipeline: Deblur + Lighting + White BG
                               </button>
                            </div>

                            {/* Save / Reset Actions */}
                            <div className="flex gap-2 w-full pt-2 border-t border-earth-200">
                               <button 
                                  type="button" 
                                  onClick={() => { 
                                     if (selectedImageFile) uploadImage(selectedImageFile, 'image');
                                     setOriginalImage(null); 
                                     setDeblurredImage(null);
                                     setLightingImage(null);
                                     setEnhancedImage(null);
                                  }} 
                                  className="flex-1 py-2.5 border border-earth-300 text-earth-700 rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-earth-50 transition-colors"
                               >
                                  Keep Original
                               </button>
                               <button 
                                  type="button" 
                                  onClick={() => { 
                                     const bestImage = enhancedImage || lightingImage || deblurredImage;
                                     if (bestImage) {
                                       setNewProduct(p => ({ ...p, image: bestImage }));
                                       if (bestImage.startsWith('data:')) {
                                         try {
                                           const arr = bestImage.split(',');
                                           const mime = arr[0].match(/:(.*?);/)[1];
                                           const bstr = atob(arr[1]);
                                           let n = bstr.length;
                                           const u8arr = new Uint8Array(n);
                                           while(n--){
                                               u8arr[n] = bstr.charCodeAt(n);
                                           }
                                           const file = new File([u8arr], "ai_enhanced_product.png", {type: mime});
                                           uploadImage(file, 'image');
                                         } catch (e) {
                                           console.error(e);
                                         }
                                       }
                                     }
                                     setOriginalImage(null); 
                                     setDeblurredImage(null);
                                     setLightingImage(null);
                                     setEnhancedImage(null); 
                                  }} 
                                  className="flex-1 py-2.5 bg-green-600 text-white rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-green-700 shadow-md transition-colors flex items-center justify-center gap-1.5"
                               >
                                  <CheckCircle2 size={16} /> Apply {enhancedImage ? "White BG" : lightingImage ? "Lighting" : deblurredImage ? "Deblurred" : "Photo"}
                               </button>
                            </div>
                         </div>
                      )}
                   </div>

                ) : (
                  <div className="flex flex-col gap-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                      <label htmlFor="main-image-upload" className="cursor-pointer">
                        <input
                          id="main-image-upload"
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                               setSelectedImageFile(file);
                               setOriginalImage(URL.createObjectURL(file));
                            }
                          }}
                        />
                        <div className={`flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed rounded-lg transition-colors ${
                          newProduct.image 
                            ? 'border-green-300 bg-green-50/50' 
                            : 'border-earth-300 bg-earth-50 hover:border-terracotta-400 hover:bg-terracotta-50/30'
                        }`}>
                          {imageUploading.image ? (
                            <><Loader2 size={18} className="text-terracotta-500 animate-spin" /><span className="text-xs text-terracotta-600 font-medium">Uploading...</span></>
                          ) : newProduct.image ? (
                            <><CheckCircle2 size={18} className="text-green-600" /><span className="text-xs text-green-700 font-medium">Gallery Photo Uploaded</span></>
                          ) : (
                            <><Upload size={18} className="text-earth-500" /><span className="text-xs text-earth-600 font-medium">Pick from Gallery</span></>
                          )}
                        </div>
                      </label>

                      <button
                        type="button"
                        onClick={() => openCamera()}
                        className="flex items-center justify-center gap-2 px-4 py-3 border border-terracotta-300 bg-terracotta-50 hover:bg-terracotta-100 text-terracotta-800 rounded-lg text-xs font-bold transition-colors shadow-sm"
                      >
                        <Camera size={18} className="text-terracotta-600" />
                        <span>Take Photo with Camera</span>
                      </button>
                    </div>

                    {newProduct.image && (
                       <button type="button" onClick={() => setOriginalImage(newProduct.image)} className="w-full py-3 bg-earth-900 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:bg-earth-800 transition-colors">
                          <Sparkles size={18} /> ✨ AI Image Studio (Deblur / Lighting / White BG)
                       </button>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-earth-700 uppercase tracking-wider mb-2">Second Photo (optional)</label>
                <div className="flex gap-3 items-center">
                  <label htmlFor="second-image-upload" className="flex-1 cursor-pointer">
                    <input
                      id="second-image-upload"
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];

                        if (file) uploadImage(file, 'image2');
                      }}
                    />
                    <div className={`flex items-center justify-center gap-3 px-4 py-3 border-2 border-dashed rounded-lg transition-colors ${
                      newProduct.image2 
                        ? 'border-green-300 bg-green-50/50' 
                        : 'border-earth-300 bg-earth-50 hover:border-terracotta-400 hover:bg-terracotta-50/30'
                    }`}>
                      {imageUploading.image2 ? (
                        <><Loader2 size={18} className="text-terracotta-500 animate-spin" /><span className="text-sm text-terracotta-600 font-medium">Uploading...</span></>
                      ) : newProduct.image2 ? (
                        <><CheckCircle2 size={18} className="text-green-600" /><span className="text-sm text-green-700 font-medium">Photo uploaded — tap to change</span></>
                      ) : (
                        <><Upload size={18} className="text-earth-500" /><span className="text-sm text-earth-600 font-medium">Tap to add another photo</span></>
                      )}
                    </div>
                  </label>
                  {newProduct.image2 ? (
                    <img src={newProduct.image2} alt="preview 2" className="w-14 h-14 object-cover rounded-lg border-2 border-green-300 shrink-0 shadow-sm" />
                  ) : (
                    <div className="w-14 h-14 bg-earth-100 rounded-lg border border-earth-200 flex items-center justify-center shrink-0">
                      <ImageIcon size={20} className="text-earth-400" />
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 border border-earth-200 text-earth-700 font-bold uppercase tracking-wider rounded-lg hover:bg-earth-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || imageUploading.image || imageUploading.image2}
                  className="flex-1 py-3 bg-earth-900 text-white font-bold uppercase tracking-wider rounded-lg hover:bg-terracotta-600 transition-colors disabled:opacity-60"
                >
                  {isSubmitting ? (isEditing ? 'Saving...' : 'Adding...') : (isEditing ? 'Save Changes' : 'Add to Catalog')}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProductFormModal;
