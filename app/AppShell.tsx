'use client';

import { useAppData } from '@/hooks/useAppData';
import { useAppNavigation } from '@/hooks/useAppNavigation';
import { useAppSync } from '@/hooks/useAppSync';
import { storage } from '@/services/storage';
import { Quotation, PaymentMethod } from '@/types';

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

  const handleConvertToReceipt = (quotation: Quotation, paymentMethod: PaymentMethod) => {
    if (!appData.activeUser) return;
    const receipt = storage.convertQuotationToReceipt(quotation.id, paymentMethod, appData.activeUser);
    if (receipt) {
      appData.setPreviewQuotation(null);
      appData.setPreviewReceipt(receipt);
    }
  };

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
        onOpenAuth={() => appData.setIsAuthModalOpen(true)}
        onOpenSettings={() => appData.setIsSettingsModalOpen(true)}
        inventory={appData.inventory}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AppWorkspace
          activeTab={navigation.activeTab}
          selectedDate={navigation.selectedDate}
          onDateChange={navigation.setSelectedDate}
          activeUser={appData.activeUser}
          company={appData.company}
          sales={appData.sales}
          expenses={appData.expenses}
          inventory={appData.inventory}
          stockMovements={appData.stockMovements}
          services={appData.services}
          quotations={appData.quotations}
          onReceiptCreated={appData.setPreviewReceipt}
          onSelectQuotation={appData.setPreviewQuotation}
          onConvertToReceipt={handleConvertToReceipt}
          onNavigateToTab={navigation.setActiveTab}
        />
      </main>

      <AppModals
        previewReceipt={appData.previewReceipt}
        setPreviewReceipt={appData.setPreviewReceipt}
        previewQuotation={appData.previewQuotation}
        setPreviewQuotation={appData.setPreviewQuotation}
        activeUser={appData.activeUser}
        company={appData.company}
        isAuthModalOpen={appData.isAuthModalOpen}
        setIsAuthModalOpen={appData.setIsAuthModalOpen}
        isSettingsModalOpen={appData.isSettingsModalOpen}
        setIsSettingsModalOpen={appData.setIsSettingsModalOpen}
        onUserChanged={appData.setActiveUser}
        onCompanyUpdated={appData.setCompany}
        onConvertToReceipt={handleConvertToReceipt}
      />
    </div>
  );
}
