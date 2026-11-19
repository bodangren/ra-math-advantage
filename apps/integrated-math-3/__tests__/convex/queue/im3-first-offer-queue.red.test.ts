import { describe, expect, it, vi } from "vitest";

import type { QueryCtx } from "@/convex/_generated/server";
import { resolveDailyPracticeQueue as resolveCanonicalDailyPracticeQueue } from "@/convex/queue/queue";
import {
  buildIm3GuidedPilotSeedDocuments,
  buildIm3GraphGuidedSeed2Documents,
  buildIm3GraphIndependentSeed2Documents,
  buildIm3PilotSeedDocuments,
  buildIm3DomainRangeGuidedSeedDocuments,
  buildIm3DomainRangeGuidedSeed2Documents,
  buildIm3DomainRangeIndependentSeedDocuments,
  buildIm3DomainRangeIndependentSeed2Documents,
  buildIm3EquationRateGuidedSeedDocuments,
  buildIm3EquationRateIndependentSeedDocuments,
  buildIm3ProfitModelGuidedSeedDocuments,
  buildIm3ProfitModelIndependentSeedDocuments,
  buildIm3ProfitMaximumGuidedSeedDocuments,
  buildIm3ProfitMaximumIndependentSeedDocuments,
  buildIm3MaximumReadingGuidedSeedDocuments,
  buildIm3MaximumReadingIndependentSeedDocuments,
  buildIm3SymmetryGuidedSeedDocuments,
  buildIm3SymmetryIndependentSeedDocuments,
  buildIm3CompareMaximumGuidedSeedDocuments,
  buildIm3CompareMaximumIndependentSeedDocuments,
} from "@/convex/seed/seed_lesson_1_1";
import {
  buildIm3OneRealSolutionGuidedSeedDocument,
  buildIm3OneRealSolutionGuidedPracticeSeedDocuments,
  buildIm3OneRealSolutionIndependentSeedDocument,
  buildIm3OneRealSolutionIndependentPracticeSeedDocuments,
  buildIm3TwoRealSolutionsGuidedSeedDocument,
  buildIm3TwoRealSolutionsGuidedPracticeSeedDocuments,
  buildIm3TwoRealSolutionsIndependentSeedDocument,
  buildIm3TwoRealSolutionsIndependentPracticeSeedDocuments,
} from "@/convex/seed/seed_lesson_1_2";
import {
  IM3_DOMAIN_RANGE_GUIDED_ACTIVITY_ID,
  IM3_DOMAIN_RANGE_GUIDED_SEED_2_ACTIVITY_ID,
  IM3_DOMAIN_RANGE_GUIDED_SEED_2_VARIANT_KEY,
  IM3_DOMAIN_RANGE_INDEPENDENT_ACTIVITY_ID,
  IM3_DOMAIN_RANGE_INDEPENDENT_SEED_2_ACTIVITY_ID,
  IM3_DOMAIN_RANGE_INDEPENDENT_SEED_2_VARIANT_KEY,
  IM3_DOMAIN_RANGE_NODE,
  IM3_EQUATION_RATE_GUIDED_ACTIVITY_ID,
  IM3_EQUATION_RATE_INDEPENDENT_ACTIVITY_ID,
  IM3_EQUATION_RATE_NODE,
  IM3_GUIDED_PRACTICE_ACTIVITY_ID,
  IM3_GUIDED_VARIANT_KEY,
  IM3_GRAPH_GUIDED_SEED_2_ACTIVITY_ID,
  IM3_GRAPH_GUIDED_SEED_2_VARIANT_KEY,
  IM3_GRAPH_INDEPENDENT_SEED_2_ACTIVITY_ID,
  IM3_GRAPH_INDEPENDENT_SEED_2_VARIANT_KEY,
  IM3_MASTERY_ADVANTAGE_ACTIVITY_ID,
  IM3_PILOT_NODE,
  IM3_PILOT_VARIANT_KEY,
  IM3_PROFIT_MODEL_GUIDED_ACTIVITY_ID,
  IM3_PROFIT_MODEL_INDEPENDENT_ACTIVITY_ID,
  IM3_PROFIT_MODEL_NODE,
  IM3_PROFIT_MAXIMUM_GUIDED_ACTIVITY_ID,
  IM3_PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
  IM3_PROFIT_MAXIMUM_NODE,
  IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID,
  IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID,
  IM3_MAXIMUM_READING_NODE,
  IM3_COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID,
  IM3_COMPARE_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
  IM3_COMPARE_MAXIMUM_NODE,
  IM3_SYMMETRY_GUIDED_ACTIVITY_ID,
  IM3_SYMMETRY_INDEPENDENT_ACTIVITY_ID,
  IM3_SYMMETRY_NODE,
  IM3_ONE_REAL_SOLUTION_GUIDED_ACTIVITY_ID,
  IM3_ONE_REAL_SOLUTION_INDEPENDENT_ACTIVITY_ID,
  IM3_ONE_REAL_SOLUTION_NODE,
  IM3_TWO_REAL_SOLUTIONS_GUIDED_ACTIVITY_ID,
  IM3_TWO_REAL_SOLUTIONS_INDEPENDENT_ACTIVITY_ID,
  IM3_TWO_REAL_SOLUTIONS_NODE,
} from "@/lib/practice/learning-evidence-pilot";

const LEARNER_ID = "im3-first-offer-learner";
const NODE_ID = IM3_PILOT_NODE;
const GUIDED_ACTIVITY_ID = "im3-first-offer-guided-activity-document";
const INDEPENDENT_ACTIVITY_ID = "im3-first-offer-independent-activity-document";
const WRONG_OBJECTIVE_ID = "math.im3.skill.1.1.other-quadratic-skill";
const AS_OF_DATE = "2026-08-19T12:00:00.000Z";
const APPROVED_GRAPH_PUBLICATION = {
  nodes: [{ id: IM3_PILOT_NODE, kind: "skill", reviewStatus: "approved" }],
  blueprints: [{ nodeId: IM3_PILOT_NODE, reviewStatus: "approved" }],
};

function resolveDailyPracticeQueue(
  ctx: Parameters<typeof resolveCanonicalDailyPracticeQueue>[0],
  args: Parameters<typeof resolveCanonicalDailyPracticeQueue>[1],
) {
  return resolveCanonicalDailyPracticeQueue(ctx, args, APPROVED_GRAPH_PUBLICATION);
}

interface QueueFixtureOptions {
  cards?: Array<Record<string, unknown>>;
  teacherExposure?: boolean;
  teacherExposureNodeId?: string;
  omitGraphGuidedSeed2Item?: boolean;
  graphGuidedSeed2ActivityPatch?: Partial<Record<string, unknown>>;
  omitDomainRangeGuidedSeed2Item?: boolean;
  domainRangeGuidedSeed2ActivityPatch?: Partial<Record<string, unknown>>;
  domainRangeIndependentSeed2ActivityPatch?: Partial<Record<string, unknown>>;
  omitDomainRangeIndependentSeed2Item?: boolean;
  omitGraphIndependentSeed2Item?: boolean;
  graphIndependentSeed2ActivityPatch?: Partial<Record<string, unknown>>;
}

interface IndexQuery {
  eq: (field: string, value: unknown) => IndexQuery;
}

function makeReviewCard(variantKey: string, cardId: string, objectiveId: string = NODE_ID) {
  return {
    _id: cardId,
    _creationTime: 1_780_000_000_000,
    studentId: LEARNER_ID,
    objectiveId,
    variantKey,
    stability: 10,
    difficulty: 0.3,
    state: "review",
    dueDate: "2026-08-20T00:00:00.000Z",
    elapsedDays: 0,
    scheduledDays: 1,
    reps: 5,
    lapses: 0,
    lastReview: "2026-08-18T00:00:00.000Z",
    createdAt: 1_780_000_000_000,
    updatedAt: 1_780_000_000_000,
  };
}

