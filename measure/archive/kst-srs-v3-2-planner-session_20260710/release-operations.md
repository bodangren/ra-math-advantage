# KST+SRS v3.2 Planner and Session Release Operations

## Release boundary

This track releases reusable engine behavior only. It does not migrate Convex
documents, backfill graph artifacts, enable an app feature flag, or deploy an
application. Production adoption belongs to
`kst-srs-v3-2-im3-runtime-migration_20260710`.

The runtime handoff must preserve these inseparable identities:

- graph release ID, graph-content hash, and precompute-input hash;
- domain utility provider key/version and every signal source/version;
- planner ranking mode derived from the graph release;
- scheduler parameter version and interval load-balancing decision.

Do not reconstruct or relabel these values in UI or persistence adapters.

## Utility-provider release checklist

1. Prepare domain signal data offline. Live provider network calls are not
   allowed.
2. Version the provider whenever a source, source version, weight, or formula
   changes.
3. Bind the provider to the exact graph/precompute release with
   `bindDomainUtilityProviderV3_2`.
4. Resolve utilities through the domain registry. Persist the returned
   `UtilityResolutionV3_2`; never pass an unprovenanced scalar to planning.
5. Verify the recommendation result repeats the same graph and utility release
   identity. Cross-domain and stale-release resolutions fail closed.
6. Missing-provider operation must remain utility zero with
   `weightsRenormalized: false`.

The synthetic provider is test-only and must not be registered as production
domain content.

## Review-load and UX checklist

- Assemble due-card projections server-side with an explicit clock.
- Include overdue cards and the inclusive seven-day boundary.
- Surface `normal`, `elevated`, or `saturated` from the returned assessment;
  React must not recompute thresholds.
- When saturated, show review-day guidance and persist/emit zero new-skill
  recommendations.
- Student payloads carry one state; teacher payloads carry a student-ID map;
  parent payloads do not carry review-load state.
- Supply projected daily loads to `scheduleReview` only when the complete fuzz
  window is available. Persist the returned decision alongside the due date.
- Preserve minute-level short-term schedules: zero-day FSRS results bypass the
  daily balancer.

## Approved constants and follow-up

The v3.2 source specification fixes the planner weights, sparse threshold,
sparse weights, diversity cap, review-load factors, and fuzz width implemented
here. The upstream specification records pedagogy/sensitivity ratification as
follow-up work; app rollout must not silently tune these constants. Any change
requires a new versioned contract and evaluation evidence.

## Verification commands

```bash
npm test --workspace=packages/knowledge-space-practice -- --run
npm run typecheck --workspace=packages/knowledge-space-practice
npm run lint --workspace=packages/knowledge-space-practice
npm test --workspace=packages/srs-engine -- --run --maxWorkers=1
npm run typecheck --workspace=packages/srs-engine
npm run lint --workspace=packages/srs-engine
node scripts/check-monorepo-boundaries.mjs
bash measure/scripts/doctor.sh
```
