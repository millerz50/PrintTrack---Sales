// app/actions/services.ts
'use server';

import { prisma } from '@/lib/prisma';
import { ServiceItem } from '@/types';
import { revalidatePath } from 'next/cache';

export async function saveServiceItemAction(service: ServiceItem): Promise<{ success: boolean; data?: ServiceItem; error?: string }> {
  try {
    await prisma.serviceItem.upsert({
      where: { id: service.id },
      create: {
        id: service.id,
        code: service.code,
        name: service.name,
        category: service.category,
        unit: service.unit,
        price: service.price,
        active: service.active,
        inventoryItemId: service.inventoryItemId || null,
        notes: service.notes || null,
      },
      update: {
        code: service.code,
        name: service.name,
        category: service.category,
        unit: service.unit,
        price: service.price,
        active: service.active,
        inventoryItemId: service.inventoryItemId || null,
        notes: service.notes || null,
      }
    });

    revalidatePath('/');
    return { success: true, data: service };
  } catch (error: any) {
    console.error('[saveServiceItemAction] Error:', error);
    return { success: false, error: error.message || 'Failed to save service item' };
  }
}

export async function deleteServiceItemAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.serviceItem.delete({
      where: { id }
    });

    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error('[deleteServiceItemAction] Error:', error);
    return { success: false, error: error.message || 'Failed to delete service' };
  }
}
