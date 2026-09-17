'use client';
import { useRouter } from 'next/navigation';

import { useRef, useState } from 'react';

import { PointwiseRateOrderingActivity } from '@math-platform/activity-components';
import type { PointwiseRateOrderingProps } from '@math-platform/math-content';
import {
  generateTopic12PointwiseRateOrdering,
  generateTopic12PointwiseRateOrderingOutput,
} from '@math-platform/math-content/knowledge-space';

import { PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_WORKED_ACTIVITY_ID } from '@/lib/learning-evidence/precalc-pilot';

const sourceVariant = generateTopic12PointwiseRateOrdering(0);
const sourceOutput = generateTopic12PointwiseRateOrderingOutput(0);
const sourceOrder = (sourceOutput.expectedAnswer as { orderedPointIds: readonly string[] }).orderedPointIds;
const finalAnswer = 'The least-to-greatest order is B < C < A.';
type WorkedProps = Extract<PointwiseRateOrderingProps, { presentationMode: 'worked_example' }>;

function createIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `precalc-topic-1-2-pointwise-ordering-worked-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

async function readJson(response: Response): Promise<Record<string, unknown>> {
  const body: unknown = await response.json().catch(() => null);
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    throw new Error('Unable to record the pointwise ordering Worked example review.');
  }
  return body as Record<string, unknown>;
}

export function PrecalculusTopic12PointwiseOrderingWorkedPilot() {
  const router = useRouter();
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const idempotencyKeyRef = useRef<string | null>(null);

  const workedProps: WorkedProps = {
    prompt: sourceVariant.prompt,
    domain: [...sourceVariant.domain] as [number, number],
    range: [...sourceVariant.range] as [number, number],
    xLabel: sourceVariant.xLabel,
    yLabel: sourceVariant.yLabel,
    graphPoints: sourceVariant.graphPoints.map((point) => ({ ...point })),
    labeledPoints: sourceVariant.labeledPoints.map((point) => ({
      ...point,
      id: point.id as WorkedProps['labeledPoints'][number]['id'],
      label: point.label as WorkedProps['labeledPoints'][number]['label'],
    })),
    presentationMode: 'worked_example',
    orderedPointIds: [...sourceOrder] as WorkedProps['orderedPointIds'],
    steps: [...sourceVariant.solutionSteps],
    finalAnswer,
  };

  async function submit() {
    if (status === 'saving' || status === 'saved') return;
    idempotencyKeyRef.current ??= createIdempotencyKey();
    setStatus('saving');
    setMessage(null);

    try {
      const response = await fetch('/api/activities/precalculus-topic-1-2-pointwise-ordering-worked/submissions', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'Idempotency-Key': idempotencyKeyRef.current,
        },
        body: JSON.stringify({ orderedPointIds: sourceOrder }),
      });
      const body = await readJson(response);
      if (
        !response.ok
        || typeof body.submissionId !== 'string'
        || body.submissionId.trim().length === 0
      ) {
        throw new Error('Unable to record the pointwise ordering Worked example review.');
      }
      setStatus('saved');
      router.refresh();
      setMessage('Pointwise ordering Worked example review saved.');
    } catch {
      setStatus('error');
      setMessage('Unable to record the pointwise ordering Worked example review.');
    }
  }

  return (
    <section
      className="mx-auto mt-10 max-w-2xl rounded-panel border border-subtle bg-surface p-6 shadow-sm"
      data-testid="precalc-topic-12-pointwise-ordering-worked"
    >
      <PointwiseRateOrderingActivity
        {...workedProps}
        activityId={PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_WORKED_ACTIVITY_ID}
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
            ? 'Retry pointwise ordering Worked example review'
            : status === 'saved'
              ? 'Pointwise ordering Worked example reviewed'
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
