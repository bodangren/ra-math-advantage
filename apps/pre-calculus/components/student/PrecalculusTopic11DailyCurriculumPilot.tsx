'use client';
import { useRouter } from 'next/navigation';

import { useRef, useState } from 'react';

import { IntervalClassificationActivity } from '@math-platform/activity-components';
import type { IntervalClassificationProps } from '@math-platform/math-content/schemas';

const SAFE_ERROR = 'Unable to save the Topic 1.1 daily attempt.';

type AcknowledgementReceipt = {
  submissionId: string;
  attemptOrdinal: number;
  submittedAt: string;
};

function createIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `precalc-topic-1-1-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

async function readReceipt(response: Response): Promise<AcknowledgementReceipt> {
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok || typeof body !== 'object' || body === null || Array.isArray(body)) {
    throw new Error(SAFE_ERROR);
  }
  const value = body as Record<string, unknown>;
  const timestamp = typeof value.submittedAt === 'string' ? Date.parse(value.submittedAt) : Number.NaN;
  if (
    Object.keys(value).sort().join('|') !== 'attemptOrdinal|submissionId|submittedAt'
    || typeof value.submissionId !== 'string'
    || value.submissionId.trim().length === 0
    || typeof value.attemptOrdinal !== 'number'
    || !Number.isInteger(value.attemptOrdinal)
    || value.attemptOrdinal < 1
    || typeof value.submittedAt !== 'string'
    || !Number.isFinite(timestamp)
    || new Date(timestamp).toISOString() !== value.submittedAt
  ) {
    throw new Error(SAFE_ERROR);
  }
  return value as AcknowledgementReceipt;
}

export function PrecalculusTopic11DailyCurriculumPilot({
  stableActivityId,
  activityProps,
}: {
  stableActivityId: string;
  activityProps: IntervalClassificationProps;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const idempotencyKeyRef = useRef<string | null>(null);
  const submittingRef = useRef(false);

  async function submit() {
    if (submittingRef.current) return;
    submittingRef.current = true;
    idempotencyKeyRef.current ??= createIdempotencyKey();
    setStatus('saving');
    setMessage(null);

    try {
      const response = await fetch('/api/activities/precalculus-topic-1-1/submissions', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'Idempotency-Key': idempotencyKeyRef.current,
        },
        body: JSON.stringify({}),
      });
      await readReceipt(response);
      setStatus('saved');
      router.refresh();
      setMessage('Your worked-example acknowledgement was saved.');
    } catch {
      submittingRef.current = false;
      setStatus('error');
      setMessage(SAFE_ERROR);
    }
  }

  return (
    <section
      className="mx-auto mt-10 max-w-2xl rounded-panel border border-subtle bg-surface p-6 shadow-sm"
      data-testid="precalc-topic-1-1-daily"
    >
      <IntervalClassificationActivity
        {...activityProps}
        activityId={stableActivityId}
        mode="teaching"
      />
      <button
        type="button"
        className="btn-primary mt-6"
        disabled={status === 'saving' || status === 'saved'}
        onClick={submit}
      >
        {status === 'saving'
          ? 'Saving…'
          : status === 'error'
            ? 'Retry worked example review'
            : status === 'saved'
              ? 'Worked example reviewed'
              : 'Mark worked example reviewed'}
      </button>
      {status === 'saved' && message && (
        <p className="mt-4" role="status">{message}</p>
      )}
      {status === 'error' && message && (
        <div className="mt-4" role="alert">
          <p>{message}</p>
        </div>
      )}
    </section>
  );
}
