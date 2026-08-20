import { describe, expect, it } from 'vitest';

import {
  FIXED_NOW,
  MemoryTeacherProficiencyPort,
  SKILL_IDS,
  TEACHER_ID,
  createFixtureGraph,
  createNoEvidence,
  createRatedEvidence,
  createStableDueCard,
} from './fixtures';

const processorModule = () => import('../../lib/proficiency/processor');

function scoringSnapshot(state: {
  cards: unknown;
  reviews: unknown;
  proficiency: unknown;
  knowledgeState: unknown;
  priority: unknown;
}) {
  return JSON.stringify({
    cards: state.cards,
    reviews: state.reviews,
    proficiency: state.proficiency,
    knowledgeState: state.knowledgeState,
    priority: state.priority,
  });
}

describe('teacher proficiency evidence processor', () => {
  it('stores not-enough-evidence as an outcome without changing proficiency, KST, or SRS state', async () => {
    const { processTeacherEvidence } = await processorModule();
    const port = new MemoryTeacherProficiencyPort({
      cards: [createStableDueCard()],
      reviews: [{ reviewId: 'existing-review' }],
      proficiency: [{ skillId: SKILL_IDS[1], rawRating: 3 }],
      knowledgeState: [{ nodeId: SKILL_IDS[1], state: 'mastered' }],
      priority: [{ skillId: SKILL_IDS[1], due: true }],
    });
    const before = await port.getTeacherState(TEACHER_ID);

    const result = await processTeacherEvidence({
      evidence: createNoEvidence(),
      graph: createFixtureGraph(),
      now: FIXED_NOW,
      port,
    });
    const after = await port.getTeacherState(TEACHER_ID);

    expect(result).toMatchObject({ kind: 'applied', targetEvidence: [] });
    expect(after.observationOutcomes).toHaveLength(before.observationOutcomes.length + 1);
    expect(scoringSnapshot(after)).toBe(scoringSnapshot(before));
    expect(port.commits[0]).toMatchObject({
      cards: [],
      reviews: [],
      proficiency: [],
      knowledgeState: [],
    });
  });

  it('fans a Q1 component rating out to every direct child skill with shared formal provenance', async () => {
    const { processTeacherEvidence } = await processorModule();
    const port = new MemoryTeacherProficiencyPort({ cards: [createStableDueCard()] });
    const evidence = createRatedEvidence({ rating: 4 });

    const result = await processTeacherEvidence({
      evidence,
      graph: createFixtureGraph(),
      now: FIXED_NOW,
      port,
    });
    const after = await port.getTeacherState(TEACHER_ID);

    expect(result).toMatchObject({ kind: 'applied' });
    expect(result.targetEvidence).toHaveLength(3);
    expect(result.targetEvidence.map((item: { skillId: string }) => item.skillId).sort())
      .toEqual([...SKILL_IDS].sort());
    for (const item of result.targetEvidence) {
      expect(item).toMatchObject({
        sourceRecordId: evidence.sourceRecordId,
        formalObservationId: evidence.formalObservationId,
        provenanceGroupId: evidence.provenanceGroupId,
        rawRating: 4,
      });
    }
    expect(after.cards.map((card) => card.objectiveId).sort()).toEqual([...SKILL_IDS].sort());
    expect(after.reviews).toHaveLength(3);
  });

  it('applies walkthrough evidence only to the target skills that the observer rated', async () => {
    const { processTeacherEvidence } = await processorModule();
    const port = new MemoryTeacherProficiencyPort();
    const targetSkillId = SKILL_IDS[0];

    const result = await processTeacherEvidence({
      evidence: createRatedEvidence({
        idempotencyKey: 'walkthrough-001',
        sourceRecordId: 'observation_records:walkthrough-001',
        sourceType: 'walkthrough',
        formalObservationId: undefined,
        provenanceGroupId: 'provenance:walkthrough-001',
        targetSkillIds: [targetSkillId],
        rating: 2,
      }),
      graph: createFixtureGraph(),
      now: FIXED_NOW,
      port,
    });
    const after = await port.getTeacherState(TEACHER_ID);

    expect(result).toMatchObject({ kind: 'applied' });
    expect(result.targetEvidence.map((item: { skillId: string }) => item.skillId)).toEqual([targetSkillId]);
    expect(after.cards.map((card) => card.objectiveId)).toEqual([targetSkillId]);
    expect(after.proficiency.map((item) => item.skillId)).toEqual([targetSkillId]);
  });

  it('makes the same normalized key a replay and rejects changed normalized content without another logical effect', async () => {
    const { processTeacherEvidence } = await processorModule();
    const port = new MemoryTeacherProficiencyPort();
    const graph = createFixtureGraph();
    const firstEvidence = createRatedEvidence({ targetSkillIds: [...SKILL_IDS] });

    const firstResult = await processTeacherEvidence({ evidence: firstEvidence, graph, now: FIXED_NOW, port });
    expect(firstResult).toMatchObject({ kind: 'applied' });
    const beforeReplay = await port.snapshot();

    await expect(processTeacherEvidence({
      evidence: createRatedEvidence({ targetSkillIds: [...SKILL_IDS].reverse() }),
      graph,
      now: FIXED_NOW,
      port,
    })).resolves.toEqual({ ...firstResult, kind: 'replayed' });
    expect(await port.snapshot()).toBe(beforeReplay);
    expect(port.commits).toHaveLength(1);

    await expect(processTeacherEvidence({
      evidence: createRatedEvidence({ rating: 1 }),
      graph,
      now: FIXED_NOW,
      port,
    })).resolves.toMatchObject({ kind: 'idempotency_conflict' });
    expect(await port.snapshot()).toBe(beforeReplay);
    expect(port.commits).toHaveLength(1);
  });

  it('keeps review identities unique when two commands share one source record', async () => {
    const { processTeacherEvidence } = await processorModule();
    const port = new MemoryTeacherProficiencyPort();
    const reversePort = new MemoryTeacherProficiencyPort();
    const graph = createFixtureGraph();
    const shared = {
      sourceRecordId: 'observation_records:shared-source',
      sourceType: 'walkthrough' as const,
      formalObservationId: undefined,
      targetSkillIds: [SKILL_IDS[0]],
      occurredAt: '2026-08-10T00:00:00.000Z',
    };
    const commandOne = createRatedEvidence({
      ...shared,
      idempotencyKey: 'shared-source-command-one',
      provenanceGroupId: 'provenance:shared-source-command-one',
      rating: 1,
    });
    const commandTwo = createRatedEvidence({
      ...shared,
      idempotencyKey: 'shared-source-command-two',
      provenanceGroupId: 'provenance:shared-source-command-two',
      rating: 4,
    });

    await processTeacherEvidence({ evidence: commandOne, graph, now: FIXED_NOW, port });
    await processTeacherEvidence({ evidence: commandTwo, graph, now: FIXED_NOW, port });
    await processTeacherEvidence({ evidence: commandTwo, graph, now: FIXED_NOW, port: reversePort });
    const commandTwoOriginal = (await reversePort.getTeacherState(TEACHER_ID)).reviews[0];
    await processTeacherEvidence({ evidence: commandOne, graph, now: FIXED_NOW, port: reversePort });

    const state = await port.getTeacherState(TEACHER_ID);
    const reverseState = await reversePort.getTeacherState(TEACHER_ID);
    expect(state.reviews).toHaveLength(2);
    expect(new Set(state.reviews.map((review) => review.reviewId)).size).toBe(2);
    expect(state.cards).toEqual([expect.objectContaining({ reps: 2 })]);
    expect(reverseState.cards).toEqual(state.cards);
    expect(reverseState.proficiency).toEqual(state.proficiency);
    expect(reverseState.knowledgeState).toEqual(state.knowledgeState);
    expect(new Set(reverseState.reviews.map((review) => review.reviewId)).size).toBe(3);
    expect(reverseState.reviews).toContainEqual(expect.objectContaining({
      isCorrection: true,
      correctionIdempotencyKey: commandOne.idempotencyKey,
      correctionSourceRecordId: commandOne.sourceRecordId,
    }));
    expect(reverseState.reviews.find((review) => review.reviewId === commandTwoOriginal.reviewId))
      .toEqual(commandTwoOriginal);
  });

  it('replays one Q1 command across empty, partial, and full target representations', async () => {
    const { processTeacherEvidence } = await processorModule();
    const port = new MemoryTeacherProficiencyPort();
    const graph = createFixtureGraph();
    const first = await processTeacherEvidence({
      evidence: createRatedEvidence({ targetSkillIds: [SKILL_IDS[0]] }),
      graph,
      now: FIXED_NOW,
      port,
    });

    await expect(processTeacherEvidence({
      evidence: createRatedEvidence({ targetSkillIds: [] }),
      graph,
      now: FIXED_NOW,
      port,
    })).resolves.toEqual({ ...first, kind: 'replayed' });
    await expect(processTeacherEvidence({
      evidence: createRatedEvidence({ targetSkillIds: [...SKILL_IDS].reverse() }),
      graph,
      now: FIXED_NOW,
      port,
    })).resolves.toEqual({ ...first, kind: 'replayed' });
    expect(port.commits).toHaveLength(1);
  });
});
