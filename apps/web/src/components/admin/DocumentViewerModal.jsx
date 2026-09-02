import React, { useState } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw, ExternalLink, Download, FileText } from 'lucide-react';

const DocumentViewerModal = ({ isOpen, onClose, documentUrl, documentName, documentType }) => {
  const [zoom, setZoom] = useState(1);

  if (!isOpen || !documentUrl) return null;

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));
  const handleReset = () => setZoom(1);

  const isPdf = documentUrl.toLowerCase().includes('.pdf') || documentType?.toLowerCase().includes('pdf');

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-earth-950/80 backdrop-blur-md">
      <div className="bg-earth-900 border border-earth-700 rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden text-white">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-earth-800 flex items-center justify-between bg-earth-900 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-terracotta-900/50 text-terracotta-400 rounded-lg border border-terracotta-700/50">
              <FileText size={20} />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-earth-100">{documentName || 'Document View'}</h3>
              <p className="text-xs text-earth-400 font-mono">{documentType || 'Verification File'}</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {!isPdf && (
              <div className="flex items-center bg-earth-800 rounded-lg p-1 border border-earth-700 mr-2">
                <button
                  onClick={handleZoomOut}
                  disabled={zoom <= 0.5}
                  className="p-1.5 hover:bg-earth-700 text-earth-300 hover:text-white rounded transition-colors disabled:opacity-30"
                  title="Zoom Out"
                >
                  <ZoomOut size={18} />
                </button>
                <span className="px-2 text-xs font-mono font-bold text-earth-300 min-w-[3.5rem] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={handleZoomIn}
                  disabled={zoom >= 3}
                  className="p-1.5 hover:bg-earth-700 text-earth-300 hover:text-white rounded transition-colors disabled:opacity-30"
                  title="Zoom In"
                >
                  <ZoomIn size={18} />
                </button>
                <button
                  onClick={handleReset}
                  className="p-1.5 hover:bg-earth-700 text-earth-300 hover:text-white rounded transition-colors ml-1 border-l border-earth-700"
                  title="Reset Zoom"
                >
                  <RotateCcw size={16} />
                </button>
              </div>
            )}

            <a
              href={documentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-earth-800 hover:bg-earth-700 text-earth-200 hover:text-white rounded-lg border border-earth-700 transition-colors flex items-center gap-1.5 text-xs font-medium"
              title="Open Original in New Tab"
            >
              <ExternalLink size={16} />
              <span className="hidden sm:inline">Open Original</span>
            </a>

            <button
              onClick={onClose}
              className="p-2 bg-earth-800 hover:bg-red-900/50 text-earth-400 hover:text-red-300 rounded-lg border border-earth-700 hover:border-red-700 transition-colors ml-2"
              title="Close Viewer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Viewport Content */}
        <div className="flex-1 bg-earth-950 p-6 overflow-auto flex items-center justify-center relative select-none">
          {isPdf ? (
            <iframe 
              src={documentUrl} 
              title={documentName}
              className="w-full h-full rounded-xl border border-earth-800 bg-white"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center overflow-auto">
              <img
                src={documentUrl}
                alt={documentName || 'Document'}
                style={{ transform: `scale(${zoom})`, transition: 'transform 0.2s ease-out' }}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl border border-earth-800 origin-center"
              />
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-earth-900 border-t border-earth-800 flex items-center justify-between text-xs text-earth-400 shrink-0">
          <span>Manual Document Inspection • Confirmed Secure View</span>
          <span>Click outside or press ESC to close</span>
        </div>
      </div>
    </div>
  );
};

export default DocumentViewerModal;
