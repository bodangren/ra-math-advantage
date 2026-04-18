'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface LessonCardProps {
  lessonNumber: number;
  title: string;
  phaseCount: number;
  completed: boolean;
  href: string;
}

export function LessonCard({
  lessonNumber,
  title,
  phaseCount,
  completed,
  href,
}: LessonCardProps) {
  const phaseLabel = phaseCount === 1 ? '1 phase' : `${phaseCount} phases`;
  const statusLabel = completed ? 'Completed' : 'Not started';
  const statusColor = completed ? 'text-green-600' : 'text-muted-foreground';
  const borderColor = completed ? 'border-green-600' : 'border-border hover:border-orange-600';

  return (
    <Link
      href={href}
      aria-label={`Lesson ${lessonNumber}: ${title}`}
      className={cn(
        'block bg-card border-2 rounded-lg p-5 transition-all duration-200',
        'hover:shadow-md',
        borderColor
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold text-orange-600">Lesson {lessonNumber}</span>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground">{phaseLabel}</p>
        </div>
        <div className="flex-shrink-0">
          <span className={cn('text-sm font-medium', statusColor)}>{statusLabel}</span>
        </div>
      </div>
    </Link>
  );
}
