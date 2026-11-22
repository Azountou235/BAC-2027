'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { TopHeader } from '@/components/TopHeader';
import { MemberProfileModal } from '@/components/MemberProfileModal';
import {
  Users2,
  Search,
  Lock,
  LogOut,
  ShieldCheck,
  ChevronRight,
  Shield,
} from 'lucide-react';
import { Series, PublicProfile } from '@/types';

export default function GroupInfoPage() {
  const params = useParams();
  const router = useRouter();
  const seriesParam = ((params?.series as string) || 'd').toUpperCase() as Series;

  const { groups, leaveGroup, currentUser, adminToggleGroupLock } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<PublicProfile | null>(null);

  const group = groups.find((g) => g.series === seriesParam);

  // Mock members for directory browsing
  const sampleMembers: PublicProfile[] = [
    {
      id: 'usr_admin',
      full_name: 'Superviseur National',
      province: "N'Djamena",
      series: seriesParam,
      is_super_admin: true,
      is_suspended: false,
      phone_privacy: 'private',
      created_at: new Date().toISOString(),
    },
    {
      id: 'usr_2',
      full_name: 'Fatimé Ahmat Saleh',
      province: 'Ouaddaï',
      series: seriesParam,
      is_super_admin: false,
      is_suspended: false,
      phone_privacy: 'private',
      created_at: new Date().toISOString(),
    },
    {
      id: 'usr_3',
      full_name: 'Nodjimadji Eric',
      province: 'Logone Occidental',
      series: seriesParam,
      is_super_admin: false,
      is_suspended: false,
      phone_privacy: 'public',
      phone: '+235 66 12 34 56',
      created_at: new Date().toISOString(),
    },
    {
      id: 'usr_4',
      full_name: 'Moussa Djibrine',
      province: 'Chari-Baguirmi',
      series: seriesParam,
      is_super_admin: false,
      is_suspended: false,
      phone_privacy: 'private',
      created_at: new Date().toISOString(),
    },
    {
      id: 'usr_5',
      full_name: 'Zara Mahamat',
      province: 'Kanem',
      series: seriesParam,
      is_super_admin: false,
      is_suspended: false,
      phone_privacy: 'private',
      created_at: new Date().toISOString(),
    },
  ];

  const filteredMembers = sampleMembers.filter(
    (m) =>
      m.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.province.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLeave = async () => {
    if (confirm(`Voulez-vous vraiment quitter le groupe Série ${seriesParam} ?`)) {
      await leaveGroup(seriesParam);
      router.push('/app/groups');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <TopHeader
        title={`Infos Groupe — ${seriesParam}`}
        subtitle="Détails et candidats membres"
        showBack
        onBack={() => router.back()}
      />

      <main className="flex-1 max-w-xl w-full mx-auto p-4 space-y-5">
        {/* Group Header Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center shadow-xl">
          <div className="w-20 h-20 rounded-3xl bg-teal-950/80 border-2 border-teal-500/40 flex items-center justify-center text-teal-300 text-3xl font-black mx-auto mb-3 shadow-lg">
            {seriesParam}
          </div>
          <h1 className="text-xl font-bold text-white mb-1">{group?.name}</h1>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed mb-4">
            {group?.description}
          </p>

          <div className="flex items-center justify-center gap-3">
            <span className="px-3 py-1 bg-slate-800 text-slate-300 text-xs font-semibold rounded-full flex items-center gap-1.5">
              <Users2 className="w-3.5 h-3.5 text-teal-400" />
              {group?.member_count?.toLocaleString()} candidats
            </span>
            {group?.is_closed ? (
              <span className="px-3 py-1 bg-red-950/60 text-red-400 border border-red-800/60 text-xs font-semibold rounded-full flex items-center gap-1">
                <Lock className="w-3 h-3" />
                Fermé
              </span>
            ) : (
              <span className="px-3 py-1 bg-teal-950/60 text-teal-300 border border-teal-800/50 text-xs font-semibold rounded-full">
                Ouvert
              </span>
            )}
          </div>
        </div>

        {/* Super Admin Controls if Admin */}
        {currentUser?.is_super_admin && (
          <div className="bg-blue-950/20 border border-blue-900/40 rounded-3xl p-4">
            <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase mb-3">
              <Shield className="w-4 h-4" />
              <span>Contrôle Administrateur</span>
            </div>
            <button
              onClick={() => adminToggleGroupLock(seriesParam, !group?.is_closed)}
              className={`w-full py-2.5 rounded-xl text-xs font-bold transition-colors ${
                group?.is_closed
                  ? 'bg-teal-600 hover:bg-teal-500 text-white'
                  : 'bg-red-600 hover:bg-red-500 text-white'
              }`}
            >
              {group?.is_closed ? 'Rouvrir le groupe aux candidats' : 'Fermer le groupe en lecture seule'}
            </button>
          </div>
        )}

        {/* Members Directory */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Users2 className="w-4 h-4 text-teal-400" />
              <span>Membres du groupe</span>
            </h2>
            <span className="text-xs text-slate-500">{filteredMembers.length} affichés</span>
          </div>

          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par nom ou province..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Members List */}
          <div className="divide-y divide-slate-800/60 max-h-72 overflow-y-auto">
            {filteredMembers.map((member) => (
              <button
                key={member.id}
                onClick={() => setSelectedMember(member)}
                className="w-full py-3 flex items-center justify-between text-left hover:bg-slate-800/50 px-2 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-teal-400 text-xs font-bold flex-shrink-0">
                    {member.full_name[0]}
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-white truncate flex items-center gap-1">
                      {member.full_name}
                      {member.is_super_admin && (
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                      )}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">{member.province}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </button>
            ))}
          </div>
        </div>

        {/* Leave Group Action */}
        <button
          onClick={handleLeave}
          className="w-full py-3 bg-slate-900 hover:bg-red-950/40 border border-slate-800 hover:border-red-900/40 text-red-400 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Quitter ce groupe</span>
        </button>
      </main>

      {/* Member Profile Modal */}
      {selectedMember && (
        <MemberProfileModal member={selectedMember} onClose={() => setSelectedMember(null)} />
      )}
    </div>
  );
}
