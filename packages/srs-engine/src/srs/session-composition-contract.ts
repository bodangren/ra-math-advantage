import { z } from 'zod';

const EPSILON = 1e-9;
const idSchema = z.string().min(1).refine((value) => value.trim() === value, {
  message: 'Identifiers must not have surrounding whitespace',
});
const priorityOrder = { essential: 0, supporting: 1, extension: 2 } as const;
function compareStrings(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

const selectedCardSchema = z
  .object({
    cardId: idSchema,
    objectiveId: idSchema,
    objectivePriority: z.enum(['essential', 'supporting', 'extension']),
    queueKind: z.enum(['review', 'new']),
    selectionRank: z.number().int().positive(),
  })
  .strict();

const presentedCardSchema = z
  .object({ cardId: idSchema, presentationRank: z.number().int().positive() })
  .strict();

export const sessionCompositionArtifactV3_2Schema = z
  .object({
    schemaVersion: z.literal('srs.session-composition.v3.2'),
    policy: z.literal('review_objective_round_robin_then_new.v1'),
    selected: z.array(selectedCardSchema),
    presented: z.array(presentedCardSchema),
  })
  .strict()
  .superRefine((artifact, ctx) => {
    const selectedIds = new Set<string>();
    artifact.selected.forEach((item, index) => {
      if (item.selectionRank !== index + 1 || selectedIds.has(item.cardId)) {
        ctx.addIssue({ code: 'custom', path: ['selected', index], message: 'Selection ranks and card IDs must be unique and contiguous' });
      }
      selectedIds.add(item.cardId);
    });

    const presentedIds = new Set<string>();
    let sawNew = false;
    const previousSelectionRankByObjective = new Map<string, number>();
    let previousNewSelectionRank = 0;
    artifact.presented.forEach((item, index) => {
      if (item.presentationRank !== index + 1 || presentedIds.has(item.cardId)) {
        ctx.addIssue({ code: 'custom', path: ['presented', index], message: 'Presentation ranks and card IDs must be unique and contiguous' });
      }
      presentedIds.add(item.cardId);
      const selected = artifact.selected.find((candidate) => candidate.cardId === item.cardId);
      if (!selected) return;
      if (selected.queueKind === 'new') {
        sawNew = true;
        if (selected.selectionRank < previousNewSelectionRank) {
          ctx.addIssue({ code: 'custom', path: ['presented', index], message: 'New-card order must remain unchanged' });
        }
        previousNewSelectionRank = selected.selectionRank;
      } else {
        if (sawNew) {
          ctx.addIssue({ code: 'custom', path: ['presented', index], message: 'All selected reviews must precede new cards' });
        }
        const previous = previousSelectionRankByObjective.get(selected.objectiveId) ?? 0;
        if (selected.selectionRank < previous) {
          ctx.addIssue({ code: 'custom', path: ['presented', index], message: 'Within-objective review order must remain unchanged' });
        }
        previousSelectionRankByObjective.set(selected.objectiveId, selected.selectionRank);
      }
    });
    if (
      selectedIds.size !== artifact.selected.length ||
      presentedIds.size !== artifact.presented.length ||
      selectedIds.size !== presentedIds.size ||
      [...selectedIds].some((cardId) => !presentedIds.has(cardId))
    ) {
      ctx.addIssue({ code: 'custom', path: ['presented'], message: 'Composition must preserve the exact selected-card set' });
    }

    const reviewGroups = new Map<
      string,
      { priority: keyof typeof priorityOrder; cards: Array<(typeof artifact.selected)[number]> }
    >();
    for (const card of artifact.selected.filter((item) => item.queueKind === 'review')) {
      const existing = reviewGroups.get(card.objectiveId);
      if (existing && existing.priority !== card.objectivePriority) {
        ctx.addIssue({ code: 'custom', path: ['selected'], message: 'An objective must have one priority' });
      }
      const group = existing ?? { priority: card.objectivePriority, cards: [] };
      group.cards.push(card);
      reviewGroups.set(card.objectiveId, group);
    }
    const groups = [...reviewGroups.entries()].sort((left, right) => {
      const byPriority = priorityOrder[left[1].priority] - priorityOrder[right[1].priority];
      return byPriority || compareStrings(left[0], right[0]);
    });
    const expectedReviewIds: string[] = [];
    for (let round = 0; ; round += 1) {
      let added = false;
      for (const [, group] of groups) {
        const card = group.cards[round];
        if (card) {
          expectedReviewIds.push(card.cardId);
          added = true;
        }
      }
      if (!added) break;
    }
    const expectedIds = [
      ...expectedReviewIds,
      ...artifact.selected
        .filter((item) => item.queueKind === 'new')
        .sort((left, right) => left.selectionRank - right.selectionRank)
        .map((item) => item.cardId),
    ];
    if (
      expectedIds.length !== artifact.presented.length ||
      expectedIds.some((cardId, index) => artifact.presented[index]?.cardId !== cardId)
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['presented'],
        message: 'Presentation must round-robin reviews by objective priority and ID, then preserve new cards',
      });
    }
  });

const projectedDayLoadSchema = z
  .object({ dayOffset: z.number().int().min(0), load: z.number().finite().min(0) })
  .strict();

