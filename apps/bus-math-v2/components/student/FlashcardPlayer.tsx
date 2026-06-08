"use client";

import { BaseReviewSession } from "./BaseReviewSession";


/**
 * Renders a flashcard review session using the BaseReviewSession component
 * with flashcard-specific headers and messaging.
 *
 * @returns A flashcard player page.
 */
export function FlashcardPlayer() {
  return (
    <BaseReviewSession
      activityType="flashcards"
      renderHeader={(currentIndex, totalTerms) => (
        <header className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Term {currentIndex + 1} of {totalTerms}
          </div>
        </header>
      )}
      noTermsTitle="No Terms Due"
      noTermsMessage="You're all caught up! Check back later for more terms to review."
    />
  );
}
