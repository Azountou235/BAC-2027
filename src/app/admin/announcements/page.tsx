'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { TopHeader } from '@/components/TopHeader';
import { Megaphone, Send, Pin, Check } from 'lucide-react';
import { Series } from '@/types';

export default function AdminAnnouncementsPage() {
  const router = useRouter();
  const { currentUser, announcements, adminPublishAnnouncement } = useApp();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetSeries, setTargetSeries] = useState<'ALL' | Series>('ALL');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!currentUser?.is_super_admin) {
    return <div className="p-6 text-center text-white">Accès restreint.</div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    await adminPublishAnnouncement(title.trim(), content.trim(), targetSeries);
    setIsSubmitting(false);
    setSuccess(true);
    setTitle('');
    setContent('');
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-10">
      <TopHeader
        title="Annonces Officielles"
        subtitle="Diffusion aux candidats de la République"
        showBack
        onBack={() => router.push('/admin')}
      />

      <main className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {success && (
          <div className="p-3 bg-teal-950/60 border border-teal-700/60 text-teal-300 rounded-2xl text-xs font-semibold flex items-center gap-2">
            <Check className="w-4 h-4 text-teal-400" />
            <span>Annonce officielle publiée et diffusée avec succès !</span>
          </div>
        )}

        {/* Create Announcement Form */}
        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-teal-400 font-bold text-xs uppercase tracking-wider">
            <Megaphone className="w-4 h-4" />
            <span>Nouvelle communication officielle</span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Titre de l'annonce *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex : Calendrier des épreuves ou Consignes d'examen..."
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Audience ciblée
            </label>
            <select
              value={targetSeries}
              onChange={(e) => setTargetSeries(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
            >
              <option value="ALL">Tous les candidats (Toutes séries confondues)</option>
              <option value="A4">Série A4 uniquement</option>
              <option value="D">Série D uniquement</option>
              <option value="C">Série C uniquement</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Contenu du message officiel *
            </label>
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Rédigez votre annonce à l'attention des candidats..."
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-teal-500"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-teal-600 hover:bg-teal-500 active:scale-98 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>Diffuser l'annonce officielle</span>
          </button>
        </form>

        {/* Existing Announcements */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Annonces publiées ({announcements.length})
          </h2>

          {announcements.map((ann) => (
            <div
              key={ann.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] bg-teal-950/80 text-teal-300 px-2 py-0.5 rounded-full border border-teal-800/60 font-semibold">
                  Cible : {ann.target_series === 'ALL' ? 'Tous les candidats' : `Série ${ann.target_series}`}
                </span>
                <span className="text-[10px] text-slate-500">
                  {new Date(ann.created_at).toLocaleDateString()}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white">{ann.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                {ann.content}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
