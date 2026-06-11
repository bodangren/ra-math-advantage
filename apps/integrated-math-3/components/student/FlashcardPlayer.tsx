'use client';

import { BaseReviewSession } from '@math-platform/study-hub-core';
import type { GlossaryTerm } from '@/lib/study/types';

interface FlashcardPlayerProps {
  terms: GlossaryTerm[];
  onComplete: (results: {
    itemsSeen: number;
    itemsCorrect: number;
    itemsIncorrect: number;
    durationSeconds: number;
  }) => void;
}

/**
 * Renders a flashcard review experience with term progress tracking.
 *
 * @param props - Flashcard player configuration.
 * @returns A flashcard review session.
 */
export function FlashcardPlayer({ terms, onComplete }: FlashcardPlayerProps) {
  const renderHeader = (currentIndex: number, total: number) => (
    <div
      className="flex items-center justify-between"
      data-testid="flashcard-header"
    >
      <h1 className="text-2xl font-display font-bold text-foreground">
        Flashcards
      </h1>
      <span className="text-sm text-muted-foreground font-mono-num">
        Term {currentIndex} of {total}
      </span>
    </div>
  );

  return (
    <BaseReviewSession
      terms={terms}
      renderHeader={renderHeader}
      noTermsTitle="No Flashcards"
      noTermsMessage="There are no flashcards available for this selection."
      onComplete={onComplete}
    />
  );
}