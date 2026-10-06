'use client';

import React from 'react';
import {
  Download,
  Smartphone,
  Monitor,
  Apple,
  X,
  CheckCircle2,
  WifiOff,
  Zap,
  Printer,
  ShieldCheck,
  Share2,
  PlusSquare
} from 'lucide-react';
import { usePWAInstall } from '@/hooks/usePWAInstall';

interface DownloadAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DownloadAppModal({ isOpen, onClose }: DownloadAppModalProps) {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150 font-sans">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl text-slate-900 dark:text-white space-y-6 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>Download &amp; Install MIBS</span>
                <span className="text-[10px] bg-indigo-500/10 text-indigo-500 border border-indigo-500/30 px-2 py-0.5 rounded-full font-bold">
                  PWA / WebAPK
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Install as a standalone app on your Android phone, desktop computer, or iPhone.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <WifiOff className="w-4 h-4 mx-auto text-amber-500 mb-1" />
            <span className="text-[10px] font-bold block text-slate-700 dark:text-slate-200">Offline POS</span>
            <span className="text-[9px] text-slate-400">Works without data</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <Zap className="w-4 h-4 mx-auto text-emerald-500 mb-1" />
            <span className="text-[10px] font-bold block text-slate-700 dark:text-slate-200">Instant Launch</span>
            <span className="text-[9px] text-slate-400">No browser URL bar</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <Printer className="w-4 h-4 mx-auto text-indigo-500 mb-1" />
            <span className="text-[10px] font-bold block text-slate-700 dark:text-slate-200">Fast Slips</span>
            <span className="text-[9px] text-slate-400">Direct thermal print</span>
          </div>
        </div>

        {/* Platform Installation Cards */}
        <div className="space-y-3">
          {/* 1. Android / WebAPK Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                  Android App (WebAPK / PWA)
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Full home screen app badge with offline POS register for workshop tellers.
                </p>
              </div>
            </div>

            {isInstallable ? (
              <button
                type="button"
                onClick={handleInstallClick}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs shrink-0 cursor-pointer transition"
              >
                Install Now
              </button>
            ) : isInstalled ? (
              <span className="text-xs text-emerald-500 font-bold flex items-center gap-1 shrink-0">
                <CheckCircle2 className="w-4 h-4" />
                <span>Installed</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={handleInstallClick}
                className="px-3 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs rounded-xl shrink-0"
              >
                Add to Android
              </button>
            )}
          </div>

          {/* 2. Desktop App (Windows / Mac) Card */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                <Monitor className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                  Desktop Standalone Workspace
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Runs in high-speed windowed mode with keyboard shortcuts and printer access.
                </p>
              </div>
            </div>

            {isInstallable ? (
              <button
                type="button"
                onClick={handleInstallClick}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-xs shrink-0 cursor-pointer transition"
              >
                Install Desktop
              </button>
            ) : (
              <span className="text-[11px] text-slate-400 text-right shrink-0">
                Menu &gt; Install App
              </span>
            )}
          </div>

          {/* 3. iOS Safari Instructions */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0">
              <Apple className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>iOS Safari (iPhone / iPad)</span>
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                1. Tap the <strong className="text-slate-700 dark:text-slate-200">Share</strong> button <Share2 className="w-3 h-3 inline text-blue-500" /> at bottom of Safari.<br />
                2. Scroll down and tap <strong className="text-slate-700 dark:text-slate-200">Add to Home Screen</strong> <PlusSquare className="w-3 h-3 inline text-emerald-500" />.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Zero App Store downloads required</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-600 dark:text-slate-300 hover:underline font-bold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
