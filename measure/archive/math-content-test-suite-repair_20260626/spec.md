# Specification: Repair the red math-content test suite (2026-06-26)

## Overview

The `packages/math-content` vitest suite is **red on master**: 17 failed / 373
passed (24 files, 6 failing). The failures are **pre-existing** — they predate
the `code-review-remediation_20260624` window (the offending file was already
absent at `f2fc5fd7^`) — and are **unrelated to that track's FRs**, which are
genuinely green when run file-scoped. They were not caught because recent
per-package "tests pass" evidence was gathered by running specific FR test files
rather than the whole package suite.

This is a **bug remediation** track using the Classic FR list format. Its goal
is to get `npm run test --prefix packages/math-content` to green and to remove
the structural coupling that made the suite fragile, so the package suite can be
used as a real gate going forward.

## Root-cause buckets

**Bucket 1 — filesystem coupling to an archived track (16 of 17 failures).**
Five IM1 problem-family test files `readFileSync` a hardcoded path:
`measure/tracks/im1-practice-readiness_20260609/metadata.json`. That track was
archived to `measure/archive/im1-practice-readiness_20260609/`, so the path now
404s with `ENOENT`. Affected files:
- `src/problem-families/im1/__tests__/ci-gate.test.ts` (line ~86)
- `src/problem-families/im1/__tests__/coverage-matrix.test.ts` (lines ~300, ~314)
- `src/problem-families/im1/__tests__/blueprints.test.ts`
- `src/problem-families/im1/__tests__/scaffold.test.ts`
- `src/problem-families/im1/__tests__/audit-diff.test.ts`

The only datum these tests need from that file is
`verticalSliceModule: "1"` (still present in the archived copy). The deeper
defect is architectural: a `packages/` test must not depend on a `measure/`
track artifact — that violates the package-boundary rule (packages must not
import app/measure context) and guarantees the suite breaks on the next archive.

**Bucket 2 — genuine schema regression (1 of 17 failures).**
`src/__tests__/integration.test.ts` → *"every problem family validates against
`ProblemFamilyInput` schema"* fails with `expected [Array(199)] to deeply equal
[]` — i.e. 199 problem families currently fail `ProblemFamilyInput` validation.
This is a real content/schema drift, not a moved file, and needs investigation
to determine whether the families or the schema regressed.

## Functional Requirements

**FR-1 — Decouple IM1 problem-family tests from the archived track artifact.**
Remove every `readFileSync` of
`measure/tracks/im1-practice-readiness_20260609/metadata.json` from the five
affected test files. Replace the dependency with a package-owned source of the
`verticalSliceModule` value (e.g. a constant/fixture exported from
`packages/math-content/src/problem-families/im1/`), so the tests assert against
data the package owns. No `packages/` test may read from `measure/` after this
FR. Update the stale comments that reference the archived track path.

**FR-2 — Resolve the 199 `ProblemFamilyInput` validation failures.**
Investigate `integration.test.ts`'s schema check. Determine whether the problem
families drifted out of spec or `ProblemFamilyInput` tightened. Fix the correct
side so the families validate (or, if a family is legitimately invalid, correct
the family). The test must pass against real data — do not weaken the schema or
the assertion to force green.

**FR-3 — Make the full package suite the gate.**
After FR-1/FR-2, `npm run test --prefix packages/math-content` must pass with
zero failures. Record the before/after counts as Green evidence.

**FR-4 — Add a guard against `packages/ → measure/` test coupling.**
Add a cheap check (lint rule or test) that fails if any file under
`packages/**/__tests__/` reads a path under `measure/tracks/` or
`measure/archive/`. This prevents the Bucket-1 class from recurring.

## Non-Functional Requirements

- TDD: each fix lands as a failing test (Red) first where applicable, then the
  fix (Green), per the project workflow.
- No weakening of assertions to force green (FR-2 especially).
- `npx tsc --noEmit` introduces no new type errors in `packages/math-content`
  (pre-existing standalone-red baseline noted in tech-debt is out of scope
  except where these FRs touch it).

## Acceptance Criteria

1. No file under `packages/math-content/**/__tests__/` references
   `measure/tracks/im1-practice-readiness_20260609` (or any `measure/tracks/` /
   `measure/archive/` path).
2. `npm run test --prefix packages/math-content` passes: 0 failed.
3. The `integration.test.ts` problem-family schema test passes against the real
   199 families (no schema/assertion weakening).
4. A guard fails on a deliberately-coupled fixture test that reads a
   `measure/` path, and passes on the clean tree.
5. Every FR is implemented or explicitly converted to a documented tech-debt
   entry with rationale (no silent drops).

## Out of Scope

- The pre-existing `math-content` standalone `tsc --noEmit` baseline (tracked in
  tech-debt), except where FR work touches it.
- Re-opening or un-archiving `im1-practice-readiness_20260609`; this track does
  not resume that work, it only decouples the tests left behind.
- Broadening IM1 generator/blueprint coverage.
