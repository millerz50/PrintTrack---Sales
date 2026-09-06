'use client';

import { useAppData } from '@/hooks/useAppData';
import { useAppNavigation } from '@/hooks/useAppNavigation';
import { useAppSync } from '@/hooks/useAppSync';

import { AppLoading } from './AppLoading';
import { AppNavigation } from '@/components/navigation/AppNavigation';
import { AppWorkspace } from './AppWorkspace';
import { AppModals } from './AppModals';

export function AppShell() {
  const appData = useAppData();
  const navigation = useAppNavigation();
  const sync = useAppSync();

  if (!appData.isMounted || !appData.activeUser || !appData.company) {
    return <AppLoading />;
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col">
      <AppNavigation
        activeUser={appData.activeUser}
        company={appData.company}
        selectedDate={navigation.selectedDate}
        onDateChange={navigation.setSelectedDate}
        activeTab={navigation.activeTab}
        setActiveTab={navigation.setActiveTab}
        isOnline={sync.isOnline}
        pendingSyncCount={sync.pendingSyncCount}
        onSyncNow={sync.syncNow}
        isSyncing={sync.isSyncing}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AppWorkspace
          activeTab={navigation.activeTab}
          selectedDate={navigation.selectedDate}
          activeUser={appData.activeUser}
          company={appData.company}
          sales={appData.sales}
          expenses={appData.expenses}
          inventory={appData.inventory}
          stockMovements={appData.stockMovements}
          services={appData.services}
          onReceiptCreated={appData.setPreviewReceipt}
        />
      </main>

      <AppModals
        previewReceipt={appData.previewReceipt}
        setPreviewReceipt={appData.setPreviewReceipt}
        activeUser={appData.activeUser}
        company={appData.company}
        isAuthModalOpen={appData.isAuthModalOpen}
        setIsAuthModalOpen={appData.setIsAuthModalOpen}
        isSettingsModalOpen={appData.isSettingsModalOpen}
        setIsSettingsModalOpen={appData.setIsSettingsModalOpen}
      />
    </div>
  );
}
