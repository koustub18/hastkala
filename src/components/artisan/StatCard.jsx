import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Package } from 'lucide-react';

export const EnquiriesCard = ({ totalEnquiries }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl shadow-xl p-6 border border-earth-100 flex flex-col justify-between">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-sm font-bold uppercase tracking-wider text-earth-500">Total Enquiries</h3>
      <div className="w-10 h-10 rounded bg-green-50 flex items-center justify-center">
        <MessageCircle size={20} className="text-green-600" />
      </div>
    </div>
    <div>
      <h2 className="text-4xl font-serif font-bold text-earth-900 mb-1 flex items-center">
        {totalEnquiries || 0}
      </h2>
      <p className="text-sm text-green-600 font-medium flex items-center gap-1">
        Direct inquiries received
      </p>
    </div>
  </motion.div>
);

export const ImpressionsCard = ({ profileViews }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-earth-900 rounded-xl shadow-xl p-6 border border-earth-800 text-white flex flex-col justify-between relative overflow-hidden">
    <div className="absolute top-0 right-0 w-32 h-32 bg-terracotta-500/10 rounded-full translate-x-1/2 -translate-y-1/2" />
    <div className="flex items-center justify-between mb-4 relative z-10">
      <h3 className="text-sm font-bold uppercase tracking-wider text-earth-400">Profile Impressions</h3>
    </div>
    <div className="relative z-10">
      <p className="text-xs text-earth-400 mb-1">Catalog Impressions & Views</p>
      <h2 className="text-4xl font-serif font-bold text-terracotta-400 mb-1 flex items-center">
        {profileViews || 0}
      </h2>
    </div>
  </motion.div>
);

export const ActiveListingsCard = ({ activeProducts }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-xl shadow-xl p-6 border border-earth-100 flex flex-col justify-between">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-sm font-bold uppercase tracking-wider text-earth-500">Active Listings</h3>
      <div className="w-10 h-10 rounded bg-earth-50 flex items-center justify-center">
        <Package size={20} className="text-earth-700" />
      </div>
    </div>
    <div>
      <h2 className="text-4xl font-serif font-bold text-earth-900 mb-1">
        {activeProducts || 0}
      </h2>
      <p className="text-sm text-earth-500 font-medium flex items-center gap-1">
        Live in your catalog
      </p>
    </div>
  </motion.div>
);
