'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { TopHeader } from '@/components/TopHeader';
import { MemberProfileModal } from '@/components/MemberProfileModal';
import { RedVerifiedBadge } from '@/components/RedVerifiedBadge';
import {
  Users2,
  Search,
  Lock,
  LogOut,
  ChevronRight,
  Shield,
} from 'lucide-react';
import { Series, PublicProfile } from '@/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

export default function GroupInfoPage() {
  const params = useParams();
  const router = useRouter();
  const seriesParam = ((params?.series as string) || 'd').toUpperCase() as Series;

  const { groups, leaveGroup, currentUser, adminToggleGroupLock } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<PublicProfile | null>(null);
  const [realMembers, setRealMembers] = useState<PublicProfile[]>([]);

  const group = groups.find((g) => g.series === seriesParam);

  // The unique certified Super Admin
  const seigneurAdmin: PublicProfile = {
    id: 'seigneur_super_admin',
    full_name: 'LE SEIGNEUR',
    province: "N'Djamena",
    series: seriesParam,
    is_super_admin: true,
    is_suspended: false,
    phone_privacy: 'public',
    created_at: new Date().toISOString(),
  };

  useEffect(() => {
    async function loadMembers() {
      const list: PublicProfile[] = [seigneurAdmin];

      if (isSupabaseConfigured()) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('id, full_name, province, series, is_super_admin, is_suspended, phone_privacy, avatar_url, created_at')
            .eq('series', seriesParam)
            .neq('email', 'leseigneur235@gmail.com')
            .limit(50);

          if (!error && data) {
            data.forEach((p: any) => {
              list.push({
                id: p.id,
                full_name: p.full_name,
                province: p.province,
                series: p.series,
                is_super_admin: false,
                is_suspended: p.is_suspended || false,
                phone_privacy: p.phone_privacy || 'private',
                avatar_url: p.avatar_url,
                created_at: p.created_at,
              });
            });
          }
        } catch (e) {
          console.error('Erreur chargement membres:', e);
        }
      } else {
        // Load locally created real users
        try {
          const stored = JSON.parse(localStorage.getItem('bac_registered_users') || '[]');
          stored.forEach((u: any) => {
            if (u.series === seriesParam && u.email?.toLowerCase() !== 'leseigneur235@gmail.com') {
              list.push({
                id: u.id,
                full_name: u.full_name,
                province: u.province,
                series: u.series,
                is_super_admin: false,
                is_suspended: false,
                phone_privacy: u.phone_privacy || 'private',
                avatar_url: u.avatar_url,
                created_at: u.created_at,
              });
            }
          });
        } catch (e) {}
      }

      // Add current user if in this series and not already present
      if (currentUser && currentUser.series === seriesParam && !list.some((m) => m.id === currentUser.id)) {
        list.push({
          id: currentUser.id,
          full_name: currentUser.full_name,
          province: currentUser.province,
          series: currentUser.series,
          is_super_admin: currentUser.is_super_admin,
          is_suspended: false,
          phone_privacy: currentUser.phone_privacy,
          avatar_url: currentUser.avatar_url,
          created_at: currentUser.created_at,
        });
      }

      setRealMembers(list);
    }

    loadMembers();
  }, [seriesParam, currentUser]);

  const filteredMembers = realMembers.filter(
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
    <div className="min-h-screen bg-[#0b141a] text-[#e9edef] flex flex-col font-sans">
      <TopHeader
        title={`Infos Groupe — ${seriesParam}`}
        subtitle="Détails et candidats membres"
        showBack
        onBack={() => router.back()}
      />

      <main className="flex-1 max-w-xl w-full mx-auto p-4 space-y-4">
        {/* Group Header Card */}
        <div className="bg-[#111b21] border border-[#202c33] rounded-3xl p-6 text-center shadow-xl">
          <div className="w-20 h-20 rounded-3xl bg-[#00a884]/15 border-2 border-[#00a884]/40 flex items-center justify-center text-[#00a884] text-3xl font-black mx-auto mb-3 shadow-lg">
            {seriesParam}
          </div>
          <h1 className="text-xl font-bold text-white mb-1">{group?.name}</h1>
          <p className="text-xs text-[#8696a0] max-w-sm mx-auto leading-relaxed mb-4">
            {group?.description}
          </p>

          <div className="flex items-center justify-center gap-3">
            <span className="px-3 py-1 bg-[#202c33] text-[#e9edef] text-xs font-semibold rounded-full flex items-center gap-1.5">
              <Users2 className="w-3.5 h-3.5 text-[#00a884]" />
              {realMembers.length} candidat{realMembers.length > 1 ? 's' : ''}
            </span>
            {group?.is_closed ? (
              <span className="px-3 py-1 bg-red-950/60 text-red-400 border border-red-800/60 text-xs font-semibold rounded-full flex items-center gap-1">
                <Lock className="w-3 h-3" />
                Fermé
              </span>
            ) : (
              <span className="px-3 py-1 bg-[#00a884]/15 text-[#00a884] border border-[#00a884]/30 text-xs font-semibold rounded-full">
                Ouvert
              </span>
            )}
          </div>
        </div>

        {/* Super Admin Controls */}
        {currentUser?.is_super_admin && (
          <div className="bg-[#111b21] border border-red-900/40 rounded-3xl p-4">
            <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase mb-3">
              <Shield className="w-4 h-4" />
              <span>Contrôle Super Admin</span>
            </div>
            <button
              onClick={() => adminToggleGroupLock(seriesParam, !group?.is_closed)}
              className={`w-full py-2.5 rounded-xl text-xs font-bold transition-colors ${
                group?.is_closed
                  ? 'bg-[#00a884] hover:bg-[#00c99f] text-[#111b21]'
                  : 'bg-red-600 hover:bg-red-500 text-white'
              }`}
            >
              {group?.is_closed ? 'Rouvrir le groupe aux candidats' : 'Fermer le groupe en lecture seule'}
            </button>
          </div>
        )}

        {/* Members Directory */}
        <div className="bg-[#111b21] border border-[#202c33] rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Users2 className="w-4 h-4 text-[#00a884]" />
              <span>Membres du groupe</span>
            </h2>
            <span className="text-xs text-[#8696a0]">{filteredMembers.length} membre{filteredMembers.length > 1 ? 's' : ''}</span>
          </div>

          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#8696a0] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par nom ou province..."
              className="w-full bg-[#0b141a] border border-[#202c33] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-[#8696a0] focus:outline-none focus:border-[#00a884]"
            />
          </div>

          {/* Members List */}
          <div className="divide-y divide-[#202c33] max-h-80 overflow-y-auto">
            {filteredMembers.map((member) => (
              <button
                key={member.id}
                onClick={() => setSelectedMember(member)}
                className="w-full py-3 flex items-center justify-between text-left hover:bg-[#202c33]/50 px-2 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-[#202c33] border border-[#2a3942] flex items-center justify-center text-[#00a884] text-xs font-bold flex-shrink-0 overflow-hidden">
                    {member.avatar_url ? (
                      <img src={member.avatar_url} alt={member.full_name} className="w-full h-full object-cover" />
                    ) : (
                      member.full_name[0]
                    )}
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                      <span>{member.full_name}</span>
                      {member.is_super_admin && (
                        <RedVerifiedBadge size={15} />
                      )}
                    </p>
                    <p className="text-[11px] text-[#8696a0] truncate">
                      {member.is_super_admin ? 'Super Administrateur Officiel' : `Province : ${member.province}`}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#8696a0]" />
              </button>
            ))}
          </div>
        </div>

        {/* Leave Group Action */}
        <button
          onClick={handleLeave}
          className="w-full py-3 bg-[#111b21] hover:bg-red-950/40 border border-[#202c33] hover:border-red-900/40 text-red-400 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2"
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
