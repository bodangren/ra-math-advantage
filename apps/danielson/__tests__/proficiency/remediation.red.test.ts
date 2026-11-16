import { describe, expect, it } from 'vitest';

import {
  DAY_MS,
  FIXED_NOW,
  MemoryTeacherProficiencyPort,
  SKILL_IDS,
  TEACHER_ID,
  createFixtureGraph,
  createRatedEvidence,
  createStableDueCard,
} from './fixtures';

const processorModule = () => import('../../lib/proficiency/processor');
const evidenceModule = () => import('../../lib/proficiency/evidence');

function walkthroughEvidence(
  idempotencyKey: string,
  occurredAt: string,
  rating: 1 | 2 | 3 | 4,
) {
  return createRatedEvidence({
    idempotencyKey,
    sourceRecordId: `observation_records:${idempotencyKey}`,
    sourceType: 'walkthrough',
    formalObservationId: undefined,
    provenanceGroupId: `provenance:${idempotencyKey}`,
    targetSkillIds: [SKILL_IDS[1]],
    occurredAt,
    rating,
  });
}

function effectiveSrsTimeline(reviews: Array<Record<string, unknown>>) {
  const latestByLogicalReview = new Map<string, Record<string, unknown>>();
  for (const review of reviews) {
    latestByLogicalReview.set(
      String(review.logicalReviewId ?? review.reviewId),
      review,
    );
  }
  return [...latestByLogicalReview.values()]
    .map((review) => ({
      reviewedAt: review.reviewedAt,
      rating: review.rating,
      stateBefore: review.stateBefore,
      stateAfter: review.stateAfter,
    }))
    .sort((left, right) => String(left.reviewedAt).localeCompare(String(right.reviewedAt)));
}

