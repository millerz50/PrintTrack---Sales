// app/actions/quotations.ts
'use server';

import { prisma } from '@/lib/prisma';
import { Quotation, QuotationStatus } from '@/types';
import { revalidatePath } from 'next/cache';

export async function createQuotationAction(quotation: Quotation): Promise<{ success: boolean; data?: Quotation; error?: string }> {
  try {
    await prisma.quotation.create({
      data: {
        id: quotation.id,
        quoteNumber: quotation.quoteNumber,
        date: quotation.date,
        validUntil: quotation.validUntil,
        customerName: quotation.customerName,
        customerPhone: quotation.customerPhone || null,
        customerEmail: quotation.customerEmail || null,
        customerAddress: quotation.customerAddress || null,
        subtotal: quotation.subtotal,
        taxRate: quotation.taxRate || 0,
        taxAmount: quotation.taxAmount || 0,
        discount: quotation.discount || 0,
        totalAmount: quotation.totalAmount,
        status: quotation.status,
        notes: quotation.notes || null,
        terms: quotation.terms || null,
        preparedBy: quotation.preparedBy,
        convertedReceiptId: quotation.convertedReceiptId || null,
        items: {
          create: quotation.items.map(item => ({
            id: item.id,
            inventoryItemId: item.inventoryItemId || null,
            description: item.description,
            category: item.category,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            unit: item.unit || null,
            notes: item.notes || null
          }))
        }
      }
    });

    revalidatePath('/');
    return { success: true, data: quotation };
  } catch (error: any) {
    console.error('[createQuotationAction] Error:', error);
    return { success: false, error: error.message || 'Failed to save quotation to database' };
  }
}

export async function updateQuotationStatusAction(
  id: string,
  status: QuotationStatus,
  convertedReceiptId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.quotation.update({
      where: { id },
      data: {
        status,
        ...(convertedReceiptId ? { convertedReceiptId } : {})
      }
    });

    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error('[updateQuotationStatusAction] Error:', error);
    return { success: false, error: error.message || 'Failed to update quotation' };
  }
}
