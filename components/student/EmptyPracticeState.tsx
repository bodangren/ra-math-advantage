'use client';

import Link from 'next/link';

export function EmptyPracticeState() {
  return (
    <div className="max-w-2xl mx-auto py-12 px-4 text-center">
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="mb-6">
          <svg
            className="mx-auto h-16 w-16 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            data-testid="empty-state-icon"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 12H4M12 4v16"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-display font-bold text-foreground mb-4">
          Daily Practice
        </h1>

        <p className="text-lg text-foreground mb-2">
          No practice due today. Come back tomorrow!
        </p>

        <p className="text-sm text-muted-foreground mb-6">
          Keep up the great work. Your daily practice will be ready soon.
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
