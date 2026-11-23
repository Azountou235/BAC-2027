'use client';

import React from 'react';
import { X, Download, Share2 } from 'lucide-react';

interface FullScreenImageViewerProps {
  isOpen: boolean;
  imageUrl: string | null;
  title?: string;
  subtitle?: string;
  onClose: () => void;
}

export const FullScreenImageViewer: React.FC<FullScreenImageViewerProps> = ({
  isOpen,
  imageUrl,
  title,
  subtitle,
  onClose,
}) => {
  if (!isOpen || !imageUrl) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${title || 'photo'}_bac_2027.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4 animate-in fade-in select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between text-white py-2 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <div>
            <h3 className="text-sm font-bold text-white truncate max-w-[200px]">
              {title || 'Photo de profil'}
            </h3>
            {subtitle && (
              <p className="text-xs text-slate-400 truncate max-w-[200px]">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <button
          onClick={handleDownload}
          className="p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
          title="Télécharger l'image"
        >
          <Download className="w-5 h-5" />
        </button>
      </div>

      {/* Centered Image with dark backdrop */}
      <div 
        className="flex-1 flex items-center justify-center p-2 cursor-pointer"
        onClick={onClose}
      >
        <img
          src={imageUrl}
          alt={title || 'Image en plein écran'}
          className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl transition-transform"
          onClick={(e) => e.stopPropagation()} // Prevent close on clicking image itself
        />
      </div>

      {/* Bottom bar */}
      <div className="py-3 text-center text-xs text-slate-500">
        Touchez l'écran pour fermer
      </div>
    </div>
  );
};
