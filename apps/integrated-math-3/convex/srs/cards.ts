import { internalMutation, internalQuery, type MutationCtx, type QueryCtx } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";
import { srsCardStateLiteralValidator } from "./validators";

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
      q.eq("studentId", args.studentId).eq("problemFamilyId", args.problemFamilyId)
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
      updatedAt: new Date(args.updatedAt).getTime(),
    });
    return existing._id;
  } else {
    const id = await ctx.db.insert("srs_cards", {
      studentId: args.studentId,
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
    state: srsCardStateLiteralValidator,
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

export async function saveCardsHandler(
  ctx: MutationCtx,
  args: { cards: Array<{
    cardId: string;
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
    lastReview?: string | null;
    createdAt: string;
    updatedAt: string;
  }> }
): Promise<void> {
  const lookups = await Promise.all(
    args.cards.map((card) =>
      ctx.db
        .query("srs_cards")
        .withIndex("by_student_and_problem_family", (q) =>
          q.eq("studentId", card.studentId).eq("problemFamilyId", card.problemFamilyId)
        )
        .first()
    )
  );

  await Promise.all(
    args.cards.map((card, i) => {
      const existing = lookups[i];
      if (existing) {
        return ctx.db.replace(existing._id, {
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
          updatedAt: new Date(card.updatedAt).getTime(),
        });
      } else {
        return ctx.db.insert("srs_cards", {
          studentId: card.studentId,
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
    })
  );
}

export const saveCards = internalMutation({
  args: {
    cards: v.array(
      v.object({
        cardId: v.string(),
        studentId: v.id("profiles"),
        objectiveId: v.string(),
        problemFamilyId: v.string(),
        stability: v.number(),
        difficulty: v.number(),
        state: srsCardStateLiteralValidator,
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
  handler: saveCardsHandler,
});

export async function getCardHandler(
  ctx: QueryCtx,
  args: { id: string }
) {
  const card = await ctx.db.get(args.id as Id<"srs_cards">);
  if (!card) return null;
  return mapDbCardToContract(card);
}

export const getCard = internalQuery({
  args: { id: v.string() },
  handler: getCardHandler,
});

export async function getCardsByStudentHandler(
  ctx: QueryCtx,
  args: { studentId: Id<"profiles"> }
) {
  const cards = await ctx.db
    .query("srs_cards")
    .withIndex("by_student", (q) =>
      q.eq("studentId", args.studentId)
    )
    .collect();
  return cards.map(mapDbCardToContract);
}

export const getCardsByStudent = internalQuery({
  args: { studentId: v.id("profiles") },
  handler: getCardsByStudentHandler,
});

export async function getCardByStudentAndFamilyHandler(
  ctx: QueryCtx,
  args: { studentId: Id<"profiles">; problemFamilyId: string }
) {
  const card = await ctx.db
    .query("srs_cards")
    .withIndex("by_student_and_problem_family", (q) =>
      q.eq("studentId", args.studentId).eq("problemFamilyId", args.problemFamilyId)
    )
    .first();
  return card ? mapDbCardToContract(card) : null;
}

export const getCardByStudentAndFamily = internalQuery({
  args: { studentId: v.id("profiles"), problemFamilyId: v.string() },
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
    studentId: v.id("profiles"),
    asOfDate: v.string(),
  },
  handler: async (ctx, args) => {
    const cards = await ctx.db
      .query("srs_cards")
      .withIndex("by_student_and_due", (q) =>
        q.eq("studentId", args.studentId).lte("dueDate", args.asOfDate)
      )
      .collect();
    return cards.map(mapDbCardToContract);
  },
});
