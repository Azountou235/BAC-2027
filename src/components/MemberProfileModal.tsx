'use client';

import React, { useState } from 'react';
import { PublicProfile } from '@/types';
import { X, Lock, Phone, MessageSquare, AlertTriangle, UserX, Check } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { RedVerifiedBadge } from '@/components/RedVerifiedBadge';
import { FullScreenImageViewer } from '@/components/FullScreenImageViewer';

interface MemberProfileModalProps {
  member: PublicProfile;
  onClose: () => void;
}

export const MemberProfileModal: React.FC<MemberProfileModalProps> = ({ member, onClose }) => {
  const { currentUser, sendConversationRequest, blockUser, reportContent } = useApp();
  const [requestSent, setRequestSent] = useState(false);
  const [showReportInput, setShowReportInput] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [showFullPhoto, setShowFullPhoto] = useState(false);

  const isSelf = currentUser?.id === member.id;

  const handleSendRequest = async () => {
    const success = await sendConversationRequest(member.id);
    if (success) {
      setRequestSent(true);
    }
  };

  const handleBlock = async () => {
    if (confirm(`Voulez-vous vraiment bloquer ${member.full_name} ?`)) {
      await blockUser(member.id);
      onClose();
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportReason.trim()) return;
    await reportContent(member.id, null, reportReason.trim());
    setShowReportInput(false);
    setReportReason('');
  };

  const initials = member.full_name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className="relative w-full max-w-sm bg-[#111b21] border border-[#202c33] rounded-3xl p-6 shadow-2xl text-[#e9edef] overflow-hidden">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-[#202c33] hover:bg-[#2a3942] text-[#8696a0] hover:text-white transition-colors z-20"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header Accent */}
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-[#002664] via-[#0052cc] to-[#00a884] -z-0" />

          {/* Avatar with click-to-enlarge */}
          <div className="relative z-10 flex flex-col items-center mt-6">
            <div
              onClick={() => member.avatar_url && setShowFullPhoto(true)}
              className={`w-24 h-24 rounded-full border-4 border-[#111b21] bg-[#202c33] flex items-center justify-center overflow-hidden shadow-xl text-[#00a884] text-2xl font-bold ${
                member.avatar_url ? 'cursor-pointer hover:opacity-90 active:scale-95 transition-all' : ''
              }`}
              title={member.avatar_url ? 'Cliquer pour voir la photo en entier' : ''}
            >
              {member.avatar_url ? (
                <img src={member.avatar_url} alt={member.full_name} className="w-full h-full object-cover" />
              ) : (
                <span>{initials}</span>
              )}
            </div>

            {/* Name & Red Certification Badge */}
            <div className="flex items-center gap-1.5 mt-3 text-center">
              <h2 className="text-lg font-bold text-white">{member.full_name}</h2>
              {member.is_super_admin && (
                <RedVerifiedBadge size={18} />
              )}
            </div>

            {/* Role & Details */}
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2.5 py-0.5 rounded-full bg-[#202c33] text-[11px] font-semibold text-[#00a884]">
                Série {member.series}
              </span>
              <span className="text-xs text-[#8696a0]">
                Province {member.province}
              </span>
            </div>
          </div>

          {/* Contact Details */}
          <div className="mt-6 space-y-3 bg-[#0b141a] rounded-2xl p-4 border border-[#202c33]">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#8696a0] flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" />
                Numéro WhatsApp
              </span>
              {member.phone_privacy === 'public' && member.phone ? (
                <span className="font-mono text-white font-semibold">{member.phone}</span>
              ) : (
                <span className="text-slate-500 italic flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  Masqué (Privé)
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {!isSelf && (
            <div className="mt-5 space-y-2">
              <button
                onClick={handleSendRequest}
                disabled={requestSent}
                className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg ${
                  requestSent
                    ? 'bg-slate-800 text-slate-400 cursor-default'
                    : 'bg-[#00a884] hover:bg-[#00c99f] active:scale-95 text-[#111b21]'
                }`}
              >
                {requestSent ? (
                  <>
                    <Check className="w-4 h-4 text-[#00a884]" />
                    <span>Demande envoyée</span>
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-4 h-4" />
                    <span>Envoyer une demande de discussion</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#202c33]">
                <button
                  onClick={() => setShowReportInput(!showReportInput)}
                  className="flex-1 py-2 text-[11px] text-[#8696a0] hover:text-amber-400 transition-colors flex items-center justify-center gap-1"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Signaler</span>
                </button>
                <button
                  onClick={handleBlock}
                  className="flex-1 py-2 text-[11px] text-[#8696a0] hover:text-red-400 transition-colors flex items-center justify-center gap-1"
                >
                  <UserX className="w-3.5 h-3.5" />
                  <span>Bloquer</span>
                </button>
              </div>

              {/* Report Input Box */}
              {showReportInput && (
                <form onSubmit={handleReportSubmit} className="mt-3 space-y-2 animate-in fade-in">
                  <textarea
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    placeholder="Raison du signalement..."
                    rows={2}
                    className="w-full bg-[#0b141a] border border-[#202c33] rounded-xl p-2.5 text-xs text-white placeholder:text-[#8696a0] focus:outline-none focus:border-red-500"
                  />
                  <button
                    type="submit"
                    className="w-full py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors"
                  >
                    Confirmer le signalement
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen Photo Viewer */}
      <FullScreenImageViewer
        isOpen={showFullPhoto}
        imageUrl={member.avatar_url || null}
        title={member.full_name}
        subtitle={`Série ${member.series} • Province ${member.province}`}
        onClose={() => setShowFullPhoto(false)}
      />
    </>
  );
};
