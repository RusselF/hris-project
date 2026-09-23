import { cookies } from 'next/headers';
import { AttendanceActions } from './attendance-actions';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';

interface AttendanceRecord {
  id: string;
  date: string;
  clockIn: string | null;
  clockOut: string | null;
  status: 'ON_TIME' | 'LATE' | 'ABSENT';
}

async function getMyHistory(): Promise<AttendanceRecord[]> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/attendance/my-history`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });

  if (!res.ok) return [];
  return res.json();
}

function formatTime(iso: string | null) {
  if (!iso) return '-';
  return new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

const STATUS_VARIANT: Record<string, 'default' | 'destructive' | 'secondary'> = {
  ON_TIME: 'default',
  LATE: 'secondary',
  ABSENT: 'destructive',
};

export default async function AttendancePage() {
  const history = await getMyHistory();
  const today = new Date().toDateString();
  const todayRecord = history.find((r) => new Date(r.date).toDateString() === today);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-4">Attendance</h1>
        <AttendanceActions
          hasClockIn={!!todayRecord?.clockIn}
          hasClockOut={!!todayRecord?.clockOut}
        />
      </div>

      <div>
        <h2 className="text-lg font-medium mb-2">Riwayat Kehadiran</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tanggal</TableHead>
              <TableHead>Clock In</TableHead>
              <TableHead>Clock Out</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  Belum ada riwayat kehadiran
                </TableCell>
              </TableRow>
            )}
            {history.map((record) => (
              <TableRow key={record.id}>
                <TableCell>{formatDate(record.date)}</TableCell>
                <TableCell>{formatTime(record.clockIn)}</TableCell>
                <TableCell>{formatTime(record.clockOut)}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[record.status]}>{record.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}