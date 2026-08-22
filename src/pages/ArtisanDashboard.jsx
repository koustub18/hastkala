import React from 'react';
import { motion } from 'framer-motion';
import { QrCode, Plus, ShieldAlert } from 'lucide-react';

import Navbar from '../components/Navbar';
import useArtisanDashboard from '../hooks/useArtisanDashboard';
import ProductFormModal from '../components/artisan/ProductFormModal';
import { EnquiriesCard, ImpressionsCard, ActiveListingsCard } from '../components/artisan/StatCard';
import ProductList from '../components/artisan/ProductList';

const ArtisanDashboard = () => {
  const dashboardState = useArtisanDashboard();

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

  const [activeTab, setActiveTab] = React.useState('products');

  return (
    <div className="min-h-screen bg-earth-50 pb-20">
      <Navbar />
      
      <header className="bg-earth-900 pt-32 pb-16 px-6 lg:px-12 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-96 h-96 bg-forest-900/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
         
         <div className="container mx-auto relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between">
           <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative">
                 <div className="w-24 h-24 rounded-full border-4 border-earth-800 overflow-hidden bg-earth-800">
                    {dashboardState.artisan.profileImage ? (
                      <img src={dashboardState.artisan.profileImage} alt={dashboardState.artisan.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl text-earth-500">
                        👨🏽‍🎨
                      </div>
                    )}
                 </div>
                 <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-forest-500 rounded-full border-2 border-earth-900 flex items-center justify-center">
                   <QrCode size={12} className="text-white" />
                 </div>
              </div>
              <div className="text-center md:text-left text-white mt-4 md:mt-0">
                <div className="flex items-center gap-2 justify-center md:justify-start mb-1">
                   <h1 className="text-3xl font-serif font-bold">{dashboardState.artisan.name || 'My Artisan Profile'}</h1>
                   <span className="bg-forest-500 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded flex items-center gap-1">
                     <QrCode size={10} /> {dashboardState.artisan.isVerified ? 'Verified' : 'Pending'}
                   </span>
                </div>
                <p className="text-earth-400">
                  {dashboardState.artisan.location || 'Location not set'}&nbsp;•&nbsp;{dashboardState.artisan.specialty || 'Craft not set'}
                </p>
                {dashboardState.artisan.upi && (
                  <p className="text-terracotta-400 text-sm mt-2 font-medium tracking-wide">UPI: {dashboardState.artisan.upi}</p>
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
                className="bg-terracotta-600 hover:bg-terracotta-500 text-white font-bold uppercase tracking-wider px-6 py-3 rounded shadow-lg flex items-center gap-2 transition-colors"
              >
                 <Plus size={18} /> List New Product
              </button>
            </div>
         </div>
       </header>

       <div className="container mx-auto px-6 lg:px-12 mt-[-30px] relative z-10">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
           <EnquiriesCard totalEnquiries={dashboardState.enquiries?.length || 0} />
           <ImpressionsCard profileViews={dashboardState.artisan.metrics?.profileViews || 156} />
           <ActiveListingsCard activeProducts={dashboardState.products?.length || 0} />
         </div>

         <div className="w-full mt-8">
            <div className="flex items-center gap-6 border-b border-earth-200 mb-6">
              <button
                onClick={() => setActiveTab('products')}
                className={`pb-3 text-lg font-bold font-serif transition-colors relative ${activeTab === 'products' ? 'text-earth-900' : 'text-earth-500 hover:text-earth-700'}`}
              >
                Your Live Products
                {activeTab === 'products' && (
                  <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-forest-600" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('enquiries')}
                className={`pb-3 text-lg font-bold font-serif transition-colors relative ${activeTab === 'enquiries' ? 'text-earth-900' : 'text-earth-500 hover:text-earth-700'}`}
              >
                Customer Enquiries
                {dashboardState.enquiries?.length > 0 && (
                  <span className="ml-2 bg-terracotta-100 text-terracotta-700 text-xs py-0.5 px-2 rounded-full">{dashboardState.enquiries.length}</span>
                )}
                {activeTab === 'enquiries' && (
                  <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-forest-600" />
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
              <div className="bg-white rounded-xl shadow-sm border border-earth-100 overflow-hidden">
                {dashboardState.enquiries?.length === 0 ? (
                  <div className="p-12 text-center text-earth-500">
                    <p className="text-lg font-serif">No customer enquiries yet.</p>
                    <p className="text-sm mt-2">When customers are interested in your products, their messages will appear here.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-earth-100">
                    {dashboardState.enquiries?.map(enquiry => (
                      <div key={enquiry._id} className="p-6 hover:bg-earth-50 transition-colors">
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-3">
                          <div>
                            <h3 className="font-bold text-earth-900">{enquiry.customerName}</h3>
                            <a href={`mailto:${enquiry.customerEmail}`} className="text-sm text-forest-600 hover:underline">{enquiry.customerEmail}</a>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-earth-500 bg-earth-100 px-3 py-1 rounded-full">
                              Product: <span className="font-medium text-earth-700">{enquiry.productTitle}</span>
                            </span>
                            <span className="text-xs text-earth-400">
                              {enquiry.createdAt ? new Date(enquiry.createdAt.toDate()).toLocaleDateString() : 'Recent'}
                            </span>
                          </div>
                        </div>
                        <p className="text-earth-700 bg-white border border-earth-100 p-4 rounded-lg mt-2">"{enquiry.message}"</p>
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