function makeCtx(options: QueueFixtureOptions = {}) {
  const publication = {
    nodeReviewStatus: "approved",
    blueprintReviewStatus: "approved",
  } as const;
  const guidedSeed = buildIm3GuidedPilotSeedDocuments(GUIDED_ACTIVITY_ID as never, 0);
  const independentSeed = buildIm3PilotSeedDocuments(INDEPENDENT_ACTIVITY_ID as never, 0);
  const equationGuidedActivityId = "im3-first-offer-equation-guided-activity-document";
  const equationIndependentActivityId = "im3-first-offer-equation-independent-activity-document";
  const domainGuidedActivityId = "im3-first-offer-domain-guided-activity-document";
  const domainIndependentActivityId = "im3-first-offer-domain-independent-activity-document";
  const profitGuidedActivityId = "im3-first-offer-profit-guided-activity-document";
  const profitIndependentActivityId = "im3-first-offer-profit-independent-activity-document";
  const maximumGuidedActivityId = "im3-first-offer-maximum-guided-activity-document";
  const maximumIndependentActivityId = "im3-first-offer-maximum-independent-activity-document";
  const maximumReadingGuidedActivityId = "im3-first-offer-maximum-reading-guided-activity-document";
  const maximumReadingIndependentActivityId =
    "im3-first-offer-maximum-reading-independent-activity-document";
  const symmetryGuidedActivityId = "im3-first-offer-symmetry-guided-activity-document";
  const symmetryIndependentActivityId = "im3-first-offer-symmetry-independent-activity-document";
  const compareMaximumGuidedActivityId = "im3-first-offer-compare-maximum-guided-activity-document";
  const compareMaximumIndependentActivityId =
    "im3-first-offer-compare-maximum-independent-activity-document";
  const oneRealSolutionGuidedActivityId =
    "im3-first-offer-one-real-solution-guided-activity-document";
  const oneRealSolutionIndependentActivityId =
    "im3-first-offer-one-real-solution-independent-activity-document";
  const twoRealSolutionsGuidedActivityId =
    "im3-first-offer-two-real-solutions-guided-activity-document";
  const twoRealSolutionsIndependentActivityId =
    "im3-first-offer-two-real-solutions-independent-activity-document";
  const graphGuidedSeed2ActivityId = "im3-first-offer-graph-guided-seed-2-activity-document";
  const graphIndependentSeed2ActivityId =
    "im3-first-offer-graph-independent-seed-2-activity-document";
  const domainGuidedSeed2ActivityId = "im3-first-offer-domain-guided-seed-2-activity-document";
  const domainIndependentSeed2ActivityId =
    "im3-first-offer-domain-independent-seed-2-activity-document";
  const equationGuidedSeed = buildIm3EquationRateGuidedSeedDocuments(
    equationGuidedActivityId as never,
    0,
  );
  const equationIndependentSeed = buildIm3EquationRateIndependentSeedDocuments(
    equationIndependentActivityId as never,
    0,
  );
  const domainGuidedSeed = buildIm3DomainRangeGuidedSeedDocuments(
    domainGuidedActivityId as never,
    0,
  );
  const domainGuidedSeed2Seed = buildIm3DomainRangeGuidedSeed2Documents(
    domainGuidedSeed2ActivityId as never,
    0,
  );
  const domainIndependentSeed = buildIm3DomainRangeIndependentSeedDocuments(
    domainIndependentActivityId as never,
    0,
  );
  const domainIndependentSeed2Seed = buildIm3DomainRangeIndependentSeed2Documents(
    domainIndependentSeed2ActivityId as never,
    0,
  );
  const profitGuidedSeed = buildIm3ProfitModelGuidedSeedDocuments(
    profitGuidedActivityId as never,
    0,
  );
  const profitIndependentSeed = buildIm3ProfitModelIndependentSeedDocuments(
    profitIndependentActivityId as never,
    0,
  );
  const maximumGuidedSeed = buildIm3ProfitMaximumGuidedSeedDocuments(
    maximumGuidedActivityId as never,
    0,
  );
  const maximumIndependentSeed = buildIm3ProfitMaximumIndependentSeedDocuments(
    maximumIndependentActivityId as never,
    0,
  );
  const maximumReadingGuidedSeed = buildIm3MaximumReadingGuidedSeedDocuments(
    maximumReadingGuidedActivityId as never,
    0,
  );
  const maximumReadingIndependentSeed = buildIm3MaximumReadingIndependentSeedDocuments(
    maximumReadingIndependentActivityId as never,
    0,
  );
  const symmetryGuidedSeed = buildIm3SymmetryGuidedSeedDocuments(
    symmetryGuidedActivityId as never,
    0,
  );
  const symmetryIndependentSeed = buildIm3SymmetryIndependentSeedDocuments(
    symmetryIndependentActivityId as never,
    0,
  );
  const compareMaximumGuidedSeed = buildIm3CompareMaximumGuidedSeedDocuments(
    compareMaximumGuidedActivityId as never,
    0,
  );
  const compareMaximumIndependentSeed = buildIm3CompareMaximumIndependentSeedDocuments(
    compareMaximumIndependentActivityId as never,
    0,
  );
  const oneRealSolutionGuidedSeed = {
    activity: buildIm3OneRealSolutionGuidedSeedDocument(45),
    item: buildIm3OneRealSolutionGuidedPracticeSeedDocuments(
      oneRealSolutionGuidedActivityId as never,
      45,
    ).item,
  };
  const oneRealSolutionIndependentSeed = {
    activity: buildIm3OneRealSolutionIndependentSeedDocument(0),
    item: buildIm3OneRealSolutionIndependentPracticeSeedDocuments(
      oneRealSolutionIndependentActivityId as never,
      0,
    ).item,
  };
  const twoRealSolutionsGuidedSeed = {
    activity: buildIm3TwoRealSolutionsGuidedSeedDocument(0),
    item: buildIm3TwoRealSolutionsGuidedPracticeSeedDocuments(
      twoRealSolutionsGuidedActivityId as never,
      0,
    ).item,
  };
  const twoRealSolutionsIndependentSeed = {
    activity: buildIm3TwoRealSolutionsIndependentSeedDocument(0),
    item: buildIm3TwoRealSolutionsIndependentPracticeSeedDocuments(
      twoRealSolutionsIndependentActivityId as never,
      0,
    ).item,
  };
  const graphGuidedSeed2Seed = buildIm3GraphGuidedSeed2Documents(
    graphGuidedSeed2ActivityId as never,
    0,
    publication,
  );
  const graphIndependentSeed2Seed = buildIm3GraphIndependentSeed2Documents(
    graphIndependentSeed2ActivityId as never,
    0,
    publication,
  );
  const guidedActivity = {
    _id: GUIDED_ACTIVITY_ID,
    ...guidedSeed.activity,
    approval: { status: "approved" as const },
    srsEligible: true,
  };
  const independentActivity = {
    _id: INDEPENDENT_ACTIVITY_ID,
    ...independentSeed.activity,
    approval: { status: "approved" as const },
    srsEligible: true,
  };
  const equationGuidedActivity = {
    _id: equationGuidedActivityId,
    ...equationGuidedSeed.activity,
    srsEligible: true,
  };
  const equationIndependentActivity = {
    _id: equationIndependentActivityId,
    ...equationIndependentSeed.activity,
    srsEligible: true,
  };
  const domainGuidedActivity = {
    _id: domainGuidedActivityId,
    ...domainGuidedSeed.activity,
    srsEligible: true,
  };
  const domainIndependentActivity = {
    _id: domainIndependentActivityId,
    ...domainIndependentSeed.activity,
    srsEligible: true,
  };
  const profitGuidedActivity = {
    _id: profitGuidedActivityId,
    ...profitGuidedSeed.activity,
    srsEligible: true,
  };
  const profitIndependentActivity = {
    _id: profitIndependentActivityId,
    ...profitIndependentSeed.activity,
    srsEligible: true,
  };
  const maximumGuidedActivity = {
    _id: maximumGuidedActivityId,
    ...maximumGuidedSeed.activity,
    srsEligible: true,
  };
  const maximumIndependentActivity = {
    _id: maximumIndependentActivityId,
    ...maximumIndependentSeed.activity,
    srsEligible: true,
  };
  const graphGuidedSeed2Activity = {
    _id: graphGuidedSeed2ActivityId,
    ...graphGuidedSeed2Seed.activity,
    ...(options.graphGuidedSeed2ActivityPatch ?? {}),
  };
  const graphIndependentSeed2Activity = {
    _id: graphIndependentSeed2ActivityId,
    ...graphIndependentSeed2Seed.activity,
    ...(options.graphIndependentSeed2ActivityPatch ?? {}),
  };
  const practiceItems = [
    {
      _id: "im3-first-offer-guided-practice-item",
      practiceItemId: `${IM3_GUIDED_VARIANT_KEY}:seed-1`,
      activityId: GUIDED_ACTIVITY_ID,
      variantKey: IM3_GUIDED_VARIANT_KEY,
      variantLabel: "Seed 1",
    },
    {
      _id: "im3-first-offer-independent-practice-item",
      practiceItemId: `${IM3_PILOT_VARIANT_KEY}:seed-0`,
      activityId: INDEPENDENT_ACTIVITY_ID,
      variantKey: IM3_PILOT_VARIANT_KEY,
      variantLabel: "Seed 0",
    },
    ...(!options.omitGraphGuidedSeed2Item
      ? [
          {
            _id: "im3-first-offer-graph-guided-seed-2-practice-item",
            ...graphGuidedSeed2Seed.item,
            activityId: graphGuidedSeed2ActivityId,
          },
        ]
      : []),
    ...(!options.omitGraphIndependentSeed2Item
      ? [
          {
            _id: "im3-first-offer-graph-independent-seed-2-practice-item",
            ...graphIndependentSeed2Seed.item,
            activityId: graphIndependentSeed2ActivityId,
          },
        ]
      : []),
    {
      _id: "im3-first-offer-equation-guided-practice-item",
      practiceItemId: `${IM3_EQUATION_RATE_GUIDED_ACTIVITY_ID}:seed-1`,
      activityId: equationGuidedActivityId,
      variantKey: IM3_EQUATION_RATE_GUIDED_ACTIVITY_ID,
      variantLabel: "Seed 1",
    },
    {
      _id: "im3-first-offer-equation-independent-practice-item",
      practiceItemId: `${IM3_EQUATION_RATE_INDEPENDENT_ACTIVITY_ID}:seed-2`,
      activityId: equationIndependentActivityId,
      variantKey: IM3_EQUATION_RATE_INDEPENDENT_ACTIVITY_ID,
      variantLabel: "Seed 2",
    },
    {
      _id: "im3-first-offer-domain-guided-practice-item",
      practiceItemId: `${IM3_DOMAIN_RANGE_GUIDED_ACTIVITY_ID}:seed-1`,
      activityId: domainGuidedActivityId,
      variantKey: IM3_DOMAIN_RANGE_GUIDED_ACTIVITY_ID,
      variantLabel: "Seed 1",
    },
    ...(!options.omitDomainRangeGuidedSeed2Item
      ? [
          {
            _id: "im3-first-offer-domain-guided-seed-2-practice-item",
            ...domainGuidedSeed2Seed.item,
            activityId: domainGuidedSeed2ActivityId,
          },
        ]
      : []),
    {
      _id: "im3-first-offer-domain-independent-practice-item",
      practiceItemId: `${IM3_DOMAIN_RANGE_INDEPENDENT_ACTIVITY_ID}:seed-0`,
      activityId: domainIndependentActivityId,
      variantKey: IM3_DOMAIN_RANGE_INDEPENDENT_ACTIVITY_ID,
      variantLabel: "Seed 0",
    },
    ...(!options.omitDomainRangeIndependentSeed2Item
      ? [
          {
            _id: "im3-first-offer-domain-independent-seed-2-practice-item",
            ...domainIndependentSeed2Seed.item,
            activityId: domainIndependentSeed2ActivityId,
          },
        ]
      : []),
    {
      _id: "im3-first-offer-profit-guided-practice-item",
      practiceItemId: `${IM3_PROFIT_MODEL_GUIDED_ACTIVITY_ID}:seed-1`,
      activityId: profitGuidedActivityId,
      variantKey: IM3_PROFIT_MODEL_GUIDED_ACTIVITY_ID,
      variantLabel: "Seed 1",
    },
    {
      _id: "im3-first-offer-profit-independent-practice-item",
      ...profitIndependentSeed.item,
    },
    {
      _id: "im3-first-offer-maximum-guided-practice-item",
      ...maximumGuidedSeed.item,
      activityId: maximumGuidedActivityId,
    },
    {
      _id: "im3-first-offer-maximum-independent-practice-item",
      ...maximumIndependentSeed.item,
      activityId: maximumIndependentActivityId,
    },
    {
      _id: "im3-first-offer-maximum-reading-guided-practice-item",
      ...maximumReadingGuidedSeed.item,
      activityId: maximumReadingGuidedActivityId,
    },
    {
      _id: "im3-first-offer-maximum-reading-independent-practice-item",
      ...maximumReadingIndependentSeed.item,
      activityId: maximumReadingIndependentActivityId,
    },
    {
      _id: "im3-first-offer-symmetry-guided-practice-item",
      ...symmetryGuidedSeed.item,
      activityId: symmetryGuidedActivityId,
    },
    {
      _id: "im3-first-offer-symmetry-independent-practice-item",
      ...symmetryIndependentSeed.item,
      activityId: symmetryIndependentActivityId,
    },
    {
      _id: "im3-first-offer-compare-maximum-guided-practice-item",
      ...compareMaximumGuidedSeed.item,
      activityId: compareMaximumGuidedActivityId,
    },
    {
      _id: "im3-first-offer-compare-maximum-independent-practice-item",
      ...compareMaximumIndependentSeed.item,
      activityId: compareMaximumIndependentActivityId,
    },
    {
      _id: "im3-first-offer-one-real-solution-guided-practice-item",
      ...oneRealSolutionGuidedSeed.item,
      activityId: oneRealSolutionGuidedActivityId,
    },
    {
      _id: "im3-first-offer-one-real-solution-independent-practice-item",
      ...oneRealSolutionIndependentSeed.item,
      activityId: oneRealSolutionIndependentActivityId,
    },
    {
      _id: "im3-first-offer-two-real-solutions-guided-practice-item",
      ...twoRealSolutionsGuidedSeed.item,
      activityId: twoRealSolutionsGuidedActivityId,
    },
    {
      _id: "im3-first-offer-two-real-solutions-independent-practice-item",
      ...twoRealSolutionsIndependentSeed.item,
      activityId: twoRealSolutionsIndependentActivityId,
    },
  ];
  const activities = new Map<string, Record<string, unknown>>([
    [GUIDED_ACTIVITY_ID, guidedActivity],
    [INDEPENDENT_ACTIVITY_ID, independentActivity],
    [equationGuidedActivityId, equationGuidedActivity],
    [equationIndependentActivityId, equationIndependentActivity],
    [domainGuidedActivityId, domainGuidedActivity],
    [
      domainGuidedSeed2ActivityId,
      {
        _id: domainGuidedSeed2ActivityId,
        ...domainGuidedSeed2Seed.activity,
        ...(options.domainRangeGuidedSeed2ActivityPatch ?? {}),
      },
    ],
    [domainIndependentActivityId, domainIndependentActivity],
    [
      domainIndependentSeed2ActivityId,
      {
        _id: domainIndependentSeed2ActivityId,
        ...domainIndependentSeed2Seed.activity,
        ...(options.domainRangeIndependentSeed2ActivityPatch ?? {}),
      },
    ],
    [profitGuidedActivityId, profitGuidedActivity],
    [profitIndependentActivityId, profitIndependentActivity],
    [maximumGuidedActivityId, maximumGuidedActivity],
    [maximumIndependentActivityId, maximumIndependentActivity],
    [
      maximumReadingGuidedActivityId,
      {
        _id: maximumReadingGuidedActivityId,
        ...maximumReadingGuidedSeed.activity,
      },
    ],
    [
      maximumReadingIndependentActivityId,
      {
        _id: maximumReadingIndependentActivityId,
        ...maximumReadingIndependentSeed.activity,
      },
    ],
    [
      symmetryGuidedActivityId,
      {
        _id: symmetryGuidedActivityId,
        ...symmetryGuidedSeed.activity,
      },
    ],
    [
      symmetryIndependentActivityId,
      {
        _id: symmetryIndependentActivityId,
        ...symmetryIndependentSeed.activity,
      },
    ],
    [
      compareMaximumGuidedActivityId,
      {
        _id: compareMaximumGuidedActivityId,
        ...compareMaximumGuidedSeed.activity,
      },
    ],
    [
      compareMaximumIndependentActivityId,
      {
        _id: compareMaximumIndependentActivityId,
        ...compareMaximumIndependentSeed.activity,
      },
    ],
    [
      oneRealSolutionGuidedActivityId,
      {
        _id: oneRealSolutionGuidedActivityId,
        ...oneRealSolutionGuidedSeed.activity,
      },
    ],
    [
      oneRealSolutionIndependentActivityId,
      {
        _id: oneRealSolutionIndependentActivityId,
        ...oneRealSolutionIndependentSeed.activity,
      },
    ],
    [
      twoRealSolutionsGuidedActivityId,
      {
        _id: twoRealSolutionsGuidedActivityId,
        ...twoRealSolutionsGuidedSeed.activity,
      },
    ],
    [
      twoRealSolutionsIndependentActivityId,
      {
        _id: twoRealSolutionsIndependentActivityId,
        ...twoRealSolutionsIndependentSeed.activity,
      },
    ],
    [graphGuidedSeed2ActivityId, graphGuidedSeed2Activity],
    [graphIndependentSeed2ActivityId, graphIndependentSeed2Activity],
  ]);
  const teacherExposure = {
    learnerId: LEARNER_ID,
    nodeId: NODE_ID,
    origin: "teacher_led",
  };

  const query = vi.fn((tableName: string) => {
    const withIndex = vi.fn((_indexName: string, builder?: (q: IndexQuery) => unknown) => {
      let requestedValue: unknown;
      let requestedNodeId: unknown;
      const queryBuilder: IndexQuery = {
        eq: (field: string, value: unknown) => {
          requestedValue = value;
          if (field === "nodeId") requestedNodeId = value;
          return queryBuilder;
        },
      };
      builder?.(queryBuilder);

      if (tableName === "practice_items") {
        const practiceItem =
          practiceItems.find((item) => item.variantKey === requestedValue) ?? null;
        return {
          first: vi.fn(async () => practiceItem),
          unique: vi.fn(async () => practiceItem),
          collect: vi.fn(async () => (practiceItem ? [practiceItem] : [])),
          take: vi.fn(async () => (practiceItem ? [practiceItem] : [])),
        };
      }
      if (tableName === "srs_cards") {
        return { take: vi.fn(async () => options.cards ?? []) };
      }
      if (tableName === "objective_policies") {
        return { take: vi.fn(async () => []) };
      }
      if (tableName === "learning_evidence") {
        const rows =
          options.teacherExposure === false ||
          (options.teacherExposureNodeId ?? NODE_ID) !== requestedNodeId
            ? []
            : [
                {
                  ...teacherExposure,
                  nodeId: options.teacherExposureNodeId ?? NODE_ID,
                },
              ];
        return {
          take: vi.fn(async () => rows),
          collect: vi.fn(async () => rows),
        };
      }
      throw new Error(`Unexpected first-offer query table: ${tableName}`);
    });

    return { withIndex };
  });

  return {
    db: {
      query,
      get: vi.fn(async (id: string) => activities.get(id) ?? null),
    },
    guidedActivity,
    independentActivity,
    guidedSeed,
    independentSeed,
    equationGuidedSeed,
    equationIndependentSeed,
    domainGuidedSeed,
    domainGuidedSeed2Seed,
    domainIndependentSeed,
    profitGuidedSeed,
    profitIndependentSeed,
    equationGuidedActivityId,
    equationIndependentActivityId,
    domainGuidedActivityId,
    domainGuidedSeed2ActivityId,
    domainIndependentActivityId,
    domainIndependentSeed2Seed,
    domainIndependentSeed2ActivityId,
    profitGuidedActivityId,
    profitIndependentActivityId,
    maximumGuidedSeed,
    maximumGuidedActivityId,
    maximumIndependentSeed,
    maximumIndependentActivityId,
    maximumReadingGuidedSeed,
    maximumReadingGuidedActivityId,
    maximumReadingIndependentSeed,
    maximumReadingIndependentActivityId,
    symmetryGuidedSeed,
    symmetryGuidedActivityId,
    symmetryIndependentSeed,
    symmetryIndependentActivityId,
    compareMaximumGuidedSeed,
    compareMaximumGuidedActivityId,
    compareMaximumIndependentSeed,
    compareMaximumIndependentActivityId,
    oneRealSolutionGuidedSeed,
    oneRealSolutionGuidedActivityId,
    oneRealSolutionIndependentSeed,
    oneRealSolutionIndependentActivityId,
    twoRealSolutionsGuidedSeed,
    twoRealSolutionsGuidedActivityId,
    twoRealSolutionsIndependentSeed,
    twoRealSolutionsIndependentActivityId,
    graphGuidedSeed2Seed,
    graphGuidedSeed2ActivityId,
    graphIndependentSeed2Seed,
    graphIndependentSeed2ActivityId,
  };
}

const cardsThroughDomainRange = [
  makeReviewCard(IM3_GUIDED_VARIANT_KEY, "im3-first-offer-guided-card"),
  makeReviewCard(IM3_PILOT_VARIANT_KEY, "im3-first-offer-independent-card"),
  makeReviewCard(IM3_GRAPH_GUIDED_SEED_2_VARIANT_KEY, "im3-first-offer-graph-guided-seed-2-card"),
  makeReviewCard(
    IM3_GRAPH_INDEPENDENT_SEED_2_VARIANT_KEY,
    "im3-first-offer-graph-independent-seed-2-card",
  ),
  makeReviewCard(
    IM3_EQUATION_RATE_GUIDED_ACTIVITY_ID,
    "im3-first-offer-equation-guided-card",
    IM3_EQUATION_RATE_NODE,
  ),
  makeReviewCard(
    IM3_EQUATION_RATE_INDEPENDENT_ACTIVITY_ID,
    "im3-first-offer-equation-independent-card",
    IM3_EQUATION_RATE_NODE,
  ),
  makeReviewCard(
    IM3_DOMAIN_RANGE_GUIDED_ACTIVITY_ID,
    "im3-first-offer-domain-guided-card",
    IM3_DOMAIN_RANGE_NODE,
  ),
  makeReviewCard(
    IM3_DOMAIN_RANGE_GUIDED_SEED_2_VARIANT_KEY,
    "im3-first-offer-domain-guided-seed-2-card",
    IM3_DOMAIN_RANGE_NODE,
  ),
  makeReviewCard(
    IM3_DOMAIN_RANGE_INDEPENDENT_ACTIVITY_ID,
    "im3-first-offer-domain-independent-card",
    IM3_DOMAIN_RANGE_NODE,
  ),
  makeReviewCard(
    IM3_DOMAIN_RANGE_INDEPENDENT_SEED_2_VARIANT_KEY,
    "im3-first-offer-domain-independent-seed-2-card",
    IM3_DOMAIN_RANGE_NODE,
  ),
];

const cardsThroughProfitModelGuided = [
  ...cardsThroughDomainRange,
  makeReviewCard(
    IM3_PROFIT_MODEL_GUIDED_ACTIVITY_ID,
    "im3-first-offer-profit-guided-card",
    IM3_PROFIT_MODEL_NODE,
  ),
];

const cardsThroughMaximumProfitIndependent = [
  ...cardsThroughProfitModelGuided,
  makeReviewCard(
    IM3_PROFIT_MODEL_INDEPENDENT_ACTIVITY_ID,
    "im3-first-offer-profit-independent-card",
    IM3_PROFIT_MODEL_NODE,
  ),
  makeReviewCard(
    IM3_PROFIT_MAXIMUM_GUIDED_ACTIVITY_ID,
    "im3-first-offer-maximum-guided-card",
    IM3_PROFIT_MAXIMUM_NODE,
  ),
  makeReviewCard(
    IM3_PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
    "im3-first-offer-maximum-independent-card",
    IM3_PROFIT_MAXIMUM_NODE,
  ),
];

const cardsThroughMaximumReadingGuided = [
  ...cardsThroughMaximumProfitIndependent,
  makeReviewCard(
    IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID,
    "im3-first-offer-maximum-reading-guided-card",
    IM3_MAXIMUM_READING_NODE,
  ),
];

const cardsThroughMaximumReadingIndependent = [
  ...cardsThroughMaximumReadingGuided,
  makeReviewCard(
    IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID,
    "im3-first-offer-maximum-reading-independent-card",
    IM3_MAXIMUM_READING_NODE,
  ),
];

const cardsThroughSymmetryGuided = [
  ...cardsThroughMaximumReadingIndependent,
  makeReviewCard(
    IM3_SYMMETRY_GUIDED_ACTIVITY_ID,
    "im3-first-offer-symmetry-guided-card",
    IM3_SYMMETRY_NODE,
  ),
];

const cardsThroughSymmetryIndependent = [
  ...cardsThroughSymmetryGuided,
  makeReviewCard(
    IM3_SYMMETRY_INDEPENDENT_ACTIVITY_ID,
    "im3-first-offer-symmetry-independent-card",
    IM3_SYMMETRY_NODE,
  ),
];

const cardsThroughCompareMaximumGuided = [
  ...cardsThroughSymmetryIndependent,
  makeReviewCard(
    IM3_COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID,
    "im3-first-offer-compare-maximum-guided-card",
    IM3_COMPARE_MAXIMUM_NODE,
  ),
];

const cardsThroughCompareMaximumIndependent = [
  ...cardsThroughCompareMaximumGuided,
  makeReviewCard(
    IM3_COMPARE_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
    "im3-first-offer-compare-maximum-independent-card",
    IM3_COMPARE_MAXIMUM_NODE,
  ),
];

const cardsThroughOneRealSolutionGuided = [
  ...cardsThroughCompareMaximumIndependent,
  makeReviewCard(
    IM3_ONE_REAL_SOLUTION_GUIDED_ACTIVITY_ID,
    "im3-first-offer-one-real-solution-guided-card",
    IM3_ONE_REAL_SOLUTION_NODE,
  ),
];

