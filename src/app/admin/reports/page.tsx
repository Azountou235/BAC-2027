'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { TopHeader } from '@/components/TopHeader';
import { AlertTriangle, CheckCircle, XCircle, ShieldX, UserX } from 'lucide-react';

export default function AdminReportsPage() {
  const router = useRouter();
  const { currentUser, reports, adminResolveReport, adminSuspendUser } = useApp();
  const [filter, setFilter] = useState<'all' | 'pending' | 'resolved'>('all');

  if (!currentUser?.is_super_admin) {
    return <div className="p-6 text-center text-white">Accès restreint.</div>;
  }

  // Demonstration data if empty
  const displayReports = reports.length > 0 ? reports : [
    {
      id: 'rep_1',
      reporter_id: 'usr_2',
      reported_user_id: 'usr_bad',
      reason: 'Partage de liens publicitaires et propos non scolaires.',
      status: 'pending' as const,
      created_at: new Date(Date.now() - 3600000).toISOString(),
      reporter: {
        id: 'usr_2',
        full_name: 'Mahamat Saleh',
        province: 'Ouaddaï' as const,
        series: 'D' as const,
        is_super_admin: false,
        is_suspended: false,
        phone_privacy: 'private' as const,
        created_at: new Date().toISOString(),
      },
    },
    {
      id: 'rep_2',
      reporter_id: 'usr_3',
      reported_user_id: 'usr_bad2',
      reason: 'Tentative de harcèlement en message privé.',
      status: 'pending' as const,
      created_at: new Date(Date.now() - 7200000).toISOString(),
      reporter: {
        id: 'usr_3',
        full_name: 'Fatimé Ahmat',
        province: "N'Djamena" as const,
        series: 'A4' as const,
        is_super_admin: false,
        is_suspended: false,
        phone_privacy: 'private' as const,
        created_at: new Date().toISOString(),
      },
    },
  ];

  const filtered = displayReports.filter((r) => {
    if (filter === 'all') return true;
    return r.status === filter;
  });

  const handleResolve = async (id: string) => {
    await adminResolveReport(id, 'resolved');
    alert('Signalement traité et marqué comme résolu.');
  };

  const handleDismiss = async (id: string) => {
    await adminResolveReport(id, 'dismissed');
    alert('Signalement classé sans suite.');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-10">
      <TopHeader
        title="Modération & Signalements"
        subtitle="Traitement des abus communautaires"
        showBack
        onBack={() => router.push('/admin')}
      />

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-4">
        {/* Filters */}
        <div className="flex bg-slate-900 p-1 rounded-2xl border border-slate-800 max-w-sm">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-xl ${
              filter === 'all' ? 'bg-teal-600 text-white' : 'text-slate-400'
            }`}
          >
            Tous
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-xl ${
              filter === 'pending' ? 'bg-teal-600 text-white' : 'text-slate-400'
            }`}
          >
            En attente
          </button>
          <button
            onClick={() => setFilter('resolved')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-xl ${
              filter === 'resolved' ? 'bg-teal-600 text-white' : 'text-slate-400'
            }`}
          >
            Traités
          </button>
        </div>

        {/* List of Reports */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center text-slate-500">
              <CheckCircle className="w-12 h-12 text-teal-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-white">Aucun signalement</p>
              <p className="text-xs">La communauté BAC TCHAD 2027 est sereine.</p>
            </div>
          ) : (
            filtered.map((rep) => (
              <div
                key={rep.id}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-red-950/80 border border-red-800/60 text-red-400">
                      <AlertTriangle className="w-4 h-4" />
                    </span>
                    <div>
                      <h3 className="text-xs font-bold text-white">
                        Signalé par {rep.reporter?.full_name || 'un candidat'}
                      </h3>
                      <p className="text-[10px] text-slate-500">
                        {new Date(rep.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      rep.status === 'pending'
                        ? 'bg-amber-950 text-amber-400 border border-amber-800'
                        : 'bg-teal-950 text-teal-400 border border-teal-800'
                    }`}
                  >
                    {rep.status === 'pending' ? 'À traiter' : 'Traité'}
                  </span>
                </div>

                <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-3 text-xs text-slate-300">
                  <span className="text-[11px] font-semibold text-slate-400 block mb-1">Motif :</span>
                  « {rep.reason} »
                </div>

                {rep.status === 'pending' && (
                  <div className="flex items-center gap-2 pt-1 border-t border-slate-800/60">
                    <button
                      onClick={() => handleResolve(rep.id)}
                      className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Résoudre & Avertir</span>
                    </button>
                    <button
                      onClick={() => handleDismiss(rep.id)}
                      className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Rejeter</span>
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
