'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

async function callBackend(path: string, method: string) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
    method,
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const data = await res.json();

  if (!res.ok) {
    return { success: false, message: data.message ?? 'Terjadi kesalahan' };
  }

  return { success: true, data };
}

export async function clockIn() {
  const result = await callBackend('/attendance/clock-in', 'POST');
  revalidatePath('/attendance');
  return result;
}

export async function clockOut() {
  const result = await callBackend('/attendance/clock-out', 'POST');
  revalidatePath('/attendance');
  return result;
}