export function deterministicIntervalFuzzV3_2(
  cardId: string,
  reps: number,
): { readonly fuzzHash: number; readonly fuzzFraction: number } {
  idSchema.parse(cardId);
  z.number().int().min(0).parse(reps);
  const key = `${cardId}:${reps}`;
  let hash = 2_166_136_261;
  for (let index = 0; index < key.length; index += 1) {
    hash ^= key.charCodeAt(index);
    hash = Math.imul(hash, 16_777_619) >>> 0;
  }
  return Object.freeze({
    fuzzHash: hash,
    fuzzFraction: (hash / 0xffff_ffff) * 0.1 - 0.05,
  });
}

export const intervalLoadBalancingDecisionV3_2Schema = z
  .object({
    schemaVersion: z.literal('srs.interval-load-balancing.v3.2'),
    cardId: idSchema,
    reps: z.number().int().min(0),
    deterministicKey: idSchema,
    fuzzAlgorithm: z.literal('fnv1a32-code-unit-uniform.v1'),
    fuzzHash: z.number().int().min(0).max(0xffff_ffff),
    anchorDate: z.string().datetime({ offset: true }),
    baseIntervalDays: z.number().int().min(0),
    fuzzFraction: z.number().finite().min(-0.05).max(0.05),
    rawFuzzedIntervalDays: z.number().finite().min(0),
    minimumDayOffset: z.number().int().min(0),
    maximumDayOffset: z.number().int().min(0),
    preferredDayOffset: z.number().int().min(0),
    maximumIntervalDays: z.number().int().positive(),
    projectedDayLoads: z.array(projectedDayLoadSchema).min(1),
    selectedDayOffset: z.number().int().min(0),
    selectedProjectedLoad: z.number().finite().min(0),
    selectedDueDate: z.string().datetime({ offset: true }),
    tieBreak: z.literal('load_asc_fuzz_distance_asc_day_asc.v1'),
  })
  .strict()
  .superRefine((decision, ctx) => {
    if (decision.deterministicKey !== `${decision.cardId}:${decision.reps}`) {
      ctx.addIssue({ code: 'custom', path: ['deterministicKey'], message: 'Key must bind card ID and repetitions' });
    }
    const deterministicFuzz = deterministicIntervalFuzzV3_2(decision.cardId, decision.reps);
    if (
      decision.fuzzHash !== deterministicFuzz.fuzzHash ||
      Math.abs(decision.fuzzFraction - deterministicFuzz.fuzzFraction) > EPSILON
    ) {
      ctx.addIssue({ code: 'custom', path: ['fuzzFraction'], message: 'Fuzz must derive from the versioned card/repetitions hash' });
    }
    const raw = decision.baseIntervalDays * (1 + decision.fuzzFraction);
    if (Math.abs(decision.rawFuzzedIntervalDays - raw) > EPSILON) {
      ctx.addIssue({ code: 'custom', path: ['rawFuzzedIntervalDays'], message: 'Raw interval must apply deterministic fuzz' });
    }
    const minimum = Math.ceil(decision.baseIntervalDays * 0.95);
    const maximum = Math.max(
      minimum,
      Math.min(decision.maximumIntervalDays, Math.floor(decision.baseIntervalDays * 1.05)),
    );
    if (decision.minimumDayOffset !== minimum || decision.maximumDayOffset !== maximum) {
      ctx.addIssue({ code: 'custom', message: 'Day window must be the bounded plus/minus-five-percent interval' });
    }
    if (decision.baseIntervalDays > decision.maximumIntervalDays) {
      ctx.addIssue({ code: 'custom', path: ['baseIntervalDays'], message: 'Base interval must already respect maximumInterval' });
    }
    const preferred = Math.min(maximum, Math.max(minimum, Math.round(raw)));
    if (decision.preferredDayOffset !== preferred) {
      ctx.addIssue({ code: 'custom', path: ['preferredDayOffset'], message: 'Preferred day must consume deterministic fuzz' });
    }
    const expectedDays = Array.from({ length: maximum - minimum + 1 }, (_, index) => minimum + index);
    const actualDays = decision.projectedDayLoads.map((entry) => entry.dayOffset);
    if (actualDays.length !== expectedDays.length || actualDays.some((day, index) => day !== expectedDays[index])) {
      ctx.addIssue({ code: 'custom', path: ['projectedDayLoads'], message: 'Projected loads must cover every eligible day in order' });
    }
    const best = [...decision.projectedDayLoads].sort(
      (left, right) =>
        left.load - right.load ||
        Math.abs(left.dayOffset - preferred) - Math.abs(right.dayOffset - preferred) ||
        left.dayOffset - right.dayOffset,
    )[0];
    if (!best || decision.selectedDayOffset !== best.dayOffset || Math.abs(decision.selectedProjectedLoad - best.load) > EPSILON) {
      ctx.addIssue({ code: 'custom', path: ['selectedDayOffset'], message: 'Selection must use the lightest day, then earliest day' });
    }
    if (decision.selectedDayOffset > decision.maximumIntervalDays) {
      ctx.addIssue({ code: 'custom', path: ['selectedDayOffset'], message: 'Selected interval exceeds maximumInterval' });
    }
    const dueDate = new Date(
      Date.parse(decision.anchorDate) + decision.selectedDayOffset * 86_400_000,
    ).toISOString();
    if (decision.selectedDueDate !== dueDate) {
      ctx.addIssue({ code: 'custom', path: ['selectedDueDate'], message: 'Due date must bind the scheduling anchor and selected day' });
    }
  });

export type SessionCompositionArtifactV3_2 = z.infer<typeof sessionCompositionArtifactV3_2Schema>;
export type IntervalLoadBalancingDecisionV3_2 = z.infer<typeof intervalLoadBalancingDecisionV3_2Schema>;
