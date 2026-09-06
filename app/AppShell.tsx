'use client';

import { useState, useEffect } from 'react';
import { useAppData } from '@/hooks/useAppData';
import { useAppNavigation } from '@/hooks/useAppNavigation';
import { useAppSync } from '@/hooks/useAppSync';
import { storage } from '@/services/storage';
import { Quotation, PaymentMethod, PortalMode, User } from '@/types';

import { AppLoading } from './AppLoading';
import { AppNavigation } from '@/components/navigation/AppNavigation';
import { AppWorkspace } from './AppWorkspace';
import { AppModals } from './AppModals';
import { PublicShowcaseWebsite } from '@/components/showcase/PublicShowcaseWebsite';

export function AppShell() {
  const appData = useAppData();
  const navigation = useAppNavigation();
  const sync = useAppSync();

  // Portal Mode: public_website vs staff_pos
  const [portalMode, setPortalMode] = useState<PortalMode>('public_website');
  const [staffUnlocked, setStaffUnlocked] = useState<boolean>(false);

  // Initialize staff session check on mount
  useEffect(() => {
    const savedMode = localStorage.getItem('magen_portal_view');
    const activeStaff = storage.getActiveUser();
    if (savedMode === 'staff_pos' && activeStaff) {
      setPortalMode('staff_pos');
      setStaffUnlocked(true);
    }
  }, []);

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

  const handleStaffLoginSuccess = (user: User) => {
    appData.setActiveUser(user);
    setStaffUnlocked(true);
    setPortalMode('staff_pos');
    localStorage.setItem('magen_portal_view', 'staff_pos');
  };

  const handleLockPos = () => {
    setStaffUnlocked(false);
    setPortalMode('public_website');
    localStorage.setItem('magen_portal_view', 'public_website');
  };

  const handleViewWebsite = () => {
    setPortalMode('public_website');
    localStorage.setItem('magen_portal_view', 'public_website');
  };

  const handleReturnToPos = () => {
    setPortalMode('staff_pos');
    localStorage.setItem('magen_portal_view', 'staff_pos');
  };

  return (
    <>
      {portalMode === 'public_website' ? (
        <>
          {/* Quick Staff Return Banner if staff session is already unlocked */}
          {staffUnlocked && appData.activeUser && (
            <div className="bg-[#0C2D64] text-white px-4 py-2 text-xs border-b border-blue-900 flex items-center justify-between sticky top-0 z-50 shadow-md">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>
                  Staff Session: <strong>{appData.activeUser.name}</strong> ({appData.activeUser.role})
                </span>
                <span className="text-slate-400 text-[11px] hidden sm:inline">&bull; Client Showcase Mode</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  id="return-to-pos-btn"
                  onClick={handleReturnToPos}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition cursor-pointer"
                >
                  Return to POS Terminal &rarr;
                </button>
                <button
                  id="banner-lock-pos-btn"
                  onClick={handleLockPos}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-300 rounded-lg text-xs transition cursor-pointer"
                >
                  Lock POS
                </button>
              </div>
            </div>
          )}

          <PublicShowcaseWebsite
            company={appData.company}
            services={appData.services}
            campaigns={appData.campaigns}
            activeStaffUser={staffUnlocked ? appData.activeUser : null}
            onStaffLoginSuccess={handleStaffLoginSuccess}
            onEnterPosDirectly={handleReturnToPos}
          />
        </>
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
