import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { 
  CheckCircle, XCircle, Clock, MapPin, Store, Eye, Search, Filter, ShieldCheck, UserCheck 
} from 'lucide-react';
import { getSafeMillis, getSafeDate } from '@hastkala/core';
import { getPendingArtisans, approveArtisan, rejectArtisan, getActiveArtisans } from '@hastkala/core';
import ArtisanReviewModal from '../../components/admin/ArtisanReviewModal';

const AdminApplications = () => {
  const [artisans, setArtisans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); // pending, active, rejected
  const [selectedArtisanForReview, setSelectedArtisanForReview] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchArtisans = async () => {
    setLoading(true);
    try {
      const pending = await getPendingArtisans();
      const activeOrRejected = await getActiveArtisans();
      const all = [...pending, ...activeOrRejected];
      
      all.sort((a, b) => {
        const dateA = getSafeMillis(a.verification?.submittedAt) || getSafeMillis(a.createdAt) || 0;
        const dateB = getSafeMillis(b.verification?.submittedAt) || getSafeMillis(b.createdAt) || 0;
        return dateB - dateA;
      });

      setArtisans(all);
    } catch (error) {
      console.error('Error fetching artisans:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArtisans();
  }, []);

  const handleApprove = async (artisanId) => {
    setActionLoading(artisanId);
    try {
      await approveArtisan(artisanId);
      toast.success('Artisan approved successfully!');
      setSelectedArtisanForReview(null);
      await fetchArtisans();
    } catch (error) {
      console.error('Error approving artisan:', error);
      toast.error('Failed to approve artisan');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (artisanId, reason) => {
    setActionLoading(artisanId);
    try {
      await rejectArtisan(artisanId, reason || 'Does not meet our community standards.');
      toast.success('Artisan application rejected.');
      setSelectedArtisanForReview(null);
      await fetchArtisans();
    } catch (error) {
      console.error('Error rejecting artisan:', error);
      toast.error('Failed to reject artisan');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredArtisans = artisans.filter(a => {
    const matchesStatus = a.status === activeTab;
    const searchLower = searchTerm.toLowerCase().trim();
    const matchesSearch = !searchLower || 
      a.name?.toLowerCase().includes(searchLower) || 
      a.email?.toLowerCase().includes(searchLower) || 
      a.specialty?.toLowerCase().includes(searchLower) ||
      a.location?.toLowerCase().includes(searchLower);

    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending': 
        return (
          <span className="px-3 py-1 bg-yellow-50 text-yellow-700 text-xs font-bold uppercase tracking-wider rounded-full border border-yellow-200 flex items-center gap-1">
            <Clock size={13} /> Pending Review
          </span>
        );
      case 'active': 
        return (
          <span className="px-3 py-1 bg-forest-50 text-forest-700 text-xs font-bold uppercase tracking-wider rounded-full border border-forest-200 flex items-center gap-1">
            <CheckCircle size={13} /> Verified
          </span>
        );
      case 'rejected': 
        return (
          <span className="px-3 py-1 bg-red-50 text-red-700 text-xs font-bold uppercase tracking-wider rounded-full border border-red-200 flex items-center gap-1">
            <XCircle size={13} /> Rejected
          </span>
        );
      default: return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-earth-200 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="text-terracotta-600" size={24} />
            <h2 className="text-2xl font-serif font-bold text-earth-900">ARTISAN VERIFICATION</h2>
          </div>
          <p className="text-earth-500 text-sm">
            Manually review artisan onboarding details and uploaded identity documents before approving or rejecting.
          </p>
        </div>
        
        {/* Status Filter Tabs */}
        <div className="flex border border-earth-200 rounded-xl overflow-hidden bg-earth-50 p-1 shrink-0">
          {['pending', 'active', 'rejected'].map(tab => {
            const count = artisans.filter(a => a.status === tab).length;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-xs font-sans font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-2 ${
                  activeTab === tab 
                    ? 'bg-white shadow-sm text-earth-900 border border-earth-200' 
                    : 'text-earth-500 hover:text-earth-800'
                }`}
              >
                <span className="capitalize">{tab}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                  activeTab === tab ? 'bg-terracotta-100 text-terracotta-700' : 'bg-earth-200 text-earth-600'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="bg-white p-4 rounded-xl border border-earth-200 shadow-sm flex items-center gap-3">
        <Search size={18} className="text-earth-400 shrink-0" />
        <input
          type="text"
          placeholder="Search artisan by name, email, specialty, or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-sm outline-none bg-transparent text-earth-900 placeholder-earth-400"
        />
        {searchTerm && (
          <button onClick={() => setSearchTerm('')} className="text-xs text-earth-400 hover:text-earth-700">Clear</button>
        )}
      </div>

      {/* Applications List */}
      {loading ? (
        <div className="flex items-center justify-center h-64 bg-white rounded-2xl border border-earth-200">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-terracotta-600"></div>
        </div>
      ) : filteredArtisans.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl shadow-sm border border-earth-200 text-center">
          <UserCheck size={36} className="mx-auto text-earth-400 mb-3" />
          <h3 className="text-lg font-serif font-bold text-earth-900 mb-1">No {activeTab} artisans found</h3>
          <p className="text-earth-500 text-sm">
            {searchTerm ? 'Try adjusting your search criteria.' : `There are no ${activeTab} artisan applications to review.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredArtisans.map(artisan => {
            const dateObj = artisan.verification?.submittedAt || artisan.createdAt;
            const formattedDate = dateObj && getSafeDate(dateObj) 
              ? getSafeDate(dateObj).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
              : 'Recently';

            return (
              <div 
                key={artisan.id} 
                className="bg-white rounded-2xl p-5 shadow-sm border border-earth-200 hover:border-earth-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-5 group"
              >
                {/* Artisan Summary Info */}
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-earth-100 border border-earth-200 overflow-hidden flex items-center justify-center shrink-0 shadow-inner">
                    {artisan.profileImage ? (
                      <img src={artisan.profileImage} alt={artisan.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-serif font-bold text-xl text-earth-700 uppercase">
                        {artisan.name?.charAt(0) || 'A'}
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2.5 mb-1">
                      <h3 className="font-serif text-lg font-bold text-earth-900">{artisan.name || 'Unnamed Artisan'}</h3>
                      {getStatusBadge(artisan.status)}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-earth-500">
                      <span className="flex items-center gap-1">
                        <Store size={13} className="text-terracotta-600" /> {artisan.specialty || 'General Craft'}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin size={13} className="text-earth-400" /> {artisan.location || 'Location not set'}
                      </span>
                      <span>•</span>
                      <span>Applied: {formattedDate}</span>
                    </div>

                    <p className="text-xs text-earth-400 font-mono mt-1">
                      {artisan.email || 'No Email'} {artisan.phone ? `• ${artisan.phone}` : ''}
                    </p>
                  </div>
                </div>

                {/* Primary Action Button: REVIEW */}
                <div className="shrink-0 flex items-center gap-3 border-t md:border-t-0 pt-3 md:pt-0 border-earth-100">
                  <button
                    onClick={() => setSelectedArtisanForReview(artisan)}
                    className="w-full md:w-auto bg-earth-900 hover:bg-earth-800 text-white font-sans font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <Eye size={16} /> REVIEW APPLICATION
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DEDICATED ARTISAN REVIEW MODAL */}
      {selectedArtisanForReview && (
        <ArtisanReviewModal
          isOpen={!!selectedArtisanForReview}
          onClose={() => setSelectedArtisanForReview(null)}
          artisan={selectedArtisanForReview}
          onApprove={handleApprove}
          onReject={handleReject}
          actionLoading={actionLoading}
        />
      )}
    </div>
  );
};

export default AdminApplications;
