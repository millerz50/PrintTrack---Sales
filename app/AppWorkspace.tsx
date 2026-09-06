'use client';

import React from 'react';
import {
  User,
  SaleReceipt,
  DailyExpense,
  InventoryItem,
  StockMovement,
  ServiceItem,
  Quotation,
  PaymentMethod
} from '@/types';
import { CompanyInfo, storage } from '@/services/storage';
import { AppTab } from '@/hooks/useAppNavigation';

import { POSReceiptEntry } from '@/components/POSReceiptEntry';
import { QuotationManager } from '@/components/QuotationManager';
import { DailyReportsView } from '@/components/DailyReportsView';
import { DailyCostTracker } from '@/components/DailyCostTracker';
import { ServiceManager } from '@/components/ServiceManager';
import { InventoryManager } from '@/components/InventoryManager';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { ChatHub } from '@/components/ChatHub';
import { MarketingCampaigns } from '@/components/marketing/MarketingCampaigns';
import { ClientLeadsCRM } from '@/components/marketing/ClientLeadsCRM';
import { AiMarketingHub } from '@/components/marketing/AiMarketingHub';

export interface AppWorkspaceProps {
  activeTab: AppTab;
  selectedDate: string;
  onDateChange?: (date: string) => void;
  activeUser: User;
  company: CompanyInfo;
  sales: SaleReceipt[];
  expenses: DailyExpense[];
  inventory: InventoryItem[];
  stockMovements: StockMovement[];
  services: ServiceItem[];
  quotations: Quotation[];
  onReceiptCreated: (receipt: SaleReceipt) => void;
  onSelectQuotation: (quotation: Quotation) => void;
  onConvertToReceipt: (quotation: Quotation, paymentMethod: PaymentMethod) => void;
  onNavigateToTab?: (tab: AppTab) => void;
}

export function AppWorkspace({
  activeTab,
  selectedDate,
  onDateChange = () => {},
  activeUser,
  company,
  sales,
  expenses,
  inventory,
  stockMovements,
  services,
  quotations,
  onReceiptCreated,
  onSelectQuotation,
  onConvertToReceipt,
  onNavigateToTab = () => {}
}: AppWorkspaceProps) {
  const summary = storage.getDailySummary(selectedDate);

  return (
    <>
      {activeTab === 'pos' && (
        <POSReceiptEntry
          inventory={inventory}
          services={services}
          activeUser={activeUser}
          company={company}
          onReceiptCreated={onReceiptCreated}
          onQuotationCreated={onSelectQuotation}
        />
      )}

      {activeTab === 'quotations' && (
        <QuotationManager
          quotations={quotations}
          services={services}
          inventory={inventory}
          activeUser={activeUser}
          company={company}
          onSelectQuotation={onSelectQuotation}
          onConvertToReceipt={onConvertToReceipt}
          onReceiptCreated={onReceiptCreated}
        />
      )}

      {activeTab === 'reports' && (
        <DailyReportsView
          sales={sales}
          expenses={expenses}
          inventory={inventory}
          activeUser={activeUser}
          company={company}
          selectedDate={selectedDate}
          onDateChange={onDateChange}
          onSelectReceiptForPreview={onReceiptCreated}
          onNavigateToPOS={() => onNavigateToTab('pos')}
          onNavigateToCosts={() => onNavigateToTab('costs')}
        />
      )}

      {activeTab === 'costs' && (
        <DailyCostTracker
          expenses={expenses}
          activeUser={activeUser}
          company={company}
          selectedDate={selectedDate}
          onDateChange={onDateChange}
          summary={summary}
        />
      )}

      {activeTab === 'services' && (
        <ServiceManager
          services={services}
          inventory={inventory}
          activeUser={activeUser}
          company={company}
        />
      )}

      {activeTab === 'inventory' && (
        <InventoryManager
          inventory={inventory}
          stockMovements={stockMovements}
          activeUser={activeUser}
          company={company}
        />
      )}

      {activeTab === 'analytics' && (
        <AnalyticsDashboard
          sales={sales}
          expenses={expenses}
          inventory={inventory}
          company={company}
          selectedDate={selectedDate}
        />
      )}

      {activeTab === 'chats' && (
        <ChatHub
          activeUser={activeUser}
          company={company}
          selectedDate={selectedDate}
        />
      )}

      {activeTab === 'campaigns' && (
        <MarketingCampaigns
          company={company}
          activeUser={activeUser}
          onStartQuotationWithPromo={() => onNavigateToTab('quotations')}
          onNavigateToTab={onNavigateToTab}
        />
      )}

      {activeTab === 'clients' && (
        <ClientLeadsCRM
          company={company}
          activeUser={activeUser}
          onSelectClientForQuote={() => onNavigateToTab('quotations')}
          onNavigateToTab={onNavigateToTab}
        />
      )}

      {activeTab === 'ai_marketing' && (
        <AiMarketingHub
          company={company}
          activeUser={activeUser}
        />
      )}
    </>
  );
}
