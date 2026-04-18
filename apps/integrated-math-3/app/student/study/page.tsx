import Link from 'next/link';
import { requireStudentSessionClaims } from '@/lib/auth/server';

export default async function StudyHubPage() {
  const claims = await requireStudentSessionClaims('/auth/login');

  return (
    <div className="max-w-4xl mx-auto space-y-10 py-8">
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground font-mono-num">
          Welcome, {claims.username}
        </p>
        <h1 className="text-3xl font-display font-bold text-foreground">Study Hub</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/student/study/flashcards"
          className="rounded-xl border border-border bg-card p-6 hover:border-primary/40 transition-colors group"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h2 className="font-display text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                Flashcards
              </h2>
              <p className="text-sm text-muted-foreground">
                Review key vocabulary and definitions from any module. Flip cards to reveal definitions and rate your knowledge.
              </p>
            </div>
            <div className="text-3xl">📇</div>
          </div>
          <div className="mt-4">
            <span className="inline-flex items-center gap-2 rounded-md bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              Start Reviewing →
            </span>
          </div>
        </Link>

        <Link
          href="/student/study/matching"
          className="rounded-xl border border-border bg-card p-6 hover:border-primary/40 transition-colors group"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h2 className="font-display text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                Matching Game
              </h2>
              <p className="text-sm text-muted-foreground">
                Test your knowledge by matching terms with their definitions in a fun click-based memory game.
              </p>
            </div>
            <div className="text-3xl">🧩</div>
          </div>
          <div className="mt-4">
            <span className="inline-flex items-center gap-2 rounded-md bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              Start Matching →
            </span>
          </div>
        </Link>

        <Link
          href="/student/study/review"
          className="rounded-xl border border-border bg-card p-6 hover:border-primary/40 transition-colors group"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h2 className="font-display text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                SRS Review
              </h2>
              <p className="text-sm text-muted-foreground">
                Review terms scheduled by the spaced repetition system. Terms appear when you&apos;re ready to see them again.
              </p>
            </div>
            <div className="text-3xl">🔄</div>
          </div>
          <div className="mt-4">
            <span className="inline-flex items-center gap-2 rounded-md bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              Start SRS Review →
            </span>
          </div>
        </Link>

        <Link
          href="/student/study/speed-round"
          className="rounded-xl border border-border bg-card p-6 hover:border-primary/40 transition-colors group"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h2 className="font-display text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                Speed Round
              </h2>
              <p className="text-sm text-muted-foreground">
                Race against the clock to match terms with definitions. Build streaks and test your knowledge across all modules.
              </p>
            </div>
            <div className="text-3xl">⚡</div>
          </div>
          <div className="mt-4">
            <span className="inline-flex items-center gap-2 rounded-md bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              Start Speed Round →
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
}