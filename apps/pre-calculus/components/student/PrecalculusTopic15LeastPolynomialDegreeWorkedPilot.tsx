'use client';
import { useRouter } from 'next/navigation';

import { useRef, useState } from 'react';

import { LeastPolynomialDegreeActivity } from '@math-platform/activity-components';
import type { LeastPolynomialDegreeProps } from '@math-platform/math-content';
import { leastPolynomialDegreeSchema } from '@math-platform/math-content';
import { generateTopic15LeastPolynomialDegreeOutput } from '@math-platform/math-content/knowledge-space';

import {
  PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_WORKED_ACTIVITY_ID,
} from '@/lib/learning-evidence/precalc-pilot';

type WorkedProps = Extract<LeastPolynomialDegreeProps, { presentationMode: 'worked_example' }>;
type SubmissionResult = {
  submissionId: string;
  attemptOrdinal: number;
  submittedAt: string;
};

const sourceOutput = generateTopic15LeastPolynomialDegreeOutput(0);
const reviewUrl = '/api/activities/precalculus-topic-1-5-least-polynomial-degree-worked/submissions';
const safeError = 'Unable to save the Topic 1.5 least polynomial degree Worked review.';
const finalAnswer = 'The least possible degree is 5.';
const sourceLeastDegree = sourceOutput.expectedAnswer.leastDegree;

function createIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `precalc-topic-1-5-least-polynomial-degree-worked-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasExactKeys(value: Record<string, unknown>, keys: string): boolean {
  return Object.keys(value).sort().join('|') === keys;
}

function validateSubmissionResult(value: unknown): SubmissionResult {
  if (
    !isRecord(value)
    || !hasExactKeys(value, 'attemptOrdinal|submissionId|submittedAt')
    || typeof value.submissionId !== 'string'
    || value.submissionId.trim().length === 0
    || typeof value.attemptOrdinal !== 'number'
    || !Number.isSafeInteger(value.attemptOrdinal)
    || value.attemptOrdinal < 1
    || typeof value.submittedAt !== 'string'
    || !Number.isFinite(Date.parse(value.submittedAt))
    || new Date(value.submittedAt).toISOString() !== value.submittedAt
  ) {
    throw new Error(safeError);
  }
  return value as unknown as SubmissionResult;
}

export function PrecalculusTopic15LeastPolynomialDegreeWorkedPilot() {
  const publicProps = leastPolynomialDegreeSchema.parse(sourceOutput.data.rendererProps);
  const workedProps = leastPolynomialDegreeSchema.parse({
    ...publicProps,
    presentationMode: 'worked_example',
    correctAnswer: sourceLeastDegree,
    steps: sourceOutput.solutionSteps.map((step) => step.description),
    finalAnswer,
  }) as WorkedProps;

  const router = useRouter();
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const idempotencyKeyRef = useRef<string | null>(null);
  const requestBodyRef = useRef<string | null>(null);
  const inFlightRef = useRef(false);

  async function submit() {
    if (status === 'saving' || status === 'saved' || inFlightRef.current) return;
    inFlightRef.current = true;
    const idempotencyKey = idempotencyKeyRef.current ?? createIdempotencyKey();
    idempotencyKeyRef.current = idempotencyKey;
    const requestBody = requestBodyRef.current ??= JSON.stringify({
      contractVersion: 'practice.v1',
      activityId: PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_WORKED_ACTIVITY_ID,
      mode: 'worked_example',
      status: 'submitted',
      attemptNumber: 1,
      submittedAt: new Date().toISOString(),
      answers: { leastDegree: sourceLeastDegree },
      parts: [{ partId: 'leastDegree', rawAnswer: sourceLeastDegree }],
    });
    setStatus('saving');
    setMessage(null);

    try {
      const response = await fetch(reviewUrl, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'Idempotency-Key': idempotencyKey,
        },
        body: requestBody,
      });
      const body: unknown = await response.json().catch(() => null);
      if (!response.ok) throw new Error(safeError);
      const submission = validateSubmissionResult(body);
      setStatus('saved');
      router.refresh();
      setMessage(`Worked example review saved (attempt ${submission.attemptOrdinal}).`);
    } catch {
      setStatus('error');
      setMessage(safeError);
    } finally {
      inFlightRef.current = false;
    }
  }

  return (
    <section
      className="mx-auto mt-10 max-w-2xl rounded-panel border border-subtle bg-surface p-6 shadow-sm"
      data-testid="precalc-topic-1-5-least-polynomial-degree-worked"
    >
      <p>Review the nonreal zero i√3, its conjugate pair, the 3 real zeros, and the reasoning. Then save this Worked review.</p>
      <LeastPolynomialDegreeActivity
        {...workedProps}
        activityId={PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_WORKED_ACTIVITY_ID}
        mode="teaching"
      />
      <button
        type="button"
        className="btn-primary mt-6"
        disabled={status === 'saving' || status === 'saved'}
        onClick={() => { void submit(); }}
      >
        {status === 'saving'
          ? 'Saving…'
          : status === 'error'
            ? 'Retry Worked review'
            : status === 'saved'
              ? 'Worked review saved'
              : 'Save Worked review'}
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
