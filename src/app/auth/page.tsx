'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, ArrowRight, ChevronLeft, ShieldCheck, AlertCircle, Sparkles, Phone } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { useApp } from '@/context/AppContext';

export default function AuthPage() {
  const router = useRouter();
  const { setCurrentUser, loginAsSeigneur } = useApp();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Veuillez renseigner votre adresse email.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isSupabaseConfigured()) {
        const { error: otpError } = await supabase.auth.signInWithOtp({
          email: cleanEmail,
          options: {
            shouldCreateUser: false,
          },
        });

        if (otpError) {
          setError(otpError.message);
          setLoading(false);
          return;
        }
      }

      sessionStorage.setItem('pending_verify_email', cleanEmail);
      router.push(`/verify?email=${encodeURIComponent(cleanEmail)}`);
    } catch (err: any) {
      setError(err?.message || 'Erreur lors de la connexion.');
    } finally {
      setLoading(false);
    }
  };

  const handleConnectAsSeigneur = () => {
    loginAsSeigneur();
    router.push('/app/chats');
  };

  return (
    <div className="min-h-screen bg-[#0b141a] text-[#e9edef] flex flex-col justify-between p-4 sm:p-6 font-sans">
      <div className="w-full max-w-md mx-auto">
        <div className="flex items-center justify-between mb-8 pt-2">
          <Link
            href="/"
            className="p-2 rounded-full bg-[#202c33] text-[#8696a0] hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <span className="text-xs font-semibold uppercase tracking-widest text-[#00a884]">
            Connexion
          </span>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
            Bon retour parmi nous
          </h1>
          <p className="text-sm text-[#8696a0] leading-relaxed">
            Connectez-vous pour retrouver vos discussions WhatsApp et vos groupes BAC 2027.
          </p>
        </div>

        {/* Quick 1-Click Super Admin Access: LE SEIGNEUR */}
        <div className="mb-6 bg-gradient-to-r from-[#103629] via-[#0b141a] to-[#103629] border border-[#00a884]/40 rounded-3xl p-4 shadow-xl">
          <div className="flex items-center gap-2 text-[#00a884] font-bold text-xs uppercase mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Compte Officiel Super Admin</span>
          </div>
          <h3 className="text-base font-bold text-white flex items-center gap-1.5">
            <span>LE SEIGNEUR</span>
            <ShieldCheck className="w-4 h-4 text-[#00a884]" />
          </h3>
          <p className="text-xs text-[#8696a0] flex items-center gap-1 mt-0.5">
            <Phone className="w-3.5 h-3.5 text-[#00a884]" />
            <strong className="text-white">+235 91 23 45 68</strong> (Public Certifié)
          </p>

          <button
            type="button"
            onClick={handleConnectAsSeigneur}
            className="mt-3.5 w-full py-2.5 px-4 bg-[#00a884] hover:bg-[#00c99f] active:scale-95 text-[#111b21] rounded-xl font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 fill-current" />
            <span>Connexion Directe — LE SEIGNEUR</span>
          </button>
        </div>

        {error && (
          <div className="mb-6 p-3.5 bg-red-950/40 border border-red-800/60 rounded-2xl flex items-center gap-2.5 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#8696a0] uppercase tracking-wider mb-2">
              Adresse Email Candidat
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-[#8696a0] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="candidat@gmail.com"
                required
                className="w-full bg-[#202c33] border border-[#2a3942] rounded-2xl pl-11 pr-4 py-3.5 text-sm text-white placeholder-[#8696a0] focus:outline-none focus:border-[#00a884] transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 bg-[#00a884] hover:bg-[#00c99f] active:scale-98 disabled:opacity-50 text-[#111b21] rounded-2xl font-bold text-sm tracking-wide shadow-xl shadow-teal-950/60 transition-all flex items-center justify-center gap-2 group mt-6"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Continuer avec mon email</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-[#8696a0]">
          Nouveau sur la plateforme ?{' '}
          <Link href="/signup" className="text-[#00a884] font-semibold hover:underline">
            Créer un compte
          </Link>
        </div>
      </div>

      <div className="py-4 text-center text-[11px] text-[#8696a0]">
        BAC TCHAD 2027 • Plateforme Officielle
      </div>
    </div>
  );
}
