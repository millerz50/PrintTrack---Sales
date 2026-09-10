'use client';

import React from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-950 text-slate-100 min-h-screen flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md text-center">
          <h2 className="text-lg font-bold text-white mb-2">Application Error</h2>
          <p className="text-xs text-slate-400 mb-4">
            An unexpected error occurred. Please refresh or try again.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition"
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
