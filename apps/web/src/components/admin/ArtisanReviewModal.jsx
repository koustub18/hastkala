import React, { useState } from 'react';
import { 
  X, CheckCircle, XCircle, FileText, Eye, ShieldCheck, MapPin, 
  Store, CreditCard, Mail, Phone, Calendar, User as UserIcon, AlertCircle 
} from 'lucide-react';
import { getSafeDate } from '@hastkala/core';
import DocumentViewerModal from './DocumentViewerModal';

const ArtisanReviewModal = ({ 
  isOpen, 
  onClose, 
  artisan, 
  onApprove, 
  onReject, 
  actionLoading 
}) => {
  const [activeDocument, setActiveDocument] = useState(null);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  if (!isOpen || !artisan) return null;

  // Extract all documents from artisan schema
  const docs = artisan.verification?.documents || {};
  const documentList = [];

  if (docs.identity || artisan.verification?.aadhaarFile || artisan.aadhaarFile) {
    documentList.push({
      id: 'identity',
      title: 'Identity Proof / Government ID',
      type: 'Aadhaar / Passport / Voter ID',
      url: docs.identity || artisan.verification?.aadhaarFile || artisan.aadhaarFile
    });
  }

  if (docs.profilePhoto || artisan.profileImage) {
    documentList.push({
      id: 'profilePhoto',
      title: 'Profile Photo',
      type: 'Artisan Verification Photo',
      url: docs.profilePhoto || artisan.profileImage
    });
  }

  if (docs.address || artisan.verification?.panFile || artisan.panFile) {
    documentList.push({
      id: 'address',
      title: 'Address / Tax Document',
      type: 'Address Proof / PAN',
      url: docs.address || artisan.verification?.panFile || artisan.panFile
    });
  }

  if (docs.certificate) {
    documentList.push({
      id: 'certificate',
      title: 'Craft Certificate',
      type: 'Handicraft / Artisan Certificate',
      url: docs.certificate
    });
  }

  const handleConfirmApprove = async () => {
    setShowApproveConfirm(false);
    await onApprove(artisan.id);
  };

  const handleConfirmReject = async () => {
    if (!rejectionReason.trim()) return;
    setShowRejectConfirm(false);
    await onReject(artisan.id, rejectionReason);
    setRejectionReason('');
  };

  const submittedDate = artisan.verification?.submittedAt || artisan.createdAt;
  const formattedDate = submittedDate && getSafeDate(submittedDate) 
    ? getSafeDate(submittedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'Recently';

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-earth-950/70 backdrop-blur-sm overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden border border-earth-200 my-auto">
          
          {/* Header */}
          <div className="bg-earth-900 text-white px-6 py-5 flex items-center justify-between border-b border-earth-800 shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-terracotta-600 flex items-center justify-center text-white font-serif font-bold text-xl uppercase shadow-md shrink-0">
                {artisan.name?.charAt(0) || 'A'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-serif text-xl font-bold text-white tracking-wide">{artisan.name}</h2>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                    artisan.status === 'active' 
                      ? 'bg-forest-500/20 text-forest-300 border-forest-500/30' 
                      : artisan.status === 'rejected'
                      ? 'bg-red-500/20 text-red-300 border-red-500/30'
                      : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                  }`}>
                    {artisan.status || 'pending'}
                  </span>
                </div>
                <p className="text-xs text-earth-300 flex items-center gap-2 mt-1">
                  <span>Applied: {formattedDate}</span>
                  <span>•</span>
                  <span>Specialty: {artisan.specialty || 'General Craft'}</span>
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-earth-400 hover:text-white bg-earth-800 hover:bg-earth-700 rounded-xl transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-earth-50/50">
            
            {/* SECTION 1 — ARTISAN INFORMATION */}
            <section className="bg-white rounded-xl p-5 border border-earth-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-earth-100 pb-3">
                <UserIcon className="text-terracotta-600" size={18} />
                <h3 className="font-serif text-base font-bold text-earth-900 uppercase tracking-wider">
                  Section 1 — Artisan Information
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-sm">
                <div>
                  <span className="text-xs font-semibold text-earth-400 uppercase tracking-wider block mb-1">Full Name</span>
                  <p className="font-medium text-earth-900 flex items-center gap-1.5">
                    <UserIcon size={14} className="text-earth-400" /> {artisan.name || 'Not provided'}
                  </p>
                </div>

                <div>
                  <span className="text-xs font-semibold text-earth-400 uppercase tracking-wider block mb-1">Phone Number</span>
                  <p className="font-medium text-earth-900 flex items-center gap-1.5">
                    <Phone size={14} className="text-earth-400" /> {artisan.phone || 'Not provided'}
                  </p>
                </div>

                <div>
                  <span className="text-xs font-semibold text-earth-400 uppercase tracking-wider block mb-1">Email Address</span>
                  <p className="font-medium text-earth-900 flex items-center gap-1.5 truncate">
                    <Mail size={14} className="text-earth-400 shrink-0" /> {artisan.email || 'Not provided'}
                  </p>
                </div>

                <div>
                  <span className="text-xs font-semibold text-earth-400 uppercase tracking-wider block mb-1">Craft / Specialty</span>
                  <p className="font-medium text-earth-900 flex items-center gap-1.5">
                    <Store size={14} className="text-earth-400" /> {artisan.specialty || 'Not specified'}
                  </p>
                </div>

                <div>
                  <span className="text-xs font-semibold text-earth-400 uppercase tracking-wider block mb-1">Location / State</span>
                  <p className="font-medium text-earth-900 flex items-center gap-1.5">
                    <MapPin size={14} className="text-earth-400" /> {artisan.location || 'Not provided'}
                  </p>
                </div>

                <div>
                  <span className="text-xs font-semibold text-earth-400 uppercase tracking-wider block mb-1">UPI ID (Payments)</span>
                  <p className="font-medium text-earth-900 flex items-center gap-1.5 font-mono">
                    <CreditCard size={14} className="text-earth-400" /> {artisan.upiId || artisan.upi || 'Not provided'}
                  </p>
                </div>
              </div>

              {artisan.verification?.rejectionReason && (
                <div className="mt-3 p-3.5 bg-red-50 border border-red-200 rounded-lg text-red-800 text-xs flex items-start gap-2">
                  <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block mb-0.5">Previous Rejection Reason:</span>
                    <p>{artisan.verification.rejectionReason}</p>
                  </div>
                </div>
              )}
            </section>

            {/* SECTION 2 — DOCUMENT REVIEW */}
            <section className="bg-white rounded-xl p-5 border border-earth-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-earth-100 pb-3">
                <FileText className="text-terracotta-600" size={18} />
                <h3 className="font-serif text-base font-bold text-earth-900 uppercase tracking-wider">
                  Section 2 — Uploaded Verification Documents
                </h3>
              </div>

              {documentList.length === 0 ? (
                <div className="p-8 text-center bg-earth-50 rounded-xl border border-dashed border-earth-300">
                  <AlertCircle className="mx-auto text-earth-400 mb-2" size={28} />
                  <p className="text-sm font-semibold text-earth-700">No documents uploaded during onboarding.</p>
                  <p className="text-xs text-earth-500 mt-1">Check if profile details are sufficient for manual review.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {documentList.map((docItem) => (
                    <div key={docItem.id} className="bg-earth-50 rounded-xl border border-earth-200 overflow-hidden flex flex-col group">
                      <div className="px-4 py-3 bg-white border-b border-earth-200 flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-xs text-earth-900">{docItem.title}</h4>
                          <span className="text-[10px] text-earth-500 uppercase tracking-wider font-semibold">{docItem.type}</span>
                        </div>
                        <span className="px-2 py-0.5 bg-terracotta-50 text-terracotta-700 text-[10px] font-bold rounded-full border border-terracotta-200">
                          Uploaded
                        </span>
                      </div>

                      {/* Large Clear Preview Image */}
                      <div className="p-4 bg-earth-900/5 flex-1 flex items-center justify-center min-h-[180px] relative overflow-hidden">
                        <img
                          src={docItem.url}
                          alt={docItem.title}
                          className="max-h-48 w-full object-contain rounded-lg shadow-sm border border-earth-200 bg-white"
                        />
                      </div>

                      {/* Inspect / View Button */}
                      <div className="p-3 bg-white border-t border-earth-200">
                        <button
                          onClick={() => setActiveDocument(docItem)}
                          className="w-full bg-earth-900 hover:bg-earth-800 text-white py-2 px-4 rounded-lg font-sans font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
                        >
                          <Eye size={15} /> Inspect / View Document
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* SECTION 3 — VERIFICATION DECISION ACTION BAR */}
          <div className="bg-white px-6 py-4 border-t border-earth-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 shadow-lg">
            <p className="text-xs text-earth-500 font-medium">
              Carefully inspect artisan info and documents before making a decision.
            </p>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowRejectConfirm(true)}
                disabled={actionLoading === artisan.id}
                className="px-5 py-2.5 border border-red-300 text-red-600 hover:bg-red-50 font-sans font-bold text-xs uppercase tracking-wider rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <XCircle size={16} /> Reject Artisan
              </button>

              <button
                onClick={() => setShowApproveConfirm(true)}
                disabled={actionLoading === artisan.id}
                className="px-6 py-2.5 bg-forest-600 hover:bg-forest-700 text-white font-sans font-bold text-xs uppercase tracking-wider rounded-xl transition-colors shadow-md hover:shadow-lg flex items-center gap-2 disabled:opacity-50"
              >
                {actionLoading === artisan.id ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <CheckCircle size={16} />
                )}
                Accept Artisan
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* DOCUMENT LIGHTBOX VIEWER */}
      {activeDocument && (
        <DocumentViewerModal
          isOpen={!!activeDocument}
          onClose={() => setActiveDocument(null)}
          documentUrl={activeDocument.url}
          documentName={activeDocument.title}
          documentType={activeDocument.type}
        />
      )}

      {/* APPROVE CONFIRMATION DIALOG */}
      {showApproveConfirm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-earth-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 border border-earth-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-forest-100 text-forest-700 mx-auto flex items-center justify-center">
              <CheckCircle size={28} />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-earth-900">Approve Artisan Account</h3>
              <p className="text-xs text-earth-600 mt-1">
                Are you sure you want to approve <strong>{artisan.name}</strong>? They will be allowed to publish listings on the marketplace.
              </p>
            </div>
            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={() => setShowApproveConfirm(false)}
                className="px-4 py-2 border border-earth-300 text-earth-700 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-earth-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmApprove}
                className="px-6 py-2 bg-forest-600 hover:bg-forest-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md"
              >
                Confirm Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT CONFIRMATION DIALOG */}
      {showRejectConfirm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-earth-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 border border-earth-200 space-y-4 text-left">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <XCircle size={22} />
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-earth-900">Reject Application</h3>
                <p className="text-xs text-earth-500">Provide a reason for rejecting {artisan.name}.</p>
              </div>
            </div>

            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Document image is unclear or missing government ID details..."
              className="w-full border border-earth-300 rounded-xl p-3 text-xs focus:ring-2 focus:ring-terracotta-500 outline-none h-24 resize-none"
            />

            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() => setShowRejectConfirm(false)}
                className="px-4 py-2 border border-earth-300 text-earth-700 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-earth-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={!rejectionReason.trim()}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md disabled:opacity-50"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ArtisanReviewModal;
