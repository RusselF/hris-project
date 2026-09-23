'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { deactivateEmployee } from './actions';

export function DeactivateButton({ employeeId }: { employeeId: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  function handleClick() {
    setError('');
    startTransition(async () => {
      const result = await deactivateEmployee(employeeId);
      if (!result.success) setError(result.message);
    });
  }

  return (
    <div>
      <Button size="sm" variant="outline" onClick={handleClick} disabled={isPending}>
        Nonaktifkan
      </Button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}