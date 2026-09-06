// hooks/useAppSync.ts

'use client';

import { useEffect, useState } from 'react';
import { storage } from '@/services/storage';

export function useAppSync() {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const update = () => {
      setIsOnline(storage.getOnlineStatus());
      setPendingSyncCount(storage.getPendingSyncCount());
    };

    update();

    return storage.subscribe(update);
  }, []);

  const syncNow = async () => {
    setIsSyncing(true);

    try {
      await storage.triggerManualSync();
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    isOnline,
    pendingSyncCount,
    isSyncing,
    syncNow,
  };
}
