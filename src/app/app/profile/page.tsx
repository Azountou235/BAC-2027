'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { TopHeader } from '@/components/TopHeader';
import { BottomNav } from '@/components/BottomNav';
import { PWAInstallBanner } from '@/components/PWAInstallBanner';
import {
  Settings,
  ShieldCheck,
  Lock,
  Globe,
  MapPin,
  GraduationCap,
  Phone,
  Mail,
  ChevronRight,
  Shield,
  FileCheck,
} from 'lucide-react';

export default function ProfilePage() {
  const { currentUser } = useApp();

  const initials = currentUser?.full_name
    ? currentUser.full_name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'BC';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-20 md:pb-6">
      <PWAInstallBanner />
      <TopHeader
        title="Mon Profil"
        subtitle="Identité candidat BAC 2027"
        rightAction={
          <Link
            href="/app/settings"
            className="p-2 rounded-full bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            title="Paramètres"
          >
            <Settings className="w-5 h-5" />
          </Link>
        }
      />

      <main className="flex-1 max-w-xl w-full mx-auto p-4 space-y-4">
        {/* Profile Identity Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center shadow-xl relative overflow-hidden">
          <div className="w-24 h-24 rounded-full border-4 border-slate-800 bg-slate-950 flex items-center justify-center text-teal-300 text-2xl font-black mx-auto mb-3 shadow-lg overflow-hidden">
            {currentUser?.avatar_url ? (
              <img src={currentUser.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <span>{initials}</span>
            )}
          </div>

          <h2 className="text-lg font-bold text-white flex items-center justify-center gap-1.5">
            <span>{currentUser?.full_name || 'Candidat BAC'}</span>
            {currentUser?.is_super_admin && (
              <ShieldCheck className="w-4 h-4 text-blue-400" />
            )}
          </h2>

          <div className="flex items-center justify-center gap-2 mt-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
              Série {currentUser?.series || 'D'}
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-300 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-400" />
              {currentUser?.province || "N'Djamena"}
            </span>
          </div>

          {currentUser?.is_super_admin && (
            <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 bg-blue-950/60 border border-blue-600/50 rounded-full text-xs font-bold text-blue-300">
              <Shield className="w-3.5 h-3.5 text-blue-400" />
              <span>Super Administrateur Officiel</span>
            </div>
          )}
        </div>

        {/* Detailed Information */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3.5 text-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-teal-400 mb-2">
            Informations scolaires & contact
          </h3>

          <div className="flex items-center justify-between py-2 border-b border-slate-800/80">
            <span className="text-slate-400 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-slate-500" />
              <span>Filière d'examen</span>
            </span>
            <span className="font-bold text-white">Série {currentUser?.series}</span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-slate-800/80">
            <span className="text-slate-400 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-500" />
              <span>Province de résidence</span>
            </span>
            <span className="font-semibold text-white">{currentUser?.province}</span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-slate-800/80">
            <span className="text-slate-400 flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-500" />
              <span>Email</span>
            </span>
            <span className="font-mono text-slate-300">{currentUser?.email}</span>
          </div>

          <div className="flex items-center justify-between py-2">
            <span className="text-slate-400 flex items-center gap-2">
              <Phone className="w-4 h-4 text-slate-500" />
              <span>Téléphone</span>
            </span>
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-white">{currentUser?.phone || 'Non renseigné'}</span>
              <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded flex items-center gap-1">
                {currentUser?.phone_privacy === 'private' ? (
                  <>
                    <Lock className="w-2.5 h-2.5 text-teal-400" />
                    <span>Privé</span>
                  </>
                ) : (
                  <>
                    <Globe className="w-2.5 h-2.5 text-amber-400" />
                    <span>Public</span>
                  </>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Shortcuts List */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl divide-y divide-slate-800/80 overflow-hidden shadow-xl">
          <Link
            href="/app/settings"
            className="p-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors"
          >
            <div className="flex items-center gap-3 text-xs font-semibold text-white">
              <Settings className="w-4 h-4 text-teal-400" />
              <span>Paramètres de compte & confidentialité</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-600" />
          </Link>

          {currentUser?.is_super_admin && (
            <Link
              href="/admin"
              className="p-4 flex items-center justify-between hover:bg-blue-950/20 transition-colors"
            >
              <div className="flex items-center gap-3 text-xs font-semibold text-blue-300">
                <Shield className="w-4 h-4 text-blue-400" />
                <span>Panneau de contrôle Super Admin</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </Link>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
