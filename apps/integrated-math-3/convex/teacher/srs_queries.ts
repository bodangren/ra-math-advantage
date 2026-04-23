import { internalQuery, type QueryCtx } from "../_generated/server";
import { v } from "convex/values";
import { Id, type Doc } from "../_generated/dataModel";
import { getTeacherClassProficiencyHandler } from "../objectiveProficiency";
import type {
  ObjectivePriority,
  TeacherProficiencyView,
} from "@math-platform/srs-engine";

async function getAuthorizedTeacher(
  ctx: QueryCtx,
  userId: Id<"profiles">,
): Promise<Doc<"profiles"> | null> {
  const teacher = await ctx.db.get(userId);
  if (!teacher || (teacher.role !== "teacher" && teacher.role !== "admin")) {
    return null;
  }
  return teacher;
}

export const getClassSrsHealth = internalQuery({
  args: {
    userId: v.id("profiles"),
    classId: v.id("classes"),
  },
  handler: async (ctx, args) => {
    const teacher = await getAuthorizedTeacher(ctx, args.userId);
    if (!teacher) {
      return null;
    }

    const classDoc = await ctx.db.get(args.classId);
    if (!classDoc) {
      return null;
    }

    if (classDoc.teacherId !== teacher._id) {
      return null;
    }

    const enrollments = await ctx.db
      .query("class_enrollments")
      .withIndex("by_class", (q) => q.eq("classId", args.classId))
      .collect();

    const activeStudents = enrollments.filter((e) => e.status === "active");

    const now = Date.now();
    const todayStart = new Date(now);
    todayStart.setUTCHours(0, 0, 0, 0);
    const todayStartMs = todayStart.getTime();

    let totalActiveStudents = 0;
    let practicedToday = 0;
    let totalRetention = 0;
    let cardCount = 0;

    const studentIds = activeStudents.map((e) => e.studentId);
    const [cardArrays, sessionArrays] = await Promise.all([
      Promise.all(
        studentIds.map((studentId) =>
          ctx.db
            .query("srs_cards")
            .withIndex("by_student", (q) => q.eq("studentId", studentId))
            .collect()
        )
      ),
      Promise.all(
        studentIds.map((studentId) =>
          ctx.db
            .query("srs_sessions")
            .withIndex("by_student", (q) => q.eq("studentId", studentId))
            .collect()
        )
      ),
    ]);

    for (let i = 0; i < studentIds.length; i++) {
      const cards = cardArrays[i];
      if (cards.length > 0) {
        totalActiveStudents++;
        for (const card of cards) {
          totalRetention += card.stability;
          cardCount++;
        }
      }

      const completedToday = sessionArrays[i].some(
        (s) => s.completedAt && s.completedAt >= todayStartMs
      );
      if (completedToday) {
        practicedToday++;
      }
    }

    const avgRetention = cardCount > 0 ? totalRetention / cardCount : 0;

    return {
      totalActiveStudents,
      practicedToday,
      avgRetention,
      totalCards: cardCount,
    };
  },
});

export const getOverdueLoad = internalQuery({
  args: {
    userId: v.id("profiles"),
    classId: v.id("classes"),
  },
  handler: async (ctx, args) => {
    const teacher = await getAuthorizedTeacher(ctx, args.userId);
    if (!teacher) {
      return null;
    }

    const classDoc = await ctx.db.get(args.classId);
    if (!classDoc) {
      return null;
    }

    if (classDoc.teacherId !== teacher._id) {
      return null;
    }

    const enrollments = await ctx.db
      .query("class_enrollments")
      .withIndex("by_class", (q) => q.eq("classId", args.classId))
      .collect();

    const activeStudents = enrollments.filter((e) => e.status === "active");

    const now = new Date().toISOString();

    const perStudent: Array<{ studentId: string; overdueCount: number }> = [];
    let totalOverdue = 0;

    const cardArrays = await Promise.all(
      activeStudents.map((enrollment) =>
        ctx.db
          .query("srs_cards")
          .withIndex("by_student", (q) => q.eq("studentId", enrollment.studentId))
          .collect()
      )
    );

    for (let i = 0; i < activeStudents.length; i++) {
      const overdueCards = cardArrays[i].filter((c) => c.dueDate < now);
      const overdueCount = overdueCards.length;
      totalOverdue += overdueCount;
      perStudent.push({ studentId: activeStudents[i].studentId, overdueCount });
    }

    return {
      totalOverdue,
      perStudent,
    };
  },
});

