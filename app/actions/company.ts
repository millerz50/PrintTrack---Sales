// app/actions/company.ts
'use server';

import { prisma } from '@/lib/prisma';
import { CompanyInfo } from '@/services/storage';
import { revalidatePath } from 'next/cache';

export async function updateCompanyAction(company: CompanyInfo): Promise<{ success: boolean; data?: CompanyInfo; error?: string }> {
  try {
    const updated = await prisma.company.upsert({
      where: { id: 'default' },
      update: {
        name: company.name,
        tagline: company.tagline,
        phone: company.phone,
        email: company.email,
        address: company.address,
        currency: company.currency,
        taxRate: company.taxRate,
        receiptFooter: company.receiptFooter
      },
      create: {
        id: 'default',
        name: company.name,
        tagline: company.tagline,
        phone: company.phone,
        email: company.email,
        address: company.address,
        currency: company.currency,
        taxRate: company.taxRate,
        receiptFooter: company.receiptFooter
      }
    });

    revalidatePath('/');
    return {
      success: true,
      data: {
        name: updated.name,
        tagline: updated.tagline,
        phone: updated.phone,
        email: updated.email,
        address: updated.address,
        currency: updated.currency,
        taxRate: updated.taxRate,
        receiptFooter: updated.receiptFooter
      }
    };
  } catch (error: any) {
    console.error('[updateCompanyAction] Error:', error);
    return { success: false, error: error.message || 'Failed to update company info' };
  }
}
