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

## Phase 1 — CSV Contract & Import Logic

- [~] Task: Define CSV column contract + import-result schema (Contract-First)
- [~] Task: Pure parse + row-level validation with error reporting (TDD)
- [~] Task: Dry-run preview computation (TDD)
- [ ] Task: Measure - User Manual Verification 'Phase 1' (Protocol in workflow.md)

## Phase 2 — Idempotent Enrollment (Convex)

- [ ] Task: Batched, idempotent enrollment mutation linking/creating students by identifier (TDD, no N+1)
- [ ] Task: Provision/invite imported students per the auth model (TDD)
- [ ] Task: Import summary persistence + retrieval (TDD)
- [ ] Task: Measure - User Manual Verification 'Phase 2' (Protocol in workflow.md)

## Phase 3 — Teacher Onboarding UI

- [ ] Task: First-run teacher flow: create class → import roster (dry-run → commit) → dashboard (TDD on logic)
- [ ] Task: Surface import summary (created/updated/skipped/errors)
- [ ] Task: Measure - User Manual Verification 'Phase 3' (Protocol in workflow.md)

## Phase 4 — Student Onboarding & Verification

- [ ] Task: First-run student flow routing into placement diagnostic → assigned work (TDD)
- [ ] Task: Final verification — boundary lints, lint, tsc --noEmit, CI=true npm run test
- [ ] Task: Measure - User Manual Verification 'Phase 4' (Protocol in workflow.md)
