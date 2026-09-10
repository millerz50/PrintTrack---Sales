'use client';

import Image from 'next/image';
import React, { useState } from 'react';

interface MagenLogoProps {
  className?: string;
  variant?: 'full' | 'compact' | 'monogram';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  lightText?: boolean;
}

const SIZES = {
  xs: 28,
  sm: 40,
  md: 60,
  lg: 90,
  xl: 130,
};

export function MagenLogo({
  className = '',
  variant = 'full',
  size = 'md',
  lightText = false,
}: MagenLogoProps) {
  const [imgSrc, setImgSrc] = useState('/magen-logo.svg');
  const px = SIZES[size] || 60;

  if (variant === 'monogram') {
    return (
      <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
        <Image
          src={imgSrc}
          alt="Magen"
          width={px}
          height={px}
          priority
          onError={() => setImgSrc('/magen-logo.png')}
          className="h-full w-full object-contain drop-shadow-xs"
        />
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <div className="relative shrink-0 flex items-center justify-center" style={{ width: px, height: px }}>
          <Image
            src={imgSrc}
            alt="Magen"
            width={px}
            height={px}
            priority
            onError={() => setImgSrc('/magen-logo.png')}
            className="h-full w-full object-contain"
          />
        </div>
        <div className="flex flex-col min-w-0">
          <span className={`text-sm font-black tracking-wider leading-none ${lightText ? 'text-white' : 'text-[#0C2D64] dark:text-white'}`}>
            MAGEN
          </span>
          <span className={`text-[9px] font-bold tracking-widest leading-tight ${lightText ? 'text-slate-300' : 'text-slate-600 dark:text-slate-400'}`}>
            SOLUTIONS
          </span>
          <span className="text-[7.5px] font-semibold uppercase tracking-tight text-emerald-600 dark:text-emerald-400">
            Print &amp; Media
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`inline-flex flex-col items-center justify-center gap-1.5 ${className}`}>
      <div className="relative shrink-0 flex items-center justify-center" style={{ width: px * 1.6, height: px * 1.6 }}>
        <Image
          src={imgSrc}
          alt="Magen Business Solutions"
          width={px * 1.6}
          height={px * 1.6}
          priority
          onError={() => setImgSrc('/magen-logo.png')}
          className="h-full w-full object-contain drop-shadow-xs"
        />
      </div>
      <div className="flex flex-col items-center text-center">
        <span className={`text-base font-black tracking-widest leading-tight ${lightText ? 'text-white' : 'text-[#0C2D64] dark:text-white'}`}>
          MAGEN
        </span>
        <span className={`text-[10px] font-bold tracking-wider uppercase ${lightText ? 'text-slate-300' : 'text-slate-600 dark:text-slate-400'}`}>
          Integrated Solutions
        </span>
        <span className="text-[8px] font-semibold uppercase tracking-tight text-emerald-600 dark:text-emerald-400">
          Media &amp; Print • Mount Darwin
        </span>
      </div>
    </div>
  );
}
