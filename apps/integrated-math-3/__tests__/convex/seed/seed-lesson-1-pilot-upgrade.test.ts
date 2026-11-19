import { describe, expect, it, vi } from "vitest";

import { getGenerator } from "@math-platform/math-content/knowledge-space";
import {
  buildIm3EquationRateWorkedSeedDocument,
  buildIm3EquationRateGuidedSeedDocuments,
  buildIm3EquationRateIndependentSeedDocuments,
  buildIm3GuidedPilotSeedDocuments,
  buildIm3GraphGuidedSeed2Documents,
  buildIm3GraphIndependentSeed2Documents,
  buildIm3PilotSeedDocuments,
  buildIm3MaximumReadingGuidedSeedDocuments,
  buildIm3MaximumReadingIndependentSeedDocuments,
  buildIm3MaximumReadingWorkedSeedDocument,
  buildIm3CompareMaximumWorkedSeedDocument,
  buildIm3CompareMaximumGuidedSeedDocuments,
  buildIm3CompareMaximumIndependentSeedDocuments,
  buildIm3SymmetryGuidedSeedDocuments,
  buildIm3SymmetryIndependentSeedDocuments,
  buildIm3SymmetryWorkedSeedDocument,
  seedLesson1,
} from "@/convex/seed/seed_lesson_1_1";
import {
  IM3_GUIDED_PRACTICE_ACTIVITY_ID,
  IM3_GUIDED_VARIANT_KEY,
  IM3_GRAPH_GUIDED_SEED_2_ACTIVITY_ID,
  IM3_GRAPH_GUIDED_SEED_2_VARIANT_KEY,
  IM3_GRAPH_INDEPENDENT_SEED_2_ACTIVITY_ID,
  IM3_GRAPH_INDEPENDENT_SEED_2_VARIANT_KEY,
  IM3_EQUATION_RATE_WORKED_ACTIVITY_ID,
  IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID,
  IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID,
  IM3_MAXIMUM_READING_NODE,
  IM3_MAXIMUM_READING_WORKED_ACTIVITY_ID,
  IM3_COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID,
  IM3_COMPARE_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
  IM3_COMPARE_MAXIMUM_NODE,
  IM3_COMPARE_MAXIMUM_WORKED_ACTIVITY_ID,
  IM3_MASTERY_ADVANTAGE_ACTIVITY_ID,
  IM3_PILOT_NODE,
  IM3_PILOT_VARIANT_KEY,
  IM3_SYMMETRY_GUIDED_ACTIVITY_ID,
  IM3_SYMMETRY_INDEPENDENT_ACTIVITY_ID,
  IM3_SYMMETRY_NODE,
  IM3_SYMMETRY_WORKED_ACTIVITY_ID,
  IM3_TEACHER_LED_ACTIVITY_ID,
} from "@/lib/practice/learning-evidence-pilot";

const LESSON_ID = "lessons:module-1-lesson-1";
const LESSON_VERSION_ID = "lesson_versions:module-1-lesson-1";
const PHASE_FOUR_ID = "phase_versions:module-1-lesson-1:4";
const PHASE_FIVE_ID = "phase_versions:module-1-lesson-1:5";
const PHASE_EIGHT_ID = "phase_versions:module-1-lesson-1:8";
const TEACHER_ACTIVITY_ID = "activities:canonical-teacher-source";
const MASTERY_ACTIVITY_ID = "activities:canonical-mastery-source";
const PROFIT_MODEL_NODE =
  "math.im3.skill.1.1.build-and-simplify-a-quadratic-profit-model-from-context";
const PROFIT_MODEL_ACTIVITY_ID = `${PROFIT_MODEL_NODE}.independent_practice`;
const PROFIT_MODEL_VARIANT_KEY = PROFIT_MODEL_ACTIVITY_ID;
const PROFIT_MODEL_ITEM_ID = `${PROFIT_MODEL_ACTIVITY_ID}:seed-2`;
const EQUATION_RATE_NODE = "math.im3.skill.1.1.calculate-average-rate-of-change-from-an-equation";
const EQUATION_RATE_GUIDED_ACTIVITY_ID = `${EQUATION_RATE_NODE}.guided_practice`;
const EQUATION_RATE_INDEPENDENT_ACTIVITY_ID = `${EQUATION_RATE_NODE}.independent_practice`;

type Row = Record<string, unknown> & { _id: string };
type SeedHandler = (ctx: unknown) => Promise<{
  lessonId: string;
  lessonVersionId: string;
  phasesCreated: number;
  activitiesCreated: number;
}>;

const seedLesson1Handler = (seedLesson1 as unknown as { _handler: SeedHandler })._handler;

function matches(row: Row, conditions: ReadonlyMap<string, unknown>): boolean {
  return [...conditions].every(([field, value]) => row[field] === value);
}

function createUpgradeState() {
  const rows: Record<string, Row[]> = {
    lessons: [
      {
        _id: LESSON_ID,
        slug: "module-1-lesson-1",
        title: "Protected course lesson title",
      },
    ],
    lesson_versions: [
      {
        _id: LESSON_VERSION_ID,
        lessonId: LESSON_ID,
        title: "Protected published lesson version title",
      },
    ],
    phase_versions: Array.from({ length: 12 }, (_, index) => ({
      _id: `phase_versions:module-1-lesson-1:${index + 1}`,
      lessonVersionId: LESSON_VERSION_ID,
      phaseNumber: index + 1,
    })),
    phase_sections: [
      {
        _id: "phase_sections:existing-graph-example-text",
        phaseVersionId: PHASE_FOUR_ID,
        sequenceOrder: 1,
        sectionType: "text",
        content: { markdown: "## Example 1: Graph a Quadratic" },
      },
      {
        _id: "phase_sections:existing-worked-example",
        phaseVersionId: PHASE_FOUR_ID,
        sequenceOrder: 2,
        sectionType: "activity",
        content: {
          componentKey: "step-by-step-solver",
          activityId: "activities:existing-worked-example",
        },
      },
      {
        _id: "phase_sections:existing-example-2-text",
        phaseVersionId: PHASE_FIVE_ID,
        sequenceOrder: 1,
        sectionType: "text",
        content: {
          markdown:
            "## Example 2: Compare $f(x) = x^2$ and $g(x) = 2x^2$\n\nHow does multiplying by 2 affect the graph?",
        },
      },
      {
        _id: "phase_sections:existing-example-2-activity",
        phaseVersionId: PHASE_FIVE_ID,
        sequenceOrder: 2,
        sectionType: "activity",
        content: {
          componentKey: "step-by-step-solver",
          activityId: "activities:legacy-example-2",
        },
      },
      {
        _id: "phase_sections:existing-rate-example-text",
        phaseVersionId: PHASE_EIGHT_ID,
        sequenceOrder: 1,
        sectionType: "text",
        content: {
          markdown: "## Example 4: Legacy Rate Prompt\n\nUse the old activity below.",
        },
      },
      {
        _id: "phase_sections:existing-rate-example-activity",
        phaseVersionId: PHASE_EIGHT_ID,
        sequenceOrder: 2,
        sectionType: "activity",
        content: {
          componentKey: "step-by-step-solver",
          activityId: "activities:legacy-rate-example",
        },
      },
      {
        _id: "phase_sections:existing-profit-example-text",
        phaseVersionId: "phase_versions:module-1-lesson-1:6",
        sequenceOrder: 1,
        sectionType: "text",
        content: { markdown: "## Example 3: Build a quadratic profit model" },
      },
      {
        _id: "phase_sections:existing-profit-example-activity",
        phaseVersionId: "phase_versions:module-1-lesson-1:6",
        sequenceOrder: 2,
        sectionType: "activity",
        content: {
          componentKey: "step-by-step-solver",
          activityId: "activities:legacy-profit-example",
        },
      },
    ],
    activities: [
      {
        _id: TEACHER_ACTIVITY_ID,
        stableActivityId: IM3_TEACHER_LED_ACTIVITY_ID,
        masteryNodeId: IM3_PILOT_NODE,
        componentKey: "graphing-explorer",
        learningEvidenceMode: "worked_example",
        srsEligible: false,
        displayName: "Teacher source with a display title",
        props: { title: "Teacher-led quadratic graph analysis" },
      },
      {
        _id: MASTERY_ACTIVITY_ID,
        stableActivityId: IM3_MASTERY_ADVANTAGE_ACTIVITY_ID,
        masteryNodeId: IM3_PILOT_NODE,
        componentKey: "graphing-explorer",
        srsEligible: true,
      },
    ],
    practice_variants: [
      {
        _id: "practice_variants:im3-pilot",
        variantKey: IM3_PILOT_VARIANT_KEY,
      },
    ],
    practice_items: [
      {
        _id: "practice_items:im3-pilot",
        activityId: MASTERY_ACTIVITY_ID,
        variantKey: IM3_PILOT_VARIANT_KEY,
        practiceItemId: `${IM3_PILOT_VARIANT_KEY}:pilot`,
      },
    ],
  };
  const patchCalls: Array<[string, Record<string, unknown>]> = [];
  const insertCalls: Array<[string, Record<string, unknown>]> = [];
  const writeCalls: Array<["insert" | "patch", string, Record<string, unknown>]> = [];

  const query = (tableName: string) => ({
    withIndex: (
      _indexName: string,
      configure: (query: { eq(field: string, value: unknown): unknown }) => unknown,
    ) => {
      const conditions = new Map<string, unknown>();
      const index = {
        eq(field: string, value: unknown) {
          conditions.set(field, value);
          return index;
        },
      };
      configure(index);
      const selected = () => (rows[tableName] ?? []).filter((row) => matches(row, conditions));
      return {
        unique: async () => selected()[0] ?? null,
        first: async () => selected()[0] ?? null,
        collect: async () => selected(),
        take: async (limit: number) => selected().slice(0, limit),
      };
    },
  });

  const insert = async (tableName: string, document: Record<string, unknown>) => {
    const id = `${tableName}:inserted-${insertCalls.length + 1}`;
    const row = { _id: id, ...document };
    (rows[tableName] ??= []).push(row);
    insertCalls.push([tableName, document]);
    writeCalls.push(["insert", tableName, document]);
    return id;
  };
  const patch = async (id: string, document: Record<string, unknown>) => {
    patchCalls.push([id, document]);
    writeCalls.push(["patch", id, document]);
    for (const tableRows of Object.values(rows)) {
      const row = tableRows.find((candidate) => candidate._id === id);
      if (row) Object.assign(row, document);
    }
  };
  const get = async (id: string) =>
    Object.values(rows)
      .flat()
      .find((row) => row._id === id) ?? null;

  return {
    ctx: { db: { query, insert, patch, get } },
    insertCalls,
    patchCalls,
    writeCalls,
    rows,
  };
}

