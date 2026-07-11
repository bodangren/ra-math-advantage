"use node";

import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { assertMigrationOperator } from "../lib/srs/migration-operator";

const migrationName = v.union(
  v.literal("migrateSrsCardIdentities"),
  v.literal("migratePracticeVariants"),
  v.literal("migratePracticeItems"),
  v.literal("migrateReviewLogProvenance"),
  v.literal("migratePlacementEvidence"),
);

/**
 * Starts the internal migration runner from an authenticated CLI operation.
 * This is intentionally not referenced by client code. The required token is
 * a deployment secret, allowing the production surface to remain inert until
 * an operator explicitly configures and invokes it.
 */
export const runAll = action({
  args: {
    operatorToken: v.string(),
    dryRun: v.optional(v.boolean()),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    assertMigrationOperator(args.operatorToken, process.env.MIGRATION_OPERATOR_TOKEN);
    return ctx.runMutation(internal.migrations.runAll, {
      dryRun: args.dryRun ?? true,
    });
  },
});

/** Runs one allow-listed migration for targeted dry runs or resumes. */
export const run = action({
  args: {
    operatorToken: v.string(),
    migration: migrationName,
    dryRun: v.optional(v.boolean()),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    assertMigrationOperator(args.operatorToken, process.env.MIGRATION_OPERATOR_TOKEN);
    return ctx.runMutation(internal.migrations.run, {
      fn: args.migration,
      dryRun: args.dryRun ?? true,
    });
  },
});
