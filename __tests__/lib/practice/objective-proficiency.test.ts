import { describe, it, expect } from 'vitest';
import {
  computeObjectiveProficiency,
  buildStudentProficiencyView,
  buildTeacherProficiencyView,
  PRIORITY_DEFAULTS,
  type ProblemFamilyEvidence,
} from '@/lib/practice/objective-proficiency';

function makeEvidence(
  overrides: Partial<ProblemFamilyEvidence> = {}
): ProblemFamilyEvidence {
  return {
    problemFamilyId: 'family-a',
    retentionStrength: 1,
    practiceCoverage: 1,
    fluencyConfidence: 'high',
    baselineSampleCount: 10,
    timingReliable: true,
    ...overrides,
  };
}

describe('computeObjectiveProficiency', () => {
  describe('narrow objective with enough families reaches high confidence', () => {
    it('returns high evidence confidence when multiple families have complete evidence', () => {
      const result = computeObjectiveProficiency({
        objectiveId: '1a',
        priority: 'essential',
        problemFamilyEvidences: [
          makeEvidence({ problemFamilyId: 'a', retentionStrength: 1, practiceCoverage: 1 }),
          makeEvidence({ problemFamilyId: 'b', retentionStrength: 1, practiceCoverage: 1 }),
        ],
      });
      expect(result.evidenceConfidence).toBe('high');
    });

    it('returns high evidence confidence for supporting objective with adequate families', () => {
      const result = computeObjectiveProficiency({
        objectiveId: '1a',
        priority: 'supporting',
        problemFamilyEvidences: [
          makeEvidence({ problemFamilyId: 'a', retentionStrength: 1, practiceCoverage: 1 }),
        ],
      });
      expect(result.evidenceConfidence).toBe('high');
    });

    it('returns high evidence confidence for extension objective with minimal evidence', () => {
      const result = computeObjectiveProficiency({
        objectiveId: '1a',
        priority: 'extension',
        problemFamilyEvidences: [
          makeEvidence({ problemFamilyId: 'a', retentionStrength: 1, practiceCoverage: 1 }),
        ],
      });
      expect(result.evidenceConfidence).toBe('high');
    });
  });

  describe('broad essential objective requires configured evidence policy', () => {
    it('requires minProblemFamilies override for essential priority', () => {
      const result = computeObjectiveProficiency({
        objectiveId: '1a',
        priority: 'essential',
        problemFamilyEvidences: [
          makeEvidence({ problemFamilyId: 'a', retentionStrength: 1, practiceCoverage: 1 }),
        ],
        minProblemFamilies: 1,
      });
      expect(result.evidenceConfidence).toBe('high');
      expect(result.isProficient).toBe(true);
    });

    it('uses priority-based defaults when no override provided', () => {
      const result = computeObjectiveProficiency({
        objectiveId: '1a',
        priority: 'essential',
        problemFamilyEvidences: [
          makeEvidence({ problemFamilyId: 'a', retentionStrength: 1, practiceCoverage: 1 }),
        ],
      });
      expect(result.evidenceConfidence).toBe('medium');
      expect(result.isProficient).toBe(false);
      expect(result.reasons).toContain('insufficient_problem_families');
    });

    it('isProficient true when essential coverage threshold met', () => {
      const result = computeObjectiveProficiency({
        objectiveId: '1a',
        priority: 'essential',
        problemFamilyEvidences: [
          makeEvidence({ problemFamilyId: 'a', retentionStrength: 1, practiceCoverage: 1 }),
          makeEvidence({ problemFamilyId: 'b', retentionStrength: 1, practiceCoverage: 1 }),
          makeEvidence({ problemFamilyId: 'c', retentionStrength: 1, practiceCoverage: 1 }),
        ],
      });
      expect(result.evidenceConfidence).toBe('high');
      expect(result.isProficient).toBe(true);
    });
  });

  describe('triaged objective is excluded or labeled separately', () => {
    it('never marks triaged objective as proficient regardless of evidence', () => {
      const result = computeObjectiveProficiency({
        objectiveId: '1a',
        priority: 'triaged',
        problemFamilyEvidences: [
          makeEvidence({ problemFamilyId: 'a', retentionStrength: 1, practiceCoverage: 1 }),
          makeEvidence({ problemFamilyId: 'b', retentionStrength: 1, practiceCoverage: 1 }),
        ],
      });
      expect(result.isProficient).toBe(false);
      expect(result.reasons).toContain('objective_triaged');
    });

    it('still computes evidence confidence for triaged objectives', () => {
      const result = computeObjectiveProficiency({
        objectiveId: '1a',
        priority: 'triaged',
        problemFamilyEvidences: [
          makeEvidence({ problemFamilyId: 'a', retentionStrength: 1, practiceCoverage: 1 }),
        ],
      });
      expect(result.evidenceConfidence).toBe('high');
    });
  });

  describe('slow but correct work affects fluency confidence, not raw correctness', () => {
    it('fluencyConfidence low does not affect retentionStrength', () => {
      const result = computeObjectiveProficiency({
        objectiveId: '1a',
        priority: 'essential',
        problemFamilyEvidences: [
          makeEvidence({
            problemFamilyId: 'a',
            retentionStrength: 1,
            practiceCoverage: 1,
            fluencyConfidence: 'low',
            timingReliable: true,
          }),
        ],
        minProblemFamilies: 1,
      });
      expect(result.retentionStrength).toBe(1);
      expect(result.fluencyConfidence).toBe('low');
      expect(result.isProficient).toBe(true);
    });

    it('slow timing reflected in fluencyConfidence', () => {
      const result = computeObjectiveProficiency({
        objectiveId: '1a',
        priority: 'essential',
        problemFamilyEvidences: [
          makeEvidence({
            problemFamilyId: 'a',
            retentionStrength: 1,
            practiceCoverage: 1,
            fluencyConfidence: 'medium',
            timingReliable: true,
          }),
        ],
      });
      expect(result.fluencyConfidence).toBe('medium');
    });

    it('timingReliable false means fluencyConfidence is none', () => {
      const result = computeObjectiveProficiency({
        objectiveId: '1a',
        priority: 'essential',
        problemFamilyEvidences: [
          makeEvidence({
            problemFamilyId: 'a',
            retentionStrength: 1,
            practiceCoverage: 1,
            fluencyConfidence: 'high',
            timingReliable: false,
          }),
        ],
      });
      expect(result.fluencyConfidence).toBe('none');
    });
  });

  describe('retention and coverage are separate dimensions', () => {
    it('returns low retention when families have low retentionStrength', () => {
      const result = computeObjectiveProficiency({
        objectiveId: '1a',
        priority: 'essential',
        problemFamilyEvidences: [
          makeEvidence({ retentionStrength: 0.5, practiceCoverage: 1 }),
        ],
      });
      expect(result.retentionStrength).toBe(0.5);
    });

    it('returns low coverage when families have low practiceCoverage', () => {
      const result = computeObjectiveProficiency({
        objectiveId: '1a',
        priority: 'essential',
        problemFamilyEvidences: [
          makeEvidence({ retentionStrength: 1, practiceCoverage: 0.3 }),
        ],
      });
      expect(result.practiceCoverage).toBe(0.3);
    });

    it('averages across multiple families', () => {
      const result = computeObjectiveProficiency({
        objectiveId: '1a',
        priority: 'essential',
        problemFamilyEvidences: [
          makeEvidence({ problemFamilyId: 'a', retentionStrength: 1, practiceCoverage: 1 }),
          makeEvidence({ problemFamilyId: 'b', retentionStrength: 0.5, practiceCoverage: 0.5 }),
        ],
      });
      expect(result.retentionStrength).toBe(0.75);
      expect(result.practiceCoverage).toBe(0.75);
    });
  });

  describe('evidence confidence calculation', () => {
    it('returns none when no evidence provided', () => {
      const result = computeObjectiveProficiency({
        objectiveId: '1a',
        priority: 'essential',
        problemFamilyEvidences: [],
      });
      expect(result.evidenceConfidence).toBe('none');
    });

    it('returns low when only one family has partial evidence', () => {
      const result = computeObjectiveProficiency({
        objectiveId: '1a',
        priority: 'essential',
        problemFamilyEvidences: [
          makeEvidence({ retentionStrength: 0.5, practiceCoverage: 0.5 }),
        ],
      });
      expect(result.evidenceConfidence).toBe('low');
    });

    it('returns medium when evidence is incomplete but present', () => {
      const result = computeObjectiveProficiency({
        objectiveId: '1a',
        priority: 'essential',
        problemFamilyEvidences: [
          makeEvidence({ retentionStrength: 0.8, practiceCoverage: 0.8 }),
        ],
      });
      expect(result.evidenceConfidence).toBe('medium');
    });
  });

  describe('proficiency determination', () => {
    it('isProficient false when coverage below threshold', () => {
      const result = computeObjectiveProficiency({
        objectiveId: '1a',
        priority: 'essential',
        problemFamilyEvidences: [
          makeEvidence({ retentionStrength: 1, practiceCoverage: 0.5 }),
        ],
      });
      expect(result.isProficient).toBe(false);
      expect(result.reasons).toContain('coverage_below_threshold');
    });

    it('isProficient false when retention below threshold', () => {
      const result = computeObjectiveProficiency({
        objectiveId: '1a',
        priority: 'essential',
        problemFamilyEvidences: [
          makeEvidence({ retentionStrength: 0.5, practiceCoverage: 1 }),
        ],
      });
      expect(result.isProficient).toBe(false);
      expect(result.reasons).toContain('retention_below_threshold');
    });

    it('isProficient false when insufficient problem families', () => {
      const result = computeObjectiveProficiency({
        objectiveId: '1a',
        priority: 'essential',
        problemFamilyEvidences: [
          makeEvidence({ retentionStrength: 1, practiceCoverage: 1 }),
        ],
      });
      expect(result.isProficient).toBe(false);
      expect(result.reasons).toContain('insufficient_problem_families');
    });
  });

  describe('priority defaults', () => {
    it('essential has highest thresholds', () => {
      expect(PRIORITY_DEFAULTS.essential.minProblemFamilies).toBe(3);
      expect(PRIORITY_DEFAULTS.essential.minCoverageThreshold).toBe(0.7);
      expect(PRIORITY_DEFAULTS.essential.minRetentionThreshold).toBe(0.8);
    });

    it('supporting has moderate thresholds', () => {
      expect(PRIORITY_DEFAULTS.supporting.minProblemFamilies).toBe(2);
      expect(PRIORITY_DEFAULTS.supporting.minCoverageThreshold).toBe(0.5);
      expect(PRIORITY_DEFAULTS.supporting.minRetentionThreshold).toBe(0.7);
    });

    it('extension has lowest thresholds', () => {
      expect(PRIORITY_DEFAULTS.extension.minProblemFamilies).toBe(1);
      expect(PRIORITY_DEFAULTS.extension.minCoverageThreshold).toBe(0.3);
      expect(PRIORITY_DEFAULTS.extension.minRetentionThreshold).toBe(0.6);
    });

    it('triaged has zero thresholds (never proficient)', () => {
      expect(PRIORITY_DEFAULTS.triaged.minProblemFamilies).toBe(0);
      expect(PRIORITY_DEFAULTS.triaged.minCoverageThreshold).toBe(0);
      expect(PRIORITY_DEFAULTS.triaged.minRetentionThreshold).toBe(0);
    });
  });
});

