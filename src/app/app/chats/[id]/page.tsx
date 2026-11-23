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
  Trash2,
  Forward,
  Ban,
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
    deletedMessageIdsForMe,
    deleteMessageForMe,
    deleteMessageForAll,
    forwardMessage,
  } = useApp();

  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<{ url: string; type: 'image' | 'video'; name: string } | null>(null);

  // Message Action Modals
  const [activeMessage, setActiveMessage] = useState<Message | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [forwardTargets, setForwardTargets] = useState<{ kind: 'group' | 'private'; id: string }[]>([]);
  const [isForwarding, setIsForwarding] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const conversation = privateConversations.find((c) => c.id === convId);
  const otherUser = conversation?.other_user;

  useEffect(() => {
    // Initial welcome message if empty
    if (messages.length === 0 && otherUser) {
      setMessages([
        {
          id: 'welcome_priv_' + convId,
          conversation_id: convId,
          sender_id: otherUser.id,
          content: 'Bonjour ! Ravi d’échanger avec vous pour les révisions du BAC 2027.',
          message_type: 'text',
          created_at: new Date(Date.now() - 3600000).toISOString(),
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

  const handleDeleteMessageAction = (mode: 'for_me' | 'for_all') => {
    if (!activeMessage) return;

    if (mode === 'for_all') {
      deleteMessageForAll(activeMessage.id, 'private', convId);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === activeMessage.id
            ? { ...m, content: '🚫 Ce message a été supprimé', deleted_for_all: true, is_deleted: true, attachments: [] }
            : m
        )
      );
    } else {
      deleteMessageForMe(activeMessage.id, 'private', convId);
      setMessages((prev) => prev.filter((m) => m.id !== activeMessage.id));
    }

    setShowDeleteModal(false);
    setActiveMessage(null);
  };

  return (
    <div className="flex flex-col h-screen bg-[#0b141a] text-slate-100 overflow-hidden font-sans">
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
        {messages
          .filter((msg) => !deletedMessageIdsForMe.includes(msg.id))
          .map((msg) => {
            const isMe = msg.sender_id === currentUser?.id;
            const hasAttachments = msg.attachments && msg.attachments.length > 0;
            const isDeletedForAll = msg.deleted_for_all || msg.is_deleted;

            return (
              <div key={msg.id} className={`flex max-w-full ${isMe ? 'justify-end' : 'justify-start'} group`}>
                <div
                  className={`relative max-w-[85%] sm:max-w-md rounded-2xl px-3.5 py-2.5 shadow-sm text-sm ${
                    isMe
                      ? 'bg-[#005c4b] text-[#e9edef] rounded-tr-none'
                      : 'bg-[#202c33] text-[#e9edef] rounded-tl-none border border-slate-700/40'
                  }`}
                >
                  {/* Action Menu (Forward & Delete) on Hover / Tap */}
                  {!isDeletedForAll && (
                    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-[#111b21]/90 backdrop-blur-sm rounded-full px-1.5 py-0.5 z-10 shadow">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveMessage(msg);
                          setShowForwardModal(true);
                        }}
                        className="p-1 hover:text-white text-slate-300"
                        title="Transférer"
                      >
                        <Forward className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveMessage(msg);
                          setShowDeleteModal(true);
                        }}
                        className="p-1 hover:text-red-400 text-slate-300"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Forwarded Header */}
                  {msg.is_forwarded && (
                    <div className="flex items-center gap-1 text-[11px] text-[#8696a0] italic mb-1 pb-0.5 border-b border-white/5">
                      <Forward className="w-3 h-3 text-[#8696a0]" />
                      <span>Transféré</span>
                    </div>
                  )}

                  {/* If message was deleted for all */}
                  {isDeletedForAll ? (
                    <div className="flex items-center gap-1.5 py-1 text-xs italic text-slate-400">
                      <Ban className="w-3.5 h-3.5 text-slate-500" />
                      <span>Ce message a été supprimé</span>
                    </div>
                  ) : (
                    <>
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
                    </>
                  )}

                  <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-slate-400">
                    <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {isMe && <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />}
                  </div>
                </div>
              </div>
            );
          })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-[#202c33] border-t border-[#222e35] px-3 py-2 pb-safe-bottom">
        {isRecordingAudio ? (
          <AudioRecorder onSend={handleAudioSend} onCancel={() => setIsRecordingAudio(false)} />
        ) : (
          <form onSubmit={handleSend} className="flex items-center gap-2 max-w-4xl mx-auto">
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Écrire un message privé..."
              className="flex-1 bg-[#2a3942] rounded-full px-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#00a884] transition-colors"
            />
            {messageText.trim() ? (
              <button
                type="submit"
                className="p-2.5 bg-[#00a884] hover:bg-[#00c99f] active:scale-95 text-[#111b21] rounded-full shadow-lg transition-all"
              >
                <Send className="w-5 h-5 fill-current" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsRecordingAudio(true)}
                className="p-2.5 bg-[#2a3942] hover:bg-[#32444f] active:scale-95 text-[#00a884] rounded-full transition-all"
              >
                <Mic className="w-5 h-5" />
              </button>
            )}
          </form>
        )}
      </div>

      {/* Delete Message Confirmation Modal */}
      {showDeleteModal && activeMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-[#1f2c34] border border-[#2a3942] rounded-3xl p-5 max-w-sm w-full text-white shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-rose-400" />
              <span>Supprimer le message ?</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Choisissez le mode de suppression pour ce message.
            </p>

            <div className="space-y-2 pt-1">
              {activeMessage.sender_id === currentUser?.id && (
                <button
                  type="button"
                  onClick={() => handleDeleteMessageAction('for_all')}
                  className="w-full py-2.5 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors text-center"
                >
                  Supprimer pour tout le monde
                </button>
              )}

              <button
                type="button"
                onClick={() => handleDeleteMessageAction('for_me')}
                className="w-full py-2.5 px-3 bg-[#2a3942] hover:bg-[#32444f] text-slate-200 rounded-xl text-xs font-semibold transition-colors text-center"
              >
                Supprimer pour moi
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setActiveMessage(null);
                }}
                className="w-full py-2 text-xs font-semibold text-[#00a884] hover:bg-[#202c33] rounded-xl transition-colors text-center"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Forward Message Modal */}
      {showForwardModal && activeMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-[#1f2c34] border border-[#2a3942] rounded-3xl p-5 max-w-md w-full text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#2a3942] pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Forward className="w-4 h-4 text-[#00a884]" />
                <span>Transférer le message</span>
              </h3>
              <button
                onClick={() => {
                  setShowForwardModal(false);
                  setActiveMessage(null);
                  setForwardTargets([]);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#111b21] p-3 rounded-xl border border-slate-700/50 text-xs italic text-slate-300 truncate">
              « {activeMessage.content || 'Note vocale'} »
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">
                Choisir les destinataires ({forwardTargets.length} sélectionné(s)) :
              </label>
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 text-xs">
                <p className="text-[10px] uppercase font-bold text-[#00a884] pt-1">Groupes officiels</p>
                {[
                  { id: 'A4', name: 'Série A4 (Lettres)' },
                  { id: 'D', name: 'Série D (Scientifique)' },
                  { id: 'C', name: 'Série C (Maths/Physique)' },
                ].map((grp) => {
                  const isChecked = forwardTargets.some((t) => t.kind === 'group' && t.id === grp.id);
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
                          setForwardTargets((prev) =>
                            isChecked
                              ? prev.filter((t) => !(t.kind === 'group' && t.id === grp.id))
                              : [...prev, { kind: 'group', id: grp.id }]
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
                ]
                  .filter((p) => p.id !== convId)
                  .map((priv) => {
                    const isChecked = forwardTargets.some((t) => t.kind === 'private' && t.id === priv.id);
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
                            setForwardTargets((prev) =>
                              isChecked
                                ? prev.filter((t) => !(t.kind === 'private' && t.id === priv.id))
                                : [...prev, { kind: 'private', id: priv.id }]
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
              disabled={forwardTargets.length === 0 || isForwarding}
              onClick={async () => {
                if (forwardTargets.length === 0 || isForwarding) return;
                setIsForwarding(true);
                await forwardMessage({ ...activeMessage, is_forwarded: true }, forwardTargets);
                setIsForwarding(false);
                setShowForwardModal(false);
                setActiveMessage(null);
                setForwardTargets([]);
              }}
              className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                forwardTargets.length > 0 && !isForwarding
                  ? 'bg-[#00a884] hover:bg-[#00c99f] text-[#111b21] shadow-lg'
                  : 'bg-slate-700 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Forward className="w-4 h-4" />
              <span>{isForwarding ? 'Transfert...' : `Transférer (${forwardTargets.length})`}</span>
            </button>
          </div>
        </div>
      )}

      {showProfile && otherUser && (
        <MemberProfileModal member={otherUser} onClose={() => setShowProfile(false)} />
      )}
    </div>
  );
}
