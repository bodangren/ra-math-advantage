import {
  internalMutation,
  internalQuery,
  type QueryCtx,
} from "./_generated/server";
import { v, ConvexError, convexToJson } from "convex/values";
import { Id } from "./_generated/dataModel";
import { coerceNullableString } from "./dashboardHelpers";
import {
  buildLessonPhaseProgress,
  buildPublishedUnitProgressRows,
  resolveLatestPublishedLessonVersion,
} from "../lib/progress/published-curriculum";
import { loadFullCurriculumGraph } from "../lib/curriculum/skill-graph-loader";
import {
  projectStudentVisualization,
  type StudentVisualizationV1,
} from "@math-platform/knowledge-space-practice";
import {
  isIm3GraphPilotPublished,
} from "./learningEvidence";
import {
  getSelectedWorkedAcknowledgementHandler,
  isSelectedWorkedActivity,
} from "./activities";
import {
  IM3_PILOT_NODE,
  IM3_TEACHER_LED_ACTIVITY_ID,
} from "../lib/practice/learning-evidence-pilot";
import {
  IM3_QF_DRAFT_MAPPINGS,
  IM3_QF_NODE,
  quadraticFormulaPublicProps,
} from "../lib/activities/server-grading";

const IM3_TEACHER_LED_LESSON_SLUG = "module-1-lesson-1";
const IM3_TEACHER_LED_PHASE_NUMBER = 4;

async function projectActivitySection(ctx: QueryCtx, section: {
  _id: Id<"phase_sections">;
  sequenceOrder: number;
  sectionType: string;
  content: unknown;
}, selectedSourceSection: boolean) {
  if (section.sectionType !== "activity") return section;
  const content = section.content as { activityId?: Id<"activities">; componentKey?: string; stableActivityId?: string };
  const withoutProjectedIdentity = () => {
    const { stableActivityId: _stableActivityId, masteryNodeId: _masteryNodeId,
      learningEvidenceMode: _learningEvidenceMode, srsEligible: _srsEligible,
      activityProps: _activityProps, ...storedContent } = content as Record<string, unknown>;
    return { ...section, content: { ...storedContent, componentKey: "unavailable" } };
  };
  const activityId = content.activityId
    ? ctx.db.normalizeId("activities", content.activityId)
    : null;
  const activity = activityId ? await ctx.db.get(activityId) : null;
  const claimsSelectedIdentity = selectedSourceSection
    || activity?.stableActivityId === IM3_TEACHER_LED_ACTIVITY_ID
    || content.stableActivityId === IM3_TEACHER_LED_ACTIVITY_ID
    || (content as Record<string, unknown>).masteryNodeId === IM3_PILOT_NODE;
  if (claimsSelectedIdentity) {
    if (!isIm3GraphPilotPublished() || !activity || !isSelectedWorkedActivity(activity)) {
      return withoutProjectedIdentity();
    }
    return {
      ...section,
      content: {
        ...content,
        componentKey: activity.componentKey,
        stableActivityId: activity.stableActivityId,
        masteryNodeId: activity.masteryNodeId,
        learningEvidenceMode: activity.learningEvidenceMode,
        srsEligible: activity.srsEligible,
        activityProps: activity.props,
      },
    };
  }

  const mappings = Object.entries(IM3_QF_DRAFT_MAPPINGS).filter(([, mapping]) => (
    mapping.stableActivityId === activity?.stableActivityId
  ));
  const claimsQfIdentity = content.componentKey === "quadratic-formula"
    || (content as Record<string, unknown>).masteryNodeId === IM3_QF_NODE
    || activity?.componentKey === "quadratic-formula"
    || activity?.masteryNodeId === IM3_QF_NODE
    || mappings.length > 0
    || content.stableActivityId === IM3_QF_DRAFT_MAPPINGS.guided_practice.stableActivityId
    || content.stableActivityId === IM3_QF_DRAFT_MAPPINGS.independent_practice.stableActivityId;
  if (!claimsQfIdentity) return section;
  if (!activity || mappings.length !== 1) return withoutProjectedIdentity();
  const [mode, mapping] = mappings[0] as [keyof typeof IM3_QF_DRAFT_MAPPINGS, (typeof IM3_QF_DRAFT_MAPPINGS)[keyof typeof IM3_QF_DRAFT_MAPPINGS]];
  const expectedProps = quadraticFormulaPublicProps(mode, mapping.seed);
  const valid = activity.componentKey === "quadratic-formula"
    && activity.masteryNodeId === IM3_QF_NODE
    && activity.srsEligible === false
    && activity.approval?.status === "unreviewed"
    && (activity.props as { presentationMode?: unknown }).presentationMode === mapping.presentationMode
    && JSON.stringify(convexToJson(activity.props as never)) === JSON.stringify(convexToJson(expectedProps as never));
  if (!valid) return withoutProjectedIdentity();
  return {
    ...section,
    content: {
      activityId: content.activityId,
      componentKey: activity.componentKey,
      stableActivityId: activity.stableActivityId,
      masteryNodeId: activity.masteryNodeId,
      learningEvidenceMode: mode,
      srsEligible: activity.srsEligible,
      activityProps: activity.props,
    },
  };
}

