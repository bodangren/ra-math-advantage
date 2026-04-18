'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export interface NextLessonCardProps {
  lessonTitle: string;
  phaseCount: number;
  lessonHref: string;
}

export function NextLessonCard({
  lessonTitle,
  phaseCount,
  lessonHref,
}: NextLessonCardProps) {
  const phaseLabel = phaseCount === 1 ? '1 phase' : `${phaseCount} phases`;

  return (
    <article className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border border-orange-200 dark:border-orange-800 rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-4">Next Lesson</h3>
      
      <div className="mb-6">
        <h4 className="text-xl font-semibold text-foreground mb-2">{lessonTitle}</h4>
        <p className="text-muted-foreground text-sm">{phaseLabel}</p>
      </div>

      <Link
        href={lessonHref}
        className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors font-semibold text-base shadow-sm hover:shadow-md"
      >
        Start Lesson
        <ArrowRight className="h-4 w-4" />
      </Link>
    </article>
  );
}
