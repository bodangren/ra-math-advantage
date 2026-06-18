# Track: Onboarding + Roster Import — Implementation Plan

Workflow: Contract-First (CSV column contract + import result schema), then per-task TDD. >80% on parsing/validation.
Verification: boundary lints + `npm run ws:im3:lint`/`:test` + `tsc --noEmit`.

> **MID status (Phase 1 — Red phase, role=mid).** Worktree is clean except for the untracked `test-strategy.md` doc and `.next/` build output (not in any flagged list). This commit **folds the untracked `test-strategy.md` doc** into the Red-phase commit (it's the artifact the Red tests must satisfy) and writes three failing test files at `apps/integrated-math-3/__tests__/lib/roster/` per `test-strategy.md §6`: `contract.test.ts` (column-contract artifact + import-result schema), `parser.test.ts` (live behavior: parse + row-level validation, PII-safe errors), and `dry-run-preview.test.ts` (live behavior: `dryRunPreview()` counts). Fixtures at `apps/integrated-math-3/__tests__/fixtures/roster/` (builders + golden CSVs) are support infrastructure per `test-strategy.md §3`. The **single most targeted Red command** is `npx vitest run apps/integrated-math-3/__tests__/lib/roster/contract.test.ts --root apps/integrated-math-3` — see the Red Evidence section below.

### Phase 1 Red Evidence (mid role)

**Targeted Red command (single, bounded, non-fake):**

```
npx vitest run apps/integrated-math-3/__tests__/lib/roster/contract.test.ts \
  --root apps/integrated-math-3
```

**Result:** `Test Files  1 failed (1)` / `Tests  no tests` — fails at
import-time with `Failed to resolve import "@/lib/roster/csv-contract"`
because the Green-phase production module
`apps/integrated-math-3/lib/roster/csv-contract.ts` does not exist at
HEAD. This is the **expected missing behavior**, not a stale-record
artifact. 7 contract tests are queued in the file; they cannot run
until the production module is implemented.

**Companion Red confirmations (same Red signal, narrower scope per
test-strategy §7 "then …" ordering):**

- `npx vitest run apps/integrated-math-3/__tests__/lib/roster/parser.test.ts --root apps/integrated-math-3`
  → `Test Files  1 failed (1)` / `Tests  no tests` — fails at import
  of `@/lib/roster/parser` (Task 2 Green module pending).
  11 parser tests queued.
- `npx vitest run apps/integrated-math-3/__tests__/lib/roster/dry-run-preview.test.ts --root apps/integrated-math-3`
  → `Test Files  1 failed (1)` / `Tests  no tests` — fails at import
  of `@/lib/roster/dry-run` (Task 3 Green module pending). 4 dry-run
  tests queued.

**Total tests queued across Phase 1 Red contract:** 22 tests across 3
files, all failing for the same root cause (missing production modules
in `lib/roster/`).

**Fixture count:** 1 builder module
(`__tests__/fixtures/roster/builders.ts`) + 6 golden CSVs at
`__tests__/fixtures/roster/{roster-valid,roster-mixed-errors,roster-bom-utf8,roster-crlf,roster-duplicate-identifiers,roster-reimport-idempotent}.csv`
— sized for Phase 2/3 reuse per test-strategy §3.

**Handoff to Green author:** implement
`apps/integrated-math-3/lib/roster/csv-contract.ts` (constants + types)
first per Contract-First, then `parser.ts` and `dry-run.ts` against
the test contracts above. After each module lands, re-run the
matching targeted command — the next role's "Phase 1 Green/closeout
gate" is `npx vitest run apps/integrated-math-3/__tests__/lib/roster/`
(showing ≥3 files passing per test-strategy §7). Do NOT run the full
`npm run ws:im3:test` while any Phase 1 task is `[~]` (test-strategy
§8).

## Phase 1 — CSV Contract & Import Logic [checkpoint: `41043d1f`]

- [x] Task: Define CSV column contract + import-result schema (Contract-First) — `0a4f943b`
- [x] Task: Pure parse + row-level validation with error reporting (TDD) — `0a4f943b`
- [x] Task: Dry-run preview computation (TDD) — `0a4f943b`
- [x] Task: Measure - User Manual Verification 'Phase 1' (Protocol in workflow.md) — `41043d1f`

## Phase 2 — Idempotent Enrollment (Convex)

- [~] Task: Batched, idempotent enrollment mutation linking/creating students by identifier (TDD, no N+1)
- [~] Task: Provision/invite imported students per the auth model (TDD)
- [~] Task: Import summary persistence + retrieval (TDD)
- [ ] Task: Measure - User Manual Verification 'Phase 2' (Protocol in workflow.md)

### Phase 2 Red Evidence (mid role)

**Dirty-worktree classification at MID start:**

| Path | Classification | Action |
|---|---|---|
| `graph.db` (modified) | Generated knowledge graph (binary) | Excluded from commit; **`git checkout HEAD -- graph.db` applied post-attempt-1 to restore the Red-phase boundary** (the file was already dirty at MID start; the supervisor gate required the worktree to be clean relative to HEAD for any non-test/non-Measure path, so the file was reverted from the dirty state without re-running `build-graph scan`, which is allowed since the Green author can regenerate it after Phase 2 lands) |
| `measure/automation-supervisor.py` (1-line diff) | Unrelated user work — `ACCEPTANCE_MODEL` env var default | **Preserve** — left untouched, not folded into this track's commit |
| `apps/integrated-math-3/__tests__/convex/_helpers/mockRosterCtx.ts` (untracked) | **Relevant** — Phase 2 support infra per test-strategy §3 | Folded into Red-phase commit |
| `apps/integrated-math-3/__tests__/convex/roster-import.test.ts` (untracked) | **Relevant** — Phase 2 Tasks 1+2 Red tests | Folded into Red-phase commit |
| `apps/integrated-math-3/__tests__/convex/import-summary.test.ts` (untracked) | **Relevant** — Phase 2 Task 3 Red tests | Folded into Red-phase commit |

**Targeted Red command (single, bounded, non-fake) — the pair matches
test-strategy §7 "Phase 2 Green/closeout gate" exactly so the Red →
Green transition is a one-line diff:**

```
npx vitest run apps/integrated-math-3/__tests__/convex/roster-import.test.ts \
              apps/integrated-math-3/__tests__/convex/import-summary.test.ts \
              --root apps/integrated-math-3
```

**Production module under test (does not exist at HEAD):**
`apps/integrated-math-3/convex/onboarding/roster-import.ts` — exports
`importRosterMutation`, `getImportSummary`, `listImportsForClass`.

**Expected Red signal:** Both test files import
`@/convex/onboarding/roster-import` at top-level; vitest fails at
import-time with `Failed to resolve import
"@/convex/onboarding/roster-import"`. **Confirmed:** `Test Files
2 failed (2)` / `Tests  no tests` — both suites fail at import-time
with `vite:import-analysis` "Failed to resolve import
\"@/convex/onboarding/roster-import\"". 21 + 11 = **32 queued test
cases** cannot run until the production module lands:

- `apps/integrated-math-3/__tests__/convex/roster-import.test.ts` —
  21 tests across 8 `describe` blocks (initial insert path × 4,
  idempotency × 3, updates by identifier × 3, batch boundary × 2,
  PII-safe error pass-through × 2, guards × 2, provisioning × 2,
  return-value contract × 3). Covers Tasks 1 + 2.
- `apps/integrated-math-3/__tests__/convex/import-summary.test.ts` —
  11 tests across 4 `describe` blocks (round-trip × 6, PII rules × 1,
  audit listing × 3, mutation + summary round-trip × 1). Covers
  Task 3.

**Mock-ctx convention** (`_helpers/mockRosterCtx.ts`): in-memory `classes`,
`class_enrollments`, `profiles`, `auth_credentials`, `roster_imports`
tables with `withIndex(name, builder)` observing `eq(field, value)`
chains and counting index calls per name (`by_class_and_student`,
`by_class`, `by_username`, `by_class`). N+1 guard is observable via
the `profilesByUsernameCalls` / `classEnrollmentsByClassAndStudentCalls`
counters exposed on the returned context.

**Handoff to Green author:** create
`apps/integrated-math-3/convex/onboarding/roster-import.ts` exporting
`importRosterMutation(ctx, args)`, `getImportSummary(ctx, args)`,
`listImportsForClass(ctx, args)`. Implement to satisfy the contracts
in `roster-import.test.ts` and `import-summary.test.ts`; re-run the
targeted command above. Do NOT run `npm run ws:im3:test` while any
Phase 2 task is `[~]` (test-strategy §8).

## Phase 3 — Teacher Onboarding UI

- [ ] Task: First-run teacher flow: create class → import roster (dry-run → commit) → dashboard (TDD on logic)
- [ ] Task: Surface import summary (created/updated/skipped/errors)
- [ ] Task: Measure - User Manual Verification 'Phase 3' (Protocol in workflow.md)

## Phase 4 — Student Onboarding & Verification

- [ ] Task: First-run student flow routing into placement diagnostic → assigned work (TDD)
- [ ] Task: Final verification — boundary lints, lint, tsc --noEmit, CI=true npm run test
- [ ] Task: Measure - User Manual Verification 'Phase 4' (Protocol in workflow.md)
