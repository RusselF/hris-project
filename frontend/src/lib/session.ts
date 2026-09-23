import { cookies } from 'next/headers';

export interface Session {
  userId: string;
  email: string;
  role: 'EMPLOYEE' | 'MANAGER' | 'HR';
  employeeId: string | null;
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  if (!accessToken) return null;

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });

  if (!res.ok) return null;

  return res.json();
}