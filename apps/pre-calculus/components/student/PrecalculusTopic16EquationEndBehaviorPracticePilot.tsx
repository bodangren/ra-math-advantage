'use client';
import { parseEvidenceResponse } from '@/lib/practice/submission-client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import { PolynomialEquationEndBehaviorActivity } from '@math-platform/activity-components';
import type { PolynomialEquationEndBehaviorProps } from '@math-platform/math-content/schemas';
import { polynomialEquationEndBehaviorSchema } from '@math-platform/math-content/schemas';
import { generateTopic16EquationEndBehaviorOutput } from '@math-platform/math-content/knowledge-space';

import {
  PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_INDEPENDENT_ACTIVITY_ID,
} from '@/lib/learning-evidence/precalc-pilot';

type PracticeMode = 'guided_practice' | 'independent_practice';
type PracticeStatus = 'idle' | 'saving' | 'saved' | 'error';

export type PrecalculusTopic16PolynomialEquationEndBehaviorKnowledgeState = {
  nodeId: string;
  title: string;
  status: 'not_started' | 'in_progress' | 'mastered' | 'decaying';
  readiness: 'ready' | 'blocked' | 'awaiting_teacher_exposure';
};

const CREATE_URL = '/api/activities/precalculus-topic-1-6-equation-end-behavior/submissions';
const EVIDENCE_URL = '/api/learning-evidence/precalculus-pilot';
const PRACTICE_ERROR = 'Unable to save the Topic 1.6 polynomial end-behavior practice.';
const SUCCESS_MESSAGE = 'Your practice was saved.';
const TEACHER_MESSAGE = 'Complete this skill with your teacher before using Mastery Advantage.';
const MASTERY_MESSAGE = 'Mastery Advantage updated your practice record.';
const GUIDED_STEPS = [
  'Identify the leading term for each polynomial.',
  'Use degree parity and the leading coefficient.',
  'Record whether each left and right end goes up or down.',
];
const FIELD_HELP = 'Choose Up or Down for the left and right end of each polynomial.';

function createIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `precalc-topic-1-6-equation-end-behavior-practice-${Date.now()}-${Math.random().toString(36).slice(2)}`;
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
  maxScore: 12;
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
    || value.score > 12
    || value.maxScore !== 12
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
    maxScore: 12;
    attemptOrdinal: number;
    feedback: string;
  };
}



const validateEvidenceResponse = (value: unknown) => parseEvidenceResponse(value, PRACTICE_ERROR);

export function PrecalculusTopic16EquationEndBehaviorPracticePilot({
  mode: requestedMode = 'guided_practice',
  knowledgeState,
}: {
  mode?: PracticeMode;
  knowledgeState?: PrecalculusTopic16PolynomialEquationEndBehaviorKnowledgeState;
}) {
  const mode = requestedMode;
  const seed = mode === 'guided_practice' ? 1 : 2;
  const activityId = mode === 'guided_practice'
    ? PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_GUIDED_ACTIVITY_ID
    : PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_INDEPENDENT_ACTIVITY_ID;
  const output = generateTopic16EquationEndBehaviorOutput(seed);
  const rendererProps = output.data.rendererProps as Record<string, unknown>;
  const sharedActivityProps: PolynomialEquationEndBehaviorProps = mode === 'guided_practice'
    ? polynomialEquationEndBehaviorSchema.parse({
        ...rendererProps,
        presentationMode: 'guided_practice',
        guidedSteps: GUIDED_STEPS,
        fieldHelp: FIELD_HELP,
      })
    : polynomialEquationEndBehaviorSchema.parse({
        ...rendererProps,
        presentationMode: 'independent_practice',
      });
  const [attemptKey, setAttemptKey] = useState(0);
  const router = useRouter();
  const [status, setStatus] = useState<PracticeStatus>('idle');
  const [serverResult, setServerResult] = useState<{
    score: number;
    maxScore: 12;
    feedback: string;
  } | null>(null);
  const envelopeBodyRef = useRef<string | null>(null);
  const createKeyRef = useRef<string | null>(null);
  const submissionIdRef = useRef<string | null>(null);
  const evidenceBodyRef = useRef<string | null>(null);
  const [hasOpaqueSubmission, setHasOpaqueSubmission] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const inFlightRef = useRef(false);

  async function deliverEvidence(submissionId: string) {
    const evidenceBody = evidenceBodyRef.current ??= JSON.stringify({ submissionId });
    const response = await fetch(EVIDENCE_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: evidenceBody,
    });
    if (!response.ok) throw new Error(PRACTICE_ERROR);
    const evidence = validateEvidenceResponse(await response.json().catch(() => null));
    const message = evidence.decision.reason === 'node_not_enabled'
      || evidence.decision.reason === 'awaiting_teacher_exposure'
      || evidence.decision.exposureState === 'awaiting_teacher_exposure'
      ? TEACHER_MESSAGE
      : evidence.masteryApplied
        ? MASTERY_MESSAGE
        : SUCCESS_MESSAGE;
    setFeedback(message);
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
        if (!isRecord(submittedEnvelope)) throw new Error(PRACTICE_ERROR);
        envelopeBodyRef.current = JSON.stringify(submittedEnvelope);
        createKeyRef.current ??= createIdempotencyKey();
      }

      const body = envelopeBodyRef.current;
      const idempotencyKey = createKeyRef.current;
      if (body === null || idempotencyKey === null || idempotencyKey.trim().length === 0) {
        throw new Error(PRACTICE_ERROR);
      }

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
        setServerResult({
          score: result.score,
          maxScore: result.maxScore,
          feedback: result.feedback,
        });
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
      <PolynomialEquationEndBehaviorActivity
        key={attemptKey}
        {...sharedActivityProps}
        activityId={activityId}
        mode={mode === 'guided_practice' ? 'guided' : 'practice'}
        onSubmit={submit}
      />
      {serverResult && (
        <>
          <p className="mt-4">{`Server score: ${serverResult.score}/${serverResult.maxScore}`}</p>
          <p className="mt-2" role="status">{serverResult.feedback}</p>
        </>
      )}
      {status === 'saved' && (
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
          evidenceBodyRef.current = null;
          setServerResult(null);
          setHasOpaqueSubmission(false);
          setFeedback(null);
          setStatus('idle');
          setAttemptKey(key => key + 1);
        }}>Start new attempt</button>
      )}
    </section>
  );
}
