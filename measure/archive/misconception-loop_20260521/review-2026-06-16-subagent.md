# Code Review — misconception-loop_20260521 — 2026-06-16

## Summary of Changes

In the last 24 hours the track moved from Phase 1 through Phase 4, with Phase 5 left in a Red state:

- **Phase 1 — Contract & Schema** (`cdb64f0b`, `5c8bdb20`): Added the `remediated_by` edge type to `EdgeType`/`edgeTypeSchema` and endpoint-pairing rules (`misconception → worked_example | task_blueprint | skill`) in both `schemas.ts` and `validation.ts`. Added misconception severity/lifecycle/status schemas, the `getMisconceptionSeverity` accessor, Convex validators, and the `student_misconception_state` table with indexes.
- **Phase 2 — Rating Reconciliation** (`17a4e37e`, `e931dee2`, `717760f4`): Authored Red tests across `packages/practice-core`, `apps/integrated-math-3`, and `apps/bus-math-v2`, then shipped a severity-aware `computeBaseRating(parts, options?)`. Defaults to cap-at-`Hard` for minor/unknown misconception tags and `Again` only for severe tags; preserves v1 behavior when `options` is omitted.
- **Phase 3 — Lifecycle Engine** (`186dfd8b`, `473ffb3e`, `d96e0099`, `b848d8aa`): Added the pure `runRealT6Loop` transition function in `packages/knowledge-space-practice/src/misconception-loop.ts` and Convex persistence handlers (`recordMisconceptionDetectionHandler`, `recordCleanAttemptHandler`, `getStudentActiveMisconceptionsHandler`) in `apps/integrated-math-3/convex/misconceptionState.ts`.
- **Phase 4 — Integration** (`73749097`, `213f7eba`): Added `planRemediationInjection` in `packages/knowledge-space-practice/src/planner/injection.ts` and active-misconception count fields to the student/teacher projection schemas and functions.
- **Phase 5 — Docs & Doctor** (`ab766c1c`, `df41456b`, `15b12c7f`, `c869bf0f`): Added a spec-parity Red test that asserts `kst-srs.v2/SPECIFICATION.md` documents the new edge type, lifecycle, rating cap, and NFR sections. The test currently fails 7/9. Also restored `apps/integrated-math-3/package.json` and `package-lock.json` to HEAD, removing the `@math-platform/knowledge-space-practice` dependency that had been carried over.

## Spec Alignment

| Requirement | Status | Notes |
|---|---|---|
| FR1 / AC1 — `remediated_by` edge type & pairing | **met** | Type union, zod enum, schemas, validation, and tests all cover `misconception → worked_example/task_blueprint/skill`. |
| FR2 / AC2 — Rating-cap reconciliation | **met** | `computeBaseRating` caps at `Hard` for minor/unknown tags and forces `Again` for severe tags. Backward-compatible v1 path retained when no options are passed. |
| FR3 / AC3 — Lifecycle + Convex persistence | **met** | `runRealT6Loop` models active→resolved transitions after `N` clean attempts; Convex handlers persist and read per-student state with stale-state defaults. |
| FR4 / AC4 — Planner injection & `weaknessFit` | **partial** | Package-level `planRemediationInjection` exists, but no production caller resolves `remediated_by` edges into `PlannedActivity` refs or feeds the Track 4 planner's `weaknessFit` term. The existing `apps/integrated-math-3/lib/practice/misconception-loop-wiring.ts` expects an `injected` bucket from the T6 loop, but the real `runRealT6Loop` does not return one. |
| FR5 / AC5 — Active-misconception counts in views | **met** | `projectStudentVisualization` and `projectTeacherVisualization` expose `activeMisconceptionCount` / `activeMisconceptionStudentCount`. |
| AC6 — Boundary lints, `tsc --noEmit`, all tests pass | **partial** | `doctor.sh`, `generate.sh`, root lint, and package `tsc` are clean. `CI=true npm test` has 7 expected failures from the Phase 5 spec-parity test. There is also a pre-existing IM3 convex `tsc` error in `lib/activities/review-queue.ts`. |

