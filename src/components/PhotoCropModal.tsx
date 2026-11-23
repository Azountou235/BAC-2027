'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Check, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';

interface PhotoCropModalProps {
  imageSrc: string;
  onCropComplete: (croppedBase64: string) => void;
  onCancel: () => void;
}

export const PhotoCropModal: React.FC<PhotoCropModalProps> = ({
  imageSrc,
  onCropComplete,
  onCancel,
}) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPosition({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => setIsDragging(false);

  const handleSaveCrop = () => {
    if (!imgRef.current) return;
    const canvas = document.createElement('canvas');
    const size = 400; // Output avatar size 400x400
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill with black background
    ctx.fillStyle = '#111b21';
    ctx.fillRect(0, 0, size, size);

    // Save and translate to center
    ctx.save();
    ctx.translate(size / 2, size / 2);
    ctx.rotate((rotation * Math.PI) / 180);

    // Calculate scaling
    const img = imgRef.current;
    const baseScale = Math.max(size / img.naturalWidth, size / img.naturalHeight);
    const finalScale = baseScale * zoom;

    const drawW = img.naturalWidth * finalScale;
    const drawH = img.naturalHeight * finalScale;

    ctx.drawImage(
      img,
      -drawW / 2 + position.x * (size / 280),
      -drawH / 2 + position.y * (size / 280),
      drawW,
      drawH
    );
    ctx.restore();

    const cropped = canvas.toDataURL('image/jpeg', 0.9);
    onCropComplete(cropped);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4 font-sans select-none animate-in fade-in">
      {/* Top bar */}
      <div className="flex items-center justify-between text-white py-2">
        <button
          onClick={onCancel}
          className="p-2 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        <span className="text-sm font-semibold tracking-wide">Recadrer la photo</span>
        <button
          onClick={() => setRotation((r) => (r + 90) % 360)}
          className="p-2 text-slate-400 hover:text-white transition-colors"
          title="Faire pivoter"
        >
          <RotateCw className="w-5 h-5" />
        </button>
      </div>

      {/* Crop Workspace Container */}
      <div 
        className="relative flex-1 flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Invisible Image for measurement */}
        <img
          ref={imgRef}
          src={imageSrc}
          alt="Source"
          className="hidden"
          onLoad={() => {
            // initial center
            setPosition({ x: 0, y: 0 });
          }}
        />

        {/* Dynamic Display Element */}
        <div
          className="absolute transition-transform duration-75 pointer-events-none"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
          }}
        >
          <img
            src={imageSrc}
            alt="Aperçu recadrage"
            className="max-w-[280px] max-h-[280px] object-contain"
            draggable={false}
          />
        </div>

        {/* Circular Mask Overlay (WhatsApp style) */}
        <div className="pointer-events-none absolute w-[260px] h-[260px] rounded-full border-2 border-white/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.7)] flex items-center justify-center">
          <div className="w-full h-full rounded-full border border-dashed border-white/40" />
        </div>
      </div>

      {/* Controls & Validation */}
      <div className="w-full max-w-sm mx-auto space-y-4 pb-4">
        {/* Zoom Slider */}
        <div className="flex items-center gap-3 px-4">
          <ZoomOut className="w-4 h-4 text-slate-400" />
          <input
            type="range"
            min="0.8"
            max="3"
            step="0.05"
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="flex-1 accent-[#00a884] h-1.5 bg-[#202c33] rounded-lg cursor-pointer"
          />
          <ZoomIn className="w-4 h-4 text-slate-400" />
        </div>

        {/* Actions buttons */}
        <div className="flex items-center justify-between gap-3 px-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 px-4 rounded-xl bg-[#202c33] hover:bg-[#2a3942] text-white text-xs font-bold transition-all text-center"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSaveCrop}
            className="flex-1 py-3 px-4 rounded-xl bg-[#00a884] hover:bg-[#00c99f] active:scale-95 text-[#111b21] text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-lg"
          >
            <Check className="w-4 h-4" />
            <span>Définir comme photo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
