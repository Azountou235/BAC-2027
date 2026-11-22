'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { BottomNav } from '@/components/BottomNav';
import {
  Camera,
  MoreVertical,
  Search,
  CheckCheck,
  Check,
  VolumeX,
  Volume2,
  Archive,
  Headphones,
  ShieldCheck,
  MessageSquarePlus,
  Pin,
  Trash2,
  X,
  CheckSquare,
  Sparkles,
  PinOff,
} from 'lucide-react';

interface ChatItem {
  id: string;
  name: string;
  isVerified: boolean;
  avatar: string | null;
  initials: string;
  avatarBg: string;
  lastMessage: string;
  time: string;
  isDoubleBlueCheck: boolean;
  unreadCount: number;
  isMuted: boolean;
  isPinned?: boolean;
  isArchived?: boolean;
  href: string;
  category: string;
  isAudio?: boolean;
  isAI?: boolean;
}

const INITIAL_CHATS: ChatItem[] = [
  {
    id: 'meta_ai',
    name: 'BAC Assistant IA 2027',
    isVerified: true,
    avatar: null,
    initials: 'IA',
    avatarBg: 'bg-gradient-to-br from-[#8b5cf6] to-[#00a884] text-white',
    lastMessage: 'Je suis là pour vous aider à réviser vos cours (A4, D, C)...',
    time: 'En ligne',
    isDoubleBlueCheck: true,
    unreadCount: 1,
    isMuted: false,
    isPinned: true,
    href: '/app/chats/ai',
    category: 'all',
    isAI: true,
  },
  {
    id: 'seigneur_self',
    name: 'LE SEIGNEUR (Vous)',
    isVerified: true,
    avatar: null,
    initials: 'LS',
    avatarBg: 'bg-[#00a884]/20 text-[#00a884]',
    lastMessage: '+235 91 23 45 68 • Super Admin Officiel',
    time: '14:59',
    isDoubleBlueCheck: true,
    unreadCount: 0,
    isMuted: false,
    isPinned: true,
    href: '/app/profile',
    category: 'all',
  },
  {
    id: 'grp_d',
    name: 'BAC TCHAD — Série D (Sciences)',
    isVerified: true,
    avatar: null,
    initials: 'D',
    avatarBg: 'bg-[#00a884] text-white',
    lastMessage: '~ LE SEIGNEUR: Fiche révision SVT & Mathématiques disponible',
    time: '14:48',
    isDoubleBlueCheck: false,
    unreadCount: 14,
    isMuted: false,
    isPinned: false,
    href: '/app/groups/d',
    category: 'groups',
  },
  {
    id: 'grp_a4',
    name: 'BAC TCHAD — Série A4 (Lettres)',
    isVerified: true,
    avatar: null,
    initials: 'A4',
    avatarBg: 'bg-[#d97706] text-white',
    lastMessage: '~ Superviseur: Sujets corrigés de Philosophie session 2026',
    time: '14:22',
    isDoubleBlueCheck: false,
    unreadCount: 6,
    isMuted: true,
    isPinned: false,
    href: '/app/groups/a4',
    category: 'groups',
  },
  {
    id: 'grp_c',
    name: 'BAC TCHAD — Série C (Maths & Phys)',
    isVerified: true,
    avatar: null,
    initials: 'C',
    avatarBg: 'bg-[#2563eb] text-white',
    lastMessage: '✓ Vous: Merci pour l’exercice d’arithmétique !',
    time: '13:54',
    isDoubleBlueCheck: false,
    unreadCount: 0,
    isMuted: false,
    isPinned: false,
    href: '/app/groups/c',
    category: 'groups',
  },
  {
    id: 'toumai_labo',
    name: 'TOUMAÏ MD 🇹🇩 LABO',
    isVerified: false,
    avatar: null,
    initials: 'TL',
    avatarBg: 'bg-[#0284c7] text-white',
    lastMessage: '✓ Vous: 🙏 Bonne chance à tous les candidats',
    time: '11:46',
    isDoubleBlueCheck: false,
    unreadCount: 0,
    isMuted: false,
    isPinned: false,
    href: '/app/chats/conv_1',
    category: 'all',
  },
  {
    id: 'fatime_ouaddai',
    name: 'Fatimé Ahmat (Abéché)',
    isVerified: false,
    avatar: null,
    initials: 'FA',
    avatarBg: 'bg-[#ec4899] text-white',
    lastMessage: '🎧 Note vocale (0:34)',
    time: 'Hier',
    isDoubleBlueCheck: true,
    unreadCount: 2,
    isMuted: false,
    isPinned: false,
    href: '/app/chats/conv_1',
    category: 'unread',
    isAudio: true,
  },
  {
    id: 'eric_moundou',
    name: 'Eric Nodjimadji (Moundou)',
    isVerified: false,
    avatar: null,
    initials: 'EN',
    avatarBg: 'bg-[#10b981] text-white',
    lastMessage: 'Tu as la formule du chapitre sur l’électromagnétisme ?',
    time: '17/11/2026',
    isDoubleBlueCheck: false,
    unreadCount: 1,
    isMuted: false,
    isPinned: false,
    href: '/app/chats/conv_2',
    category: 'unread',
  },
];