## Code Quality Observations

**Strengths**
- Strong TDD discipline: each phase has bounded Red commands, recorded pass/fail counts, and Green evidence in `plan.md`.
- Domain-neutral design: `runRealT6Loop`, `planRemediationInjection`, and the projection helpers are pure, app-agnostic, and well-typed.
- Backward-compatible API extension for `computeBaseRating` avoids breaking existing consumers.
- Convex persistence layer is cleanly separated from the package-level state machine.
- `runRealT6Loop` handles deduplication, ordering, stale streaks, and input validation explicitly.

**Issues / Drift**
- **Phase 5 spec update is missing.** The `kst-srs.v2/SPECIFICATION.md` does not yet contain the §3.7/§13.3 subsections or the §3.2/§8.4 cross-references the track's own Red test demands.
- **IM3 dependency gap.** `apps/integrated-math-3/package.json` no longer declares `@math-platform/knowledge-space-practice`, so the IM3 smoke test (`misconception-loop.smoke.test.ts`) cannot resolve `runRealT6Loop`. This was intentionally reverted as a Red-phase boundary fix but is now a Green-phase blocker.
- **Integration surface mismatch.** `misconception-loop-wiring.ts` expects `T6LoopOutput.injected`, but `RunRealT6LoopOutput` does not include it. The new `planRemediationInjection` helper is not yet wired in to close this gap.
- **Pre-existing lint / type noise.** A Phase 1 test has an unused `MisconceptionLifecycleStatus` import, and IM3 convex `tsc` has a pre-existing error in `lib/activities/review-queue.ts`. Neither was introduced by this track, but they prevent a fully clean final gate.
- **Dirty worktree.** Many unrelated curriculum files are modified/untracked, which could interfere with the final closeout verification.

## Risks / Blockers

1. **Phase 5 closeout is incomplete.** The spec-parity test must turn green, the IM3 dependency must be re-added, and final aggregate tests must be run.
2. **FR4 may be under-implemented.** The pure helper is present, but there is no end-to-end path from an active misconception → remediated activity in the student's practice queue or into the planner's `weaknessFit` term. This is the highest-risk spec gap.
3. **Smoke test dependency resolution.** Even after the package is added, verify that the real `runRealT6Loop` contract satisfies `misconception-loop-wiring.ts` (notably the missing `injected` output).
4. **Unrelated uncommitted changes** could be accidentally included in the final closeout commit.

## Recommended Next Actions

1. Update `kst-srs.v2/SPECIFICATION.md`:
   - Add §3.7 documenting misconception-state interaction and cross-reference §9.3.
   - Add §13.3 documenting lifecycle purity/persistence/stale-state NFRs.
   - Mention `remediated_by` in §3.2 and cross-reference §9.
   - Mention the rating-cap rule in §8.4 and cross-reference §9.2.
2. Re-add `@math-platform/knowledge-space-practice` to `apps/integrated-math-3/package.json` and regenerate `package-lock.json`.
3. Close the FR4 integration loop:
   - Resolve `remediated_by` edges from active misconceptions to `PlannedActivity` refs.
   - Feed those refs through `planRemediationInjection` into the IM3 practice queue.
   - Surface active misconception slugs to the planner's `weaknessFit` term.
   - Reconcile the `injected` bucket contract between `runRealT6Loop` and `misconception-loop-wiring.ts`.
4. Ticket or fix the pre-existing lint/tsc errors before claiming AC6.
5. Run final gates: `bash measure/scripts/doctor.sh`, `bash measure/scripts/generate.sh`, `npm run lint`, `npx tsc --noEmit` for affected packages, and `CI=true npm test`.
6. Clean or stash unrelated worktree changes before the final closeout commit.
