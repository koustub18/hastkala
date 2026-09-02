import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Image as ImageIcon, Camera, Check, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, updateArtisanProfileImages, auth } from '@hastkala/core';
import { useAuth } from '../../contexts/AuthContext';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const ProfileImageUploadModal = ({ isOpen, onClose, mode = 'profile', userUid, onSuccess }) => {
  const { user, reloadProfile } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const activeUid = userUid || user?.uid || auth.currentUser?.uid;

  const isProfile = mode === 'profile';
  const title = isProfile ? 'Update Profile Picture' : 'Update Cover Banner';
  const subtitle = isProfile 
    ? 'Recommended: Square image (1:1), max 5MB. Resized to 500×500px.'
    : 'Recommended: Wide banner image (3:1), max 10MB. Resized to 1200×400px.';
  const maxSizeBytes = (isProfile ? 5 : 10) * 1024 * 1024;

  const handleReset = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setIsUploading(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const validateAndSetFile = (file) => {
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error('Unsupported format. Please select JPG, PNG, or WebP.');
      return;
    }

    if (file.size > maxSizeBytes) {
      toast.error(`File is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max allowed is ${isProfile ? 5 : 10}MB.`);
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  // Client-side image compression/resizing using Canvas with safety fallback
  const compressImage = (file) => {
    return new Promise((resolve) => {
      let resolved = false;
      const safeResolve = (result) => {
        if (!resolved) {
          resolved = true;
          resolve(result);
        }
      };

      // 5-second fallback timeout to prevent canvas hanging
      const timer = setTimeout(() => {
        console.warn('[PROFILE/COVER DEBUG] Image compression timed out. Using original file.');
        safeResolve(file);
      }, 5000);

      const targetWidth = isProfile ? 500 : 1200;
      const targetHeight = isProfile ? 500 : 400;

      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = targetWidth;
            canvas.height = targetHeight;
            const ctx = canvas.getContext('2d');

            let srcX = 0, srcY = 0, srcW = img.width, srcH = img.height;
            const targetRatio = targetWidth / targetHeight;
            const actualRatio = img.width / img.height;

            if (actualRatio > targetRatio) {
              srcW = img.height * targetRatio;
              srcX = (img.width - srcW) / 2;
            } else {
              srcH = img.width / targetRatio;
              srcY = (img.height - srcH) / 2;
            }

            ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, targetWidth, targetHeight);

            canvas.toBlob(
              (blob) => {
                clearTimeout(timer);
                if (blob) {
                  const compressedFile = new File([blob], `${mode}_${Date.now()}.jpg`, {
                    type: 'image/jpeg',
                    lastModified: Date.now()
                  });
                  safeResolve(compressedFile);
                } else {
                  safeResolve(file);
                }
              },
              'image/jpeg',
              0.85
            );
          } catch (err) {
            clearTimeout(timer);
            safeResolve(file);
          }
        };
        img.onerror = () => {
          clearTimeout(timer);
          safeResolve(file);
        };
        img.src = e.target.result;
      };
      reader.onerror = () => {
        clearTimeout(timer);
        safeResolve(file);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleUpload = async () => {
    const currentAuthUid = auth.currentUser?.uid || user?.uid || userUid;
    console.log('[PROFILE/COVER DEBUG] Save clicked');
    console.log('[PROFILE/COVER DEBUG] currentAuthUid:', currentAuthUid);
    console.log('[PROFILE/COVER DEBUG] selectedFile:', selectedFile?.name, selectedFile?.size);

    if (!selectedFile) {
      console.warn('[PROFILE/COVER DEBUG] Aborted: No selectedFile');
      toast.error('Please select an image file first.');
      return;
    }
    if (!currentAuthUid) {
      console.warn('[PROFILE/COVER DEBUG] Aborted: No currentAuthUid');
      toast.error('Profile image upload failed: Firebase authentication session unavailable.');
      return;
    }

    setIsUploading(true);

    try {
      // 1. Compression
      console.log('[PROFILE/COVER DEBUG] STEP 1: Image compression START');
      const optimizedFile = await compressImage(selectedFile);
      console.log('[PROFILE/COVER DEBUG] STEP 1: Image compression SUCCESS', optimizedFile);

      // 2. Storage Reference & Path
      const uniqueName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.jpg`;
      const storagePath = `${mode}s/${currentAuthUid}/${uniqueName}`;
      console.log('[PROFILE/COVER DEBUG] STEP 2: Target Storage Path:', storagePath);
      const storageRef = ref(storage, storagePath);

      // 3. Storage Upload
      console.log('[PROFILE/COVER DEBUG] STEP 3: Firebase Storage upload START');
      const uploadResult = await uploadBytes(storageRef, optimizedFile);
      console.log('[PROFILE/COVER DEBUG] STEP 3: Firebase Storage upload SUCCESS', uploadResult);

      // 4. Get Download URL
      console.log('[PROFILE/COVER DEBUG] STEP 4: getDownloadURL START');
      const downloadUrl = await getDownloadURL(storageRef);
      console.log('[PROFILE/COVER DEBUG] STEP 4: getDownloadURL SUCCESS:', downloadUrl);

      // 5. Firestore Update
      const updateData = isProfile ? { profileImage: downloadUrl } : { coverImage: downloadUrl };
      console.log('[PROFILE/COVER DEBUG] STEP 5: Firestore update START', updateData);
      await updateArtisanProfileImages(currentAuthUid, updateData);
      console.log('[PROFILE/COVER DEBUG] STEP 5: Firestore update SUCCESS');

      // 6. Reload Context Profile (non-blocking for UI)
      try {
        console.log('[PROFILE/COVER DEBUG] STEP 6: reloadProfile START');
        if (reloadProfile) {
          await reloadProfile();
        }
        console.log('[PROFILE/COVER DEBUG] STEP 6: reloadProfile SUCCESS');
      } catch (ctxErr) {
        console.warn('[PROFILE/COVER DEBUG] STEP 6: reloadProfile warning:', ctxErr);
      }

      // 7. Refresh Local Component State (non-blocking for UI)
      try {
        console.log('[PROFILE/COVER DEBUG] STEP 7: onSuccess START');
        if (onSuccess) {
          await onSuccess(currentAuthUid);
        }
        console.log('[PROFILE/COVER DEBUG] STEP 7: onSuccess SUCCESS');
      } catch (cbErr) {
        console.warn('[PROFILE/COVER DEBUG] STEP 7: onSuccess warning:', cbErr);
      }

      toast.success(`${isProfile ? 'Profile picture' : 'Cover photo'} updated successfully!`);
      handleClose();
    } catch (error) {
      console.error('[PROFILE/COVER DEBUG] Upload error encountered:', error);
      let errMsg = error?.message || 'Upload failed. Please try again.';
      if (error?.code === 'storage/unauthorized') {
        errMsg = `${isProfile ? 'Profile' : 'Cover'} upload failed: Storage permission denied.`;
      } else if (error?.code === 'permission-denied') {
        errMsg = `${isProfile ? 'Profile' : 'Cover'} upload failed: Firestore permission denied.`;
      }
      toast.error(errMsg);
    } finally {
      console.log('[PROFILE/COVER DEBUG] Finalizing upload state (setting isUploading = false)');
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-3xl shadow-2xl border border-earth-200 w-full max-w-lg overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-earth-100 bg-earth-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-forest-100 rounded-xl flex items-center justify-center text-forest-700">
                {isProfile ? <Camera size={20} /> : <ImageIcon size={20} />}
              </div>
              <div>
                <h3 className="text-lg font-bold font-serif text-earth-900">{title}</h3>
                <p className="text-xs text-earth-500">{subtitle}</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={isUploading}
              className="text-earth-400 hover:text-earth-700 p-2 rounded-full hover:bg-earth-100 transition-colors disabled:opacity-50"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            {!previewUrl ? (
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3 ${
                  dragActive 
                    ? 'border-forest-500 bg-forest-50/50 scale-[0.99]' 
                    : 'border-earth-200 hover:border-forest-400 hover:bg-earth-50/60'
                }`}
              >
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                  id="modal-file-upload"
                />
                <label htmlFor="modal-file-upload" className="w-full cursor-pointer flex flex-col items-center">
                  <div className="w-14 h-14 bg-earth-100 rounded-2xl flex items-center justify-center text-earth-600 mb-2 shadow-inner">
                    <Upload size={28} />
                  </div>
                  <span className="text-sm font-bold text-earth-800">
                    Click to upload or drag & drop
                  </span>
                  <span className="text-xs text-earth-500 mt-1">
                    Supports JPG, PNG, WebP
                  </span>
                </label>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-2xl overflow-hidden border border-earth-200 bg-earth-900 shadow-inner flex items-center justify-center">
                  {isProfile ? (
                    <div className="w-40 h-40 rounded-full border-4 border-white overflow-hidden shadow-2xl my-4">
                      <img src={previewUrl} alt="Profile preview" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-full h-44 overflow-hidden">
                      <img src={previewUrl} alt="Cover preview" className="w-full h-full object-cover" />
                    </div>
                  )}

                  <button
                    onClick={handleReset}
                    disabled={isUploading}
                    className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-md transition-colors"
                    title="Choose a different image"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="flex items-center gap-2 text-xs text-earth-600 bg-earth-50 p-3 rounded-xl border border-earth-100">
                  <Check size={14} className="text-forest-600 shrink-0" />
                  <span>Image optimized & ready. Click <strong>Save Changes</strong> to apply.</span>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 bg-earth-50/50 border-t border-earth-100">
            <button
              onClick={handleClose}
              disabled={isUploading}
              className="px-5 py-2.5 rounded-xl border border-earth-200 text-earth-700 font-semibold text-xs uppercase tracking-wider hover:bg-earth-100 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className="px-6 py-2.5 rounded-xl bg-forest-600 hover:bg-forest-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-forest-900/10 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Check size={16} />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ProfileImageUploadModal;
