'use client';
import { parseEvidenceResponse, postPracticeJson } from '@/lib/practice/submission-client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import { PolynomialInequalitySignChartActivity } from '@math-platform/activity-components';
import type { PolynomialInequalitySignChartProps } from '@math-platform/math-content';
import { polynomialInequalitySignChartSchema } from '@math-platform/math-content';
import { generateTopic15PolynomialInequalityOutput } from '@math-platform/math-content/knowledge-space';

import {
  PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_INDEPENDENT_ACTIVITY_ID,
} from '@/lib/learning-evidence/precalc-pilot';

export type PrecalculusTopic15PolynomialInequalityPracticeMode =
  'guided_practice' | 'independent_practice';

export type PrecalculusTopic15PolynomialInequalityKnowledgeState = {
  nodeId: string;
  title: string;
  status: 'not_started' | 'in_progress' | 'mastered' | 'decaying';
  readiness: 'ready' | 'blocked' | 'awaiting_teacher_exposure';
};

type PracticeStatus = 'idle' | 'saving' | 'saved' | 'error';

const PRACTICE_ERROR = 'Unable to save the Topic 1.5 polynomial inequality practice.';
const CREATE_URL = '/api/activities/precalculus-topic-1-5-polynomial-inequality/submissions';
const EVIDENCE_URL = '/api/learning-evidence/precalculus-pilot';
const GUIDED_STEPS = [
  'Find and sort the distinct real roots.',
  'Test one value in each interval and record the sign.',
  'Use the inequality operator to write the interval union.',
];
const GUIDED_HELP = {
  roots: 'Enter the sorted distinct real roots.',
  intervalSigns: 'Enter one sign for each interval from left to right.',
  solution: 'Write the solution as an interval union.',
};

function createIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `precalc-topic-1-5-polynomial-inequality-practice-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasExactKeys(value: Record<string, unknown>, keys: string): boolean {
  return Object.keys(value).sort().join('|') === keys;
}

function validateCreateResult(value: unknown): {
  submissionId: string;
  score: number;
  maxScore: 3;
  attemptOrdinal: number;
  feedback: string;
} {
  if (
    !isRecord(value)
    || !hasExactKeys(value, 'attemptOrdinal|feedback|maxScore|score|submissionId')
    || typeof value.submissionId !== 'string'
    || value.submissionId.trim().length === 0
    || typeof value.score !== 'number'
    || !Number.isSafeInteger(value.score)
    || value.score < 0
    || value.score > 3
    || value.maxScore !== 3
    || typeof value.attemptOrdinal !== 'number'
    || !Number.isSafeInteger(value.attemptOrdinal)
    || value.attemptOrdinal < 1
    || typeof value.feedback !== 'string'
    || value.feedback.trim().length === 0
  ) {
    throw new Error(PRACTICE_ERROR);
  }
  return value as {
    submissionId: string;
    score: number;
    maxScore: 3;
    attemptOrdinal: number;
    feedback: string;
  };
}



const validateEvidenceResponse = (value: unknown) => parseEvidenceResponse(value, PRACTICE_ERROR);

export function PrecalculusTopic15PolynomialInequalityPracticePilot({
  mode: requestedMode,
  knowledgeState,
}: {
  mode?: PrecalculusTopic15PolynomialInequalityPracticeMode;
  knowledgeState?: PrecalculusTopic15PolynomialInequalityKnowledgeState;
}) {
  const mode = requestedMode ?? 'guided_practice';
  const seed = mode === 'guided_practice' ? 1 : 2;
  const activityId = mode === 'guided_practice'
    ? PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_GUIDED_ACTIVITY_ID
    : PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_INDEPENDENT_ACTIVITY_ID;
  const rendererProps = polynomialInequalitySignChartSchema.parse(
    generateTopic15PolynomialInequalityOutput(seed).data.rendererProps,
  );
  const sharedActivityProps: PolynomialInequalitySignChartProps = mode === 'guided_practice'
    ? polynomialInequalitySignChartSchema.parse({
        ...rendererProps,
        presentationMode: 'guided_practice',
        guidedSteps: GUIDED_STEPS,
        fieldHelp: GUIDED_HELP,
      })
    : polynomialInequalitySignChartSchema.parse({
        ...rendererProps,
        presentationMode: 'independent_practice',
      });
  const [attemptKey, setAttemptKey] = useState(0);
  const router = useRouter();
  const [status, setStatus] = useState<PracticeStatus>('idle');
  const [serverScore, setServerScore] = useState<{ score: number; maxScore: 3 } | null>(null);
  const [serverFeedback, setServerFeedback] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const envelopeBodyRef = useRef<string | null>(null);
  const createKeyRef = useRef<string | null>(null);
  const submissionIdRef = useRef<string | null>(null);
  const [hasOpaqueSubmission, setHasOpaqueSubmission] = useState(false);
  const inFlightRef = useRef(false);

  async function deliverEvidence(submissionId: string) {
    const evidence = validateEvidenceResponse(await postPracticeJson(EVIDENCE_URL, JSON.stringify({ submissionId }), PRACTICE_ERROR));
    if (
      evidence.decision.reason === 'awaiting_teacher_exposure'
      || evidence.decision.exposureState === 'awaiting_teacher_exposure'
    ) {
      setFeedback('Complete this skill with your teacher before using Mastery Advantage.');
    } else if (evidence.masteryApplied) {
      setFeedback('Mastery Advantage updated your practice record.');
    } else {
      setFeedback('Your practice was saved.');
    }
    setStatus('saved');
    router.refresh();
  }

  async function submit(submittedEnvelope?: unknown) {
    if (status === 'saving' || status === 'saved' || inFlightRef.current) return;
    inFlightRef.current = true;
    setStatus('saving');
    setFeedback(null);

    try {
      if (envelopeBodyRef.current === null) {
        if (!isRecord(submittedEnvelope) || !Array.isArray(submittedEnvelope.parts)) {
          throw new Error(PRACTICE_ERROR);
        }
        envelopeBodyRef.current = JSON.stringify(submittedEnvelope);
        createKeyRef.current ??= createIdempotencyKey();
      }

      const body = envelopeBodyRef.current;
      const idempotencyKey = createKeyRef.current;
      if (body === null || idempotencyKey === null) throw new Error(PRACTICE_ERROR);

      let submissionId = submissionIdRef.current;
      if (submissionId === null) {
        const response = await fetch(CREATE_URL, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'Idempotency-Key': idempotencyKey,
          },
          body,
        });
        if (!response.ok) throw new Error(PRACTICE_ERROR);
        const result = validateCreateResult(await response.json().catch(() => null));
        submissionId = result.submissionId;
        submissionIdRef.current = submissionId;
        setHasOpaqueSubmission(true);
        setServerScore({ score: result.score, maxScore: result.maxScore });
        setServerFeedback(result.feedback);
      }
      await deliverEvidence(submissionId);
    } catch {
      setStatus('error');
    } finally {
      inFlightRef.current = false;
    }
  }

  return (
    <section id={knowledgeState ? `${knowledgeState.nodeId}-${mode}` : undefined} className="mx-auto mt-10 max-w-2xl rounded-panel border border-subtle bg-surface p-6 shadow-sm">
      {knowledgeState && (
        <div className="mt-4 rounded border border-subtle bg-background p-3">
          <p>{knowledgeState.title}</p>
          <p>Mastery state: {knowledgeState.status.replace('_', ' ')}</p>
          <p>Readiness: {knowledgeState.readiness === 'blocked' ? 'Review prerequisite skills' : knowledgeState.readiness === 'awaiting_teacher_exposure' ? 'Complete the classroom introduction' : 'Ready'}</p>
        </div>
      )}
      <PolynomialInequalitySignChartActivity
        key={attemptKey}
        {...sharedActivityProps}
        activityId={activityId}
        mode={mode === 'guided_practice' ? 'guided' : 'practice'}
        onSubmit={submit}
      />
      {serverScore && (
        <p className="mt-4">{`Server score: ${serverScore.score}/${serverScore.maxScore}`}</p>
      )}
      {serverFeedback && (
        <p className="mt-2" role="status">{serverFeedback}</p>
      )}
      {status === 'saved' && feedback && (
        <p className="mt-2" role="status">{feedback}</p>
      )}
      {status === 'error' && (
        <div className="mt-4 grid gap-3" role="alert">
          <p>{PRACTICE_ERROR}</p>
          <button type="button" className="btn-secondary" onClick={() => { void submit(); }}>
            {hasOpaqueSubmission ? 'Retry evidence delivery' : 'Retry submission'}
          </button>
        </div>
      )}

      {status === 'saved' && (
        <button type="button" className="btn-secondary mt-4" onClick={() => {
          envelopeBodyRef.current = null;
          createKeyRef.current = null;
          submissionIdRef.current = null;
          setServerScore(null);
          setServerFeedback(null);
          setFeedback(null);
          setHasOpaqueSubmission(false);
          setStatus('idle');
          setAttemptKey(key => key + 1);
        }}>Start new attempt</button>
      )}
    </section>
  );
}
