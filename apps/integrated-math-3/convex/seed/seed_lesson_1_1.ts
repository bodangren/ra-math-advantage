import { normalizeSeedProps } from '../../lib/activities/seed-props';
import nodesDocument from '../../curriculum/skill-graph/nodes.json';
import blueprintsDocument from '../../curriculum/skill-graph/blueprints.json';
import { internalMutation, type MutationCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import { v } from "convex/values";
import { practiceItemSchema } from "@math-platform/practice-core";
import { getGenerator } from "@math-platform/math-content/knowledge-space";
import type {
  ComprehensionQuizProps,
  GraphingExplorerSchemaProps,
  RateOfChangeCalculatorProps,
  StepByStepSolverProps,
} from "@math-platform/math-content";
import {
  fillInTheBlankSchema,
  graphingExplorerSchema,
  rateOfChangeCalculatorSchema,
} from "@math-platform/math-content";
import type { SeedActivityContent } from "./types";
import {
  IM3_GUIDED_PRACTICE_ACTIVITY_ID,
  IM3_GUIDED_VARIANT_KEY,
  IM3_GRAPH_GUIDED_SEED_2_ACTIVITY_ID,
  IM3_GRAPH_GUIDED_SEED_2_VARIANT_KEY,
  IM3_GRAPH_INDEPENDENT_SEED_2_ACTIVITY_ID,
  IM3_GRAPH_INDEPENDENT_SEED_2_VARIANT_KEY,
  IM3_DOMAIN_RANGE_GUIDED_SEED_2_ACTIVITY_ID,
  IM3_DOMAIN_RANGE_GUIDED_SEED_2_VARIANT_KEY,
  IM3_DOMAIN_RANGE_INDEPENDENT_SEED_2_ACTIVITY_ID,
  IM3_DOMAIN_RANGE_INDEPENDENT_SEED_2_VARIANT_KEY,
  IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID,
  IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID,
  IM3_MAXIMUM_READING_NODE,
  IM3_MAXIMUM_READING_WORKED_ACTIVITY_ID,
  IM3_SYMMETRY_GUIDED_ACTIVITY_ID,
  IM3_SYMMETRY_INDEPENDENT_ACTIVITY_ID,
  IM3_SYMMETRY_NODE,
  IM3_SYMMETRY_WORKED_ACTIVITY_ID,
  IM3_COMPARE_MAXIMUM_NODE,
  IM3_COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID,
  IM3_COMPARE_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
  IM3_COMPARE_MAXIMUM_WORKED_ACTIVITY_ID,
  IM3_EQUATION_RATE_GUIDED_ACTIVITY_ID,
  IM3_EQUATION_RATE_INDEPENDENT_ACTIVITY_ID,
  IM3_EQUATION_RATE_NODE,
  IM3_EQUATION_RATE_WORKED_ACTIVITY_ID,
  IM3_MASTERY_ADVANTAGE_ACTIVITY_ID,
  IM3_PILOT_NODE,
  IM3_PILOT_VARIANT_KEY,
  IM3_PROFIT_MODEL_GUIDED_ACTIVITY_ID,
  IM3_PROFIT_MODEL_INDEPENDENT_ACTIVITY_ID,
  IM3_PROFIT_MODEL_NODE,
  IM3_PROFIT_MODEL_WORKED_ACTIVITY_ID,
  IM3_PROFIT_MAXIMUM_GUIDED_ACTIVITY_ID,
  IM3_PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
  IM3_PROFIT_MAXIMUM_NODE,
  IM3_PROFIT_MAXIMUM_WORKED_ACTIVITY_ID,
  IM3_TEACHER_LED_ACTIVITY_ID,
} from "../../lib/practice/learning-evidence-pilot";

export const IM3_TEACHER_LED_ACTIVITY_METADATA = Object.freeze({
  stableActivityId: IM3_TEACHER_LED_ACTIVITY_ID,
  masteryNodeId: IM3_PILOT_NODE,
  componentKey: "graphing-explorer" as const,
  learningEvidenceMode: "worked_example" as const,
  srsEligible: false as const,
});

export interface Im3PilotPublicationGate {
  nodeReviewStatus: "draft" | "reviewed" | "approved" | "rejected";
  blueprintReviewStatus: "draft" | "reviewed" | "approved" | "rejected";
}

function parseReviewStatus(value: string | undefined): Im3PilotPublicationGate["nodeReviewStatus"] {
  return value === "reviewed" || value === "approved" || value === "rejected"
    ? value
    : "draft";
}

const CURRENT_IM3_PILOT_PUBLICATION = Object.freeze({
  nodeReviewStatus: parseReviewStatus(
    nodesDocument.nodes.find((node) => node.id === IM3_PILOT_NODE)?.reviewStatus,
  ),
  blueprintReviewStatus: parseReviewStatus(blueprintsDocument.blueprints.find((blueprint) => (
    blueprint.nodeId === IM3_PILOT_NODE
  ))?.reviewStatus),
} satisfies Im3PilotPublicationGate);

function isIm3PilotPublished(gate: Im3PilotPublicationGate): boolean {
  return gate.nodeReviewStatus === "approved"
    && gate.blueprintReviewStatus === "approved";
}

export const IM3_PHASE_FOUR_WORKED_PROPS = Object.freeze({
  problemType: "graphing" as const,
  equation: "f(x) = x^2",
  steps: [
    {
      id: "phase-4-x-negative-2",
      description: "Choose x = -2.",
      expression: "x = -2",
      explanation: "Evaluate at x = -2",
    },
    {
      id: "phase-4-f-negative-2",
      description: "Substitute x = -2.",
      expression: "f(-2) = (-2)^2 = 4",
      explanation: "Calculate f(-2)",
    },
    {
      id: "phase-4-x-negative-1",
      description: "Choose x = -1.",
      expression: "x = -1",
      explanation: "Evaluate at x = -1",
    },
    {
      id: "phase-4-f-negative-1",
      description: "Substitute x = -1.",
      expression: "f(-1) = (-1)^2 = 1",
      explanation: "Calculate f(-1)",
    },
    {
      id: "phase-4-x-zero",
      description: "Choose x = 0.",
      expression: "x = 0",
      explanation: "Evaluate at x = 0",
    },
    {
      id: "phase-4-f-zero",
      description: "Substitute x = 0.",
      expression: "f(0) = 0^2 = 0",
      explanation: "Calculate f(0) — the vertex",
    },
    {
      id: "phase-4-x-one",
      description: "Choose x = 1.",
      expression: "x = 1",
      explanation: "Evaluate at x = 1",
    },
    {
      id: "phase-4-f-one",
      description: "Substitute x = 1.",
      expression: "f(1) = 1^2 = 1",
      explanation: "Calculate f(1)",
    },
    {
      id: "phase-4-x-two",
      description: "Choose x = 2.",
      expression: "x = 2",
      explanation: "Evaluate at x = 2",
    },
    {
      id: "phase-4-f-two",
      description: "Substitute x = 2.",
      expression: "f(2) = 2^2 = 4",
      explanation: "Calculate f(2)",
    },
  ],
} satisfies StepByStepSolverProps);

export const IM3_PHASE_FIVE_WORKED_PROPS = Object.freeze({
  problemType: "graphing" as const,
  equation: "g(x) = 2x^2",
  steps: [
    {
      id: "phase-5-base-parabola",
      description: "Start with the base parabola.",
      expression: "f(x) = x^2 (base parabola)",
      explanation: "Original function",
    },
    {
      id: "phase-5-vertical-stretch",
      description: "Write the transformed function.",
      expression: "g(x) = 2x^2",
      explanation: "Vertical stretch by factor of 2",
    },
    {
      id: "phase-5-vertex",
      description: "Identify the unchanged vertex.",
      expression: "Vertex remains at (0, 0)",
      explanation: "The vertex doesn't change",
    },
    {
      id: "phase-5-point-distance",
      description: "Compare distances from the vertex.",
      expression: "Points are twice as far from vertex",
      explanation: "f(1) = 1, g(1) = 2",
    },
    {
      id: "phase-5-narrower-parabola",
      description: "Describe the transformed parabola.",
      expression: "Parabola is narrower",
      explanation: "a > 1 causes vertical stretch",
    },
  ],
} satisfies StepByStepSolverProps);

export const IM3_PHASE_SIX_WORKED_PROPS = Object.freeze({
  problemType: "graphing" as const,
  equation: "h(t) = -16t^2 + 80t + 4",
  steps: [
    {
      id: "phase-6-write-function",
      description: "Write the function.",
      expression: "h(t) = -16t^2 + 80t + 4",
      explanation: "Write the function",
    },
    {
      id: "phase-6-identify-coefficients",
      description: "Identify a and b.",
      expression: "a = -16, b = 80",
      explanation: "Identify coefficients",
    },
    {
      id: "phase-6-find-axis",
      description: "Find the time of the vertex.",
      expression: "t = -b/(2a) = -80/(2·-16) = 80/32 = 2.5",
      explanation: "Find the axis of symmetry",
    },
    {
      id: "phase-6-substitute-time",
      description: "Substitute t = 2.5.",
      expression: "h(2.5) = -16(2.5)^2 + 80(2.5) + 4",
      explanation: "Substitute to find maximum height",
    },
    {
      id: "phase-6-calculate-height",
      description: "Calculate the height.",
      expression: "h(2.5) = -100 + 200 + 4 = 104",
      explanation: "Calculate maximum height",
    },
    {
      id: "phase-6-state-maximum",
      description: "State the maximum height and time.",
      expression: "Maximum height: 104 feet at t = 2.5 seconds",
      explanation: "Interpret the result",
    },
  ],
} satisfies StepByStepSolverProps);

export const IM3_PHASE_EIGHT_WORKED_PROPS = Object.freeze({
  problemType: "rate_of_change" as const,
  equation: "f(x) = x^2 + 3x - 4",
  steps: [
    {
      id: "phase-8-evaluate-start",
      description: "Evaluate at x = 1.",
      expression: "f(1) = 1^2 + 3(1) - 4 = 0",
      explanation: "Evaluate at x = 1",
    },
    {
      id: "phase-8-evaluate-end",
      description: "Evaluate at x = 3.",
      expression: "f(3) = 3^2 + 3(3) - 4 = 14",
      explanation: "Evaluate at x = 3",
    },
    {
      id: "phase-8-use-formula",
      description: "Use the average-rate formula.",
      expression: "Average rate of change = [f(3) - f(1)] / (3 - 1)",
      explanation: "Use the formula",
    },
    {
      id: "phase-8-calculate-rate",
      description: "Calculate the rate.",
      expression: "= (14 - 0) / 2 = 7",
      explanation: "Calculate the result",
    },
    {
      id: "phase-8-interpret-rate",
      description: "Interpret the result.",
      expression: "The function increases by 7 units per unit increase in x",
      explanation: "Interpret the result",
    },
  ],
} satisfies StepByStepSolverProps);

export const IM3_PHASE_NINE_WORKED_PROPS = Object.freeze({
  problemType: "rate_of_change" as const,
  equation: "(table data)",
  steps: [
    {
      id: "phase-9-identify-table-values",
      description: "Identify the table values.",
      expression: "f(5) = 28, f(2) = 7",
      explanation: "Identify values from table",
    },
    {
      id: "phase-9-apply-formula",
      description: "Apply the average-rate formula.",
      expression: "Average rate of change = [28 - 7] / [5 - 2]",
      explanation: "Apply the formula",
    },
    {
      id: "phase-9-calculate-result",
      description: "Calculate the average rate.",
      expression: "= 21 / 3 = 7",
      explanation: "Calculate",
    },
    {
      id: "phase-9-interpret-result",
      description: "Interpret the average rate.",
      expression: "The function increases by 7 units for each unit of x",
      explanation: "Interpretation",
    },
  ],
} satisfies StepByStepSolverProps);

export const IM3_PHASE_ELEVEN_QUIZ_PROPS = Object.freeze({
  questions: [
    {
      id: "phase-11-parabola-width",
      type: "multiple_choice" as const,
      prompt: "If $a > 1$ in $f(x) = ax^2$, the parabola becomes:",
      options: ["Wider", "Narrower", "Shifts up", "Shifts down"],
      correctAnswer: "Narrower",
      explanation: "A value of a greater than 1 makes the parabola narrower.",
    },
    {
      id: "phase-11-vertex-form",
      type: "multiple_choice" as const,
      prompt: "The vertex of $f(x) = (x-3)^2 + 5$ is:",
      options: ["(3, 5)", "(-3, 5)", "(3, -5)", "(-3, -5)"],
      correctAnswer: "(3, 5)",
      explanation: "In vertex form, the vertex is (h, k).",
    },
  ],
} satisfies ComprehensionQuizProps);

const IM3_SELECTED_WORKED_MARKDOWN = "## Example 1: Graph $f(x) = x^2$ Using a Table\n\nLet's graph $f(x) = x^2$ by creating a table of values.";

const IM3_SELECTED_ORIGINAL_WORKED_PROPS = normalizeSeedProps("step-by-step-solver", IM3_PHASE_FOUR_WORKED_PROPS);

function serializeSelectedSeedContent(value: unknown): string {
  return JSON.stringify(value, (_key, entry) => (
    entry !== null && typeof entry === "object" && !Array.isArray(entry)
      ? Object.fromEntries(Object.keys(entry).sort().map((key) => [key, entry[key]]))
      : entry
  ));
}

function buildGeneratedPilotActivity(stableActivityId: string, seed: number, displayName: string) {
  const generated = getGenerator("quadratic-graph-analysis").generate({
    nodeId: IM3_PILOT_NODE,
    seed,
    difficulty: 0.5,
  });
  const rendererProps = generated.data.rendererProps;
  if (!rendererProps || typeof rendererProps !== "object" || Array.isArray(rendererProps)) {
    throw new Error("Quadratic graph-analysis generator returned invalid renderer props");
  }
  const partIds = Object.keys(generated.expectedAnswer);
  return {
    componentKey: "graphing-explorer" as const,
    displayName,
    description: "Complete the table and plot the points for the IM3 graph pilot.",
    props: rendererProps as GraphingExplorerSchemaProps,
    gradingConfig: {
      autoGrade: true,
      partialCredit: true,
      passingScore: 2,
      partIds,
      rubric: partIds.map((partId) => ({
        criteria: `Correct ${partId}`,
        partId,
        points: generated.gradingMetadata.partMaxScores[partId],
      })),
    },
    stableActivityId,
    masteryNodeId: IM3_PILOT_NODE,
    approval: { status: "unreviewed" as const },
    srsEligible: false,
  };
}

export function buildIm3WorkedPilotSeedDocument(now: number) {
  return {
    componentKey: "graphing-explorer" as const,
    displayName: "Graph a quadratic function by using a table",
    description: "Graph f(x) = x^2 by using a table.",
    props: { variant: "plot_from_equation" as const, equation: "f(x) = x^2" },
    gradingConfig: { autoGrade: false, partialCredit: false },
    stableActivityId: IM3_TEACHER_LED_ACTIVITY_ID,
    masteryNodeId: IM3_PILOT_NODE,
    learningEvidenceMode: "worked_example" as const,
    approval: { status: "unreviewed" as const },
    srsEligible: false,
    createdAt: now,
    updatedAt: now,
  };
}

export function buildIm3PilotSeedDocuments(activityId: Id<"activities">, now: number) {
  const activity = { ...buildGeneratedPilotActivity(IM3_MASTERY_ADVANTAGE_ACTIVITY_ID, 0, "Mastery Advantage: Complete a quadratic table and plot the points"), createdAt: now, updatedAt: now };
  return {
    activity,
    variant: { variantKey: IM3_PILOT_VARIANT_KEY, legacyProblemFamilyId: IM3_PILOT_VARIANT_KEY, migrationVersion: "kst-srs.v3.2" as const, sourceTimestamp: now, componentKey: "graphing-explorer", displayName: "Graph quadratic functions", description: "The exact IM3 Mastery Advantage pilot variant.", objectiveIds: [IM3_PILOT_NODE], difficulty: "pilot", metadata: { pilot: true, stableActivityId: IM3_MASTERY_ADVANTAGE_ACTIVITY_ID } },
    item: { practiceItemId: `${IM3_PILOT_VARIANT_KEY}:pilot`, activityId, variantKey: IM3_PILOT_VARIANT_KEY, legacyProblemFamilyId: IM3_PILOT_VARIANT_KEY, migrationVersion: "kst-srs.v3.2" as const, sourceTimestamp: now, variantLabel: "Pilot A" },
  };
}

export function buildIm3GuidedPilotSeedDocuments(activityId: Id<"activities">, now: number) {
  const activity = { ...buildGeneratedPilotActivity(IM3_GUIDED_PRACTICE_ACTIVITY_ID, 1, "Guided graphing: Complete a quadratic table and plot the points"), createdAt: now, updatedAt: now };
  return {
    activity,
    variant: { variantKey: IM3_GUIDED_VARIANT_KEY, legacyProblemFamilyId: IM3_GUIDED_VARIANT_KEY, migrationVersion: "kst-srs.v3.2" as const, sourceTimestamp: now, componentKey: "graphing-explorer", displayName: "Guided graph quadratic functions", description: "Complete a quadratic table and plot the points.", objectiveIds: [IM3_PILOT_NODE], difficulty: "standard", metadata: { stableActivityId: IM3_GUIDED_PRACTICE_ACTIVITY_ID } },
    item: { practiceItemId: `${IM3_GUIDED_VARIANT_KEY}:seed-1`, activityId, variantKey: IM3_GUIDED_VARIANT_KEY, legacyProblemFamilyId: IM3_GUIDED_VARIANT_KEY, migrationVersion: "kst-srs.v3.2" as const, sourceTimestamp: now, variantLabel: "Seed 1" },
  };
}

type SelectedActivitySeedDocument =
  | ReturnType<typeof buildIm3WorkedPilotSeedDocument>
  | ReturnType<typeof buildIm3PilotSeedDocuments>["activity"]
  | ReturnType<typeof buildIm3GuidedPilotSeedDocuments>["activity"];

async function upsertSelectedActivity(
  ctx: MutationCtx,
  stableActivityId: string,
  document: SelectedActivitySeedDocument,
): Promise<Id<"activities">> {
  const existing = await ctx.db.query("activities")
    .withIndex("by_stable_activity_id", (query) => query.eq("stableActivityId", stableActivityId))
    .unique();
  if (!existing) return ctx.db.insert("activities", document);
  const reviewedContent = serializeSelectedSeedContent({
    componentKey: existing.componentKey,
    displayName: existing.displayName,
    description: existing.description,
    masteryNodeId: existing.masteryNodeId,
    stableActivityId: existing.stableActivityId,
    learningEvidenceMode: "learningEvidenceMode" in existing
      ? existing.learningEvidenceMode
      : undefined,
    props: existing.props,
    gradingConfig: existing.gradingConfig,
  });
  const nextContent = serializeSelectedSeedContent({
    componentKey: document.componentKey,
    displayName: document.displayName,
    description: document.description,
    masteryNodeId: document.masteryNodeId,
    stableActivityId: document.stableActivityId,
    learningEvidenceMode: "learningEvidenceMode" in document ? document.learningEvidenceMode : undefined,
    props: document.props,
    gradingConfig: document.gradingConfig,
  });
  if (existing.approval?.status === "approved" && reviewedContent !== nextContent) {
    throw new Error("Approved selected IM3 activity content changed");
  }
  const contentIsIdentical = reviewedContent === nextContent;
  await ctx.db.patch(existing._id, {
    ...document,
    approval: contentIsIdentical ? existing.approval ?? document.approval : document.approval,
    srsEligible: contentIsIdentical ? existing.srsEligible ?? document.srsEligible : false,
    createdAt: existing.createdAt,
  });
  return existing._id;
}

async function upsertSelectedPracticeDocuments(
  ctx: MutationCtx,
  documents:
    | ReturnType<typeof buildIm3PilotSeedDocuments>
    | ReturnType<typeof buildIm3GuidedPilotSeedDocuments>,
): Promise<void> {
  const variant = await ctx.db.query("practice_variants")
    .withIndex("by_variantKey", (query) => query.eq("variantKey", documents.variant.variantKey))
    .unique();
  if (variant) await ctx.db.patch(variant._id, documents.variant);
  else await ctx.db.insert("practice_variants", documents.variant);

  const byVariant = await ctx.db.query("practice_items")
    .withIndex("by_variantKey", (query) => query.eq("variantKey", documents.item.variantKey))
    .take(2);
  const byActivity = await ctx.db.query("practice_items")
    .withIndex("by_activityId", (query) => query.eq("activityId", documents.item.activityId))
    .take(2);
  const items = [...new Map([...byVariant, ...byActivity].map((row) => [String(row._id), row])).values()];
  if (
    items.length > 1
    || items.some((row) => (
      row.variantKey !== documents.item.variantKey
      || String(row.activityId) !== String(documents.item.activityId)
      || row.practiceItemId !== documents.item.practiceItemId
    ))
  ) throw new Error("Duplicate or conflicting selected IM3 practice-item mapping");
  if (items[0]) await ctx.db.patch(items[0]._id, documents.item);
  else await ctx.db.insert("practice_items", documents.item);
}

export async function upsertIm3SelectedPilotSeed(
  ctx: MutationCtx,
  lessonVersionId: Id<"lesson_versions">,
  now: number,
) {
  const lessonVersion = await ctx.db.get(lessonVersionId);
  const lesson = lessonVersion ? await ctx.db.get(lessonVersion.lessonId) : null;
  const lessonVersions = lesson ? await ctx.db.query("lesson_versions")
    .withIndex("by_lesson", (query) => query.eq("lessonId", lesson._id))
    .collect() : [];
  const publishedVersions = lessonVersions
    .filter((version) => version.status === "published")
    .sort((left, right) => right.version - left.version);
  if (
    !lessonVersion
    || lessonVersion.status !== "published"
    || !lesson
    || lesson.slug !== "module-1-lesson-1"
    || publishedVersions[0]?._id !== lessonVersionId
    || publishedVersions.filter((version) => version.version === lessonVersion.version).length !== 1
  ) {
    throw new Error("Selected IM3 lesson version is invalid");
  }
  const phases = await ctx.db.query("phase_versions")
    .withIndex("by_lesson_version_and_phase", (query) => (
      query.eq("lessonVersionId", lessonVersionId).eq("phaseNumber", 4)
    ))
    .collect();
  if (phases.length !== 1 || phases[0].phaseType !== "worked_example") {
    throw new Error("Lesson 1.1 Worked Phase 4 must be unique");
  }
  const phase = phases[0];
  const sections = await ctx.db.query("phase_sections")
    .withIndex("by_phase_version", (query) => query.eq("phaseVersionId", phase._id))
    .collect();
  const sourceSections = sections.filter((section) => section.sequenceOrder === 1);
  const activitySections = sections.filter((section) => section.sequenceOrder === 2);
  if (
    sourceSections.length !== 1
    || sourceSections[0].sectionType !== "text"
    || (sourceSections[0].content as { markdown?: unknown }).markdown !== IM3_SELECTED_WORKED_MARKDOWN
    || activitySections.length !== 1
    || activitySections[0].sectionType !== "activity"
  ) {
    throw new Error("Lesson 1.1 Worked Phase 4 source sections must be unique");
  }
  const currentSectionContent = activitySections[0].content as {
    activityId?: Id<"activities">;
    componentKey?: string;
    props?: { equation?: string };
  };
  const linkedActivity = currentSectionContent.activityId
    ? await ctx.db.get(currentSectionContent.activityId)
    : null;
  const isOriginalWorkedSection = currentSectionContent.componentKey === "step-by-step-solver"
    && linkedActivity?.componentKey === "step-by-step-solver"
    && serializeSelectedSeedContent(linkedActivity.props) === serializeSelectedSeedContent(IM3_SELECTED_ORIGINAL_WORKED_PROPS);
  const isCanonicalWorkedSection = currentSectionContent.componentKey === "graphing-explorer"
    && linkedActivity?.componentKey === "graphing-explorer"
    && linkedActivity.stableActivityId === IM3_TEACHER_LED_ACTIVITY_ID
    && linkedActivity.masteryNodeId === IM3_PILOT_NODE
    && linkedActivity.learningEvidenceMode === "worked_example"
    && serializeSelectedSeedContent(linkedActivity.props)
      === serializeSelectedSeedContent(buildIm3WorkedPilotSeedDocument(now).props);
  if (!isOriginalWorkedSection && !isCanonicalWorkedSection) {
    throw new Error("Lesson 1.1 Worked activity source is invalid");
  }
  const worked = buildIm3WorkedPilotSeedDocument(now);
  const workedActivityId = await upsertSelectedActivity(ctx, worked.stableActivityId, worked);

  const independentDraft = {
    ...buildGeneratedPilotActivity(IM3_MASTERY_ADVANTAGE_ACTIVITY_ID, 0, "Mastery Advantage: Complete a quadratic table and plot the points"),
    createdAt: now,
    updatedAt: now,
  };
  const independentActivityId = await upsertSelectedActivity(
    ctx,
    independentDraft.stableActivityId,
    independentDraft,
  );
  const independent = buildIm3PilotSeedDocuments(independentActivityId, now);
  await upsertSelectedPracticeDocuments(ctx, independent);

  const guidedDraft = {
    ...buildGeneratedPilotActivity(IM3_GUIDED_PRACTICE_ACTIVITY_ID, 1, "Guided graphing: Complete a quadratic table and plot the points"),
    createdAt: now,
    updatedAt: now,
  };
  const guidedActivityId = await upsertSelectedActivity(
    ctx,
    guidedDraft.stableActivityId,
    guidedDraft,
  );
  const guided = buildIm3GuidedPilotSeedDocuments(guidedActivityId, now);
  await upsertSelectedPracticeDocuments(ctx, guided);

  const activitySection = activitySections[0];
  await ctx.db.patch(activitySection._id, {
    content: { componentKey: "graphing-explorer", activityId: workedActivityId },
  });

  return { workedActivityId, guidedActivityId, independentActivityId };
}



export function buildIm3GraphGuidedSeed2Documents(
  activityId: Id<"activities">,
  now: number,
  publication: Im3PilotPublicationGate = CURRENT_IM3_PILOT_PUBLICATION,
) {
  const generated = getGenerator("quadratic-graph-analysis").generate({
    nodeId: IM3_PILOT_NODE,
    seed: 2,
    difficulty: 0.5,
  });
  const rendererProps = generated.data.rendererProps;
  if (!rendererProps || typeof rendererProps !== "object" || Array.isArray(rendererProps)) {
    throw new Error("Quadratic graph-analysis generator returned invalid renderer props");
  }
  const graphingRendererProps = rendererProps as GraphingExplorerSchemaProps;
  const partIds = Object.keys(generated.expectedAnswer);
  const rubric = partIds.map((partId) => ({
    criteria: `Correct ${partId}`,
    partId,
    points: generated.gradingMetadata.partMaxScores[partId],
  }));

  return {
    activity: {
      componentKey: "graphing-explorer" as const,
      displayName: "Guided graphing: Complete a quadratic table and plot the points",
      description: "Complete the table and plot the points for the quadratic.",
      props: graphingRendererProps,
      gradingConfig: {
        autoGrade: true,
        partialCredit: true,
        passingScore: 2,
        partIds,
        rubric,
      },
      stableActivityId: IM3_GRAPH_GUIDED_SEED_2_ACTIVITY_ID,
      masteryNodeId: IM3_PILOT_NODE,
      srsEligible: isIm3PilotPublished(publication),
      createdAt: now,
      updatedAt: now,
    },
    variant: {
      variantKey: IM3_GRAPH_GUIDED_SEED_2_VARIANT_KEY,
      legacyProblemFamilyId: IM3_GRAPH_GUIDED_SEED_2_VARIANT_KEY,
      migrationVersion: "kst-srs.v3.2" as const,
      sourceTimestamp: now,
      componentKey: "graphing-explorer",
      displayName: "Guided graph quadratic functions",
      description: "Complete a quadratic table and plot the points.",
      objectiveIds: [IM3_PILOT_NODE],
      difficulty: "standard",
      metadata: {
        stableActivityId: IM3_GRAPH_GUIDED_SEED_2_ACTIVITY_ID,
      },
    },
    item: {
      practiceItemId: IM3_GRAPH_GUIDED_SEED_2_VARIANT_KEY,
      activityId,
      variantKey: IM3_GRAPH_GUIDED_SEED_2_VARIANT_KEY,
      legacyProblemFamilyId: IM3_GRAPH_GUIDED_SEED_2_VARIANT_KEY,
      migrationVersion: "kst-srs.v3.2" as const,
      sourceTimestamp: now,
      variantLabel: "Seed 2",
    },
  };
}

export function buildIm3GraphIndependentSeed2Documents(
  activityId: Id<"activities">,
  now: number,
  publication: Im3PilotPublicationGate = CURRENT_IM3_PILOT_PUBLICATION,
) {
  const generated = getGenerator("quadratic-graph-analysis").generate({
    nodeId: IM3_PILOT_NODE,
    seed: 3,
    difficulty: 0.5,
  });
  const rendererProps = generated.data.rendererProps;
  if (!rendererProps || typeof rendererProps !== "object" || Array.isArray(rendererProps)) {
    throw new Error("Quadratic graph-analysis generator returned invalid renderer props");
  }
  const graphingRendererProps = rendererProps as GraphingExplorerSchemaProps;
  const partIds = Object.keys(generated.expectedAnswer);
  const rubric = partIds.map((partId) => ({
    criteria: `Correct ${partId}`,
    partId,
    points: generated.gradingMetadata.partMaxScores[partId],
  }));

  return {
    activity: {
      componentKey: "graphing-explorer" as const,
      displayName: "Mastery Advantage: Complete a quadratic table and plot the points",
      description: "Complete the table and plot the points for the quadratic.",
      props: graphingRendererProps,
      gradingConfig: {
        autoGrade: true,
        partialCredit: true,
        passingScore: 2,
        partIds,
        rubric,
      },
      stableActivityId: IM3_GRAPH_INDEPENDENT_SEED_2_ACTIVITY_ID,
      masteryNodeId: IM3_PILOT_NODE,
      srsEligible: isIm3PilotPublished(publication),
      createdAt: now,
      updatedAt: now,
    },
    variant: {
      variantKey: IM3_GRAPH_INDEPENDENT_SEED_2_VARIANT_KEY,
      legacyProblemFamilyId: IM3_GRAPH_INDEPENDENT_SEED_2_VARIANT_KEY,
      migrationVersion: "kst-srs.v3.2" as const,
      sourceTimestamp: now,
      componentKey: "graphing-explorer",
      displayName: "Graph quadratic functions",
      description: "Complete a quadratic table and plot the points.",
      objectiveIds: [IM3_PILOT_NODE],
      difficulty: "standard",
      metadata: {
        stableActivityId: IM3_GRAPH_INDEPENDENT_SEED_2_ACTIVITY_ID,
      },
    },
    item: {
      practiceItemId: IM3_GRAPH_INDEPENDENT_SEED_2_VARIANT_KEY,
      activityId,
      variantKey: IM3_GRAPH_INDEPENDENT_SEED_2_VARIANT_KEY,
      legacyProblemFamilyId: IM3_GRAPH_INDEPENDENT_SEED_2_VARIANT_KEY,
      migrationVersion: "kst-srs.v3.2" as const,
      sourceTimestamp: now,
      variantLabel: "Seed 2",
    },
  };
}

const IM3_EQUATION_RATE_GENERATOR_KEY = "average-rate-of-change" as const;
const IM3_DOMAIN_RANGE_NODE = "math.im3.skill.1.1.state-the-domain-and-range-of-a-quadratic-from-its-graph" as const;
const IM3_DOMAIN_RANGE_WORKED_ACTIVITY_ID = `${IM3_DOMAIN_RANGE_NODE}.worked_example` as const;
const IM3_DOMAIN_RANGE_GUIDED_ACTIVITY_ID = `${IM3_DOMAIN_RANGE_NODE}.guided_practice` as const;
const IM3_DOMAIN_RANGE_INDEPENDENT_ACTIVITY_ID = `${IM3_DOMAIN_RANGE_NODE}.independent_practice` as const;

export function buildIm3EquationRateWorkedSeedDocument(now: number) {
  const props: RateOfChangeCalculatorProps = rateOfChangeCalculatorSchema.parse({
    sourceType: "function",
    data: { expression: "f(x) = -x^2 + 2x - 1" },
    interval: { start: -4, end: 4 },
  });

  return {
    componentKey: "rate-of-change-calculator" as const,
    displayName: "Calculate average rate of change from an equation",
    description: "Worked Example 4: Calculate average rate of change from an equation.",
    props,
    gradingConfig: {
      autoGrade: true,
      passingScore: 7,
      partialCredit: true,
      partIds: ["f_a", "f_b", "rate"],
      rubric: [
        { criteria: "Correct f_a", partId: "f_a", points: 2 },
        { criteria: "Correct f_b", partId: "f_b", points: 2 },
        { criteria: "Correct rate", partId: "rate", points: 3 },
      ],
    },
    stableActivityId: IM3_EQUATION_RATE_WORKED_ACTIVITY_ID,
    masteryNodeId: IM3_EQUATION_RATE_NODE,
    learningEvidenceMode: "worked_example" as const,
    srsEligible: false as const,
    createdAt: now,
    updatedAt: now,
  };
}

export async function upsertIm3EquationRateWorkedActivity(
  ctx: MutationCtx,
  now: number,
): Promise<Id<"activities">> {
  const existingActivity = await ctx.db
    .query("activities")
    .withIndex("by_stable_activity_id", (q) => (
      q.eq("stableActivityId", IM3_EQUATION_RATE_WORKED_ACTIVITY_ID)
    ))
    .unique();
  const activity = buildIm3EquationRateWorkedSeedDocument(now);

  if (existingActivity) {
    await ctx.db.patch(existingActivity._id, {
      ...activity,
      createdAt: existingActivity.createdAt,
    });
    return existingActivity._id;
  }

  return await ctx.db.insert("activities", activity);
}

export function buildIm3DomainRangeWorkedSeedDocument(now: number) {
  const props: GraphingExplorerSchemaProps = graphingExplorerSchema.parse({
    equation: "f(x) = x^2 + 2x - 3",
    variant: "plot_from_equation",
    responseVariant: "domain_range",
    domain: [-5, 5],
    range: [-10, 10],
  });

  return {
    componentKey: "graphing-explorer" as const,
    displayName: "Graph a quadratic function by using a table",
    description: "Graph f(x) = x^2 + 2x - 3 by using a table. State the domain and range.",
    props,
    gradingConfig: {
      autoGrade: true,
      passingScore: 2,
      partialCredit: true,
      partIds: ["domain", "range"],
      rubric: [
        { criteria: "Correct domain", partId: "domain", points: 1 },
        { criteria: "Correct range", partId: "range", points: 1 },
      ],
    },
    stableActivityId: IM3_DOMAIN_RANGE_WORKED_ACTIVITY_ID,
    masteryNodeId: IM3_DOMAIN_RANGE_NODE,
    learningEvidenceMode: "worked_example" as const,
    srsEligible: false as const,
    createdAt: now,
    updatedAt: now,
  };
}

export function buildIm3DomainRangeGuidedSeedDocuments(
  activityId: Id<"activities">,
  now: number,
) {
  const generated = getGenerator("quadratic-graph-analysis").generate({
    nodeId: IM3_DOMAIN_RANGE_NODE,
    seed: 1,
    difficulty: 0.5,
  });
  const props: GraphingExplorerSchemaProps = graphingExplorerSchema.parse(
    generated.data.rendererProps,
  );
  const partIds = Object.keys(generated.expectedAnswer);
  const rubric = partIds.map((partId) => ({
    criteria: `Correct ${partId}`,
    partId,
    points: generated.gradingMetadata.partMaxScores[partId],
  }));

  return {
    activity: {
      componentKey: "graphing-explorer" as const,
      displayName: "Guided domain and range from a quadratic graph",
      description: "Use the graph of a quadratic function to state its domain and range.",
      props,
      gradingConfig: {
        autoGrade: true,
        passingScore: 2,
        partialCredit: true,
        partIds,
        rubric,
      },
      stableActivityId: IM3_DOMAIN_RANGE_GUIDED_ACTIVITY_ID,
      masteryNodeId: IM3_DOMAIN_RANGE_NODE,
      srsEligible: true,
      createdAt: now,
      updatedAt: now,
    },
    variant: {
      variantKey: IM3_DOMAIN_RANGE_GUIDED_ACTIVITY_ID,
      legacyProblemFamilyId: IM3_DOMAIN_RANGE_GUIDED_ACTIVITY_ID,
      migrationVersion: "kst-srs.v3.2" as const,
      sourceTimestamp: now,
      componentKey: "graphing-explorer" as const,
      displayName: "Guided domain and range from a quadratic graph",
      description: "Use the graph to state the domain and range of the quadratic.",
      objectiveIds: [IM3_DOMAIN_RANGE_NODE],
      difficulty: "standard" as const,
      metadata: {
        stableActivityId: IM3_DOMAIN_RANGE_GUIDED_ACTIVITY_ID,
      },
    },
    item: {
      practiceItemId: `${IM3_DOMAIN_RANGE_GUIDED_ACTIVITY_ID}:seed-1`,
      activityId,
      variantKey: IM3_DOMAIN_RANGE_GUIDED_ACTIVITY_ID,
      legacyProblemFamilyId: IM3_DOMAIN_RANGE_GUIDED_ACTIVITY_ID,
      migrationVersion: "kst-srs.v3.2" as const,
      sourceTimestamp: now,
      variantLabel: "Seed 1",
    },
  };
}

export function buildIm3DomainRangeGuidedSeed2Documents(
  activityId: Id<"activities">,
  now: number,
) {
  const generated = getGenerator("quadratic-graph-analysis").generate({
    nodeId: IM3_DOMAIN_RANGE_NODE,
    seed: 2,
    difficulty: 0.5,
  });
  const props: GraphingExplorerSchemaProps = graphingExplorerSchema.parse(
    generated.data.rendererProps,
  );
  const partIds = Object.keys(generated.expectedAnswer);
  const rubric = partIds.map((partId) => ({
    criteria: `Correct ${partId}`,
    partId,
    points: generated.gradingMetadata.partMaxScores[partId],
  }));

  return {
    activity: {
      componentKey: "graphing-explorer" as const,
      displayName: "Guided domain and range from a quadratic graph",
      description: "Use the graph of a quadratic function to state its domain and range.",
      props,
      gradingConfig: {
        autoGrade: true,
        passingScore: 2,
        partialCredit: true,
        partIds,
        rubric,
      },
      stableActivityId: IM3_DOMAIN_RANGE_GUIDED_SEED_2_ACTIVITY_ID,
      masteryNodeId: IM3_DOMAIN_RANGE_NODE,
      srsEligible: true,
      createdAt: now,
      updatedAt: now,
    },
    variant: {
      variantKey: IM3_DOMAIN_RANGE_GUIDED_SEED_2_VARIANT_KEY,
      legacyProblemFamilyId: IM3_DOMAIN_RANGE_GUIDED_SEED_2_VARIANT_KEY,
      migrationVersion: "kst-srs.v3.2" as const,
      sourceTimestamp: now,
      componentKey: "graphing-explorer" as const,
      displayName: "Guided domain and range from a quadratic graph",
      description: "Use the graph to state the domain and range of the quadratic.",
      objectiveIds: [IM3_DOMAIN_RANGE_NODE],
      difficulty: "standard" as const,
      metadata: {
        stableActivityId: IM3_DOMAIN_RANGE_GUIDED_SEED_2_ACTIVITY_ID,
      },
    },
    item: {
      practiceItemId: IM3_DOMAIN_RANGE_GUIDED_SEED_2_VARIANT_KEY,
      activityId,
      variantKey: IM3_DOMAIN_RANGE_GUIDED_SEED_2_VARIANT_KEY,
      legacyProblemFamilyId: IM3_DOMAIN_RANGE_GUIDED_SEED_2_VARIANT_KEY,
      migrationVersion: "kst-srs.v3.2" as const,
      sourceTimestamp: now,
      variantLabel: "Seed 2",
    },
  };
}

export function buildIm3DomainRangeIndependentSeedDocuments(
  activityId: Id<"activities">,
  now: number,
) {
  const generated = getGenerator("quadratic-graph-analysis").generate({
    nodeId: IM3_DOMAIN_RANGE_NODE,
    seed: 0,
    difficulty: 0.5,
  });
  const props: GraphingExplorerSchemaProps = graphingExplorerSchema.parse(
    generated.data.rendererProps,
  );
  const partIds = Object.keys(generated.expectedAnswer);
  const rubric = partIds.map((partId) => ({
    criteria: `Correct ${partId}`,
    partId,
    points: generated.gradingMetadata.partMaxScores[partId],
  }));

  return {
    activity: {
      componentKey: "graphing-explorer" as const,
      displayName: "Independent domain and range from a quadratic graph",
      description: "Independent practice for domain and range from a quadratic graph.",
      props,
      gradingConfig: {
        autoGrade: true,
        passingScore: 2,
        partialCredit: true,
        partIds,
        rubric,
      },
      stableActivityId: IM3_DOMAIN_RANGE_INDEPENDENT_ACTIVITY_ID,
      masteryNodeId: IM3_DOMAIN_RANGE_NODE,
      srsEligible: true,
      createdAt: now,
      updatedAt: now,
    },
    variant: {
      variantKey: IM3_DOMAIN_RANGE_INDEPENDENT_ACTIVITY_ID,
      legacyProblemFamilyId: IM3_DOMAIN_RANGE_INDEPENDENT_ACTIVITY_ID,
      migrationVersion: "kst-srs.v3.2" as const,
      sourceTimestamp: now,
      componentKey: "graphing-explorer" as const,
      displayName: "Independent domain and range from a quadratic graph",
      description: "Practice stating the domain and range of a quadratic.",
      objectiveIds: [IM3_DOMAIN_RANGE_NODE],
      difficulty: "standard" as const,
      metadata: {
        stableActivityId: IM3_DOMAIN_RANGE_INDEPENDENT_ACTIVITY_ID,
      },
    },
    item: {
      practiceItemId: `${IM3_DOMAIN_RANGE_INDEPENDENT_ACTIVITY_ID}:seed-0`,
      activityId,
      variantKey: IM3_DOMAIN_RANGE_INDEPENDENT_ACTIVITY_ID,
      legacyProblemFamilyId: IM3_DOMAIN_RANGE_INDEPENDENT_ACTIVITY_ID,
      migrationVersion: "kst-srs.v3.2" as const,
      sourceTimestamp: now,
      variantLabel: "Seed 0",
    },
  };
}

export function buildIm3DomainRangeIndependentSeed2Documents(
  activityId: Id<"activities">,
  now: number,
) {
  const generated = getGenerator("quadratic-graph-analysis").generate({
    nodeId: IM3_DOMAIN_RANGE_NODE,
    seed: 3,
    difficulty: 0.5,
  });
  const props: GraphingExplorerSchemaProps = graphingExplorerSchema.parse(
    generated.data.rendererProps,
  );
  const partIds = Object.keys(generated.expectedAnswer);
  const rubric = partIds.map((partId) => ({
    criteria: "Correct " + partId,
    partId,
    points: generated.gradingMetadata.partMaxScores[partId],
  }));

  return {
    activity: {
      componentKey: "graphing-explorer" as const,
      displayName: "Independent domain and range from a quadratic graph",
      description: "Independent practice for domain and range from a quadratic graph.",
      props,
      gradingConfig: {
        autoGrade: true,
        passingScore: 2,
        partialCredit: true,
        partIds,
        rubric,
      },
      stableActivityId: IM3_DOMAIN_RANGE_INDEPENDENT_SEED_2_ACTIVITY_ID,
      masteryNodeId: IM3_DOMAIN_RANGE_NODE,
      srsEligible: true,
      createdAt: now,
      updatedAt: now,
    },
    variant: {
      variantKey: IM3_DOMAIN_RANGE_INDEPENDENT_SEED_2_VARIANT_KEY,
      legacyProblemFamilyId: IM3_DOMAIN_RANGE_INDEPENDENT_SEED_2_VARIANT_KEY,
      migrationVersion: "kst-srs.v3.2" as const,
      sourceTimestamp: now,
      componentKey: "graphing-explorer" as const,
      displayName: "Independent domain and range from a quadratic graph",
      description: "Practice stating the domain and range of a quadratic.",
      objectiveIds: [IM3_DOMAIN_RANGE_NODE],
      difficulty: "standard" as const,
      metadata: {
        stableActivityId: IM3_DOMAIN_RANGE_INDEPENDENT_SEED_2_ACTIVITY_ID,
      },
    },
    item: {
      practiceItemId: IM3_DOMAIN_RANGE_INDEPENDENT_SEED_2_VARIANT_KEY,
      activityId,
      variantKey: IM3_DOMAIN_RANGE_INDEPENDENT_SEED_2_VARIANT_KEY,
      legacyProblemFamilyId: IM3_DOMAIN_RANGE_INDEPENDENT_SEED_2_VARIANT_KEY,
      migrationVersion: "kst-srs.v3.2" as const,
      sourceTimestamp: now,
      variantLabel: "Seed 2",
    },
  };
}

export function buildIm3MaximumReadingWorkedSeedDocument(now: number) {
  const props: GraphingExplorerSchemaProps = graphingExplorerSchema.parse({
    equation: "f(x) = -x^2 + 6x - 4",
    variant: "plot_from_equation",
    responseVariant: "maximum_value",
    domain: [-2, 8],
    range: [-3, 7],
  });

  return {
    componentKey: "graphing-explorer" as const,
    displayName: "Identify a quadratic maximum from its graph",
    description: "Worked Example 2: Identify the maximum value from the graph.",
    props,
    gradingConfig: {
      autoGrade: true,
      passingScore: 1,
      partialCredit: false,
      partIds: ["maximum_value"],
      rubric: [{
        criteria: "Identify the maximum value from the displayed graph.",
        partId: "maximum_value",
        points: 1,
      }],
    },
    stableActivityId: IM3_MAXIMUM_READING_WORKED_ACTIVITY_ID,
    masteryNodeId: IM3_MAXIMUM_READING_NODE,
    learningEvidenceMode: "worked_example" as const,
    srsEligible: false as const,
    createdAt: now,
    updatedAt: now,
  };
}

export function buildIm3MaximumReadingGuidedSeedDocuments(
  activityId: Id<"activities">,
  now: number,
) {
  const generated = getGenerator("quadratic-graph-analysis").generate({
    nodeId: IM3_MAXIMUM_READING_NODE,
    seed: 0,
    difficulty: 0.5,
  });
  const props: GraphingExplorerSchemaProps = graphingExplorerSchema.parse(
    generated.data.rendererProps,
  );
  const partIds = Object.keys(generated.expectedAnswer);
  const rubric = partIds.map((partId) => ({
    criteria: "Identify the maximum value from the displayed graph.",
    partId,
    points: generated.gradingMetadata.partMaxScores[partId],
  }));

  return {
    activity: {
      componentKey: "graphing-explorer" as const,
      displayName: "Guided maximum value from a quadratic graph",
      description: "Use the graph of a quadratic function to identify its maximum value.",
      props,
      gradingConfig: {
        autoGrade: true,
        passingScore: 1,
        partialCredit: false,
        partIds,
        rubric,
      },
      stableActivityId: IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID,
      masteryNodeId: IM3_MAXIMUM_READING_NODE,
      srsEligible: true as const,
      createdAt: now,
      updatedAt: now,
    },
    variant: {
      variantKey: IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID,
      legacyProblemFamilyId: IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID,
      migrationVersion: "kst-srs.v3.2" as const,
      sourceTimestamp: now,
      componentKey: "graphing-explorer" as const,
      displayName: "Guided maximum value from a quadratic graph",
      description: "Use the graph to identify the maximum value of the quadratic.",
      objectiveIds: [IM3_MAXIMUM_READING_NODE],
      difficulty: "standard" as const,
      metadata: { stableActivityId: IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID },
    },
    item: {
      practiceItemId: `${IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID}:seed-0`,
      activityId,
      variantKey: IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID,
      legacyProblemFamilyId: IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID,
      migrationVersion: "kst-srs.v3.2" as const,
      sourceTimestamp: now,
      variantLabel: "Seed 0",
    },
  };
}

export function buildIm3MaximumReadingIndependentSeedDocuments(
  activityId: Id<"activities">,
  now: number,
) {
  const generated = getGenerator("quadratic-graph-analysis").generate({
    nodeId: IM3_MAXIMUM_READING_NODE,
    seed: 34,
    difficulty: 0.5,
  });
  const props: GraphingExplorerSchemaProps = graphingExplorerSchema.parse(
    generated.data.rendererProps,
  );
  const partIds = Object.keys(generated.expectedAnswer);
  const rubric = partIds.map((partId) => ({
    criteria: "Identify the maximum value from the displayed graph.",
    partId,
    points: generated.gradingMetadata.partMaxScores[partId],
  }));

  return {
    activity: {
      componentKey: "graphing-explorer" as const,
      displayName: "Independent maximum value from a quadratic graph",
      description: "Independent practice for the maximum value from a quadratic graph.",
      props,
      gradingConfig: {
        autoGrade: true,
        passingScore: 1,
        partialCredit: false,
        partIds,
        rubric,
      },
      stableActivityId: IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID,
      masteryNodeId: IM3_MAXIMUM_READING_NODE,
      srsEligible: true as const,
      createdAt: now,
      updatedAt: now,
    },
    variant: {
      variantKey: IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID,
      legacyProblemFamilyId: IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID,
      migrationVersion: "kst-srs.v3.2" as const,
      sourceTimestamp: now,
      componentKey: "graphing-explorer" as const,
      displayName: "Independent maximum value from a quadratic graph",
      description: "Practice identifying the maximum value of a quadratic graph.",
      objectiveIds: [IM3_MAXIMUM_READING_NODE],
      difficulty: "standard" as const,
      metadata: { stableActivityId: IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID },
    },
    item: {
      practiceItemId: `${IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID}:seed-34`,
      activityId,
      variantKey: IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID,
      legacyProblemFamilyId: IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID,
      migrationVersion: "kst-srs.v3.2" as const,
      sourceTimestamp: now,
      variantLabel: "Seed 34",
    },
  };
}

export function buildIm3SymmetryWorkedSeedDocument(now: number) {
  const props: GraphingExplorerSchemaProps = graphingExplorerSchema.parse({
    equation: "g(x) = -3x^2 + 6x - 1",
    variant: "plot_from_equation",
    responseVariant: "symmetry_graph",
    vertex: [1, 2],
    yIntercept: [0, -1],
    domain: [-3, 5],
    range: [-10, 5],
  });

  return {
    componentKey: "graphing-explorer" as const,
    displayName: "Graph a quadratic from a vertex and y-intercept by using symmetry",
    description: "Graph a quadratic function from its vertex and y-intercept by using symmetry.",
    props,
    gradingConfig: {
      autoGrade: true,
      passingScore: 1,
      partialCredit: false,
      partIds: ["placed_points"],
      rubric: [{
        criteria: "Place the vertex, the y-intercept, and the reflected point.",
        partId: "placed_points",
        points: 1,
      }],
    },
    stableActivityId: IM3_SYMMETRY_WORKED_ACTIVITY_ID,
    masteryNodeId: IM3_SYMMETRY_NODE,
    learningEvidenceMode: "worked_example" as const,
    srsEligible: false as const,
    createdAt: now,
    updatedAt: now,
  };
}

export function buildIm3CompareMaximumWorkedSeedDocument(now: number) {
  const props: GraphingExplorerSchemaProps = graphingExplorerSchema.parse({
    equation: "y = -x^2 + 6x - 4",
    variant: "compare_functions",
    responseVariant: "compare_maximums",
    comparisonEquation: "y = -3x^2 + 6x - 1",
    comparisonQuestion: "The graph of f(x) is shown. Function g has a y-intercept of -1 and a vertex at (1, 2). Which function has the greater maximum value?",
    comparisonAnswer: "first",
    vertex: [1, 2],
    yIntercept: [0, -1],
    domain: [-2, 6],
    range: [-6, 8],
  });

  return {
    componentKey: "graphing-explorer" as const,
    displayName: "Compare maximum values of quadratic functions",
    description: "Worked Example 2: Compare the maximum values of two quadratic functions.",
    props,
    gradingConfig: {
      autoGrade: true,
      passingScore: 1,
      partialCredit: false,
      partIds: ["greater_maximum"],
      rubric: [{
        criteria: "Identify the function with the greater maximum.",
        partId: "greater_maximum",
        points: 1,
      }],
    },
    stableActivityId: IM3_COMPARE_MAXIMUM_WORKED_ACTIVITY_ID,
    masteryNodeId: IM3_COMPARE_MAXIMUM_NODE,
    learningEvidenceMode: "worked_example" as const,
    srsEligible: false as const,
    createdAt: now,
    updatedAt: now,
  };
}

export function buildIm3CompareMaximumGuidedSeedDocuments(
  activityId: Id<"activities">,
  now: number,
) {
  const generated = getGenerator("quadratic-graph-analysis").generate({
    nodeId: IM3_COMPARE_MAXIMUM_NODE,
    seed: 0,
    difficulty: 0.5,
  });
  const props = generated.data.rendererProps as GraphingExplorerSchemaProps;
  graphingExplorerSchema.parse(props);
  const partIds = Object.keys(generated.expectedAnswer);
  const rubric = partIds.map((partId) => ({
    criteria: "Identify the function with the greater maximum.",
    partId,
    points: generated.gradingMetadata.partMaxScores[partId],
  }));

  return {
    activity: {
      componentKey: "graphing-explorer" as const,
      displayName: "Guided comparison of quadratic maximum values",
      description: "Guided practice for comparing the maximum values of quadratic functions.",
      props,
      gradingConfig: {
        autoGrade: true,
        passingScore: 1,
        partialCredit: false,
        partIds,
        rubric,
      },
      stableActivityId: IM3_COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID,
      masteryNodeId: IM3_COMPARE_MAXIMUM_NODE,
      srsEligible: true as const,
      createdAt: now,
      updatedAt: now,
    },
    variant: {
      variantKey: IM3_COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID,
      legacyProblemFamilyId: IM3_COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID,
      migrationVersion: "kst-srs.v3.2" as const,
      sourceTimestamp: now,
      componentKey: "graphing-explorer" as const,
      displayName: "Guided comparison of quadratic maximum values",
      description: "Guided practice for comparing the maximum values of quadratic functions.",
      objectiveIds: [IM3_COMPARE_MAXIMUM_NODE],
      difficulty: "standard" as const,
      metadata: { stableActivityId: IM3_COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID },
    },
    item: {
      practiceItemId: `${IM3_COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID}:seed-0`,
      activityId,
      variantKey: IM3_COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID,
      legacyProblemFamilyId: IM3_COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID,
      migrationVersion: "kst-srs.v3.2" as const,
      sourceTimestamp: now,
      variantLabel: "Seed 0",
    },
  };
}

export function buildIm3CompareMaximumIndependentSeedDocuments(
  activityId: Id<"activities">,
  now: number,
) {
  const generated = getGenerator("quadratic-graph-analysis").generate({
    nodeId: IM3_COMPARE_MAXIMUM_NODE,
    seed: 1,
    difficulty: 0.5,
  });
  const props = generated.data.rendererProps as GraphingExplorerSchemaProps;
  graphingExplorerSchema.parse(props);
  const partIds = Object.keys(generated.expectedAnswer);
  const rubric = partIds.map((partId) => ({
    criteria: "Identify the function with the greater maximum.",
    partId,
    points: generated.gradingMetadata.partMaxScores[partId],
  }));

  return {
    activity: {
      componentKey: "graphing-explorer" as const,
      displayName: "Independent comparison of quadratic maximum values",
      description: "Independent practice for comparing the maximum values of quadratic functions.",
      props,
      gradingConfig: {
        autoGrade: true,
        passingScore: 1,
        partialCredit: false,
        partIds,
        rubric,
      },
      stableActivityId: IM3_COMPARE_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
      masteryNodeId: IM3_COMPARE_MAXIMUM_NODE,
      srsEligible: true as const,
      createdAt: now,
      updatedAt: now,
    },
    variant: {
      variantKey: IM3_COMPARE_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
      legacyProblemFamilyId: IM3_COMPARE_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
      migrationVersion: "kst-srs.v3.2" as const,
      sourceTimestamp: now,
      componentKey: "graphing-explorer" as const,
      displayName: "Independent comparison of quadratic maximum values",
      description: "Independent practice for comparing the maximum values of quadratic functions.",
      objectiveIds: [IM3_COMPARE_MAXIMUM_NODE],
      difficulty: "standard" as const,
      metadata: { stableActivityId: IM3_COMPARE_MAXIMUM_INDEPENDENT_ACTIVITY_ID },
    },
    item: {
      practiceItemId: `${IM3_COMPARE_MAXIMUM_INDEPENDENT_ACTIVITY_ID}:seed-1`,
      activityId,
      variantKey: IM3_COMPARE_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
      legacyProblemFamilyId: IM3_COMPARE_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
      migrationVersion: "kst-srs.v3.2" as const,
      sourceTimestamp: now,
      variantLabel: "Seed 1",
    },
  };
}

export async function upsertIm3CompareMaximumWorkedActivity(
  ctx: MutationCtx,
  now: number,
): Promise<Id<"activities">> {
  const existingActivity = await ctx.db
    .query("activities")
    .withIndex("by_stable_activity_id", (q) => (
      q.eq("stableActivityId", IM3_COMPARE_MAXIMUM_WORKED_ACTIVITY_ID)
    ))
    .unique();
  const activity = buildIm3CompareMaximumWorkedSeedDocument(now);

  if (existingActivity) {
    await ctx.db.patch(existingActivity._id, {
      ...activity,
      createdAt: existingActivity.createdAt,
    });
    return existingActivity._id;
  }

  return await ctx.db.insert("activities", activity);
}

export async function upsertIm3CompareMaximumIndependentActivity(
  ctx: MutationCtx,
  now: number,
): Promise<Id<"activities">> {
  const existingActivity = await ctx.db
    .query("activities")
    .withIndex("by_stable_activity_id", (q) => (
      q.eq("stableActivityId", IM3_COMPARE_MAXIMUM_INDEPENDENT_ACTIVITY_ID)
    ))
    .unique();
  const activity = buildIm3CompareMaximumIndependentSeedDocuments(
    existingActivity?._id ?? "activities:pending" as Id<"activities">,
    now,
  ).activity;

  if (existingActivity) {
    await ctx.db.patch(existingActivity._id, {
      ...activity,
      createdAt: existingActivity.createdAt,
    });
    return existingActivity._id;
  }

  return await ctx.db.insert("activities", activity);
}

export async function upsertIm3CompareMaximumIndependentVariant(
  ctx: MutationCtx,
  now: number,
): Promise<Id<"practice_variants">> {
  const existingVariant = await ctx.db
    .query("practice_variants")
    .withIndex("by_variantKey", (q) => (
      q.eq("variantKey", IM3_COMPARE_MAXIMUM_INDEPENDENT_ACTIVITY_ID)
    ))
    .unique();
  const variant = buildIm3CompareMaximumIndependentSeedDocuments(
    "activities:pending" as Id<"activities">,
    now,
  ).variant;

  if (existingVariant) {
    await ctx.db.patch(existingVariant._id, variant);
    return existingVariant._id;
  }

  return await ctx.db.insert("practice_variants", variant);
}

export async function upsertIm3CompareMaximumIndependentPracticeItem(
  ctx: MutationCtx,
  activityId: Id<"activities">,
  now: number,
): Promise<Id<"practice_items">> {
  const documents = buildIm3CompareMaximumIndependentSeedDocuments(activityId, now);
  const byVariant = await ctx.db
    .query("practice_items")
    .withIndex("by_variantKey", (q) => (
      q.eq("variantKey", IM3_COMPARE_MAXIMUM_INDEPENDENT_ACTIVITY_ID)
    ))
    .take(2);
  const byActivity = await ctx.db
    .query("practice_items")
    .withIndex("by_activityId", (q) => q.eq("activityId", activityId))
    .take(2);
  const mappedRows = [...new Map(
    [...byVariant, ...byActivity].map((row) => [String(row._id), row]),
  ).values()];
  if (
    mappedRows.length > 1
    || mappedRows.some((row) => (
      row.variantKey !== IM3_COMPARE_MAXIMUM_INDEPENDENT_ACTIVITY_ID
      || String(row.activityId) !== String(activityId)
      || row.practiceItemId !== documents.item.practiceItemId
    ))
  ) {
    throw new Error("Duplicate or conflicting IM3 compare-maximum Independent practice-item mapping");
  }

  const parsedItem = practiceItemSchema.safeParse({
    practiceItemId: documents.item.practiceItemId,
    activityId,
    variantKey: documents.item.variantKey,
    variantLabel: documents.item.variantLabel,
  });
  if (!parsedItem.success) {
    throw new Error(`IM3 compare-maximum Independent practice item is invalid: ${parsedItem.error.message}`);
  }

  const existingItem = mappedRows[0];
  if (existingItem) {
    await ctx.db.patch(existingItem._id, documents.item);
    return existingItem._id;
  }

  return await ctx.db.insert("practice_items", documents.item);
}

export async function upsertIm3CompareMaximumGuidedActivity(
  ctx: MutationCtx,
  now: number,
): Promise<Id<"activities">> {
  const existingActivity = await ctx.db
    .query("activities")
    .withIndex("by_stable_activity_id", (q) => (
      q.eq("stableActivityId", IM3_COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID)
    ))
    .unique();
  const activity = buildIm3CompareMaximumGuidedSeedDocuments(
    existingActivity?._id ?? "activities:pending" as Id<"activities">,
    now,
  ).activity;

  if (existingActivity) {
    await ctx.db.patch(existingActivity._id, {
      ...activity,
      createdAt: existingActivity.createdAt,
    });
    return existingActivity._id;
  }

  return await ctx.db.insert("activities", activity);
}

export async function upsertIm3CompareMaximumGuidedVariant(
  ctx: MutationCtx,
  now: number,
): Promise<Id<"practice_variants">> {
  const existingVariant = await ctx.db
    .query("practice_variants")
    .withIndex("by_variantKey", (q) => (
      q.eq("variantKey", IM3_COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID)
    ))
    .unique();
  const variant = buildIm3CompareMaximumGuidedSeedDocuments(
    "activities:pending" as Id<"activities">,
    now,
  ).variant;

  if (existingVariant) {
    await ctx.db.patch(existingVariant._id, variant);
    return existingVariant._id;
  }

  return await ctx.db.insert("practice_variants", variant);
}

export async function upsertIm3CompareMaximumGuidedPracticeItem(
  ctx: MutationCtx,
  activityId: Id<"activities">,
  now: number,
): Promise<Id<"practice_items">> {
  const documents = buildIm3CompareMaximumGuidedSeedDocuments(activityId, now);
  const byVariant = await ctx.db
    .query("practice_items")
    .withIndex("by_variantKey", (q) => (
      q.eq("variantKey", IM3_COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID)
    ))
    .take(2);
  const byActivity = await ctx.db
    .query("practice_items")
    .withIndex("by_activityId", (q) => q.eq("activityId", activityId))
    .take(2);
  const mappedRows = [...new Map(
    [...byVariant, ...byActivity].map((row) => [String(row._id), row]),
  ).values()];
  if (
    mappedRows.length > 1
    || mappedRows.some((row) => (
      row.variantKey !== IM3_COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID
      || String(row.activityId) !== String(activityId)
      || row.practiceItemId !== documents.item.practiceItemId
    ))
  ) {
    throw new Error("Duplicate or conflicting IM3 compare-maximum Guided practice-item mapping");
  }

  const parsedItem = practiceItemSchema.safeParse({
    practiceItemId: documents.item.practiceItemId,
    activityId,
    variantKey: documents.item.variantKey,
    variantLabel: documents.item.variantLabel,
  });
  if (!parsedItem.success) {
    throw new Error(`IM3 compare-maximum Guided practice item is invalid: ${parsedItem.error.message}`);
  }

  const existingItem = mappedRows[0];
  if (existingItem) {
    await ctx.db.patch(existingItem._id, documents.item);
    return existingItem._id;
  }

  return await ctx.db.insert("practice_items", documents.item);
}

export function buildIm3SymmetryGuidedSeedDocuments(
  activityId: Id<"activities">,
  now: number,
) {
  const generated = getGenerator("quadratic-graph-analysis").generate({
    nodeId: IM3_SYMMETRY_NODE,
    seed: 0,
    difficulty: 0.5,
  });
  const props = generated.data.rendererProps as GraphingExplorerSchemaProps;
  graphingExplorerSchema.parse(props);
  const partIds = Object.keys(generated.expectedAnswer);
  const rubric = partIds.map((partId) => ({
    criteria: "Place the vertex, the y-intercept, and the reflected point.",
    partId,
    points: generated.gradingMetadata.partMaxScores[partId],
  }));

  return {
    activity: {
      componentKey: "graphing-explorer" as const,
      displayName: "Guided graph from a vertex and y-intercept by symmetry",
      description: "Use a vertex and y-intercept to graph a quadratic by symmetry.",
      props,
      gradingConfig: {
        autoGrade: true,
        passingScore: 1,
        partialCredit: false,
        partIds,
        rubric,
      },
      stableActivityId: IM3_SYMMETRY_GUIDED_ACTIVITY_ID,
      masteryNodeId: IM3_SYMMETRY_NODE,
      srsEligible: true as const,
      createdAt: now,
      updatedAt: now,
    },
    variant: {
      variantKey: IM3_SYMMETRY_GUIDED_ACTIVITY_ID,
      legacyProblemFamilyId: IM3_SYMMETRY_GUIDED_ACTIVITY_ID,
      migrationVersion: "kst-srs.v3.2" as const,
      sourceTimestamp: now,
      componentKey: "graphing-explorer" as const,
      displayName: "Guided graph from a vertex and y-intercept by symmetry",
      description: "Use a vertex and y-intercept to graph a quadratic by symmetry.",
      objectiveIds: [IM3_SYMMETRY_NODE],
      difficulty: "standard" as const,
      metadata: { stableActivityId: IM3_SYMMETRY_GUIDED_ACTIVITY_ID },
    },
    item: {
      practiceItemId: `${IM3_SYMMETRY_GUIDED_ACTIVITY_ID}:seed-0`,
      activityId,
      variantKey: IM3_SYMMETRY_GUIDED_ACTIVITY_ID,
      legacyProblemFamilyId: IM3_SYMMETRY_GUIDED_ACTIVITY_ID,
      migrationVersion: "kst-srs.v3.2" as const,
      sourceTimestamp: now,
      variantLabel: "Seed 0",
    },
  };
}

export function buildIm3SymmetryIndependentSeedDocuments(
  activityId: Id<"activities">,
  now: number,
) {
  const generated = getGenerator("quadratic-graph-analysis").generate({
    nodeId: IM3_SYMMETRY_NODE,
    seed: 1,
    difficulty: 0.5,
  });
  const props = generated.data.rendererProps as GraphingExplorerSchemaProps;
  graphingExplorerSchema.parse(props);
  const partIds = Object.keys(generated.expectedAnswer);
  const rubric = partIds.map((partId) => ({
    criteria: "Place the vertex, the y-intercept, and the reflected point.",
    partId,
    points: generated.gradingMetadata.partMaxScores[partId],
  }));

  return {
    activity: {
      componentKey: "graphing-explorer" as const,
      displayName: "Independent graph from a vertex and y-intercept by symmetry",
      description: "Independent practice for graphing a quadratic by symmetry.",
      props,
      gradingConfig: {
        autoGrade: true,
        passingScore: 1,
        partialCredit: false,
        partIds,
        rubric,
      },
      stableActivityId: IM3_SYMMETRY_INDEPENDENT_ACTIVITY_ID,
      masteryNodeId: IM3_SYMMETRY_NODE,
      srsEligible: true as const,
      createdAt: now,
      updatedAt: now,
    },
    variant: {
      variantKey: IM3_SYMMETRY_INDEPENDENT_ACTIVITY_ID,
      legacyProblemFamilyId: IM3_SYMMETRY_INDEPENDENT_ACTIVITY_ID,
      migrationVersion: "kst-srs.v3.2" as const,
      sourceTimestamp: now,
      componentKey: "graphing-explorer" as const,
      displayName: "Independent graph from a vertex and y-intercept by symmetry",
      description: "Independent practice for graphing a quadratic by symmetry.",
      objectiveIds: [IM3_SYMMETRY_NODE],
      difficulty: "standard" as const,
      metadata: { stableActivityId: IM3_SYMMETRY_INDEPENDENT_ACTIVITY_ID },
    },
    item: {
      practiceItemId: `${IM3_SYMMETRY_INDEPENDENT_ACTIVITY_ID}:seed-1`,
      activityId,
      variantKey: IM3_SYMMETRY_INDEPENDENT_ACTIVITY_ID,
      legacyProblemFamilyId: IM3_SYMMETRY_INDEPENDENT_ACTIVITY_ID,
      migrationVersion: "kst-srs.v3.2" as const,
      sourceTimestamp: now,
      variantLabel: "Seed 1",
    },
  };
}

export async function upsertIm3SymmetryWorkedActivity(
  ctx: MutationCtx,
  now: number,
): Promise<Id<"activities">> {
  const existingActivity = await ctx.db
    .query("activities")
    .withIndex("by_stable_activity_id", (q) => (
      q.eq("stableActivityId", IM3_SYMMETRY_WORKED_ACTIVITY_ID)
    ))
    .unique();
  const activity = buildIm3SymmetryWorkedSeedDocument(now);

  if (existingActivity) {
    await ctx.db.patch(existingActivity._id, {
      ...activity,
      createdAt: existingActivity.createdAt,
    });
    return existingActivity._id;
  }

  return await ctx.db.insert("activities", activity);
}

export async function upsertIm3SymmetryGuidedActivity(
  ctx: MutationCtx,
  now: number,
): Promise<Id<"activities">> {
  const existingActivity = await ctx.db
    .query("activities")
    .withIndex("by_stable_activity_id", (q) => (
      q.eq("stableActivityId", IM3_SYMMETRY_GUIDED_ACTIVITY_ID)
    ))
    .unique();
  const activity = buildIm3SymmetryGuidedSeedDocuments(
    existingActivity?._id ?? "activities:pending" as Id<"activities">,
    now,
  ).activity;

  if (existingActivity) {
    await ctx.db.patch(existingActivity._id, {
      ...activity,
      createdAt: existingActivity.createdAt,
    });
    return existingActivity._id;
  }

  return await ctx.db.insert("activities", activity);
}

export async function upsertIm3SymmetryGuidedVariant(
  ctx: MutationCtx,
  now: number,
): Promise<Id<"practice_variants">> {
  const existingVariant = await ctx.db
    .query("practice_variants")
    .withIndex("by_variantKey", (q) => (
      q.eq("variantKey", IM3_SYMMETRY_GUIDED_ACTIVITY_ID)
    ))
    .unique();
  const variant = buildIm3SymmetryGuidedSeedDocuments(
    "activities:pending" as Id<"activities">,
    now,
  ).variant;

  if (existingVariant) {
    await ctx.db.patch(existingVariant._id, variant);
    return existingVariant._id;
  }

  return await ctx.db.insert("practice_variants", variant);
}

export async function upsertIm3SymmetryGuidedPracticeItem(
  ctx: MutationCtx,
  activityId: Id<"activities">,
  now: number,
): Promise<Id<"practice_items">> {
  const documents = buildIm3SymmetryGuidedSeedDocuments(activityId, now);
  const byVariant = await ctx.db
    .query("practice_items")
    .withIndex("by_variantKey", (q) => (
      q.eq("variantKey", IM3_SYMMETRY_GUIDED_ACTIVITY_ID)
    ))
    .take(2);
  const byActivity = await ctx.db
    .query("practice_items")
    .withIndex("by_activityId", (q) => q.eq("activityId", activityId))
    .take(2);
  const mappedRows = [...new Map(
    [...byVariant, ...byActivity].map((row) => [String(row._id), row]),
  ).values()];
  if (
    mappedRows.length > 1
    || mappedRows.some((row) => (
      row.variantKey !== IM3_SYMMETRY_GUIDED_ACTIVITY_ID
      || String(row.activityId) !== String(activityId)
      || row.practiceItemId !== documents.item.practiceItemId
    ))
  ) {
    throw new Error("Duplicate or conflicting IM3 symmetry Guided practice-item mapping");
  }

  const parsedItem = practiceItemSchema.safeParse({
    practiceItemId: documents.item.practiceItemId,
    activityId,
    variantKey: documents.item.variantKey,
    variantLabel: documents.item.variantLabel,
  });
  if (!parsedItem.success) {
    throw new Error(`IM3 symmetry Guided practice item is invalid: ${parsedItem.error.message}`);
  }

  const existingItem = mappedRows[0];
  if (existingItem) {
    await ctx.db.patch(existingItem._id, documents.item);
    return existingItem._id;
  }

  return await ctx.db.insert("practice_items", documents.item);
}

export async function upsertIm3SymmetryIndependentActivity(
  ctx: MutationCtx,
  now: number,
): Promise<Id<"activities">> {
  const existingActivity = await ctx.db
    .query("activities")
    .withIndex("by_stable_activity_id", (q) => (
      q.eq("stableActivityId", IM3_SYMMETRY_INDEPENDENT_ACTIVITY_ID)
    ))
    .unique();
  const activity = buildIm3SymmetryIndependentSeedDocuments(
    existingActivity?._id ?? "activities:pending" as Id<"activities">,
    now,
  ).activity;

  if (existingActivity) {
    await ctx.db.patch(existingActivity._id, {
      ...activity,
      createdAt: existingActivity.createdAt,
    });
    return existingActivity._id;
  }

  return await ctx.db.insert("activities", activity);
}

export async function upsertIm3SymmetryIndependentVariant(
  ctx: MutationCtx,
  now: number,
): Promise<Id<"practice_variants">> {
  const existingVariant = await ctx.db
    .query("practice_variants")
    .withIndex("by_variantKey", (q) => (
      q.eq("variantKey", IM3_SYMMETRY_INDEPENDENT_ACTIVITY_ID)
    ))
    .unique();
  const variant = buildIm3SymmetryIndependentSeedDocuments(
    "activities:pending" as Id<"activities">,
    now,
  ).variant;

  if (existingVariant) {
    await ctx.db.patch(existingVariant._id, variant);
    return existingVariant._id;
  }

  return await ctx.db.insert("practice_variants", variant);
}

export async function upsertIm3SymmetryIndependentPracticeItem(
  ctx: MutationCtx,
  activityId: Id<"activities">,
  now: number,
): Promise<Id<"practice_items">> {
  const documents = buildIm3SymmetryIndependentSeedDocuments(activityId, now);
  const byVariant = await ctx.db
    .query("practice_items")
    .withIndex("by_variantKey", (q) => (
      q.eq("variantKey", IM3_SYMMETRY_INDEPENDENT_ACTIVITY_ID)
    ))
    .take(2);
  const byActivity = await ctx.db
    .query("practice_items")
    .withIndex("by_activityId", (q) => q.eq("activityId", activityId))
    .take(2);
  const mappedRows = [...new Map(
    [...byVariant, ...byActivity].map((row) => [String(row._id), row]),
  ).values()];
  if (
    mappedRows.length > 1
    || mappedRows.some((row) => (
      row.variantKey !== IM3_SYMMETRY_INDEPENDENT_ACTIVITY_ID
      || String(row.activityId) !== String(activityId)
      || row.practiceItemId !== documents.item.practiceItemId
    ))
  ) {
    throw new Error("Duplicate or conflicting IM3 symmetry Independent practice-item mapping");
  }

  const parsedItem = practiceItemSchema.safeParse({
    practiceItemId: documents.item.practiceItemId,
    activityId,
    variantKey: documents.item.variantKey,
    variantLabel: documents.item.variantLabel,
  });
  if (!parsedItem.success) {
    throw new Error(`IM3 symmetry Independent practice item is invalid: ${parsedItem.error.message}`);
  }

  const existingItem = mappedRows[0];
  if (existingItem) {
    await ctx.db.patch(existingItem._id, documents.item);
    return existingItem._id;
  }

  return await ctx.db.insert("practice_items", documents.item);
}

export async function upsertIm3MaximumReadingWorkedActivity(
  ctx: MutationCtx,
  now: number,
): Promise<Id<"activities">> {
  const existingActivity = await ctx.db
    .query("activities")
    .withIndex("by_stable_activity_id", (q) => (
      q.eq("stableActivityId", IM3_MAXIMUM_READING_WORKED_ACTIVITY_ID)
    ))
    .unique();
  const activity = buildIm3MaximumReadingWorkedSeedDocument(now);

  if (existingActivity) {
    await ctx.db.patch(existingActivity._id, {
      ...activity,
      createdAt: existingActivity.createdAt,
    });
    return existingActivity._id;
  }

  return await ctx.db.insert("activities", activity);
}

export async function upsertIm3MaximumReadingGuidedActivity(
  ctx: MutationCtx,
  now: number,
): Promise<Id<"activities">> {
  const existingActivity = await ctx.db
    .query("activities")
    .withIndex("by_stable_activity_id", (q) => (
      q.eq("stableActivityId", IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID)
    ))
    .unique();
  const activity = buildIm3MaximumReadingGuidedSeedDocuments(
    existingActivity?._id ?? "activities:pending" as Id<"activities">,
    now,
  ).activity;

  if (existingActivity) {
    await ctx.db.patch(existingActivity._id, {
      ...activity,
      createdAt: existingActivity.createdAt,
    });
    return existingActivity._id;
  }

  return await ctx.db.insert("activities", activity);
}

export async function upsertIm3MaximumReadingGuidedVariant(
  ctx: MutationCtx,
  now: number,
): Promise<Id<"practice_variants">> {
  const existingVariant = await ctx.db
    .query("practice_variants")
    .withIndex("by_variantKey", (q) => (
      q.eq("variantKey", IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID)
    ))
    .unique();
  const variant = buildIm3MaximumReadingGuidedSeedDocuments(
    "activities:pending" as Id<"activities">,
    now,
  ).variant;

  if (existingVariant) {
    await ctx.db.patch(existingVariant._id, variant);
    return existingVariant._id;
  }

  return await ctx.db.insert("practice_variants", variant);
}

export async function upsertIm3MaximumReadingGuidedPracticeItem(
  ctx: MutationCtx,
  activityId: Id<"activities">,
  now: number,
): Promise<Id<"practice_items">> {
  const documents = buildIm3MaximumReadingGuidedSeedDocuments(activityId, now);
  const byVariant = await ctx.db
    .query("practice_items")
    .withIndex("by_variantKey", (q) => (
      q.eq("variantKey", IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID)
    ))
    .take(2);
  const byActivity = await ctx.db
    .query("practice_items")
    .withIndex("by_activityId", (q) => q.eq("activityId", activityId))
    .take(2);
  const mappedRows = [...new Map(
    [...byVariant, ...byActivity].map((row) => [String(row._id), row]),
  ).values()];
  if (
    mappedRows.length > 1
    || mappedRows.some((row) => (
      row.variantKey !== IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID
      || String(row.activityId) !== String(activityId)
      || row.practiceItemId !== documents.item.practiceItemId
    ))
  ) {
    throw new Error("Duplicate or conflicting IM3 maximum-reading Guided practice-item mapping");
  }

  const parsedItem = practiceItemSchema.safeParse({
    practiceItemId: documents.item.practiceItemId,
    activityId,
    variantKey: documents.item.variantKey,
    variantLabel: documents.item.variantLabel,
  });
  if (!parsedItem.success) {
    throw new Error(`IM3 maximum-reading Guided practice item is invalid: ${parsedItem.error.message}`);
  }

  const existingItem = mappedRows[0];
  if (existingItem) {
    await ctx.db.patch(existingItem._id, documents.item);
    return existingItem._id;
  }

  return await ctx.db.insert("practice_items", documents.item);
}

export async function upsertIm3MaximumReadingIndependentActivity(
  ctx: MutationCtx,
  now: number,
): Promise<Id<"activities">> {
  const existingActivity = await ctx.db
    .query("activities")
    .withIndex("by_stable_activity_id", (q) => (
      q.eq("stableActivityId", IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID)
    ))
    .unique();
  const activity = buildIm3MaximumReadingIndependentSeedDocuments(
    existingActivity?._id ?? "activities:pending" as Id<"activities">,
    now,
  ).activity;

  if (existingActivity) {
    await ctx.db.patch(existingActivity._id, {
      ...activity,
      createdAt: existingActivity.createdAt,
    });
    return existingActivity._id;
  }

  return await ctx.db.insert("activities", activity);
}

export async function upsertIm3MaximumReadingIndependentVariant(
  ctx: MutationCtx,
  now: number,
): Promise<Id<"practice_variants">> {
  const existingVariant = await ctx.db
    .query("practice_variants")
    .withIndex("by_variantKey", (q) => (
      q.eq("variantKey", IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID)
    ))
    .unique();
  const variant = buildIm3MaximumReadingIndependentSeedDocuments(
    "activities:pending" as Id<"activities">,
    now,
  ).variant;

  if (existingVariant) {
    await ctx.db.patch(existingVariant._id, variant);
    return existingVariant._id;
  }

  return await ctx.db.insert("practice_variants", variant);
}

export async function upsertIm3MaximumReadingIndependentPracticeItem(
  ctx: MutationCtx,
  activityId: Id<"activities">,
  now: number,
): Promise<Id<"practice_items">> {
  const documents = buildIm3MaximumReadingIndependentSeedDocuments(activityId, now);
  const byVariant = await ctx.db
    .query("practice_items")
    .withIndex("by_variantKey", (q) => (
      q.eq("variantKey", IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID)
    ))
    .take(2);
  const byActivity = await ctx.db
    .query("practice_items")
    .withIndex("by_activityId", (q) => q.eq("activityId", activityId))
    .take(2);
  const mappedRows = [...new Map(
    [...byVariant, ...byActivity].map((row) => [String(row._id), row]),
  ).values()];
  if (
    mappedRows.length > 1
    || mappedRows.some((row) => (
      row.variantKey !== IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID
      || String(row.activityId) !== String(activityId)
      || row.practiceItemId !== documents.item.practiceItemId
    ))
  ) {
    throw new Error("Duplicate or conflicting IM3 maximum-reading Independent practice-item mapping");
  }

  const parsedItem = practiceItemSchema.safeParse({
    practiceItemId: documents.item.practiceItemId,
    activityId,
    variantKey: documents.item.variantKey,
    variantLabel: documents.item.variantLabel,
  });
  if (!parsedItem.success) {
    throw new Error(`IM3 maximum-reading Independent practice item is invalid: ${parsedItem.error.message}`);
  }

  const existingItem = mappedRows[0];
  if (existingItem) {
    await ctx.db.patch(existingItem._id, documents.item);
    return existingItem._id;
  }

  return await ctx.db.insert("practice_items", documents.item);
}

export async function upsertIm3DomainRangeWorkedActivity(
  ctx: MutationCtx,
  now: number,
): Promise<Id<"activities">> {
  const existingActivity = await ctx.db
    .query("activities")
    .withIndex("by_stable_activity_id", (q) => (
      q.eq("stableActivityId", IM3_DOMAIN_RANGE_WORKED_ACTIVITY_ID)
    ))
    .unique();
  const activity = buildIm3DomainRangeWorkedSeedDocument(now);

  if (existingActivity) {
    await ctx.db.patch(existingActivity._id, {
      ...activity,
      createdAt: existingActivity.createdAt,
    });
    return existingActivity._id;
  }

  return await ctx.db.insert("activities", activity);
}

export async function upsertIm3DomainRangeGuidedActivity(
  ctx: MutationCtx,
  now: number,
): Promise<Id<"activities">> {
  const existingActivity = await ctx.db
    .query("activities")
    .withIndex("by_stable_activity_id", (q) => (
      q.eq("stableActivityId", IM3_DOMAIN_RANGE_GUIDED_ACTIVITY_ID)
    ))
    .unique();
  const activity = buildIm3DomainRangeGuidedSeedDocuments(
    existingActivity?._id ?? "activities:pending" as Id<"activities">,
    now,
  ).activity;

  if (existingActivity) {
    await ctx.db.patch(existingActivity._id, activity);
    return existingActivity._id;
  }

  return await ctx.db.insert("activities", activity);
}

export async function upsertIm3DomainRangeGuidedVariant(
  ctx: MutationCtx,
  now: number,
): Promise<Id<"practice_variants">> {
  const existingVariant = await ctx.db
    .query("practice_variants")
    .withIndex("by_variantKey", (q) => (
      q.eq("variantKey", IM3_DOMAIN_RANGE_GUIDED_ACTIVITY_ID)
    ))
    .unique();
  const variant = buildIm3DomainRangeGuidedSeedDocuments(
    "activities:pending" as Id<"activities">,
    now,
  ).variant;

  if (existingVariant) {
    await ctx.db.patch(existingVariant._id, variant);
    return existingVariant._id;
  }

  return await ctx.db.insert("practice_variants", variant);
}

export async function upsertIm3DomainRangeGuidedPracticeItem(
  ctx: MutationCtx,
  activityId: Id<"activities">,
  now: number,
): Promise<Id<"practice_items">> {
  const documents = buildIm3DomainRangeGuidedSeedDocuments(activityId, now);
  const byVariant = await ctx.db
    .query("practice_items")
    .withIndex("by_variantKey", (q) => (
      q.eq("variantKey", IM3_DOMAIN_RANGE_GUIDED_ACTIVITY_ID)
    ))
    .take(2);
  const byActivity = await ctx.db
    .query("practice_items")
    .withIndex("by_activityId", (q) => q.eq("activityId", activityId))
    .take(2);
  const mappedRows = [...new Map(
    [...byVariant, ...byActivity].map((row) => [String(row._id), row]),
  ).values()];
  if (
    mappedRows.length > 1
    || mappedRows.some((row) => (
      row.variantKey !== IM3_DOMAIN_RANGE_GUIDED_ACTIVITY_ID
      || String(row.activityId) !== String(activityId)
      || row.practiceItemId !== documents.item.practiceItemId
    ))
  ) {
    throw new Error("Duplicate or conflicting IM3 domain-range Guided practice-item mapping");
  }

  const parsedItem = practiceItemSchema.safeParse({
    practiceItemId: documents.item.practiceItemId,
    activityId,
    variantKey: documents.item.variantKey,
    variantLabel: documents.item.variantLabel,
  });
  if (!parsedItem.success) {
    throw new Error(`IM3 domain-range Guided practice item is invalid: ${parsedItem.error.message}`);
  }

  const existingItem = mappedRows[0];
  if (existingItem) {
    await ctx.db.patch(existingItem._id, documents.item);
    return existingItem._id;
  }

  return await ctx.db.insert("practice_items", documents.item);
}

export async function upsertIm3DomainRangeGuidedSeed2Activity(
  ctx: MutationCtx,
  now: number,
): Promise<Id<"activities">> {
  const existingActivity = await ctx.db
    .query("activities")
    .withIndex("by_stable_activity_id", (q) => (
      q.eq("stableActivityId", IM3_DOMAIN_RANGE_GUIDED_SEED_2_ACTIVITY_ID)
    ))
    .unique();
  const activity = buildIm3DomainRangeGuidedSeed2Documents(
    existingActivity?._id ?? "activities:pending" as Id<"activities">,
    now,
  ).activity;

  if (existingActivity) {
    await ctx.db.patch(existingActivity._id, activity);
    return existingActivity._id;
  }

  return await ctx.db.insert("activities", activity);
}

export async function upsertIm3DomainRangeGuidedSeed2Variant(
  ctx: MutationCtx,
  now: number,
): Promise<Id<"practice_variants">> {
  const existingVariant = await ctx.db
    .query("practice_variants")
    .withIndex("by_variantKey", (q) => (
      q.eq("variantKey", IM3_DOMAIN_RANGE_GUIDED_SEED_2_VARIANT_KEY)
    ))
    .unique();
  const variant = buildIm3DomainRangeGuidedSeed2Documents(
    "activities:pending" as Id<"activities">,
    now,
  ).variant;

  if (existingVariant) {
    await ctx.db.patch(existingVariant._id, variant);
    return existingVariant._id;
  }

  return await ctx.db.insert("practice_variants", variant);
}

export async function upsertIm3DomainRangeGuidedSeed2PracticeItem(
  ctx: MutationCtx,
  activityId: Id<"activities">,
  now: number,
): Promise<Id<"practice_items">> {
  const documents = buildIm3DomainRangeGuidedSeed2Documents(activityId, now);
  const byVariant = await ctx.db
    .query("practice_items")
    .withIndex("by_variantKey", (q) => q.eq("variantKey", IM3_DOMAIN_RANGE_GUIDED_SEED_2_VARIANT_KEY))
    .take(2);
  const byActivity = await ctx.db
    .query("practice_items")
    .withIndex("by_activityId", (q) => q.eq("activityId", activityId))
    .take(2);
  const mappedRows = [...new Map(
    [...byVariant, ...byActivity].map((row) => [String(row._id), row]),
  ).values()];
  if (
    mappedRows.length > 1
    || mappedRows.some((row) => (
      row.variantKey !== IM3_DOMAIN_RANGE_GUIDED_SEED_2_VARIANT_KEY
      || String(row.activityId) !== String(activityId)
      || row.practiceItemId !== documents.item.practiceItemId
    ))
  ) {
    throw new Error("Duplicate or conflicting IM3 domain-range Guided seed-2 practice-item mapping");
  }

  const parsedItem = practiceItemSchema.safeParse({
    practiceItemId: documents.item.practiceItemId,
    activityId,
    variantKey: documents.item.variantKey,
    variantLabel: documents.item.variantLabel,
  });
  if (!parsedItem.success) {
    throw new Error(`IM3 domain-range Guided seed-2 practice item is invalid: ${parsedItem.error.message}`);
  }

  const existingItem = mappedRows[0];
  if (existingItem) {
    await ctx.db.patch(existingItem._id, documents.item);
    return existingItem._id;
  }

  return await ctx.db.insert("practice_items", documents.item);
}

export async function upsertIm3DomainRangeIndependentActivity(
  ctx: MutationCtx,
  now: number,
): Promise<Id<"activities">> {
  const existingActivity = await ctx.db
    .query("activities")
    .withIndex("by_stable_activity_id", (q) => (
      q.eq("stableActivityId", IM3_DOMAIN_RANGE_INDEPENDENT_ACTIVITY_ID)
    ))
    .unique();
  const activity = buildIm3DomainRangeIndependentSeedDocuments(
    existingActivity?._id ?? "activities:pending" as Id<"activities">,
    now,
  ).activity;

  if (existingActivity) {
    await ctx.db.patch(existingActivity._id, {
      ...activity,
      createdAt: existingActivity.createdAt,
    });
    return existingActivity._id;
  }

  return await ctx.db.insert("activities", activity);
}

export async function upsertIm3DomainRangeIndependentVariant(
  ctx: MutationCtx,
  now: number,
): Promise<Id<"practice_variants">> {
  const existingVariant = await ctx.db
    .query("practice_variants")
    .withIndex("by_variantKey", (q) => (
      q.eq("variantKey", IM3_DOMAIN_RANGE_INDEPENDENT_ACTIVITY_ID)
    ))
    .unique();
  const variant = buildIm3DomainRangeIndependentSeedDocuments(
    "activities:pending" as Id<"activities">,
    now,
  ).variant;

  if (existingVariant) {
    await ctx.db.patch(existingVariant._id, variant);
    return existingVariant._id;
  }

  return await ctx.db.insert("practice_variants", variant);
}

export async function upsertIm3DomainRangeIndependentPracticeItem(
  ctx: MutationCtx,
  activityId: Id<"activities">,
  now: number,
): Promise<Id<"practice_items">> {
  const documents = buildIm3DomainRangeIndependentSeedDocuments(activityId, now);
  const byVariant = await ctx.db
    .query("practice_items")
    .withIndex("by_variantKey", (q) => (
      q.eq("variantKey", IM3_DOMAIN_RANGE_INDEPENDENT_ACTIVITY_ID)
    ))
    .take(2);
  const byActivity = await ctx.db
    .query("practice_items")
    .withIndex("by_activityId", (q) => q.eq("activityId", activityId))
    .take(2);
  const mappedRows = [...new Map(
    [...byVariant, ...byActivity].map((row) => [String(row._id), row]),
  ).values()];
  if (
    mappedRows.length > 1
    || mappedRows.some((row) => (
      row.variantKey !== IM3_DOMAIN_RANGE_INDEPENDENT_ACTIVITY_ID
      || String(row.activityId) !== String(activityId)
      || row.practiceItemId !== documents.item.practiceItemId
    ))
  ) {
    throw new Error("Duplicate or conflicting IM3 domain-range Independent practice-item mapping");
  }

  const parsedItem = practiceItemSchema.safeParse({
    practiceItemId: documents.item.practiceItemId,
    activityId,
    variantKey: documents.item.variantKey,
    variantLabel: documents.item.variantLabel,
  });
  if (!parsedItem.success) {
    throw new Error(`IM3 domain-range Independent practice item is invalid: ${parsedItem.error.message}`);
  }

  const existingItem = mappedRows[0];
  if (existingItem) {
    await ctx.db.patch(existingItem._id, documents.item);
    return existingItem._id;
  }

  return await ctx.db.insert("practice_items", documents.item);
}

export function buildIm3EquationRateIndependentSeedDocuments(
  activityId: Id<"activities">,
  now: number,
) {
  const generated = getGenerator(IM3_EQUATION_RATE_GENERATOR_KEY).generate({
    nodeId: IM3_EQUATION_RATE_NODE,
    seed: 2,
    difficulty: 0.5,
  });
  const rendererProps = rateOfChangeCalculatorSchema.parse(generated.data.rendererProps);
  const rateOfChangeProps: RateOfChangeCalculatorProps = rendererProps;
  const partIds = Object.keys(generated.expectedAnswer);
  const rubric = partIds.map((partId) => ({
    criteria: `Correct ${partId}`,
    partId,
    points: generated.gradingMetadata.partMaxScores[partId],
  }));

  return {
    activity: {
      componentKey: "rate-of-change-calculator" as const,
      displayName: "Calculate average rate of change from an equation",
      description: "Independent practice for the IM3 Example 4 equation rate.",
      props: rateOfChangeProps,
      gradingConfig: {
        autoGrade: true,
        passingScore: 7,
        partialCredit: true,
        partIds,
        rubric,
      },
      stableActivityId: IM3_EQUATION_RATE_INDEPENDENT_ACTIVITY_ID,
      masteryNodeId: IM3_EQUATION_RATE_NODE,
      srsEligible: true,
      createdAt: now,
      updatedAt: now,
    },
    variant: {
      variantKey: IM3_EQUATION_RATE_INDEPENDENT_ACTIVITY_ID,
      legacyProblemFamilyId: IM3_EQUATION_RATE_INDEPENDENT_ACTIVITY_ID,
      migrationVersion: "kst-srs.v3.2" as const,
      sourceTimestamp: now,
      componentKey: "rate-of-change-calculator",
      displayName: "Calculate average rate of change from an equation",
      description: "Use an equation to calculate average rate of change.",
      objectiveIds: [IM3_EQUATION_RATE_NODE],
      difficulty: "standard",
      metadata: {
        stableActivityId: IM3_EQUATION_RATE_INDEPENDENT_ACTIVITY_ID,
      },
    },
    item: {
      practiceItemId: `${IM3_EQUATION_RATE_INDEPENDENT_ACTIVITY_ID}:seed-2`,
      activityId,
      variantKey: IM3_EQUATION_RATE_INDEPENDENT_ACTIVITY_ID,
      legacyProblemFamilyId: IM3_EQUATION_RATE_INDEPENDENT_ACTIVITY_ID,
      migrationVersion: "kst-srs.v3.2" as const,
      sourceTimestamp: now,
      variantLabel: "Seed 2",
    },
  };
}

export function buildIm3EquationRateGuidedSeedDocuments(
  activityId: Id<"activities">,
  now: number,
) {
  const generated = getGenerator(IM3_EQUATION_RATE_GENERATOR_KEY).generate({
    nodeId: IM3_EQUATION_RATE_NODE,
    seed: 1,
    difficulty: 0.5,
  });
  const rendererProps = rateOfChangeCalculatorSchema.parse(generated.data.rendererProps);
  const rateOfChangeProps: RateOfChangeCalculatorProps = rendererProps;
  const partIds = Object.keys(generated.expectedAnswer);
  const rubric = partIds.map((partId) => ({
    criteria: `Correct ${partId}`,
    partId,
    points: generated.gradingMetadata.partMaxScores[partId],
  }));

  return {
    activity: {
      componentKey: "rate-of-change-calculator" as const,
      displayName: "Guided average rate of change from an equation",
      description: "Guided practice for the IM3 Example 4 equation rate.",
      props: rateOfChangeProps,
      gradingConfig: {
        autoGrade: true,
        passingScore: 7,
        partialCredit: true,
        partIds,
        rubric,
      },
      stableActivityId: IM3_EQUATION_RATE_GUIDED_ACTIVITY_ID,
      masteryNodeId: IM3_EQUATION_RATE_NODE,
      srsEligible: true,
      createdAt: now,
      updatedAt: now,
    },
    variant: {
      variantKey: IM3_EQUATION_RATE_GUIDED_ACTIVITY_ID,
      legacyProblemFamilyId: IM3_EQUATION_RATE_GUIDED_ACTIVITY_ID,
      migrationVersion: "kst-srs.v3.2" as const,
      sourceTimestamp: now,
      componentKey: "rate-of-change-calculator",
      displayName: "Guided average rate of change from an equation",
      description: "Use an equation to calculate average rate of change.",
      objectiveIds: [IM3_EQUATION_RATE_NODE],
      difficulty: "standard",
      metadata: {
        stableActivityId: IM3_EQUATION_RATE_GUIDED_ACTIVITY_ID,
      },
    },
    item: {
      practiceItemId: `${IM3_EQUATION_RATE_GUIDED_ACTIVITY_ID}:seed-1`,
      activityId,
      variantKey: IM3_EQUATION_RATE_GUIDED_ACTIVITY_ID,
      legacyProblemFamilyId: IM3_EQUATION_RATE_GUIDED_ACTIVITY_ID,
      migrationVersion: "kst-srs.v3.2" as const,
      sourceTimestamp: now,
      variantLabel: "Seed 1",
    },
  };
}

export async function upsertIm3EquationRateGuidedActivity(
  ctx: MutationCtx,
  now: number,
): Promise<Id<"activities">> {
  const existingActivity = await ctx.db
    .query("activities")
    .withIndex("by_stable_activity_id", (q) => (
      q.eq("stableActivityId", IM3_EQUATION_RATE_GUIDED_ACTIVITY_ID)
    ))
    .unique();
  const activity = buildIm3EquationRateGuidedSeedDocuments(
    existingActivity?._id ?? "activities:pending" as Id<"activities">,
    now,
  ).activity;

  if (existingActivity) {
    await ctx.db.patch(existingActivity._id, activity);
    return existingActivity._id;
  }

  return await ctx.db.insert("activities", activity);
}

export async function upsertIm3EquationRateGuidedVariant(
  ctx: MutationCtx,
  now: number,
): Promise<Id<"practice_variants">> {
  const existingVariant = await ctx.db
    .query("practice_variants")
    .withIndex("by_variantKey", (q) => (
      q.eq("variantKey", IM3_EQUATION_RATE_GUIDED_ACTIVITY_ID)
    ))
    .unique();
  const variant = buildIm3EquationRateGuidedSeedDocuments(
    "activities:pending" as Id<"activities">,
    now,
  ).variant;

  if (existingVariant) {
    await ctx.db.patch(existingVariant._id, variant);
    return existingVariant._id;
  }

  return await ctx.db.insert("practice_variants", variant);
}

export async function upsertIm3EquationRateGuidedPracticeItem(
  ctx: MutationCtx,
  activityId: Id<"activities">,
  now: number,
): Promise<Id<"practice_items">> {
  const documents = buildIm3EquationRateGuidedSeedDocuments(activityId, now);
  const byVariant = await ctx.db
    .query("practice_items")
    .withIndex("by_variantKey", (q) => q.eq("variantKey", IM3_EQUATION_RATE_GUIDED_ACTIVITY_ID))
    .take(2);
  const byActivity = await ctx.db
    .query("practice_items")
    .withIndex("by_activityId", (q) => q.eq("activityId", activityId))
    .take(2);
  const mappedRows = [...new Map(
    [...byVariant, ...byActivity].map((row) => [String(row._id), row]),
  ).values()];
  if (
    mappedRows.length > 1
    || mappedRows.some((row) => (
      row.variantKey !== IM3_EQUATION_RATE_GUIDED_ACTIVITY_ID
      || String(row.activityId) !== String(activityId)
      || row.practiceItemId !== documents.item.practiceItemId
    ))
  ) {
    throw new Error("Duplicate or conflicting IM3 Guided practice-item mapping");
  }

  const parsedItem = practiceItemSchema.safeParse({
    practiceItemId: documents.item.practiceItemId,
    activityId,
    variantKey: documents.item.variantKey,
    variantLabel: documents.item.variantLabel,
  });
  if (!parsedItem.success) {
    throw new Error(`IM3 Guided practice item is invalid: ${parsedItem.error.message}`);
  }

  const existingItem = mappedRows[0];
  if (existingItem) {
    await ctx.db.patch(existingItem._id, documents.item);
    return existingItem._id;
  }

  return await ctx.db.insert("practice_items", documents.item);
}

export async function upsertIm3EquationRateIndependentActivity(
  ctx: MutationCtx,
  now: number,
): Promise<Id<"activities">> {
  const existingActivity = await ctx.db
    .query("activities")
    .withIndex("by_stable_activity_id", (q) => (
      q.eq("stableActivityId", IM3_EQUATION_RATE_INDEPENDENT_ACTIVITY_ID)
    ))
    .unique();
  const activity = buildIm3EquationRateIndependentSeedDocuments(
    existingActivity?._id ?? "activities:pending" as Id<"activities">,
    now,
  ).activity;

  if (existingActivity) {
    await ctx.db.patch(existingActivity._id, activity);
    return existingActivity._id;
  }

  return await ctx.db.insert("activities", activity);
}

export async function upsertIm3EquationRateIndependentVariant(
  ctx: MutationCtx,
  now: number,
): Promise<Id<"practice_variants">> {
  const existingVariant = await ctx.db
    .query("practice_variants")
    .withIndex("by_variantKey", (q) => (
      q.eq("variantKey", IM3_EQUATION_RATE_INDEPENDENT_ACTIVITY_ID)
    ))
    .unique();
  const variant = buildIm3EquationRateIndependentSeedDocuments(
    "activities:pending" as Id<"activities">,
    now,
  ).variant;

  if (existingVariant) {
    await ctx.db.patch(existingVariant._id, variant);
    return existingVariant._id;
  }

  return await ctx.db.insert("practice_variants", variant);
}

export async function upsertIm3EquationRateIndependentPracticeItem(
  ctx: MutationCtx,
  activityId: Id<"activities">,
  now: number,
): Promise<Id<"practice_items">> {
  const documents = buildIm3EquationRateIndependentSeedDocuments(activityId, now);
  const byVariant = await ctx.db
    .query("practice_items")
    .withIndex("by_variantKey", (q) => q.eq("variantKey", IM3_EQUATION_RATE_INDEPENDENT_ACTIVITY_ID))
    .take(2);
  const byActivity = await ctx.db
    .query("practice_items")
    .withIndex("by_activityId", (q) => q.eq("activityId", activityId))
    .take(2);
  const mappedRows = [...new Map(
    [...byVariant, ...byActivity].map((row) => [String(row._id), row]),
  ).values()];
  if (
    mappedRows.length > 1
    || mappedRows.some((row) => (
      row.variantKey !== IM3_EQUATION_RATE_INDEPENDENT_ACTIVITY_ID
      || String(row.activityId) !== String(activityId)
      || row.practiceItemId !== documents.item.practiceItemId
    ))
  ) {
    throw new Error("Duplicate or conflicting IM3 equation-rate practice-item mapping");
  }

  const parsedItem = practiceItemSchema.safeParse({
    practiceItemId: documents.item.practiceItemId,
    activityId,
    variantKey: documents.item.variantKey,
    variantLabel: documents.item.variantLabel,
  });
  if (!parsedItem.success) {
    throw new Error(`IM3 equation-rate practice item is invalid: ${parsedItem.error.message}`);
  }

  const existingItem = mappedRows[0];
  if (existingItem) {
    await ctx.db.patch(existingItem._id, documents.item);
    return existingItem._id;
  }

  return await ctx.db.insert("practice_items", documents.item);
}

export async function upsertIm3GuidedPilotActivity(
  ctx: MutationCtx,
  now: number,
): Promise<Id<"activities">> {
  const existingActivity = await ctx.db
    .query("activities")
    .withIndex("by_stable_activity_id", (q) => (
      q.eq("stableActivityId", IM3_GUIDED_PRACTICE_ACTIVITY_ID)
    ))
    .unique();
  const activity = buildIm3GuidedPilotSeedDocuments(
    existingActivity?._id ?? "activities:pending" as Id<"activities">,
    now,
  ).activity;

  if (existingActivity) {
    await ctx.db.patch(existingActivity._id, activity);
    return existingActivity._id;
  }

  return await ctx.db.insert("activities", activity);
}

export async function upsertIm3GuidedPilotVariant(
  ctx: MutationCtx,
  now: number,
): Promise<Id<"practice_variants">> {
  const existingVariant = await ctx.db
    .query("practice_variants")
    .withIndex("by_variantKey", (q) => (
      q.eq("variantKey", IM3_GUIDED_VARIANT_KEY)
    ))
    .unique();
  const variant = buildIm3GuidedPilotSeedDocuments(
    "activities:pending" as Id<"activities">,
    now,
  ).variant;

  if (existingVariant) {
    await ctx.db.patch(existingVariant._id, variant);
    return existingVariant._id;
  }

  return await ctx.db.insert("practice_variants", variant);
}

export async function upsertIm3GuidedPilotPracticeItem(
  ctx: MutationCtx,
  activityId: Id<"activities">,
  now: number,
): Promise<Id<"practice_items">> {
  const documents = buildIm3GuidedPilotSeedDocuments(activityId, now);
  const byVariant = await ctx.db
    .query("practice_items")
    .withIndex("by_variantKey", (q) => q.eq("variantKey", IM3_GUIDED_VARIANT_KEY))
    .take(2);
  const byActivity = await ctx.db
    .query("practice_items")
    .withIndex("by_activityId", (q) => q.eq("activityId", activityId))
    .take(2);
  const mappedRows = [...new Map(
    [...byVariant, ...byActivity].map((row) => [String(row._id), row]),
  ).values()];
  if (
    mappedRows.length > 1
    || mappedRows.some((row) => (
      row.variantKey !== IM3_GUIDED_VARIANT_KEY
      || String(row.activityId) !== String(activityId)
      || row.practiceItemId !== documents.item.practiceItemId
    ))
  ) {
    throw new Error("Duplicate or conflicting IM3 Guided practice-item mapping");
  }

  const parsedItem = practiceItemSchema.safeParse({
    practiceItemId: documents.item.practiceItemId,
    activityId,
    variantKey: documents.item.variantKey,
    variantLabel: documents.item.variantLabel,
  });
  if (!parsedItem.success) {
    throw new Error(`IM3 Guided practice item is invalid: ${parsedItem.error.message}`);
  }

  const existingItem = mappedRows[0];
  if (existingItem) {
    await ctx.db.patch(existingItem._id, documents.item);
    return existingItem._id;
  }

  return await ctx.db.insert("practice_items", documents.item);
}

export async function upsertIm3GraphGuidedSeed2Activity(
  ctx: MutationCtx,
  now: number,
): Promise<Id<"activities">> {
  const existingActivity = await ctx.db
    .query("activities")
    .withIndex("by_stable_activity_id", (q) => (
      q.eq("stableActivityId", IM3_GRAPH_GUIDED_SEED_2_ACTIVITY_ID)
    ))
    .unique();
  const activity = buildIm3GraphGuidedSeed2Documents(
    existingActivity?._id ?? "activities:pending" as Id<"activities">,
    now,
  ).activity;

  if (existingActivity) {
    await ctx.db.patch(existingActivity._id, activity);
    return existingActivity._id;
  }

  return await ctx.db.insert("activities", activity);
}

export async function upsertIm3GraphGuidedSeed2Variant(
  ctx: MutationCtx,
  now: number,
): Promise<Id<"practice_variants">> {
  const existingVariant = await ctx.db
    .query("practice_variants")
    .withIndex("by_variantKey", (q) => (
      q.eq("variantKey", IM3_GRAPH_GUIDED_SEED_2_VARIANT_KEY)
    ))
    .unique();
  const variant = buildIm3GraphGuidedSeed2Documents(
    "activities:pending" as Id<"activities">,
    now,
  ).variant;

  if (existingVariant) {
    await ctx.db.patch(existingVariant._id, variant);
    return existingVariant._id;
  }

  return await ctx.db.insert("practice_variants", variant);
}

export async function upsertIm3GraphGuidedSeed2PracticeItem(
  ctx: MutationCtx,
  activityId: Id<"activities">,
  now: number,
): Promise<Id<"practice_items">> {
  const documents = buildIm3GraphGuidedSeed2Documents(activityId, now);
  const byVariant = await ctx.db
    .query("practice_items")
    .withIndex("by_variantKey", (q) => q.eq("variantKey", IM3_GRAPH_GUIDED_SEED_2_VARIANT_KEY))
    .take(2);
  const byActivity = await ctx.db
    .query("practice_items")
    .withIndex("by_activityId", (q) => q.eq("activityId", activityId))
    .take(2);
  const mappedRows = [...new Map(
    [...byVariant, ...byActivity].map((row) => [String(row._id), row]),
  ).values()];
  if (
    mappedRows.length > 1
    || mappedRows.some((row) => (
      row.variantKey !== IM3_GRAPH_GUIDED_SEED_2_VARIANT_KEY
      || String(row.activityId) !== String(activityId)
      || row.practiceItemId !== documents.item.practiceItemId
    ))
  ) {
    throw new Error("Duplicate or conflicting IM3 graph Guided seed-2 practice-item mapping");
  }

  const parsedItem = practiceItemSchema.safeParse({
    practiceItemId: documents.item.practiceItemId,
    activityId,
    variantKey: documents.item.variantKey,
    variantLabel: documents.item.variantLabel,
  });
  if (!parsedItem.success) {
    throw new Error(`IM3 graph Guided seed-2 practice item is invalid: ${parsedItem.error.message}`);
  }

  const existingItem = mappedRows[0];
  if (existingItem) {
    await ctx.db.patch(existingItem._id, documents.item);
    return existingItem._id;
  }

  return await ctx.db.insert("practice_items", documents.item);
}

export async function upsertIm3DomainRangeIndependentSeed2Activity(
  ctx: MutationCtx,
  now: number,
): Promise<Id<"activities">> {
  const existingActivity = await ctx.db
    .query("activities")
    .withIndex("by_stable_activity_id", (q) => (
      q.eq("stableActivityId", IM3_DOMAIN_RANGE_INDEPENDENT_SEED_2_ACTIVITY_ID)
    ))
    .unique();
  const activity = buildIm3DomainRangeIndependentSeed2Documents(
    existingActivity?._id ?? "activities:pending" as Id<"activities">,
    now,
  ).activity;

  if (existingActivity) {
    await ctx.db.patch(existingActivity._id, {
      ...activity,
      createdAt: existingActivity.createdAt,
    });
    return existingActivity._id;
  }

  return await ctx.db.insert("activities", activity);
}

export async function upsertIm3DomainRangeIndependentSeed2Variant(
  ctx: MutationCtx,
  now: number,
): Promise<Id<"practice_variants">> {
  const existingVariant = await ctx.db
    .query("practice_variants")
    .withIndex("by_variantKey", (q) => (
      q.eq("variantKey", IM3_DOMAIN_RANGE_INDEPENDENT_SEED_2_VARIANT_KEY)
    ))
    .unique();
  const variant = buildIm3DomainRangeIndependentSeed2Documents(
    "activities:pending" as Id<"activities">,
    now,
  ).variant;

  if (existingVariant) {
    await ctx.db.patch(existingVariant._id, variant);
    return existingVariant._id;
  }

  return await ctx.db.insert("practice_variants", variant);
}

export async function upsertIm3DomainRangeIndependentSeed2PracticeItem(
  ctx: MutationCtx,
  activityId: Id<"activities">,
  now: number,
): Promise<Id<"practice_items">> {
  const documents = buildIm3DomainRangeIndependentSeed2Documents(activityId, now);
  const byVariant = await ctx.db
    .query("practice_items")
    .withIndex("by_variantKey", (q) => (
      q.eq("variantKey", IM3_DOMAIN_RANGE_INDEPENDENT_SEED_2_VARIANT_KEY)
    ))
    .take(2);
  const byActivity = await ctx.db
    .query("practice_items")
    .withIndex("by_activityId", (q) => q.eq("activityId", activityId))
    .take(2);
  const mappedRows = [...new Map(
    [...byVariant, ...byActivity].map((row) => [String(row._id), row]),
  ).values()];
  if (
    mappedRows.length > 1
    || mappedRows.some((row) => (
      row.variantKey !== IM3_DOMAIN_RANGE_INDEPENDENT_SEED_2_VARIANT_KEY
      || String(row.activityId) !== String(activityId)
      || row.practiceItemId !== documents.item.practiceItemId
    ))
  ) {
    throw new Error("Duplicate or conflicting IM3 domain-range Independent seed-2 practice-item mapping");
  }

  const parsedItem = practiceItemSchema.safeParse({
    practiceItemId: documents.item.practiceItemId,
    activityId,
    variantKey: documents.item.variantKey,
    variantLabel: documents.item.variantLabel,
  });
  if (!parsedItem.success) {
    throw new Error("IM3 domain-range Independent seed-2 practice item is invalid: " + parsedItem.error.message);
  }

  const existingItem = mappedRows[0];
  if (existingItem) {
    await ctx.db.patch(existingItem._id, documents.item);
    return existingItem._id;
  }

  return await ctx.db.insert("practice_items", documents.item);
}

export async function upsertIm3GraphIndependentSeed2Activity(
  ctx: MutationCtx,
  now: number,
): Promise<Id<"activities">> {
  const existingActivity = await ctx.db
    .query("activities")
    .withIndex("by_stable_activity_id", (q) => (
      q.eq("stableActivityId", IM3_GRAPH_INDEPENDENT_SEED_2_ACTIVITY_ID)
    ))
    .unique();
  const activity = buildIm3GraphIndependentSeed2Documents(
    existingActivity?._id ?? "activities:pending" as Id<"activities">,
    now,
  ).activity;

  if (existingActivity) {
    await ctx.db.patch(existingActivity._id, activity);
    return existingActivity._id;
  }

  return await ctx.db.insert("activities", activity);
}

export async function upsertIm3GraphIndependentSeed2Variant(
  ctx: MutationCtx,
  now: number,
): Promise<Id<"practice_variants">> {
  const existingVariant = await ctx.db
    .query("practice_variants")
    .withIndex("by_variantKey", (q) => (
      q.eq("variantKey", IM3_GRAPH_INDEPENDENT_SEED_2_VARIANT_KEY)
    ))
    .unique();
  const variant = buildIm3GraphIndependentSeed2Documents(
    "activities:pending" as Id<"activities">,
    now,
  ).variant;

  if (existingVariant) {
    await ctx.db.patch(existingVariant._id, variant);
    return existingVariant._id;
  }

  return await ctx.db.insert("practice_variants", variant);
}

export async function upsertIm3GraphIndependentSeed2PracticeItem(
  ctx: MutationCtx,
  activityId: Id<"activities">,
  now: number,
): Promise<Id<"practice_items">> {
  const documents = buildIm3GraphIndependentSeed2Documents(activityId, now);
  const byVariant = await ctx.db
    .query("practice_items")
    .withIndex("by_variantKey", (q) => q.eq("variantKey", IM3_GRAPH_INDEPENDENT_SEED_2_VARIANT_KEY))
    .take(2);
  const byActivity = await ctx.db
    .query("practice_items")
    .withIndex("by_activityId", (q) => q.eq("activityId", activityId))
    .take(2);
  const mappedRows = [...new Map(
    [...byVariant, ...byActivity].map((row) => [String(row._id), row]),
  ).values()];
  if (
    mappedRows.length > 1
    || mappedRows.some((row) => (
      row.variantKey !== IM3_GRAPH_INDEPENDENT_SEED_2_VARIANT_KEY
      || String(row.activityId) !== String(activityId)
      || row.practiceItemId !== documents.item.practiceItemId
    ))
  ) {
    throw new Error("Duplicate or conflicting IM3 graph Independent seed-2 practice-item mapping");
  }

  const parsedItem = practiceItemSchema.safeParse({
    practiceItemId: documents.item.practiceItemId,
    activityId,
    variantKey: documents.item.variantKey,
    variantLabel: documents.item.variantLabel,
  });
  if (!parsedItem.success) {
    throw new Error(`IM3 graph Independent seed-2 practice item is invalid: ${parsedItem.error.message}`);
  }

  const existingItem = mappedRows[0];
  if (existingItem) {
    await ctx.db.patch(existingItem._id, documents.item);
    return existingItem._id;
  }

  return await ctx.db.insert("practice_items", documents.item);
}

const IM3_PROFIT_MODEL_GENERATOR_KEY = "quadratic-profit-model" as const;

function parseSeedFillInTheBlankProps(value: unknown) {
  const props = fillInTheBlankSchema.parse(value);
  const blanks = props.blanks.map((blank) => {
    if (typeof blank.correctAnswer !== "string") {
      throw new Error(`Seed blank ${blank.id} must include a correct answer`);
    }
    return { ...blank, correctAnswer: blank.correctAnswer };
  });
  return { ...props, blanks };
}

export function buildIm3ProfitModelWorkedSeedDocument(now: number) {
  const generated = getGenerator(IM3_PROFIT_MODEL_GENERATOR_KEY).generate({
    nodeId: IM3_PROFIT_MODEL_NODE,
    seed: 0,
    difficulty: 0.5,
  });
  const generatedFillInTheBlankProps = parseSeedFillInTheBlankProps(
    generated.data.rendererProps,
  );
  const fillInTheBlankProps = {
    template:
      "A ski resort sells 680 passes at a base price of $120. Each price increase is $5, and 20 fewer passes are sold for each increase. Let x be the number of price increases. Worked solution: p(x) = 120 + 5x; s(x) = 680 - 20x; P(x) = (120 + 5x)(680 - 20x) = 120(680) - 120(20x) + 5x(680) - 5x(20x) = -100x^2 + 1000x + 81600. Check the key values: base price {{blank:priceBase}}, price increase {{blank:priceStep}}, base sales {{blank:salesBase}}, sales loss {{blank:salesLoss}}, a {{blank:coefficientA}}, b {{blank:coefficientB}}, and c {{blank:coefficientC}}.",
    blanks: generatedFillInTheBlankProps.blanks,
  };

  const partIds = Object.keys(generated.expectedAnswer);
  const rubric = partIds.map((partId) => ({
    criteria: `Correct ${partId}`,
    partId,
    points: generated.gradingMetadata.partMaxScores[partId],
  }));

  return {
    componentKey: "fill-in-the-blank" as const,
    displayName: "Build and simplify a quadratic profit model",
    description: "Worked Example 3: Build and simplify a quadratic profit model from context.",
    props: fillInTheBlankProps,
    gradingConfig: {
      autoGrade: true,
      passingScore: partIds.length,
      partialCredit: true,
      partIds,
      rubric,
    },
    stableActivityId: IM3_PROFIT_MODEL_WORKED_ACTIVITY_ID,
    masteryNodeId: IM3_PROFIT_MODEL_NODE,
    learningEvidenceMode: "worked_example" as const,
    srsEligible: false as const,
    createdAt: now,
    updatedAt: now,
  };
}

export function buildIm3ProfitMaximumWorkedSeedDocument(now: number) {
  const generated = getGenerator(IM3_PROFIT_MODEL_GENERATOR_KEY).generate({
    nodeId: IM3_PROFIT_MAXIMUM_NODE,
    seed: 0,
    difficulty: 0.5,
  });
  const props = parseSeedFillInTheBlankProps(generated.data.rendererProps);
  const partIds = Object.keys(generated.expectedAnswer);
  const rubric = partIds.map((partId) => ({
    criteria: `Correct ${partId}`,
    partId,
    points: generated.gradingMetadata.partMaxScores[partId],
  }));

  return {
    componentKey: "fill-in-the-blank" as const,
    displayName: "Find and interpret the maximum of a quadratic profit model",
    description: "Worked Example 3: Find and interpret the maximum of a quadratic profit model.",
    props,
    gradingConfig: {
      autoGrade: true,
      passingScore: 3,
      partialCredit: true,
      partIds,
      rubric,
    },
    stableActivityId: IM3_PROFIT_MAXIMUM_WORKED_ACTIVITY_ID,
    masteryNodeId: IM3_PROFIT_MAXIMUM_NODE,
    learningEvidenceMode: "worked_example" as const,
    srsEligible: false as const,
    createdAt: now,
    updatedAt: now,
  };
}

export function buildIm3ProfitMaximumGuidedSeedDocuments(
  activityId: Id<"activities">,
  now: number,
) {
  const generated = getGenerator(IM3_PROFIT_MODEL_GENERATOR_KEY).generate({
    nodeId: IM3_PROFIT_MAXIMUM_NODE,
    seed: 1,
    difficulty: 0.5,
  });
  const props = parseSeedFillInTheBlankProps(generated.data.rendererProps);
  const partIds = Object.keys(generated.expectedAnswer);
  const rubric = partIds.map((partId) => ({
    criteria: `Correct ${partId}`,
    partId,
    points: generated.gradingMetadata.partMaxScores[partId],
  }));

  return {
    activity: {
      componentKey: "fill-in-the-blank" as const,
      displayName: "Mastery Advantage: Find and interpret a quadratic profit maximum",
      description: "Guided practice for IM3 Example 3.",
      props,
      gradingConfig: {
        autoGrade: true,
        passingScore: 3,
        partialCredit: true,
        partIds,
        rubric,
      },
      stableActivityId: IM3_PROFIT_MAXIMUM_GUIDED_ACTIVITY_ID,
      masteryNodeId: IM3_PROFIT_MAXIMUM_NODE,
      srsEligible: true as const,
      createdAt: now,
      updatedAt: now,
    },
    variant: {
      variantKey: IM3_PROFIT_MAXIMUM_GUIDED_ACTIVITY_ID,
      legacyProblemFamilyId: IM3_PROFIT_MAXIMUM_GUIDED_ACTIVITY_ID,
      migrationVersion: "kst-srs.v3.2" as const,
      sourceTimestamp: now,
      componentKey: "fill-in-the-blank" as const,
      displayName: "Find and interpret a quadratic profit maximum",
      description: "Use a ski-pass context to find and interpret a quadratic profit maximum.",
      objectiveIds: [IM3_PROFIT_MAXIMUM_NODE],
      difficulty: "standard" as const,
      metadata: {
        stableActivityId: IM3_PROFIT_MAXIMUM_GUIDED_ACTIVITY_ID,
      },
    },
    item: {
      practiceItemId: `${IM3_PROFIT_MAXIMUM_GUIDED_ACTIVITY_ID}:seed-1`,
      activityId,
      variantKey: IM3_PROFIT_MAXIMUM_GUIDED_ACTIVITY_ID,
      legacyProblemFamilyId: IM3_PROFIT_MAXIMUM_GUIDED_ACTIVITY_ID,
      migrationVersion: "kst-srs.v3.2" as const,
      sourceTimestamp: now,
      variantLabel: "Seed 1",
    },
  };
}

export function buildIm3ProfitMaximumIndependentSeedDocuments(
  activityId: Id<"activities">,
  now: number,
) {
  const generated = getGenerator(IM3_PROFIT_MODEL_GENERATOR_KEY).generate({
    nodeId: IM3_PROFIT_MAXIMUM_NODE,
    seed: 2,
    difficulty: 0.5,
  });
  const props = parseSeedFillInTheBlankProps(generated.data.rendererProps);
  const partIds = Object.keys(generated.expectedAnswer);
  const rubric = partIds.map((partId) => ({
    criteria: `Correct ${partId}`,
    partId,
    points: generated.gradingMetadata.partMaxScores[partId],
  }));

  return {
    activity: {
      componentKey: "fill-in-the-blank" as const,
      displayName: "Mastery Advantage: Find and interpret a quadratic profit maximum",
      description: "Independent practice for IM3 Example 3.",
      props,
      gradingConfig: {
        autoGrade: true,
        passingScore: 3,
        partialCredit: true,
        partIds,
        rubric,
      },
      stableActivityId: IM3_PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
      masteryNodeId: IM3_PROFIT_MAXIMUM_NODE,
      srsEligible: true as const,
      createdAt: now,
      updatedAt: now,
    },
    variant: {
      variantKey: IM3_PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
      legacyProblemFamilyId: IM3_PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
      migrationVersion: "kst-srs.v3.2" as const,
      sourceTimestamp: now,
      componentKey: "fill-in-the-blank" as const,
      displayName: "Find and interpret a quadratic profit maximum",
      description: "Use a ski-pass context to find and interpret a quadratic profit maximum.",
      objectiveIds: [IM3_PROFIT_MAXIMUM_NODE],
      difficulty: "standard" as const,
      metadata: {
        stableActivityId: IM3_PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
      },
    },
    item: {
      practiceItemId: `${IM3_PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY_ID}:seed-2`,
      activityId,
      variantKey: IM3_PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
      legacyProblemFamilyId: IM3_PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
      migrationVersion: "kst-srs.v3.2" as const,
      sourceTimestamp: now,
      variantLabel: "Seed 2",
    },
  };
}

export function buildIm3ProfitModelGuidedSeedDocuments(
  activityId: Id<"activities">,
  now: number,
) {
  const generated = getGenerator(IM3_PROFIT_MODEL_GENERATOR_KEY).generate({
    nodeId: IM3_PROFIT_MODEL_NODE,
    seed: 1,
    difficulty: 0.5,
  });
  const fillInTheBlankProps = parseSeedFillInTheBlankProps(
    generated.data.rendererProps,
  );
  const partIds = Object.keys(generated.expectedAnswer);
  const rubric = partIds.map((partId) => ({
    criteria: `Correct ${partId}`,
    partId,
    points: generated.gradingMetadata.partMaxScores[partId],
  }));

  return {
    activity: {
      componentKey: "fill-in-the-blank" as const,
      displayName: "Mastery Advantage: Build a quadratic profit model",
      description: "Guided practice for the IM3 Example 3 profit model.",
      props: fillInTheBlankProps,
      gradingConfig: {
        autoGrade: true,
        passingScore: partIds.length,
        partialCredit: true,
        partIds,
        rubric,
      },
      stableActivityId: IM3_PROFIT_MODEL_GUIDED_ACTIVITY_ID,
      masteryNodeId: IM3_PROFIT_MODEL_NODE,
      srsEligible: true,
      createdAt: now,
      updatedAt: now,
    },
    variant: {
      variantKey: IM3_PROFIT_MODEL_GUIDED_ACTIVITY_ID,
      legacyProblemFamilyId: IM3_PROFIT_MODEL_GUIDED_ACTIVITY_ID,
      migrationVersion: "kst-srs.v3.2" as const,
      sourceTimestamp: now,
      componentKey: "fill-in-the-blank",
      displayName: "Build and simplify a quadratic profit model",
      description: "Guided practice for a ski-pass quadratic profit model.",
      objectiveIds: [IM3_PROFIT_MODEL_NODE],
      difficulty: "standard",
      metadata: {
        stableActivityId: IM3_PROFIT_MODEL_GUIDED_ACTIVITY_ID,
      },
    },
    item: {
      practiceItemId: `${IM3_PROFIT_MODEL_GUIDED_ACTIVITY_ID}:seed-1`,
      activityId,
      variantKey: IM3_PROFIT_MODEL_GUIDED_ACTIVITY_ID,
      legacyProblemFamilyId: IM3_PROFIT_MODEL_GUIDED_ACTIVITY_ID,
      migrationVersion: "kst-srs.v3.2" as const,
      sourceTimestamp: now,
      variantLabel: "Seed 1",
    },
  };
}

export function buildIm3ProfitModelIndependentSeedDocuments(
  activityId: Id<"activities">,
  now: number,
) {
  const generated = getGenerator(IM3_PROFIT_MODEL_GENERATOR_KEY).generate({
    nodeId: IM3_PROFIT_MODEL_NODE,
    seed: 2,
    difficulty: 0.5,
  });
  const fillInTheBlankProps = parseSeedFillInTheBlankProps(
    generated.data.rendererProps,
  );

  const partIds = Object.keys(generated.expectedAnswer);
  const rubric = partIds.map((partId) => ({
    criteria: `Correct ${partId}`,
    partId,
    points: generated.gradingMetadata.partMaxScores[partId],
  }));

  return {
    activity: {
      componentKey: "fill-in-the-blank" as const,
      displayName: "Mastery Advantage: Build a quadratic profit model",
      description: "Independent practice for the IM3 Example 3 profit model.",
      props: fillInTheBlankProps,
      gradingConfig: {
        autoGrade: true,
        passingScore: partIds.length,
        partialCredit: true,
        partIds,
        rubric,
      },
      stableActivityId: IM3_PROFIT_MODEL_INDEPENDENT_ACTIVITY_ID,
      masteryNodeId: IM3_PROFIT_MODEL_NODE,
      srsEligible: true,
      createdAt: now,
      updatedAt: now,
    },
    variant: {
      variantKey: IM3_PROFIT_MODEL_INDEPENDENT_ACTIVITY_ID,
      legacyProblemFamilyId: IM3_PROFIT_MODEL_INDEPENDENT_ACTIVITY_ID,
      migrationVersion: "kst-srs.v3.2" as const,
      sourceTimestamp: now,
      componentKey: "fill-in-the-blank",
      displayName: "Build and simplify a quadratic profit model",
      description: "Use a ski-pass context to build and simplify a quadratic profit model.",
      objectiveIds: [IM3_PROFIT_MODEL_NODE],
      difficulty: "standard",
      metadata: {
        stableActivityId: IM3_PROFIT_MODEL_INDEPENDENT_ACTIVITY_ID,
      },
    },
    item: {
      practiceItemId: `${IM3_PROFIT_MODEL_INDEPENDENT_ACTIVITY_ID}:seed-2`,
      activityId,
      variantKey: IM3_PROFIT_MODEL_INDEPENDENT_ACTIVITY_ID,
      legacyProblemFamilyId: IM3_PROFIT_MODEL_INDEPENDENT_ACTIVITY_ID,
      migrationVersion: "kst-srs.v3.2" as const,
      sourceTimestamp: now,
      variantLabel: "Seed 2",
    },
  };
}

export async function upsertIm3ProfitModelWorkedActivity(
  ctx: MutationCtx,
  now: number,
): Promise<Id<"activities">> {
  const existingActivity = await ctx.db
    .query("activities")
    .withIndex("by_stable_activity_id", (q) => (
      q.eq("stableActivityId", IM3_PROFIT_MODEL_WORKED_ACTIVITY_ID)
    ))
    .unique();
  const activity = buildIm3ProfitModelWorkedSeedDocument(now);

  if (existingActivity) {
    await ctx.db.patch(existingActivity._id, {
      ...activity,
      createdAt: existingActivity.createdAt,
    });
    return existingActivity._id;
  }

  return await ctx.db.insert("activities", activity);
}

export async function upsertIm3ProfitMaximumWorkedActivity(
  ctx: MutationCtx,
  now: number,
): Promise<Id<"activities">> {
  const existingActivity = await ctx.db
    .query("activities")
    .withIndex("by_stable_activity_id", (q) => (
      q.eq("stableActivityId", IM3_PROFIT_MAXIMUM_WORKED_ACTIVITY_ID)
    ))
    .unique();
  const activity = buildIm3ProfitMaximumWorkedSeedDocument(now);

  if (existingActivity) {
    await ctx.db.patch(existingActivity._id, {
      ...activity,
      createdAt: existingActivity.createdAt,
    });
    return existingActivity._id;
  }

  return await ctx.db.insert("activities", activity);
}

export async function upsertIm3ProfitMaximumGuidedActivity(
  ctx: MutationCtx,
  now: number,
): Promise<Id<"activities">> {
  const existingActivity = await ctx.db
    .query("activities")
    .withIndex("by_stable_activity_id", (q) => (
      q.eq("stableActivityId", IM3_PROFIT_MAXIMUM_GUIDED_ACTIVITY_ID)
    ))
    .unique();
  const activity = buildIm3ProfitMaximumGuidedSeedDocuments(
    existingActivity?._id ?? "activities:pending" as Id<"activities">,
    now,
  ).activity;

  if (existingActivity) {
    await ctx.db.patch(existingActivity._id, {
      ...activity,
      createdAt: existingActivity.createdAt,
    });
    return existingActivity._id;
  }

  return await ctx.db.insert("activities", activity);
}

export async function upsertIm3ProfitMaximumIndependentActivity(
  ctx: MutationCtx,
  now: number,
): Promise<Id<"activities">> {
  const existingActivity = await ctx.db
    .query("activities")
    .withIndex("by_stable_activity_id", (q) => (
      q.eq("stableActivityId", IM3_PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY_ID)
    ))
    .unique();
  const activity = buildIm3ProfitMaximumIndependentSeedDocuments(
    existingActivity?._id ?? "activities:pending" as Id<"activities">,
    now,
  ).activity;

  if (existingActivity) {
    await ctx.db.patch(existingActivity._id, {
      ...activity,
      createdAt: existingActivity.createdAt,
    });
    return existingActivity._id;
  }

  return await ctx.db.insert("activities", activity);
}

export async function upsertIm3ProfitMaximumGuidedVariant(
  ctx: MutationCtx,
  now: number,
): Promise<Id<"practice_variants">> {
  const existingVariant = await ctx.db
    .query("practice_variants")
    .withIndex("by_variantKey", (q) => (
      q.eq("variantKey", IM3_PROFIT_MAXIMUM_GUIDED_ACTIVITY_ID)
    ))
    .unique();
  const variant = buildIm3ProfitMaximumGuidedSeedDocuments(
    "activities:pending" as Id<"activities">,
    now,
  ).variant;

  if (existingVariant) {
    await ctx.db.patch(existingVariant._id, variant);
    return existingVariant._id;
  }

  return await ctx.db.insert("practice_variants", variant);
}

export async function upsertIm3ProfitMaximumIndependentVariant(
  ctx: MutationCtx,
  now: number,
): Promise<Id<"practice_variants">> {
  const existingVariant = await ctx.db
    .query("practice_variants")
    .withIndex("by_variantKey", (q) => (
      q.eq("variantKey", IM3_PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY_ID)
    ))
    .unique();
  const variant = buildIm3ProfitMaximumIndependentSeedDocuments(
    "activities:pending" as Id<"activities">,
    now,
  ).variant;

  if (existingVariant) {
    await ctx.db.patch(existingVariant._id, variant);
    return existingVariant._id;
  }

  return await ctx.db.insert("practice_variants", variant);
}

export async function upsertIm3ProfitModelGuidedActivity(
  ctx: MutationCtx,
  now: number,
): Promise<Id<"activities">> {
  const existingActivity = await ctx.db
    .query("activities")
    .withIndex("by_stable_activity_id", (q) => (
      q.eq("stableActivityId", IM3_PROFIT_MODEL_GUIDED_ACTIVITY_ID)
    ))
    .unique();
  const activity = buildIm3ProfitModelGuidedSeedDocuments(
    existingActivity?._id ?? "activities:pending" as Id<"activities">,
    now,
  ).activity;

  if (existingActivity) {
    await ctx.db.patch(existingActivity._id, {
      ...activity,
      createdAt: existingActivity.createdAt,
    });
    return existingActivity._id;
  }

  return await ctx.db.insert("activities", activity);
}

export async function upsertIm3ProfitModelGuidedVariant(
  ctx: MutationCtx,
  now: number,
): Promise<Id<"practice_variants">> {
  const existingVariant = await ctx.db
    .query("practice_variants")
    .withIndex("by_variantKey", (q) => (
      q.eq("variantKey", IM3_PROFIT_MODEL_GUIDED_ACTIVITY_ID)
    ))
    .unique();
  const variant = buildIm3ProfitModelGuidedSeedDocuments(
    "activities:pending" as Id<"activities">,
    now,
  ).variant;

  if (existingVariant) {
    await ctx.db.patch(existingVariant._id, variant);
    return existingVariant._id;
  }

  return await ctx.db.insert("practice_variants", variant);
}

export async function linkIm3ProfitModelWorkedPhase(
  ctx: MutationCtx,
  lessonVersionId: Id<"lesson_versions">,
  activityId: Id<"activities">,
): Promise<void> {
  const phase = await ctx.db
    .query("phase_versions")
    .withIndex("by_lesson_version_and_phase", (q) => (
      q.eq("lessonVersionId", lessonVersionId).eq("phaseNumber", 6)
    ))
    .first();
  if (!phase) {
    throw new Error("Lesson 1.1 Phase 6 is missing");
  }

  const sections = await ctx.db
    .query("phase_sections")
    .withIndex("by_phase_version", (q) => q.eq("phaseVersionId", phase._id))
    .collect();
  const textSection = sections.find((section) => (
    section.sequenceOrder === 1 && section.sectionType === "text"
  ));
  if (!textSection) {
    throw new Error("Lesson 1.1 Phase 6 text section is missing");
  }
  const activitySection = sections.find((section) => (
    section.sequenceOrder === 2 && section.sectionType === "activity"
  ));
  if (!activitySection) {
    throw new Error("Lesson 1.1 Phase 6 activity section is missing");
  }

  await ctx.db.patch(textSection._id, {
    content: {
      markdown: "## Example 3: Use Quadratic Functions\n\nA ski resort sold 680 holiday weekend passes at &#36;120 per pass. For each &#36;5 price increase, it expects to sell 20 fewer passes. Let x be the number of &#36;5 price increases. Build and simplify P(x) = (120 + 5x)(680 - 20x).",
    },
  });
  await ctx.db.patch(activitySection._id, {
    content: {
      componentKey: "fill-in-the-blank",
      activityId,
    },
  });
}

export async function linkIm3ProfitMaximumWorkedPhase(
  ctx: MutationCtx,
  lessonVersionId: Id<"lesson_versions">,
  activityId: Id<"activities">,
  now: number,
): Promise<void> {
  const phase = await ctx.db
    .query("phase_versions")
    .withIndex("by_lesson_version_and_phase", (q) => (
      q.eq("lessonVersionId", lessonVersionId).eq("phaseNumber", 6)
    ))
    .first();
  if (!phase) {
    throw new Error("Lesson 1.1 Phase 6 is missing");
  }

  const sections = await ctx.db
    .query("phase_sections")
    .withIndex("by_phase_version", (q) => q.eq("phaseVersionId", phase._id))
    .collect();
  const existingActivitySection = sections.find((section) => {
    if (section.sectionType !== "activity") return false;
    const content = section.content as { activityId?: string };
    return String(content.activityId) === String(activityId);
  });
  if (existingActivitySection) {
    const content = existingActivitySection.content as { componentKey?: string };
    if (content.componentKey !== "fill-in-the-blank") {
      await ctx.db.patch(existingActivitySection._id, {
        content: {
          componentKey: "fill-in-the-blank",
          activityId,
        },
      });
    }
    return;
  }

  const occupiedSequence = sections.find((section) => section.sequenceOrder === 3);
  if (occupiedSequence) {
    throw new Error("Lesson 1.1 Phase 6 sequence 3 is occupied");
  }

  await ctx.db.insert("phase_sections", {
    phaseVersionId: phase._id,
    sequenceOrder: 3,
    sectionType: "activity",
    content: {
      componentKey: "fill-in-the-blank",
      activityId,
    },
    createdAt: now,
  });
}

export async function upsertIm3ProfitModelIndependentActivity(
  ctx: MutationCtx,
  now: number,
): Promise<Id<"activities">> {
  const existingActivity = await ctx.db
    .query("activities")
    .withIndex("by_stable_activity_id", (q) => (
      q.eq("stableActivityId", IM3_PROFIT_MODEL_INDEPENDENT_ACTIVITY_ID)
    ))
    .unique();
  const activity = buildIm3ProfitModelIndependentSeedDocuments(
    existingActivity?._id ?? "activities:pending" as Id<"activities">,
    now,
  ).activity;

  if (existingActivity) {
    await ctx.db.patch(existingActivity._id, activity);
    return existingActivity._id;
  }

  return await ctx.db.insert("activities", activity);
}

export async function upsertIm3ProfitModelIndependentVariant(
  ctx: MutationCtx,
  now: number,
): Promise<Id<"practice_variants">> {
  const existingVariant = await ctx.db
    .query("practice_variants")
    .withIndex("by_variantKey", (q) => (
      q.eq("variantKey", IM3_PROFIT_MODEL_INDEPENDENT_ACTIVITY_ID)
    ))
    .unique();
  const variant = buildIm3ProfitModelIndependentSeedDocuments(
    "activities:pending" as Id<"activities">,
    now,
  ).variant;

  if (existingVariant) {
    await ctx.db.patch(existingVariant._id, variant);
    return existingVariant._id;
  }

  return await ctx.db.insert("practice_variants", variant);
}

export async function upsertIm3ProfitModelIndependentPracticeItem(
  ctx: MutationCtx,
  activityId: Id<"activities">,
  now: number,
): Promise<Id<"practice_items">> {
  const documents = buildIm3ProfitModelIndependentSeedDocuments(activityId, now);
  const byVariant = await ctx.db
    .query("practice_items")
    .withIndex("by_variantKey", (q) => q.eq("variantKey", IM3_PROFIT_MODEL_INDEPENDENT_ACTIVITY_ID))
    .take(2);
  const byActivity = await ctx.db
    .query("practice_items")
    .withIndex("by_activityId", (q) => q.eq("activityId", activityId))
    .take(2);
  const mappedRows = [...new Map(
    [...byVariant, ...byActivity].map((row) => [String(row._id), row]),
  ).values()];
  if (
    mappedRows.length > 1
    || mappedRows.some((row) => (
      row.variantKey !== IM3_PROFIT_MODEL_INDEPENDENT_ACTIVITY_ID
      || String(row.activityId) !== String(activityId)
      || row.practiceItemId !== documents.item.practiceItemId
    ))
  ) {
    throw new Error("Duplicate or conflicting IM3 profit-model practice-item mapping");
  }

  const parsedItem = practiceItemSchema.safeParse({
    practiceItemId: documents.item.practiceItemId,
    activityId,
    variantKey: documents.item.variantKey,
    variantLabel: documents.item.variantLabel,
  });
  if (!parsedItem.success) {
    throw new Error(`IM3 profit-model practice item is invalid: ${parsedItem.error.message}`);
  }

  const existingItem = mappedRows[0];
  if (existingItem) {
    await ctx.db.patch(existingItem._id, documents.item);
    return existingItem._id;
  }

  return await ctx.db.insert("practice_items", documents.item);
}

export async function upsertIm3ProfitModelGuidedPracticeItem(
  ctx: MutationCtx,
  activityId: Id<"activities">,
  now: number,
): Promise<Id<"practice_items">> {
  const documents = buildIm3ProfitModelGuidedSeedDocuments(activityId, now);
  const byVariant = await ctx.db
    .query("practice_items")
    .withIndex("by_variantKey", (q) => q.eq("variantKey", IM3_PROFIT_MODEL_GUIDED_ACTIVITY_ID))
    .take(2);
  const byActivity = await ctx.db
    .query("practice_items")
    .withIndex("by_activityId", (q) => q.eq("activityId", activityId))
    .take(2);
  const mappedRows = [...new Map(
    [...byVariant, ...byActivity].map((row) => [String(row._id), row]),
  ).values()];
  if (
    mappedRows.length > 1
    || mappedRows.some((row) => (
      row.variantKey !== IM3_PROFIT_MODEL_GUIDED_ACTIVITY_ID
      || String(row.activityId) !== String(activityId)
      || row.practiceItemId !== documents.item.practiceItemId
    ))
  ) {
    throw new Error("Duplicate or conflicting IM3 profit-model Guided practice-item mapping");
  }

  const parsedItem = practiceItemSchema.safeParse({
    practiceItemId: documents.item.practiceItemId,
    activityId,
    variantKey: documents.item.variantKey,
    variantLabel: documents.item.variantLabel,
  });
  if (!parsedItem.success) {
    throw new Error(`IM3 Guided profit-model practice item is invalid: ${parsedItem.error.message}`);
  }

  const existingItem = mappedRows[0];
  if (existingItem) {
    await ctx.db.patch(existingItem._id, documents.item);
    return existingItem._id;
  }

  return await ctx.db.insert("practice_items", documents.item);
}

export async function upsertIm3ProfitMaximumGuidedPracticeItem(
  ctx: MutationCtx,
  activityId: Id<"activities">,
  now: number,
): Promise<Id<"practice_items">> {
  const documents = buildIm3ProfitMaximumGuidedSeedDocuments(activityId, now);
  const byVariant = await ctx.db
    .query("practice_items")
    .withIndex("by_variantKey", (q) => q.eq("variantKey", IM3_PROFIT_MAXIMUM_GUIDED_ACTIVITY_ID))
    .take(2);
  const byActivity = await ctx.db
    .query("practice_items")
    .withIndex("by_activityId", (q) => q.eq("activityId", activityId))
    .take(2);
  const mappedRows = [...new Map(
    [...byVariant, ...byActivity].map((row) => [String(row._id), row]),
  ).values()];
  if (
    mappedRows.length > 1
    || mappedRows.some((row) => (
      row.variantKey !== IM3_PROFIT_MAXIMUM_GUIDED_ACTIVITY_ID
      || String(row.activityId) !== String(activityId)
      || row.practiceItemId !== documents.item.practiceItemId
    ))
  ) {
    throw new Error("Duplicate or conflicting IM3 maximum-profit Guided practice-item mapping");
  }

  const parsedItem = practiceItemSchema.safeParse({
    practiceItemId: documents.item.practiceItemId,
    activityId,
    variantKey: documents.item.variantKey,
    variantLabel: documents.item.variantLabel,
  });
  if (!parsedItem.success) {
    throw new Error(`IM3 maximum-profit Guided practice item is invalid: ${parsedItem.error.message}`);
  }

  const existingItem = mappedRows[0];
  if (existingItem) {
    await ctx.db.patch(existingItem._id, documents.item);
    return existingItem._id;
  }

  return await ctx.db.insert("practice_items", documents.item);
}

export async function upsertIm3ProfitMaximumIndependentPracticeItem(
  ctx: MutationCtx,
  activityId: Id<"activities">,
  now: number,
): Promise<Id<"practice_items">> {
  const documents = buildIm3ProfitMaximumIndependentSeedDocuments(activityId, now);
  const byVariant = await ctx.db
    .query("practice_items")
    .withIndex("by_variantKey", (q) => q.eq("variantKey", IM3_PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY_ID))
    .take(2);
  const byActivity = await ctx.db
    .query("practice_items")
    .withIndex("by_activityId", (q) => q.eq("activityId", activityId))
    .take(2);
  const mappedRows = [...new Map(
    [...byVariant, ...byActivity].map((row) => [String(row._id), row]),
  ).values()];
  if (
    mappedRows.length > 1
    || mappedRows.some((row) => (
      row.variantKey !== IM3_PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY_ID
      || String(row.activityId) !== String(activityId)
      || row.practiceItemId !== documents.item.practiceItemId
    ))
  ) {
    throw new Error("Duplicate or conflicting IM3 maximum-profit Independent practice-item mapping");
  }

  const parsedItem = practiceItemSchema.safeParse({
    practiceItemId: documents.item.practiceItemId,
    activityId,
    variantKey: documents.item.variantKey,
    variantLabel: documents.item.variantLabel,
  });
  if (!parsedItem.success) {
    throw new Error(`IM3 maximum-profit Independent practice item is invalid: ${parsedItem.error.message}`);
  }

  const existingItem = mappedRows[0];
  if (existingItem) {
    await ctx.db.patch(existingItem._id, documents.item);
    return existingItem._id;
  }

  return await ctx.db.insert("practice_items", documents.item);
}

/** Upserts the exact pilot mapping and rejects duplicate or conflicting rows. */
export async function upsertIm3PilotSeed(
  ctx: MutationCtx,
  now: number,
): Promise<{
  activityId: Id<"activities">;
  stableActivityId: typeof IM3_MASTERY_ADVANTAGE_ACTIVITY_ID;
  variantKey: typeof IM3_PILOT_VARIANT_KEY;
  practiceItemId: string;
}> {
  const existingActivity = await ctx.db
    .query("activities")
    .withIndex("by_stable_activity_id", (q) => q.eq("stableActivityId", IM3_MASTERY_ADVANTAGE_ACTIVITY_ID))
    .unique();
  const activityId = existingActivity?._id ?? await ctx.db.insert("activities", {
    ...buildIm3PilotSeedDocuments("activities:pending" as Id<"activities">, now).activity,
  });
  const documents = buildIm3PilotSeedDocuments(activityId, now);
  if (existingActivity) {
    await ctx.db.patch(existingActivity._id, documents.activity);
  }

  const existingVariant = await ctx.db
    .query("practice_variants")
    .withIndex("by_variantKey", (q) => q.eq("variantKey", IM3_PILOT_VARIANT_KEY))
    .unique();
  if (existingVariant) {
    await ctx.db.patch(existingVariant._id, documents.variant);
  } else {
    await ctx.db.insert("practice_variants", documents.variant);
  }

  const byVariant = await ctx.db
    .query("practice_items")
    .withIndex("by_variantKey", (q) => q.eq("variantKey", IM3_PILOT_VARIANT_KEY))
    .take(2);
  const byActivity = await ctx.db
    .query("practice_items")
    .withIndex("by_activityId", (q) => q.eq("activityId", activityId))
    .take(2);
  const mappedRows = [...new Map(
    [...byVariant, ...byActivity].map((row) => [String(row._id), row]),
  ).values()];
  if (
    mappedRows.length > 1
    || mappedRows.some((row) => (
      row.variantKey !== IM3_PILOT_VARIANT_KEY
      || String(row.activityId) !== String(activityId)
      || row.practiceItemId !== documents.item.practiceItemId
    ))
  ) {
    throw new Error("Duplicate or conflicting IM3 pilot practice-item mapping");
  }

  const parsedItem = practiceItemSchema.safeParse({
    practiceItemId: documents.item.practiceItemId,
    activityId,
    variantKey: documents.item.variantKey,
    variantLabel: documents.item.variantLabel,
  });
  if (!parsedItem.success) {
    throw new Error(`IM3 pilot practice item is invalid: ${parsedItem.error.message}`);
  }

  const existingItem = mappedRows[0];
  if (existingItem) {
    await ctx.db.patch(existingItem._id, documents.item);
  } else {
    await ctx.db.insert("practice_items", documents.item);
  }

  return {
    activityId,
    stableActivityId: IM3_MASTERY_ADVANTAGE_ACTIVITY_ID,
    variantKey: IM3_PILOT_VARIANT_KEY,
    practiceItemId: documents.item.practiceItemId,
  };
}

export async function linkIm3DomainRangeWorkedPhase(
  ctx: MutationCtx,
  lessonVersionId: Id<"lesson_versions">,
  activityId: Id<"activities">,
): Promise<void> {
  const phases = await ctx.db
    .query("phase_versions")
    .withIndex("by_lesson_version_and_phase", (q) => (
      q.eq("lessonVersionId", lessonVersionId).eq("phaseNumber", 4)
    ))
    .take(2);
  const phase = phases[0];
  if (phases.length !== 1 || phase.phaseType !== "worked_example") {
    throw new Error("Lesson 1.1 Worked Phase 4 must be unique");
  }
  const activity = await ctx.db.get(activityId);
  const expectedActivity = buildIm3DomainRangeWorkedSeedDocument(0);
  if (!activity || activity.stableActivityId !== expectedActivity.stableActivityId
    || activity.masteryNodeId !== expectedActivity.masteryNodeId
    || activity.componentKey !== expectedActivity.componentKey
    || activity.learningEvidenceMode !== expectedActivity.learningEvidenceMode
    || activity.srsEligible !== false
    || serializeSelectedSeedContent(activity.props) !== serializeSelectedSeedContent(expectedActivity.props)
    || serializeSelectedSeedContent(activity.gradingConfig) !== serializeSelectedSeedContent(expectedActivity.gradingConfig)) {
    throw new Error("Lesson 1.1 domain-range Worked activity does not match");
  }

  const sections = await ctx.db
    .query("phase_sections")
    .withIndex("by_phase_version", (q) => q.eq("phaseVersionId", phase._id))
    .collect();
  const expected = [
    {
      sequenceOrder: 4,
      sectionType: "text" as const,
      content: {
        markdown: "## State the Domain and Range\n\nGraph $f(x) = x^2 + 2x - 3$. State the domain and range.",
      },
    },
    {
      sequenceOrder: 5,
      sectionType: "activity" as const,
      content: { componentKey: "graphing-explorer", activityId },
    },
  ];
  // Validate both owned positions before inserting either section.
  for (const entry of expected) {
    const matches = sections.filter((section) => section.sequenceOrder === entry.sequenceOrder);
    if (matches.length > 1 || (matches.length === 1
      && (matches[0].sectionType !== entry.sectionType
        || serializeSelectedSeedContent(matches[0].content) !== serializeSelectedSeedContent(entry.content)))) {
      throw new Error("Lesson 1.1 domain-range Worked section conflicts with existing content");
    }
  }
  if (sections.some((section) => section.sequenceOrder !== 5
    && section.sectionType === "activity"
    && (section.content as { activityId?: string }).activityId === activityId)) {
    throw new Error("Lesson 1.1 domain-range Worked activity has another source link");
  }
  for (const entry of expected) {
    if (!sections.some((section) => section.sequenceOrder === entry.sequenceOrder)) {
      await ctx.db.insert("phase_sections", {
        phaseVersionId: phase._id,
        ...entry,
        createdAt: activity.createdAt,
      });
    }
  }
}

export async function linkIm3MaximumReadingWorkedPhase(
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
    throw new Error("Lesson 1.1 Phase 5 is missing");
  }

  const sections = await ctx.db
    .query("phase_sections")
    .withIndex("by_phase_version", (q) => q.eq("phaseVersionId", phase._id))
    .collect();
  const textSection = sections.find((section) => (
    section.sequenceOrder === 1 && section.sectionType === "text"
  ));
  if (!textSection) {
    throw new Error("Lesson 1.1 Phase 5 text section is missing");
  }
  const activitySection = sections.find((section) => (
    section.sequenceOrder === 2 && section.sectionType === "activity"
  ));
  if (!activitySection) {
    throw new Error("Lesson 1.1 Phase 5 activity section is missing");
  }

  await ctx.db.patch(textSection._id, {
    content: {
      markdown: "## Example 2: Compare Quadratic Functions\n\nThe graph of f(x) is shown. Function g has a y-intercept of -1 and a vertex at (1, 2). Which function has the greater maximum value?",
    },
  });
  await ctx.db.patch(activitySection._id, {
    content: {
      componentKey: "graphing-explorer",
      activityId,
    },
  });
}