describe('buildStudentProficiencyView', () => {
  it('returns not_started when no evidence', () => {
    const result = computeObjectiveProficiency({
      objectiveId: '1a',
      priority: 'essential',
      problemFamilyEvidences: [],
    });
    const view = buildStudentProficiencyView(result);
    expect(view.proficiencyLabel).toBe('not_started');
    expect(view.guidance).toContain('Start practicing');
  });

  it('returns in_progress when partial evidence', () => {
    const result = computeObjectiveProficiency({
      objectiveId: '1a',
      priority: 'essential',
      problemFamilyEvidences: [
        makeEvidence({ retentionStrength: 0.5, practiceCoverage: 0.5 }),
      ],
    });
    const view = buildStudentProficiencyView(result);
    expect(view.proficiencyLabel).toBe('in_progress');
    expect(view.guidance).toContain('Keep practicing');
  });

  it('returns proficient when isProficient true', () => {
    const result = computeObjectiveProficiency({
      objectiveId: '1a',
      priority: 'essential',
      problemFamilyEvidences: [
        makeEvidence({ retentionStrength: 1, practiceCoverage: 1 }),
        makeEvidence({ problemFamilyId: 'b', retentionStrength: 1, practiceCoverage: 1 }),
        makeEvidence({ problemFamilyId: 'c', retentionStrength: 1, practiceCoverage: 1 }),
      ],
      minProblemFamilies: 3,
    });
    const view = buildStudentProficiencyView(result);
    expect(view.proficiencyLabel).toBe('proficient');
    expect(view.guidance).toContain('Great work');
  });

  it('includes all three confidence dimensions', () => {
    const result = computeObjectiveProficiency({
      objectiveId: '1a',
      priority: 'essential',
      problemFamilyEvidences: [
        makeEvidence({ retentionStrength: 0.8, practiceCoverage: 0.9, fluencyConfidence: 'high' }),
      ],
    });
    const view = buildStudentProficiencyView(result);
    expect(view.retentionStrength).toBe(0.8);
    expect(view.practiceCoverage).toBe(0.9);
    expect(view.fluencyConfidence).toBe('high');
  });
});

