'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { TopHeader } from '@/components/TopHeader';
import {
  Users,
  MessageSquare,
  FileText,
  AlertTriangle,
  ShieldCheck,
  Megaphone,
  Lock,
  Unlock,
  ChevronRight,
  TrendingUp,
  Clock,
  ArrowLeft,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const router = useRouter();
  const {
    currentUser,
    adminStats,
    groups,
    adminToggleGroupLock,
    reports,
    adminLogs,
  } = useApp();

  // Strict Security check: Only Leseigneur235@gmail.com can access Super Admin
  const isAuthorized = currentUser?.email?.trim().toLowerCase() === 'leseigneur235@gmail.com';

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-slate-100">
        <div className="w-16 h-16 rounded-3xl bg-red-950/60 border border-red-800/60 flex items-center justify-center text-red-400 mb-4">
          <Lock className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-white mb-2">Accès Super Admin Restreint</h1>
        <p className="text-xs text-slate-400 max-w-sm mb-6 leading-relaxed">
          Cette zone d'administration est strictement réservée au compte officiel <strong>Leseigneur235@gmail.com</strong>.
        </p>
        <Link
          href="/app/chats"
          className="px-5 py-2.5 bg-slate-900 border border-slate-800 text-[#00a884] rounded-xl text-xs font-semibold"
        >
          Retour à l'application
        </Link>
      </div>
    );
  }

  const pendingReportsCount = reports.filter((r) => r.status === 'pending').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-10">
      <TopHeader
        title="Superviseur BAC TCHAD 2027"
        subtitle="Panneau Super Administrateur Sécurisé"
        showBack
        onBack={() => router.push('/app')}
      />

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Admin Header Banner */}
        <div className="bg-gradient-to-r from-blue-950/60 via-slate-900 to-teal-950/40 border border-blue-800/40 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg flex-shrink-0">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-white">Administration Officielle</h1>
                <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/40 font-bold">
                  Vérifié
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Connecté en tant que <strong className="text-white">{currentUser.full_name}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/announcements"
              className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition-all shadow flex items-center gap-1.5"
            >
              <Megaphone className="w-3.5 h-3.5" />
              <span>Diffuser une annonce</span>
            </Link>
          </div>
        </div>

        {/* Global Statistics Cards */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-teal-400" />
            <span>Statistiques Globales en temps réel</span>
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md">
              <span className="text-[11px] text-slate-400 font-medium block">Total Candidats</span>
              <span className="text-2xl font-black text-white mt-1 block">
                {adminStats.total_users.toLocaleString()}
              </span>
              <span className="text-[10px] text-teal-400 mt-1 block">
                +{adminStats.new_users_today} aujourd'hui
              </span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md">
              <span className="text-[11px] text-slate-400 font-medium block">Actifs en direct</span>
              <span className="text-2xl font-black text-teal-400 mt-1 block">
                {adminStats.active_users.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-500 mt-1 block">Sur la plateforme</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md">
              <span className="text-[11px] text-slate-400 font-medium block">Messages échangés</span>
              <span className="text-2xl font-black text-white mt-1 block">
                {adminStats.total_messages.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-500 mt-1 block">Séries A4, D & C</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md">
              <span className="text-[11px] text-slate-400 font-medium block">Fichiers & Audios</span>
              <span className="text-2xl font-black text-amber-400 mt-1 block">
                {adminStats.total_files.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-500 mt-1 block">Partages scolaires</span>
            </div>
          </div>
        </div>

        {/* Group Controls Quick Toggles */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-teal-400">
              Contrôle direct des groupes (Ouverture / Fermeture)
            </h2>
            <Link href="/admin/groups" className="text-xs text-slate-400 hover:text-white underline">
              Gérer en détail
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {groups.map((g) => (
              <div
                key={g.id}
                className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between"
              >
                <div>
                  <h3 className="text-xs font-bold text-white">Série {g.series}</h3>
                  <p className="text-[11px] text-slate-400">{g.member_count?.toLocaleString()} membres</p>
                </div>

                <button
                  onClick={() => adminToggleGroupLock(g.series, !g.is_closed)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors ${
                    g.is_closed
                      ? 'bg-red-950/60 border border-red-800/60 text-red-300 hover:bg-red-900/60'
                      : 'bg-teal-950/60 border border-teal-800/60 text-teal-300 hover:bg-teal-900/60'
                  }`}
                >
                  {g.is_closed ? (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Fermé</span>
                    </>
                  ) : (
                    <>
                      <Unlock className="w-3.5 h-3.5" />
                      <span>Ouvert</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            href="/admin/members"
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl p-5 flex items-center justify-between shadow-lg transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-950/80 border border-teal-800/60 flex items-center justify-center text-teal-400">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white">Gestion Candidats</h3>
                <p className="text-[11px] text-slate-400">Exclusion & Suspension</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-600" />
          </Link>

          <Link
            href="/admin/reports"
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl p-5 flex items-center justify-between shadow-lg transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-950/80 border border-red-800/60 flex items-center justify-center text-red-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-bold text-white">Signalements</h3>
                  {pendingReportsCount > 0 && (
                    <span className="px-1.5 py-0.2 bg-red-500 text-white font-bold text-[10px] rounded-full">
                      {pendingReportsCount}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">Modération du contenu</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-600" />
          </Link>

          <Link
            href="/admin/logs"
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl p-5 flex items-center justify-between shadow-lg transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white">Journal d'Audit</h3>
                <p className="text-[11px] text-slate-400">Historique des actions</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-600" />
          </Link>
        </div>

        {/* Recent Audit Logs Snapshot */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Dernières actions administratives
            </h2>
            <Link href="/admin/logs" className="text-xs text-teal-400 hover:underline">
              Voir tout le journal
            </Link>
          </div>

          <div className="divide-y divide-slate-800/60 text-xs">
            {adminLogs.length === 0 ? (
              <p className="text-slate-500 py-3 text-center">Aucune action administrative récente.</p>
            ) : (
              adminLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-teal-300">{log.action}</span>
                    <span className="text-slate-400 ml-2">Cible: {log.target_id || log.target_type}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
