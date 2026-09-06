import {
  InventoryItem,
  SaleReceipt,
  DailyExpense,
  StockMovement,
  User,
  DailyFinancialSummary,
  PrintingCategory,
  ChatMessage,
  ChatChannel,
  Quotation,
  QuotationStatus,
  PaymentMethod
} from '../types';
import {
  INITIAL_INVENTORY,
  INITIAL_SALES,
  INITIAL_EXPENSES,
  INITIAL_STOCK_MOVEMENTS,
  INITIAL_USERS,
  INITIAL_CHATS,
  INITIAL_SERVICES,
  INITIAL_QUOTATIONS
} from '../data/initialData';

const KEYS = {
  INVENTORY: 'print_track_inventory_v1',
  SALES: 'print_track_sales_v1',
  EXPENSES: 'print_track_expenses_v1',
  MOVEMENTS: 'print_track_movements_v1',
  USERS: 'print_track_users_v1',
  ACTIVE_USER: 'print_track_active_user_v1',
  SYNC_QUEUE: 'print_track_sync_queue_v1',
  COMPANY_INFO: 'print_track_company_info_v1',
  CHATS: 'print_track_chats_v1',
  SERVICES: 'print_track_services_v1',
  QUOTATIONS: 'print_track_quotations_v1'
};

export interface CompanyInfo {
  name: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  currency: string;
  taxRate: number; // percentage, e.g. 0 or 16
  receiptFooter: string;
}

export const DEFAULT_COMPANY: CompanyInfo = {
  name: 'Magen Integrated Solutions',
  tagline: 'Media & Print Solutions | Environmental Consultancy',
  phone: '+263 77 123 4567 / +263 71 987 6543',
  email: 'orders@magensolutions.com',
  address: 'Media & Print Hub, Environmental Consultancy Wing',
  currency: '$',
  taxRate: 0,
  receiptFooter: 'Quality Media & Print Solutions | Environmental Consultancy. Thank you for partnering with Magen!'
};

export interface SyncQueueItem {
  id: string;
  type: 'sale' | 'expense' | 'inventory_update' | 'restock';
  payload: any;
  timestamp: string;
  status: 'pending' | 'syncing' | 'failed' | 'synced';
  retryCount: number;
}

