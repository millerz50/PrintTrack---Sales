'use client';

import React from 'react';
import {
  Printer,
  Megaphone,
} from 'lucide-react';

import { AppMode } from '../types';

interface WorkspaceSwitcherProps {
  appMode: AppMode;
  setAppMode: (mode: AppMode) => void;
}

export function WorkspaceSwitcher({
  appMode,
  setAppMode,
}: WorkspaceSwitcherProps) {
  return (
    <div
      className="
        inline-flex
        rounded-xl
        border
        border-slate-200
        bg-slate-100
        p-1

        dark:border-slate-800
        dark:bg-slate-900
      "
    >
      <button
        type="button"
        onClick={() => setAppMode('pos')}
        className={`
          flex
          items-center
          gap-1.5
          rounded-lg
          px-3
          py-1.5
          text-xs
          font-semibold
          transition

          ${
            appMode === 'pos'
              ? 'bg-emerald-600 text-white shadow-sm'
              : `
                text-slate-500
                hover:text-slate-900

                dark:text-slate-400
                dark:hover:text-white
              `
          }
        `}
      >
        <Printer className="h-3.5 w-3.5" />
        POS
      </button>

      <button
        type="button"
        onClick={() => setAppMode('marketing')}
        className={`
          flex
          items-center
          gap-1.5
          rounded-lg
          px-3
          py-1.5
          text-xs
          font-semibold
          transition

          ${
            appMode === 'marketing'
              ? 'bg-[#0C2D64] text-white shadow-sm'
              : `
                text-slate-500
                hover:text-slate-900

                dark:text-slate-400
                dark:hover:text-white
              `
          }
        `}
      >
        <Megaphone className="h-3.5 w-3.5 text-emerald-500" />
        Marketing
      </button>
    </div>
  );
}