describe('buildTeacherProficiencyView', () => {
  it('includes problem family details', () => {
    const result = computeObjectiveProficiency({
      objectiveId: '1a',
      priority: 'essential',
      problemFamilyEvidences: [
        makeEvidence({ problemFamilyId: 'family-a', retentionStrength: 0.9, practiceCoverage: 0.8 }),
        makeEvidence({ problemFamilyId: 'family-b', retentionStrength: 1, practiceCoverage: 1 }),
      ],
    });
    const view = buildTeacherProficiencyView(result, '1a', 'Graph quadratic functions');
    expect(view.problemFamilyDetails).toHaveLength(2);
    expect(view.problemFamilyDetails[0].problemFamilyId).toBe('family-a');
    expect(view.problemFamilyDetails[0].retentionStrength).toBe(0.9);
  });

  it('identifies missing baselines', () => {
    const result = computeObjectiveProficiency({
      objectiveId: '1a',
      priority: 'essential',
      problemFamilyEvidences: [
        makeEvidence({ problemFamilyId: 'a', baselineSampleCount: 0 }),
        makeEvidence({ problemFamilyId: 'b', baselineSampleCount: 10 }),
      ],
    });
    const view = buildTeacherProficiencyView(result, '1a', 'Graph quadratic functions');
    expect(view.missingBaselines).toContain('a');
    expect(view.missingBaselines).not.toContain('b');
  });

  it('identifies low confidence reasons', () => {
    const result = computeObjectiveProficiency({
      objectiveId: '1a',
      priority: 'essential',
      problemFamilyEvidences: [
        makeEvidence({ fluencyConfidence: 'low', timingReliable: true }),
      ],
    });
    const view = buildTeacherProficiencyView(result, '1a', 'Graph quadratic functions');
    expect(view.lowConfidenceReasons.some((r) => r.includes('fluency'))).toBe(true);
  });

  it('includes standard code and description', () => {
    const result = computeObjectiveProficiency({
      objectiveId: '1a',
      priority: 'essential',
      problemFamilyEvidences: [],
    });
    const view = buildTeacherProficiencyView(result, '1a', 'Graph quadratic functions');
    expect(view.standardCode).toBe('1a');
    expect(view.standardDescription).toBe('Graph quadratic functions');
  });
});