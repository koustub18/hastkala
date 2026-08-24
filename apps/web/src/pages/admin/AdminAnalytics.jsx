import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@hastkala/core';
import { BarChart, Activity, Users, ShoppingBag } from 'lucide-react';

const AdminAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const productsSnapshot = await getDocs(collection(db, 'products'));
        const enquiriesSnapshot = await getDocs(collection(db, 'enquiries'));

        let customers = 0;
        let activeArtisans = 0;
        let pendingArtisans = 0;
        let categories = {};

        usersSnapshot.forEach(doc => {
          const u = doc.data();
          if (u.role === 'customer') customers++;
          if (u.role === 'artisan') {
            if (u.status === 'active') activeArtisans++;
            if (u.status === 'pending') pendingArtisans++;
          }
        });

        productsSnapshot.forEach(doc => {
          const p = doc.data();
          if (p.category) {
            categories[p.category] = (categories[p.category] || 0) + 1;
          }
        });

        setData({
          customers,
          activeArtisans,
          pendingArtisans,
          totalProducts: productsSnapshot.size,
          totalEnquiries: enquiriesSnapshot.size,
          categories: Object.entries(categories).sort((a, b) => b[1] - a[1]).slice(0, 5) // top 5
        });

      } catch (error) {
        console.error("Error fetching analytics", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-earth-500">Loading Analytics...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-serif font-bold text-earth-900">Platform Analytics</h1>
        <p className="text-earth-500 text-sm mt-1">High-level statistics and SIH metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-earth-200">
          <div className="flex items-center gap-3 mb-2">
            <Users className="text-forest-600" size={20} />
            <h3 className="font-bold text-earth-900">Total Artisans</h3>
          </div>
          <p className="text-3xl font-bold text-forest-700">{data.activeArtisans + data.pendingArtisans}</p>
          <p className="text-xs text-earth-500 mt-1">{data.activeArtisans} Active, {data.pendingArtisans} Pending</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-earth-200">
          <div className="flex items-center gap-3 mb-2">
            <ShoppingBag className="text-terracotta-600" size={20} />
            <h3 className="font-bold text-earth-900">Total Products</h3>
          </div>
          <p className="text-3xl font-bold text-terracotta-700">{data.totalProducts}</p>
          <p className="text-xs text-earth-500 mt-1">Across all categories</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-earth-200">
          <div className="flex items-center gap-3 mb-2">
            <Users className="text-blue-600" size={20} />
            <h3 className="font-bold text-earth-900">Total Customers</h3>
          </div>
          <p className="text-3xl font-bold text-blue-700">{data.customers}</p>
          <p className="text-xs text-earth-500 mt-1">Registered users</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-earth-200">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="text-purple-600" size={20} />
            <h3 className="font-bold text-earth-900">Total Enquiries</h3>
          </div>
          <p className="text-3xl font-bold text-purple-700">{data.totalEnquiries}</p>
          <p className="text-xs text-earth-500 mt-1">Marketplace connections</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-earth-200">
        <div className="flex items-center gap-2 mb-6">
          <BarChart className="text-earth-500" size={20} />
          <h2 className="text-lg font-serif font-bold text-earth-900">Top Categories</h2>
        </div>
        
        {data.categories.length === 0 ? (
          <p className="text-earth-500">No categories found.</p>
        ) : (
          <div className="space-y-4">
            {data.categories.map(([cat, count], i) => {
              const percentage = Math.round((count / data.totalProducts) * 100) || 0;
              return (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-earth-900 uppercase">{cat}</span>
                    <span className="text-earth-500">{count} products ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-earth-100 rounded-full h-2">
                    <div className="bg-terracotta-500 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAnalytics;
