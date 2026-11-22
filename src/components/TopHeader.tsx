'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, WifiOff, Zap, Shield, Bell } from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface TopHeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  title = 'BAC TCHAD 2027',
  subtitle,
  showBack = false,
  onBack,
  rightAction,
}) => {
  const router = useRouter();
  const { isOffline, isLowNetworkMode, currentUser } = useApp();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 select-none">
      {/* Offline Alert Bar */}
      {isOffline && (
        <div className="bg-amber-600/90 text-white text-xs font-semibold px-3 py-1 -mt-3 -mx-4 mb-2 flex items-center justify-center gap-1.5 animate-in slide-in-from-top-1">
          <WifiOff className="w-3.5 h-3.5" />
          <span>Mode Hors Ligne — Vos messages seront envoyés dès le retour du réseau</span>
        </div>
      )}

      {/* Low network mode pill */}
      {isLowNetworkMode && !isOffline && (
        <div className="bg-teal-900/60 border border-teal-700/50 text-teal-300 text-[11px] font-medium px-2 py-0.5 -mt-2 -mx-2 mb-2 flex items-center justify-center gap-1 rounded-full">
          <Zap className="w-3 h-3 text-teal-400" />
          <span>Mode Réseau Faible actif (Économie de données)</span>
        </div>
      )}

      <div className="flex items-center justify-between max-w-5xl mx-auto">
        <div className="flex items-center gap-2.5 min-w-0">
          {showBack && (
            <button
              onClick={handleBack}
              className="p-1.5 -ml-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {!showBack && (
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center shadow-md flex-shrink-0">
              <span className="text-white font-black text-xs tracking-tighter">BAC</span>
            </div>
          )}

          <div className="truncate">
            <h1 className="text-base font-bold text-white truncate flex items-center gap-1.5">
              {title}
            </h1>
            {subtitle && <p className="text-xs text-slate-400 truncate">{subtitle}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {currentUser?.is_super_admin && (
            <Link
              href="/admin"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-blue-950/60 border border-blue-700/60 text-blue-300 hover:bg-blue-900/60 rounded-full text-xs font-semibold transition-colors"
            >
              <Shield className="w-3.5 h-3.5 text-blue-400" />
              <span>Super Admin</span>
            </Link>
          )}

          {rightAction}
        </div>
      </div>
    </header>
  );
};
