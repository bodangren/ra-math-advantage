import { describe, expect, it } from 'vitest';
import {
  PROFICIENCY_EVIDENCE_POLICY_VERSION,
  guessFloorRefSchema,
  practiceVariantEvidenceInputSchema,
  practiceVariantEvidenceResultSchema,
} from '../srs/proficiency-evidence-contract';

describe('v3.1 proficiency evidence contract', () => {
  it('versions attempt inputs and resolved guess-floor provenance', () => {
    expect(PROFICIENCY_EVIDENCE_POLICY_VERSION).toBe('proficiency-evidence.v3.1');
    expect(guessFloorRefSchema.parse({
      policyVersion: 'math-answer-formats.v1',
      answerFormat: 'multiple-choice-4',
      value: 0.25,
    }).value).toBe(0.25);
    expect(() => guessFloorRefSchema.parse({
      policyVersion: 'v1', answerFormat: 'mc', value: 1,
    })).toThrow();
  });

  it('rejects ambiguous attempt ordering and format drift', () => {
    const input = {
      policyVersion: PROFICIENCY_EVIDENCE_POLICY_VERSION,
      variantKey: 'variant-1',
      practiceCoverage: 0.5,
      guessFloor: {
        policyVersion: 'math-formats.v1',
        answerFormat: 'mc4',
        value: 0.25,
      },
      attempts: [
        { attemptId: 'a1', sequence: 0, isCorrect: true, answerFormat: 'mc4' },
        { attemptId: 'a2', sequence: 0, isCorrect: false, answerFormat: 'free-response' },
      ],
    };
    expect(practiceVariantEvidenceInputSchema.safeParse(input).success).toBe(false);
  });

  it('requires auditable confidence diagnostics on results', () => {
    expect(practiceVariantEvidenceResultSchema.safeParse({
      policyVersion: PROFICIENCY_EVIDENCE_POLICY_VERSION,
      variantKey: 'variant-1',
      retentionStrength: 0.388,
      practiceCoverage: 0.8,
      fluencyConfidence: 'medium',
      baselineSampleCount: 12,
      timingReliable: true,
      rawAttemptCount: 5,
      effectiveSampleSize: 5,
      weightedCorrectnessRate: 0.8,
      wilsonLowerBound: 0.541,
      guessFloor: { policyVersion: 'v1', answerFormat: 'mc4', value: 0.25 },
      evidenceConfidenceCap: 'medium',
      diagnosticReasons: ['small_sample_medium_cap'],
    }).success).toBe(true);
  });

  it('rejects high confidence caps and duplicate diagnostics', () => {
    const validResult = {
      policyVersion: PROFICIENCY_EVIDENCE_POLICY_VERSION,
      variantKey: 'variant-1',
      retentionStrength: 0.388,
      practiceCoverage: 0.8,
      fluencyConfidence: 'medium',
      baselineSampleCount: 12,
      timingReliable: true,
      rawAttemptCount: 5,
      effectiveSampleSize: 5,
      weightedCorrectnessRate: 0.8,
      wilsonLowerBound: 0.541,
      guessFloor: { policyVersion: 'v1', answerFormat: 'mc4', value: 0.25 },
      evidenceConfidenceCap: 'medium',
      diagnosticReasons: ['small_sample_medium_cap'],
    } as const;

    expect(practiceVariantEvidenceResultSchema.safeParse({
      ...validResult,
      evidenceConfidenceCap: 'high',
    }).success).toBe(false);
    expect(practiceVariantEvidenceResultSchema.safeParse({
      ...validResult,
      diagnosticReasons: ['small_sample_medium_cap', 'small_sample_medium_cap'],
    }).success).toBe(false);
  });

  it('requires no-attempt results to fail closed with zero evidence', () => {
    const noAttempts = {
      policyVersion: PROFICIENCY_EVIDENCE_POLICY_VERSION,
      variantKey: 'variant-1',
      retentionStrength: 0,
      practiceCoverage: 0.8,
      fluencyConfidence: 'none',
      baselineSampleCount: 0,
      timingReliable: false,
      rawAttemptCount: 0,
      effectiveSampleSize: 0,
      weightedCorrectnessRate: 0,
      wilsonLowerBound: 0,
      guessFloor: { policyVersion: 'v1', answerFormat: 'mc4', value: 0.25 },
      evidenceConfidenceCap: 'none',
      diagnosticReasons: ['no_attempts', 'missing_timing_baseline'],
    } as const;

    expect(practiceVariantEvidenceResultSchema.safeParse(noAttempts).success).toBe(true);
    for (const field of [
      'effectiveSampleSize',
      'weightedCorrectnessRate',
      'wilsonLowerBound',
      'retentionStrength',
    ] as const) {
      expect(practiceVariantEvidenceResultSchema.safeParse({
        ...noAttempts,
        [field]: 0.1,
      }).success, field).toBe(false);
    }
    expect(practiceVariantEvidenceResultSchema.safeParse({
      ...noAttempts,
      evidenceConfidenceCap: 'low',
    }).success).toBe(false);
    expect(practiceVariantEvidenceResultSchema.safeParse({
      ...noAttempts,
      diagnosticReasons: ['missing_timing_baseline'],
    }).success).toBe(false);
  });

  it('enforces timing reliability and conservative Wilson consistency', () => {
    const validResult = {
      policyVersion: PROFICIENCY_EVIDENCE_POLICY_VERSION,
      variantKey: 'variant-1',
      retentionStrength: 0.5,
      practiceCoverage: 0.8,
      fluencyConfidence: 'high',
      baselineSampleCount: 12,
      timingReliable: true,
      rawAttemptCount: 6,
      effectiveSampleSize: 5.8,
      weightedCorrectnessRate: 0.8,
      wilsonLowerBound: 0.6,
      guessFloor: { policyVersion: 'v1', answerFormat: 'mc4', value: 0.2 },
      evidenceConfidenceCap: null,
      diagnosticReasons: [],
    } as const;

    expect(practiceVariantEvidenceResultSchema.safeParse(validResult).success).toBe(true);
    expect(practiceVariantEvidenceResultSchema.safeParse({
      ...validResult,
      baselineSampleCount: 5,
    }).success).toBe(false);
    expect(practiceVariantEvidenceResultSchema.safeParse({
      ...validResult,
      timingReliable: false,
    }).success).toBe(false);
    expect(practiceVariantEvidenceResultSchema.safeParse({
      ...validResult,
      wilsonLowerBound: 0.9,
    }).success).toBe(false);
  });
});
