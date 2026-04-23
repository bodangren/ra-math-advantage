import { internalMutation, internalQuery, type MutationCtx, type QueryCtx } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";

function mapDbCardToContract(
  card: {
    _id: Id<"srs_cards">;
    studentId: Id<"profiles">;
    objectiveId: string;
    problemFamilyId: string;
    stability: number;
    difficulty: number;
    state: "new" | "learning" | "review" | "relearning";
    dueDate: string;
    elapsedDays: number;
    scheduledDays: number;
    reps: number;
    lapses: number;
    lastReview?: string;
    createdAt: number;
    updatedAt: number;
  }
) {
  return {
    cardId: card._id as string,
    studentId: card.studentId as string,
    objectiveId: card.objectiveId,
    problemFamilyId: card.problemFamilyId,
    stability: card.stability,
    difficulty: card.difficulty,
    state: card.state,
    dueDate: card.dueDate,
    elapsedDays: card.elapsedDays,
    scheduledDays: card.scheduledDays,
    reps: card.reps,
    lapses: card.lapses,
    lastReview: card.lastReview ?? null,
    createdAt: new Date(card.createdAt).toISOString(),
    updatedAt: new Date(card.updatedAt).toISOString(),
  };
}

export type SaveCardArgs = {
  cardId: string;
  studentId: string;
  objectiveId: string;
  problemFamilyId: string;
  stability: number;
  difficulty: number;
  state: "new" | "learning" | "review" | "relearning";
  dueDate: string;
  elapsedDays: number;
  scheduledDays: number;
  reps: number;
  lapses: number;
  lastReview?: string | null;
  createdAt: string;
  updatedAt: string;
};

export async function saveCardHandler(
  ctx: MutationCtx,
  args: SaveCardArgs
): Promise<Id<"srs_cards">> {
  const existing = await ctx.db
    .query("srs_cards")
    .withIndex("by_student_and_problem_family", (q) =>
      q.eq("studentId", args.studentId as Id<"profiles">).eq("problemFamilyId", args.problemFamilyId)
    )
    .first();

  if (existing) {
    await ctx.db.replace(existing._id, {
      studentId: existing.studentId,
      objectiveId: args.objectiveId,
      problemFamilyId: args.problemFamilyId,
      stability: args.stability,
      difficulty: args.difficulty,
      state: args.state,
      dueDate: args.dueDate,
      elapsedDays: args.elapsedDays,
      scheduledDays: args.scheduledDays,
      reps: args.reps,
      lapses: args.lapses,
      lastReview: args.lastReview ?? undefined,
      createdAt: existing.createdAt,
      updatedAt: Date.now(),
    });
    return existing._id;
  } else {
    const id = await ctx.db.insert("srs_cards", {
      studentId: args.studentId as Id<"profiles">,
      objectiveId: args.objectiveId,
      problemFamilyId: args.problemFamilyId,
      stability: args.stability,
      difficulty: args.difficulty,
      state: args.state,
      dueDate: args.dueDate,
      elapsedDays: args.elapsedDays,
      scheduledDays: args.scheduledDays,
      reps: args.reps,
      lapses: args.lapses,
      lastReview: args.lastReview ?? undefined,
      createdAt: new Date(args.createdAt).getTime(),
      updatedAt: new Date(args.updatedAt).getTime(),
    });
    return id;
  }
}

export const saveCard = internalMutation({
  args: {
    cardId: v.string(),
    studentId: v.id("profiles"),
    objectiveId: v.string(),
    problemFamilyId: v.string(),
    stability: v.number(),
    difficulty: v.number(),
    state: v.union(
      v.literal("new"),
      v.literal("learning"),
      v.literal("review"),
      v.literal("relearning"),
    ),
    dueDate: v.string(),
    elapsedDays: v.number(),
    scheduledDays: v.number(),
    reps: v.number(),
    lapses: v.number(),
    lastReview: v.optional(v.union(v.string(), v.null())),
    createdAt: v.string(),
    updatedAt: v.string(),
  },
  handler: saveCardHandler,
});

