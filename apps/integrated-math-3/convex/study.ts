import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { proficiencyBand, updateMastery } from "../lib/study/srs";
import { getGlossaryTermBySlug } from "../lib/study/glossary";

const fsrsStateValidator = v.object({
  due: v.union(v.string(), v.number()),
  stability: v.number(),
  difficulty: v.number(),
  elapsed_days: v.number(),
  scheduled_days: v.number(),
  reps: v.number(),
  lapses: v.number(),
  learning_steps: v.optional(v.number()),
  state: v.number(),
  last_review: v.optional(v.union(v.string(), v.number(), v.null())),
});

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

type ProcessReviewArgs = {
  userId: Id<"profiles">;
  termSlug: string;
  rating: "again" | "hard" | "good" | "easy";
  masteryDelta: number;
  fsrsState: {
    due: string | number;
    stability: number;
    difficulty: number;
    elapsed_days: number;
    scheduled_days: number;
    reps: number;
    lapses: number;
    learning_steps?: number;
    state: number;
    last_review?: string | number | null;
  };
  scheduledFor: number;
  now?: number;
};

type GetDueTermsArgs = {
  userId: Id<"profiles">;
  now?: number;
};

type GetTermMasteryByUnitArgs = {
  userId: Id<"profiles">;
  moduleNumber: number;
};

/**
 * Processes a spaced-repetition review for a glossary term.
 * @param {MutationCtx} ctx - The mutation context
 * @param {ProcessReviewArgs} args - The review data including term, rating, and FSRS state
 * @returns {{ success: boolean }} Object with success status
 */
export async function processReviewHandler(
  ctx: MutationCtx,
  args: ProcessReviewArgs
) {
  const now = args.now ?? Date.now();
  const isCorrect = args.rating !== "again";

  const existingMastery = await ctx.db
    .query("term_mastery")
    .withIndex("by_user_and_term", (q) =>
      q.eq("userId", args.userId).eq("termSlug", args.termSlug)
    )
    .first();

  if (existingMastery) {
    const newMasteryScore = updateMastery(
      existingMastery.masteryScore,
      args.masteryDelta
    );
    await ctx.db.patch(existingMastery._id, {
      masteryScore: newMasteryScore,
      proficiencyBand: proficiencyBand(newMasteryScore),
      seenCount: existingMastery.seenCount + 1,
      correctCount: existingMastery.correctCount + (isCorrect ? 1 : 0),
      incorrectCount: existingMastery.incorrectCount + (isCorrect ? 0 : 1),
      updatedAt: now,
    });
  } else {
    const initialMasteryScore = updateMastery(0, args.masteryDelta);
    await ctx.db.insert("term_mastery", {
      userId: args.userId,
      termSlug: args.termSlug,
      masteryScore: initialMasteryScore,
      proficiencyBand: proficiencyBand(initialMasteryScore),
      seenCount: 1,
      correctCount: isCorrect ? 1 : 0,
      incorrectCount: isCorrect ? 0 : 1,
      createdAt: now,
      updatedAt: now,
    });
  }

  const existingReview = await ctx.db
    .query("due_reviews")
    .withIndex("by_user_and_term", (q) =>
      q.eq("userId", args.userId).eq("termSlug", args.termSlug)
    )
    .first();

  const isDue = args.scheduledFor <= now;

  if (existingReview) {
    await ctx.db.patch(existingReview._id, {
      fsrsState: args.fsrsState,
      scheduledFor: args.scheduledFor,
      isDue,
      updatedAt: now,
    });
  } else {
    await ctx.db.insert("due_reviews", {
      userId: args.userId,
      termSlug: args.termSlug,
      fsrsState: args.fsrsState,
      scheduledFor: args.scheduledFor,
      isDue,
      createdAt: now,
      updatedAt: now,
    });
  }

  return { success: true };
}

/**
 * Retrieves all due glossary terms for a user's study session.
 * @param {QueryCtx} ctx - The query context
 * @param {GetDueTermsArgs} args - The user ID and optional current timestamp
 * @returns {Promise<{ termSlug: string; fsrsState: object; scheduledFor: number }[]>} Array of due term reviews with FSRS state and schedule
 */
