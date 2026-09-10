// app/actions/expenses.ts
'use server';

import { prisma } from '@/lib/prisma';
import { DailyExpense } from '@/types';
import { revalidatePath } from 'next/cache';

export async function createExpenseAction(expense: DailyExpense): Promise<{ success: boolean; data?: DailyExpense; error?: string }> {
  try {
    await prisma.dailyExpense.create({
      data: {
        id: expense.id,
        date: expense.date,
        category: expense.category,
        description: expense.description,
        amount: expense.amount,
        paymentMethod: expense.paymentMethod,
        recordedBy: expense.recordedBy,
        tellerRole: expense.tellerRole,
        receiptRef: expense.receiptRef || null,
        synced: true,
      }
    });

    revalidatePath('/');
    return { success: true, data: expense };
  } catch (error: any) {
    console.error('[createExpenseAction] Error:', error);
    return { success: false, error: error.message || 'Failed to record expense in database' };
  }
}

export async function deleteExpenseAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.dailyExpense.delete({
      where: { id }
    });

    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error('[deleteExpenseAction] Error:', error);
    return { success: false, error: error.message || 'Failed to delete expense' };
  }
}
