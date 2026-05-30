/**
 * Lesson context packaging for the student one-shot lesson chatbot.
 */

export interface LessonChatbotContext {
  lessonTitle: string;
  unitTitle: string;
  phaseTitle: string;
  learningObjectives: string[];
  contentSummary: string;
}

interface MinimalLesson {
  title: string;
  unit: { title: string };
}

interface MinimalPhase {
  title: string;
  learningObjectives: string[];
  content: string;
}

/**
 * Sanitizes markdown text for use in AI prompt contexts.
 * @param text - Markdown text to sanitize
 * @returns Sanitized text safe for prompt injection
 */
export function sanitizeMarkdownForPrompt(text: string): string {
  return text
    .replace(/`/g, '')
    .replace(/\[/g, '(')
    .replace(/\]/g, ')')
    .replace(/>/g, '')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*>\s+/gm, '')
    .replace(/(?:\n){3,}/g, '\n\n')
    .trim();
}

/**
 * Strips HTML tags from a string for safe text processing.
 * @param html - HTML string to strip
 * @returns Plain text with tags removed
 */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Truncates text to maxLength, ending at last space before cutoff.
 * @param text - Text to truncate
 * @param maxLength - Maximum length of result
 * @returns Truncated text with ellipsis if truncated, otherwise original
 */
function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  const truncated = text.slice(0, maxLength - 3);
  const lastSpace = truncated.lastIndexOf(' ');
  return (lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated) + '...';
}

/**
 * Assembles lesson chatbot context from lesson and phase data.
 * @param lesson - Minimal lesson object with title and unit
 * @param phase - Minimal phase with title, objectives, and content
 * @returns LessonChatbotContext for AI prompt injection
 */
export function assembleLessonChatbotContext(
  lesson: MinimalLesson,
  phase: MinimalPhase,
): LessonChatbotContext {
  const strippedContent = stripHtml(phase.content);
  const sanitizedContent = sanitizeMarkdownForPrompt(strippedContent);
  const contentSummary = truncate(sanitizedContent, 2000);

  return {
    lessonTitle: sanitizeMarkdownForPrompt(lesson.title),
    unitTitle: sanitizeMarkdownForPrompt(lesson.unit.title),
    phaseTitle: sanitizeMarkdownForPrompt(phase.title),
    learningObjectives: phase.learningObjectives.map(sanitizeMarkdownForPrompt),
    contentSummary,
  };
}