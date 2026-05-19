# Track: Remediate Recent Work Review Findings

## Overview

Repair correctness, verification, and Measure-accountability gaps found during review of the prior 14 hours of work, primarily the completed `Extract Shared Math Content Package` and `Tech Debt Resolution v2` tracks.

## Findings to Remediate

1. **IM3 TypeScript does not pass.** `npx tsc --noEmit --project apps/integrated-math-3/tsconfig.json` fails in review-queue tests, `convex/crons.ts`, `convex/srs/sessions.ts`, and `convex/study.ts`.
2. **BM2 TypeScript does not pass.** `npx tsc --noEmit --project apps/bus-math-v2/tsconfig.json` fails because the new `__tests__/convex/rateLimits.test.ts` calls Convex registered query/mutation objects as functions.
3. **Committed dependency graph is incomplete.** `apps/bus-math-v2/package.json` and `package-lock.json` reference `@math-platform/app-shell` and `@math-platform/lesson-renderer`, but those package directories are not present in `HEAD`; they are only untracked in the current worktree.
4. **The `v.any()` remediation is overstated.** The schema still accepts many `v.record(v.string(), v.any())` fields, including `phase_sections.content` and `activities.props`, despite the completed plan requiring typed validators for `content`, `props`, `config`, and metadata.
5. **The `v.any()` audit test is not an audit.** It asserts a hardcoded constant and property existence, so it can pass while schema type safety regresses.
6. **SRS session-history cursor pagination can return underfilled or empty pages.** The implementation paginates all sessions, then filters out incomplete sessions after pagination, so active sessions can hide completed history behind later cursors.
7. **Measure plan state is internally inconsistent.** Completed tasks still contain unchecked subtasks and uncompleted manual verification items for Phases 1-4.
8. **Track acceptance criteria were not met for local file removal.** The spec required deleting IM3 `lib/activities/schemas/` and algebraic local files, but the implementation left app-level re-export shims in place.
9. **Package tests are not strong enough for the claimed acceptance criteria.** Current math-content tests cover basic happy paths but do not provide the planned dedicated schema round-trip coverage, robust edge cases, or regression checks for all migrated exports.
10. **BM2 rate-limit tests are green but invalidly shaped.** Vitest passes while Convex emits warnings that the tests directly call Convex functions instead of helper functions.

## Scope

In scope:

- Fix IM3 TypeScript errors introduced or exposed by the recent work.
- Fix BM2 TypeScript errors introduced by the new rate-limit tests.
- Commit or remove the newly referenced BM2 workspace dependencies so clean checkouts install and build.
- Replace superficial schema audit tests with executable checks that fail on reintroduced `v.any()`/untyped activity content where the spec requires typed validators.
- Either implement typed Convex validators for the claimed fields or explicitly reopen/defer the acceptance criteria in Measure artifacts.
- Fix SRS session-history pagination semantics so pagination is over completed sessions or the API clearly documents underfilled pages.
- Bring `extract-math-content-package_20260503/plan.md` into a truthful state.
- Add focused package tests for schema round trips, export-map resolution, and migrated content invariants.
- Run relevant test, lint, typecheck, and build commands and record outcomes in the plan.

Out of scope:

- New curriculum authoring.
- New activity component UI.
- Broad cleanup of unrelated dirty worktree files unless they block verification.

## Acceptance Criteria

1. `npx tsc --noEmit --project apps/integrated-math-3/tsconfig.json` passes, or every remaining error is documented as pre-existing with commit evidence.
2. `npx tsc --noEmit --project apps/bus-math-v2/tsconfig.json` passes.
3. Clean checkout dependency state is valid: every workspace package referenced by committed package manifests and lockfile exists in `HEAD`.
4. BM2 rate-limit tests call extracted handler helpers or package-level pure helpers, not Convex registered function objects.
5. The schema audit test inspects source or schema definitions instead of asserting hardcoded constants.
6. `activities.props` and `phase_sections.content` have validators aligned with the six activity schemas and known section types, or the original track is reopened with an explicit deferred task.
7. SRS session-history pagination returns the requested number of completed sessions when available, or uses a documented cursor contract with tests for active-session interleaving.
8. The math-content package has dedicated tests for all six schema parse/serialize cases, invalid cases, export entry points, problem family uniqueness, glossary helper behavior, and algebraic edge cases.
9. `measure/tracks/extract-math-content-package_20260503/plan.md` has no completed parent task with unchecked child tasks unless each unchecked child is explicitly marked skipped/deferred with rationale.
10. Relevant commands are run and recorded: math-content tests, activity-components tests/typecheck, rate-limiter tests/typecheck, IM3 schema audit test, IM3 typecheck, BM2 typecheck, root `npm run lint`, root or app build as appropriate.
