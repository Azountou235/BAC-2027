'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { TopHeader } from '@/components/TopHeader';
import { BottomNav } from '@/components/BottomNav';
import { PWAInstallBanner } from '@/components/PWAInstallBanner';
import { Inbox, Check, X, ShieldX, Clock, Send, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function RequestsPage() {
  const router = useRouter();
  const { conversationRequests, respondToRequest, blockUser } = useApp();
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');

  const { received, sent } = conversationRequests;

  const handleAccept = async (reqId: string) => {
    await respondToRequest(reqId, 'accept');
    router.push('/app/chats');
  };

  const handleReject = async (reqId: string) => {
    await respondToRequest(reqId, 'reject');
  };

  const handleBlock = async (reqId: string, senderId: string) => {
    if (confirm('Voulez-vous bloquer cet utilisateur ?')) {
      await blockUser(senderId);
      await respondToRequest(reqId, 'block');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-20 md:pb-6">
      <PWAInstallBanner />
      <TopHeader
        title="Demandes de Messages"
        subtitle="Contacts privés entre candidats"
        showBack
        onBack={() => router.push('/app/chats')}
      />

      <main className="flex-1 max-w-xl w-full mx-auto p-4 space-y-4">
        {/* Tab switch: Reçues / Envoyées */}
        <div className="flex bg-slate-900/80 p-1 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveTab('received')}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'received'
                ? 'bg-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Inbox className="w-3.5 h-3.5" />
            <span>Reçues ({received.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'sent'
                ? 'bg-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Envoyées ({sent.length})</span>
          </button>
        </div>

        {/* List of Requests */}
        {activeTab === 'received' ? (
          received.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-8 text-center text-slate-500">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-teal-400 mx-auto mb-3">
                <Inbox className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">Aucune demande en attente</h3>
              <p className="text-xs max-w-xs mx-auto leading-relaxed">
                Les demandes de discussion envoyées par d’autres candidats apparaîtront ici.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {received.map((req) => (
                <div
                  key={req.id}
                  className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 shadow-lg space-y-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-teal-400 font-bold text-sm flex-shrink-0">
                      {req.sender?.full_name[0] || 'C'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <h4 className="text-xs font-bold text-white truncate">
                          {req.sender?.full_name}
                        </h4>
                        <span className="text-[10px] text-teal-400 bg-teal-950/60 px-1.5 rounded border border-teal-800/40 font-semibold">
                          Série {req.sender?.series}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mb-2">
                        {req.sender?.province} • Reçue récemment
                      </p>
                      <div className="bg-slate-950/80 border border-slate-800/60 rounded-xl p-2.5 text-xs text-slate-300 italic">
                        « {req.message || 'Bonjour, j’aimerais échanger pour réviser le BAC 2027.'} »
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 pt-1 border-t border-slate-800/60">
                    <button
                      onClick={() => handleAccept(req.id)}
                      className="flex-1 py-2 bg-teal-600 hover:bg-teal-500 active:scale-95 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Accepter</span>
                    </button>
                    <button
                      onClick={() => handleReject(req.id)}
                      className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium flex items-center justify-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Refuser</span>
                    </button>
                    <button
                      onClick={() => handleBlock(req.id, req.sender_id)}
                      className="py-2 px-2.5 bg-slate-800 hover:bg-red-950/40 text-slate-400 hover:text-red-400 rounded-xl text-xs"
                      title="Bloquer l'utilisateur"
                    >
                      <ShieldX className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : sent.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-8 text-center text-slate-500">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-teal-400 mx-auto mb-3">
              <Send className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">Aucune demande envoyée</h3>
            <p className="text-xs max-w-xs mx-auto leading-relaxed">
              Consultez les membres de votre groupe pour envoyer une demande de contact.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {sent.map((req) => (
              <div
                key={req.id}
                className="bg-slate-900 border border-slate-800/80 rounded-2xl p-3.5 flex items-center justify-between shadow"
              >
                <div>
                  <h4 className="text-xs font-bold text-white mb-0.5">
                    Demande adressée à un candidat
                  </h4>
                  <p className="text-[11px] text-slate-400 italic truncate max-w-xs">
                    « {req.message} »
                  </p>
                </div>
                <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-800/50">
                  <Clock className="w-3 h-3" />
                  En attente
                </span>
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
