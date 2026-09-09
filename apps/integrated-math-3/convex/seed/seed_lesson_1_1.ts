import { internalMutation, type MutationCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import { SeedActivityContent } from "./types";
import { getGenerator } from "@math-platform/math-content/knowledge-space";
import { v } from "convex/values";
import type { GraphingExplorerSchemaProps } from "@math-platform/math-content";
import {
  IM3_GUIDED_PRACTICE_ACTIVITY_ID,
  IM3_GUIDED_VARIANT_KEY,
  IM3_MASTERY_ADVANTAGE_ACTIVITY_ID,
  IM3_PILOT_NODE,
  IM3_PILOT_VARIANT_KEY,
  IM3_TEACHER_LED_ACTIVITY_ID,
} from "../../lib/practice/learning-evidence-pilot";

const IM3_SELECTED_WORKED_MARKDOWN = "## Example 1: Graph $f(x) = x^2$ Using a Table\n\nLet's graph $f(x) = x^2$ by creating a table of values.";

const IM3_SELECTED_ORIGINAL_WORKED_PROPS = {
  problemType: "graphing",
  equation: "f(x) = x^2",
  steps: [
    { id: "step-1", description: "Evaluate at x = -2", expression: "x = -2", explanation: "Evaluate at x = -2" },
    { id: "step-2", description: "Calculate f(-2)", expression: "f(-2) = (-2)^2 = 4", explanation: "Calculate f(-2)" },
    { id: "step-3", description: "Evaluate at x = -1", expression: "x = -1", explanation: "Evaluate at x = -1" },
    { id: "step-4", description: "Calculate f(-1)", expression: "f(-1) = (-1)^2 = 1", explanation: "Calculate f(-1)" },
    { id: "step-5", description: "Evaluate at x = 0", expression: "x = 0", explanation: "Evaluate at x = 0" },
    { id: "step-6", description: "Calculate f(0) — the vertex", expression: "f(0) = 0^2 = 0", explanation: "Calculate f(0) — the vertex" },
    { id: "step-7", description: "Evaluate at x = 1", expression: "x = 1", explanation: "Evaluate at x = 1" },
    { id: "step-8", description: "Calculate f(1)", expression: "f(1) = 1^2 = 1", explanation: "Calculate f(1)" },
    { id: "step-9", description: "Evaluate at x = 2", expression: "x = 2", explanation: "Evaluate at x = 2" },
    { id: "step-10", description: "Calculate f(2)", expression: "f(2) = 2^2 = 4", explanation: "Calculate f(2)" },
  ],
};

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
              displayName: "Explore Quadratic Graphs",
              props: {
                variant: "plot_from_equation",
                equation: "y = x^2",
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
              markdown: IM3_SELECTED_WORKED_MARKDOWN,
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: IM3_SELECTED_ORIGINAL_WORKED_PROPS,
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
              props: {
                problemType: "graphing",
                equation: "g(x) = 2x^2",
                steps: [
                  { id: "step-1", description: "Original function", expression: "f(x) = x^2 (base parabola)", explanation: "Original function" },
                  { id: "step-2", description: "Vertical stretch by factor of 2", expression: "g(x) = 2x^2", explanation: "Vertical stretch by factor of 2" },
                  { id: "step-3", description: "The vertex doesn't change", expression: "Vertex remains at (0, 0)", explanation: "The vertex doesn't change" },
                  { id: "step-4", description: "f(1) = 1, g(1) = 2", expression: "Points are twice as far from vertex", explanation: "f(1) = 1, g(1) = 2" },
                  { id: "step-5", description: "a > 1 causes vertical stretch", expression: "Parabola is narrower", explanation: "a > 1 causes vertical stretch" },
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
              props: {
                problemType: "graphing",
                equation: "h(t) = -16t^2 + 80t + 4",
                steps: [
                  { id: "step-1", description: "Write the function", expression: "h(t) = -16t^2 + 80t + 4", explanation: "Write the function" },
                  { id: "step-2", description: "Identify coefficients", expression: "a = -16, b = 80", explanation: "Identify coefficients" },
                  { id: "step-3", description: "Find the axis of symmetry", expression: "t = -b/(2a) = -80/(2·-16) = 80/32 = 2.5", explanation: "Find the axis of symmetry" },
                  { id: "step-4", description: "Substitute to find maximum height", expression: "h(2.5) = -16(2.5)^2 + 80(2.5) + 4", explanation: "Substitute to find maximum height" },
                  { id: "step-5", description: "Calculate maximum height", expression: "h(2.5) = -100 + 200 + 4 = 104", explanation: "Calculate maximum height" },
                  { id: "step-6", description: "Interpret the result", expression: "Maximum height: 104 feet at t = 2.5 seconds", explanation: "Interpret the result" },
                ],
              },
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
              markdown: "## Example 4: Find Average Rate of Change from an Equation\n\nFind the average rate of change of $f(x) = x^2 + 3x - 4$ from $x = 1$ to $x = 3$.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "rate_of_change",
                equation: "f(x) = x^2 + 3x - 4",
                steps: [
                  { id: "step-1", description: "Evaluate at x = 1", expression: "f(1) = 1^2 + 3(1) - 4 = 0", explanation: "Evaluate at x = 1" },
                  { id: "step-2", description: "Evaluate at x = 3", expression: "f(3) = 3^2 + 3(3) - 4 = 14", explanation: "Evaluate at x = 3" },
                  { id: "step-3", description: "Use the formula", expression: "Average rate of change = [f(3) - f(1)] / (3 - 1)", explanation: "Use the formula" },
                  { id: "step-4", description: "Calculate the result", expression: "= (14 - 0) / 2 = 7", explanation: "Calculate the result" },
                  { id: "step-5", description: "Interpret the result", expression: "The function increases by 7 units per unit increase in x", explanation: "Interpret the result" },
                ],
              },
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
              props: {
                problemType: "rate_of_change",
                equation: "(table data)",
                steps: [
                  { id: "step-1", description: "Identify values from table", expression: "f(5) = 28, f(2) = 7", explanation: "Identify values from table" },
                  { id: "step-2", description: "Apply the formula", expression: "Average rate of change = [28 - 7] / [5 - 2]", explanation: "Apply the formula" },
                  { id: "step-3", description: "Calculate", expression: "= 21 / 3 = 7", explanation: "Calculate" },
                  { id: "step-4", description: "Interpretation", expression: "The function increases by 7 units for each unit of x", explanation: "Interpretation" },
                ],
              },
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
              displayName: "Estimate Rate of Change from Graph",
              props: {
                variant: "rate_of_change",
                equation: "f(x) = (x-2)^2 + 1",
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
              props: {
                questions: [
                  { id: "question-1", type: "multiple_choice", prompt: "If $a > 1$ in $f(x) = ax^2$, the parabola becomes:", options: ["Wider", "Narrower", "Shifts up", "Shifts down"], correctAnswer: "Narrower" },
                  { id: "question-2", type: "multiple_choice", prompt: "The vertex of $f(x) = (x-3)^2 + 5$ is:", options: ["(3, 5)", "(-3, 5)", "(3, -5)", "(-3, -5)"], correctAnswer: "(3, 5)" },
                ],
              },
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
            displayName: (section.content as { displayName?: string }).displayName ?? `${phase.title} - ${activityContent.componentKey}`,
            description: `Activity for ${phase.title}`,
            props: activityContent.props as never,
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
              activityId: insertedActivityId,
              componentKey: activityContent.componentKey,
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

    await upsertIm3SelectedPilotSeed(ctx, lessonVersionId, now);

    return {
      lessonId,
      lessonVersionId,
      phasesCreated,
      activitiesCreated,
    };
  },
});
