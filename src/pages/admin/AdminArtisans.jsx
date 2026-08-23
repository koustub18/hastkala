import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import { Search, MapPin, Store, Calendar } from 'lucide-react';

const AdminArtisans = () => {
  const [artisans, setArtisans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchArtisans = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'users'), where('role', '==', 'artisan'));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Count products for each artisan (efficiently or basic)
        // Since we are not over-engineering, we'll just display the list.
        setArtisans(data);
      } catch (error) {
        console.error("Error fetching artisans", error);
      } finally {
        setLoading(false);
      }
    };
    fetchArtisans();
  }, []);

  const filteredArtisans = artisans.filter(a => 
    a.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.specialty?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-earth-900">Artisan Directory</h1>
          <p className="text-earth-500 text-sm mt-1">Manage and view all registered artisans on the platform.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-earth-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name, email, specialty..." 
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
                <th className="p-4 font-bold">Artisan</th>
                <th className="p-4 font-bold">Specialty</th>
                <th className="p-4 font-bold">Location</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold text-right">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-earth-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-earth-500">Loading artisans...</td>
                </tr>
              ) : filteredArtisans.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-earth-500">No artisans found.</td>
                </tr>
              ) : (
                filteredArtisans.map(artisan => (
                  <tr key={artisan.id} className="hover:bg-earth-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-earth-100 flex items-center justify-center font-bold text-earth-700">
                          {artisan.name?.charAt(0) || 'A'}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-earth-900">{artisan.name}</p>
                          <p className="text-xs text-earth-500">{artisan.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="flex items-center gap-1 text-sm text-earth-700"><Store size={14} className="text-earth-400" /> {artisan.specialty || '-'}</span>
                    </td>
                    <td className="p-4">
                      <span className="flex items-center gap-1 text-sm text-earth-700"><MapPin size={14} className="text-earth-400" /> {artisan.location?.city || '-'}</span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded ${
                        artisan.status === 'active' ? 'bg-forest-50 text-forest-700 border border-forest-200' :
                        artisan.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                        'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {artisan.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <span className="flex justify-end items-center gap-1 text-sm text-earth-500">
                        {artisan.createdAt ? new Date(artisan.createdAt.toMillis()).toLocaleDateString() : '-'}
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

export default AdminArtisans;
