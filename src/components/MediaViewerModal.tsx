'use client';

import React, { useState } from 'react';
import { X, Download, ZoomIn, ZoomOut } from 'lucide-react';

interface MediaViewerModalProps {
  url: string;
  type: 'image' | 'video';
  fileName?: string;
  onClose: () => void;
}

export const MediaViewerModal: React.FC<MediaViewerModalProps> = ({
  url,
  type,
  fileName = 'fichier',
  onClose,
}) => {
  const [zoom, setZoom] = useState(1);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.3, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.3, 0.6));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in duration-200">
      {/* Top action bar */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-white z-10">
        <span className="text-sm font-medium truncate max-w-[200px] sm:max-w-md opacity-80">
          {fileName}
        </span>
        <div className="flex items-center gap-3">
          {type === 'image' && (
            <>
              <button
                onClick={handleZoomIn}
                className="p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-white transition-colors"
                title="Agrandir"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
              <button
                onClick={handleZoomOut}
                className="p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-white transition-colors"
                title="Rétrécir"
              >
                <ZoomOut className="w-5 h-5" />
              </button>
            </>
          )}
          <a
            href={url}
            download={fileName}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-white transition-colors"
            title="Télécharger"
          >
            <Download className="w-5 h-5" />
          </a>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800/80 hover:bg-red-600 text-white transition-colors"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative max-w-full max-h-[85vh] flex items-center justify-center overflow-auto">
        {type === 'image' ? (
          <img
            src={url}
            alt={fileName}
            style={{ transform: `scale(${zoom})`, transition: 'transform 0.15s ease-out' }}
            className="max-h-[80vh] max-w-full object-contain select-none rounded-lg shadow-2xl"
          />
        ) : (
          <video
            src={url}
            controls
            autoPlay
            className="max-h-[80vh] max-w-full rounded-lg shadow-2xl"
          />
        )}
      </div>
    </div>
  );
};
