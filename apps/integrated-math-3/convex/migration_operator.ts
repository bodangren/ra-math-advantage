"use node";

import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import type { FunctionReference } from "convex/server";
import { assertMigrationOperator } from "../lib/srs/migration-operator";

type MigrationRunnerArgs = {
  fn?: string;
  cursor?: string | null;
  batchSize?: number;
  dryRun?: boolean;
  next?: string[];
  reset?: boolean;
  oneBatchOnly?: boolean;
};
type MigrationRunner = FunctionReference<
  "mutation",
  "internal",
  MigrationRunnerArgs,
  Record<string, unknown>
>;

// Avoid an API-type cycle: this module contributes to `internal`, while its
// operator actions invoke the internal migration module. Codegen validates the
// concrete references at deploy time.
const migrationInternal = internal as unknown as {
  migrations: { runAll: MigrationRunner; run: MigrationRunner };
};

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
  handler: async (ctx, args): Promise<Record<string, unknown>> => {
    assertMigrationOperator(args.operatorToken, process.env.MIGRATION_OPERATOR_TOKEN);
    return ctx.runMutation(migrationInternal.migrations.runAll, {
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
  handler: async (ctx, args): Promise<Record<string, unknown>> => {
    assertMigrationOperator(args.operatorToken, process.env.MIGRATION_OPERATOR_TOKEN);
    return ctx.runMutation(migrationInternal.migrations.run, {
      fn: args.migration,
      dryRun: args.dryRun ?? true,
    });
  },
});
