// app/actions/inventory.ts
'use server';

import { prisma } from '@/lib/prisma';
import { InventoryItem } from '@/types';
import { revalidatePath } from 'next/cache';

export async function restockInventoryAction(
  itemId: string,
  addedQty: number,
  notes: string,
  user: string
): Promise<{ success: boolean; newStock?: number; error?: string }> {
  try {
    const existing = await prisma.inventoryItem.findUnique({
      where: { id: itemId }
    });

    if (!existing) {
      return { success: false, error: 'Item not found' };
    }

    const newStock = existing.currentStock + addedQty;
    const today = new Date().toISOString().split('T')[0];

    await prisma.inventoryItem.update({
      where: { id: itemId },
      data: {
        currentStock: newStock,
        lastRestocked: today
      }
    });

    await prisma.stockMovement.create({
      data: {
        id: `mov_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        inventoryItemId: itemId,
        itemName: existing.name,
        type: 'RESTOCK',
        quantity: addedQty,
        date: today,
        notes: notes || 'Manual restock via Inventory Manager',
        performedBy: user
      }
    });

    revalidatePath('/');
    return { success: true, newStock };
  } catch (error: any) {
    console.error('[restockInventoryAction] Error:', error);
    return { success: false, error: error.message || 'Failed to restock item' };
  }
}

export async function saveInventoryItemAction(item: InventoryItem): Promise<{ success: boolean; data?: InventoryItem; error?: string }> {
  try {
    await prisma.inventoryItem.upsert({
      where: { id: item.id },
      create: {
        id: item.id,
        sku: item.sku,
        name: item.name,
        category: item.category,
        unit: item.unit,
        currentStock: item.currentStock,
        minThreshold: item.minThreshold,
        unitCost: item.unitCost,
        sellingPrice: item.sellingPrice,
        location: item.location || null,
        lastRestocked: item.lastRestocked,
        depletionRatePerDay: item.depletionRatePerDay || null
      },
      update: {
        sku: item.sku,
        name: item.name,
        category: item.category,
        unit: item.unit,
        currentStock: item.currentStock,
        minThreshold: item.minThreshold,
        unitCost: item.unitCost,
        sellingPrice: item.sellingPrice,
        location: item.location || null,
        lastRestocked: item.lastRestocked,
        depletionRatePerDay: item.depletionRatePerDay || null
      }
    });

    revalidatePath('/');
    return { success: true, data: item };
  } catch (error: any) {
    console.error('[saveInventoryItemAction] Error:', error);
    return { success: false, error: error.message || 'Failed to save inventory item' };
  }
}

export async function deleteInventoryItemAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.inventoryItem.delete({
      where: { id }
    });
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error('[deleteInventoryItemAction] Error:', error);
    return { success: false, error: error.message || 'Failed to delete inventory item' };
  }
}

