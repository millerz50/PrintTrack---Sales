// app/actions/sales.ts
'use server';

import { prisma } from '@/lib/prisma';
import { SaleReceipt } from '@/types';
import { revalidatePath } from 'next/cache';

export async function createSaleReceiptAction(receipt: SaleReceipt): Promise<{ success: boolean; data?: SaleReceipt; error?: string }> {
  try {
    const created = await prisma.saleReceipt.create({
      data: {
        id: receipt.id,
        receiptNumber: receipt.receiptNumber,
        date: receipt.date,
        customerName: receipt.customerName || null,
        customerPhone: receipt.customerPhone || null,
        subtotal: receipt.subtotal,
        discount: receipt.discount,
        tax: receipt.tax,
        totalAmount: receipt.totalAmount,
        paymentMethod: receipt.paymentMethod,
        tellerId: receipt.tellerId,
        tellerName: receipt.tellerName,
        notes: receipt.notes || null,
        synced: true,
        items: {
          create: receipt.items.map(item => ({
            id: item.id,
            inventoryItemId: item.inventoryItemId || null,
            description: item.description,
            category: item.category,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            stockDeductionQty: item.stockDeductionQty || null,
          }))
        }
      },
      include: {
        items: true
      }
    });

    // Handle inventory depletion in the database
    for (const item of receipt.items) {
      if (item.inventoryItemId) {
        const deductQty = item.stockDeductionQty ?? item.quantity;
        if (deductQty > 0) {
          try {
            const currentItem = await prisma.inventoryItem.findUnique({
              where: { id: item.inventoryItemId }
            });

            if (currentItem) {
              const newStock = Math.max(0, currentItem.currentStock - deductQty);
              await prisma.inventoryItem.update({
                where: { id: item.inventoryItemId },
                data: { currentStock: newStock }
              });

              await prisma.stockMovement.create({
                data: {
                  id: `mov_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                  inventoryItemId: item.inventoryItemId,
                  itemName: currentItem.name,
                  type: 'SALE_USAGE',
                  quantity: deductQty,
                  date: receipt.date.split('T')[0] || new Date().toISOString().split('T')[0],
                  notes: `Sold via Receipt #${receipt.receiptNumber}`,
                  performedBy: receipt.tellerName
                }
              });
            }
          } catch (invErr) {
            console.warn('[SaleAction] Stock deduction non-fatal warning:', invErr);
          }
        }
      }
    }

    revalidatePath('/');
    return { success: true, data: receipt };
  } catch (error: any) {
    console.error('[createSaleReceiptAction] Error:', error);
    return { success: false, error: error.message || 'Failed to record sale receipt in database' };
  }
}