describe('Track 2 remediation: evidence effects', () => {
  it('expands a Q1 rating to all direct component skills when the command lists only one child', async () => {
    const { processTeacherEvidence } = await processorModule();
    const port = new MemoryTeacherProficiencyPort();

    const result = await processTeacherEvidence({
      evidence: createRatedEvidence({ targetSkillIds: [SKILL_IDS[0]] }),
      graph: createFixtureGraph(),
      now: FIXED_NOW,
      port,
    });

    expect(result.targetEvidence.map((item: { skillId: string }) => item.skillId).sort())
      .toEqual([...SKILL_IDS].sort());
    expect((await port.getTeacherState(TEACHER_ID)).cards.map((card) => card.objectiveId).sort())
      .toEqual([...SKILL_IDS].sort());
  });

  it('records an empty-target Q4 outcome without skill effects', async () => {
    const { processTeacherEvidence } = await processorModule();
    const graph = createFixtureGraph();
    const port = new MemoryTeacherProficiencyPort({
      cards: [createStableDueCard()],
      reviews: [{ reviewId: 'review-before-q4' }],
      proficiency: [{ skillId: SKILL_IDS[1], rawRating: 3 }],
      knowledgeState: [{ nodeId: SKILL_IDS[1], state: 'mastered' }],
      priority: [{ skillId: SKILL_IDS[1], due: false }],
    });
    const before = await port.getTeacherState(TEACHER_ID);
    const q4 = createRatedEvidence({
      idempotencyKey: 'formal-q4-empty-targets',
      sourceRecordId: 'observation_records:q4-empty-targets',
      formalObservationId: 'formal_observations:q4-empty-targets',
      provenanceGroupId: 'provenance:q4-empty-targets',
      sourceType: 'formal_q4',
      targetSkillIds: [],
      rating: 4,
    });

    const result = await processTeacherEvidence({ evidence: q4, graph, now: FIXED_NOW, port });
    const after = await port.getTeacherState(TEACHER_ID);

    expect(result).toMatchObject({ kind: 'applied', targetEvidence: [], knowledgeState: [], priority: [] });
    expect(after.observationOutcomes).toEqual([
      expect.objectContaining({ sourceType: 'formal_q4', targetEvidence: [] }),
    ]);
    expect({
      cards: after.cards,
      reviews: after.reviews,
      proficiency: after.proficiency,
      knowledgeState: after.knowledgeState,
      priority: after.priority,
    }).toEqual({
      cards: before.cards,
      reviews: before.reviews,
      proficiency: before.proficiency,
      knowledgeState: before.knowledgeState,
      priority: before.priority,
    });
  });

  it('rejects a directed Q4 skill target', async () => {
    const { normalizeObservationEvidence } = await evidenceModule();
    const q4 = createRatedEvidence({
      idempotencyKey: 'formal-q4-directed-target',
      sourceRecordId: 'observation_records:q4-directed-target',
      formalObservationId: 'formal_observations:q4-directed-target',
      provenanceGroupId: 'provenance:q4-directed-target',
      sourceType: 'formal_q4',
      targetSkillIds: [SKILL_IDS[1]],
    });

    expect(() => normalizeObservationEvidence(q4, createFixtureGraph())).toThrow();
  });

  it('uses effective event time for proficiency and canonical SRS history when observations arrive out of order', async () => {
    const { processTeacherEvidence } = await processorModule();
    const graph = createFixtureGraph();
    const earlier = walkthroughEvidence('walkthrough-earlier', '2026-08-10T00:00:00.000Z', 1);
    const later = walkthroughEvidence('walkthrough-later', '2026-08-20T00:00:00.000Z', 4);
    const chronologicalPort = new MemoryTeacherProficiencyPort();
    const reverseArrivalPort = new MemoryTeacherProficiencyPort();
    const readAt = '2026-08-27T00:00:00.000Z';

    await processTeacherEvidence({ evidence: earlier, graph, now: readAt, port: chronologicalPort });
    await processTeacherEvidence({ evidence: later, graph, now: readAt, port: chronologicalPort });
    await processTeacherEvidence({ evidence: later, graph, now: readAt, port: reverseArrivalPort });
    const laterReviewBeforeLateArrival = (await reverseArrivalPort.getTeacherState(TEACHER_ID))
      .reviews.find((review) => review.reviewId === `teacher_srs_reviews:${later.idempotencyKey}:${SKILL_IDS[1]}`);
    await processTeacherEvidence({ evidence: earlier, graph, now: readAt, port: reverseArrivalPort });

    const chronological = await chronologicalPort.getTeacherState(TEACHER_ID);
    const reverseArrival = await reverseArrivalPort.getTeacherState(TEACHER_ID);
    expect(reverseArrival.proficiency).toEqual(chronological.proficiency);
    expect(reverseArrival.proficiency).toEqual([
      expect.objectContaining({
        skillId: SKILL_IDS[1],
        rawRating: 4,
        occurredAt: later.occurredAt,
      }),
    ]);
    expect(reverseArrival.cards).toEqual(chronological.cards);
    expect(reverseArrival.knowledgeState).toEqual(chronological.knowledgeState);
    expect(reverseArrival.priority).toEqual(chronological.priority);
    expect(effectiveSrsTimeline(reverseArrival.reviews).map(({ reviewedAt, rating }) => ({ reviewedAt, rating })))
      .toEqual(effectiveSrsTimeline(chronological.reviews).map(({ reviewedAt, rating }) => ({ reviewedAt, rating })));
    const effectiveReverseTimeline = effectiveSrsTimeline(reverseArrival.reviews);
    expect(effectiveReverseTimeline[0].stateAfter).toEqual(effectiveReverseTimeline[1].stateBefore);
    expect(effectiveReverseTimeline.at(-1)?.stateAfter).toEqual(expect.objectContaining({
      stability: reverseArrival.cards[0].stability,
      difficulty: reverseArrival.cards[0].difficulty,
      state: reverseArrival.cards[0].state,
      reps: reverseArrival.cards[0].reps,
      lapses: reverseArrival.cards[0].lapses,
    }));
    expect(reverseArrival.reviews).toHaveLength(3);
    expect(reverseArrival.reviews).toContainEqual(expect.objectContaining({
      logicalReviewId: `teacher_srs_reviews:${later.idempotencyKey}:${SKILL_IDS[1]}`,
      isCorrection: true,
      correctionIdempotencyKey: earlier.idempotencyKey,
      correctionSourceRecordId: earlier.sourceRecordId,
    }));
    expect(reverseArrival.reviews.find(
      (review) => review.reviewId === `teacher_srs_reviews:${later.idempotencyKey}:${SKILL_IDS[1]}`,
    )).toEqual(laterReviewBeforeLateArrival);
  });

  it('recomputes KST retention and the due projection at the supplied later read time', async () => {
    const { processTeacherEvidence } = await processorModule();
    const graph = createFixtureGraph();
    const readAt = new Date(Date.parse(FIXED_NOW) + 181 * DAY_MS).toISOString();
    const evidence = walkthroughEvidence('walkthrough-time-aware', FIXED_NOW, 4);
    const earlyPort = new MemoryTeacherProficiencyPort({ cards: [createStableDueCard()] });
    const laterPort = new MemoryTeacherProficiencyPort({ cards: [createStableDueCard()] });

    const early = await processTeacherEvidence({ evidence, graph, now: FIXED_NOW, port: earlyPort });
    const later = await processTeacherEvidence({ evidence, graph, now: readAt, port: laterPort });
    const earlyState = early.knowledgeState.find((entry: { nodeId: string }) => entry.nodeId === SKILL_IDS[1]);
    const laterState = later.knowledgeState.find((entry: { nodeId: string }) => entry.nodeId === SKILL_IDS[1]);

    expect(laterState).toMatchObject({ lastUpdated: Date.parse(readAt) });
    expect(laterState?.retention).toBeLessThan(Number(earlyState?.retention));
    expect(early.priority).toEqual([expect.objectContaining({ skillId: SKILL_IDS[1], due: false })]);
    expect(later.priority).toEqual([expect.objectContaining({ skillId: SKILL_IDS[1], due: true, overdueDays: 1 })]);
  });
});
