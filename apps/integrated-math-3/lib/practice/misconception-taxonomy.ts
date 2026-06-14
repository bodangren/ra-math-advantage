/**
 * Canonical misconception tag taxonomy for IM3 (Integrated Math 3) Module 1 +
 * common algebra prerequisite skills.
 *
 * The shape of each entry mirrors the BM2 `MisconceptionTagDefinition`
 * (`slug`, `label`, `description`, `category`) and adds two
 * IM3-specific fields needed for the detection-mapping layer:
 *
 *   - `affectedSkills`: the IM3 skill IDs the misconception manifests on.
 *   - `detectionSignals`: the algebraic `DistractorType`s whose generated
 *     wrong-answer patterns are diagnostic of this misconception.
 *
 * The taxonomy is source-grounded in the IM3 Module 1 curriculum
 * (`apps/integrated-math-3/curriculum/skill-graph/module-1/nodes.json`,
 * `kind: "skill"` rows) and the distractor patterns emitted by
 * `packages/math-content/src/algebraic/distractors.ts`.
 */

import type { DistractorType } from '@math-platform/math-content/algebraic';

export type Im3MisconceptionCategory =
  | 'mechanics'
  | 'classification'
  | 'computation'
  | 'completeness';

export interface Im3DetectionSignal {
  /** The algebraic distractor type that emits this wrong-answer pattern. */
  distractorType: DistractorType;
  /** Short description of the wrong-answer pattern a generator would emit. */
  description: string;
}

export interface Im3MisconceptionTagDefinition {
  /** Canonical slug used in misconceptionTags arrays. Matches the registry key. */
  slug: string;
  /** Human-readable label for teacher dashboards. */
  label: string;
  /** Short description of the error pattern. */
  description: string;
  /** Semantic category for grouping in UI (aligned with the BM2 set). */
  category: Im3MisconceptionCategory;
  /** IM3 skill IDs the misconception manifests on. */
  affectedSkills: readonly string[];
  /** Algebraic distractor types whose patterns are diagnostic of this error. */
  detectionSignals: readonly Im3DetectionSignal[];
}

