import { describe, expect, it } from 'vitest';
import { migratePlacementResultToV3_2 } from '@/lib/placement/v3-placement-migration';

describe('migratePlacementResultToV3_2', () => {
  it('preserves historic placement time and records direct evidence', () => {
    const result = migratePlacementResultToV3_2({
      studentId: 'student-1',
      nodeId: 'math.im3.skill.1.1',
      masteryEstimate: 0.8,
      confidence: 'medium',
      createdAt: 1_700_000_000_000,
    });

    expect(result.placementPatch).toEqual({
      evidenceType: 'direct',
      provenance: 'placement.v3.2-backfill',
      sourceTimestamp: 1_700_000_000_000,
      migrationVersion: 'kst-srs.v3.2',
    });
    expect(result.synthesizedCard).toMatchObject({
      objectiveId: 'math.im3.skill.1.1',
      state: 'review',
      reps: 1,
      lapses: 0,
      placement: {
        source: 'placement',
        evidenceType: 'direct',
        confidence: 'medium',
      },
    });
  });

  it('does not fabricate a review-log entry while migrating placement evidence', () => {
    const result = migratePlacementResultToV3_2({
      studentId: 'student-1',
      nodeId: 'math.im3.skill.1.1',
      masteryEstimate: 0.4,
      confidence: 'low',
      createdAt: 1_700_000_000_000,
    });

    expect(result).not.toHaveProperty('reviewLog');
    expect(result.synthesizedCard?.lastReview).toBe(new Date(1_700_000_000_000).toISOString());
  });

  it('does not synthesize a card for zero mastery evidence', () => {
    const result = migratePlacementResultToV3_2({
      studentId: 'student-1',
      nodeId: 'math.im3.skill.1.1',
      masteryEstimate: 0,
      confidence: 'low',
      createdAt: 1_700_000_000_000,
    });

    expect(result.synthesizedCard).toBeNull();
  });
});
