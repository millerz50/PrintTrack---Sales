import { getDatabaseStateAction } from '@/app/actions/appData';
import { AppShell } from '@/app/AppShell';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const initialData = await getDatabaseStateAction();
  return <AppShell initialData={initialData} />;
}
