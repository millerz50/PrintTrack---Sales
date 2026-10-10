'use client';

import React, { useState, useEffect } from 'react';
import { useAppData } from '@/hooks/useAppData';
import { useAppNavigation } from '@/hooks/useAppNavigation';
import { useAppSync } from '@/hooks/useAppSync';
import { storage } from '@/services/storage';
import { Quotation, PaymentMethod, User } from '@/types';
import { createSaleReceiptAction } from '@/app/actions/sales';
import { updateQuotationStatusAction } from '@/app/actions/quotations';
import { DatabaseState } from '@/app/actions/appData';

import { AppLoading } from '@/app/AppLoading';
import { AppNavigation } from '@/components/navigation/AppNavigation';
import { AppWorkspace } from '@/app/AppWorkspace';
import { AppModals } from '@/app/AppModals';
import { StaffLockScreen } from './StaffLockScreen';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';
import { Bell, Sparkles } from 'lucide-react';

interface PosTerminalShellProps {
  initialData?: DatabaseState;
}

export function PosTerminalShell({ initialData }: PosTerminalShellProps = {}) {
  const appData = useAppData(initialData);
  const navigation = useAppNavigation();
  const sync = useAppSync();

  const [staffUnlocked, setStaffUnlocked] = useState<boolean>(false);

  // Real-time synchronization bus (WebSockets / SSE)
  const { liveAlert, isConnected: isRealtimeConnected } = useRealtimeSync({
    onRefresh: () => {
      appData.refetchDb();
    },
    enableChime: true
  });

  // Check existing session authentication on mount
  useEffect(() => {
    try {
      const activeStaff = storage.getActiveUser();
      const savedUnlocked = sessionStorage.getItem('magen_staff_pos_unlocked');
      if (savedUnlocked === 'true' && activeStaff) {
        setStaffUnlocked(true);
      }
    } catch {
      // ignore
    }
  }, []);

  if (!appData.isMounted || !appData.company) {
    return <AppLoading />;
  }

  const handleUnlock = (user: User) => {
    appData.setActiveUser(user);
    setStaffUnlocked(true);
    try {
      sessionStorage.setItem('magen_staff_pos_unlocked', 'true');
    } catch {
      // ignore
    }
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
  };

  const handleNavigateToWebsite = () => {
    window.location.href = '/';
  };

  const handleConvertToReceipt = (quotation: Quotation, paymentMethod: PaymentMethod) => {
    if (!appData.activeUser) return;
    const receipt = storage.convertQuotationToReceipt(quotation.id, paymentMethod, appData.activeUser);
    if (receipt) {
      createSaleReceiptAction(receipt).catch(err => console.warn('[PosTerminal] Convert receipt DB error:', err));
      updateQuotationStatusAction(quotation.id, 'Converted', receipt.id).catch(err => console.warn('[PosTerminal] Quote status DB error:', err));
      appData.setPreviewQuotation(null);
      appData.setPreviewReceipt(receipt);
    }
  };

  // If locked, present the dedicated full-screen PIN entry terminal
  if (!staffUnlocked) {
    return (
      <StaffLockScreen
        company={appData.company}
        onUnlock={handleUnlock}
        onBackToWebsite={handleNavigateToWebsite}
      />
    );
  }

  // If unlocked, render the comprehensive POS & Workshop Terminal
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      {/* Real-Time Live Notification Toast Bar */}
      {liveAlert && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-2.5 text-xs font-bold shadow-md sticky top-0 z-50 animate-in slide-in-from-top duration-200">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping shrink-0" />
              <span>{liveAlert}</span>
            </div>
            <button
              type="button"
              onClick={() => navigation.setActiveTab('quotations')}
              className="bg-white/20 hover:bg-white/30 text-white px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer shrink-0"
            >
              Open Quotations &rarr;
            </button>
          </div>
        </div>
      )}

      <AppNavigation
        activeUser={appData.activeUser || storage.getActiveUser()}
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
        onViewWebsite={handleNavigateToWebsite}
        onLockPos={handleLockPos}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AppWorkspace
          activeTab={navigation.activeTab}
          selectedDate={navigation.selectedDate}
          onDateChange={navigation.setSelectedDate}
          activeUser={appData.activeUser || storage.getActiveUser()}
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
        activeUser={appData.activeUser || storage.getActiveUser()}
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
