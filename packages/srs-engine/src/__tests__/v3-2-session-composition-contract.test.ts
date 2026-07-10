import { describe, expect, it } from 'vitest';

import {
  intervalLoadBalancingDecisionV3_2Schema,
  sessionCompositionArtifactV3_2Schema,
} from '@math-platform/srs-engine/session-composition-contract';
import {
  sessionCompositionArtifactV3_2Schema as rootSessionCompositionSchema,
} from '../index';

const selected = [
  { cardId: 'a1', objectiveId: 'A', objectivePriority: 'essential', queueKind: 'review', selectionRank: 1 },
  { cardId: 'a2', objectiveId: 'A', objectivePriority: 'essential', queueKind: 'review', selectionRank: 2 },
  { cardId: 'b1', objectiveId: 'B', objectivePriority: 'supporting', queueKind: 'review', selectionRank: 3 },
  { cardId: 'n1', objectiveId: 'N', objectivePriority: 'extension', queueKind: 'new', selectionRank: 4 },
] as const;

describe('srs.session-composition.v3.2 contract', () => {
  it('publishes the same schema at root and the dedicated subpath', () => {
    expect(rootSessionCompositionSchema).toBe(sessionCompositionArtifactV3_2Schema);
  });
  it('accepts presentation-only review interleaving followed by unchanged new cards', () => {
    const artifact = sessionCompositionArtifactV3_2Schema.parse({
      schemaVersion: 'srs.session-composition.v3.2',
      policy: 'review_objective_round_robin_then_new.v1',
      selected,
      presented: [
        { cardId: 'a1', presentationRank: 1 },
        { cardId: 'b1', presentationRank: 2 },
        { cardId: 'a2', presentationRank: 3 },
        { cardId: 'n1', presentationRank: 4 },
      ],
    });
    expect(artifact.presented.map((item) => item.cardId)).toEqual(['a1', 'b1', 'a2', 'n1']);
  });

  it('rejects any added, removed, duplicated, or early new card', () => {
    expect(sessionCompositionArtifactV3_2Schema.safeParse({
      schemaVersion: 'srs.session-composition.v3.2', policy: 'review_objective_round_robin_then_new.v1', selected,
      presented: [{ cardId: 'a1', presentationRank: 1 }, { cardId: 'n1', presentationRank: 2 }, { cardId: 'b1', presentationRank: 3 }, { cardId: 'a2', presentationRank: 4 }],
    }).success).toBe(false);
  });

  it('rejects non-round-robin review presentation', () => {
    expect(sessionCompositionArtifactV3_2Schema.safeParse({
      schemaVersion: 'srs.session-composition.v3.2', policy: 'review_objective_round_robin_then_new.v1', selected,
      presented: [{ cardId: 'a1', presentationRank: 1 }, { cardId: 'a2', presentationRank: 2 }, { cardId: 'b1', presentationRank: 3 }, { cardId: 'n1', presentationRank: 4 }],
    }).success).toBe(false);
  });
});

describe('srs.interval-load-balancing.v3.2 contract', () => {
  it('binds deterministic fuzz, bounded window, and lightest-day selection', () => {
    const parsed = intervalLoadBalancingDecisionV3_2Schema.parse({
      schemaVersion: 'srs.interval-load-balancing.v3.2', cardId: 'card.1', reps: 4,
      deterministicKey: 'card.1:4', baseIntervalDays: 30, fuzzFraction: 0.03,
      rawFuzzedIntervalDays: 30.9, minimumDayOffset: 29, maximumDayOffset: 31,
      maximumIntervalDays: 365,
      projectedDayLoads: [{ dayOffset: 29, load: 4 }, { dayOffset: 30, load: 5 }, { dayOffset: 31, load: 2 }],
      selectedDayOffset: 31, selectedProjectedLoad: 2, tieBreak: 'load_asc_day_asc.v1',
    });
    expect(parsed.selectedDayOffset).toBe(31);
  });

  it('rejects unstable keys, fuzz outside plus/minus five percent, non-lightest days, and max-interval overflow', () => {
    const base = {
      schemaVersion: 'srs.interval-load-balancing.v3.2' as const, cardId: 'card.1', reps: 4,
      deterministicKey: 'wrong', baseIntervalDays: 30, fuzzFraction: 0.06, rawFuzzedIntervalDays: 31.8,
      minimumDayOffset: 29, maximumDayOffset: 31, maximumIntervalDays: 30,
      projectedDayLoads: [{ dayOffset: 29, load: 1 }, { dayOffset: 30, load: 2 }, { dayOffset: 31, load: 0 }],
      selectedDayOffset: 31, selectedProjectedLoad: 0, tieBreak: 'load_asc_day_asc.v1' as const,
    };
    expect(intervalLoadBalancingDecisionV3_2Schema.safeParse(base).success).toBe(false);
  });
});
