import { cookies } from 'next/headers';
import { EmployeeFormDialog } from './employee-form-dialog';
import { DepartmentFormDialog } from './department-form-dialog';
import { DeactivateButton } from './deactivate-button';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';

interface Department {
  id: string;
  name: string;
}

interface Position {
  id: string;
  title: string;
}

interface Employee {
  id: string;
  name: string;
  status: 'ACTIVE' | 'INACTIVE';
  department: Department;
  position: Position;
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

export default async function EmployeesPage() {
  const [employees, departments, positions]: [Employee[], Department[], Position[]] =
    await Promise.all([
      fetchWithAuth('/employees'),
      fetchWithAuth('/departments'),
      fetchWithAuth('/positions'),
    ]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Employees</h1>
        <div className="flex gap-2">
          <DepartmentFormDialog />
          <EmployeeFormDialog departments={departments} positions={positions} />
        </div>
      </div>

      <div>
        <h2 className="text-lg font-medium mb-2">Departments</h2>
        <div className="flex flex-wrap gap-2">
          {departments.map((d) => (
            <span key={d.id} className="rounded-full border px-3 py-1 text-sm">
              {d.name}
            </span>
          ))}
          {departments.length === 0 && (
            <p className="text-sm text-muted-foreground">Belum ada department</p>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-medium mb-2">Daftar Employee</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Posisi</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Belum ada employee
                </TableCell>
              </TableRow>
            )}
            {employees.map((emp) => (
              <TableRow key={emp.id}>
                <TableCell>{emp.name}</TableCell>
                <TableCell>{emp.department.name}</TableCell>
                <TableCell>{emp.position.title}</TableCell>
                <TableCell>
                  <Badge variant={emp.status === 'ACTIVE' ? 'default' : 'secondary'}>
                    {emp.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {emp.status === 'ACTIVE' && <DeactivateButton employeeId={emp.id} />}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}