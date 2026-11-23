'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, MapPin, GraduationCap, Phone, Eye, EyeOff, ArrowRight, ChevronLeft, AlertCircle } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { useApp } from '@/context/AppContext';
import { CHAD_PROVINCES, Province, Series, Profile } from '@/types';

export default function SignupPage() {
  const router = useRouter();
  const { setCurrentUser } = useApp();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [series, setSeries] = useState<Series>('D');
  const [province, setProvince] = useState<Province>("N'Djamena");
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phonePrivacy, setPhonePrivacy] = useState<'public' | 'private'>('private');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanName) {
      setError('Veuillez renseigner votre nom complet.');
      return;
    }

    if (!cleanEmail) {
      setError('Veuillez renseigner votre adresse email.');
      return;
    }

    if (cleanPassword.length < 6) {
      setError('Le mot de passe doit comporter au moins 6 caractères.');
      return;
    }

    if (cleanPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);

    try {
      if (isSupabaseConfigured()) {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: cleanEmail,
          password: cleanPassword,
          options: {
            data: {
              full_name: cleanName,
              series,
              province,
              phone: phoneNumber.trim() || null,
              phone_privacy: phonePrivacy,
            },
          },
        });

        if (authError) {
          setError(authError.message);
          setLoading(false);
          return;
        }

        const newProfile: Profile = {
          id: authData.user?.id || `user_${Date.now()}`,
          email: cleanEmail,
          full_name: cleanName,
          province,
          series,
          phone: phoneNumber.trim() || undefined,
          phone_privacy: phonePrivacy,
          avatar_url: null,
          is_super_admin: cleanEmail === 'leseigneur235@gmail.com',
          is_suspended: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        // Insert or update profile table
        await supabase.from('profiles').upsert([
          {
            id: newProfile.id,
            email: newProfile.email,
            full_name: newProfile.full_name,
            province: newProfile.province,
            series: newProfile.series,
            phone: newProfile.phone,
            phone_privacy: newProfile.phone_privacy,
            is_super_admin: newProfile.is_super_admin,
          },
        ]);

        setCurrentUser(newProfile);
        router.push('/app/chats');
      } else {
        // Local storage persistence
        const newProfile: Profile = {
          id: `usr_${Date.now()}`,
          email: cleanEmail,
          full_name: cleanName,
          province,
          series,
          phone: phoneNumber.trim() || undefined,
          phone_privacy: phonePrivacy,
          avatar_url: null,
          is_super_admin: cleanEmail === 'leseigneur235@gmail.com',
          is_suspended: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const existingUsers = JSON.parse(localStorage.getItem('bac_registered_users') || '[]');
        existingUsers.push({ ...newProfile, password: cleanPassword });
        localStorage.setItem('bac_registered_users', JSON.stringify(existingUsers));

        setCurrentUser(newProfile);
        router.push('/app/chats');
      }
    } catch (err: any) {
      setError(err?.message || "Une erreur est survenue lors de l'inscription.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b141a] text-[#e9edef] flex flex-col justify-between p-4 sm:p-6 font-sans">
      <div className="w-full max-w-sm mx-auto">
        {/* Top Back Navigation */}
        <div className="flex items-center justify-between mb-6 pt-2">
          <Link
            href="/"
            className="p-2 rounded-full bg-[#111b21] border border-[#202c33] text-[#8696a0] hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <span className="text-xs font-bold uppercase tracking-widest text-[#00a884]">
            Inscription
          </span>
        </div>

        {/* Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-white mb-1.5">
            Créer un compte
          </h1>
          <p className="text-xs text-[#8696a0] leading-relaxed">
            Rejoignez la communauté des candidats et accédez à votre groupe de série.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3.5 bg-red-950/40 border border-red-800/60 rounded-2xl flex items-start gap-2.5 text-xs text-red-300 animate-in fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Nom complet */}
          <div>
            <label className="block text-xs font-medium text-[#8696a0] mb-1">
              Nom complet
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#8696a0] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ex: Mahamat Allamine"
                required
                className="w-full bg-[#111b21] border border-[#202c33] focus:border-[#00a884] rounded-2xl py-2.5 pl-10 pr-4 text-xs text-white placeholder:text-[#8696a0] outline-none"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-[#8696a0] mb-1">
              Adresse email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#8696a0] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nom@exemple.com"
                required
                className="w-full bg-[#111b21] border border-[#202c33] focus:border-[#00a884] rounded-2xl py-2.5 pl-10 pr-4 text-xs text-white placeholder:text-[#8696a0] outline-none"
              />
            </div>
          </div>

          {/* Série & Province */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-[#8696a0] mb-1">
                Série BAC
              </label>
              <select
                value={series}
                onChange={(e) => setSeries(e.target.value as Series)}
                className="w-full bg-[#111b21] border border-[#202c33] focus:border-[#00a884] rounded-2xl py-2.5 px-3 text-xs text-white outline-none cursor-pointer"
              >
                <option value="A4">Série A4 (Littéraire)</option>
                <option value="D">Série D (Scientifique)</option>
                <option value="C">Série C (Mathématiques)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#8696a0] mb-1">
                Province
              </label>
              <select
                value={province}
                onChange={(e) => setProvince(e.target.value as Province)}
                className="w-full bg-[#111b21] border border-[#202c33] focus:border-[#00a884] rounded-2xl py-2.5 px-3 text-xs text-white outline-none cursor-pointer"
              >
                {CHAD_PROVINCES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Mot de passe */}
          <div>
            <label className="block text-xs font-medium text-[#8696a0] mb-1">
              Mot de passe
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#8696a0] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Au moins 6 caractères"
                required
                className="w-full bg-[#111b21] border border-[#202c33] focus:border-[#00a884] rounded-2xl py-2.5 pl-10 pr-10 text-xs text-white placeholder:text-[#8696a0] outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8696a0] hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirmer mot de passe */}
          <div>
            <label className="block text-xs font-medium text-[#8696a0] mb-1">
              Confirmer le mot de passe
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#8696a0] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Répétez le mot de passe"
                required
                className="w-full bg-[#111b21] border border-[#202c33] focus:border-[#00a884] rounded-2xl py-2.5 pl-10 pr-4 text-xs text-white placeholder:text-[#8696a0] outline-none"
              />
            </div>
          </div>

          {/* Numéro de téléphone (optionnel) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-[#8696a0]">
                Numéro WhatsApp (optionnel)
              </label>
              <select
                value={phonePrivacy}
                onChange={(e) => setPhonePrivacy(e.target.value as 'public' | 'private')}
                className="text-[10px] bg-[#111b21] border border-[#202c33] text-[#00a884] rounded-lg px-2 py-0.5 outline-none cursor-pointer"
              >
                <option value="private">Privé (masqué)</option>
                <option value="public">Public</option>
              </select>
            </div>
            <div className="relative">
              <Phone className="w-4 h-4 text-[#8696a0] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+235 66 XX XX XX"
                className="w-full bg-[#111b21] border border-[#202c33] focus:border-[#00a884] rounded-2xl py-2.5 pl-10 pr-4 text-xs text-white placeholder:text-[#8696a0] outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 py-3.5 px-4 bg-[#00a884] hover:bg-[#00c99f] active:scale-[0.98] disabled:opacity-50 text-[#111b21] rounded-2xl font-bold text-xs tracking-wide shadow-lg shadow-teal-950/40 transition-all flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Création du compte...' : 'Créer mon compte'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="pt-2 text-center">
            <p className="text-xs text-[#8696a0]">
              Déjà un compte ?{' '}
              <Link href="/auth" className="text-[#00a884] font-semibold hover:underline">
                Se connecter
              </Link>
            </p>
          </div>
        </form>
      </div>

      <footer className="py-4 text-center text-xs text-[#8696a0] tracking-widest">
        <p>BAC 2027</p>
      </footer>
    </div>
  );
}
