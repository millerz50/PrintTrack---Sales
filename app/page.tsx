import { getDatabaseStateAction } from '@/app/actions/appData';
import { AppShell } from '@/app/AppShell';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let initialData;
  try {
    initialData = await getDatabaseStateAction();
  } catch (err) {
    console.warn('[HomePage] Server action error while fetching initial DB state, falling back to client cache:', err);
  }
  return <AppShell initialData={initialData || undefined} />;
}
