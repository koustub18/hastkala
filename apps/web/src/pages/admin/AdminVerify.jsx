import React, { useState, useEffect } from 'react';
import { auth } from '@hastkala/core';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Clock, MapPin, Store, CreditCard, ChevronDown, ChevronUp } from 'lucide-react';
import { getSafeMillis } from '@hastkala/core';
import { getPendingArtisans, approveArtisan, rejectArtisan } from '@hastkala/core';

const AdminVerify = () => {
  const [artisans, setArtisans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [rejectionState, setRejectionState] = useState({ isOpen: false, artisanId: null, reason: '' });

  const fetchPendingArtisans = async () => {
    setLoading(true);
    try {
      const pendingArtisans = await getPendingArtisans();
      setArtisans(pendingArtisans);
    } catch (error) {
      console.error('Error fetching artisans:', error);
      toast.error('Failed to load pending artisans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingArtisans();
  }, []);

  const handleApprove = async (artisanId) => {
    setActionLoading(artisanId);
    try {
      await approveArtisan(artisanId);
      
      toast.success('Artisan approved successfully!');
      setArtisans(prev => prev.filter(a => a.id !== artisanId));
    } catch (error) {
      console.error('Error approving artisan:', error);
      toast.error('Failed to approve artisan');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectClick = (artisanId) => {
    setRejectionState({ isOpen: true, artisanId, reason: '' });
  };

  const confirmReject = async () => {
    if (!rejectionState.reason.trim()) {
      toast.error('Please enter a rejection reason.');
      return;
    }
    
    setActionLoading(rejectionState.artisanId);
    try {
      await rejectArtisan(rejectionState.artisanId, rejectionState.reason || 'Does not meet our community standards.');
      
      toast.success('Artisan rejected.');
      setArtisans(prev => prev.filter(a => a.id !== rejectionState.artisanId));
      setRejectionState({ isOpen: false, artisanId: null, reason: '' });
    } catch (error) {
      console.error('Error rejecting artisan:', error);
      toast.error('Failed to reject artisan');
    } finally {
      setActionLoading(null);
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-terracotta-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-earth-200">
        <h2 className="text-xl font-serif font-bold text-earth-900 mb-2">Pending Verifications</h2>
        <p className="text-earth-500 text-sm">Review and approve artisan applications to allow them to sell on Hastkala.</p>
      </div>

      {artisans.length === 0 ? (
        <div className="bg-white p-12 rounded-xl shadow-sm border border-earth-200 text-center">
          <CheckCircle className="w-12 h-12 text-forest-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-earth-900 mb-2">All Caught Up!</h3>
          <p className="text-earth-500">There are no pending artisan applications to review at this time.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {artisans.map(artisan => (
            <div key={artisan.id} className="bg-white rounded-xl shadow-sm border border-earth-200 overflow-hidden">
              {/* Header / Summary row */}
              <div 
                className="p-5 flex flex-col md:flex-row md:items-center justify-between cursor-pointer hover:bg-earth-50 transition-colors gap-4"
                onClick={() => toggleExpand(artisan.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-terracotta-100 flex items-center justify-center text-terracotta-700 font-serif font-bold text-lg uppercase shrink-0">
                    {artisan.name?.charAt(0) || 'A'}
                  </div>
                  <div>
                    <h3 className="font-bold text-earth-900">{artisan.name}</h3>
                    <div className="flex items-center gap-3 text-sm text-earth-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Store size={14} /> {artisan.specialty || 'General'}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={14} /> {artisan.location?.city || 'Unknown Location'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 self-start md:self-auto ml-16 md:ml-0">
                  <span className="px-3 py-1 bg-yellow-50 text-yellow-700 text-xs font-bold uppercase tracking-wider rounded-full flex items-center gap-1 border border-yellow-200">
                    <Clock size={12} /> Pending
                  </span>
                  <button className="text-earth-400 hover:text-earth-700 p-1">
                    {expandedId === artisan.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedId === artisan.id && (
                <div className="border-t border-earth-100 p-5 bg-earth-50/50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    {/* Artisan Info */}
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-xs font-bold text-earth-400 uppercase tracking-wider mb-3">Artisan Details</h4>
                        <div className="bg-white p-4 rounded border border-earth-200 space-y-3">
                          <div>
                            <span className="text-xs text-earth-500 block mb-1">Full Name</span>
                            <span className="font-medium text-earth-900">{artisan.name}</span>
                          </div>
                          <div>
                            <span className="text-xs text-earth-500 block mb-1">Email Address</span>
                            <span className="font-medium text-earth-900">{artisan.email}</span>
                          </div>
                          <div>
                            <span className="text-xs text-earth-500 block mb-1">Phone Number</span>
                            <span className="font-medium text-earth-900">{artisan.phone || 'Not provided'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Business Info */}
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-xs font-bold text-earth-400 uppercase tracking-wider mb-3">Business Details</h4>
                        <div className="bg-white p-4 rounded border border-earth-200 space-y-3">
                          <div>
                            <span className="text-xs text-earth-500 block mb-1">Craft Specialty</span>
                            <span className="font-medium text-earth-900">{artisan.specialty || 'Not specified'}</span>
                          </div>
                          <div>
                            <span className="text-xs text-earth-500 block mb-1">Location</span>
                            <span className="font-medium text-earth-900">
                              {artisan.location ? `${artisan.location.city}, ${artisan.location.state}, ${artisan.location.pincode}` : 'Not provided'}
                            </span>
                          </div>
                          <div>
                            <span className="text-xs text-earth-500 block mb-1">UPI ID (For Payments)</span>
                            <div className="flex items-center gap-2">
                              <CreditCard size={14} className="text-earth-400" />
                              <span className="font-medium text-earth-900">{artisan.upiId || 'Not provided'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 justify-end pt-4 border-t border-earth-200">
                      <button
                        onClick={() => handleRejectClick(artisan.id)}
                        disabled={actionLoading === artisan.id}
                      className="px-4 py-2 border border-red-200 text-red-600 font-medium rounded hover:bg-red-50 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      <XCircle size={16} />
                      Reject
                    </button>
                    <button 
                      onClick={() => handleApprove(artisan.id)}
                      disabled={actionLoading === artisan.id}
                      className="px-6 py-2 bg-forest-600 text-white font-medium rounded hover:bg-forest-700 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
                    >
                      {actionLoading === artisan.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <CheckCircle size={16} />
                      )}
                      Approve Artisan
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {/* Rejection Modal */}
      {rejectionState.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-earth-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-6">
              <h3 className="font-serif text-xl font-bold text-earth-900 mb-2">Reject Application</h3>
              <p className="text-sm text-earth-500 mb-4">Please provide a reason for rejecting this application.</p>
              <textarea 
                className="w-full border border-earth-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-500 resize-none h-24"
                placeholder="Reason for rejection..."
                value={rejectionState.reason}
                onChange={(e) => setRejectionState({ ...rejectionState, reason: e.target.value })}
              ></textarea>
            </div>
            <div className="bg-earth-50 p-4 border-t border-earth-100 flex justify-end gap-3">
              <button 
                onClick={() => setRejectionState({ isOpen: false, artisanId: null, reason: '' })}
                className="px-4 py-2 text-earth-600 hover:bg-earth-100 rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmReject}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
              >
                Reject Application
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVerify;