export default function WhatsAppChatsPage() {
  const router = useRouter();
  const [chats, setChats] = useState<ChatItem[]>(INITIAL_CHATS);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'groups' | 'a4' | 'd' | 'c'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [archivedCount, setArchivedCount] = useState(8);

  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressTriggeredRef = useRef(false);

  const isSelectionMode = selectedIds.length > 0;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Touch Long Press Handlers
  const handleTouchStart = (chatId: string) => {
    isLongPressTriggeredRef.current = false;
    longPressTimerRef.current = setTimeout(() => {
      isLongPressTriggeredRef.current = true;
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(40);
      }
      toggleSelect(chatId);
    }, 450);
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleContextMenu = (e: React.MouseEvent, chatId: string) => {
    e.preventDefault();
    toggleSelect(chatId);
  };

  const toggleSelect = (chatId: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(chatId)) {
        return prev.filter((id) => id !== chatId);
      } else {
        return [...prev, chatId];
      }
    });
  };

  const handleChatClick = (e: React.MouseEvent, chat: ChatItem) => {
    if (isLongPressTriggeredRef.current) {
      e.preventDefault();
      return;
    }
    if (isSelectionMode) {
      e.preventDefault();
      toggleSelect(chat.id);
    } else {
      router.push(chat.href);
    }
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  const selectAll = () => {
    setSelectedIds(filteredChats.map((c) => c.id));
  };

  // Pin Action (Maximum 3 pinned chats!)
  const handleTogglePin = () => {
    const currentlyPinnedCount = chats.filter((c) => c.isPinned).length;
    const selectedChats = chats.filter((c) => selectedIds.includes(c.id));
    const allSelectedArePinned = selectedChats.every((c) => c.isPinned);

    if (allSelectedArePinned) {
      // Unpin all selected
      setChats((prev) =>
        prev.map((c) => (selectedIds.includes(c.id) ? { ...c, isPinned: false } : c))
      );
      showToast('Discussion(s) désépinglée(s)');
    } else {
      // Pin selected
      const unpinnedSelectedCount = selectedChats.filter((c) => !c.isPinned).length;
      if (currentlyPinnedCount + unpinnedSelectedCount > 3) {
        showToast('Vous ne pouvez épingler que jusqu’à 3 discussions.');
        return;
      }
      setChats((prev) =>
        prev.map((c) => (selectedIds.includes(c.id) ? { ...c, isPinned: true } : c))
      );
      showToast('Discussion(s) épinglée(s)');
    }
    clearSelection();
  };

  // Mute Action
  const handleToggleMute = () => {
    setChats((prev) =>
      prev.map((c) => (selectedIds.includes(c.id) ? { ...c, isMuted: !c.isMuted } : c))
    );
    showToast('Notifications mises à jour');
    clearSelection();
  };

  // Archive Action
  const handleArchive = () => {
    setChats((prev) => prev.filter((c) => !selectedIds.includes(c.id)));
    setArchivedCount((prev) => prev + selectedIds.length);
    showToast(`${selectedIds.length} discussion(s) archivée(s)`);
    clearSelection();
  };

  // Delete Action
  const handleDeleteConfirm = () => {
    setChats((prev) => prev.filter((c) => !selectedIds.includes(c.id)));
    setShowDeleteModal(false);
    showToast(`${selectedIds.length} discussion(s) supprimée(s)`);
    clearSelection();
  };

  // Sort chats: Pinned chats first, then chronological
  const sortedChats = [...chats].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return 0;
  });

  const filteredChats = sortedChats.filter((chat) => {
    const matchSearch =
      chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchSearch) return false;
    if (activeFilter === 'unread') return chat.unreadCount > 0;
    if (activeFilter === 'groups') return chat.category === 'groups';
    if (activeFilter === 'a4') return chat.name.includes('A4');
    if (activeFilter === 'd') return chat.name.includes('D');
    if (activeFilter === 'c') return chat.name.includes('C');
    return true;
  });

  const areAllSelectedPinned =
    selectedIds.length > 0 &&
    chats.filter((c) => selectedIds.includes(c.id)).every((c) => c.isPinned);

  return (
    <div className="min-h-screen bg-[#0b141a] text-[#e9edef] flex flex-col pb-20 md:pb-6 font-sans select-none">
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-[#202c33] border border-[#00a884]/40 text-white text-xs px-4 py-2 rounded-full shadow-2xl animate-in fade-in slide-in-from-top-2">
          {toastMessage}
        </div>
      )}

      {/* WhatsApp Top Header OR Contextual Selection Bar */}
      {isSelectionMode ? (
        <header className="sticky top-0 z-30 bg-[#202c33] px-4 py-3 flex items-center justify-between border-b border-[#2a3942] animate-in fade-in duration-150 shadow-md">
          {/* Left: Close selection + Count */}
          <div className="flex items-center gap-4">
            <button
              onClick={clearSelection}
              className="p-1 -ml-1 text-[#aebac1] hover:text-white rounded-full transition-colors"
              title="Annuler la sélection"
            >
              <X className="w-5 h-5" />
            </button>
            <span className="text-base font-bold text-white">
              {selectedIds.length}
            </span>
          </div>

          {/* Right: Actions (Pin, Delete, Mute, Archive, Select All) */}
          <div className="flex items-center gap-4 text-[#aebac1]">
            <button
              onClick={handleTogglePin}
              className="hover:text-white transition-colors"
              title={areAllSelectedPinned ? 'Désépingler' : 'Épingler (max 3)'}
            >
              {areAllSelectedPinned ? <PinOff className="w-5 h-5 text-[#00a884]" /> : <Pin className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setShowDeleteModal(true)}
              className="hover:text-red-400 transition-colors"
              title="Supprimer la discussion"
            >
              <Trash2 className="w-5 h-5" />
            </button>

            <button
              onClick={handleToggleMute}
              className="hover:text-white transition-colors"
              title="Mettre en sourdine"
            >
              <VolumeX className="w-5 h-5" />
            </button>

            <button
              onClick={handleArchive}
              className="hover:text-white transition-colors"
              title="Archiver"
            >
              <Archive className="w-5 h-5" />
            </button>

            <button
              onClick={selectAll}
              className="hover:text-white transition-colors"
              title="Tout sélectionner"
            >
              <CheckSquare className="w-5 h-5" />
            </button>
          </div>
        </header>
      ) : (
        <header className="sticky top-0 z-30 bg-[#0b141a] px-4 pt-3 pb-2 border-b border-[#202c33]/50">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold tracking-tight text-[#00a884] flex items-center gap-1.5">
              <span>BAC TCHAD</span>
            </h1>

            <div className="flex items-center gap-5 text-[#aebac1]">
              <button className="hover:text-white transition-colors" title="Caméra / Partage">
                <Camera className="w-5 h-5" />
              </button>
              <Link href="/admin" className="hover:text-white transition-colors" title="Options / Menu">
                <MoreVertical className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* WhatsApp Search Input */}
          <div className="relative mb-2">
            <Search className="w-4 h-4 text-[#8696a0] absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher des discussions ou des cours..."
              className="w-full bg-[#202c33] border-none rounded-full pl-11 pr-4 py-2 text-xs sm:text-sm text-[#d1d7db] placeholder-[#8696a0] focus:outline-none focus:ring-1 focus:ring-[#00a884]"
            />
          </div>

          {/* Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto py-1.5 scrollbar-none text-xs">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors ${
                activeFilter === 'all'
                  ? 'bg-[#103629] text-[#00a884] border border-[#00a884]/30'
                  : 'bg-[#202c33] text-[#8696a0] hover:text-[#e9edef]'
              }`}
            >
              Toutes
            </button>

            <button
              onClick={() => setActiveFilter('unread')}
              className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap flex items-center gap-1.5 transition-colors ${
                activeFilter === 'unread'
                  ? 'bg-[#103629] text-[#00a884] border border-[#00a884]/30'
                  : 'bg-[#202c33] text-[#8696a0] hover:text-[#e9edef]'
              }`}
            >
              <span>Non lues</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 bg-[#00a884] text-[#111b21] rounded-full">
                14
              </span>
            </button>

            <button
              onClick={() => setActiveFilter('groups')}
              className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap flex items-center gap-1.5 transition-colors ${
                activeFilter === 'groups'
                  ? 'bg-[#103629] text-[#00a884] border border-[#00a884]/30'
                  : 'bg-[#202c33] text-[#8696a0] hover:text-[#e9edef]'
              }`}
            >
              <span>Groupes</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 bg-[#00a884] text-[#111b21] rounded-full">
                3
              </span>
            </button>

            <button
              onClick={() => setActiveFilter('a4')}
              className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors ${
                activeFilter === 'a4'
                  ? 'bg-[#103629] text-[#00a884] border border-[#00a884]/30'
                  : 'bg-[#202c33] text-[#8696a0]'
              }`}
            >
              Série A4
            </button>

            <button
              onClick={() => setActiveFilter('d')}
              className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors ${
                activeFilter === 'd'
                  ? 'bg-[#103629] text-[#00a884] border border-[#00a884]/30'
                  : 'bg-[#202c33] text-[#8696a0]'
              }`}
            >
              Série D
            </button>

            <button
              onClick={() => setActiveFilter('c')}
              className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors ${
                activeFilter === 'c'
                  ? 'bg-[#103629] text-[#00a884] border border-[#00a884]/30'
                  : 'bg-[#202c33] text-[#8696a0]'
              }`}
            >
              Série C
            </button>
          </div>
        </header>
      )}

      {/* Main Chats Scroll View */}
      <main className="flex-1 overflow-y-auto divide-y divide-[#202c33]/40">
        {/* Archived Section Row */}
        <div className="flex items-center justify-between px-4 py-3 hover:bg-[#202c33]/30 cursor-pointer transition-colors">
          <div className="flex items-center gap-4 text-[#8696a0]">
            <Archive className="w-5 h-5 text-[#8696a0]" />
            <span className="text-sm font-semibold text-[#e9edef]">Archivées</span>
          </div>
          <span className="text-xs font-bold text-[#00a884]">{archivedCount}</span>
        </div>

        {/* Chat List Items with Long-Press */}
        {filteredChats.map((chat) => {
          const isSelected = selectedIds.includes(chat.id);

          return (
            <div
              key={chat.id}
              onClick={(e) => handleChatClick(e, chat)}
              onTouchStart={() => handleTouchStart(chat.id)}
              onTouchEnd={handleTouchEnd}
              onTouchMove={handleTouchEnd}
              onContextMenu={(e) => handleContextMenu(e, chat.id)}
              className={`flex items-center gap-3.5 px-4 py-3 cursor-pointer select-none transition-colors ${
                isSelected
                  ? 'bg-[#202c33]/90 border-l-4 border-[#00a884]'
                  : 'hover:bg-[#202c33]/40 active:bg-[#202c33]/70'
              }`}
            >
              {/* Avatar with selection badge */}
              <div className="relative">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 overflow-hidden shadow-inner ${chat.avatarBg}`}
                >
                  {chat.isAI ? (
                    <Sparkles className="w-6 h-6 text-white" />
                  ) : chat.avatar ? (
                    <img src={chat.avatar} alt={chat.name} className="w-full h-full object-cover" />
                  ) : (
                    <span>{chat.initials}</span>
                  )}
                </div>

                {isSelected && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#00a884] text-[#111b21] flex items-center justify-center shadow">
                    <Check className="w-3.5 h-3.5 stroke-[3px]" />
                  </div>
                )}
              </div>

              {/* Chat info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <h3 className="text-sm font-semibold text-[#e9edef] truncate">
                      {chat.name}
                    </h3>
                    {chat.isVerified && (
                      <span title="Officiel / Vérifié">
                        <ShieldCheck className="w-4 h-4 text-[#00a884] fill-[#00a884]/20 flex-shrink-0" />
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 ml-2">
                    {chat.isPinned && (
                      <Pin className="w-3.5 h-3.5 text-[#8696a0] fill-[#8696a0]/20 flex-shrink-0" />
                    )}
                    <span
                      className={`text-[11px] whitespace-nowrap ${
                        chat.unreadCount > 0 ? 'text-[#00a884] font-semibold' : 'text-[#8696a0]'
                      }`}
                    >
                      {chat.time}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-xs text-[#8696a0] truncate flex items-center gap-1">
                    {chat.isDoubleBlueCheck ? (
                      <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb] flex-shrink-0" />
                    ) : (
                      <Check className="w-3.5 h-3.5 text-[#8696a0] flex-shrink-0" />
                    )}
                    {chat.isAudio && <Headphones className="w-3 h-3 text-[#00a884] flex-shrink-0" />}
                    <span className="truncate">{chat.lastMessage}</span>
                  </p>

                  <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
                    {chat.isMuted && <VolumeX className="w-3.5 h-3.5 text-[#8696a0]" />}
                    {chat.unreadCount > 0 && (
                      <span className="min-w-[19px] h-[19px] px-1 rounded-full bg-[#00a884] text-[#111b21] font-bold text-[11px] flex items-center justify-center">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </main>

      {/* Floating Action Button (FAB) */}
      <Link
        href="/app/groups"
        className="fixed bottom-20 right-5 z-30 w-14 h-14 rounded-2xl bg-[#00a884] hover:bg-[#00c99f] text-[#111b21] shadow-2xl flex items-center justify-center transition-transform active:scale-95 shadow-black/50"
        title="Nouvelle discussion"
      >
        <MessageSquarePlus className="w-6 h-6 stroke-[2.2px]" />
      </Link>

      {/* Confirmation Modal: Delete Chat */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-[#1f2c34] border border-[#2a3942] rounded-3xl p-6 max-w-sm w-full text-white shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">
              Supprimer {selectedIds.length > 1 ? `ces ${selectedIds.length} discussions` : 'cette discussion'} ?
            </h3>
            <p className="text-xs text-[#8696a0] leading-relaxed">
              Les messages de cette discussion seront effacés de votre appareil.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-xs font-semibold text-[#00a884] hover:bg-[#2a3942] rounded-xl transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
