import { describe, expect, it } from "vitest";
import {
  buildPracticeSubmissionEnvelope,
  type LearningEvidenceV1,
} from "@math-platform/practice-core";
import { InMemorySubmissionSrsAdapter } from "@math-platform/srs-engine";
import { buildKstState } from "@math-platform/knowledge-space-core";

import { loadFullCurriculumGraph } from "@/lib/curriculum/skill-graph-loader";

// Green target for Task 3.2. The app-owned adapter does not exist at the Red
// baseline. It must persist exposure separately and invoke the established
// IM3 SRS-to-KST path only for an eligible mastery_advantage event.
import {
  createIm3LearningEvidenceAdapter,
  IM3_DOMAIN_RANGE_GUIDED_ACTIVITY_ID,
  IM3_DOMAIN_RANGE_INDEPENDENT_ACTIVITY_ID,
  IM3_DOMAIN_RANGE_NODE,
  IM3_DOMAIN_RANGE_WORKED_ACTIVITY_ID,
  IM3_EQUATION_RATE_NODE,
  IM3_GUIDED_PRACTICE_ACTIVITY_ID,
  IM3_GUIDED_VARIANT_KEY,
  IM3_LEARNING_EVIDENCE_PILOT,
  IM3_LEARNING_EVIDENCE_PILOT_NODE_IDS,
  IM3_MASTERY_ADVANTAGE_ACTIVITY_ID,
  IM3_PROFIT_MODEL_GUIDED_ACTIVITY_ID,
  IM3_PROFIT_MODEL_INDEPENDENT_ACTIVITY_ID,
  IM3_PROFIT_MODEL_NODE,
  IM3_PROFIT_MODEL_WORKED_ACTIVITY_ID,
  IM3_PROFIT_MAXIMUM_GUIDED_ACTIVITY_ID,
  IM3_PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
  IM3_PROFIT_MAXIMUM_NODE,
  IM3_PROFIT_MAXIMUM_WORKED_ACTIVITY_ID,
  IM3_ONE_REAL_SOLUTION_GUIDED_ACTIVITY_ID,
  IM3_ONE_REAL_SOLUTION_INDEPENDENT_ACTIVITY_ID,
  IM3_ONE_REAL_SOLUTION_NODE,
  IM3_TWO_REAL_SOLUTIONS_NODE,
  IM3_ONE_REAL_SOLUTION_WORKED_ACTIVITY_ID,
  IM3_GRAPH_GUIDED_SEED_2_ACTIVITY_ID,
  IM3_GRAPH_GUIDED_SEED_2_VARIANT_KEY,
  IM3_GRAPH_INDEPENDENT_SEED_2_ACTIVITY_ID,
  IM3_GRAPH_INDEPENDENT_SEED_2_VARIANT_KEY,
  IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID,
  IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID,
  IM3_MAXIMUM_READING_NODE,
  IM3_MAXIMUM_READING_WORKED_ACTIVITY_ID,
  IM3_SYMMETRY_GUIDED_ACTIVITY_ID,
  IM3_SYMMETRY_INDEPENDENT_ACTIVITY_ID,
  IM3_SYMMETRY_NODE,
  IM3_SYMMETRY_WORKED_ACTIVITY_ID,
  IM3_PILOT_NODE,
  IM3_PILOT_VARIANT_KEY,
  IM3_TEACHER_LED_ACTIVITY_ID,
  type Im3LearningEvidenceStore,
  type Im3MasteryAdvantageBridge,
} from "@/lib/practice/learning-evidence-pilot";

const LEARNER_ID = "student-im3-pilot";
const PILOT_NODE_ID = "math.im3.skill.1.1.graph-quadratic-functions";
const NON_PILOT_NODE_ID = "math.im3.skill.1.1.find-and-interpret-the-average-rate-of-change";
const COMPARE_MAXIMUM_NODE_ID = "math.im3.skill.1.1.compare-maximum-values-of-quadratic-functions";
const COMPARE_MAXIMUM_WORKED_ACTIVITY_ID = `${COMPARE_MAXIMUM_NODE_ID}.worked_example`;
const COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID = `${COMPARE_MAXIMUM_NODE_ID}.guided_practice`;
const COMPARE_MAXIMUM_INDEPENDENT_ACTIVITY_ID = `${COMPARE_MAXIMUM_NODE_ID}.independent_practice`;
const PILOT_ACTIVITY_ID = `${PILOT_NODE_ID}.independent_practice`;
const KST_NOW = Date.parse("2026-08-19T12:00:00.000Z");

