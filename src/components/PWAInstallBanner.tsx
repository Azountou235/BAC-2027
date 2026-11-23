'use client';

import React, { useState, useEffect } from 'react';
import { Download, X, Share, PlusSquare, Smartphone } from 'lucide-react';

export const PWAInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const standaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(standaloneMode);

    const ua = window.navigator.userAgent.toLowerCase();
    const iOSDevice = /iphone|ipad|ipod/.test(ua);
    setIsIOS(iOSDevice);

    // Capture install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowNotification(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // If not standalone and not dismissed, show prompt after 1.5s
    const dismissed = sessionStorage.getItem('bac_pwa_prompt_dismissed');
    if (!standaloneMode && !dismissed) {
      const timer = setTimeout(() => {
        setShowNotification(true);
      }, 1500);
      return () => clearTimeout(timer);
    }

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
    } else if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowNotification(false);
      }
      setDeferredPrompt(null);
    } else {
      // Fallback instruction
      alert('Pour installer BAC 2027 : appuyez sur le menu (les 3 points) de votre navigateur, puis choisissez "Ajouter à l\'écran d\'accueil" ou "Installer l\'application".');
    }
  };

  const handleDismiss = () => {
    setShowNotification(false);
    sessionStorage.setItem('bac_pwa_prompt_dismissed', 'true');
  };

  if (isStandalone || !showNotification) return null;

  return (
    <>
      {/* Single clean floating install prompt */}
      <div className="w-full max-w-md mx-auto px-4 mb-4 animate-in slide-in-from-top-3 duration-300">
        <div className="bg-[#111b21] border border-[#202c33] rounded-2xl p-3 shadow-xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#00a884]/15 border border-[#00a884]/30 flex items-center justify-center flex-shrink-0">
              <Smartphone className="w-5 h-5 text-[#00a884]" />
            </div>
            <div className="truncate">
              <h4 className="text-xs font-bold text-white truncate">Installer BAC 2027</h4>
              <p className="text-[11px] text-[#8696a0] truncate">Accès rapide, fluide et hors-ligne</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleInstallClick}
              className="px-3.5 py-1.5 bg-[#00a884] hover:bg-[#00c99f] active:scale-95 text-[#111b21] rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Installer</span>
            </button>
            <button
              onClick={handleDismiss}
              className="p-1.5 text-[#8696a0] hover:text-white transition-colors"
              title="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* iOS Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-[#111b21] border border-[#202c33] rounded-3xl max-w-xs w-full p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-[#00a884]/20 flex items-center justify-center mx-auto text-[#00a884]">
              <Share className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white mb-1">Installer sur iPhone / iPad</h3>
              <p className="text-xs text-[#8696a0] leading-relaxed">
                1. Appuyez sur le bouton <strong>Partager</strong> en bas de Safari.<br />
                2. Faites défiler et choisissez <strong>Sur l'écran d'accueil</strong>.
              </p>
            </div>
            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2.5 bg-[#00a884] text-[#111b21] rounded-xl text-xs font-bold"
            >
              Compris
            </button>
          </div>
        </div>
      )}
    </>
  );
};
