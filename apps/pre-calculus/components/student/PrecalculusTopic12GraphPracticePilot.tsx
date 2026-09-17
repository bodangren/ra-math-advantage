'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import { GraphAverageRateChoiceActivity } from '@math-platform/activity-components';
import type { GraphAverageRateChoiceProps } from '@math-platform/math-content';
import { generateTopic12GraphAverageRateChoice } from '@math-platform/math-content/knowledge-space';

import {
  PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_INDEPENDENT_ACTIVITY_ID,
} from '@/lib/learning-evidence/precalc-pilot';

export type PrecalculusTopic12GraphPracticeMode = 'guided_practice' | 'independent_practice';

export type PrecalculusTopic12GraphKnowledgeState = {
  nodeId: string;
  title: string;
  status: 'not_started' | 'in_progress' | 'mastered' | 'decaying';
  readiness: 'ready' | 'blocked' | 'awaiting_teacher_exposure';
};

type EvidenceResponse = {
  masteryApplied?: boolean;
  decision?: {
    reason?: string;
    exposureState?: string;
  };
};

const GRAPH_PRACTICE_ERROR = 'Unable to save the Topic 1.2 graph practice.';

function createIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `precalc-topic-1-2-graph-practice-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

async function readJson(response: Response): Promise<Record<string, unknown>> {
  const value: unknown = await response.json().catch(() => null);
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(GRAPH_PRACTICE_ERROR);
  }
  return value as Record<string, unknown>;
}

export function PrecalculusTopic12GraphPracticePilot({
  mode: requestedMode,
  knowledgeState,
}: {
  mode?: PrecalculusTopic12GraphPracticeMode;
  knowledgeState?: PrecalculusTopic12GraphKnowledgeState;
}) {
  const mode = requestedMode ?? 'guided_practice';
  const seed = mode === 'guided_practice' ? 1 : 2;
  const activityId = mode === 'guided_practice'
    ? PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_GUIDED_ACTIVITY_ID
    : PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_INDEPENDENT_ACTIVITY_ID;
  const variant = generateTopic12GraphAverageRateChoice(seed);
  const [attemptKey, setAttemptKey] = useState(0);
  const router = useRouter();
  const [status, setStatus] = useState<'idle' | 'saving' | 'ready' | 'error'>('idle');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [serverFeedback, setServerFeedback] = useState<string | null>(null);
  const [serverScore, setServerScore] = useState<{ score: number; maxScore: number } | null>(null);
  const [hasOpaqueSubmission, setHasOpaqueSubmission] = useState(false);
  const envelopeRef = useRef<Record<string, unknown> | null>(null);
  const createKeyRef = useRef<string | null>(null);
  const submissionIdRef = useRef<string | null>(null);

  const sharedBaseProps = {
    prompt: variant.prompt,
    domain: [...variant.domain] as [number, number],
    range: [...variant.range] as [number, number],
    xLabel: variant.xLabel,
    yLabel: variant.yLabel,
    graphPoints: variant.graphPoints.map((point) => ({ ...point })),
    options: variant.options.map((option) => ({ ...option })),
  };
  const sharedActivityProps: GraphAverageRateChoiceProps = mode === 'guided_practice'
    ? {
        ...sharedBaseProps,
        presentationMode: 'guided_practice',
        guidedSteps: [
          'Calculate (change in output)/(change in input) for each interval.',
          'Compare the four average rates and select the greatest.',
        ],
        fieldHelp: 'Use the endpoint values for each option.',
      }
    : {
        ...sharedBaseProps,
        presentationMode: 'independent_practice',
      };

  async function deliverEvidence(submissionId: string) {
    const response = await fetch('/api/learning-evidence/precalculus-pilot', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ submissionId }),
    });
    const body = await readJson(response);
    if (!response.ok) throw new Error('Evidence delivery failed. Please retry.');

    const evidence = body as EvidenceResponse;
    const reason = evidence.decision?.reason;
    if (reason === 'awaiting_teacher_exposure' || evidence.decision?.exposureState === 'awaiting_teacher_exposure') {
      setFeedback('Complete this skill with your teacher before using Mastery Advantage.');
    } else if (evidence.masteryApplied === true) {
      setFeedback('Mastery Advantage updated your practice record.');
    } else {
      setFeedback('Your practice was saved.');
    }
    setStatus('ready');
    router.refresh();
  }

  async function submit(submittedEnvelope?: unknown) {
    if (status === 'saving') return;
    setStatus('saving');
    setFeedback(null);

    try {
      if (!envelopeRef.current) {
        if (!submittedEnvelope || typeof submittedEnvelope !== 'object' || Array.isArray(submittedEnvelope)) {
          throw new Error(GRAPH_PRACTICE_ERROR);
        }
        const envelope = submittedEnvelope as Record<string, unknown>;
        const parts = Array.isArray(envelope.parts)
          ? envelope.parts.map((part) => (
              part && typeof part === 'object' && !Array.isArray(part)
                ? {
                    partId: (part as Record<string, unknown>).partId,
                    rawAnswer: (part as Record<string, unknown>).rawAnswer,
                  }
                : part
            ))
          : envelope.parts;
        envelopeRef.current = { ...envelope, parts };
        createKeyRef.current ??= createIdempotencyKey();
      }

      let submissionId = submissionIdRef.current;
      if (!submissionId) {
        createKeyRef.current ??= createIdempotencyKey();
        const response = await fetch('/api/activities/precalculus-topic-1-2-graph/submissions', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'Idempotency-Key': createKeyRef.current,
          },
          body: JSON.stringify(envelopeRef.current),
        });
        const body = await readJson(response);
        if (
          !response.ok
          || typeof body.submissionId !== 'string'
          || body.submissionId.trim().length === 0
          || (body.score !== 0 && body.score !== 1)
          || body.maxScore !== 1
          || typeof body.attemptOrdinal !== 'number'
          || !Number.isInteger(body.attemptOrdinal)
          || body.attemptOrdinal < 1
          || typeof body.feedback !== 'string'
        ) {
          throw new Error(GRAPH_PRACTICE_ERROR);
        }
        submissionId = body.submissionId;
        submissionIdRef.current = submissionId;
        setHasOpaqueSubmission(true);
        setServerScore({ score: body.score, maxScore: body.maxScore });
        setServerFeedback(body.feedback);
      }

      await deliverEvidence(submissionId);
    } catch {
      setStatus('error');
      setFeedback(GRAPH_PRACTICE_ERROR);
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
      <GraphAverageRateChoiceActivity
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
