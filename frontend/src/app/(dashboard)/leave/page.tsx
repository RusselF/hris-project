import { cookies } from 'next/headers';
import { LeaveForm } from './leave-form';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';

interface LeaveType {
  id: string;
  name: string;
}

interface LeaveBalance {
  id: string;
  balance: number;
  leaveType: LeaveType;
}

interface LeaveRequest {
  id: string;
  startDate: string;
  endDate: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  leaveType: LeaveType;
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

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

const STATUS_VARIANT: Record<string, 'default' | 'destructive' | 'secondary' | 'outline'> = {
  PENDING: 'secondary',
  APPROVED: 'default',
  REJECTED: 'destructive',
  CANCELLED: 'outline',
};

export default async function LeavePage() {
  const [leaveTypes, balances, requests]: [LeaveType[], LeaveBalance[], LeaveRequest[]] =
    await Promise.all([
      fetchWithAuth('/leave-types'),
      fetchWithAuth('/leave-balances/my-balance'),
      fetchWithAuth('/leave-requests/my-requests'),
    ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold mb-4">Leave</h1>
        <LeaveForm leaveTypes={leaveTypes} />
      </div>

      <div>
        <h2 className="text-lg font-medium mb-2">Saldo Cuti</h2>
        <div className="flex gap-4">
          {balances.map((b) => (
            <div key={b.id} className="rounded-lg border px-4 py-2">
              <p className="text-sm text-muted-foreground">{b.leaveType.name}</p>
              <p className="text-xl font-semibold">{b.balance} hari</p>
            </div>
          ))}
          {balances.length === 0 && (
            <p className="text-sm text-muted-foreground">Belum ada saldo cuti</p>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-medium mb-2">Riwayat Pengajuan</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Jenis Cuti</TableHead>
              <TableHead>Mulai</TableHead>
              <TableHead>Selesai</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  Belum ada pengajuan cuti
                </TableCell>
              </TableRow>
            )}
            {requests.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.leaveType.name}</TableCell>
                <TableCell>{formatDate(r.startDate)}</TableCell>
                <TableCell>{formatDate(r.endDate)}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[r.status]}>{r.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}