export async function ensureIm3TeacherLedSourceActivity(
  ctx: MutationCtx,
  lessonVersionId: Id<"lesson_versions">,
  now: number,
): Promise<Id<"activities">> {
  const sourcePhase = await ctx.db
    .query("phase_versions")
    .withIndex("by_lesson_version_and_phase", (q) => (
      q.eq("lessonVersionId", lessonVersionId).eq("phaseNumber", 4)
    ))
    .first();

  const sections = sourcePhase
    ? await ctx.db
        .query("phase_sections")
        .withIndex("by_phase_version", (q) => q.eq("phaseVersionId", sourcePhase._id))
        .collect()
    : [];
  const graphingSections = sections
    .filter((section) => {
      if (section.sectionType !== "activity") return false;
      const content = section.content as { activityId?: string; componentKey?: string };
      return content.componentKey === "graphing-explorer" && Boolean(content.activityId);
    })
    .sort((left, right) => (
      left.sequenceOrder - right.sequenceOrder
      || String(left._id).localeCompare(String(right._id))
    ));
  const phaseSources = (await Promise.all(graphingSections.map(async (section) => {
    const content = section.content as { activityId?: string };
    return content.activityId
      ? ctx.db.get(content.activityId as Id<"activities">)
      : null;
  }))).filter((candidate): candidate is NonNullable<typeof candidate> => (
    candidate !== null
    && candidate.componentKey === "graphing-explorer"
    && candidate.stableActivityId !== IM3_MASTERY_ADVANTAGE_ACTIVITY_ID
  ));

  const existingCanonicalSource = await ctx.db
    .query("activities")
    .withIndex("by_stable_activity_id", (q) => q.eq("stableActivityId", IM3_TEACHER_LED_ACTIVITY_ID))
    .unique();
  const exactPhaseSource = phaseSources.find((candidate) => (
    candidate.stableActivityId === IM3_TEACHER_LED_ACTIVITY_ID
  ));
  const legacyPhaseSource = phaseSources.find((candidate) => !candidate.stableActivityId);
  const activity = exactPhaseSource ?? existingCanonicalSource ?? legacyPhaseSource ?? null;
  const sourceActivityContent = {
    displayName: "Graph a quadratic function by using a table",
    description: "Graph f(x) = x^2 + 2x - 3 by using a table. State the domain and range.",
    props: {
      variant: "plot_from_equation" as const,
      equation: "f(x) = x^2 + 2x - 3",
    },
    gradingConfig: { autoGrade: false, partialCredit: false },
  };

  const sourceActivity = activity ?? {
    _id: await ctx.db.insert("activities", {
      ...IM3_TEACHER_LED_ACTIVITY_METADATA,
      ...sourceActivityContent,
      createdAt: now,
      updatedAt: now,
    }),
  };

  if (activity) {
    await ctx.db.patch(activity._id, {
      ...IM3_TEACHER_LED_ACTIVITY_METADATA,
      ...sourceActivityContent,
      updatedAt: now,
    });
  }

  const sourceSectionExists = graphingSections.some((section) => {
    const content = section.content as { activityId?: string };
    return content.activityId === String(sourceActivity._id);
  });
  if (sourcePhase && !sourceSectionExists) {
    const nextSequenceOrder = sections.reduce(
      (highest, section) => Math.max(highest, section.sequenceOrder),
      0,
    ) + 1;
    await ctx.db.insert("phase_sections", {
      phaseVersionId: sourcePhase._id,
      sequenceOrder: nextSequenceOrder,
        sectionType: "activity",
        content: {
          componentKey: "graphing-explorer",
          activityId: sourceActivity._id,
        },
        createdAt: now,
      });
  }

  for (const section of graphingSections) {
    const content = section.content as { activityId?: string };
    const sectionActivity = phaseSources.find((candidate) => (
      String(candidate._id) === content.activityId
    ));
    if (
      content.activityId === String(sourceActivity._id)
      || (
        sectionActivity?.learningEvidenceMode === "worked_example"
        && sectionActivity.stableActivityId !== IM3_TEACHER_LED_ACTIVITY_ID
      )
    ) continue;
    await ctx.db.patch(section._id, {
      content: {
        ...(section.content as Record<string, unknown>),
        componentKey: "graphing-explorer",
        activityId: sourceActivity._id,
      },
    });
  }

  return sourceActivity._id;
}

