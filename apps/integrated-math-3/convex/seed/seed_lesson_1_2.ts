import { normalizeSeedProps } from '../../lib/activities/seed-props';
import { internalMutation, type MutationCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import { practiceItemSchema } from "@math-platform/practice-core";
import { SeedActivityContent } from "./types";
import type { GraphingExplorerSchemaProps } from "@math-platform/math-content";
import { graphingExplorerSchema } from "@math-platform/math-content";
import { getGenerator } from "@math-platform/math-content/knowledge-space";
import {
  IM3_ONE_REAL_SOLUTION_GUIDED_ACTIVITY_ID,
  IM3_ONE_REAL_SOLUTION_INDEPENDENT_ACTIVITY_ID,
  IM3_ONE_REAL_SOLUTION_NODE,
  IM3_ONE_REAL_SOLUTION_WORKED_ACTIVITY_ID,
  IM3_TWO_REAL_SOLUTIONS_NODE,
  IM3_TWO_REAL_SOLUTIONS_GUIDED_ACTIVITY_ID,
  IM3_TWO_REAL_SOLUTIONS_INDEPENDENT_ACTIVITY_ID,
  IM3_TWO_REAL_SOLUTIONS_WORKED_ACTIVITY_ID,
} from "../../lib/practice/learning-evidence-pilot";

interface SeedLesson2Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

const IM3_ONE_REAL_SOLUTION_GRADING_CONFIG = {
  autoGrade: true,
  passingScore: 3,
  partialCredit: true,
  partIds: ["table_values", "placed_points", "solution"],
  rubric: [
    { criteria: "Complete the five-value table.", partId: "table_values", points: 1 },
    { criteria: "Plot the five points.", partId: "placed_points", points: 1 },
    { criteria: "Identify the repeated-root solution.", partId: "solution", points: 1 },
  ],
};

const IM3_TWO_REAL_SOLUTIONS_GRADING_CONFIG = {
  autoGrade: true,
  passingScore: 3,
  partialCredit: true,
  partIds: ["table_values", "placed_points", "solutions"],
  rubric: [
    { criteria: "Complete the five-value table.", partId: "table_values", points: 1 },
    { criteria: "Plot the five points.", partId: "placed_points", points: 1 },
    { criteria: "Identify both solutions.", partId: "solutions", points: 1 },
  ],
};

export function buildIm3OneRealSolutionWorkedSeedDocument(now: number) {
  const props: GraphingExplorerSchemaProps = graphingExplorerSchema.parse({
    equation: "f(x) = x^2 + 4x + 4",
    variant: "plot_from_equation",
    responseVariant: "one_real_solution",
    originalEquation: "10 - x^2 = 4x + 14",
    domain: [-5, 1],
    range: [-1, 10],
  });

  return {
    componentKey: "graphing-explorer" as const,
    displayName: "Solve a quadratic equation with one real solution by graphing",
    description: "Worked Example 1: Solve 10 - x^2 = 4x + 14 by graphing.",
    props,
    gradingConfig: IM3_ONE_REAL_SOLUTION_GRADING_CONFIG,
    stableActivityId: IM3_ONE_REAL_SOLUTION_WORKED_ACTIVITY_ID,
    masteryNodeId: IM3_ONE_REAL_SOLUTION_NODE,
    learningEvidenceMode: "worked_example" as const,
    srsEligible: false as const,
    createdAt: now,
    updatedAt: now,
  };
}

export function buildIm3TwoRealSolutionsWorkedSeedDocument(now: number) {
  const generated = getGenerator("two-real-solutions-graphing").generate({
    nodeId: IM3_TWO_REAL_SOLUTIONS_NODE,
    seed: 0,
    difficulty: 0.5,
  });
  const props: GraphingExplorerSchemaProps = graphingExplorerSchema.parse(
    generated.data.rendererProps,
  );

  return {
    componentKey: "graphing-explorer" as const,
    displayName: "Find two numbers with a given sum and product by graphing",
    description: "Worked Example 2: Find two real numbers with a sum of 24 and a product of 143 by graphing.",
    props,
    gradingConfig: IM3_TWO_REAL_SOLUTIONS_GRADING_CONFIG,
    stableActivityId: IM3_TWO_REAL_SOLUTIONS_WORKED_ACTIVITY_ID,
    masteryNodeId: IM3_TWO_REAL_SOLUTIONS_NODE,
    learningEvidenceMode: "worked_example" as const,
    srsEligible: false as const,
    createdAt: now,
    updatedAt: now,
  };
}

export function buildIm3TwoRealSolutionsGuidedSeedDocument(now: number) {
  const generated = getGenerator("two-real-solutions-graphing").generate({
    nodeId: IM3_TWO_REAL_SOLUTIONS_NODE,
    seed: 5,
    difficulty: 0.5,
  });
  const props: GraphingExplorerSchemaProps = graphingExplorerSchema.parse(
    generated.data.rendererProps,
  );

  return {
    componentKey: "graphing-explorer" as const,
    displayName: "Guided practice: Find two numbers with a given sum and product by graphing",
    description: "Guided practice for finding two real numbers with a given sum and product by graphing.",
    props,
    gradingConfig: IM3_TWO_REAL_SOLUTIONS_GRADING_CONFIG,
    stableActivityId: IM3_TWO_REAL_SOLUTIONS_GUIDED_ACTIVITY_ID,
    masteryNodeId: IM3_TWO_REAL_SOLUTIONS_NODE,
    srsEligible: true as const,
    createdAt: now,
    updatedAt: now,
  };
}

export function buildIm3TwoRealSolutionsIndependentSeedDocument(now: number) {
  const generated = getGenerator("two-real-solutions-graphing").generate({
    nodeId: IM3_TWO_REAL_SOLUTIONS_NODE,
    seed: 2,
    difficulty: 0.5,
  });
  const props: GraphingExplorerSchemaProps = graphingExplorerSchema.parse(
    generated.data.rendererProps,
  );

  return {
    componentKey: "graphing-explorer" as const,
    displayName: "Independent practice: Find two numbers with a given sum and product by graphing",
    description: "Independent practice for finding two real numbers with a sum and product by graphing.",
    props,
    gradingConfig: IM3_TWO_REAL_SOLUTIONS_GRADING_CONFIG,
    stableActivityId: IM3_TWO_REAL_SOLUTIONS_INDEPENDENT_ACTIVITY_ID,
    masteryNodeId: IM3_TWO_REAL_SOLUTIONS_NODE,
    srsEligible: true as const,
    createdAt: now,
    updatedAt: now,
  };
}

export function buildIm3OneRealSolutionGuidedSeedDocument(now: number) {
  const generated = getGenerator("one-real-solution-graphing").generate({
    nodeId: IM3_ONE_REAL_SOLUTION_NODE,
    seed: 45,
    difficulty: 0.5,
  });
  const props: GraphingExplorerSchemaProps = graphingExplorerSchema.parse(
    generated.data.rendererProps,
  );

  return {
    componentKey: "graphing-explorer" as const,
    displayName: "Guided practice: Solve a quadratic equation with one real solution by graphing",
    description: "Guided practice for solving a quadratic equation with one real solution by graphing.",
    props,
    gradingConfig: IM3_ONE_REAL_SOLUTION_GRADING_CONFIG,
    stableActivityId: IM3_ONE_REAL_SOLUTION_GUIDED_ACTIVITY_ID,
    masteryNodeId: IM3_ONE_REAL_SOLUTION_NODE,
    srsEligible: true as const,
    createdAt: now,
    updatedAt: now,
  };
}

export function buildIm3OneRealSolutionGuidedPracticeSeedDocuments(
  activityId: Id<"activities">,
  now: number,
) {
  return {
    variant: {
      variantKey: IM3_ONE_REAL_SOLUTION_GUIDED_ACTIVITY_ID,
      legacyProblemFamilyId: IM3_ONE_REAL_SOLUTION_GUIDED_ACTIVITY_ID,
      migrationVersion: "kst-srs.v3.2" as const,
      sourceTimestamp: now,
      componentKey: "graphing-explorer",
      displayName: "Guided practice: Solve a quadratic equation with one real solution by graphing",
      description: "Guided practice for solving a quadratic equation with one real solution by graphing.",
      objectiveIds: [IM3_ONE_REAL_SOLUTION_NODE],
      difficulty: "standard",
      metadata: { stableActivityId: IM3_ONE_REAL_SOLUTION_GUIDED_ACTIVITY_ID },
    },
    item: {
      practiceItemId: `${IM3_ONE_REAL_SOLUTION_GUIDED_ACTIVITY_ID}:seed-45`,
      activityId,
      variantKey: IM3_ONE_REAL_SOLUTION_GUIDED_ACTIVITY_ID,
      legacyProblemFamilyId: IM3_ONE_REAL_SOLUTION_GUIDED_ACTIVITY_ID,
      migrationVersion: "kst-srs.v3.2" as const,
      sourceTimestamp: now,
      variantLabel: "Seed 45",
    },
  };
}

export function buildIm3TwoRealSolutionsGuidedPracticeSeedDocuments(
  activityId: Id<"activities">,
  now: number,
) {
  return {
    variant: {
      variantKey: IM3_TWO_REAL_SOLUTIONS_GUIDED_ACTIVITY_ID,
      legacyProblemFamilyId: IM3_TWO_REAL_SOLUTIONS_GUIDED_ACTIVITY_ID,
      migrationVersion: "kst-srs.v3.2" as const,
      sourceTimestamp: now,
      componentKey: "graphing-explorer",
      displayName: "Guided practice: Find two numbers with a given sum and product by graphing",
      description: "Guided practice for finding two real numbers with a sum and product by graphing.",
      objectiveIds: [IM3_TWO_REAL_SOLUTIONS_NODE],
      difficulty: "standard",
      metadata: { stableActivityId: IM3_TWO_REAL_SOLUTIONS_GUIDED_ACTIVITY_ID },
    },
    item: {
      practiceItemId: `${IM3_TWO_REAL_SOLUTIONS_GUIDED_ACTIVITY_ID}:seed-5`,
      activityId,
      variantKey: IM3_TWO_REAL_SOLUTIONS_GUIDED_ACTIVITY_ID,
      legacyProblemFamilyId: IM3_TWO_REAL_SOLUTIONS_GUIDED_ACTIVITY_ID,
      migrationVersion: "kst-srs.v3.2" as const,
      sourceTimestamp: now,
      variantLabel: "Seed 5",
    },
  };
}

export function buildIm3OneRealSolutionIndependentPracticeSeedDocuments(
  activityId: Id<"activities">,
  now: number,
) {
  return {
    variant: {
      variantKey: IM3_ONE_REAL_SOLUTION_INDEPENDENT_ACTIVITY_ID,
      legacyProblemFamilyId: IM3_ONE_REAL_SOLUTION_INDEPENDENT_ACTIVITY_ID,
      migrationVersion: "kst-srs.v3.2" as const,
      sourceTimestamp: now,
      componentKey: "graphing-explorer",
      displayName: "Independent practice: Solve a quadratic equation with one real solution by graphing",
      description: "Independent practice for solving a quadratic equation with one real solution by graphing.",
      objectiveIds: [IM3_ONE_REAL_SOLUTION_NODE],
      difficulty: "standard",
      metadata: { stableActivityId: IM3_ONE_REAL_SOLUTION_INDEPENDENT_ACTIVITY_ID },
    },
    item: {
      practiceItemId: `${IM3_ONE_REAL_SOLUTION_INDEPENDENT_ACTIVITY_ID}:seed-0`,
      activityId,
      variantKey: IM3_ONE_REAL_SOLUTION_INDEPENDENT_ACTIVITY_ID,
      legacyProblemFamilyId: IM3_ONE_REAL_SOLUTION_INDEPENDENT_ACTIVITY_ID,
      migrationVersion: "kst-srs.v3.2" as const,
      sourceTimestamp: now,
      variantLabel: "Seed 0",
    },
  };
}

export function buildIm3TwoRealSolutionsIndependentPracticeSeedDocuments(
  activityId: Id<"activities">,
  now: number,
) {
  return {
    variant: {
      variantKey: IM3_TWO_REAL_SOLUTIONS_INDEPENDENT_ACTIVITY_ID,
      legacyProblemFamilyId: IM3_TWO_REAL_SOLUTIONS_INDEPENDENT_ACTIVITY_ID,
      migrationVersion: "kst-srs.v3.2" as const,
      sourceTimestamp: now,
      componentKey: "graphing-explorer",
      displayName: "Independent practice: Find two numbers with a given sum and product by graphing",
      description: "Independent practice for finding two real numbers with a sum and product by graphing.",
      objectiveIds: [IM3_TWO_REAL_SOLUTIONS_NODE],
      difficulty: "standard",
      metadata: { stableActivityId: IM3_TWO_REAL_SOLUTIONS_INDEPENDENT_ACTIVITY_ID },
    },
    item: {
      practiceItemId: `${IM3_TWO_REAL_SOLUTIONS_INDEPENDENT_ACTIVITY_ID}:seed-2`,
      activityId,
      variantKey: IM3_TWO_REAL_SOLUTIONS_INDEPENDENT_ACTIVITY_ID,
      legacyProblemFamilyId: IM3_TWO_REAL_SOLUTIONS_INDEPENDENT_ACTIVITY_ID,
      migrationVersion: "kst-srs.v3.2" as const,
      sourceTimestamp: now,
      variantLabel: "Seed 2",
    },
  };
}

export function buildIm3OneRealSolutionIndependentSeedDocument(now: number) {
  const generated = getGenerator("one-real-solution-graphing").generate({
    nodeId: IM3_ONE_REAL_SOLUTION_NODE,
    seed: 0,
    difficulty: 0.5,
  });
  const props: GraphingExplorerSchemaProps = graphingExplorerSchema.parse(
    generated.data.rendererProps,
  );

  return {
    componentKey: "graphing-explorer" as const,
    displayName: "Independent practice: Solve a quadratic equation with one real solution by graphing",
    description: "Independent practice for solving a quadratic equation with one real solution by graphing.",
    props,
    gradingConfig: IM3_ONE_REAL_SOLUTION_GRADING_CONFIG,
    stableActivityId: IM3_ONE_REAL_SOLUTION_INDEPENDENT_ACTIVITY_ID,
    masteryNodeId: IM3_ONE_REAL_SOLUTION_NODE,
    srsEligible: true as const,
    createdAt: now,
    updatedAt: now,
  };
}

export async function upsertIm3OneRealSolutionWorkedActivity(
  ctx: MutationCtx,
  now: number,
): Promise<Id<"activities">> {
  const existingActivity = await ctx.db
    .query("activities")
    .withIndex("by_stable_activity_id", (q) => (
      q.eq("stableActivityId", IM3_ONE_REAL_SOLUTION_WORKED_ACTIVITY_ID)
    ))
    .unique();
  const activity = buildIm3OneRealSolutionWorkedSeedDocument(now);

  if (existingActivity) {
    await ctx.db.patch(existingActivity._id, {
      ...activity,
      createdAt: existingActivity.createdAt,
    });
    return existingActivity._id;
  }

  return await ctx.db.insert("activities", activity);
}

export async function upsertIm3TwoRealSolutionsWorkedActivity(
  ctx: MutationCtx,
  now: number,
): Promise<Id<"activities">> {
  const existingActivity = await ctx.db
    .query("activities")
    .withIndex("by_stable_activity_id", (q) => (
      q.eq("stableActivityId", IM3_TWO_REAL_SOLUTIONS_WORKED_ACTIVITY_ID)
    ))
    .unique();
  const activity = buildIm3TwoRealSolutionsWorkedSeedDocument(now);

  if (existingActivity) {
    await ctx.db.patch(existingActivity._id, {
      ...activity,
      createdAt: existingActivity.createdAt,
    });
    return existingActivity._id;
  }

  return await ctx.db.insert("activities", activity);
}

export async function upsertIm3OneRealSolutionGuidedActivity(
  ctx: MutationCtx,
  now: number,
): Promise<Id<"activities">> {
  const existingActivity = await ctx.db
    .query("activities")
    .withIndex("by_stable_activity_id", (q) => (
      q.eq("stableActivityId", IM3_ONE_REAL_SOLUTION_GUIDED_ACTIVITY_ID)
    ))
    .unique();
  const activity = buildIm3OneRealSolutionGuidedSeedDocument(now);

  if (existingActivity) {
    await ctx.db.patch(existingActivity._id, {
      ...activity,
      createdAt: existingActivity.createdAt,
    });
    return existingActivity._id;
  }

  return await ctx.db.insert("activities", activity);
}

export async function upsertIm3TwoRealSolutionsGuidedActivity(
  ctx: MutationCtx,
  now: number,
): Promise<Id<"activities">> {
  const existingActivity = await ctx.db
    .query("activities")
    .withIndex("by_stable_activity_id", (q) => (
      q.eq("stableActivityId", IM3_TWO_REAL_SOLUTIONS_GUIDED_ACTIVITY_ID)
    ))
    .unique();
  const activity = buildIm3TwoRealSolutionsGuidedSeedDocument(now);

  if (existingActivity) {
    await ctx.db.patch(existingActivity._id, {
      ...activity,
      createdAt: existingActivity.createdAt,
    });
    return existingActivity._id;
  }

  return await ctx.db.insert("activities", activity);
}

export async function upsertIm3OneRealSolutionIndependentActivity(
  ctx: MutationCtx,
  now: number,
): Promise<Id<"activities">> {
  const existingActivity = await ctx.db
    .query("activities")
    .withIndex("by_stable_activity_id", (q) => (
      q.eq("stableActivityId", IM3_ONE_REAL_SOLUTION_INDEPENDENT_ACTIVITY_ID)
    ))
    .unique();
  const activity = buildIm3OneRealSolutionIndependentSeedDocument(now);

  if (existingActivity) {
    await ctx.db.patch(existingActivity._id, {
      ...activity,
      createdAt: existingActivity.createdAt,
    });
    return existingActivity._id;
  }

  return await ctx.db.insert("activities", activity);
}

export async function upsertIm3TwoRealSolutionsIndependentActivity(
  ctx: MutationCtx,
  now: number,
): Promise<Id<"activities">> {
  const existingActivity = await ctx.db
    .query("activities")
    .withIndex("by_stable_activity_id", (q) => (
      q.eq("stableActivityId", IM3_TWO_REAL_SOLUTIONS_INDEPENDENT_ACTIVITY_ID)
    ))
    .unique();
  const activity = buildIm3TwoRealSolutionsIndependentSeedDocument(now);

  if (existingActivity) {
    await ctx.db.patch(existingActivity._id, {
      ...activity,
      createdAt: existingActivity.createdAt,
    });
    return existingActivity._id;
  }

  return await ctx.db.insert("activities", activity);
}

export async function upsertIm3OneRealSolutionGuidedVariant(
  ctx: MutationCtx,
  now: number,
): Promise<Id<"practice_variants">> {
  const existingVariant = await ctx.db
    .query("practice_variants")
    .withIndex("by_variantKey", (q) => (
      q.eq("variantKey", IM3_ONE_REAL_SOLUTION_GUIDED_ACTIVITY_ID)
    ))
    .unique();
  const variant = buildIm3OneRealSolutionGuidedPracticeSeedDocuments(
    "activities:pending" as Id<"activities">,
    now,
  ).variant;

  if (existingVariant) {
    await ctx.db.patch(existingVariant._id, variant);
    return existingVariant._id;
  }

  return await ctx.db.insert("practice_variants", variant);
}

export async function upsertIm3TwoRealSolutionsGuidedVariant(
  ctx: MutationCtx,
  now: number,
): Promise<Id<"practice_variants">> {
  const existingVariant = await ctx.db
    .query("practice_variants")
    .withIndex("by_variantKey", (q) => (
      q.eq("variantKey", IM3_TWO_REAL_SOLUTIONS_GUIDED_ACTIVITY_ID)
    ))
    .unique();
  const variant = buildIm3TwoRealSolutionsGuidedPracticeSeedDocuments(
    "activities:pending" as Id<"activities">,
    now,
  ).variant;

  if (existingVariant) {
    await ctx.db.patch(existingVariant._id, variant);
    return existingVariant._id;
  }

  return await ctx.db.insert("practice_variants", variant);
}

export async function upsertIm3OneRealSolutionIndependentVariant(
  ctx: MutationCtx,
  now: number,
): Promise<Id<"practice_variants">> {
  const existingVariant = await ctx.db
    .query("practice_variants")
    .withIndex("by_variantKey", (q) => (
      q.eq("variantKey", IM3_ONE_REAL_SOLUTION_INDEPENDENT_ACTIVITY_ID)
    ))
    .unique();
  const variant = buildIm3OneRealSolutionIndependentPracticeSeedDocuments(
    "activities:pending" as Id<"activities">,
    now,
  ).variant;

  if (existingVariant) {
    await ctx.db.patch(existingVariant._id, variant);
    return existingVariant._id;
  }

  return await ctx.db.insert("practice_variants", variant);
}

export async function upsertIm3TwoRealSolutionsIndependentVariant(
  ctx: MutationCtx,
  now: number,
): Promise<Id<"practice_variants">> {
  const existingVariant = await ctx.db
    .query("practice_variants")
    .withIndex("by_variantKey", (q) => (
      q.eq("variantKey", IM3_TWO_REAL_SOLUTIONS_INDEPENDENT_ACTIVITY_ID)
    ))
    .unique();
  const variant = buildIm3TwoRealSolutionsIndependentPracticeSeedDocuments(
    "activities:pending" as Id<"activities">,
    now,
  ).variant;

  if (existingVariant) {
    await ctx.db.patch(existingVariant._id, variant);
    return existingVariant._id;
  }

  return await ctx.db.insert("practice_variants", variant);
}

export async function upsertIm3OneRealSolutionGuidedPracticeItem(
  ctx: MutationCtx,
  activityId: Id<"activities">,
  now: number,
): Promise<Id<"practice_items">> {
  const documents = buildIm3OneRealSolutionGuidedPracticeSeedDocuments(activityId, now);
  const variantRows = await ctx.db
    .query("practice_items")
    .withIndex("by_variantKey", (q) => (
      q.eq("variantKey", IM3_ONE_REAL_SOLUTION_GUIDED_ACTIVITY_ID)
    ))
    .take(2);
  const activityRows = await ctx.db
    .query("practice_items")
    .withIndex("by_activityId", (q) => q.eq("activityId", activityId))
    .take(2);
  const mappedRows = [...new Map(
    [...variantRows, ...activityRows].map((row) => [String(row._id), row]),
  ).values()];

  if (mappedRows.length > 1 || mappedRows.some((row) => (
    row.variantKey !== IM3_ONE_REAL_SOLUTION_GUIDED_ACTIVITY_ID
    || String(row.activityId) !== String(activityId)
    || row.practiceItemId !== documents.item.practiceItemId
  ))) {
    throw new Error("Duplicate or conflicting IM3 one-real-solution Guided practice-item mapping");
  }

  const parsedItem = practiceItemSchema.safeParse({
    practiceItemId: documents.item.practiceItemId,
    activityId,
    variantKey: documents.item.variantKey,
    variantLabel: documents.item.variantLabel,
  });
  if (!parsedItem.success) {
    throw new Error(`IM3 one-real-solution Guided practice item is invalid: ${parsedItem.error.message}`);
  }

  const existingItem = mappedRows[0];
  if (existingItem) {
    await ctx.db.patch(existingItem._id, documents.item);
    return existingItem._id;
  }

  return await ctx.db.insert("practice_items", documents.item);
}

export async function upsertIm3TwoRealSolutionsGuidedPracticeItem(
  ctx: MutationCtx,
  activityId: Id<"activities">,
  now: number,
): Promise<Id<"practice_items">> {
  const documents = buildIm3TwoRealSolutionsGuidedPracticeSeedDocuments(activityId, now);
  const variantRows = await ctx.db
    .query("practice_items")
    .withIndex("by_variantKey", (q) => (
      q.eq("variantKey", IM3_TWO_REAL_SOLUTIONS_GUIDED_ACTIVITY_ID)
    ))
    .take(2);
  const activityRows = await ctx.db
    .query("practice_items")
    .withIndex("by_activityId", (q) => q.eq("activityId", activityId))
    .take(2);
  const mappedRows = [...new Map(
    [...variantRows, ...activityRows].map((row) => [String(row._id), row]),
  ).values()];

  if (mappedRows.length > 1 || mappedRows.some((row) => (
    row.variantKey !== IM3_TWO_REAL_SOLUTIONS_GUIDED_ACTIVITY_ID
    || String(row.activityId) !== String(activityId)
    || row.practiceItemId !== documents.item.practiceItemId
  ))) {
    throw new Error("Duplicate or conflicting IM3 two-real-solutions Guided practice-item mapping");
  }

  const parsedItem = practiceItemSchema.safeParse({
    practiceItemId: documents.item.practiceItemId,
    activityId,
    variantKey: documents.item.variantKey,
    variantLabel: documents.item.variantLabel,
  });
  if (!parsedItem.success) {
    throw new Error(`IM3 two-real-solutions Guided practice item is invalid: ${parsedItem.error.message}`);
  }

  const existingItem = mappedRows[0];
  if (existingItem) {
    await ctx.db.patch(existingItem._id, documents.item);
    return existingItem._id;
  }

  return await ctx.db.insert("practice_items", documents.item);
}

export async function upsertIm3OneRealSolutionIndependentPracticeItem(
  ctx: MutationCtx,
  activityId: Id<"activities">,
  now: number,
): Promise<Id<"practice_items">> {
  const documents = buildIm3OneRealSolutionIndependentPracticeSeedDocuments(activityId, now);
  const variantRows = await ctx.db
    .query("practice_items")
    .withIndex("by_variantKey", (q) => (
      q.eq("variantKey", IM3_ONE_REAL_SOLUTION_INDEPENDENT_ACTIVITY_ID)
    ))
    .take(2);
  const activityRows = await ctx.db
    .query("practice_items")
    .withIndex("by_activityId", (q) => q.eq("activityId", activityId))
    .take(2);
  const mappedRows = [...new Map(
    [...variantRows, ...activityRows].map((row) => [String(row._id), row]),
  ).values()];

  if (mappedRows.length > 1 || mappedRows.some((row) => (
    row.variantKey !== IM3_ONE_REAL_SOLUTION_INDEPENDENT_ACTIVITY_ID
    || String(row.activityId) !== String(activityId)
    || row.practiceItemId !== documents.item.practiceItemId
  ))) {
    throw new Error("Duplicate or conflicting IM3 one-real-solution Independent practice-item mapping");
  }

  const parsedItem = practiceItemSchema.safeParse({
    practiceItemId: documents.item.practiceItemId,
    activityId,
    variantKey: documents.item.variantKey,
    variantLabel: documents.item.variantLabel,
  });
  if (!parsedItem.success) {
    throw new Error(`IM3 one-real-solution Independent practice item is invalid: ${parsedItem.error.message}`);
  }

  const existingItem = mappedRows[0];
  if (existingItem) {
    await ctx.db.patch(existingItem._id, documents.item);
    return existingItem._id;
  }

  return await ctx.db.insert("practice_items", documents.item);
}

export async function upsertIm3TwoRealSolutionsIndependentPracticeItem(
  ctx: MutationCtx,
  activityId: Id<"activities">,
  now: number,
): Promise<Id<"practice_items">> {
  const documents = buildIm3TwoRealSolutionsIndependentPracticeSeedDocuments(activityId, now);
  const variantRows = await ctx.db
    .query("practice_items")
    .withIndex("by_variantKey", (q) => (
      q.eq("variantKey", IM3_TWO_REAL_SOLUTIONS_INDEPENDENT_ACTIVITY_ID)
    ))
    .take(2);
  const activityRows = await ctx.db
    .query("practice_items")
    .withIndex("by_activityId", (q) => q.eq("activityId", activityId))
    .take(2);
  const mappedRows = [...new Map(
    [...variantRows, ...activityRows].map((row) => [String(row._id), row]),
  ).values()];

  if (mappedRows.length > 1 || mappedRows.some((row) => (
    row.variantKey !== IM3_TWO_REAL_SOLUTIONS_INDEPENDENT_ACTIVITY_ID
    || String(row.activityId) !== String(activityId)
    || row.practiceItemId !== documents.item.practiceItemId
  ))) {
    throw new Error("Duplicate or conflicting IM3 two-real-solutions Independent practice-item mapping");
  }

  const parsedItem = practiceItemSchema.safeParse({
    practiceItemId: documents.item.practiceItemId,
    activityId,
    variantKey: documents.item.variantKey,
    variantLabel: documents.item.variantLabel,
  });
  if (!parsedItem.success) {
    throw new Error(`IM3 two-real-solutions Independent practice item is invalid: ${parsedItem.error.message}`);
  }

  const existingItem = mappedRows[0];
  if (existingItem) {
    await ctx.db.patch(existingItem._id, documents.item);
    return existingItem._id;
  }

  return await ctx.db.insert("practice_items", documents.item);
}

export async function linkIm3OneRealSolutionWorkedPhase(
  ctx: MutationCtx,
  lessonVersionId: Id<"lesson_versions">,
  activityId: Id<"activities">,
): Promise<void> {
  const phase = await ctx.db
    .query("phase_versions")
    .withIndex("by_lesson_version_and_phase", (q) => (
      q.eq("lessonVersionId", lessonVersionId).eq("phaseNumber", 4)
    ))
    .first();
  if (!phase) {
    throw new Error("Lesson 1.2 Phase 4 is missing");
  }

  const sections = await ctx.db
    .query("phase_sections")
    .withIndex("by_phase_version", (q) => q.eq("phaseVersionId", phase._id))
    .collect();
  const textSection = sections.find((section) => (
    section.sequenceOrder === 1 && section.sectionType === "text"
  ));
  if (!textSection) {
    throw new Error("Lesson 1.2 Phase 4 text section is missing");
  }
  const activitySection = sections.find((section) => (
    section.sequenceOrder === 2 && section.sectionType === "activity"
  ));
  if (!activitySection) {
    throw new Error("Lesson 1.2 Phase 4 activity section is missing");
  }

  await ctx.db.patch(textSection._id, {
    content: {
      markdown: "## Example 1: One Real Solution\n\nSolve $10 - x^2 = 4x + 14$ by graphing.",
    },
  });
  await ctx.db.patch(activitySection._id, {
    content: {
      componentKey: "graphing-explorer",
      activityId,
    },
  });
}

export async function linkIm3TwoRealSolutionsWorkedPhase(
  ctx: MutationCtx,
  lessonVersionId: Id<"lesson_versions">,
  activityId: Id<"activities">,
): Promise<void> {
  const phase = await ctx.db
    .query("phase_versions")
    .withIndex("by_lesson_version_and_phase", (q) => (
      q.eq("lessonVersionId", lessonVersionId).eq("phaseNumber", 5)
    ))
    .first();
  if (!phase) {
    throw new Error("Lesson 1.2 Phase 5 is missing");
  }

  const sections = await ctx.db
    .query("phase_sections")
    .withIndex("by_phase_version", (q) => q.eq("phaseVersionId", phase._id))
    .collect();
  const textSection = sections.find((section) => (
    section.sequenceOrder === 1 && section.sectionType === "text"
  ));
  if (!textSection) {
    throw new Error("Lesson 1.2 Phase 5 text section is missing");
  }
  const activitySection = sections.find((section) => (
    section.sequenceOrder === 2 && section.sectionType === "activity"
  ));
  if (!activitySection) {
    throw new Error("Lesson 1.2 Phase 5 activity section is missing");
  }

  await ctx.db.patch(textSection._id, {
    content: {
      markdown: "## Example 2: Two Real Solutions\n\nUse a quadratic equation to find two real numbers with a sum of 24 and a product of 143.",
    },
  });
  await ctx.db.patch(activitySection._id, {
    content: {
      componentKey: "graphing-explorer",
      activityId,
    },
  });
}

/**
 * Convex internalMutation wrapper: seed lesson2.
 * @returns {Promise<unknown>} The wrapper result.
 */
export const seedLesson2 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson2Result> => {
    const now = Date.now();
    const lessonSlug = "module-1-lesson-2";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 1,
          title: "Solving Quadratic Equations by Graphing",
          slug: lessonSlug,
          description: "Students interpret x-intercepts as solutions.",
          orderIndex: 2,
          createdAt: now,
          updatedAt: now,
        });

    const existingLessonVersion = await ctx.db
      .query("lesson_versions")
      .withIndex("by_lesson", (q) => q.eq("lessonId", lessonId))
      .first();

    const lessonVersionId: Id<"lesson_versions"> = existingLessonVersion
      ? existingLessonVersion._id
      : await ctx.db.insert("lesson_versions", {
          lessonId,
          version: 1,
          title: "Solving Quadratic Equations by Graphing",
          description: "Students interpret x-intercepts as solutions.",
          status: "published",
          createdAt: now,
        });

    const phaseData = [
      {
        phaseNumber: 1,
        title: "Explore",
        phaseType: "explore" as const,
        estimatedMinutes: 20,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Explore: Finding Zeros Graphically\n\nIn this lesson, you'll learn how to find the solutions to quadratic equations by looking at their graphs. The **x-intercepts** of the graph are the solutions!\n\n**Key Idea**: When $f(x) = 0$, the point $(x, 0)$ lies on the x-axis. These are the x-intercepts.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "graphing-explorer",
              props: {
                variant: "find_zeros",
                equation: "y = x^2 - 4",
                title: "Find the Zeros",
              },
            },
          },
        ],
      },
      {
        phaseNumber: 2,
        title: "Vocabulary",
        phaseType: "vocabulary" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Key Terms\n\n- **Zero (or root)**: A value of $x$ where $f(x) = 0$\n- **X-intercept**: The point $(x, 0)$ where the graph crosses the x-axis\n- **Solution**: A value that makes the equation true\n- **Parabola**: The U-shaped graph of a quadratic function\n\n**Remember**: The zeros of a function are the x-intercepts of its graph!",
            },
          },
        ],
      },
      {
        phaseNumber: 3,
        title: "Learn",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Solving $f(x) = 0$ by Graphing\n\nTo find the solutions of a quadratic equation graphically:\n\n1. **Rewrite** the equation in the form $f(x) = 0$\n2. **Graph** the related function $y = f(x)$\n3. **Identify** the x-intercepts (where the graph crosses the x-axis)\n4. **Read** the solutions from the x-intercepts\n\n### Types of Solutions\n\n- **Two real solutions**: The parabola crosses the x-axis at two points\n- **One real solution**: The parabola touches the x-axis at its vertex (tangent)\n- **No real solutions**: The parabola lies entirely above or below the x-axis",
            },
          },
        ],
      },
      {
        phaseNumber: 4,
        title: "Worked Example 1",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Example 1: One Real Solution\n\nSolve $x^2 = 0$ by graphing.\n\n**Step 1**: Rewrite as $f(x) = x^2$\n**Step 2**: Graph $y = x^2$\n**Step 3**: Find where $y = 0$ (the x-intercept)\n\nThe graph touches the x-axis at the origin. The only solution is $x = 0$.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "graphing",
                equation: "x^2 = 0",
                steps: [
                  { expression: "x^2 = 0", explanation: "Write in standard form" },
                  { expression: "y = x^2", explanation: "Related function" },
                  { expression: "Vertex at (0, 0)", explanation: "The parabola touches x-axis at origin" },
                  { expression: "Solution: x = 0", explanation: "One repeated root" },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 5,
        title: "Worked Example 2",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Example 2: Two Real Solutions\n\nSolve $x^2 - 4 = 0$ by graphing.\n\n**Step 1**: $f(x) = x^2 - 4$\n**Step 2**: Graph $y = x^2 - 4$\n**Step 3**: The parabola crosses the x-axis at $x = -2$ and $x = 2$",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "graphing",
                equation: "x^2 - 4 = 0",
                steps: [
                  { expression: "x^2 - 4 = 0", explanation: "Write in standard form" },
                  { expression: "y = x^2 - 4", explanation: "Related function" },
                  { expression: "y = (x+2)(x-2)", explanation: "Factor to find intercepts" },
                  { expression: "x = -2 or x = 2", explanation: "Two x-intercepts" },
                  { expression: "Solutions: x = -2, 2", explanation: "Two real solutions" },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 6,
        title: "Worked Example 3",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Example 3: Estimate Roots from a Graph\n\nWhen the intercepts aren't integers, we estimate from the graph.\n\nFor $x^2 - 2x - 3 = 0$, the graph shows intercepts at approximately $x = -1$ and $x = 3$.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "graphing-explorer",
              props: {
                variant: "find_zeros",
                equation: "y = x^2 - 2x - 3",
                title: "Estimate Zeros Graphically",
              },
            },
          },
        ],
      },
      {
        phaseNumber: 7,
        title: "Worked Example 4",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Example 4: Using a Table to Confirm\n\nUse the TABLE feature on your calculator to confirm the zeros.\n\nFor $y = x^2 - 2x - 3$, check values near your estimated zeros.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "graphing",
                equation: "x^2 - 2x - 3 = 0",
                steps: [
                  { expression: "f(-1) = (-1)^2 - 2(-1) - 3 = 0", explanation: "Check x = -1" },
                  { expression: "f(3) = 3^2 - 2(3) - 3 = 0", explanation: "Check x = 3" },
                  { expression: "Solutions confirmed: x = -1, 3", explanation: "Zeros verified" },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 8,
        title: "Worked Example 5",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Example 5: Solve by Using a Calculator\n\nUse a graphing calculator to solve a quadratic equation when exact intercepts are difficult to read.\n\n**Step 1**: Enter the related function.\n\n**Step 2**: Graph the function and locate where it crosses the x-axis.\n\n**Step 3**: Use the calculator's zero feature to approximate each solution.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "graphing-explorer",
              props: {
                variant: "find_zeros",
                equation: "y = x^2 - 3x - 1",
                title: "Use Technology to Approximate Zeros",
              },
            },
          },
        ],
      },
      {
        phaseNumber: 9,
        title: "Discourse",
        phaseType: "discourse" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Discussion Questions\n\n1. Why is it called \"solving by graphing\"?\n2. When might graphing be preferable to factoring?\n3. What does it mean when a quadratic has \"no real solutions\"?\n4. How can you check your graphical solution?",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "comprehension-quiz",
              props: {
                questions: [
                  {
                    question: "The x-intercepts of y = f(x) are also called:",
                    options: ["the zeros", "the vertex", "the axis", "the domain"],
                    correctIndex: 0,
                  },
                  {
                    question: "A parabola that doesn't cross the x-axis has:",
                    options: ["two real solutions", "one real solution", "no real solutions", "infinitely many solutions"],
                    correctIndex: 2,
                  },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 10,
        title: "Reflection",
        phaseType: "reflection" as const,
        estimatedMinutes: 5,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Reflection\n\nToday you learned to solve quadratic equations by finding x-intercepts on a graph.\n\n- What did you find challenging about reading solutions from a graph?\n- How does the discriminant (from the quadratic formula) relate to the number of x-intercepts?\n- When might you prefer algebraic methods over graphing?",
            },
          },
        ],
      },
    ];

    let phasesCreated = 0;
    let activitiesCreated = 0;

    for (const phase of phaseData) {
      const existingPhase = await ctx.db
        .query("phase_versions")
        .withIndex("by_lesson_version_and_phase", (q) =>
          q.eq("lessonVersionId", lessonVersionId).eq("phaseNumber", phase.phaseNumber)
        )
        .first();

      if (existingPhase) continue;

      const phaseId = await ctx.db.insert("phase_versions", {
        lessonVersionId,
        phaseNumber: phase.phaseNumber,
        title: phase.title,
        estimatedMinutes: phase.estimatedMinutes,
        phaseType: phase.phaseType,
        createdAt: now,
      });

      phasesCreated++;

      for (const section of phase.sections) {
        if (section.sectionType === "activity") {
          const activityContent = section.content as SeedActivityContent;

          const insertedActivityId = await ctx.db.insert("activities", {
            componentKey: activityContent.componentKey,
            displayName: `${phase.title} - ${activityContent.componentKey}`,
            description: `Activity for ${phase.title}`,
            props: normalizeSeedProps(activityContent.componentKey, activityContent.props) as never,
            gradingConfig: { autoGrade: true, partialCredit: true },
            createdAt: now,
            updatedAt: now,
          });

          activitiesCreated++;

          await ctx.db.insert("phase_sections", {
            phaseVersionId: phaseId,
            sequenceOrder: section.sequenceOrder,
            sectionType: section.sectionType,
            content: {
              ...activityContent,
              activityId: insertedActivityId,
            },
            createdAt: now,
          });
        } else {
          await ctx.db.insert("phase_sections", {
            phaseVersionId: phaseId,
            sequenceOrder: section.sequenceOrder,
            sectionType: section.sectionType,
            content: section.content,
            createdAt: now,
          });
        }
      }
    }

    const oneRealSolutionWorkedActivityId = await upsertIm3OneRealSolutionWorkedActivity(ctx, now);
    await linkIm3OneRealSolutionWorkedPhase(ctx, lessonVersionId, oneRealSolutionWorkedActivityId);
    const oneRealSolutionGuidedActivityId = await upsertIm3OneRealSolutionGuidedActivity(ctx, now);
    await upsertIm3OneRealSolutionGuidedVariant(ctx, now);
    await upsertIm3OneRealSolutionGuidedPracticeItem(ctx, oneRealSolutionGuidedActivityId, now);
    const oneRealSolutionIndependentActivityId = await upsertIm3OneRealSolutionIndependentActivity(ctx, now);
    await upsertIm3OneRealSolutionIndependentVariant(ctx, now);
    await upsertIm3OneRealSolutionIndependentPracticeItem(ctx, oneRealSolutionIndependentActivityId, now);
    const twoRealSolutionsWorkedActivityId = await upsertIm3TwoRealSolutionsWorkedActivity(ctx, now);
    await linkIm3TwoRealSolutionsWorkedPhase(ctx, lessonVersionId, twoRealSolutionsWorkedActivityId);
    const twoRealSolutionsGuidedActivityId = await upsertIm3TwoRealSolutionsGuidedActivity(ctx, now);
    await upsertIm3TwoRealSolutionsGuidedVariant(ctx, now);
    await upsertIm3TwoRealSolutionsGuidedPracticeItem(ctx, twoRealSolutionsGuidedActivityId, now);
    const twoRealSolutionsIndependentActivityId = await upsertIm3TwoRealSolutionsIndependentActivity(ctx, now);
    await upsertIm3TwoRealSolutionsIndependentVariant(ctx, now);
    await upsertIm3TwoRealSolutionsIndependentPracticeItem(ctx, twoRealSolutionsIndependentActivityId, now);

    return {
      lessonId,
      lessonVersionId,
      phasesCreated,
      activitiesCreated,
    };
  },
});
