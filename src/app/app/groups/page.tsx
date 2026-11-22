'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { TopHeader } from '@/components/TopHeader';
import { BottomNav } from '@/components/BottomNav';
import { PWAInstallBanner } from '@/components/PWAInstallBanner';
import { Users2, ArrowRight, Lock, CheckCircle2, Megaphone, Bell, Sparkles } from 'lucide-react';
import { Series } from '@/types';

export default function GroupsPage() {
  const { groups, joinGroup, leaveGroup, announcements, currentUser } = useApp();
  const [activeTab, setActiveTab] = useState<'all' | 'my'>('all');

  const filteredGroups = activeTab === 'all'
    ? groups
    : groups.filter((g) => g.is_member);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-20 md:pb-6">
      <PWAInstallBanner />
      <TopHeader
        title="Groupes Officiels"
        subtitle="Séries A4, D & C — BAC 2027"
        rightAction={
          <Link
            href="/app/requests"
            className="p-2 rounded-full bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            title="Notifications & Demandes"
          >
            <Bell className="w-5 h-5" />
          </Link>
        }
      />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-4 space-y-4">
        {/* Official Announcements Card */}
        {announcements.length > 0 && (
          <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/20 border border-amber-800/40 rounded-3xl p-4 shadow-lg animate-in fade-in">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-1.5">
              <Megaphone className="w-4 h-4" />
              <span>Annonce Officielle</span>
            </div>
            <h3 className="text-sm font-bold text-white mb-1">
              {announcements[0].title}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {announcements[0].content}
            </p>
          </div>
        )}

        {/* Tab switch: Tous les groupes / Mes groupes */}
        <div className="flex bg-slate-900/80 p-1 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
              activeTab === 'all'
                ? 'bg-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Tous les groupes ({groups.length})
          </button>
          <button
            onClick={() => setActiveTab('my')}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
              activeTab === 'my'
                ? 'bg-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Mes groupes ({groups.filter((g) => g.is_member).length})
          </button>
        </div>

        {/* Groups Cards List */}
        <div className="space-y-3.5">
          {filteredGroups.map((group) => {
            const seriesTheme =
              group.series === 'A4'
                ? 'from-amber-600/20 to-teal-900/20 border-amber-800/30 text-amber-400'
                : group.series === 'D'
                ? 'from-teal-600/20 to-emerald-900/20 border-teal-800/30 text-teal-400'
                : 'from-blue-600/20 to-indigo-900/20 border-blue-800/30 text-blue-400';

            return (
              <div
                key={group.id}
                className="bg-slate-900/90 border border-slate-800/80 rounded-3xl p-5 shadow-xl hover:border-slate-700 transition-all flex flex-col justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  {/* Group Series Emblem */}
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${seriesTheme} border flex flex-col items-center justify-center flex-shrink-0 shadow-inner`}>
                    <span className="text-[10px] font-bold uppercase opacity-75">Série</span>
                    <span className="text-xl font-black">{group.series}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h2 className="text-base font-bold text-white truncate">
                        {group.name}
                      </h2>
                      {group.is_closed ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-950/60 text-red-400 border border-red-800/60">
                          <Lock className="w-3 h-3" />
                          Fermé — Lecture seule
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-teal-950/60 text-teal-300 border border-teal-800/50">
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                          Ouvert
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                      {group.description}
                    </p>

                    <div className="flex items-center gap-3 mt-3 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1 font-medium text-slate-300">
                        <Users2 className="w-3.5 h-3.5 text-teal-400" />
                        {group.member_count?.toLocaleString()} candidats inscrits
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                  {group.is_member ? (
                    <>
                      <button
                        onClick={() => leaveGroup(group.series)}
                        className="text-xs text-slate-500 hover:text-red-400 transition-colors font-medium"
                      >
                        Quitter le groupe
                      </button>
                      <Link
                        href={`/app/groups/${group.series.toLowerCase()}`}
                        className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 active:scale-95 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-teal-950/60"
                      >
                        <span>Ouvrir le groupe</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </>
                  ) : (
                    <>
                      <span className="text-xs text-slate-500">Non membre</span>
                      <button
                        onClick={() => joinGroup(group.series)}
                        className="px-5 py-2.5 bg-slate-800 hover:bg-teal-600 text-teal-300 hover:text-white rounded-xl text-xs font-bold transition-all border border-slate-700 hover:border-teal-500"
                      >
                        Rejoindre le groupe
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
