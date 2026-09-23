import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { DashboardSidebar } from '@/components/dashboard-sidebar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar role={session.role} />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}