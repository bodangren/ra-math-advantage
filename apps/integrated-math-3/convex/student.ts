import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { coerceNullableString } from "./dashboardHelpers";
import {
  buildLessonPhaseProgress,
  buildPublishedUnitProgressRows,
  resolveLatestPublishedLessonVersion,
} from "../lib/progress/published-curriculum";

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
      phaseIds.map(phaseId =>
        ctx.db
          .query("phase_sections")
          .withIndex("by_phase_version", (q) => q.eq("phaseVersionId", phaseId))
          .collect()
      )
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
    if (!lesson) throw new Error("Lesson not found");

    // 2. Get latest published version
    const versions = await ctx.db
      .query("lesson_versions")
      .withIndex("by_lesson", (q) => q.eq("lessonId", lesson._id))
      .collect();
    const latestVersion = resolveLatestPublishedLessonVersion(versions);
    if (!latestVersion) throw new Error("Published lesson version not found");

    // 3. Find specific phase
    const phase = await ctx.db
      .query("phase_versions")
      .withIndex("by_lesson_version_and_phase", (q) => 
        q.eq("lessonVersionId", latestVersion._id).eq("phaseNumber", args.phaseNumber)
      )
      .unique();
    if (!phase) throw new Error("Phase not found");

    // 4. Check idempotency
    const existing = await ctx.db
      .query("student_progress")
      .withIndex("by_user_and_phase", (q) => 
        q.eq("userId", args.userId).eq("phaseId", phase._id)
      )
      .unique();

    if (existing?.status === "completed") {
      return { success: true, alreadyCompleted: true };
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
    if (args.linkedStandardId) {
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
    if (!lesson) throw new Error("Lesson not found");

    // 2. Get latest published version
    const versions = await ctx.db
      .query("lesson_versions")
      .withIndex("by_lesson", (q) => q.eq("lessonId", lesson._id))
      .collect();
    const latestVersion = resolveLatestPublishedLessonVersion(versions);
    if (!latestVersion) throw new Error("Published lesson version not found");

    // 3. Find specific phase
    const phase = await ctx.db
      .query("phase_versions")
      .withIndex("by_lesson_version_and_phase", (q) => 
        q.eq("lessonVersionId", latestVersion._id).eq("phaseNumber", args.phaseNumber)
      )
      .unique();
    if (!phase) throw new Error("Phase not found");

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

    let anyClassLessonExists = false;
    for (const enrollment of activeEnrollments) {
      const classLesson = await ctx.db
        .query("class_lessons")
        .withIndex("by_class_and_lesson", (q) =>
          q.eq("classId", enrollment.classId).eq("lessonId", args.lessonId)
        )
        .first();

      if (classLesson) {
        return true;
      }

      const totalForClass = await ctx.db
        .query("class_lessons")
        .withIndex("by_class_and_lesson", (q) =>
          q.eq("classId", enrollment.classId)
        )
        .first();
      if (totalForClass) {
        anyClassLessonExists = true;
      }
    }

    if (!anyClassLessonExists) {
      return false;
    }

    return false;
  },
});
