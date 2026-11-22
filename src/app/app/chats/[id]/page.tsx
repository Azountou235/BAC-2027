'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { TopHeader } from '@/components/TopHeader';
import { AudioRecorder } from '@/components/AudioRecorder';
import { AudioPlayer } from '@/components/AudioPlayer';
import { EmojiReactionPicker } from '@/components/EmojiReactionPicker';
import { MemberProfileModal } from '@/components/MemberProfileModal';
import { MediaViewerModal } from '@/components/MediaViewerModal';
import {
  Send,
  Paperclip,
  Smile,
  Mic,
  Info,
  Reply,
  X,
  FileText,
  Download,
  Check,
  CheckCheck,
} from 'lucide-react';
import { Message, PublicProfile, AllowedEmoji } from '@/types';

export default function PrivateChatRoomPage() {
  const params = useParams();
  const router = useRouter();
  const convId = params?.id as string;

  const {
    currentUser,
    privateConversations,
    sendPrivateMessage,
  } = useApp();

  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<{ url: string; type: 'image' | 'video'; name: string } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const conversation = privateConversations.find((c) => c.id === convId);
  const otherUser = conversation?.other_user;

  useEffect(() => {
    // Initial welcome message if empty
    if (messages.length === 0 && otherUser) {
      setMessages([
        {
          id: 'welcome_priv',
          conversation_id: convId,
          sender_id: otherUser.id,
          content: 'Bonjour ! Ravi d’échanger avec vous pour les révisions du BAC 2027.',
          message_type: 'text',
          created_at: new Date().toISOString(),
          status: 'sent',
          sender: otherUser,
        },
      ]);
    }
  }, [convId, otherUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageText.trim() || !currentUser) return;

    const content = messageText.trim();
    setMessageText('');

    const newMsg: Message = {
      id: 'local_priv_' + Date.now(),
      conversation_id: convId,
      sender_id: currentUser.id,
      content,
      message_type: 'text',
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
        phone_privacy: currentUser.phone_privacy,
        created_at: currentUser.created_at,
      },
    };

    setMessages((prev) => [...prev, newMsg]);
    await sendPrivateMessage(convId, content);
  };

  const handleAudioSend = async (blob: Blob, duration: number) => {
    setIsRecordingAudio(false);
    const audioUrl = URL.createObjectURL(blob);
    const attachment = {
      id: 'att_' + Date.now(),
      file_url: audioUrl,
      file_name: `Note vocale (${duration}s)`,
      file_type: 'audio/webm',
      file_size: blob.size,
      duration,
      quality: 'standard' as const,
    };

    const newMsg: Message = {
      id: 'local_priv_' + Date.now(),
      conversation_id: convId,
      sender_id: currentUser!.id,
      content: 'Note vocale',
      message_type: 'audio',
      attachments: [attachment as any],
      created_at: new Date().toISOString(),
      status: 'sent',
      sender: {
        id: currentUser!.id,
        full_name: currentUser!.full_name,
        province: currentUser!.province,
        series: currentUser!.series,
        avatar_url: currentUser!.avatar_url,
        is_super_admin: currentUser!.is_super_admin,
        is_suspended: currentUser!.is_suspended,
        phone_privacy: currentUser!.phone_privacy,
        created_at: currentUser!.created_at,
      },
    };

    setMessages((prev) => [...prev, newMsg]);
    await sendPrivateMessage(convId, 'Note vocale', null, [attachment], 'audio');
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 overflow-hidden">
      <TopHeader
        title={otherUser?.full_name || 'Discussion privée'}
        subtitle={`Série ${otherUser?.series || ''} • ${otherUser?.province || ''}`}
        showBack
        onBack={() => router.push('/app/chats')}
        rightAction={
          <button
            onClick={() => setShowProfile(true)}
            className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <Info className="w-5 h-5" />
          </button>
        }
      />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg) => {
          const isMe = msg.sender_id === currentUser?.id;
          const hasAttachments = msg.attachments && msg.attachments.length > 0;

          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] sm:max-w-md rounded-2xl px-3.5 py-2.5 shadow-md ${
                  isMe
                    ? 'bg-teal-600 text-white rounded-tr-sm'
                    : 'bg-slate-800 text-slate-100 rounded-tl-sm border border-slate-700/60'
                }`}
              >
                {hasAttachments &&
                  msg.attachments!.map((att) => (
                    <div key={att.id} className="mb-1.5">
                      {msg.message_type === 'audio' && (
                        <AudioPlayer src={att.file_url} duration={att.duration} isSender={isMe} />
                      )}
                    </div>
                  ))}

                {msg.content && msg.message_type !== 'audio' && (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                )}

                <div className="flex items-center justify-end gap-1 mt-1 text-[10px] opacity-70">
                  <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {isMe && <CheckCheck className="w-3.5 h-3.5 text-teal-200" />}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-3 py-2 pb-safe-bottom">
        {isRecordingAudio ? (
          <AudioRecorder onSend={handleAudioSend} onCancel={() => setIsRecordingAudio(false)} />
        ) : (
          <form onSubmit={handleSend} className="flex items-center gap-2 max-w-4xl mx-auto">
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Écrire un message privé..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
            />
            {messageText.trim() ? (
              <button
                type="submit"
                className="p-3 bg-teal-600 hover:bg-teal-500 active:scale-95 text-white rounded-2xl shadow-lg transition-all"
              >
                <Send className="w-5 h-5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsRecordingAudio(true)}
                className="p-3 bg-slate-800 hover:bg-teal-600 active:scale-95 text-slate-300 hover:text-white rounded-2xl transition-all"
              >
                <Mic className="w-5 h-5" />
              </button>
            )}
          </form>
        )}
      </div>

      {showProfile && otherUser && (
        <MemberProfileModal member={otherUser} onClose={() => setShowProfile(false)} />
      )}
    </div>
  );
}
