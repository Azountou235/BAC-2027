'use client';

import React, { useState } from 'react';
import { PublicProfile } from '@/types';
import { X, ShieldCheck, Lock, Phone, MessageSquare, AlertTriangle, UserX, Check } from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface MemberProfileModalProps {
  member: PublicProfile;
  onClose: () => void;
}

export const MemberProfileModal: React.FC<MemberProfileModalProps> = ({ member, onClose }) => {
  const { currentUser, sendConversationRequest, blockUser, reportContent } = useApp();
  const [requestSent, setRequestSent] = useState(false);
  const [showReportInput, setShowReportInput] = useState(false);
  const [reportReason, setReportReason] = useState('');

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

  // Avatar initials generator
  const initials = member.full_name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Background Accent */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-800 -z-0" />

        {/* Avatar */}
        <div className="relative z-10 flex flex-col items-center mt-6">
          <div className="w-24 h-24 rounded-full border-4 border-slate-900 bg-slate-800 flex items-center justify-center overflow-hidden shadow-xl text-teal-300 text-2xl font-bold">
            {member.avatar_url ? (
              <img src={member.avatar_url} alt={member.full_name} className="w-full h-full object-cover" />
            ) : (
              <span>{initials}</span>
            )}
          </div>

          {/* Name & Official Badge */}
          <div className="flex items-center gap-1.5 mt-3 text-center">
            <h2 className="text-xl font-bold text-white">{member.full_name}</h2>
            {member.is_super_admin && (
              <span title="Administrateur officiel BAC TCHAD 2027">
                <ShieldCheck className="w-5 h-5 text-blue-400 fill-blue-500/20" />
              </span>
            )}
          </div>

          {/* Role badge */}
          {member.is_super_admin ? (
            <span className="mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              Administrateur officiel
            </span>
          ) : (
            <span className="mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30">
              Candidat BAC 2027
            </span>
          )}
        </div>

        {/* Academic Details */}
        <div className="mt-6 space-y-3 bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Série</span>
            <span className="font-semibold text-teal-400 px-2 py-0.5 rounded bg-teal-950/50 border border-teal-800/50">
              Série {member.series}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Province</span>
            <span className="font-medium text-slate-200">{member.province}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Téléphone</span>
            {member.phone && member.phone_privacy === 'public' && !member.is_super_admin ? (
              <a
                href={`tel:${member.phone}`}
                className="font-medium text-teal-400 flex items-center gap-1 hover:underline"
              >
                <Phone className="w-3.5 h-3.5" />
                {member.phone}
              </a>
            ) : (
              <span className="text-xs text-slate-400 flex items-center gap-1.5 bg-slate-800/80 px-2 py-0.5 rounded-full">
                <Lock className="w-3 h-3 text-slate-400" />
                Numéro privé
              </span>
            )}
          </div>
        </div>

        {/* Actions for other members */}
        {!isSelf && (
          <div className="mt-6 space-y-2.5">
            {requestSent ? (
              <div className="w-full py-2.5 px-4 bg-teal-900/40 border border-teal-700/60 text-teal-300 rounded-xl text-center text-sm font-medium flex items-center justify-center gap-2">
                <Check className="w-4 h-4 text-teal-400" />
                Demande de message envoyée
              </div>
            ) : (
              <button
                type="button"
                onClick={handleSendRequest}
                className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 active:scale-98 text-white rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-teal-950/50"
              >
                <MessageSquare className="w-4 h-4" />
                Contacter en privé
              </button>
            )}

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleBlock}
                className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
              >
                <UserX className="w-3.5 h-3.5 text-slate-400" />
                Bloquer
              </button>
              <button
                type="button"
                onClick={() => setShowReportInput(!showReportInput)}
                className="flex-1 py-2 px-3 bg-slate-800 hover:bg-red-900/30 text-red-300 rounded-xl text-xs font-medium transition-colors flex items-center justify-center gap-1.5 border border-transparent hover:border-red-800/50"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                Signaler
              </button>
            </div>

            {/* Report Input box */}
            {showReportInput && (
              <form onSubmit={handleReportSubmit} className="mt-3 p-3 bg-red-950/20 border border-red-900/40 rounded-xl">
                <label className="block text-xs text-red-300 mb-1.5 font-medium">
                  Motif du signalement :
                </label>
                <input
                  type="text"
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder="Spam, propos inappropriés..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 mb-2"
                  required
                />
                <button
                  type="submit"
                  className="w-full py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold"
                >
                  Envoyer le signalement
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
