'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { approveLeaveRequest, rejectLeaveRequest } from './actions';

export function TeamPendingActions({ requestId }: { requestId: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  function handleApprove() {
    setError('');
    startTransition(async () => {
      const result = await approveLeaveRequest(requestId);
      if (!result.success) setError(result.message);
    });
  }

  function handleReject() {
    setError('');
    startTransition(async () => {
      const result = await rejectLeaveRequest(requestId);
      if (!result.success) setError(result.message);
    });
  }

  return (
    <div className="space-y-1">
      <div className="flex gap-2">
        <Button size="sm" onClick={handleApprove} disabled={isPending}>
          Approve
        </Button>
        <Button size="sm" variant="outline" onClick={handleReject} disabled={isPending}>
          Reject
        </Button>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}