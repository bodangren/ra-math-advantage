import { internalMutation, internalQuery, type QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { v } from "convex/values";
import nodesDocument from "../curriculum/skill-graph/nodes.json";
import blueprintsDocument from "../curriculum/skill-graph/blueprints.json";
import {
  PRECALCULUS_PILOT_NODE_ID,
  PRECALCULUS_TOPIC_11_SOURCE_ACTIVITY_ID,
  PRECALCULUS_TOPIC_11_SOURCE_COMPONENT_KEY,
} from "../lib/learning-evidence/precalc-pilot";
import { generateTopic11IntervalGraph, gradeTopic11IntervalGraph } from "../lib/practice/topic11-interval-graph";
import { PracticeSubmissionEnvelopeSchema } from "@math-platform/practice-core";
import { generateTopic11IntervalGraphOutput } from "@math-platform/math-content/knowledge-space";

export const PRECALCULUS_PILOT_ACTIVITY_ID = `${PRECALCULUS_PILOT_NODE_ID}.guided_practice`;
export const PRECALCULUS_PILOT_INDEPENDENT_ACTIVITY_ID = `${PRECALCULUS_PILOT_NODE_ID}.independent_practice`;
export const PRECALCULUS_PILOT_COMPONENT_KEY =
  "precalculus-mastery-advantage-pilot";

type Publication = {
  nodes: ReadonlyArray<{ id: string; kind?: string; reviewStatus?: string }>;
  blueprints: ReadonlyArray<{
    nodeId: string;
    reviewStatus?: string;
    rendererKey?: string;
    rendererModeMap?: Record<string, unknown>;
    workedExampleSpec?: unknown;
    guidedPracticeSpec?: unknown;
    independentPracticeSpec?: unknown;
    generatorKey?: string;
    gradingSpec?: unknown;
  }>;
};
const publication: Publication = {
  nodes: nodesDocument.nodes,
  blueprints: blueprintsDocument.blueprints,
};
const SELECTED_GUIDED_PROMPT =
  "Identify the intervals where the graph increases, decreases, and stays constant.";
const SELECTED_GUIDED_STEPS = [
  "Mark the domain endpoints and the change points x=3 and x=7.",
  "Read each graph segment from left to right and decide whether it rises, falls, or stays flat.",
  "Write each interval. Use U or ∪ between multiple intervals. Enter none when no interval exists.",
];
const SELECTED_GUIDED_HINTS = [
  "Use the two change points to separate the graph into three segments.",
  "Read each segment from left to right.",
  "Enter none when no segment has the requested behavior.",
];
const SELECTED_GUIDED_CHECKS = [
  { check: "The domain endpoints and both change points are identified." },
  { check: "Each segment is classified as rising, falling, or flat." },
  { check: "All three interval fields are completed." },
];
const SELECTED_FIELD_HELP = {
  increasingIntervals: "Find every segment that rises.",
  decreasingIntervals: "Find every segment that falls.",
  constantIntervals: "Check whether any segment stays flat.",
};
const SELECTED_RUBRIC_CRITERIA = {
  increasingIntervals: "Correct increasing intervals",
  decreasingIntervals: "Correct decreasing intervals",
  constantIntervals: "Correct constant intervals",
} as const;
const SELECTED_VARIANT_PARAMETERS = {
  seed: {
    type: "integer",
    min: 0,
    description: "Deterministic Topic 1.1 interval graph variant seed",
  },
};
const SELECTED_ENVELOPE_KEYS = new Set([
  "activityId",
  "answers",
  "attemptNumber",
  "contractVersion",
  "mode",
  "parts",
  "status",
  "submittedAt",
  "artifact",
  "interactionHistory",
  "analytics",
  "studentFeedback",
  "teacherSummary",
  "timing",
]);
const SELECTED_STORED_PART_KEYS =
  "changedCount|hintsUsed|isCorrect|maxScore|partId|rawAnswer|revealStepsSeen|score";
const TOPIC_11_WORKED_SPEC = {
  prompt: "The graph of f is shown on 0 <= x <= 9. Find all intervals where f is increasing, decreasing, and constant.",
  givens: ["Domain: 0 <= x <= 9", "Change points: x=3 and x=7"],
  target: {
    increasingIntervals: "[0,3] and [7,9].",
    decreasingIntervals: "[3,7].",
    constantIntervals: "none.",
  },
  steps: [
    { description: "Read the graph from left to right.", expression: "x = 0 to x = 9" },
    { description: "The graph rises from x=0 to x=3.", expression: "0 < x < 3" },
    { description: "The graph falls from x=3 to x=7.", expression: "3 < x < 7" },
    { description: "The graph rises from x=7 to x=9.", expression: "7 < x < 9" },
    { description: "State all interval classifications.", expression: "Increasing: [0,3] and [7,9]; decreasing: [3,7]; constant: none." },
  ],
  explanation: "Read the graph from left to right. It rises on [0,3] and [7,9]. It falls on [3,7]. It has no constant interval.",
  rendererProps: {
    title: "Worked Example: Classify Graph Intervals",
    prompt: "The graph of f is shown on 0 <= x <= 9. Find all intervals where f is increasing, decreasing, and constant.",
    domain: [0, 9],
    changePoints: [3, 7],
    points: [{ x: 0, y: 1 }, { x: 3, y: 7 }, { x: 7, y: 2 }, { x: 9, y: 6 }],
    presentationMode: "worked_example",
    steps: [
      { description: "Read the graph from left to right.", expression: "x = 0 to x = 9" },
      { description: "The graph rises from x=0 to x=3.", expression: "0 < x < 3" },
      { description: "The graph falls from x=3 to x=7.", expression: "3 < x < 7" },
      { description: "The graph rises from x=7 to x=9.", expression: "7 < x < 9" },
      { description: "State all interval classifications.", expression: "Increasing: [0,3] and [7,9]; decreasing: [3,7]; constant: none." },
    ],
    finalAnswer: "Increasing: [0,3] and [7,9]; decreasing: [3,7]; constant: none.",
  },
};

export function isPrecalculusPilotPublished(
  value: Publication = publication,
): boolean {
  return (
    value.nodes.some(
      (node) =>
        node.id === PRECALCULUS_PILOT_NODE_ID &&
        node.kind === "skill" &&
        node.reviewStatus === "approved",
    ) &&
    value.blueprints.some((blueprint) => {
      const modeMap = blueprint.rendererModeMap;
      const guided = blueprint.guidedPracticeSpec;
      const independent = blueprint.independentPracticeSpec;
      const guidedProps =
        record(guided) && record(guided.rendererProps)
          ? guided.rendererProps
          : null;
      const independentProps =
        record(independent) && record(independent.rendererProps)
          ? independent.rendererProps
          : null;
      const guidedVariant = generateTopic11IntervalGraphOutput(0).data
        .rendererProps as Record<string, unknown>;
      const independentVariant = generateTopic11IntervalGraphOutput(2).data
        .rendererProps as Record<string, unknown>;
      const matchesGeometry = (
        actual: Record<string, unknown>,
        expected: Record<string, unknown>,
      ) =>
        JSON.stringify(actual.domain) === JSON.stringify(expected.domain) &&
        JSON.stringify(actual.changePoints) ===
          JSON.stringify(expected.changePoints) &&
        JSON.stringify(actual.points) === JSON.stringify(expected.points);
      const grading = record(blueprint.gradingSpec)
        ? blueprint.gradingSpec
        : null;
      const partIds =
        grading && Array.isArray(grading.partIds) ? grading.partIds : [];
      const rubric =
        grading && Array.isArray(grading.rubric) ? grading.rubric : [];
      return (
        blueprint.nodeId === PRECALCULUS_PILOT_NODE_ID &&
        blueprint.reviewStatus === "approved" &&
        blueprint.rendererKey === "interval-classification" &&
        record(modeMap) &&
        modeMap.guidedPractice === "interval-classification" &&
        modeMap.independentPractice === "interval-classification" &&
        record(guided) &&
        guided.scaffoldedPrompt === SELECTED_GUIDED_PROMPT &&
        JSON.stringify(guided.stepPrompts) ===
          JSON.stringify(SELECTED_GUIDED_STEPS) &&
        JSON.stringify(guided.hints) ===
          JSON.stringify(SELECTED_GUIDED_HINTS) &&
        JSON.stringify(guided.checksPerStep) ===
          JSON.stringify(SELECTED_GUIDED_CHECKS) &&
        guided.revealPolicy === "one_at_a_time" &&
        guidedProps !== null &&
        Object.keys(guidedProps).sort().join("|") ===
          "changePoints|domain|fieldHelp|guidedSteps|points|presentationMode|prompt|title" &&
        guidedProps.title === "Guided Practice: Classify Graph Intervals" &&
        guidedProps.prompt === SELECTED_GUIDED_PROMPT &&
        guidedProps.presentationMode === "guided_practice" &&
        Array.isArray(guidedProps.guidedSteps) &&
        JSON.stringify(guidedProps.guidedSteps) ===
          JSON.stringify(SELECTED_GUIDED_STEPS) &&
        record(guidedProps.fieldHelp) &&
        JSON.stringify(guidedProps.fieldHelp) ===
          JSON.stringify(SELECTED_FIELD_HELP) &&
        matchesGeometry(guidedProps, guidedVariant) &&
        record(independent) &&
        JSON.stringify(independent.variantParameters) ===
          JSON.stringify(SELECTED_VARIANT_PARAMETERS) &&
        record(independent.answerSchema) &&
        Object.keys(independent.answerSchema).sort().join("|") ===
          "constantIntervals|decreasingIntervals|increasingIntervals" &&
        Object.values(independent.answerSchema).every(
          (value) => value === "string",
        ) &&
        Array.isArray(independent.gradingRules) &&
        independent.gradingRules.length === 3 &&
        independent.gradingRules.every(record) &&
        independent.gradingRules
          .map((rule) => rule.partId)
          .slice()
          .sort()
          .join("|") ===
          "constantIntervals|decreasingIntervals|increasingIntervals" &&
        independent.gradingRules.every(
          (rule) => rule.ruleType === "custom" && rule.maxScore === 1,
        ) &&
        independent.replayPolicy === "any_seed" &&
        independentProps !== null &&
        Object.keys(independentProps).sort().join("|") ===
          "changePoints|domain|points|presentationMode|prompt|title" &&
        independentProps.title === "Independent Practice: Classify Graph Intervals" &&
        independentProps.prompt === SELECTED_GUIDED_PROMPT &&
        independentProps.presentationMode === "independent_practice" &&
        matchesGeometry(independentProps, independentVariant) &&
        blueprint.generatorKey === "topic11-interval-graph" &&
        partIds.slice().sort().join("|") ===
          "constantIntervals|decreasingIntervals|increasingIntervals" &&
        grading?.passingScore === 3 &&
        grading.partialCredit === true &&
        rubric.length === 3 &&
        new Set(rubric.filter(record).map((row) => row.partId)).size === 3 &&
        rubric.every(
          (row) =>
            record(row) &&
            row.points === 1 &&
            typeof row.partId === "string" &&
            partIds.includes(row.partId) &&
            row.criteria ===
              SELECTED_RUBRIC_CRITERIA[
                row.partId as keyof typeof SELECTED_RUBRIC_CRITERIA
              ],
        )
      );
    })
  );
}

const precalculusPilotActivityResultValidator = v.object({
  activityId: v.id("activities"),
  stableActivityId: v.string(),
  mode: v.union(
    v.literal("worked_example"),
    v.literal("guided_practice"),
    v.literal("independent_practice"),
  ),
  componentKey: v.string(),
  props: v.any(),
});

/**
 * Gets the approved Topic 1.1 pilot activities.
 * @param {import('./_generated/server').QueryCtx} ctx - The Convex query context.
 * @param {Publication} publication - The canonical graph publication.
 * @returns {Promise<Array<object>>} The safe approved activity projections.
 */
export async function getApprovedPrecalculusPilotHandler(
  ctx: QueryCtx,
  selectedPublication: Publication = publication,
) {
  if (!isPrecalculusPilotPublished(selectedPublication)) return [];
  const specs = [
    { mode: "worked_example", stableActivityId: PRECALCULUS_TOPIC_11_SOURCE_ACTIVITY_ID, componentKey: PRECALCULUS_TOPIC_11_SOURCE_COMPONENT_KEY, seed: 0 },
    { mode: "guided_practice", stableActivityId: PRECALCULUS_PILOT_ACTIVITY_ID, componentKey: PRECALCULUS_PILOT_COMPONENT_KEY, seed: 0 },
    { mode: "independent_practice", stableActivityId: PRECALCULUS_PILOT_INDEPENDENT_ACTIVITY_ID, componentKey: PRECALCULUS_PILOT_COMPONENT_KEY, seed: 2 },
  ] as const;
  const matches = await Promise.all(specs.map((spec) => ctx.db
    .query("activities")
    .withIndex("by_stable_activity_id", (query) => query.eq(
      "stableActivityId",
      spec.stableActivityId,
    ))
    .collect()));
  if (matches.some((rows) => rows.length !== 1)) return [];
  const rows = matches.map((rows) => rows[0]!);
  if (rows.some((row, index) => (
    !row
    || row.approval?.status !== "approved"
    || (specs[index]!.mode === "worked_example"
      ? !hasTopic11SourceActivityIdentity(row)
      : !hasExpectedActivityIdentity(row, expectedActivity(specs[index]!.mode)))
  ))) return [];
  const publicProps = specs.map((spec) => {
    const variant = generateTopic11IntervalGraph(spec.seed);
    const base = {
      prompt: "Identify the intervals where the graph increases, decreases, and stays constant.",
      domain: variant.domain,
      changePoints: variant.changePoints,
      points: variant.points,
      presentationMode: spec.mode,
    };
    if (spec.mode === "independent_practice") return base;
    if (spec.mode === "guided_practice") return {
      ...base,
      guidedSteps: [
        `Mark the domain endpoints and the change points x=${variant.changePoints[0]} and x=${variant.changePoints[1]}.`,
        "Read each graph segment from left to right and decide whether it rises, falls, or stays flat.",
        "Write each interval. Use U or ∪ between multiple intervals. Enter none when no interval exists.",
      ],
      fieldHelp: {
        increasingIntervals: "Find every segment that rises.",
        decreasingIntervals: "Find every segment that falls.",
        constantIntervals: "Check whether any segment stays flat.",
      },
    };
    return {
      ...base,
      title: "Worked Example: Classify Graph Intervals",
      steps: [
        { description: "Read the graph from left to right.", expression: "The domain is [0, 9]." },
        { description: "Classify the first segment.", expression: "The graph rises from x=0 to x=3." },
        { description: "Classify the middle segment.", expression: "The graph falls from x=3 to x=7." },
        { description: "Classify the final segment.", expression: "The graph rises from x=7 to x=9." },
        { description: "State the interval answers.", expression: "Increasing: [0,3] and [7,9]; decreasing: [3,7]; constant: none." },
      ],
      finalAnswer: "Increasing: [0,3] and [7,9]; decreasing: [3,7]; constant: none.",
    };
  });
  return rows.map((row, index) => ({
    activityId: row!._id,
    stableActivityId: row!.stableActivityId!,
    mode: specs[index]!.mode,
    componentKey: row!.componentKey,
    props: publicProps[index]!,
  }));
}

export const getApprovedPrecalculusPilot = internalQuery({
  args: {},
  returns: v.array(precalculusPilotActivityResultValidator),
  handler: (ctx) => getApprovedPrecalculusPilotHandler(ctx),
});


const partValidator = v.object({
  partId: v.string(),
  rawAnswer: v.string(),
  isCorrect: v.optional(v.boolean()),
  score: v.optional(v.number()),
  maxScore: v.optional(v.number()),
  hintsUsed: v.optional(v.number()),
  revealStepsSeen: v.optional(v.number()),
  changedCount: v.optional(v.number()),
});
const dataValidator = v.object({
  contractVersion: v.literal("practice.v1"),
  activityId: v.string(),
  mode: v.union(
    v.literal("guided_practice"),
    v.literal("independent_practice"),
  ),
  status: v.literal("submitted"),
  attemptNumber: v.number(),
  submittedAt: v.string(),
  answers: v.object({
    increasingIntervals: v.string(),
    decreasingIntervals: v.string(),
    constantIntervals: v.string(),
  }),
  parts: v.array(partValidator),
  artifact: v.optional(v.any()),
  interactionHistory: v.optional(v.any()),
  analytics: v.optional(v.any()),
  studentFeedback: v.optional(v.any()),
  teacherSummary: v.optional(v.any()),
  timing: v.optional(v.any()),
});
const resultValidator = v.object({
  submissionId: v.id("activity_submissions"),
  score: v.number(),
  maxScore: v.number(),
  attemptOrdinal: v.number(),
  feedback: v.string(),
});

export function isTopic11WorkedSourcePublished(value: Publication = publication): boolean {
  return isPrecalculusPilotPublished({
    nodes: value.nodes,
    blueprints: value.blueprints.filter((blueprint) =>
      blueprint.rendererModeMap?.worked === "interval-classification"
      && sameJson(blueprint.workedExampleSpec, TOPIC_11_WORKED_SPEC)),
  });
}

const topic11AcknowledgementValidator = v.object({
  contractVersion: v.literal("practice.v1"),
  activityId: v.literal(PRECALCULUS_TOPIC_11_SOURCE_ACTIVITY_ID),
  mode: v.literal("worked_example"),
  status: v.literal("submitted"),
  answers: v.object({}),
  parts: v.array(v.object({})),
});
const topic11AcknowledgementResultValidator = v.object({
  submissionId: v.id("activity_submissions"),
  attemptOrdinal: v.number(),
  submittedAt: v.string(),
});

export function hasTopic11SourceActivityIdentity(activity: Record<string, unknown>): boolean {
  return activity.stableActivityId === PRECALCULUS_TOPIC_11_SOURCE_ACTIVITY_ID
    && activity.componentKey === PRECALCULUS_TOPIC_11_SOURCE_COMPONENT_KEY
    && activity.displayName === "Topic 1.1: Identify Graph Intervals with Your Teacher"
    && activity.description === "Worked-example source activity for classifying increasing, decreasing, and constant intervals."
    && sameRecord(activity.props, {
      nodeId: PRECALCULUS_PILOT_NODE_ID,
      mode: "worked_example",
      source: "teacher_led",
    })
    && sameRecord(activity.gradingConfig, { variantSeed: 0 });
}

export async function hasCurrentTopic11Source(
  ctx: Pick<QueryCtx, "db">,
  lessonId: Id<"lessons">,
  activityId: Id<"activities">,
  acknowledgedAt: number,
): Promise<boolean> {
  const versions = (await ctx.db.query("lesson_versions")
    .withIndex("by_lesson", (query) => query.eq("lessonId", lessonId)).collect())
    .filter((version) => version.status === "published")
    .sort((left, right) => right.version - left.version);
  if (versions.length === 0 || versions.length > 1 && versions[0]!.version === versions[1]!.version
    || !Number.isFinite(versions[0]!.createdAt) || versions[0]!.createdAt > acknowledgedAt) return false;
  const phases = await ctx.db.query("phase_versions")
    .withIndex("by_lesson_version", (query) => query.eq("lessonVersionId", versions[0]!._id)).collect();
  const workedPhases = phases.filter((phase) => phase.phaseNumber === 4);
  if (workedPhases.length !== 1 || workedPhases[0]!.phaseType !== "worked_example"
    || !Number.isFinite(workedPhases[0]!.createdAt) || workedPhases[0]!.createdAt > acknowledgedAt) return false;
  const workedPhase = workedPhases[0]!;
  const selectedLinks: unknown[] = [];
  const workedSequence: unknown[] = [];
  for (const phase of phases) {
    const sections = await ctx.db.query("phase_sections")
      .withIndex("by_phase_version", (query) => query.eq("phaseVersionId", phase._id)).collect();
    for (const section of sections) {
      if (String(phase._id) === String(workedPhase._id) && section.sequenceOrder === 2) workedSequence.push(section);
      if (record(section.content) && String(section.content.activityId) === String(activityId)) {
        selectedLinks.push({ phase, section });
      }
    }
  }
  if (selectedLinks.length !== 1 || workedSequence.length !== 1) return false;
  const selectedLink = selectedLinks[0] as { phase: Record<string, unknown>; section: Record<string, unknown> };
  const content = record(selectedLink.section.content) ? selectedLink.section.content : null;
  return String(selectedLink.phase._id) === String(workedPhase._id)
    && selectedLink.section === workedSequence[0]
    && selectedLink.section.sequenceOrder === 2
    && selectedLink.section.sectionType === "activity"
    && content?.componentKey === PRECALCULUS_TOPIC_11_SOURCE_COMPONENT_KEY
    && Number.isFinite(selectedLink.section.createdAt)
    && Number(selectedLink.section.createdAt) <= acknowledgedAt;
}

const topic11WorkedProjectionValidator = v.union(
  v.null(),
  v.object({
    activityId: v.id("activities"),
    stableActivityId: v.string(),
    nodeId: v.string(),
    componentKey: v.string(),
    mode: v.literal("worked_example"),
    props: v.any(),
  }),
);

/** Gets the exact approved Topic 1.1 Worked source for a learner view. */
export async function getApprovedTopic11WorkedSourceHandler(
  ctx: QueryCtx,
  selectedPublication: Publication = publication,
) {
  if (!isTopic11WorkedSourcePublished(selectedPublication)) return null;
  const blueprints = selectedPublication.blueprints.filter(
    (blueprint) =>
      blueprint.nodeId === PRECALCULUS_PILOT_NODE_ID &&
      blueprint.rendererModeMap?.worked === "interval-classification" &&
      sameJson(blueprint.workedExampleSpec, TOPIC_11_WORKED_SPEC),
  );
  if (blueprints.length !== 1) return null;
  const workedSpec = blueprints[0]!.workedExampleSpec;
  if (!record(workedSpec) || !record(workedSpec.rendererProps))
    return null;
  const activities = await ctx.db
    .query("activities")
    .withIndex("by_stable_activity_id", (query) =>
      query.eq("stableActivityId", PRECALCULUS_TOPIC_11_SOURCE_ACTIVITY_ID),
    )
    .collect();
  if (activities.length !== 1) return null;
  const activity = activities[0]!;
  const now = Date.now();
  const reviewedAt = record(activity.approval) ? activity.approval.reviewedAt : null;
  if (
    activity.approval?.status !== "approved" ||
    !hasTopic11SourceActivityIdentity(activity) ||
    !Number.isFinite(activity.createdAt) ||
    Number(activity.createdAt) < 0 ||
    Number(activity.createdAt) > now ||
    !Number.isFinite(reviewedAt) ||
    Number(reviewedAt) < Number(activity.createdAt) ||
    Number(reviewedAt) > now
  )
    return null;
  const lessons = await ctx.db
    .query("lessons")
    .withIndex("by_unit_and_order", (query) =>
      query.eq("unitNumber", 1).eq("orderIndex", 1),
    )
    .collect();
  if (
    lessons.length !== 1 ||
    !(await hasCurrentTopic11Source(
      ctx,
      lessons[0]!._id,
      activity._id,
      now,
    ))
  )
    return null;
  return {
    activityId: activity._id,
    stableActivityId: PRECALCULUS_TOPIC_11_SOURCE_ACTIVITY_ID,
    nodeId: PRECALCULUS_PILOT_NODE_ID,
    componentKey: PRECALCULUS_TOPIC_11_SOURCE_COMPONENT_KEY,
    mode: "worked_example" as const,
    props: workedSpec.rendererProps,
  };
}

export const getApprovedTopic11WorkedSource = internalQuery({
  args: {},
  returns: topic11WorkedProjectionValidator,
  handler: (ctx) => getApprovedTopic11WorkedSourceHandler(ctx),
});

const topic11LearnerDeliveryStateValidator = v.union(
  v.null(),
  v.literal("needs_acknowledgement"),
  v.literal("awaiting_teacher_confirmation"),
  v.literal("ready_for_practice"),
);

export function isStoredTopic11Acknowledgement(
  submission: Record<string, unknown>,
  learnerId: Id<"profiles">,
  activityId: Id<"activities">,
  now: number,
): boolean {
  return String(submission.userId) === String(learnerId)
    && String(submission.activityId) === String(activityId)
    && submission.stableActivityId === PRECALCULUS_TOPIC_11_SOURCE_ACTIVITY_ID
    && submission.masteryContractVersion === "learning-evidence.v1"
    && isCanonicalTopic11Acknowledgement(submission.submissionData)
    && Number.isInteger(submission.attemptOrdinal)
    && Number(submission.attemptOrdinal) >= 1
    && Number.isFinite(submission.submittedAt)
    && Number(submission.submittedAt) >= 0
    && Number(submission.submittedAt) <= now
    && submission.score === undefined
    && submission.maxScore === undefined
    && submission.feedback === undefined
    && submission.gradedAt === undefined;
}

export function isTopic11TeacherConfirmationForSubmission(
  evidence: Record<string, unknown>,
  submission: Record<string, unknown>,
): boolean {
  return evidence.nodeId === PRECALCULUS_PILOT_NODE_ID
    && evidence.activityId === PRECALCULUS_TOPIC_11_SOURCE_ACTIVITY_ID
    && evidence.origin === "teacher_led"
    && evidence.mode === "teaching"
    && evidence.attemptOrdinal === submission.attemptOrdinal
    && evidence.occurredAt === submission.submittedAt
    && evidence.gradedEvidence === undefined
    && evidence.idempotencyKey === `precalc:teacher-led:submission:${String(submission._id)}`;
}

/** Derives the selected Topic 1.1 learner sequence state from stored authority records. */
export async function getTopic11LearnerDeliveryStateHandler(
  ctx: QueryCtx,
  args: { learnerId: Id<"profiles"> },
  selectedPublication: Publication = publication,
) {
  const learner = await ctx.db.get("profiles", args.learnerId);
  const credential = learner
    ? await ctx.db.query("auth_credentials")
      .withIndex("by_username", (query) => query.eq("username", learner.username)).unique()
    : null;
  if (!learner || learner.role !== "student" || !credential || !credential.isActive
    || credential.profileId !== learner._id || credential.username !== learner.username
    || credential.role !== learner.role || credential.organizationId !== learner.organizationId) return null;

  const source = await getApprovedTopic11WorkedSourceHandler(ctx, selectedPublication);
  if (!source) return null;
  const [sourceActivity, lessons] = await Promise.all([
    ctx.db.get("activities", source.activityId),
    ctx.db.query("lessons")
      .withIndex("by_unit_and_order", (query) => query.eq("unitNumber", 1).eq("orderIndex", 1))
      .collect(),
  ]);
  if (!sourceActivity || lessons.length !== 1) return null;
  const now = Date.now();
  const submissions = await ctx.db.query("activity_submissions")
    .withIndex("by_user_and_activity", (query) => (
      query.eq("userId", args.learnerId).eq("activityId", source.activityId)
    )).collect();
  const acknowledgements = (await Promise.all(submissions.map(async (submission) => {
    if (!isStoredTopic11Acknowledgement(submission, args.learnerId, source.activityId, now)) return null;
    const acknowledgedAt = Number(submission.submittedAt);
    if (!Number.isFinite(sourceActivity.createdAt) || sourceActivity.createdAt > acknowledgedAt
      || !record(sourceActivity.approval)
      || !Number.isFinite(sourceActivity.approval.reviewedAt)
      || Number(sourceActivity.approval.reviewedAt) > acknowledgedAt
      || !await hasCurrentTopic11Source(ctx, lessons[0]!._id, source.activityId, acknowledgedAt)) return null;
    return submission;
  }))).filter((submission): submission is NonNullable<typeof submission> => submission !== null);
  if (acknowledgements.length === 0) return "needs_acknowledgement" as const;

  const teacherEvidence = await ctx.db.query("learning_evidence")
    .withIndex("by_learner_and_node", (query) => (
      query.eq("learnerId", args.learnerId).eq("nodeId", PRECALCULUS_PILOT_NODE_ID)
    )).collect();
  const confirmed = acknowledgements.some((submission) => teacherEvidence.some((evidence) => (
    isTopic11TeacherConfirmationForSubmission(evidence, submission)
  )));
  return confirmed ? "ready_for_practice" as const : "awaiting_teacher_confirmation" as const;
}

export const getTopic11LearnerDeliveryState = internalQuery({
  args: { learnerId: v.id("profiles") },
  returns: topic11LearnerDeliveryStateValidator,
  handler: (ctx, args) => getTopic11LearnerDeliveryStateHandler(ctx, args),
});

function isCanonicalTopic11Acknowledgement(value: unknown): boolean {
  return record(value)
    && Object.keys(value).sort().join("|") === "activityId|answers|contractVersion|mode|parts|status"
    && value.contractVersion === "practice.v1"
    && value.activityId === PRECALCULUS_TOPIC_11_SOURCE_ACTIVITY_ID
    && value.mode === "worked_example"
    && value.status === "submitted"
    && record(value.answers) && Object.keys(value.answers).length === 0
    && Array.isArray(value.parts) && value.parts.length === 0;
}

/** Stores an ungraded learner acknowledgement for the reviewed Topic 1.1 source. */
export const createTopic11DailySubmission = internalMutation({
  args: {
    userId: v.id("profiles"),
    activityId: v.string(),
    idempotencyKey: v.string(),
    submissionData: topic11AcknowledgementValidator,
  },
  returns: topic11AcknowledgementResultValidator,
  handler: async (ctx, args) => {
    if (args.activityId !== PRECALCULUS_TOPIC_11_SOURCE_ACTIVITY_ID) {
      throw new Error("Invalid Precalculus Topic 1.1 source activity");
    }
    const key = args.idempotencyKey;
    if (!key.trim() || key.length > 256) throw new Error("Invalid create idempotency key");
    if (!isCanonicalTopic11Acknowledgement(args.submissionData)) {
      throw new Error("Invalid Precalculus Topic 1.1 acknowledgement");
    }
    const profile = await ctx.db.get("profiles", args.userId);
    const credential = profile
      ? await ctx.db.query("auth_credentials")
        .withIndex("by_username", (query) => query.eq("username", profile.username)).unique()
      : null;
    if (!profile || profile.role !== "student" || !credential || !credential.isActive
      || credential.profileId !== profile._id || credential.username !== profile.username
      || credential.role !== profile.role || credential.organizationId !== profile.organizationId) {
      throw new Error("Inactive student identity");
    }
    const existing = await ctx.db.query("activity_submissions")
      .withIndex("by_user_and_create_idempotency_key", (query) => (
        query.eq("userId", args.userId).eq("createIdempotencyKey", key)
      )).unique();
    if (existing) {
      const data = existing.submissionData;
      const originalActivity = await ctx.db.get("activities", existing.activityId);
      if (existing.stableActivityId !== PRECALCULUS_TOPIC_11_SOURCE_ACTIVITY_ID
        || existing.masteryContractVersion !== "learning-evidence.v1"
        || !isCanonicalTopic11Acknowledgement(data)
        || !sameJson(data, args.submissionData)
        || !Number.isInteger(existing.attemptOrdinal) || (existing.attemptOrdinal ?? 0) < 1
        || !Number.isFinite(existing.submittedAt) || existing.submittedAt < 0
        || existing.submittedAt > 8_640_000_000_000_000
        || existing.score !== undefined || existing.maxScore !== undefined
        || existing.feedback !== undefined || existing.gradedAt !== undefined
        || (originalActivity && !hasTopic11SourceActivityIdentity(originalActivity))) {
        throw new Error("idempotency_conflict");
      }
      return {
        submissionId: existing._id,
        attemptOrdinal: existing.attemptOrdinal!,
        submittedAt: new Date(existing.submittedAt).toISOString(),
      };
    }
    if (!isTopic11WorkedSourcePublished()) throw new Error("Precalculus pilot curriculum is not approved");
    const activity = await ctx.db.query("activities")
      .withIndex("by_stable_activity_id", (query) => query.eq("stableActivityId", PRECALCULUS_TOPIC_11_SOURCE_ACTIVITY_ID))
      .unique();
    if (!activity || !hasTopic11SourceActivityIdentity(activity) || activity.approval?.status !== "approved") {
      throw new Error("Precalculus Topic 1.1 source activity is not approved");
    }
    const lesson = await ctx.db.query("lessons")
      .withIndex("by_unit_and_order", (query) => query.eq("unitNumber", 1).eq("orderIndex", 1)).unique();
    const now = Date.now();
    if (!lesson || !await hasCurrentTopic11Source(ctx, lesson._id, activity._id, now)) {
      throw new Error("Precalculus Topic 1.1 source is not published");
    }
    const latest = await ctx.db.query("activity_submissions")
      .withIndex("by_user_and_activity_and_attempt_ordinal", (query) => (
        query.eq("userId", args.userId).eq("activityId", activity._id)
      )).order("desc").first();
    const attemptOrdinal = (latest?.attemptOrdinal ?? 0) + 1;
    const submissionId = await ctx.db.insert("activity_submissions", {
      userId: args.userId,
      activityId: activity._id,
      stableActivityId: PRECALCULUS_TOPIC_11_SOURCE_ACTIVITY_ID,
      submissionData: args.submissionData,
      masteryContractVersion: "learning-evidence.v1",
      createIdempotencyKey: key,
      attemptOrdinal,
      submittedAt: now,
      createdAt: now,
      updatedAt: now,
    });
    return { submissionId, attemptOrdinal, submittedAt: new Date(now).toISOString() };
  },
});
const expectedActivity = (
  mode: "guided_practice" | "independent_practice",
) => ({
  stableActivityId:
    mode === "guided_practice"
      ? PRECALCULUS_PILOT_ACTIVITY_ID
      : PRECALCULUS_PILOT_INDEPENDENT_ACTIVITY_ID,
  displayName:
    mode === "guided_practice"
      ? "Mastery Advantage: Identify Graph Intervals"
      : "Independent Practice: Classify Graph Intervals",
  description:
    mode === "guided_practice"
      ? "Classify the increasing, decreasing, and constant intervals from a graph."
      : "Classify the increasing, decreasing, and constant intervals from a generated graph.",
  props: { nodeId: PRECALCULUS_PILOT_NODE_ID, mode },
  variantSeed: mode === "guided_practice" ? 0 : 2,
});
function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function sameJson(left: unknown, right: unknown): boolean {
  if (Array.isArray(left) || Array.isArray(right)) {
    return Array.isArray(left) && Array.isArray(right)
      && left.length === right.length
      && left.every((value, index) => sameJson(value, right[index]));
  }
  if (record(left) || record(right)) {
    return record(left) && record(right)
      && Object.keys(left).sort().join("|") === Object.keys(right).sort().join("|")
      && Object.keys(left).every((key) => sameJson(left[key], right[key]));
  }
  return Object.is(left, right);
}
function sameRecord(a: unknown, b: Record<string, unknown>): boolean {
  return (
    record(a) &&
    Object.keys(a).length === Object.keys(b).length &&
    Object.entries(b).every(([key, value]) => a[key] === value)
  );
}
function hasExpectedActivityIdentity(
  activity: Record<string, unknown>,
  expected: ReturnType<typeof expectedActivity>,
): boolean {
  return (
    activity.stableActivityId === expected.stableActivityId &&
    activity.componentKey === PRECALCULUS_PILOT_COMPONENT_KEY &&
    activity.displayName === expected.displayName &&
    activity.description === expected.description &&
    sameRecord(activity.props, expected.props) &&
    sameRecord(activity.gradingConfig, { variantSeed: expected.variantSeed })
  );
}
function normalize(value: unknown): string | null {
  return typeof value === "string" && value.trim()
    ? value.trim().replace(/[−–—]/g, "-").replace(/\s+/g, "")
    : null;
}
function canonical(
  data: Record<string, unknown>,
  stableActivityId: string,
  mode: string,
) {
  if (!PracticeSubmissionEnvelopeSchema.safeParse(data).success)
    throw new Error("Invalid Precalculus pilot practice envelope");
  if (
    data.contractVersion !== "practice.v1" ||
    data.activityId !== stableActivityId ||
    data.mode !== mode ||
    data.status !== "submitted"
  )
    throw new Error("Invalid Precalculus pilot practice envelope");
  if (
    !Number.isInteger(data.attemptNumber) ||
    (data.attemptNumber as number) < 1 ||
    typeof data.submittedAt !== "string" ||
    !data.submittedAt.trim() ||
    !Number.isFinite(Date.parse(data.submittedAt))
  )
    throw new Error("Invalid Precalculus pilot practice envelope");
  const allowed = [
    "activityId",
    "answers",
    "attemptNumber",
    "contractVersion",
    "mode",
    "parts",
    "status",
    "submittedAt",
    "artifact",
    "interactionHistory",
    "analytics",
    "studentFeedback",
    "teacherSummary",
    "timing",
  ];
  if (Object.keys(data).some((key) => !allowed.includes(key)))
    throw new Error("Invalid Precalculus pilot submission fields");
  if (
    !record(data.answers) ||
    Object.keys(data.answers).sort().join("|") !==
      "constantIntervals|decreasingIntervals|increasingIntervals"
  )
    throw new Error("Invalid Precalculus pilot answers");
  const answers = {
    increasingIntervals: normalize(data.answers.increasingIntervals),
    decreasingIntervals: normalize(data.answers.decreasingIntervals),
    constantIntervals: normalize(data.answers.constantIntervals),
  };
  if (Object.values(answers).some((answer) => answer === null))
    throw new Error("Invalid Precalculus pilot answers");
  if (!Array.isArray(data.parts) || data.parts.length !== 3)
    throw new Error("Invalid Precalculus pilot parts");
  const parts = new Map<
    string,
    {
      rawAnswer: string;
      hintsUsed: number;
      revealStepsSeen: number;
      changedCount: number;
    }
  >();
  for (const part of data.parts) {
    if (
      !record(part) ||
      typeof part.partId !== "string" ||
      typeof part.rawAnswer !== "string" ||
      parts.has(part.partId)
    )
      throw new Error("Invalid Precalculus pilot parts");
    if (
      Object.keys(part).some(
        (key) =>
          ![
            "partId",
            "rawAnswer",
            "hintsUsed",
            "revealStepsSeen",
            "changedCount",
          ].includes(key),
      )
    )
      throw new Error("Invalid Precalculus pilot parts");
    const hintsUsed = part.hintsUsed ?? 0;
    const revealStepsSeen = part.revealStepsSeen ?? 0;
    const changedCount = part.changedCount ?? 0;
    if (
      ![hintsUsed, revealStepsSeen, changedCount].every(
        (item) =>
          typeof item === "number" && Number.isInteger(item) && item >= 0,
      )
    )
      throw new Error("Invalid Precalculus pilot assistance");
    parts.set(part.partId, {
      rawAnswer: part.rawAnswer,
      hintsUsed: hintsUsed as number,
      revealStepsSeen: revealStepsSeen as number,
      changedCount: changedCount as number,
    });
  }
  for (const key of Object.keys(answers))
    if (parts.get(key)?.rawAnswer !== data.answers[key])
      throw new Error("Precalculus pilot raw answer mismatch");
  return {
    answers: answers as {
      increasingIntervals: string;
      decreasingIntervals: string;
      constantIntervals: string;
    },
    parts,
    optionalFields: Object.fromEntries(
      [
        "artifact",
        "interactionHistory",
        "analytics",
        "studentFeedback",
        "teacherSummary",
        "timing",
      ]
        .filter((key) => key in data)
        .map((key) => [key, data[key]]),
    ),
  };
}

export const createServerOwnedSubmission = internalMutation({
  args: {
    userId: v.id("profiles"),
    activityId: v.string(),
    submissionData: dataValidator,
    idempotencyKey: v.string(),
  },
  returns: resultValidator,
  handler: async (ctx, args) => {
    const mode =
      args.activityId === PRECALCULUS_PILOT_ACTIVITY_ID
        ? "guided_practice"
        : args.activityId === PRECALCULUS_PILOT_INDEPENDENT_ACTIVITY_ID
          ? "independent_practice"
          : null;
    if (
      !mode ||
      !args.idempotencyKey.trim() ||
      args.idempotencyKey.length > 256
    )
      throw new Error("Invalid Precalculus pilot activity or idempotency key");
    const profile = await ctx.db.get("profiles", args.userId);
    const credential = profile
      ? await ctx.db
          .query("auth_credentials")
          .withIndex("by_username", (q) => q.eq("username", profile.username))
          .unique()
      : null;
    if (
      !profile ||
      profile.role !== "student" ||
      !credential ||
      !credential.isActive ||
      credential.profileId !== profile._id ||
      credential.username !== profile.username ||
      credential.role !== profile.role ||
      credential.organizationId !== profile.organizationId
    )
      throw new Error("Inactive student identity");
    const expected = expectedActivity(mode);
    const submitted = canonical(args.submissionData, args.activityId, mode);
    const answers = submitted.answers;
    const graded = gradeTopic11IntervalGraph(expected.variantSeed, answers);
    const existing = await ctx.db
      .query("activity_submissions")
      .withIndex("by_user_and_create_idempotency_key", (q) =>
        q
          .eq("userId", args.userId)
          .eq("createIdempotencyKey", args.idempotencyKey),
      )
      .unique();
    if (existing) {
      const originalActivity = await ctx.db.get(
        "activities",
        existing.activityId,
      );
      const stored = record(existing.submissionData)
        ? existing.submissionData
        : null;
      const storedEnvelopeValid =
        stored !== null &&
        PracticeSubmissionEnvelopeSchema.safeParse(stored).success &&
        Object.keys(stored).every((key) => SELECTED_ENVELOPE_KEYS.has(key));
      const old = stored && record(stored.answers) ? stored.answers : null;
      const oldParts =
        stored && Array.isArray(stored.parts) ? stored.parts : [];
      const expectedPartIds = new Set(Object.keys(answers));
      const seenPartIds = new Set<string>();
      const gradedPartMap = new Map(
        graded.parts.map((part) => [part.partId, part]),
      );
      const partsMatch =
        oldParts.length === expectedPartIds.size &&
        oldParts.every((part) => {
          if (
            !record(part) ||
            Object.keys(part).sort().join("|") !== SELECTED_STORED_PART_KEYS ||
            typeof part.partId !== "string" ||
            !expectedPartIds.has(part.partId) ||
            seenPartIds.has(part.partId)
          )
            return false;
          seenPartIds.add(part.partId);
          const submittedPart = submitted.parts.get(part.partId);
          const expectedPart = gradedPartMap.get(part.partId);
          return (
            submittedPart !== undefined &&
            expectedPart !== undefined &&
            part.rawAnswer === answers[part.partId as keyof typeof answers] &&
            (part.hintsUsed ?? 0) === submittedPart.hintsUsed &&
            (part.revealStepsSeen ?? 0) === submittedPart.revealStepsSeen &&
            (part.changedCount ?? 0) === submittedPart.changedCount &&
            part.isCorrect === expectedPart.isCorrect &&
            part.score === expectedPart.score &&
            part.maxScore === expectedPart.maxScore
          );
        });
      if (
        typeof existing.activityId !== "string" ||
        !existing.activityId.trim() ||
        (originalActivity !== null &&
          (!record(originalActivity) ||
            !hasExpectedActivityIdentity(originalActivity, expected))) ||
        existing.stableActivityId !== args.activityId ||
        existing.masteryContractVersion !== "learning-evidence.v1" ||
        !stored ||
        !storedEnvelopeValid ||
        stored.contractVersion !== "practice.v1" ||
        stored.activityId !== args.activityId ||
        stored.mode !== mode ||
        stored.status !== "graded" ||
        typeof existing.submittedAt !== "number" ||
        !Number.isFinite(existing.submittedAt) ||
        stored.submittedAt !== new Date(existing.submittedAt).toISOString() ||
        !old ||
        Object.keys(old).sort().join("|") !==
          "constantIntervals|decreasingIntervals|increasingIntervals" ||
        Object.entries(answers).some(
          ([key, value]) => normalize(old[key]) !== value,
        ) ||
        !partsMatch ||
        !Number.isInteger(existing.attemptOrdinal) ||
        existing.attemptOrdinal! < 1 ||
        stored.attemptNumber !== existing.attemptOrdinal ||
        existing.score !== graded.score ||
        existing.maxScore !== graded.maxScore ||
        typeof existing.feedback !== "string"
      )
        throw new Error("idempotency_conflict");
      return {
        submissionId: existing._id,
        score: existing.score!,
        maxScore: existing.maxScore!,
        attemptOrdinal: existing.attemptOrdinal!,
        feedback: existing.feedback,
      };
    }
    if (!isPrecalculusPilotPublished())
      throw new Error("Precalculus pilot curriculum is not approved");
    const activity = await ctx.db
      .query("activities")
      .withIndex("by_stable_activity_id", (q) =>
        q.eq("stableActivityId", args.activityId),
      )
      .unique();
    if (
      !activity ||
      !hasExpectedActivityIdentity(activity, expected) ||
      activity.approval?.status !== "approved"
    )
      throw new Error(
        "Precalculus pilot activity is not approved or has invalid identity",
      );
    const latest = await ctx.db
      .query("activity_submissions")
      .withIndex("by_user_and_activity_and_attempt_ordinal", (q) =>
        q.eq("userId", args.userId).eq("activityId", activity._id),
      )
      .order("desc")
      .first();
    const attemptOrdinal = (latest?.attemptOrdinal ?? 0) + 1;
    const now = Date.now();
    const feedback = `${graded.score}/${graded.maxScore} interval classifications matched the server rubric.`;
    const gradedParts = graded.parts.map((part) => ({
      ...submitted.parts.get(part.partId),
      ...part,
      rawAnswer: answers[part.partId as keyof typeof answers],
    }));
    const submissionId = await ctx.db.insert("activity_submissions", {
      userId: args.userId,
      activityId: activity._id,
      stableActivityId: args.activityId,
      submissionData: {
        contractVersion: "practice.v1",
        activityId: args.activityId,
        mode,
        status: "graded",
        attemptNumber: attemptOrdinal,
        submittedAt: new Date(now).toISOString(),
        answers,
        parts: gradedParts,
        ...submitted.optionalFields,
      },
      masteryContractVersion: "learning-evidence.v1",
      createIdempotencyKey: args.idempotencyKey,
      attemptOrdinal,
      score: graded.score,
      maxScore: graded.maxScore,
      feedback,
      submittedAt: now,
      gradedAt: now,
      createdAt: now,
      updatedAt: now,
    });
    return {
      submissionId,
      score: graded.score,
      maxScore: graded.maxScore,
      attemptOrdinal,
      feedback,
    };
  },
});

export const getProfileByUsername = internalQuery({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .unique();
    return profile;
  },
});
