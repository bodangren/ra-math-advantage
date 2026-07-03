// Student-side transfer credit copy — app-local mapping of cross-course
// source labels to display strings (FR4, AC4).
//
// The course labels in this file are **app-local**. The transfer pipeline
// in `@math-platform/knowledge-space-core` is domain-neutral; the IM3
// student surface translates course prefixes into human-friendly course
// names here. Adding a new course (e.g., a new integrated-math module)
// is a single entry in `COURSE_LABELS` below.

/**
 * Map from a `math.<course>` source-course prefix to a human-friendly
 * course label rendered in the student transfer-credit prompt.
 *
 * Unrecognized courses fall back to a generic "a previous course" label
 * so the copy is never `undefined` and never contains the literal text
 * "undefined" (AD9 / AD7 defenses in the test suite).
 */
const COURSE_LABELS: Readonly<Record<string, string>> = Object.freeze({
  'math.im1': 'IM1',
  'math.im2': 'IM2',
  'math.im3': 'IM3',
  'math.precalc': 'AP Precalculus',
});

/**
 * Fallback label used when the source course is unrecognized or the
 * prefix is malformed. Kept friendly and course-agnostic so the prompt
 * never reads "You already mastered this in undefined".
 */
const UNKNOWN_COURSE_LABEL = 'a previous course';

/**
 * Extract the course prefix from a source-course id.
 *
 * A `math.<course>` source has at least two dot-separated segments. A
 * malformed id (e.g. `foo` or `math`) yields an empty prefix, which the
 * caller maps to the fallback label.
 */
function extractCoursePrefix(sourceCourse: string): string {
  const segments = sourceCourse.split('.');
  if (segments.length < 2) return '';
  return `${segments[0]}.${segments[1]}`;
}

/**
 * Build the "You already mastered this in <course>" student-facing copy.
 *
 * @param {string} sourceCourse - The cross-course source label (e.g.
 *   `math.im2`). Unrecognized / malformed ids fall back to a generic
 *   "a previous course" label so the rendered string is never `undefined`
 *   and never contains the literal text "undefined".
 * @returns {string} The full copy string ready for the student prompt.
 */
export function getTransferCreditCopy(sourceCourse: string): string {
  const prefix = extractCoursePrefix(sourceCourse);
  const label = prefix ? COURSE_LABELS[prefix] : undefined;
  const courseLabel = label ?? UNKNOWN_COURSE_LABEL;
  return `You already mastered this in ${courseLabel}`;
}
