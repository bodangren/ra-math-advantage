import { z } from 'zod';

export const PROFICIENCY_EVIDENCE_POLICY_VERSION = 'proficiency-evidence.v3.1' as const;

export const EVIDENCE_DIAGNOSTIC_REASONS = [
  'no_attempts',
  'small_sample_low_cap',
  'small_sample_medium_cap',
  'guess_floor_removed_signal',
  'missing_timing_baseline',
  'insufficient_timing_baseline',
  'unreliable_timing',
] as const;

export const guessFloorRefSchema = z.strictObject({
  policyVersion: z.string().min(1),
  answerFormat: z.string().min(1),
  value: z.number().finite().min(0).lt(1),
});

export const practiceAttemptEvidenceSchema = z.strictObject({
  attemptId: z.string().min(1),
  sequence: z.number().int().nonnegative(),
  isCorrect: z.boolean(),
  answerFormat: z.string().min(1),
  observedAt: z.string().datetime().optional(),
});

export const practiceVariantEvidenceInputSchema = z.strictObject({
  policyVersion: z.literal(PROFICIENCY_EVIDENCE_POLICY_VERSION),
  variantKey: z.string().min(1),
  attempts: z.array(practiceAttemptEvidenceSchema),
  practiceCoverage: z.number().finite().min(0).max(1),
  guessFloor: guessFloorRefSchema,
}).superRefine((input, ctx) => {
  const ids = new Set<string>();
  const sequences = new Set<number>();
  input.attempts.forEach((attempt, index) => {
    if (ids.has(attempt.attemptId)) {
      ctx.addIssue({ code: 'custom', path: ['attempts', index, 'attemptId'], message: 'attemptId must be unique' });
    }
    if (sequences.has(attempt.sequence)) {
      ctx.addIssue({ code: 'custom', path: ['attempts', index, 'sequence'], message: 'sequence must be unique' });
    }
    if (attempt.answerFormat !== input.guessFloor.answerFormat) {
      ctx.addIssue({ code: 'custom', path: ['attempts', index, 'answerFormat'], message: 'answerFormat must match guess-floor provenance' });
    }
    ids.add(attempt.attemptId);
    sequences.add(attempt.sequence);
  });
});

const evidenceConfidenceSchema = z.enum(['none', 'low', 'medium', 'high']);

export const practiceVariantEvidenceResultSchema = z.strictObject({
  policyVersion: z.literal(PROFICIENCY_EVIDENCE_POLICY_VERSION),
  variantKey: z.string().min(1),
  retentionStrength: z.number().finite().min(0).max(1),
  practiceCoverage: z.number().finite().min(0).max(1),
  fluencyConfidence: evidenceConfidenceSchema,
  baselineSampleCount: z.number().int().nonnegative(),
  timingReliable: z.boolean(),
  rawAttemptCount: z.number().int().nonnegative(),
  effectiveSampleSize: z.number().finite().nonnegative(),
  weightedCorrectnessRate: z.number().finite().min(0).max(1),
  wilsonLowerBound: z.number().finite().min(0).max(1),
  guessFloor: guessFloorRefSchema,
  evidenceConfidenceCap: evidenceConfidenceSchema.nullable(),
  diagnosticReasons: z.array(z.enum(EVIDENCE_DIAGNOSTIC_REASONS)),
});

export type GuessFloorRef = z.infer<typeof guessFloorRefSchema>;
export type PracticeAttemptEvidence = z.infer<typeof practiceAttemptEvidenceSchema>;
export type PracticeVariantEvidenceInputV31 = z.infer<typeof practiceVariantEvidenceInputSchema>;
export type PracticeVariantEvidenceResultV31 = z.infer<typeof practiceVariantEvidenceResultSchema>;
