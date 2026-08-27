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
              <strong>Offline Mode Active:</strong> You can continue logging sales, printing receipts, and entering daily costs without internet. {pendingCount > 0 ? `${pendingCount} record(s) queued for sync.` : 'All saved locally.'}
            </>
          ) : (
            <>
              <strong>Connection Restored:</strong> {pendingCount} queued offline transaction(s) ready to upload to cloud storage.
            </>
          )}
        </span>
      </div>

      {pendingCount > 0 && isOnline && (
        <button
          type="button"
          onClick={onSync}
          disabled={isSyncing}
          className="flex items-center space-x-1.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Uploading...' : `Upload ${pendingCount} Now`}</span>
        </button>
      )}
    </div>
  );
};