class InMemoryEvidenceStore implements Im3LearningEvidenceStore {
  readonly events: Array<{ learnerId: string; evidence: LearningEvidenceV1 }> = [];

  async findByIdempotencyKey(
    learnerId: string,
    idempotencyKey: string,
  ): Promise<LearningEvidenceV1 | null> {
    return (
      this.events.find(
        (entry) =>
          entry.learnerId === learnerId && entry.evidence.idempotencyKey === idempotencyKey,
      )?.evidence ?? null
    );
  }

  async listByLearnerAndNode(
    learnerId: string,
    nodeId: string,
  ): Promise<readonly LearningEvidenceV1[]> {
    return this.events
      .filter((entry) => entry.learnerId === learnerId && entry.evidence.nodeId === nodeId)
      .map((entry) => entry.evidence);
  }

  async append(learnerId: string, evidence: LearningEvidenceV1): Promise<void> {
    this.events.push({ learnerId, evidence });
  }
}

function makeEvidence(overrides: Partial<LearningEvidenceV1> = {}): LearningEvidenceV1 {
  return {
    contractVersion: "learning-evidence.v1",
    nodeId: PILOT_NODE_ID,
    activityId: PILOT_ACTIVITY_ID,
    attemptOrdinal: 1,
    origin: "teacher_led",
    mode: "teaching",
    occurredAt: "2026-08-19T08:30:00.000Z",
    idempotencyKey: "teacher-led-pilot-001",
    ...overrides,
  };
}

function makeFullScoreSubmission() {
  return buildPracticeSubmissionEnvelope({
    activityId: PILOT_ACTIVITY_ID,
    mode: "independent_practice",
    attemptNumber: 1,
    submittedAt: "2026-08-19T09:00:00.000Z",
    answers: { graph: "complete" },
    parts: [
      {
        partId: "graph",
        rawAnswer: "complete",
        isCorrect: true,
        score: 6,
        maxScore: 6,
      },
    ],
  });
}

async function snapshotKstAndSrs(adapter: InMemorySubmissionSrsAdapter) {
  const [cards, reviews] = await Promise.all([
    adapter.getCardStore().getCardsByStudent(LEARNER_ID),
    adapter.getReviewLogStore().getReviewsByStudent(LEARNER_ID),
  ]);
  const proficiencies = cards.map((card) => ({
    objectiveId: card.objectiveId,
    retentionStrength: card.reps > 0 ? 1 : 0,
    practiceCoverage: card.reps > 0 ? 1 : 0,
    isProficient: card.reps > 0,
  }));
  const kst = buildKstState(cards, proficiencies, loadFullCurriculumGraph(), KST_NOW);
  const state = Array.from(kst.state.values()).sort((left, right) =>
    left.nodeId.localeCompare(right.nodeId),
  );

  return {
    cards,
    reviews,
    state,
    serialized: JSON.stringify({
      cards: [...cards].sort((left, right) => left.cardId.localeCompare(right.cardId)),
      reviews: [...reviews].sort((left, right) => left.reviewId.localeCompare(right.reviewId)),
      state,
      fringe: [...kst.fringe].sort((left, right) => left.nodeId.localeCompare(right.nodeId)),
    }),
  };
}

