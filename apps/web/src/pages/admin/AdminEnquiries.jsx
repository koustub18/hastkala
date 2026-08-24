import React, { useState, useEffect } from 'react';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '@hastkala/core';
import { Search, Mail, MessageSquare } from 'lucide-react';
import { getSafeMillis, getSafeDate } from '@hastkala/core';

const AdminEnquiries = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchEnquiries = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, 'enquiries'));
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        data.sort((a, b) => {
          const dateA = getSafeMillis(a.createdAt) || 0;
          const dateB = getSafeMillis(b.createdAt) || 0;
          return dateB - dateA;
        });
        setEnquiries(data);
      } catch (error) {
        console.error("Error fetching enquiries", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEnquiries();
  }, []);

  const filteredEnquiries = enquiries.filter(e => 
    e.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.message?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-earth-900">Customer Enquiries</h1>
          <p className="text-earth-500 text-sm mt-1">Monitor interactions between customers and artisans.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-earth-400" size={18} />
          <input 
            type="text" 
            placeholder="Search enquiries..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-80 pl-10 pr-4 py-2 border border-earth-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-terracotta-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-earth-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-earth-50 text-earth-500 text-xs uppercase tracking-wider border-b border-earth-200">
                <th className="p-4 font-bold">Customer</th>
                <th className="p-4 font-bold">Message</th>
                <th className="p-4 font-bold">Target</th>
                <th className="p-4 font-bold text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-earth-100">
              {loading ? (
                <tr><td colSpan="4" className="p-8 text-center text-earth-500">Loading enquiries...</td></tr>
              ) : filteredEnquiries.length === 0 ? (
                <tr><td colSpan="4" className="p-8 text-center text-earth-500">No enquiries found.</td></tr>
              ) : (
                filteredEnquiries.map(enquiry => (
                  <tr key={enquiry.id} className="hover:bg-earth-50 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-sm text-earth-900">{enquiry.customerName}</p>
                      <span className="flex items-center gap-1 text-xs text-earth-500"><Mail size={12}/> {enquiry.customerEmail}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-start gap-2">
                        <MessageSquare size={16} className="text-earth-400 shrink-0 mt-0.5" />
                        <p className="text-sm text-earth-700 max-w-sm">{enquiry.message}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-earth-100 text-earth-700 text-xs rounded border border-earth-200">
                        {enquiry.productId ? 'Product' : 'Artisan Profile'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <span className="text-sm text-earth-500">
                        {enquiry.createdAt && getSafeDate(enquiry.createdAt) ? getSafeDate(enquiry.createdAt).toLocaleString() : '-'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminEnquiries;