export async function getDueTermsHandler(
  ctx: QueryCtx,
  args: GetDueTermsArgs
) {
  const now = args.now ?? Date.now();

  const reviews = await ctx.db
    .query("due_reviews")
    .withIndex("by_user", (q) => q.eq("userId", args.userId))
    .order("asc")
    .collect();

  const dueTerms = reviews
    .filter((review) => review.scheduledFor <= now)
    .map((review) => ({
      termSlug: review.termSlug,
      fsrsState: review.fsrsState,
      scheduledFor: review.scheduledFor,
    }));

  return dueTerms;
}

/**
 * Retrieves term mastery records for a specific module.
 * @param {QueryCtx} ctx - The query context
 * @param {GetTermMasteryByUnitArgs} args - The user ID and module number
 * @returns {Promise<Doc<"term_mastery">[]>} Array of mastery records for terms in the module
 */
export async function getTermMasteryByUnitHandler(
  ctx: QueryCtx,
  args: GetTermMasteryByUnitArgs
) {
  const masteryRecords = await ctx.db
    .query("term_mastery")
    .withIndex("by_user", (q) => q.eq("userId", args.userId))
    .collect();

  const filtered = masteryRecords.filter((record) => {
    const term = getGlossaryTermBySlug(record.termSlug);
    return term && term.modules?.includes(args.moduleNumber);
  });

  return filtered;
}

/**
 * Retrieves practice test results for a user, optionally filtered by module.
 * @param {QueryCtx} ctx - The query context
 * @param {GetPracticeTestResultsArgs} args - The user ID and optional module number filter
 * @returns {Promise<Doc<"practice_test_results">[]>} Array of practice test result documents
 */
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

/**
 * Retrieves recent study sessions for a user.
 * @param {QueryCtx} ctx - The query context
 * @param {GetRecentStudySessionsArgs} args - The user ID and optional limit
 * @returns {Promise<Doc<"study_sessions">[]>} Array of study session documents
 */
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

/**
 * Saves a practice test result for a user.
 * @param {MutationCtx} ctx - The mutation context
 * @param {SavePracticeTestResultArgs} args - The test result data
 * @returns {{ resultId: Id<"practice_test_results"> }} Object with the result ID
 * @throws Error if `score` is negative or exceeds `questionCount`, if `questionCount` is non-positive, or if `moduleNumber` is outside 1..9
 */
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

/**
 * Records a study session for a user.
 * @param {MutationCtx} ctx - The mutation context
 * @param {RecordStudySessionArgs} args - The session data including activity type and results
 * @returns {{ sessionId: Id<"study_sessions"> }} Object with the session ID
 */
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

/**
 * Retrieves a single study session by its ID.
 * @param {QueryCtx} ctx - The query context
 * @param {{ sessionId: Id<"study_sessions"> }} args - The session ID
 * @returns {Promise<Doc<"study_sessions"> | null>} The study session document, or null if not found
 */
export async function getStudySessionByIdHandler(
  ctx: QueryCtx,
  args: { sessionId: Id<"study_sessions"> }
) {
  const session = await ctx.db.get(args.sessionId);
  return session;
}

/**
 * Retrieves a single practice test result by its ID.
 * @param {QueryCtx} ctx - The query context
 * @param {{ resultId: Id<"practice_test_results"> }} args - The result ID
 * @returns {Promise<Doc<"practice_test_results"> | null>} The practice test result document, or null if not found
 */
export async function getPracticeTestResultByIdHandler(
  ctx: QueryCtx,
  args: { resultId: Id<"practice_test_results"> }
) {
  const result = await ctx.db.get(args.resultId);
  return result;
}

/**
 * Retrieves practice test results for a specific student, for teacher view.
 * @param {QueryCtx} ctx - The query context
 * @param {{ studentId: Id<"profiles">; moduleNumber?: number }} args - The student ID and optional module number filter
 * @returns {Promise<Doc<"practice_test_results">[]>} Array of practice test result documents
 */
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

/**
 * Retrieves study sessions for a specific student, for teacher view.
 * @param {QueryCtx} ctx - The query context
 * @param {{ studentId: Id<"profiles">; activityType?: "flashcards" | "matching" | "speed_round" | "srs_review" | "practice_test" }} args - The student ID and optional activity type filter
 * @returns {Promise<Doc<"study_sessions">[]>} Array of study session documents
 */
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

