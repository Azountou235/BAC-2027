'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { AudioRecorder } from '@/components/AudioRecorder';
import { AudioPlayer } from '@/components/AudioPlayer';
import { EmojiReactionPicker } from '@/components/EmojiReactionPicker';
import { MediaViewerModal } from '@/components/MediaViewerModal';
import { MemberProfileModal } from '@/components/MemberProfileModal';
import {
  Send,
  Paperclip,
  Smile,
  Mic,
  MoreVertical,
  ChevronLeft,
  Reply,
  X,
  FileText,
  Lock,
  Download,
  ShieldCheck,
  CheckCheck,
  Check,
  Clock,
  Camera,
  Users2,
} from 'lucide-react';
import { Series, Message, PublicProfile, AllowedEmoji, Quality } from '@/types';
import { compressImage } from '@/lib/storage';

export default function WhatsAppGroupChatPage() {
  const params = useParams();
  const router = useRouter();
  const seriesParam = ((params?.series as string) || 'd').toUpperCase() as Series;

  const {
    currentUser,
    groups,
    groupMessages,
    sendGroupMessage,
    reactToMessage,
  } = useApp();

  const [messageText, setMessageText] = useState('');
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [showEmojiPickerFor, setShowEmojiPickerFor] = useState<string | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<PublicProfile | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<{ url: string; type: 'image' | 'video'; name: string } | null>(null);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [photoQuality, setPhotoQuality] = useState<Quality>('standard');

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const currentGroup = groups.find((g) => g.series === seriesParam);
  const messages = groupMessages[seriesParam] || [];

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  };

  useEffect(() => {
    scrollToBottom(false);
  }, [messages.length]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageText.trim() || !currentUser) return;

    const content = messageText.trim();
    setMessageText('');
    const replyId = replyingTo?.id || null;
    setReplyingTo(null);

    await sendGroupMessage(seriesParam, content, replyId, [], 'text');
    scrollToBottom();
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
      quality: 'standard' as Quality,
    };

    await sendGroupMessage(seriesParam, 'Note vocale', replyingTo?.id || null, [attachment], 'audio');
    setReplyingTo(null);
    scrollToBottom();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    setShowAttachmentMenu(false);

    let finalFile = file;
    let msgType: Message['message_type'] = 'document';

    if (file.type.startsWith('image/')) {
      msgType = 'image';
      finalFile = await compressImage(file, photoQuality);
    } else if (file.type.startsWith('video/')) {
      msgType = 'video';
    }

    const fileUrl = URL.createObjectURL(finalFile);
    const attachment = {
      id: 'att_' + Date.now(),
      file_url: fileUrl,
      file_name: file.name,
      file_type: file.type,
      file_size: finalFile.size,
      quality: photoQuality,
    };

    await sendGroupMessage(
      seriesParam,
      msgType === 'image' ? 'Photo' : msgType === 'video' ? 'Vidéo' : file.name,
      replyingTo?.id || null,
      [attachment],
      msgType
    );
    setReplyingTo(null);
    scrollToBottom();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const isClosed = currentGroup?.is_closed && !currentUser?.is_super_admin;

  return (
    <div className="flex flex-col h-screen bg-[#0b141a] text-[#e9edef] overflow-hidden font-sans">
      {/* WhatsApp Chat Room Header */}
      <header className="sticky top-0 z-30 bg-[#202c33] px-3 py-2 flex items-center justify-between border-b border-[#2a3942] select-none shadow-md">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={() => router.push('/app/chats')}
            className="p-1 -ml-1 text-[#aebac1] hover:text-white rounded-full transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <Link
            href={`/app/groups/${seriesParam.toLowerCase()}/info`}
            className="flex items-center gap-2.5 min-w-0"
          >
            <div className="w-9 h-9 rounded-full bg-[#00a884] text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
              {seriesParam}
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-[#e9edef] truncate flex items-center gap-1.5">
                <span>{currentGroup?.name || `BAC TCHAD Série ${seriesParam}`}</span>
                <ShieldCheck className="w-4 h-4 text-[#00a884]" />
              </h2>
              <p className="text-[11px] text-[#8696a0] truncate">
                {currentGroup?.member_count?.toLocaleString()} candidats inscrits
              </p>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3 text-[#aebac1]">
          <Link
            href={`/app/groups/${seriesParam.toLowerCase()}/info`}
            className="p-1.5 hover:text-white transition-colors"
          >
            <MoreVertical className="w-5 h-5" />
          </Link>
        </div>
      </header>

      {/* Closed Group Banner Notification */}
      {currentGroup?.is_closed && (
        <div className="bg-[#182229] border-b border-[#3b4a54] px-4 py-2 text-center text-xs font-medium text-[#ffd279] flex items-center justify-center gap-2">
          <Lock className="w-3.5 h-3.5 text-[#ffd279]" />
          <span>Ce groupe est temporairement fermé en lecture seule par LE SEIGNEUR.</span>
        </div>
      )}

      {/* WhatsApp Wallpaper Chat Scroll View */}
      <div
        className="flex-1 overflow-y-auto px-3 sm:px-6 py-3 space-y-2.5"
        style={{
          backgroundColor: '#0b141a',
          backgroundImage: 'radial-gradient(rgba(32, 44, 51, 0.4) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      >
        {/* Encryption & Mission Pill Notice */}
        <div className="flex justify-center my-2">
          <div className="bg-[#182229] border border-[#2a3942] rounded-xl px-3 py-1.5 text-center max-w-xs shadow">
            <p className="text-[11px] text-[#ffd279] flex items-center justify-center gap-1">
              <Lock className="w-3 h-3 flex-shrink-0" />
              <span>Les messages scolaires sont protégés et modérés par LE SEIGNEUR.</span>
            </p>
          </div>
        </div>

        {messages.map((msg) => {
          const isMe = msg.sender_id === currentUser?.id;
          const sender = msg.sender;
          const hasAttachments = msg.attachments && msg.attachments.length > 0;

          return (
            <div
              key={msg.id}
              className={`flex max-w-full ${isMe ? 'justify-end' : 'justify-start'} group`}
            >
              <div
                className={`relative max-w-[85%] sm:max-w-md rounded-2xl px-3 py-2 shadow-sm text-sm ${
                  isMe
                    ? 'bg-[#005c4b] text-[#e9edef] rounded-tr-none'
                    : 'bg-[#202c33] text-[#e9edef] rounded-tl-none'
                }`}
              >
                {/* Sender Name in Group */}
                {!isMe && (
                  <div className="flex items-center gap-1.5 mb-1 cursor-pointer" onClick={() => sender && setSelectedProfile(sender)}>
                    <span className="text-xs font-bold text-[#53bdeb] hover:underline">
                      {sender?.full_name || 'Candidat'}
                    </span>
                    {sender?.is_super_admin && (
                      <span className="flex items-center gap-0.5 text-[9px] bg-[#00a884]/20 text-[#00a884] px-1 py-0.2 rounded font-bold">
                        <ShieldCheck className="w-3 h-3 text-[#00a884]" />
                        Officiel
                      </span>
                    )}
                    <span className="text-[10px] text-[#8696a0]">• {sender?.province}</span>
                  </div>
                )}

                {/* Quoted Message Preview */}
                {msg.reply_to_id && (
                  <div className="bg-[#111b21]/60 border-l-4 border-[#00a884] rounded p-2 text-xs mb-1.5 opacity-90">
                    <span className="font-semibold text-[#00a884] text-[11px] block">Réponse</span>
                    <p className="truncate text-[11px] text-[#8696a0]">Message d’origine</p>
                  </div>
                )}

                {/* Attachments */}
                {hasAttachments &&
                  msg.attachments!.map((att) => (
                    <div key={att.id} className="mb-1.5">
                      {msg.message_type === 'image' && (
                        <div
                          onClick={() => setSelectedMedia({ url: att.file_url, type: 'image', name: att.file_name })}
                          className="rounded-xl overflow-hidden cursor-pointer"
                        >
                          <img src={att.file_url} alt="" className="w-full max-h-72 object-cover rounded-xl" />
                        </div>
                      )}

                      {msg.message_type === 'video' && (
                        <div className="rounded-xl overflow-hidden">
                          <video src={att.file_url} controls className="w-full max-h-72 rounded-xl" />
                        </div>
                      )}

                      {msg.message_type === 'audio' && (
                        <AudioPlayer src={att.file_url} duration={att.duration} isSender={isMe} />
                      )}

                      {msg.message_type === 'document' && (
                        <a
                          href={att.file_url}
                          download={att.file_name}
                          className="flex items-center gap-3 p-2.5 rounded-xl bg-[#111b21]/70 border border-[#2a3942] text-white"
                        >
                          <FileText className="w-6 h-6 text-[#00a884]" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold truncate">{att.file_name}</p>
                            <p className="text-[10px] text-[#8696a0]">
                              {(att.file_size / (1024 * 1024)).toFixed(2)} Mo
                            </p>
                          </div>
                          <Download className="w-4 h-4 text-[#8696a0]" />
                        </a>
                      )}
                    </div>
                  ))}

                {/* Text Content */}
                {msg.content && msg.message_type !== 'audio' && (
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                )}

                {/* Time & Double Tick Checkmark */}
                <div className="flex items-center justify-end gap-1 mt-0.5 text-[10px] text-[#8696a0] select-none float-right ml-3">
                  <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {isMe && <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />}
                </div>

                {/* Reactions */}
                {msg.reactions && msg.reactions.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {msg.reactions.map((r) => (
                      <span
                        key={r.id}
                        className="inline-flex items-center gap-0.5 bg-[#1f2c34] border border-[#2a3942] rounded-full px-1.5 py-0.2 text-[11px] shadow"
                      >
                        {r.emoji}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* WhatsApp Input Bar */}
      <div className="bg-[#202c33] px-2 py-2 pb-safe-bottom">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*,video/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip"
        />

        {isRecordingAudio ? (
          <AudioRecorder onSend={handleAudioSend} onCancel={() => setIsRecordingAudio(false)} />
        ) : (
          <form onSubmit={handleSendMessage} className="flex items-center gap-2 max-w-4xl mx-auto">
            {/* Rounded Input Capsule */}
            <div className="flex-1 flex items-center bg-[#2a3942] rounded-3xl px-3 py-1.5 text-[#8696a0]">
              <button
                type="button"
                onClick={() => setShowEmojiPickerFor('input')}
                className="hover:text-white p-1"
              >
                <Smile className="w-5 h-5" />
              </button>

              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                disabled={isClosed}
                placeholder={isClosed ? 'Groupe fermé' : 'Message...'}
                className="flex-1 bg-transparent border-none px-2.5 py-1 text-sm text-[#d1d7db] placeholder-[#8696a0] focus:outline-none"
              />

              <button
                type="button"
                disabled={isClosed}
                onClick={() => fileInputRef.current?.click()}
                className="hover:text-white p-1 ml-1"
                title="Joindre un fichier"
              >
                <Paperclip className="w-5 h-5" />
              </button>

              <button
                type="button"
                disabled={isClosed}
                onClick={() => fileInputRef.current?.click()}
                className="hover:text-white p-1 ml-1"
                title="Prendre une photo"
              >
                <Camera className="w-5 h-5" />
              </button>
            </div>

            {/* Green Circular Mic / Send Button */}
            {messageText.trim() ? (
              <button
                type="submit"
                disabled={isClosed}
                className="w-11 h-11 rounded-full bg-[#00a884] hover:bg-[#00c99f] text-[#111b21] flex items-center justify-center flex-shrink-0 shadow-md active:scale-95 transition-transform"
              >
                <Send className="w-5 h-5 fill-current" />
              </button>
            ) : (
              <button
                type="button"
                disabled={isClosed}
                onClick={() => setIsRecordingAudio(true)}
                className="w-11 h-11 rounded-full bg-[#00a884] hover:bg-[#00c99f] text-[#111b21] flex items-center justify-center flex-shrink-0 shadow-md active:scale-95 transition-transform"
              >
                <Mic className="w-5 h-5 fill-current" />
              </button>
            )}
          </form>
        )}
      </div>

      {selectedProfile && (
        <MemberProfileModal member={selectedProfile} onClose={() => setSelectedProfile(null)} />
      )}

      {selectedMedia && (
        <MediaViewerModal
          url={selectedMedia.url}
          type={selectedMedia.type}
          fileName={selectedMedia.name}
          onClose={() => setSelectedMedia(null)}
        />
      )}
    </div>
  );
}
