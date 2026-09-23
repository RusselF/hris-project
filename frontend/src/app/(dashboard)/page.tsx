import { getSession } from '@/lib/session';

export default async function DashboardPage() {
  const session = await getSession();

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-2">Selamat datang!</h1>
      <p className="text-muted-foreground">
        Login sebagai: {session?.email} ({session?.role})
      </p>
    </div>
  );
}