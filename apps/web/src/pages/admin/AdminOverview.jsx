import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@hastkala/core';
import { Users, FileText, Package, MessageSquare, CheckCircle, Clock, XCircle, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getSafeMillis, getSafeDate } from '@hastkala/core';

const AdminOverview = () => {
  const [stats, setStats] = useState({
    totalArtisans: 0,
    activeArtisans: 0,
    pendingApplications: 0,
    rejectedApplications: 0,
    totalProducts: 0,
    totalCustomers: 0,
    totalEnquiries: 0
  });
  
  const [recentApplications, setRecentApplications] = useState([]);
  const [recentEnquiries, setRecentEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverviewData = async () => {
      setLoading(true);
      try {
        // Fetch users
        const usersSnapshot = await getDocs(collection(db, 'users'));
        let artisans = 0, active = 0, pending = 0, rejected = 0, customers = 0;
        const allApplications = [];
        
        usersSnapshot.forEach(doc => {
          const data = doc.data();
          if (data.role === 'artisan') {
            artisans++;
            if (data.status === 'active') active++;
            if (data.status === 'pending') {
              pending++;
              allApplications.push({ id: doc.id, ...data });
            }
            if (data.status === 'rejected') rejected++;
          } else if (data.role === 'customer') {
            customers++;
          }
        });

        // Sort applications by submission date
        allApplications.sort((a, b) => {
          const dateA = getSafeMillis(a.verification?.submittedAt) || 0;
          const dateB = getSafeMillis(b.verification?.submittedAt) || 0;
          return dateB - dateA;
        });

        // Fetch products
        const productsSnapshot = await getDocs(collection(db, 'products'));
        
        // Fetch enquiries
        const enquiriesSnapshot = await getDocs(collection(db, 'enquiries'));
        const allEnquiries = [];
        enquiriesSnapshot.forEach(doc => {
          allEnquiries.push({ id: doc.id, ...doc.data() });
        });
        
        allEnquiries.sort((a, b) => {
          const dateA = getSafeMillis(a.createdAt) || 0;
          const dateB = getSafeMillis(b.createdAt) || 0;
          return dateB - dateA;
        });

        setStats({
          totalArtisans: artisans,
          activeArtisans: active,
          pendingApplications: pending,
          rejectedApplications: rejected,
          totalProducts: productsSnapshot.size,
          totalCustomers: customers,
          totalEnquiries: enquiriesSnapshot.size
        });

        setRecentApplications(allApplications.slice(0, 5));
        setRecentEnquiries(allEnquiries.slice(0, 5));

      } catch (error) {
        console.error('Error fetching overview data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOverviewData();
  }, []);

  const StatCard = ({ title, value, icon: Icon, colorClass, subtitle }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-earth-200 flex items-start gap-4">
      <div className={`p-3 rounded-lg ${colorClass}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-sm font-medium text-earth-500">{title}</p>
        <h3 className="text-2xl font-bold text-earth-900 mt-1">{loading ? '-' : value}</h3>
        {subtitle && <p className="text-xs text-earth-400 mt-1">{subtitle}</p>}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-serif font-bold text-earth-900">Dashboard Overview</h1>
        <p className="text-earth-500 text-sm mt-1">Platform metrics and recent activity.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Artisans" 
          value={stats.totalArtisans} 
          icon={Users} 
          colorClass="bg-earth-100 text-earth-600"
        />
        <StatCard 
          title="Pending Approvals" 
          value={stats.pendingApplications} 
          icon={Clock} 
          colorClass="bg-yellow-100 text-yellow-600"
        />
        <StatCard 
          title="Active Artisans" 
          value={stats.activeArtisans} 
          icon={CheckCircle} 
          colorClass="bg-forest-100 text-forest-600"
        />
        <StatCard 
          title="Total Customers" 
          value={stats.totalCustomers} 
          icon={Users} 
          colorClass="bg-terracotta-100 text-terracotta-600"
        />
        <StatCard 
          title="Total Products" 
          value={stats.totalProducts} 
          icon={Package} 
          colorClass="bg-earth-100 text-earth-600"
        />
        <StatCard 
          title="Total Enquiries" 
          value={stats.totalEnquiries} 
          icon={MessageSquare} 
          colorClass="bg-blue-100 text-blue-600"
        />
        <StatCard 
          title="Rejected Apps" 
          value={stats.rejectedApplications} 
          icon={XCircle} 
          colorClass="bg-red-100 text-red-600"
        />
        <StatCard 
          title="Platform Health" 
          value="Good" 
          icon={TrendingUp} 
          colorClass="bg-forest-100 text-forest-600"
          subtitle="All systems operational"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Applications */}
        <div className="bg-white rounded-xl shadow-sm border border-earth-200 overflow-hidden">
          <div className="p-6 border-b border-earth-100 flex justify-between items-center">
            <h2 className="text-lg font-serif font-bold text-earth-900">Recent Applications</h2>
            <Link to="/admin/applications" className="text-sm font-medium text-terracotta-600 hover:text-terracotta-700">
              View All
            </Link>
          </div>
          <div className="divide-y divide-earth-100">
            {loading ? (
              <div className="p-6 text-center text-earth-500">Loading...</div>
            ) : recentApplications.length === 0 ? (
              <div className="p-6 text-center text-earth-500">No pending applications.</div>
            ) : (
              recentApplications.map(app => (
                <div key={app.id} className="p-4 flex items-center justify-between hover:bg-earth-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-earth-200 flex items-center justify-center font-serif font-bold text-earth-700 uppercase">
                      {app.name?.charAt(0) || 'A'}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-earth-900">{app.name}</p>
                      <p className="text-xs text-earth-500">{app.specialty || 'General'} • {app.location?.city || 'Unknown'}</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-yellow-50 text-yellow-700 text-[10px] font-bold uppercase tracking-wider rounded border border-yellow-200">
                    Pending
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Enquiries */}
        <div className="bg-white rounded-xl shadow-sm border border-earth-200 overflow-hidden">
          <div className="p-6 border-b border-earth-100 flex justify-between items-center">
            <h2 className="text-lg font-serif font-bold text-earth-900">Recent Enquiries</h2>
            <Link to="/admin/enquiries" className="text-sm font-medium text-terracotta-600 hover:text-terracotta-700">
              View All
            </Link>
          </div>
          <div className="divide-y divide-earth-100">
            {loading ? (
              <div className="p-6 text-center text-earth-500">Loading...</div>
            ) : recentEnquiries.length === 0 ? (
              <div className="p-6 text-center text-earth-500">No enquiries yet.</div>
            ) : (
              recentEnquiries.map(enq => (
                <div key={enq.id} className="p-4 hover:bg-earth-50">
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-bold text-sm text-earth-900">{enq.customerName || 'Customer'}</p>
                    <span className="text-xs text-earth-400">
                      {enq.createdAt && getSafeDate(enq.createdAt) ? getSafeDate(enq.createdAt).toLocaleDateString() : ''}
                    </span>
                  </div>
                  <p className="text-xs text-earth-500 truncate">{enq.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
