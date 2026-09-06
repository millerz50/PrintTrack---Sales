import { prisma } from './prisma';
import {
  INITIAL_USERS,
  INITIAL_SERVICES,
  INITIAL_INVENTORY,
  INITIAL_SALES,
  INITIAL_EXPENSES,
  INITIAL_QUOTATIONS
} from '../data/initialData';
import { DEFAULT_COMPANY } from '../services/storage';

let isInitialized = false;

export async function ensureDatabaseInitialized() {
  if (isInitialized) return;

  try {
    // 1. Seed Users if empty
    const userCount = await prisma.user.count();
    if (userCount === 0) {
      for (const u of INITIAL_USERS) {
        await prisma.user.create({
          data: {
            id: u.id,
            name: u.name,
            role: u.role,
            pin: u.pin,
            avatar: u.avatar || '👤',
            email: `${u.id}@magensolutions.com`,
            active: true
          }
        });
      }
    }

    // 2. Seed Company Info if empty
    const companyCount = await prisma.company.count();
    if (companyCount === 0) {
      await prisma.company.create({
        data: {
          id: 'default',
          name: DEFAULT_COMPANY.name,
          tagline: DEFAULT_COMPANY.tagline,
          phone: DEFAULT_COMPANY.phone,
          email: DEFAULT_COMPANY.email,
          address: DEFAULT_COMPANY.address,
          currency: DEFAULT_COMPANY.currency,
          taxRate: DEFAULT_COMPANY.taxRate,
          receiptFooter: DEFAULT_COMPANY.receiptFooter
        }
      });
    }

    // 3. Seed Services if empty
    const serviceCount = await prisma.serviceItem.count();
    if (serviceCount === 0) {
      for (const s of INITIAL_SERVICES) {
        await prisma.serviceItem.create({
          data: {
            id: s.id,
            code: s.code,
            name: s.name,
            category: s.category,
            unit: s.unit,
            price: s.price,
            active: s.active,
            notes: s.notes || null,
            inventoryItemId: s.inventoryItemId || null
          }
        });
      }
    }

    // 4. Seed Inventory if empty
    const inventoryCount = await prisma.inventoryItem.count();
    if (inventoryCount === 0) {
      for (const inv of INITIAL_INVENTORY) {
        await prisma.inventoryItem.create({
          data: {
            id: inv.id,
            sku: inv.sku,
            name: inv.name,
            category: inv.category,
            unit: inv.unit,
            currentStock: inv.currentStock,
            minThreshold: inv.minThreshold,
            unitCost: inv.unitCost,
            sellingPrice: inv.sellingPrice,
            location: inv.location || null,
            lastRestocked: inv.lastRestocked,
            depletionRatePerDay: inv.depletionRatePerDay || null
          }
        });
      }
    }

    // 5. Seed Quotations if empty
    const quoteCount = await prisma.quotation.count();
    if (quoteCount === 0 && INITIAL_QUOTATIONS && INITIAL_QUOTATIONS.length > 0) {
      for (const q of INITIAL_QUOTATIONS) {
        await prisma.quotation.create({
          data: {
            id: q.id,
            quoteNumber: q.quoteNumber,
            date: q.date,
            validUntil: q.validUntil,
            customerName: q.customerName,
            customerPhone: q.customerPhone || null,
            customerEmail: q.customerEmail || null,
            customerAddress: q.customerAddress || null,
            subtotal: q.subtotal,
            taxRate: q.taxRate || 0,
            taxAmount: q.taxAmount || 0,
            discount: q.discount || 0,
            totalAmount: q.totalAmount,
            status: q.status,
            notes: q.notes || null,
            terms: q.terms || null,
            preparedBy: q.preparedBy,
            items: {
              create: q.items.map(i => ({
                id: i.id,
                description: i.description,
                category: i.category,
                quantity: i.quantity,
                unitPrice: i.unitPrice,
                totalPrice: i.totalPrice,
                unit: i.unit || null,
                notes: i.notes || null,
                inventoryItemId: i.inventoryItemId || null
              }))
            }
          }
        });
      }
    }

    // 6. Seed Sales Receipts if empty
    const salesCount = await prisma.saleReceipt.count();
    if (salesCount === 0 && INITIAL_SALES && INITIAL_SALES.length > 0) {
      for (const s of INITIAL_SALES.slice(0, 5)) {
        await prisma.saleReceipt.create({
          data: {
            id: s.id,
            receiptNumber: s.receiptNumber,
            date: s.date,
            customerName: s.customerName || null,
            customerPhone: s.customerPhone || null,
            subtotal: s.subtotal,
            discount: s.discount,
            tax: s.tax,
            totalAmount: s.totalAmount,
            paymentMethod: s.paymentMethod,
            tellerId: s.tellerId,
            tellerName: s.tellerName,
            notes: s.notes || null,
            synced: true,
            items: {
              create: s.items.map(i => ({
                id: i.id,
                description: i.description,
                category: i.category,
                quantity: i.quantity,
                unitPrice: i.unitPrice,
                totalPrice: i.totalPrice,
                stockDeductionQty: i.stockDeductionQty || null,
                inventoryItemId: i.inventoryItemId || null
              }))
            }
          }
        });
      }
    }

    // 7. Seed Expenses if empty
    const expenseCount = await prisma.dailyExpense.count();
    if (expenseCount === 0 && INITIAL_EXPENSES && INITIAL_EXPENSES.length > 0) {
      for (const exp of INITIAL_EXPENSES.slice(0, 5)) {
        await prisma.dailyExpense.create({
          data: {
            id: exp.id,
            date: exp.date,
            category: exp.category,
            description: exp.description,
            amount: exp.amount,
            paymentMethod: exp.paymentMethod,
            recordedBy: exp.recordedBy,
            tellerRole: exp.tellerRole,
            receiptRef: exp.receiptRef || null,
            synced: true
          }
        });
      }
    }

    isInitialized = true;
  } catch (error) {
    console.error('Error during ensureDatabaseInitialized:', error);
  }
}