export const getPracticeStreaks = internalQuery({
  args: {
    userId: v.id("profiles"),
    classId: v.id("classes"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const teacher = await getAuthorizedTeacher(ctx, args.userId);
    if (!teacher) {
      return [];
    }

    const classDoc = await ctx.db.get(args.classId);
    if (!classDoc) {
      return [];
    }

    if (classDoc.teacherId !== teacher._id) {
      return [];
    }

    const limit = args.limit ?? 5;

    const enrollments = await ctx.db
      .query("class_enrollments")
      .withIndex("by_class", (q) => q.eq("classId", args.classId))
      .collect();

    const activeStudents = enrollments.filter((e) => e.status === "active");

    const now = Date.now();
    const todayStart = new Date(now);
    todayStart.setUTCHours(0, 0, 0, 0);
    const todayMs = todayStart.getTime();
    const yesterdayMs = todayMs - 24 * 60 * 60 * 1000;

    const studentStreaks: Array<{
      studentId: string;
      displayName: string;
      streak: number;
    }> = [];

    const [profiles, sessionArrays] = await Promise.all([
      Promise.all(
        activeStudents.map((enrollment) => ctx.db.get("profiles", enrollment.studentId))
      ),
      Promise.all(
        activeStudents.map((enrollment) =>
          ctx.db
            .query("srs_sessions")
            .withIndex("by_student", (q) => q.eq("studentId", enrollment.studentId))
            .collect()
        )
      ),
    ]);

    for (let i = 0; i < activeStudents.length; i++) {
      const profile = profiles[i];
      if (!profile) continue;

      const completedSessions = sessionArrays[i].filter((s) => s.completedAt !== undefined);

      if (completedSessions.length === 0) continue;

      const uniqueDays = Array.from(
        new Set(
          completedSessions.map((s) => {
            const d = new Date(s.completedAt!);
            return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
          })
        )
      ).sort((a, b) => b - a);

      const mostRecent = uniqueDays[0];
      let streak = 0;

      if (mostRecent === todayMs || mostRecent === yesterdayMs) {
        streak = 1;
        let checkDay = mostRecent;
        for (let i = 1; i < uniqueDays.length; i++) {
          const expected = checkDay - 24 * 60 * 60 * 1000;
          if (uniqueDays[i] === expected) {
            streak++;
            checkDay = uniqueDays[i];
          } else if (uniqueDays[i] < expected) {
            break;
          }
        }
      }

      if (streak > 0) {
        studentStreaks.push({
          studentId: activeStudents[i].studentId,
          displayName: profile.displayName ?? profile.username,
          streak,
        });
      }
    }

    studentStreaks.sort((a, b) => b.streak - a.streak);
    return studentStreaks.slice(0, limit);
  },
});

export type WeakObjectiveView = {
  objectiveId: string;
  standardCode: string;
  standardDescription: string;
  proficientPercent: number;
  avgRetention: number;
  strugglingStudentCount: number;
  priority: ObjectivePriority;
};

const PRIORITY_ORDER: Record<ObjectivePriority, number> = {
  essential: 0,
  supporting: 1,
  extension: 2,
  triaged: 3,
};

export async function getWeakObjectivesHandler(
  ctx: QueryCtx,
  args: { classId: string },
  proficiencyProvider: (
    ctx: QueryCtx,
    args: { classId: string }
  ) => Promise<TeacherProficiencyView[]> = getTeacherClassProficiencyHandler
): Promise<WeakObjectiveView[]> {
  const classDocId = args.classId as Id<"classes">;

  const enrollments = await ctx.db
    .query("class_enrollments")
    .withIndex("by_class", (q) => q.eq("classId", classDocId))
    .collect();

  const activeStudents = enrollments.filter((e) => e.status === "active");
  const totalStudents = activeStudents.length;

  if (totalStudents === 0) {
    return [];
  }

  const proficiencyData = await proficiencyProvider(ctx, args);

  const weakObjectives: WeakObjectiveView[] = [];

  for (const obj of proficiencyData) {
    const proficientPercent =
      totalStudents > 0 ? (obj.classProficientCount / totalStudents) * 100 : 0;

    if (proficientPercent < 50) {
      weakObjectives.push({
        objectiveId: obj.objectiveId,
        standardCode: obj.standardCode,
        standardDescription: obj.standardDescription,
        proficientPercent,
        avgRetention: obj.classAvgRetention,
        strugglingStudentCount: obj.classStrugglingStudents.length,
        priority: obj.priority,
      });
    }
  }

  weakObjectives.sort((a, b) => {
    const priorityDiff = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return a.proficientPercent - b.proficientPercent;
  });

  return weakObjectives;
}

export const getWeakObjectives = internalQuery({
  args: {
    userId: v.id("profiles"),
    classId: v.id("classes"),
  },
  handler: async (ctx, args) => {
    const teacher = await getAuthorizedTeacher(ctx, args.userId);
    if (!teacher) {
      return null;
    }

    const classDoc = await ctx.db.get(args.classId);
    if (!classDoc) {
      return null;
    }

    if (classDoc.teacherId !== teacher._id) {
      return null;
    }

    return getWeakObjectivesHandler(ctx, { classId: args.classId });
  },
});

export type StrugglingStudentView = {
  studentId: string;
  displayName: string;
  overdueCount: number;
  avgRetention: number;
  weakestObjective: string;
};

export async function getStrugglingStudentsHandler(
  ctx: QueryCtx,
  args: { classId: string; limit?: number }
): Promise<StrugglingStudentView[]> {
  const classDocId = args.classId as Id<"classes">;

  const enrollments = await ctx.db
    .query("class_enrollments")
    .withIndex("by_class", (q) => q.eq("classId", classDocId))
    .collect();

  const activeStudents = enrollments.filter((e) => e.status === "active");
  const limit = args.limit ?? 10;
  const now = new Date().toISOString();

  const results: StrugglingStudentView[] = [];

  const [cardArrays, profiles] = await Promise.all([
    Promise.all(
      activeStudents.map((enrollment) =>
        ctx.db
          .query("srs_cards")
          .withIndex("by_student", (q) => q.eq("studentId", enrollment.studentId))
          .collect()
      )
    ),
    Promise.all(
      activeStudents.map((enrollment) => ctx.db.get("profiles", enrollment.studentId))
    ),
  ]);

  for (let i = 0; i < activeStudents.length; i++) {
    const cards = cardArrays[i];

    if (cards.length === 0) {
      continue;
    }

    const overdueCount = cards.filter((c) => c.dueDate < now).length;
    const avgRetention =
      cards.reduce((sum, c) => sum + c.stability, 0) / cards.length;

    const objectiveStats = new Map<
      string,
      { totalStability: number; count: number; overdue: number }
    >();

    for (const card of cards) {
      const stats = objectiveStats.get(card.objectiveId) ?? {
        totalStability: 0,
        count: 0,
        overdue: 0,
      };
      stats.totalStability += card.stability;
      stats.count++;
      if (card.dueDate < now) {
        stats.overdue++;
      }
      objectiveStats.set(card.objectiveId, stats);
    }

    let weakestObjective = "";
    let weakestAvgStability = Infinity;
    let weakestOverdue = -1;

    for (const [objectiveId, stats] of objectiveStats) {
      const avgStability = stats.totalStability / stats.count;
      if (
        avgStability < weakestAvgStability ||
        (avgStability === weakestAvgStability && stats.overdue > weakestOverdue)
      ) {
        weakestAvgStability = avgStability;
        weakestObjective = objectiveId;
        weakestOverdue = stats.overdue;
      }
    }

    const profile = profiles[i];

    results.push({
      studentId: activeStudents[i].studentId,
      displayName: profile?.displayName ?? profile?.username ?? "Unknown",
      overdueCount,
      avgRetention,
      weakestObjective,
    });
  }

  results.sort((a, b) => {
    if (b.overdueCount !== a.overdueCount) {
      return b.overdueCount - a.overdueCount;
    }
    return a.avgRetention - b.avgRetention;
  });

  return results.slice(0, limit);
}

export const getStrugglingStudents = internalQuery({
  args: {
    userId: v.id("profiles"),
    classId: v.id("classes"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const teacher = await getAuthorizedTeacher(ctx, args.userId);
    if (!teacher) {
      return null;
    }

    const classDoc = await ctx.db.get(args.classId);
    if (!classDoc) {
      return null;
    }

    if (classDoc.teacherId !== teacher._id) {
      return null;
    }

    return getStrugglingStudentsHandler(ctx, {
      classId: args.classId,
      limit: args.limit,
    });
  },
});

export type MisconceptionView = {
  tag: string;
  count: number;
  affectedObjectives: string[];
};

export async function getMisconceptionSummaryHandler(
  ctx: QueryCtx,
  args: { classId: string; sinceDays?: number }
): Promise<MisconceptionView[]> {
  const classDocId = args.classId as Id<"classes">;

  const enrollments = await ctx.db
    .query("class_enrollments")
    .withIndex("by_class", (q) => q.eq("classId", classDocId))
    .collect();

  const activeStudents = enrollments.filter((e) => e.status === "active");

  if (activeStudents.length === 0) {
    return [];
  }

  const sinceDays = args.sinceDays ?? 7;
  const sinceMs = Date.now() - sinceDays * 24 * 60 * 60 * 1000;

  const tagMap = new Map<string, { count: number; objectives: Set<string> }>();

  const reviewArrays = await Promise.all(
    activeStudents.map((enrollment) =>
      ctx.db
        .query("srs_review_log")
        .withIndex("by_student", (q) => q.eq("studentId", enrollment.studentId))
        .filter((q) => q.gte(q.field("reviewedAt"), sinceMs))
        .collect()
    )
  );

  const allRecentReviews = reviewArrays.flat();

  const cardIds = [...new Set(allRecentReviews.map((r) => r.cardId))];
  const cards = await Promise.all(
    cardIds.map((cardId) => ctx.db.get("srs_cards", cardId))
  );
  const cardMap = new Map(
    cards.filter((c): c is NonNullable<typeof c> => c !== null).map((c) => [c._id, c])
  );

  for (const review of allRecentReviews) {
    const evidence = review.evidence as { misconceptionTags?: string[] };
    const misconceptionTags = evidence?.misconceptionTags;

    if (!misconceptionTags || !Array.isArray(misconceptionTags)) {
      continue;
    }

    const card = cardMap.get(review.cardId);
    const objectiveId = card?.objectiveId ?? "unknown";

    for (const tag of misconceptionTags) {
      const existing = tagMap.get(tag);
      if (existing) {
        existing.count++;
        existing.objectives.add(objectiveId);
      } else {
        tagMap.set(tag, { count: 1, objectives: new Set([objectiveId]) });
      }
    }
  }

  const results: MisconceptionView[] = Array.from(tagMap.entries())
    .map(([tag, data]) => ({
      tag,
      count: data.count,
      affectedObjectives: Array.from(data.objectives),
    }))
    .sort((a, b) => b.count - a.count);

  return results;
}

export const getMisconceptionSummary = internalQuery({
  args: {
    userId: v.id("profiles"),
    classId: v.id("classes"),
    sinceDays: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const teacher = await getAuthorizedTeacher(ctx, args.userId);
    if (!teacher) {
      return null;
    }

    const classDoc = await ctx.db.get(args.classId);
    if (!classDoc) {
      return null;
    }

    if (classDoc.teacherId !== teacher._id) {
      return null;
    }

    return getMisconceptionSummaryHandler(ctx, {
      classId: args.classId,
      sinceDays: args.sinceDays,
    });
  },
});