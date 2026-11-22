'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Check, X, ShieldAlert } from 'lucide-react';

export const NotificationPermissionModal: React.FC = () => {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const alreadyPrompted = localStorage.getItem('bac_tchad_notification_prompted');
      // If permission is default and user hasn't seen the prompt yet
      if (Notification.permission === 'default' && !alreadyPrompted) {
        // Show prompt after 2 seconds
        const timer = setTimeout(() => {
          setShowModal(true);
        }, 2000);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const handleAllowNotifications = async () => {
    if ('Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        localStorage.setItem('bac_tchad_notification_prompted', 'true');
        setShowModal(false);

        if (permission === 'granted') {
          // Send a welcome test push notification
          if ('serviceWorker' in navigator) {
            const reg = await navigator.serviceWorker.ready;
            reg.showNotification('BAC TCHAD 2027', {
              body: 'Notifications activées ! Vous recevrez les messages en temps réel comme sur WhatsApp.',
              icon: '/icons/logo.svg',
              badge: '/icons/logo.svg',
            });
          }
        }
      } catch (err) {
        console.error('Notification permission error:', err);
        setShowModal(false);
      }
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('bac_tchad_notification_prompted', 'true');
    setShowModal(false);
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#111b21] border border-[#202c33] rounded-3xl p-6 max-w-sm w-full text-[#e9edef] shadow-2xl relative text-center">
        {/* Icon */}
        <div className="w-16 h-16 rounded-full bg-[#103629] border border-[#00a884]/40 flex items-center justify-center text-[#00a884] mx-auto mb-4 shadow-lg animate-bounce">
          <Bell className="w-8 h-8 fill-[#00a884]/20" />
        </div>

        <h3 className="text-lg font-bold text-white mb-2">
          Activer les notifications
        </h3>

        <p className="text-xs text-[#8696a0] leading-relaxed mb-6">
          Comme sur WhatsApp, autorisez les notifications pour être alerté instantanément lorsque vous recevez :
        </p>

        <div className="text-left bg-[#1f2c34] border border-[#2a3942] rounded-2xl p-3.5 space-y-2 mb-6 text-xs text-[#d1d7db]">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00a884]" />
            <span>Nouveaux messages dans votre groupe (A4, D, C)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00a884]" />
            <span>Notes vocales et sujets de révision partagés</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ffd279]" />
            <span>Annonces officielles de <strong>LE SEIGNEUR</strong></span>
          </div>
        </div>

        <div className="space-y-2">
          <button
            onClick={handleAllowNotifications}
            className="w-full py-3 bg-[#00a884] hover:bg-[#00c99f] active:scale-95 text-[#111b21] rounded-2xl font-bold text-xs tracking-wide shadow-xl transition-all flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4 stroke-[2.5px]" />
            <span>Autoriser les notifications</span>
          </button>

          <button
            onClick={handleDismiss}
            className="w-full py-2.5 text-xs text-[#8696a0] hover:text-white transition-colors"
          >
            Plus tard
          </button>
        </div>
      </div>
    </div>
  );
};
