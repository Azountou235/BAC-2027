export type Province =
  | 'Barh El Gazel'
  | 'Batha'
  | 'Borkou'
  | 'Chari-Baguirmi'
  | 'Ennedi Est'
  | 'Ennedi Ouest'
  | 'Guéra'
  | 'Hadjer-Lamis'
  | 'Kanem'
  | 'Lac'
  | 'Logone Occidental'
  | 'Logone Oriental'
  | 'Mandoul'
  | 'Mayo-Kebbi Est'
  | 'Mayo-Kebbi Ouest'
  | 'Moyen-Chari'
  | "N'Djamena"
  | 'Ouaddaï'
  | 'Salamat'
  | 'Sila'
  | 'Tandjilé'
  | 'Tibesti'
  | 'Wadi Fira';

export const CHAD_PROVINCES: Province[] = [
  'Barh El Gazel',
  'Batha',
  'Borkou',
  'Chari-Baguirmi',
  'Ennedi Est',
  'Ennedi Ouest',
  'Guéra',
  'Hadjer-Lamis',
  'Kanem',
  'Lac',
  'Logone Occidental',
  'Logone Oriental',
  'Mandoul',
  'Mayo-Kebbi Est',
  'Mayo-Kebbi Ouest',
  'Moyen-Chari',
  "N'Djamena",
  'Ouaddaï',
  'Salamat',
  'Sila',
  'Tandjilé',
  'Tibesti',
  'Wadi Fira',
];

export type Series = 'A4' | 'D' | 'C';

export type PhonePrivacy = 'public' | 'private';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  province: Province;
  phone?: string | null;
  phone_privacy: PhonePrivacy;
  series: Series;
  avatar_url?: string | null;
  is_super_admin: boolean;
  is_suspended: boolean;
  last_name_change?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PublicProfile {
  id: string;
  full_name: string;
  province: Province;
  series: Series;
  avatar_url?: string | null;
  is_super_admin: boolean;
  is_suspended: boolean;
  created_at: string;
  phone?: string | null;
  phone_privacy: PhonePrivacy;
  email?: string | null;
  last_name_change?: string | null;
}

export interface Group {
  id: string;
  series: Series;
  name: string;
  description: string;
  image_url?: string | null;
  is_closed: boolean;
  created_at: string;
  updated_at: string;
  member_count?: number;
  is_member?: boolean;
}

export type MessageType = 'text' | 'image' | 'video' | 'document' | 'audio' | 'system';

export type Quality = 'standard' | 'hd' | 'original';

export interface MessageAttachment {
  id: string;
  message_id: string;
  message_kind: 'group' | 'private';
  file_url: string;
  file_name: string;
  file_type: string;
  file_size: number;
  quality: Quality;
  duration?: number;
  created_at: string;
}

export type AllowedEmoji = '❤️' | '😂' | '👍' | '😮' | '😢' | '🔥' | '👏';

export interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: AllowedEmoji;
  created_at: string;
}

export interface ReactionSummary {
  emoji: AllowedEmoji;
  count: number;
  hasReacted: boolean;
}

export interface Message {
  id: string;
  group_id?: string;
  conversation_id?: string;
  sender_id: string;
  content: string;
  reply_to_id?: string | null;
  reply_to_message?: {
    id: string;
    sender_name: string;
    content: string;
  } | null;
  message_type: MessageType;
  is_read?: boolean;
  is_deleted?: boolean;
  is_forwarded?: boolean;
  deleted_for_all?: boolean;
  deleted_for_user_ids?: string[];
  created_at: string;
  sender?: PublicProfile;
  attachments?: MessageAttachment[];
  reactions?: MessageReaction[];
  // Local delivery state
  status?: 'sending' | 'sent' | 'error' | 'pending_offline';
}

export type RequestStatus = 'pending' | 'accepted' | 'rejected' | 'blocked';

export interface ConversationRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: RequestStatus;
  message?: string | null;
  conversation_id?: string | null;
  created_at: string;
  updated_at: string;
  sender?: PublicProfile;
  receiver?: PublicProfile;
}

export interface PrivateConversation {
  id: string;
  other_user: PublicProfile;
  last_message?: Message | null;
  unread_count: number;
  created_at: string;
  updated_at: string;
}

export interface Announcement {
  id: string;
  author_id: string;
  title: string;
  content: string;
  target_series: 'ALL' | Series;
  is_pinned: boolean;
  created_at: string;
  author_name?: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: 'message' | 'request' | 'announcement' | 'group' | 'report';
  data?: Record<string, any>;
  is_read: boolean;
  created_at: string;
}

export interface ReportItem {
  id: string;
  reporter_id: string;
  reported_user_id?: string | null;
  reported_message_id?: string | null;
  message_kind?: 'group' | 'private' | null;
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  action_taken?: string | null;
  created_at: string;
  reporter?: PublicProfile;
  reported_user?: PublicProfile;
}

export interface AdminStats {
  total_users: number;
  members_a4: number;
  members_d: number;
  members_c: number;
  active_users: number;
  total_messages: number;
  total_files: number;
  pending_requests: number;
  pending_reports: number;
  new_users_today: number;
}

export interface AdminLogItem {
  id: string;
  admin_id: string;
  action: string;
  target_type: string;
  target_id?: string | null;
  details?: Record<string, any>;
  created_at: string;
  admin_name?: string;
}
