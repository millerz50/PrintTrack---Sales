'use client';

import React, { useState, useEffect } from 'react';
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
  DailyFinancialSummary
} from '@/types';
import { getTodayDateString } from '@/data/initialData';

export default function HomePage() {
  // Application Data States (synced with storage)
  const [activeUser, setActiveUser] = useState<User>(() => storage.getActiveUser());
  const [company, setCompany] = useState<CompanyInfo>(() => storage.getCompanyInfo());
  const [sales, setSales] = useState<SaleReceipt[]>(() => storage.getSales());
  const [expenses, setExpenses] = useState<DailyExpense[]>(() => storage.getExpenses());
  const [inventory, setInventory] = useState<InventoryItem[]>(() => storage.getInventory());
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(() => storage.getStockMovements());

  // Date & Navigation State
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [activeTab, setActiveTab] = useState<'pos' | 'reports' | 'costs' | 'inventory' | 'analytics' | 'chats'>('pos');

  // Connectivity & Sync State
  const [isOnline, setIsOnline] = useState<boolean>(() => storage.getOnlineStatus());
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(() => storage.getPendingSyncCount());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Modals
  const [previewReceipt, setPreviewReceipt] = useState<SaleReceipt | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);

  // Subscribe to storage changes in real-time
  useEffect(() => {
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

    return () => {
      unsubscribe();
    };
  }, []);

  // Compute summary for the selected date
  const dailySummary: DailyFinancialSummary = storage.getDailySummary(selectedDate);
  const inventoryAnalysis = storage.getStockDepletionAnalysis();
  const lowStockCount = inventoryAnalysis.filter(i => i.status === 'critical' || i.status === 'low').length;

  const handleSyncNow = async () => {
    setIsSyncing(true);
    await storage.processSyncQueue();
    setIsSyncing(false);
  };

  const handleReceiptCreated = (receipt: SaleReceipt) => {
    setPreviewReceipt(receipt);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans antialiased">
      {/* Offline sync banner */}
      <OfflineSyncBanner
        isOnline={isOnline}
        pendingCount={pendingSyncCount}
        onSync={handleSyncNow}
        isSyncing={isSyncing}
      />

      {/* Main Header & Navbar */}
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

      {/* Main Workspace Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tab 1: Point of Sale & Receipt Entry */}
        {activeTab === 'pos' && (
          <POSReceiptEntry
            inventory={inventory}
            activeUser={activeUser}
            company={company}
            onReceiptCreated={handleReceiptCreated}
          />
        )}

        {/* Tab 2: Daily Summarized Reports & Receipt Audit */}
        {activeTab === 'reports' && (
          <DailyReportsView
            sales={sales}
            expenses={expenses}
            inventory={inventory}
            activeUser={activeUser}
            company={company}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            onSelectReceiptForPreview={receipt => setPreviewReceipt(receipt)}
            onNavigateToPOS={() => setActiveTab('pos')}
            onNavigateToCosts={() => setActiveTab('costs')}
          />
        )}

        {/* Tab 3: Daily Cost & Expense Tracker */}
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

        {/* Tab 4: Real-time Inventory & Stock Depletion */}
        {activeTab === 'inventory' && (
          <InventoryManager
            inventory={inventory}
            stockMovements={stockMovements}
            activeUser={activeUser}
            company={company}
          />
        )}

        {/* Tab 5: Analytics & Trends */}
        {activeTab === 'analytics' && (
          <AnalyticsDashboard
            sales={sales}
            expenses={expenses}
            inventory={inventory}
            company={company}
            selectedDate={selectedDate}
          />
        )}

        {/* Tab 6: Workshop Team & AI Assistant Chat */}
        {activeTab === 'chats' && (
          <ChatHub
            activeUser={activeUser}
            company={company}
            selectedDate={selectedDate}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-3 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <span className="font-semibold text-slate-700">{company.name}</span> — Real-time Print Shop Sales, Inventory & Depletion Tracking
          </div>
          <div className="flex items-center space-x-3 text-slate-400">
            <span>Role: <strong className="text-slate-700 capitalize">{activeUser.role}</strong></span>
            <span>•</span>
            <span>Offline-Ready (PWA Local Storage)</span>
            <span>•</span>
            <span>Date: {selectedDate}</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ReceiptModal
        receipt={previewReceipt}
        company={company}
        onClose={() => setPreviewReceipt(null)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        activeUser={activeUser}
        onUserChanged={user => setActiveUser(user)}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        company={company}
        onCompanyUpdated={info => setCompany(info)}
      />
    </div>
  );
}
