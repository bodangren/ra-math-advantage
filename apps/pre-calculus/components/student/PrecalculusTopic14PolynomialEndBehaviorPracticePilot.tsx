'use client';
import { parseEvidenceResponse } from '@/lib/practice/submission-client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import { PolynomialEndBehaviorActivity } from '@math-platform/activity-components';
import type { PolynomialEndBehaviorProps } from '@math-platform/math-content';
import { polynomialEndBehaviorSchema } from '@math-platform/math-content';
import { generateTopic14PolynomialEndBehaviorOutput } from '@math-platform/math-content/knowledge-space';

import {
  PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_INDEPENDENT_ACTIVITY_ID,
} from '@/lib/learning-evidence/precalc-pilot';

type PracticeStatus = 'idle' | 'saving' | 'ready' | 'error';

const PRACTICE_ERROR = 'Unable to save the Topic 1.4 polynomial end behavior practice.';
const CREATE_URL = '/api/activities/precalculus-topic-1-4-polynomial-end-behavior/submissions';
const EVIDENCE_URL = '/api/learning-evidence/precalculus-pilot';

export type PrecalculusTopic14PolynomialEndBehaviorPracticeMode =
  'guided_practice' | 'independent_practice';

export type PrecalculusTopic14PolynomialEndBehaviorKnowledgeState = {
  nodeId: string;
  title: string;
  status: 'not_started' | 'in_progress' | 'mastered' | 'decaying';
  readiness: 'ready' | 'blocked' | 'awaiting_teacher_exposure';
};

function createIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `precalc-topic-1-4-polynomial-end-behavior-practice-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasExactKeys(value: Record<string, unknown>, keys: string): boolean {
  return Object.keys(value).sort().join('|') === keys;
}

async function readJson(response: Response): Promise<Record<string, unknown>> {
  const value: unknown = await response.json().catch(() => null);
  if (!isRecord(value)) throw new Error(PRACTICE_ERROR);
  return value;
}

function validateCreateResult(value: unknown): {
  submissionId: string;
  score: number;
  maxScore: 2;
  attemptOrdinal: number;
  feedback: string;
} {
  if (
    !isRecord(value)
    || !hasExactKeys(value, 'attemptOrdinal|feedback|maxScore|score|submissionId')
    || typeof value.submissionId !== 'string'
    || value.submissionId.trim().length === 0
    || typeof value.score !== 'number'
    || !Number.isInteger(value.score)
    || value.score < 0
    || value.score > 2
    || value.maxScore !== 2
    || typeof value.attemptOrdinal !== 'number'
    || !Number.isInteger(value.attemptOrdinal)
    || value.attemptOrdinal < 1
    || typeof value.feedback !== 'string'
    || value.feedback.trim().length === 0
  ) {
    throw new Error(PRACTICE_ERROR);
  }
  return value as {
    submissionId: string;
    score: number;
    maxScore: 2;
    attemptOrdinal: number;
    feedback: string;
  };
}



const validateEvidenceResponse = (value: unknown) => parseEvidenceResponse(value, PRACTICE_ERROR);

export function PrecalculusTopic14PolynomialEndBehaviorPracticePilot({
  mode: requestedMode,
  knowledgeState,
}: {
  mode?: PrecalculusTopic14PolynomialEndBehaviorPracticeMode;
  knowledgeState?: PrecalculusTopic14PolynomialEndBehaviorKnowledgeState;
}) {
  const mode = requestedMode ?? 'guided_practice';
  const seed = mode === 'guided_practice' ? 1 : 2;
  const activityId = mode === 'guided_practice'
    ? PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_GUIDED_ACTIVITY_ID
    : PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_INDEPENDENT_ACTIVITY_ID;
  const rendererProps = polynomialEndBehaviorSchema.parse(
    generateTopic14PolynomialEndBehaviorOutput(seed).data.rendererProps,
  );
  const sharedActivityProps: PolynomialEndBehaviorProps = mode === 'guided_practice'
    ? {
        ...rendererProps,
        presentationMode: 'guided_practice',
        guidedSteps: [
          'Identify whether the degree is even or odd.',
          'Identify whether the leading coefficient is positive or negative.',
          'Use the degree parity and leading-coefficient sign to determine both ends.',
        ],
        fieldHelp: 'An even degree sends both ends in the same direction. An odd degree sends them in opposite directions. The leading coefficient determines the right end.',
      }
    : {
        ...rendererProps,
        presentationMode: 'independent_practice',
      };
  const [attemptKey, setAttemptKey] = useState(0);
  const router = useRouter();
  const [status, setStatus] = useState<PracticeStatus>('idle');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [serverFeedback, setServerFeedback] = useState<string | null>(null);
  const [serverScore, setServerScore] = useState<{ score: number; maxScore: 2 } | null>(null);
  const envelopeRef = useRef<Record<string, unknown> | null>(null);
  const createKeyRef = useRef<string | null>(null);
  const submissionIdRef = useRef<string | null>(null);
  const [hasOpaqueSubmission, setHasOpaqueSubmission] = useState(false);
  const inFlightRef = useRef(false);

  async function deliverEvidence(submissionId: string) {
    const response = await fetch(EVIDENCE_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ submissionId }),
    });
    const body = await readJson(response);
    if (!response.ok) throw new Error(PRACTICE_ERROR);
    const evidence = validateEvidenceResponse(body);
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
    setStatus('ready');
    router.refresh();
  }

  async function submit(submittedEnvelope?: unknown) {
    if (status === 'saving' || inFlightRef.current) return;
    inFlightRef.current = true;
    setStatus('saving');
    setFeedback(null);
    try {
      if (!envelopeRef.current) {
        if (!isRecord(submittedEnvelope) || !Array.isArray(submittedEnvelope.parts)) {
          throw new Error(PRACTICE_ERROR);
        }
        const parts = submittedEnvelope.parts.map((part) => {
          if (!isRecord(part)) throw new Error(PRACTICE_ERROR);
          return { partId: part.partId, rawAnswer: part.rawAnswer };
        });
        envelopeRef.current = Object.freeze({
          ...submittedEnvelope,
          parts: Object.freeze(parts),
        });
        createKeyRef.current ??= createIdempotencyKey();
      }

      let submissionId = submissionIdRef.current;
      if (!submissionId) {
        const response = await fetch(CREATE_URL, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'Idempotency-Key': createKeyRef.current ?? createIdempotencyKey(),
          },
          body: JSON.stringify(envelopeRef.current),
        });
        const body = await readJson(response);
        if (!response.ok) throw new Error(PRACTICE_ERROR);
        const result = validateCreateResult(body);
        submissionId = result.submissionId;
        submissionIdRef.current = submissionId;
        setHasOpaqueSubmission(true);
        setServerScore({ score: result.score, maxScore: 2 });
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
      <PolynomialEndBehaviorActivity
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
      {status === 'ready' && feedback && (
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

      {status === 'ready' && (
        <button type="button" className="btn-secondary mt-4" onClick={() => {
          envelopeRef.current = null;
          createKeyRef.current = null;
          submissionIdRef.current = null;
          setFeedback(null);
          setServerFeedback(null);
          setServerScore(null);
          setHasOpaqueSubmission(false);
          setStatus('idle');
          setAttemptKey(key => key + 1);
        }}>Start new attempt</button>
      )}
    </section>
  );
}
