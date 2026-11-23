'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  Archive,
  Headphones,
  ShieldCheck,
  Pin,
  Trash2,
  X,
  CheckSquare,
  Sparkles,
  PinOff,
  Image as ImageIcon,
  Send,
  Users2,
  UserCheck,
  Clock,
  ArrowRight,
  ArchiveRestore,
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
  isPinned: boolean;
  href: string;
  category: 'group' | 'private' | 'ai' | 'self';
  series?: 'A4' | 'D' | 'C';
  isAudio?: boolean;
  isAI?: boolean;
}

const DEFAULT_CHATS: ChatItem[] = [
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
    category: 'ai',
    isAI: true,
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
    isPinned: true,
    href: '/app/groups/d',
    category: 'group',
    series: 'D',
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
    isMuted: false,
    isPinned: false,
    href: '/app/groups/a4',
    category: 'group',
    series: 'A4',
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
    category: 'group',
    series: 'C',
  },
  {
    id: 'conv_1',
    name: 'Fatimé Ahmat (Ouaddaï)',
    isVerified: false,
    avatar: null,
    initials: 'FA',
    avatarBg: 'bg-[#ec4899] text-white',
    lastMessage: '🎧 Note vocale (0:34)',
    time: '11:46',
    isDoubleBlueCheck: true,
    unreadCount: 2,
    isMuted: false,
    isPinned: false,
    href: '/app/chats/conv_1',
    category: 'private',
    isAudio: true,
  },
  {
    id: 'conv_2',
    name: 'Eric Nodjimadji (Moundou)',
    isVerified: false,
    avatar: null,
    initials: 'EN',
    avatarBg: 'bg-[#10b981] text-white',
    lastMessage: 'Tu as la formule du chapitre sur l’électromagnétisme ?',
    time: 'Hier',
    isDoubleBlueCheck: false,
    unreadCount: 1,
    isMuted: false,
    isPinned: false,
    href: '/app/chats/conv_2',
    category: 'private',
  },
  {
    id: 'conv_3',
    name: 'Brahim Allamine (Abéché)',
    isVerified: false,
    avatar: null,
    initials: 'BA',
    avatarBg: 'bg-[#0284c7] text-white',
    lastMessage: 'Bonne révision pour le bac blanc !',
    time: '18/11/2026',
    isDoubleBlueCheck: true,
    unreadCount: 0,
    isMuted: false,
    isPinned: false,
    href: '/app/chats/conv_3',
    category: 'private',
  },
];

type FilterType = 'all' | 'unread' | 'groups' | 'a4' | 'd' | 'c' | 'archived' | 'requests';