/**
 * Convex internalQuery wrapper: get dashboard data.
 * @returns {Promise<unknown>} The wrapper result.
 */
export const getDashboardData = internalQuery({
  args: { userId: v.id("profiles") },
  handler: async (ctx, args) => {
    // 1. Fetch all lessons
    const allLessons = await ctx.db.query("lessons").collect();
    // Sort lessons by unitNumber then orderIndex
    allLessons.sort((a, b) => {
      if (a.unitNumber !== b.unitNumber) return a.unitNumber - b.unitNumber;
      return a.orderIndex - b.orderIndex;
    });

    if (allLessons.length === 0) return [];

    const lessonVersions = await ctx.db.query("lesson_versions").collect();
    const phaseVersions = await ctx.db.query("phase_versions").collect();
    const userProgress = await ctx.db
      .query("student_progress")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    return buildPublishedUnitProgressRows({
      lessons: allLessons.map((lesson) => ({
        ...lesson,
        description: coerceNullableString(lesson.description),
      })),
      lessonVersions,
      phaseVersions,
      progressRows: userProgress,
    });
  },
});

/**
 * Convex internalQuery wrapper: get lesson progress.
 * @returns {Promise<unknown>} The wrapper result.
 */
export const getLessonProgress = internalQuery({
  args: { 
    userId: v.id("profiles"),
    lessonIdentifier: v.string() // slug or id
  },
  handler: async (ctx, args) => {
    // 1. Find lesson by slug or id
    let lesson = null;
    try {
      // Try as ID first
      lesson = await ctx.db.get(args.lessonIdentifier as Id<"lessons">);
    } catch {
      // Ignore if not a valid ID format
    }

    if (!lesson) {
      lesson = await ctx.db
        .query("lessons")
        .withIndex("by_slug", (q) => q.eq("slug", args.lessonIdentifier))
        .unique();
    }

    if (!lesson) return null;

    // 2. Get latest published version
    const versions = await ctx.db
      .query("lesson_versions")
      .withIndex("by_lesson", (q) => q.eq("lessonId", lesson._id))
      .collect();

    const latestVersion = resolveLatestPublishedLessonVersion(versions);
    if (!latestVersion) return { lessonTitle: lesson.title, unitNumber: lesson.unitNumber, lessonNumber: lesson.orderIndex, phases: [] };

    // 3. Get phases for this version
    const phases = await ctx.db
      .query("phase_versions")
      .withIndex("by_lesson_version", (q) => q.eq("lessonVersionId", latestVersion._id))
      .collect();

    // 4. Get student progress
    const userProgress = await ctx.db
      .query("student_progress")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // 5. Fetch sections for each phase (batched via Promise.all)
    const phaseIds = phases.map(p => p._id);
    const allSections = await Promise.all(
      phases.map(async phase => {
        const phaseId = phase._id;
        const sections = await ctx.db
          .query("phase_sections")
          .withIndex("by_phase_version", (q) => q.eq("phaseVersionId", phaseId))
          .collect();
        return Promise.all(sections.map((section) => projectActivitySection(ctx, {
          _id: section._id,
          sequenceOrder: section.sequenceOrder,
          sectionType: section.sectionType,
          content: section.content,
        }, lesson.slug === IM3_TEACHER_LED_LESSON_SLUG
          && phase.phaseNumber === IM3_TEACHER_LED_PHASE_NUMBER
          && section.sectionType === "activity"
          && section.sequenceOrder === 2)));
      })
    );
    const sectionsByPhaseId = new Map<string, { id: string; sequenceOrder: number; sectionType: string; content: unknown }[]>();
    phaseIds.forEach((phaseId, i) => {
      sectionsByPhaseId.set(phaseId, allSections[i]
        .sort((a, b) => a.sequenceOrder - b.sequenceOrder)
        .map(s => ({ id: s._id, sequenceOrder: s.sequenceOrder, sectionType: s.sectionType, content: s.content }))
      );
    });

    const progressRows = buildLessonPhaseProgress({ phases, progressRows: userProgress });

    return {
      lessonTitle: lesson.title,
      unitNumber: lesson.unitNumber,
      lessonNumber: lesson.orderIndex,
      phases: progressRows.map(p => ({
        ...p,
        sections: sectionsByPhaseId.get(p.phaseId) ?? [],
      })),
    };
  }
});

