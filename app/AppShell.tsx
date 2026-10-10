'use client';

import { useState, useEffect } from 'react';
import { useAppData } from '@/hooks/useAppData';
import { useAppNavigation } from '@/hooks/useAppNavigation';
import { useAppSync } from '@/hooks/useAppSync';
import { storage } from '@/services/storage';
import { Quotation, PaymentMethod, PortalMode, User } from '@/types';
import { createSaleReceiptAction } from '@/app/actions/sales';
import { updateQuotationStatusAction } from '@/app/actions/quotations';

import { AppLoading } from './AppLoading';
import { AppNavigation } from '@/components/navigation/AppNavigation';
import { AppWorkspace } from './AppWorkspace';
import { AppModals } from './AppModals';
import { PublicShowcaseWebsite } from '@/components/showcase/PublicShowcaseWebsite';
import { DatabaseState } from '@/app/actions/appData';

interface AppShellProps {
  initialData?: DatabaseState;
}

export function AppShell({ initialData }: AppShellProps = {}) {
  const appData = useAppData(initialData);
  const navigation = useAppNavigation();
  const sync = useAppSync();

  // Portal Mode: public_website vs staff_pos
  const [portalMode, setPortalMode] = useState<PortalMode>('public_website');
  const [staffUnlocked, setStaffUnlocked] = useState<boolean>(false);

  // Initialize staff session check on mount
  useEffect(() => {
    try {
      const isUnlocked = sessionStorage.getItem('magen_staff_pos_unlocked');
      const activeStaff = storage.getActiveUser();
      if (isUnlocked === 'true' && activeStaff) {
        setStaffUnlocked(true);
        appData.setActiveUser(activeStaff);
      } else {
        setStaffUnlocked(false);
        appData.setActiveUser(null);
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  if (!appData.isMounted || !appData.company) {
    return <AppLoading />;
  }

  const handleConvertToReceipt = (quotation: Quotation, paymentMethod: PaymentMethod) => {
    if (!appData.activeUser) return;
    const receipt = storage.convertQuotationToReceipt(quotation.id, paymentMethod, appData.activeUser);
    if (receipt) {
      createSaleReceiptAction(receipt).catch(err => console.warn('[AppShell] Convert receipt DB error:', err));
      updateQuotationStatusAction(quotation.id, 'Converted', receipt.id).catch(err => console.warn('[AppShell] Quote status DB error:', err));
      appData.setPreviewQuotation(null);
      appData.setPreviewReceipt(receipt);
    }
  };

  const handleStaffLoginSuccess = (user: User) => {
    appData.setActiveUser(user);
    setStaffUnlocked(true);
    try {
      sessionStorage.setItem('magen_staff_pos_unlocked', 'true');
    } catch {
      // ignore
    }
    // Route directly to the authorized POS terminal
    window.location.href = '/pos';
  };

  const handleLockPos = () => {
    storage.lockPos();
    appData.setActiveUser(null);
    setStaffUnlocked(false);
    try {
      sessionStorage.removeItem('magen_staff_pos_unlocked');
      localStorage.removeItem('magen_portal_view');
    } catch {
      // ignore
    }
    setPortalMode('public_website');
  };

  const handleViewWebsite = () => {
    window.location.href = '/';
  };

  const handleReturnToPos = () => {
    window.location.href = '/pos';
  };

  return (
    <>
      {portalMode === 'public_website' || !staffUnlocked || !appData.activeUser ? (
        <PublicShowcaseWebsite
          company={appData.company}
          services={appData.services}
          campaigns={appData.campaigns}
          activeStaffUser={staffUnlocked ? appData.activeUser : null}
          onStaffLoginSuccess={handleStaffLoginSuccess}
          onEnterPosDirectly={staffUnlocked && appData.activeUser ? handleReturnToPos : undefined}
          isLoadingDb={appData.isLoadingDb}
          lastSyncedAt={appData.lastSyncedAt}
          onRefreshDb={appData.refetchDb}
        />
      ) : (
        <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col">
          <AppNavigation
            activeUser={appData.activeUser}
            company={appData.company}
            selectedDate={navigation.selectedDate}
            onDateChange={navigation.setSelectedDate}
            appMode={navigation.appMode}
            setAppMode={navigation.setAppMode}
            activeTab={navigation.activeTab}
            setActiveTab={navigation.setActiveTab}
            isOnline={sync.isOnline}
            pendingSyncCount={sync.pendingSyncCount}
            onSyncNow={sync.syncNow}
            isSyncing={sync.isSyncing}
            onOpenAuth={() => appData.setIsAuthModalOpen(true)}
            onOpenSettings={() => appData.setIsSettingsModalOpen(true)}
            inventory={appData.inventory}
            onViewWebsite={handleViewWebsite}
            onLockPos={handleLockPos}
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
      )}
    </>
  );
}