function createHarness() {
  const store = new InMemoryEvidenceStore();
  const srsAdapter = new InMemorySubmissionSrsAdapter();
  srsAdapter.getResolver().register(PILOT_ACTIVITY_ID, {
    variantKey: PILOT_ACTIVITY_ID,
    objectiveId: PILOT_NODE_ID,
  });
  const masteryEvents: LearningEvidenceV1[] = [];
  const masteryBridge: Im3MasteryAdvantageBridge = async ({ learnerId, evidence }) => {
    masteryEvents.push(evidence);
    const result = await srsAdapter.processSubmission({
      studentId: learnerId,
      activityId: PILOT_ACTIVITY_ID,
      submission: makeFullScoreSubmission(),
    });
    if (!result.ok) {
      throw new Error("the established IM3 SRS path rejected eligible evidence");
    }
  };

  return {
    store,
    srsAdapter,
    masteryEvents,
    adapter: createIm3LearningEvidenceAdapter({ store, masteryBridge }),
  };
}

describe("IM3 teacher-led Mastery Advantage pilot boundary", () => {
  it("exports the exact profit-model Independent activity identity", () => {
    expect(IM3_PROFIT_MODEL_INDEPENDENT_ACTIVITY_ID).toBe(
      "math.im3.skill.1.1.build-and-simplify-a-quadratic-profit-model-from-context.independent_practice",
    );
  });

  it("exports the exact maximum-profit Guided activity identity", () => {
    expect(IM3_PROFIT_MAXIMUM_GUIDED_ACTIVITY_ID).toBe(
      "math.im3.skill.1.1.find-and-interpret-the-maximum-of-a-quadratic-profit-model.guided_practice",
    );
  });

  it("exports the exact maximum-profit Independent activity identity", () => {
    expect(IM3_PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY_ID).toBe(
      "math.im3.skill.1.1.find-and-interpret-the-maximum-of-a-quadratic-profit-model.independent_practice",
    );
  });

  it("exports the exact second graph Guided seed identity", () => {
    expect(IM3_GRAPH_GUIDED_SEED_2_ACTIVITY_ID).toBe(`${IM3_GUIDED_PRACTICE_ACTIVITY_ID}:seed-2`);
    expect(IM3_GRAPH_GUIDED_SEED_2_VARIANT_KEY).toBe(`${IM3_GUIDED_PRACTICE_ACTIVITY_ID}:seed-2`);
  });

  it("exports the exact second graph Independent seed identity", () => {
    expect(IM3_GRAPH_INDEPENDENT_SEED_2_ACTIVITY_ID).toBe(
      `${IM3_MASTERY_ADVANTAGE_ACTIVITY_ID}:seed-2`,
    );
    expect(IM3_GRAPH_INDEPENDENT_SEED_2_VARIANT_KEY).toBe(
      `${IM3_MASTERY_ADVANTAGE_ACTIVITY_ID}:seed-2`,
    );
  });

  it("exports maximum-reading runtime identities with the exact evidence mapping", () => {
    expect(IM3_MAXIMUM_READING_NODE).toBe(
      "math.im3.skill.1.1.identify-a-quadratic-maximum-from-its-graph",
    );
    expect(IM3_MAXIMUM_READING_WORKED_ACTIVITY_ID).toBe(
      `${IM3_MAXIMUM_READING_NODE}.worked_example`,
    );
    expect(IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID).toBe(
      `${IM3_MAXIMUM_READING_NODE}.guided_practice`,
    );
    expect(IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID).toBe(
      `${IM3_MAXIMUM_READING_NODE}.independent_practice`,
    );
    expect(IM3_LEARNING_EVIDENCE_PILOT_NODE_IDS).toEqual([
      PILOT_NODE_ID,
      IM3_EQUATION_RATE_NODE,
      IM3_DOMAIN_RANGE_NODE,
      IM3_MAXIMUM_READING_NODE,
      IM3_SYMMETRY_NODE,
      COMPARE_MAXIMUM_NODE_ID,
      IM3_PROFIT_MODEL_NODE,
      IM3_PROFIT_MAXIMUM_NODE,
      IM3_ONE_REAL_SOLUTION_NODE,
      IM3_TWO_REAL_SOLUTIONS_NODE,
    ]);
    expect(IM3_LEARNING_EVIDENCE_PILOT.enabledNodeIds).toEqual([
      IM3_PILOT_NODE,
      IM3_DOMAIN_RANGE_NODE,
      IM3_MAXIMUM_READING_NODE,
      IM3_SYMMETRY_NODE,
      COMPARE_MAXIMUM_NODE_ID,
      IM3_PROFIT_MODEL_NODE,
      IM3_PROFIT_MAXIMUM_NODE,
      IM3_ONE_REAL_SOLUTION_NODE,
    ]);
    expect(IM3_LEARNING_EVIDENCE_PILOT.mappings).toContainEqual({
      nodeId: IM3_MAXIMUM_READING_NODE,
      source: {
        activityId: IM3_MAXIMUM_READING_WORKED_ACTIVITY_ID,
        mode: "worked_example",
      },
      guided: {
        activityId: IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID,
        mode: "guided_practice",
        variantKey: IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID,
      },
      masteryAdvantage: {
        activityId: IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID,
        mode: "independent_practice",
        variantKey: IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID,
      },
    });
    expect(
      IM3_LEARNING_EVIDENCE_PILOT.mappings.filter(
        (mapping) => mapping.nodeId === IM3_MAXIMUM_READING_NODE,
      ),
    ).toHaveLength(1);
  });

  it("exports symmetry runtime identities with the exact evidence mapping", () => {
    expect(IM3_SYMMETRY_NODE).toBe(
      "math.im3.skill.1.1.graph-a-quadratic-from-a-vertex-and-y-intercept-using-symmetry",
    );
    expect(IM3_SYMMETRY_WORKED_ACTIVITY_ID).toBe(
      "math.im3.skill.1.1.graph-a-quadratic-from-a-vertex-and-y-intercept-using-symmetry.worked_example",
    );
    expect(IM3_SYMMETRY_GUIDED_ACTIVITY_ID).toBe(
      "math.im3.skill.1.1.graph-a-quadratic-from-a-vertex-and-y-intercept-using-symmetry.guided_practice",
    );
    expect(IM3_SYMMETRY_INDEPENDENT_ACTIVITY_ID).toBe(
      "math.im3.skill.1.1.graph-a-quadratic-from-a-vertex-and-y-intercept-using-symmetry.independent_practice",
    );
    expect(
      IM3_LEARNING_EVIDENCE_PILOT.mappings.filter(
        (mapping) => mapping.nodeId === IM3_SYMMETRY_NODE,
      ),
    ).toEqual([
      {
        nodeId: IM3_SYMMETRY_NODE,
        source: {
          activityId: IM3_SYMMETRY_WORKED_ACTIVITY_ID,
          mode: "worked_example",
        },
        guided: {
          activityId: IM3_SYMMETRY_GUIDED_ACTIVITY_ID,
          mode: "guided_practice",
          variantKey: IM3_SYMMETRY_GUIDED_ACTIVITY_ID,
        },
        masteryAdvantage: {
          activityId: IM3_SYMMETRY_INDEPENDENT_ACTIVITY_ID,
          mode: "independent_practice",
          variantKey: IM3_SYMMETRY_INDEPENDENT_ACTIVITY_ID,
        },
      },
    ]);
  });

  it("exports compare-maximum runtime identities with the exact evidence mapping", () => {
    expect(
      IM3_LEARNING_EVIDENCE_PILOT_NODE_IDS.filter(
        (nodeId) => String(nodeId) === COMPARE_MAXIMUM_NODE_ID,
      ),
    ).toHaveLength(1);
    const pilotNodeIndex = IM3_LEARNING_EVIDENCE_PILOT_NODE_IDS.map((nodeId) =>
      String(nodeId),
    ).indexOf(COMPARE_MAXIMUM_NODE_ID);
    expect(pilotNodeIndex).toBe(
      IM3_LEARNING_EVIDENCE_PILOT_NODE_IDS.indexOf(IM3_SYMMETRY_NODE) + 1,
    );
    expect(pilotNodeIndex).toBe(
      IM3_LEARNING_EVIDENCE_PILOT_NODE_IDS.indexOf(IM3_PROFIT_MODEL_NODE) - 1,
    );
    expect(
      IM3_LEARNING_EVIDENCE_PILOT.enabledNodeIds.filter(
        (nodeId) => String(nodeId) === COMPARE_MAXIMUM_NODE_ID,
      ),
    ).toHaveLength(1);
    const enabledNodeIndex = IM3_LEARNING_EVIDENCE_PILOT.enabledNodeIds
      .map((nodeId) => String(nodeId))
      .indexOf(COMPARE_MAXIMUM_NODE_ID);
    expect(enabledNodeIndex).toBe(
      IM3_LEARNING_EVIDENCE_PILOT.enabledNodeIds.indexOf(IM3_SYMMETRY_NODE) + 1,
    );
    expect(enabledNodeIndex).toBe(
      IM3_LEARNING_EVIDENCE_PILOT.enabledNodeIds.indexOf(IM3_PROFIT_MODEL_NODE) - 1,
    );
    expect(
      IM3_LEARNING_EVIDENCE_PILOT.mappings.filter(
        (mapping) => String(mapping.nodeId) === COMPARE_MAXIMUM_NODE_ID,
      ),
    ).toEqual([
      {
        nodeId: COMPARE_MAXIMUM_NODE_ID,
        source: {
          activityId: COMPARE_MAXIMUM_WORKED_ACTIVITY_ID,
          mode: "worked_example",
        },
        guided: {
          activityId: COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID,
          mode: "guided_practice",
          variantKey: COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID,
        },
        masteryAdvantage: {
          activityId: COMPARE_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
          mode: "independent_practice",
          variantKey: COMPARE_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
        },
      },
    ]);
  });

  it("freezes the enabled IM3 pilot nodes", () => {
    expect(IM3_LEARNING_EVIDENCE_PILOT_NODE_IDS).toEqual([
      PILOT_NODE_ID,
      IM3_EQUATION_RATE_NODE,
      IM3_DOMAIN_RANGE_NODE,
      IM3_MAXIMUM_READING_NODE,
      IM3_SYMMETRY_NODE,
      COMPARE_MAXIMUM_NODE_ID,
      IM3_PROFIT_MODEL_NODE,
      IM3_PROFIT_MAXIMUM_NODE,
      IM3_ONE_REAL_SOLUTION_NODE,
      IM3_TWO_REAL_SOLUTIONS_NODE,
    ]);
    expect(new Set(IM3_LEARNING_EVIDENCE_PILOT_NODE_IDS).size).toBe(
      IM3_LEARNING_EVIDENCE_PILOT_NODE_IDS.length,
    );
    expect(IM3_LEARNING_EVIDENCE_PILOT_NODE_IDS).not.toContain(NON_PILOT_NODE_ID);
  });

  it("maps the enabled IM3 nodes to exact source, Guided, and Independent identities", () => {
    expect(IM3_LEARNING_EVIDENCE_PILOT.enabledNodeIds).toEqual([
      IM3_PILOT_NODE,
      IM3_DOMAIN_RANGE_NODE,
      IM3_MAXIMUM_READING_NODE,
      IM3_SYMMETRY_NODE,
      COMPARE_MAXIMUM_NODE_ID,
      IM3_PROFIT_MODEL_NODE,
      IM3_PROFIT_MAXIMUM_NODE,
      IM3_ONE_REAL_SOLUTION_NODE,
    ]);
    expect(new Set(IM3_LEARNING_EVIDENCE_PILOT.enabledNodeIds).size).toBe(
      IM3_LEARNING_EVIDENCE_PILOT.enabledNodeIds.length,
    );
    expect(IM3_LEARNING_EVIDENCE_PILOT.mappings).toEqual([
      {
        nodeId: IM3_PILOT_NODE,
        source: {
          activityId: IM3_TEACHER_LED_ACTIVITY_ID,
          mode: "worked_example",
        },
        guided: {
          activityId: IM3_GUIDED_PRACTICE_ACTIVITY_ID,
          mode: "guided_practice",
          variantKey: IM3_GUIDED_VARIANT_KEY,
        },
        masteryAdvantage: {
          activityId: IM3_MASTERY_ADVANTAGE_ACTIVITY_ID,
          mode: "independent_practice",
          variantKey: IM3_PILOT_VARIANT_KEY,
        },
      },
      {
        nodeId: IM3_DOMAIN_RANGE_NODE,
        source: {
          activityId: IM3_DOMAIN_RANGE_WORKED_ACTIVITY_ID,
          mode: "worked_example",
        },
        guided: {
          activityId: IM3_DOMAIN_RANGE_GUIDED_ACTIVITY_ID,
          mode: "guided_practice",
          variantKey: IM3_DOMAIN_RANGE_GUIDED_ACTIVITY_ID,
        },
        masteryAdvantage: {
          activityId: IM3_DOMAIN_RANGE_INDEPENDENT_ACTIVITY_ID,
          mode: "independent_practice",
          variantKey: IM3_DOMAIN_RANGE_INDEPENDENT_ACTIVITY_ID,
        },
      },
      {
        nodeId: IM3_MAXIMUM_READING_NODE,
        source: {
          activityId: IM3_MAXIMUM_READING_WORKED_ACTIVITY_ID,
          mode: "worked_example",
        },
        guided: {
          activityId: IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID,
          mode: "guided_practice",
          variantKey: IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID,
        },
        masteryAdvantage: {
          activityId: IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID,
          mode: "independent_practice",
          variantKey: IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID,
        },
      },
      {
        nodeId: IM3_SYMMETRY_NODE,
        source: {
          activityId: IM3_SYMMETRY_WORKED_ACTIVITY_ID,
          mode: "worked_example",
        },
        guided: {
          activityId: IM3_SYMMETRY_GUIDED_ACTIVITY_ID,
          mode: "guided_practice",
          variantKey: IM3_SYMMETRY_GUIDED_ACTIVITY_ID,
        },
        masteryAdvantage: {
          activityId: IM3_SYMMETRY_INDEPENDENT_ACTIVITY_ID,
          mode: "independent_practice",
          variantKey: IM3_SYMMETRY_INDEPENDENT_ACTIVITY_ID,
        },
      },
      {
        nodeId: COMPARE_MAXIMUM_NODE_ID,
        source: {
          activityId: COMPARE_MAXIMUM_WORKED_ACTIVITY_ID,
          mode: "worked_example",
        },
        guided: {
          activityId: COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID,
          mode: "guided_practice",
          variantKey: COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID,
        },
        masteryAdvantage: {
          activityId: COMPARE_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
          mode: "independent_practice",
          variantKey: COMPARE_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
        },
      },
      {
        nodeId: IM3_PROFIT_MODEL_NODE,
        source: {
          activityId: IM3_PROFIT_MODEL_WORKED_ACTIVITY_ID,
          mode: "worked_example",
        },
        guided: {
          activityId: IM3_PROFIT_MODEL_GUIDED_ACTIVITY_ID,
          mode: "guided_practice",
          variantKey: IM3_PROFIT_MODEL_GUIDED_ACTIVITY_ID,
        },
        masteryAdvantage: {
          activityId: IM3_PROFIT_MODEL_INDEPENDENT_ACTIVITY_ID,
          mode: "independent_practice",
          variantKey: IM3_PROFIT_MODEL_INDEPENDENT_ACTIVITY_ID,
        },
      },
      {
        nodeId: IM3_PROFIT_MAXIMUM_NODE,
        source: {
          activityId: IM3_PROFIT_MAXIMUM_WORKED_ACTIVITY_ID,
          mode: "worked_example",
        },
        guided: {
          activityId: IM3_PROFIT_MAXIMUM_GUIDED_ACTIVITY_ID,
          mode: "guided_practice",
          variantKey: IM3_PROFIT_MAXIMUM_GUIDED_ACTIVITY_ID,
        },
        masteryAdvantage: {
          activityId: IM3_PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
          mode: "independent_practice",
          variantKey: IM3_PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
        },
      },
      {
        nodeId: IM3_ONE_REAL_SOLUTION_NODE,
        source: {
          activityId: IM3_ONE_REAL_SOLUTION_WORKED_ACTIVITY_ID,
          mode: "worked_example",
        },
        guided: {
          activityId: IM3_ONE_REAL_SOLUTION_GUIDED_ACTIVITY_ID,
          mode: "guided_practice",
          variantKey: IM3_ONE_REAL_SOLUTION_GUIDED_ACTIVITY_ID,
        },
        masteryAdvantage: {
          activityId: IM3_ONE_REAL_SOLUTION_INDEPENDENT_ACTIVITY_ID,
          mode: "independent_practice",
          variantKey: IM3_ONE_REAL_SOLUTION_INDEPENDENT_ACTIVITY_ID,
        },
      },
    ]);
    expect(
      new Set(IM3_LEARNING_EVIDENCE_PILOT.mappings.map((mapping) => mapping.nodeId)).size,
    ).toBe(IM3_LEARNING_EVIDENCE_PILOT.mappings.length);
    expect(IM3_LEARNING_EVIDENCE_PILOT.mappings.map((mapping) => mapping.nodeId)).toEqual([
      IM3_PILOT_NODE,
      IM3_DOMAIN_RANGE_NODE,
      IM3_MAXIMUM_READING_NODE,
      IM3_SYMMETRY_NODE,
      COMPARE_MAXIMUM_NODE_ID,
      IM3_PROFIT_MODEL_NODE,
      IM3_PROFIT_MAXIMUM_NODE,
      IM3_ONE_REAL_SOLUTION_NODE,
    ]);
    const profitMapping = IM3_LEARNING_EVIDENCE_PILOT.mappings[5];
    expect(profitMapping).toMatchObject({
      nodeId: IM3_PROFIT_MODEL_NODE,
      source: {
        activityId: IM3_PROFIT_MODEL_WORKED_ACTIVITY_ID,
        mode: "worked_example",
      },
      guided: {
        activityId: IM3_PROFIT_MODEL_GUIDED_ACTIVITY_ID,
        mode: "guided_practice",
        variantKey: IM3_PROFIT_MODEL_GUIDED_ACTIVITY_ID,
      },
      masteryAdvantage: {
        activityId: IM3_PROFIT_MODEL_INDEPENDENT_ACTIVITY_ID,
        mode: "independent_practice",
        variantKey: IM3_PROFIT_MODEL_INDEPENDENT_ACTIVITY_ID,
      },
    });
    const maximumMapping = IM3_LEARNING_EVIDENCE_PILOT.mappings[6];
    expect(maximumMapping).toEqual({
      nodeId: IM3_PROFIT_MAXIMUM_NODE,
      source: {
        activityId: IM3_PROFIT_MAXIMUM_WORKED_ACTIVITY_ID,
        mode: "worked_example",
      },
      guided: {
        activityId: IM3_PROFIT_MAXIMUM_GUIDED_ACTIVITY_ID,
        mode: "guided_practice",
        variantKey: IM3_PROFIT_MAXIMUM_GUIDED_ACTIVITY_ID,
      },
      masteryAdvantage: {
        activityId: IM3_PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
        mode: "independent_practice",
        variantKey: IM3_PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
      },
    });
  });

  it("introduces a full-score teacher-led pilot exactly once without changing KST or SRS bytes", async () => {
    const { adapter, masteryEvents, srsAdapter, store } = createHarness();
    const before = await snapshotKstAndSrs(srsAdapter);

    const first = await adapter.process({
      learnerId: LEARNER_ID,
      evidence: makeEvidence({
        gradedEvidence: { isCorrect: true, score: 6, maxScore: 6 },
      }),
    });
    const afterFirst = await snapshotKstAndSrs(srsAdapter);
    const replay = await adapter.process({
      learnerId: LEARNER_ID,
      evidence: makeEvidence({
        gradedEvidence: { isCorrect: true, score: 6, maxScore: 6 },
      }),
    });

    expect(first).toMatchObject({
      persisted: true,
      masteryApplied: false,
      decision: {
        idempotency: "new",
        exposureState: "introduced",
        eligible: false,
        reason: "teacher_led",
        masteryBearing: false,
      },
    });
    expect(replay).toMatchObject({
      persisted: false,
      masteryApplied: false,
      decision: {
        idempotency: "replay",
        exposureState: "introduced",
        eligible: false,
        reason: "teacher_led",
        masteryBearing: false,
      },
    });
    expect(store.events).toHaveLength(1);
    expect(masteryEvents).toHaveLength(0);
    expect(afterFirst.serialized).toBe(before.serialized);
    expect((await snapshotKstAndSrs(srsAdapter)).serialized).toBe(before.serialized);
  });

  it("returns awaiting_teacher_exposure before exposure and performs no KST or SRS write", async () => {
    const { adapter, masteryEvents, srsAdapter } = createHarness();
    const before = await snapshotKstAndSrs(srsAdapter);

    const result = await adapter.process({
      learnerId: LEARNER_ID,
      evidence: makeEvidence({
        origin: "mastery_advantage",
        mode: "independent_practice",
        occurredAt: "2026-08-19T09:00:00.000Z",
        idempotencyKey: "mastery-before-teacher",
        gradedEvidence: { isCorrect: true, score: 6, maxScore: 6 },
      }),
    });

    expect(result).toMatchObject({
      persisted: false,
      masteryApplied: false,
      decision: {
        idempotency: "new",
        exposureState: "awaiting_teacher_exposure",
        eligible: false,
        reason: "awaiting_teacher_exposure",
        masteryBearing: false,
      },
    });
    expect(masteryEvents).toHaveLength(0);
    expect((await snapshotKstAndSrs(srsAdapter)).serialized).toBe(before.serialized);
  });

  it("sends one later graded Mastery Advantage event through the established IM3 SRS-to-KST path", async () => {
    const { adapter, masteryEvents, srsAdapter } = createHarness();
    const before = await snapshotKstAndSrs(srsAdapter);

    await adapter.process({
      learnerId: LEARNER_ID,
      evidence: makeEvidence(),
    });
    const result = await adapter.process({
      learnerId: LEARNER_ID,
      evidence: makeEvidence({
        origin: "mastery_advantage",
        mode: "independent_practice",
        occurredAt: "2026-08-19T09:00:00.000Z",
        idempotencyKey: "mastery-after-teacher",
        gradedEvidence: { isCorrect: true, score: 6, maxScore: 6 },
      }),
    });
    const after = await snapshotKstAndSrs(srsAdapter);

    expect(result).toMatchObject({
      persisted: true,
      masteryApplied: true,
      decision: {
        idempotency: "new",
        exposureState: "introduced",
        eligible: true,
        reason: "eligible",
        masteryBearing: true,
      },
    });
    expect(masteryEvents).toHaveLength(1);
    expect(masteryEvents[0]).toMatchObject({ nodeId: PILOT_NODE_ID });
    expect(after.cards).toHaveLength(1);
    expect(after.reviews).toHaveLength(1);
    expect(after.serialized).not.toBe(before.serialized);
    expect(after.state.find((entry) => entry.nodeId === PILOT_NODE_ID)).toMatchObject({
      mastery: 1,
      retention: 1,
      isProficient: true,
      state: "mastered",
    });
  });

  it("keeps a non-pilot IM3 node disabled without persistence or mastery effects", async () => {
    const { adapter, masteryEvents, srsAdapter, store } = createHarness();
    const before = await snapshotKstAndSrs(srsAdapter);

    const result = await adapter.process({
      learnerId: LEARNER_ID,
      evidence: makeEvidence({
        nodeId: NON_PILOT_NODE_ID,
        activityId: `${NON_PILOT_NODE_ID}.independent_practice`,
        idempotencyKey: "non-pilot-teacher-exposure",
        gradedEvidence: { isCorrect: true, score: 6, maxScore: 6 },
      }),
    });

    expect(result).toMatchObject({
      persisted: false,
      masteryApplied: false,
      decision: {
        idempotency: "new",
        exposureState: "awaiting_teacher_exposure",
        eligible: false,
        reason: "node_not_enabled",
        masteryBearing: false,
      },
    });
    expect(store.events).toHaveLength(0);
    expect(masteryEvents).toHaveLength(0);
    expect((await snapshotKstAndSrs(srsAdapter)).serialized).toBe(before.serialized);
  });
});
