'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { clockIn, clockOut } from './actions';

export function AttendanceActions({
  hasClockIn,
  hasClockOut,
}: {
  hasClockIn: boolean;
  hasClockOut: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  function handleClockIn() {
    setError('');
    startTransition(async () => {
      const result = await clockIn();
      if (!result.success) setError(result.message);
    });
  }

  function handleClockOut() {
    setError('');
    startTransition(async () => {
      const result = await clockOut();
      if (!result.success) setError(result.message);
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Button onClick={handleClockIn} disabled={isPending || hasClockIn}>
          Clock In
        </Button>
        <Button
          onClick={handleClockOut}
          disabled={isPending || !hasClockIn || hasClockOut}
          variant="outline"
        >
          Clock Out
        </Button>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      {hasClockIn && hasClockOut && (
        <p className="text-sm text-muted-foreground">Kehadiran hari ini sudah lengkap ✓</p>
      )}
    </div>
  );
}