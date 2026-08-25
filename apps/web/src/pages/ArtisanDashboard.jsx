import React from 'react';
import { motion } from 'framer-motion';
import { QrCode, Plus, ShieldAlert } from 'lucide-react';

import Navbar from '../components/Navbar';
import useArtisanDashboard from '../hooks/useArtisanDashboard';
import ProductFormModal from '../components/artisan/ProductFormModal';
import { EnquiriesCard, ImpressionsCard, ActiveListingsCard } from '../components/artisan/StatCard';
import ProductList from '../components/artisan/ProductList';
import { getSafeDate } from '@hastkala/core';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const ArtisanDashboard = () => {
  const dashboardState = useArtisanDashboard();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState('products');

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
          className="bg-terracotta-600 text-white px-6 py-2 rounded"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-earth-50 pb-20">
      <Navbar />
      
      <header className="bg-earth-900 pt-32 pb-16 px-6 lg:px-12 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-forest-900/40 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
         <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-terracotta-900/20 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/3 pointer-events-none" />
         
         <div className="container mx-auto max-w-6xl relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between">
           <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative">
                 <div className="w-24 h-24 rounded-full border-4 border-earth-800 overflow-hidden bg-earth-800 shadow-xl">
                    {dashboardState.artisan.profileImage ? (
                      <img src={dashboardState.artisan.profileImage} alt={dashboardState.artisan.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl text-earth-500">
                        👨🏽‍🎨
                      </div>
                    )}
                 </div>
                 <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-forest-500 rounded-full border-2 border-earth-900 flex items-center justify-center shadow-lg">
                   <QrCode size={12} className="text-white" />
                 </div>
              </div>
              <div className="text-center md:text-left text-white mt-4 md:mt-0">
                <div className="flex flex-col md:flex-row md:items-center gap-3 justify-center md:justify-start mb-2">
                   <h1 className="text-3xl font-serif font-bold tracking-tight">{dashboardState.artisan.name || 'My Artisan Profile'}</h1>
                   <span className="bg-forest-500/20 text-forest-300 border border-forest-500/30 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1.5 self-center md:self-auto w-max">
                     <ShieldAlert size={12} /> {dashboardState.artisan.status === 'active' ? 'Verified Artisan' : 'Verification Pending'}
                   </span>
                </div>
                <p className="text-earth-400 font-medium">
                  {dashboardState.artisan.location || 'Location not set'}&nbsp;•&nbsp;{dashboardState.artisan.specialty || 'Craft not set'}
                </p>
                {dashboardState.artisan.upi && (
                  <p className="text-terracotta-400 text-xs mt-2 font-bold tracking-widest uppercase">UPI ID: <span className="text-earth-300 font-medium normal-case tracking-normal">{dashboardState.artisan.upi}</span></p>
                )}
              </div>
           </div>

           <div className="flex items-center gap-3 mt-8 md:mt-0">
               <button
                onClick={() => {
                   dashboardState.setIsEditing(false);
                   dashboardState.setNewProduct({
                     title: '', category: dashboardState.CATEGORIES[0],
                     material: '', image: '', image2: ''
                   });
                   dashboardState.setShowModal(true);
                }}
                className="bg-terracotta-600 hover:bg-terracotta-500 text-white font-bold uppercase tracking-wider text-xs px-6 py-4 rounded-xl shadow-xl shadow-terracotta-900/20 flex items-center gap-2 transition-all duration-300 hover:-translate-y-1"
              >
                 <Plus size={16} /> List New Product
              </button>
            </div>
         </div>
       </header>

       <div className="container mx-auto max-w-6xl px-6 lg:px-12 mt-[-40px] relative z-10">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
           <EnquiriesCard totalEnquiries={dashboardState.enquiries?.length || 0} />
           <ImpressionsCard profileViews={dashboardState.artisan.metrics?.profileViews || 156} />
           <ActiveListingsCard activeProducts={dashboardState.products?.length || 0} />
         </div>

         <div className="w-full mt-8">
            <div className="flex items-center gap-8 border-b border-earth-200 mb-8">
              <button
                onClick={() => setActiveTab('products')}
                className={`pb-4 text-sm uppercase tracking-wider font-bold transition-colors relative ${activeTab === 'products' ? 'text-earth-900' : 'text-earth-400 hover:text-earth-700'}`}
              >
                Your Catalog
                {activeTab === 'products' && (
                  <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 rounded-t-full bg-forest-600" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('enquiries')}
                className={`pb-4 text-sm uppercase tracking-wider font-bold transition-colors relative flex items-center gap-2 ${activeTab === 'enquiries' ? 'text-earth-900' : 'text-earth-400 hover:text-earth-700'}`}
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
              />
            ) : (
              <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-earth-200/60 overflow-hidden">
                {dashboardState.enquiries?.length === 0 ? (
                  <div className="p-16 text-center">
                    <div className="w-16 h-16 bg-forest-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ShieldAlert size={24} className="text-forest-400" />
                    </div>
                    <h3 className="text-earth-900 font-serif text-2xl mb-2">No Enquiries Yet</h3>
                    <p className="text-earth-500 max-w-sm mx-auto">When customers are interested in your handcrafted products, their direct messages will appear here.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-earth-100">
                    {dashboardState.enquiries?.map(enquiry => (
                      <div key={enquiry._id} className="p-6 hover:bg-earth-50/50 transition-colors duration-300 group">
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
                          <div>
                            <h3 className="font-bold text-earth-900 text-lg flex items-center gap-2">
                              {enquiry.customerName}
                              <span className="text-[10px] uppercase tracking-wider bg-earth-100 text-earth-600 px-2 py-0.5 rounded font-bold">Buyer</span>
                            </h3>
                            <a href={`mailto:${enquiry.customerEmail}`} className="text-sm text-forest-600 hover:text-forest-700 hover:underline font-medium mt-1 inline-block">{enquiry.customerEmail}</a>
                          </div>
                          <div className="flex flex-col md:items-end gap-2 text-right">
                            <span className="text-xs text-earth-500 font-medium">
                              Interested in: <span className="font-bold text-earth-900">{enquiry.productTitle}</span>
                            </span>
                            <span className="text-[10px] text-earth-400 uppercase tracking-wider font-bold">
                              {enquiry.createdAt && getSafeDate(enquiry.createdAt) ? getSafeDate(enquiry.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent'}
                            </span>
                          </div>
                        </div>
                        <div className="bg-earth-50/80 border border-earth-200/60 p-4 rounded-xl relative">
                          <div className="absolute top-4 left-4 text-4xl text-earth-200 font-serif leading-none">"</div>
                          <p className="text-earth-700 relative z-10 pt-2 pl-4 italic text-sm">{enquiry.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
         </div>
       </div>

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

    </div>
  );
};

export default ArtisanDashboard;
