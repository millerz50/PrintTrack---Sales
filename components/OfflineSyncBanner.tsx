import React from 'react';
import { WifiOff, RefreshCw, CheckCircle2, CloudUpload } from 'lucide-react';

interface OfflineSyncBannerProps {
  isOnline: boolean;
  pendingCount: number;
  onSync: () => void;
  isSyncing: boolean;
}

export const OfflineSyncBanner: React.FC<OfflineSyncBannerProps> = ({
  isOnline,
  pendingCount,
  onSync,
  isSyncing
}) => {
  if (isOnline && pendingCount === 0) return null;

  return (
    <div
      className={`px-4 py-2.5 text-xs font-medium border-b flex items-center justify-between transition ${
        !isOnline
          ? 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200'
          : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-900 dark:text-indigo-200'
      }`}
    >
      <div className="flex items-center space-x-2 max-w-2xl">
        {!isOnline ? (
          <WifiOff className="w-4 h-4 text-amber-600 flex-shrink-0" />
        ) : (
          <CloudUpload className="w-4 h-4 text-indigo-600 flex-shrink-0" />
        )}
        <span>
          {!isOnline ? (
            <>
              <strong>Offline Mode Active:</strong> You can continue issuing sales receipts, creating quotations, and tracking inventory without an internet connection. {pendingCount > 0 ? `${pendingCount} record(s) queued for auto-sync.` : 'All changes saved locally.'}
            </>
          ) : (
            <>
              <strong>Connection Restored:</strong> {pendingCount} offline transaction(s) ready to sync with the enterprise database.
            </>
          )}
        </span>
      </div>

      {pendingCount > 0 && isOnline && (
        <button
          type="button"
          onClick={onSync}
          disabled={isSyncing}
          className="flex items-center space-x-1.5 px-3 py-1 bg-[#0C2D64] hover:bg-[#081e44] text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Syncing with Server...' : `Sync ${pendingCount} to Server`}</span>
        </button>
      )}
    </div>
  );
};
