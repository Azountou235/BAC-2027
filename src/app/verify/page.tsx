'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { KeyRound, ArrowRight, RotateCcw, AlertCircle, CheckCircle2, ChevronLeft } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { useApp } from '@/context/AppContext';

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setCurrentUser } = useApp();

  const [email, setEmail] = useState<string>('');
  const [code, setCode] = useState<string[]>(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState<number>(60);
  const [canResend, setCanResend] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const queryEmail = searchParams.get('email') || sessionStorage.getItem('pending_verify_email') || '';
    setEmail(queryEmail);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [searchParams]);

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Paste handling
      const digits = value.replace(/\D/g, '').slice(0, 6).split('');
      const newCode = [...code];
      digits.forEach((d, i) => {
        newCode[i] = d;
      });
      setCode(newCode);
      const nextIndex = Math.min(digits.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = async () => {
    if (!canResend || !email) return;
    setCanResend(false);
    setCountdown(60);
    setError(null);

    if (isSupabaseConfigured()) {
      await supabase.auth.signInWithOtp({ email });
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = code.join('');
    if (token.length !== 6) {
      setError('Veuillez saisir le code complet à 6 chiffres.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isSupabaseConfigured()) {
        const { data, error: verifyError } = await supabase.auth.verifyOtp({
          email,
          token,
          type: 'email',
        });

        if (verifyError) {
          setError(verifyError.message || 'Code de vérification incorrect ou expiré.');
          setLoading(false);
          return;
        }

        // Check if user already has a profile
        if (data.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (profile) {
            setCurrentUser(profile);
            router.push('/app');
            return;
          }
        }
      }

      if (email.toLowerCase() === 'leseigneur235@gmail.com') {
        setCurrentUser({
          id: 'seigneur_super_admin',
          email: 'Leseigneur235@gmail.com',
          full_name: 'LE SEIGNEUR',
          province: "N'Djamena",
          phone: '+235 91 23 45 68',
          phone_privacy: 'public',
          series: 'D',
          avatar_url: null,
          is_super_admin: true,
          is_suspended: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        setSuccess(true);
        setTimeout(() => {
          router.push('/app/chats');
        }, 800);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(`/profile/setup?email=${encodeURIComponent(email)}`);
      }, 800);
    } catch (err: any) {
      setError(err?.message || 'Erreur lors de la validation du code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6">
      <div className="w-full max-w-md mx-auto">
        <div className="flex items-center justify-between mb-8 pt-2">
          <Link
            href="/signup"
            className="p-2 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <span className="text-xs font-semibold uppercase tracking-widest text-teal-400">
            Étape 2 sur 2
          </span>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
            Vérification de l’email
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Un code à 6 chiffres a été envoyé à :
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="font-semibold text-teal-300 text-sm truncate">{email || 'votre email'}</span>
            <Link href="/signup" className="text-xs text-slate-400 underline hover:text-white">
              Modifier
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3.5 bg-red-950/40 border border-red-800/60 rounded-2xl flex items-center gap-2.5 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-3.5 bg-teal-950/40 border border-teal-800/60 rounded-2xl flex items-center gap-2.5 text-xs text-teal-300">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-teal-400" />
            <span>Code validé avec succès ! Redirection vers votre profil...</span>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-6">
          <div className="flex justify-between gap-2 sm:gap-3">
            {code.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => {
                  inputRefs.current[idx] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleInputChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="w-12 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-bold bg-slate-900 border border-slate-800 rounded-2xl text-white focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-500/30 transition-all"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || code.some((d) => !d)}
            className="w-full py-3.5 px-6 bg-teal-600 hover:bg-teal-500 active:scale-98 disabled:opacity-50 text-white rounded-2xl font-bold text-sm tracking-wide shadow-xl shadow-teal-950/60 transition-all flex items-center justify-center gap-2 group"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Confirmer le code</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-slate-400">
          {canResend ? (
            <button
              onClick={handleResend}
              className="text-teal-400 font-semibold hover:underline flex items-center justify-center gap-1.5 mx-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Renvoyer un nouveau code</span>
            </button>
          ) : (
            <p className="text-slate-500">
              Renvoyer le code dans <strong className="text-slate-300 font-mono">{countdown}s</strong>
            </p>
          )}
        </div>
      </div>

      <div className="py-4 text-center text-[11px] text-slate-600">
        BAC TCHAD 2027 • Sécurité renforcée
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-teal-400">Chargement...</div>}>
      <VerifyContent />
    </Suspense>
  );
}
