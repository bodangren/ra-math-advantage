'use client';

import { useState, useCallback } from 'react';
import type { StudyTerm, StudySessionRating, StudySessionResult, StudySessionState } from './types';
import { RATING_DELTAS } from './types';

interface BaseReviewSessionProps<T extends StudyTerm> {
  terms: T[];
  renderHeader: (currentIndex: number, total: number) => React.ReactNode;
  noTermsTitle: string;
  noTermsMessage: string;
  onComplete: (results: StudySessionResult) => void;
}

/**
 * Render a generic flashcard-style review session with flip and rate interactions.
 * @param props - Terms, header renderer, empty-state messages, and onComplete callback
 */
export function BaseReviewSession<T extends StudyTerm>({
  terms,
  renderHeader,
  noTermsTitle,
  noTermsMessage,
  onComplete,
}: BaseReviewSessionProps<T>) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [state, setState] = useState<StudySessionState>('prompt');
  const [itemsSeen, setItemsSeen] = useState(0);
  const [itemsCorrect, setItemsCorrect] = useState(0);
  const [itemsIncorrect, setItemsIncorrect] = useState(0);
  const [startTime] = useState(() => Date.now());

  const handleFlip = useCallback(() => {
    setState('flip');
  }, []);

  const handleRate = useCallback(
    (rating: StudySessionRating) => {
      const { isCorrect } = RATING_DELTAS[rating];

      const newSeen = itemsSeen + 1;
      const newCorrect = itemsCorrect + (isCorrect ? 1 : 0);
      const newIncorrect = itemsIncorrect + (isCorrect ? 0 : 1);

      setItemsSeen(newSeen);
      setItemsCorrect(newCorrect);
      setItemsIncorrect(newIncorrect);

      const nextIndex = currentIndex + 1;
      if (nextIndex >= terms.length) {
        const durationSeconds = Math.round((Date.now() - startTime) / 1000);
        onComplete({
          itemsSeen: newSeen,
          itemsCorrect: newCorrect,
          itemsIncorrect: newIncorrect,
          durationSeconds,
        });
        setState('complete');
      } else {
        setCurrentIndex((prev) => prev + 1);
        setState('prompt');
      }
    },
    [currentIndex, terms.length, itemsSeen, itemsCorrect, itemsIncorrect, startTime, onComplete]
  );

  if (terms.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <div className="rounded-xl border border-border bg-card p-8">
          <h1 className="text-2xl font-display font-bold text-foreground mb-4">
            {noTermsTitle}
          </h1>
          <p className="text-muted-foreground">{noTermsMessage}</p>
        </div>
      </div>
    );
  }

  if (state === 'complete') {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <div className="rounded-xl border border-border bg-card p-8">
          <div className="mb-6">
            <svg
              className="mx-auto h-16 w-16 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              data-testid="completion-check"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground mb-4">
            Review Complete
          </h1>
          <p className="text-muted-foreground mb-2">
            You reviewed {itemsSeen} term{itemsSeen !== 1 ? 's' : ''}.
          </p>
          <p className="text-sm text-muted-foreground">
            {itemsCorrect} correct, {itemsIncorrect} needs more practice
          </p>
        </div>
      </div>
    );
  }

  const currentTerm = terms[currentIndex];

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      {renderHeader(currentIndex + 1, terms.length)}

      <div className="mt-8">
        {state === 'prompt' ? (
          <button
            onClick={handleFlip}
            className="w-full min-h-[200px] rounded-xl border-2 border-border bg-card p-8 text-center hover:border-primary/40 transition-colors cursor-pointer"
            data-testid="term-prompt"
          >
            <p className="text-lg font-semibold text-foreground">{currentTerm.term}</p>
            <p className="text-xs text-muted-foreground mt-2 font-mono">
              {currentTerm.slug}
            </p>
            <p className="text-sm text-muted-foreground mt-6">Click to reveal definition</p>
          </button>
        ) : (
          <div className="space-y-6">
            <div className="rounded-xl border-2 border-primary/40 bg-card p-8 text-center">
              <p className="text-lg font-semibold text-foreground mb-2">{currentTerm.term}</p>
              <p className="text-sm text-muted-foreground font-mono mb-2">
                {currentTerm.slug}
              </p>
              <p className="text-foreground mt-4">{currentTerm.definition}</p>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {(Object.keys(RATING_DELTAS) as StudySessionRating[]).map((rating) => (
                <button
                  key={rating}
                  onClick={() => handleRate(rating)}
                  className="rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors capitalize"
                  data-testid={`rate-${rating}`}
                >
                  {rating}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-center gap-2">
        {terms.map((_, i) => (
          <div
            key={i}
            className={`h-2 w-2 rounded-full ${
              i === currentIndex ? 'bg-primary' : 'bg-muted'
            }`}
          />
        ))}
      </div>
    </div>
  );
}