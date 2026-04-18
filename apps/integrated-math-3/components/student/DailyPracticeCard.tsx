import Link from 'next/link';

export interface DailyPracticeCardProps {
  dueCount: number;
  streak: number;
  lastPracticedAt: string | null;
}

export function DailyPracticeCard({
  dueCount,
  streak,
  lastPracticedAt,
}: DailyPracticeCardProps) {
  const hasPracticed = lastPracticedAt !== null;

  return (
    <div
      className="rounded-xl border border-border bg-card p-6 space-y-4"
      data-testid="daily-practice-card"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-semibold text-foreground">
            Daily Practice
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {dueCount > 0
              ? `You have ${dueCount} item${dueCount === 1 ? '' : 's'} to review today.`
              : 'No practice due today. Come back tomorrow!'}
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <div
            className="font-mono-num text-3xl font-bold text-primary"
            data-testid="streak-value"
          >
            {streak}
          </div>
          <div className="text-xs text-muted-foreground uppercase tracking-wide">
            day streak
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {hasPracticed
            ? `Last practiced ${new Date(lastPracticedAt).toLocaleDateString()}`
            : 'Start your streak today'}
        </p>
        <Link
          href="/student/practice"
          className="inline-flex items-center gap-2 rounded-md px-5 py-2 text-sm font-medium text-primary-foreground bg-primary hover:opacity-90 transition-opacity flex-shrink-0"
          data-testid="practice-link"
        >
          {dueCount > 0 ? 'Start Practice →' : 'View Practice →'}
        </Link>
      </div>
    </div>
  );
}
