'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { TopHeader } from '@/components/TopHeader';
import { Clock, Shield, FileText, CheckCircle2 } from 'lucide-react';

export default function AdminLogsPage() {
  const router = useRouter();
  const { currentUser, adminLogs } = useApp();

  if (!currentUser?.is_super_admin) {
    return <div className="p-6 text-center text-white">Accès restreint.</div>;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-10">
      <TopHeader
        title="Journal d'Audit Sécurisé"
        subtitle="Historique des actions administratives"
        showBack
        onBack={() => router.push('/admin')}
      />

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase mb-4">
            <Clock className="w-4 h-4 text-teal-400" />
            <span>Traçabilité & Sécurité des opérations</span>
          </div>

          <div className="divide-y divide-slate-800/80">
            {adminLogs.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">
                Aucun log d'action enregistré pour l'instant. Toutes les prochaines actions du Superviseur seront inscrites ici de façon immuable.
              </p>
            ) : (
              adminLogs.map((log) => (
                <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-teal-300 font-mono">
                        {log.action}
                      </span>
                      <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                        {log.target_type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Par <strong className="text-white">{log.admin_name || 'Super Admin'}</strong> • Cible :{' '}
                      <span className="font-mono text-slate-300">{log.target_id || 'Global'}</span>
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
