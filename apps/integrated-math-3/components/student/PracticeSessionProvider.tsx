'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { SrsSession } from '@math-platform/srs-engine/contract';
import { STUDENT_DAILY_PRACTICE_COPY } from '@math-platform/srs-engine/contract';
import type { ResolvedQueueItem } from '@/convex/queue/queue';
import type { PracticeSubmissionEnvelope } from '@math-platform/practice-core/contract';
import {
  submitActivity,
  submitIm3PilotActivity,
  type SubmitActivityInput,
} from '@/lib/activities/submission';
import {
  IM3_DOMAIN_RANGE_GUIDED_ACTIVITY_ID,
  IM3_DOMAIN_RANGE_GUIDED_SEED_2_ACTIVITY_ID,
  IM3_DOMAIN_RANGE_INDEPENDENT_ACTIVITY_ID,
  IM3_DOMAIN_RANGE_INDEPENDENT_SEED_2_ACTIVITY_ID,
  IM3_DOMAIN_RANGE_NODE,
  IM3_EQUATION_RATE_GUIDED_ACTIVITY_ID,
  IM3_EQUATION_RATE_INDEPENDENT_ACTIVITY_ID,
  IM3_EQUATION_RATE_NODE,
  IM3_GUIDED_PRACTICE_ACTIVITY_ID,
  IM3_GRAPH_GUIDED_SEED_2_ACTIVITY_ID,
  IM3_GRAPH_INDEPENDENT_SEED_2_ACTIVITY_ID,
  IM3_MASTERY_ADVANTAGE_ACTIVITY_ID,
  IM3_PILOT_NODE,
  IM3_PROFIT_MAXIMUM_GUIDED_ACTIVITY_ID,
  IM3_PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
  IM3_PROFIT_MAXIMUM_NODE,
  IM3_PROFIT_MODEL_GUIDED_ACTIVITY_ID,
  IM3_PROFIT_MODEL_INDEPENDENT_ACTIVITY_ID,
  IM3_PROFIT_MODEL_NODE,
  IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID,
  IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID,
  IM3_MAXIMUM_READING_NODE,
  IM3_ONE_REAL_SOLUTION_GUIDED_ACTIVITY_ID,
  IM3_ONE_REAL_SOLUTION_INDEPENDENT_ACTIVITY_ID,
  IM3_ONE_REAL_SOLUTION_NODE,
  IM3_TWO_REAL_SOLUTIONS_GUIDED_ACTIVITY_ID,
  IM3_TWO_REAL_SOLUTIONS_INDEPENDENT_ACTIVITY_ID,
  IM3_TWO_REAL_SOLUTIONS_NODE,
  IM3_COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID,
  IM3_COMPARE_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
  IM3_COMPARE_MAXIMUM_NODE,
  IM3_SYMMETRY_GUIDED_ACTIVITY_ID,
  IM3_SYMMETRY_INDEPENDENT_ACTIVITY_ID,
  IM3_SYMMETRY_NODE,
} from '@/lib/practice/learning-evidence-pilot';
import { PracticeCardRenderer } from './PracticeCardRenderer';
import { SubmissionFeedback } from './SubmissionFeedback';
import { CompletionScreen } from './CompletionScreen';
import { EmptyPracticeState } from './EmptyPracticeState';

interface PracticeSessionProviderProps {
  session: SrsSession;
  queue: ResolvedQueueItem[];
  studentId: string;
}

const FEEDBACK_DELAY_MS = 2000;

interface RetrySubmission {
  submissionId?: string;
  envelope?: PracticeSubmissionEnvelope;
  score?: number;
  maxScore?: number;
  idempotencyKey: string;
}

type SubmissionAttempt =
  | { envelope: PracticeSubmissionEnvelope; retry?: never }
  | { envelope?: never; retry: RetrySubmission };

function createIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `im3-practice-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function hasAuthoritativeGrade(result: { score?: number; maxScore?: number }): boolean {
  return Number.isFinite(result.score)
    && Number.isFinite(result.maxScore)
    && (result.maxScore ?? 0) > 0
    && (result.score ?? -1) >= 0
    && (result.score ?? Number.POSITIVE_INFINITY) <= (result.maxScore ?? 0);
}

function isSelectedQuadraticCard(card: ResolvedQueueItem | undefined): boolean {
  if (!card) return false;
  return (card.props.stableActivityId === IM3_GUIDED_PRACTICE_ACTIVITY_ID
      || card.props.stableActivityId === IM3_MASTERY_ADVANTAGE_ACTIVITY_ID)
    && card.props.masteryNodeId === IM3_PILOT_NODE
    && card.componentKey === 'graphing-explorer'
    && card.props.srsEligible === true;
}

/**
 * Manages the daily practice session lifecycle with queue advancement and feedback.
 *
 * @param {PracticeSessionProviderProps} props - Practice session provider configuration.
 * @returns {JSX.Element} A practice session with card navigation and submission.
 */
export function PracticeSessionProvider({
  session: initialSession,
  queue,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  studentId,
}: PracticeSessionProviderProps) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [retrySubmission, setRetrySubmission] = useState<RetrySubmission | null>(null);
  const [submissionKey, setSubmissionKey] = useState<string | null>(null);
  const [completionState, setCompletionState] = useState<'idle' | 'saving' | 'failed' | 'saved'>('idle');
  const [completedCount, setCompletedCount] = useState(initialSession.completedCards);
  const hasSubmittedRef = useRef(false);
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentCard = queue[currentCardIndex];
  const isSelectedPilot = isSelectedQuadraticCard(currentCard);

  useEffect(() => {
    return () => {
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
      }
    };
  }, []);

  const handleCompleteSession = useCallback(async () => {
    setCompletionState('saving');
    try {
      const response = await fetch('/api/practice/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: initialSession.sessionId }),
      });
      if (!response.ok) throw new Error('Completion save failed');
      setCompletionState('saved');
    } catch (err) {
      console.error('Failed to complete session:', err);
      setCompletionState('failed');
    }
  }, [initialSession.sessionId]);

  const advanceCard = useCallback(() => {
    setCompletedCount((c) => c + 1);
    const nextIndex = currentCardIndex + 1;
    setCurrentCardIndex(nextIndex);
    if (nextIndex >= queue.length) void handleCompleteSession();
    setFeedback(null);
    setSubmissionError(null);
    setRetrySubmission(null);
    setSubmissionKey(null);
    setIsSubmitting(false);
    hasSubmittedRef.current = false;
  }, [currentCardIndex, queue.length, handleCompleteSession]);

  const submitAttempt = useCallback(
    async (attempt: SubmissionAttempt) => {
      if (isSubmitting || (hasSubmittedRef.current && !attempt.retry)) return;
      setIsSubmitting(true);
      setSubmissionError(null);

      hasSubmittedRef.current = true;
      const retry = attempt.retry;
      const envelope = attempt.envelope ?? retry?.envelope;
      const idempotencyKey = retry?.idempotencyKey
        ?? submissionKey
        ?? createIdempotencyKey();
      setSubmissionKey(idempotencyKey);
      const isServerOwnedPilot = (
        (
          currentCard?.props.stableActivityId === IM3_MASTERY_ADVANTAGE_ACTIVITY_ID
          || currentCard?.props.stableActivityId === IM3_GUIDED_PRACTICE_ACTIVITY_ID
          || currentCard?.props.stableActivityId === IM3_GRAPH_GUIDED_SEED_2_ACTIVITY_ID
          || currentCard?.props.stableActivityId === IM3_GRAPH_INDEPENDENT_SEED_2_ACTIVITY_ID
        )
          && currentCard.props.masteryNodeId === IM3_PILOT_NODE
          && currentCard.componentKey === 'graphing-explorer'
        || (
          currentCard?.props.stableActivityId === IM3_EQUATION_RATE_GUIDED_ACTIVITY_ID
          || currentCard?.props.stableActivityId === IM3_EQUATION_RATE_INDEPENDENT_ACTIVITY_ID
        )
          && currentCard.props.masteryNodeId === IM3_EQUATION_RATE_NODE
          && currentCard.componentKey === 'rate-of-change-calculator'
        || (
          currentCard?.props.stableActivityId === IM3_DOMAIN_RANGE_GUIDED_ACTIVITY_ID
          || currentCard?.props.stableActivityId === IM3_DOMAIN_RANGE_GUIDED_SEED_2_ACTIVITY_ID
          || currentCard?.props.stableActivityId === IM3_DOMAIN_RANGE_INDEPENDENT_ACTIVITY_ID
          || currentCard?.props.stableActivityId === IM3_DOMAIN_RANGE_INDEPENDENT_SEED_2_ACTIVITY_ID
        )
          && currentCard.props.masteryNodeId === IM3_DOMAIN_RANGE_NODE
          && currentCard.componentKey === 'graphing-explorer'
        || (
          currentCard?.props.stableActivityId === IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID
          || currentCard?.props.stableActivityId === IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID
        )
          && currentCard.props.masteryNodeId === IM3_MAXIMUM_READING_NODE
          && currentCard.componentKey === 'graphing-explorer'
        || (
          currentCard?.props.stableActivityId === IM3_ONE_REAL_SOLUTION_GUIDED_ACTIVITY_ID
          && currentCard.props.masteryNodeId === IM3_ONE_REAL_SOLUTION_NODE
          && currentCard.componentKey === 'graphing-explorer'
        )
        || (
          currentCard?.props.stableActivityId === IM3_ONE_REAL_SOLUTION_INDEPENDENT_ACTIVITY_ID
          && currentCard.props.masteryNodeId === IM3_ONE_REAL_SOLUTION_NODE
          && currentCard.componentKey === 'graphing-explorer'
        )
        || (
          (
            currentCard?.props.stableActivityId === IM3_TWO_REAL_SOLUTIONS_GUIDED_ACTIVITY_ID
            || currentCard?.props.stableActivityId === IM3_TWO_REAL_SOLUTIONS_INDEPENDENT_ACTIVITY_ID
          )
          && currentCard.props.masteryNodeId === IM3_TWO_REAL_SOLUTIONS_NODE
          && currentCard.componentKey === 'graphing-explorer'
        )
        || (
          currentCard?.props.stableActivityId === IM3_SYMMETRY_GUIDED_ACTIVITY_ID
          || currentCard?.props.stableActivityId === IM3_SYMMETRY_INDEPENDENT_ACTIVITY_ID
        )
          && currentCard.props.masteryNodeId === IM3_SYMMETRY_NODE
          && currentCard.componentKey === 'graphing-explorer'
        || (
          (
            currentCard?.props.stableActivityId === IM3_COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID
            || currentCard?.props.stableActivityId === IM3_COMPARE_MAXIMUM_INDEPENDENT_ACTIVITY_ID
          )
          && currentCard.props.masteryNodeId === IM3_COMPARE_MAXIMUM_NODE
          && currentCard.componentKey === 'graphing-explorer'
        )
        || (
          (
            currentCard?.props.stableActivityId === IM3_PROFIT_MODEL_GUIDED_ACTIVITY_ID
            || currentCard?.props.stableActivityId === IM3_PROFIT_MODEL_INDEPENDENT_ACTIVITY_ID
          )
          && currentCard.props.masteryNodeId === IM3_PROFIT_MODEL_NODE
          && currentCard.componentKey === 'fill-in-the-blank'
        )
        || (
          (
            currentCard?.props.stableActivityId === IM3_PROFIT_MAXIMUM_GUIDED_ACTIVITY_ID
            || currentCard?.props.stableActivityId === IM3_PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY_ID
          )
          && currentCard.props.masteryNodeId === IM3_PROFIT_MAXIMUM_NODE
          && currentCard.componentKey === 'fill-in-the-blank'
        )
      )
        && currentCard.props.srsEligible === true;

      if (isServerOwnedPilot && !retry && retrySubmission) {
        setIsSubmitting(false);
        return;
      }

      try {
        let input: SubmitActivityInput;
        if (retry?.submissionId) {
          input = {
            submissionId: retry.submissionId,
            knownScore: retry.score,
            knownMaxScore: retry.maxScore,
            idempotencyKey,
          } as SubmitActivityInput;
        } else {
          if (!envelope) {
            setIsSubmitting(false);
            hasSubmittedRef.current = false;
            return;
          }
          input = {
            activityId: envelope.activityId,
            mode: envelope.mode,
            answers: envelope.answers,
            attemptNumber: envelope.attemptNumber,
            submittedAt: envelope.submittedAt,
            status: envelope.status,
            parts: envelope.parts,
            artifact: envelope.artifact,
            interactionHistory: envelope.interactionHistory,
            analytics: envelope.analytics,
            studentFeedback: envelope.studentFeedback,
            teacherSummary: envelope.teacherSummary,
            timing: envelope.timing,
            idempotencyKey,
          };
        }
        const result = await (isServerOwnedPilot ? submitIm3PilotActivity : submitActivity)(input);

        if (!result.success) {
          setFeedback(null);
          setSubmissionError(result.error || 'Submission failed. Please retry submission.');
          setRetrySubmission(result.submissionId
            ? {
                submissionId: result.submissionId,
                score: result.score ?? retry?.score,
                maxScore: result.maxScore ?? retry?.maxScore,
                idempotencyKey,
              }
            : envelope && (result.idempotencyKey ?? idempotencyKey)
              ? {
                  envelope,
                  idempotencyKey: result.idempotencyKey ?? idempotencyKey,
                }
              : null);
          setIsSubmitting(false);
          return;
        }

        const hasServerGrade = hasAuthoritativeGrade(result);
        if (hasServerGrade) {
          setFeedback(result.score === result.maxScore ? 'correct' : 'incorrect');
        } else if (!isServerOwnedPilot) {
          // Legacy activities do not all have server rubrics yet. Preserve
          // their existing feedback until their server-owned grader exists.
          const clientIsCorrect = envelope?.parts.length === 0
            || envelope?.parts.every((part) => part.isCorrect === true)
            || false;
          setFeedback(clientIsCorrect ? 'correct' : 'incorrect');
        } else {
          // The exact pilot must have a server grade. Do not use client parts
          // when the authoritative grade is missing.
          setFeedback(null);
          setSubmissionError('The server did not return an authoritative grade. Please retry submission.');
          setRetrySubmission(result.submissionId
            ? {
                submissionId: result.submissionId,
                score: result.score,
                maxScore: result.maxScore,
                idempotencyKey,
              }
            : envelope && (result.idempotencyKey ?? idempotencyKey)
              ? {
                  envelope,
                  idempotencyKey: result.idempotencyKey ?? idempotencyKey,
                }
              : null);
          setIsSubmitting(false);
          return;
        }
        setSubmissionError(null);
        setRetrySubmission(null);
      } catch (err) {
        console.error('Submission failed:', err);
        setFeedback(null);
        setSubmissionError('Submission failed. Please retry submission.');
        setRetrySubmission(
          retry
          ?? (envelope
            ? { envelope, idempotencyKey }
            : null),
        );
        setIsSubmitting(false);
        return;
      }

      feedbackTimeoutRef.current = setTimeout(() => {
        advanceCard();
      }, FEEDBACK_DELAY_MS);
    },
    [isSubmitting, advanceCard, currentCard, submissionKey, retrySubmission],
  );

  const handleSubmit = useCallback(
    async (envelope: PracticeSubmissionEnvelope) => {
      await submitAttempt({ envelope });
    },
    [submitAttempt],
  );

  const handleRetry = useCallback(() => {
    if (!retrySubmission) return;
    void submitAttempt({ retry: retrySubmission });
  }, [retrySubmission, submitAttempt]);

  if (queue.length === 0) {
    return <EmptyPracticeState />;
  }

  const isComplete = currentCardIndex >= queue.length;

  if (isComplete && completionState !== 'saved') {
    return completionState === 'failed'
      ? <div role="alert">The session was not saved. <button type="button" onClick={() => void handleCompleteSession()}>Retry save</button></div>
      : <p role="status">Saving session...</p>;
  }
  if (isComplete) {
    return (
      <CompletionScreen completedCount={completedCount} totalCount={queue.length} />
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-display font-bold text-foreground">
            Daily Practice
          </h1>
          <span
            className="text-sm text-muted-foreground font-mono-num"
            data-testid="card-counter"
          >
            {currentCardIndex + 1} / {queue.length}
          </span>
        </div>

        <p className="text-sm text-muted-foreground">
          {STUDENT_DAILY_PRACTICE_COPY.queueSummary(queue.length)}
        </p>

        {submissionError && (
          <div
            className="rounded-xl border border-destructive/30 bg-destructive/10 p-6 text-center text-destructive"
            role="alert"
            aria-live="assertive"
          >
            <p className="font-medium">{submissionError}</p>
            <p className="mt-2 text-sm">
              Your answers are saved on the server. Retry submission to finish this card.
            </p>
            <button
              type="button"
              className="mt-4 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={handleRetry}
              disabled={isSubmitting || retrySubmission === null}
            >
              Retry submission
            </button>
          </div>
        )}

        {feedback ? (
          <SubmissionFeedback isCorrect={feedback === 'correct'} />
        ) : (
          <PracticeCardRenderer
            queueItem={currentCard}
            currentIndex={currentCardIndex}
            totalCount={queue.length}
            onSubmit={handleSubmit}
            onComplete={() => {
              // Ignore onComplete if it follows a submission; we advance via feedback flow.
              if (!isSelectedPilot && !hasSubmittedRef.current) {
                advanceCard();
              }
            }}
          />
        )}

        <div className="text-sm text-muted-foreground text-center">
          Card {currentCardIndex + 1} of {queue.length}
          {isSubmitting && <span className="ml-2">Saving…</span>}
        </div>
      </div>
    </div>
  );
}
