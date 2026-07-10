import { describe, it, expect } from 'vitest';
import { aggregateCardsToEvidence, stabilityToRetention } from '../srs/srs-proficiency';
import type { ProficiencyCardInput, TimingBaselines } from '../srs/srs-proficiency';

describe('stabilityToRetention', () => {
  it('returns 1 at review time and 0.9 after one stability interval', () => {
    expect(stabilityToRetention(10, 0)).toBe(1);
    expect(stabilityToRetention(10, 10)).toBeCloseTo(0.9, 10);
  });

  it('matches the canonical v3 elapsed-time example', () => {
    expect(stabilityToRetention(10, 30)).toBeCloseTo(0.766, 3);
  });

  it('should return 0 for negative stability', () => {
    expect(stabilityToRetention(-10, 1)).toBe(0);
  });

  it('returns 0 for invalid elapsed time', () => {
    expect(stabilityToRetention(10, -1)).toBe(0);
    expect(stabilityToRetention(10, Number.NaN)).toBe(0);
  });

  it('handles infinite bounds deterministically', () => {
    expect(stabilityToRetention(Infinity, 30)).toBe(1);
    expect(stabilityToRetention(30, Infinity)).toBe(0);
  });
});

describe('aggregateCardsToEvidence', () => {
  const emptyBaselines: TimingBaselines = {};

  const makeCard = (overrides: Partial<ProficiencyCardInput> = {}): ProficiencyCardInput => ({
    stability: 30,
    elapsedDays: 0,
    difficulty: 3,
    reps: 0,
    lapses: 0,
        variantKey: 'pf1',
    ...overrides,
  });

  describe('empty input', () => {
    it('should return empty array for empty cards list', () => {
      const result = aggregateCardsToEvidence([], emptyBaselines);
      expect(result).toEqual([]);
    });
  });

  describe('retentionStrength', () => {
    it('should return high retentionStrength for single card with high stability', () => {
      const cards = [makeCard({ stability: 300, elapsedDays: 30, reps: 1 })];
      const result = aggregateCardsToEvidence(cards, emptyBaselines);
      expect(result[0].retentionStrength).toBeGreaterThan(0.9);
    });

    it('should return low retentionStrength for single card with zero stability', () => {
      const cards = [makeCard({ stability: 0, elapsedDays: 30, reps: 1 })];
      const result = aggregateCardsToEvidence(cards, emptyBaselines);
      expect(result[0].retentionStrength).toBe(0);
    });

    it('uses the minimum current retention across reviewed cards', () => {
      const cards = [
        makeCard({ stability: 20, elapsedDays: 5, reps: 1 }),
        makeCard({ stability: 8, elapsedDays: 12, reps: 1 }),
        makeCard({ stability: 1, elapsedDays: 100, reps: 0 }),
      ];
      const result = aggregateCardsToEvidence(cards, emptyBaselines);
      expect(result[0].retentionStrength).toBe(0.86);
    });
  });

  describe('practiceCoverage', () => {
    it('should return 0 coverage when no cards have been reviewed (reps = 0)', () => {
      const cards = [
        makeCard({ reps: 0 }),
        makeCard({ reps: 0 }),
      ];
      const result = aggregateCardsToEvidence(cards, emptyBaselines);
      expect(result[0].practiceCoverage).toBe(0);
    });

    it('should return 1 coverage when all cards have been reviewed (reps > 0)', () => {
      const cards = [
        makeCard({ reps: 1 }),
        makeCard({ reps: 5 }),
      ];
      const result = aggregateCardsToEvidence(cards, emptyBaselines);
      expect(result[0].practiceCoverage).toBe(1);
    });

    it('should return partial coverage when some cards have been reviewed', () => {
      const cards = [
        makeCard({ reps: 0 }),
        makeCard({ reps: 1 }),
        makeCard({ reps: 0 }),
        makeCard({ reps: 2 }),
      ];
      const result = aggregateCardsToEvidence(cards, emptyBaselines);
      expect(result[0].practiceCoverage).toBe(0.5);
    });
  });

  describe('multiple problem families', () => {
    it('should produce separate evidence entries for each problem family', () => {
      const cards = [
        makeCard({ variantKey: 'pf1' }),
        makeCard({ variantKey: 'pf2' }),
        makeCard({ variantKey: 'pf3' }),
      ];
      const result = aggregateCardsToEvidence(cards, emptyBaselines);
      expect(result).toHaveLength(3);
      expect(result.map((e) => e.variantKey).sort()).toEqual(['pf1', 'pf2', 'pf3']);
    });

    it('should group cards by problem family and compute per-family stats', () => {
      const cards = [
        makeCard({ variantKey: 'pf1', stability: 0, elapsedDays: 0, reps: 0 }),
        makeCard({ variantKey: 'pf1', stability: 300, elapsedDays: 30, reps: 5 }),
        makeCard({ variantKey: 'pf2', stability: 30, elapsedDays: 30, reps: 1 }),
      ];
      const result = aggregateCardsToEvidence(cards, emptyBaselines);
      const pf1 = result.find((e) => e.variantKey === 'pf1')!;
      const pf2 = result.find((e) => e.variantKey === 'pf2')!;
      expect(pf1.retentionStrength).toBe(0.99);
      expect(pf1.practiceCoverage).toBe(0.5);
      expect(pf2.retentionStrength).toBe(0.9);
      expect(pf2.practiceCoverage).toBe(1);
    });
  });

  describe('fluencyConfidence', () => {
    const baselinesWithMedian: TimingBaselines = {
      pf1: {
        variantKey: 'pf1',
        sampleCount: 20,
        medianActiveMs: 30000,
        minSamplesMet: true,
        lastComputedAt: new Date().toISOString(),
      },
    };

    it('should return none confidence when no timing data available', () => {
      const cards = [makeCard({ variantKey: 'pf1' })];
      const result = aggregateCardsToEvidence(cards, baselinesWithMedian);
      expect(result[0].fluencyConfidence).toBe('none');
      expect(result[0].timingReliable).toBe(false);
    });

    it('should return low confidence when review duration is slower than baseline', () => {
      const cards = [
        makeCard({
          variantKey: 'pf1',
          reviewDurationMs: 90000,
        }),
      ];
      const result = aggregateCardsToEvidence(cards, baselinesWithMedian);
      expect(result[0].fluencyConfidence).toBe('low');
      expect(result[0].timingReliable).toBe(true);
    });

    it('should return high confidence when review duration is faster than baseline', () => {
      const cards = [
        makeCard({
          variantKey: 'pf1',
          reviewDurationMs: 10000,
        }),
      ];
      const result = aggregateCardsToEvidence(cards, baselinesWithMedian);
      expect(result[0].fluencyConfidence).toBe('high');
      expect(result[0].timingReliable).toBe(true);
    });

    it('should return medium confidence when about half of reviews are fast', () => {
      const cards = [
        makeCard({ variantKey: 'pf1', reviewDurationMs: 10000 }),
        makeCard({ variantKey: 'pf1', reviewDurationMs: 90000 }),
      ];
      const result = aggregateCardsToEvidence(cards, baselinesWithMedian);
      expect(result[0].fluencyConfidence).toBe('medium');
    });

    it('should use baseline sample count from timing baselines', () => {
      const cards = [makeCard({ variantKey: 'pf1', reviewDurationMs: 10000 })];
      const result = aggregateCardsToEvidence(cards, baselinesWithMedian);
      expect(result[0].baselineSampleCount).toBe(20);
    });

    it('should not rely on timing when baseline minSamplesMet is false', () => {
      const baselinesWithoutMinSamples: TimingBaselines = {
        pf1: {
          variantKey: 'pf1',
          sampleCount: 5,
          medianActiveMs: 30000,
          minSamplesMet: false,
          lastComputedAt: new Date().toISOString(),
        },
      };
      const cards = [makeCard({ variantKey: 'pf1', reviewDurationMs: 10000 })];
      const result = aggregateCardsToEvidence(cards, baselinesWithoutMinSamples);
      expect(result[0].fluencyConfidence).toBe('none');
      expect(result[0].timingReliable).toBe(false);
    });
  });
});
