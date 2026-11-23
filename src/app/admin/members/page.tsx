'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { TopHeader } from '@/components/TopHeader';
import { Search, Filter, ShieldAlert, ShieldCheck, UserX, UserCheck, AlertCircle } from 'lucide-react';
import { CHAD_PROVINCES, Province, Series, PublicProfile } from '@/types';

export default function AdminMembersPage() {
  const router = useRouter();
  const { currentUser, adminSuspendUser, adminRemoveGroupMember } = useApp();

  const [search, setSearch] = useState('');
  const [selectedSeries, setSelectedSeries] = useState<string>('ALL');
  const [selectedProvince, setSelectedProvince] = useState<string>('ALL');

  if (currentUser?.email?.trim().toLowerCase() !== 'leseigneur235@gmail.com') {
    return <div className="p-6 text-center text-white">Accès strictement réservé à Leseigneur235@gmail.com.</div>;
  }

  // Demonstration and actual pool
  const [members, setMembers] = useState<PublicProfile[]>([
    {
      id: 'm1',
      full_name: 'Mahamat Saleh',
      province: "N'Djamena",
      series: 'D',
      is_super_admin: false,
      is_suspended: false,
      phone_privacy: 'private',
      created_at: new Date().toISOString(),
    },
    {
      id: 'm2',
      full_name: 'Mariam Djibrine',
      province: 'Ouaddaï',
      series: 'A4',
      is_super_admin: false,
      is_suspended: false,
      phone_privacy: 'public',
      phone: '+235 99 01 02 03',
      created_at: new Date().toISOString(),
    },
    {
      id: 'm3',
      full_name: 'Brahim Allamine',
      province: 'Kanem',
      series: 'C',
      is_super_admin: false,
      is_suspended: false,
      phone_privacy: 'private',
      created_at: new Date().toISOString(),
    },
    {
      id: 'm4',
      full_name: 'Djimrangar Narcisse',
      province: 'Logone Oriental',
      series: 'D',
      is_super_admin: false,
      is_suspended: true,
      phone_privacy: 'private',
      created_at: new Date().toISOString(),
    },
    {
      id: 'm5',
      full_name: 'Halimé Abderrahim',
      province: 'Guéra',
      series: 'A4',
      is_super_admin: false,
      is_suspended: false,
      phone_privacy: 'private',
      created_at: new Date().toISOString(),
    },
  ]);

  const filteredMembers = members.filter((m) => {
    const matchSearch = m.full_name.toLowerCase().includes(search.toLowerCase());
    const matchSeries = selectedSeries === 'ALL' || m.series === selectedSeries;
    const matchProvince = selectedProvince === 'ALL' || m.province === selectedProvince;
    return matchSearch && matchSeries && matchProvince;
  });

  const handleToggleSuspend = async (member: PublicProfile) => {
    const nextState = !member.is_suspended;
    const action = nextState ? 'suspendre' : 'réactiver';
    if (confirm(`Voulez-vous vraiment ${action} le compte de ${member.full_name} ?`)) {
      await adminSuspendUser(member.id, nextState);
      setMembers((prev) =>
        prev.map((m) => (m.id === member.id ? { ...m, is_suspended: nextState } : m))
      );
    }
  };

  const handleRemoveFromGroup = async (member: PublicProfile) => {
    if (confirm(`Retirer ${member.full_name} du groupe Série ${member.series} ?`)) {
      await adminRemoveGroupMember(member.series, member.id);
      alert(`${member.full_name} a été retiré du groupe.`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-10">
      <TopHeader
        title="Gestion des Candidats"
        subtitle="Supervision des comptes et séries"
        showBack
        onBack={() => router.push('/admin')}
      />

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-4">
        {/* Filters Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par nom..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Filtrer par Série</label>
              <select
                value={selectedSeries}
                onChange={(e) => setSelectedSeries(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none"
              >
                <option value="ALL">Toutes les séries</option>
                <option value="A4">Série A4</option>
                <option value="D">Série D</option>
                <option value="C">Série C</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Filtrer par Province</label>
              <select
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none"
              >
                <option value="ALL">Toutes les provinces</option>
                {CHAD_PROVINCES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Member list */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl divide-y divide-slate-800/80 overflow-hidden shadow-xl">
          {filteredMembers.map((member) => (
            <div key={member.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-teal-400 text-sm font-bold flex-shrink-0">
                  {member.full_name[0]}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-white truncate">{member.full_name}</h3>
                    {member.is_suspended && (
                      <span className="text-[10px] bg-red-950 text-red-400 px-1.5 py-0.2 rounded border border-red-800 font-bold">
                        Suspendu
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Série {member.series} • {member.province}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={() => handleRemoveFromGroup(member)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition-colors"
                >
                  Exclure du groupe
                </button>
                <button
                  onClick={() => handleToggleSuspend(member)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors ${
                    member.is_suspended
                      ? 'bg-teal-600 hover:bg-teal-500 text-white'
                      : 'bg-red-950/60 hover:bg-red-900/60 border border-red-800/60 text-red-300'
                  }`}
                >
                  {member.is_suspended ? (
                    <>
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Réactiver</span>
                    </>
                  ) : (
                    <>
                      <UserX className="w-3.5 h-3.5" />
                      <span>Suspendre</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
