import Link from 'next/link';
import { requireStudentSessionClaims } from '@/lib/auth/server';
import { fetchInternalQuery, internal } from '@/lib/convex/server';
import {
  buildStudentDashboardViewModel,
  type StudentDashboardUnit,
} from '@/lib/student/dashboard';
import { ModuleCompleteScreen } from '@/components/lesson/ModuleCompleteScreen';
import { DailyPracticeCard } from '@/components/student/DailyPracticeCard';

interface PageProps {
  searchParams: Promise<{ complete?: string }>;
}

export default async function StudentDashboardPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const showModuleComplete = params.complete === 'module-1';

  const claims = await requireStudentSessionClaims('/auth/login');

  const rawUnits: StudentDashboardUnit[] = await fetchInternalQuery(
    internal.student.getDashboardData,
    { userId: claims.sub },
  );

  const vm = buildStudentDashboardViewModel(rawUnits ?? []);

  const practiceStats = await fetchInternalQuery(
    internal.srs.dashboard.getPracticeStats,
    { studentId: claims.sub },
  );

  if (showModuleComplete && vm.summary.completedLessons === vm.summary.totalLessons) {
    return (
      <div className="max-w-4xl mx-auto space-y-10 py-8">
        <ModuleCompleteScreen
          moduleLabel="Module 1: Linear Functions"
          lessonsCompleted={vm.summary.completedLessons}
          totalLessons={vm.summary.totalLessons}
          totalTimeMinutes={0}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 py-8">
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground font-mono-num">
          Welcome back, {claims.username}
        </p>
        <h1 className="text-3xl font-display font-bold text-foreground">Dashboard</h1>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Modules', value: vm.summary.totalUnits },
          { label: 'Lessons', value: vm.summary.totalLessons },
          { label: 'Completed', value: vm.summary.completedLessons },
          { label: 'Progress', value: `${vm.summary.progressPercentage}%` },
        ].map((stat) => (
          <div key={stat.label} className="card-workbook p-4 space-y-1 text-center">
            <p className="font-mono-num text-2xl font-bold text-primary">{stat.value}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Daily Practice */}
      <DailyPracticeCard
        dueCount={practiceStats?.dueCount ?? 0}
        streak={practiceStats?.streak ?? 0}
        lastPracticedAt={practiceStats?.lastPracticedAt ?? null}
      />

      {/* Study Hub */}
      <Link
        href="/student/study"
        className="rounded-xl border border-border bg-card p-6 hover:border-primary/40 transition-colors group block"
      >
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h2 className="font-display text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
              Study Hub
            </h2>
            <p className="text-sm text-muted-foreground">
              Review flashcards and vocabulary with spaced repetition.
            </p>
          </div>
          <span className="text-2xl">📚</span>
        </div>
        <div className="mt-4">
          <span className="inline-flex items-center gap-2 rounded-md bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            Open Study Hub →
          </span>
        </div>
      </Link>

      {/* Continue banner */}
      {vm.continueUrl && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-6 space-y-3">
          <span className="section-label">Continue</span>
          <h2 className="font-display text-xl font-semibold text-foreground">
            {vm.nextLesson?.title ?? 'Module 1'}
          </h2>
          {vm.nextLesson?.description && (
            <p className="text-sm text-muted-foreground">{vm.nextLesson.description}</p>
          )}
          <Link
            href={vm.continueUrl}
            className="inline-flex items-center gap-2 rounded-md px-5 py-2 text-sm font-medium text-primary-foreground bg-primary hover:opacity-90 transition-opacity"
          >
            {vm.nextLesson?.actionLabel ?? 'Start'} →
          </Link>
        </div>
      )}

      {/* Units */}
      <div className="space-y-6">
        {vm.units.map((unit) => (
          <div key={unit.unitNumber} className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-foreground">
                <span className="font-mono-num text-primary mr-2">
                  Unit {unit.unitNumber}
                </span>
                {unit.unitTitle}
              </h2>
              <span className="font-mono-num text-sm text-muted-foreground">
                {unit.completedLessons}/{unit.lessons.length}
              </span>
            </div>

            {/* Progress bar */}
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${unit.progressPercentage}%` }}
              />
            </div>

            <div className="space-y-2">
              {unit.lessons.map((lesson) => {
                const isLocked = lesson.isLocked;
                return (
                  <Link
                    key={lesson.id}
                    href={isLocked ? '#' : `/student/lesson/${lesson.slug}`}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                      isLocked
                        ? 'border-border bg-muted/20 cursor-not-allowed opacity-60'
                        : 'border-border hover:border-primary/40 hover:bg-muted/40'
                    }`}
                    aria-disabled={isLocked}
                    onClick={isLocked ? (e) => e.preventDefault() : undefined}
                  >
                    <span className={`flex items-center gap-2 text-sm ${isLocked ? 'text-muted-foreground' : 'text-foreground group-hover:text-primary'} transition-colors`}>
                      {isLocked && (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      )}
                      {lesson.title}
                    </span>
                    <span className="flex items-center gap-3 font-mono-num text-xs text-muted-foreground">
                      {lesson.estimatedMinutes != null && (
                        <span>{lesson.estimatedMinutes} min</span>
                      )}
                      <span>{lesson.completedPhases}/{lesson.totalPhases}</span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
