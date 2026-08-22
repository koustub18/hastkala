import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import Navbar from '../Navbar';

// You could have a specialized Seller Navbar here, but using the default for now
const SellerLayout = () => {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-earth-50 text-earth-900 selection:bg-terracotta-200 selection:text-terracotta-900">
      {/* Seller Specific Navigation could override standard here */}
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      {/* No public footer for seller dashboard usually, just solid workspace */}
      <footer className="py-4 text-center text-sm text-earth-500 border-t border-earth-200">
        Hastkala Seller Dashboard &copy; 2026
      </footer>
    </div>
  );
};

export default SellerLayout;
