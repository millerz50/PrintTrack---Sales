'use client';

import React from 'react';

interface MagenLogoProps {
  className?: string;
  variant?: 'full' | 'compact' | 'monogram';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  lightText?: boolean;
}

const SIZES = {
  xs: { icon: 28, text: 'text-xs', sub: 'text-[8px]' },
  sm: { icon: 38, text: 'text-sm', sub: 'text-[9px]' },
  md: { icon: 52, text: 'text-base', sub: 'text-[10px]' },
  lg: { icon: 72, text: 'text-xl', sub: 'text-xs' },
  xl: { icon: 96, text: 'text-2xl', sub: 'text-sm' },
};

export function MagenLogo({
  className = '',
  variant = 'full',
  size = 'md',
  lightText = false,
}: MagenLogoProps) {
  const s = SIZES[size] || SIZES.md;
  const [imageFailed, setImageFailed] = React.useState(false);

  // Visual Icon Mark for MIBS using user's uploaded logo
  const Emblem = (
    <div
      className="relative shrink-0 flex items-center justify-center rounded-xl overflow-hidden shadow-xs bg-white border border-slate-200/80"
      style={{ width: s.icon, height: s.icon }}
    >
      {!imageFailed ? (
        <img
          src="/IMG-20260907-WA0015.jpg"
          alt="Magen Logo"
          className="w-full h-full object-contain p-0.5"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="100" height="100" rx="20" fill="#0A2240" />
          <path
            d="M 22 72 L 22 30 L 34 30 L 50 56 L 66 30 L 78 30 L 78 72 L 67 72 L 67 46 L 54 66 L 46 66 L 33 46 L 33 72 Z"
            fill="#FFFFFF"
          />
          <circle cx="28" cy="80" r="3" fill="#10B981" />
          <circle cx="50" cy="80" r="3" fill="#38BDF8" />
          <circle cx="72" cy="80" r="3" fill="#F59E0B" />
        </svg>
      )}
    </div>
  );

  if (variant === 'monogram') {
    return (
      <div className={`inline-flex items-center justify-center shrink-0 ${className}`}>
        {Emblem}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center gap-2.5 ${className}`}>
        {Emblem}
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-black tracking-wider leading-none ${s.text} ${
                lightText ? 'text-white' : 'text-slate-900 dark:text-white'
              }`}
            >
              MAGEN
            </span>
            <span className="px-1.5 py-0.5 rounded-sm bg-emerald-500 text-slate-950 font-black text-[9px] tracking-widest leading-none">
              MIBS
            </span>
          </div>
          <span
            className={`font-semibold tracking-wide uppercase leading-tight ${s.sub} ${
              lightText ? 'text-slate-300' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Integrated Business Solutions
          </span>
          <span className="text-[8px] font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">
            Print &bull; Media &bull; Mount Darwin
          </span>
        </div>
      </div>
    );
  }

  // Full Variant
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {Emblem}
      <div className="flex flex-col text-left">
        <div className="flex items-center gap-2">
          <span
            className={`font-black tracking-widest leading-none ${s.text} ${
              lightText ? 'text-white' : 'text-slate-950 dark:text-white'
            }`}
          >
            MAGEN
          </span>
          <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-slate-950 font-black text-[10px] tracking-wider uppercase">
            MIBS
          </span>
        </div>
        <span
          className={`font-bold tracking-tight uppercase leading-snug ${s.sub} ${
            lightText ? 'text-slate-200' : 'text-slate-700 dark:text-slate-300'
          }`}
        >
          Integrated Business Solutions
        </span>
        <span className="text-[9px] font-semibold tracking-wide text-emerald-600 dark:text-emerald-400 uppercase">
          Commercial Print &bull; Media &bull; Mount Darwin
        </span>
      </div>
    </div>
  );
}
