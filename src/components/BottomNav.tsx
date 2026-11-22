'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageSquare, CircleDashed, Users2, User, ShieldAlert } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export const BottomNav: React.FC = () => {
  const pathname = usePathname();
  const { currentUser, conversationRequests } = useApp();

  const isDiscussions = pathname.startsWith('/app/chats') || pathname === '/app';
  const isActus = pathname === '/app/requests' || pathname.startsWith('/admin/announcements');
  const isCommunautes = pathname.startsWith('/app/groups');
  const isProfil = pathname === '/app/profile' || pathname.startsWith('/app/settings') || pathname.startsWith('/admin');

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0b141a] border-t border-[#202c33] px-2 py-1.5 pb-safe-bottom md:hidden select-none">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* Discussions Tab */}
        <Link
          href="/app/chats"
          className="flex flex-col items-center justify-center py-0.5 px-3 rounded-2xl transition-all"
        >
          <div className={`relative px-4 py-0.5 rounded-full transition-colors ${isDiscussions ? 'bg-[#103629]' : ''}`}>
            <MessageSquare className={`w-5 h-5 ${isDiscussions ? 'text-[#00a884] stroke-[2.5px]' : 'text-[#8696a0]'}`} />
            <span className="absolute -top-1 -right-1 px-1.5 py-0.2 bg-[#00a884] text-[#111b21] font-bold text-[10px] rounded-full min-w-[17px] text-center">
              14
            </span>
          </div>
          <span className={`text-[11px] mt-0.5 font-medium ${isDiscussions ? 'text-white font-bold' : 'text-[#8696a0]'}`}>
            Discussions
          </span>
        </Link>

        {/* Actus Tab */}
        <Link
          href="/app/requests"
          className="flex flex-col items-center justify-center py-0.5 px-3 rounded-2xl transition-all"
        >
          <div className={`relative px-4 py-0.5 rounded-full transition-colors ${isActus ? 'bg-[#103629]' : ''}`}>
            <CircleDashed className={`w-5 h-5 ${isActus ? 'text-[#00a884] stroke-[2.5px]' : 'text-[#8696a0]'}`} />
            <span className="absolute top-0 right-3 w-2 h-2 bg-[#00a884] rounded-full" />
          </div>
          <span className={`text-[11px] mt-0.5 font-medium ${isActus ? 'text-white font-bold' : 'text-[#8696a0]'}`}>
            Actus
          </span>
        </Link>

        {/* Communautés (Groupes A4, D, C) Tab */}
        <Link
          href="/app/groups"
          className="flex flex-col items-center justify-center py-0.5 px-3 rounded-2xl transition-all"
        >
          <div className={`relative px-4 py-0.5 rounded-full transition-colors ${isCommunautes ? 'bg-[#103629]' : ''}`}>
            <Users2 className={`w-5 h-5 ${isCommunautes ? 'text-[#00a884] stroke-[2.5px]' : 'text-[#8696a0]'}`} />
          </div>
          <span className={`text-[11px] mt-0.5 font-medium ${isCommunautes ? 'text-white font-bold' : 'text-[#8696a0]'}`}>
            Communautés
          </span>
        </Link>

        {/* Profil / Admin Tab */}
        <Link
          href="/app/profile"
          className="flex flex-col items-center justify-center py-0.5 px-3 rounded-2xl transition-all"
        >
          <div className={`relative px-4 py-0.5 rounded-full transition-colors ${isProfil ? 'bg-[#103629]' : ''}`}>
            <User className={`w-5 h-5 ${isProfil ? 'text-[#00a884] stroke-[2.5px]' : 'text-[#8696a0]'}`} />
          </div>
          <span className={`text-[11px] mt-0.5 font-medium ${isProfil ? 'text-white font-bold' : 'text-[#8696a0]'}`}>
            {currentUser?.is_super_admin ? 'Admin' : 'Profil'}
          </span>
        </Link>
      </div>
    </nav>
  );
};
