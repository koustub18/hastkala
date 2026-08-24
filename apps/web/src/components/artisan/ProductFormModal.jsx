import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IndianRupee, Sparkles, CheckCircle2, ChevronRight, X, Loader2, Upload, ImageIcon, Mic, Wand2, Calculator, Info } from 'lucide-react';
import { getPriceSuggestion } from '@hastkala/core';

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
  const [isListening, setIsListening] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancedImage, setEnhancedImage] = useState(null);
  const [isPricing, setIsPricing] = useState(false);
  const [pricingError, setPricingError] = useState('');

  const handleVoiceCataloging = () => {
    setIsListening(true);
    setTimeout(() => {
      setIsListening(false);
      setNewProduct(p => ({
        ...p,
        title: 'Hand-Carved Wooden Elephant',
        category: 'Toys',
        material: 'Teak Wood'
      }));
    }, 3000);
  };

  const handleEnhanceImage = () => {
    if (!newProduct.image) return;
    setIsEnhancing(true);
    setTimeout(() => {
      setIsEnhancing(false);
      setEnhancedImage(newProduct.image);
    }, 2000);
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
    } catch (err) {
      console.error(err);
      setPricingError('Failed to get pricing suggestion. Please enter manually.');
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
              {/* Multilingual Voice Cataloging Feature */}
              <div className="bg-terracotta-50/50 border border-terracotta-200 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-earth-900 flex items-center gap-1">
                    <Mic size={16} className="text-terracotta-500" /> Multilingual Voice Cataloging
                  </h4>
                  <p className="text-xs text-earth-500 mt-1">Speak in your native language to auto-fill details.</p>
                </div>
                <button
                  type="button"
                  onClick={handleVoiceCataloging}
                  disabled={isListening}
                  className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 ${
                    isListening ? 'bg-terracotta-200 text-terracotta-700 animate-pulse' : 'bg-terracotta-600 text-white hover:bg-terracotta-500 shadow-sm'
                  }`}
                >
                  {isListening ? (
                    <><Loader2 size={14} className="animate-spin" /> Listening...</>
                  ) : (
                    <><Mic size={14} /> Start Speaking</>
                  )}
                </button>
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

              <div className="grid grid-cols-2 gap-4">
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
                  <label className="block text-xs font-bold text-earth-700 uppercase tracking-wider mb-2">Material</label>
                  <input
                    type="text"
                    value={newProduct.material}
                    onChange={e => setNewProduct(p => ({ ...p, material: e.target.value }))}
                    className="w-full px-4 py-3 bg-earth-50 border border-earth-200 rounded-lg focus:outline-none focus:border-terracotta-500 focus:ring-1 focus:ring-terracotta-500"
                    placeholder="e.g., Cotton, Clay, Silk"
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
              </div>              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-earth-700 uppercase tracking-wider">Main Product Photo *</label>
                  {newProduct.image && (
                    <button
                      type="button"
                      onClick={handleEnhanceImage}
                      disabled={isEnhancing || enhancedImage === newProduct.image}
                      className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-terracotta-600 hover:text-terracotta-700 transition-colors disabled:opacity-50"
                    >
                      <Wand2 size={11} />
                      {isEnhancing ? 'Enhancing...' : enhancedImage === newProduct.image ? 'AI Enhanced' : 'Enhance with AI'}
                    </button>
                  )}
                </div>
                <div className="flex gap-3 items-center">
                  <label htmlFor="main-image-upload" className="flex-1 cursor-pointer">
                    <input
                      id="main-image-upload"
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        console.log("File selected for main image:", file);
                        if (file) uploadImage(file, 'image');
                      }}
                    />
                    <div className={`flex items-center justify-center gap-3 px-4 py-3 border-2 border-dashed rounded-lg transition-colors ${
                      newProduct.image 
                        ? 'border-green-300 bg-green-50/50' 
                        : 'border-earth-300 bg-earth-50 hover:border-terracotta-400 hover:bg-terracotta-50/30'
                    }`}>
                      {imageUploading.image ? (
                        <><Loader2 size={18} className="text-terracotta-500 animate-spin" /><span className="text-sm text-terracotta-600 font-medium">Uploading...</span></>
                      ) : newProduct.image ? (
                        <><CheckCircle2 size={18} className="text-green-600" /><span className="text-sm text-green-700 font-medium">Photo uploaded — tap to change</span></>
                      ) : (
                        <><Upload size={18} className="text-earth-500" /><span className="text-sm text-earth-600 font-medium">Tap to pick from Gallery</span></>
                      )}
                    </div>
                  </label>
                  {newProduct.image ? (
                    <div className="relative shrink-0">
                      <img 
                        src={newProduct.image} 
                        alt="preview" 
                        className={`w-14 h-14 object-cover rounded-lg border-2 ${enhancedImage === newProduct.image ? 'border-terracotta-400 filter contrast-125 saturate-150 brightness-110' : 'border-green-300'} shadow-sm transition-all duration-500`} 
                      />
                      {enhancedImage === newProduct.image && (
                         <div className="absolute -top-2 -right-2 bg-terracotta-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider z-10 shadow-sm">
                           AI
                         </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-14 h-14 bg-earth-100 rounded-lg border border-earth-200 flex items-center justify-center shrink-0">
                      <ImageIcon size={20} className="text-earth-400" />
                    </div>
                  )}
                </div>
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
                        console.log("File selected for second image:", file);
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
                  disabled={isSubmitting || (!newProduct.image && !isEditing) || imageUploading.image || imageUploading.image2}
                  className="flex-1 py-3 bg-earth-900 text-white font-bold uppercase tracking-wider rounded-lg hover:bg-terracotta-600 transition-colors disabled:opacity-60"
                >
                  {isSubmitting ? (isEditing ? 'Saving...' : 'Adding...') : (!newProduct.image && !isEditing) ? 'Upload Photo First' : (isEditing ? 'Save Changes' : 'Add to Catalog')}
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
