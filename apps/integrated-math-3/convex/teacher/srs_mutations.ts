import { internalMutation, type MutationCtx } from "../_generated/server";
import { v } from "convex/values";
import { Id, type Doc } from "../_generated/dataModel";
import type { ObjectivePriority } from "@math-platform/srs-engine";

export const VALID_PRIORITIES: ObjectivePriority[] = [
  "essential",
  "supporting",
  "extension",
  "triaged",
];

const PRIORITY_NUMERIC: Record<ObjectivePriority, number> = {
  essential: 0,
  supporting: 1,
  extension: 2,
  triaged: 3,
};

/**
 * Retrieves an authorized teacher profile for a user.
 * @param {MutationCtx} ctx - The mutation context
 * @param {Id<"profiles">} userId - The profile ID to check
 * @returns {Promise<Doc<"profiles"> | null>} The teacher/admin profile, or null if not authorized
 */
async function getAuthorizedTeacher(
  ctx: MutationCtx,
  userId: Id<"profiles">
): Promise<Doc<"profiles"> | null> {
  const teacher = await ctx.db.get("profiles", userId);
  if (!teacher || (teacher.role !== "teacher" && teacher.role !== "admin")) {
    return null;
  }
  return teacher;
}

/**
 * Validates that a teacher owns a specific class.
 * @param {MutationCtx} ctx - The mutation context
 * @param {Id<"profiles">} userId - The teacher profile ID
 * @param {Id<"classes">} classId - The class to validate ownership of
 * @returns {Promise<boolean>} True if the teacher owns the class, false otherwise
 */
async function validateTeacherOwnsClass(
  ctx: MutationCtx,
  userId: Id<"profiles">,
  classId: Id<"classes">
): Promise<boolean> {
  const teacher = await getAuthorizedTeacher(ctx, userId);
  if (!teacher) return false;

  const classDoc = await ctx.db.get("classes", classId);
  if (!classDoc) return false;

  return classDoc.teacherId === teacher._id;
}

/**
 * Validates that a student is actively enrolled in a class.
 * @param {MutationCtx} ctx - The mutation context
 * @param {Id<"classes">} classId - The class to check enrollment in
 * @param {Id<"profiles">} studentId - The student profile ID
 * @returns {Promise<boolean>} True if the student is actively enrolled, false otherwise
 */
async function validateStudentInClass(
  ctx: MutationCtx,
  classId: Id<"classes">,
  studentId: Id<"profiles">
): Promise<boolean> {
  const enrollment = await ctx.db
    .query("class_enrollments")
    .withIndex("by_class_and_student", (q) =>
      q.eq("classId", classId).eq("studentId", studentId)
    )
    .first();
  return enrollment?.status === "active";
}

export type UpdateObjectivePriorityArgs = {
  userId: Id<"profiles">;
  classId: Id<"classes">;
  objectiveId: string;
  priority: ObjectivePriority;
  courseKey: string;
};

/**
 * Updates the priority of an objective for a class.
 * @param {MutationCtx} ctx - The mutation context
 * @param {UpdateObjectivePriorityArgs} args - The update arguments including user, class, objective, and priority
 * @returns {Promise<{ success: boolean; error?: string }>} Success flag or error message
 * @throws Error if the priority value is invalid
 */
export async function updateObjectivePriorityHandler(
  ctx: MutationCtx,
  args: UpdateObjectivePriorityArgs
): Promise<{ success: boolean; error?: string }> {
  const ownsClass = await validateTeacherOwnsClass(ctx, args.userId, args.classId);
  if (!ownsClass) {
    return { success: false, error: "Unauthorized" };
  }

  if (!VALID_PRIORITIES.includes(args.priority)) {
    throw new Error("Invalid priority");
  }

  const standard = await ctx.db
    .query("competency_standards")
    .withIndex("by_code", (q) => q.eq("code", args.objectiveId))
    .first();

  if (!standard) {
    return { success: false, error: "Objective not found" };
  }

  const policy = await ctx.db
    .query("objective_policies")
    .withIndex("by_standardId", (q) => q.eq("standardId", standard._id))
    .first();

  if (!policy || policy.courseKey !== args.courseKey) {
    return { success: false, error: "Policy not found" };
  }

  await ctx.db.patch(policy._id, {
    policy: args.priority,
    priority: PRIORITY_NUMERIC[args.priority],
  });

  return { success: true };
}

/**
 * Updates the priority of an objective for a class.
 * @param {MutationCtx} ctx - The mutation context
 * @param {UpdateObjectivePriorityArgs} args - The update arguments including user, class, objective, and priority
 * @returns {Promise<{ success: boolean; error?: string }>} Success flag or error message
 * @throws Error if the priority value is invalid
 */
export const updateObjectivePriority = internalMutation({
  args: {
    userId: v.id("profiles"),
    classId: v.id("classes"),
    objectiveId: v.string(),
    priority: v.union(
      v.literal("essential"),
      v.literal("supporting"),
      v.literal("extension"),
      v.literal("triaged")
    ),
    courseKey: v.string(),
  },
  handler: updateObjectivePriorityHandler,
});

export type ResetStudentCardsArgs = {
  userId: Id<"profiles">;
  classId: Id<"classes">;
  studentId: Id<"profiles">;
  objectiveId: string;
};

export type ResetStudentCardsResult =
  | { success: true; resetCount: number }
  | { success: false; error: string };

