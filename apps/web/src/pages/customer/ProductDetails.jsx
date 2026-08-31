import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, User, MapPin, Tag, Mail, CheckCircle } from 'lucide-react';
import { useProduct } from '../../hooks/useProduct';
import toast from 'react-hot-toast';
import { resolveImageUrl } from '../../utils/webImageUtils';
import { createEnquiry } from '@hastkala/core';

const ProductDetails = () => {
  const { productId } = useParams();
  const { product, isLoading } = useProduct(productId);
  const [activeImage, setActiveImage] = useState(0);
  const [showEnquiryForm, setShowEnquiryForm] = useState(false);
  const [enquiry, setEnquiry] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-earth-50 pt-24 pb-20 px-4 md:px-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-earth-50 pt-24 pb-20 flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-earth-900 mb-4">Product not found</h2>
        <Link to="/explore" className="text-forest-600 hover:underline">Return to Explore</Link>
      </div>
    );
  }

  const images = (product.images?.length > 0 
    ? product.images 
    : [product.image, product.image2].filter(Boolean)).map(resolveImageUrl);
  if (images.length === 0) images.push(''); // placeholder

  const handleEnquirySubmit = async (e) => {
    e.preventDefault();
    if (!enquiry.name || !enquiry.email || !enquiry.message) {
      toast.error("Please fill all fields");
      return;
    }

    const validProductId = product.id || product._id;
    if (!validProductId || !product.artisanId) {
      toast.error("This product is missing necessary artisan information and cannot receive enquiries.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await createEnquiry({
        productId: validProductId,
        productTitle: product.title,
        artisanId: product.artisanId,
        customerName: enquiry.name,
        customerEmail: enquiry.email,
        message: enquiry.message
      });
      toast.success("Enquiry sent successfully!");
      setShowEnquiryForm(false);
      setEnquiry({ name: '', email: '', message: '' });
    } catch (err) {
      console.error("Error submitting enquiry:", err);
      toast.error("Failed to send enquiry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-earth-50 pt-24 pb-20 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <Link to="/explore" className="inline-flex items-center gap-2 text-earth-500 hover:text-terracotta-600 mb-8 font-bold uppercase tracking-wider text-sm transition-colors group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to explore
        </Link>

        <div className="bg-white rounded-[2rem] overflow-hidden shadow-2xl shadow-earth-900/5 border border-earth-100/50">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Image Gallery */}
            <div className="bg-gradient-to-br from-earth-50 to-earth-100 p-8 md:p-12 flex flex-col items-center justify-center border-r border-earth-100/50 relative">
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/handmade-paper.png")' }}></div>
              <motion.div 
                key={activeImage}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md aspect-square rounded-2xl overflow-hidden shadow-lg mb-6 bg-white"
              >
                {images[activeImage] ? (
                  <img src={images[activeImage]} alt={product.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-earth-300">No Image</div>
                )}
              </motion.div>
              {images.length > 1 && (
                <div className="flex gap-4 justify-center">
                  {images.map((img, idx) => (
                    <button 
                      key={idx}
                      onClick={() => setActiveImage(idx)}
                      className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-forest-600 scale-105' : 'border-transparent opacity-70 hover:opacity-100'}`}
                    >
                      <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="p-8 md:p-12 flex flex-col justify-center">
              <div className="mb-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-terracotta-50 text-terracotta-700 text-xs font-bold uppercase tracking-widest">
                <Tag size={14} /> {product.craft || product.category || 'Handcrafted'}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-earth-900 font-serif mb-6 leading-tight">{product.title}</h1>
              
              <div className="flex items-center gap-4 mb-8 text-earth-600 border-b border-earth-100 pb-8">
                <Link to={`/artisan/${product.artisanId || 'unknown'}`} className="flex items-center gap-2 hover:text-forest-700 transition-colors">
                  <div className="bg-earth-200 p-2 rounded-full"><User size={16} className="text-earth-700" /></div>
                  <span className="font-medium">{product.artisanName || product.artisan || 'Unknown Artisan'}</span>
                </Link>
              </div>

              <div className="prose prose-earth mb-8">
                <h3 className="text-lg font-semibold text-earth-900 mb-2">Description</h3>
                <p className="text-earth-700 leading-relaxed">{product.description || 'No description provided.'}</p>
              </div>

              {product.material && (
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-earth-500 uppercase tracking-wider mb-2">Materials Used</h3>
                  <p className="text-earth-900 font-medium">{product.material}</p>
                </div>
              )}

              <div className="flex items-center justify-between mb-8">
                <div>
                  <p className="text-sm font-semibold text-earth-500 uppercase tracking-wider mb-1">Price</p>
                  <p className="text-3xl font-bold text-forest-700">{product.price ? `₹${product.price}` : 'Price on request'}</p>
                </div>
              </div>

              <button 
                onClick={() => setShowEnquiryForm(!showEnquiryForm)}
                className="w-full bg-terracotta-600 hover:bg-terracotta-700 text-white py-4 px-8 rounded-full font-bold uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl hover:-translate-y-1"
              >
                <Mail size={20} /> Request to Purchase
              </button>

              <AnimatePresence>
                {showEnquiryForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden mt-6"
                  >
                    <form onSubmit={handleEnquirySubmit} className="bg-earth-50 p-6 rounded-2xl border border-earth-100">
                      <h4 className="font-semibold text-earth-900 mb-4">Send an Enquiry</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-earth-700 mb-1">Your Name</label>
                          <input 
                            type="text" 
                            required
                            value={enquiry.name}
                            onChange={(e) => setEnquiry({...enquiry, name: e.target.value})}
                            className="w-full px-4 py-2 rounded-lg border border-earth-200 focus:ring-2 focus:ring-forest-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-earth-700 mb-1">Email Address</label>
                          <input 
                            type="email" 
                            required
                            value={enquiry.email}
                            onChange={(e) => setEnquiry({...enquiry, email: e.target.value})}
                            className="w-full px-4 py-2 rounded-lg border border-earth-200 focus:ring-2 focus:ring-forest-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-earth-700 mb-1">Message</label>
                          <textarea 
                            required
                            rows="3"
                            value={enquiry.message}
                            onChange={(e) => setEnquiry({...enquiry, message: e.target.value})}
                            placeholder="I'm interested in buying this..."
                            className="w-full px-4 py-2 rounded-lg border border-earth-200 focus:ring-2 focus:ring-forest-500 outline-none resize-none"
                          ></textarea>
                        </div>
                        <button 
                          type="submit" 
                          disabled={isSubmitting}
                          className="w-full bg-forest-700 hover:bg-forest-800 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-70 flex justify-center items-center gap-2"
                        >
                          {isSubmitting ? <span className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full"></span> : 'Send Message'}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