/**
 * Convex internalMutation wrapper: complete phase.
 * @returns {Promise<unknown>} The wrapper result.
 * @throws {ConvexError} Thrown if the lesson, published version, or phase is not found.
 */
export const completePhase = internalMutation({
  args: {
    userId: v.id("profiles"),
    lessonId: v.string(), // slug or id
    phaseNumber: v.number(),
    timeSpent: v.number(),
    idempotencyKey: v.string(),
    linkedStandardId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. Find lesson
    let lesson = null;
    try {
      lesson = await ctx.db.get(args.lessonId as Id<"lessons">);
    } catch {}

    if (!lesson) {
      lesson = await ctx.db
        .query("lessons")
        .withIndex("by_slug", (q) => q.eq("slug", args.lessonId))
        .unique();
    }
    if (!lesson) throw new ConvexError("Lesson not found");

    // 2. Get latest published version
    const versions = await ctx.db
      .query("lesson_versions")
      .withIndex("by_lesson", (q) => q.eq("lessonId", lesson._id))
      .collect();
    const latestVersion = resolveLatestPublishedLessonVersion(versions);
    if (!latestVersion) throw new ConvexError("Published lesson version not found");

    // 3. Find specific phase
    const phase = await ctx.db
      .query("phase_versions")
      .withIndex("by_lesson_version_and_phase", (q) =>
        q.eq("lessonVersionId", latestVersion._id).eq("phaseNumber", args.phaseNumber)
      )
      .unique();
    if (!phase) throw new ConvexError("Phase not found");

    const isIm3TeacherLedPhase =
      lesson.slug === IM3_TEACHER_LED_LESSON_SLUG
      && phase.phaseNumber === IM3_TEACHER_LED_PHASE_NUMBER;

    const existing = await ctx.db
      .query("student_progress")
      .withIndex("by_user_and_phase", (q) =>
        q.eq("userId", args.userId).eq("phaseId", phase._id)
      )
      .unique();

    if (existing?.status === "completed") {
      return { success: true, alreadyCompleted: true };
    }

    if (isIm3TeacherLedPhase) {
      const sections = await ctx.db.query("phase_sections")
        .withIndex("by_phase_version", (q) => q.eq("phaseVersionId", phase._id))
        .collect();
      const activities = await Promise.all(sections
        .filter((section) => section.sectionType === "activity")
        .map((section) => {
          const activityId = (section.content as { activityId?: Id<"activities"> }).activityId;
          return activityId ? ctx.db.get(activityId) : null;
        }));
      const selectedWorked = activities.filter((activity) => (
        activity?.stableActivityId === IM3_TEACHER_LED_ACTIVITY_ID
        && isSelectedWorkedActivity(activity)
      ));
      const selectedActivity = selectedWorked[0];
      if (!selectedActivity || selectedWorked.length !== 1) {
        throw new ConvexError("Selected Worked activity is not available");
      }
      const acknowledgement = await getSelectedWorkedAcknowledgementHandler(ctx, {
        userId: args.userId,
        activityId: selectedActivity._id,
      });
      if (!acknowledgement?.acknowledged) {
        throw new ConvexError("Selected Worked acknowledgement is required");
      }
    }

    const now = Date.now();

    // 5. Update or create progress
    if (existing) {
      await ctx.db.patch(existing._id, {
        status: "completed",
        completedAt: now,
        timeSpentSeconds: (existing.timeSpentSeconds ?? 0) + args.timeSpent,
        idempotencyKey: args.idempotencyKey,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("student_progress", {
        userId: args.userId,
        phaseId: phase._id,
        status: "completed",
        startedAt: now - (args.timeSpent * 1000),
        completedAt: now,
        timeSpentSeconds: args.timeSpent,
        idempotencyKey: args.idempotencyKey,
        createdAt: now,
        updatedAt: now,
      });
    }

    // 6. Handle competency if linkedStandardId provided
    if (args.linkedStandardId && !isIm3TeacherLedPhase) {
      const standard = await ctx.db
        .query("competency_standards")
        .withIndex("by_code", (q) => q.eq("code", args.linkedStandardId!))
        .unique();

      if (standard) {
        const existingComp = await ctx.db
          .query("student_competency")
          .withIndex("by_student_and_standard", (q) =>
            q.eq("studentId", args.userId).eq("standardId", standard._id)
          )
          .unique();

        if (existingComp) {
          await ctx.db.patch(existingComp._id, {
            masteryLevel: Math.max(existingComp.masteryLevel, 1), // Basic completion = level 1
            lastUpdated: now,
          });
        } else {
          await ctx.db.insert("student_competency", {
            studentId: args.userId,
            standardId: standard._id,
            masteryLevel: 1,
            lastUpdated: now,
            createdAt: now,
          });
        }
      }
    }

    return {
      success: true,
      nextPhaseUnlocked: true // Simplified for now
    };
  }
});

/**
 * Convex internalMutation wrapper: skip phase.
 * @returns {Promise<unknown>} The wrapper result.
 * @throws {ConvexError} Thrown if the lesson, published version, or phase is not found.
 */
export const skipPhase = internalMutation({
  args: {
    userId: v.id("profiles"),
    lessonId: v.string(),
    phaseNumber: v.number(),
    idempotencyKey: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Find lesson
    let lesson = null;
    try {
      lesson = await ctx.db.get(args.lessonId as Id<"lessons">);
    } catch {}

    if (!lesson) {
      lesson = await ctx.db
        .query("lessons")
        .withIndex("by_slug", (q) => q.eq("slug", args.lessonId))
        .unique();
    }
    if (!lesson) throw new ConvexError("Lesson not found");

    // 2. Get latest published version
    const versions = await ctx.db
      .query("lesson_versions")
      .withIndex("by_lesson", (q) => q.eq("lessonId", lesson._id))
      .collect();
    const latestVersion = resolveLatestPublishedLessonVersion(versions);
    if (!latestVersion) throw new ConvexError("Published lesson version not found");

    // 3. Find specific phase
    const phase = await ctx.db
      .query("phase_versions")
      .withIndex("by_lesson_version_and_phase", (q) =>
        q.eq("lessonVersionId", latestVersion._id).eq("phaseNumber", args.phaseNumber)
      )
      .unique();
    if (!phase) throw new ConvexError("Phase not found");

    // 4. Check idempotency
    const existing = await ctx.db
      .query("student_progress")
      .withIndex("by_user_and_phase", (q) => 
        q.eq("userId", args.userId).eq("phaseId", phase._id)
      )
      .unique();

    if (existing?.status === "skipped") {
      return { success: true, alreadySkipped: true };
    }

    const now = Date.now();

    // 5. Update or create progress
    if (existing) {
      await ctx.db.patch(existing._id, {
        status: "skipped",
        updatedAt: now,
        idempotencyKey: args.idempotencyKey,
      });
    } else {
      await ctx.db.insert("student_progress", {
        userId: args.userId,
        phaseId: phase._id,
        status: "skipped",
        startedAt: now,
        idempotencyKey: args.idempotencyKey,
        createdAt: now,
        updatedAt: now,
      });
    }

    return {
      success: true,
      nextPhaseUnlocked: true
    };
  }
});

interface ChatbotPhase {
  phaseNumber: number;
  title: string;
  sections: Array<{
    sectionType: string;
    content: {
      markdown?: string;
    };
  }>;
}

interface ChatbotLessonData {
  lessonTitle: string;
  unitTitle: string;
  learningObjectives: string[];
  phases: ChatbotPhase[];
}

/**
 * Convex internalQuery wrapper: get lesson for chatbot.
 * @returns {Promise<unknown>} The wrapper result.
 */
export const getLessonForChatbot = internalQuery({
  args: { lessonIdentifier: v.string() },
  handler: async (ctx, args): Promise<ChatbotLessonData | null> => {
    let lesson = null;
    try {
      lesson = await ctx.db.get(args.lessonIdentifier as Id<"lessons">);
    } catch {}

    if (!lesson) {
      lesson = await ctx.db
        .query("lessons")
        .withIndex("by_slug", (q) => q.eq("slug", args.lessonIdentifier))
        .unique();
    }

    if (!lesson) return null;

    const versions = await ctx.db
      .query("lesson_versions")
      .withIndex("by_lesson", (q) => q.eq("lessonId", lesson._id))
      .collect();

    const latestVersion = resolveLatestPublishedLessonVersion(versions);
    if (!latestVersion) return null;

    const phases = await ctx.db
      .query("phase_versions")
      .withIndex("by_lesson_version", (q) => q.eq("lessonVersionId", latestVersion._id))
      .collect();

    phases.sort((a, b) => a.phaseNumber - b.phaseNumber);

    const phasesWithSections: ChatbotPhase[] = [];
    const phaseIds = phases.map(p => p._id);
    const allSections = await Promise.all(
      phaseIds.map(phaseId =>
        ctx.db
          .query("phase_sections")
          .withIndex("by_phase_version", (q) => q.eq("phaseVersionId", phaseId))
          .collect()
      )
    );
    phases.forEach((phase, i) => {
      const sections = allSections[i];
      sections.sort((a, b) => a.sequenceOrder - b.sequenceOrder);

      phasesWithSections.push({
        phaseNumber: phase.phaseNumber,
        title: coerceNullableString(phase.title) ?? '',
        sections: sections.map(s => ({
          sectionType: s.sectionType,
          content: s.content as { markdown?: string },
        })),
      });
    });

    const unitTitle = `Unit ${lesson.unitNumber}`;

    return {
      lessonTitle: lesson.title,
      unitTitle,
      learningObjectives: (lesson.learningObjectives ?? []).map(s => s.trim()).filter(Boolean),
      phases: phasesWithSections,
    };
  },
});

/**
 * Convex internalQuery wrapper: is student actively enrolled.
 * @returns {Promise<unknown>} The wrapper result.
 */
export const isStudentActivelyEnrolled = internalQuery({
  args: { studentId: v.id("profiles") },
  handler: async (ctx, args): Promise<boolean> => {
    const enrollments = await ctx.db
      .query("class_enrollments")
      .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
      .collect();

    const hasActiveEnrollment = enrollments.some((e) => e.status === "active");
    return hasActiveEnrollment;
  },
});

/**
 * Convex internalQuery wrapper: is student enrolled in class for lesson.
 * @returns {Promise<unknown>} The wrapper result.
 */
export const isStudentEnrolledInClassForLesson = internalQuery({
  args: {
    studentId: v.id("profiles"),
    lessonId: v.id("lessons"),
  },
  handler: async (ctx, args): Promise<boolean> => {
    const enrollments = await ctx.db
      .query("class_enrollments")
      .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
      .collect();

    const activeEnrollments = enrollments.filter((e) => e.status === "active");
    if (activeEnrollments.length === 0) {
      return false;
    }

    const activeClassIds = new Set(activeEnrollments.map((e) => e.classId));

    const classLessonsForLesson = await ctx.db
      .query("class_lessons")
      .withIndex("by_lesson", (q) => q.eq("lessonId", args.lessonId))
      .collect();

    const enrolledClassHasLesson = classLessonsForLesson.some(
      (cl) => activeClassIds.has(cl.classId),
    );
    if (enrolledClassHasLesson) {
      return true;
    }

    const anyClassLessonChecks = await Promise.all(
      [...activeClassIds].map((classId) =>
        ctx.db
          .query("class_lessons")
          .withIndex("by_class_and_lesson", (q) => q.eq("classId", classId))
          .first(),
      ),
    );

    const anyClassHasLessons = anyClassLessonChecks.some((result) => result !== null);
    if (!anyClassHasLessons) {
      return false;
    }

    return false;
  },
});

/**
 * Computes the student visualization payload for the IM3 dashboard.
 *
 * Loads the full curriculum skill graph from JSON (no persisted graph table — per
 * `apps/integrated-math-3/convex/schema.ts` and the next-skill-planner
 * test-strategy §3), the student's `placement_results` to derive
 * `learnerState`, and the active `student_misconception_state` rows for the
 * active-misconception count.
 *
 * Exported as a named function so the IM3 mock-ctx tests can call it
 * directly without `convex-test` (see
 * `apps/integrated-math-3/__tests__/convex/studentVisualization.test.ts`).
 * The Convex query (`getStudentVisualization`) delegates here.
 *
 * @param {QueryCtx} ctx - The Convex query context.
 * @param {{ userId: Id<"profiles"> }} args - The student profile id.
 * @returns {Promise<StudentVisualizationV1>} The visualization payload,
 *   validated against `studentVisualizationV1Schema`.
 */
export async function getStudentVisualizationHandler(
  ctx: QueryCtx,
  args: { userId: Id<"profiles"> },
): Promise<StudentVisualizationV1> {
  const { nodes, edges } = loadFullCurriculumGraph();

  const placements = await ctx.db
    .query("placement_results")
    .withIndex("by_student", (q) => q.eq("studentId", args.userId))
    .collect();

  const learnerState: Record<string, "mastered" | "ready" | "blocked"> = {};
  for (const p of placements) {
    if (p.masteryEstimate >= 0.8) {
      learnerState[p.nodeId] = "mastered";
    } else if (p.masteryEstimate >= 0.3) {
      learnerState[p.nodeId] = "ready";
    } else {
      learnerState[p.nodeId] = "blocked";
    }
  }

  const misconceptions = await ctx.db
    .query("student_misconception_state")
    .withIndex("by_student_status", (q) =>
      q.eq("studentId", args.userId).eq("status", "active"),
    )
    .collect();

  const activeMisconceptionSlugs = misconceptions.map((m) => m.misconceptionId);

  return projectStudentVisualization(nodes, edges, learnerState, {
    activeMisconceptionSlugs,
  });
}

/**
 * Computes the student visualization payload for the IM3 dashboard.
 *
 * Loads the full curriculum skill graph from JSON (no persisted graph table — per
 * `apps/integrated-math-3/convex/schema.ts` and the next-skill-planner
 * test-strategy §3), the student's `placement_results` to derive
 * `learnerState`, and the active `student_misconception_state` rows for the
 * active-misconception count.
 *
 * Exported as a named function so the IM3 mock-ctx tests can call it
 * directly without `convex-test` (see
 * `apps/integrated-math-3/__tests__/convex/studentVisualization.test.ts`).
 * The Convex query (`getStudentVisualization`) delegates here.
 *
 * @param {QueryCtx} ctx - The Convex query context.
 * @param {{ userId: Id<"profiles"> }} args - The student profile id.
 * @returns {Promise<StudentVisualizationV1>} The visualization payload,
 *   validated against `studentVisualizationV1Schema`.
 */
export const getStudentVisualization = internalQuery({
  args: { userId: v.id("profiles") },
  handler: getStudentVisualizationHandler,
});
