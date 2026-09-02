import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Camera, 
  ShieldCheck, 
  Plus, 
  ShoppingBag, 
  Package, 
  MessageSquare, 
  Eye, 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight, 
  Sparkles, 
  MapPin 
} from 'lucide-react';

import Navbar from '../components/Navbar';
import useArtisanDashboard from '../hooks/useArtisanDashboard';
import ProductFormModal from '../components/artisan/ProductFormModal';
import ProfileImageUploadModal from '../components/artisan/ProfileImageUploadModal';
import ProductList from '../components/artisan/ProductList';
import { getSafeDate } from '@hastkala/core';
import { resolveImageUrl } from '../utils/webImageUtils';
import { useNavigate } from 'react-router-dom';

const ArtisanDashboard = () => {
  const dashboardState = useArtisanDashboard();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState('products');
  const [imageModalState, setImageModalState] = React.useState({ isOpen: false, mode: 'profile' });

  const openImageModal = (mode) => setImageModalState({ isOpen: true, mode });
  const closeImageModal = () => setImageModalState(prev => ({ ...prev, isOpen: false }));

  useEffect(() => {
    if (dashboardState.authStatus === 'unauthenticated') {
      navigate('/login');
    }
  }, [dashboardState.authStatus, navigate]);

  if (dashboardState.isLoading) {
    return (
      <div className="min-h-screen bg-earth-50 flex items-center justify-center py-32">
        <p className="text-earth-600 animate-pulse text-xl font-serif">Loading your Dashboard...</p>
      </div>
    );
  }

  if (!dashboardState.artisan) {
    return (
      <div className="min-h-screen bg-earth-50 flex flex-col items-center justify-center py-32">
        <h2 className="text-2xl font-serif text-earth-900 mb-4">Error loading profile</h2>
        <button 
          onClick={() => window.location.reload()}
          className="bg-terracotta-600 text-white px-6 py-2 rounded font-bold"
        >
          Reload
        </button>
      </div>
    );
  }

  // --- Real Business Computations ---
  const products = dashboardState.products || [];
  const enquiries = dashboardState.enquiries || [];
  
  const totalProducts = products.length;
  const totalStock = products.reduce((acc, p) => {
    const qty = typeof p.stockQuantity === 'number' ? p.stockQuantity : parseInt(p.stockQuantity, 10);
    return acc + (isNaN(qty) ? 0 : qty);
  }, 0);
  const totalEnquiries = enquiries.length;
  const totalViews = dashboardState.artisan?.metrics?.profileViews ?? 0;

  // --- Rule-Based Alerts (What Needs Your Attention) ---
  const lowStockProducts = products.filter(p => {
    const qty = typeof p.stockQuantity === 'number' ? p.stockQuantity : parseInt(p.stockQuantity, 10);
    return !isNaN(qty) && qty <= 3;
  });

  const missingImageProducts = products.filter(p => !p.image && (!p.images || p.images.length === 0));
  const incompleteInfoProducts = products.filter(p => !p.description || !p.material);

  const alerts = [];
  if (lowStockProducts.length > 0) {
    const p = lowStockProducts[0];
    const qty = typeof p.stockQuantity === 'number' ? p.stockQuantity : parseInt(p.stockQuantity, 10);
    if (qty === 0) {
      alerts.push({ text: `"${p.title}" is out of stock. Update your quantity.`, actionTab: 'products' });
    } else {
      alerts.push({ text: `Only ${qty} pieces left for "${p.title}".`, actionTab: 'products' });
    }
  }

  if (totalEnquiries > 0) {
    alerts.push({ text: `You have ${totalEnquiries} new buyer ${totalEnquiries === 1 ? 'enquiry' : 'enquiries'} waiting for reply.`, actionTab: 'enquiries' });
  }

  if (missingImageProducts.length > 0) {
    alerts.push({ text: `"${missingImageProducts[0].title}" photo can be improved or added.`, actionTab: 'products' });
  }

  if (incompleteInfoProducts.length > 0) {
    alerts.push({ text: `"${incompleteInfoProducts[0].title}" has incomplete details.`, actionTab: 'products' });
  }

  // --- Popular Product ---
  const popularProduct = products.length > 0 ? products[0] : null;

  // --- Simple Business Advice ---
  let businessAdvice = "Adding clear photos of your handcrafted products attracts more buyers and builds trust.";
  if (lowStockProducts.length > 0) {
    businessAdvice = `Stock for "${lowStockProducts[0].title}" is low. Update stock quantity so buyers can continue purchasing!`;
  } else if (totalEnquiries > 0) {
    businessAdvice = "You have new buyer enquiries. Replying promptly improves buyer satisfaction and sales.";
  } else if (popularProduct) {
    businessAdvice = `"${popularProduct.title}" is receiving high interest. Consider adding similar items to expand your catalog!`;
  }

  return (
    <div className="min-h-screen bg-earth-50">
      <Navbar />
      
      {/* 1. ARTISAN PROFILE HEADER (Clean, Compact, Coverless, Starts cleanly below Navbar) */}
      <header className="bg-earth-900 border-b border-earth-800 pt-24 sm:pt-28 pb-8 sm:pb-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            
            {/* Profile Avatar & Details */}
            <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
              {/* Profile Photo Avatar with Edit Overlay Button */}
              <div className="relative shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-earth-700 overflow-hidden bg-earth-800 shadow-md flex items-center justify-center">
                  {dashboardState.artisan.profileImage ? (
                    <img 
                      src={resolveImageUrl(dashboardState.artisan.profileImage)} 
                      alt={dashboardState.artisan.name} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl text-earth-400 bg-earth-800">
                      👨🏽‍🎨
                    </div>
                  )}
                </div>
                <button
                  onClick={() => openImageModal('profile')}
                  className="absolute bottom-0 right-0 z-20 bg-terracotta-600 hover:bg-terracotta-500 text-white p-1.5 rounded-full border border-earth-900 shadow-md transition-transform hover:scale-105 flex items-center justify-center"
                  title="Change Profile Picture"
                >
                  <Camera size={13} />
                </button>
              </div>

              {/* Name & Details */}
              <div className="text-white">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mb-1">
                  <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight">
                    Namaste, {dashboardState.artisan.name ? `${dashboardState.artisan.name} ji` : 'Artisan ji'} 👋
                  </h1>
                  <span className="bg-forest-500/20 text-forest-300 border border-forest-500/30 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck size={12} className="text-forest-400" />
                    {dashboardState.artisan.status === 'active' ? 'Verified Artisan' : 'Verification Pending'}
                  </span>
                </div>
                <p className="text-earth-300 text-xs sm:text-sm font-medium">
                  Yahan aap apne craft business ka haal dekh sakte hain.
                </p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-xs text-earth-400 mt-2">
                  <span className="flex items-center gap-1">
                    <MapPin size={13} className="text-terracotta-400" /> {dashboardState.artisan.location || 'Location not set'}
                  </span>
                  <span>•</span>
                  <span>{dashboardState.artisan.specialty || 'Craft not set'}</span>
                  {dashboardState.artisan.upi && (
                    <>
                      <span>•</span>
                      <span className="text-earth-300 font-mono text-[11px]">UPI: {dashboardState.artisan.upi}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Primary Action Button (+ List New Product) */}
            <div className="shrink-0">
              <button
                onClick={dashboardState.openAddProductModal}
                className="bg-terracotta-600 hover:bg-terracotta-500 text-white font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl shadow-lg shadow-terracotta-900/30 flex items-center gap-2 transition-all hover:-translate-y-0.5"
              >
                <Plus size={16} /> List New Product
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* MAIN CONTENT CONTAINER */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* VERIFICATION NOTIFICATION BANNER */}
        {dashboardState.artisan.status === 'pending' && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-xl shadow-sm mb-6 flex items-center gap-3">
            <ShieldCheck size={20} className="text-yellow-600 shrink-0" />
            <div>
              <h3 className="font-bold text-sm">Verification Pending</h3>
              <p className="text-xs">Your application is currently under review by our admin team.</p>
            </div>
          </div>
        )}
        {dashboardState.artisan.status === 'active' && (
          <div className="bg-forest-50 border border-forest-200 text-forest-800 p-4 rounded-xl shadow-sm mb-6 flex items-center gap-3">
            <ShieldCheck size={20} className="text-forest-600 shrink-0" />
            <div>
              <h3 className="font-bold text-sm">Verified Artisan Account</h3>
              <p className="text-xs">Your account is active and visible to buyers across India.</p>
            </div>
          </div>
        )}
        {dashboardState.artisan.status === 'rejected' && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl shadow-sm mb-6 flex items-center gap-3">
            <ShieldCheck size={20} className="text-red-600 shrink-0" />
            <div>
              <h3 className="font-bold text-sm">Verification Needs Attention</h3>
              <p className="text-xs">Reason: {dashboardState.artisan.verification?.rejectionReason || 'Please update your profile details.'}</p>
            </div>
          </div>
        )}

        {/* 2. BUSINESS SUMMARY SECTION (4 EQUAL CARDS) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          
          <div className="bg-white rounded-xl p-4 sm:p-5 border border-earth-200 shadow-sm flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-terracotta-50 text-terracotta-600 flex items-center justify-center shrink-0 border border-terracotta-100">
              <ShoppingBag size={20} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-earth-500 uppercase tracking-wider">My Products</p>
              <p className="text-xl font-bold text-earth-900 mt-0.5">{totalProducts}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 sm:p-5 border border-earth-200 shadow-sm flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
              <Package size={20} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-earth-500 uppercase tracking-wider">My Stock</p>
              <p className="text-xl font-bold text-earth-900 mt-0.5">{totalStock}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 sm:p-5 border border-earth-200 shadow-sm flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
              <MessageSquare size={20} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-earth-500 uppercase tracking-wider">Buyer Enquiries</p>
              <p className="text-xl font-bold text-earth-900 mt-0.5">{totalEnquiries}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 sm:p-5 border border-earth-200 shadow-sm flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
              <Eye size={20} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-earth-500 uppercase tracking-wider">Product Views</p>
              <p className="text-xl font-bold text-earth-900 mt-0.5">{totalViews}</p>
            </div>
          </div>

        </div>

        {/* 3. WHAT NEEDS YOUR ATTENTION */}
        <div className="bg-white rounded-xl p-5 border border-earth-200 shadow-sm mb-8">
          <h3 className="text-xs font-bold text-earth-900 uppercase tracking-wider mb-3 flex items-center gap-2">
            <AlertCircle size={15} className="text-terracotta-600" />
            What Needs Your Attention
          </h3>

          {alerts.length > 0 ? (
            <div className="space-y-2.5">
              {alerts.map((alert, idx) => (
                <div key={idx} className="flex items-center justify-between gap-3 p-3 bg-earth-50/80 rounded-lg border border-earth-200/60 text-xs font-medium text-earth-800">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-terracotta-500 shrink-0" />
                    <span>{alert.text}</span>
                  </div>
                  {alert.actionTab && (
                    <button 
                      onClick={() => setActiveTab(alert.actionTab)}
                      className="text-terracotta-700 hover:text-terracotta-800 font-bold text-[11px] uppercase tracking-wider shrink-0 flex items-center gap-0.5"
                    >
                      View <ChevronRight size={12} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs font-medium text-forest-700 bg-forest-50/80 p-3 rounded-lg border border-forest-200/60">
              <CheckCircle2 size={15} className="text-forest-600 shrink-0" />
              <span>Everything looks good today. All products are well-stocked and up to date!</span>
            </div>
          )}
        </div>

        {/* 4. BUSINESS OVERVIEW & SIMPLE ADVICE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          
          {/* Popular Product Card */}
          {popularProduct ? (
            <div className="bg-white rounded-xl p-5 border border-earth-200 shadow-sm flex flex-col justify-between">
              <div>
                <p className="text-[11px] font-bold text-earth-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-500" />
                  Most Viewed Product
                </p>
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 bg-earth-100 rounded-lg overflow-hidden shrink-0 border border-earth-200">
                    {popularProduct.image ? (
                      <img src={resolveImageUrl(popularProduct.image)} alt={popularProduct.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-earth-400 font-medium text-[10px]">No Image</div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-earth-900 text-sm truncate">{popularProduct.title}</h4>
                    <p className="text-xs text-earth-500 mt-0.5">{popularProduct.category} • ₹{popularProduct.price}</p>
                    <p className="text-[11px] font-semibold text-emerald-700 mt-1">📦 {popularProduct.stockQuantity ?? 0} in stock</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl p-5 border border-earth-200 shadow-sm flex items-center justify-center text-xs text-earth-500 italic">
              No products listed yet. List your first product to see performance!
            </div>
          )}

          {/* Simple Advice Card */}
          <div className="bg-white rounded-xl p-5 border border-earth-200 shadow-sm flex flex-col justify-between">
            <div>
              <p className="text-[11px] font-bold text-forest-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles size={14} className="text-forest-600" />
                Simple Advice / Chhoti Si Salah
              </p>
              <p className="text-xs font-medium text-earth-700 leading-relaxed mt-1">
                {businessAdvice}
              </p>
            </div>
          </div>

        </div>

        {/* 5. CATALOG & ENQUIRIES MANAGEMENT AREA */}
        <div className="w-full">
          <div className="flex items-center gap-8 border-b border-earth-200 mb-6">
            <button
              onClick={() => setActiveTab('products')}
              className={`pb-3 text-sm uppercase tracking-wider font-bold transition-colors relative ${activeTab === 'products' ? 'text-earth-900' : 'text-earth-400 hover:text-earth-700'}`}
            >
              Your Catalog
              {activeTab === 'products' && (
                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 rounded-t-full bg-forest-600" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('enquiries')}
              className={`pb-3 text-sm uppercase tracking-wider font-bold transition-colors relative flex items-center gap-2 ${activeTab === 'enquiries' ? 'text-earth-900' : 'text-earth-400 hover:text-earth-700'}`}
            >
              Enquiries
              {dashboardState.enquiries?.length > 0 && (
                <span className={`text-[10px] py-0.5 px-2 rounded-full font-bold ${activeTab === 'enquiries' ? 'bg-forest-100 text-forest-700' : 'bg-earth-100 text-earth-600'}`}>{dashboardState.enquiries.length}</span>
              )}
              {activeTab === 'enquiries' && (
                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 rounded-t-full bg-forest-600" />
              )}
            </button>
          </div>

          {activeTab === 'products' ? (
            <ProductList 
              products={dashboardState.products} 
              startEditProduct={dashboardState.startEditProduct} 
              deleteProduct={dashboardState.deleteProduct}
              openAddProductModal={dashboardState.openAddProductModal}
            />
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-earth-200 overflow-hidden">
              {dashboardState.enquiries?.length === 0 ? (
                <div className="p-16 text-center">
                  <div className="w-12 h-12 bg-forest-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <MessageSquare size={22} className="text-forest-500" />
                  </div>
                  <h3 className="text-earth-900 font-serif text-xl mb-1">No Enquiries Yet</h3>
                  <p className="text-earth-500 text-xs max-w-sm mx-auto">When customers are interested in your handcrafted products, their direct messages will appear here.</p>
                </div>
              ) : (
                <div className="divide-y divide-earth-100">
                  {dashboardState.enquiries?.map(enquiry => (
                    <div key={enquiry._id} className="p-5 hover:bg-earth-50/50 transition-colors">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-3">
                        <div>
                          <h3 className="font-bold text-earth-900 text-base flex items-center gap-2">
                            {enquiry.customerName}
                            <span className="text-[10px] uppercase tracking-wider bg-earth-100 text-earth-600 px-2 py-0.5 rounded font-bold">Buyer</span>
                          </h3>
                          <a href={`mailto:${enquiry.customerEmail}`} className="text-xs text-forest-600 hover:underline font-medium">{enquiry.customerEmail}</a>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="text-xs text-earth-600 font-medium">
                            Interested in: <span className="font-bold text-earth-900">{enquiry.productTitle}</span>
                          </p>
                          <p className="text-[10px] text-earth-400 uppercase font-bold mt-0.5">
                            {enquiry.createdAt && getSafeDate(enquiry.createdAt) ? getSafeDate(enquiry.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent'}
                          </p>
                        </div>
                      </div>
                      <div className="bg-earth-50 p-3.5 rounded-xl border border-earth-200/60">
                        <p className="text-earth-700 italic text-xs leading-relaxed font-sans">"{enquiry.message}"</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

      </main>

      {/* MODALS */}
      <ProductFormModal 
        showModal={dashboardState.showModal}
        setShowModal={dashboardState.setShowModal}
        isEditing={dashboardState.isEditing}
        submitSuccess={dashboardState.submitSuccess}
        handleAddProduct={dashboardState.handleAddProduct}
        newProduct={dashboardState.newProduct}
        setNewProduct={dashboardState.setNewProduct}
        CATEGORIES={dashboardState.CATEGORIES}
        imageUploading={dashboardState.imageUploading}
        uploadImage={dashboardState.uploadImage}
        isSubmitting={dashboardState.isSubmitting}
      />

      <ProfileImageUploadModal
        isOpen={imageModalState.isOpen}
        onClose={closeImageModal}
        mode={imageModalState.mode}
        userUid={dashboardState.userUid}
        onSuccess={dashboardState.refetchArtisan}
      />

    </div>
  );
};

export default ArtisanDashboard;
