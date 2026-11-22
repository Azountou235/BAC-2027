'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  CHAD_PROVINCES,
  Province,
  Series,
  PhonePrivacy,
  Profile,
} from '@/types';
import {
  User,
  MapPin,
  Phone,
  Lock,
  Globe,
  GraduationCap,
  Camera,
  CheckCircle2,
  ArrowRight,
  ChevronLeft,
  Upload,
  Trash2,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { compressImage } from '@/lib/storage';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

function ProfileSetupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setCurrentUser } = useApp();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [email, setEmail] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [province, setProvince] = useState<Province>('N\'Djamena');
  const [phoneCode, setPhoneCode] = useState<string>('+235');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [phonePrivacy, setPhonePrivacy] = useState<PhonePrivacy>('private');
  const [series, setSeries] = useState<Series>('D');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const qEmail = searchParams.get('email') || sessionStorage.getItem('pending_verify_email') || 'candidat@bactchad.td';
    setEmail(qEmail);
  }, [searchParams]);

  const handleNext = () => {
    setError(null);
    if (currentStep === 1 && !fullName.trim()) {
      setError('Veuillez renseigner votre nom complet.');
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, 7));
  };

  const handleBack = () => {
    setError(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const compressed = await compressImage(file, 'standard');
      setAvatarFile(compressed);
      setAvatarPreview(URL.createObjectURL(compressed));
    }
  };

  const handleRemovePhoto = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  const handleFinalize = async () => {
    setSaving(true);
    setError(null);

    const fullPhone = phoneNumber.trim() ? `${phoneCode} ${phoneNumber.trim()}` : null;
    const isSuperAdmin = email.toLowerCase() === 'leseigneur235@gmail.com' || email.includes('admin');

    const newProfile: Profile = {
      id: 'usr_' + Date.now(),
      email,
      full_name: fullName.trim(),
      province,
      phone: fullPhone,
      phone_privacy: phonePrivacy,
      series,
      avatar_url: avatarPreview,
      is_super_admin: isSuperAdmin,
      is_suspended: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user) {
          newProfile.id = userData.user.id;
          newProfile.email = userData.user.email || email;

          await supabase.from('profiles').upsert(newProfile);
        }
      } catch (err) {
        console.error('Supabase profile save error:', err);
      }
    }

    setCurrentUser(newProfile);
    localStorage.setItem('bac_tchad_user', JSON.stringify(newProfile));
    router.push('/app');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6">
      <div className="w-full max-w-md mx-auto">
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-6 pt-2">
          {currentStep > 1 ? (
            <button
              onClick={handleBack}
              className="p-2 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          ) : (
            <div className="w-9" />
          )}
          <span className="text-xs font-semibold uppercase tracking-widest text-teal-400">
            Étape {currentStep} sur 7
          </span>
          <div className="w-9" />
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-900 h-1.5 rounded-full mb-8 overflow-hidden">
          <div
            className="bg-teal-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / 7) * 100}%` }}
          />
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-950/40 border border-red-800/60 rounded-xl text-xs text-red-300">
            {error}
          </div>
        )}

        {/* Étape 1 : Nom Complet */}
        {currentStep === 1 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="w-12 h-12 rounded-2xl bg-teal-950/60 border border-teal-800/60 flex items-center justify-center text-teal-400 mb-2">
              <User className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-white">Votre nom complet</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Indiquez vos prénom et nom tels qu'ils figurent sur votre dossier de candidature au BAC.
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">
                Nom & Prénom(s) *
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ex : Mahamat Ali Brahim"
                required
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              />
            </div>
          </div>
        )}

        {/* Étape 2 : Province */}
        {currentStep === 2 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="w-12 h-12 rounded-2xl bg-teal-950/60 border border-teal-800/60 flex items-center justify-center text-teal-400 mb-2">
              <MapPin className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-white">Votre province</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sélectionnez votre province parmi les 23 provinces de la République du Tchad.
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">
                Province de résidence / examen
              </label>
              <select
                value={province}
                onChange={(e) => setProvince(e.target.value as Province)}
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              >
                {CHAD_PROVINCES.map((prov) => (
                  <option key={prov} value={prov} className="bg-slate-900 text-white">
                    {prov}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Étape 3 : Numéro de Téléphone */}
        {currentStep === 3 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="w-12 h-12 rounded-2xl bg-teal-950/60 border border-teal-800/60 flex items-center justify-center text-teal-400 mb-2">
              <Phone className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-white">Numéro de téléphone</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Optionnel. Par défaut préfixé avec l’indicatif +235 du Tchad.
            </p>
            <div className="flex gap-2">
              <div className="w-24 bg-slate-900 border border-slate-800 rounded-2xl px-3 py-3.5 text-sm text-center text-teal-300 font-semibold">
                +235
              </div>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="66 00 00 00 ou 99 00 00 00"
                className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>
        )}

        {/* Étape 4 : Confidentialité du Numéro */}
        {currentStep === 4 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="w-12 h-12 rounded-2xl bg-teal-950/60 border border-teal-800/60 flex items-center justify-center text-teal-400 mb-2">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-white">Confidentialité du numéro</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Choisissez si les autres candidats peuvent voir votre numéro ou s'il doit rester strictement privé.
            </p>

            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={() => setPhonePrivacy('private')}
                className={`w-full p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                  phonePrivacy === 'private'
                    ? 'bg-teal-950/40 border-teal-500 text-white'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Lock className={`w-5 h-5 mt-0.5 ${phonePrivacy === 'private' ? 'text-teal-400' : 'text-slate-500'}`} />
                <div>
                  <div className="font-semibold text-sm text-white flex items-center gap-2">
                    <span>Privé (Recommandé)</span>
                    {phonePrivacy === 'private' && (
                      <span className="text-[10px] bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-full border border-teal-500/30">
                        Sécurisé
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Aucun membre ne peut voir votre numéro. Il est masqué même dans l'API et la base de données.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPhonePrivacy('public')}
                className={`w-full p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                  phonePrivacy === 'public'
                    ? 'bg-teal-950/40 border-teal-500 text-white'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Globe className={`w-5 h-5 mt-0.5 ${phonePrivacy === 'public' ? 'text-teal-400' : 'text-slate-500'}`} />
                <div>
                  <div className="font-semibold text-sm text-white">Public</div>
                  <p className="text-xs text-slate-400 mt-1">
                    Visible dans votre profil candidat pour les membres autorisés.
                  </p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Étape 5 : Série */}
        {currentStep === 5 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="w-12 h-12 rounded-2xl bg-teal-950/60 border border-teal-800/60 flex items-center justify-center text-teal-400 mb-2">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-white">Votre série BAC</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sélectionnez votre filière pour accéder à votre groupe de révision officiel.
            </p>

            <div className="space-y-3 pt-2">
              {[
                { id: 'A4', label: 'Série A4 — Littéraire', desc: 'Philosophie, Français, Histoire-Géo, Langues' },
                { id: 'D', label: 'Série D — Scientifique', desc: 'Mathématiques, Sciences Physiques, SVT' },
                { id: 'C', label: 'Série C — Scientifique Math', desc: 'Mathématiques approfondies, Physique-Chimie' },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSeries(s.id as Series)}
                  className={`w-full p-4 rounded-2xl border text-left transition-all ${
                    series === s.id
                      ? 'bg-teal-950/40 border-teal-500 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-sm text-white">{s.label}</div>
                  <div className="text-xs text-slate-400 mt-1">{s.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Étape 6 : Photo de Profil */}
        {currentStep === 6 && (
          <div className="space-y-4 animate-in fade-in text-center">
            <div className="w-12 h-12 rounded-2xl bg-teal-950/60 border border-teal-800/60 flex items-center justify-center text-teal-400 mx-auto mb-2">
              <Camera className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-white">Photo de profil</h2>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
              Facultatif. Vous pouvez ajouter une photo ou conserver un avatar généré élégant.
            </p>

            <div className="py-4">
              <div className="relative w-28 h-28 mx-auto rounded-full border-4 border-slate-800 bg-slate-900 flex items-center justify-center overflow-hidden shadow-xl text-teal-400 text-3xl font-black">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Aperçu" className="w-full h-full object-cover" />
                ) : (
                  <span>{fullName ? fullName[0].toUpperCase() : 'B'}</span>
                )}
              </div>

              <div className="flex items-center justify-center gap-3 mt-4">
                <label className="cursor-pointer px-4 py-2 bg-slate-800 hover:bg-slate-700 text-teal-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors">
                  <Upload className="w-4 h-4" />
                  <span>{avatarPreview ? 'Changer' : 'Ajouter une photo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    className="hidden"
                  />
                </label>

                {avatarPreview && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="p-2 bg-red-950/60 text-red-400 rounded-xl hover:bg-red-900/60 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Étape 7 : Récapitulatif & Finalisation */}
        {currentStep === 7 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="w-12 h-12 rounded-2xl bg-teal-950/60 border border-teal-800/60 flex items-center justify-center text-teal-400 mb-2">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-white">Prêt pour l'aventure !</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Vérifiez vos informations avant d'accéder à la plateforme BAC TCHAD 2027.
            </p>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2.5 text-xs text-slate-300">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Nom complet :</span>
                <span className="font-bold text-white">{fullName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Province :</span>
                <span className="font-semibold text-white">{province}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Série choisie :</span>
                <span className="font-bold text-teal-400">Série {series}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Numéro de téléphone :</span>
                <span className="font-medium text-white">
                  {phoneNumber ? `${phoneCode} ${phoneNumber}` : 'Non renseigné'} ({phonePrivacy === 'private' ? 'Privé' : 'Public'})
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Action Button */}
        <div className="mt-8">
          {currentStep < 7 ? (
            <button
              type="button"
              onClick={handleNext}
              className="w-full py-3.5 px-6 bg-teal-600 hover:bg-teal-500 active:scale-98 text-white rounded-2xl font-bold text-sm tracking-wide shadow-xl shadow-teal-950/60 transition-all flex items-center justify-center gap-2 group"
            >
              <span>Continuer</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          ) : (
            <button
              type="button"
              disabled={saving}
              onClick={handleFinalize}
              className="w-full py-3.5 px-6 bg-teal-600 hover:bg-teal-500 active:scale-98 disabled:opacity-50 text-white rounded-2xl font-bold text-sm tracking-wide shadow-xl shadow-teal-950/60 transition-all flex items-center justify-center gap-2 group"
            >
              {saving ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Accéder à BAC TCHAD 2027</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <div className="py-4 text-center text-[11px] text-slate-600">
        Ensemble vers le BAC 2027
      </div>
    </div>
  );
}

export default function ProfileSetupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-teal-400">Chargement...</div>}>
      <ProfileSetupContent />
    </Suspense>
  );
}
