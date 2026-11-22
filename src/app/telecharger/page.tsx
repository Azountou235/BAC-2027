'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Download,
  Share,
  PlusSquare,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  Users2,
  Zap,
  BookOpen,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  HelpCircle,
} from 'lucide-react';
import { PWAInstallBanner } from '@/components/PWAInstallBanner';

export default function DownloadPortalPage() {
  const [activePlatform, setActivePlatform] = useState<'android' | 'ios'>('android');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-teal-500">
      <PWAInstallBanner />

      {/* Navigation Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md sticky top-0 z-30 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center shadow">
              <span className="text-white font-black text-xs">BAC</span>
            </div>
            <div>
              <span className="text-sm font-bold text-white block leading-tight">BAC TCHAD 2027</span>
              <span className="text-[10px] text-teal-400 block">Portail de téléchargement officiel</span>
            </div>
          </Link>

          <Link
            href="/app"
            className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-semibold shadow transition-colors"
          >
            Ouvrir l'application
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 px-4 sm:px-6 text-center max-w-3xl mx-auto w-full">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-950/80 border border-teal-800/60 text-teal-300 text-xs font-semibold mb-4 animate-in fade-in">
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
          <span>Version Officielle 2027 • 100% Gratuite</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-4">
          Téléchargez et installez <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-300">
            BAC TCHAD 2027
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto leading-relaxed mb-8">
          La messagerie communautaire officielle réunissant les candidats des séries <strong>A4</strong>, <strong>D</strong> et <strong>C</strong> à travers les 23 provinces de la République du Tchad.
        </p>

        {/* Platform Selector Switch */}
        <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800 max-w-md mx-auto mb-8 shadow-xl">
          <button
            onClick={() => setActivePlatform('android')}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
              activePlatform === 'android'
                ? 'bg-teal-600 text-white shadow-lg shadow-teal-950/60'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Android (APK & PWA)</span>
          </button>
          <button
            onClick={() => setActivePlatform('ios')}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
              activePlatform === 'ios'
                ? 'bg-teal-600 text-white shadow-lg shadow-teal-950/60'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>iPhone / iOS Safari</span>
          </button>
        </div>

        {/* Dynamic Platform Card */}
        {activePlatform === 'android' ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-left shadow-2xl space-y-6 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
              <div>
                <span className="text-xs font-bold text-teal-400 uppercase tracking-wider block mb-1">
                  Recommandé pour tous les smartphones Android
                </span>
                <h3 className="text-xl font-bold text-white">Installation Instantanée sans Store</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Téléchargement direct et mise à jour automatique sans consommer inutilement votre data.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <Link
                  href="/app"
                  className="px-6 py-3.5 bg-teal-600 hover:bg-teal-500 active:scale-95 text-white rounded-2xl font-bold text-sm shadow-xl shadow-teal-950/50 flex items-center justify-center gap-2 transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Installer sur mon téléphone</span>
                </Link>
              </div>
            </div>

            {/* Step-by-Step Guide for Android */}
            <div>
              <h4 className="text-sm font-bold text-white mb-4">Guide pas-à-pas pour Android :</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4">
                  <div className="w-8 h-8 rounded-full bg-teal-950 border border-teal-700/60 text-teal-400 font-black text-sm flex items-center justify-center mb-3">
                    1
                  </div>
                  <h5 className="text-xs font-bold text-white mb-1">Ouvrir dans Google Chrome</h5>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Ouvrez le lien de l'application dans le navigateur Chrome de votre téléphone.
                  </p>
                </div>

                <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4">
                  <div className="w-8 h-8 rounded-full bg-teal-950 border border-teal-700/60 text-teal-400 font-black text-sm flex items-center justify-center mb-3">
                    2
                  </div>
                  <h5 className="text-xs font-bold text-white mb-1">Cliquer sur "Installer"</h5>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Touchez la bannière « Installer BAC TCHAD » qui apparaît en haut ou dans le menu (les 3 points en haut à droite).
                  </p>
                </div>

                <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4">
                  <div className="w-8 h-8 rounded-full bg-teal-950 border border-teal-700/60 text-teal-400 font-black text-sm flex items-center justify-center mb-3">
                    3
                  </div>
                  <h5 className="text-xs font-bold text-white mb-1">L'application est prête</h5>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    L'icône BAC TCHAD 2027 s'ajoute à vos applications, sans barre d'adresse et avec le mode hors-ligne.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-left shadow-2xl space-y-6 animate-in fade-in">
            <div className="border-b border-slate-800/80 pb-6">
              <span className="text-xs font-bold text-teal-400 uppercase tracking-wider block mb-1">
                Optimisé pour iPhone & iPad (Safari iOS)
              </span>
              <h3 className="text-xl font-bold text-white">Guide d'installation iPhone</h3>
              <p className="text-xs text-slate-400 mt-1">
                Apple permet d'installer les applications PWA directement depuis Safari avec prise en charge des notifications push.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4">
                <div className="w-8 h-8 rounded-full bg-teal-950 border border-teal-700/60 text-teal-400 font-black text-sm flex items-center justify-center mb-3">
                  1
                </div>
                <h5 className="text-xs font-bold text-white mb-1 flex items-center gap-1.5">
                  <span>Bouton Partager</span>
                  <Share className="w-3.5 h-3.5 text-blue-400" />
                </h5>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Dans Safari, appuyez sur le bouton de partage au centre en bas de votre écran.
                </p>
              </div>

              <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4">
                <div className="w-8 h-8 rounded-full bg-teal-950 border border-teal-700/60 text-teal-400 font-black text-sm flex items-center justify-center mb-3">
                  2
                </div>
                <h5 className="text-xs font-bold text-white mb-1 flex items-center gap-1.5">
                  <span>Sur l'écran d'accueil</span>
                  <PlusSquare className="w-3.5 h-3.5 text-teal-400" />
                </h5>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Faites défiler la liste vers le bas et sélectionnez <strong>« Sur l'écran d'accueil »</strong>.
                </p>
              </div>

              <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4">
                <div className="w-8 h-8 rounded-full bg-teal-950 border border-teal-700/60 text-teal-400 font-black text-sm flex items-center justify-center mb-3">
                  3
                </div>
                <h5 className="text-xs font-bold text-white mb-1">Confirmer "Ajouter"</h5>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Touchez <strong>Ajouter</strong> en haut à droite. L'application démarre comme une vraie application native.
                </p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Purpose & Value Proposition */}
      <section className="py-12 bg-slate-900/40 border-y border-slate-800/80 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-black text-white">Pourquoi cette application ?</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              L'objectif national de BAC TCHAD 2027 expliqué aux étudiants et parents.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5">
              <div className="w-10 h-10 rounded-2xl bg-teal-950 border border-teal-700/60 flex items-center justify-center text-teal-400 mb-3">
                <Users2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">Filières Spécialisées A4, D, C</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Chaque candidat intègre le groupe officiel correspondant à sa série pour échanger des sujets d'entraînement et des exercices corrigés.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5">
              <div className="w-10 h-10 rounded-2xl bg-amber-950 border border-amber-700/60 flex items-center justify-center text-amber-400 mb-3">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">Faible Consommation de Data</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Optimisé pour les forfaits mobiles au Tchad avec un mode réseau faible spécialement adapté aux connexions 2G et 3G instables.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5">
              <div className="w-10 h-10 rounded-2xl bg-blue-950 border border-blue-700/60 flex items-center justify-center text-blue-400 mb-3">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">Protection des Numéros</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Le numéro personnel est strictement masqué par défaut. Aucun membre ni aucune requête API ne peut y accéder sans autorisation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 px-4 sm:px-6 max-w-2xl mx-auto w-full">
        <h2 className="text-xl font-bold text-white text-center mb-6 flex items-center justify-center gap-2">
          <HelpCircle className="w-5 h-5 text-teal-400" />
          <span>Foire Aux Questions (FAQ)</span>
        </h2>

        <div className="space-y-3">
          {[
            {
              q: "L'application est-elle gratuite ?",
              a: "Oui, BAC TCHAD 2027 est 100% gratuit et libre d'accès pour tous les élèves et candidats de la République du Tchad.",
            },
            {
              q: "Comment rejoindre le groupe de ma série ?",
              a: "Dès votre inscription, choisissez votre série (A4, D ou C). Vous pourrez ensuite ouvrir le groupe de votre série ou explorer les autres groupes.",
            },
            {
              q: "Mon numéro de téléphone est-il visible par les autres ?",
              a: "Non. Par défaut, votre numéro est configuré en mode 'Privé'. Le serveur bloque toute transmission de votre numéro aux autres candidats.",
            },
            {
              q: "L'application fonctionne-t-elle avec une connexion faible ?",
              a: "Oui ! Vous pouvez activer le 'Mode Réseau Faible' dans les paramètres pour bloquer le téléchargement automatique des vidéos lourdes et prioriser les messages texte.",
            },
          ].map((faq, idx) => (
            <div
              key={idx}
              className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden transition-colors"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full p-4 text-left flex items-center justify-between text-xs sm:text-sm font-bold text-white"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform ${
                    openFaq === idx ? 'rotate-180 text-teal-400' : ''
                  }`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-4 pb-4 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-6 border-t border-slate-900 text-center text-xs text-slate-500">
        <p>BAC TCHAD 2027 • Ensemble vers le BAC 2027</p>
      </footer>
    </div>
  );
}
