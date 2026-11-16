# Specification: KST+SRS v3.2 IM3 Runtime and Data Migration

## Overview

Move IM3's existing production KST chain—placement persistence, SRS bridge,
knowledge state, outer fringe, projections, and student routes—to the completed
v3.2 packages. IM3 is the first adopter because it is the only app with the
full runtime chain; shared packages remain canonical. Existing Convex data must
migrate online through widen–migrate–narrow deployments with dry runs,
resumable batches, verification, and rollback.

## Functional Requirements

1. Inventory every IM3 v2 field, index, query, mutation, projection, UI route,
   and persisted artifact affected by v3.2.
2. Widen schemas with optional v3 fields for evidence type, synthesized-card
   provenance, parameter version, review-load state, and migration version;
   add indexes named for all indexed fields.
3. During migration, write the new representation and read both old and new
   representations with explicit precedence and telemetry.
4. Use `@convex-dev/migrations` for non-trivial tables, subject to the
   repository's explicit dependency-approval guardrail. Migrations must be
   batched, resumable, idempotent, dry-runnable, and status-reporting.
5. Complete the stored `problemFamilyId` to `variantKey` migration through the
   same widen–migrate–narrow protocol.
6. Backfill placement-derived cards and evidence without inventing review
   history; preserve source timestamps and mark inferred values.
7. Add feature-flagged v2/v3.2 comparison mode and record deterministic,
   explainable divergences before cutover.
8. Update knowledge-state routes, dashboard recommendations, placement, daily
   practice, and review-day messaging to consume v3.2 projections.
9. Reconcile BM2's app-local queue with canonical `srs-engine`; add compatibility
   gates for BM2, IM1, IM2, and Precalculus.
10. Verify migration completion before narrowing schemas and removing v2
    readers; document rollback and resume commands.

## Non-Functional Requirements

- No unbounded `.collect()` calls or per-student N+1 loops; use indexes,
  pagination/batches, and bounded reads.
- Convex functions have argument and return validators and use internal
  registration for migration/admin operations.
- Auth and authorization remain in app wrappers; clients never call migration
  or packaged-component functions directly.
- The app remains usable during each deployment stage.
- Data operations are observable but do not log sensitive learner answers.

## Acceptance Criteria

- Dry runs report expected counts without persistent writes.
- Re-running any migration produces no duplicate or contradictory state.
- Verification queries return zero unmigrated documents before schema narrowing.
- Comparison mode classifies every v2/v3.2 divergence and meets approved
  thresholds before cutover.
- IM3 uses v3.2 end to end; every app builds and typechecks against the final
  contracts; BM2 no longer uses a competing queue algorithm.

## Out of Scope

- Full KST UI rollout to non-IM3 apps.
- Live production deployment without a separately approved deployment action.
- Deleting deprecated data before the rollback window closes.

