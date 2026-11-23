'use client';

import React from 'react';
import Link from 'next/link';
import { PWAInstallBanner } from '@/components/PWAInstallBanner';
import { UserPlus, LogIn, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0b141a] text-[#e9edef] flex flex-col justify-between p-4 sm:p-6 font-sans">
      {/* Top single PWA install prompt */}
      <div className="pt-2">
        <PWAInstallBanner />
      </div>

      {/* Main Center Container */}
      <main className="flex-1 flex flex-col items-center justify-center text-center max-w-sm mx-auto w-full py-6">
        {/* Official Logo Emblem */}
        <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-[#111b21] border border-[#202c33] p-2 shadow-2xl flex items-center justify-center mb-6 overflow-hidden">
          <img
            src="/icons/logo.png"
            alt="BAC 2027"
            className="w-full h-full object-contain rounded-2xl"
          />
        </div>

        {/* Title & Slogan */}
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
          BAC 2027
        </h1>
        <p className="text-xs sm:text-sm text-[#00a884] font-medium tracking-wide mb-8">
          « Réussir ensemble ! »
        </p>

        {/* Direct Authentication Actions */}
        <div className="w-full space-y-3">
          <Link
            href="/signup"
            className="w-full py-3.5 px-6 bg-[#00a884] hover:bg-[#00c99f] active:scale-[0.98] text-[#111b21] rounded-2xl font-bold text-sm tracking-wide shadow-lg shadow-teal-950/40 transition-all flex items-center justify-center gap-2 group"
          >
            <UserPlus className="w-4 h-4" />
            <span>Créer un compte</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <Link
            href="/auth"
            className="w-full py-3.5 px-6 bg-[#111b21] hover:bg-[#202c33] active:scale-[0.98] border border-[#202c33] text-white rounded-2xl font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4 text-[#00a884]" />
            <span>Se connecter à mon compte</span>
          </Link>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="py-4 text-center text-xs text-[#8696a0] tracking-widest">
        <p>BAC 2027</p>
      </footer>
    </div>
  );
}
