import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Package } from 'lucide-react';

export const EnquiriesCard = ({ totalEnquiries }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-6 border border-earth-200/60 flex flex-col justify-between group">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-xs font-bold uppercase tracking-widest text-earth-500 group-hover:text-terracotta-600 transition-colors">Total Enquiries</h3>
      <div className="w-10 h-10 rounded-full bg-forest-50 flex items-center justify-center border border-forest-100">
        <MessageCircle size={18} className="text-forest-600" />
      </div>
    </div>
    <div>
      <h2 className="text-4xl font-serif font-bold text-earth-900 mb-1 flex items-center">
        {totalEnquiries || 0}
      </h2>
      <p className="text-xs text-forest-600 font-medium flex items-center gap-1 uppercase tracking-wider">
        Direct inquiries received
      </p>
    </div>
  </motion.div>
);

export const ImpressionsCard = ({ profileViews }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-earth-900 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 p-6 border border-earth-800 text-white flex flex-col justify-between relative overflow-hidden group">
    <div className="absolute top-0 right-0 w-32 h-32 bg-terracotta-500/20 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2 group-hover:bg-terracotta-500/30 transition-colors" />
    <div className="flex items-center justify-between mb-4 relative z-10">
      <h3 className="text-xs font-bold uppercase tracking-widest text-earth-400 group-hover:text-white transition-colors">Profile Impressions</h3>
    </div>
    <div className="relative z-10">
      <p className="text-[10px] uppercase tracking-wider text-earth-400 mb-2 font-medium">Catalog Impressions & Views</p>
      <h2 className="text-4xl font-serif font-bold text-terracotta-400 mb-1 flex items-center">
        {profileViews || 0}
      </h2>
    </div>
  </motion.div>
);

export const ActiveListingsCard = ({ activeProducts }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-6 border border-earth-200/60 flex flex-col justify-between group">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-xs font-bold uppercase tracking-widest text-earth-500 group-hover:text-terracotta-600 transition-colors">Active Listings</h3>
      <div className="w-10 h-10 rounded-full bg-earth-50 flex items-center justify-center border border-earth-200">
        <Package size={18} className="text-earth-700" />
      </div>
    </div>
    <div>
      <h2 className="text-4xl font-serif font-bold text-earth-900 mb-1">
        {activeProducts || 0}
      </h2>
      <p className="text-xs text-earth-500 font-medium flex items-center gap-1 uppercase tracking-wider">
        Live in your catalog
      </p>
    </div>
  </motion.div>
);
