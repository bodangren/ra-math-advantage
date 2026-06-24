import { internalMutation, internalQuery, type MutationCtx, type QueryCtx } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";
import { srsCardStateLiteralValidator } from "./validators";

/**
 * Maps a database SRS card to the public contract format.
 * @param {{ _id: Id<"srs_cards">; studentId: Id<"profiles">; objectiveId: string; variantKey: string; stability: number; difficulty: number; state: "new" | "learning" | "review" | "relearning"; dueDate: string; elapsedDays: number; scheduledDays: number; reps: number; lapses: number; lastReview?: string; createdAt: number; updatedAt: number }} card - The raw database card object
 * @returns {ReturnType<typeof mapDbCardToContract>} The card in contract format with ISO date strings
 */
function mapDbCardToContract(
  card: {
    _id: Id<"srs_cards">;
    studentId: Id<"profiles">;
    objectiveId: string;
    variantKey: string;
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
    variantKey: card.variantKey,
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
  variantKey: string;
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

/**
 * Saves or updates an SRS card for a student.
 * @param {MutationCtx} ctx - The mutation context
 * @param {SaveCardArgs} args - The card data to save
 * @returns {Promise<Id<"srs_cards">>} The ID of the saved or created card
 */
export async function saveCardHandler(
  ctx: MutationCtx,
  args: SaveCardArgs
): Promise<Id<"srs_cards">> {
  const existing = await ctx.db
    .query("srs_cards")
    .withIndex("by_student_and_variant", (q) =>
      q.eq("studentId", args.studentId).eq("variantKey", args.variantKey)
    )
    .first();

  if (existing) {
    await ctx.db.replace(existing._id, {
      studentId: existing.studentId,
      objectiveId: args.objectiveId,
      variantKey: args.variantKey,
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
      variantKey: args.variantKey,
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

/**
 * Internal mutation that saves or updates a single SRS card keyed by
 * (studentId, variantKey). Patches an existing card in place; inserts a
 * new card when none exists for the pair.
 * @returns {Promise<Id<"srs_cards">>} The ID of the saved or created card
 */
export const saveCard = internalMutation({
  args: {
    cardId: v.string(),
    studentId: v.id("profiles"),
    objectiveId: v.string(),
    variantKey: v.string(),
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

/**
 * Saves or updates multiple SRS cards in a single batch operation.
 * @param {MutationCtx} ctx - The mutation context
 * @param {{ cards: Array<{ cardId: string; studentId: Id<"profiles">; objectiveId: string; variantKey: string; stability: number; difficulty: number; state: "new" | "learning" | "review" | "relearning"; dueDate: string; elapsedDays: number; scheduledDays: number; reps: number; lapses: number; lastReview?: string | null; createdAt: string; updatedAt: string }> }} args - Object containing an array of card data to save
 * @returns {Promise<void>} Resolves when every card has been upserted; failures in the `Promise.all` are surfaced to the caller
 */
export async function saveCardsHandler(
  ctx: MutationCtx,
  args: { cards: Array<{
    cardId: string;
    studentId: Id<"profiles">;
    objectiveId: string;
    variantKey: string;
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
        .withIndex("by_student_and_variant", (q) =>
          q.eq("studentId", card.studentId).eq("variantKey", card.variantKey)
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
          variantKey: card.variantKey,
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
          variantKey: card.variantKey,
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

/**
 * Internal mutation that batch-saves (or batch-updates) SRS cards in a
 * single operation. Each card is upserted independently keyed by
 * (studentId, variantKey); see `saveCardHandler` for per-card semantics.
 * @returns {Promise<void>} Resolves when every card has been upserted
 */
export const saveCards = internalMutation({
  args: {
    cards: v.array(
      v.object({
        cardId: v.string(),
        studentId: v.id("profiles"),
        objectiveId: v.string(),
        variantKey: v.string(),
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

/**
 * Retrieves an SRS card by its ID.
 * @param {QueryCtx} ctx - The query context
 * @param {{ id: string }} args - The card ID
 * @returns {Promise<ReturnType<typeof mapDbCardToContract> | null>} The card in contract format, or null if not found
 */
export async function getCardHandler(
  ctx: QueryCtx,
  args: { id: string }
) {
  const card = await ctx.db.get(args.id as Id<"srs_cards">);
  if (!card) return null;
  return mapDbCardToContract(card);
}

/**
 * Internal query that returns a single SRS card (in contract format) by
 * its row ID.
 * @returns {Promise<ReturnType<typeof mapDbCardToContract> | null>} The card in contract format, or null when not found
 */
export const getCard = internalQuery({
  args: { id: v.string() },
  handler: getCardHandler,
});

/**
 * Retrieves all SRS cards for a specific student.
 * @param {QueryCtx} ctx - The query context
 * @param {{ studentId: Id<"profiles"> }} args - The student ID
 * @returns {Promise<ReturnType<typeof mapDbCardToContract>[]>} Array of cards in contract format
 */
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

/**
 * Internal query that returns every SRS card for a student (in contract
 * format).
 * @returns {Promise<Array<ReturnType<typeof mapDbCardToContract>>>} Array of cards in contract format
 */
export const getCardsByStudent = internalQuery({
  args: { studentId: v.id("profiles") },
  handler: getCardsByStudentHandler,
});

/**
 * Retrieves an SRS card by student ID and variant key.
 * @param {QueryCtx} ctx - The query context
 * @param {{ studentId: Id<"profiles">; variantKey: string }} args - The student ID and variant key
 * @returns {Promise<ReturnType<typeof mapDbCardToContract> | null>} The card in contract format, or null if not found
 */
export async function getCardByStudentAndVariantHandler(
  ctx: QueryCtx,
  args: { studentId: Id<"profiles">; variantKey: string }
) {
  const card = await ctx.db
    .query("srs_cards")
    .withIndex("by_student_and_variant", (q) =>
      q.eq("studentId", args.studentId).eq("variantKey", args.variantKey)
    )
    .first();
  return card ? mapDbCardToContract(card) : null;
}

/**
 * Internal query that returns a single SRS card (in contract format) keyed
 * by (studentId, variantKey).
 * @returns {Promise<ReturnType<typeof mapDbCardToContract> | null>} The card in contract format, or null when not found
 */
export const getCardByStudentAndVariant = internalQuery({
  args: { studentId: v.id("profiles"), variantKey: v.string() },
  handler: getCardByStudentAndVariantHandler,
});

/**
 * Internal query that returns every SRS card tied to a specific objective.
 * Used by teacher-facing dashboards that surface per-objective review
 * queues.
 * @returns {Promise<Array<ReturnType<typeof mapDbCardToContract>>>} Array of cards in contract format
 */
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

/**
 * Internal query that returns every SRS card for a student whose `dueDate`
 * is on or before `asOfDate`. Used by the review-session scheduler to
 * build the daily review queue.
 * @returns {Promise<Array<ReturnType<typeof mapDbCardToContract>>>} Array of due cards in contract format
 */
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
