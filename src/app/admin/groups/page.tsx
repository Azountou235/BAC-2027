'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { TopHeader } from '@/components/TopHeader';
import { Lock, Unlock, Users, Shield, Edit3, Check } from 'lucide-react';
import { Series } from '@/types';

export default function AdminGroupsPage() {
  const router = useRouter();
  const { currentUser, groups, adminToggleGroupLock } = useApp();

  if (!currentUser?.is_super_admin) {
    return <div className="p-6 text-center text-white">Accès réservé.</div>;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-10">
      <TopHeader
        title="Gestion des Groupes"
        subtitle="Verrouillage et modération des séries"
        showBack
        onBack={() => router.push('/admin')}
      />

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
          <h2 className="text-sm font-bold text-white mb-1">
            Contrôle des flux de messages
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed mb-4">
            En fermant un groupe, les candidats peuvent continuer à consulter les fiches et l'historique des discussions, mais l'envoi de nouveaux messages est immédiatement bloqué au niveau du serveur.
          </p>

          <div className="space-y-4">
            {groups.map((group) => (
              <div
                key={group.id}
                className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-bold text-white">{group.name}</h3>
                    {group.is_closed ? (
                      <span className="text-[10px] bg-red-950 text-red-400 px-2 py-0.5 rounded-full border border-red-800 font-semibold">
                        Fermé — Lecture seule
                      </span>
                    ) : (
                      <span className="text-[10px] bg-teal-950 text-teal-300 px-2 py-0.5 rounded-full border border-teal-800 font-semibold">
                        Ouvert aux discussions
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 max-w-lg leading-relaxed">
                    {group.description}
                  </p>
                  <p className="text-[11px] text-teal-400 mt-2 font-medium">
                    {group.member_count?.toLocaleString()} candidats inscrits
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => adminToggleGroupLock(group.series, !group.is_closed)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow ${
                      group.is_closed
                        ? 'bg-teal-600 hover:bg-teal-500 text-white'
                        : 'bg-red-600 hover:bg-red-500 text-white'
                    }`}
                  >
                    {group.is_closed ? (
                      <>
                        <Unlock className="w-4 h-4" />
                        <span>Rouvrir le groupe</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Fermer en lecture seule</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
