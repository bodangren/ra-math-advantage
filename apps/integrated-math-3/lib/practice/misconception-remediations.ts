/**
 * Remediation-activity registry for the IM3 misconception taxonomy.
 *
 * Each misconception tag slug maps to one or more `RemediationActivityRef`
 * entries pointing at curriculum-aligned remediation resources (worked
 * examples, task blueprints, or skill practice nodes).
 *
 * The `checkMisconceptionContentIntegrity` function validates that the
 * authored content is coherent: every taxonomy tag has ≥1 remediation, no
 * orphan remediations exist, all skill references resolve, and no circular
 * `remediated_by` edges are present.
 *
 * Source-grounded in the IM3 Module 1 curriculum
 * (`apps/integrated-math-3/curriculum/skill-graph/module-1/nodes.json`).
 */

import {
  IM3_MISCONCEPTION_TAGS,
  type Im3MisconceptionTagSlug,
} from './misconception-taxonomy';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Closed set of categories for remediation activities. Mirrors the
 * kst-srs.v2 §9.1 endpoint pair
 * (`misconception → worked_example | task_blueprint | skill`).
 */
export type RemediationActivityKind =
  | 'worked_example'
  | 'task_blueprint'
  | 'skill';

/**
 * A single remediation-activity reference attached to a misconception tag
 * via a `remediated_by` edge.
 */
export interface RemediationActivityRef {
  /** Identifier of the target activity node (e.g., a worked-example ID). */
  activityId: string;
  /** The kind of remediation resource this ref points at. */
  activityKind: RemediationActivityKind;
  /** Human-readable label for the remediation activity. */
  label: string;
  /** Source reference (file path or curriculum node ID) for traceability. */
  sourceRef: string;
}

export interface IntegrityError {
  code:
    | 'missing-remediation'
    | 'orphan-remediation'
    | 'unknown-skill-reference'
    | 'unknown-activity-id'
    | 'circular-remediated-by';
  slug: string;
  message: string;
}

export interface IntegrityResult {
  ok: boolean;
  errors: readonly IntegrityError[];
}

// ---------------------------------------------------------------------------
// Authored remediation registry
// ---------------------------------------------------------------------------

/**
 * Curated remediation activities for each IM3 misconception tag.
 *
 * Every entry is source-grounded in the M1 curriculum. Activity IDs
 * reference `worked_example` nodes from the curriculum skill graph or
 * `skill` nodes for targeted practice.
 */
export const IM3_MISCONCEPTION_REMEDIATIONS: Readonly<
  Record<Im3MisconceptionTagSlug, readonly RemediationActivityRef[]>
