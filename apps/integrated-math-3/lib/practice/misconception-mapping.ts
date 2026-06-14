/**
 * Detection-mapping layer between
 * `packages/math-content/src/algebraic/distractors.ts` and the IM3
 * misconception taxonomy.
 *
 *   - `mapDistractorToMisconception(distractorType, answer)` is the runtime
 *     seam used by activity scoring: a wrong answer produced by one of the
 *     algebraic distractor generators maps to one or more IM3 misconception
 *     tag slugs.
 *   - `getDistractorTypesForMisconception(slug)` is the reverse lookup used
 *     by the remediation planner to know which distractor generators can
 *     surface a given misconception.
 *
 * The mapping is built directly from `IM3_MISCONCEPTION_TAGS.detectionSignals`
 * so the two views stay coherent — adding a tag and forgetting to add its
 * reverse mapping is a single-source change.
 */

import type { DistractorType } from '@math-platform/math-content/algebraic';

import {
  IM3_MISCONCEPTION_TAGS,
  type Im3MisconceptionTagSlug,
} from './misconception-taxonomy';

const VALID_DISTRACTOR_TYPES: ReadonlySet<DistractorType> = new Set<DistractorType>([
  'factoring',
  'linear',
  'quadratic_formula',
  'complex',
  'completing_square',
  'discriminant',
  'system',
]);

function isDistractorType(value: string): value is DistractorType {
  return VALID_DISTRACTOR_TYPES.has(value as DistractorType);
}

/**
 * Map a `(distractorType, answer)` pair produced by the algebraic distractor
 * generators to one or more IM3 misconception tag slugs.
 *
 * Returns an empty array when the distractor type is not one of the seven
 * canonical algebraic distractor types, or when no IM3 tag has registered
 * that type as a detection signal. The `answer` parameter is accepted for
 * signature symmetry with future per-answer heuristics; the current
 * implementation maps purely off `distractorType`.
 */
export function mapDistractorToMisconception(
  distractorType: DistractorType,
  _answer: string,
): readonly Im3MisconceptionTagSlug[] {
  void _answer;
  if (!isDistractorType(distractorType)) {
    return [];
  }

  const matches = new Set<Im3MisconceptionTagSlug>();
  for (const [slug, entry] of Object.entries(IM3_MISCONCEPTION_TAGS)) {
    for (const signal of entry.detectionSignals) {
      if (signal.distractorType === distractorType) {
        matches.add(slug as Im3MisconceptionTagSlug);
      }
    }
  }
  return Array.from(matches);
}

/**
 * Return the algebraic distractor types whose generated wrong-answer
 * patterns can surface the given IM3 misconception. Returns an empty array
 * for an unknown slug so callers can use this as a safe reverse lookup
 * without throwing.
 */
export function getDistractorTypesForMisconception(
  slug: string,
): readonly DistractorType[] {
  const entry = IM3_MISCONCEPTION_TAGS[slug as Im3MisconceptionTagSlug];
  if (!entry) {
    return [];
  }
  return entry.detectionSignals.map((signal) => signal.distractorType);
}
