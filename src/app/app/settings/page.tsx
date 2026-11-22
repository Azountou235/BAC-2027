'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { TopHeader } from '@/components/TopHeader';
import { BottomNav } from '@/components/BottomNav';
import {
  Moon,
  Sun,
  Zap,
  Lock,
  Globe,
  Bell,
  LogOut,
  Trash2,
  Check,
  Shield,
  Smartphone,
  Save,
} from 'lucide-react';
import { CHAD_PROVINCES, Province, Series, PhonePrivacy } from '@/types';

export default function SettingsPage() {
  const router = useRouter();
  const {
    currentUser,
    setCurrentUser,
    theme,
    setTheme,
    isLowNetworkMode,
    setLowNetworkMode,
    logout,
  } = useApp();

  const [fullName, setFullName] = useState(currentUser?.full_name || '');
  const [province, setProvince] = useState<Province>(currentUser?.province || "N'Djamena");
  const [series, setSeries] = useState<Series>(currentUser?.series || 'D');
  const [phoneNumber, setPhoneNumber] = useState(currentUser?.phone || '');
  const [phonePrivacy, setPhonePrivacy] = useState<PhonePrivacy>(currentUser?.phone_privacy || 'private');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const updated = {
      ...currentUser,
      full_name: fullName.trim(),
      province,
      series,
      phone: phoneNumber.trim() || null,
      phone_privacy: phonePrivacy,
      updated_at: new Date().toISOString(),
    };

    setCurrentUser(updated);
    localStorage.setItem('bac_tchad_user', JSON.stringify(updated));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleDeleteAccount = () => {
    alert('Votre compte et vos données ont été définitivement supprimés.');
    logout();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-20 md:pb-6">
      <TopHeader
        title="Paramètres"
        subtitle="Préférences & Confidentialité"
        showBack
        onBack={() => router.push('/app/profile')}
      />

      <main className="flex-1 max-w-xl w-full mx-auto p-4 space-y-5">
        {savedSuccess && (
          <div className="p-3 bg-teal-950/60 border border-teal-700/60 text-teal-300 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-teal-400" />
            <span>Modifications enregistrées avec succès !</span>
          </div>
        )}

        {/* Profile Modification Form */}
        <form onSubmit={handleSaveProfile} className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-teal-400">
            Modifier mon profil
          </h2>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Nom complet
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Province
              </label>
              <select
                value={province}
                onChange={(e) => setProvince(e.target.value as Province)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
              >
                {CHAD_PROVINCES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Série BAC
              </label>
              <select
                value={series}
                onChange={(e) => setSeries(e.target.value as Series)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
              >
                <option value="A4">Série A4</option>
                <option value="D">Série D</option>
                <option value="C">Série C</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Téléphone
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+235 66 00 00 00"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Phone Privacy Switch */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Confidentialité du numéro
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPhonePrivacy('private')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  phonePrivacy === 'private'
                    ? 'bg-teal-950/60 border-teal-500 text-teal-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Privé (Caché)</span>
              </button>

              <button
                type="button"
                onClick={() => setPhonePrivacy('public')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  phonePrivacy === 'public'
                    ? 'bg-teal-950/60 border-teal-500 text-teal-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Public (Visible)</span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow"
          >
            <Save className="w-4 h-4" />
            <span>Enregistrer les modifications</span>
          </button>
        </form>

        {/* Application & Network Preferences */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-teal-400">
            Application & Données
          </h2>

          {/* Mode Réseau Faible Toggle */}
          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-teal-950/60 border border-teal-800/60 flex items-center justify-center text-teal-400">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Mode Réseau Faible</p>
                <p className="text-[11px] text-slate-400">Économise la data (Connexions 2G/3G)</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setLowNetworkMode(!isLowNetworkMode)}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                isLowNetworkMode ? 'bg-teal-500' : 'bg-slate-800'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  isLowNetworkMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Theme Selector */}
          <div className="flex items-center justify-between py-1 border-t border-slate-800/80 pt-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-amber-400">
                {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Thème d'affichage</p>
                <p className="text-[11px] text-slate-400">Mode sombre graphite ou clair</p>
              </div>
            </div>

            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                  theme === 'dark' ? 'bg-teal-600 text-white' : 'text-slate-400'
                }`}
              >
                Sombre
              </button>
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                  theme === 'light' ? 'bg-teal-600 text-white' : 'text-slate-400'
                }`}
              >
                Clair
              </button>
            </div>
          </div>

          {/* Push notifications */}
          <div className="flex items-center justify-between py-1 border-t border-slate-800/80 pt-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-teal-400">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Notifications Push PWA</p>
                <p className="text-[11px] text-slate-400">Nouveaux messages et annonces</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                notificationsEnabled ? 'bg-teal-500' : 'bg-slate-800'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  notificationsEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Account Danger Zone */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-red-400">
            Session & Compte
          </h2>

          <button
            onClick={logout}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Se déconnecter de BAC TCHAD 2027</span>
          </button>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="w-full py-2.5 bg-red-950/20 hover:bg-red-950/40 border border-red-900/40 text-red-400 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Supprimer mon compte candidat</span>
          </button>
        </div>
      </main>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-red-900/60 rounded-3xl p-6 max-w-sm w-full text-slate-100 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-red-400">
              Supprimer définitivement votre compte ?
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Cette action est irréversible. Tous vos messages, participations et paramètres seront effacés conformément au RGPD et aux règles de confidentialité.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-semibold text-slate-300"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 rounded-xl text-xs font-semibold text-white"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
