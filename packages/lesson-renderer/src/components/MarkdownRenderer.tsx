'use client';

import { cn } from '../lib/cn';
import { MarkdownRenderer } from '../textbook/MarkdownRenderer';

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
      <MarkdownRenderer content={content} />
    </div>
  );
}
