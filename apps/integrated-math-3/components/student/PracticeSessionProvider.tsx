'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { SrsSession } from '@math-platform/srs-engine/contract';
import { STUDENT_DAILY_PRACTICE_COPY } from '@math-platform/srs-engine/contract';
import type { ResolvedQueueItem } from '@/convex/queue/queue';
import type { PracticeSubmissionEnvelope } from '@math-platform/practice-core/contract';
import {
  submitActivity,
  submitIm3PilotActivity,
} from '@/lib/activities/submission';
import {
  IM3_GUIDED_PRACTICE_ACTIVITY_ID,
  IM3_MASTERY_ADVANTAGE_ACTIVITY_ID,
  IM3_PILOT_NODE,
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

interface SelectedRetry {
  envelope?: PracticeSubmissionEnvelope;
  submissionId?: string;
  score?: number;
  maxScore?: number;
  idempotencyKey: string;
}

function createIdempotencyKey(): string {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID();
  }
  return `im3-practice-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function isSelectedQuadraticCard(card: ResolvedQueueItem | undefined): boolean {
  if (!card) return false;
  const stableActivityId = card?.props.stableActivityId;
  return (
    (stableActivityId === IM3_GUIDED_PRACTICE_ACTIVITY_ID ||
      stableActivityId === IM3_MASTERY_ADVANTAGE_ACTIVITY_ID) &&
    card.props.masteryNodeId === IM3_PILOT_NODE &&
    card.componentKey === 'graphing-explorer' &&
    card.props.srsEligible === true
  );
}

function hasAuthoritativeGrade(result: {
  score?: number;
  maxScore?: number;
}): boolean {
  return (
    Number.isFinite(result.score) &&
    Number.isFinite(result.maxScore) &&
    (result.maxScore ?? 0) > 0 &&
    (result.score ?? -1) >= 0 &&
    (result.score ?? Number.POSITIVE_INFINITY) <= (result.maxScore ?? 0)
  );
}

/**
 * Checks whether all parts in a submission envelope are correct.
 *
 * @param {PracticeSubmissionEnvelope} envelope - Practice submission envelope to validate.
 * @returns {boolean} True if all parts are correct or no parts exist.
 */
function isEnvelopeCorrect(envelope: PracticeSubmissionEnvelope): boolean {
  if (!envelope.parts || envelope.parts.length === 0) return true;
  return envelope.parts.every((part) => part.isCorrect === true);
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
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRetry, setSelectedRetry] = useState<SelectedRetry | null>(
    null,
  );
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [completedCount, setCompletedCount] = useState(
    initialSession.completedCards,
  );
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
    try {
      await fetch('/api/practice/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: initialSession.sessionId }),
      });
    } catch (err) {
      console.error('Failed to complete session:', err);
    }
  }, [initialSession.sessionId]);

  const advanceCard = useCallback(() => {
    setCompletedCount((c) => c + 1);
    setCurrentCardIndex((prev) => {
      const nextIndex = prev + 1;
      if (nextIndex >= queue.length) {
        void handleCompleteSession();
      }
      return nextIndex;
    });
    setFeedback(null);
    setIsSubmitting(false);
    hasSubmittedRef.current = false;
  }, [queue.length, handleCompleteSession]);

  const handleSubmit = useCallback(
    async (envelope: PracticeSubmissionEnvelope, retryKey?: string) => {
      if (isSubmitting) return;
      if (
        isSelectedPilot &&
        (hasSubmittedRef.current || (selectedRetry && retryKey === undefined))
      )
        return;
      setIsSubmitting(true);

      if (isSelectedPilot) {
        const idempotencyKey = retryKey ?? createIdempotencyKey();
        hasSubmittedRef.current = true;
        setSubmissionError(null);
        try {
          const result = await submitIm3PilotActivity({
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
          });
          if (!result.success || !hasAuthoritativeGrade(result)) {
            setSubmissionError(
              ('error' in result && result.error) ||
                'The server did not return an authoritative grade. Please retry submission.',
            );
            setSelectedRetry(
              result.submissionId
                ? {
                    submissionId: result.submissionId,
                    score: result.score,
                    maxScore: result.maxScore,
                    idempotencyKey,
                  }
                : { envelope, idempotencyKey },
            );
            setIsSubmitting(false);
            hasSubmittedRef.current = false;
            return;
          }
          setFeedback(
            result.score === result.maxScore ? 'correct' : 'incorrect',
          );
          setSelectedRetry(null);
        } catch (error) {
          console.error('Submission failed:', error);
          setSubmissionError('Submission failed. Please retry submission.');
          setSelectedRetry({ envelope, idempotencyKey });
          setIsSubmitting(false);
          hasSubmittedRef.current = false;
          return;
        }

        feedbackTimeoutRef.current = setTimeout(() => {
          advanceCard();
        }, FEEDBACK_DELAY_MS);
        return;
      }

      const correct = isEnvelopeCorrect(envelope);
      setFeedback(correct ? 'correct' : 'incorrect');
      hasSubmittedRef.current = true;

      try {
        await submitActivity({
          activityId: envelope.activityId,
          mode: envelope.mode,
          answers: envelope.answers,
          attemptNumber: envelope.attemptNumber,
          status: envelope.status,
          parts: envelope.parts,
          artifact: envelope.artifact,
          interactionHistory: envelope.interactionHistory,
          analytics: envelope.analytics,
          studentFeedback: envelope.studentFeedback,
          teacherSummary: envelope.teacherSummary,
          timing: envelope.timing,
        });
      } catch (err) {
        console.error('Submission failed:', err);
      }

      feedbackTimeoutRef.current = setTimeout(() => {
        advanceCard();
      }, FEEDBACK_DELAY_MS);
    },
    [isSubmitting, isSelectedPilot, selectedRetry, advanceCard],
  );

  if (queue.length === 0) {
    return <EmptyPracticeState />;
  }

  const isComplete = currentCardIndex >= queue.length;

  if (isComplete) {
    return (
      <CompletionScreen
        completedCount={completedCount}
        totalCount={queue.length}
      />
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

        {submissionError && selectedRetry && (
          <div
            role="alert"
            className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-center text-destructive"
          >
            <p>{submissionError}</p>
            <button
              type="button"
              className="mt-3 rounded-lg bg-primary px-4 py-2 text-primary-foreground"
              disabled={isSubmitting}
              onClick={() => {
                if (selectedRetry.submissionId) {
                  setIsSubmitting(true);
                  setSubmissionError(null);
                  void submitIm3PilotActivity({
                    submissionId: selectedRetry.submissionId,
                    knownScore: selectedRetry.score,
                    knownMaxScore: selectedRetry.maxScore,
                    idempotencyKey: selectedRetry.idempotencyKey,
                  })
                    .then((result) => {
                      if (result.success && hasAuthoritativeGrade(result)) {
                        setFeedback(
                          result.score === result.maxScore
                            ? 'correct'
                            : 'incorrect',
                        );
                        setSelectedRetry(null);
                        feedbackTimeoutRef.current = setTimeout(
                          advanceCard,
                          FEEDBACK_DELAY_MS,
                        );
                      } else {
                        setSubmissionError(
                          ('error' in result && result.error) ||
                            'Submission failed. Please retry submission.',
                        );
                      }
                      setIsSubmitting(false);
                    })
                    .catch((error) => {
                      console.error('Submission failed:', error);
                      setSubmissionError(
                        'Submission failed. Please retry submission.',
                      );
                      setIsSubmitting(false);
                    });
                } else if (selectedRetry.envelope) {
                  void handleSubmit(
                    selectedRetry.envelope,
                    selectedRetry.idempotencyKey,
                  );
                }
              }}
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
              if (isSelectedPilot) return;
              // Ignore onComplete if it follows a submission; we advance via feedback flow.
              if (!hasSubmittedRef.current) {
                advanceCard();
              }
            }}
          />
        )}

        <div className="text-sm text-muted-foreground text-center">
          Card {currentCardIndex + 1} of {queue.length}
          {isSubmitting && <span className="ml-2">Saving...</span>}
        </div>
      </div>
    </div>
  );
}