interface SeedLesson1Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

/**
 * Convex internalMutation wrapper: seed lesson1.
 * @returns {Promise<unknown>} The wrapper result.
 */
export const seedLesson1 = internalMutation({
  args: {},
  returns: v.object({
    lessonId: v.id("lessons"),
    lessonVersionId: v.id("lesson_versions"),
    phasesCreated: v.number(),
    activitiesCreated: v.number(),
  }),
  handler: async (ctx): Promise<SeedLesson1Result> => {
    const now = Date.now();
    const lessonSlug = "module-1-lesson-1";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 1,
          title: "Graphing Quadratic Functions",
          slug: lessonSlug,
          description: "Students analyze vertex form, standard form, and intercept form.",
          orderIndex: 1,
          createdAt: now,
          updatedAt: now,
        });

    const existingLessonVersions = await ctx.db
      .query("lesson_versions")
      .withIndex("by_lesson", (q) => q.eq("lessonId", lessonId))
      .collect();
    const publishedLessonVersions = existingLessonVersions
      .filter((version) => version.status === "published")
      .sort((left, right) => right.version - left.version);
    if (existingLessonVersions.length > 0 && publishedLessonVersions.length === 0) {
      throw new Error("Lesson 1.1 has no published version");
    }
    if (
      publishedLessonVersions[0]
      && publishedLessonVersions.filter((version) => (
        version.version === publishedLessonVersions[0].version
      )).length !== 1
    ) throw new Error("Lesson 1.1 has duplicate latest published versions");
    const existingLessonVersion = publishedLessonVersions[0];

    const lessonVersionId: Id<"lesson_versions"> = existingLessonVersion
      ? existingLessonVersion._id
      : await ctx.db.insert("lesson_versions", {
          lessonId,
          version: 1,
          title: "Graphing Quadratic Functions",
          description: "Students analyze vertex form, standard form, and intercept form.",
          status: "published",
          createdAt: now,
        });

    const equationRateWorkedSeed = buildIm3EquationRateWorkedSeedDocument(now);
    const phaseData = [
      {
        phaseNumber: 1,
        title: "Explore",
        phaseType: "explore" as const,
        estimatedMinutes: 20,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "activity" as const,
            content: {
              componentKey: "graphing-explorer",
              props: {
                variant: "plot_from_equation",
                equation: "y = x^2",
                title: "Explore Quadratic Graphs",
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
              markdown: "## Key Terms\n\n- **Quadratic function**: A function of the form $f(x) = ax^2 + bx + c$ where $a \\neq 0$\n- **Parabola**: The U-shaped graph of a quadratic function\n- **Vertex**: The highest or lowest point of a parabola\n- **Axis of symmetry**: The vertical line that divides the parabola into mirror images\n- **Standard form**: $f(x) = ax^2 + bx + c$\n- **Vertex form**: $f(x) = a(x-h)^2 + k$ where $(h,k)$ is the vertex\n- **Intercept form**: $f(x) = a(x-p)(x-q)$ where $p$ and $q$ are x-intercepts",
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
              markdown: "## Understanding Quadratic Functions\n\nA **quadratic function** is a polynomial function of degree 2. Its graph is a parabola.\n\n### Three Forms of Quadratic Functions\n\n**Standard Form:** $f(x) = ax^2 + bx + c$\n- The coefficients $a$, $b$, and $c$ reveal different information\n- $a$ determines the direction (up if $a > 0$, down if $a < 0$) and width\n- $c$ is the y-intercept\n\n**Vertex Form:** $f(x) = a(x-h)^2 + k$\n- The vertex is at $(h, k)$\n- Easy to identify the maximum or minimum value\n- The axis of symmetry is $x = h$\n\n**Intercept Form:** $f(x) = a(x-p)(x-q)$\n- $p$ and $q$ are the x-intercepts\n- The axis of symmetry is $x = \\frac{p+q}{2}$",
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
              markdown: "## Example 1: Graph $f(x) = x^2$ Using a Table\n\nLet's graph $f(x) = x^2$ by creating a table of values.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: IM3_PHASE_FOUR_WORKED_PROPS,
            },
          },
          {
            sequenceOrder: 3,
            sectionType: "activity" as const,
            content: {
              componentKey: "graphing-explorer",
              props: {
                variant: "plot_from_equation",
                equation: "y = x^2",
                title: "Teacher-led quadratic graph analysis",
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
              markdown: "## Example 2: Compare $f(x) = x^2$ and $g(x) = 2x^2$\n\nHow does multiplying by 2 affect the graph?",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: IM3_PHASE_FIVE_WORKED_PROPS,
            },
          },
        ],
      },
      {
        phaseNumber: 6,
        title: "Worked Example 3",
        phaseType: "worked_example" as const,
        estimatedMinutes: 12,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Example 3: Real-World Application — Modeling with Quadratics\n\nA baseball is hit with an initial height of 4 feet and an initial velocity of 80 feet per second. The height is modeled by $h(t) = -16t^2 + 80t + 4$.\n\nFind the maximum height and when it occurs.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: IM3_PHASE_SIX_WORKED_PROPS,
            },
          },
        ],
      },
      {
        phaseNumber: 7,
        title: "Learn",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Finding Key Features from Different Forms\n\n### From Standard Form $f(x) = ax^2 + bx + c$\n\n- **Y-intercept**: $(0, c)$\n- **Axis of symmetry**: $x = \\frac{-b}{2a}$\n- **Vertex**: $\\left(\\frac{-b}{2a}, f\\left(\\frac{-b}{2a}\\right)\\right)$\n\n### From Vertex Form $f(x) = a(x-h)^2 + k$\n\n- **Vertex**: $(h, k)$\n- **Axis of symmetry**: $x = h$\n- **Opens**: Up if $a > 0$, down if $a < 0$\n\n### From Intercept Form $f(x) = a(x-p)(x-q)$\n\n- **X-intercepts**: $(p, 0)$ and $(q, 0)$\n- **Axis of symmetry**: $x = \\frac{p+q}{2}$",
            },
          },
        ],
      },
      {
        phaseNumber: 8,
        title: "Worked Example 4",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Example 4: Find Average Rate of Change from an Equation\n\nDetermine the average rate of change of $f(x) = -x^2 + 2x - 1$ over the interval $[-4, 4]$.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: equationRateWorkedSeed.componentKey,
              props: equationRateWorkedSeed.props,
            },
          },
        ],
      },
      {
        phaseNumber: 9,
        title: "Worked Example 5",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Example 5: Find Average Rate of Change from a Table\n\nGiven the table, find the average rate of change from $x = 2$ to $x = 5$.\n\n| x | f(x) |\n|---|------|\n| 2 | 7    |\n| 3 | 12   |\n| 4 | 19   |\n| 5 | 28   |",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: IM3_PHASE_NINE_WORKED_PROPS,
            },
          },
        ],
      },
      {
        phaseNumber: 10,
        title: "Worked Example 6",
        phaseType: "worked_example" as const,
        estimatedMinutes: 12,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Example 6: Estimate Rate of Change from a Graph\n\nUsing the graph of $f(x)$, estimate the average rate of change from $x = 1$ to $x = 4$.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "graphing-explorer",
              props: {
                variant: "rate_of_change",
                equation: "f(x) = (x-2)^2 + 1",
                title: "Estimate Rate of Change from Graph",
              },
            },
          },
        ],
      },
      {
        phaseNumber: 11,
        title: "Discourse",
        phaseType: "discourse" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Discussion Questions\n\n1. How does the value of $a$ in $f(x) = ax^2$ affect the width of the parabola?\n2. Why is the vertex form useful for identifying the maximum or minimum of a quadratic function?\n3. When might you prefer to use the intercept form over the vertex form?\n4. How is the average rate of change of a quadratic function related to its shape?",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "comprehension-quiz",
              props: IM3_PHASE_ELEVEN_QUIZ_PROPS,
            },
          },
        ],
      },
      {
        phaseNumber: 12,
        title: "Reflection",
        phaseType: "reflection" as const,
        estimatedMinutes: 5,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Reflection\n\nToday you learned about quadratic functions and their graphs. Consider the following:\n\n- What did you find most challenging about graphing quadratic functions?\n- How do the three forms (standard, vertex, intercept) help you understand different aspects of a quadratic function?\n- What questions do you still have about quadratic functions?\n\n**Tip**: Being aware of what you understand well and what needs more practice helps you study more effectively.",
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
              componentKey: activityContent.componentKey,
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

    // These upserts run even when lesson phases already exist. The pilot
    // mapping must not depend on a one-time phase insert.
    await upsertIm3SelectedPilotSeed(ctx, lessonVersionId, now);
    const maximumReadingWorkedActivityId = await upsertIm3MaximumReadingWorkedActivity(ctx, now);
    await linkIm3MaximumReadingWorkedPhase(ctx, lessonVersionId, maximumReadingWorkedActivityId);
    const maximumReadingGuidedActivityId = await upsertIm3MaximumReadingGuidedActivity(ctx, now);
    await upsertIm3MaximumReadingGuidedVariant(ctx, now);
    await upsertIm3MaximumReadingGuidedPracticeItem(ctx, maximumReadingGuidedActivityId, now);
    const maximumReadingIndependentActivityId = await upsertIm3MaximumReadingIndependentActivity(ctx, now);
    await upsertIm3MaximumReadingIndependentVariant(ctx, now);
    await upsertIm3MaximumReadingIndependentPracticeItem(ctx, maximumReadingIndependentActivityId, now);
    await upsertIm3SymmetryWorkedActivity(ctx, now);
    const symmetryGuidedActivityId = await upsertIm3SymmetryGuidedActivity(ctx, now);
    await upsertIm3SymmetryGuidedVariant(ctx, now);
    await upsertIm3SymmetryGuidedPracticeItem(ctx, symmetryGuidedActivityId, now);
    const symmetryIndependentActivityId = await upsertIm3SymmetryIndependentActivity(ctx, now);
    await upsertIm3SymmetryIndependentVariant(ctx, now);
    await upsertIm3SymmetryIndependentPracticeItem(ctx, symmetryIndependentActivityId, now);
    await upsertIm3CompareMaximumWorkedActivity(ctx, now);
    const compareMaximumGuidedActivityId = await upsertIm3CompareMaximumGuidedActivity(ctx, now);
    await upsertIm3CompareMaximumGuidedVariant(ctx, now);
    await upsertIm3CompareMaximumGuidedPracticeItem(ctx, compareMaximumGuidedActivityId, now);
    const compareMaximumIndependentActivityId = await upsertIm3CompareMaximumIndependentActivity(ctx, now);
    await upsertIm3CompareMaximumIndependentVariant(ctx, now);
    await upsertIm3CompareMaximumIndependentPracticeItem(ctx, compareMaximumIndependentActivityId, now);
    const domainRangeWorkedActivityId = await upsertIm3DomainRangeWorkedActivity(ctx, now);
    await linkIm3DomainRangeWorkedPhase(ctx, lessonVersionId, domainRangeWorkedActivityId);
    const domainRangeGuidedActivityId = await upsertIm3DomainRangeGuidedActivity(ctx, now);
    await upsertIm3DomainRangeGuidedVariant(ctx, now);
    await upsertIm3DomainRangeGuidedPracticeItem(ctx, domainRangeGuidedActivityId, now);
    const domainRangeGuidedSeed2ActivityId = await upsertIm3DomainRangeGuidedSeed2Activity(ctx, now);
    await upsertIm3DomainRangeGuidedSeed2Variant(ctx, now);
    await upsertIm3DomainRangeGuidedSeed2PracticeItem(ctx, domainRangeGuidedSeed2ActivityId, now);
    const domainRangeIndependentActivityId = await upsertIm3DomainRangeIndependentActivity(ctx, now);
    await upsertIm3DomainRangeIndependentVariant(ctx, now);
    await upsertIm3DomainRangeIndependentPracticeItem(ctx, domainRangeIndependentActivityId, now);
    const domainRangeIndependentSeed2ActivityId = await upsertIm3DomainRangeIndependentSeed2Activity(ctx, now);
    await upsertIm3DomainRangeIndependentSeed2Variant(ctx, now);
    await upsertIm3DomainRangeIndependentSeed2PracticeItem(ctx, domainRangeIndependentSeed2ActivityId, now);
    const graphIndependentSeed2ActivityId = await upsertIm3GraphIndependentSeed2Activity(ctx, now);
    await upsertIm3GraphIndependentSeed2Variant(ctx, now);
    await upsertIm3GraphIndependentSeed2PracticeItem(ctx, graphIndependentSeed2ActivityId, now);
    const graphGuidedSeed2ActivityId = await upsertIm3GraphGuidedSeed2Activity(ctx, now);
    await upsertIm3GraphGuidedSeed2Variant(ctx, now);
    await upsertIm3GraphGuidedSeed2PracticeItem(ctx, graphGuidedSeed2ActivityId, now);
    const equationRateWorkedActivityId = await upsertIm3EquationRateWorkedActivity(ctx, now);
    const phaseEight = await ctx.db
      .query("phase_versions")
      .withIndex("by_lesson_version_and_phase", (q) => (
        q.eq("lessonVersionId", lessonVersionId).eq("phaseNumber", 8)
      ))
      .unique();
    if (!phaseEight) {
      throw new Error("Lesson 1.1 Phase 8 is missing");
    }
    const phaseEightSections = await ctx.db
      .query("phase_sections")
      .withIndex("by_phase_version", (q) => q.eq("phaseVersionId", phaseEight._id))
      .collect();
    const phaseEightText = phaseEightSections.find((section) => (
      section.sequenceOrder === 1 && section.sectionType === "text"
    ));
    if (!phaseEightText) {
      throw new Error("Lesson 1.1 Phase 8 text section is missing");
    }
    const phaseEightActivity = phaseEightSections.find((section) => (
      section.sequenceOrder === 2 && section.sectionType === "activity"
    ));
    if (!phaseEightActivity) {
      throw new Error("Lesson 1.1 Phase 8 activity section is missing");
    }
    await ctx.db.patch(phaseEightText._id, {
      content: {
        markdown: "## Example 4: Find Average Rate of Change from an Equation\n\nDetermine the average rate of change of $f(x) = -x^2 + 2x - 1$ over the interval $[-4, 4]$.",
      },
    });
    await ctx.db.patch(phaseEightActivity._id, {
      content: {
        componentKey: equationRateWorkedSeed.componentKey,
        activityId: equationRateWorkedActivityId,
      },
    });
    const equationRateGuidedActivityId = await upsertIm3EquationRateGuidedActivity(ctx, now);
    await upsertIm3EquationRateGuidedVariant(ctx, now);
    await upsertIm3EquationRateGuidedPracticeItem(ctx, equationRateGuidedActivityId, now);
    const equationRateIndependentActivityId = await upsertIm3EquationRateIndependentActivity(ctx, now);
    await upsertIm3EquationRateIndependentVariant(ctx, now);
    await upsertIm3EquationRateIndependentPracticeItem(ctx, equationRateIndependentActivityId, now);
    const profitModelGuidedActivityId = await upsertIm3ProfitModelGuidedActivity(ctx, now);
    await upsertIm3ProfitModelGuidedVariant(ctx, now);
    await upsertIm3ProfitModelGuidedPracticeItem(ctx, profitModelGuidedActivityId, now);
    const profitModelActivityId = await upsertIm3ProfitModelIndependentActivity(ctx, now);
    await upsertIm3ProfitModelIndependentVariant(ctx, now);
    await upsertIm3ProfitModelIndependentPracticeItem(ctx, profitModelActivityId, now);
    const profitModelWorkedActivityId = await upsertIm3ProfitModelWorkedActivity(ctx, now);
    await linkIm3ProfitModelWorkedPhase(ctx, lessonVersionId, profitModelWorkedActivityId);
    const profitMaximumWorkedActivityId = await upsertIm3ProfitMaximumWorkedActivity(ctx, now);
    await linkIm3ProfitMaximumWorkedPhase(ctx, lessonVersionId, profitMaximumWorkedActivityId, now);
    const profitMaximumGuidedActivityId = await upsertIm3ProfitMaximumGuidedActivity(ctx, now);
    await upsertIm3ProfitMaximumGuidedVariant(ctx, now);
    await upsertIm3ProfitMaximumGuidedPracticeItem(ctx, profitMaximumGuidedActivityId, now);
    const profitMaximumIndependentActivityId = await upsertIm3ProfitMaximumIndependentActivity(ctx, now);
    await upsertIm3ProfitMaximumIndependentVariant(ctx, now);
    await upsertIm3ProfitMaximumIndependentPracticeItem(ctx, profitMaximumIndependentActivityId, now);

    return {
      lessonId,
      lessonVersionId,
      phasesCreated,
      activitiesCreated,
    };
  },
});
