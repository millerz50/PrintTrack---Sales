export type UserRole = 'admin' | 'teller';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  pin: string;
  avatar?: string;
}

export type PrintingCategory =
  | 'T-Shirt Printing'
  | 'Paper Printing'
  | 'Book Printing'
  | 'Banners & Signage'
  | 'Merchandise & Branding'
  | 'Photocopy & Lamination'
  | 'Other Services';


export interface ServiceItem {
  id: string;
  code: string;
  name: string;
  category: PrintingCategory;
  unit: string;
  price: number;
  active: boolean;
  inventoryItemId?: string;
  notes?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: PrintingCategory;
  unit: string; // 'pieces', 'reams', 'meters', 'bottles', 'rolls', 'sheets'
  currentStock: number;
  minThreshold: number;
  unitCost: number; // Purchase price
  sellingPrice: number; // Standard selling price per unit
  location?: string;
  sku: string;
  lastRestocked: string;
  depletionRatePerDay?: number; // Calculated dynamic velocity
}

export interface SaleItem {
  id: string;
  inventoryItemId?: string; // Linked inventory item (if stock-deducting)
  description: string;
  category: PrintingCategory;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  stockDeductionQty?: number; // Units of raw inventory consumed per item
}

export type PaymentMethod = 'Cash' | 'Card' | 'Mobile Money (M-Pesa)' | 'Bank Transfer';

export interface SaleReceipt {
  id: string;
  receiptNumber: string;
  date: string; // ISO string YYYY-MM-DDTHH:mm
  customerName?: string;
  customerPhone?: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  tax: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  tellerId: string;
  tellerName: string;
  notes?: string;
  synced: boolean;
  createdAt: string;
}

export type QuotationStatus = 'Draft' | 'Sent' | 'Accepted' | 'Declined' | 'Converted';

export interface QuotationItem {
  id: string;
  inventoryItemId?: string;
  description: string;
  category: PrintingCategory;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  unit?: string;
  notes?: string;
}

export interface Quotation {
  id: string;
  quoteNumber: string; // e.g. "QT-2026-001"
  date: string; // YYYY-MM-DD
  validUntil: string; // YYYY-MM-DD
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  customerAddress?: string;
  items: QuotationItem[];
  subtotal: number;
  taxRate?: number;
  taxAmount?: number;
  discount?: number;
  totalAmount: number;
  status: QuotationStatus;
  notes?: string;
  terms?: string;
  preparedBy: string;
  createdAt: string;
  convertedReceiptId?: string;
}

export type ExpenseCategory =
  | 'Raw Materials & Stock'
  | 'Inks & Toners'
  | 'Machine Maintenance'
  | 'Electricity & Utilities'
  | 'Rent & Workspace'
  | 'Staff & Wages'
  | 'Logistics & Transport'
  | 'Packaging & Supplies'
  | 'Miscellaneous';

export interface DailyExpense {
  id: string;
  date: string; // YYYY-MM-DD
  category: ExpenseCategory;
  description: string;
  amount: number;
  paymentMethod: 'Cash' | 'Bank Transfer' | 'Mobile Money' | 'Card';
  recordedBy: string;
  tellerRole: UserRole;
  receiptRef?: string;
  createdAt: string;
  synced: boolean;
}

export interface StockMovement {
  id: string;
  inventoryItemId: string;
  itemName: string;
  type: 'sale_deduction' | 'restock' | 'waste_damage' | 'audit_adjustment';
  quantity: number; // positive for restock, negative for deduction
  date: string;
  notes?: string;
  performedBy: string;
}

export interface DailyFinancialSummary {
  date: string;
  totalRevenue: number;
  totalCostOfGoods: number;
  totalExpenses: number;
  grossProfit: number;
  netProfit: number;
  totalTransactions: number;
  totalItemsSold: number;
  cashSales: number;
  digitalSales: number;
  cashExpenses: number;
  closingCashInDrawer: number;
}

export type ChatChannel = 'ai_advisor' | 'team_workshop' | 'order_alerts';

export interface ChatMessage {
  id: string;
  channel: ChatChannel;
  senderId: string;
  senderName: string;
  senderRole: UserRole | 'system' | 'ai';
  senderAvatar?: string;
  text: string;
  timestamp: string; // ISO string
  isUrgent?: boolean;
  orderRef?: string;
  stockAlert?: {
    itemName: string;
    currentStock: number;
    unit: string;
  };
}
