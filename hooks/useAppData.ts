// hooks/useAppData.ts

'use client';

import { useEffect, useState } from 'react';
import { storage, CompanyInfo } from '@/services/storage';

import {
  User,
  SaleReceipt,
  DailyExpense,
  InventoryItem,
  StockMovement,
  ServiceItem,
  Quotation,
  MarketingCampaign
} from '@/types';

export function useAppData() {
  const [isMounted, setIsMounted] = useState(false);

  const [activeUser, setActiveUser] = useState<User | null>(null);
  const [company, setCompany] = useState<CompanyInfo | null>(null);

  const [sales, setSales] = useState<SaleReceipt[]>([]);
  const [expenses, setExpenses] = useState<DailyExpense[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);

  const [previewReceipt, setPreviewReceipt] =
    useState<SaleReceipt | null>(null);
  const [previewQuotation, setPreviewQuotation] =
    useState<Quotation | null>(null);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    const load = () => {
      setActiveUser(storage.getActiveUser());
      setCompany(storage.getCompanyInfo());
      setSales(storage.getSales());
      setExpenses(storage.getExpenses());
      setInventory(storage.getInventory());
      setStockMovements(storage.getStockMovements());
      setServices(storage.getServices());
      setQuotations(storage.getQuotations());
      setCampaigns(storage.getMarketingCampaigns());
    };

    load();

    const unsubscribe = storage.subscribe(load);

    return unsubscribe;
  }, []);

  return {
    isMounted,

    activeUser,
    setActiveUser,

    company,
    setCompany,

    sales,
    expenses,
    inventory,
    stockMovements,
    services,
    quotations,
    campaigns,

    previewReceipt,
    setPreviewReceipt,

    previewQuotation,
    setPreviewQuotation,

    isAuthModalOpen,
    setIsAuthModalOpen,

    isSettingsModalOpen,
    setIsSettingsModalOpen,
  };
}
