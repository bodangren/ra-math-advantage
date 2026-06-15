// Misconception remediation loop — severity, lifecycle, and per-student state.
//
// kst-srs.v2 §9.1 + spec.md FR2/FR3: severity determines rating-cap behavior;
// lifecycle status tracks active/resolved transitions; per-student state
// persists the full misconception lifecycle record.

import { z } from 'zod';

// ---------------------------------------------------------------------------
// 1. MisconceptionSeverity — closed-set enum
// ---------------------------------------------------------------------------

export const misconceptionSeveritySchema = z.enum(['minor', 'severe']);

export type MisconceptionSeverity = z.infer<typeof misconceptionSeveritySchema>;

// ---------------------------------------------------------------------------
// 2. MisconceptionLifecycleStatus — closed-set enum
// ---------------------------------------------------------------------------

export const misconceptionLifecycleStatusSchema = z.enum(['active', 'resolved']);

export type MisconceptionLifecycleStatus = z.infer<typeof misconceptionLifecycleStatusSchema>;

// ---------------------------------------------------------------------------
// 3. StudentMisconceptionState — domain-neutral state record
// ---------------------------------------------------------------------------

export const studentMisconceptionStateSchema = z.object({
  studentId: z.string().min(1),
  misconceptionId: z.string().min(1),
  status: misconceptionLifecycleStatusSchema,
  severity: misconceptionSeveritySchema,
  cleanStreak: z.number().int().min(0),
  firstDetectedAt: z.number(),
  lastUpdatedAt: z.number(),
  affectedSkills: z.array(z.string().min(1)).min(1),
});

export type StudentMisconceptionState = z.infer<typeof studentMisconceptionStateSchema>;

// ---------------------------------------------------------------------------
// 4. getMisconceptionSeverity — canonical accessor
// ---------------------------------------------------------------------------

/**
 * Canonical severity accessor for a misconception node's metadata.
 *
 * Takes `metadata: Record<string, unknown>` (not a full KnowledgeSpaceNode)
 * so it stays a pure function with no cross-package dependency. Returns
 * 'minor' when metadata.severity is absent, undefined, or not a valid
 * MisconceptionSeverity value — this invariant is critical for Phase 2's
 * computeBaseRating truth table.
 */
export function getMisconceptionSeverity(
  metadata: Record<string, unknown>,
): MisconceptionSeverity {
  const result = misconceptionSeveritySchema.safeParse(metadata.severity);
  return result.success ? result.data : 'minor';
}
