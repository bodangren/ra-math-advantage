'use client';

import { Users, TrendingUp, AlertCircle, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ClassHealth {
  totalActiveStudents: number;
  practicedToday: number;
  avgRetention: number;
  totalCards: number;
}

export interface OverdueLoad {
  totalOverdue: number;
  perStudent: Array<{ studentId: string; overdueCount: number }>;
}

export interface PracticeStreak {
  studentId: string;
  displayName: string;
  streak: number;
}

export interface SrsDashboardPanelProps {
  classHealth: ClassHealth | null;
  overdueLoad: OverdueLoad | null;
  streaks: PracticeStreak[];
  isLoading?: boolean;
}

export function SrsDashboardPanel({
  classHealth,
  overdueLoad,
  streaks,
  isLoading = false,
}: SrsDashboardPanelProps) {
  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-foreground mb-4">SRS Class Health</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-muted/50 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!classHealth) {
    return (
      <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-foreground mb-4">SRS Class Health</h2>
        <p className="text-muted-foreground text-sm">No SRS data available for this class.</p>
      </div>
    );
  }

  const retentionColor = classHealth.avgRetention >= 0.8
    ? 'text-green-600'
    : classHealth.avgRetention >= 0.5
      ? 'text-yellow-600'
      : 'text-red-600';

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-foreground mb-4">SRS Class Health</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <article className="bg-blue-50 dark:bg-blue-950 border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-5 w-5 text-blue-600" aria-hidden="true" />
            <span className="text-sm text-muted-foreground">Active Students</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">
            {classHealth.totalActiveStudents}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {classHealth.practicedToday} practiced today
          </p>
        </article>

        <article className="bg-muted/50 border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className={cn('h-5 w-5', retentionColor)} aria-hidden="true" />
            <span className="text-sm text-muted-foreground">Avg Retention</span>
          </div>
          <p className={cn('text-2xl font-bold', retentionColor)}>
            {(classHealth.avgRetention * 100).toFixed(0)}%
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            across {classHealth.totalCards} cards
          </p>
        </article>

        <article className={cn(
          'border rounded-lg p-4',
          (overdueLoad?.totalOverdue ?? 0) > 0
            ? 'bg-red-50 dark:bg-red-950 border-red-200'
            : 'bg-muted/50 border-border'
        )}>
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className={cn(
              'h-5 w-5',
              (overdueLoad?.totalOverdue ?? 0) > 0 ? 'text-red-600' : 'text-muted-foreground'
            )} aria-hidden="true" />
            <span className="text-sm text-muted-foreground">Overdue Cards</span>
          </div>
          <p className={cn(
            'text-2xl font-bold',
            (overdueLoad?.totalOverdue ?? 0) > 0 ? 'text-red-600' : 'text-foreground'
          )}>
            {overdueLoad?.totalOverdue ?? 0}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            across {overdueLoad?.perStudent.filter(s => s.overdueCount > 0).length ?? 0} students
          </p>
        </article>

        <article className="bg-orange-50 dark:bg-orange-950 border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="h-5 w-5 text-orange-600" aria-hidden="true" />
            <span className="text-sm text-muted-foreground">Top Streak</span>
          </div>
          <p className="text-2xl font-bold text-orange-600">
            {streaks.length > 0 ? streaks[0].streak : 0}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {streaks.length > 0 ? streaks[0].displayName : 'No active streaks'}
          </p>
        </article>
      </div>

      {streaks.length > 1 && (
        <div className="mt-4 pt-4 border-t border-border">
          <h3 className="text-sm font-medium text-foreground mb-2">Practice Streaks</h3>
          <div className="flex flex-wrap gap-2">
            {streaks.slice(0, 5).map((streak) => (
              <div
                key={streak.studentId}
                className="flex items-center gap-1.5 bg-muted/50 px-2.5 py-1 rounded-full text-xs"
              >
                <Flame className="h-3.5 w-3.5 text-orange-500" aria-hidden="true" />
                <span className="font-medium">{streak.displayName}</span>
                <span className="text-muted-foreground">{streak.streak}d</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
