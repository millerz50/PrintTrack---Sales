import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ensureDatabaseInitialized } from '@/lib/dbInit';

export async function GET() {
  try {
    await ensureDatabaseInitialized();

    const [users, company, sales, quotations, inventory, services, expenses, movements] =
      await Promise.all([
        prisma.user.findMany({ where: { active: true }, orderBy: { createdAt: 'asc' } }),
        prisma.company.findUnique({ where: { id: 'default' } }),
        prisma.saleReceipt.findMany({
          include: { items: true },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.quotation.findMany({
          include: { items: true },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.inventoryItem.findMany({ orderBy: { name: 'asc' } }),
        prisma.serviceItem.findMany({ where: { active: true }, orderBy: { code: 'asc' } }),
        prisma.dailyExpense.findMany({ orderBy: { createdAt: 'desc' } }),
        prisma.stockMovement.findMany({ orderBy: { createdAt: 'desc' }, take: 100 })
      ]);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      data: {
        users,
        company,
        sales,
        quotations,
        inventory,
        services,
        expenses,
        movements
      }
    });
  } catch (error: any) {
    console.error('Sync GET error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to pull data from SQLite' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureDatabaseInitialized();
    const body = await req.json();
    const { queue, fullSyncData } = body;

    let syncedCount = 0;

    // 1. Process individual offline queue items if provided
    if (Array.isArray(queue) && queue.length > 0) {
      for (const item of queue) {
        try {
          if (item.type === 'sale' && item.payload) {
            const sale = item.payload;
            const existing = await prisma.saleReceipt.findUnique({ where: { id: sale.id } });
            if (!existing) {
              await prisma.saleReceipt.create({
                data: {
                  id: sale.id,
                  receiptNumber: sale.receiptNumber,
                  date: sale.date,
                  customerName: sale.customerName || null,
                  customerPhone: sale.customerPhone || null,
                  subtotal: sale.subtotal,
                  discount: sale.discount || 0,
                  tax: sale.tax || 0,
                  totalAmount: sale.totalAmount,
                  paymentMethod: sale.paymentMethod,
                  tellerId: sale.tellerId,
                  tellerName: sale.tellerName,
                  notes: sale.notes || null,
                  synced: true,
                  items: {
                    create: (sale.items || []).map((i: any) => ({
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
              syncedCount++;
            }
          } else if (item.type === 'expense' && item.payload) {
            const exp = item.payload;
            const existing = await prisma.dailyExpense.findUnique({ where: { id: exp.id } });
            if (!existing) {
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
              syncedCount++;
            }
          }
        } catch (itemErr) {
          console.error('Failed to sync queue item:', itemErr);
        }
      }
    }

    // 2. If fullSyncData contains quotations or updated records:
    if (fullSyncData?.quotations && Array.isArray(fullSyncData.quotations)) {
      for (const q of fullSyncData.quotations) {
        try {
          const existing = await prisma.quotation.findUnique({ where: { id: q.id } });
          if (!existing) {
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
                convertedReceiptId: q.convertedReceiptId || null,
                items: {
                  create: (q.items || []).map((i: any) => ({
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
            syncedCount++;
          } else {
            // Update status if changed
            if (existing.status !== q.status || existing.convertedReceiptId !== q.convertedReceiptId) {
              await prisma.quotation.update({
                where: { id: q.id },
                data: {
                  status: q.status,
                  convertedReceiptId: q.convertedReceiptId || null
                }
              });
              syncedCount++;
            }
          }
        } catch (qErr) {
          console.error('Failed to sync quotation:', qErr);
        }
      }
    }

    // 3. Sync inventory stock levels if provided
    if (fullSyncData?.inventory && Array.isArray(fullSyncData.inventory)) {
      for (const inv of fullSyncData.inventory) {
        try {
          await prisma.inventoryItem.upsert({
            where: { id: inv.id },
            update: {
              currentStock: inv.currentStock,
              unitCost: inv.unitCost,
              sellingPrice: inv.sellingPrice,
              lastRestocked: inv.lastRestocked,
              depletionRatePerDay: inv.depletionRatePerDay || null
            },
            create: {
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
        } catch (invErr) {
          console.error('Failed to upsert inventory item:', invErr);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Sync completed successfully',
      syncedCount,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Sync POST error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to sync to SQLite' },
      { status: 500 }
    );
  }
}
