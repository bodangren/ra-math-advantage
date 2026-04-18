'use client';

import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ProgressCardProps {
  title: string;
  progress: number;
  nextLessonTitle?: string;
  nextLessonHref?: string;
}

export function ProgressCard({
  title,
  progress,
  nextLessonTitle,
  nextLessonHref,
}: ProgressCardProps) {
  const isCompleted = progress === 100;

  return (
    <article className="bg-card border border-border rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <span className="text-2xl font-bold text-orange-600">{progress}%</span>
      </div>

      <div
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        className="w-full bg-muted rounded-full h-3 mb-6"
      >
        <div
          data-testid="progress-bar-fill"
          className={cn(
            'h-3 rounded-full transition-all duration-500',
            progress === 100 ? 'bg-green-600' : 'bg-orange-600'
          )}
          style={{ width: `${progress}%` }}
        />
      </div>

      {isCompleted ? (
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle2 className="h-5 w-5" />
          <span className="font-semibold">Completed!</span>
        </div>
      ) : (
        <div>
          <p className="text-sm text-muted-foreground mb-2">Next Lesson</p>
          <p className="text-foreground font-medium mb-3">{nextLessonTitle}</p>
          <Link
            href={nextLessonHref || '#'}
            className="inline-flex items-center justify-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors font-medium"
          >
            Start Lesson
          </Link>
        </div>
      )}
    </article>
  );
}
