'use client';

import { cn } from '../lib/cn';

interface LessonSkeletonProps {
  phaseCount?: number;
  className?: string;
}

export function LessonSkeleton({ phaseCount = 4, className }: LessonSkeletonProps) {
  return (
    <div className={cn('space-y-6', className)} data-testid="lesson-skeleton">
      <div className="flex gap-2" data-testid="skeleton-stepper">
        {Array.from({ length: phaseCount }).map((_, i) => (
          <div
            key={i}
            className="h-3 w-8 rounded-full bg-muted animate-pulse"
            data-testid="skeleton-stepper-dot"
          />
        ))}
      </div>

      <div className="space-y-4" data-testid="skeleton-content">
        <div className="h-6 w-3/4 rounded-md bg-muted animate-pulse" />
        <div className="space-y-2">
          <div className="h-4 w-full rounded-md bg-muted animate-pulse" />
          <div className="h-4 w-5/6 rounded-md bg-muted animate-pulse" />
          <div className="h-4 w-4/6 rounded-md bg-muted animate-pulse" />
        </div>
        <div className="h-32 w-full rounded-lg bg-muted animate-pulse" />
      </div>

      <div
        className="h-10 w-full max-w-sm rounded-md bg-muted animate-pulse"
        data-testid="skeleton-complete-btn"
      />
    </div>
  );
}

interface ActivitySkeletonProps {
  className?: string;
}

export function ActivitySkeleton({ className }: ActivitySkeletonProps) {
  return (
    <div
      className={cn('space-y-4 p-4 rounded-lg border bg-card', className)}
      data-testid="activity-skeleton"
    >
      <div className="space-y-2" data-testid="skeleton-activity-content">
        <div className="h-5 w-1/3 rounded-md bg-muted animate-pulse" />
        <div className="h-4 w-full rounded-md bg-muted animate-pulse" />
        <div className="h-4 w-5/6 rounded-md bg-muted animate-pulse" />
      </div>
      <div className="h-8 w-24 rounded-md bg-muted animate-pulse" />
    </div>
  );
}
