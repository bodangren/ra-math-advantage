import { describe, expect, it } from 'vitest';

import {
  SRS_CONTRACT_VERSION,
  SRS_CONTRACT_VERSION_LEGACY,
  isDailyQueueResult,
  isPlacementEstimate,
  isPlacementSeededCard,
} from '../index';

describe('srs.contract.v3 contract surface', () => {
  it('versions the canonical contract while retaining an explicit legacy identifier', () => {
    expect(SRS_CONTRACT_VERSION).toBe('srs.contract.v3');
    expect(SRS_CONTRACT_VERSION_LEGACY).toBe('srs.contract.v1');
  });

  it('validates direct and inferred placement estimates including high confidence', () => {
    expect(isPlacementEstimate({
      nodeId: 'math.im3.skill-a',
      masteryEstimate: 0.92,
      confidence: 'high',
      evidenceType: 'direct',
      inferenceDepth: 0,
    })).toBe(true);
    expect(isPlacementEstimate({
      nodeId: 'math.im3.skill-b',
      masteryEstimate: 0.7,
      confidence: 'medium',
      evidenceType: 'inferred',
      inferenceDepth: 2,
    })).toBe(true);
    expect(isPlacementEstimate({
      nodeId: 'math.im3.skill-b',
      masteryEstimate: 1.1,
      confidence: 'medium',
      evidenceType: 'inferred',
      inferenceDepth: 2,
    })).toBe(false);
    expect(isPlacementEstimate({
      nodeId: 'math.im3.skill-b',
      masteryEstimate: 0.7,
      confidence: 'medium',
      evidenceType: 'direct',
      inferenceDepth: 1,
    })).toBe(false);
  });

  it('validates synthesized placement card provenance', () => {
    expect(isPlacementSeededCard({
      cardId: 'placement:student-1:math.im3.skill-a',
      studentId: 'student-1',
      objectiveId: 'math.im3.skill-a',
      variantKey: 'math.im3.skill-a',
      stability: 13.8,
      difficulty: 5,
      state: 'review',
      dueDate: '2026-07-20T00:00:00.000Z',
      elapsedDays: 0,
      scheduledDays: 14,
      reps: 1,
      lapses: 0,
      lastReview: '2026-07-10T00:00:00.000Z',
      createdAt: '2026-07-10T00:00:00.000Z',
      updatedAt: '2026-07-10T00:00:00.000Z',
      placement: {
        source: 'placement',
        evidenceType: 'direct',
        confidence: 'high',
        inferenceDepth: 0,
        placedAt: '2026-07-10T00:00:00.000Z',
      },
    })).toBe(true);
  });

  it('validates additive daily queue result metadata', () => {
    expect(isDailyQueueResult({
      items: [],
      backlog: true,
      dueReviewCount: 25,
      deferredReviewCount: 5,
      newCardsSuppressed: true,
    })).toBe(true);
    expect(isDailyQueueResult({
      items: [],
      backlog: false,
      dueReviewCount: -1,
      deferredReviewCount: 0,
      newCardsSuppressed: false,
    })).toBe(false);
  });
});

