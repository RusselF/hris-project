import { cookies } from 'next/headers';
import { PayrollFormDialog } from './payroll-form-dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';

interface Employee {
  id: string;
  name: string;
}

interface Payroll {
  id: string;
  period: string;
  baseSalary: string;
  deduction: string;
  total: string;
  employee: { name: string };
}

async function fetchWithAuth(path: string) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });

  if (!res.ok) return [];
  return res.json();
}

function formatRupiah(value: string | number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(Number(value));
}

export default async function PayrollPage() {
  const [payrolls, employees]: [Payroll[], Employee[]] = await Promise.all([
    fetchWithAuth('/payrolls'),
    fetchWithAuth('/employees'),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Payroll</h1>
        <PayrollFormDialog employees={employees} />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee</TableHead>
            <TableHead>Periode</TableHead>
            <TableHead>Gaji Pokok</TableHead>
            <TableHead>Potongan</TableHead>
            <TableHead>Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payrolls.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                Belum ada payroll yang di-generate
              </TableCell>
            </TableRow>
          )}
          {payrolls.map((p) => (
            <TableRow key={p.id}>
              <TableCell>{p.employee.name}</TableCell>
              <TableCell>{p.period}</TableCell>
              <TableCell>{formatRupiah(p.baseSalary)}</TableCell>
              <TableCell>{formatRupiah(p.deduction)}</TableCell>
              <TableCell className="font-medium">{formatRupiah(p.total)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}