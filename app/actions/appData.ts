// app/actions/appData.ts
'use server';

import { prisma } from '@/lib/prisma';
import { ensureDatabaseInitialized } from '@/lib/dbInit';
import {
  SaleReceipt,
  DailyExpense,
  InventoryItem,
  StockMovement,
  ServiceItem,
  Quotation,
  User,
  PaymentMethod
} from '@/types';
import { CompanyInfo } from '@/services/storage';

export interface DatabaseState {
  users: User[];
  company: CompanyInfo | null;
  sales: SaleReceipt[];
  expenses: DailyExpense[];
  inventory: InventoryItem[];
  stockMovements: StockMovement[];
  services: ServiceItem[];
  quotations: Quotation[];
}

export async function getDatabaseStateAction(): Promise<DatabaseState> {
  try {
    await ensureDatabaseInitialized();

    const [
      dbUsers,
      dbCompany,
      dbSales,
      dbExpenses,
      dbInventory,
      dbMovements,
      dbServices,
      dbQuotations
    ] = await Promise.all([
      prisma.user.findMany({ orderBy: { name: 'asc' } }),
      prisma.company.findFirst(),
      prisma.saleReceipt.findMany({
        include: { items: true },
        orderBy: { date: 'desc' }
      }),
      prisma.dailyExpense.findMany({
        orderBy: { date: 'desc' }
      }),
      prisma.inventoryItem.findMany({
        orderBy: { name: 'asc' }
      }),
      prisma.stockMovement.findMany({
        orderBy: { createdAt: 'desc' },
        take: 100
      }),
      prisma.serviceItem.findMany({
        orderBy: { name: 'asc' }
      }),
      prisma.quotation.findMany({
        include: { items: true },
        orderBy: { date: 'desc' }
      })
    ]);

    const users: User[] = dbUsers.map(u => ({
      id: u.id,
      name: u.name,
      role: (u.role as 'admin' | 'teller'),
      pin: u.pin,
      email: u.email || undefined,
      avatar: u.avatar || undefined,
      active: u.active
    }));

    const company: CompanyInfo | null = dbCompany
      ? {
          name: dbCompany.name,
          tagline: dbCompany.tagline,
          phone: dbCompany.phone,
          email: dbCompany.email,
          address: dbCompany.address,
          currency: dbCompany.currency,
          taxRate: dbCompany.taxRate,
          receiptFooter: dbCompany.receiptFooter
        }
      : null;

    const sales: SaleReceipt[] = dbSales.map(s => ({
      id: s.id,
      receiptNumber: s.receiptNumber,
      date: s.date,
      customerName: s.customerName || undefined,
      customerPhone: s.customerPhone || undefined,
      items: s.items.map(i => ({
        id: i.id,
        inventoryItemId: i.inventoryItemId || undefined,
        description: i.description,
        category: i.category as any,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        totalPrice: i.totalPrice,
        stockDeductionQty: i.stockDeductionQty || undefined
      })),
      subtotal: s.subtotal,
      discount: s.discount,
      tax: s.tax,
      totalAmount: s.totalAmount,
      paymentMethod: (s.paymentMethod as PaymentMethod),
      tellerId: s.tellerId,
      tellerName: s.tellerName,
      notes: s.notes || undefined,
      synced: s.synced,
      createdAt: s.createdAt.toISOString()
    }));

    const expenses: DailyExpense[] = dbExpenses.map(e => ({
      id: e.id,
      date: e.date,
      category: e.category as any,
      description: e.description,
      amount: e.amount,
      paymentMethod: (e.paymentMethod as PaymentMethod),
      recordedBy: e.recordedBy,
      tellerRole: e.tellerRole as any,
      receiptRef: e.receiptRef || undefined,
      createdAt: e.createdAt.toISOString(),
      synced: e.synced
    }));

    const inventory: InventoryItem[] = dbInventory.map(i => ({
      id: i.id,
      name: i.name,
      category: i.category as any,
      unit: i.unit,
      currentStock: i.currentStock,
      minThreshold: i.minThreshold,
      unitCost: i.unitCost,
      sellingPrice: i.sellingPrice,
      location: i.location || undefined,
      sku: i.sku,
      lastRestocked: i.lastRestocked,
      depletionRatePerDay: i.depletionRatePerDay || undefined
    }));

    const stockMovements: StockMovement[] = dbMovements.map(m => ({
      id: m.id,
      inventoryItemId: m.inventoryItemId,
      itemName: m.itemName,
      type: m.type as any,
      quantity: m.quantity,
      date: m.date,
      notes: m.notes || undefined,
      performedBy: m.performedBy
    }));

    const services: ServiceItem[] = dbServices.map(s => ({
      id: s.id,
      code: s.code,
      name: s.name,
      category: s.category as any,
      unit: s.unit,
      price: s.price,
      active: s.active,
      inventoryItemId: s.inventoryItemId || undefined,
      notes: s.notes || undefined
    }));

    const quotations: Quotation[] = dbQuotations.map(q => ({
      id: q.id,
      quoteNumber: q.quoteNumber,
      date: q.date,
      validUntil: q.validUntil,
      customerName: q.customerName,
      customerPhone: q.customerPhone || undefined,
      customerEmail: q.customerEmail || undefined,
      customerAddress: q.customerAddress || undefined,
      items: q.items.map(i => ({
        id: i.id,
        inventoryItemId: i.inventoryItemId || undefined,
        description: i.description,
        category: i.category as any,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        totalPrice: i.totalPrice,
        unit: i.unit || undefined,
        notes: i.notes || undefined
      })),
      subtotal: q.subtotal,
      taxRate: q.taxRate || undefined,
      taxAmount: q.taxAmount || undefined,
      discount: q.discount || undefined,
      totalAmount: q.totalAmount,
      status: q.status as any,
      notes: q.notes || undefined,
      terms: q.terms || undefined,
      preparedBy: q.preparedBy,
      convertedReceiptId: q.convertedReceiptId || undefined,
      createdAt: q.createdAt.toISOString()
    }));

    return {
      users,
      company,
      sales,
      expenses,
      inventory,
      stockMovements,
      services,
      quotations
    };
  } catch (err) {
    console.error('[DatabaseStateAction] Error fetching database state:', err);
    return null as any;
  }
}
