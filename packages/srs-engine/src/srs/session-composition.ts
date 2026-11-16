import { z } from 'zod';

import {
  deterministicIntervalFuzzV3_2,
  intervalLoadBalancingDecisionV3_2Schema,
  sessionCompositionArtifactV3_2Schema,
  type IntervalLoadBalancingDecisionV3_2,
  type SessionCompositionArtifactV3_2,
} from './session-composition-contract';

const idSchema = z.string().min(1).refine((value) => value.trim() === value);
const priorityOrder = { essential: 0, supporting: 1, extension: 2 } as const;

function compareStrings(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

export interface SelectedSessionCardV3_2 {
  readonly cardId: string;
  readonly objectiveId: string;
  readonly objectivePriority: 'essential' | 'supporting' | 'extension';
  readonly queueKind: 'review' | 'new';
  readonly selectionRank: number;
}

export function composeSessionV3_2(
  selected: readonly SelectedSessionCardV3_2[],
): SessionCompositionArtifactV3_2 {
  const reviewsByObjective = new Map<
    string,
    { priority: SelectedSessionCardV3_2['objectivePriority']; cards: SelectedSessionCardV3_2[] }
  >();
  for (const card of selected.filter((item) => item.queueKind === 'review')) {
    const group = reviewsByObjective.get(card.objectiveId) ?? {
      priority: card.objectivePriority,
      cards: [],
    };
    group.cards.push(card);
    reviewsByObjective.set(card.objectiveId, group);
  }
  const groups = [...reviewsByObjective.entries()].sort((left, right) => {
    const byPriority = priorityOrder[left[1].priority] - priorityOrder[right[1].priority];
    return byPriority || compareStrings(left[0], right[0]);
  });
  for (const [, group] of groups) {
    group.cards.sort((left, right) => left.selectionRank - right.selectionRank);
  }

  const presentationIds: string[] = [];
  for (let round = 0; ; round += 1) {
    let added = false;
    for (const [, group] of groups) {
      const card = group.cards[round];
      if (card) {
        presentationIds.push(card.cardId);
        added = true;
      }
    }
    if (!added) break;
  }
  presentationIds.push(
    ...selected
      .filter((item) => item.queueKind === 'new')
      .sort((left, right) => left.selectionRank - right.selectionRank)
      .map((item) => item.cardId),
  );
  return sessionCompositionArtifactV3_2Schema.parse({
    schemaVersion: 'srs.session-composition.v3.2',
    policy: 'review_objective_round_robin_then_new.v1',
    selected,
    presented: presentationIds.map((cardId, index) => ({
      cardId,
      presentationRank: index + 1,
    })),
  });
}

const scheduleInputSchema = z
  .object({
    cardId: idSchema,
    reps: z.number().int().min(0),
    anchorDate: z.string().datetime({ offset: true }),
    baseIntervalDays: z.number().int().min(0),
    maximumIntervalDays: z.number().int().positive(),
    projectedDayLoads: z.array(
      z
        .object({
          dayOffset: z.number().int().min(0),
          load: z.number().finite().min(0),
        })
        .strict(),
    ),
  })
  .strict();

export type ScheduleIntervalWithLoadBalancingInputV3_2 = z.input<
  typeof scheduleInputSchema
>;

export function scheduleIntervalWithLoadBalancingV3_2(
  rawInput: ScheduleIntervalWithLoadBalancingInputV3_2,
): IntervalLoadBalancingDecisionV3_2 {
  const input = scheduleInputSchema.parse(rawInput);
  const baseIntervalDays = Math.min(input.baseIntervalDays, input.maximumIntervalDays);
  const minimumDayOffset = Math.ceil(baseIntervalDays * 0.95);
  const maximumDayOffset = Math.max(
    minimumDayOffset,
    Math.min(input.maximumIntervalDays, Math.floor(baseIntervalDays * 1.05)),
  );
  const fuzz = deterministicIntervalFuzzV3_2(input.cardId, input.reps);
  const rawFuzzedIntervalDays = baseIntervalDays * (1 + fuzz.fuzzFraction);
  const preferredDayOffset = Math.min(
    maximumDayOffset,
    Math.max(minimumDayOffset, Math.round(rawFuzzedIntervalDays)),
  );
  const projectedDayLoads = [...input.projectedDayLoads].sort(
    (left, right) => left.dayOffset - right.dayOffset,
  );
  const selected = [...projectedDayLoads].sort(
    (left, right) =>
      left.load - right.load ||
      Math.abs(left.dayOffset - preferredDayOffset) -
        Math.abs(right.dayOffset - preferredDayOffset) ||
      left.dayOffset - right.dayOffset,
  )[0];
  if (!selected) throw new Error('Projected day loads cannot be empty');
  const selectedDueDate = new Date(
    Date.parse(input.anchorDate) + selected.dayOffset * 86_400_000,
  ).toISOString();
  return intervalLoadBalancingDecisionV3_2Schema.parse({
    schemaVersion: 'srs.interval-load-balancing.v3.2',
    cardId: input.cardId,
    reps: input.reps,
    deterministicKey: `${input.cardId}:${input.reps}`,
    fuzzAlgorithm: 'fnv1a32-code-unit-uniform.v1',
    fuzzHash: fuzz.fuzzHash,
    anchorDate: input.anchorDate,
    baseIntervalDays,
    fuzzFraction: fuzz.fuzzFraction,
    rawFuzzedIntervalDays,
    minimumDayOffset,
    maximumDayOffset,
    preferredDayOffset,
    maximumIntervalDays: input.maximumIntervalDays,
    projectedDayLoads,
    selectedDayOffset: selected.dayOffset,
    selectedProjectedLoad: selected.load,
    selectedDueDate,
    tieBreak: 'load_asc_fuzz_distance_asc_day_asc.v1',
  });
}
