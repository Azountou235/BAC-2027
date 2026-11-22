'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, ArrowRight, ChevronLeft, ShieldCheck, AlertCircle } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validateEmail = (emailStr: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(emailStr);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Veuillez renseigner votre adresse email.');
      return;
    }

    if (!validateEmail(cleanEmail)) {
      setError('Format d’adresse email invalide. Exemple: candidat@gmail.com');
      return;
    }

    setLoading(true);

    try {
      if (isSupabaseConfigured()) {
        const { error: authError } = await supabase.auth.signInWithOtp({
          email: cleanEmail,
          options: {
            shouldCreateUser: true,
          },
        });

        if (authError) {
          setError(authError.message);
          setLoading(false);
          return;
        }
      }

      // Store email temporarily for verification step
      sessionStorage.setItem('pending_verify_email', cleanEmail);

      // Redirect to verification code input screen
      router.push(`/verify?email=${encodeURIComponent(cleanEmail)}`);
    } catch (err: any) {
      setError(err?.message || 'Une erreur est survenue lors de l’envoi du code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6">
      <div className="w-full max-w-md mx-auto">
        {/* Top bar with back */}
        <div className="flex items-center justify-between mb-8 pt-2">
          <Link
            href="/"
            className="p-2 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <span className="text-xs font-semibold uppercase tracking-widest text-teal-400">
            Étape 1 sur 2
          </span>
        </div>

        {/* Header Title */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
            Inscription Candidat
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Entrez votre adresse email pour recevoir votre code de confirmation sécurisé.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3.5 bg-red-950/40 border border-red-800/60 rounded-2xl flex items-center gap-2.5 text-xs text-red-300 animate-in fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Adresse Email
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre.nom@gmail.com"
                required
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Compatible avec Gmail, iCloud, Outlook, Yahoo et toute boîte email valide.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 bg-teal-600 hover:bg-teal-500 active:scale-98 disabled:opacity-50 text-white rounded-2xl font-bold text-sm tracking-wide shadow-xl shadow-teal-950/60 transition-all flex items-center justify-center gap-2 group mt-6"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Recevoir mon code</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-slate-400">
          Vous avez déjà un compte ?{' '}
          <Link href="/auth" className="text-teal-400 font-semibold hover:underline">
            Se connecter
          </Link>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 py-4 text-[11px] text-slate-500">
        <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
        <span>Vérification sécurisée et protection stricte de vos données</span>
      </div>
    </div>
  );
}