describe("seedLesson1 IM3 pilot upgrade state", () => {
  it("preserves existing lesson titles and converges the teacher source at phase 4 exactly once", async () => {
    const state = createUpgradeState();

    const first = await seedLesson1Handler(state.ctx);
    const teacherSourcesAfterFirstSeed = state.rows.activities.filter(
      (activity) => activity.stableActivityId === IM3_TEACHER_LED_ACTIVITY_ID,
    );
    expect(teacherSourcesAfterFirstSeed).toHaveLength(1);
    expect(teacherSourcesAfterFirstSeed[0]).toMatchObject({
      _id: TEACHER_ACTIVITY_ID,
      displayName: "Graph a quadratic function by using a table",
      props: { variant: "plot_from_equation", equation: "f(x) = x^2 + 2x - 3" },
    });

    const second = await seedLesson1Handler(state.ctx);

    expect(first).toMatchObject({
      lessonId: LESSON_ID,
      lessonVersionId: LESSON_VERSION_ID,
      phasesCreated: 0,
      activitiesCreated: 0,
    });
    expect(second).toMatchObject({ phasesCreated: 0, activitiesCreated: 0 });
    expect(state.rows.lessons[0]?.title).toBe("Protected course lesson title");
    expect(state.rows.lesson_versions[0]?.title).toBe("Protected published lesson version title");
    expect(state.patchCalls.map(([id]) => id)).not.toContain(LESSON_ID);
    expect(state.patchCalls.map(([id]) => id)).not.toContain(LESSON_VERSION_ID);

    const finalTeacherSources = state.rows.activities.filter(
      (activity) => activity.stableActivityId === IM3_TEACHER_LED_ACTIVITY_ID,
    );
    expect(finalTeacherSources).toHaveLength(1);
    expect(finalTeacherSources[0]).toMatchObject({
      _id: TEACHER_ACTIVITY_ID,
      displayName: "Graph a quadratic function by using a table",
      props: { variant: "plot_from_equation", equation: "f(x) = x^2 + 2x - 3" },
    });

    const teacherLinks = state.rows.phase_sections.filter(
      (section) =>
        section.phaseVersionId === PHASE_FOUR_ID &&
        section.sectionType === "activity" &&
        (section.content as { activityId?: string }).activityId === TEACHER_ACTIVITY_ID,
    );
    expect(teacherLinks).toHaveLength(1);
    expect(teacherLinks[0]).toMatchObject({
      phaseVersionId: PHASE_FOUR_ID,
      sequenceOrder: 3,
      content: {
        componentKey: "graphing-explorer",
        activityId: TEACHER_ACTIVITY_ID,
      },
    });
    expect(
      state.rows.phase_sections.some(
        (section) =>
          section.phaseVersionId === "phase_versions:module-1-lesson-1:1" &&
          (section.content as { activityId?: string }).activityId === TEACHER_ACTIVITY_ID,
      ),
    ).toBe(false);
    expect(
      state.insertCalls.filter(
        ([tableName, data]) =>
          tableName === "phase_sections" && data.phaseVersionId === PHASE_FOUR_ID,
      ),
    ).toHaveLength(1);
    const masteryActivity = state.rows.activities.find(
      (activity) => activity._id === MASTERY_ACTIVITY_ID,
    );
    expect(masteryActivity).toMatchObject({
      stableActivityId: IM3_MASTERY_ADVANTAGE_ACTIVITY_ID,
      masteryNodeId: IM3_PILOT_NODE,
      componentKey: "graphing-explorer",
      srsEligible: false,
    });
    expect(teacherLinks[0]?.content).not.toMatchObject({ activityId: MASTERY_ACTIVITY_ID });

    const expectedGuided = buildIm3GuidedPilotSeedDocuments("activities:guided" as never, 0);
    const guidedActivities = state.rows.activities.filter(
      (activity) => activity.stableActivityId === IM3_GUIDED_PRACTICE_ACTIVITY_ID,
    );
    expect(guidedActivities).toHaveLength(1);
    const guidedActivity = guidedActivities[0];
    expect(guidedActivity).toMatchObject({
      stableActivityId: IM3_GUIDED_PRACTICE_ACTIVITY_ID,
      masteryNodeId: IM3_PILOT_NODE,
      componentKey: "graphing-explorer",
      props: expectedGuided.activity.props,
      gradingConfig: expectedGuided.activity.gradingConfig,
      srsEligible: false,
    });

    const guidedVariants = state.rows.practice_variants.filter(
      (variant) => variant.variantKey === IM3_GUIDED_VARIANT_KEY,
    );
    expect(guidedVariants).toHaveLength(1);
    expect(guidedVariants[0]).toMatchObject({
      variantKey: IM3_GUIDED_VARIANT_KEY,
      legacyProblemFamilyId: IM3_GUIDED_VARIANT_KEY,
      componentKey: "graphing-explorer",
      objectiveIds: [IM3_PILOT_NODE],
      metadata: {
        stableActivityId: IM3_GUIDED_PRACTICE_ACTIVITY_ID,
      },
    });

    const guidedItems = state.rows.practice_items.filter(
      (item) => item.practiceItemId === `${IM3_GUIDED_VARIANT_KEY}:seed-1`,
    );
    expect(guidedItems).toHaveLength(1);
    expect(guidedItems[0]).toMatchObject({
      practiceItemId: `${IM3_GUIDED_VARIANT_KEY}:seed-1`,
      activityId: guidedActivity?._id,
      variantKey: IM3_GUIDED_VARIANT_KEY,
      legacyProblemFamilyId: IM3_GUIDED_VARIANT_KEY,
      variantLabel: "Seed 1",
    });

    const expectedEquationRateGuided = buildIm3EquationRateGuidedSeedDocuments(
      "activities:equation-rate-guided" as never,
      0,
    );
    const expectedEquationRateIndependent = buildIm3EquationRateIndependentSeedDocuments(
      "activities:equation-rate-independent" as never,
      0,
    );
    const equationRateGuidedActivities = state.rows.activities.filter(
      (activity) => activity.stableActivityId === EQUATION_RATE_GUIDED_ACTIVITY_ID,
    );
    const equationRateIndependentActivities = state.rows.activities.filter(
      (activity) => activity.stableActivityId === EQUATION_RATE_INDEPENDENT_ACTIVITY_ID,
    );
    expect(equationRateGuidedActivities).toHaveLength(1);
    expect(equationRateIndependentActivities).toHaveLength(1);
    expect(equationRateGuidedActivities[0]).toMatchObject({
      stableActivityId: EQUATION_RATE_GUIDED_ACTIVITY_ID,
      masteryNodeId: EQUATION_RATE_NODE,
      componentKey: "rate-of-change-calculator",
      props: expectedEquationRateGuided.activity.props,
      gradingConfig: expectedEquationRateGuided.activity.gradingConfig,
      srsEligible: true,
    });
    expect(equationRateIndependentActivities[0]).toMatchObject({
      stableActivityId: EQUATION_RATE_INDEPENDENT_ACTIVITY_ID,
      masteryNodeId: EQUATION_RATE_NODE,
      componentKey: "rate-of-change-calculator",
      props: expectedEquationRateIndependent.activity.props,
      gradingConfig: expectedEquationRateIndependent.activity.gradingConfig,
      srsEligible: true,
    });

    const equationRateGuidedVariants = state.rows.practice_variants.filter(
      (variant) => variant.variantKey === EQUATION_RATE_GUIDED_ACTIVITY_ID,
    );
    const equationRateIndependentVariants = state.rows.practice_variants.filter(
      (variant) => variant.variantKey === EQUATION_RATE_INDEPENDENT_ACTIVITY_ID,
    );
    expect(equationRateGuidedVariants).toHaveLength(1);
    expect(equationRateIndependentVariants).toHaveLength(1);
    expect(equationRateGuidedVariants[0]).toMatchObject({
      variantKey: EQUATION_RATE_GUIDED_ACTIVITY_ID,
      objectiveIds: [EQUATION_RATE_NODE],
    });
    expect(equationRateIndependentVariants[0]).toMatchObject({
      variantKey: EQUATION_RATE_INDEPENDENT_ACTIVITY_ID,
      objectiveIds: [EQUATION_RATE_NODE],
    });

    const equationRateGuidedItems = state.rows.practice_items.filter(
      (item) => item.practiceItemId === `${EQUATION_RATE_GUIDED_ACTIVITY_ID}:seed-1`,
    );
    const equationRateIndependentItems = state.rows.practice_items.filter(
      (item) => item.practiceItemId === `${EQUATION_RATE_INDEPENDENT_ACTIVITY_ID}:seed-2`,
    );
    expect(equationRateGuidedItems).toHaveLength(1);
    expect(equationRateIndependentItems).toHaveLength(1);
    expect(equationRateGuidedItems[0]).toMatchObject({
      practiceItemId: `${EQUATION_RATE_GUIDED_ACTIVITY_ID}:seed-1`,
      activityId: equationRateGuidedActivities[0]?._id,
      variantKey: EQUATION_RATE_GUIDED_ACTIVITY_ID,
    });
    expect(equationRateIndependentItems[0]).toMatchObject({
      practiceItemId: `${EQUATION_RATE_INDEPENDENT_ACTIVITY_ID}:seed-2`,
      activityId: equationRateIndependentActivities[0]?._id,
      variantKey: EQUATION_RATE_INDEPENDENT_ACTIVITY_ID,
    });

    const expectedProfitModel = getGenerator("quadratic-profit-model").generate({
      nodeId: PROFIT_MODEL_NODE,
      seed: 2,
      difficulty: 0.5,
    });
    const profitActivities = state.rows.activities.filter(
      (activity) => activity.stableActivityId === PROFIT_MODEL_ACTIVITY_ID,
    );
    expect(profitActivities).toHaveLength(1);
    expect(profitActivities[0]).toMatchObject({
      stableActivityId: PROFIT_MODEL_ACTIVITY_ID,
      masteryNodeId: PROFIT_MODEL_NODE,
      componentKey: "fill-in-the-blank",
      props: expectedProfitModel.data.rendererProps,
      srsEligible: true,
    });

    const profitActivity = profitActivities[0];
    const profitVariants = state.rows.practice_variants.filter(
      (variant) => variant.variantKey === PROFIT_MODEL_VARIANT_KEY,
    );
    expect(profitVariants).toHaveLength(1);
    expect(profitVariants[0]).toMatchObject({
      variantKey: PROFIT_MODEL_VARIANT_KEY,
      objectiveIds: [PROFIT_MODEL_NODE],
    });

    const profitItems = state.rows.practice_items.filter(
      (item) => item.practiceItemId === PROFIT_MODEL_ITEM_ID,
    );
    expect(profitItems).toHaveLength(1);
    expect(profitItems[0]).toMatchObject({
      practiceItemId: PROFIT_MODEL_ITEM_ID,
      activityId: profitActivity?._id,
      variantKey: PROFIT_MODEL_VARIANT_KEY,
    });
  });

  it("stores the exact generated graph Guided seed 2 in seedLesson1 order", async () => {
    const state = createUpgradeState();
    await seedLesson1Handler(state.ctx);

    const expected = buildIm3GraphGuidedSeed2Documents(
      "activities:graph-guided-seed-2" as never,
      0,
    );
    const activities = state.rows.activities.filter(
      (activity) => activity.stableActivityId === IM3_GRAPH_GUIDED_SEED_2_ACTIVITY_ID,
    );
    const variants = state.rows.practice_variants.filter(
      (variant) => variant.variantKey === IM3_GRAPH_GUIDED_SEED_2_VARIANT_KEY,
    );
    const items = state.rows.practice_items.filter(
      (item) => item.practiceItemId === IM3_GRAPH_GUIDED_SEED_2_VARIANT_KEY,
    );

    expect(activities).toHaveLength(1);
    expect(activities[0]).toMatchObject({
      stableActivityId: IM3_GRAPH_GUIDED_SEED_2_ACTIVITY_ID,
      masteryNodeId: IM3_PILOT_NODE,
      componentKey: "graphing-explorer",
      props: expected.activity.props,
      gradingConfig: expected.activity.gradingConfig,
      srsEligible: false,
    });
    expect(variants).toHaveLength(1);
    expect(variants[0]).toMatchObject({
      variantKey: IM3_GRAPH_GUIDED_SEED_2_VARIANT_KEY,
      legacyProblemFamilyId: IM3_GRAPH_GUIDED_SEED_2_VARIANT_KEY,
      componentKey: "graphing-explorer",
      objectiveIds: [IM3_PILOT_NODE],
      metadata: { stableActivityId: IM3_GRAPH_GUIDED_SEED_2_ACTIVITY_ID },
    });
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      practiceItemId: IM3_GRAPH_GUIDED_SEED_2_VARIANT_KEY,
      activityId: activities[0]?._id,
      variantKey: IM3_GRAPH_GUIDED_SEED_2_VARIANT_KEY,
      legacyProblemFamilyId: IM3_GRAPH_GUIDED_SEED_2_VARIANT_KEY,
      variantLabel: "Seed 2",
    });
    expect(
      state.insertCalls.filter(
        ([tableName, document]) =>
          tableName === "activities" &&
          document.stableActivityId === IM3_GRAPH_GUIDED_SEED_2_ACTIVITY_ID,
      ),
    ).toHaveLength(1);
    expect(
      state.insertCalls.filter(
        ([tableName, document]) =>
          tableName === "practice_variants" &&
          document.variantKey === IM3_GRAPH_GUIDED_SEED_2_VARIANT_KEY,
      ),
    ).toHaveLength(1);
    expect(
      state.insertCalls.filter(
        ([tableName, document]) =>
          tableName === "practice_items" &&
          document.practiceItemId === IM3_GRAPH_GUIDED_SEED_2_VARIANT_KEY,
      ),
    ).toHaveLength(1);
    const insertedGuidedSeed1ItemIndex = state.insertCalls.findIndex(
      ([tableName, document]) =>
        tableName === "practice_items" &&
        document.practiceItemId === `${IM3_GUIDED_VARIANT_KEY}:seed-1`,
    );
    const insertedGraphGuidedSeed2ActivityIndex = state.insertCalls.findIndex(
      ([tableName, document]) =>
        tableName === "activities" &&
        document.stableActivityId === IM3_GRAPH_GUIDED_SEED_2_ACTIVITY_ID,
    );
    expect(insertedGraphGuidedSeed2ActivityIndex).toBeGreaterThan(insertedGuidedSeed1ItemIndex);

    await seedLesson1Handler(state.ctx);
    expect(
      state.rows.activities.filter(
        (activity) => activity.stableActivityId === IM3_GRAPH_GUIDED_SEED_2_ACTIVITY_ID,
      ),
    ).toHaveLength(1);
    expect(
      state.rows.practice_variants.filter(
        (variant) => variant.variantKey === IM3_GRAPH_GUIDED_SEED_2_VARIANT_KEY,
      ),
    ).toHaveLength(1);
    expect(
      state.rows.practice_items.filter(
        (item) => item.practiceItemId === IM3_GRAPH_GUIDED_SEED_2_VARIANT_KEY,
      ),
    ).toHaveLength(1);
    expect(
      state.patchCalls.filter(
        ([, document]) => document.stableActivityId === IM3_GRAPH_GUIDED_SEED_2_ACTIVITY_ID,
      ),
    ).toHaveLength(1);
    expect(
      state.patchCalls.filter(
        ([, document]) =>
          document.variantKey === IM3_GRAPH_GUIDED_SEED_2_VARIANT_KEY && !document.practiceItemId,
      ),
    ).toHaveLength(1);
    expect(
      state.patchCalls.filter(
        ([, document]) => document.practiceItemId === IM3_GRAPH_GUIDED_SEED_2_VARIANT_KEY,
      ),
    ).toHaveLength(1);
  });

  it("stores the exact generated graph Independent seed 2 in seedLesson1 order", async () => {
    const state = createUpgradeState();
    const dateNow = vi.spyOn(Date, "now").mockReturnValueOnce(100).mockReturnValueOnce(200);

    try {
      await seedLesson1Handler(state.ctx);

      const expectedSeedZero = buildIm3PilotSeedDocuments("activities:pilot" as never, 100);
      const expectedGuidedSeedOne = buildIm3GuidedPilotSeedDocuments(
        "activities:guided" as never,
        100,
      );
      const expectedGuidedSeedTwo = buildIm3GraphGuidedSeed2Documents(
        "activities:graph-guided-seed-2" as never,
        100,
      );
      const expectedIndependentSeedTwo = buildIm3GraphIndependentSeed2Documents(
        "activities:independent-seed-2" as never,
        100,
      );
      const independentActivities = state.rows.activities.filter(
        (activity) => activity.stableActivityId === IM3_GRAPH_INDEPENDENT_SEED_2_ACTIVITY_ID,
      );
      const independentVariants = state.rows.practice_variants.filter(
        (variant) => variant.variantKey === IM3_GRAPH_INDEPENDENT_SEED_2_VARIANT_KEY,
      );
      const independentItems = state.rows.practice_items.filter(
        (item) => item.practiceItemId === IM3_GRAPH_INDEPENDENT_SEED_2_VARIANT_KEY,
      );

      expect(independentActivities).toHaveLength(1);
      expect(independentVariants).toHaveLength(1);
      expect(independentItems).toHaveLength(1);
      const independentActivity = independentActivities[0];
      expect(independentActivity).toMatchObject(expectedIndependentSeedTwo.activity);
      expect(independentActivity?._id).toBe(independentItems[0]?.activityId);
      expect(independentVariants[0]).toMatchObject(expectedIndependentSeedTwo.variant);
      expect(independentItems[0]).toMatchObject({
        ...expectedIndependentSeedTwo.item,
        activityId: independentActivity?._id,
      });

      const seedZeroActivities = state.rows.activities.filter(
        (activity) => activity.stableActivityId === IM3_MASTERY_ADVANTAGE_ACTIVITY_ID,
      );
      const guidedSeedOneActivities = state.rows.activities.filter(
        (activity) => activity.stableActivityId === IM3_GUIDED_PRACTICE_ACTIVITY_ID,
      );
      const guidedSeedTwoActivities = state.rows.activities.filter(
        (activity) => activity.stableActivityId === IM3_GRAPH_GUIDED_SEED_2_ACTIVITY_ID,
      );
      expect(seedZeroActivities).toHaveLength(1);
      expect(guidedSeedOneActivities).toHaveLength(1);
      expect(guidedSeedTwoActivities).toHaveLength(1);
      expect(seedZeroActivities[0]).toMatchObject(expectedSeedZero.activity);
      expect(guidedSeedOneActivities[0]).toMatchObject(expectedGuidedSeedOne.activity);
      expect(guidedSeedTwoActivities[0]).toMatchObject(expectedGuidedSeedTwo.activity);

      const seedZeroItemPatchIndex = state.writeCalls.findIndex(
        ([, , document]) => document.practiceItemId === `${IM3_PILOT_VARIANT_KEY}:pilot`,
      );
      const independentActivityInsertIndex = state.writeCalls.findIndex(
        ([, , document]) => document.stableActivityId === IM3_GRAPH_INDEPENDENT_SEED_2_ACTIVITY_ID,
      );
      const independentVariantInsertIndex = state.writeCalls.findIndex(
        ([, , document]) => document.variantKey === IM3_GRAPH_INDEPENDENT_SEED_2_VARIANT_KEY,
      );
      const independentItemInsertIndex = state.writeCalls.findIndex(
        ([, , document]) => document.practiceItemId === IM3_GRAPH_INDEPENDENT_SEED_2_VARIANT_KEY,
      );
      const guidedSeedOneActivityInsertIndex = state.writeCalls.findIndex(
        ([, , document]) => document.stableActivityId === IM3_GUIDED_PRACTICE_ACTIVITY_ID,
      );
      const guidedSeedTwoActivityInsertIndex = state.writeCalls.findIndex(
        ([, , document]) => document.stableActivityId === IM3_GRAPH_GUIDED_SEED_2_ACTIVITY_ID,
      );
      expect(independentActivityInsertIndex).toBe(seedZeroItemPatchIndex + 1);
      expect(independentVariantInsertIndex).toBe(independentActivityInsertIndex + 1);
      expect(independentItemInsertIndex).toBe(independentVariantInsertIndex + 1);
      expect(guidedSeedOneActivityInsertIndex).toBe(independentItemInsertIndex + 1);
      expect(guidedSeedTwoActivityInsertIndex).toBe(guidedSeedOneActivityInsertIndex + 3);

      await seedLesson1Handler(state.ctx);
      expect(
        state.rows.activities.filter(
          (activity) => activity.stableActivityId === IM3_GRAPH_INDEPENDENT_SEED_2_ACTIVITY_ID,
        ),
      ).toHaveLength(1);
      expect(
        state.rows.practice_variants.filter(
          (variant) => variant.variantKey === IM3_GRAPH_INDEPENDENT_SEED_2_VARIANT_KEY,
        ),
      ).toHaveLength(1);
      expect(
        state.rows.practice_items.filter(
          (item) => item.practiceItemId === IM3_GRAPH_INDEPENDENT_SEED_2_VARIANT_KEY,
        ),
      ).toHaveLength(1);
      expect(
        state.rows.activities.filter(
          (activity) => activity.stableActivityId === IM3_MASTERY_ADVANTAGE_ACTIVITY_ID,
        ),
      ).toHaveLength(1);
      expect(
        state.rows.activities.filter(
          (activity) => activity.stableActivityId === IM3_GUIDED_PRACTICE_ACTIVITY_ID,
        ),
      ).toHaveLength(1);
      expect(
        state.rows.activities.filter(
          (activity) => activity.stableActivityId === IM3_GRAPH_GUIDED_SEED_2_ACTIVITY_ID,
        ),
      ).toHaveLength(1);
      expect(
        state.rows.practice_items.filter(
          (item) => item.practiceItemId === `${IM3_PILOT_VARIANT_KEY}:pilot`,
        ),
      ).toHaveLength(1);
      expect(
        state.rows.practice_items.filter(
          (item) => item.practiceItemId === `${IM3_GUIDED_VARIANT_KEY}:seed-1`,
        ),
      ).toHaveLength(1);
      expect(
        state.rows.practice_items.filter(
          (item) => item.practiceItemId === IM3_GRAPH_GUIDED_SEED_2_VARIANT_KEY,
        ),
      ).toHaveLength(1);
      expect(
        state.rows.activities.find(
          (activity) => activity.stableActivityId === IM3_GRAPH_INDEPENDENT_SEED_2_ACTIVITY_ID,
        )?._id,
      ).toBe(independentActivity?._id);
      expect(
        state.rows.practice_variants.find(
          (variant) => variant.variantKey === IM3_GRAPH_INDEPENDENT_SEED_2_VARIANT_KEY,
        )?._id,
      ).toBe(independentVariants[0]?._id);
      expect(
        state.rows.practice_items.find(
          (item) => item.practiceItemId === IM3_GRAPH_INDEPENDENT_SEED_2_VARIANT_KEY,
        )?._id,
      ).toBe(independentItems[0]?._id);
    } finally {
      dateNow.mockRestore();
    }
  });

  it("converges the equation-rate Worked activity through two seed runs", async () => {
    const state = createUpgradeState();
    const dateNow = vi.spyOn(Date, "now").mockReturnValueOnce(100).mockReturnValueOnce(200);

    try {
      await seedLesson1Handler(state.ctx);
      const expected = buildIm3EquationRateWorkedSeedDocument(100);
      const firstRows = state.rows.activities.filter(
        (activity) => activity.stableActivityId === IM3_EQUATION_RATE_WORKED_ACTIVITY_ID,
      );
      expect(firstRows).toHaveLength(1);
      expect(firstRows[0]).toMatchObject({
        ...expected,
        _id: expect.any(String),
      });
      expect(firstRows[0]?.createdAt).toBe(100);
      expect(firstRows[0]?.updatedAt).toBe(100);

      const firstActivityId = firstRows[0]?._id;
      await seedLesson1Handler(state.ctx);
      const secondRows = state.rows.activities.filter(
        (activity) => activity.stableActivityId === IM3_EQUATION_RATE_WORKED_ACTIVITY_ID,
      );
      expect(secondRows).toHaveLength(1);
      expect(secondRows[0]?._id).toBe(firstActivityId);
      expect(secondRows[0]).toMatchObject({
        ...expected,
        _id: firstActivityId,
        updatedAt: 200,
      });
      expect(secondRows[0]?.createdAt).toBe(100);
      expect(
        state.insertCalls.filter(
          ([tableName, document]) =>
            tableName === "activities" &&
            document.stableActivityId === IM3_EQUATION_RATE_WORKED_ACTIVITY_ID,
        ),
      ).toHaveLength(1);
      expect(
        state.patchCalls.filter(
          ([id, document]) =>
            id === firstActivityId &&
            document.stableActivityId === IM3_EQUATION_RATE_WORKED_ACTIVITY_ID &&
            document.updatedAt === 200,
        ),
      ).toHaveLength(1);
    } finally {
      dateNow.mockRestore();
    }
  });

  it("attaches Phase 8 to the canonical equation-rate Worked activity", async () => {
    const state = createUpgradeState();
    const dateNow = vi.spyOn(Date, "now").mockReturnValueOnce(100).mockReturnValueOnce(200);

    try {
      await seedLesson1Handler(state.ctx);
      const firstWorkedActivity = state.rows.activities.find(
        (activity) => activity.stableActivityId === IM3_EQUATION_RATE_WORKED_ACTIVITY_ID,
      );
      expect(firstWorkedActivity).toBeDefined();
      await seedLesson1Handler(state.ctx);

      const phaseEightSections = state.rows.phase_sections.filter(
        (section) => section.phaseVersionId === PHASE_EIGHT_ID,
      );
      expect(phaseEightSections).toHaveLength(2);
      const textSections = phaseEightSections.filter(
        (section) => section.sequenceOrder === 1 && section.sectionType === "text",
      );
      const activitySections = phaseEightSections.filter(
        (section) => section.sequenceOrder === 2 && section.sectionType === "activity",
      );
      expect(textSections).toHaveLength(1);
      expect(activitySections).toHaveLength(1);

      const workedActivities = state.rows.activities.filter(
        (activity) => activity.stableActivityId === IM3_EQUATION_RATE_WORKED_ACTIVITY_ID,
      );
      expect(workedActivities).toHaveLength(1);
      const workedActivity = workedActivities[0];
      expect(workedActivity?._id).toBe(firstWorkedActivity?._id);
      expect(workedActivity).toMatchObject({
        masteryNodeId: EQUATION_RATE_NODE,
        componentKey: "rate-of-change-calculator",
        props: {
          sourceType: "function",
          data: { expression: "f(x) = -x^2 + 2x - 1" },
          interval: { start: -4, end: 4 },
        },
        learningEvidenceMode: "worked_example",
        srsEligible: false,
      });
      expect(textSections[0]?.content).toEqual({
        markdown:
          "## Example 4: Find Average Rate of Change from an Equation\n\nDetermine the average rate of change of $f(x) = -x^2 + 2x - 1$ over the interval $[-4, 4]$.",
      });
      expect(activitySections[0]?.content).toEqual({
        componentKey: "rate-of-change-calculator",
        activityId: workedActivity?._id,
      });
      expect(
        state.rows.phase_sections.filter(
          (section) =>
            section.phaseVersionId === PHASE_EIGHT_ID &&
            (section.content as { activityId?: string }).activityId === workedActivity?._id,
        ),
      ).toHaveLength(1);
    } finally {
      dateNow.mockRestore();
    }
  });

  it("invokes the maximum-reading upserts in order and converges both seed runs", async () => {
    const state = createUpgradeState();
    const dateNow = vi.spyOn(Date, "now").mockReturnValueOnce(100).mockReturnValueOnce(200);

    try {
      await seedLesson1Handler(state.ctx);

      const workedActivity = state.rows.activities.find(
        (activity) => activity.stableActivityId === IM3_MAXIMUM_READING_WORKED_ACTIVITY_ID,
      );
      const guidedActivity = state.rows.activities.find(
        (activity) => activity.stableActivityId === IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID,
      );
      const independentActivity = state.rows.activities.find(
        (activity) => activity.stableActivityId === IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID,
      );
      const guidedVariant = state.rows.practice_variants.find(
        (variant) => variant.variantKey === IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID,
      );
      const independentVariant = state.rows.practice_variants.find(
        (variant) => variant.variantKey === IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID,
      );
      const guidedItem = state.rows.practice_items.find(
        (item) => item.practiceItemId === `${IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID}:seed-0`,
      );
      const independentItem = state.rows.practice_items.find(
        (item) => item.practiceItemId === `${IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID}:seed-34`,
      );

      expect(workedActivity).toBeDefined();
      expect(guidedActivity).toBeDefined();
      expect(independentActivity).toBeDefined();
      expect(guidedVariant).toBeDefined();
      expect(independentVariant).toBeDefined();
      expect(guidedItem).toBeDefined();
      expect(independentItem).toBeDefined();
      expect(
        state.rows.activities.filter(
          (activity) =>
            activity.stableActivityId === IM3_MAXIMUM_READING_WORKED_ACTIVITY_ID ||
            activity.stableActivityId === IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID ||
            activity.stableActivityId === IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID,
        ),
      ).toHaveLength(3);
      expect(
        state.rows.practice_variants.filter(
          (variant) =>
            variant.variantKey === IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID ||
            variant.variantKey === IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID,
        ),
      ).toHaveLength(2);
      expect(
        state.rows.practice_items.filter(
          (item) =>
            item.practiceItemId === `${IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID}:seed-0` ||
            item.practiceItemId === `${IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID}:seed-34`,
        ),
      ).toHaveLength(2);

      expect(workedActivity).toEqual({
        _id: workedActivity?._id,
        ...buildIm3MaximumReadingWorkedSeedDocument(100),
      });
      expect(guidedActivity).toEqual({
        _id: guidedActivity?._id,
        ...buildIm3MaximumReadingGuidedSeedDocuments(guidedActivity?._id as never, 100).activity,
      });
      expect(independentActivity).toEqual({
        _id: independentActivity?._id,
        ...buildIm3MaximumReadingIndependentSeedDocuments(independentActivity?._id as never, 100)
          .activity,
      });
      expect(guidedVariant).toEqual({
        _id: guidedVariant?._id,
        ...buildIm3MaximumReadingGuidedSeedDocuments("activities:pending" as never, 100).variant,
      });
      expect(independentVariant).toEqual({
        _id: independentVariant?._id,
        ...buildIm3MaximumReadingIndependentSeedDocuments("activities:pending" as never, 100)
          .variant,
      });
      expect(guidedItem).toEqual({
        _id: guidedItem?._id,
        ...buildIm3MaximumReadingGuidedSeedDocuments(guidedActivity?._id as never, 100).item,
      });
      expect(independentItem).toEqual({
        _id: independentItem?._id,
        ...buildIm3MaximumReadingIndependentSeedDocuments(independentActivity?._id as never, 100)
          .item,
      });
      expect(workedActivity).toMatchObject({
        masteryNodeId: IM3_MAXIMUM_READING_NODE,
        srsEligible: false,
      });
      expect(guidedActivity).toMatchObject({
        masteryNodeId: IM3_MAXIMUM_READING_NODE,
        srsEligible: true,
      });
      expect(independentActivity).toMatchObject({
        masteryNodeId: IM3_MAXIMUM_READING_NODE,
        srsEligible: true,
      });
      expect(guidedItem?.activityId).toBe(guidedActivity?._id);
      expect(independentItem?.activityId).toBe(independentActivity?._id);
      const phaseFiveSectionsAfterFirstSeed = state.rows.phase_sections.filter(
        (section) => section.phaseVersionId === PHASE_FIVE_ID,
      );
      const phaseFiveTextSectionsAfterFirstSeed = phaseFiveSectionsAfterFirstSeed.filter(
        (section) => section.sequenceOrder === 1 && section.sectionType === "text",
      );
      const phaseFiveActivitySectionsAfterFirstSeed = phaseFiveSectionsAfterFirstSeed.filter(
        (section) => section.sequenceOrder === 2 && section.sectionType === "activity",
      );
      expect(phaseFiveSectionsAfterFirstSeed).toHaveLength(2);
      expect(phaseFiveTextSectionsAfterFirstSeed).toHaveLength(1);
      expect(phaseFiveTextSectionsAfterFirstSeed[0]?.content).toEqual({
        markdown:
          "## Example 2: Compare Quadratic Functions\n\nThe graph of f(x) is shown. Function g has a y-intercept of -1 and a vertex at (1, 2). Which function has the greater maximum value?",
      });
      expect(phaseFiveActivitySectionsAfterFirstSeed).toHaveLength(1);
      expect(phaseFiveActivitySectionsAfterFirstSeed[0]?.content).toEqual({
        componentKey: "graphing-explorer",
        activityId: workedActivity?._id,
      });
      const phaseFiveSectionIds = phaseFiveSectionsAfterFirstSeed.map((section) => section._id);

      const maximumReadingWrites = state.writeCalls
        .map((entry, index) => ({ entry, index }))
        .filter(
          ({ entry: [, , document] }) =>
            document.stableActivityId === IM3_MAXIMUM_READING_WORKED_ACTIVITY_ID ||
            document.stableActivityId === IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID ||
            document.variantKey === IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID ||
            document.practiceItemId === `${IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID}:seed-0` ||
            document.stableActivityId === IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID ||
            document.variantKey === IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID ||
            document.practiceItemId === `${IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID}:seed-34`,
        );
      expect(maximumReadingWrites).toHaveLength(7);
      expect(
        maximumReadingWrites.map(({ entry: [kind, target, document] }) => [
          kind,
          target,
          document.stableActivityId ?? document.practiceItemId ?? document.variantKey,
        ]),
      ).toEqual([
        ["insert", "activities", IM3_MAXIMUM_READING_WORKED_ACTIVITY_ID],
        ["insert", "activities", IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID],
        ["insert", "practice_variants", IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID],
        ["insert", "practice_items", `${IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID}:seed-0`],
        ["insert", "activities", IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID],
        ["insert", "practice_variants", IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID],
        ["insert", "practice_items", `${IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID}:seed-34`],
      ]);
      const firstIds = [
        workedActivity?._id,
        guidedActivity?._id,
        independentActivity?._id,
        guidedVariant?._id,
        independentVariant?._id,
        guidedItem?._id,
        independentItem?._id,
      ];

      await seedLesson1Handler(state.ctx);

      const phaseFiveSectionsAfterSecondSeed = state.rows.phase_sections.filter(
        (section) => section.phaseVersionId === PHASE_FIVE_ID,
      );
      expect(phaseFiveSectionsAfterSecondSeed).toHaveLength(2);
      expect(phaseFiveSectionsAfterSecondSeed.map((section) => section._id)).toEqual(
        phaseFiveSectionIds,
      );
      expect(
        phaseFiveSectionsAfterSecondSeed.filter(
          (section) => section.sequenceOrder === 1 && section.sectionType === "text",
        ),
      ).toEqual([
        {
          _id: "phase_sections:existing-example-2-text",
          phaseVersionId: PHASE_FIVE_ID,
          sequenceOrder: 1,
          sectionType: "text",
          content: {
            markdown:
              "## Example 2: Compare Quadratic Functions\n\nThe graph of f(x) is shown. Function g has a y-intercept of -1 and a vertex at (1, 2). Which function has the greater maximum value?",
          },
        },
      ]);
      expect(
        phaseFiveSectionsAfterSecondSeed.filter(
          (section) => section.sequenceOrder === 2 && section.sectionType === "activity",
        ),
      ).toEqual([
        {
          _id: "phase_sections:existing-example-2-activity",
          phaseVersionId: PHASE_FIVE_ID,
          sequenceOrder: 2,
          sectionType: "activity",
          content: {
            componentKey: "graphing-explorer",
            activityId: workedActivity?._id,
          },
        },
      ]);
      expect(
        state.insertCalls.filter(
          ([tableName, document]) =>
            tableName === "phase_sections" && document.phaseVersionId === PHASE_FIVE_ID,
        ),
      ).toHaveLength(0);

      const finalWorkedActivity = state.rows.activities.find(
        (activity) => activity.stableActivityId === IM3_MAXIMUM_READING_WORKED_ACTIVITY_ID,
      );
      const finalGuidedActivity = state.rows.activities.find(
        (activity) => activity.stableActivityId === IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID,
      );
      const finalIndependentActivity = state.rows.activities.find(
        (activity) => activity.stableActivityId === IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID,
      );
      const finalGuidedVariant = state.rows.practice_variants.find(
        (variant) => variant.variantKey === IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID,
      );
      const finalIndependentVariant = state.rows.practice_variants.find(
        (variant) => variant.variantKey === IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID,
      );
      const finalGuidedItem = state.rows.practice_items.find(
        (item) => item.practiceItemId === `${IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID}:seed-0`,
      );
      const finalIndependentItem = state.rows.practice_items.find(
        (item) => item.practiceItemId === `${IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID}:seed-34`,
      );

      expect([
        finalWorkedActivity?._id,
        finalGuidedActivity?._id,
        finalIndependentActivity?._id,
        finalGuidedVariant?._id,
        finalIndependentVariant?._id,
        finalGuidedItem?._id,
        finalIndependentItem?._id,
      ]).toEqual(firstIds);
      expect(finalWorkedActivity).toEqual({
        _id: finalWorkedActivity?._id,
        ...buildIm3MaximumReadingWorkedSeedDocument(200),
        createdAt: 100,
      });
      expect(finalGuidedActivity).toEqual({
        _id: finalGuidedActivity?._id,
        ...buildIm3MaximumReadingGuidedSeedDocuments(finalGuidedActivity?._id as never, 200)
          .activity,
        createdAt: 100,
      });
      expect(finalIndependentActivity).toEqual({
        _id: finalIndependentActivity?._id,
        ...buildIm3MaximumReadingIndependentSeedDocuments(
          finalIndependentActivity?._id as never,
          200,
        ).activity,
        createdAt: 100,
      });
      expect(finalGuidedVariant).toEqual({
        _id: finalGuidedVariant?._id,
        ...buildIm3MaximumReadingGuidedSeedDocuments("activities:pending" as never, 200).variant,
      });
      expect(finalIndependentVariant).toEqual({
        _id: finalIndependentVariant?._id,
        ...buildIm3MaximumReadingIndependentSeedDocuments("activities:pending" as never, 200)
          .variant,
      });
      expect(finalGuidedItem).toEqual({
        _id: finalGuidedItem?._id,
        ...buildIm3MaximumReadingGuidedSeedDocuments(finalGuidedActivity?._id as never, 200).item,
      });
      expect(finalIndependentItem).toEqual({
        _id: finalIndependentItem?._id,
        ...buildIm3MaximumReadingIndependentSeedDocuments(
          finalIndependentActivity?._id as never,
          200,
        ).item,
      });
      expect(finalWorkedActivity).toMatchObject({ createdAt: 100, updatedAt: 200 });
      expect(finalGuidedActivity).toMatchObject({ createdAt: 100, updatedAt: 200 });
      expect(finalIndependentActivity).toMatchObject({ createdAt: 100, updatedAt: 200 });
      expect(finalGuidedVariant).toMatchObject({ sourceTimestamp: 200 });
      expect(finalIndependentVariant).toMatchObject({ sourceTimestamp: 200 });
      expect(finalGuidedItem).toMatchObject({ sourceTimestamp: 200 });
      expect(finalIndependentItem).toMatchObject({ sourceTimestamp: 200 });
      expect(
        state.insertCalls.filter(
          ([tableName, document]) =>
            (tableName === "activities" &&
              (document.stableActivityId === IM3_MAXIMUM_READING_WORKED_ACTIVITY_ID ||
                document.stableActivityId === IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID ||
                document.stableActivityId === IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID)) ||
            (tableName === "practice_variants" &&
              (document.variantKey === IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID ||
                document.variantKey === IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID)) ||
            (tableName === "practice_items" &&
              (document.practiceItemId === `${IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID}:seed-0` ||
                document.practiceItemId ===
                  `${IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID}:seed-34`)),
        ),
      ).toHaveLength(7);
      expect(
        state.patchCalls.filter(
          ([, document]) =>
            document.stableActivityId === IM3_MAXIMUM_READING_WORKED_ACTIVITY_ID ||
            document.stableActivityId === IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID ||
            document.variantKey === IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID ||
            document.practiceItemId === `${IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID}:seed-0` ||
            document.stableActivityId === IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID ||
            document.variantKey === IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID ||
            document.practiceItemId === `${IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID}:seed-34`,
        ),
      ).toHaveLength(7);
    } finally {
      dateNow.mockRestore();
    }
  });

  it("invokes the exact symmetry upserts in seedLesson1 order and converges both seed runs", async () => {
    const state = createUpgradeState();
    const dateNow = vi.spyOn(Date, "now").mockReturnValueOnce(100).mockReturnValueOnce(200);

    try {
      await seedLesson1Handler(state.ctx);

      const workedActivities = state.rows.activities.filter(
        (activity) => activity.stableActivityId === IM3_SYMMETRY_WORKED_ACTIVITY_ID,
      );
      const guidedActivities = state.rows.activities.filter(
        (activity) => activity.stableActivityId === IM3_SYMMETRY_GUIDED_ACTIVITY_ID,
      );
      const independentActivities = state.rows.activities.filter(
        (activity) => activity.stableActivityId === IM3_SYMMETRY_INDEPENDENT_ACTIVITY_ID,
      );
      const guidedVariants = state.rows.practice_variants.filter(
        (variant) => variant.variantKey === IM3_SYMMETRY_GUIDED_ACTIVITY_ID,
      );
      const independentVariants = state.rows.practice_variants.filter(
        (variant) => variant.variantKey === IM3_SYMMETRY_INDEPENDENT_ACTIVITY_ID,
      );
      const guidedItems = state.rows.practice_items.filter(
        (item) => item.practiceItemId === `${IM3_SYMMETRY_GUIDED_ACTIVITY_ID}:seed-0`,
      );
      const independentItems = state.rows.practice_items.filter(
        (item) => item.practiceItemId === `${IM3_SYMMETRY_INDEPENDENT_ACTIVITY_ID}:seed-1`,
      );

      expect(workedActivities).toHaveLength(1);
      expect(guidedActivities).toHaveLength(1);
      expect(independentActivities).toHaveLength(1);
      expect(guidedVariants).toHaveLength(1);
      expect(independentVariants).toHaveLength(1);
      expect(guidedItems).toHaveLength(1);
      expect(independentItems).toHaveLength(1);

      const workedActivity = workedActivities[0];
      const guidedActivity = guidedActivities[0];
      const independentActivity = independentActivities[0];
      const guidedVariant = guidedVariants[0];
      const independentVariant = independentVariants[0];
      const guidedItem = guidedItems[0];
      const independentItem = independentItems[0];
      expect(workedActivity?.masteryNodeId).toBe(IM3_SYMMETRY_NODE);
      expect(guidedActivity?.masteryNodeId).toBe(IM3_SYMMETRY_NODE);
      expect(independentActivity?.masteryNodeId).toBe(IM3_SYMMETRY_NODE);
      expect(workedActivity).toEqual({
        _id: workedActivity?._id,
        ...buildIm3SymmetryWorkedSeedDocument(100),
      });
      expect(guidedActivity).toEqual({
        _id: guidedActivity?._id,
        ...buildIm3SymmetryGuidedSeedDocuments(guidedActivity?._id as never, 100).activity,
      });
      expect(independentActivity).toEqual({
        _id: independentActivity?._id,
        ...buildIm3SymmetryIndependentSeedDocuments(independentActivity?._id as never, 100)
          .activity,
      });
      expect(guidedVariant).toEqual({
        _id: guidedVariant?._id,
        ...buildIm3SymmetryGuidedSeedDocuments("activities:pending" as never, 100).variant,
      });
      expect(independentVariant).toEqual({
        _id: independentVariant?._id,
        ...buildIm3SymmetryIndependentSeedDocuments("activities:pending" as never, 100).variant,
      });
      expect(guidedItem).toEqual({
        _id: guidedItem?._id,
        ...buildIm3SymmetryGuidedSeedDocuments(guidedActivity?._id as never, 100).item,
      });
      expect(independentItem).toEqual({
        _id: independentItem?._id,
        ...buildIm3SymmetryIndependentSeedDocuments(independentActivity?._id as never, 100).item,
      });
      expect(guidedItem?.activityId).toBe(guidedActivity?._id);
      expect(independentItem?.activityId).toBe(independentActivity?._id);
      expect(
        state.writeCalls
          .filter(
            ([, , document]) =>
              document.stableActivityId === IM3_SYMMETRY_WORKED_ACTIVITY_ID ||
              document.stableActivityId === IM3_SYMMETRY_GUIDED_ACTIVITY_ID ||
              document.variantKey === IM3_SYMMETRY_GUIDED_ACTIVITY_ID ||
              document.practiceItemId === `${IM3_SYMMETRY_GUIDED_ACTIVITY_ID}:seed-0` ||
              document.stableActivityId === IM3_SYMMETRY_INDEPENDENT_ACTIVITY_ID ||
              document.variantKey === IM3_SYMMETRY_INDEPENDENT_ACTIVITY_ID ||
              document.practiceItemId === `${IM3_SYMMETRY_INDEPENDENT_ACTIVITY_ID}:seed-1`,
          )
          .map(([kind, target, document]) => [
            kind,
            target,
            document.stableActivityId ?? document.practiceItemId ?? document.variantKey,
          ]),
      ).toEqual([
        ["insert", "activities", IM3_SYMMETRY_WORKED_ACTIVITY_ID],
        ["insert", "activities", IM3_SYMMETRY_GUIDED_ACTIVITY_ID],
        ["insert", "practice_variants", IM3_SYMMETRY_GUIDED_ACTIVITY_ID],
        ["insert", "practice_items", `${IM3_SYMMETRY_GUIDED_ACTIVITY_ID}:seed-0`],
        ["insert", "activities", IM3_SYMMETRY_INDEPENDENT_ACTIVITY_ID],
        ["insert", "practice_variants", IM3_SYMMETRY_INDEPENDENT_ACTIVITY_ID],
        ["insert", "practice_items", `${IM3_SYMMETRY_INDEPENDENT_ACTIVITY_ID}:seed-1`],
      ]);

      const firstIds = [
        workedActivity?._id,
        guidedActivity?._id,
        guidedVariant?._id,
        guidedItem?._id,
        independentActivity?._id,
        independentVariant?._id,
        independentItem?._id,
      ];

      await seedLesson1Handler(state.ctx);

      const finalWorkedActivity = state.rows.activities.find(
        (activity) => activity.stableActivityId === IM3_SYMMETRY_WORKED_ACTIVITY_ID,
      );
      const finalGuidedActivity = state.rows.activities.find(
        (activity) => activity.stableActivityId === IM3_SYMMETRY_GUIDED_ACTIVITY_ID,
      );
      const finalIndependentActivity = state.rows.activities.find(
        (activity) => activity.stableActivityId === IM3_SYMMETRY_INDEPENDENT_ACTIVITY_ID,
      );
      const finalGuidedVariant = state.rows.practice_variants.find(
        (variant) => variant.variantKey === IM3_SYMMETRY_GUIDED_ACTIVITY_ID,
      );
      const finalIndependentVariant = state.rows.practice_variants.find(
        (variant) => variant.variantKey === IM3_SYMMETRY_INDEPENDENT_ACTIVITY_ID,
      );
      const finalGuidedItem = state.rows.practice_items.find(
        (item) => item.practiceItemId === `${IM3_SYMMETRY_GUIDED_ACTIVITY_ID}:seed-0`,
      );
      const finalIndependentItem = state.rows.practice_items.find(
        (item) => item.practiceItemId === `${IM3_SYMMETRY_INDEPENDENT_ACTIVITY_ID}:seed-1`,
      );

      expect([
        finalWorkedActivity?._id,
        finalGuidedActivity?._id,
        finalGuidedVariant?._id,
        finalGuidedItem?._id,
        finalIndependentActivity?._id,
        finalIndependentVariant?._id,
        finalIndependentItem?._id,
      ]).toEqual(firstIds);
      expect(finalWorkedActivity).toEqual({
        _id: finalWorkedActivity?._id,
        ...buildIm3SymmetryWorkedSeedDocument(200),
        createdAt: 100,
      });
      expect(finalGuidedActivity).toEqual({
        _id: finalGuidedActivity?._id,
        ...buildIm3SymmetryGuidedSeedDocuments(finalGuidedActivity?._id as never, 200).activity,
        createdAt: 100,
      });
      expect(finalIndependentActivity).toEqual({
        _id: finalIndependentActivity?._id,
        ...buildIm3SymmetryIndependentSeedDocuments(finalIndependentActivity?._id as never, 200)
          .activity,
        createdAt: 100,
      });
      expect(finalGuidedVariant).toEqual({
        _id: finalGuidedVariant?._id,
        ...buildIm3SymmetryGuidedSeedDocuments("activities:pending" as never, 200).variant,
      });
      expect(finalIndependentVariant).toEqual({
        _id: finalIndependentVariant?._id,
        ...buildIm3SymmetryIndependentSeedDocuments("activities:pending" as never, 200).variant,
      });
      expect(finalGuidedItem).toEqual({
        _id: finalGuidedItem?._id,
        ...buildIm3SymmetryGuidedSeedDocuments(finalGuidedActivity?._id as never, 200).item,
      });
      expect(finalIndependentItem).toEqual({
        _id: finalIndependentItem?._id,
        ...buildIm3SymmetryIndependentSeedDocuments(finalIndependentActivity?._id as never, 200)
          .item,
      });
      expect(finalWorkedActivity).toMatchObject({ createdAt: 100, updatedAt: 200 });
      expect(finalGuidedActivity).toMatchObject({ createdAt: 100, updatedAt: 200 });
      expect(finalIndependentActivity).toMatchObject({ createdAt: 100, updatedAt: 200 });
      expect(finalGuidedVariant).toMatchObject({ sourceTimestamp: 200 });
      expect(finalIndependentVariant).toMatchObject({ sourceTimestamp: 200 });
      expect(finalGuidedItem).toMatchObject({ sourceTimestamp: 200 });
      expect(finalIndependentItem).toMatchObject({ sourceTimestamp: 200 });

      const symmetryWrites = state.writeCalls.filter(
        ([, , document]) =>
          document.stableActivityId === IM3_SYMMETRY_WORKED_ACTIVITY_ID ||
          document.stableActivityId === IM3_SYMMETRY_GUIDED_ACTIVITY_ID ||
          document.variantKey === IM3_SYMMETRY_GUIDED_ACTIVITY_ID ||
          document.practiceItemId === `${IM3_SYMMETRY_GUIDED_ACTIVITY_ID}:seed-0` ||
          document.stableActivityId === IM3_SYMMETRY_INDEPENDENT_ACTIVITY_ID ||
          document.variantKey === IM3_SYMMETRY_INDEPENDENT_ACTIVITY_ID ||
          document.practiceItemId === `${IM3_SYMMETRY_INDEPENDENT_ACTIVITY_ID}:seed-1`,
      );
      expect(symmetryWrites).toHaveLength(14);
      expect(
        symmetryWrites
          .slice(7)
          .map(([kind, target, document]) => [
            kind,
            target,
            document.stableActivityId ?? document.practiceItemId ?? document.variantKey,
          ]),
      ).toEqual([
        ["patch", firstIds[0], IM3_SYMMETRY_WORKED_ACTIVITY_ID],
        ["patch", firstIds[1], IM3_SYMMETRY_GUIDED_ACTIVITY_ID],
        ["patch", firstIds[2], IM3_SYMMETRY_GUIDED_ACTIVITY_ID],
        ["patch", firstIds[3], `${IM3_SYMMETRY_GUIDED_ACTIVITY_ID}:seed-0`],
        ["patch", firstIds[4], IM3_SYMMETRY_INDEPENDENT_ACTIVITY_ID],
        ["patch", firstIds[5], IM3_SYMMETRY_INDEPENDENT_ACTIVITY_ID],
        ["patch", firstIds[6], `${IM3_SYMMETRY_INDEPENDENT_ACTIVITY_ID}:seed-1`],
      ]);
    } finally {
      dateNow.mockRestore();
    }
  });

  it("invokes the exact compare-maximum upserts in seedLesson1 order and converges both seed runs", async () => {
    const state = createUpgradeState();
    const dateNow = vi.spyOn(Date, "now").mockReturnValueOnce(100).mockReturnValueOnce(200);

    try {
      await seedLesson1Handler(state.ctx);

      const workedActivities = state.rows.activities.filter(
        (activity) => activity.stableActivityId === IM3_COMPARE_MAXIMUM_WORKED_ACTIVITY_ID,
      );
      const guidedActivities = state.rows.activities.filter(
        (activity) => activity.stableActivityId === IM3_COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID,
      );
      const independentActivities = state.rows.activities.filter(
        (activity) => activity.stableActivityId === IM3_COMPARE_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
      );
      const guidedVariants = state.rows.practice_variants.filter(
        (variant) => variant.variantKey === IM3_COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID,
      );
      const independentVariants = state.rows.practice_variants.filter(
        (variant) => variant.variantKey === IM3_COMPARE_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
      );
      const guidedItems = state.rows.practice_items.filter(
        (item) => item.practiceItemId === `${IM3_COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID}:seed-0`,
      );
      const independentItems = state.rows.practice_items.filter(
        (item) => item.practiceItemId === `${IM3_COMPARE_MAXIMUM_INDEPENDENT_ACTIVITY_ID}:seed-1`,
      );

      expect(workedActivities).toHaveLength(1);
      expect(guidedActivities).toHaveLength(1);
      expect(independentActivities).toHaveLength(1);
      expect(guidedVariants).toHaveLength(1);
      expect(independentVariants).toHaveLength(1);
      expect(guidedItems).toHaveLength(1);
      expect(independentItems).toHaveLength(1);

      const workedActivity = workedActivities[0];
      const guidedActivity = guidedActivities[0];
      const independentActivity = independentActivities[0];
      const guidedVariant = guidedVariants[0];
      const independentVariant = independentVariants[0];
      const guidedItem = guidedItems[0];
      const independentItem = independentItems[0];
      expect(workedActivity?.masteryNodeId).toBe(IM3_COMPARE_MAXIMUM_NODE);
      expect(guidedActivity?.masteryNodeId).toBe(IM3_COMPARE_MAXIMUM_NODE);
      expect(independentActivity?.masteryNodeId).toBe(IM3_COMPARE_MAXIMUM_NODE);
      expect(workedActivity).toEqual({
        _id: workedActivity?._id,
        ...buildIm3CompareMaximumWorkedSeedDocument(100),
      });
      expect(guidedActivity).toEqual({
        _id: guidedActivity?._id,
        ...buildIm3CompareMaximumGuidedSeedDocuments(guidedActivity?._id as never, 100).activity,
      });
      expect(independentActivity).toEqual({
        _id: independentActivity?._id,
        ...buildIm3CompareMaximumIndependentSeedDocuments(independentActivity?._id as never, 100)
          .activity,
      });
      expect(guidedVariant).toEqual({
        _id: guidedVariant?._id,
        ...buildIm3CompareMaximumGuidedSeedDocuments("activities:pending" as never, 100).variant,
      });
      expect(independentVariant).toEqual({
        _id: independentVariant?._id,
        ...buildIm3CompareMaximumIndependentSeedDocuments("activities:pending" as never, 100)
          .variant,
      });
      expect(guidedItem).toEqual({
        _id: guidedItem?._id,
        ...buildIm3CompareMaximumGuidedSeedDocuments(guidedActivity?._id as never, 100).item,
      });
      expect(independentItem).toEqual({
        _id: independentItem?._id,
        ...buildIm3CompareMaximumIndependentSeedDocuments(independentActivity?._id as never, 100)
          .item,
      });
      expect(guidedItem?.activityId).toBe(guidedActivity?._id);
      expect(independentItem?.activityId).toBe(independentActivity?._id);
      const firstCompareWrites = state.writeCalls.filter(
        ([, , document]) =>
          document.stableActivityId === IM3_COMPARE_MAXIMUM_WORKED_ACTIVITY_ID ||
          document.stableActivityId === IM3_COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID ||
          document.variantKey === IM3_COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID ||
          document.practiceItemId === `${IM3_COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID}:seed-0` ||
          document.stableActivityId === IM3_COMPARE_MAXIMUM_INDEPENDENT_ACTIVITY_ID ||
          document.variantKey === IM3_COMPARE_MAXIMUM_INDEPENDENT_ACTIVITY_ID ||
          document.practiceItemId === `${IM3_COMPARE_MAXIMUM_INDEPENDENT_ACTIVITY_ID}:seed-1`,
      );
      expect(
        firstCompareWrites.map(([kind, target, document]) => [
          kind,
          target,
          document.stableActivityId ?? document.practiceItemId ?? document.variantKey,
        ]),
      ).toEqual([
        ["insert", "activities", IM3_COMPARE_MAXIMUM_WORKED_ACTIVITY_ID],
        ["insert", "activities", IM3_COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID],
        ["insert", "practice_variants", IM3_COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID],
        ["insert", "practice_items", `${IM3_COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID}:seed-0`],
        ["insert", "activities", IM3_COMPARE_MAXIMUM_INDEPENDENT_ACTIVITY_ID],
        ["insert", "practice_variants", IM3_COMPARE_MAXIMUM_INDEPENDENT_ACTIVITY_ID],
        ["insert", "practice_items", `${IM3_COMPARE_MAXIMUM_INDEPENDENT_ACTIVITY_ID}:seed-1`],
      ]);

      const firstIds = [
        workedActivity?._id,
        guidedActivity?._id,
        guidedVariant?._id,
        guidedItem?._id,
        independentActivity?._id,
        independentVariant?._id,
        independentItem?._id,
      ];

      await seedLesson1Handler(state.ctx);

      const finalWorkedActivity = state.rows.activities.find(
        (activity) => activity.stableActivityId === IM3_COMPARE_MAXIMUM_WORKED_ACTIVITY_ID,
      );
      const finalGuidedActivity = state.rows.activities.find(
        (activity) => activity.stableActivityId === IM3_COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID,
      );
      const finalIndependentActivity = state.rows.activities.find(
        (activity) => activity.stableActivityId === IM3_COMPARE_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
      );
      const finalGuidedVariant = state.rows.practice_variants.find(
        (variant) => variant.variantKey === IM3_COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID,
      );
      const finalIndependentVariant = state.rows.practice_variants.find(
        (variant) => variant.variantKey === IM3_COMPARE_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
      );
      const finalGuidedItem = state.rows.practice_items.find(
        (item) => item.practiceItemId === `${IM3_COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID}:seed-0`,
      );
      const finalIndependentItem = state.rows.practice_items.find(
        (item) => item.practiceItemId === `${IM3_COMPARE_MAXIMUM_INDEPENDENT_ACTIVITY_ID}:seed-1`,
      );

      expect([
        finalWorkedActivity?._id,
        finalGuidedActivity?._id,
        finalGuidedVariant?._id,
        finalGuidedItem?._id,
        finalIndependentActivity?._id,
        finalIndependentVariant?._id,
        finalIndependentItem?._id,
      ]).toEqual(firstIds);
      expect(finalWorkedActivity).toEqual({
        _id: finalWorkedActivity?._id,
        ...buildIm3CompareMaximumWorkedSeedDocument(200),
        createdAt: 100,
      });
      expect(finalGuidedActivity).toEqual({
        _id: finalGuidedActivity?._id,
        ...buildIm3CompareMaximumGuidedSeedDocuments(finalGuidedActivity?._id as never, 200)
          .activity,
        createdAt: 100,
      });
      expect(finalIndependentActivity).toEqual({
        _id: finalIndependentActivity?._id,
        ...buildIm3CompareMaximumIndependentSeedDocuments(
          finalIndependentActivity?._id as never,
          200,
        ).activity,
        createdAt: 100,
      });
      expect(finalGuidedVariant).toEqual({
        _id: finalGuidedVariant?._id,
        ...buildIm3CompareMaximumGuidedSeedDocuments("activities:pending" as never, 200).variant,
      });
      expect(finalIndependentVariant).toEqual({
        _id: finalIndependentVariant?._id,
        ...buildIm3CompareMaximumIndependentSeedDocuments("activities:pending" as never, 200)
          .variant,
      });
      expect(finalGuidedItem).toEqual({
        _id: finalGuidedItem?._id,
        ...buildIm3CompareMaximumGuidedSeedDocuments(finalGuidedActivity?._id as never, 200).item,
      });
      expect(finalIndependentItem).toEqual({
        _id: finalIndependentItem?._id,
        ...buildIm3CompareMaximumIndependentSeedDocuments(
          finalIndependentActivity?._id as never,
          200,
        ).item,
      });
      expect(finalWorkedActivity).toMatchObject({ createdAt: 100, updatedAt: 200 });
      expect(finalGuidedActivity).toMatchObject({ createdAt: 100, updatedAt: 200 });
      expect(finalIndependentActivity).toMatchObject({ createdAt: 100, updatedAt: 200 });
      expect(finalGuidedVariant).toMatchObject({ sourceTimestamp: 200 });
      expect(finalIndependentVariant).toMatchObject({ sourceTimestamp: 200 });
      expect(finalGuidedItem).toMatchObject({ sourceTimestamp: 200 });
      expect(finalIndependentItem).toMatchObject({ sourceTimestamp: 200 });

      const compareWrites = state.writeCalls.filter(
        ([, , document]) =>
          document.stableActivityId === IM3_COMPARE_MAXIMUM_WORKED_ACTIVITY_ID ||
          document.stableActivityId === IM3_COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID ||
          document.variantKey === IM3_COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID ||
          document.practiceItemId === `${IM3_COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID}:seed-0` ||
          document.stableActivityId === IM3_COMPARE_MAXIMUM_INDEPENDENT_ACTIVITY_ID ||
          document.variantKey === IM3_COMPARE_MAXIMUM_INDEPENDENT_ACTIVITY_ID ||
          document.practiceItemId === `${IM3_COMPARE_MAXIMUM_INDEPENDENT_ACTIVITY_ID}:seed-1`,
      );
      expect(compareWrites).toHaveLength(14);
      expect(
        compareWrites
          .slice(7)
          .map(([kind, target, document]) => [
            kind,
            target,
            document.stableActivityId ?? document.practiceItemId ?? document.variantKey,
          ]),
      ).toEqual([
        ["patch", firstIds[0], IM3_COMPARE_MAXIMUM_WORKED_ACTIVITY_ID],
        ["patch", firstIds[1], IM3_COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID],
        ["patch", firstIds[2], IM3_COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID],
        ["patch", firstIds[3], `${IM3_COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID}:seed-0`],
        ["patch", firstIds[4], IM3_COMPARE_MAXIMUM_INDEPENDENT_ACTIVITY_ID],
        ["patch", firstIds[5], IM3_COMPARE_MAXIMUM_INDEPENDENT_ACTIVITY_ID],
        ["patch", firstIds[6], `${IM3_COMPARE_MAXIMUM_INDEPENDENT_ACTIVITY_ID}:seed-1`],
      ]);
    } finally {
      dateNow.mockRestore();
    }
  });
});
