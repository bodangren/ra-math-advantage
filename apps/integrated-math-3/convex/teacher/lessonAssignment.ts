import { internalMutation, internalQuery, type MutationCtx, type QueryCtx } from "../_generated/server";
import { v } from "convex/values";
import { Id, type Doc } from "../_generated/dataModel";

/**
 * Retrieves an authorized teacher profile for a user.
 * @param {QueryCtx | MutationCtx} ctx - The query or mutation context
 * @param {Id<"profiles">} userId - The profile ID to check
 * @returns {Promise<Doc<"profiles"> | null>} The teacher/admin profile, or null if not authorized
 */
async function getAuthorizedTeacher(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"profiles">,
): Promise<Doc<"profiles"> | null> {
  const teacher = await ctx.db.get("profiles", userId);
  if (!teacher || (teacher.role !== "teacher" && teacher.role !== "admin")) {
    return null;
  }
  return teacher;
}

/**
 * Validates that a teacher owns a specific class.
 * @param {QueryCtx | MutationCtx} ctx - The query or mutation context
 * @param {Id<"profiles">} userId - The teacher profile ID
 * @param {Id<"classes">} classId - The class to validate ownership of
 * @returns {Promise<boolean>} True if the teacher owns the class, false otherwise
 */
async function validateTeacherOwnsClass(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"profiles">,
  classId: Id<"classes">,
): Promise<boolean> {
  const teacher = await getAuthorizedTeacher(ctx, userId);
  if (!teacher) return false;

  const classDoc = await ctx.db.get("classes", classId);
  if (!classDoc) return false;

  return classDoc.teacherId === teacher._id;
}

export interface ClassWithLessons {
  classId: string;
  className: string;
  assignedLessonIds: string[];
}

/**
 * Retrieves classes owned by a teacher with their assigned lesson IDs.
 * @param {QueryCtx} ctx - The query context
 * @param {{ userId: Id<"profiles"> }} args - The teacher user ID
 * @returns {Promise<ClassWithLessons[]>} Array of classes with their assigned lesson IDs
 */
export async function getTeacherClassesWithLessonsHandler(
  ctx: QueryCtx,
  args: { userId: Id<"profiles"> },
): Promise<ClassWithLessons[]> {
  const teacher = await getAuthorizedTeacher(ctx, args.userId);
  if (!teacher) {
    return [];
  }

  const classes = await ctx.db
    .query("classes")
    .withIndex("by_teacher", (q) => q.eq("teacherId", teacher._id))
    .collect();

  const activeClasses = classes.filter((c) => !c.archived);

  const result: ClassWithLessons[] = [];

  for (const cls of activeClasses) {
    const classLessons = await ctx.db
      .query("class_lessons")
      .withIndex("by_class_and_lesson", (q) => q.eq("classId", cls._id))
      .collect();

    result.push({
      classId: cls._id,
      className: cls.name,
      assignedLessonIds: classLessons.map((cl) => cl.lessonId),
    });
  }

  return result;
}

export const getTeacherClassesWithLessons = internalQuery({
  args: { userId: v.id("profiles") },
  handler: getTeacherClassesWithLessonsHandler,
});

export interface LessonInfo {
  lessonId: string;
  title: string;
  slug: string;
  unitNumber: number;
  orderIndex: number;
}

/**
 * Retrieves all available lessons for assignment.
 * @param {QueryCtx} ctx - The query context
 * @returns {Promise<LessonInfo[]>} Array of lesson metadata
 */
export async function getAvailableLessonsHandler(
  ctx: QueryCtx,
): Promise<LessonInfo[]> {
  const lessons = await ctx.db
    .query("lessons")
    .withIndex("by_unit_and_order")
    .collect();

  const result: LessonInfo[] = lessons.map((lesson) => ({
    lessonId: lesson._id,
    title: lesson.title,
    slug: lesson.slug,
    unitNumber: lesson.unitNumber,
    orderIndex: lesson.orderIndex,
  }));

  return result;
}

export const getAvailableLessons = internalQuery({
  args: {},
  handler: getAvailableLessonsHandler,
});

export interface AssignLessonResult {
  success: boolean;
  alreadyExists?: boolean;
}

/**
 * Assigns a lesson to a class owned by the teacher.
 * @param {MutationCtx} ctx - The mutation context
 * @param {{ userId: Id<"profiles">; classId: Id<"classes">; lessonId: Id<"lessons"> }} args - The teacher user ID, class ID, and lesson ID
 * @returns {Promise<AssignLessonResult>} Result indicating success and whether the assignment already existed
 * @throws Error if the teacher does not own the class
 */
export async function assignLessonToClassHandler(
  ctx: MutationCtx,
  args: {
    userId: Id<"profiles">;
    classId: Id<"classes">;
    lessonId: Id<"lessons">;
  },
): Promise<AssignLessonResult> {
  const ownsClass = await validateTeacherOwnsClass(ctx, args.userId, args.classId);
  if (!ownsClass) {
    throw new Error("Unauthorized: teacher does not own this class");
  }

  const existing = await ctx.db
    .query("class_lessons")
    .withIndex("by_class_and_lesson", (q) =>
      q.eq("classId", args.classId).eq("lessonId", args.lessonId)
    )
    .first();

  if (existing) {
    return { success: true, alreadyExists: true };
  }

  const now = Date.now();
  await ctx.db.insert("class_lessons", {
    classId: args.classId,
    lessonId: args.lessonId,
    assignedAt: now,
    createdAt: now,
  });

  return { success: true, alreadyExists: false };
}

export const assignLessonToClass = internalMutation({
  args: {
    userId: v.id("profiles"),
    classId: v.id("classes"),
    lessonId: v.id("lessons"),
  },
  handler: assignLessonToClassHandler,
});

export interface UnassignLessonResult {
  success: boolean;
  wasDeleted?: boolean;
}

/**
 * Unassigns a lesson from a class owned by the teacher.
 * @param {MutationCtx} ctx - The mutation context
 * @param {{ userId: Id<"profiles">; classId: Id<"classes">; lessonId: Id<"lessons"> }} args - The teacher user ID, class ID, and lesson ID
 * @returns {Promise<UnassignLessonResult>} Result indicating success and whether the assignment was deleted
 * @throws Error if the teacher does not own the class
 */
export async function unassignLessonFromClassHandler(
  ctx: MutationCtx,
  args: {
    userId: Id<"profiles">;
    classId: Id<"classes">;
    lessonId: Id<"lessons">;
  },
): Promise<UnassignLessonResult> {
  const ownsClass = await validateTeacherOwnsClass(ctx, args.userId, args.classId);
  if (!ownsClass) {
    throw new Error("Unauthorized: teacher does not own this class");
  }

  const entry = await ctx.db
    .query("class_lessons")
    .withIndex("by_class_and_lesson", (q) =>
      q.eq("classId", args.classId).eq("lessonId", args.lessonId)
    )
    .first();

  if (!entry) {
    return { success: true, wasDeleted: false };
  }

  await ctx.db.delete(entry._id);
  return { success: true, wasDeleted: true };
}

export const unassignLessonFromClass = internalMutation({
  args: {
    userId: v.id("profiles"),
    classId: v.id("classes"),
    lessonId: v.id("lessons"),
  },
  handler: unassignLessonFromClassHandler,
});