export default function WhatsAppChatsPage() {
  const router = useRouter();
  const {
    currentUser,
    deletedChatIds,
    deleteChat,
    archivedChatIds,
    toggleArchiveChat,
    pinnedChatIds,
    togglePinChat,
    mutedChatIds,
    toggleMuteChat,
    conversationRequests,
    respondToRequest,
    sendGroupMessage,
    sendPrivateMessage,
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Photo & Camera Broadcast Modal
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [selectedMediaFile, setSelectedMediaFile] = useState<string | null>(null);
  const [mediaCaption, setMediaCaption] = useState('');
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>([]);
  const [isSendingMedia, setIsSendingMedia] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressTriggeredRef = useRef(false);

  const isSelectionMode = selectedIds.length > 0;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Build current list of chats incorporating context persistent state
  const availableChats: ChatItem[] = DEFAULT_CHATS
    // Filter out permanently deleted chats
    .filter((c) => !deletedChatIds.includes(c.id))
    // Map with pinned & muted state from AppContext
    .map((c) => ({
      ...c,
      isPinned: pinnedChatIds.includes(c.id),
      isMuted: mutedChatIds.includes(c.id),
    }));

  // Count unread
  const unreadTotal = availableChats.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
  const archivedTotal = archivedChatIds.length;

  // Filter based on active tab
  const getFilteredChats = () => {
    let result = availableChats;

    if (activeFilter === 'archived') {
      // ONLY archived chats
      return result.filter((c) => archivedChatIds.includes(c.id));
    }

    // For all other filters, EXCLUDE archived chats
    result = result.filter((c) => !archivedChatIds.includes(c.id));

    if (activeFilter === 'unread') {
      result = result.filter((c) => c.unreadCount > 0);
    } else if (activeFilter === 'groups') {
      result = result.filter((c) => c.category === 'group');
    } else if (activeFilter === 'a4') {
      result = result.filter((c) => c.series === 'A4');
    } else if (activeFilter === 'd') {
      result = result.filter((c) => c.series === 'D');
    } else if (activeFilter === 'c') {
      result = result.filter((c) => c.series === 'C');
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) => c.name.toLowerCase().includes(q) || c.lastMessage.toLowerCase().includes(q)
      );
    }

    // Sort: Pinned first, then chronological
    return [...result].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return 0;
    });
  };

  const displayedChats = getFilteredChats();

  // Long press handlers
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
    setSelectedIds((prev) =>
      prev.includes(chatId) ? prev.filter((id) => id !== chatId) : [...prev, chatId]
    );
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
    setSelectedIds(displayedChats.map((c) => c.id));
  };

  // Pin Action
  const handleTogglePin = () => {
    let success = true;
    for (const id of selectedIds) {
      const ok = togglePinChat(id);
      if (!ok) success = false;
    }
    if (!success) {
      showToast('Maximum 3 discussions épinglées autorisé.');
    } else {
      showToast('Épinglage mis à jour.');
    }
    clearSelection();
  };

  // Mute Action
  const handleToggleMute = () => {
    selectedIds.forEach((id) => toggleMuteChat(id));
    showToast('Notifications mises à jour.');
    clearSelection();
  };

  // Archive / Unarchive Action
  const handleToggleArchive = () => {
    selectedIds.forEach((id) => toggleArchiveChat(id));
    if (activeFilter === 'archived') {
      showToast(`${selectedIds.length} discussion(s) désarchivée(s).`);
    } else {
      showToast(`${selectedIds.length} discussion(s) archivée(s).`);
    }
    clearSelection();
  };

  // Delete Action (Permanent in context & storage)
  const handleDeleteConfirm = () => {
    selectedIds.forEach((id) => deleteChat(id));
    setShowDeleteModal(false);
    showToast(`${selectedIds.length} discussion(s) supprimée(s) définitivement.`);
    clearSelection();
  };

  // Handle Photo selection from camera / gallery
  const handlePhotoPicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedMediaFile(reader.result as string);
        setSelectedDestinations(['grp_d']); // default select Serie D
      };
      reader.readAsDataURL(file);
    }
  };

  // Broadcast photo to chosen recipients
  const handleBroadcastPhoto = async () => {
    if (!selectedMediaFile || selectedDestinations.length === 0 || isSendingMedia) return;
    setIsSendingMedia(true);

    try {
      const attachment = {
        id: 'att_' + Date.now(),
        file_url: selectedMediaFile,
        file_name: 'Photo_' + Date.now() + '.jpg',
        file_type: 'image/jpeg',
        file_size: 150000,
        quality: 'standard' as const,
      };

      for (const dest of selectedDestinations) {
        if (dest === 'grp_a4') {
          await sendGroupMessage('A4', mediaCaption || 'Photo partagée', null, [attachment], 'image');
        } else if (dest === 'grp_d') {
          await sendGroupMessage('D', mediaCaption || 'Photo partagée', null, [attachment], 'image');
        } else if (dest === 'grp_c') {
          await sendGroupMessage('C', mediaCaption || 'Photo partagée', null, [attachment], 'image');
        } else if (dest.startsWith('conv_')) {
          await sendPrivateMessage(dest, mediaCaption || 'Photo partagée', null, [attachment], 'image');
        }
      }

      showToast(`Photo envoyée avec succès à ${selectedDestinations.length} discussion(s).`);
      setShowMediaModal(false);
      setSelectedMediaFile(null);
      setMediaCaption('');
      setSelectedDestinations([]);
    } catch (err) {
      console.error('Broadcast failed:', err);
      showToast('Erreur lors de l’envoi.');
    } finally {
      setIsSendingMedia(false);
    }
  };

  const isSuperAdmin = currentUser?.email?.trim().toLowerCase() === 'leseigneur235@gmail.com';

  return (
    <div className="min-h-screen bg-[#0b141a] text-[#e9edef] flex flex-col pb-20 md:pb-6 font-sans select-none">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-[#202c33] border border-[#00a884]/40 text-white text-xs px-4 py-2 rounded-full shadow-2xl animate-in fade-in slide-in-from-top-2">
          {toastMessage}
        </div>
      )}

      {/* Top Header or Long-Press Selection Bar */}
      {isSelectionMode ? (
        <header className="sticky top-0 z-30 bg-[#202c33] px-4 py-3 flex items-center justify-between border-b border-[#2a3942] animate-in fade-in duration-150 shadow-md">
          <div className="flex items-center gap-4">
            <button
              onClick={clearSelection}
              className="p-1 -ml-1 text-[#aebac1] hover:text-white rounded-full transition-colors"
              title="Annuler"
            >
              <X className="w-5 h-5" />
            </button>
            <span className="text-base font-bold text-white">{selectedIds.length}</span>
          </div>

          <div className="flex items-center gap-4 text-[#aebac1]">
            <button
              onClick={handleTogglePin}
              className="hover:text-white transition-colors"
              title="Épingler / Désépingler (max 3)"
            >
              <Pin className="w-5 h-5" />
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
              onClick={handleToggleArchive}
              className="hover:text-white transition-colors"
              title={activeFilter === 'archived' ? 'Désarchiver' : 'Archiver'}
            >
              {activeFilter === 'archived' ? (
                <ArchiveRestore className="w-5 h-5 text-[#00a884]" />
              ) : (
                <Archive className="w-5 h-5" />
              )}
            </button>

            <button onClick={selectAll} className="hover:text-white transition-colors" title="Tout sélectionner">
              <CheckSquare className="w-5 h-5" />
            </button>
          </div>
        </header>
      ) : (
        <header className="sticky top-0 z-30 bg-[#0b141a] px-4 pt-3 pb-2 border-b border-[#202c33]/50">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold tracking-tight text-[#00a884] flex items-center gap-1.5">
              <span>BAC TCHAD</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#103629] text-[#00a884] border border-[#00a884]/30">
                2027
              </span>
            </h1>

            <div className="flex items-center gap-5 text-[#aebac1]">
              <button
                onClick={() => setShowMediaModal(true)}
                className="hover:text-white transition-colors"
                title="Prendre ou envoyer une photo"
              >
                <Camera className="w-5 h-5" />
              </button>

              {/* Only show Admin icon if currentUser email is strictly Leseigneur235@gmail.com */}
              {isSuperAdmin ? (
                <Link href="/admin" className="hover:text-[#00a884] transition-colors" title="Panneau Super Admin">
                  <ShieldCheck className="w-5 h-5 text-[#00a884]" />
                </Link>
              ) : (
                <Link href="/app/settings" className="hover:text-white transition-colors" title="Paramètres">
                  <MoreVertical className="w-5 h-5" />
                </Link>
              )}
            </div>
          </div>

          {/* Search Bar */}
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

          {/* Top Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto py-1.5 scrollbar-none text-xs">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap transition-colors ${
                activeFilter === 'all'
                  ? 'bg-[#103629] text-[#00a884] border border-[#00a884]/40'
                  : 'bg-[#202c33] text-[#8696a0] hover:text-[#e9edef]'
              }`}
            >
              TOUT
            </button>

            <button
              onClick={() => setActiveFilter('unread')}
              className={`px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap flex items-center gap-1.5 transition-colors ${
                activeFilter === 'unread'
                  ? 'bg-[#103629] text-[#00a884] border border-[#00a884]/40'
                  : 'bg-[#202c33] text-[#8696a0] hover:text-[#e9edef]'
              }`}
            >
              <span>NON LU</span>
              {unreadTotal > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.2 bg-[#00a884] text-[#111b21] rounded-full">
                  {unreadTotal}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveFilter('groups')}
              className={`px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap flex items-center gap-1.5 transition-colors ${
                activeFilter === 'groups'
                  ? 'bg-[#103629] text-[#00a884] border border-[#00a884]/40'
                  : 'bg-[#202c33] text-[#8696a0] hover:text-[#e9edef]'
              }`}
            >
              <span>GROUPES</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 bg-[#00a884] text-[#111b21] rounded-full">
                3
              </span>
            </button>

            <button
              onClick={() => setActiveFilter('a4')}
              className={`px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap transition-colors ${
                activeFilter === 'a4'
                  ? 'bg-[#103629] text-[#00a884] border border-[#00a884]/40'
                  : 'bg-[#202c33] text-[#8696a0] hover:text-[#e9edef]'
              }`}
            >
              SÉRIE A4
            </button>

            <button
              onClick={() => setActiveFilter('d')}
              className={`px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap transition-colors ${
                activeFilter === 'd'
                  ? 'bg-[#103629] text-[#00a884] border border-[#00a884]/40'
                  : 'bg-[#202c33] text-[#8696a0] hover:text-[#e9edef]'
              }`}
            >
              SÉRIE D
            </button>

            <button
              onClick={() => setActiveFilter('c')}
              className={`px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap transition-colors ${
                activeFilter === 'c'
                  ? 'bg-[#103629] text-[#00a884] border border-[#00a884]/40'
                  : 'bg-[#202c33] text-[#8696a0] hover:text-[#e9edef]'
              }`}
            >
              SÉRIE C
            </button>

            <button
              onClick={() => setActiveFilter('archived')}
              className={`px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap flex items-center gap-1.5 transition-colors ${
                activeFilter === 'archived'
                  ? 'bg-[#103629] text-[#00a884] border border-[#00a884]/40'
                  : 'bg-[#202c33] text-[#8696a0] hover:text-[#e9edef]'
              }`}
            >
              <span>ARCHIVÉES</span>
              {archivedTotal > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.2 bg-[#00a884] text-[#111b21] rounded-full">
                  {archivedTotal}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveFilter('requests')}
              className={`px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap flex items-center gap-1.5 transition-colors ${
                activeFilter === 'requests'
                  ? 'bg-[#103629] text-[#00a884] border border-[#00a884]/40'
                  : 'bg-[#202c33] text-[#8696a0] hover:text-[#e9edef]'
              }`}
            >
              <span>DEMANDES</span>
              {conversationRequests.received.length > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.2 bg-[#00a884] text-[#111b21] rounded-full">
                  {conversationRequests.received.length}
                </span>
              )}
            </button>
          </div>
        </header>
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto divide-y divide-[#202c33]/40">
        {/* If Active Filter is DEMANDES */}
        {activeFilter === 'requests' ? (
          <div className="p-4 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#00a884] flex items-center gap-2">
              <UserCheck className="w-4 h-4" />
              <span>Demandes reçues ({conversationRequests.received.length})</span>
            </h2>

            {conversationRequests.received.length === 0 ? (
              <div className="bg-[#111b21] border border-[#202c33] rounded-2xl p-6 text-center text-xs text-[#8696a0]">
                Aucune demande de conversation reçue pour le moment.
              </div>
            ) : (
              conversationRequests.received.map((req) => (
                <div
                  key={req.id}
                  className="bg-[#111b21] border border-[#202c33] rounded-2xl p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-white">
                        {req.sender?.full_name || 'Candidat'}
                      </h3>
                      <p className="text-[11px] text-[#8696a0]">
                        Série {req.sender?.series} • {req.sender?.province}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        req.status === 'pending'
                          ? 'bg-amber-500/20 text-amber-400'
                          : req.status === 'accepted'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      {req.status === 'pending' ? 'En attente' : req.status}
                    </span>
                  </div>

                  {req.message && (
                    <p className="text-xs text-slate-300 bg-[#202c33] p-2.5 rounded-xl italic">
                      « {req.message} »
                    </p>
                  )}

                  {req.status === 'pending' && (
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => respondToRequest(req.id, 'accept')}
                        className="flex-1 py-1.5 bg-[#00a884] hover:bg-[#00c99f] text-[#111b21] rounded-xl text-xs font-bold transition-colors"
                      >
                        Accepter
                      </button>
                      <button
                        onClick={() => respondToRequest(req.id, 'reject')}
                        className="flex-1 py-1.5 bg-[#202c33] hover:bg-[#2a3942] text-slate-300 rounded-xl text-xs font-semibold transition-colors"
                      >
                        Refuser
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}

            <h2 className="text-xs font-bold uppercase tracking-wider text-[#8696a0] flex items-center gap-2 pt-4">
              <Clock className="w-4 h-4" />
              <span>Demandes envoyées ({conversationRequests.sent.length})</span>
            </h2>

            {conversationRequests.sent.length === 0 ? (
              <div className="bg-[#111b21] border border-[#202c33] rounded-2xl p-6 text-center text-xs text-[#8696a0]">
                Vous n'avez envoyé aucune demande de conversation.
              </div>
            ) : (
              conversationRequests.sent.map((req) => (
                <div
                  key={req.id}
                  className="bg-[#111b21] border border-[#202c33] rounded-2xl p-4 flex items-center justify-between"
                >
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      {req.receiver?.full_name || 'Candidat'}
                    </h3>
                    <p className="text-[11px] text-[#8696a0]">Statut : {req.status}</p>
                  </div>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
                    Envoyée
                  </span>
                </div>
              ))
            )}
          </div>
        ) : (
          <>
            {/* Archived row shortcut when in 'all' view */}
            {activeFilter === 'all' && archivedTotal > 0 && (
              <div
                onClick={() => setActiveFilter('archived')}
                className="flex items-center justify-between px-4 py-3 hover:bg-[#202c33]/30 cursor-pointer transition-colors border-b border-[#202c33]/40"
              >
                <div className="flex items-center gap-4 text-[#8696a0]">
                  <Archive className="w-5 h-5 text-[#8696a0]" />
                  <span className="text-sm font-semibold text-[#e9edef]">Archivées</span>
                </div>
                <span className="text-xs font-bold text-[#00a884]">{archivedTotal}</span>
              </div>
            )}

            {/* Empty state */}
            {displayedChats.length === 0 && (
              <div className="p-8 text-center text-[#8696a0] space-y-2">
                <Archive className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                <p className="text-sm font-semibold text-white">Aucune discussion trouvée</p>
                <p className="text-xs">
                  {activeFilter === 'archived'
                    ? 'Vous n’avez aucune discussion archivée.'
                    : activeFilter === 'unread'
                    ? 'Toutes vos discussions sont à jour !'
                    : 'Aucun message ne correspond à ce filtre.'}
                </p>
              </div>
            )}

            {/* Chat Items */}
            {displayedChats.map((chat) => {
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
                  {/* Avatar */}
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

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <h3 className="text-sm font-semibold text-[#e9edef] truncate">{chat.name}</h3>
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
          </>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-[#1f2c34] border border-[#2a3942] rounded-3xl p-6 max-w-sm w-full text-white shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">
              Supprimer {selectedIds.length > 1 ? `ces ${selectedIds.length} discussions` : 'cette discussion'} ?
            </h3>
            <p className="text-xs text-[#8696a0] leading-relaxed">
              Cette discussion sera définitivement supprimée de votre appareil et ne réapparaîtra plus.
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

      {/* Media Photo & Camera Selection & Broadcast Modal */}
      {showMediaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-[#1f2c34] border border-[#2a3942] rounded-3xl p-5 max-w-md w-full text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#2a3942] pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Camera className="w-4 h-4 text-[#00a884]" />
                <span>Envoyer une photo / document</span>
              </h3>
              <button
                onClick={() => {
                  setShowMediaModal(false);
                  setSelectedMediaFile(null);
                  setMediaCaption('');
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Hidden native inputs */}
            <input
              type="file"
              ref={cameraInputRef}
              accept="image/*"
              capture="environment"
              onChange={handlePhotoPicked}
              className="hidden"
            />
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handlePhotoPicked}
              className="hidden"
            />

            {!selectedMediaFile ? (
              <div className="grid grid-cols-2 gap-3 py-2">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-2 p-5 rounded-2xl bg-[#202c33] hover:bg-[#2a3942] border border-[#2a3942] transition-all text-center"
                >
                  <div className="w-12 h-12 rounded-full bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <Camera className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-semibold text-white">Appareil photo</span>
                  <span className="text-[10px] text-slate-400">Prendre une photo</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-2 p-5 rounded-2xl bg-[#202c33] hover:bg-[#2a3942] border border-[#2a3942] transition-all text-center"
                >
                  <div className="w-12 h-12 rounded-full bg-teal-950/60 border border-teal-500/40 flex items-center justify-center text-teal-400">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-semibold text-white">Galerie photos</span>
                  <span className="text-[10px] text-slate-400">Choisir un fichier</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Image Preview */}
                <div className="relative rounded-2xl overflow-hidden max-h-56 bg-black flex items-center justify-center border border-slate-700">
                  <img src={selectedMediaFile} alt="Preview" className="max-h-56 object-contain w-full" />
                  <button
                    onClick={() => setSelectedMediaFile(null)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white hover:bg-black"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Caption input */}
                <input
                  type="text"
                  value={mediaCaption}
                  onChange={(e) => setMediaCaption(e.target.value)}
                  placeholder="Ajouter une légende (optionnel)..."
                  className="w-full bg-[#202c33] border border-[#2a3942] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#00a884]"
                />

                {/* Recipient Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2">
                    Choisir les destinataires ({selectedDestinations.length} sélectionné(s)) :
                  </label>
                  <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1 text-xs">
                    <p className="text-[10px] uppercase font-bold text-[#00a884] pt-1">Groupes officiels</p>
                    {[
                      { id: 'grp_d', name: 'Série D (Sciences)' },
                      { id: 'grp_a4', name: 'Série A4 (Lettres)' },
                      { id: 'grp_c', name: 'Série C (Maths & Phys)' },
                    ].map((grp) => {
                      const isChecked = selectedDestinations.includes(grp.id);
                      return (
                        <label
                          key={grp.id}
                          className="flex items-center justify-between p-2 rounded-xl bg-[#202c33] hover:bg-[#2a3942] cursor-pointer"
                        >
                          <span className="text-white font-medium">{grp.name}</span>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              setSelectedDestinations((prev) =>
                                isChecked ? prev.filter((x) => x !== grp.id) : [...prev, grp.id]
                              );
                            }}
                            className="rounded accent-[#00a884] w-4 h-4"
                          />
                        </label>
                      );
                    })}

                    <p className="text-[10px] uppercase font-bold text-[#00a884] pt-2">Discussions privées</p>
                    {[
                      { id: 'conv_1', name: 'Fatimé Ahmat (Ouaddaï)' },
                      { id: 'conv_2', name: 'Eric Nodjimadji (Moundou)' },
                      { id: 'conv_3', name: 'Brahim Allamine (Abéché)' },
                    ].map((priv) => {
                      const isChecked = selectedDestinations.includes(priv.id);
                      return (
                        <label
                          key={priv.id}
                          className="flex items-center justify-between p-2 rounded-xl bg-[#202c33] hover:bg-[#2a3942] cursor-pointer"
                        >
                          <span className="text-white font-medium">{priv.name}</span>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              setSelectedDestinations((prev) =>
                                isChecked ? prev.filter((x) => x !== priv.id) : [...prev, priv.id]
                              );
                            }}
                            className="rounded accent-[#00a884] w-4 h-4"
                          />
                        </label>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleBroadcastPhoto}
                  disabled={selectedDestinations.length === 0 || isSendingMedia}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    selectedDestinations.length > 0 && !isSendingMedia
                      ? 'bg-[#00a884] hover:bg-[#00c99f] text-[#111b21] shadow-lg'
                      : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {isSendingMedia
                      ? 'Envoi en cours...'
                      : `Envoyer à ${selectedDestinations.length} discussion(s)`}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Note: The floating "+" button was completely removed as requested */}
      <BottomNav />
    </div>
  );
}
