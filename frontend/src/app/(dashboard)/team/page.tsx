import { cookies } from 'next/headers';
import { TeamPendingActions } from './team-pending-actions';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';

interface TeamMember {
  id: string;
  name: string;
  department: { name: string };
  position: { title: string };
}

interface PendingLeaveRequest {
  id: string;
  startDate: string;
  endDate: string;
  leaveType: { name: string };
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

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default async function TeamPage() {
  const [members, pendingRequests]: [TeamMember[], PendingLeaveRequest[]] = await Promise.all([
    fetchWithAuth('/employees/my-team'),
    fetchWithAuth('/leave-requests/team-pending'),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold mb-4">My Team</h1>

        <h2 className="text-lg font-medium mb-2">Pengajuan Cuti Pending</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Jenis Cuti</TableHead>
              <TableHead>Mulai</TableHead>
              <TableHead>Selesai</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pendingRequests.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Tidak ada pengajuan yang perlu di-review
                </TableCell>
              </TableRow>
            )}
            {pendingRequests.map((req) => (
              <TableRow key={req.id}>
                <TableCell>{req.employee.name}</TableCell>
                <TableCell>{req.leaveType.name}</TableCell>
                <TableCell>{formatDate(req.startDate)}</TableCell>
                <TableCell>{formatDate(req.endDate)}</TableCell>
                <TableCell>
                  <TeamPendingActions requestId={req.id} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div>
        <h2 className="text-lg font-medium mb-2">Anggota Tim</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Posisi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  Kamu belum punya anggota tim
                </TableCell>
              </TableRow>
            )}
            {members.map((m) => (
              <TableRow key={m.id}>
                <TableCell>{m.name}</TableCell>
                <TableCell>{m.department.name}</TableCell>
                <TableCell>{m.position.title}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}