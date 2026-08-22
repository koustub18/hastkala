import React from 'react';
import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';

const PendingApproval = () => {
  const clearAuth = () => {
    localStorage.removeItem('token');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-earth-50 px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-24 h-24 bg-terracotta-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock size={48} className="text-terracotta-600" />
        </div>
        <h1 className="text-3xl font-serif font-bold text-earth-900">Application Pending</h1>
        <p className="text-earth-600 leading-relaxed">
          Your artisan seller account is currently under review by our administration team. 
          We verify all seller profiles to ensure quality and authenticity on Hastkala.
        </p>
        <p className="text-sm text-earth-500">
          This usually takes 1-2 business days. We will notify you via email once approved.
        </p>
        <div className="pt-8">
          <Link onClick={clearAuth} to="/login" className="text-terracotta-600 hover:text-terracotta-700 font-medium">
            &larr; Log out and return to home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PendingApproval;
