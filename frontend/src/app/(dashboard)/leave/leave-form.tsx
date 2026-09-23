'use client';

import { useRef, useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { createLeaveRequest } from './actions';

export function LeaveForm({ leaveTypes }: { leaveTypes: { id: string; name: string }[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [leaveTypeId, setLeaveTypeId] = useState('');

  function handleSubmit(formData: FormData) {
    setError('');
    startTransition(async () => {
      const result = await createLeaveRequest(formData);
      if (!result.success) {
        setError(result.message);
      } else {
        formRef.current?.reset();
        setLeaveTypeId('');
      }
    });
  }

  return (
    <form ref={formRef} action={handleSubmit} className="flex flex-wrap items-end gap-3 rounded-lg border p-4">
      <div className="space-y-1">
        <Label>Jenis Cuti</Label>
        <input type="hidden" name="leaveTypeId" value={leaveTypeId} />
        <Select
            items={leaveTypes.map((type) => ({ value: type.id, label: type.name }))}
            value={leaveTypeId}
            onValueChange={(value) => setLeaveTypeId(value ?? '')}
        >
            <SelectTrigger className="w-48">
                <SelectValue placeholder="Pilih jenis cuti" />
            </SelectTrigger>
            <SelectContent>
                {leaveTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                        {type.name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label htmlFor="startDate">Tanggal Mulai</Label>
        <Input id="startDate" name="startDate" type="date" required />
      </div>

      <div className="space-y-1">
        <Label htmlFor="endDate">Tanggal Selesai</Label>
        <Input id="endDate" name="endDate" type="date" required />
      </div>

      <Button type="submit" disabled={isPending || !leaveTypeId}>
        {isPending ? 'Mengajukan...' : 'Ajukan Cuti'}
      </Button>

      {error && <p className="w-full text-sm text-red-500">{error}</p>}
    </form>
  );
}