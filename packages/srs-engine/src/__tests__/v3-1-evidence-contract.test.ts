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
});
