'use client';

import React, { useState, useEffect } from 'react';
import { Download, Share, PlusSquare, X } from 'lucide-react';

export const PWAInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (typeof window !== 'undefined') {
      const isStandaloneMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true;
      setIsStandalone(isStandaloneMode);

      // Detect iOS
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isIPhone = /iphone|ipad|ipod/.test(userAgent);
      setIsIOS(isIPhone);

      // Check if user dismissed banner recently
      const dismissed = localStorage.getItem('bac_tchad_pwa_dismissed');

      if (!isStandaloneMode && !dismissed) {
        setShowBanner(true);
      }

      // Android beforeinstallprompt
      const handleBeforeInstall = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setShowBanner(true);
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstall);
      return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    }
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
    } else if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    } else {
      alert('Pour installer l’application : ouvrez les options de votre navigateur et choisissez "Ajouter à l’écran d’accueil".');
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('bac_tchad_pwa_dismissed', 'true');
  };

  if (isStandalone || !showBanner) return null;

  return (
    <>
      <div className="bg-gradient-to-r from-teal-900 to-slate-900 border-b border-teal-800/60 px-4 py-2.5 text-slate-100 flex items-center justify-between shadow-md animate-in slide-in-from-top duration-300">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center flex-shrink-0 shadow">
            <Download className="w-4 h-4 text-white" />
          </div>
          <div className="truncate">
            <p className="text-xs font-bold text-white truncate">Installer BAC TCHAD 2027</p>
            <p className="text-[11px] text-teal-300 truncate">
              Application rapide, hors-ligne et sans barre d’adresse
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleInstallClick}
            className="px-3 py-1.5 bg-teal-500 hover:bg-teal-600 active:scale-95 text-white rounded-lg text-xs font-semibold shadow transition-all"
          >
            Installer
          </button>
          <button
            onClick={handleDismiss}
            className="p-1 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* iOS Instructions Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full text-slate-100 relative shadow-2xl">
            <button
              onClick={() => setShowIOSModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-2">
              Installer sur iPhone / iPad
            </h3>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Pour profiter de la meilleure expérience PWA sans barre de navigation :
            </p>

            <div className="space-y-3 text-xs bg-slate-950 p-3.5 rounded-2xl border border-slate-800/80 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-teal-400 font-bold">
                  1
                </div>
                <div className="flex items-center gap-1.5 text-slate-200">
                  <span>Appuyez sur le bouton</span>
                  <Share className="w-4 h-4 text-blue-400" />
                  <span className="font-semibold">Partager</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-teal-400 font-bold">
                  2
                </div>
                <div className="flex items-center gap-1.5 text-slate-200">
                  <span>Faites défiler et choisissez</span>
                  <PlusSquare className="w-4 h-4 text-teal-400" />
                </div>
              </div>
              <div className="pl-10 text-teal-300 font-semibold">
                « Sur l'écran d'accueil »
              </div>
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-teal-400 font-bold">
                  3
                </div>
                <span className="text-slate-200">Cliquez sur <strong className="text-white">Ajouter</strong> en haut à droite.</span>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold"
            >
              J'ai compris
            </button>
          </div>
        </div>
      )}
    </>
  );
};
