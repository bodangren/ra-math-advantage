/**
 * Phase 1 — Authoring Model & Schema-Driven Validation
 *
 * Sanitization for teacher-authored free-text content (lesson titles, phase
 * titles, section markdown/callouts, quiz prompts/explanations, fill-in
 * templates/blanks, solver steps/hints, rate-of-change expressions, etc.).
 *
 * Phase 1's role is intentionally narrow: neutralize executable content in
 * authored text so it cannot enter Phase 2's hash and approval queue as
 * active markup. We are NOT building a general-purpose HTML sanitizer for
 * arbitrary user input; we are making authored text safe to render later
 * without `dangerouslySetInnerHTML`.
 *
 * What the sanitizer strips:
 *   - `<script>...</script>` blocks (and their content).
 *   - `<style>...</style>` blocks (and their content).
 *   - Event-handler attributes (`onerror=`, `onload=`, `onclick=`, ...).
 *   - `javascript:` URL prefixes.
 *
 * What the sanitizer preserves (deliberately, for the curriculum):
 *   - Math notation: `$...$`, `**`, `^`, `_`, `\frac{}{}`, etc.
 *   - Inline markdown emphasis, headings, lists.
 *   - The literal text of harmless tags like `<b>Safe math</b>` — the
 *     Phase 1 render surface uses plain text nodes, so the angle brackets
 *     never reach the DOM as live markup.
 */

import React from 'react';

/** Text-container tags that would reinterpret sanitized children as executable
 *  code (script) or page-wide styles (style). SanitizedText must never use them
 *  as its wrapper, even if a caller requests it. */
type DangerousTextTag = 'script' | 'style';

/** Any intrinsic element except the dangerous ones above. */
type SafeTextTag = Exclude<keyof React.JSX.IntrinsicElements, DangerousTextTag>;

const SCRIPT_BLOCK_REGEX = /<script\b[\s\S]*?>[\s\S]*?<\/script\s*>/gi;
const STYLE_BLOCK_REGEX = /<style\b[\s\S]*?>[\s\S]*?<\/style\s*>/gi;
const EVENT_HANDLER_DOUBLE_QUOTED_REGEX = /\s+on[a-z]+\s*=\s*"[^"]*"/gi;
const EVENT_HANDLER_SINGLE_QUOTED_REGEX = /\s+on[a-z]+\s*=\s*'[^']*'/gi;
const EVENT_HANDLER_UNQUOTED_REGEX = /\s+on[a-z]+\s*=\s*[^\s>]+/gi;
const JAVASCRIPT_URL_REGEX = /javascript\s*:[^"'<>\s]*/gi;

/**
 * Neutralize executable markup in a single string of authored text. Math
 * notation and markdown emphasis characters (`$`, `**`, `^`, `_`) are
 * preserved.
 */
export function sanitizeAuthoringText(input: string): string {
  if (typeof input !== 'string' || input.length === 0) {
    return '';
  }

  let out = input;

  // 1. Strip <script>...</script> and its content.
  out = out.replace(SCRIPT_BLOCK_REGEX, '');

  // 2. Strip <style>...</style> and its content.
  out = out.replace(STYLE_BLOCK_REGEX, '');

  // 3. Strip event-handler attributes (on*="..." / on*='...' / on*=...).
  out = out.replace(EVENT_HANDLER_DOUBLE_QUOTED_REGEX, '');
  out = out.replace(EVENT_HANDLER_SINGLE_QUOTED_REGEX, '');
  out = out.replace(EVENT_HANDLER_UNQUOTED_REGEX, '');

  // 4. Strip `javascript:` URL prefixes (and the payload that follows
  //    until the next quote, space, or tag boundary).
  out = out.replace(JAVASCRIPT_URL_REGEX, '');

  return out;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === 'object' && !Array.isArray(value);
}

function sanitizeRecursive(value: unknown): unknown {
  if (typeof value === 'string') {
    return sanitizeAuthoringText(value);
  }
  if (Array.isArray(value)) {
    return value.map((entry) => sanitizeRecursive(entry));
  }
  if (isPlainObject(value)) {
    const out: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(value)) {
      out[key] = sanitizeRecursive(entry);
    }
    return out;
  }
  // Numbers, booleans, null, undefined, etc. — pass through unchanged.
  return value;
}

/**
 * Walk a (possibly untrusted) lesson draft and sanitize every free-text
 * string field. The shape of the draft is preserved; only string leaves
 * are rewritten. Phase 2 (hash + approval queue) is expected to consume
 * the returned object as the canonical pre-hash source of truth.
 */
export function sanitizeLessonDraft(draft: unknown): unknown {
  return sanitizeRecursive(draft);
}

/**
 * Render a sanitized HTML/text blob as plain text. This component never
 * uses `dangerouslySetInnerHTML`: authored text is run through
 * `sanitizeAuthoringText` and emitted as a text node, so any angle
 * brackets or entity-like sequences remain inert and visible only as
 * characters. The Phase 3 composer UI is expected to use this component
 * (or an equivalent) for every authored free-text field.
 *
 * The wrapper tag is restricted to safe text containers: `script` and
 * `style` are excluded at the type level and also guarded at runtime so
 * that sanitized JavaScript/CSS cannot be re-interpreted as executable
 * content by the wrapper itself.
 */
export function SanitizedText({
  html,
  as: Tag = 'span',
}: {
  html: string;
  as?: SafeTextTag;
}): React.ReactElement {
  const safe = sanitizeAuthoringText(typeof html === 'string' ? html : '');
  // Runtime defense in depth for JS callers or type assertions.
  const tag: SafeTextTag =
    Tag === 'script' || Tag === 'style' ? 'span' : Tag;
  return React.createElement(tag, {}, safe);
}
