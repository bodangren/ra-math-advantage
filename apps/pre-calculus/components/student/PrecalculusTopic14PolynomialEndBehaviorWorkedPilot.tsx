'use client';
import { useRouter } from 'next/navigation';

import { useRef, useState } from 'react';

import { PolynomialEndBehaviorActivity } from '@math-platform/activity-components';
import type { PolynomialEndBehaviorProps } from '@math-platform/math-content';
import { polynomialEndBehaviorSchema } from '@math-platform/math-content';
import { generateTopic14PolynomialEndBehaviorOutput } from '@math-platform/math-content/knowledge-space';

import {
  PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_WORKED_ACTIVITY_ID,
} from '@/lib/learning-evidence/precalc-pilot';

type WorkedProps = Extract<PolynomialEndBehaviorProps, { presentationMode: 'worked_example' }>;
type AnswerId = keyof WorkedProps['correctAnswers'];
type WorkedSubmissionData = {
  contractVersion: 'practice.v1';
  activityId: typeof PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_WORKED_ACTIVITY_ID;
  mode: 'worked_example';
  status: 'submitted';
  attemptNumber: number;
  submittedAt: string;
  answers: Record<AnswerId, string>;
  parts: ReadonlyArray<{ partId: AnswerId; rawAnswer: string }>;
};
type SubmissionResult = {
  submissionId: string;
  attemptOrdinal: number;
  submittedAt: string;
};

const sourceOutput = generateTopic14PolynomialEndBehaviorOutput(0);
const sourceAnswer = sourceOutput.expectedAnswer as Record<AnswerId, string>;
const reviewUrl = '/api/activities/precalculus-topic-1-4-polynomial-end-behavior-worked/submissions';
const safeError = 'Unable to save the Topic 1.4 polynomial end behavior Worked review.';
const finalAnswer = 'As x approaches negative infinity, f(x) approaches negative infinity. As x approaches positive infinity, f(x) approaches negative infinity.';

function createIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `precalc-topic-1-4-polynomial-end-behavior-worked-${Date.now()}-${Math.random().toString(36).slice(2)}`;
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
    || !Number.isInteger(value.attemptOrdinal)
    || value.attemptOrdinal < 1
    || typeof value.submittedAt !== 'string'
    || !Number.isFinite(Date.parse(value.submittedAt))
    || new Date(value.submittedAt).toISOString() !== value.submittedAt
  ) {
    throw new Error(safeError);
  }
  return value as unknown as SubmissionResult;
}

export function PrecalculusTopic14PolynomialEndBehaviorWorkedPilot() {
  const publicProps = polynomialEndBehaviorSchema.parse(
    sourceOutput.data.rendererProps,
  ) as Extract<PolynomialEndBehaviorProps, { presentationMode: 'independent_practice' }>;
  const workedProps = polynomialEndBehaviorSchema.parse({
    ...publicProps,
    presentationMode: 'worked_example',
    correctAnswers: {
      leftEnd: String(sourceAnswer.leftEnd),
      rightEnd: String(sourceAnswer.rightEnd),
    },
    steps: sourceOutput.solutionSteps.map((step) => step.description),
    finalAnswer,
  }) as WorkedProps;

  const router = useRouter();
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const idempotencyKeyRef = useRef<string | null>(null);
  const requestBodyRef = useRef<WorkedSubmissionData | null>(null);
  const inFlightRef = useRef(false);

  async function submit() {
    if (status === 'saving' || status === 'saved' || inFlightRef.current) return;
    inFlightRef.current = true;
    idempotencyKeyRef.current ??= createIdempotencyKey();
    requestBodyRef.current ??= Object.freeze({
      contractVersion: 'practice.v1',
      activityId: PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_WORKED_ACTIVITY_ID,
      mode: 'worked_example',
      status: 'submitted',
      attemptNumber: 1,
      submittedAt: new Date().toISOString(),
      answers: {
        leftEnd: String(sourceAnswer.leftEnd),
        rightEnd: String(sourceAnswer.rightEnd),
      },
      parts: Object.freeze([
        { partId: 'leftEnd' as const, rawAnswer: String(sourceAnswer.leftEnd) },
        { partId: 'rightEnd' as const, rawAnswer: String(sourceAnswer.rightEnd) },
      ]),
    });
    setStatus('saving');
    setMessage(null);

    try {
      const response = await fetch(reviewUrl, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'Idempotency-Key': idempotencyKeyRef.current,
        },
        body: JSON.stringify(requestBodyRef.current),
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
      data-testid="precalc-topic-1-4-polynomial-end-behavior-worked"
    >
      <p>Review the leading term, answers, and reasoning. Then save this Worked review.</p>
      <PolynomialEndBehaviorActivity
        {...workedProps}
        activityId={PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_WORKED_ACTIVITY_ID}
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
