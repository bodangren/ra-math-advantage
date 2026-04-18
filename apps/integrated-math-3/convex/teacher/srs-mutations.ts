import { internalMutation, type MutationCtx } from "../_generated/server";
import { v } from "convex/values";
import { Id, type Doc } from "../_generated/dataModel";
import type { ObjectivePriority } from "../../lib/practice/objective-proficiency";

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
      rating: "manual_reset",
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
      q.eq("objectiveIds", args.objectiveId as unknown as string[])
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

export const addExtraCards = internalMutation({
  args: {
    userId: v.id("profiles"),
    classId: v.id("classes"),
    studentId: v.id("profiles"),
    objectiveId: v.string(),
  },
  handler: addExtraCardsHandler,
});
