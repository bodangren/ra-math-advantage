# Implementation Plan: Repair the red math-content test suite

Track: `math-content-test-suite-repair_20260626`
Spec: see `spec.md` (Classic FR list). TDD per phase; atomic commit per task.

Baseline (2026-06-26, master `2bfddd27`):
`npm run test --prefix packages/math-content` → **17 failed / 373 passed (390)**;
6 failing files. 16 failures = `ENOENT` on archived
`im1-practice-readiness_20260609/metadata.json`; 1 = 199 families failing
`ProblemFamilyInput`.

---

## Phase 1: Decouple IM1 tests from the archived track artifact (FR-1, FR-3 partial)

- [ ] **1.1** Add a package-owned source for `verticalSliceModule` (constant or
  fixture under `src/problem-families/im1/`), with the canonical value `"1"`.
- [ ] **1.2** Replace the `readFileSync(... im1-practice-readiness_20260609 ...)`
  calls in `ci-gate.test.ts` and `coverage-matrix.test.ts` with the package-owned
  source; remove the path strings.
- [ ] **1.3** Do the same for `blueprints.test.ts`, `scaffold.test.ts`, and
  `audit-diff.test.ts`; update stale comments referencing the archived path.
- [ ] **1.4** Run `npm run test --prefix packages/math-content`; confirm the 16
  `ENOENT` failures are gone. Record the new count.

## Phase 2: Resolve the ProblemFamilyInput schema regression (FR-2)

- [ ] **2.1** Investigate `integration.test.ts`'s 199 failures: dump a sample of
  the invalid families + their validation errors; decide whether families or
  schema drifted (write findings to an `_artifacts/` note).
- [ ] **2.2** Red→Green: fix the correct side so the families validate. Do NOT
  weaken the schema or assertion. If any family is legitimately invalid, fix the
  family.
- [ ] **2.3** Confirm `integration.test.ts` passes against the real 199 families.

## Phase 3: Guard against packages → measure test coupling (FR-4)

- [ ] **3.1** Red: add a test/lint check that fails when a file under
  `packages/**/__tests__/` reads a `measure/tracks/` or `measure/archive/` path;
  prove it fails on a deliberately-coupled fixture.
- [ ] **3.2** Green: confirm the guard passes on the cleaned tree (post Phase 1).

## Phase 4: Close out (FR-3, acceptance)

- [ ] **4.1** Full green: `npm run test --prefix packages/math-content` → 0 failed.
  Record before/after evidence.
- [ ] **4.2** `npx tsc --noEmit` for the package: no new errors.
- [ ] **4.3** Verify all acceptance criteria; convert any deferred item to a
  documented tech-debt entry. Update `tracks.md`.
