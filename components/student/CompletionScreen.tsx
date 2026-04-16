'use client';

import Link from 'next/link';
import { STUDENT_DAILY_PRACTICE_COPY } from '@/lib/srs/contract';

interface CompletionScreenProps {
  completedCount: number;
  totalCount: number;
}

export function CompletionScreen({ completedCount, totalCount }: CompletionScreenProps) {
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
          Daily Practice
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
