import { internalMutation, internalQuery, type MutationCtx, type QueryCtx } from "../_generated/server";
import { v } from "convex/values";
import { classifyRuntimeComparison } from "../../lib/srs/runtime-comparison";
import { KST_SRS_V3_2_MIGRATION_VERSION } from "../../lib/srs/v3-runtime-contract";
import {
  srsComparisonSubjectValidator,
  srsDivergenceClassValidator,
  srsRuntimeModeValidator,
} from "./runtime-contract";

const RUNTIME_SCOPE = "im3" as const;

async function findRuntimeControl(ctx: { db: Pick<QueryCtx["db"], "query"> }) {
  return ctx.db
    .query("srs_runtime_controls")
    .withIndex("by_scope", (q) => q.eq("scope", RUNTIME_SCOPE))
    .first();
}

/** Returns the server-owned mode; compare is the safe widened-window default. */
export async function getRuntimeModeHandler(ctx: QueryCtx) {
  const control = await findRuntimeControl(ctx);
  return {
    mode: control?.mode ?? "compare",
    approvedAt: control?.approvedAt ?? null,
  };
}

/**
 * Writes a server-side runtime mode. This handler is exported for internal
 * orchestration and tests only; no public function exposes it to a client.
 */
export async function setRuntimeModeHandler(
  ctx: MutationCtx,
  args: { mode: "compare" | "v3_2" | "rollback_v2"; approvedAt?: number; now?: number },
) {
  const now = args.now ?? Date.now();
  const control = await findRuntimeControl(ctx);
  const patch = {
    mode: args.mode,
    migrationVersion: KST_SRS_V3_2_MIGRATION_VERSION,
    approvedAt: args.approvedAt,
    updatedAt: now,
  } as const;

  if (control) {
    await ctx.db.patch(control._id, patch);
    return control._id;
  }
  return ctx.db.insert("srs_runtime_controls", { scope: RUNTIME_SCOPE, ...patch });
}

/**
 * Stores a difference only. Input payloads are used transiently to compute
 * redacted fingerprints and never become database fields.
 */
export async function recordRuntimeComparisonHandler(
  ctx: MutationCtx,
  args: {
    subject: "knowledge_state" | "dashboard_recommendation" | "daily_queue" | "review_day_message" | "placement";
    v2: unknown;
    v3_2: unknown;
    now?: number;
  },
): Promise<{ recorded: boolean; classification: "intended_contract_change" | "data_gap" | "unexpected" | null }> {
  const event = classifyRuntimeComparison(args);
  if (event === null) return { recorded: false, classification: null };

  await ctx.db.insert("srs_runtime_comparisons", {
    subject: event.subject,
    classification: event.divergenceClass,
    explanationKey: event.explanationKey,
    v2Fingerprint: event.v2Fingerprint,
    v3Fingerprint: event.v3_2Fingerprint,
    migrationVersion: KST_SRS_V3_2_MIGRATION_VERSION,
    observedAt: args.now ?? Date.now(),
  });
  return { recorded: true, classification: event.divergenceClass };
}

export const getRuntimeMode = internalQuery({
  args: {},
  returns: v.object({
    mode: srsRuntimeModeValidator,
    approvedAt: v.union(v.number(), v.null()),
  }),
  handler: getRuntimeModeHandler,
});

export const setRuntimeMode = internalMutation({
  args: {
    mode: srsRuntimeModeValidator,
    approvedAt: v.optional(v.number()),
    now: v.optional(v.number()),
  },
  returns: v.id("srs_runtime_controls"),
  handler: setRuntimeModeHandler,
});

export const recordRuntimeComparison = internalMutation({
  args: {
    subject: srsComparisonSubjectValidator,
    v2: v.any(),
    v3_2: v.any(),
    now: v.optional(v.number()),
  },
  returns: v.object({
    recorded: v.boolean(),
    classification: v.union(srsDivergenceClassValidator, v.null()),
  }),
  handler: recordRuntimeComparisonHandler,
});
