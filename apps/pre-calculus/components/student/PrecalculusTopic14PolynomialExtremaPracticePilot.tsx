'use client';
import { parseEvidenceResponse } from '@/lib/practice/submission-client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import { PolynomialExtremaFromGraphActivity } from '@math-platform/activity-components';
import type { PolynomialExtremaFromGraphProps } from '@math-platform/math-content';
import { polynomialExtremaFromGraphSchema } from '@math-platform/math-content';
import { generateTopic14PolynomialExtremaFromGraphOutput } from '@math-platform/math-content/knowledge-space';

import {
  PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_INDEPENDENT_ACTIVITY_ID,
} from '@/lib/learning-evidence/precalc-pilot';

type PracticeStatus = 'idle' | 'saving' | 'ready' | 'error';

const PRACTICE_ERROR = 'Unable to save the Topic 1.4 polynomial extrema practice.';
const CREATE_URL = '/api/activities/precalculus-topic-1-4-polynomial-extrema/submissions';
const EVIDENCE_URL = '/api/learning-evidence/precalculus-pilot';

export type PrecalculusTopic14PolynomialExtremaPracticeMode =
  'guided_practice' | 'independent_practice';

export type PrecalculusTopic14PolynomialExtremaKnowledgeState = {
  nodeId: string;
  title: string;
  status: 'not_started' | 'in_progress' | 'mastered' | 'decaying';
  readiness: 'ready' | 'blocked' | 'awaiting_teacher_exposure';
};



function createIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `precalc-topic-1-4-polynomial-extrema-practice-${Date.now()}-${Math.random().toString(36).slice(2)}`;
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
    || !Number.isInteger(value.score)
    || value.score < 0
    || value.score > 3
    || value.maxScore !== 3
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
    maxScore: 3;
    attemptOrdinal: number;
    feedback: string;
  };
}

const validateEvidenceResponse = (value: unknown) => parseEvidenceResponse(value, PRACTICE_ERROR);

export function PrecalculusTopic14PolynomialExtremaPracticePilot({
  mode: requestedMode,
  knowledgeState,
}: {
  mode?: PrecalculusTopic14PolynomialExtremaPracticeMode;
  knowledgeState?: PrecalculusTopic14PolynomialExtremaKnowledgeState;
}) {
  const mode = requestedMode ?? 'guided_practice';
  const seed = mode === 'guided_practice' ? 1 : 2;
  const activityId = mode === 'guided_practice'
    ? PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_GUIDED_ACTIVITY_ID
    : PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_INDEPENDENT_ACTIVITY_ID;
  const rendererProps = polynomialExtremaFromGraphSchema.parse(
    generateTopic14PolynomialExtremaFromGraphOutput(seed).data.rendererProps,
  );
  const sharedActivityProps: PolynomialExtremaFromGraphProps = mode === 'guided_practice'
    ? {
        ...rendererProps,
        presentationMode: 'guided_practice',
        guidedSteps: [
          'Find where the graph changes from decreasing to increasing.',
          'Find where the graph changes from increasing to decreasing.',
          'Compare the displayed y-values to identify the absolute minimum.',
        ],
        fieldHelp: 'A relative extremum occurs where the graph changes direction. The absolute minimum is the lowest displayed value.',
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
  const [serverScore, setServerScore] = useState<{ score: number; maxScore: 3 } | null>(null);
  const [hasOpaqueSubmission, setHasOpaqueSubmission] = useState(false);
  const envelopeRef = useRef<Record<string, unknown> | null>(null);
  const createKeyRef = useRef<string | null>(null);
  const submissionIdRef = useRef<string | null>(null);
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
        envelopeRef.current = { ...submittedEnvelope, parts };
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
        setServerScore({ score: result.score, maxScore: 3 });
        setServerFeedback(result.feedback);
      }

      await deliverEvidence(submissionId);
    } catch {
      setStatus('error');
      setFeedback(PRACTICE_ERROR);
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
      <PolynomialExtremaFromGraphActivity
        key={attemptKey}
        {...sharedActivityProps}
        activityId={activityId}
        mode={mode === 'guided_practice' ? 'guided' : 'practice'}
        onSubmit={submit}
      />
      {serverScore && (
        <p className="mt-4">{`Server score: ${serverScore.score}/${serverScore.maxScore}`}</p>
      )}
      {status !== 'error' && (serverFeedback || feedback) && (
        <p className="mt-2" role="status">
          {[serverFeedback, feedback].filter((message): message is string => Boolean(message)).join(' ')}
        </p>
      )}
      {status === 'error' && feedback && (
        <div className="mt-4 grid gap-3" role="alert">
          <p>{feedback}</p>
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
