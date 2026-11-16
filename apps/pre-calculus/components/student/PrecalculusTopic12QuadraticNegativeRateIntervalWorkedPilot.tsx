'use client';
import { useRouter } from 'next/navigation';

import { useRef, useState } from 'react';

import { QuadraticNegativeRateIntervalChoiceActivity } from '@math-platform/activity-components';
import type { QuadraticNegativeRateIntervalChoiceProps } from '@math-platform/math-content';
import {
  generateTopic12QuadraticNegativeRateIntervalChoice,
  generateTopic12QuadraticNegativeRateIntervalChoiceOutput,
} from '@math-platform/math-content/knowledge-space';

import { PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_WORKED_ACTIVITY_ID } from '@/lib/learning-evidence/precalc-pilot';

const sourceVariant = generateTopic12QuadraticNegativeRateIntervalChoice(0);
const sourceOutput = generateTopic12QuadraticNegativeRateIntervalChoiceOutput(0);
const finalAnswer = 'Option D is correct because the rate is negative to the right of the vertex.';
type WorkedProps = Extract<QuadraticNegativeRateIntervalChoiceProps, { presentationMode: 'worked_example' }>;

function createIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `precalc-topic-1-2-quadratic-negative-rate-interval-worked-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

async function readJson(response: Response): Promise<Record<string, unknown>> {
  const body: unknown = await response.json().catch(() => null);
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    throw new Error('Unable to record the quadratic negative-rate interval Worked example review.');
  }
  return body as Record<string, unknown>;
}

export function PrecalculusTopic12QuadraticNegativeRateIntervalWorkedPilot() {
  const router = useRouter();
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const idempotencyKeyRef = useRef<string | null>(null);

  const workedProps: WorkedProps = {
    prompt: sourceVariant.prompt,
    functionName: sourceVariant.functionName,
    constantTerm: sourceVariant.constantTerm,
    linearCoefficient: sourceVariant.linearCoefficient,
    quadraticCoefficient: sourceVariant.quadraticCoefficient,
    domain: [...sourceVariant.domain] as [number, number],
    options: sourceVariant.options.map((option) => ({
      ...option,
      id: option.id as WorkedProps['options'][number]['id'],
      label: option.label as WorkedProps['options'][number]['label'],
    })),
    presentationMode: 'worked_example',
    correctOptionId: sourceOutput.expectedAnswer.selectedOptionId as WorkedProps['correctOptionId'],
    steps: sourceOutput.solutionSteps.map((step) => step.description),
    finalAnswer,
  };

  async function submit() {
    if (status === 'saving' || status === 'saved') return;
    idempotencyKeyRef.current ??= createIdempotencyKey();
    setStatus('saving');
    setMessage(null);

    try {
      const response = await fetch('/api/activities/precalculus-topic-1-2-quadratic-negative-rate-interval-worked/submissions', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'Idempotency-Key': idempotencyKeyRef.current,
        },
        body: JSON.stringify({ selectedOptionId: sourceOutput.expectedAnswer.selectedOptionId }),
      });
      const body = await readJson(response);
      if (
        !response.ok
        || typeof body.submissionId !== 'string'
        || body.submissionId.trim().length === 0
      ) {
        throw new Error('Unable to record the quadratic negative-rate interval Worked example review.');
      }
      setStatus('saved');
      router.refresh();
      setMessage('Quadratic negative-rate interval Worked example review saved.');
    } catch {
      setStatus('error');
      setMessage('Unable to record the quadratic negative-rate interval Worked example review.');
    }
  }

  return (
    <section
      className="mx-auto mt-10 max-w-2xl rounded-panel border border-subtle bg-surface p-6 shadow-sm"
      data-testid="precalc-topic-12-quadratic-negative-rate-interval-worked"
    >
      <QuadraticNegativeRateIntervalChoiceActivity
        {...workedProps}
        activityId={PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_WORKED_ACTIVITY_ID}
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
            ? 'Retry quadratic negative-rate interval Worked example review'
            : status === 'saved'
              ? 'Quadratic negative-rate interval Worked example reviewed'
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
