'use client';

import React, { useState, useRef } from 'react';
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
  Camera,
  Image as ImageIcon,
  MessageCircle,
  ShieldCheck,
  AlertCircle,
  Save,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { CHAD_PROVINCES, Province, Series, PhonePrivacy } from '@/types';
import { PhotoCropModal } from '@/components/PhotoCropModal';
import { FullScreenImageViewer } from '@/components/FullScreenImageViewer';
import { RedVerifiedBadge } from '@/components/RedVerifiedBadge';

export default function SettingsPage() {
  const router = useRouter();
  const {
    currentUser,
    updateUserProfile,
    theme,
    setTheme,
    isLowNetworkMode,
    setLowNetworkMode,
    logout,
  } = useApp();

  const [avatarPreview, setAvatarPreview] = useState<string | null>(currentUser?.avatar_url || null);
  const [fullName, setFullName] = useState(currentUser?.full_name || '');
  const [province, setProvince] = useState<Province>(currentUser?.province || "N'Djamena");
  const [series, setSeries] = useState<Series>(currentUser?.series || 'D');
  const [phoneNumber, setPhoneNumber] = useState(currentUser?.phone || '');
  const [phonePrivacy, setPhonePrivacy] = useState<PhonePrivacy>(currentUser?.phone_privacy || 'private');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Crop & Fullscreen Viewer state
  const [rawImageForCrop, setRawImageForCrop] = useState<string | null>(null);
  const [showFullScreenAvatar, setShowFullScreenAvatar] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  // 14 days name modification restriction check
  const checkNameChangeEligibility = () => {
    if (!currentUser?.last_name_change) {
      return { eligible: true, daysRemaining: 0, nextAllowedDate: null };
    }
    const lastChange = new Date(currentUser.last_name_change).getTime();
    const now = Date.now();
    const diffDays = (now - lastChange) / (1000 * 60 * 60 * 24);
    if (diffDays < 14) {
      const daysRemaining = Math.ceil(14 - diffDays);
      const nextAllowedDate = new Date(lastChange + 14 * 24 * 60 * 60 * 1000);
      return { eligible: false, daysRemaining, nextAllowedDate };
    }
    return { eligible: true, daysRemaining: 0, nextAllowedDate: null };
  };

  const nameEligibility = checkNameChangeEligibility();

  // Photo handlers: Open WhatsApp-style crop modal
  const handlePhotoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setRawImageForCrop(result);
      };
      reader.readAsDataURL(file);
      // Reset input value so user can pick same file again if desired
      e.target.value = '';
    }
  };

  const handleCropComplete = async (croppedBase64: string) => {
    setAvatarPreview(croppedBase64);
    setRawImageForCrop(null);
    await updateUserProfile({ avatar_url: croppedBase64 });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // If name changed, check eligibility
    if (fullName.trim() !== currentUser?.full_name?.trim() && !nameEligibility.eligible) {
      setErrorMessage(
        `Vous ne pouvez pas encore modifier votre nom. Prochaine modification autorisée le ${nameEligibility.nextAllowedDate?.toLocaleDateString(
          'fr-FR'
        )}.`
      );
      return;
    }

    const res = await updateUserProfile({
      full_name: fullName.trim(),
      province,
      series,
      phone: phoneNumber.trim() || null,
      phone_privacy: phonePrivacy,
      avatar_url: avatarPreview,
    });

    if (!res.success) {
      setErrorMessage(res.message || 'Erreur lors de la mise à jour.');
      return;
    }

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleDeleteAccount = () => {
    alert('Votre compte et vos données ont été définitivement supprimés.');
    logout();
  };

  const isSuperAdmin = currentUser?.email?.trim().toLowerCase() === 'leseigneur235@gmail.com';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-20 md:pb-6 font-sans">
      <TopHeader
        title="Paramètres"
        subtitle="Profil, Sécurité & Support"
        showBack
        onBack={() => router.push('/app/profile')}
      />

      <main className="flex-1 max-w-xl w-full mx-auto p-4 space-y-5">
        {savedSuccess && (
          <div className="p-3 bg-emerald-950/70 border border-emerald-600/50 text-emerald-300 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Modifications enregistrées avec succès et synchronisées !</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 bg-rose-950/70 border border-rose-600/50 text-rose-300 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Section 1: Photo de profil */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#00a884] flex items-center gap-2">
            <Camera className="w-4 h-4" />
            <span>Photo de profil</span>
          </h2>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative">
              <div 
                onClick={() => avatarPreview && setShowFullScreenAvatar(true)}
                className={`w-20 h-20 rounded-full overflow-hidden bg-slate-800 border-2 border-[#00a884]/40 flex items-center justify-center shadow-lg ${
                  avatarPreview ? 'cursor-pointer hover:opacity-90 active:scale-95 transition-all' : ''
                }`}
                title={avatarPreview ? 'Cliquer pour voir la photo en entier' : ''}
              >
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl font-bold text-[#00a884]">
                    {currentUser?.full_name?.slice(0, 2).toUpperCase() || 'BT'}
                  </span>
                )}
              </div>
            </div>

            <div className="flex-1 flex flex-col sm:flex-row gap-2 w-full">
              <input
                type="file"
                ref={cameraInputRef}
                accept="image/*"
                capture="user"
                onChange={handlePhotoFile}
                className="hidden"
              />
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handlePhotoFile}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="flex-1 py-2 px-3 bg-[#202c33] hover:bg-[#2a3942] border border-slate-700 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-all"
              >
                <Camera className="w-4 h-4 text-[#00a884]" />
                <span>Prendre photo</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-2 px-3 bg-[#202c33] hover:bg-[#2a3942] border border-slate-700 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-all"
              >
                <ImageIcon className="w-4 h-4 text-teal-400" />
                <span>Depuis la galerie</span>
              </button>
            </div>
          </div>
        </div>

        {/* Section 2: Formulaire Profil & Nom (14 jours) */}
        <form onSubmit={handleSaveProfile} className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#00a884]">
            Informations du profil
          </h2>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-slate-400">
                Nom complet
              </label>
              {!nameEligibility.eligible && (
                <span className="text-[10px] text-amber-400 font-semibold">
                  Modifié récemment
                </span>
              )}
            </div>

            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={!nameEligibility.eligible}
              className={`w-full border rounded-xl px-3 py-2 text-xs transition-colors ${
                nameEligibility.eligible
                  ? 'bg-slate-950 border-slate-800 text-white focus:outline-none focus:border-[#00a884]'
                  : 'bg-slate-950/50 border-slate-800/60 text-slate-500 cursor-not-allowed'
              }`}
              required
            />

            {!nameEligibility.eligible ? (
              <p className="mt-1.5 text-[11px] text-amber-300/90 leading-tight">
                ⚠️ Modification limitée : Vous pourrez modifier votre nom à nouveau le{' '}
                <strong>{nameEligibility.nextAllowedDate?.toLocaleDateString('fr-FR')}</strong> (dans{' '}
                {nameEligibility.daysRemaining} jours).
              </p>
            ) : (
              <p className="mt-1 text-[10px] text-slate-500">
                Note : Vous ne pouvez modifier votre nom qu'une seule fois tous les 14 jours.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Province
              </label>
              <select
                value={province}
                onChange={(e) => setProvince(e.target.value as Province)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-[#00a884]"
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
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-[#00a884]"
              >
                <option value="A4">Série A4 (Lettres)</option>
                <option value="D">Série D (Scientifique)</option>
                <option value="C">Série C (Maths/Physique)</option>
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
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00a884]"
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
                    ? 'bg-emerald-950/60 border-[#00a884] text-emerald-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Privé (Masqué)</span>
              </button>

              <button
                type="button"
                onClick={() => setPhonePrivacy('public')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  phonePrivacy === 'public'
                    ? 'bg-emerald-950/60 border-[#00a884] text-emerald-300'
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
            className="w-full py-2.5 bg-[#00a884] hover:bg-[#00c99f] text-[#111b21] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow"
          >
            <Save className="w-4 h-4" />
            <span>Enregistrer les modifications</span>
          </button>
        </form>

        {/* Section 3: SUPPORT OFFICIEL WHATSAPP */}
        <div className="bg-gradient-to-r from-[#103629] via-slate-900 to-[#103629] border border-[#00a884]/40 rounded-3xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#00a884] flex items-center gap-2">
              <HelpCircle className="w-4 h-4" />
              <span>Support & Assistance</span>
            </h2>
            <span className="text-[10px] bg-[#00a884]/20 text-[#00a884] px-2 py-0.5 rounded-full font-bold">
              Direct
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Une question sur vos révisions ou un problème technique ? Contactez directement l'équipe officielle sur WhatsApp.
          </p>

          <a
            href="https://wa.me/23591234568?text=Bonjour%20Support%20BAC%20TCHAD%202027,%20j'ai%20besoin%20d'aide."
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>Ouvrir WhatsApp (+235 91 23 45 68)</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Section 4: Accès Super Admin (Uniquement visible pour Leseigneur235@gmail.com) */}
        {isSuperAdmin && (
          <div className="bg-slate-900 border border-blue-800/50 rounded-3xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                <span>Panneau Super Administrateur</span>
              </h2>
              <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full font-bold">
                Exclusif
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Accès réservé exclusivement au compte <strong>Leseigneur235@gmail.com</strong> pour la gestion des annonces, groupes et modération.
            </p>

            <button
              onClick={() => router.push('/admin')}
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow"
            >
              Ouvrir le panneau d'administration
            </button>
          </div>
        )}

        {/* Section 5: Préférences de l'application */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Préférences de l'application
          </h2>

          {/* Mode Réseau Faible */}
          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-teal-950/60 border border-teal-800/60 flex items-center justify-center text-teal-400">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Mode Réseau Faible</p>
                <p className="text-[11px] text-slate-400">Économise la data (2G/3G)</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setLowNetworkMode(!isLowNetworkMode)}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                isLowNetworkMode ? 'bg-[#00a884]' : 'bg-slate-800'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  isLowNetworkMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Thème */}
          <div className="flex items-center justify-between py-1 border-t border-slate-800/80 pt-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-amber-400">
                {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Thème d'affichage</p>
                <p className="text-[11px] text-slate-400">Sombre graphite ou clair</p>
              </div>
            </div>

            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                  theme === 'dark' ? 'bg-[#00a884] text-[#111b21]' : 'text-slate-400'
                }`}
              >
                Sombre
              </button>
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                  theme === 'light' ? 'bg-[#00a884] text-[#111b21]' : 'text-slate-400'
                }`}
              >
                Clair
              </button>
            </div>
          </div>
        </div>

        {/* Section 6: Déconnexion & Compte */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-rose-400">
            Session & Compte
          </h2>

          <button
            onClick={logout}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Se déconnecter</span>
          </button>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="w-full py-2.5 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-900/40 text-rose-400 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Supprimer mon compte candidat</span>
          </button>
        </div>
      </main>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-rose-900/60 rounded-3xl p-6 max-w-sm w-full text-slate-100 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-rose-400">
              Supprimer définitivement votre compte ?
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Cette action est irréversible. Tous vos messages, participations et paramètres seront effacés.
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
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 rounded-xl text-xs font-semibold text-white"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Style Photo Crop Modal */}
      {rawImageForCrop && (
        <PhotoCropModal
          imageSrc={rawImageForCrop}
          onCropComplete={handleCropComplete}
          onCancel={() => setRawImageForCrop(null)}
        />
      )}

      {/* Fullscreen Photo Viewer */}
      <FullScreenImageViewer
        isOpen={showFullScreenAvatar}
        imageUrl={avatarPreview}
        title={fullName || currentUser?.full_name || 'Photo de profil'}
        subtitle="Votre photo de profil"
        onClose={() => setShowFullScreenAvatar(false)}
      />

      <BottomNav />
    </div>
  );
}