const cardsThroughOneRealSolutionIndependent = [
  ...cardsThroughOneRealSolutionGuided,
  makeReviewCard(
    IM3_ONE_REAL_SOLUTION_INDEPENDENT_ACTIVITY_ID,
    "im3-first-offer-one-real-solution-independent-card",
    IM3_ONE_REAL_SOLUTION_NODE,
  ),
];

const cardsThroughTwoRealSolutionsGuided = [
  ...cardsThroughOneRealSolutionIndependent,
  makeReviewCard(
    IM3_TWO_REAL_SOLUTIONS_GUIDED_ACTIVITY_ID,
    "im3-first-offer-two-real-solutions-guided-card",
    IM3_TWO_REAL_SOLUTIONS_NODE,
  ),
];

describe("IM3 first Mastery Advantage offer", () => {
  it("does not query a draft graph pilot even when approved database activities exist", async () => {
    const ctx = makeCtx();
    const result = await resolveCanonicalDailyPracticeQueue(ctx as unknown as QueryCtx, {
      studentId: LEARNER_ID,
      asOfDate: AS_OF_DATE,
    });

    expect(result).toEqual([]);
  });

  it("offers the exact Guided seed-1 card after teacher exposure when no SRS card exists", async () => {
    const { guidedSeed, ...ctx } = makeCtx();
    const result = await resolveDailyPracticeQueue(ctx as unknown as QueryCtx, {
      studentId: LEARNER_ID,
      asOfDate: AS_OF_DATE,
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      card: {
        variantKey: IM3_GUIDED_VARIANT_KEY,
        objectiveId: NODE_ID,
        state: "new",
      },
      componentKey: "graphing-explorer",
      props: {
        ...guidedSeed.activity.props,
        activityId: GUIDED_ACTIVITY_ID,
        stableActivityId: IM3_GUIDED_PRACTICE_ACTIVITY_ID,
        masteryNodeId: NODE_ID,
        srsEligible: true,
      },
    });
    expect(result[0]?.props).not.toHaveProperty("answerSchema");
    expect(result[0]?.props).not.toHaveProperty("vertex_x");
    expect(result[0]?.props).not.toHaveProperty("direction");
    expect(result[0]?.props).toMatchObject({
      equation: "y = x^2 - x - 2",
      variant: "plot_from_equation",
      responseVariant: "table_graph",
      domain: [-5, 5],
      range: [-10, 10],
    });
  });

  it("offers the exact graph Guided seed-2 card after a seed-1 Guided card is present", async () => {
    const guidedCard = makeReviewCard(IM3_GUIDED_VARIANT_KEY, "im3-first-offer-guided-card");
    const { graphGuidedSeed2Seed, graphGuidedSeed2ActivityId, ...ctx } = makeCtx({
      cards: [guidedCard],
    });
    const result = await resolveDailyPracticeQueue(ctx as unknown as QueryCtx, {
      studentId: LEARNER_ID,
      asOfDate: AS_OF_DATE,
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      card: {
        variantKey: IM3_GRAPH_GUIDED_SEED_2_VARIANT_KEY,
        objectiveId: NODE_ID,
        state: "new",
      },
      componentKey: "graphing-explorer",
      props: {
        ...graphGuidedSeed2Seed.activity.props,
        activityId: graphGuidedSeed2ActivityId,
        stableActivityId: IM3_GRAPH_GUIDED_SEED_2_ACTIVITY_ID,
        masteryNodeId: NODE_ID,
        srsEligible: true,
        equation: "y = -x^2 + x - 1",
      },
    });
  });

  it("does not offer graph Guided seed 2 without its practice item", async () => {
    const guidedCard = makeReviewCard(IM3_GUIDED_VARIANT_KEY, "im3-first-offer-guided-card");
    const result = await resolveDailyPracticeQueue(
      makeCtx({ cards: [guidedCard], omitGraphGuidedSeed2Item: true }) as unknown as QueryCtx,
      { studentId: LEARNER_ID, asOfDate: AS_OF_DATE },
    );

    expect(
      result.some((item) => item.card.variantKey === IM3_GRAPH_GUIDED_SEED_2_VARIANT_KEY),
    ).toBe(false);
  });

  it.each([
    [
      "lookalike stable ID",
      { stableActivityId: `${IM3_GRAPH_GUIDED_SEED_2_ACTIVITY_ID}-lookalike` },
    ],
    ["wrong graph node", { masteryNodeId: WRONG_OBJECTIVE_ID }],
    ["wrong component", { componentKey: "fill-in-the-blank" }],
    ["false eligibility", { srsEligible: false }],
  ] as const)(
    "does not offer graph Guided seed 2 for %s",
    async (_label, graphGuidedSeed2ActivityPatch) => {
      const guidedCard = makeReviewCard(IM3_GUIDED_VARIANT_KEY, "im3-first-offer-guided-card");
      const result = await resolveDailyPracticeQueue(
        makeCtx({ cards: [guidedCard], graphGuidedSeed2ActivityPatch }) as unknown as QueryCtx,
        { studentId: LEARNER_ID, asOfDate: AS_OF_DATE },
      );

      expect(
        result.some((item) => item.card.variantKey === IM3_GRAPH_GUIDED_SEED_2_VARIANT_KEY),
      ).toBe(false);
    },
  );

  it("does not let a wrong-objective seed-2 card suppress the exact graph Guided seed-2 offer", async () => {
    const guidedCard = makeReviewCard(IM3_GUIDED_VARIANT_KEY, "im3-first-offer-guided-card");
    const wrongSeed2Card = makeReviewCard(
      IM3_GRAPH_GUIDED_SEED_2_VARIANT_KEY,
      "im3-first-offer-wrong-graph-guided-seed-2-card",
      WRONG_OBJECTIVE_ID,
    );
    const { graphGuidedSeed2Seed, graphGuidedSeed2ActivityId, ...ctx } = makeCtx({
      cards: [guidedCard, wrongSeed2Card],
    });
    const result = await resolveDailyPracticeQueue(ctx as unknown as QueryCtx, {
      studentId: LEARNER_ID,
      asOfDate: AS_OF_DATE,
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      card: {
        variantKey: IM3_GRAPH_GUIDED_SEED_2_VARIANT_KEY,
        objectiveId: NODE_ID,
        state: "new",
      },
      props: {
        ...graphGuidedSeed2Seed.activity.props,
        activityId: graphGuidedSeed2ActivityId,
        stableActivityId: IM3_GRAPH_GUIDED_SEED_2_ACTIVITY_ID,
      },
    });
  });

  it("offers graph Independent after exact seed-1 and seed-2 Guided cards exist", async () => {
    const guidedCards = [
      makeReviewCard(IM3_GUIDED_VARIANT_KEY, "im3-first-offer-guided-card"),
      makeReviewCard(
        IM3_GRAPH_GUIDED_SEED_2_VARIANT_KEY,
        "im3-first-offer-graph-guided-seed-2-card",
      ),
    ];
    const { independentSeed, ...ctx } = makeCtx({ cards: guidedCards });
    const result = await resolveDailyPracticeQueue(ctx as unknown as QueryCtx, {
      studentId: LEARNER_ID,
      asOfDate: AS_OF_DATE,
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      card: {
        variantKey: IM3_PILOT_VARIANT_KEY,
        objectiveId: NODE_ID,
        state: "new",
      },
      props: {
        ...independentSeed.activity.props,
        activityId: INDEPENDENT_ACTIVITY_ID,
        stableActivityId: IM3_MASTERY_ADVANTAGE_ACTIVITY_ID,
      },
    });
  });

  it("offers the exact graph Independent seed-2 card after the base Independent card exists", async () => {
    const cards = [
      makeReviewCard(IM3_GUIDED_VARIANT_KEY, "im3-first-offer-guided-card"),
      makeReviewCard(
        IM3_GRAPH_GUIDED_SEED_2_VARIANT_KEY,
        "im3-first-offer-graph-guided-seed-2-card",
      ),
      makeReviewCard(IM3_PILOT_VARIANT_KEY, "im3-first-offer-independent-card"),
    ];
    const { graphIndependentSeed2Seed, graphIndependentSeed2ActivityId, ...ctx } = makeCtx({
      cards,
    });
    const result = await resolveDailyPracticeQueue(ctx as unknown as QueryCtx, {
      studentId: LEARNER_ID,
      asOfDate: AS_OF_DATE,
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      card: {
        variantKey: IM3_GRAPH_INDEPENDENT_SEED_2_VARIANT_KEY,
        objectiveId: NODE_ID,
        state: "new",
      },
      componentKey: "graphing-explorer",
      props: {
        ...graphIndependentSeed2Seed.activity.props,
        activityId: graphIndependentSeed2ActivityId,
        stableActivityId: IM3_GRAPH_INDEPENDENT_SEED_2_ACTIVITY_ID,
        masteryNodeId: NODE_ID,
        srsEligible: true,
        equation: "y = x^2 - x + 2",
        responseVariant: "table_graph",
        domain: [-5, 5],
        range: [-10, 10],
      },
    });
  });

  it("does not offer graph Independent seed 2 without its practice item", async () => {
    const cards = [
      makeReviewCard(IM3_GUIDED_VARIANT_KEY, "im3-first-offer-guided-card"),
      makeReviewCard(
        IM3_GRAPH_GUIDED_SEED_2_VARIANT_KEY,
        "im3-first-offer-graph-guided-seed-2-card",
      ),
      makeReviewCard(IM3_PILOT_VARIANT_KEY, "im3-first-offer-independent-card"),
    ];
    const result = await resolveDailyPracticeQueue(
      makeCtx({ cards, omitGraphIndependentSeed2Item: true }) as unknown as QueryCtx,
      { studentId: LEARNER_ID, asOfDate: AS_OF_DATE },
    );

    expect(
      result.some((item) => item.card.variantKey === IM3_GRAPH_INDEPENDENT_SEED_2_VARIANT_KEY),
    ).toBe(false);
  });

  it.each([
    [
      "lookalike stable ID",
      { stableActivityId: `${IM3_GRAPH_INDEPENDENT_SEED_2_ACTIVITY_ID}-lookalike` },
    ],
    ["wrong graph node", { masteryNodeId: WRONG_OBJECTIVE_ID }],
    ["wrong component", { componentKey: "fill-in-the-blank" }],
    ["false eligibility", { srsEligible: false }],
  ] as const)(
    "does not offer graph Independent seed 2 for %s",
    async (_label, graphIndependentSeed2ActivityPatch) => {
      const cards = [
        makeReviewCard(IM3_GUIDED_VARIANT_KEY, "im3-first-offer-guided-card"),
        makeReviewCard(
          IM3_GRAPH_GUIDED_SEED_2_VARIANT_KEY,
          "im3-first-offer-graph-guided-seed-2-card",
        ),
        makeReviewCard(IM3_PILOT_VARIANT_KEY, "im3-first-offer-independent-card"),
      ];
      const result = await resolveDailyPracticeQueue(
        makeCtx({ cards, graphIndependentSeed2ActivityPatch }) as unknown as QueryCtx,
        { studentId: LEARNER_ID, asOfDate: AS_OF_DATE },
      );

      expect(
        result.some((item) => item.card.variantKey === IM3_GRAPH_INDEPENDENT_SEED_2_VARIANT_KEY),
      ).toBe(false);
    },
  );

  it("does not let a wrong-objective Independent seed-2 card suppress the exact offer", async () => {
    const cards = [
      makeReviewCard(IM3_GUIDED_VARIANT_KEY, "im3-first-offer-guided-card"),
      makeReviewCard(
        IM3_GRAPH_GUIDED_SEED_2_VARIANT_KEY,
        "im3-first-offer-graph-guided-seed-2-card",
      ),
      makeReviewCard(IM3_PILOT_VARIANT_KEY, "im3-first-offer-independent-card"),
      makeReviewCard(
        IM3_GRAPH_INDEPENDENT_SEED_2_VARIANT_KEY,
        "im3-first-offer-wrong-graph-independent-seed-2-card",
        WRONG_OBJECTIVE_ID,
      ),
    ];
    const { graphIndependentSeed2Seed, graphIndependentSeed2ActivityId, ...ctx } = makeCtx({
      cards,
    });
    const result = await resolveDailyPracticeQueue(ctx as unknown as QueryCtx, {
      studentId: LEARNER_ID,
      asOfDate: AS_OF_DATE,
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      card: {
        variantKey: IM3_GRAPH_INDEPENDENT_SEED_2_VARIANT_KEY,
        objectiveId: NODE_ID,
      },
      props: {
        ...graphIndependentSeed2Seed.activity.props,
        activityId: graphIndependentSeed2ActivityId,
        stableActivityId: IM3_GRAPH_INDEPENDENT_SEED_2_ACTIVITY_ID,
      },
    });
  });

  it("does not offer graph Independent seed 2 twice and then offers equation Guided", async () => {
    const cards = [
      makeReviewCard(IM3_GUIDED_VARIANT_KEY, "im3-first-offer-guided-card"),
      makeReviewCard(
        IM3_GRAPH_GUIDED_SEED_2_VARIANT_KEY,
        "im3-first-offer-graph-guided-seed-2-card",
      ),
      makeReviewCard(IM3_PILOT_VARIANT_KEY, "im3-first-offer-independent-card"),
      makeReviewCard(
        IM3_GRAPH_INDEPENDENT_SEED_2_VARIANT_KEY,
        "im3-first-offer-graph-independent-seed-2-card",
      ),
    ];
    const { equationGuidedSeed, equationGuidedActivityId, ...ctx } = makeCtx({
      cards,
      teacherExposureNodeId: IM3_EQUATION_RATE_NODE,
    });
    const result = await resolveDailyPracticeQueue(ctx as unknown as QueryCtx, {
      studentId: LEARNER_ID,
      asOfDate: AS_OF_DATE,
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      card: {
        variantKey: IM3_EQUATION_RATE_GUIDED_ACTIVITY_ID,
        objectiveId: IM3_EQUATION_RATE_NODE,
        state: "new",
      },
      props: {
        ...equationGuidedSeed.activity.props,
        activityId: equationGuidedActivityId,
        stableActivityId: IM3_EQUATION_RATE_GUIDED_ACTIVITY_ID,
      },
    });
    expect(
      result.some((item) => item.card.variantKey === IM3_GRAPH_INDEPENDENT_SEED_2_VARIANT_KEY),
    ).toBe(false);
  });

  it("does not advance from a wrong-objective Guided-variant card", async () => {
    const wrongGuidedCard = makeReviewCard(
      IM3_GUIDED_VARIANT_KEY,
      "im3-first-offer-wrong-guided-card",
      WRONG_OBJECTIVE_ID,
    );
    const { guidedSeed, ...ctx } = makeCtx({ cards: [wrongGuidedCard] });
    const result = await resolveDailyPracticeQueue(ctx as unknown as QueryCtx, {
      studentId: LEARNER_ID,
      asOfDate: AS_OF_DATE,
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      card: { variantKey: IM3_GUIDED_VARIANT_KEY, objectiveId: NODE_ID },
      props: {
        ...guidedSeed.activity.props,
        stableActivityId: IM3_GUIDED_PRACTICE_ACTIVITY_ID,
      },
    });
  });

  it("does not suppress the Guided first offer for a wrong-objective Independent-variant card", async () => {
    const wrongIndependentCard = makeReviewCard(
      IM3_PILOT_VARIANT_KEY,
      "im3-first-offer-wrong-independent-card",
      WRONG_OBJECTIVE_ID,
    );
    const { guidedSeed, ...ctx } = makeCtx({ cards: [wrongIndependentCard] });
    const result = await resolveDailyPracticeQueue(ctx as unknown as QueryCtx, {
      studentId: LEARNER_ID,
      asOfDate: AS_OF_DATE,
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      card: { variantKey: IM3_GUIDED_VARIANT_KEY, objectiveId: NODE_ID },
      props: {
        ...guidedSeed.activity.props,
        stableActivityId: IM3_GUIDED_PRACTICE_ACTIVITY_ID,
      },
    });
  });

  it("offers neither pilot card before teacher exposure", async () => {
    const result = await resolveDailyPracticeQueue(
      makeCtx({ teacherExposure: false }) as unknown as QueryCtx,
      { studentId: LEARNER_ID, asOfDate: AS_OF_DATE },
    );

    expect(result).toEqual([]);
  });

  it("offers graph Guided seed 2 when the seed-1 Guided and Independent cards exist", async () => {
    const { graphGuidedSeed2Seed, graphGuidedSeed2ActivityId, ...ctx } = makeCtx({
      cards: [
        makeReviewCard(IM3_GUIDED_VARIANT_KEY, "im3-first-offer-guided-card"),
        makeReviewCard(IM3_PILOT_VARIANT_KEY, "im3-first-offer-independent-card"),
      ],
    });
    const result = await resolveDailyPracticeQueue(ctx as unknown as QueryCtx, {
      studentId: LEARNER_ID,
      asOfDate: AS_OF_DATE,
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      card: {
        variantKey: IM3_GRAPH_GUIDED_SEED_2_VARIANT_KEY,
        objectiveId: NODE_ID,
        state: "new",
      },
      props: {
        ...graphGuidedSeed2Seed.activity.props,
        activityId: graphGuidedSeed2ActivityId,
        stableActivityId: IM3_GRAPH_GUIDED_SEED_2_ACTIVITY_ID,
      },
    });
  });

  it("offers the exact equation Guided seed-1 card after equation Worked exposure", async () => {
    const cards = [
      makeReviewCard(IM3_GUIDED_VARIANT_KEY, "im3-first-offer-guided-card"),
      makeReviewCard(IM3_PILOT_VARIANT_KEY, "im3-first-offer-independent-card"),
      makeReviewCard(
        IM3_GRAPH_GUIDED_SEED_2_VARIANT_KEY,
        "im3-first-offer-graph-guided-seed-2-card",
      ),
      makeReviewCard(
        IM3_GRAPH_INDEPENDENT_SEED_2_VARIANT_KEY,
        "im3-first-offer-graph-independent-seed-2-card",
      ),
    ];
    const { equationGuidedSeed, equationGuidedActivityId, ...ctx } = makeCtx({
      cards,
      teacherExposureNodeId: IM3_EQUATION_RATE_NODE,
    });
    const result = await resolveDailyPracticeQueue(ctx as unknown as QueryCtx, {
      studentId: LEARNER_ID,
      asOfDate: AS_OF_DATE,
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      card: {
        variantKey: IM3_EQUATION_RATE_GUIDED_ACTIVITY_ID,
        objectiveId: IM3_EQUATION_RATE_NODE,
        state: "new",
      },
      componentKey: "rate-of-change-calculator",
      props: {
        ...equationGuidedSeed.activity.props,
        activityId: equationGuidedActivityId,
        stableActivityId: IM3_EQUATION_RATE_GUIDED_ACTIVITY_ID,
        masteryNodeId: IM3_EQUATION_RATE_NODE,
        srsEligible: true,
      },
    });
  });

  it("offers the exact equation Independent seed-2 card after the exact equation Guided card exists", async () => {
    const cards = [
      makeReviewCard(IM3_GUIDED_VARIANT_KEY, "im3-first-offer-guided-card"),
      makeReviewCard(IM3_PILOT_VARIANT_KEY, "im3-first-offer-independent-card"),
      makeReviewCard(
        IM3_GRAPH_GUIDED_SEED_2_VARIANT_KEY,
        "im3-first-offer-graph-guided-seed-2-card",
      ),
      makeReviewCard(
        IM3_GRAPH_INDEPENDENT_SEED_2_VARIANT_KEY,
        "im3-first-offer-graph-independent-seed-2-card",
      ),
      makeReviewCard(
        IM3_EQUATION_RATE_GUIDED_ACTIVITY_ID,
        "im3-first-offer-equation-guided-card",
        IM3_EQUATION_RATE_NODE,
      ),
    ];
    const { equationIndependentSeed, equationIndependentActivityId, ...ctx } = makeCtx({
      cards,
      teacherExposureNodeId: IM3_EQUATION_RATE_NODE,
    });
    const result = await resolveDailyPracticeQueue(ctx as unknown as QueryCtx, {
      studentId: LEARNER_ID,
      asOfDate: AS_OF_DATE,
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      card: {
        variantKey: IM3_EQUATION_RATE_INDEPENDENT_ACTIVITY_ID,
        objectiveId: IM3_EQUATION_RATE_NODE,
        state: "new",
      },
      componentKey: "rate-of-change-calculator",
      props: {
        ...equationIndependentSeed.activity.props,
        activityId: equationIndependentActivityId,
        stableActivityId: IM3_EQUATION_RATE_INDEPENDENT_ACTIVITY_ID,
        masteryNodeId: IM3_EQUATION_RATE_NODE,
        srsEligible: true,
      },
    });
  });

  it("does not offer equation Guided without equation-node teacher exposure", async () => {
    const cards = [
      makeReviewCard(IM3_GUIDED_VARIANT_KEY, "im3-first-offer-guided-card"),
      makeReviewCard(IM3_PILOT_VARIANT_KEY, "im3-first-offer-independent-card"),
    ];
    const result = await resolveDailyPracticeQueue(
      makeCtx({
        cards,
        teacherExposure: false,
        teacherExposureNodeId: IM3_EQUATION_RATE_NODE,
      }) as unknown as QueryCtx,
      { studentId: LEARNER_ID, asOfDate: AS_OF_DATE },
    );

    expect(result).toEqual([]);
  });

  it("does not advance a wrong-objective equation Guided card to Independent", async () => {
    const cards = [
      makeReviewCard(IM3_GUIDED_VARIANT_KEY, "im3-first-offer-guided-card"),
      makeReviewCard(IM3_PILOT_VARIANT_KEY, "im3-first-offer-independent-card"),
      makeReviewCard(
        IM3_GRAPH_GUIDED_SEED_2_VARIANT_KEY,
        "im3-first-offer-graph-guided-seed-2-card",
      ),
      makeReviewCard(
        IM3_GRAPH_INDEPENDENT_SEED_2_VARIANT_KEY,
        "im3-first-offer-graph-independent-seed-2-card",
      ),
      makeReviewCard(
        IM3_EQUATION_RATE_GUIDED_ACTIVITY_ID,
        "im3-first-offer-wrong-equation-guided-card",
        WRONG_OBJECTIVE_ID,
      ),
    ];
    const { equationGuidedSeed, equationGuidedActivityId, ...ctx } = makeCtx({
      cards,
      teacherExposureNodeId: IM3_EQUATION_RATE_NODE,
    });
    const result = await resolveDailyPracticeQueue(ctx as unknown as QueryCtx, {
      studentId: LEARNER_ID,
      asOfDate: AS_OF_DATE,
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      card: {
        variantKey: IM3_EQUATION_RATE_GUIDED_ACTIVITY_ID,
        objectiveId: IM3_EQUATION_RATE_NODE,
      },
      componentKey: "rate-of-change-calculator",
      props: {
        ...equationGuidedSeed.activity.props,
        activityId: equationGuidedActivityId,
        stableActivityId: IM3_EQUATION_RATE_GUIDED_ACTIVITY_ID,
        masteryNodeId: IM3_EQUATION_RATE_NODE,
        srsEligible: true,
      },
    });
  });

  it("offers no equation card when both exact equation cards already exist", async () => {
    const cards = [
      makeReviewCard(IM3_GUIDED_VARIANT_KEY, "im3-first-offer-guided-card"),
      makeReviewCard(IM3_PILOT_VARIANT_KEY, "im3-first-offer-independent-card"),
      makeReviewCard(
        IM3_GRAPH_GUIDED_SEED_2_VARIANT_KEY,
        "im3-first-offer-graph-guided-seed-2-card",
      ),
      makeReviewCard(
        IM3_EQUATION_RATE_GUIDED_ACTIVITY_ID,
        "im3-first-offer-equation-guided-card",
        IM3_EQUATION_RATE_NODE,
      ),
      makeReviewCard(
        IM3_EQUATION_RATE_INDEPENDENT_ACTIVITY_ID,
        "im3-first-offer-equation-independent-card",
        IM3_EQUATION_RATE_NODE,
      ),
    ];
    const result = await resolveDailyPracticeQueue(
      makeCtx({
        cards,
        teacherExposureNodeId: IM3_EQUATION_RATE_NODE,
      }) as unknown as QueryCtx,
      { studentId: LEARNER_ID, asOfDate: AS_OF_DATE },
    );

    expect(result).toEqual([]);
  });

  it("offers the exact domain-range Guided seed-1 card after the graph and equation cards", async () => {
    const cards = [
      makeReviewCard(IM3_GUIDED_VARIANT_KEY, "im3-first-offer-guided-card"),
      makeReviewCard(IM3_PILOT_VARIANT_KEY, "im3-first-offer-independent-card"),
      makeReviewCard(
        IM3_GRAPH_GUIDED_SEED_2_VARIANT_KEY,
        "im3-first-offer-graph-guided-seed-2-card",
      ),
      makeReviewCard(
        IM3_GRAPH_INDEPENDENT_SEED_2_VARIANT_KEY,
        "im3-first-offer-graph-independent-seed-2-card",
      ),
      makeReviewCard(
        IM3_EQUATION_RATE_GUIDED_ACTIVITY_ID,
        "im3-first-offer-equation-guided-card",
        IM3_EQUATION_RATE_NODE,
      ),
      makeReviewCard(
        IM3_EQUATION_RATE_INDEPENDENT_ACTIVITY_ID,
        "im3-first-offer-equation-independent-card",
        IM3_EQUATION_RATE_NODE,
      ),
    ];
    const { domainGuidedSeed, domainGuidedActivityId, ...ctx } = makeCtx({
      cards,
      teacherExposureNodeId: IM3_DOMAIN_RANGE_NODE,
    });
    const result = await resolveDailyPracticeQueue(ctx as unknown as QueryCtx, {
      studentId: LEARNER_ID,
      asOfDate: AS_OF_DATE,
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      card: {
        variantKey: IM3_DOMAIN_RANGE_GUIDED_ACTIVITY_ID,
        objectiveId: IM3_DOMAIN_RANGE_NODE,
        state: "new",
      },
      componentKey: "graphing-explorer",
      props: {
        ...domainGuidedSeed.activity.props,
        activityId: domainGuidedActivityId,
        stableActivityId: IM3_DOMAIN_RANGE_GUIDED_ACTIVITY_ID,
        masteryNodeId: IM3_DOMAIN_RANGE_NODE,
        srsEligible: true,
      },
    });
  });

  it("offers the exact domain-range Guided seed-2 card after the exact Guided card exists", async () => {
    const cards = [
      makeReviewCard(IM3_GUIDED_VARIANT_KEY, "im3-first-offer-guided-card"),
      makeReviewCard(IM3_PILOT_VARIANT_KEY, "im3-first-offer-independent-card"),
      makeReviewCard(
        IM3_GRAPH_GUIDED_SEED_2_VARIANT_KEY,
        "im3-first-offer-graph-guided-seed-2-card",
      ),
      makeReviewCard(
        IM3_GRAPH_INDEPENDENT_SEED_2_VARIANT_KEY,
        "im3-first-offer-graph-independent-seed-2-card",
      ),
      makeReviewCard(
        IM3_EQUATION_RATE_GUIDED_ACTIVITY_ID,
        "im3-first-offer-equation-guided-card",
        IM3_EQUATION_RATE_NODE,
      ),
      makeReviewCard(
        IM3_EQUATION_RATE_INDEPENDENT_ACTIVITY_ID,
        "im3-first-offer-equation-independent-card",
        IM3_EQUATION_RATE_NODE,
      ),
      makeReviewCard(
        IM3_DOMAIN_RANGE_GUIDED_ACTIVITY_ID,
        "im3-first-offer-domain-guided-card",
        IM3_DOMAIN_RANGE_NODE,
      ),
    ];
    const { domainGuidedSeed2Seed, domainGuidedSeed2ActivityId, ...ctx } = makeCtx({
      cards,
      teacherExposureNodeId: IM3_DOMAIN_RANGE_NODE,
    });
    const result = await resolveDailyPracticeQueue(ctx as unknown as QueryCtx, {
      studentId: LEARNER_ID,
      asOfDate: AS_OF_DATE,
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      card: {
        variantKey: IM3_DOMAIN_RANGE_GUIDED_SEED_2_VARIANT_KEY,
        objectiveId: IM3_DOMAIN_RANGE_NODE,
        state: "new",
      },
      componentKey: "graphing-explorer",
      props: {
        ...domainGuidedSeed2Seed.activity.props,
        activityId: domainGuidedSeed2ActivityId,
        stableActivityId: IM3_DOMAIN_RANGE_GUIDED_SEED_2_ACTIVITY_ID,
        masteryNodeId: IM3_DOMAIN_RANGE_NODE,
        srsEligible: true,
        equation: "y = -x^2 + x - 1",
        responseVariant: "domain_range",
        domain: [-5, 5],
        range: [-10, 10],
      },
    });
  });

  it("does not offer domain-range Guided seed 2 without domain-node teacher exposure", async () => {
    const cards = [
      makeReviewCard(IM3_GUIDED_VARIANT_KEY, "im3-first-offer-guided-card"),
      makeReviewCard(IM3_PILOT_VARIANT_KEY, "im3-first-offer-independent-card"),
      makeReviewCard(
        IM3_GRAPH_GUIDED_SEED_2_VARIANT_KEY,
        "im3-first-offer-graph-guided-seed-2-card",
      ),
      makeReviewCard(
        IM3_GRAPH_INDEPENDENT_SEED_2_VARIANT_KEY,
        "im3-first-offer-graph-independent-seed-2-card",
      ),
      makeReviewCard(
        IM3_EQUATION_RATE_GUIDED_ACTIVITY_ID,
        "im3-first-offer-equation-guided-card",
        IM3_EQUATION_RATE_NODE,
      ),
      makeReviewCard(
        IM3_EQUATION_RATE_INDEPENDENT_ACTIVITY_ID,
        "im3-first-offer-equation-independent-card",
        IM3_EQUATION_RATE_NODE,
      ),
      makeReviewCard(
        IM3_DOMAIN_RANGE_GUIDED_ACTIVITY_ID,
        "im3-first-offer-domain-guided-card",
        IM3_DOMAIN_RANGE_NODE,
      ),
    ];
    const result = await resolveDailyPracticeQueue(
      makeCtx({
        cards,
        teacherExposure: false,
        teacherExposureNodeId: IM3_DOMAIN_RANGE_NODE,
      }) as unknown as QueryCtx,
      { studentId: LEARNER_ID, asOfDate: AS_OF_DATE },
    );

    expect(result).toEqual([]);
    expect(
      result.some((item) => item.card.variantKey === IM3_DOMAIN_RANGE_GUIDED_SEED_2_VARIANT_KEY),
    ).toBe(false);
  });

  it("does not offer domain-range Guided seed 2 without its practice item", async () => {
    const cards = [
      makeReviewCard(IM3_GUIDED_VARIANT_KEY, "im3-first-offer-guided-card"),
      makeReviewCard(IM3_PILOT_VARIANT_KEY, "im3-first-offer-independent-card"),
      makeReviewCard(
        IM3_GRAPH_GUIDED_SEED_2_VARIANT_KEY,
        "im3-first-offer-graph-guided-seed-2-card",
      ),
      makeReviewCard(
        IM3_GRAPH_INDEPENDENT_SEED_2_VARIANT_KEY,
        "im3-first-offer-graph-independent-seed-2-card",
      ),
      makeReviewCard(
        IM3_EQUATION_RATE_GUIDED_ACTIVITY_ID,
        "im3-first-offer-equation-guided-card",
        IM3_EQUATION_RATE_NODE,
      ),
      makeReviewCard(
        IM3_EQUATION_RATE_INDEPENDENT_ACTIVITY_ID,
        "im3-first-offer-equation-independent-card",
        IM3_EQUATION_RATE_NODE,
      ),
      makeReviewCard(
        IM3_DOMAIN_RANGE_GUIDED_ACTIVITY_ID,
        "im3-first-offer-domain-guided-card",
        IM3_DOMAIN_RANGE_NODE,
      ),
    ];
    const result = await resolveDailyPracticeQueue(
      makeCtx({
        cards,
        omitDomainRangeGuidedSeed2Item: true,
        teacherExposureNodeId: IM3_DOMAIN_RANGE_NODE,
      }) as unknown as QueryCtx,
      { studentId: LEARNER_ID, asOfDate: AS_OF_DATE },
    );

    expect(result).toEqual([]);
    expect(
      result.some((item) => item.card.variantKey === IM3_DOMAIN_RANGE_GUIDED_SEED_2_VARIANT_KEY),
    ).toBe(false);
  });

  it.each([
    [
      "lookalike stable ID",
      { stableActivityId: `${IM3_DOMAIN_RANGE_GUIDED_SEED_2_ACTIVITY_ID}-lookalike` },
    ],
    ["wrong mastery node", { masteryNodeId: WRONG_OBJECTIVE_ID }],
    ["wrong component", { componentKey: "fill-in-the-blank" }],
    ["false eligibility", { srsEligible: false }],
  ] as const)(
    "does not offer domain-range Guided seed 2 for %s",
    async (_label, domainRangeGuidedSeed2ActivityPatch) => {
      const cards = [
        makeReviewCard(IM3_GUIDED_VARIANT_KEY, "im3-first-offer-guided-card"),
        makeReviewCard(IM3_PILOT_VARIANT_KEY, "im3-first-offer-independent-card"),
        makeReviewCard(
          IM3_GRAPH_GUIDED_SEED_2_VARIANT_KEY,
          "im3-first-offer-graph-guided-seed-2-card",
        ),
        makeReviewCard(
          IM3_GRAPH_INDEPENDENT_SEED_2_VARIANT_KEY,
          "im3-first-offer-graph-independent-seed-2-card",
        ),
        makeReviewCard(
          IM3_EQUATION_RATE_GUIDED_ACTIVITY_ID,
          "im3-first-offer-equation-guided-card",
          IM3_EQUATION_RATE_NODE,
        ),
        makeReviewCard(
          IM3_EQUATION_RATE_INDEPENDENT_ACTIVITY_ID,
          "im3-first-offer-equation-independent-card",
          IM3_EQUATION_RATE_NODE,
        ),
        makeReviewCard(
          IM3_DOMAIN_RANGE_GUIDED_ACTIVITY_ID,
          "im3-first-offer-domain-guided-card",
          IM3_DOMAIN_RANGE_NODE,
        ),
      ];
      const result = await resolveDailyPracticeQueue(
        makeCtx({
          cards,
          domainRangeGuidedSeed2ActivityPatch,
          teacherExposureNodeId: IM3_DOMAIN_RANGE_NODE,
        }) as unknown as QueryCtx,
        { studentId: LEARNER_ID, asOfDate: AS_OF_DATE },
      );

      expect(result).toEqual([]);
      expect(
        result.some((item) => item.card.variantKey === IM3_DOMAIN_RANGE_GUIDED_SEED_2_VARIANT_KEY),
      ).toBe(false);
    },
  );

  it("does not let a wrong-objective domain-range Guided seed-2 card suppress the exact offer", async () => {
    const cards = [
      makeReviewCard(IM3_GUIDED_VARIANT_KEY, "im3-first-offer-guided-card"),
      makeReviewCard(IM3_PILOT_VARIANT_KEY, "im3-first-offer-independent-card"),
      makeReviewCard(
        IM3_GRAPH_GUIDED_SEED_2_VARIANT_KEY,
        "im3-first-offer-graph-guided-seed-2-card",
      ),
      makeReviewCard(
        IM3_GRAPH_INDEPENDENT_SEED_2_VARIANT_KEY,
        "im3-first-offer-graph-independent-seed-2-card",
      ),
      makeReviewCard(
        IM3_EQUATION_RATE_GUIDED_ACTIVITY_ID,
        "im3-first-offer-equation-guided-card",
        IM3_EQUATION_RATE_NODE,
      ),
      makeReviewCard(
        IM3_EQUATION_RATE_INDEPENDENT_ACTIVITY_ID,
        "im3-first-offer-equation-independent-card",
        IM3_EQUATION_RATE_NODE,
      ),
      makeReviewCard(
        IM3_DOMAIN_RANGE_GUIDED_ACTIVITY_ID,
        "im3-first-offer-domain-guided-card",
        IM3_DOMAIN_RANGE_NODE,
      ),
      makeReviewCard(
        IM3_DOMAIN_RANGE_GUIDED_SEED_2_VARIANT_KEY,
        "im3-first-offer-wrong-domain-guided-seed-2-card",
        WRONG_OBJECTIVE_ID,
      ),
    ];
    const { domainGuidedSeed2Seed, domainGuidedSeed2ActivityId, ...ctx } = makeCtx({
      cards,
      teacherExposureNodeId: IM3_DOMAIN_RANGE_NODE,
    });
    const result = await resolveDailyPracticeQueue(ctx as unknown as QueryCtx, {
      studentId: LEARNER_ID,
      asOfDate: AS_OF_DATE,
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      card: {
        variantKey: IM3_DOMAIN_RANGE_GUIDED_SEED_2_VARIANT_KEY,
        objectiveId: IM3_DOMAIN_RANGE_NODE,
        state: "new",
      },
      componentKey: "graphing-explorer",
      props: {
        ...domainGuidedSeed2Seed.activity.props,
        activityId: domainGuidedSeed2ActivityId,
        stableActivityId: IM3_DOMAIN_RANGE_GUIDED_SEED_2_ACTIVITY_ID,
        masteryNodeId: IM3_DOMAIN_RANGE_NODE,
        srsEligible: true,
      },
    });
  });

  it("does not offer domain-range Guided without domain-node teacher exposure", async () => {
    const cards = [
      makeReviewCard(IM3_GUIDED_VARIANT_KEY, "im3-first-offer-guided-card"),
      makeReviewCard(IM3_PILOT_VARIANT_KEY, "im3-first-offer-independent-card"),
      makeReviewCard(
        IM3_GRAPH_GUIDED_SEED_2_VARIANT_KEY,
        "im3-first-offer-graph-guided-seed-2-card",
      ),
      makeReviewCard(
        IM3_EQUATION_RATE_GUIDED_ACTIVITY_ID,
        "im3-first-offer-equation-guided-card",
        IM3_EQUATION_RATE_NODE,
      ),
      makeReviewCard(
        IM3_EQUATION_RATE_INDEPENDENT_ACTIVITY_ID,
        "im3-first-offer-equation-independent-card",
        IM3_EQUATION_RATE_NODE,
      ),
    ];
    const result = await resolveDailyPracticeQueue(
      makeCtx({
        cards,
        teacherExposure: false,
        teacherExposureNodeId: IM3_DOMAIN_RANGE_NODE,
      }) as unknown as QueryCtx,
      { studentId: LEARNER_ID, asOfDate: AS_OF_DATE },
    );

    expect(result).toEqual([]);
  });

  it("does not let a wrong-objective domain-range Guided card suppress the first offer", async () => {
    const cards = [
      makeReviewCard(IM3_GUIDED_VARIANT_KEY, "im3-first-offer-guided-card"),
      makeReviewCard(IM3_PILOT_VARIANT_KEY, "im3-first-offer-independent-card"),
      makeReviewCard(
        IM3_GRAPH_GUIDED_SEED_2_VARIANT_KEY,
        "im3-first-offer-graph-guided-seed-2-card",
      ),
      makeReviewCard(
        IM3_GRAPH_INDEPENDENT_SEED_2_VARIANT_KEY,
        "im3-first-offer-graph-independent-seed-2-card",
      ),
      makeReviewCard(
        IM3_EQUATION_RATE_GUIDED_ACTIVITY_ID,
        "im3-first-offer-equation-guided-card",
        IM3_EQUATION_RATE_NODE,
      ),
      makeReviewCard(
        IM3_EQUATION_RATE_INDEPENDENT_ACTIVITY_ID,
        "im3-first-offer-equation-independent-card",
        IM3_EQUATION_RATE_NODE,
      ),
      makeReviewCard(
        IM3_DOMAIN_RANGE_GUIDED_ACTIVITY_ID,
        "im3-first-offer-wrong-domain-guided-card",
        WRONG_OBJECTIVE_ID,
      ),
    ];
    const { domainGuidedSeed, domainGuidedActivityId, ...ctx } = makeCtx({
      cards,
      teacherExposureNodeId: IM3_DOMAIN_RANGE_NODE,
    });
    const result = await resolveDailyPracticeQueue(ctx as unknown as QueryCtx, {
      studentId: LEARNER_ID,
      asOfDate: AS_OF_DATE,
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      card: { variantKey: IM3_DOMAIN_RANGE_GUIDED_ACTIVITY_ID, objectiveId: IM3_DOMAIN_RANGE_NODE },
      componentKey: "graphing-explorer",
      props: {
        ...domainGuidedSeed.activity.props,
        activityId: domainGuidedActivityId,
        stableActivityId: IM3_DOMAIN_RANGE_GUIDED_ACTIVITY_ID,
        masteryNodeId: IM3_DOMAIN_RANGE_NODE,
        srsEligible: true,
      },
    });
  });

  it("offers the exact domain-range Independent seed-0 card after the exact Guided seed-2 card exists", async () => {
    const cards = [
      makeReviewCard(IM3_GUIDED_VARIANT_KEY, "im3-first-offer-guided-card"),
      makeReviewCard(IM3_PILOT_VARIANT_KEY, "im3-first-offer-independent-card"),
      makeReviewCard(
        IM3_GRAPH_GUIDED_SEED_2_VARIANT_KEY,
        "im3-first-offer-graph-guided-seed-2-card",
      ),
      makeReviewCard(
        IM3_GRAPH_INDEPENDENT_SEED_2_VARIANT_KEY,
        "im3-first-offer-graph-independent-seed-2-card",
      ),
      makeReviewCard(
        IM3_EQUATION_RATE_GUIDED_ACTIVITY_ID,
        "im3-first-offer-equation-guided-card",
        IM3_EQUATION_RATE_NODE,
      ),
      makeReviewCard(
        IM3_EQUATION_RATE_INDEPENDENT_ACTIVITY_ID,
        "im3-first-offer-equation-independent-card",
        IM3_EQUATION_RATE_NODE,
      ),
      makeReviewCard(
        IM3_DOMAIN_RANGE_GUIDED_ACTIVITY_ID,
        "im3-first-offer-domain-guided-card",
        IM3_DOMAIN_RANGE_NODE,
      ),
      makeReviewCard(
        IM3_DOMAIN_RANGE_GUIDED_SEED_2_VARIANT_KEY,
        "im3-first-offer-domain-guided-seed-2-card",
        IM3_DOMAIN_RANGE_NODE,
      ),
    ];
    const { domainIndependentSeed, domainIndependentActivityId, ...ctx } = makeCtx({
      cards,
      teacherExposureNodeId: IM3_DOMAIN_RANGE_NODE,
    });
    const result = await resolveDailyPracticeQueue(ctx as unknown as QueryCtx, {
      studentId: LEARNER_ID,
      asOfDate: AS_OF_DATE,
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      card: {
        variantKey: IM3_DOMAIN_RANGE_INDEPENDENT_ACTIVITY_ID,
        objectiveId: IM3_DOMAIN_RANGE_NODE,
        state: "new",
      },
      componentKey: "graphing-explorer",
      props: {
        ...domainIndependentSeed.activity.props,
        activityId: domainIndependentActivityId,
        stableActivityId: IM3_DOMAIN_RANGE_INDEPENDENT_ACTIVITY_ID,
        masteryNodeId: IM3_DOMAIN_RANGE_NODE,
        srsEligible: true,
      },
    });
  });

  it("offers the exact domain-range Independent seed-2 card after the base Independent card exists", async () => {
    const cards = [
      makeReviewCard(IM3_GUIDED_VARIANT_KEY, "im3-first-offer-guided-card"),
      makeReviewCard(IM3_PILOT_VARIANT_KEY, "im3-first-offer-independent-card"),
      makeReviewCard(
        IM3_GRAPH_GUIDED_SEED_2_VARIANT_KEY,
        "im3-first-offer-graph-guided-seed-2-card",
      ),
      makeReviewCard(
        IM3_GRAPH_INDEPENDENT_SEED_2_VARIANT_KEY,
        "im3-first-offer-graph-independent-seed-2-card",
      ),
      makeReviewCard(
        IM3_EQUATION_RATE_GUIDED_ACTIVITY_ID,
        "im3-first-offer-equation-guided-card",
        IM3_EQUATION_RATE_NODE,
      ),
      makeReviewCard(
        IM3_EQUATION_RATE_INDEPENDENT_ACTIVITY_ID,
        "im3-first-offer-equation-independent-card",
        IM3_EQUATION_RATE_NODE,
      ),
      makeReviewCard(
        IM3_DOMAIN_RANGE_GUIDED_ACTIVITY_ID,
        "im3-first-offer-domain-guided-card",
        IM3_DOMAIN_RANGE_NODE,
      ),
      makeReviewCard(
        IM3_DOMAIN_RANGE_GUIDED_SEED_2_VARIANT_KEY,
        "im3-first-offer-domain-guided-seed-2-card",
        IM3_DOMAIN_RANGE_NODE,
      ),
      makeReviewCard(
        IM3_DOMAIN_RANGE_INDEPENDENT_ACTIVITY_ID,
        "im3-first-offer-domain-independent-card",
        IM3_DOMAIN_RANGE_NODE,
      ),
    ];
    const { domainIndependentSeed2Seed, domainIndependentSeed2ActivityId, ...ctx } = makeCtx({
      cards,
      teacherExposureNodeId: IM3_DOMAIN_RANGE_NODE,
    });
    const result = await resolveDailyPracticeQueue(ctx as unknown as QueryCtx, {
      studentId: LEARNER_ID,
      asOfDate: AS_OF_DATE,
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      card: {
        variantKey: IM3_DOMAIN_RANGE_INDEPENDENT_SEED_2_VARIANT_KEY,
        objectiveId: IM3_DOMAIN_RANGE_NODE,
        state: "new",
      },
      componentKey: "graphing-explorer",
      props: {
        ...domainIndependentSeed2Seed.activity.props,
        activityId: domainIndependentSeed2ActivityId,
        stableActivityId: IM3_DOMAIN_RANGE_INDEPENDENT_SEED_2_ACTIVITY_ID,
        masteryNodeId: IM3_DOMAIN_RANGE_NODE,
        srsEligible: true,
        equation: "y = x^2 - x + 2",
        responseVariant: "domain_range",
        domain: [-5, 5],
        range: [-10, 10],
      },
    });
  });

  it.each([
    [
      "stable-ID lookalike",
      { stableActivityId: `${IM3_DOMAIN_RANGE_INDEPENDENT_SEED_2_ACTIVITY_ID}-lookalike` },
    ],
    ["wrong mastery node", { masteryNodeId: WRONG_OBJECTIVE_ID }],
    ["wrong component", { componentKey: "fill-in-the-blank" }],
    ["false eligibility", { srsEligible: false }],
  ] as const)(
    "does not offer domain-range Independent seed 2 for %s",
    async (_label, domainRangeIndependentSeed2ActivityPatch) => {
      const cards = [
        makeReviewCard(IM3_GUIDED_VARIANT_KEY, "im3-first-offer-guided-card"),
        makeReviewCard(IM3_PILOT_VARIANT_KEY, "im3-first-offer-independent-card"),
        makeReviewCard(
          IM3_GRAPH_GUIDED_SEED_2_VARIANT_KEY,
          "im3-first-offer-graph-guided-seed-2-card",
        ),
        makeReviewCard(
          IM3_GRAPH_INDEPENDENT_SEED_2_VARIANT_KEY,
          "im3-first-offer-graph-independent-seed-2-card",
        ),
        makeReviewCard(
          IM3_EQUATION_RATE_GUIDED_ACTIVITY_ID,
          "im3-first-offer-equation-guided-card",
          IM3_EQUATION_RATE_NODE,
        ),
        makeReviewCard(
          IM3_EQUATION_RATE_INDEPENDENT_ACTIVITY_ID,
          "im3-first-offer-equation-independent-card",
          IM3_EQUATION_RATE_NODE,
        ),
        makeReviewCard(
          IM3_DOMAIN_RANGE_GUIDED_ACTIVITY_ID,
          "im3-first-offer-domain-guided-card",
          IM3_DOMAIN_RANGE_NODE,
        ),
        makeReviewCard(
          IM3_DOMAIN_RANGE_GUIDED_SEED_2_VARIANT_KEY,
          "im3-first-offer-domain-guided-seed-2-card",
          IM3_DOMAIN_RANGE_NODE,
        ),
        makeReviewCard(
          IM3_DOMAIN_RANGE_INDEPENDENT_ACTIVITY_ID,
          "im3-first-offer-domain-independent-card",
          IM3_DOMAIN_RANGE_NODE,
        ),
      ];
      const result = await resolveDailyPracticeQueue(
        makeCtx({
          cards,
          domainRangeIndependentSeed2ActivityPatch,
          teacherExposureNodeId: IM3_DOMAIN_RANGE_NODE,
        }) as unknown as QueryCtx,
        { studentId: LEARNER_ID, asOfDate: AS_OF_DATE },
      );

      expect(result).toEqual([]);
      expect(
        result.some(
          (item) => item.card.variantKey === IM3_DOMAIN_RANGE_INDEPENDENT_SEED_2_VARIANT_KEY,
        ),
      ).toBe(false);
    },
  );

  it("does not offer domain-range Independent seed 2 when its practice item is missing", async () => {
    const cards = [
      makeReviewCard(IM3_GUIDED_VARIANT_KEY, "im3-first-offer-guided-card"),
      makeReviewCard(IM3_PILOT_VARIANT_KEY, "im3-first-offer-independent-card"),
      makeReviewCard(
        IM3_GRAPH_GUIDED_SEED_2_VARIANT_KEY,
        "im3-first-offer-graph-guided-seed-2-card",
      ),
      makeReviewCard(
        IM3_GRAPH_INDEPENDENT_SEED_2_VARIANT_KEY,
        "im3-first-offer-graph-independent-seed-2-card",
      ),
      makeReviewCard(
        IM3_EQUATION_RATE_GUIDED_ACTIVITY_ID,
        "im3-first-offer-equation-guided-card",
        IM3_EQUATION_RATE_NODE,
      ),
      makeReviewCard(
        IM3_EQUATION_RATE_INDEPENDENT_ACTIVITY_ID,
        "im3-first-offer-equation-independent-card",
        IM3_EQUATION_RATE_NODE,
      ),
      makeReviewCard(
        IM3_DOMAIN_RANGE_GUIDED_ACTIVITY_ID,
        "im3-first-offer-domain-guided-card",
        IM3_DOMAIN_RANGE_NODE,
      ),
      makeReviewCard(
        IM3_DOMAIN_RANGE_GUIDED_SEED_2_VARIANT_KEY,
        "im3-first-offer-domain-guided-seed-2-card",
        IM3_DOMAIN_RANGE_NODE,
      ),
      makeReviewCard(
        IM3_DOMAIN_RANGE_INDEPENDENT_ACTIVITY_ID,
        "im3-first-offer-domain-independent-card",
        IM3_DOMAIN_RANGE_NODE,
      ),
    ];
    const result = await resolveDailyPracticeQueue(
      makeCtx({
        cards,
        omitDomainRangeIndependentSeed2Item: true,
        teacherExposureNodeId: IM3_DOMAIN_RANGE_NODE,
      }) as unknown as QueryCtx,
      { studentId: LEARNER_ID, asOfDate: AS_OF_DATE },
    );

    expect(result).toEqual([]);
    expect(
      result.some(
        (item) => item.card.variantKey === IM3_DOMAIN_RANGE_INDEPENDENT_SEED_2_VARIANT_KEY,
      ),
    ).toBe(false);
  });

  it("does not let a wrong-objective domain-range Independent seed-2 card suppress the exact offer", async () => {
    const cards = [
      makeReviewCard(IM3_GUIDED_VARIANT_KEY, "im3-first-offer-guided-card"),
      makeReviewCard(IM3_PILOT_VARIANT_KEY, "im3-first-offer-independent-card"),
      makeReviewCard(
        IM3_GRAPH_GUIDED_SEED_2_VARIANT_KEY,
        "im3-first-offer-graph-guided-seed-2-card",
      ),
      makeReviewCard(
        IM3_GRAPH_INDEPENDENT_SEED_2_VARIANT_KEY,
        "im3-first-offer-graph-independent-seed-2-card",
      ),
      makeReviewCard(
        IM3_EQUATION_RATE_GUIDED_ACTIVITY_ID,
        "im3-first-offer-equation-guided-card",
        IM3_EQUATION_RATE_NODE,
      ),
      makeReviewCard(
        IM3_EQUATION_RATE_INDEPENDENT_ACTIVITY_ID,
        "im3-first-offer-equation-independent-card",
        IM3_EQUATION_RATE_NODE,
      ),
      makeReviewCard(
        IM3_DOMAIN_RANGE_GUIDED_ACTIVITY_ID,
        "im3-first-offer-domain-guided-card",
        IM3_DOMAIN_RANGE_NODE,
      ),
      makeReviewCard(
        IM3_DOMAIN_RANGE_GUIDED_SEED_2_VARIANT_KEY,
        "im3-first-offer-domain-guided-seed-2-card",
        IM3_DOMAIN_RANGE_NODE,
      ),
      makeReviewCard(
        IM3_DOMAIN_RANGE_INDEPENDENT_ACTIVITY_ID,
        "im3-first-offer-domain-independent-card",
        IM3_DOMAIN_RANGE_NODE,
      ),
      makeReviewCard(
        IM3_DOMAIN_RANGE_INDEPENDENT_SEED_2_VARIANT_KEY,
        "im3-first-offer-wrong-domain-independent-seed-2-card",
        WRONG_OBJECTIVE_ID,
      ),
    ];
    const { domainIndependentSeed2Seed, domainIndependentSeed2ActivityId, ...ctx } = makeCtx({
      cards,
      teacherExposureNodeId: IM3_DOMAIN_RANGE_NODE,
    });
    const result = await resolveDailyPracticeQueue(ctx as unknown as QueryCtx, {
      studentId: LEARNER_ID,
      asOfDate: AS_OF_DATE,
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      card: {
        variantKey: IM3_DOMAIN_RANGE_INDEPENDENT_SEED_2_VARIANT_KEY,
        objectiveId: IM3_DOMAIN_RANGE_NODE,
        state: "new",
      },
      componentKey: "graphing-explorer",
      props: {
        ...domainIndependentSeed2Seed.activity.props,
        activityId: domainIndependentSeed2ActivityId,
        stableActivityId: IM3_DOMAIN_RANGE_INDEPENDENT_SEED_2_ACTIVITY_ID,
        masteryNodeId: IM3_DOMAIN_RANGE_NODE,
        srsEligible: true,
        equation: "y = x^2 - x + 2",
        responseVariant: "domain_range",
        domain: [-5, 5],
        range: [-10, 10],
      },
    });
  });

  it("does not offer domain-range Independent without domain-node teacher exposure", async () => {
    const cards = [
      makeReviewCard(IM3_GUIDED_VARIANT_KEY, "im3-first-offer-guided-card"),
      makeReviewCard(IM3_PILOT_VARIANT_KEY, "im3-first-offer-independent-card"),
      makeReviewCard(
        IM3_EQUATION_RATE_GUIDED_ACTIVITY_ID,
        "im3-first-offer-equation-guided-card",
        IM3_EQUATION_RATE_NODE,
      ),
      makeReviewCard(
        IM3_EQUATION_RATE_INDEPENDENT_ACTIVITY_ID,
        "im3-first-offer-equation-independent-card",
        IM3_EQUATION_RATE_NODE,
      ),
      makeReviewCard(
        IM3_DOMAIN_RANGE_GUIDED_ACTIVITY_ID,
        "im3-first-offer-domain-guided-card",
        IM3_DOMAIN_RANGE_NODE,
      ),
      makeReviewCard(
        IM3_DOMAIN_RANGE_GUIDED_SEED_2_VARIANT_KEY,
        "im3-first-offer-domain-guided-seed-2-card",
        IM3_DOMAIN_RANGE_NODE,
      ),
    ];
    const result = await resolveDailyPracticeQueue(
      makeCtx({
        cards,
        teacherExposure: false,
        teacherExposureNodeId: IM3_DOMAIN_RANGE_NODE,
      }) as unknown as QueryCtx,
      { studentId: LEARNER_ID, asOfDate: AS_OF_DATE },
    );

    expect(result).toEqual([]);
  });

  it("offers no domain-range card when all four exact domain-range cards exist", async () => {
    const cards = [
      makeReviewCard(IM3_GUIDED_VARIANT_KEY, "im3-first-offer-guided-card"),
      makeReviewCard(IM3_PILOT_VARIANT_KEY, "im3-first-offer-independent-card"),
      makeReviewCard(
        IM3_EQUATION_RATE_GUIDED_ACTIVITY_ID,
        "im3-first-offer-equation-guided-card",
        IM3_EQUATION_RATE_NODE,
      ),
      makeReviewCard(
        IM3_EQUATION_RATE_INDEPENDENT_ACTIVITY_ID,
        "im3-first-offer-equation-independent-card",
        IM3_EQUATION_RATE_NODE,
      ),
      makeReviewCard(
        IM3_DOMAIN_RANGE_GUIDED_ACTIVITY_ID,
        "im3-first-offer-domain-guided-card",
        IM3_DOMAIN_RANGE_NODE,
      ),
      makeReviewCard(
        IM3_DOMAIN_RANGE_GUIDED_SEED_2_VARIANT_KEY,
        "im3-first-offer-domain-guided-seed-2-card",
        IM3_DOMAIN_RANGE_NODE,
      ),
      makeReviewCard(
        IM3_DOMAIN_RANGE_INDEPENDENT_ACTIVITY_ID,
        "im3-first-offer-domain-independent-card",
        IM3_DOMAIN_RANGE_NODE,
      ),
      makeReviewCard(
        IM3_DOMAIN_RANGE_INDEPENDENT_SEED_2_VARIANT_KEY,
        "im3-first-offer-domain-independent-seed-2-card",
        IM3_DOMAIN_RANGE_NODE,
      ),
    ];
    const result = await resolveDailyPracticeQueue(
      makeCtx({
        cards,
        teacherExposureNodeId: IM3_DOMAIN_RANGE_NODE,
      }) as unknown as QueryCtx,
      { studentId: LEARNER_ID, asOfDate: AS_OF_DATE },
    );

    expect(result).toEqual([]);
  });

  it("offers the exact profit-model Guided seed-1 card after the six earlier cards", async () => {
    const { profitGuidedSeed, profitGuidedActivityId, ...ctx } = makeCtx({
      cards: [...cardsThroughDomainRange],
      teacherExposureNodeId: IM3_PROFIT_MODEL_NODE,
    });
    const result = await resolveDailyPracticeQueue(ctx as unknown as QueryCtx, {
      studentId: LEARNER_ID,
      asOfDate: AS_OF_DATE,
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      card: {
        variantKey: IM3_PROFIT_MODEL_GUIDED_ACTIVITY_ID,
        objectiveId: IM3_PROFIT_MODEL_NODE,
        state: "new",
      },
      componentKey: "fill-in-the-blank",
      props: {
        ...profitGuidedSeed.activity.props,
        activityId: profitGuidedActivityId,
        stableActivityId: IM3_PROFIT_MODEL_GUIDED_ACTIVITY_ID,
        masteryNodeId: IM3_PROFIT_MODEL_NODE,
        srsEligible: true,
      },
    });
  });

  it("does not offer profit-model Guided without profit-node teacher exposure", async () => {
    const result = await resolveDailyPracticeQueue(
      makeCtx({
        cards: [...cardsThroughDomainRange],
        teacherExposure: false,
        teacherExposureNodeId: IM3_PROFIT_MODEL_NODE,
      }) as unknown as QueryCtx,
      { studentId: LEARNER_ID, asOfDate: AS_OF_DATE },
    );

    expect(result).toEqual([]);
  });

  it("does not let a wrong-objective profit-model Guided card suppress the offer", async () => {
    const result = await resolveDailyPracticeQueue(
      makeCtx({
        cards: [
          ...cardsThroughDomainRange,
          makeReviewCard(
            IM3_PROFIT_MODEL_GUIDED_ACTIVITY_ID,
            "im3-first-offer-wrong-profit-guided-card",
            WRONG_OBJECTIVE_ID,
          ),
        ],
        teacherExposureNodeId: IM3_PROFIT_MODEL_NODE,
      }) as unknown as QueryCtx,
      { studentId: LEARNER_ID, asOfDate: AS_OF_DATE },
    );

    expect(result).toHaveLength(1);
    expect(result[0]?.card).toMatchObject({
      variantKey: IM3_PROFIT_MODEL_GUIDED_ACTIVITY_ID,
      objectiveId: IM3_PROFIT_MODEL_NODE,
      state: "new",
    });
  });

  it("does not offer a duplicate when the exact profit-model Guided and Independent cards exist", async () => {
    const result = await resolveDailyPracticeQueue(
      makeCtx({
        cards: [
          ...cardsThroughDomainRange,
          makeReviewCard(
            IM3_PROFIT_MODEL_GUIDED_ACTIVITY_ID,
            "im3-first-offer-profit-guided-card",
            IM3_PROFIT_MODEL_NODE,
          ),
          makeReviewCard(
            IM3_PROFIT_MODEL_INDEPENDENT_ACTIVITY_ID,
            "im3-first-offer-profit-independent-card",
            IM3_PROFIT_MODEL_NODE,
          ),
        ],
        teacherExposureNodeId: IM3_PROFIT_MODEL_NODE,
      }) as unknown as QueryCtx,
      { studentId: LEARNER_ID, asOfDate: AS_OF_DATE },
    );

    expect(result).toEqual([]);
  });

  it("offers the exact maximum-profit Guided seed-1 card after the exact profit-model cards exist", async () => {
    const { maximumGuidedSeed, maximumGuidedActivityId, ...ctx } = makeCtx({
      cards: [
        ...cardsThroughProfitModelGuided,
        makeReviewCard(
          IM3_PROFIT_MODEL_INDEPENDENT_ACTIVITY_ID,
          "im3-first-offer-profit-independent-card",
          IM3_PROFIT_MODEL_NODE,
        ),
      ],
      teacherExposureNodeId: IM3_PROFIT_MAXIMUM_NODE,
    });
    const result = await resolveDailyPracticeQueue(ctx as unknown as QueryCtx, {
      studentId: LEARNER_ID,
      asOfDate: AS_OF_DATE,
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      card: {
        variantKey: IM3_PROFIT_MAXIMUM_GUIDED_ACTIVITY_ID,
        objectiveId: IM3_PROFIT_MAXIMUM_NODE,
        state: "new",
      },
      componentKey: "fill-in-the-blank",
      props: {
        ...maximumGuidedSeed.activity.props,
        activityId: maximumGuidedActivityId,
        stableActivityId: IM3_PROFIT_MAXIMUM_GUIDED_ACTIVITY_ID,
        masteryNodeId: IM3_PROFIT_MAXIMUM_NODE,
        srsEligible: true,
      },
    });
  });

  it("does not offer maximum-profit Guided without exact maximum-node teacher exposure", async () => {
    const result = await resolveDailyPracticeQueue(
      makeCtx({
        cards: [
          ...cardsThroughProfitModelGuided,
          makeReviewCard(
            IM3_PROFIT_MODEL_INDEPENDENT_ACTIVITY_ID,
            "im3-first-offer-profit-independent-card",
            IM3_PROFIT_MODEL_NODE,
          ),
        ],
        teacherExposure: false,
        teacherExposureNodeId: IM3_PROFIT_MAXIMUM_NODE,
      }) as unknown as QueryCtx,
      { studentId: LEARNER_ID, asOfDate: AS_OF_DATE },
    );

    expect(result).toEqual([]);
  });

  it("does not let a wrong-objective maximum-profit Guided card suppress the exact offer", async () => {
    const { maximumGuidedSeed, maximumGuidedActivityId, ...ctx } = makeCtx({
      cards: [
        ...cardsThroughProfitModelGuided,
        makeReviewCard(
          IM3_PROFIT_MODEL_INDEPENDENT_ACTIVITY_ID,
          "im3-first-offer-profit-independent-card",
          IM3_PROFIT_MODEL_NODE,
        ),
        makeReviewCard(
          IM3_PROFIT_MAXIMUM_GUIDED_ACTIVITY_ID,
          "im3-first-offer-wrong-maximum-guided-card",
          WRONG_OBJECTIVE_ID,
        ),
      ],
      teacherExposureNodeId: IM3_PROFIT_MAXIMUM_NODE,
    });
    const result = await resolveDailyPracticeQueue(ctx as unknown as QueryCtx, {
      studentId: LEARNER_ID,
      asOfDate: AS_OF_DATE,
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      card: {
        variantKey: IM3_PROFIT_MAXIMUM_GUIDED_ACTIVITY_ID,
        objectiveId: IM3_PROFIT_MAXIMUM_NODE,
        state: "new",
      },
      componentKey: "fill-in-the-blank",
      props: {
        ...maximumGuidedSeed.activity.props,
        activityId: maximumGuidedActivityId,
        stableActivityId: IM3_PROFIT_MAXIMUM_GUIDED_ACTIVITY_ID,
        masteryNodeId: IM3_PROFIT_MAXIMUM_NODE,
        srsEligible: true,
      },
    });
  });

  it("offers the exact maximum-profit Independent seed-2 card after the exact maximum Guided card exists", async () => {
    const { maximumIndependentSeed, maximumIndependentActivityId, ...ctx } = makeCtx({
      cards: [
        ...cardsThroughProfitModelGuided,
        makeReviewCard(
          IM3_PROFIT_MODEL_INDEPENDENT_ACTIVITY_ID,
          "im3-first-offer-profit-independent-card",
          IM3_PROFIT_MODEL_NODE,
        ),
        makeReviewCard(
          IM3_PROFIT_MAXIMUM_GUIDED_ACTIVITY_ID,
          "im3-first-offer-maximum-guided-card",
          IM3_PROFIT_MAXIMUM_NODE,
        ),
      ],
      teacherExposureNodeId: IM3_PROFIT_MAXIMUM_NODE,
    });
    const result = await resolveDailyPracticeQueue(ctx as unknown as QueryCtx, {
      studentId: LEARNER_ID,
      asOfDate: AS_OF_DATE,
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      card: {
        variantKey: IM3_PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
        objectiveId: IM3_PROFIT_MAXIMUM_NODE,
        state: "new",
      },
      componentKey: "fill-in-the-blank",
      props: {
        ...maximumIndependentSeed.activity.props,
        activityId: maximumIndependentActivityId,
        stableActivityId: IM3_PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
        masteryNodeId: IM3_PROFIT_MAXIMUM_NODE,
        srsEligible: true,
      },
    });
  });

  it("does not offer maximum-profit Independent without exact maximum-node teacher exposure", async () => {
    const result = await resolveDailyPracticeQueue(
      makeCtx({
        cards: [
          ...cardsThroughProfitModelGuided,
          makeReviewCard(
            IM3_PROFIT_MODEL_INDEPENDENT_ACTIVITY_ID,
            "im3-first-offer-profit-independent-card",
            IM3_PROFIT_MODEL_NODE,
          ),
          makeReviewCard(
            IM3_PROFIT_MAXIMUM_GUIDED_ACTIVITY_ID,
            "im3-first-offer-maximum-guided-card",
            IM3_PROFIT_MAXIMUM_NODE,
          ),
        ],
        teacherExposure: false,
        teacherExposureNodeId: IM3_PROFIT_MAXIMUM_NODE,
      }) as unknown as QueryCtx,
      { studentId: LEARNER_ID, asOfDate: AS_OF_DATE },
    );

    expect(result).toEqual([]);
  });

  it("does not let a wrong-objective maximum-profit Independent card suppress the exact offer", async () => {
    const { maximumIndependentSeed, maximumIndependentActivityId, ...ctx } = makeCtx({
      cards: [
        ...cardsThroughProfitModelGuided,
        makeReviewCard(
          IM3_PROFIT_MODEL_INDEPENDENT_ACTIVITY_ID,
          "im3-first-offer-profit-independent-card",
          IM3_PROFIT_MODEL_NODE,
        ),
        makeReviewCard(
          IM3_PROFIT_MAXIMUM_GUIDED_ACTIVITY_ID,
          "im3-first-offer-maximum-guided-card",
          IM3_PROFIT_MAXIMUM_NODE,
        ),
        makeReviewCard(
          IM3_PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
          "im3-first-offer-wrong-maximum-independent-card",
          WRONG_OBJECTIVE_ID,
        ),
      ],
      teacherExposureNodeId: IM3_PROFIT_MAXIMUM_NODE,
    });
    const result = await resolveDailyPracticeQueue(ctx as unknown as QueryCtx, {
      studentId: LEARNER_ID,
      asOfDate: AS_OF_DATE,
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      card: {
        variantKey: IM3_PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
        objectiveId: IM3_PROFIT_MAXIMUM_NODE,
        state: "new",
      },
      componentKey: "fill-in-the-blank",
      props: {
        ...maximumIndependentSeed.activity.props,
        activityId: maximumIndependentActivityId,
        stableActivityId: IM3_PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
        masteryNodeId: IM3_PROFIT_MAXIMUM_NODE,
        srsEligible: true,
      },
    });
  });

  it("offers the exact profit-model Independent seed-2 card after the exact Guided card exists", async () => {
    const { profitIndependentSeed, profitIndependentActivityId, ...ctx } = makeCtx({
      cards: [...cardsThroughProfitModelGuided],
      teacherExposureNodeId: IM3_PROFIT_MODEL_NODE,
    });
    const result = await resolveDailyPracticeQueue(ctx as unknown as QueryCtx, {
      studentId: LEARNER_ID,
      asOfDate: AS_OF_DATE,
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      card: {
        variantKey: IM3_PROFIT_MODEL_INDEPENDENT_ACTIVITY_ID,
        objectiveId: IM3_PROFIT_MODEL_NODE,
        state: "new",
      },
      componentKey: "fill-in-the-blank",
      props: {
        ...profitIndependentSeed.activity.props,
        activityId: profitIndependentActivityId,
        stableActivityId: IM3_PROFIT_MODEL_INDEPENDENT_ACTIVITY_ID,
        masteryNodeId: IM3_PROFIT_MODEL_NODE,
        srsEligible: true,
      },
    });
  });

  it("does not offer profit-model Independent without profit-node teacher exposure", async () => {
    const result = await resolveDailyPracticeQueue(
      makeCtx({
        cards: [...cardsThroughProfitModelGuided],
        teacherExposure: false,
        teacherExposureNodeId: IM3_PROFIT_MODEL_NODE,
      }) as unknown as QueryCtx,
      { studentId: LEARNER_ID, asOfDate: AS_OF_DATE },
    );

    expect(result).toEqual([]);
  });

  it("does not let a wrong-objective profit-model Independent card suppress the offer", async () => {
    const result = await resolveDailyPracticeQueue(
      makeCtx({
        cards: [
          ...cardsThroughProfitModelGuided,
          makeReviewCard(
            IM3_PROFIT_MODEL_INDEPENDENT_ACTIVITY_ID,
            "im3-first-offer-wrong-profit-independent-card",
            WRONG_OBJECTIVE_ID,
          ),
        ],
        teacherExposureNodeId: IM3_PROFIT_MODEL_NODE,
      }) as unknown as QueryCtx,
      { studentId: LEARNER_ID, asOfDate: AS_OF_DATE },
    );

    expect(result).toHaveLength(1);
    expect(result[0]?.card).toMatchObject({
      variantKey: IM3_PROFIT_MODEL_INDEPENDENT_ACTIVITY_ID,
      objectiveId: IM3_PROFIT_MODEL_NODE,
      state: "new",
    });
  });

  it("does not offer a duplicate when the exact profit-model Independent card exists", async () => {
    const result = await resolveDailyPracticeQueue(
      makeCtx({
        cards: [
          ...cardsThroughProfitModelGuided,
          makeReviewCard(
            IM3_PROFIT_MODEL_INDEPENDENT_ACTIVITY_ID,
            "im3-first-offer-profit-independent-card",
            IM3_PROFIT_MODEL_NODE,
          ),
        ],
        teacherExposureNodeId: IM3_PROFIT_MODEL_NODE,
      }) as unknown as QueryCtx,
      { studentId: LEARNER_ID, asOfDate: AS_OF_DATE },
    );

    expect(result).toEqual([]);
  });

  it("offers maximum-reading Guided first offer after maximum-profit Independent", async () => {
    const { maximumReadingGuidedSeed, maximumReadingGuidedActivityId, ...ctx } = makeCtx({
      cards: [...cardsThroughMaximumProfitIndependent],
      teacherExposureNodeId: IM3_MAXIMUM_READING_NODE,
    });
    const result = await resolveDailyPracticeQueue(ctx as unknown as QueryCtx, {
      studentId: LEARNER_ID,
      asOfDate: AS_OF_DATE,
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      card: {
        variantKey: IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID,
        objectiveId: IM3_MAXIMUM_READING_NODE,
        state: "new",
      },
      componentKey: "graphing-explorer",
      props: {
        ...maximumReadingGuidedSeed.activity.props,
        activityId: maximumReadingGuidedActivityId,
        stableActivityId: IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID,
        masteryNodeId: IM3_MAXIMUM_READING_NODE,
        srsEligible: true,
      },
    });
  });

  it("does not offer maximum-reading Guided first offer without exact teacher exposure", async () => {
    const result = await resolveDailyPracticeQueue(
      makeCtx({
        cards: [...cardsThroughMaximumProfitIndependent],
        teacherExposure: false,
        teacherExposureNodeId: IM3_MAXIMUM_READING_NODE,
      }) as unknown as QueryCtx,
      { studentId: LEARNER_ID, asOfDate: AS_OF_DATE },
    );

    expect(result).toEqual([]);
  });

  it("does not let wrong-objective maximum-reading Guided first offer suppress the exact offer", async () => {
    const { maximumReadingGuidedSeed, maximumReadingGuidedActivityId, ...ctx } = makeCtx({
      cards: [
        ...cardsThroughMaximumProfitIndependent,
        makeReviewCard(
          IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID,
          "im3-first-offer-wrong-maximum-reading-guided-card",
          WRONG_OBJECTIVE_ID,
        ),
      ],
      teacherExposureNodeId: IM3_MAXIMUM_READING_NODE,
    });
    const result = await resolveDailyPracticeQueue(ctx as unknown as QueryCtx, {
      studentId: LEARNER_ID,
      asOfDate: AS_OF_DATE,
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      card: {
        variantKey: IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID,
        objectiveId: IM3_MAXIMUM_READING_NODE,
        state: "new",
      },
      componentKey: "graphing-explorer",
      props: {
        ...maximumReadingGuidedSeed.activity.props,
        activityId: maximumReadingGuidedActivityId,
        stableActivityId: IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID,
        masteryNodeId: IM3_MAXIMUM_READING_NODE,
        srsEligible: true,
      },
    });
  });

  it("offers maximum-reading Independent first offer after maximum-reading Guided", async () => {
    const { maximumReadingIndependentSeed, maximumReadingIndependentActivityId, ...ctx } = makeCtx({
      cards: [...cardsThroughMaximumReadingGuided],
      teacherExposureNodeId: IM3_MAXIMUM_READING_NODE,
    });
    const result = await resolveDailyPracticeQueue(ctx as unknown as QueryCtx, {
      studentId: LEARNER_ID,
      asOfDate: AS_OF_DATE,
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      card: {
        variantKey: IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID,
        objectiveId: IM3_MAXIMUM_READING_NODE,
        state: "new",
      },
      componentKey: "graphing-explorer",
      props: {
        ...maximumReadingIndependentSeed.activity.props,
        activityId: maximumReadingIndependentActivityId,
        stableActivityId: IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID,
        masteryNodeId: IM3_MAXIMUM_READING_NODE,
        srsEligible: true,
      },
    });
  });

  it("does not offer maximum-reading Independent first offer without exact teacher exposure", async () => {
    const result = await resolveDailyPracticeQueue(
      makeCtx({
        cards: [...cardsThroughMaximumReadingGuided],
        teacherExposure: false,
        teacherExposureNodeId: IM3_MAXIMUM_READING_NODE,
      }) as unknown as QueryCtx,
      { studentId: LEARNER_ID, asOfDate: AS_OF_DATE },
    );

    expect(result).toEqual([]);
  });

  it("does not let wrong-objective maximum-reading Independent first offer suppress the exact offer", async () => {
    const { maximumReadingIndependentSeed, maximumReadingIndependentActivityId, ...ctx } = makeCtx({
      cards: [
        ...cardsThroughMaximumReadingGuided,
        makeReviewCard(
          IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID,
          "im3-first-offer-wrong-maximum-reading-independent-card",
          WRONG_OBJECTIVE_ID,
        ),
      ],
      teacherExposureNodeId: IM3_MAXIMUM_READING_NODE,
    });
    const result = await resolveDailyPracticeQueue(ctx as unknown as QueryCtx, {
      studentId: LEARNER_ID,
      asOfDate: AS_OF_DATE,
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      card: {
        variantKey: IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID,
        objectiveId: IM3_MAXIMUM_READING_NODE,
        state: "new",
      },
      componentKey: "graphing-explorer",
      props: {
        ...maximumReadingIndependentSeed.activity.props,
        activityId: maximumReadingIndependentActivityId,
        stableActivityId: IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID,
        masteryNodeId: IM3_MAXIMUM_READING_NODE,
        srsEligible: true,
      },
    });
  });

  it("does not offer a duplicate maximum-reading Independent first offer", async () => {
    const result = await resolveDailyPracticeQueue(
      makeCtx({
        cards: [
          ...cardsThroughMaximumReadingGuided,
          makeReviewCard(
            IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID,
            "im3-first-offer-maximum-reading-independent-card",
            IM3_MAXIMUM_READING_NODE,
          ),
        ],
        teacherExposureNodeId: IM3_MAXIMUM_READING_NODE,
      }) as unknown as QueryCtx,
      { studentId: LEARNER_ID, asOfDate: AS_OF_DATE },
    );

    expect(result).toEqual([]);
  });

  it("offers symmetry Guided first offer after maximum-reading Independent", async () => {
    const { symmetryGuidedSeed, symmetryGuidedActivityId, ...ctx } = makeCtx({
      cards: [...cardsThroughMaximumReadingIndependent],
      teacherExposureNodeId: IM3_SYMMETRY_NODE,
    });
    const result = await resolveDailyPracticeQueue(ctx as unknown as QueryCtx, {
      studentId: LEARNER_ID,
      asOfDate: AS_OF_DATE,
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      card: {
        variantKey: IM3_SYMMETRY_GUIDED_ACTIVITY_ID,
        objectiveId: IM3_SYMMETRY_NODE,
        state: "new",
      },
      componentKey: "graphing-explorer",
      props: {
        ...symmetryGuidedSeed.activity.props,
        activityId: symmetryGuidedActivityId,
        stableActivityId: IM3_SYMMETRY_GUIDED_ACTIVITY_ID,
        masteryNodeId: IM3_SYMMETRY_NODE,
        srsEligible: true,
      },
    });
  });

  it("does not offer symmetry Guided without exact teacher exposure", async () => {
    const result = await resolveDailyPracticeQueue(
      makeCtx({
        cards: [...cardsThroughMaximumReadingIndependent],
        teacherExposure: false,
        teacherExposureNodeId: IM3_SYMMETRY_NODE,
      }) as unknown as QueryCtx,
      { studentId: LEARNER_ID, asOfDate: AS_OF_DATE },
    );

    expect(result).toEqual([]);
  });

  it("does not let a wrong-objective symmetry Guided card suppress the exact offer", async () => {
    const { symmetryGuidedSeed, symmetryGuidedActivityId, ...ctx } = makeCtx({
      cards: [
        ...cardsThroughMaximumReadingIndependent,
        makeReviewCard(
          IM3_SYMMETRY_GUIDED_ACTIVITY_ID,
          "im3-first-offer-wrong-symmetry-guided-card",
          WRONG_OBJECTIVE_ID,
        ),
      ],
      teacherExposureNodeId: IM3_SYMMETRY_NODE,
    });
    const result = await resolveDailyPracticeQueue(ctx as unknown as QueryCtx, {
      studentId: LEARNER_ID,
      asOfDate: AS_OF_DATE,
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      card: {
        variantKey: IM3_SYMMETRY_GUIDED_ACTIVITY_ID,
        objectiveId: IM3_SYMMETRY_NODE,
        state: "new",
      },
      componentKey: "graphing-explorer",
      props: {
        ...symmetryGuidedSeed.activity.props,
        activityId: symmetryGuidedActivityId,
        stableActivityId: IM3_SYMMETRY_GUIDED_ACTIVITY_ID,
        masteryNodeId: IM3_SYMMETRY_NODE,
        srsEligible: true,
      },
    });
  });

  it("does not offer a duplicate symmetry Guided card and advances to Independent", async () => {
    const result = await resolveDailyPracticeQueue(
      makeCtx({
        cards: [
          ...cardsThroughMaximumReadingIndependent,
          makeReviewCard(
            IM3_SYMMETRY_GUIDED_ACTIVITY_ID,
            "im3-first-offer-symmetry-guided-card",
            IM3_SYMMETRY_NODE,
          ),
        ],
        teacherExposureNodeId: IM3_SYMMETRY_NODE,
      }) as unknown as QueryCtx,
      { studentId: LEARNER_ID, asOfDate: AS_OF_DATE },
    );

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      card: {
        variantKey: IM3_SYMMETRY_INDEPENDENT_ACTIVITY_ID,
        objectiveId: IM3_SYMMETRY_NODE,
        state: "new",
      },
    });
  });

  it("offers symmetry Independent first offer after symmetry Guided", async () => {
    const { symmetryIndependentSeed, symmetryIndependentActivityId, ...ctx } = makeCtx({
      cards: [...cardsThroughSymmetryGuided],
      teacherExposureNodeId: IM3_SYMMETRY_NODE,
    });
    const result = await resolveDailyPracticeQueue(ctx as unknown as QueryCtx, {
      studentId: LEARNER_ID,
      asOfDate: AS_OF_DATE,
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      card: {
        variantKey: IM3_SYMMETRY_INDEPENDENT_ACTIVITY_ID,
        objectiveId: IM3_SYMMETRY_NODE,
        state: "new",
      },
      componentKey: "graphing-explorer",
      props: {
        ...symmetryIndependentSeed.activity.props,
        activityId: symmetryIndependentActivityId,
        stableActivityId: IM3_SYMMETRY_INDEPENDENT_ACTIVITY_ID,
        masteryNodeId: IM3_SYMMETRY_NODE,
        srsEligible: true,
      },
    });
  });

  it("does not offer symmetry Independent without exact teacher exposure", async () => {
    const result = await resolveDailyPracticeQueue(
      makeCtx({
        cards: [...cardsThroughSymmetryGuided],
        teacherExposure: false,
        teacherExposureNodeId: IM3_SYMMETRY_NODE,
      }) as unknown as QueryCtx,
      { studentId: LEARNER_ID, asOfDate: AS_OF_DATE },
    );

    expect(result).toEqual([]);
  });

  it("does not let a wrong-objective symmetry Independent card suppress the exact offer", async () => {
    const { symmetryIndependentSeed, symmetryIndependentActivityId, ...ctx } = makeCtx({
      cards: [
        ...cardsThroughSymmetryGuided,
        makeReviewCard(
          IM3_SYMMETRY_INDEPENDENT_ACTIVITY_ID,
          "im3-first-offer-wrong-symmetry-independent-card",
          WRONG_OBJECTIVE_ID,
        ),
      ],
      teacherExposureNodeId: IM3_SYMMETRY_NODE,
    });
    const result = await resolveDailyPracticeQueue(ctx as unknown as QueryCtx, {
      studentId: LEARNER_ID,
      asOfDate: AS_OF_DATE,
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      card: {
        variantKey: IM3_SYMMETRY_INDEPENDENT_ACTIVITY_ID,
        objectiveId: IM3_SYMMETRY_NODE,
        state: "new",
      },
      componentKey: "graphing-explorer",
      props: {
        ...symmetryIndependentSeed.activity.props,
        activityId: symmetryIndependentActivityId,
        stableActivityId: IM3_SYMMETRY_INDEPENDENT_ACTIVITY_ID,
        masteryNodeId: IM3_SYMMETRY_NODE,
        srsEligible: true,
      },
    });
  });

  it("does not offer a duplicate symmetry Independent card", async () => {
    const result = await resolveDailyPracticeQueue(
      makeCtx({
        cards: [
          ...cardsThroughSymmetryGuided,
          makeReviewCard(
            IM3_SYMMETRY_INDEPENDENT_ACTIVITY_ID,
            "im3-first-offer-symmetry-independent-card",
            IM3_SYMMETRY_NODE,
          ),
        ],
        teacherExposureNodeId: IM3_SYMMETRY_NODE,
      }) as unknown as QueryCtx,
      { studentId: LEARNER_ID, asOfDate: AS_OF_DATE },
    );

    expect(
      result.some((item) => item.card.variantKey === IM3_SYMMETRY_INDEPENDENT_ACTIVITY_ID),
    ).toBe(false);
  });

  it("offers compare-maximum Guided first offer after symmetry Independent", async () => {
    const { compareMaximumGuidedSeed, compareMaximumGuidedActivityId, ...ctx } = makeCtx({
      cards: [...cardsThroughSymmetryIndependent],
      teacherExposureNodeId: IM3_COMPARE_MAXIMUM_NODE,
    });
    const result = await resolveDailyPracticeQueue(ctx as unknown as QueryCtx, {
      studentId: LEARNER_ID,
      asOfDate: AS_OF_DATE,
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      card: {
        variantKey: IM3_COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID,
        objectiveId: IM3_COMPARE_MAXIMUM_NODE,
        state: "new",
      },
      componentKey: "graphing-explorer",
      props: {
        ...compareMaximumGuidedSeed.activity.props,
        activityId: compareMaximumGuidedActivityId,
        stableActivityId: IM3_COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID,
        masteryNodeId: IM3_COMPARE_MAXIMUM_NODE,
        srsEligible: true,
      },
    });
  });

  it("does not offer compare-maximum Guided without exact teacher exposure", async () => {
    const result = await resolveDailyPracticeQueue(
      makeCtx({
        cards: [...cardsThroughSymmetryIndependent],
        teacherExposure: false,
        teacherExposureNodeId: IM3_COMPARE_MAXIMUM_NODE,
      }) as unknown as QueryCtx,
      { studentId: LEARNER_ID, asOfDate: AS_OF_DATE },
    );

    expect(result).toEqual([]);
  });

  it("does not let a wrong-objective compare-maximum Guided card suppress the exact offer", async () => {
    const { compareMaximumGuidedSeed, compareMaximumGuidedActivityId, ...ctx } = makeCtx({
      cards: [
        ...cardsThroughSymmetryIndependent,
        makeReviewCard(
          IM3_COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID,
          "im3-first-offer-wrong-compare-maximum-guided-card",
          WRONG_OBJECTIVE_ID,
        ),
      ],
      teacherExposureNodeId: IM3_COMPARE_MAXIMUM_NODE,
    });
    const result = await resolveDailyPracticeQueue(ctx as unknown as QueryCtx, {
      studentId: LEARNER_ID,
      asOfDate: AS_OF_DATE,
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      card: {
        variantKey: IM3_COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID,
        objectiveId: IM3_COMPARE_MAXIMUM_NODE,
        state: "new",
      },
      componentKey: "graphing-explorer",
      props: {
        ...compareMaximumGuidedSeed.activity.props,
        activityId: compareMaximumGuidedActivityId,
        stableActivityId: IM3_COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID,
        masteryNodeId: IM3_COMPARE_MAXIMUM_NODE,
        srsEligible: true,
      },
    });
  });

  it("does not offer a duplicate compare-maximum Guided card", async () => {
    const result = await resolveDailyPracticeQueue(
      makeCtx({
        cards: [
          ...cardsThroughSymmetryIndependent,
          makeReviewCard(
            IM3_COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID,
            "im3-first-offer-compare-maximum-guided-card",
            IM3_COMPARE_MAXIMUM_NODE,
          ),
        ],
        teacherExposureNodeId: IM3_COMPARE_MAXIMUM_NODE,
      }) as unknown as QueryCtx,
      { studentId: LEARNER_ID, asOfDate: AS_OF_DATE },
    );

    expect(
      result.some((item) => item.card.variantKey === IM3_COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID),
    ).toBe(false);
  });

  it("offers compare-maximum Independent first offer after compare-maximum Guided", async () => {
    const { compareMaximumIndependentSeed, compareMaximumIndependentActivityId, ...ctx } = makeCtx({
      cards: [...cardsThroughCompareMaximumGuided],
      teacherExposureNodeId: IM3_COMPARE_MAXIMUM_NODE,
    });
    const result = await resolveDailyPracticeQueue(ctx as unknown as QueryCtx, {
      studentId: LEARNER_ID,
      asOfDate: AS_OF_DATE,
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      card: {
        variantKey: IM3_COMPARE_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
        objectiveId: IM3_COMPARE_MAXIMUM_NODE,
        state: "new",
      },
      componentKey: "graphing-explorer",
      props: {
        ...compareMaximumIndependentSeed.activity.props,
        activityId: compareMaximumIndependentActivityId,
        stableActivityId: IM3_COMPARE_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
        masteryNodeId: IM3_COMPARE_MAXIMUM_NODE,
        srsEligible: true,
      },
    });
  });

  it("does not offer compare-maximum Independent without exact teacher exposure", async () => {
    const result = await resolveDailyPracticeQueue(
      makeCtx({
        cards: [...cardsThroughCompareMaximumGuided],
        teacherExposure: false,
        teacherExposureNodeId: IM3_COMPARE_MAXIMUM_NODE,
      }) as unknown as QueryCtx,
      { studentId: LEARNER_ID, asOfDate: AS_OF_DATE },
    );

    expect(result).toEqual([]);
  });

  it("does not let a wrong-objective compare-maximum Independent card suppress the exact offer", async () => {
    const { compareMaximumIndependentSeed, compareMaximumIndependentActivityId, ...ctx } = makeCtx({
      cards: [
        ...cardsThroughCompareMaximumGuided,
        makeReviewCard(
          IM3_COMPARE_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
          "im3-first-offer-wrong-compare-maximum-independent-card",
          WRONG_OBJECTIVE_ID,
        ),
      ],
      teacherExposureNodeId: IM3_COMPARE_MAXIMUM_NODE,
    });
    const result = await resolveDailyPracticeQueue(ctx as unknown as QueryCtx, {
      studentId: LEARNER_ID,
      asOfDate: AS_OF_DATE,
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      card: {
        variantKey: IM3_COMPARE_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
        objectiveId: IM3_COMPARE_MAXIMUM_NODE,
        state: "new",
      },
      componentKey: "graphing-explorer",
      props: {
        ...compareMaximumIndependentSeed.activity.props,
        activityId: compareMaximumIndependentActivityId,
        stableActivityId: IM3_COMPARE_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
        masteryNodeId: IM3_COMPARE_MAXIMUM_NODE,
        srsEligible: true,
      },
    });
  });

  it("does not offer a duplicate compare-maximum Independent card", async () => {
    const result = await resolveDailyPracticeQueue(
      makeCtx({
        cards: [
          ...cardsThroughCompareMaximumGuided,
          makeReviewCard(
            IM3_COMPARE_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
            "im3-first-offer-compare-maximum-independent-card",
            IM3_COMPARE_MAXIMUM_NODE,
          ),
        ],
        teacherExposureNodeId: IM3_COMPARE_MAXIMUM_NODE,
      }) as unknown as QueryCtx,
      { studentId: LEARNER_ID, asOfDate: AS_OF_DATE },
    );

    expect(
      result.some((item) => item.card.variantKey === IM3_COMPARE_MAXIMUM_INDEPENDENT_ACTIVITY_ID),
    ).toBe(false);
  });

  it("offers the exact one-real-solution Guided card after compare-maximum Independent", async () => {
    const { oneRealSolutionGuidedSeed, oneRealSolutionGuidedActivityId, ...ctx } = makeCtx({
      cards: cardsThroughCompareMaximumIndependent,
      teacherExposureNodeId: IM3_ONE_REAL_SOLUTION_NODE,
    });
    const result = await resolveDailyPracticeQueue(ctx as unknown as QueryCtx, {
      studentId: LEARNER_ID,
      asOfDate: AS_OF_DATE,
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      card: {
        variantKey: IM3_ONE_REAL_SOLUTION_GUIDED_ACTIVITY_ID,
        objectiveId: IM3_ONE_REAL_SOLUTION_NODE,
        state: "new",
      },
      componentKey: "graphing-explorer",
      props: {
        ...oneRealSolutionGuidedSeed.activity.props,
        activityId: oneRealSolutionGuidedActivityId,
        stableActivityId: IM3_ONE_REAL_SOLUTION_GUIDED_ACTIVITY_ID,
        masteryNodeId: IM3_ONE_REAL_SOLUTION_NODE,
        srsEligible: true,
      },
    });
  });

  it("does not offer one-real-solution Guided without exact atomic teacher exposure", async () => {
    const result = await resolveDailyPracticeQueue(
      makeCtx({
        cards: cardsThroughCompareMaximumIndependent,
        teacherExposureNodeId: WRONG_OBJECTIVE_ID,
      }) as unknown as QueryCtx,
      { studentId: LEARNER_ID, asOfDate: AS_OF_DATE },
    );

    expect(
      result.some((item) => item.card.variantKey === IM3_ONE_REAL_SOLUTION_GUIDED_ACTIVITY_ID),
    ).toBe(false);
  });

  it("does not let a wrong-objective one-real-solution Guided card suppress the exact offer", async () => {
    const { oneRealSolutionGuidedSeed, oneRealSolutionGuidedActivityId, ...ctx } = makeCtx({
      cards: [
        ...cardsThroughCompareMaximumIndependent,
        makeReviewCard(
          IM3_ONE_REAL_SOLUTION_GUIDED_ACTIVITY_ID,
          "im3-first-offer-wrong-one-real-solution-guided-card",
          WRONG_OBJECTIVE_ID,
        ),
      ],
      teacherExposureNodeId: IM3_ONE_REAL_SOLUTION_NODE,
    });
    const result = await resolveDailyPracticeQueue(ctx as unknown as QueryCtx, {
      studentId: LEARNER_ID,
      asOfDate: AS_OF_DATE,
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      card: {
        variantKey: IM3_ONE_REAL_SOLUTION_GUIDED_ACTIVITY_ID,
        objectiveId: IM3_ONE_REAL_SOLUTION_NODE,
        state: "new",
      },
      componentKey: "graphing-explorer",
      props: {
        ...oneRealSolutionGuidedSeed.activity.props,
        activityId: oneRealSolutionGuidedActivityId,
        stableActivityId: IM3_ONE_REAL_SOLUTION_GUIDED_ACTIVITY_ID,
        masteryNodeId: IM3_ONE_REAL_SOLUTION_NODE,
        srsEligible: true,
      },
    });
  });

  it("does not offer a duplicate one-real-solution Guided card", async () => {
    const result = await resolveDailyPracticeQueue(
      makeCtx({
        cards: [
          ...cardsThroughCompareMaximumIndependent,
          makeReviewCard(
            IM3_ONE_REAL_SOLUTION_GUIDED_ACTIVITY_ID,
            "im3-first-offer-one-real-solution-guided-card",
            IM3_ONE_REAL_SOLUTION_NODE,
          ),
        ],
        teacherExposureNodeId: IM3_ONE_REAL_SOLUTION_NODE,
      }) as unknown as QueryCtx,
      { studentId: LEARNER_ID, asOfDate: AS_OF_DATE },
    );

    expect(
      result.some((item) => item.card.variantKey === IM3_ONE_REAL_SOLUTION_GUIDED_ACTIVITY_ID),
    ).toBe(false);
  });

  it("offers the exact one-real-solution Independent card after atomic Guided", async () => {
    const { oneRealSolutionIndependentSeed, oneRealSolutionIndependentActivityId, ...ctx } =
      makeCtx({
        cards: cardsThroughOneRealSolutionGuided,
        teacherExposureNodeId: IM3_ONE_REAL_SOLUTION_NODE,
      });
    const result = await resolveDailyPracticeQueue(ctx as unknown as QueryCtx, {
      studentId: LEARNER_ID,
      asOfDate: AS_OF_DATE,
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      card: {
        variantKey: IM3_ONE_REAL_SOLUTION_INDEPENDENT_ACTIVITY_ID,
        objectiveId: IM3_ONE_REAL_SOLUTION_NODE,
        state: "new",
      },
      componentKey: "graphing-explorer",
      props: {
        ...oneRealSolutionIndependentSeed.activity.props,
        activityId: oneRealSolutionIndependentActivityId,
        stableActivityId: IM3_ONE_REAL_SOLUTION_INDEPENDENT_ACTIVITY_ID,
        masteryNodeId: IM3_ONE_REAL_SOLUTION_NODE,
        srsEligible: true,
      },
    });
  });

  it("does not offer one-real-solution Independent without exact atomic teacher exposure", async () => {
    const result = await resolveDailyPracticeQueue(
      makeCtx({
        cards: cardsThroughOneRealSolutionGuided,
        teacherExposureNodeId: WRONG_OBJECTIVE_ID,
      }) as unknown as QueryCtx,
      { studentId: LEARNER_ID, asOfDate: AS_OF_DATE },
    );

    expect(
      result.some((item) => item.card.variantKey === IM3_ONE_REAL_SOLUTION_INDEPENDENT_ACTIVITY_ID),
    ).toBe(false);
  });

  it("does not let a wrong-objective one-real-solution Independent card suppress the exact offer", async () => {
    const { oneRealSolutionIndependentSeed, oneRealSolutionIndependentActivityId, ...ctx } =
      makeCtx({
        cards: [
          ...cardsThroughOneRealSolutionGuided,
          makeReviewCard(
            IM3_ONE_REAL_SOLUTION_INDEPENDENT_ACTIVITY_ID,
            "im3-first-offer-wrong-one-real-solution-independent-card",
            WRONG_OBJECTIVE_ID,
          ),
        ],
        teacherExposureNodeId: IM3_ONE_REAL_SOLUTION_NODE,
      });
    const result = await resolveDailyPracticeQueue(ctx as unknown as QueryCtx, {
      studentId: LEARNER_ID,
      asOfDate: AS_OF_DATE,
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      card: {
        variantKey: IM3_ONE_REAL_SOLUTION_INDEPENDENT_ACTIVITY_ID,
        objectiveId: IM3_ONE_REAL_SOLUTION_NODE,
        state: "new",
      },
      componentKey: "graphing-explorer",
      props: {
        ...oneRealSolutionIndependentSeed.activity.props,
        activityId: oneRealSolutionIndependentActivityId,
        stableActivityId: IM3_ONE_REAL_SOLUTION_INDEPENDENT_ACTIVITY_ID,
        masteryNodeId: IM3_ONE_REAL_SOLUTION_NODE,
        srsEligible: true,
      },
    });
  });

  it("does not offer a duplicate one-real-solution Independent card", async () => {
    const result = await resolveDailyPracticeQueue(
      makeCtx({
        cards: [
          ...cardsThroughOneRealSolutionGuided,
          makeReviewCard(
            IM3_ONE_REAL_SOLUTION_INDEPENDENT_ACTIVITY_ID,
            "im3-first-offer-one-real-solution-independent-card",
            IM3_ONE_REAL_SOLUTION_NODE,
          ),
        ],
        teacherExposureNodeId: IM3_ONE_REAL_SOLUTION_NODE,
      }) as unknown as QueryCtx,
      { studentId: LEARNER_ID, asOfDate: AS_OF_DATE },
    );

    expect(
      result.some((item) => item.card.variantKey === IM3_ONE_REAL_SOLUTION_INDEPENDENT_ACTIVITY_ID),
    ).toBe(false);
  });

  it("offers the exact two-real-solutions Guided seed-5 card after one-real-solution Independent", async () => {
    const { twoRealSolutionsGuidedSeed, twoRealSolutionsGuidedActivityId, ...ctx } = makeCtx({
      cards: cardsThroughOneRealSolutionIndependent,
      teacherExposureNodeId: IM3_TWO_REAL_SOLUTIONS_NODE,
    });
    const result = await resolveDailyPracticeQueue(ctx as unknown as QueryCtx, {
      studentId: LEARNER_ID,
      asOfDate: AS_OF_DATE,
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      card: {
        variantKey: IM3_TWO_REAL_SOLUTIONS_GUIDED_ACTIVITY_ID,
        objectiveId: IM3_TWO_REAL_SOLUTIONS_NODE,
        state: "new",
      },
      componentKey: "graphing-explorer",
      props: {
        ...twoRealSolutionsGuidedSeed.activity.props,
        activityId: twoRealSolutionsGuidedActivityId,
        stableActivityId: IM3_TWO_REAL_SOLUTIONS_GUIDED_ACTIVITY_ID,
        masteryNodeId: IM3_TWO_REAL_SOLUTIONS_NODE,
        srsEligible: true,
      },
    });
  });

  it("offers the exact two-real-solutions Independent seed-2 card after the exact Guided card", async () => {
    const { twoRealSolutionsIndependentSeed, twoRealSolutionsIndependentActivityId, ...ctx } =
      makeCtx({
        cards: cardsThroughTwoRealSolutionsGuided,
        teacherExposureNodeId: IM3_TWO_REAL_SOLUTIONS_NODE,
      });
    const result = await resolveDailyPracticeQueue(ctx as unknown as QueryCtx, {
      studentId: LEARNER_ID,
      asOfDate: AS_OF_DATE,
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      card: {
        variantKey: IM3_TWO_REAL_SOLUTIONS_INDEPENDENT_ACTIVITY_ID,
        objectiveId: IM3_TWO_REAL_SOLUTIONS_NODE,
        state: "new",
      },
      componentKey: "graphing-explorer",
      props: {
        ...twoRealSolutionsIndependentSeed.activity.props,
        activityId: twoRealSolutionsIndependentActivityId,
        stableActivityId: IM3_TWO_REAL_SOLUTIONS_INDEPENDENT_ACTIVITY_ID,
        masteryNodeId: IM3_TWO_REAL_SOLUTIONS_NODE,
        srsEligible: true,
      },
    });
  });
});
