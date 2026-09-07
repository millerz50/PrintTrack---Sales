
'use client';

import Image from 'next/image';
import React from 'react';

interface MagenLogoProps {
  className?: string;
  variant?: 'full' | 'compact' | 'monogram';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  lightText?: boolean;
}

export function MagenLogo({
  className = '',
  variant = 'full',
  size = 'md',
}: MagenLogoProps) {
  const sizes = {
    sm: {
      full: { width: 150, height: 105 },
      compact: { width: 115, height: 90 },
      monogram: { width: 80, height: 62 },
    },
    md: {
      full: { width: 220, height: 155 },
      compact: { width: 150, height: 110 },
      monogram: { width: 105, height: 82 },
    },
    lg: {
      full: { width: 300, height: 210 },
      compact: { width: 190, height: 140 },
      monogram: { width: 140, height: 105 },
    },
    xl: {
      full: { width: 400, height: 280 },
      compact: { width: 240, height: 175 },
      monogram: { width: 180, height: 135 },
    },
  };

  const dimensions = sizes[size][variant];

  /*
   * REAL MAGEN LOGO
   *
   * File:
   * public/magen-logo.png
   *
   * It is referenced in Next.js as:
   * /magen-logo.png
   */

  if (variant === 'full') {
    return (
      <div
        className={`relative flex items-center justify-center ${className}`}
        style={{
          width: dimensions.width,
          height: dimensions.height,
        }}
      >
        <Image
          src="/magen-logo.png"
          alt="Magen Business Solutions"
          fill
          priority
          sizes={`${dimensions.width}px`}
          className="object-contain"
        />
      </div>
    );
  }

  if (variant === 'monogram') {
    return (
      <div
        className={`relative overflow-hidden flex items-start justify-center ${className}`}
        style={{
          width: dimensions.width,
          height: dimensions.height,
        }}
      >
        <Image
          src="/magen-logo.png"
          alt="Magen Business Solutions"
          width={400}
          height={400}
          priority
          className="absolute top-0 left-1/2 -translate-x-1/2 max-w-none object-contain"
          style={{
            width: dimensions.width,
            height: 'auto',
          }}
        />
      </div>
    );
  }

  // Compact
  return (
    <div
      className={`flex items-center ${className}`}
      style={{
        minHeight: dimensions.height,
      }}
    >
      <div
        className="relative flex-shrink-0 overflow-hidden"
        style={{
          width: dimensions.width * 0.55,
          height: dimensions.height,
        }}
      >
        <Image
          src="/magen-logo.png"
          alt="Magen Business Solutions"
          width={400}
          height={400}
          priority
          className="absolute left-0 top-0 max-w-none object-contain"
          style={{
            width: dimensions.width * 0.55,
            height: 'auto',
          }}
        />
      </div>

      <div className="ml-2 flex flex-col">
        <span className="text-sm font-black tracking-wider leading-none text-[#0C2D64]">
          MAGEN
        </span>

        <span className="mt-1 text-[8px] font-bold tracking-widest leading-tight text-slate-700">
          BUSINESS SOLUTIONS
        </span>

        <span className="mt-1 text-[7px] font-semibold uppercase tracking-tight leading-none text-emerald-600">
          Media &amp; Print • Environmental Consultancy
        </span>
      </div>
    </div>
  );
}
