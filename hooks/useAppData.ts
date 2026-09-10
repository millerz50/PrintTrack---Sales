// hooks/useAppData.ts

'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { storage, CompanyInfo } from '@/services/storage';
import { getDatabaseStateAction, DatabaseState } from '@/app/actions/appData';

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

export function useAppData(initialData?: DatabaseState) {
  const [isMounted, setIsMounted] = useState(false);

  const [activeUser, setActiveUser] = useState<User | null>(
    initialData?.users?.[0] || null
  );
  const [company, setCompany] = useState<CompanyInfo | null>(
    initialData?.company || null
  );

  const [sales, setSales] = useState<SaleReceipt[]>(initialData?.sales || []);
  const [expenses, setExpenses] = useState<DailyExpense[]>(initialData?.expenses || []);
  const [inventory, setInventory] = useState<InventoryItem[]>(initialData?.inventory || []);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(initialData?.stockMovements || []);
  const [services, setServices] = useState<ServiceItem[]>(initialData?.services || []);
  const [quotations, setQuotations] = useState<Quotation[]>(initialData?.quotations || []);
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);

  const [previewReceipt, setPreviewReceipt] =
    useState<SaleReceipt | null>(null);
  const [previewQuotation, setPreviewQuotation] =
    useState<Quotation | null>(null);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const [isLoadingDb, setIsLoadingDb] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date>(new Date());
  const initialHydrated = useRef(false);

  const fetchFreshDatabaseState = useCallback(async () => {
    try {
      setIsLoadingDb(true);
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
        setLastSyncedAt(new Date());
      }
    } catch (err) {
      console.warn('[useAppData] Server action fetch warning (using local sync fallback):', err);
    } finally {
      setIsLoadingDb(false);
    }
  }, []);

  useEffect(() => {
    setIsMounted(true);

    if (initialData && !initialHydrated.current) {
      storage.hydrateFromDatabase(initialData);
      initialHydrated.current = true;
    }

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
  }, [fetchFreshDatabaseState, initialData]);

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

    isLoadingDb,
    lastSyncedAt,
    refetchDb: fetchFreshDatabaseState,
  };
}