/**
 * Internal query that returns practice test results for a user, optionally
 * filtered by module number.
 * @returns {Promise<Array<Doc<"practice_test_results">>>} Array of practice test result documents
 */
export const getPracticeTestResults = internalQuery({
  args: {
    userId: v.id("profiles"),
    moduleNumber: v.optional(v.number()),
  },
  handler: getPracticeTestResultsHandler,
});

/**
 * Internal query that returns the user's most-recent study sessions
 * (newest first), capped at `limit` (default 10).
 * @returns {Promise<Array<Doc<"study_sessions">>>} Array of study session documents
 */
export const getRecentStudySessions = internalQuery({
  args: {
    userId: v.id("profiles"),
    limit: v.optional(v.number()),
  },
  handler: getRecentStudySessionsHandler,
});

/**
 * Internal mutation that records a practice test result for a user. The
 * `score`, `questionCount`, and `moduleNumber` arguments are validated and
 * the result is persisted to `practice_test_results`.
 * @returns {Promise<{ resultId: Id<"practice_test_results"> }>} The new practice-test-result row ID
 * @throws Error if `score` is negative or exceeds `questionCount`, if `questionCount` is non-positive, or if `moduleNumber` is outside 1..9
 */
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

/**
 * Internal mutation that records a study session (flashcards, matching,
 * speed round, SRS review, or practice test) for a user. Stores the
 * activity type, scope, and aggregate results.
 * @returns {Promise<{ sessionId: Id<"study_sessions"> }>} The new study-session row ID
 */
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

/**
 * Internal query that returns a single study session by its row ID.
 * @returns {Promise<Doc<"study_sessions"> | null>} The session document, or null if not found
 */
export const getStudySessionById = internalQuery({
  args: {
    sessionId: v.id("study_sessions"),
  },
  handler: getStudySessionByIdHandler,
});

/**
 * Internal query that returns a single practice test result by its row ID.
 * @returns {Promise<Doc<"practice_test_results"> | null>} The result document, or null if not found
 */
export const getPracticeTestResultById = internalQuery({
  args: {
    resultId: v.id("practice_test_results"),
  },
  handler: getPracticeTestResultByIdHandler,
});

/**
 * Internal query that returns practice test results for a specific student
 * (teacher view), optionally filtered by module number.
 * @returns {Promise<Array<Doc<"practice_test_results">>>} Array of practice test result documents
 */
export const getPracticeTestResultsForTeacher = internalQuery({
  args: {
    studentId: v.id("profiles"),
    moduleNumber: v.optional(v.number()),
  },
  handler: getPracticeTestResultsForTeacherHandler,
});

/**
 * Internal query that returns study sessions for a specific student
 * (teacher view), optionally filtered by activity type. Sorted newest first.
 * @returns {Promise<Array<Doc<"study_sessions">>>} Array of study session documents
 */
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

/**
 * Internal mutation that processes a spaced-repetition review for a
 * glossary term. Updates `term_mastery` (mastery delta + proficiency band)
 * and upserts the `due_reviews` row with the new FSRS state.
 * @returns {Promise<{ success: boolean }>} Confirmation
 */
export const processReview = internalMutation({
  args: {
    userId: v.id("profiles"),
    termSlug: v.string(),
    rating: v.union(
      v.literal("again"),
      v.literal("hard"),
      v.literal("good"),
      v.literal("easy")
    ),
    masteryDelta: v.number(),
    fsrsState: fsrsStateValidator,
    scheduledFor: v.number(),
    now: v.optional(v.number()),
  },
  handler: processReviewHandler,
});

/**
 * Internal query that returns every due glossary term (FSRS-state, term
 * slug, and scheduledFor timestamp) for a user's study session.
 * @returns {Promise<Array<{ termSlug: string; fsrsState: object; scheduledFor: number }>>} Array of due term reviews
 */
export const getDueTerms = internalQuery({
  args: {
    userId: v.id("profiles"),
    now: v.optional(v.number()),
  },
  handler: getDueTermsHandler,
});

/**
 * Internal query that returns term-mastery rows for a user's terms in a
 * specific module.
 * @returns {Promise<Array<Doc<"term_mastery">>>} Array of mastery records for terms in the module
 */
export const getTermMasteryByUnit = internalQuery({
  args: {
    userId: v.id("profiles"),
    moduleNumber: v.number(),
  },
  handler: getTermMasteryByUnitHandler,
});