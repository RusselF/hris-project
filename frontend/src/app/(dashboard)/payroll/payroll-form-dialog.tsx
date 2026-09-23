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
import { generatePayroll } from './actions';

interface Employee {
  id: string;
  name: string;
}

const MONTHS = [
  { value: '1', label: 'Januari' }, { value: '2', label: 'Februari' },
  { value: '3', label: 'Maret' }, { value: '4', label: 'April' },
  { value: '5', label: 'Mei' }, { value: '6', label: 'Juni' },
  { value: '7', label: 'Juli' }, { value: '8', label: 'Agustus' },
  { value: '9', label: 'September' }, { value: '10', label: 'Oktober' },
  { value: '11', label: 'November' }, { value: '12', label: 'Desember' },
];

export function PayrollFormDialog({ employees }: { employees: Employee[] }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const [employeeId, setEmployeeId] = useState('');
  const [month, setMonth] = useState('');

  function handleSubmit(formData: FormData) {
    setError('');
    startTransition(async () => {
      const result = await generatePayroll(formData);
      if (!result.success) {
        setError(result.message);
      } else {
        formRef.current?.reset();
        setEmployeeId('');
        setMonth('');
        setOpen(false);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button>+ Generate Payroll</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generate Payroll</DialogTitle>
        </DialogHeader>
        <form ref={formRef} action={handleSubmit} className="space-y-3">
          <input type="hidden" name="employeeId" value={employeeId} />
          <input type="hidden" name="month" value={month} />

          <div className="space-y-1">
            <Label>Employee</Label>
            <Select
              items={employees.map((e) => ({ value: e.id, label: e.name }))}
              value={employeeId}
              onValueChange={(v) => setEmployeeId(v ?? '')}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih employee" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((e) => (
                  <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label>Bulan</Label>
            <Select
              items={MONTHS}
              value={month}
              onValueChange={(v) => setMonth(v ?? '')}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih bulan" />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="year">Tahun</Label>
            <Input id="year" name="year" type="number" defaultValue={2026} required />
          </div>

          <div className="space-y-1">
            <Label htmlFor="baseSalary">Gaji Pokok (Rp)</Label>
            <Input id="baseSalary" name="baseSalary" type="number" min={0} required />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? 'Generating...' : 'Generate'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}