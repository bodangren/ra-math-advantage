import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

type SavePracticeTestResultArgs = {
  userId: Id<"profiles">;
  moduleNumber: number;
  lessonsTested: string[];
  questionCount: number;
  score: number;
  perLessonBreakdown: Array<{
    lessonId: string;
    lessonTitle: string;
    correct: number;
    total: number;
  }>;
};

type GetPracticeTestResultsArgs = {
  userId: Id<"profiles">;
  moduleNumber?: number;
};

type RecordStudySessionArgs = {
  userId: Id<"profiles">;
  activityType: "flashcards" | "matching" | "speed_round" | "srs_review" | "practice_test";
  curriculumScope?: {
    type: "all_units" | "module";
    moduleNumber?: number;
  };
  results: {
    itemsSeen: number;
    itemsCorrect: number;
    itemsIncorrect: number;
    durationSeconds: number;
  };
  startedAt?: number;
  endedAt?: number;
};

type GetRecentStudySessionsArgs = {
  userId: Id<"profiles">;
  limit?: number;
};

export async function getPracticeTestResultsHandler(
  ctx: QueryCtx,
  args: GetPracticeTestResultsArgs
) {
  let resultsQuery = ctx.db
    .query("practice_test_results")
    .withIndex("by_user", (q) => q.eq("userId", args.userId));

  if (args.moduleNumber !== undefined) {
    const moduleNum = args.moduleNumber;
    resultsQuery = ctx.db
      .query("practice_test_results")
      .withIndex("by_user_and_module", (q) =>
        q.eq("userId", args.userId).eq("moduleNumber", moduleNum)
      );
  }

  const results = await resultsQuery.order("desc").collect();
  return results;
}

export async function getRecentStudySessionsHandler(
  ctx: QueryCtx,
  args: GetRecentStudySessionsArgs
) {
  const sessions = await ctx.db
    .query("study_sessions")
    .withIndex("by_user_and_started", (q) => q.eq("userId", args.userId))
    .order("desc")
    .take(args.limit ?? 10);

  return sessions;
}

export async function savePracticeTestResultHandler(
  ctx: MutationCtx,
  args: SavePracticeTestResultArgs
) {
  const now = Date.now();

  if (args.score < 0 || args.score > args.questionCount) {
    throw new Error("Invalid score: must be between 0 and questionCount");
  }
  if (args.questionCount <= 0) {
    throw new Error("Invalid question count: must be positive");
  }
  if (args.moduleNumber < 1 || args.moduleNumber > 9) {
    throw new Error("Invalid module number: must be between 1 and 9");
  }

  const resultId = await ctx.db.insert("practice_test_results", {
    userId: args.userId,
    moduleNumber: args.moduleNumber,
    lessonsTested: args.lessonsTested,
    questionCount: args.questionCount,
    score: args.score,
    perLessonBreakdown: args.perLessonBreakdown,
    completedAt: now,
    createdAt: now,
  });

  return { resultId };
}

export async function recordStudySessionHandler(
  ctx: MutationCtx,
  args: RecordStudySessionArgs
) {
  const now = Date.now();

  const sessionId = await ctx.db.insert("study_sessions", {
    userId: args.userId,
    activityType: args.activityType,
    curriculumScope: args.curriculumScope ?? { type: "all_units" },
    results: args.results,
    startedAt: args.startedAt ?? now,
    endedAt: args.endedAt ?? now,
    createdAt: now,
  });

  return { sessionId };
}

export async function getStudySessionByIdHandler(
  ctx: QueryCtx,
  args: { sessionId: Id<"study_sessions"> }
) {
  const session = await ctx.db.get(args.sessionId);
  return session;
}

export async function getPracticeTestResultByIdHandler(
  ctx: QueryCtx,
  args: { resultId: Id<"practice_test_results"> }
) {
  const result = await ctx.db.get(args.resultId);
  return result;
}

