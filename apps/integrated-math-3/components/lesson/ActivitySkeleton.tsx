'use client';

import { cn } from '@/lib/utils';

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
