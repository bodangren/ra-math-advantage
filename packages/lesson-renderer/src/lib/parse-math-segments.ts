/**
 * Parses a markdown string into segments of type 'markdown', 'block-math', or 'inline-math'.
 *
 * Supported math delimiters:
 *   Display math: $$...$$ or \[...\]
 *   Inline math:  $...$  (not $$)
 */

export type MathSegment =
  | { type: 'markdown'; content: string }
  | { type: 'block-math'; content: string }
  | { type: 'inline-math'; content: string };

/**
 * Splits a content string into segments, extracting block and inline math.
 */
export function parseMathSegments(content: string): MathSegment[] {
  const segments: MathSegment[] = [];

  // Regex matching $$...$$ or \[...\] (display math), non-greedy
  const blockMathRe = /\$\$([\s\S]*?)\$\$|\\\[([\s\S]*?)\\\]/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = blockMathRe.exec(content)) !== null) {
    if (match.index > lastIndex) {
      const textBefore = content.slice(lastIndex, match.index);
      segments.push(...splitInlineMath(textBefore));
    }
    const mathContent = (match[1] ?? match[2] ?? '').trim();
    segments.push({ type: 'block-math', content: mathContent });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    segments.push(...splitInlineMath(content.slice(lastIndex)));
  }

  return segments;
}

/**
 * Within a text string (no block math), splits by $...$ inline math.
 * Avoids matching $$...$$ (already handled by parseMathSegments).
 */
function splitInlineMath(text: string): MathSegment[] {
  const segments: MathSegment[] = [];

  // Match $...$ but not $$: use negative lookahead/lookbehind to exclude double-dollar
  const inlineMathRe = /(?<!\$)\$(?!\$)([\s\S]*?)(?<!\$)\$(?!\$)/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = inlineMathRe.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'markdown', content: text.slice(lastIndex, match.index) });
    }
    segments.push({ type: 'inline-math', content: match[1].trim() });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    segments.push({ type: 'markdown', content: text.slice(lastIndex) });
  }

  return segments;
}
