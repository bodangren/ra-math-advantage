'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { STUDENT_DAILY_PRACTICE_COPY } from '@math-platform/srs-engine/contract';

interface CompletionScreenProps {
  completedCount: number;
  totalCount: number;
}

/**
 * Renders a completion message with checkmark and dashboard link after practice.
 *
 * @param {CompletionScreenProps} props - Completion screen configuration.
 * @returns {JSX.Element} A completion screen.
 */
export function CompletionScreen({ completedCount, totalCount }: CompletionScreenProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 text-center">
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        Session complete. Completed {completedCount} of {totalCount} cards.
      </div>
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="mb-6">
          <svg
            className="mx-auto h-16 w-16 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
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

        <h1
          ref={headingRef}
          tabIndex={-1}
          id="session-complete-heading"
          className="text-2xl font-display font-bold text-foreground mb-4 focus:outline-none"
        >
          Session complete
        </h1>

        <p className="text-lg text-foreground mb-2">
          {STUDENT_DAILY_PRACTICE_COPY.allDone}
        </p>

        <p className="text-sm text-muted-foreground mb-6">
          Completed {completedCount} of {totalCount} cards.
        </p>

        <Link
          href="/student/dashboard"
          className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          data-testid="dashboard-link"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
