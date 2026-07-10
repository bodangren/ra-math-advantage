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
const evidenceConfidenceCapSchema = z.enum(['none', 'low', 'medium']);

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
  evidenceConfidenceCap: evidenceConfidenceCapSchema.nullable(),
  diagnosticReasons: z.array(z.enum(EVIDENCE_DIAGNOSTIC_REASONS)),
}).superRefine((result, ctx) => {
  const diagnostics = new Set(result.diagnosticReasons);
  if (diagnostics.size !== result.diagnosticReasons.length) {
    ctx.addIssue({
      code: 'custom',
      path: ['diagnosticReasons'],
      message: 'diagnostic reasons must be unique',
    });
  }

  if (result.wilsonLowerBound > result.weightedCorrectnessRate) {
    ctx.addIssue({
      code: 'custom',
      path: ['wilsonLowerBound'],
      message: 'Wilson lower bound cannot exceed weighted correctness',
    });
  }

  if (result.rawAttemptCount === 0) {
    const zeroFields = [
      ['effectiveSampleSize', result.effectiveSampleSize],
      ['weightedCorrectnessRate', result.weightedCorrectnessRate],
      ['wilsonLowerBound', result.wilsonLowerBound],
      ['retentionStrength', result.retentionStrength],
    ] as const;
    zeroFields.forEach(([path, value]) => {
      if (value !== 0) {
        ctx.addIssue({
          code: 'custom',
          path: [path],
          message: `${path} must be zero without attempts`,
        });
      }
    });
    if (result.evidenceConfidenceCap !== 'none') {
      ctx.addIssue({
        code: 'custom',
        path: ['evidenceConfidenceCap'],
        message: 'evidence confidence must be capped at none without attempts',
      });
    }
    if (!diagnostics.has('no_attempts')) {
      ctx.addIssue({
        code: 'custom',
        path: ['diagnosticReasons'],
        message: 'no-attempt evidence must include the no_attempts diagnostic',
      });
    }
  } else if (diagnostics.has('no_attempts')) {
    ctx.addIssue({
      code: 'custom',
      path: ['diagnosticReasons'],
      message: 'no_attempts is invalid when attempts are present',
    });
  }

  const timingDiagnostics = [
    'missing_timing_baseline',
    'insufficient_timing_baseline',
    'unreliable_timing',
  ] as const;
  const presentTimingDiagnostics = timingDiagnostics.filter((reason) => diagnostics.has(reason));

  if (result.timingReliable) {
    if (result.baselineSampleCount < 10) {
      ctx.addIssue({
        code: 'custom',
        path: ['baselineSampleCount'],
        message: 'reliable timing requires at least ten baseline samples',
      });
    }
    if (presentTimingDiagnostics.length > 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['diagnosticReasons'],
        message: 'reliable timing cannot include a timing failure diagnostic',
      });
    }
  } else {
    if (result.fluencyConfidence !== 'none') {
      ctx.addIssue({
        code: 'custom',
        path: ['fluencyConfidence'],
        message: 'unreliable timing cannot contribute fluency confidence',
      });
    }
    if (presentTimingDiagnostics.length !== 1) {
      ctx.addIssue({
        code: 'custom',
        path: ['diagnosticReasons'],
        message: 'unreliable timing requires exactly one timing diagnostic',
      });
    }
    if (diagnostics.has('missing_timing_baseline') && result.baselineSampleCount !== 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['baselineSampleCount'],
        message: 'a missing timing baseline must have zero samples',
      });
    }
    if (diagnostics.has('insufficient_timing_baseline') && result.baselineSampleCount >= 10) {
      ctx.addIssue({
        code: 'custom',
        path: ['baselineSampleCount'],
        message: 'an insufficient timing baseline must have fewer than ten samples',
      });
    }
    if (diagnostics.has('unreliable_timing') && result.baselineSampleCount < 10) {
      ctx.addIssue({
        code: 'custom',
        path: ['baselineSampleCount'],
        message: 'unreliable timing requires a sufficiently sampled baseline',
      });
    }
  }
});

export type GuessFloorRef = z.infer<typeof guessFloorRefSchema>;
export type PracticeAttemptEvidence = z.infer<typeof practiceAttemptEvidenceSchema>;
export type PracticeVariantEvidenceInputV31 = z.infer<typeof practiceVariantEvidenceInputSchema>;
export type PracticeVariantEvidenceResultV31 = z.infer<typeof practiceVariantEvidenceResultSchema>;
export type EvidenceDiagnosticReason = typeof EVIDENCE_DIAGNOSTIC_REASONS[number];
