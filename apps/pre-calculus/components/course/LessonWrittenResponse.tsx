import { LessonMarkdownRenderer } from '@math-platform/lesson-renderer';
import { LessonResponse } from './LessonResponse';

/** App-local renderer for teacher-reviewed lesson blueprint content. */
export function LessonWrittenResponse({ content, phaseId }: { content: string; phaseId?: string }) {
  return <>
    <LessonMarkdownRenderer content={content} />
    {phaseId && <LessonResponse phaseId={phaseId} />}
  </>;
}
