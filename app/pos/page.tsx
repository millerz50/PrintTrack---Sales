import { getDatabaseStateAction } from '@/app/actions/appData';
import { PosTerminalShell } from '@/components/pos/PosTerminalShell';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Teller POS & Workshop Terminal | Magen Integrated Business Solutions',
  description: 'Authorized Staff POS Terminal, sales receipts, stock inventory, and daily cost tracking for Mount Darwin workshop.',
};

export default async function PosPage() {
  let initialData;
  try {
    initialData = await getDatabaseStateAction();
  } catch (err) {
    console.warn('[PosPage] Server action error while fetching initial DB state:', err);
  }

  return <PosTerminalShell initialData={initialData || undefined} />;
}
