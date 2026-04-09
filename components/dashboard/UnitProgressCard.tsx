'use client';

import { CheckCircle2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface UnitProgressCardProps {
  unitNumber: number;
  unitTitle: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
}

export function UnitProgressCard({
  unitNumber,
  unitTitle,
  progress,
  totalLessons,
  completedLessons,
}: UnitProgressCardProps) {
  const isCompleted = progress === 100;
  const lessonLabel = totalLessons === 1 ? '1 lesson' : `${totalLessons} lessons`;
  const statusLabel = isCompleted ? 'Completed!' : 'In Progress';
  const StatusIcon = isCompleted ? CheckCircle2 : Clock;

  return (
    <article className="bg-card border border-border rounded-lg p-5 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-orange-600">Unit {unitNumber}</span>
          </div>
          <h3 className="text-lg font-semibold text-foreground">{unitTitle}</h3>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <StatusIcon className={cn('h-4 w-4', isCompleted ? 'text-green-600' : 'text-muted-foreground')} />
          <span className={cn('font-medium', isCompleted ? 'text-green-600' : 'text-muted-foreground')}>
            {statusLabel}
          </span>
        </div>
      </div>

      <div
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        className="w-full bg-muted rounded-full h-3 mb-3"
      >
        <div
          data-testid="progress-bar-fill"
          className={cn(
            'h-3 rounded-full transition-all duration-500',
            isCompleted ? 'bg-green-600' : 'bg-orange-600'
          )}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-2xl font-bold text-orange-600">{progress}%</span>
        <span className="text-muted-foreground">
          {completedLessons} of {lessonLabel}
        </span>
      </div>
    </article>
  );
}
