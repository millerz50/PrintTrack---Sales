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
    setStaffUnlocked(true);
    setPortalMode('staff_pos');
    localStorage.setItem('magen_portal_view', 'staff_pos');
  };

  return (
    <>
      {/* Top Application Mode Bar */}
      <div className="bg-slate-950 text-white px-4 py-2 text-xs border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 sticky top-0 z-50 shadow-md">
        <div className="flex items-center space-x-2.5">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Mode:</span>
          <div className="inline-flex rounded-lg bg-slate-900 p-1 border border-slate-800">
            <button
              id="switch-to-showcase-btn"
              onClick={handleViewWebsite}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition flex items-center space-x-1.5 cursor-pointer ${
                portalMode === 'public_website'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🌐</span>
              <span>Public Showcase Website</span>
            </button>
            <button
              id="switch-to-pos-btn"
              onClick={handleReturnToPos}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition flex items-center space-x-1.5 cursor-pointer ${
                portalMode === 'staff_pos'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>💼</span>
              <span>POS &amp; Workshop Backoffice</span>
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1.5 text-slate-300">
            <span className="text-base">{appData.activeUser.avatar || '👑'}</span>
            <span className="font-semibold text-slate-200">{appData.activeUser.name}</span>
            <span className="text-[10px] bg-slate-800 text-emerald-400 border border-slate-700 px-1.5 py-0.5 rounded capitalize">
              {appData.activeUser.role}
            </span>
          </div>

          {portalMode === 'public_website' ? (
            <button
              onClick={handleReturnToPos}
              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs transition flex items-center space-x-1 cursor-pointer shadow-xs"
            >
              <span>Launch POS Workspace</span>
              <span>&rarr;</span>
            </button>
          ) : (
            <button
              onClick={handleViewWebsite}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium rounded-lg text-xs transition cursor-pointer"
            >
              Preview Public Site
            </button>
          )}
        </div>
      </div>

      {portalMode === 'public_website' ? (
        <PublicShowcaseWebsite
          company={appData.company}
          services={appData.services}
          campaigns={appData.campaigns}
          activeStaffUser={appData.activeUser}
          onStaffLoginSuccess={handleStaffLoginSuccess}
          onEnterPosDirectly={handleReturnToPos}
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
