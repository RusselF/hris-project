'use client';

import { useRef, useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { createEmployee } from './actions';

interface Department {
  id: string;
  name: string;
}

interface Position {
  id: string;
  title: string;
}

const ROLES = ['EMPLOYEE', 'MANAGER', 'HR'];

export function EmployeeFormDialog({
  departments,
  positions,
}: {
  departments: Department[];
  positions: Position[];
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const [departmentId, setDepartmentId] = useState('');
  const [positionId, setPositionId] = useState('');
  const [role, setRole] = useState('EMPLOYEE');

  function handleSubmit(formData: FormData) {
    setError('');
    startTransition(async () => {
      const result = await createEmployee(formData);
      if (!result.success) {
        setError(result.message);
      } else {
        formRef.current?.reset();
        setDepartmentId('');
        setPositionId('');
        setRole('EMPLOYEE');
        setOpen(false);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button>+ Employee</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Employee</DialogTitle>
        </DialogHeader>
        <form ref={formRef} action={handleSubmit} className="space-y-3">
          <input type="hidden" name="departmentId" value={departmentId} />
          <input type="hidden" name="positionId" value={positionId} />
          <input type="hidden" name="role" value={role} />

          <div className="space-y-1">
            <Label htmlFor="name">Nama</Label>
            <Input id="name" name="name" required />
          </div>

          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required />
          </div>

          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required minLength={6} />
          </div>

          <div className="space-y-1">
            <Label htmlFor="joinDate">Tanggal Masuk</Label>
            <Input id="joinDate" name="joinDate" type="date" required />
          </div>

          <div className="space-y-1">
            <Label>Department</Label>
            <Select
              items={departments.map((d) => ({ value: d.id, label: d.name }))}
              value={departmentId}
              onValueChange={(v) => setDepartmentId(v ?? '')}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((d) => (
                  <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label>Posisi</Label>
            <Select
              items={positions.map((p) => ({ value: p.id, label: p.title }))}
              value={positionId}
              onValueChange={(v) => setPositionId(v ?? '')}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih posisi" />
              </SelectTrigger>
              <SelectContent>
                {positions.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label>Role</Label>
            <Select
              items={ROLES.map((r) => ({ value: r, label: r }))}
              value={role}
              onValueChange={(v) => setRole(v ?? 'EMPLOYEE')}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}