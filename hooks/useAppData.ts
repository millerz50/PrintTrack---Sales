// hooks/useAppData.ts

'use client';

import { useEffect, useState, useCallback } from 'react';
import { storage, CompanyInfo } from '@/services/storage';
import { getDatabaseStateAction } from '@/app/actions/appData';

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

  const [isLoadingDb, setIsLoadingDb] = useState(true);

  const fetchFreshDatabaseState = useCallback(async () => {
    try {
      const dbState = await getDatabaseStateAction();
      if (dbState) {
        storage.hydrateFromDatabase(dbState);
        if (dbState.company) setCompany(dbState.company);
        if (dbState.sales) setSales(dbState.sales);
        if (dbState.expenses) setExpenses(dbState.expenses);
        if (dbState.inventory) setInventory(dbState.inventory);
        if (dbState.stockMovements) setStockMovements(dbState.stockMovements);
        if (dbState.services) setServices(dbState.services);
        if (dbState.quotations) setQuotations(dbState.quotations);
        if (dbState.users && dbState.users.length > 0) {
          const current = storage.getActiveUser();
          const matched = dbState.users.find(u => u.id === current.id);
          if (matched) setActiveUser(matched);
        }
      }
    } catch (err) {
      console.warn('[useAppData] Server action fetch warning (using local sync fallback):', err);
    } finally {
      setIsLoadingDb(false);
    }
  }, []);

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
    fetchFreshDatabaseState();

    const unsubscribe = storage.subscribe(load);

    return unsubscribe;
  }, [fetchFreshDatabaseState]);

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