export const saveCards = internalMutation({
  args: {
    cards: v.array(
      v.object({
        cardId: v.string(),
        studentId: v.string(),
        objectiveId: v.string(),
        problemFamilyId: v.string(),
        stability: v.number(),
        difficulty: v.number(),
        state: v.union(
          v.literal("new"),
          v.literal("learning"),
          v.literal("review"),
          v.literal("relearning"),
        ),
        dueDate: v.string(),
        elapsedDays: v.number(),
        scheduledDays: v.number(),
        reps: v.number(),
        lapses: v.number(),
        lastReview: v.optional(v.union(v.string(), v.null())),
        createdAt: v.string(),
        updatedAt: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    for (const card of args.cards) {
      const existing = await ctx.db
        .query("srs_cards")
        .withIndex("by_student_and_problem_family", (q) =>
          q.eq("studentId", card.studentId as Id<"profiles">).eq("problemFamilyId", card.problemFamilyId)
        )
        .first();

      if (existing) {
        await ctx.db.replace(existing._id, {
          studentId: existing.studentId,
          objectiveId: card.objectiveId,
          problemFamilyId: card.problemFamilyId,
          stability: card.stability,
          difficulty: card.difficulty,
          state: card.state,
          dueDate: card.dueDate,
          elapsedDays: card.elapsedDays,
          scheduledDays: card.scheduledDays,
          reps: card.reps,
          lapses: card.lapses,
          lastReview: card.lastReview ?? undefined,
          createdAt: existing.createdAt,
          updatedAt: Date.now(),
        });
      } else {
        await ctx.db.insert("srs_cards", {
          studentId: card.studentId as Id<"profiles">,
          objectiveId: card.objectiveId,
          problemFamilyId: card.problemFamilyId,
          stability: card.stability,
          difficulty: card.difficulty,
          state: card.state,
          dueDate: card.dueDate,
          elapsedDays: card.elapsedDays,
          scheduledDays: card.scheduledDays,
          reps: card.reps,
          lapses: card.lapses,
          lastReview: card.lastReview ?? undefined,
          createdAt: new Date(card.createdAt).getTime(),
          updatedAt: new Date(card.updatedAt).getTime(),
        });
      }
    }
  },
});

export async function getCardHandler(
  ctx: QueryCtx,
  args: { id: string }
) {
  let cardId: Id<"srs_cards">;
  try {
    cardId = args.id as Id<"srs_cards">;
  } catch {
    return null;
  }
  const card = await ctx.db.get(cardId);
  if (!card) return null;
  return mapDbCardToContract(card);
}

export const getCard = internalQuery({
  args: { id: v.string() },
  handler: getCardHandler,
});

export async function getCardsByStudentHandler(
  ctx: QueryCtx,
  args: { studentId: string }
) {
  const cards = await ctx.db
    .query("srs_cards")
    .withIndex("by_student", (q) =>
      q.eq("studentId", args.studentId as Id<"profiles">)
    )
    .collect();
  return cards.map(mapDbCardToContract);
}

export const getCardsByStudent = internalQuery({
  args: { studentId: v.string() },
  handler: getCardsByStudentHandler,
});

export async function getCardByStudentAndFamilyHandler(
  ctx: QueryCtx,
  args: { studentId: string; problemFamilyId: string }
) {
  const card = await ctx.db
    .query("srs_cards")
    .withIndex("by_student_and_problem_family", (q) =>
      q.eq("studentId", args.studentId as Id<"profiles">).eq("problemFamilyId", args.problemFamilyId)
    )
    .first();
  return card ? mapDbCardToContract(card) : null;
}

export const getCardByStudentAndFamily = internalQuery({
  args: { studentId: v.string(), problemFamilyId: v.string() },
  handler: getCardByStudentAndFamilyHandler,
});

export const getCardsByObjective = internalQuery({
  args: { objectiveId: v.string() },
  handler: async (ctx, args) => {
    const cards = await ctx.db
      .query("srs_cards")
      .withIndex("by_objective", (q) => q.eq("objectiveId", args.objectiveId))
      .collect();
    return cards.map(mapDbCardToContract);
  },
});

export const getDueCards = internalQuery({
  args: {
    studentId: v.string(),
    asOfDate: v.string(),
  },
  handler: async (ctx, args) => {
    const asOfMs = new Date(args.asOfDate).getTime();
    const cards = await ctx.db
      .query("srs_cards")
      .withIndex("by_student_and_due", (q) =>
        q.eq("studentId", args.studentId as Id<"profiles">)
      )
      .collect();
    return cards
      .filter((card) => new Date(card.dueDate).getTime() <= asOfMs)
      .map(mapDbCardToContract);
  },
});
