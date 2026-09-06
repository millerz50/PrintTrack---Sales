'use client';

import React from 'react';
import { Printer } from 'lucide-react';

export function AppLoading() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300">
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 ring-1 ring-white/20 animate-pulse mb-4">
        <Printer className="w-6 h-6 text-white" />
      </div>
      <p className="text-sm font-medium text-slate-400">Loading PrintTrack Workspace...</p>
    </div>
  );
}
