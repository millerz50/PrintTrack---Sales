'use client';

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
  lightText = false
}: MagenLogoProps) {
  // Dimensions based on size
  const heights = {
    sm: variant === 'monogram' ? 28 : 34,
    md: variant === 'monogram' ? 38 : 46,
    lg: variant === 'monogram' ? 52 : 64,
    xl: variant === 'monogram' ? 72 : 92
  };

  const currentHeight = heights[size];
  const navyColor = lightText ? '#FFFFFF' : '#0C2D64';
  const greenColor = '#388E3C';
  const greenLeaf = '#43A047';

  if (variant === 'monogram') {
    return (
      <svg
        viewBox="0 0 420 320"
        height={currentHeight}
        className={`inline-block select-none ${className}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Magen MIS Logo"
      >
        <defs>
          <linearGradient id="ml_leaf" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4CAF50" />
            <stop offset="100%" stopColor="#2E7D32" />
          </linearGradient>
        </defs>

        {/* Small printer icon above left of I */}
        <g transform="translate(170, 15) scale(0.9)">
          <path d="M 12 0 L 32 0 C 34 0 36 2 36 4 L 36 12 L 8 12 L 8 4 C 8 2 10 0 12 0 Z" fill={navyColor} />
          <rect x="2" y="12" width="40" height="20" rx="4" fill={navyColor} />
          <rect x="8" y="24" width="28" height="12" rx="2" fill={lightText ? '#0C2D64' : '#FFFFFF'} />
          <line x1="12" y1="28" x2="32" y2="28" stroke={navyColor} strokeWidth="2" strokeLinecap="round" />
          <line x1="12" y1="32" x2="28" y2="32" stroke={navyColor} strokeWidth="2" strokeLinecap="round" />
          <circle cx="36" cy="18" r="2" fill="#4CAF50" />
        </g>

        {/* Green Leaf Icon above I */}
        <g transform="translate(235, 2) scale(0.9)">
          <path d="M 0 52 C 4 22 24 4 48 0 C 46 28 34 48 8 53 Z" fill="url(#ml_leaf)" />
          <path d="M 6 46 Q 20 28 42 4" stroke="#FFFFFF" strokeWidth="1.5" fill="none" opacity="0.6" />
        </g>

        {/* M */}
        <path
          d="M 40 270 L 40 145 C 40 115 65 100 88 100 C 108 100 124 112 134 130 L 168 198 L 202 130 C 212 112 228 100 248 100 C 270 100 285 115 285 140 L 285 165 L 245 165 L 245 148 C 245 140 238 132 230 132 C 222 132 215 138 210 148 L 180 220 C 174 232 160 232 154 220 L 122 148 C 117 138 110 132 102 132 C 94 132 88 140 88 148 L 88 270 Z"
          fill={navyColor}
        />

        {/* I in Eco Green */}
        <path
          d="M 225 125 L 260 125 L 260 245 C 260 260 270 270 285 270 L 340 270 C 358 270 372 265 385 255 L 385 285 C 370 298 350 305 328 305 L 270 305 C 245 305 225 285 225 260 Z"
          fill="url(#ml_leaf)"
        />

        {/* S */}
        <path
          d="M 270 125 C 310 120 385 125 385 180 C 385 210 358 225 315 235 C 280 242 268 248 268 260 C 268 272 278 278 295 278 L 390 278 L 390 308 L 295 308 C 255 308 232 288 232 258 C 232 228 260 212 302 202 C 342 192 350 185 350 174 C 350 162 338 155 312 155 C 285 155 268 164 260 172 L 260 132 C 263 128 266 126 270 125 Z"
          fill={navyColor}
        />
      </svg>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <MagenLogo variant="monogram" size={size} lightText={lightText} />
        <div className="flex flex-col">
          <span className={`text-base font-black tracking-wider leading-none ${lightText ? 'text-white' : 'text-[#0C2D64]'}`}>
            MAGEN
          </span>
          <span className={`text-[10px] font-bold tracking-widest leading-tight ${lightText ? 'text-slate-200' : 'text-slate-700'}`}>
            INTEGRATED SOLUTIONS
          </span>
          <span className="text-[8px] font-semibold text-emerald-500 uppercase tracking-tighter leading-none">
            Media & Print • Eco Consultancy
          </span>
        </div>
      </div>
    );
  }

  // Full Variant
  return (
    <div className={`flex flex-col items-center text-center ${className}`}>
      <MagenLogo variant="monogram" size={size} lightText={lightText} />
      <div className="mt-1 flex items-center justify-center gap-2 w-full">
        <span className={`h-0.5 w-6 rounded-full ${lightText ? 'bg-white/60' : 'bg-[#0C2D64]'}`} />
        <span className={`text-xl sm:text-2xl font-black tracking-[0.25em] ${lightText ? 'text-white' : 'text-[#0C2D64]'}`}>
          MAGEN
        </span>
        <span className={`h-0.5 w-6 rounded-full ${lightText ? 'bg-white/60' : 'bg-[#0C2D64]'}`} />
      </div>
      <div className={`text-[11px] sm:text-xs font-bold tracking-[0.2em] uppercase mt-0.5 ${lightText ? 'text-slate-200' : 'text-slate-800'}`}>
        INTEGRATED SOLUTIONS
      </div>
      <div className="text-[9px] sm:text-[10px] font-semibold tracking-wider mt-1 text-emerald-600 flex items-center gap-1.5 flex-wrap justify-center">
        <span className={lightText ? 'text-slate-300' : 'text-[#0C2D64]'}>MEDIA &amp; PRINT SOLUTIONS</span>
        <span className="text-emerald-500 font-black">|</span>
        <span className="text-emerald-600">ENVIRONMENTAL CONSULTANCY</span>
      </div>
    </div>
  );
}
