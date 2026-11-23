'use client';

import React from 'react';
import Link from 'next/link';
import { PWAInstallBanner } from '@/components/PWAInstallBanner';
import { 
  ArrowRight, 
  BookOpen, 
  ShieldCheck, 
  Users, 
  Sparkles, 
  GraduationCap, 
  UserPlus, 
  LogIn, 
  Download,
  MessageSquare,
  CheckCircle2,
  Cpu
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function LandingPage() {
  const { currentUser, isAuthenticated } = useApp();

  return (
    <div className="min-h-screen bg-[#070e17] text-[#e9edef] flex flex-col justify-between selection:bg-[#00a884] selection:text-white font-sans relative overflow-x-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[350px] bg-gradient-to-b from-[#003b8e]/25 via-[#00a884]/15 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-[400px] right-[-100px] w-[300px] h-[300px] bg-[#fbbf24]/10 blur-3xl pointer-events-none -z-10" />

      {/* Modern Top Header */}
      <header className="w-full border-b border-[#1b2b3a]/70 backdrop-blur-md bg-[#070e17]/80 sticky top-0 z-50 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#002664] to-[#0052cc] p-0.5 shadow-md flex items-center justify-center overflow-hidden border border-[#fbbf24]/40">
            <img src="/icons/logo.png" alt="BAC 2027" className="w-full h-full object-cover rounded-[10px]" />
          </div>
          <div>
            <span className="font-extrabold tracking-wider text-sm sm:text-base text-white flex items-center gap-1.5">
              BAC TCHAD <span className="text-[#fbbf24]">2027</span>
            </span>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-1 rounded-full bg-[#002664]" />
              <span className="w-2.5 h-1 rounded-full bg-[#FECB00]" />
              <span className="w-2.5 h-1 rounded-full bg-[#C60C30]" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isAuthenticated && currentUser ? (
            <Link
              href="/app/chats"
              className="px-4 py-2 bg-[#00a884] hover:bg-[#00c99f] active:scale-95 text-[#070e17] rounded-xl text-xs font-bold transition-all shadow-md shadow-[#00a884]/20 flex items-center gap-1.5"
            >
              <span>Mon Espace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/auth"
                className="px-3.5 py-1.5 bg-[#122131] hover:bg-[#182c42] active:scale-95 text-[#e9edef] border border-[#223952] rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5 text-[#00a884]" />
                <span>Connexion</span>
              </Link>
              <Link
                href="/signup"
                className="px-3.5 py-1.5 bg-gradient-to-r from-[#00a884] to-[#25d366] hover:brightness-110 active:scale-95 text-[#070e17] rounded-xl text-xs font-bold transition-all shadow flex items-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Inscription</span>
              </Link>
            </div>
          )}
        </div>
      </header>

      <PWAInstallBanner />

      {/* Main Hero Container */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-8 text-center max-w-xl mx-auto w-full">
        
        {/* Floating Official Emblem with Halo */}
        <div className="relative mb-5 group">
          <div className="absolute -inset-2 bg-gradient-to-tr from-[#0052cc] via-[#fbbf24] to-[#00a884] rounded-3xl blur-xl opacity-50 group-hover:opacity-80 transition duration-700 animate-pulse" />
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-[#0c1826] border-2 border-[#fbbf24]/60 p-2 shadow-2xl flex items-center justify-center overflow-hidden">
            <img 
              src="/icons/logo.png" 
              alt="BAC SESSION 2027" 
              className="w-full h-full object-contain rounded-2xl drop-shadow-xl transform group-hover:scale-105 transition duration-500" 
            />
          </div>
        </div>

        {/* Chadian Motto & Series Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#122131]/90 border border-[#223952] mb-3 shadow-inner">
          <GraduationCap className="w-3.5 h-3.5 text-[#fbbf24]" />
          <span className="text-[11px] font-bold tracking-wider text-[#fbbf24] uppercase">
            Session Officielle 2027
          </span>
          <span className="text-[10px] text-[#8696a0]">• Tchad</span>
        </div>

        {/* Main Title */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white mb-2 leading-tight">
          BAC SESSION <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#fbbf24] via-[#f59e0b] to-[#ffd279]">2027</span>
        </h1>
        <p className="text-sm sm:text-base font-semibold text-[#00a884] tracking-wide mb-3">
          « Réussir ensemble ! »
        </p>

        {/* Subtitle Description */}
        <p className="text-xs sm:text-sm text-[#94a3b8] max-w-md mx-auto leading-relaxed mb-7">
          La plateforme collaborative moderne dédiée aux candidats du Tchad : groupes d'études par série, fiches de révision, partage de devoirs et assistant IA éducatif.
        </p>

        {/* CTA Authentication Action Box */}
        <div className="w-full bg-gradient-to-b from-[#111f30] to-[#0c1724] border border-[#1f3750] rounded-3xl p-5 shadow-2xl mb-7 relative overflow-hidden text-left">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#00a884]/10 rounded-full blur-2xl pointer-events-none" />

          {isAuthenticated && currentUser ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-[#00a884] font-bold uppercase tracking-wider block">
                    Session active
                  </span>
                  <h3 className="text-base font-extrabold text-white">
                    {currentUser.full_name}
                  </h3>
                  <p className="text-xs text-[#8696a0]">
                    Série {currentUser.series} • Province {currentUser.province}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-[#00a884]/20 border border-[#00a884]/50 flex items-center justify-center text-[#00a884] font-bold text-sm">
                  {currentUser.series}
                </div>
              </div>

              <Link
                href="/app/chats"
                className="w-full py-3.5 px-6 bg-gradient-to-r from-[#00a884] to-[#25d366] hover:brightness-110 active:scale-[0.98] text-[#070e17] rounded-2xl font-black text-sm tracking-wide shadow-lg shadow-[#00a884]/30 transition-all flex items-center justify-center gap-2 group"
              >
                <MessageSquare className="w-4 h-4 fill-current" />
                <span>Accéder à mon compte & discussions</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-center mb-4">
                <h3 className="text-sm font-bold text-white mb-1">
                  Rejoignez la communauté des candidats
                </h3>
                <p className="text-xs text-[#8696a0]">
                  Créez un compte ou connectez-vous pour échanger dans votre groupe de série.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <Link
                  href="/signup"
                  className="w-full py-3 px-4 bg-gradient-to-r from-[#00a884] to-[#25d366] hover:brightness-110 active:scale-[0.98] text-[#070e17] rounded-2xl font-black text-xs sm:text-sm tracking-wide shadow-lg shadow-[#00a884]/20 transition-all flex items-center justify-center gap-2 group"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Créer un compte</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <Link
                  href="/auth"
                  className="w-full py-3 px-4 bg-[#16273b] hover:bg-[#1d334d] active:scale-[0.98] border border-[#2b4868] text-white rounded-2xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 group"
                >
                  <LogIn className="w-4 h-4 text-[#00a884]" />
                  <span>Se connecter</span>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* 3 Series Official Community Pills */}
        <div className="w-full mb-6">
          <div className="text-[11px] font-bold text-[#8696a0] uppercase tracking-wider mb-2.5 flex items-center justify-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-[#fbbf24]" />
            <span>Groupes d'études officiels</span>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div className="bg-[#0e1a29]/90 border border-[#1d3247] hover:border-[#fbbf24]/50 transition-all rounded-2xl p-3 flex flex-col items-center">
              <div className="w-8 h-8 rounded-xl bg-[#002664]/80 text-[#ffd279] font-black text-xs flex items-center justify-center mb-1 shadow">
                A4
              </div>
              <span className="text-xs font-bold text-white">Série A4</span>
              <span className="text-[10px] text-[#8696a0]">Littéraire</span>
            </div>

            <div className="bg-[#0e1a29]/90 border border-[#1d3247] hover:border-[#00a884]/50 transition-all rounded-2xl p-3 flex flex-col items-center">
              <div className="w-8 h-8 rounded-xl bg-[#00a884]/20 text-[#00a884] font-black text-xs flex items-center justify-center mb-1 shadow">
                D
              </div>
              <span className="text-xs font-bold text-white">Série D</span>
              <span className="text-[10px] text-[#8696a0]">Scientifique</span>
            </div>

            <div className="bg-[#0e1a29]/90 border border-[#1d3247] hover:border-[#53bdeb]/50 transition-all rounded-2xl p-3 flex flex-col items-center">
              <div className="w-8 h-8 rounded-xl bg-[#0052cc]/30 text-[#53bdeb] font-black text-xs flex items-center justify-center mb-1 shadow">
                C
              </div>
              <span className="text-xs font-bold text-white">Série C</span>
              <span className="text-[10px] text-[#8696a0]">Mathématiques</span>
            </div>
          </div>
        </div>

        {/* Key Features Grid */}
        <div className="grid grid-cols-2 gap-2.5 w-full mb-7 text-left">
          <div className="bg-[#0c1724]/80 border border-[#1a2d42] rounded-2xl p-3">
            <div className="flex items-center gap-1.5 mb-1 text-[#fbbf24]">
              <Cpu className="w-4 h-4" />
              <span className="text-xs font-bold text-white">BAC Assistant IA</span>
            </div>
            <p className="text-[11px] text-[#8696a0] leading-snug">
              Explications de cours claires, exercices et résumés pédagogiques 24h/7j.
            </p>
          </div>

          <div className="bg-[#0c1724]/80 border border-[#1a2d42] rounded-2xl p-3">
            <div className="flex items-center gap-1.5 mb-1 text-[#00a884]">
              <BookOpen className="w-4 h-4" />
              <span className="text-xs font-bold text-white">Cours & Épreuves</span>
            </div>
            <p className="text-[11px] text-[#8696a0] leading-snug">
              Échangez fiches PDF, photos de devoirs et vocaux explicatifs.
            </p>
          </div>

          <div className="bg-[#0c1724]/80 border border-[#1a2d42] rounded-2xl p-3">
            <div className="flex items-center gap-1.5 mb-1 text-[#53bdeb]">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-xs font-bold text-white">Numéro Protégé</span>
            </div>
            <p className="text-[11px] text-[#8696a0] leading-snug">
              Confidentialité stricte : numéro privé garanti selon vos choix.
            </p>
          </div>

          <div className="bg-[#0c1724]/80 border border-[#1a2d42] rounded-2xl p-3">
            <div className="flex items-center gap-1.5 mb-1 text-[#a855f7]">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-xs font-bold text-white">Toutes Provinces</span>
            </div>
            <p className="text-[11px] text-[#8696a0] leading-snug">
              L'entraide solidaire des candidats à travers tout le Tchad.
            </p>
          </div>
        </div>

        {/* Install Guide / PWA link */}
        <Link
          href="/telecharger"
          className="w-full py-2.5 px-4 bg-[#0a121c] hover:bg-[#111e2e] active:scale-[0.98] border border-[#1b2b3a] text-[#8696a0] hover:text-white rounded-2xl font-medium text-xs transition-all flex items-center justify-center gap-2"
        >
          <Download className="w-3.5 h-3.5 text-[#00a884]" />
          <span>Installer l'application sur Android & iPhone</span>
        </Link>
      </main>

      {/* Clean Minimal Footer */}
      <footer className="py-4 text-center text-xs font-semibold text-[#8696a0] border-t border-[#162536]/80 tracking-widest">
        <p>BAC 2027</p>
      </footer>
    </div>
  );
}
