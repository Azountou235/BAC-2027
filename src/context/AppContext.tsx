'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Profile,
  PublicProfile,
  Group,
  Message,
  Series,
  PrivateConversation,
  ConversationRequest,
  NotificationItem,
  AllowedEmoji,
  Quality,
  AdminStats,
  AdminLogItem,
  Announcement,
  ReportItem,
} from '@/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

export const LE_SEIGNEUR_PROFILE: Profile = {
  id: 'seigneur_super_admin',
  email: 'Leseigneur235@gmail.com',
  full_name: 'LE SEIGNEUR',
  province: "N'Djamena",
  phone: '+235 91 23 45 68',
  phone_privacy: 'public',
  series: 'D',
  avatar_url: null,
  is_super_admin: true,
  is_suspended: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

interface AppContextType {
  currentUser: Profile | null;
  setCurrentUser: (profile: Profile | null) => void;
  loginAsSeigneur: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  groups: Group[];
  groupMessages: Record<string, Message[]>;
  privateConversations: PrivateConversation[];
  conversationRequests: { received: ConversationRequest[]; sent: ConversationRequest[] };
  notifications: NotificationItem[];
  unreadCount: number;
  isOffline: boolean;
  isLowNetworkMode: boolean;
  setLowNetworkMode: (val: boolean) => void;
  theme: 'dark' | 'light' | 'system';
  setTheme: (theme: 'dark' | 'light' | 'system') => void;
  // Messaging actions
  sendGroupMessage: (
    series: Series,
    content: string,
    replyToId?: string | null,
    attachments?: any[],
    messageType?: Message['message_type']
  ) => Promise<boolean>;
  sendPrivateMessage: (
    conversationId: string,
    content: string,
    replyToId?: string | null,
    attachments?: any[],
    messageType?: Message['message_type']
  ) => Promise<boolean>;
  reactToMessage: (messageId: string, kind: 'group' | 'private', emoji: AllowedEmoji) => Promise<void>;
  joinGroup: (series: Series) => Promise<boolean>;
  leaveGroup: (series: Series) => Promise<boolean>;
  sendConversationRequest: (targetUserId: string, message?: string) => Promise<boolean>;
  respondToRequest: (requestId: string, action: 'accept' | 'reject' | 'block') => Promise<boolean>;
  blockUser: (targetUserId: string) => Promise<boolean>;
  reportContent: (reportedUserId: string | null, messageId: string | null, reason: string) => Promise<boolean>;
  logout: () => Promise<void>;
  // Super Admin actions
  adminToggleGroupLock: (series: Series, close: boolean) => Promise<boolean>;
  adminRemoveGroupMember: (series: Series, userId: string) => Promise<boolean>;
  adminSuspendUser: (userId: string, suspend: boolean) => Promise<boolean>;
  adminPublishAnnouncement: (title: string, content: string, targetSeries: 'ALL' | Series) => Promise<boolean>;
  adminResolveReport: (reportId: string, action: 'resolved' | 'dismissed') => Promise<boolean>;
  announcements: Announcement[];
  reports: ReportItem[];
  adminStats: AdminStats;
  adminLogs: AdminLogItem[];
  allProfiles: PublicProfile[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Initial official groups
const INITIAL_GROUPS: Group[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    series: 'A4',
    name: 'BAC TCHAD — Série A4',
    description: 'Groupe officiel Série Littéraire A4. Entraide, fiches de révision en Philo, Français, Histoire-Géo.',
    is_closed: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    member_count: 1420,
    is_member: true,
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    series: 'D',
    name: 'BAC TCHAD — Série D',
    description: 'Groupe officiel Série Scientifique D. Mathématiques, Sciences Physiques et SVT.',
    is_closed: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    member_count: 2890,
    is_member: true,
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    series: 'C',
    name: 'BAC TCHAD — Série C',
    description: 'Groupe officiel Série Mathématiques & Physique-Chimie C.',
    is_closed: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    member_count: 940,
    is_member: true,
  },
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to LE SEIGNEUR if not set
  const [currentUser, setCurrentUser] = useState<Profile | null>(LE_SEIGNEUR_PROFILE);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [groups, setGroups] = useState<Group[]>(INITIAL_GROUPS);
  const [groupMessages, setGroupMessages] = useState<Record<string, Message[]>>({
    A4: [],
    D: [],
    C: [],
  });
  const [privateConversations, setPrivateConversations] = useState<PrivateConversation[]>([]);
  const [privateMessages, setPrivateMessages] = useState<Record<string, Message[]>>({});
  const [conversationRequests, setConversationRequests] = useState<{
    received: ConversationRequest[];
    sent: ConversationRequest[];
  }>({ received: [], sent: [] });
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [allProfiles, setAllProfiles] = useState<PublicProfile[]>([]);
  const [adminLogs, setAdminLogs] = useState<AdminLogItem[]>([]);
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [isLowNetworkMode, setIsLowNetworkMode] = useState<boolean>(false);
  const [theme, setThemeState] = useState<'dark' | 'light' | 'system'>('dark');

  const loginAsSeigneur = () => {
    setCurrentUser(LE_SEIGNEUR_PROFILE);
    localStorage.setItem('bac_tchad_user', JSON.stringify(LE_SEIGNEUR_PROFILE));
  };

  // Network offline detection
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    if (typeof window !== 'undefined') {
      setIsOffline(!navigator.onLine);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      // Restore user session
      try {
        const savedUser = localStorage.getItem('bac_tchad_user');
        if (savedUser) {
          setCurrentUser(JSON.parse(savedUser));
        } else {
          setCurrentUser(LE_SEIGNEUR_PROFILE);
        }
        const savedLowNet = localStorage.getItem('bac_tchad_low_net');
        if (savedLowNet) {
          setIsLowNetworkMode(savedLowNet === 'true');
        }
        const savedTheme = localStorage.getItem('bac_tchad_theme');
        if (savedTheme) {
          setThemeState(savedTheme as any);
        }
      } catch (e) {
        console.error('LocalStorage read error:', e);
      }
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Theme synchronization
  const setTheme = (newTheme: 'dark' | 'light' | 'system') => {
    setThemeState(newTheme);
    localStorage.setItem('bac_tchad_theme', newTheme);
    if (newTheme === 'dark' || (newTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  useEffect(() => {
    if (theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Persist Current User
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('bac_tchad_user', JSON.stringify(currentUser));
    }
  }, [currentUser]);

  const setLowNetworkMode = (val: boolean) => {
    setIsLowNetworkMode(val);
    localStorage.setItem('bac_tchad_low_net', String(val));
  };

  // Seed sample WhatsApp-styled messages and chats
  useEffect(() => {
    const now = new Date();

    if (groupMessages.A4.length === 0 && groupMessages.D.length === 0 && groupMessages.C.length === 0) {
      setGroupMessages({
        A4: [
          {
            id: 'msg-a4-1',
            group_id: '11111111-1111-1111-1111-111111111111',
            sender_id: 'seigneur_super_admin',
            content: 'Bienvenue à tous les candidats de la Série A4 ! Partagez vos dissertations de Philosophie et fiches d’Histoire-Géo.',
            message_type: 'text',
            created_at: new Date(now.getTime() - 7200000).toISOString(),
            status: 'sent',
            sender: {
              id: 'seigneur_super_admin',
              full_name: 'LE SEIGNEUR',
              province: "N'Djamena",
              series: 'D',
              is_super_admin: true,
              is_suspended: false,
              phone: '+235 91 23 45 68',
              phone_privacy: 'public',
              created_at: now.toISOString(),
            },
            reactions: [{ id: 'r1', message_id: 'msg-a4-1', user_id: 'user2', emoji: '🔥', created_at: now.toISOString() }],
          },
        ],
        D: [
          {
            id: 'msg-d-1',
            group_id: '22222222-2222-2222-2222-222222222222',
            sender_id: 'seigneur_super_admin',
            content: 'Bienvenue aux scientifiques de la Série D ! Vous trouverez ici des fiches d’exercices corrigés en Mathématiques, Physique et SVT.',
            message_type: 'text',
            created_at: new Date(now.getTime() - 3600000).toISOString(),
            status: 'sent',
            sender: {
              id: 'seigneur_super_admin',
              full_name: 'LE SEIGNEUR',
              province: "N'Djamena",
              series: 'D',
              is_super_admin: true,
              is_suspended: false,
              phone: '+235 91 23 45 68',
              phone_privacy: 'public',
              created_at: now.toISOString(),
            },
            reactions: [
              { id: 'r2', message_id: 'msg-d-1', user_id: 'user3', emoji: '👍', created_at: now.toISOString() },
              { id: 'r2b', message_id: 'msg-d-1', user_id: 'user4', emoji: '❤️', created_at: now.toISOString() }
            ],
          },
        ],
        C: [
          {
            id: 'msg-c-1',
            group_id: '33333333-3333-3333-3333-333333333333',
            sender_id: 'seigneur_super_admin',
            content: 'Excellence et rigueur pour la Série C. Tous ensemble vers la mention au BAC 2027 !',
            message_type: 'text',
            created_at: new Date(now.getTime() - 1800000).toISOString(),
            status: 'sent',
            sender: {
              id: 'seigneur_super_admin',
              full_name: 'LE SEIGNEUR',
              province: "N'Djamena",
              series: 'C',
              is_super_admin: true,
              is_suspended: false,
              phone: '+235 91 23 45 68',
              phone_privacy: 'public',
              created_at: now.toISOString(),
            },
            reactions: [{ id: 'r3', message_id: 'msg-c-1', user_id: 'user4', emoji: '🔥', created_at: now.toISOString() }],
          },
        ],
      });

      // Sample private WhatsApp-like chats
      setPrivateConversations([
        {
          id: 'conv_1',
          other_user: {
            id: 'usr_fatime',
            full_name: 'Fatimé Ahmat (Ouaddaï)',
            province: 'Ouaddaï',
            series: 'D',
            is_super_admin: false,
            is_suspended: false,
            phone_privacy: 'private',
            created_at: now.toISOString(),
          },
          last_message: {
            id: 'm_last_1',
            sender_id: 'usr_fatime',
            content: 'Merci pour le sujet de physique ! Je vais réviser ce soir.',
            message_type: 'text',
            created_at: new Date(now.getTime() - 600000).toISOString(),
          },
          unread_count: 2,
          created_at: now.toISOString(),
          updated_at: new Date(now.getTime() - 600000).toISOString(),
        },
        {
          id: 'conv_2',
          other_user: {
            id: 'usr_eric',
            full_name: 'Eric Nodjimadji (Moundou)',
            province: 'Logone Occidental',
            series: 'C',
            is_super_admin: false,
            is_suspended: false,
            phone_privacy: 'public',
            phone: '+235 66 12 34 56',
            created_at: now.toISOString(),
          },
          last_message: {
            id: 'm_last_2',
            sender_id: 'usr_eric',
            content: 'Note vocale (0:24)',
            message_type: 'audio',
            created_at: new Date(now.getTime() - 1800000).toISOString(),
          },
          unread_count: 1,
          created_at: now.toISOString(),
          updated_at: new Date(now.getTime() - 1800000).toISOString(),
        },
        {
          id: 'conv_3',
          other_user: {
            id: 'usr_brahim',
            full_name: 'Brahim Allamine (Abéché)',
            province: 'Ouaddaï',
            series: 'A4',
            is_super_admin: false,
            is_suspended: false,
            phone_privacy: 'private',
            created_at: now.toISOString(),
          },
          last_message: {
            id: 'm_last_3',
            sender_id: 'seigneur_super_admin',
            content: 'Tu as compris le corrigé de la dissertation ?',
            message_type: 'text',
            created_at: new Date(now.getTime() - 86400000).toISOString(),
          },
          unread_count: 0,
          created_at: now.toISOString(),
          updated_at: new Date(now.getTime() - 86400000).toISOString(),
        },
      ]);

      setAnnouncements([
        {
          id: 'ann-1',
          author_id: 'seigneur_super_admin',
          author_name: 'LE SEIGNEUR',
          title: 'Calendrier officiel des épreuves du BAC 2027',
          content: 'Le calendrier des épreuves écrites et orales sera publié officiellement. Révisez régulièrement dans vos groupes respectifs.',
          target_series: 'ALL',
          is_pinned: true,
          created_at: now.toISOString(),
        },
      ]);
    }
  }, []);

  const sendGroupMessage = async (
    series: Series,
    content: string,
    replyToId?: string | null,
    attachments?: any[],
    messageType: Message['message_type'] = 'text'
  ): Promise<boolean> => {
    if (!currentUser) return false;

    const targetGroup = groups.find((g) => g.series === series);
    if (targetGroup?.is_closed && !currentUser.is_super_admin) {
      alert('Ce groupe est fermé en lecture seule par LE SEIGNEUR.');
      return false;
    }

    const newMessage: Message = {
      id: 'local_' + Date.now(),
      group_id: targetGroup?.id,
      sender_id: currentUser.id,
      content,
      reply_to_id: replyToId,
      message_type: messageType,
      created_at: new Date().toISOString(),
      status: isOffline ? 'pending_offline' : 'sent',
      sender: {
        id: currentUser.id,
        full_name: currentUser.full_name,
        province: currentUser.province,
        series: currentUser.series,
        avatar_url: currentUser.avatar_url,
        is_super_admin: currentUser.is_super_admin,
        is_suspended: currentUser.is_suspended,
        phone: currentUser.phone,
        phone_privacy: currentUser.phone_privacy,
        created_at: currentUser.created_at,
      },
      attachments: attachments || [],
      reactions: [],
    };

    setGroupMessages((prev) => ({
      ...prev,
      [series]: [...(prev[series] || []), newMessage],
    }));

    return true;
  };

  const sendPrivateMessage = async (
    conversationId: string,
    content: string,
    replyToId?: string | null,
    attachments?: any[],
    messageType: Message['message_type'] = 'text'
  ): Promise<boolean> => {
    if (!currentUser) return false;

    const newMessage: Message = {
      id: 'priv_' + Date.now(),
      conversation_id: conversationId,
      sender_id: currentUser.id,
      content,
      reply_to_id: replyToId,
      message_type: messageType,
      created_at: new Date().toISOString(),
      status: 'sent',
      sender: {
        id: currentUser.id,
        full_name: currentUser.full_name,
        province: currentUser.province,
        series: currentUser.series,
        avatar_url: currentUser.avatar_url,
        is_super_admin: currentUser.is_super_admin,
        is_suspended: currentUser.is_suspended,
        phone: currentUser.phone,
        phone_privacy: currentUser.phone_privacy,
        created_at: currentUser.created_at,
      },
      attachments: attachments || [],
      reactions: [],
    };

    setPrivateMessages((prev) => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), newMessage],
    }));

    return true;
  };

  const reactToMessage = async (messageId: string, kind: 'group' | 'private', emoji: AllowedEmoji) => {
    if (!currentUser) return;
    if (kind === 'group') {
      setGroupMessages((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((seriesKey) => {
          updated[seriesKey] = updated[seriesKey].map((msg) => {
            if (msg.id === messageId) {
              const existing = msg.reactions || [];
              const has = existing.find((r) => r.user_id === currentUser.id);
              return {
                ...msg,
                reactions: has
                  ? existing.filter((r) => r.user_id !== currentUser.id)
                  : [
                      ...existing,
                      {
                        id: 'r_' + Date.now(),
                        message_id: messageId,
                        user_id: currentUser.id,
                        emoji,
                        created_at: new Date().toISOString(),
                      },
                    ],
              };
            }
            return msg;
          });
        });
        return updated;
      });
    }
  };

  const joinGroup = async (series: Series): Promise<boolean> => {
    setGroups((prev) =>
      prev.map((g) => (g.series === series ? { ...g, is_member: true, member_count: (g.member_count || 0) + 1 } : g))
    );
    return true;
  };

  const leaveGroup = async (series: Series): Promise<boolean> => {
    setGroups((prev) =>
      prev.map((g) => (g.series === series ? { ...g, is_member: false, member_count: Math.max(0, (g.member_count || 1) - 1) } : g))
    );
    return true;
  };

  const sendConversationRequest = async (targetUserId: string, message?: string): Promise<boolean> => {
    return true;
  };

  const respondToRequest = async (requestId: string, action: 'accept' | 'reject' | 'block'): Promise<boolean> => {
    return true;
  };

  const blockUser = async (targetUserId: string): Promise<boolean> => {
    alert('Utilisateur bloqué.');
    return true;
  };

  const reportContent = async (reportedUserId: string | null, messageId: string | null, reason: string): Promise<boolean> => {
    alert('Signalement transmis à LE SEIGNEUR.');
    return true;
  };

  const logout = async () => {
    setCurrentUser(null);
    localStorage.removeItem('bac_tchad_user');
    window.location.href = '/';
  };

  const adminToggleGroupLock = async (series: Series, close: boolean): Promise<boolean> => {
    setGroups((prev) =>
      prev.map((g) => (g.series === series ? { ...g, is_closed: close } : g))
    );
    setAdminLogs((prev) => [
      {
        id: 'log_' + Date.now(),
        admin_id: currentUser?.id || 'seigneur',
        admin_name: 'LE SEIGNEUR',
        action: close ? 'FERMETURE_GROUPE' : 'OUVERTURE_GROUPE',
        target_type: 'GROUPE',
        target_id: series,
        details: { series, is_closed: close },
        created_at: new Date().toISOString(),
      },
      ...prev,
    ]);
    return true;
  };

  const adminRemoveGroupMember = async (series: Series, userId: string): Promise<boolean> => {
    return true;
  };

  const adminSuspendUser = async (userId: string, suspend: boolean): Promise<boolean> => {
    return true;
  };

  const adminPublishAnnouncement = async (title: string, content: string, targetSeries: 'ALL' | Series): Promise<boolean> => {
    const newAnn: Announcement = {
      id: 'ann_' + Date.now(),
      author_id: 'seigneur_super_admin',
      author_name: 'LE SEIGNEUR',
      title,
      content,
      target_series: targetSeries,
      is_pinned: true,
      created_at: new Date().toISOString(),
    };
    setAnnouncements((prev) => [newAnn, ...prev]);
    return true;
  };

  const adminResolveReport = async (reportId: string, action: 'resolved' | 'dismissed'): Promise<boolean> => {
    return true;
  };

  const adminStats: AdminStats = {
    total_users: 5250,
    members_a4: 1420,
    members_d: 2890,
    members_c: 940,
    active_users: 3120,
    total_messages: 48920,
    total_files: 3840,
    pending_requests: 3,
    pending_reports: 2,
    new_users_today: 184,
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        loginAsSeigneur,
        isAuthenticated: !!currentUser,
        isLoading,
        groups,
        groupMessages,
        privateConversations,
        conversationRequests,
        notifications,
        unreadCount: 14,
        isOffline,
        isLowNetworkMode,
        setLowNetworkMode,
        theme,
        setTheme,
        sendGroupMessage,
        sendPrivateMessage,
        reactToMessage,
        joinGroup,
        leaveGroup,
        sendConversationRequest,
        respondToRequest,
        blockUser,
        reportContent,
        logout,
        adminToggleGroupLock,
        adminRemoveGroupMember,
        adminSuspendUser,
        adminPublishAnnouncement,
        adminResolveReport,
        announcements,
        reports,
        adminStats,
        adminLogs,
        allProfiles,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
