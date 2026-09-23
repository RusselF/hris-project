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

export async function approveLeaveRequest(id: string) {
  const result = await callBackend(`/leave-requests/${id}/approve`, 'PATCH');
  revalidatePath('/team');
  return result;
}

export async function rejectLeaveRequest(id: string) {
  const result = await callBackend(`/leave-requests/${id}/reject`, 'PATCH');
  revalidatePath('/team');
  return result;
}