export async function getPracticeTestResultsForTeacherHandler(
  ctx: QueryCtx,
  args: { studentId: Id<"profiles">; moduleNumber?: number }
) {
  let resultsQuery = ctx.db
    .query("practice_test_results")
    .withIndex("by_user", (q) => q.eq("userId", args.studentId));

  if (args.moduleNumber !== undefined) {
    const moduleNum = args.moduleNumber;
    resultsQuery = ctx.db
      .query("practice_test_results")
      .withIndex("by_user_and_module", (q) =>
        q.eq("userId", args.studentId).eq("moduleNumber", moduleNum)
      );
  }

  const results = await resultsQuery.order("desc").collect();
  return results;
}

export async function getStudySessionsForTeacherHandler(
  ctx: QueryCtx,
  args: {
    studentId: Id<"profiles">;
    activityType?: "flashcards" | "matching" | "speed_round" | "srs_review" | "practice_test";
  }
) {
  if (args.activityType !== undefined) {
    const activityType = args.activityType;
    const sessions = await ctx.db
      .query("study_sessions")
      .withIndex("by_user_and_activity", (q) =>
        q.eq("userId", args.studentId).eq("activityType", activityType)
      )
      .order("desc")
      .collect();
    return sessions;
  }

  const sessions = await ctx.db
    .query("study_sessions")
    .withIndex("by_user", (q) => q.eq("userId", args.studentId))
    .order("desc")
    .collect();
  return sessions;
}

export const getPracticeTestResults = internalQuery({
  args: {
    userId: v.id("profiles"),
    moduleNumber: v.optional(v.number()),
  },
  handler: getPracticeTestResultsHandler,
});

export const getRecentStudySessions = internalQuery({
  args: {
    userId: v.id("profiles"),
    limit: v.optional(v.number()),
  },
  handler: getRecentStudySessionsHandler,
});

export const savePracticeTestResult = internalMutation({
  args: {
    userId: v.id("profiles"),
    moduleNumber: v.number(),
    lessonsTested: v.array(v.string()),
    questionCount: v.number(),
    score: v.number(),
    perLessonBreakdown: v.array(
      v.object({
        lessonId: v.string(),
        lessonTitle: v.string(),
        correct: v.number(),
        total: v.number(),
      })
    ),
  },
  handler: savePracticeTestResultHandler,
});

export const recordStudySession = internalMutation({
  args: {
    userId: v.id("profiles"),
    activityType: v.union(
      v.literal("flashcards"),
      v.literal("matching"),
      v.literal("speed_round"),
      v.literal("srs_review"),
      v.literal("practice_test")
    ),
    curriculumScope: v.optional(v.object({
      type: v.union(v.literal("all_units"), v.literal("module")),
      moduleNumber: v.optional(v.number()),
    })),
    results: v.object({
      itemsSeen: v.number(),
      itemsCorrect: v.number(),
      itemsIncorrect: v.number(),
      durationSeconds: v.number(),
    }),
    startedAt: v.optional(v.number()),
    endedAt: v.optional(v.number()),
  },
  handler: recordStudySessionHandler,
});

export const getStudySessionById = internalQuery({
  args: {
    sessionId: v.id("study_sessions"),
  },
  handler: getStudySessionByIdHandler,
});

export const getPracticeTestResultById = internalQuery({
  args: {
    resultId: v.id("practice_test_results"),
  },
  handler: getPracticeTestResultByIdHandler,
});

export const getPracticeTestResultsForTeacher = internalQuery({
  args: {
    studentId: v.id("profiles"),
    moduleNumber: v.optional(v.number()),
  },
  handler: getPracticeTestResultsForTeacherHandler,
});

export const getStudySessionsForTeacher = internalQuery({
  args: {
    studentId: v.id("profiles"),
    activityType: v.optional(v.union(
      v.literal("flashcards"),
      v.literal("matching"),
      v.literal("speed_round"),
      v.literal("srs_review"),
      v.literal("practice_test")
    )),
  },
  handler: getStudySessionsForTeacherHandler,
});