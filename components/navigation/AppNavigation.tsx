'use client';

import React, { useMemo } from 'react';
import { Header } from '@/components/Header';
import { OfflineSyncBanner } from '@/components/OfflineSyncBanner';
import { User, InventoryItem } from '@/types';
import { CompanyInfo, storage } from '@/services/storage';
import { AppTab } from '@/hooks/useAppNavigation';

export interface AppNavigationProps {
  activeUser: User;
  company: CompanyInfo;
  selectedDate: string;
  onDateChange: (date: string) => void;
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  isOnline: boolean;
  pendingSyncCount: number;
  onSyncNow: () => void;
  isSyncing: boolean;
  onOpenAuth?: () => void;
  onOpenSettings?: () => void;
  inventory?: InventoryItem[];
}

export function AppNavigation({
  activeUser,
  company,
  selectedDate,
  onDateChange,
  activeTab,
  setActiveTab,
  isOnline,
  pendingSyncCount,
  onSyncNow,
  isSyncing,
  onOpenAuth = () => {},
  onOpenSettings = () => {},
  inventory
}: AppNavigationProps) {
  const summary = useMemo(() => {
    return storage.getDailySummary(selectedDate);
  }, [selectedDate, pendingSyncCount]);

  const items = inventory ?? storage.getInventory();
  const lowStockCount = items.filter(i => i.currentStock <= i.minThreshold).length;

  return (
    <>
      <Header
        activeUser={activeUser}
        onOpenAuth={onOpenAuth}
        onOpenSettings={onOpenSettings}
        isOnline={isOnline}
        pendingSyncCount={pendingSyncCount}
        onSyncNow={onSyncNow}
        isSyncing={isSyncing}
        selectedDate={selectedDate}
        onDateChange={onDateChange}
        summary={summary}
        lowStockCount={lowStockCount}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        company={company}
      />
      <OfflineSyncBanner
        isOnline={isOnline}
        pendingCount={pendingSyncCount}
        onSync={onSyncNow}
        isSyncing={isSyncing}
      />
    </>
  );
}