const IM3_MISCONCEPTION_TAGS_SOURCE = {
  'sign-error-in-factored-form': {
    slug: 'sign-error-in-factored-form',
    label: 'Sign Error in Factored Form',
    description:
      'Student flipped a sign inside one or both linear factors when moving between a quadratic and its factored form (e.g., (x - 2)(x + 3) written as (x + 2)(x - 3)).',
    category: 'mechanics',
    affectedSkills: [
      'math.im3.skill.1.4.solve-quadratic-equations-by-factoring',
      'math.im3.skill.1.2.solve-quadratic-equations-by-graphing',
      'math.im3.skill.1.2.interpret-solutions-roots-in-context',
      'math.im3.skill.1.4.recognize-special-factor-patterns-gcf-trinomials-difference',
    ],
    detectionSignals: [
      {
        distractorType: 'factoring',
        description:
          'Distractor generator flips the sign of one factor root, producing the mirrored-sign factored form.',
      },
    ],
  },
  'average-rate-as-mean-of-endpoints': {
    slug: 'average-rate-as-mean-of-endpoints',
    label: 'Average Rate Treated as Mean of Endpoints',
    description:
      'Student computed the average of the endpoint y-values (f(a) + f(b)) / 2 instead of the average rate of change (f(b) - f(a)) / (b - a).',
    category: 'mechanics',
    affectedSkills: [
      'math.im3.skill.1.1.find-and-interpret-the-average-rate-of-change',
    ],
    detectionSignals: [
      {
        distractorType: 'linear',
        description:
          'Distractor generator offsets or negates the solution, surfacing a number that is the mean of f(a) and f(b).',
      },
    ],
  },
  'vertex-y-as-solution': {
    slug: 'vertex-y-as-solution',
    label: 'Vertex y-Coordinate Reported as Solution',
    description:
      'Student read the y-coordinate of the vertex off the graph and reported it as a solution to the equation, instead of the x-intercept(s).',
    category: 'classification',
    affectedSkills: [
      'math.im3.skill.1.1.graph-quadratic-functions',
      'math.im3.skill.1.2.interpret-solutions-roots-in-context',
    ],
    detectionSignals: [
      {
        distractorType: 'quadratic_formula',
        description:
          'Distractor generator returns a single value equal to the vertex y-coordinate, which the student then labels as a solution.',
      },
    ],
  },
  'quadratic-formula-sign-flip': {
    slug: 'quadratic-formula-sign-flip',
    label: 'Quadratic Formula ± Sign Flip',
    description:
      'Student dropped the ± in the quadratic formula, or flipped it to ∓, producing roots with the wrong sign on the square-root term.',
    category: 'computation',
    affectedSkills: [
      'math.im3.skill.1.6.use-the-quadratic-formula-to-solve-equations',
      'math.im3.skill.1.6.use-the-discriminant-to-determine-the-number-and-type-of-sol',
      'math.im3.skill.1.4.solve-quadratic-equations-by-factoring',
    ],
    detectionSignals: [
      {
        distractorType: 'quadratic_formula',
        description:
          'Distractor generator negates one of the two roots produced by the formula.',
      },
      {
        distractorType: 'factoring',
        description:
          'Distractor generator swaps the two roots, matching a student who applied the wrong sign inside one factor.',
      },
    ],
  },
  'discriminant-misread-zero-vs-positive': {
    slug: 'discriminant-misread-zero-vs-positive',
    label: 'Discriminant Zero vs. Positive Misread',
    description:
      'Student confused the number-of-solutions conclusion for a discriminant of zero (1 real solution) with a positive discriminant (2 real solutions), or vice versa.',
    category: 'classification',
    affectedSkills: [
      'math.im3.skill.1.6.use-the-discriminant-to-determine-the-number-and-type-of-sol',
    ],
    detectionSignals: [
      {
        distractorType: 'discriminant',
        description:
          'Distractor generator swaps "1 real solution" and "2 real solutions" conclusions.',
      },
    ],
  },
  'completing-square-offset-error': {
    slug: 'completing-square-offset-error',
    label: 'Completing-the-Square Offset Error',
    description:
      'Student miscalculated the (b/2)^2 offset term, or added/subtracted it from the wrong side of the equation, producing a vertex form with the wrong h.',
    category: 'mechanics',
    affectedSkills: [
      'math.im3.skill.1.6.use-the-quadratic-formula-to-solve-equations',
      'math.im3.skill.1.4.solve-quadratic-equations-by-factoring',
    ],
    detectionSignals: [
      {
        distractorType: 'completing_square',
        description:
          'Distractor generator flips the sign of h or shifts k by one, surfacing the offset error.',
      },
    ],
  },
  'omitted-root-in-multi-step': {
    slug: 'omitted-root-in-multi-step',
    label: 'Omitted Root in Multi-Step Solution',
    description:
      'Student solved the quadratic, found one of the two roots, and stopped. The other root (or the second factor) was never recorded.',
    category: 'completeness',
    affectedSkills: [
      'math.im3.skill.1.4.solve-quadratic-equations-by-factoring',
      'math.im3.skill.1.2.solve-quadratic-equations-by-graphing',
      'math.im3.skill.1.6.use-the-quadratic-formula-to-solve-equations',
    ],
    detectionSignals: [
      {
        distractorType: 'quadratic_formula',
        description:
          'Distractor generator returns a single value when the equation has two real roots, which the student records as the only answer.',
      },
      {
        distractorType: 'factoring',
        description:
          'Distractor generator surfaces a one-factor (x - r1) form, omitting the (x - r2) factor.',
      },
    ],
  },
  'complex-root-omits-i': {
    slug: 'complex-root-omits-i',
    label: 'Complex Root Reported Without i',
    description:
      'Student computed the real and imaginary parts of a complex root but reported only the real part, or dropped the i from the imaginary part.',
    category: 'completeness',
    affectedSkills: [
      'math.im3.skill.1.6.use-the-quadratic-formula-to-solve-equations',
      'math.im3.skill.1.6.use-the-discriminant-to-determine-the-number-and-type-of-sol',
    ],
    detectionSignals: [
      {
        distractorType: 'complex',
        description:
          'Distractor generator emits the real part only, matching a student who dropped the imaginary unit.',
      },
    ],
  },
  'inequality-direction-flip': {
    slug: 'inequality-direction-flip',
    label: 'Inequality Direction Flipped on Multiply/Divide',
    description:
      'Student divided or multiplied both sides of an inequality by a negative number without flipping the inequality direction.',
    category: 'mechanics',
    affectedSkills: [
      'math.im3.skill.1.7.solve-quadratic-inequalities-in-one-variable-by-graphing',
      'math.im3.skill.1.7.graph-quadratic-inequalities-in-two-variables',
    ],
    detectionSignals: [
      {
        distractorType: 'linear',
        description:
          'Distractor generator negates the solution value, surfacing the direction-flip on multiplication by a negative.',
      },
      {
        distractorType: 'quadratic_formula',
        description:
          'Distractor generator negates one of the boundary roots, surfacing the same direction-flip pattern in the inequality boundary set.',
      },
    ],
  },
} as const;

export type Im3MisconceptionTagSlug = keyof typeof IM3_MISCONCEPTION_TAGS_SOURCE;

export const IM3_MISCONCEPTION_TAGS: Readonly<
  Record<Im3MisconceptionTagSlug, Im3MisconceptionTagDefinition>
> = IM3_MISCONCEPTION_TAGS_SOURCE;

/**
 * Returns the definition for a canonical IM3 tag, or undefined if the slug
 * is not in the taxonomy. Useful for validation in tests and the
 * detection-mapping layer.
 */
export function getIm3MisconceptionTag(
  slug: string,
): Im3MisconceptionTagDefinition | undefined {
  return IM3_MISCONCEPTION_TAGS[slug as Im3MisconceptionTagSlug];
}

/**
 * Type guard: returns true when the slug is a canonical IM3 misconception tag.
 */
export function isCanonicalIm3MisconceptionTag(
  slug: string,
): slug is Im3MisconceptionTagSlug {
  return slug in IM3_MISCONCEPTION_TAGS;
}

/**
 * Returns all canonical IM3 tag slugs. Useful for validation, test
 * assertions, and the detection-mapping coherence checks.
 */
export function allIm3MisconceptionTagSlugs(): readonly Im3MisconceptionTagSlug[] {
  return Object.keys(IM3_MISCONCEPTION_TAGS) as Im3MisconceptionTagSlug[];
}
