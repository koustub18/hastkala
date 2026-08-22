import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../Navbar';
import Footer from '../Footer';

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-earth-50 text-earth-900 selection:bg-terracotta-200 selection:text-terracotta-900">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
