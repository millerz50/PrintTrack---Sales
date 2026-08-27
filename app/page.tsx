
'use client';

import React, { useEffect, useState } from 'react';

import { Header } from '@/components/Header';
import { POSReceiptEntry } from '@/components/POSReceiptEntry';
import { DailyReportsView } from '@/components/DailyReportsView';
import { DailyCostTracker } from '@/components/DailyCostTracker';
import { InventoryManager } from '@/components/InventoryManager';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { ChatHub } from '@/components/ChatHub';
import { ReceiptModal } from '@/components/ReceiptModal';
import { AuthModal } from '@/components/AuthModal';
import { SettingsModal } from '@/components/SettingsModal';
import { OfflineSyncBanner } from '@/components/OfflineSyncBanner';

import { storage, CompanyInfo } from '@/services/storage';

import {
  User,
  SaleReceipt,
  DailyExpense,
  InventoryItem,
  StockMovement,
  DailyFinancialSummary,
} from '@/types';

import { getTodayDateString } from '@/data/initialData';

export default function HomePage() {
  // ============================================================
  // Browser / Hydration State
  // ============================================================

  const [isMounted, setIsMounted] = useState(false);

  // ============================================================
  // Application Data States
  // IMPORTANT:
  // These start as null/empty values so Next.js does not attempt
  // to access localStorage during build/prerendering.
  // ============================================================

  const [activeUser, setActiveUser] = useState<User | null>(null);

  const [company, setCompany] = useState<CompanyInfo | null>(null);

  const [sales, setSales] = useState<SaleReceipt[]>([]);

  const [expenses, setExpenses] = useState<DailyExpense[]>([]);

  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  const [stockMovements, setStockMovements] = useState<StockMovement[]>(
    []
  );

  // ============================================================
  // Date & Navigation State
  // ============================================================

  const [selectedDate, setSelectedDate] = useState<string>(
    getTodayDateString()
  );

  const [activeTab, setActiveTab] = useState<
    'pos' | 'reports' | 'costs' | 'inventory' | 'analytics' | 'chats'
  >('pos');

  // ============================================================
  // Connectivity & Sync State
  // ============================================================

  const [isOnline, setIsOnline] = useState<boolean>(true);

  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);

  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // ============================================================
  // Modals
  // ============================================================

  const [previewReceipt, setPreviewReceipt] =
    useState<SaleReceipt | null>(null);

  const [isAuthModalOpen, setIsAuthModalOpen] =
    useState<boolean>(false);

  const [isSettingsModalOpen, setIsSettingsModalOpen] =
    useState<boolean>(false);

  // ============================================================
  // Load Browser Storage
  // ============================================================

  useEffect(() => {
    // We are now definitely running in the browser.
    setIsMounted(true);

    // ------------------------------------------------------------
    // Load all localStorage-backed application data
    // ------------------------------------------------------------

    setActiveUser(storage.getActiveUser());

    setCompany(storage.getCompanyInfo());

    setSales(storage.getSales());

    setExpenses(storage.getExpenses());

    setInventory(storage.getInventory());

    setStockMovements(storage.getStockMovements());

    setIsOnline(storage.getOnlineStatus());

    setPendingSyncCount(storage.getPendingSyncCount());

    // ------------------------------------------------------------
    // Subscribe to storage changes in real-time
    // ------------------------------------------------------------

    const unsubscribe = storage.subscribe(() => {
      setSales(storage.getSales());

      setExpenses(storage.getExpenses());

      setInventory(storage.getInventory());

      setStockMovements(storage.getStockMovements());

      setCompany(storage.getCompanyInfo());

      setActiveUser(storage.getActiveUser());

      setIsOnline(storage.getOnlineStatus());

      setPendingSyncCount(storage.getPendingSyncCount());
    });

    // ------------------------------------------------------------
    // Cleanup subscription when component unmounts
    // ------------------------------------------------------------

    return () => {
      unsubscribe();
    };
  }, []);

  // ============================================================
  // Loading Screen
  // ============================================================
  //
  // This is important.
  //
  // During Next.js build/prerender:
  //
  // isMounted = false
  //
  // Therefore none of the localStorage-dependent rendering below
  // will execute.
  // ============================================================

  if (
    !isMounted ||
    activeUser === null ||
    company === null
  ) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-slate-700" />

          <h1 className="text-lg font-semibold text-slate-800">
            Loading Print Shop...
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Loading your local application data...
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // Compute Summary
  // ============================================================
  //
  // These methods may access localStorage, so they are intentionally
  // executed only after the browser has mounted.
  // ============================================================

  const dailySummary: DailyFinancialSummary =
    storage.getDailySummary(selectedDate);

  const inventoryAnalysis =
    storage.getStockDepletionAnalysis();

  const lowStockCount = inventoryAnalysis.filter(
    (item) =>
      item.status === 'critical' ||
      item.status === 'low'
  ).length;

  // ============================================================
  // Sync
  // ============================================================

  const handleSyncNow = async () => {
    setIsSyncing(true);

    try {
      await storage.processSyncQueue();
    } finally {
      setIsSyncing(false);
    }
  };

  // ============================================================
  // Receipt Created
  // ============================================================

  const handleReceiptCreated = (receipt: SaleReceipt) => {
    setPreviewReceipt(receipt);
  };

  // ============================================================
  // Main Application
  // ============================================================

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans antialiased">

      {/* ========================================================
          Offline Sync Banner
          ======================================================== */}

      <OfflineSyncBanner
        isOnline={isOnline}
        pendingCount={pendingSyncCount}
        onSync={handleSyncNow}
        isSyncing={isSyncing}
      />

      {/* ========================================================
          Main Header & Navbar
          ======================================================== */}

      <Header
        activeUser={activeUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        isOnline={isOnline}
        pendingSyncCount={pendingSyncCount}
        onSyncNow={handleSyncNow}
        isSyncing={isSyncing}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        summary={dailySummary}
        lowStockCount={lowStockCount}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        company={company}
      />

      {/* ========================================================
          Main Workspace
          ======================================================== */}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* ======================================================
            Tab 1: Point of Sale
            ====================================================== */}

        {activeTab === 'pos' && (
          <POSReceiptEntry
            inventory={inventory}
            activeUser={activeUser}
            company={company}
            onReceiptCreated={handleReceiptCreated}
          />
        )}

        {/* ======================================================
            Tab 2: Daily Reports
            ====================================================== */}

        {activeTab === 'reports' && (
          <DailyReportsView
            sales={sales}
            expenses={expenses}
            inventory={inventory}
            activeUser={activeUser}
            company={company}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            onSelectReceiptForPreview={(receipt) =>
              setPreviewReceipt(receipt)
            }
            onNavigateToPOS={() =>
              setActiveTab('pos')
            }
            onNavigateToCosts={() =>
              setActiveTab('costs')
            }
          />
        )}

        {/* ======================================================
            Tab 3: Daily Costs
            ====================================================== */}

        {activeTab === 'costs' && (
          <DailyCostTracker
            expenses={expenses}
            activeUser={activeUser}
            company={company}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            summary={dailySummary}
          />
        )}

        {/* ======================================================
            Tab 4: Inventory
            ====================================================== */}

        {activeTab === 'inventory' && (
          <InventoryManager
            inventory={inventory}
            stockMovements={stockMovements}
            activeUser={activeUser}
            company={company}
          />
        )}

        {/* ======================================================
            Tab 5: Analytics
            ====================================================== */}

        {activeTab === 'analytics' && (
          <AnalyticsDashboard
            sales={sales}
            expenses={expenses}
            inventory={inventory}
            company={company}
            selectedDate={selectedDate}
          />
        )}

        {/* ======================================================
            Tab 6: Chats
            ====================================================== */}

        {activeTab === 'chats' && (
          <ChatHub
            activeUser={activeUser}
            company={company}
            selectedDate={selectedDate}
          />
        )}

      </main>

      {/* ========================================================
          Footer
          ======================================================== */}

      <footer className="bg-white border-t border-slate-200 py-3 text-xs text-slate-500">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">

          <div>
            <span className="font-semibold text-slate-700">
              {company.name}
            </span>

            {' — '}

            Real-time Print Shop Sales, Inventory & Depletion Tracking
          </div>

          <div className="flex items-center space-x-3 text-slate-400">

            <span>
              Role:{' '}
              <strong className="text-slate-700 capitalize">
                {activeUser.role}
              </strong>
            </span>

            <span>•</span>

            <span>
              Offline-Ready (PWA Local Storage)
            </span>

            <span>•</span>

            <span>
              Date: {selectedDate}
            </span>

          </div>

        </div>

      </footer>

      {/* ========================================================
          Receipt Modal
          ======================================================== */}

      <ReceiptModal
        receipt={previewReceipt}
        company={company}
        onClose={() => setPreviewReceipt(null)}
      />

      {/* ========================================================
          Authentication Modal
          ======================================================== */}

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        activeUser={activeUser}
        onUserChanged={(user) => setActiveUser(user)}
      />

      {/* ========================================================
          Settings Modal
          ======================================================== */}

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        company={company}
        onCompanyUpdated={(info) => setCompany(info)}
      />

    </div>
  );
}
