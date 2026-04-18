'use client';

import { cn } from '@/lib/utils';
import { MarkdownRenderer as TextbookMarkdownRenderer } from '@/components/textbook/MarkdownRenderer';

interface LessonMarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * Lesson-level markdown renderer.
 * Wraps the textbook MarkdownRenderer in the .textbook-content typography scope.
 */
export function LessonMarkdownRenderer({ content, className }: LessonMarkdownRendererProps) {
  return (
    <div className={cn('textbook-content', className)}>
      <TextbookMarkdownRenderer content={content} />
    </div>
  );
}
