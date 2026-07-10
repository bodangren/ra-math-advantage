import { describe, expect, it } from 'vitest';
import {
  expandPlacementEvidence,
  synthesizePlacementCards,
} from '../srs/placement';
import type { PlacementEstimate } from '../srs/contract';

const placedAt = '2026-07-10T00:00:00.000Z';

const directB: PlacementEstimate = {
  nodeId: 'math.im3.b',
  masteryEstimate: 0.95,
  confidence: 'high',
  evidenceType: 'direct',
  inferenceDepth: 0,
};

describe('v3 placement evidence closure', () => {
  it('propagates only through transitive hard prerequisite edges', () => {
    const expanded = expandPlacementEvidence(
      [directB],
      {
        prerequisiteEdges: [
          { sourceId: 'math.im3.a', targetId: 'math.im3.b', weight: 1 },
          { sourceId: 'math.im3.d', targetId: 'math.im3.a', weight: 1 },
          { sourceId: 'math.im3.c', targetId: 'math.im3.b', weight: 0.5 },
        ],
      },
      1,
    );

    expect(expanded).toEqual([
      directB,
      {
        nodeId: 'math.im3.a',
        masteryEstimate: 0.95,
        confidence: 'medium',
        evidenceType: 'inferred',
        inferenceDepth: 1,
      },
      {
        nodeId: 'math.im3.d',
        masteryEstimate: 0.95,
        confidence: 'low',
        evidenceType: 'inferred',
        inferenceDepth: 2,
      },
    ]);
    expect(expanded.some((estimate) => estimate.nodeId === 'math.im3.c')).toBe(false);
  });

  it('keeps direct evidence in preference to inferred evidence for the same node', () => {
    const directA: PlacementEstimate = {
      nodeId: 'math.im3.a',
      masteryEstimate: 0.7,
      confidence: 'medium',
      evidenceType: 'direct',
      inferenceDepth: 0,
    };

    const expanded = expandPlacementEvidence(
      [directB, directA],
      { prerequisiteEdges: [{ sourceId: 'math.im3.a', targetId: 'math.im3.b', weight: 1 }] },
      1,
    );

    expect(expanded.find((estimate) => estimate.nodeId === 'math.im3.a')).toEqual(directA);
  });

  it('prefers stronger equal-depth inference independent of edge and input order', () => {
    const weaker: PlacementEstimate = {
      nodeId: 'a-weak-child',
      masteryEstimate: 0.6,
      confidence: 'high',
      evidenceType: 'direct',
      inferenceDepth: 0,
    };
    const stronger: PlacementEstimate = {
      nodeId: 'z-strong-child',
      masteryEstimate: 0.9,
      confidence: 'high',
      evidenceType: 'direct',
      inferenceDepth: 0,
    };
    const edges = [
      { sourceId: 'shared-parent', targetId: weaker.nodeId, weight: 1 },
      { sourceId: 'shared-parent', targetId: stronger.nodeId, weight: 1 },
    ];

    const canonical = expandPlacementEvidence([weaker, stronger], { prerequisiteEdges: edges }, 1);
    const reordered = expandPlacementEvidence(
      [stronger, weaker],
      { prerequisiteEdges: [...edges].reverse() },
      1,
    );

    expect(reordered).toEqual(canonical);
    expect(canonical.find((estimate) => estimate.nodeId === 'shared-parent')).toMatchObject({
      masteryEstimate: 0.9,
      evidenceType: 'inferred',
      inferenceDepth: 1,
    });
  });
});

describe('v3 placement card synthesis', () => {
  it('synthesizes deterministic review cards using confidence horizons', () => {
    const cards = synthesizePlacementCards(
      [directB],
      { prerequisiteEdges: [{ sourceId: 'math.im3.a', targetId: 'math.im3.b', weight: 1 }] },
      {
        studentId: 'student-1',
        placedAt,
        hardGateThreshold: 1,
      },
    );

    expect(cards).toHaveLength(2);
    expect(cards[0]).toMatchObject({
      cardId: 'placement:student-1:math.im3.b',
      studentId: 'student-1',
      objectiveId: 'math.im3.b',
      variantKey: 'math.im3.b',
      stability: 28.5,
      state: 'review',
      reps: 1,
      lapses: 0,
      lastReview: placedAt,
      placement: {
        source: 'placement',
        evidenceType: 'direct',
        confidence: 'high',
        inferenceDepth: 0,
        placedAt,
      },
    });
    expect(cards[0]?.scheduledDays).toBe(28.5);
    expect(cards[0]?.dueDate).toBe('2026-08-07T12:00:00.000Z');
    expect(cards[0]?.difficulty).toBeGreaterThan(0);

    expect(cards[1]).toMatchObject({
      objectiveId: 'math.im3.a',
      stability: 14.25,
      placement: {
        evidenceType: 'inferred',
        confidence: 'medium',
        inferenceDepth: 1,
      },
    });
  });

  it('skips zero estimates and rejects malformed input deterministically', () => {
    expect(synthesizePlacementCards(
      [{ ...directB, masteryEstimate: 0 }],
      { prerequisiteEdges: [] },
      { studentId: 'student-1', placedAt, hardGateThreshold: 1 },
    )).toEqual([]);

    expect(() => synthesizePlacementCards(
      [{ ...directB, masteryEstimate: 2 }],
      { prerequisiteEdges: [] },
      { studentId: 'student-1', placedAt, hardGateThreshold: 1 },
    )).toThrow(/placement estimate/i);
    expect(() => synthesizePlacementCards(
      [directB],
      { prerequisiteEdges: [] },
      { studentId: 'student-1', placedAt: 'invalid', hardGateThreshold: 1 },
    )).toThrow(/placedAt/i);
  });
});
