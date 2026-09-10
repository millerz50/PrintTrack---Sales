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
  PaymentMethod,
  MarketingCampaign,
  ClientLead
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
  QUOTATIONS: 'print_track_quotations_v1',
  CAMPAIGNS: 'print_track_campaigns_v1'
};

export const INITIAL_CAMPAIGNS: MarketingCampaign[] = [
  {
    id: 'camp_01',
    title: 'Back-to-School Modules & Exam Papers',
    subtitle: '15% Discount on Bulk Academic Booklets & School Reports',
    category: 'Book Printing',
    discountPercentage: 15,
    startDate: '2026-09-01',
    endDate: '2026-10-15',
    targetAudience: 'Schools & Academies',
    promoCode: 'SCHOOL2026',
    description: 'Special bulk printing and spiral/hardcover binding rates for primary & secondary schools, including Shona Novels, Science/History modules, and terminal report booklets.',
    flyerHeadline: 'High-Quality Educational Printing at Subsidized Bulk Rates!',
    whatsappPitch: 'Greetings from Magen Media & Print Solutions! 📚 We are currently offering schools a special 15% discount on all Curriculum Modules, Schemes of Work, and Student Report Books with free delivery for orders over 50 copies. Reply with your quantities for a formal quotation today!',
    active: true,
    featuredServices: ['Modules - BET / Commerce', 'Modules - History / FRS / Science', 'Academic Reports - Secondary'],
    reachCount: 42
  },
  {
    id: 'camp_02',
    title: 'Corporate Executive Branding & T-Shirt Package',
    subtitle: '50 DTF Branded Shirts + 100 Business Cards + 2 Roll-up Banners',
    category: 'T-Shirt Printing',
    discountPercentage: 10,
    startDate: '2026-09-01',
    endDate: '2026-11-30',
    targetAudience: 'Corporate & SMEs',
    promoCode: 'CORPBRAND10',
    description: 'Complete corporate identity and expo promotion bundle for companies, exhibitions, and product launches.',
    flyerHeadline: 'Elevate Your Corporate Identity with Premium Media & Apparel Branding',
    whatsappPitch: 'Elevate your brand presence with Magen Integrated Solutions! 💼 Upgrade your team uniform with premium DTF printed t-shirts and executive roll-up banners. Special bundle discounts available this month. Contact us for a customized corporate proposal.',
    active: true,
    featuredServices: ['T-Shirt Printing (General)', 'Business Cards'],
    reachCount: 28
  },
  {
    id: 'camp_03',
    title: 'Environmental EIA & Technical Report Binding Special',
    subtitle: 'Hardcover Gold-Foil Casings & Expedited Environmental Consultancy Dossiers',
    category: 'Book Printing',
    discountPercentage: 12,
    startDate: '2026-08-15',
    endDate: '2026-12-31',
    targetAudience: 'Environmental & Consultancy',
    promoCode: 'ENVCONSULT',
    description: 'Fast-turnaround executive hardcover binding with gold-foil lettering, color maps, and compliance documentation for environmental impact assessments and corporate prospectuses.',
    flyerHeadline: 'Professional Technical Documentation & Environmental Consultancy Reports',
    whatsappPitch: 'Need urgent professional binding for your Environmental Impact Assessment (EIA) or prospectus reports? 🌍 Magen Integrated Solutions provides executive hardcover binding with crisp color cartography printing. Call us today for expedited turnaround!',
    active: true,
    featuredServices: ['Prospectus Report - Documentation (4 copies) Including Printing', 'Spiral Binding'],
    reachCount: 19
  },
  {
    id: 'camp_04',
    title: 'Church Conferences & Community Events Pack',
    subtitle: 'Full-Color Flyers, Stage Banners & Commemorative Sublimation Mugs',
    category: 'Banners & Signage',
    discountPercentage: 20,
    startDate: '2026-09-05',
    endDate: '2026-10-31',
    targetAudience: 'Churches & Events',
    promoCode: 'FAITH20',
    description: 'Discounted promotional package for church conferences, crusades, weddings, and community rallies.',
    flyerHeadline: 'Inspire Your Audience with Vibrant Event Graphics & Banners',
    whatsappPitch: 'Planning an upcoming conference, wedding, or church convention? 🌟 Magen Print Solutions offers vibrant large-format PVC banners, flyers, and customized gift mugs at 20% off. Request a quote or visit our workshop today!',
    active: false,
    featuredServices: ['A4 Photo Printing - Without Frame', 'Business Cards'],
    reachCount: 35
  }
];

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
  name: 'Magen Integrated Business Solutions (MIBS)',
  tagline: 'MIBS Media & Print Solutions | Integrated Business & Environmental Consultancy',
  phone: '+263 77 123 4567 / +263 71 987 6543',
  email: 'orders@mibs.co.zw',
  address: 'Stand 448, Mount Darwin Commercial Centre / Media & Print Hub',
  currency: '$',
  taxRate: 0,
  receiptFooter: 'Magen Integrated Business Solutions (MIBS) - Thank you for your business!'
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
  private lastSyncTime: string = 'Just now';

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.processSyncQueue();
        this.syncFromDatabase();
        this.notify();
      });
      window.addEventListener('offline', () => {
        this.isOnline = false;
        this.notify();
      });

      // Initial sync on app boot if online
      setTimeout(() => {
        if (this.isOnline) {
          this.syncFromDatabase().catch(console.warn);
        }
      }, 500);
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

  public getLastSyncTime(): string {
    return this.lastSyncTime;
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

  // Users & Auth (CRUD)
  public getUsers(): User[] {
    const data = localStorage.getItem(KEYS.USERS);
    if (!data) {
      localStorage.setItem(KEYS.USERS, JSON.stringify(INITIAL_USERS));
      localStorage.setItem(KEYS.SERVICES, JSON.stringify(INITIAL_SERVICES));
      return INITIAL_USERS;
    }
    return JSON.parse(data);
  }

  public async createUser(userData: {
    name: string;
    role: 'admin' | 'teller';
    pin: string;
    email?: string;
    avatar?: string;
  }): Promise<User> {
    const newUser: User = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: userData.name.trim(),
      role: userData.role,
      pin: userData.pin.trim(),
      avatar: userData.avatar || (userData.role === 'admin' ? '👑' : '🧑‍💼')
    };

    const users = this.getUsers();
    users.push(newUser);
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
    this.notify();

    if (this.isOnline) {
      try {
        await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newUser)
        });
      } catch (err) {
        console.warn('Offline: User saved locally and will sync later:', err);
      }
    }
    return newUser;
  }

  public async updateUser(user: User): Promise<User> {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index >= 0) {
      users[index] = { ...user };
      localStorage.setItem(KEYS.USERS, JSON.stringify(users));

      const active = this.getActiveUser();
      if (active.id === user.id) {
        this.setActiveUser(user);
      }
      this.notify();
    }

    if (this.isOnline) {
      try {
        await fetch('/api/users', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(user)
        });
      } catch (err) {
        console.warn('Offline: User update saved locally:', err);
      }
    }
    return user;
  }

  public async deleteUser(id: string): Promise<boolean> {
    const users = this.getUsers();
    const target = users.find(u => u.id === id);
    if (!target) return false;

    if (target.role === 'admin') {
      const admins = users.filter(u => u.role === 'admin');
      if (admins.length <= 1) {
        throw new Error('Action blocked: System must have at least one active Administrator.');
      }
    }

    const updated = users.filter(u => u.id !== id);
    localStorage.setItem(KEYS.USERS, JSON.stringify(updated));

    const active = this.getActiveUser();
    if (active.id === id && updated.length > 0) {
      this.setActiveUser(updated[0]);
    }
    this.notify();

    if (this.isOnline) {
      try {
        await fetch(`/api/users?id=${encodeURIComponent(id)}`, {
          method: 'DELETE'
        });
      } catch (err) {
        console.warn('Offline: User deletion queued locally:', err);
      }
    }
    return true;
  }

  public async authenticateUser(userId: string, enteredPin: string): Promise<User | null> {
    const users = this.getUsers();
    const localUser = users.find(u => u.id === userId);

    // Online verification if possible
    if (this.isOnline) {
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, pin: enteredPin })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.user) {
            return data.user;
          }
        }
      } catch (e) {
        console.warn('Falling back to local PIN authentication (offline)', e);
      }
    }

    // Offline / Local verification fallback
    if (localUser && localUser.pin === enteredPin.trim()) {
      return localUser;
    }
    return null;
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

  public submitWebClientQuotation(data: {
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    customerAddress?: string;
    items: import('../types').QuotationItem[];
    clientNotes?: string;
    promoCode?: string;
    discount?: number;
  }): Quotation {
    const today = new Date().toISOString().split('T')[0];
    const validUntil = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];
    const subtotal = data.items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
    const discount = data.discount || 0;
    const totalAmount = Math.max(0, subtotal - discount);

    const quoteNumber = `COT-${today.replace(/-/g, '').slice(2)}-${Math.floor(100 + Math.random() * 900)}`;

    const newQuote: Quotation = {
      id: `quote_web_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      quoteNumber,
      date: today,
      validUntil,
      customerName: data.customerName.trim(),
      customerPhone: data.customerPhone.trim(),
      customerEmail: data.customerEmail?.trim(),
      customerAddress: data.customerAddress?.trim(),
      items: data.items,
      subtotal,
      discount,
      taxRate: 0,
      taxAmount: 0,
      totalAmount,
      status: 'Sent',
      notes: data.promoCode ? `Promo: ${data.promoCode}. ${data.clientNotes || ''}` : data.clientNotes,
      clientNotes: data.clientNotes,
      terms: 'Quotation valid for 14 days. 50% deposit required on job confirmation; balance on collection/delivery.',
      preparedBy: 'Online Web Request',
      createdAt: new Date().toISOString(),
      source: 'web'
    };

    const quotes = this.getQuotations();
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

  // Marketing Campaigns & Specials
  public getMarketingCampaigns(): MarketingCampaign[] {
    const data = localStorage.getItem(KEYS.CAMPAIGNS);
    if (!data) {
      localStorage.setItem(KEYS.CAMPAIGNS, JSON.stringify(INITIAL_CAMPAIGNS));
      return INITIAL_CAMPAIGNS;
    }
    return JSON.parse(data);
  }

  public saveMarketingCampaign(campaign: Partial<MarketingCampaign> & { title: string }): MarketingCampaign {
    const campaigns = this.getMarketingCampaigns();
    if (campaign.id) {
      const idx = campaigns.findIndex(c => c.id === campaign.id);
      if (idx >= 0) {
        const updated: MarketingCampaign = {
          ...campaigns[idx],
          ...campaign,
          id: campaign.id
        };
        campaigns[idx] = updated;
        localStorage.setItem(KEYS.CAMPAIGNS, JSON.stringify(campaigns));
        this.notify();
        return updated;
      }
    }

    const newCampaign: MarketingCampaign = {
      id: `camp_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      title: campaign.title,
      subtitle: campaign.subtitle || 'Special Promotional Offer',
      category: campaign.category || 'All Services',
      discountPercentage: campaign.discountPercentage ?? 10,
      startDate: campaign.startDate || new Date().toISOString().split('T')[0],
      endDate: campaign.endDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      targetAudience: campaign.targetAudience || 'Schools & Academies',
      promoCode: campaign.promoCode || `PROMO${Math.floor(1000 + Math.random() * 9000)}`,
      description: campaign.description || '',
      whatsappPitch: campaign.whatsappPitch || '',
      flyerHeadline: campaign.flyerHeadline || campaign.title,
      active: campaign.active ?? true,
      featuredServices: campaign.featuredServices || [],
      reachCount: campaign.reachCount || 0
    };

    campaigns.unshift(newCampaign);
    localStorage.setItem(KEYS.CAMPAIGNS, JSON.stringify(campaigns));
    this.notify();
    return newCampaign;
  }

  public toggleCampaignStatus(id: string): void {
    const campaigns = this.getMarketingCampaigns();
    const item = campaigns.find(c => c.id === id);
    if (item) {
      item.active = !item.active;
      localStorage.setItem(KEYS.CAMPAIGNS, JSON.stringify(campaigns));
      this.notify();
    }
  }

  public deleteMarketingCampaign(id: string): void {
    const campaigns = this.getMarketingCampaigns().filter(c => c.id !== id);
    localStorage.setItem(KEYS.CAMPAIGNS, JSON.stringify(campaigns));
    this.notify();
  }

  // Client Leads Pipeline (Aggregated from Quotations and Past Orders)
  public getClientLeads(): ClientLead[] {
    const quotes = this.getQuotations();
    const sales = this.getSales();
    const clientMap = new Map<string, ClientLead>();

    // Process quotations
    quotes.forEach(q => {
      const key = (q.customerName || 'Walk-in Client').trim().toLowerCase();
      const existing = clientMap.get(key);

      const nameLower = q.customerName.toLowerCase();
      let detectedType: ClientLead['leadType'] = 'Individual';
      if (nameLower.includes('school') || nameLower.includes('academy') || nameLower.includes('college') || nameLower.includes('primary') || nameLower.includes('high')) {
        detectedType = 'School';
      } else if (nameLower.includes('church') || nameLower.includes('ministr') || nameLower.includes('assembly')) {
        detectedType = 'Church';
      } else if (nameLower.includes('consult') || nameLower.includes('env') || nameLower.includes('green') || nameLower.includes('eco')) {
        detectedType = 'Consultancy';
      } else if (nameLower.includes('agency') || nameLower.includes('ltd') || nameLower.includes('inc') || nameLower.includes('holdings') || nameLower.includes('solutions') || nameLower.includes('media')) {
        detectedType = 'Corporate';
      }

      const isWon = q.status === 'Accepted' || q.status === 'Converted';

      if (!existing) {
        clientMap.set(key, {
          id: `lead_${key.replace(/[^a-z0-9]/g, '_')}`,
          name: q.customerName,
          phone: q.customerPhone,
          email: q.customerEmail,
          companyOrOrg: q.customerAddress,
          leadType: detectedType,
          totalQuotes: 1,
          totalWonAmount: isWon ? q.totalAmount : 0,
          lastInteractionDate: q.date,
          latestStatus: q.status,
          notes: q.notes
        });
      } else {
        existing.totalQuotes += 1;
        if (isWon) {
          existing.totalWonAmount += q.totalAmount;
        }
        if (q.customerPhone && !existing.phone) existing.phone = q.customerPhone;
        if (q.customerEmail && !existing.email) existing.email = q.customerEmail;
        if (q.date > existing.lastInteractionDate) {
          existing.lastInteractionDate = q.date;
          existing.latestStatus = q.status;
        }
      }
    });

    // Process receipts to catch direct walk-in customers who might be marketing targets
    sales.forEach(s => {
      if (!s.customerName || s.customerName.toLowerCase().includes('walk-in')) return;
      const key = s.customerName.trim().toLowerCase();
      const existing = clientMap.get(key);

      if (!existing) {
        clientMap.set(key, {
          id: `lead_${key.replace(/[^a-z0-9]/g, '_')}`,
          name: s.customerName,
          phone: s.customerPhone,
          leadType: 'Corporate',
          totalQuotes: 0,
          totalWonAmount: s.totalAmount,
          lastInteractionDate: s.date.slice(0, 10),
          latestStatus: 'Customer'
        });
      } else {
        existing.totalWonAmount += s.totalAmount;
        if (s.customerPhone && !existing.phone) existing.phone = s.customerPhone;
      }
    });

    return Array.from(clientMap.values()).sort((a, b) => b.totalWonAmount - a.totalWonAmount);
  }

  public getMarketingSummary(): {
    totalQuotes: number;
    totalQuoteValue: number;
    pendingQuotesCount: number;
    pendingQuotesValue: number;
    convertedQuotesCount: number;
    conversionRate: number;
    activeCampaignsCount: number;
    totalLeadsCount: number;
  } {
    const quotes = this.getQuotations();
    const campaigns = this.getMarketingCampaigns();
    const leads = this.getClientLeads();

    const totalQuotes = quotes.length;
    const totalQuoteValue = quotes.reduce((sum, q) => sum + q.totalAmount, 0);

    const pending = quotes.filter(q => q.status === 'Sent' || q.status === 'Draft');
    const pendingQuotesCount = pending.length;
    const pendingQuotesValue = pending.reduce((sum, q) => sum + q.totalAmount, 0);

    const converted = quotes.filter(q => q.status === 'Converted' || q.status === 'Accepted');
    const convertedQuotesCount = converted.length;

    const conversionRate = totalQuotes > 0 ? Math.round((convertedQuotesCount / totalQuotes) * 100) : 0;
    const activeCampaignsCount = campaigns.filter(c => c.active).length;

    return {
      totalQuotes,
      totalQuoteValue,
      pendingQuotesCount,
      pendingQuotesValue,
      convertedQuotesCount,
      conversionRate,
      activeCampaignsCount,
      totalLeadsCount: leads.length
    };
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

    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          queue: pending,
          fullSyncData: {
            quotations: this.getQuotations(),
            inventory: this.getInventory()
          }
        })
      });

      if (response.ok) {
        localStorage.setItem(KEYS.SYNC_QUEUE, JSON.stringify([]));
        const sales = this.getSales().map(s => ({ ...s, synced: true }));
        const expenses = this.getExpenses().map(e => ({ ...e, synced: true }));
        localStorage.setItem(KEYS.SALES, JSON.stringify(sales));
        localStorage.setItem(KEYS.EXPENSES, JSON.stringify(expenses));
        this.lastSyncTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        this.notify();
        return { success: true, count: pending.length };
      }
    } catch (err) {
      console.warn('Network sync failed, keeping items in offline queue:', err);
    }

    return { success: false, count: 0 };
  }

  public async syncFromDatabase(): Promise<boolean> {
    if (!this.isOnline) return false;

    try {
      const response = await fetch('/api/sync');
      if (!response.ok) return false;

      const result = await response.json();
      if (result.success && result.data) {
        const { users, company, sales, quotations, inventory, services, expenses } = result.data;

        if (users && users.length > 0) {
          localStorage.setItem(KEYS.USERS, JSON.stringify(users));
        }
        if (company) {
          localStorage.setItem(KEYS.COMPANY_INFO, JSON.stringify(company));
        }

        // Merge remote sales into local if missing
        if (sales && sales.length > 0) {
          const localSales = this.getSales();
          const localMap = new Map(localSales.map(s => [s.id, s]));
          for (const s of sales) {
            if (!localMap.has(s.id)) {
              localSales.push({
                ...s,
                synced: true
              });
            }
          }
          localStorage.setItem(KEYS.SALES, JSON.stringify(localSales));
        }

        // Merge remote quotations into local if missing
        if (quotations && quotations.length > 0) {
          const localQuotes = this.getQuotations();
          const localQuoteMap = new Map(localQuotes.map(q => [q.id, q]));
          for (const q of quotations) {
            if (!localQuoteMap.has(q.id)) {
              localQuotes.push(q);
            } else {
              // update status if converted or changed remotely
              const curr = localQuoteMap.get(q.id)!;
              if (curr.status !== q.status) {
                curr.status = q.status;
                curr.convertedReceiptId = q.convertedReceiptId;
              }
            }
          }
          localStorage.setItem(KEYS.QUOTATIONS, JSON.stringify(localQuotes));
        }

        this.lastSyncTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        this.notify();
        return true;
      }
    } catch (err) {
      console.warn('Failed to pull sync from SQLite database:', err);
    }

    return false;
  }

  public async triggerManualSync(): Promise<{ success: boolean; message: string }> {
    if (!this.isOnline) {
      return { success: false, message: 'Device is offline. Changes are saved locally and will auto-sync when online.' };
    }

    const pushRes = await this.processSyncQueue();
    const pullRes = await this.syncFromDatabase();

    if (pushRes.success || pullRes) {
      return { success: true, message: `Sync complete with SQLite database. ${pushRes.count} pending items pushed.` };
    }

    return { success: false, message: 'Could not complete sync with SQLite server.' };
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

  public hydrateFromDatabase(dbState: {
    users?: User[];
    company?: CompanyInfo | null;
    sales?: SaleReceipt[];
    expenses?: DailyExpense[];
    inventory?: InventoryItem[];
    stockMovements?: StockMovement[];
    services?: import('../types').ServiceItem[];
    quotations?: Quotation[];
  }): void {
    if (typeof window === 'undefined') return;
    if (dbState.users && dbState.users.length > 0) {
      localStorage.setItem(KEYS.USERS, JSON.stringify(dbState.users));
    }
    if (dbState.company) {
      localStorage.setItem(KEYS.COMPANY_INFO, JSON.stringify(dbState.company));
    }
    if (dbState.sales && dbState.sales.length > 0) {
      localStorage.setItem(KEYS.SALES, JSON.stringify(dbState.sales));
    }
    if (dbState.expenses && dbState.expenses.length > 0) {
      localStorage.setItem(KEYS.EXPENSES, JSON.stringify(dbState.expenses));
    }
    if (dbState.inventory && dbState.inventory.length > 0) {
      localStorage.setItem(KEYS.INVENTORY, JSON.stringify(dbState.inventory));
    }
    if (dbState.stockMovements && dbState.stockMovements.length > 0) {
      localStorage.setItem(KEYS.MOVEMENTS, JSON.stringify(dbState.stockMovements));
    }
    if (dbState.services && dbState.services.length > 0) {
      localStorage.setItem(KEYS.SERVICES, JSON.stringify(dbState.services));
    }
    if (dbState.quotations && dbState.quotations.length > 0) {
      localStorage.setItem(KEYS.QUOTATIONS, JSON.stringify(dbState.quotations));
    }
    this.notify();
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
