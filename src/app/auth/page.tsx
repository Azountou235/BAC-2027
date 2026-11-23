'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ChevronLeft, AlertCircle, CheckCircle2, KeyRound } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { useApp } from '@/context/AppContext';
import { Profile } from '@/types';

export default function AuthPage() {
  const router = useRouter();
  const { setCurrentUser, loginAsSeigneur } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Password reset sub-state
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetStep, setResetStep] = useState<1 | 2>(1);
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail) {
      setErrorMessage('Veuillez renseigner votre adresse email.');
      return;
    }

    if (!cleanPassword) {
      setErrorMessage('Veuillez renseigner votre mot de passe.');
      return;
    }

    setLoading(true);

    try {
      // 1. Check Super Admin Credentials (LE SEIGNEUR)
      if (cleanEmail === 'leseigneur235@gmail.com') {
        if (cleanPassword === 'Azountou@2004') {
          loginAsSeigneur();
          router.push('/app/chats');
          return;
        } else {
          setErrorMessage(
            'Non, le mot de passe que vous avez saisi est incorrect. Veuillez ressaisir le mot de passe ou demander la réinitialisation.'
          );
          setLoading(false);
          return;
        }
      }

      // 2. Check Database if account exists
      if (isSupabaseConfigured()) {
        const { data: profileData, error: profileErr } = await supabase
          .from('profiles')
          .select('id, email, full_name, province, series, avatar_url, is_super_admin, is_suspended')
          .eq('email', cleanEmail)
          .maybeSingle();

        // If no profile found in DB
        if (!profileData && !profileErr) {
          // Double check auth users via attempt
          const { error: signInErr } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password: cleanPassword,
          });

          if (signInErr) {
            if (signInErr.message.toLowerCase().includes('invalid login credentials') || signInErr.message.toLowerCase().includes('user not found')) {
              setErrorMessage("Non, ce compte n'existe pas. Veuillez d'abord créer un compte.");
            } else {
              setErrorMessage(
                'Non, le mot de passe que vous avez saisi est incorrect. Veuillez ressaisir le mot de passe ou demander la réinitialisation.'
              );
            }
            setLoading(false);
            return;
          }
        }

        // Attempt password sign in
        const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPassword,
        });

        if (authErr) {
          if (authErr.message.toLowerCase().includes('user not found')) {
            setErrorMessage("Non, ce compte n'existe pas. Veuillez d'abord créer un compte.");
          } else {
            setErrorMessage(
              'Non, le mot de passe que vous avez saisi est incorrect. Veuillez ressaisir le mot de passe ou demander la réinitialisation.'
            );
          }
          setLoading(false);
          return;
        }

        // Successfully authenticated
        if (profileData) {
          setCurrentUser(profileData as Profile);
        } else if (authData.user) {
          const userMeta = authData.user.user_metadata || {};
          const fallbackProfile: Profile = {
            id: authData.user.id,
            email: authData.user.email || cleanEmail,
            full_name: userMeta.full_name || 'Candidat BAC 2027',
            province: userMeta.province || "N'Djamena",
            series: userMeta.series || 'D',
            phone: userMeta.phone,
            phone_privacy: userMeta.phone_privacy || 'private',
            avatar_url: null,
            is_super_admin: cleanEmail === 'leseigneur235@gmail.com',
            is_suspended: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          setCurrentUser(fallbackProfile);
        }

        router.push('/app/chats');
      } else {
        // Fallback local check
        const storedUsers = JSON.parse(localStorage.getItem('bac_registered_users') || '[]');
        const found = storedUsers.find((u: any) => u.email?.toLowerCase() === cleanEmail);

        if (!found) {
          setErrorMessage("Non, ce compte n'existe pas. Veuillez d'abord créer un compte.");
          setLoading(false);
          return;
        }

        if (found.password !== cleanPassword) {
          setErrorMessage(
            'Non, le mot de passe que vous avez saisi est incorrect. Veuillez ressaisir le mot de passe ou demander la réinitialisation.'
          );
          setLoading(false);
          return;
        }

        setCurrentUser(found);
        router.push('/app/chats');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Une erreur est survenue lors de la connexion.');
    } finally {
      setLoading(false);
    }
  };

  // Password reset step 1: Request code
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setResetSuccessMessage(null);

    const cleanEmail = resetEmail.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMessage('Veuillez renseigner votre adresse email.');
      return;
    }

    setLoading(true);
    try {
      if (isSupabaseConfigured()) {
        const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail);
        if (error) {
          setErrorMessage(error.message);
          setLoading(false);
          return;
        }
      }
      setResetSuccessMessage(
        'Un code de réinitialisation a été envoyé à votre adresse email. Veuillez saisir ce code ci-dessous.'
      );
      setResetStep(2);
    } catch (err: any) {
      setErrorMessage(err?.message || "Erreur lors de l'envoi du code.");
    } finally {
      setLoading(false);
    }
  };

  // Password reset step 2: Verify code and set new password
  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setResetSuccessMessage(null);

    if (!resetCode.trim()) {
      setErrorMessage('Veuillez saisir le code reçu par email.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage('Le mot de passe doit comporter au moins 6 caractères.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Les deux mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);
    try {
      if (isSupabaseConfigured()) {
        const { error: otpError } = await supabase.auth.verifyOtp({
          email: resetEmail.trim().toLowerCase(),
          token: resetCode.trim(),
          type: 'recovery',
        });

        if (otpError) {
          setErrorMessage('Le code de vérification est invalide ou a expiré.');
          setLoading(false);
          return;
        }

        const { error: updateError } = await supabase.auth.updateUser({
          password: newPassword,
        });

        if (updateError) {
          setErrorMessage(updateError.message);
          setLoading(false);
          return;
        }
      }

      setResetSuccessMessage(
        'Votre mot de passe a été modifié avec succès ! Vous pouvez maintenant vous connecter.'
      );
      setTimeout(() => {
        setIsResetMode(false);
        setResetStep(1);
        setEmail(resetEmail);
        setPassword('');
        setResetSuccessMessage(null);
      }, 2000);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Erreur lors de la mise à jour du mot de passe.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b141a] text-[#e9edef] flex flex-col justify-between p-4 sm:p-6 font-sans">
      <div className="w-full max-w-sm mx-auto">
        {/* Top Back Navigation */}
        <div className="flex items-center justify-between mb-8 pt-2">
          <Link
            href="/"
            className="p-2 rounded-full bg-[#111b21] border border-[#202c33] text-[#8696a0] hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <span className="text-xs font-bold uppercase tracking-widest text-[#00a884]">
            {isResetMode ? 'Réinitialisation' : 'Connexion'}
          </span>
        </div>

        {/* Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-white mb-1.5">
            {isResetMode ? 'Réinitialiser le mot de passe' : 'Se connecter à mon compte'}
          </h1>
          <p className="text-xs text-[#8696a0] leading-relaxed">
            {isResetMode
              ? 'Recevez un code sécurisé par email pour définir un nouveau mot de passe.'
              : 'Saisissez vos identifiants pour accéder à vos groupes et révisions.'}
          </p>
        </div>

        {/* Feedback Alerts */}
        {errorMessage && (
          <div className="mb-5 p-3.5 bg-red-950/40 border border-red-800/60 rounded-2xl flex items-start gap-2.5 text-xs text-red-300 animate-in fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400 mt-0.5" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {resetSuccessMessage && (
          <div className="mb-5 p-3.5 bg-[#00a884]/15 border border-[#00a884]/40 rounded-2xl flex items-start gap-2.5 text-xs text-[#00a884] animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-[#00a884] mt-0.5" />
            <span className="leading-relaxed">{resetSuccessMessage}</span>
          </div>
        )}

        {/* Form: Standard Login */}
        {!isResetMode ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#8696a0] mb-1.5">
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
                  className="w-full bg-[#111b21] border border-[#202c33] focus:border-[#00a884] rounded-2xl py-3 pl-10 pr-4 text-xs text-white placeholder:text-[#8696a0] outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-[#8696a0]">
                  Mot de passe
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage(null);
                    setResetSuccessMessage(null);
                    setResetEmail(email);
                    setIsResetMode(true);
                  }}
                  className="text-[11px] text-[#00a884] hover:underline"
                >
                  Mot de passe oublié ?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#8696a0] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Votre mot de passe"
                  required
                  className="w-full bg-[#111b21] border border-[#202c33] focus:border-[#00a884] rounded-2xl py-3 pl-10 pr-10 text-xs text-white placeholder:text-[#8696a0] outline-none transition-all"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-4 bg-[#00a884] hover:bg-[#00c99f] active:scale-[0.98] disabled:opacity-50 text-[#111b21] rounded-2xl font-bold text-xs tracking-wide shadow-lg shadow-teal-950/40 transition-all flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Vérification...' : 'Se connecter à mon compte'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-4 text-center">
              <p className="text-xs text-[#8696a0]">
                Pas encore de compte ?{' '}
                <Link href="/signup" className="text-[#00a884] font-semibold hover:underline">
                  Créer un compte
                </Link>
              </p>
            </div>
          </form>
        ) : (
          /* Password Reset Flow */
          <div className="space-y-4">
            {resetStep === 1 ? (
              <form onSubmit={handleRequestReset} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#8696a0] mb-1.5">
                    Adresse email de votre compte
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#8696a0] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="nom@exemple.com"
                      required
                      className="w-full bg-[#111b21] border border-[#202c33] focus:border-[#00a884] rounded-2xl py-3 pl-10 pr-4 text-xs text-white placeholder:text-[#8696a0] outline-none transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 bg-[#00a884] hover:bg-[#00c99f] active:scale-[0.98] disabled:opacity-50 text-[#111b21] rounded-2xl font-bold text-xs tracking-wide shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>{loading ? 'Envoi du code...' : 'Envoyer le code de réinitialisation'}</span>
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsResetMode(false);
                      setErrorMessage(null);
                    }}
                    className="text-xs text-[#8696a0] hover:text-white"
                  >
                    Retour à la connexion
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleConfirmReset} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#8696a0] mb-1.5">
                    Code de vérification (reçu par email)
                  </label>
                  <input
                    type="text"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    placeholder="Ex: 123456"
                    required
                    className="w-full bg-[#111b21] border border-[#202c33] focus:border-[#00a884] rounded-2xl py-3 px-4 text-xs text-white placeholder:text-[#8696a0] outline-none font-mono tracking-widest text-center"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#8696a0] mb-1.5">
                    Nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Au moins 6 caractères"
                    required
                    className="w-full bg-[#111b21] border border-[#202c33] focus:border-[#00a884] rounded-2xl py-3 px-4 text-xs text-white placeholder:text-[#8696a0] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#8696a0] mb-1.5">
                    Confirmer le nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Répétez le mot de passe"
                    required
                    className="w-full bg-[#111b21] border border-[#202c33] focus:border-[#00a884] rounded-2xl py-3 px-4 text-xs text-white placeholder:text-[#8696a0] outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 bg-[#00a884] hover:bg-[#00c99f] active:scale-[0.98] disabled:opacity-50 text-[#111b21] rounded-2xl font-bold text-xs tracking-wide shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{loading ? 'Mise à jour...' : 'Valider le nouveau mot de passe'}</span>
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setResetStep(1);
                      setErrorMessage(null);
                    }}
                    className="text-xs text-[#8696a0] hover:text-white"
                  >
                    Renvoyer un code
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>

      <footer className="py-4 text-center text-xs text-[#8696a0] tracking-widest">
        <p>BAC 2027</p>
      </footer>
    </div>
  );
}
