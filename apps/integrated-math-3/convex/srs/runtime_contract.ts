import { v } from "convex/values";

/** Canonical persisted runtime version for the IM3 v3.2 cutover. */
export const srsRuntimeMigrationVersionValidator = v.literal("kst-srs.v3.2");

/** Server-controlled mode; no client may select a migration mode. */
export const srsRuntimeModeValidator = v.union(
  v.literal("compare"),
  v.literal("v3_2"),
  v.literal("rollback_v2"),
);

export const placementEvidenceTypeValidator = v.union(v.literal("direct"), v.literal("inferred"));

export const srsMigrationRunStatusValidator = v.union(
  v.literal("pending"),
  v.literal("running"),
  v.literal("completed"),
  v.literal("failed"),
  v.literal("cancelled"),
);

/** Stable category only; detailed learner answers are never persisted here. */
export const srsComparisonSubjectValidator = v.union(
  v.literal("knowledge_state"),
  v.literal("dashboard_recommendation"),
  v.literal("daily_queue"),
  v.literal("review_day_message"),
  v.literal("placement"),
);

export const srsDivergenceClassValidator = v.union(
  v.literal("intended_contract_change"),
  v.literal("data_gap"),
  v.literal("unexpected"),
);

export const srsReviewLoadStateValidator = v.union(
  v.literal("normal"),
  v.literal("elevated"),
  v.literal("saturated"),
);
