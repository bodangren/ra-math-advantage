import { z } from 'zod';

/**
 * Difficulty levels for problem families.
 *
 * - introductory: Foundational problems suitable for first exposure
 * - standard: Typical grade-level problems
 * - challenging: Advanced problems requiring deeper reasoning
 */
export const DIFFICULTY_VALUES = [
  'introductory',
  'standard',
  'challenging',
] as const;

export type Difficulty = (typeof DIFFICULTY_VALUES)[number];

export const difficultySchema = z.enum(DIFFICULTY_VALUES);

/**
 * A problem family groups equivalent practice items that test the same objectives.
 *
 * Problem families provide the stable identity needed for SRS card creation and
 * timing baseline computation. Multiple activities (practice items) can map to
 * the same problem family, allowing students to see different variants of
 * conceptually equivalent problems.
 */
export type ProblemFamily = {
  /** Stable identifier for the problem family (e.g. "graphing-explorer:quadratic-transformations") */
  problemFamilyId: string;

  /** Reference to the activity component key used to render items in this family */
  componentKey: string;

  /** Human-readable name for the problem family */
  displayName: string;

  /** Detailed description of what this family covers */
  description: string;

  /** List of competency standard IDs this family assesses */
  objectiveIds: string[];

  /** Difficulty level for items in this family */
  difficulty: Difficulty;

  /** Additional metadata (arbitrary key-value pairs) */
  metadata: Record<string, unknown>;
};

export const problemFamilySchema = z.object({
  problemFamilyId: z.string().trim().min(1),
  componentKey: z.string().trim().min(1),
  displayName: z.string().trim().min(1),
  description: z.string().trim().min(1),
  objectiveIds: z.array(z.string().trim().min(1)),
  difficulty: difficultySchema,
  metadata: z.record(z.string(), z.unknown()),
});

export type ProblemFamilyInput = z.input<typeof problemFamilySchema>;
