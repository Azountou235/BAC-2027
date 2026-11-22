'use client';

import React from 'react';
import Link from 'next/link';
import { PWAInstallBanner } from '@/components/PWAInstallBanner';
import { ArrowRight, BookOpen, ShieldCheck, Users, Sparkles, Phone, MessageSquare } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();
  const { loginAsSeigneur } = useApp();

  const handleEnterAsSeigneur = () => {
    loginAsSeigneur();
    router.push('/app/chats');
  };

  return (
    <div className="min-h-screen bg-[#0b141a] text-[#e9edef] flex flex-col justify-between selection:bg-[#00a884] font-sans">
      <PWAInstallBanner />

      {/* Main Content Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-6 text-center max-w-lg mx-auto w-full">
        {/* Animated App Emblem with Official Logo */}
        <div className="relative mb-5 group">
          <div className="absolute -inset-1.5 bg-gradient-to-r from-[#00a884] to-[#25d366] rounded-3xl blur-lg opacity-40 group-hover:opacity-75 transition duration-500 animate-pulse" />
          <div className="relative w-24 h-24 rounded-2xl bg-[#111b21] border-2 border-[#00a884]/40 p-1 shadow-2xl flex items-center justify-center overflow-hidden">
            <img src="/icons/logo.png" alt="BAC SESSION 2027" className="w-full h-full object-cover rounded-xl" />
          </div>
        </div>

        {/* Chadian Flag Accent Ribbon */}
        <div className="flex items-center gap-1.5 mb-3">
          <span className="w-5 h-1.5 rounded-full bg-[#002664]" />
          <span className="w-5 h-1.5 rounded-full bg-[#FECB00]" />
          <span className="w-5 h-1.5 rounded-full bg-[#C60C30]" />
        </div>

        {/* Title & Slogan */}
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-1">
          BAC TCHAD <span className="text-[#00a884]">2027</span>
        </h1>
        <p className="text-sm text-[#00a884] font-medium tracking-wide mb-2">
          « Ensemble vers le BAC 2027. »
        </p>
        <p className="text-xs text-[#8696a0] max-w-xs leading-relaxed mb-6">
          La messagerie communautaire officielle style WhatsApp pour les révisions du baccalauréat au Tchad.
        </p>

        {/* Super Admin Direct Access Card */}
        <div className="w-full mb-6 bg-gradient-to-r from-[#103629] via-[#111b21] to-[#103629] border border-[#00a884]/50 rounded-3xl p-4 shadow-xl text-left">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#00a884] uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00a884]" />
              Super Administrateur Certifié
            </span>
            <span className="text-[10px] bg-[#00a884]/20 text-[#00a884] px-2 py-0.5 rounded-full font-bold">
              Officiel
            </span>
          </div>

          <div className="mt-1 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1">
                <span>LE SEIGNEUR</span>
                <ShieldCheck className="w-4 h-4 text-[#00a884]" />
              </h3>
              <p className="text-[11px] text-[#8696a0] flex items-center gap-1">
                <Phone className="w-3 h-3 text-[#00a884]" />
                <span className="text-white font-mono font-bold">+235 91 23 45 68</span> (Visible)
              </p>
            </div>

            <button
              onClick={handleEnterAsSeigneur}
              className="px-3.5 py-2 bg-[#00a884] hover:bg-[#00c99f] active:scale-95 text-[#111b21] rounded-xl text-xs font-bold transition-all shadow flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              <span>Ouvrir l'app</span>
            </button>
          </div>
        </div>

        {/* Highlights Cards */}
        <div className="grid grid-cols-3 gap-2 w-full mb-6 text-left">
          <div className="bg-[#111b21] border border-[#202c33] rounded-2xl p-2.5 flex flex-col items-center text-center">
            <Users className="w-4 h-4 text-[#00a884] mb-1" />
            <span className="text-[11px] font-bold text-white">Séries A4, D, C</span>
            <span className="text-[10px] text-[#8696a0]">Groupes dédiés</span>
          </div>
          <div className="bg-[#111b21] border border-[#202c33] rounded-2xl p-2.5 flex flex-col items-center text-center">
            <BookOpen className="w-4 h-4 text-[#ffd279] mb-1" />
            <span className="text-[11px] font-bold text-white">Fichiers & Vocaux</span>
            <span className="text-[10px] text-[#8696a0]">Comme WhatsApp</span>
          </div>
          <div className="bg-[#111b21] border border-[#202c33] rounded-2xl p-2.5 flex flex-col items-center text-center">
            <ShieldCheck className="w-4 h-4 text-[#53bdeb] mb-1" />
            <span className="text-[11px] font-bold text-white">100% Sécurisé</span>
            <span className="text-[10px] text-[#8696a0]">Numéros protégés</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full space-y-2.5">
          <Link
            href="/app/chats"
            className="w-full py-3.5 px-6 bg-[#00a884] hover:bg-[#00c99f] active:scale-98 text-[#111b21] rounded-2xl font-bold text-sm tracking-wide shadow-xl shadow-teal-950/60 transition-all flex items-center justify-center gap-2 group"
          >
            <MessageSquare className="w-4 h-4 fill-current" />
            <span>Accéder aux Discussions WhatsApp</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/telecharger"
            className="w-full py-3 px-6 bg-[#111b21] hover:bg-[#202c33] active:scale-98 border border-[#202c33] text-[#00a884] rounded-2xl font-medium text-xs transition-all flex items-center justify-center gap-1.5"
          >
            <span>Guide d'installation Android & iPhone (PWA/APK)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-3 text-center text-[11px] text-[#8696a0] border-t border-[#202c33]/60">
        <p>République du Tchad • Éducation & Réussite 2027</p>
      </footer>
    </div>
  );
}
