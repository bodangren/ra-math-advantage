import { Migrations } from "@convex-dev/migrations";
import { components, internal } from "./_generated/api";
import { internalMutation } from "./_generated/server";
import schema from "./schema";
import { migratePlacementResultToV3_2 } from "../lib/placement/v3-placement-migration";
import { transformLegacyCard } from "../lib/srs/migration-transforms";
import { KST_SRS_V3_2_MIGRATION_VERSION } from "../lib/srs/v3-runtime-contract";
import { dualWriteFields } from "./srs/cards";

/**
 * Stateful, component-owned migration runner. The component persists cursors,
 * retries, cancellation state, and dry-run behavior; this app file owns only
 * pure per-document transforms and idempotent application patches.
 */
// `components` becomes strongly typed after `npx convex codegen` runs against
// the configured deployment. Keep the source buildable before that one-time
// setup while preserving the exact runtime component name.
const migrationComponent = (components as unknown as { migrations: never }).migrations;

export const migrations = new Migrations(migrationComponent, {
  internalMutation,
  schema,
  defaultBatchSize: 50,
  migrationsLocationPrefix: "migrations:",
});

export const migrateSrsCardIdentities = migrations.define({
  table: "srs_cards",
  migrateOne: (_ctx, card) => {
    const patch = transformLegacyCard({
      id: String(card._id),
      variantKey: card.variantKey,
      legacyProblemFamilyId: card.legacyProblemFamilyId,
      problemFamilyId: card.problemFamilyId,
      migrationVersion: card.migrationVersion,
      sourceTimestamp: card.sourceTimestamp,
      createdAt: card.createdAt,
    });
    return patch ?? undefined;
  },
});

export const migratePracticeVariants = migrations.define({
  table: "practice_variants",
  migrateOne: (_ctx, variant) => {
    if (
      variant.legacyProblemFamilyId === variant.variantKey &&
      variant.migrationVersion === KST_SRS_V3_2_MIGRATION_VERSION &&
      variant.sourceTimestamp !== undefined
    )
      return;
    return {
      legacyProblemFamilyId: variant.variantKey,
      migrationVersion: KST_SRS_V3_2_MIGRATION_VERSION,
      sourceTimestamp: variant.sourceTimestamp ?? variant._creationTime,
    };
  },
});

export const migratePracticeItems = migrations.define({
  table: "practice_items",
  migrateOne: (_ctx, item) => {
    if (
      item.legacyProblemFamilyId === item.variantKey &&
      item.migrationVersion === KST_SRS_V3_2_MIGRATION_VERSION &&
      item.sourceTimestamp !== undefined
    )
      return;
    return {
      legacyProblemFamilyId: item.variantKey,
      migrationVersion: KST_SRS_V3_2_MIGRATION_VERSION,
      sourceTimestamp: item.sourceTimestamp ?? item._creationTime,
    };
  },
});

export const migrateReviewLogProvenance = migrations.define({
  table: "srs_review_log",
  migrateOne: (_ctx, review) => {
    if (
      review.migrationVersion === KST_SRS_V3_2_MIGRATION_VERSION &&
      review.sourceTimestamp === review.reviewedAt
    )
      return;
    return {
      migrationVersion: KST_SRS_V3_2_MIGRATION_VERSION,
      sourceTimestamp: review.reviewedAt,
    };
  },
});

export const migratePlacementEvidence = migrations.define({
  table: "placement_results",
  migrateOne: async (ctx, placement) => {
    const migration = migratePlacementResultToV3_2({
      studentId: String(placement.studentId),
      nodeId: placement.nodeId,
      masteryEstimate: placement.masteryEstimate,
      confidence: placement.confidence,
      createdAt: placement.createdAt,
    });
    let synthesizedCardId = placement.synthesizedCardId;

    if (migration.synthesizedCard !== null && synthesizedCardId === undefined) {
      const card = migration.synthesizedCard;
      const existing = await ctx.db
        .query("srs_cards")
        .withIndex("by_student_and_variant", (q) =>
          q.eq("studentId", placement.studentId).eq("variantKey", card.variantKey),
        )
        .first();

      synthesizedCardId =
        existing?._id ??
        (await ctx.db.insert("srs_cards", {
          studentId: placement.studentId,
          objectiveId: card.objectiveId,
          ...dualWriteFields(card.variantKey, placement.createdAt),
          stability: card.stability,
          difficulty: card.difficulty,
          state: card.state,
          dueDate: card.dueDate,
          elapsedDays: card.elapsedDays,
          scheduledDays: card.scheduledDays,
          reps: card.reps,
          lapses: card.lapses,
          lastReview: card.lastReview ?? undefined,
          createdAt: placement.createdAt,
          updatedAt: placement.createdAt,
        }));
    }

    return {
      ...migration.placementPatch,
      ...(synthesizedCardId === undefined ? {} : { synthesizedCardId }),
    };
  },
});

/** Runs the ordered, resumable migration set with component-managed state. */
const migrationReferences = (internal as unknown as { migrations: Record<string, never> })
  .migrations;

export const runAll = migrations.runner([
  migrationReferences.migrateSrsCardIdentities,
  migrationReferences.migratePracticeVariants,
  migrationReferences.migratePracticeItems,
  migrationReferences.migrateReviewLogProvenance,
  migrationReferences.migratePlacementEvidence,
]);

/** Generic runner for a targeted dry run, resume, retry, or cancel workflow. */
export const run = migrations.runner();
