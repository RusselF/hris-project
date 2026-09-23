'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function generatePayroll(formData: FormData) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  const payload = {
    employeeId: formData.get('employeeId'),
    year: Number(formData.get('year')),
    month: Number(formData.get('month')),
    baseSalary: Number(formData.get('baseSalary')),
  };

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payrolls/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    return { success: false, message: data.message ?? 'Terjadi kesalahan' };
  }

  revalidatePath('/payroll');
  return { success: true, data };
}