/**
 * Resets all SRS cards for a student on a specific objective.
 * @param {MutationCtx} ctx - The mutation context
 * @param {ResetStudentCardsArgs} args - The reset arguments including user, class, student, and objective
 * @returns {Promise<ResetStudentCardsResult>} Success with reset count, or error
 */
export async function resetStudentCardsHandler(
  ctx: MutationCtx,
  args: ResetStudentCardsArgs
): Promise<ResetStudentCardsResult> {
  const ownsClass = await validateTeacherOwnsClass(ctx, args.userId, args.classId);
  if (!ownsClass) {
    return { success: false, error: "Unauthorized" };
  }

  const studentInClass = await validateStudentInClass(ctx, args.classId, args.studentId);
  if (!studentInClass) {
    return { success: false, error: "Student not in class" };
  }

  const cards = await ctx.db
    .query("srs_cards")
    .withIndex("by_student_and_objective", (q) =>
      q.eq("studentId", args.studentId).eq("objectiveId", args.objectiveId)
    )
    .collect();

  if (cards.length === 0) {
    return { success: true, resetCount: 0 };
  }

  const now = Date.now();
  const nowIso = new Date(now).toISOString();

  for (const card of cards) {
    await ctx.db.replace(card._id, {
      studentId: card.studentId,
      objectiveId: card.objectiveId,
      problemFamilyId: card.problemFamilyId,
      stability: 0,
      difficulty: 0,
      state: "new",
      dueDate: nowIso,
      elapsedDays: 0,
      scheduledDays: 0,
      reps: 0,
      lapses: 0,
      createdAt: card.createdAt,
      updatedAt: now,
    });

    await ctx.db.insert("srs_review_log", {
      cardId: card._id,
      studentId: args.studentId,
      rating: "Again",
      evidence: { action: "teacher_reset", objectiveId: args.objectiveId },
      stateBefore: {
        stability: card.stability,
        difficulty: card.difficulty,
        state: card.state,
        reps: card.reps,
        lapses: card.lapses,
      },
      stateAfter: {
        stability: 0,
        difficulty: 0,
        state: "new",
        reps: 0,
        lapses: 0,
      },
      reviewedAt: now,
    });
  }

  return { success: true, resetCount: cards.length };
}

/**
 * Resets all SRS cards for a student on a specific objective.
 * @param {MutationCtx} ctx - The mutation context
 * @param {ResetStudentCardsArgs} args - The reset arguments including user, class, student, and objective
 * @returns {Promise<ResetStudentCardsResult>} Success with reset count, or error
 */
export const resetStudentCards = internalMutation({
  args: {
    userId: v.id("profiles"),
    classId: v.id("classes"),
    studentId: v.id("profiles"),
    objectiveId: v.string(),
  },
  handler: resetStudentCardsHandler,
});

export type AddExtraCardsArgs = {
  userId: Id<"profiles">;
  classId: Id<"classes">;
  studentId: Id<"profiles">;
  objectiveId: string;
};

/**
 * Adds an extra SRS card for a student on a specific objective.
 * @param {MutationCtx} ctx - The mutation context
 * @param {AddExtraCardsArgs} args - The arguments including user, class, student, and objective
 * @returns {Promise<{ success: boolean; cardId?: Id<"srs_cards">; error?: string }>} Success with card ID, or error
 */
export async function addExtraCardsHandler(
  ctx: MutationCtx,
  args: AddExtraCardsArgs
): Promise<{ success: boolean; cardId?: Id<"srs_cards">; error?: string }> {
  const ownsClass = await validateTeacherOwnsClass(ctx, args.userId, args.classId);
  if (!ownsClass) {
    return { success: false, error: "Unauthorized" };
  }

  const studentInClass = await validateStudentInClass(ctx, args.classId, args.studentId);
  if (!studentInClass) {
    return { success: false, error: "Student not in class" };
  }

  const existingCard = await ctx.db
    .query("srs_cards")
    .withIndex("by_student_and_objective", (q) =>
      q.eq("studentId", args.studentId).eq("objectiveId", args.objectiveId)
    )
    .first();

  if (existingCard) {
    return { success: false, error: "Card already exists" };
  }

  const problemFamily = await ctx.db
    .query("problem_families")
      .withIndex("by_objectiveId", (q) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Convex multi-entry array index expects element, not array
        (q as any).eq("objectiveIds", args.objectiveId)
      )
    .first();

  if (!problemFamily) {
    return { success: false, error: "No problem family found for objective" };
  }

  const now = Date.now();
  const nowIso = new Date(now).toISOString();

  const cardId = await ctx.db.insert("srs_cards", {
    studentId: args.studentId,
    objectiveId: args.objectiveId,
    problemFamilyId: problemFamily.problemFamilyId,
    stability: 0,
    difficulty: 0,
    state: "new",
    dueDate: nowIso,
    elapsedDays: 0,
    scheduledDays: 0,
    reps: 0,
    lapses: 0,
    createdAt: now,
    updatedAt: now,
  });

  return { success: true, cardId };
}

/**
 * Adds an extra SRS card for a student on a specific objective.
 * @param {MutationCtx} ctx - The mutation context
 * @param {AddExtraCardsArgs} args - The arguments including user, class, student, and objective
 * @returns {Promise<{ success: boolean; cardId?: Id<"srs_cards">; error?: string }>} Success with card ID, or error
 */
export const addExtraCards = internalMutation({
  args: {
    userId: v.id("profiles"),
    classId: v.id("classes"),
    studentId: v.id("profiles"),
    objectiveId: v.string(),
  },
  handler: addExtraCardsHandler,
});
