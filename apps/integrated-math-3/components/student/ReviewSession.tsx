'use client';

import { BaseReviewSession } from './BaseReviewSession';
import type { GlossaryTerm } from '@/lib/study/types';

interface ReviewSessionProps {
  terms: GlossaryTerm[];
  onComplete: (results: {
    itemsSeen: number;
    itemsCorrect: number;
    itemsIncorrect: number;
    durationSeconds: number;
  }) => void;
}

export function ReviewSession({ terms, onComplete }: ReviewSessionProps) {
  const renderHeader = (currentIndex: number, total: number) => (
    <div
      className="flex items-center justify-between"
      data-testid="review-header"
    >
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">
          SRS Review
        </h1>
        <p className="text-sm text-muted-foreground">Review terms due today</p>
      </div>
      <span className="text-sm text-muted-foreground font-mono-num">
        {currentIndex} / {total}
      </span>
    </div>
  );

  return (
    <BaseReviewSession
      activityType="srs_review"
      terms={terms}
      renderHeader={renderHeader}
      noTermsTitle="All Caught Up!"
      noTermsMessage="You have no terms due for review today. Great job!"
      onComplete={onComplete}
    />
  );
}