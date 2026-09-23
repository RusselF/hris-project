'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

async function callBackend(path: string, method: string, body?: unknown) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();

  if (!res.ok) {
    return { success: false, message: data.message ?? 'Terjadi kesalahan' };
  }

  return { success: true, data };
}

export async function createEmployee(formData: FormData) {
  const payload = {
    email: formData.get('email'),
    password: formData.get('password'),
    name: formData.get('name'),
    departmentId: formData.get('departmentId'),
    positionId: formData.get('positionId'),
    role: formData.get('role'),
    joinDate: formData.get('joinDate'),
  };

  const result = await callBackend('/employees', 'POST', payload);
  revalidatePath('/employees');
  return result;
}

export async function deactivateEmployee(id: string) {
  const result = await callBackend(`/employees/${id}/deactivate`, 'PATCH');
  revalidatePath('/employees');
  return result;
}

export async function createDepartment(formData: FormData) {
  const result = await callBackend('/departments', 'POST', { name: formData.get('name') });
  revalidatePath('/employees');
  return result;
}