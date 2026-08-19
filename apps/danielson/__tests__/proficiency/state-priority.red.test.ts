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

describe('teacher skill state and walkthrough priority', () => {
  it('uses the canonical teacher, skill, and variant card identity and caps a stable valid review at 180 days', async () => {
    const { processTeacherEvidence } = await processorModule();
    const port = new MemoryTeacherProficiencyPort({ cards: [createStableDueCard()] });

    const result = await processTeacherEvidence({
      evidence: createRatedEvidence({ rating: 4 }),
      graph: createFixtureGraph(),
      now: FIXED_NOW,
      port,
    });
    const state = await port.getTeacherState(TEACHER_ID);
    const reviewedCard = state.cards.find((card) => card.objectiveId === SKILL_IDS[1]);

    expect(result).toMatchObject({ kind: 'applied' });
    expect(reviewedCard).toMatchObject({
      studentId: TEACHER_ID,
      objectiveId: SKILL_IDS[1],
      variantKey: SKILL_IDS[1],
    });
    expect(Date.parse(String(reviewedCard?.dueDate))).toBeLessThanOrEqual(
      Date.parse(FIXED_NOW) + 180 * DAY_MS,
    );
    expect(state.reviews).toEqual(expect.arrayContaining([
      expect.objectContaining({ cardId: reviewedCard?.cardId }),
    ]));
  });

  it('derives KST and priority projections from valid target evidence only', async () => {
    const { processTeacherEvidence } = await processorModule();
    const port = new MemoryTeacherProficiencyPort({ cards: [createStableDueCard()] });

    const result = await processTeacherEvidence({
      evidence: createRatedEvidence({
        idempotencyKey: 'walkthrough-priority-001',
        sourceRecordId: 'observation_records:walkthrough-priority-001',
        sourceType: 'walkthrough',
        formalObservationId: undefined,
        provenanceGroupId: 'provenance:walkthrough-priority-001',
        targetSkillIds: [SKILL_IDS[0]],
        rating: 3,
      }),
      graph: createFixtureGraph(),
      now: FIXED_NOW,
      port,
    });
    const state = await port.getTeacherState(TEACHER_ID);

    expect(result.knowledgeState.map((entry: { nodeId: string }) => entry.nodeId)).toEqual([SKILL_IDS[0]]);
    expect(state.knowledgeState.map((entry) => entry.nodeId)).toEqual([SKILL_IDS[0]]);
    expect(result.priority).toEqual([expect.objectContaining({
      skillId: SKILL_IDS[0],
      due: expect.any(Boolean),
      overdueDays: expect.any(Number),
      currentProficiency: expect.anything(),
      evidenceGaps: expect.any(Array),
      approvedPriorityInputs: expect.any(Array),
    })]);
  });
});
