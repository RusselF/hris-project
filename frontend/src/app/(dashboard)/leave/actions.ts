'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function createLeaveRequest(formData: FormData) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  const leaveTypeId = formData.get('leaveTypeId') as string;
  const startDate = formData.get('startDate') as string;
  const endDate = formData.get('endDate') as string;

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/leave-requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ leaveTypeId, startDate, endDate }),
  });

  const data = await res.json();

  if (!res.ok) {
    return { success: false, message: data.message ?? 'Terjadi kesalahan' };
  }

  revalidatePath('/leave');
  return { success: true, data };
}