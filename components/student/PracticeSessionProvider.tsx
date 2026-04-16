'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { SrsSession } from '@/lib/srs/contract';
import { STUDENT_DAILY_PRACTICE_COPY } from '@/lib/srs/contract';
import type { ResolvedQueueItem } from '@/convex/queue/queue';
import type { PracticeSubmissionEnvelope } from '@/lib/practice/contract';
import { submitActivity } from '@/lib/activities/submission';
import { PracticeCardRenderer } from './PracticeCardRenderer';
import { SubmissionFeedback } from './SubmissionFeedback';

interface PracticeSessionProviderProps {
  session: SrsSession;
  queue: ResolvedQueueItem[];
  studentId: string;
}

const FEEDBACK_DELAY_MS = 2000;

function isEnvelopeCorrect(envelope: PracticeSubmissionEnvelope): boolean {
  if (!envelope.parts || envelope.parts.length === 0) return true;
  return envelope.parts.every((part) => part.isCorrect === true);
}

export function PracticeSessionProvider({
  session: initialSession,
  queue,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  studentId,
}: PracticeSessionProviderProps) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedCount, setCompletedCount] = useState(initialSession.completedCards);
  const hasSubmittedRef = useRef(false);
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      });
    } catch (err) {
      console.error('Failed to complete session:', err);
    }
  }, []);

  const advanceCard = useCallback(() => {
    const nextIndex = currentCardIndex + 1;
    setCompletedCount((c) => c + 1);
    if (nextIndex >= queue.length) {
      void handleCompleteSession();
    }
    setCurrentCardIndex(nextIndex);
    setFeedback(null);
    setIsSubmitting(false);
    hasSubmittedRef.current = false;
  }, [currentCardIndex, queue.length, handleCompleteSession]);

  const handleSubmit = useCallback(
    async (envelope: PracticeSubmissionEnvelope) => {
      if (isSubmitting) return;
      setIsSubmitting(true);

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
    [isSubmitting, advanceCard],
  );

  if (queue.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <h1 className="text-2xl font-display font-bold text-foreground mb-4">
          Daily Practice
        </h1>
        <p className="text-muted-foreground">
          No practice due today. Come back tomorrow!
        </p>
      </div>
    );
  }

  const isComplete = currentCardIndex >= queue.length;

  if (isComplete) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <h1 className="text-2xl font-display font-bold text-foreground mb-4">
          Daily Practice
        </h1>
        <p className="text-muted-foreground">
          {STUDENT_DAILY_PRACTICE_COPY.allDone}
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Completed {completedCount} of {queue.length} cards.
        </p>
      </div>
    );
  }

  const currentCard = queue[currentCardIndex];

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
