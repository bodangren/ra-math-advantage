import { describe, expect, it } from 'vitest';

import {
  composeSessionV3_2,
  scheduleIntervalWithLoadBalancingV3_2,
} from '../srs/session-composition';

const review = (
  cardId: string,
  objectiveId: string,
  objectivePriority: 'essential' | 'supporting' | 'extension',
  selectionRank: number,
) => ({ cardId, objectiveId, objectivePriority, queueKind: 'review' as const, selectionRank });

const newCard = (cardId: string, objectiveId: string, selectionRank: number) => ({
  cardId,
  objectiveId,
  objectivePriority: 'extension' as const,
  queueKind: 'new' as const,
  selectionRank,
});

describe('srs.session-composition.v3.2 behavior', () => {
  it('presents A,B,C,A,B,A for a 3/2/1 selected review distribution', () => {
    const selected = [
      review('a1', 'A', 'essential', 1),
      review('a2', 'A', 'essential', 2),
      review('a3', 'A', 'essential', 3),
      review('b1', 'B', 'supporting', 4),
      review('b2', 'B', 'supporting', 5),
      review('c1', 'C', 'extension', 6),
    ];
    expect(composeSessionV3_2(selected).presented.map((item) => item.cardId)).toEqual([
      'a1', 'b1', 'c1', 'a2', 'b2', 'a3',
    ]);
  });

  it('orders objective groups by priority then code-point objective ID', () => {
    const selected = [
      review('z1', 'Z', 'supporting', 1),
      review('b1', 'B', 'essential', 2),
      review('a1', 'A', 'essential', 3),
    ];
    expect(composeSessionV3_2(selected).presented.map((item) => item.cardId)).toEqual(['a1', 'b1', 'z1']);
  });

  it('keeps new cards after every review and in their selected order', () => {
    const selected = [
      review('a1', 'A', 'essential', 1),
      newCard('n1', 'N', 2),
      review('b1', 'B', 'supporting', 3),
      newCard('n2', 'N', 4),
    ];
    const artifact = composeSessionV3_2(selected);
    expect(artifact.presented.map((item) => item.cardId)).toEqual(['a1', 'b1', 'n1', 'n2']);
    expect(new Set(artifact.presented.map((item) => item.cardId))).toEqual(new Set(selected.map((item) => item.cardId)));
  });

  it('rejects duplicate or non-contiguous selection identities', () => {
    expect(() => composeSessionV3_2([
      review('same', 'A', 'essential', 1),
      review('same', 'B', 'supporting', 2),
    ])).toThrow();
  });
});

describe('srs.interval-load-balancing.v3.2 behavior', () => {
  const loads = [
    { dayOffset: 29, load: 4 },
    { dayOffset: 30, load: 5 },
    { dayOffset: 31, load: 2 },
  ];

  it('returns identical fuzz and due-day decisions for repeated card/reps inputs', () => {
    const input = { cardId: 'card.1', reps: 4, anchorDate: '2026-07-10T00:00:00.000Z', baseIntervalDays: 30, maximumIntervalDays: 365, projectedDayLoads: loads };
    expect(scheduleIntervalWithLoadBalancingV3_2(input)).toEqual(scheduleIntervalWithLoadBalancingV3_2(input));
  });

  it('chooses the lightest projected day inside the plus/minus-five-percent window', () => {
    const result = scheduleIntervalWithLoadBalancingV3_2({
      cardId: 'card.1', reps: 4, anchorDate: '2026-07-10T00:00:00.000Z', baseIntervalDays: 30, maximumIntervalDays: 365, projectedDayLoads: loads,
    });
    expect(result).toMatchObject({ minimumDayOffset: 29, maximumDayOffset: 31, selectedDayOffset: 31, selectedProjectedLoad: 2 });
    expect(result.selectedDueDate).toBe('2026-08-10T00:00:00.000Z');
    expect(result.fuzzFraction).toBeGreaterThanOrEqual(-0.05);
    expect(result.fuzzFraction).toBeLessThanOrEqual(0.05);
  });

  it('uses deterministic fuzz distance then earliest day to break equal-load ties', () => {
    const probe = scheduleIntervalWithLoadBalancingV3_2({
      cardId: 'card.tie', reps: 2, anchorDate: '2026-07-10T00:00:00.000Z', baseIntervalDays: 30, maximumIntervalDays: 365,
      projectedDayLoads: [{ dayOffset: 29, load: 1 }, { dayOffset: 30, load: 1 }, { dayOffset: 31, load: 1 }],
    });
    const distances = [29, 30, 31].map((day) => ({ day, distance: Math.abs(day - probe.preferredDayOffset) }));
    const expected = distances.sort((left, right) => left.distance - right.distance || left.day - right.day)[0]?.day;
    expect(probe.selectedDayOffset).toBe(expected);
  });

  it('caps a target interval before fuzz and never exceeds maximumInterval', () => {
    const projectedDayLoads = Array.from({ length: 19 }, (_, index) => ({ dayOffset: 347 + index, load: index }));
    const result = scheduleIntervalWithLoadBalancingV3_2({
      cardId: 'card.max', reps: 9, anchorDate: '2026-07-10T00:00:00.000Z', baseIntervalDays: 400, maximumIntervalDays: 365, projectedDayLoads,
    });
    expect(result.baseIntervalDays).toBe(365);
    expect(result.maximumDayOffset).toBe(365);
    expect(result.selectedDayOffset).toBeLessThanOrEqual(365);
  });
});
