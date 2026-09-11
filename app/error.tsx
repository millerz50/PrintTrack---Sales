'use client';

import React, { useEffect } from 'react';
import { AlertCircle, RefreshCw, RotateCcw, Home } from 'lucide-react';
import { storage } from '@/services/storage';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Application Error Caught in Route ErrorBoundary]:', error);
  }, [error]);

  const handleResetApp = () => {
    try {
      storage.resetToFactorySeeds();
    } catch {
      // ignore
    }
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 max-w-lg w-full text-center space-y-5 shadow-2xl">
        <div className="w-14 h-14 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl flex items-center justify-center mx-auto">
          <AlertCircle className="w-7 h-7" />
        </div>

        <div>
          <h2 className="text-xl font-black text-white tracking-tight">Something Went Wrong</h2>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            The application encountered an unexpected issue while loading this view. You can reload the page, retry the operation, or reset local session data.
          </p>
          {error?.message && (
            <div className="mt-3 p-3 bg-slate-950 rounded-xl border border-slate-800 text-left">
              <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Diagnostic Detail</span>
              <p className="text-xs font-mono text-red-400 break-all">{error.message}</p>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="w-full sm:w-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reload Page</span>
          </button>
          <button
            type="button"
            onClick={handleResetApp}
            className="w-full sm:w-auto px-4 py-2.5 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Reset Cache &amp; Home</span>
          </button>
        </div>
      </div>
    </div>
  );
}