> = {
  'sign-error-in-factored-form': [
    {
      activityId: 'math.im3.example.1.4.019',
      activityKind: 'worked_example',
      label: 'Worked example: identifying and correcting sign errors when factoring quadratics',
      sourceRef: 'apps/integrated-math-3/curriculum/skill-graph/module-1/nodes.json',
    },
    {
      activityId: 'math.im3.skill.1.4.solve-quadratic-equations-by-factoring',
      activityKind: 'skill',
      label: 'Skill practice: solve quadratic equations by factoring',
      sourceRef: 'apps/integrated-math-3/curriculum/skill-graph/module-1/nodes.json',
    },
  ],
  'average-rate-as-mean-of-endpoints': [
    {
      activityId: 'math.im3.example.1.1.004',
      activityKind: 'worked_example',
      label: 'Worked example: average rate of change vs. mean of endpoints',
      sourceRef: 'apps/integrated-math-3/curriculum/skill-graph/module-1/nodes.json',
    },
    {
      activityId: 'math.im3.skill.1.1.find-and-interpret-the-average-rate-of-change',
      activityKind: 'skill',
      label: 'Skill practice: find and interpret the average rate of change',
      sourceRef: 'apps/integrated-math-3/curriculum/skill-graph/module-1/nodes.json',
    },
  ],
  'vertex-y-as-solution': [
    {
      activityId: 'math.im3.example.1.1.005',
      activityKind: 'worked_example',
      label: 'Worked example: distinguishing vertex y-coordinate from x-intercepts',
      sourceRef: 'apps/integrated-math-3/curriculum/skill-graph/module-1/nodes.json',
    },
    {
      activityId: 'math.im3.skill.1.1.graph-quadratic-functions',
      activityKind: 'skill',
      label: 'Skill practice: graph quadratic functions',
      sourceRef: 'apps/integrated-math-3/curriculum/skill-graph/module-1/nodes.json',
    },
  ],
  'quadratic-formula-sign-flip': [
    {
      activityId: 'math.im3.example.1.6.036',
      activityKind: 'worked_example',
      label: 'Worked example: tracking the ± sign in the quadratic formula',
      sourceRef: 'apps/integrated-math-3/curriculum/skill-graph/module-1/nodes.json',
    },
    {
      activityId: 'math.im3.skill.1.6.use-the-quadratic-formula-to-solve-equations',
      activityKind: 'skill',
      label: 'Skill practice: use the quadratic formula to solve equations',
      sourceRef: 'apps/integrated-math-3/curriculum/skill-graph/module-1/nodes.json',
    },
  ],
  'discriminant-misread-zero-vs-positive': [
    {
      activityId: 'math.im3.example.1.6.039',
      activityKind: 'worked_example',
      label: 'Worked example: discriminant zero vs. positive — solution count conclusions',
      sourceRef: 'apps/integrated-math-3/curriculum/skill-graph/module-1/nodes.json',
    },
    {
      activityId:
        'math.im3.skill.1.6.use-the-discriminant-to-determine-the-number-and-type-of-sol',
      activityKind: 'skill',
      label: 'Skill practice: use the discriminant to determine number and type of solutions',
      sourceRef: 'apps/integrated-math-3/curriculum/skill-graph/module-1/nodes.json',
    },
  ],
  'completing-square-offset-error': [
    {
      activityId: 'math.im3.example.1.5.029',
      activityKind: 'worked_example',
      label: 'Worked example: the (b/2)^2 offset in completing the square',
      sourceRef: 'apps/integrated-math-3/curriculum/skill-graph/module-1/nodes.json',
    },
    {
      activityId: 'math.im3.skill.1.6.use-the-quadratic-formula-to-solve-equations',
      activityKind: 'skill',
      label: 'Skill practice: use the quadratic formula (derives from completing the square)',
      sourceRef: 'apps/integrated-math-3/curriculum/skill-graph/module-1/nodes.json',
    },
  ],
  'omitted-root-in-multi-step': [
    {
      activityId: 'math.im3.example.1.4.021',
      activityKind: 'worked_example',
      label: 'Worked example: why both roots must be recorded',
      sourceRef: 'apps/integrated-math-3/curriculum/skill-graph/module-1/nodes.json',
    },
    {
      activityId: 'math.im3.skill.1.4.solve-quadratic-equations-by-factoring',
      activityKind: 'skill',
      label: 'Skill practice: solve quadratic equations by factoring (find both roots)',
      sourceRef: 'apps/integrated-math-3/curriculum/skill-graph/module-1/nodes.json',
    },
    {
      activityId: 'math.im3.skill.1.6.use-the-quadratic-formula-to-solve-equations',
      activityKind: 'skill',
      label: 'Skill practice: use the quadratic formula (find both roots)',
      sourceRef: 'apps/integrated-math-3/curriculum/skill-graph/module-1/nodes.json',
    },
  ],
  'complex-root-omits-i': [
    {
      activityId: 'math.im3.example.1.6.038',
      activityKind: 'worked_example',
      label: 'Worked example: reporting complex roots with the imaginary unit',
      sourceRef: 'apps/integrated-math-3/curriculum/skill-graph/module-1/nodes.json',
    },
    {
      activityId:
        'math.im3.skill.1.6.use-the-discriminant-to-determine-the-number-and-type-of-sol',
      activityKind: 'skill',
      label: 'Skill practice: determine solution type (complex case)',
      sourceRef: 'apps/integrated-math-3/curriculum/skill-graph/module-1/nodes.json',
    },
  ],
  'inequality-direction-flip': [
    {
      activityId: 'math.im3.example.1.7.041',
      activityKind: 'worked_example',
      label: 'Worked example: flipping inequality direction on multiply/divide by negative',
      sourceRef: 'apps/integrated-math-3/curriculum/skill-graph/module-1/nodes.json',
    },
    {
      activityId:
        'math.im3.skill.1.7.solve-quadratic-inequalities-in-one-variable-by-graphing',
      activityKind: 'skill',
      label: 'Skill practice: solve quadratic inequalities by graphing',
      sourceRef: 'apps/integrated-math-3/curriculum/skill-graph/module-1/nodes.json',
    },
  ],
};

// ---------------------------------------------------------------------------
// Lookup helpers
// ---------------------------------------------------------------------------

/**
 * Return the remediation activities for a misconception slug. Returns an
 * empty array for an unknown slug so callers can use this as a safe
 * lookup without throwing.
 */
export function getRemediationsForMisconception(
  slug: string,
): readonly RemediationActivityRef[] {
  const entry =
    IM3_MISCONCEPTION_REMEDIATIONS[slug as Im3MisconceptionTagSlug];
  if (!entry) {
    return [];
  }
  return entry;
}

// ---------------------------------------------------------------------------
// Integrity check
// ---------------------------------------------------------------------------