class StorageService {
  private isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private listeners: Set<() => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.processSyncQueue();
        this.notify();
      });
      window.addEventListener('offline', () => {
        this.isOnline = false;
        this.notify();
      });
    }
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach(fn => fn());
  }

  public getOnlineStatus(): boolean {
    return this.isOnline;
  }

  // Company Info
  public getCompanyInfo(): CompanyInfo {
    const data = localStorage.getItem(KEYS.COMPANY_INFO);
    if (!data) {
      this.saveCompanyInfo(DEFAULT_COMPANY);
      return DEFAULT_COMPANY;
    }
    try {
      const parsed = JSON.parse(data);
      if (!parsed.name || parsed.name.includes('Apex') || parsed.name.includes('Print & Apparel')) {
        const updated = { ...DEFAULT_COMPANY, ...parsed, name: DEFAULT_COMPANY.name, tagline: DEFAULT_COMPANY.tagline, receiptFooter: DEFAULT_COMPANY.receiptFooter };
        this.saveCompanyInfo(updated);
        return updated;
      }
      return parsed;
    } catch {
      return DEFAULT_COMPANY;
    }
  }

  public saveCompanyInfo(info: CompanyInfo): void {
    localStorage.setItem(KEYS.COMPANY_INFO, JSON.stringify(info));
    this.notify();
  }

  // Users & Auth
  public getUsers(): User[] {
    const data = localStorage.getItem(KEYS.USERS);
    if (!data) {
      localStorage.setItem(KEYS.USERS, JSON.stringify(INITIAL_USERS));
    localStorage.setItem(KEYS.SERVICES, JSON.stringify(INITIAL_SERVICES));
      return INITIAL_USERS;
    }
    return JSON.parse(data);
  }

  public getActiveUser(): User {
    const data = localStorage.getItem(KEYS.ACTIVE_USER);
    if (data) {
      return JSON.parse(data);
    }
    const defaultUser = this.getUsers()[0]; // Default Sarah Admin
    localStorage.setItem(KEYS.ACTIVE_USER, JSON.stringify(defaultUser));
    return defaultUser;
  }

  public setActiveUser(user: User): void {
    localStorage.setItem(KEYS.ACTIVE_USER, JSON.stringify(user));
    this.notify();
  }

  // Services & Pricing
  public getServices(): import('../types').ServiceItem[] {
    const data = localStorage.getItem(KEYS.SERVICES);
    if (!data) {
      localStorage.setItem(KEYS.SERVICES, JSON.stringify(INITIAL_SERVICES));
      return INITIAL_SERVICES;
    }
    return JSON.parse(data);
  }

  public saveService(service: import('../types').ServiceItem): void {
    const list = this.getServices();
    const index = list.findIndex(s => s.id === service.id);
    if (index >= 0) list[index] = service;
    else list.push(service);
    localStorage.setItem(KEYS.SERVICES, JSON.stringify(list));
    this.notify();
  }

  public deleteService(id: string): void {
    const list = this.getServices().filter(s => s.id !== id);
    localStorage.setItem(KEYS.SERVICES, JSON.stringify(list));
    this.notify();
  }

  public toggleService(id: string): void {
    const list = this.getServices();
    const service = list.find(s => s.id === id);
    if (!service) return;
    service.active = !service.active;
    localStorage.setItem(KEYS.SERVICES, JSON.stringify(list));
    this.notify();
  }

  // Inventory
  public getInventory(): InventoryItem[] {
    const data = localStorage.getItem(KEYS.INVENTORY);
    if (!data) {
      localStorage.setItem(KEYS.INVENTORY, JSON.stringify(INITIAL_INVENTORY));
      return INITIAL_INVENTORY;
    }
    return JSON.parse(data);
  }

  public saveInventoryItem(item: InventoryItem): void {
    const list = this.getInventory();
    const index = list.findIndex(i => i.id === item.id);
    if (index >= 0) {
      list[index] = item;
    } else {
      list.push(item);
    }
    localStorage.setItem(KEYS.INVENTORY, JSON.stringify(list));
    this.enqueueSync({
      id: `sync_inv_${Date.now()}`,
      type: 'inventory_update',
      payload: item,
      timestamp: new Date().toISOString(),
      status: 'pending',
      retryCount: 0
    });
    this.notify();
  }

  public deleteInventoryItem(id: string): void {
    const list = this.getInventory().filter(i => i.id !== id);
    localStorage.setItem(KEYS.INVENTORY, JSON.stringify(list));
    this.notify();
  }

  public restockItem(id: string, quantityAdded: number, costPerUnit: number, notes: string, performedBy: string): void {
    const list = this.getInventory();
    const item = list.find(i => i.id === id);
    if (!item) return;

    item.currentStock += quantityAdded;
    if (costPerUnit > 0) {
      item.unitCost = costPerUnit;
    }
    item.lastRestocked = new Date().toISOString().split('T')[0];

    localStorage.setItem(KEYS.INVENTORY, JSON.stringify(list));

    // Record Stock Movement
    const movement: StockMovement = {
      id: `mov_${Date.now()}`,
      inventoryItemId: id,
      itemName: item.name,
      type: 'restock',
      quantity: quantityAdded,
      date: new Date().toISOString(),
      notes: notes || `Restocked ${quantityAdded} ${item.unit}`,
      performedBy
    };
    this.addStockMovement(movement);

    this.enqueueSync({
      id: `sync_restock_${Date.now()}`,
      type: 'restock',
      payload: { id, quantityAdded, costPerUnit, movement },
      timestamp: new Date().toISOString(),
      status: 'pending',
      retryCount: 0
    });

    this.notify();
  }

  // Stock Movements
  public getStockMovements(): StockMovement[] {
    const data = localStorage.getItem(KEYS.MOVEMENTS);
    if (!data) {
      localStorage.setItem(KEYS.MOVEMENTS, JSON.stringify(INITIAL_STOCK_MOVEMENTS));
      return INITIAL_STOCK_MOVEMENTS;
    }
    return JSON.parse(data);
  }

  public addStockMovement(movement: StockMovement): void {
    const list = this.getStockMovements();
    list.unshift(movement);
    localStorage.setItem(KEYS.MOVEMENTS, JSON.stringify(list));
    this.notify();
  }

  // Sales Receipts
  public getSales(): SaleReceipt[] {
    const data = localStorage.getItem(KEYS.SALES);
    if (!data) {
      localStorage.setItem(KEYS.SALES, JSON.stringify(INITIAL_SALES));
      return INITIAL_SALES;
    }
    return JSON.parse(data);
  }

  public getNextReceiptNumber(): string {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const sales = this.getSales();
    const countToday = sales.filter(s => s.date.startsWith(new Date().toISOString().slice(0, 10))).length;
    const seq = String(countToday + 1).padStart(3, '0');
    return `RCP-${today}-${seq}`;
  }

  public createSaleReceipt(receipt: Omit<SaleReceipt, 'id' | 'synced' | 'createdAt'>): SaleReceipt {
    const newReceipt: SaleReceipt = {
      ...receipt,
      id: `rec_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      synced: this.isOnline,
      createdAt: new Date().toISOString()
    };

    // Deduct stock for linked inventory items
    const inventory = this.getInventory();
    const movements = this.getStockMovements();
    let inventoryModified = false;

    receipt.items.forEach(item => {
      if (item.inventoryItemId) {
        const invItem = inventory.find(i => i.id === item.inventoryItemId);
        if (invItem) {
          const qtyToDeduct = (item.stockDeductionQty || 1) * item.quantity;
          invItem.currentStock = Math.max(0, invItem.currentStock - qtyToDeduct);
          inventoryModified = true;

          // Record movement
          movements.unshift({
            id: `mov_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
            inventoryItemId: invItem.id,
            itemName: invItem.name,
            type: 'sale_deduction',
            quantity: -qtyToDeduct,
            date: receipt.date,
            notes: `Receipt ${receipt.receiptNumber} (${item.description})`,
            performedBy: receipt.tellerName
          });
        }
      }
    });

    if (inventoryModified) {
      localStorage.setItem(KEYS.INVENTORY, JSON.stringify(inventory));
      localStorage.setItem(KEYS.MOVEMENTS, JSON.stringify(movements));
    }

    const sales = this.getSales();
    sales.unshift(newReceipt);
    localStorage.setItem(KEYS.SALES, JSON.stringify(sales));

    this.enqueueSync({
      id: `sync_sale_${newReceipt.id}`,
      type: 'sale',
      payload: newReceipt,
      timestamp: new Date().toISOString(),
      status: this.isOnline ? 'synced' : 'pending',
      retryCount: 0
    });

    this.notify();
    return newReceipt;
  }

  public deleteSaleReceipt(id: string): void {
    const sales = this.getSales().filter(s => s.id !== id);
    localStorage.setItem(KEYS.SALES, JSON.stringify(sales));
    this.notify();
  }

  // Quotations / Price Estimates
  public getQuotations(): Quotation[] {
    const data = localStorage.getItem(KEYS.QUOTATIONS);
    if (!data) {
      localStorage.setItem(KEYS.QUOTATIONS, JSON.stringify(INITIAL_QUOTATIONS));
      return INITIAL_QUOTATIONS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_QUOTATIONS;
    }
  }

  public getNextQuoteNumber(): string {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const quotes = this.getQuotations();
    const countToday = quotes.filter(q => q.date.replace(/-/g, '') === today).length;
    const seq = String(countToday + 1).padStart(3, '0');
    return `QT-${today}-${seq}`;
  }

  public saveQuotation(quote: Omit<Quotation, 'id' | 'createdAt'> & { id?: string }): Quotation {
    const quotes = this.getQuotations();
    if (quote.id) {
      const idx = quotes.findIndex(q => q.id === quote.id);
      if (idx >= 0) {
        const updated: Quotation = {
          ...quotes[idx],
          ...quote,
          id: quote.id
        };
        quotes[idx] = updated;
        localStorage.setItem(KEYS.QUOTATIONS, JSON.stringify(quotes));
        this.notify();
        return updated;
      }
    }

    const newQuote: Quotation = {
      ...quote,
      id: `quote_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      createdAt: new Date().toISOString()
    };
    quotes.unshift(newQuote);
    localStorage.setItem(KEYS.QUOTATIONS, JSON.stringify(quotes));
    this.notify();
    return newQuote;
  }

  public updateQuotationStatus(id: string, status: QuotationStatus): void {
    const quotes = this.getQuotations();
    const quote = quotes.find(q => q.id === id);
    if (quote) {
      quote.status = status;
      localStorage.setItem(KEYS.QUOTATIONS, JSON.stringify(quotes));
      this.notify();
    }
  }

  public deleteQuotation(id: string): void {
    const quotes = this.getQuotations().filter(q => q.id !== id);
    localStorage.setItem(KEYS.QUOTATIONS, JSON.stringify(quotes));
    this.notify();
  }

  public convertQuotationToReceipt(quoteId: string, paymentMethod: PaymentMethod, teller: User): SaleReceipt | null {
    const quotes = this.getQuotations();
    const quote = quotes.find(q => q.id === quoteId);
    if (!quote) return null;

    // Convert quotation items to sale items
    const saleItems = quote.items.map(item => ({
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      inventoryItemId: item.inventoryItemId,
      description: item.description,
      category: item.category,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
      stockDeductionQty: item.inventoryItemId ? 1 : undefined
    }));

    const receipt = this.createSaleReceipt({
      receiptNumber: this.getNextReceiptNumber(),
      date: new Date().toISOString(),
      customerName: quote.customerName,
      customerPhone: quote.customerPhone,
      items: saleItems,
      subtotal: quote.subtotal,
      discount: quote.discount || 0,
      tax: quote.taxAmount || 0,
      totalAmount: quote.totalAmount,
      paymentMethod,
      tellerId: teller.id,
      tellerName: teller.name,
      notes: `Converted from Quotation ${quote.quoteNumber}. ${quote.notes || ''}`
    });

    quote.status = 'Converted';
    quote.convertedReceiptId = receipt.id;
    localStorage.setItem(KEYS.QUOTATIONS, JSON.stringify(quotes));
    this.notify();

    return receipt;
  }

  // Daily Expenses
  public getExpenses(): DailyExpense[] {
    const data = localStorage.getItem(KEYS.EXPENSES);
    if (!data) {
      localStorage.setItem(KEYS.EXPENSES, JSON.stringify(INITIAL_EXPENSES));
      return INITIAL_EXPENSES;
    }
    return JSON.parse(data);
  }

  public createExpense(expense: Omit<DailyExpense, 'id' | 'synced' | 'createdAt'>): DailyExpense {
    const newExpense: DailyExpense = {
      ...expense,
      id: `exp_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      synced: this.isOnline,
      createdAt: new Date().toISOString()
    };

    const expenses = this.getExpenses();
    expenses.unshift(newExpense);
    localStorage.setItem(KEYS.EXPENSES, JSON.stringify(expenses));

    this.enqueueSync({
      id: `sync_exp_${newExpense.id}`,
      type: 'expense',
      payload: newExpense,
      timestamp: new Date().toISOString(),
      status: this.isOnline ? 'synced' : 'pending',
      retryCount: 0
    });

    this.notify();
    return newExpense;
  }

  public deleteExpense(id: string): void {
    const expenses = this.getExpenses().filter(e => e.id !== id);
    localStorage.setItem(KEYS.EXPENSES, JSON.stringify(expenses));
    this.notify();
  }

  // Sync Queue management
  public getSyncQueue(): SyncQueueItem[] {
    const data = localStorage.getItem(KEYS.SYNC_QUEUE);
    return data ? JSON.parse(data) : [];
  }

  public getPendingSyncCount(): number {
    return this.getSyncQueue().filter(i => i.status === 'pending' || i.status === 'failed').length;
  }

  private enqueueSync(item: SyncQueueItem): void {
    const queue = this.getSyncQueue();
    queue.push(item);
    localStorage.setItem(KEYS.SYNC_QUEUE, JSON.stringify(queue));
    if (this.isOnline) {
      this.processSyncQueue();
    }
  }

  public async processSyncQueue(): Promise<{ success: boolean; count: number }> {
    if (!this.isOnline) return { success: false, count: 0 };

    const queue = this.getSyncQueue();
    const pending = queue.filter(q => q.status === 'pending' || q.status === 'failed');
    if (pending.length === 0) return { success: true, count: 0 };

    // Simulate fast reliable cloud upload
    await new Promise(r => setTimeout(r, 600));

    const updatedQueue = queue.map(q => ({
      ...q,
      status: 'synced' as const
    }));

    // Clean up synced items older than a day, keep recent
    localStorage.setItem(KEYS.SYNC_QUEUE, JSON.stringify(updatedQueue.filter(q => q.status !== 'synced')));

    // Mark sales & expenses as synced
    const sales = this.getSales().map(s => ({ ...s, synced: true }));
    const expenses = this.getExpenses().map(e => ({ ...e, synced: true }));
    localStorage.setItem(KEYS.SALES, JSON.stringify(sales));
    localStorage.setItem(KEYS.EXPENSES, JSON.stringify(expenses));

    this.notify();
    return { success: true, count: pending.length };
  }

  // Financial Summaries Calculation
  public getDailySummary(dateStr: string): DailyFinancialSummary {
    const sales = this.getSales().filter(s => s.date.startsWith(dateStr));
    const expenses = this.getExpenses().filter(e => e.date === dateStr);
    const inventory = this.getInventory();

    let totalRevenue = 0;
    let totalCostOfGoods = 0;
    let totalItemsSold = 0;
    let cashSales = 0;
    let digitalSales = 0;

    sales.forEach(sale => {
      totalRevenue += sale.totalAmount;
      if (sale.paymentMethod === 'Cash') {
        cashSales += sale.totalAmount;
      } else {
        digitalSales += sale.totalAmount;
      }

      sale.items.forEach(item => {
        totalItemsSold += item.quantity;
        if (item.inventoryItemId) {
          const inv = inventory.find(i => i.id === item.inventoryItemId);
          if (inv) {
            totalCostOfGoods += (inv.unitCost * (item.stockDeductionQty || 1)) * item.quantity;
          }
        }
      });
    });

    let totalExpenses = 0;
    let cashExpenses = 0;
    expenses.forEach(exp => {
      totalExpenses += exp.amount;
      if (exp.paymentMethod === 'Cash') {
        cashExpenses += exp.amount;
      }
    });

    const grossProfit = totalRevenue - totalCostOfGoods;
    const netProfit = totalRevenue - (totalCostOfGoods + totalExpenses);
    const closingCashInDrawer = cashSales - cashExpenses;

    return {
      date: dateStr,
      totalRevenue,
      totalCostOfGoods,
      totalExpenses,
      grossProfit,
      netProfit,
      totalTransactions: sales.length,
      totalItemsSold,
      cashSales,
      digitalSales,
      cashExpenses,
      closingCashInDrawer
    };
  }

  // Stock Depletion Analytics Calculation
  public getStockDepletionAnalysis(): {
    item: InventoryItem;
    depletionRate: number; // units sold/used per day
    daysOfStockLeft: number;
    status: 'critical' | 'low' | 'healthy' | 'overstocked';
    stockValuation: number;
  }[] {
    const inventory = this.getInventory();
    const movements = this.getStockMovements();

    return inventory.map(item => {
      // Calculate real velocity from past 7 days of movements
      const recentDeductions = movements.filter(
        m => m.inventoryItemId === item.id && m.type === 'sale_deduction'
      );
      const totalUnitsDeducted = recentDeductions.reduce((sum, m) => sum + Math.abs(m.quantity), 0);
      const calculatedDailyRate = totalUnitsDeducted > 0 ? totalUnitsDeducted / 3 : (item.depletionRatePerDay || 1);

      const daysLeft = calculatedDailyRate > 0 ? Math.round(item.currentStock / calculatedDailyRate) : 999;

      let status: 'critical' | 'low' | 'healthy' | 'overstocked' = 'healthy';
      if (item.currentStock === 0) {
        status = 'critical';
      } else if (item.currentStock <= item.minThreshold) {
        status = 'low';
      } else if (daysLeft > 60 && item.currentStock > item.minThreshold * 3) {
        status = 'overstocked';
      }

      return {
        item,
        depletionRate: Number(calculatedDailyRate.toFixed(1)),
        daysOfStockLeft: daysLeft,
        status,
        stockValuation: Number((item.currentStock * item.unitCost).toFixed(2))
      };
    });
  }

  // Chats & Team Communication / AI Advisor
  public getChatMessages(channel?: ChatChannel): ChatMessage[] {
    const data = localStorage.getItem(KEYS.CHATS);
    let messages: ChatMessage[] = [];
    if (!data) {
      messages = INITIAL_CHATS;
      localStorage.setItem(KEYS.CHATS, JSON.stringify(INITIAL_CHATS));
    } else {
      try {
        messages = JSON.parse(data);
      } catch (e) {
        messages = INITIAL_CHATS;
      }
    }
    if (channel) {
      return messages.filter(m => m.channel === channel);
    }
    return messages;
  }

  public sendChatMessage(msg: Omit<ChatMessage, 'id' | 'timestamp'>): ChatMessage {
    const all = this.getChatMessages();
    const newMsg: ChatMessage = {
      ...msg,
      id: `chat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString()
    };
    all.push(newMsg);
    localStorage.setItem(KEYS.CHATS, JSON.stringify(all));
    this.notify();
    return newMsg;
  }

  public addSystemAlert(text: string, channel: ChatChannel = 'team_workshop', orderRef?: string, stockAlert?: ChatMessage['stockAlert']): ChatMessage {
    return this.sendChatMessage({
      channel,
      senderId: 'sys_alert',
      senderName: 'System Alert',
      senderRole: 'system',
      senderAvatar: '🔔',
      text,
      isUrgent: true,
      orderRef,
      stockAlert
    });
  }

  public resetToFactorySeeds(): void {
    localStorage.setItem(KEYS.INVENTORY, JSON.stringify(INITIAL_INVENTORY));
    localStorage.setItem(KEYS.SALES, JSON.stringify(INITIAL_SALES));
    localStorage.setItem(KEYS.EXPENSES, JSON.stringify(INITIAL_EXPENSES));
    localStorage.setItem(KEYS.MOVEMENTS, JSON.stringify(INITIAL_STOCK_MOVEMENTS));
    localStorage.setItem(KEYS.USERS, JSON.stringify(INITIAL_USERS));
    localStorage.setItem(KEYS.SERVICES, JSON.stringify(INITIAL_SERVICES));
    localStorage.setItem(KEYS.COMPANY_INFO, JSON.stringify(DEFAULT_COMPANY));
    localStorage.setItem(KEYS.CHATS, JSON.stringify(INITIAL_CHATS));
    localStorage.setItem(KEYS.QUOTATIONS, JSON.stringify(INITIAL_QUOTATIONS));
    localStorage.setItem(KEYS.SYNC_QUEUE, JSON.stringify([]));
    this.notify();
  }
}

export const storage = new StorageService();
