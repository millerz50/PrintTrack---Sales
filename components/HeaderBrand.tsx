'use client';

import React from 'react';
import { CompanyInfo } from '../services/storage';
import { AppMode } from '../types';
import { MagenLogo } from './MagenLogo';

interface HeaderBrandProps {
  company: CompanyInfo;
  appMode: AppMode;
}

export function HeaderBrand({
  company,
  appMode,
}: HeaderBrandProps) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">

      <div
        className="
          flex h-10 w-10 shrink-0
          items-center justify-center
          overflow-hidden
          rounded-xl
          bg-white
          ring-1
          ring-slate-200

          dark:ring-slate-700
        "
      >
        <MagenLogo
          variant="monogram"
          size="sm"
          className="h-10 w-10"
        />
      </div>

      <div className="min-w-0">
        <div className="flex items-center gap-2">

          <h1
            className="
              truncate
              text-sm
              font-bold
              tracking-tight
              text-slate-900
              dark:text-white

              sm:text-base
            "
          >
            {company.name}
          </h1>

          <span
            className="
              hidden
              rounded-full
              bg-emerald-500/10
              px-2
              py-0.5
              text-[9px]
              font-bold
              uppercase
              tracking-wider
              text-emerald-700

              dark:text-emerald-400

              md:inline-flex
            "
          >
            {appMode === 'pos' ? 'POS' : 'Marketing'}
          </span>
        </div>

        <p
          className="
            hidden
            truncate
            text-[10px]
            text-slate-500
            dark:text-slate-400

            sm:block
          "
        >
          {company.tagline}
        </p>
      </div>
    </div>
  );
}