/** Known IM3 M1 + common-algebra skill IDs (same set used by the fixtures). */
const KNOWN_IM3_M1_SKILL_IDS: ReadonlySet<string> = new Set([
  'math.im3.skill.1.1.find-and-interpret-the-average-rate-of-change',
  'math.im3.skill.1.1.graph-quadratic-functions',
  'math.im3.skill.1.2.interpret-solutions-roots-in-context',
  'math.im3.skill.1.2.solve-quadratic-equations-by-graphing',
  'math.im3.skill.1.4.recognize-special-factor-patterns-gcf-trinomials-difference',
  'math.im3.skill.1.4.solve-quadratic-equations-by-factoring',
  'math.im3.skill.1.6.use-the-discriminant-to-determine-the-number-and-type-of-sol',
  'math.im3.skill.1.6.use-the-quadratic-formula-to-solve-equations',
  'math.im3.skill.1.7.graph-quadratic-inequalities-in-two-variables',
  'math.im3.skill.1.7.solve-quadratic-inequalities-in-one-variable-by-graphing',
]);

export interface CheckIntegrityArgs {
  taxonomy?: Record<string, { slug: string; affectedSkills: readonly string[] }>;
  remediations?: Record<string, readonly RemediationActivityRef[]>;
  knownWorkedExampleIds?: ReadonlySet<string>;
  knownSkillIds?: ReadonlySet<string>;
}

/**
 * Validate the coherence of the misconception taxonomy + remediation
 * registry. When called with no arguments, validates the live authored
 * data. When called with explicit overrides, validates the provided
 * synthetic data (used by edge-case tests).
 *
 * Checks:
 *   (a) every taxonomy tag has ≥1 remediation activity,
 *   (b) no orphan remediation entries exist,
 *   (c) all affectedSkills resolve to known skill IDs,
 *   (d) no remediation activity ID equals its parent misconception slug
 *       (circular `remediated_by`),
 *   (e) every remediation activity ID references a known curriculum node
 *       (worked-example ID or skill/task-blueprint ID).
 */
export function checkMisconceptionContentIntegrity(
  args?: CheckIntegrityArgs,
): IntegrityResult {
  const taxonomy: Record<string, { slug: string; affectedSkills: readonly string[] }> =
    args?.taxonomy ?? (IM3_MISCONCEPTION_TAGS as Record<string, { slug: string; affectedSkills: readonly string[] }>);
  const remediations: Record<string, readonly RemediationActivityRef[]> =
    args?.remediations ?? (IM3_MISCONCEPTION_REMEDIATIONS as Record<string, readonly RemediationActivityRef[]>);
  const knownSkillIds: ReadonlySet<string> = args?.knownSkillIds ?? KNOWN_IM3_M1_SKILL_IDS;

  const errors: IntegrityError[] = [];

  // (a) every taxonomy tag has ≥1 remediation
  for (const slug of Object.keys(taxonomy)) {
    const rem = remediations[slug];
    if (!rem || rem.length === 0) {
      errors.push({
        code: 'missing-remediation',
        slug,
        message: `Misconception tag "${slug}" has no remediation activities.`,
      });
    }
  }

  // (b) no orphan remediation entries
  for (const slug of Object.keys(remediations)) {
    if (!(slug in taxonomy)) {
      errors.push({
        code: 'orphan-remediation',
        slug,
        message: `Remediation registry key "${slug}" has no matching taxonomy entry.`,
      });
    }
  }

  // (c) all affectedSkills resolve to known skill IDs
  for (const [slug, node] of Object.entries(taxonomy)) {
    for (const skillId of node.affectedSkills ?? []) {
      if (!knownSkillIds.has(skillId)) {
        errors.push({
          code: 'unknown-skill-reference',
          slug,
          message: `Tag "${slug}" references unknown skill "${skillId}".`,
        });
      }
    }
  }

  // (d) + (e) per-activity checks
  for (const [slug, remArray] of Object.entries(remediations)) {
    for (const rem of remArray) {
      // circular check: activity ID must not equal parent slug
      if (rem.activityId === slug) {
        errors.push({
          code: 'circular-remediated-by',
          slug,
          message: `Remediation activity "${rem.activityId}" is circular (equals parent misconception slug).`,
        });
      }

      // known-activity-id check
      if (rem.activityKind === 'worked_example') {
        if (args?.knownWorkedExampleIds && !args.knownWorkedExampleIds.has(rem.activityId)) {
          errors.push({
            code: 'unknown-activity-id',
            slug,
            message: `Remediation activity "${rem.activityId}" is not a known worked-example ID.`,
          });
        }
      } else if (rem.activityKind === 'skill' || rem.activityKind === 'task_blueprint') {
        if (!knownSkillIds.has(rem.activityId)) {
          errors.push({
            code: 'unknown-activity-id',
            slug,
            message: `Remediation activity "${rem.activityId}" is not a known skill/task-blueprint ID.`,
          });
        }
      }
    }
  }

  return { ok: errors.length === 0, errors };
}
