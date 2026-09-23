'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  roles: Array<'EMPLOYEE' | 'MANAGER' | 'HR'>;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/', roles: ['EMPLOYEE', 'MANAGER', 'HR'] },
  { label: 'Attendance', href: '/attendance', roles: ['EMPLOYEE', 'MANAGER', 'HR'] },
  { label: 'Leave', href: '/leave', roles: ['EMPLOYEE', 'MANAGER', 'HR'] },
  { label: 'My Team', href: '/team', roles: ['MANAGER'] },
  { label: 'Employees', href: '/employees', roles: ['HR'] },
  { label: 'Payroll', href: '/payroll', roles: ['HR'] },
];

export function DashboardSidebar({ role }: { role: 'EMPLOYEE' | 'MANAGER' | 'HR' }) {
  const pathname = usePathname();
  const router = useRouter();

  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(role));

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  return (
    <aside className="w-64 border-r bg-muted/30 p-4 flex flex-col">
      <div className="mb-6 px-2">
        <h2 className="font-semibold">HRIS</h2>
        <p className="text-xs text-muted-foreground">{role}</p>
      </div>

      <nav className="flex-1 space-y-1">
        {visibleItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'block rounded-md px-3 py-2 text-sm hover:bg-muted',
              pathname === item.href && 'bg-muted font-medium',
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <Button variant="outline" onClick={handleLogout}>
        Logout
      </Button>
    </aside>
  );
}