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
 * @param {string} text - Markdown text to sanitize
 * @returns {string} - Sanitized text safe for prompt injection
 */
export function sanitizeMarkdownForPrompt(text: string): string {
  return text
    .replace(/`/g, "")
    .replace(/\[/g, "(")
    .replace(/\]/g, ")")
    .replace(/>/g, "")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*>\s+/gm, "")
    .replace(/(?:\n){3,}/g, "\n\n")
    .trim();
}

/**
 * Strips HTML tags from a string for safe text processing.
 * @param {string} html - HTML string to strip
 * @returns {string} - Plain text with tags removed
 */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Truncates text to maxLength, ending at last space before cutoff.
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length of result
 * @returns {string} - Truncated text with ellipsis if truncated, otherwise original
 */
function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  const truncated = text.slice(0, maxLength - 3);
  const lastSpace = truncated.lastIndexOf(" ");
  return (lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated) + "...";
}

const DETAIL_LABEL =
  "(?:Student|Teacher|Instructor|Guardian|Parent|Tutor|Name|Email|Username|Account\\s*ID|[A-Z][A-Za-z]{1,24})";
// A detail separator consumes horizontal space only. A newline after the
// label ends the clause, so the next lesson line is never treated as the
// detail value and removed with it.
const DETAIL_SEPARATOR = "\\s*(?::|：|-|–|—)[ \\t]*";
const DETAIL_END = "(?:[.!?。！？](?=\\s|$)|\\r?\\n|(?=" + DETAIL_LABEL + DETAIL_SEPARATOR + ")|$)";
const PERSON_DETAIL = new RegExp(
  "\\b" + DETAIL_LABEL + DETAIL_SEPARATOR + "[^]*?" + DETAIL_END,
  "gi",
);
const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
const OBFUSCATED_EMAIL = /\b[A-Za-z0-9._%+-]+\s+at\s+[A-Za-z0-9.-]+\s+dot\s+[A-Za-z]{2,}\b/gi;

/**
 * Removes person-detail clauses from lesson markdown before it enters a prompt.
 * A clause ends at a sentence end, a line break, or the next label. Later
 * lesson text stays. Known account values are removed everywhere.
 * @param {string} markdown - Raw lesson markdown.
 * @param {string[]} knownDetails - Account values to remove everywhere.
 * @returns {string} - Markdown with person details removed.
 */
function stripPersonDetails(markdown: string, knownDetails: string[] = []): string {
  let result = markdown.replace(PERSON_DETAIL, "").replace(EMAIL, "").replace(OBFUSCATED_EMAIL, "");
  for (const value of knownDetails) {
    if (typeof value === "string" && value.trim().length > 0) {
      result = result.split(value).join("");
    }
  }
  return result.replace(/[ \t]{2,}/g, " ").trim();
}

/**
 * Assembles lesson chatbot context from lesson and phase data.
 * @param {MinimalLesson} lesson - Minimal lesson object with title and unit
 * @param {MinimalPhase} phase - Minimal phase with title, objectives, and content
 * @param {string[]} knownDetails - Account values to remove from the lesson content
 * @returns {LessonChatbotContext} - LessonChatbotContext for AI prompt injection
 */
export function assembleLessonChatbotContext(
  lesson: MinimalLesson,
  phase: MinimalPhase,
  knownDetails: string[] = [],
): LessonChatbotContext {
  const strippedContent = stripHtml(stripPersonDetails(phase.content, knownDetails));
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
