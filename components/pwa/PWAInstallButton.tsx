'use client';

import React, { useState } from 'react';
import { Download, Smartphone, Monitor } from 'lucide-react';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { DownloadAppModal } from './DownloadAppModal';

interface PWAInstallButtonProps {
  variant?: 'header' | 'hero' | 'compact' | 'footer';
  className?: string;
}

export function PWAInstallButton({
  variant = 'header',
  className = ''
}: PWAInstallButtonProps) {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // If already installed in standalone mode, show subtle badge or hide
  if (isInstalled && variant === 'header') {
    return null;
  }

  const handleClick = async () => {
    if (isInstallable) {
      const res = await install();
      if (!res) setIsModalOpen(true);
    } else {
      setIsModalOpen(true);
    }
  };

  if (variant === 'compact') {
    return (
      <>
        <button
          type="button"
          onClick={handleClick}
          title="Install Desktop/Android App"
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition cursor-pointer ${className}`}
        >
          <Download className="w-3.5 h-3.5" />
          <span>Install App</span>
        </button>
        <DownloadAppModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </>
    );
  }

  if (variant === 'hero') {
    return (
      <>
        <button
          type="button"
          onClick={handleClick}
          className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md border border-slate-800 transition cursor-pointer ${className}`}
        >
          <Smartphone className="w-4 h-4 text-emerald-400" />
          <span>Download App / APK</span>
        </button>
        <DownloadAppModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </>
    );
  }

  // Default header variant
  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={`px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-white transition flex items-center gap-1.5 cursor-pointer shadow-2xs ${className}`}
        title="Download Desktop & Android App (PWA)"
      >
        <Download className="w-3.5 h-3.5 text-emerald-500" />
        <span className="hidden sm:inline">Install App</span>
      </button>
      <DownloadAppModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
