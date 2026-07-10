import { z } from 'zod';

/**
 * The only SRS-to-KST boundary accepted by the v3 core.
 *
 * SRS consumers aggregate cards, stability, and review timestamps before
 * crossing this boundary. Core receives learner evidence, never raw FSRS
 * scheduling state or formulas.
 */
export const objectiveStateEvidenceSchema = z.strictObject({
  objectiveId: z.string().min(1),
  retention: z.number().min(0).max(1).nullable(),
  retentionStrength: z.number().min(0).max(1),
  isProficient: z.boolean(),
  hasReviewHistory: z.boolean(),
  evidenceRefs: z.array(z.string().min(1)),
});

export type ObjectiveStateEvidence = z.infer<typeof objectiveStateEvidenceSchema>;

