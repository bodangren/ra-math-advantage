"use client";

import { BaseReviewSession } from "./BaseReviewSession";


/**
 * Renders an SRS review session using the BaseReviewSession component
 * with review-specific headers and messaging.
 *
 * @returns An SRS review session page.
 */
export function ReviewSession() {
  return (
    <BaseReviewSession
      activityType="srs_review"
      renderHeader={(currentIndex, totalTerms) => (
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">SRS Review</h1>
            <p className="text-sm text-muted-foreground">Review terms due today</p>
          </div>
          <div className="text-sm text-muted-foreground">
            Term {currentIndex + 1} of {totalTerms}
          </div>
        </header>
      )}
      noTermsTitle="All caught up!"
      noTermsMessage="No terms are due for review right now. Check back later!"
    />
  );
}
