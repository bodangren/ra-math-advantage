# Test Strategy — Onboarding + Roster Import

Track: `onboarding-roster-import_20260605` · App: `apps/integrated-math-3` · Tech Lead notes for the implementer.

## 1. Build-Graph Findings That Shaped This Strategy

- `build-graph stats` (fresh, today): IM3 = 539 files; tests live under `apps/integrated-math-3/__tests__/**` with vitest+jsdom (`vitest.config.ts:14`).
- `build-graph search onboard` → **0 hits**; `search roster` → 0 hits; `search inviteStudent` → 0 hits ⇒ this track is **net-new code**, no caller blast radius from the track itself.
- Schema seam already exists: `convex/schema.ts:251` `classes`, `:262` `class_enrollments` (with `by_class_and_student` index used for idempotency), `:240` `users`. No schema changes expected by spec.
- Placement integration seam: `apps/integrated-math-3/lib/placement/placement-flow.ts` exposes `runNewStudentPlacementFlow` + `PlacementFlowInput/Outcome` (build-graph `inspect`); existing tests in `__tests__/lib/placement/placement-flow.test.ts` and `__tests__/convex/placement.test.ts` define the **mock-ctx** convention we must reuse.
- Convex test convention: mock-`ctx` pattern (see `__tests__/convex/placement.test.ts` header, `study.test.ts`, `dev.test.ts`); **no `convex-test` live harness wired in IM3**, so all Convex coverage must use mock-ctx + a small in-memory db helper (Phase 2).
- Existing CSV utilities (`packages/teacher-reporting-core/.../gradebook-export.ts`, `apps/integrated-math-3/lib/teacher/data-export.ts`) only **emit** CSV; no parser exists. Build a fresh parser; reuse `escapeCsvField` only as reference for quoting rules.

## 2. Pyramid Per Phase

| Phase | Unit (≥80%) | Component (jsdom) | Convex mock-ctx | E2E/manual |
|------|---|---|---|---|
| 1 CSV contract & parsing | **bulk** — pure parser, validators, dry-run | — | — | — |
| 2 Idempotent enrollment | helpers (id-resolution, batching) | — | **bulk** — mutation/query handlers | — |
| 3 Teacher onboarding UI | presentation helpers | **bulk** — wizard steps, summary table | mocked via `vi.mock('convex/react')` | manual §11 plan.md |
| 4 Student onboarding & verification | flow router (pure) | first-run gate | placement-routing handler | manual + full gate |

## 3. Shared Fixtures & Mocks (create once, reuse)

- `__tests__/fixtures/roster/` — golden CSVs: `roster-valid.csv`, `roster-mixed-errors.csv`, `roster-bom-utf8.csv`, `roster-crlf.csv`, `roster-duplicate-identifiers.csv`, `roster-reimport-idempotent.csv`. Used by Phases 1, 2, 3.
- `__tests__/fixtures/roster/builders.ts` — factory `makeRosterRow({ identifier, email, name, section })`; `makeImportResult(...)` per the result schema. Phases 1–3.
- `__tests__/convex/_helpers/mockCtx.ts` (extend pattern from `placement.test.ts` mock ctx) with an in-memory `class_enrollments` table supporting `by_class_and_student` lookups. Phase 2 only; do **not** reach into Convex internals.
- `vi.mock('convex/react')` mocks for `useMutation`/`useQuery` in Phase 3 — match the conventions already in `__tests__/components/teacher/**`.

## 4. Cross-Phase Edge Cases & Dependencies

1. **Identifier semantics** must be locked in Phase 1's contract test (email vs SIS-id precedence) and re-asserted in Phase 2's idempotency test — same column contract artifact.
2. **PII safety** (NFR): every error path test in Phases 1 & 2 asserts the error payload contains row index/column **but not the raw email or full name**.
3. **Idempotency proof** spans Phase 1 (same parsed result twice) and Phase 2 (re-running mutation produces 0 inserts, N updates with `by_class_and_student`); both share `roster-reimport-idempotent.csv`.
4. **Placement seeding** (FR4 / AC3) couples Phase 4 router to existing `runNewStudentPlacementFlow`; test must use the existing flow's public types — no parallel implementation.
5. **N+1 guard**: Phase 2 must include a counter assertion on the mock-ctx `db.insert`/`db.patch` call counts (≤ constant per batch, not per row).

## 5. Architecture Guardrails

- Tests live in `apps/integrated-math-3/__tests__/**`; **never** import from `convex/_generated/` outside types — use `import type { Id } from '@/convex/_generated/dataModel'` only.
- No new top-level dep without spec update; CSV parsing must use a function in `apps/integrated-math-3/lib/roster/` (pure module, no Convex/React imports). Boundary lints (`npm run ws:im3:lint`) enforce this.
- Convex handlers under `apps/integrated-math-3/convex/onboarding/` (or `convex/roster/`) — new files only; do not modify `convex/teacher/lessonAssignment.ts`.
- All new exported symbols get a build-graph `inspect` in the implementer's commit note (Per-Task Graph Protocol).
- Component tests use existing `vitest.setup.ts`; no new global setup files.

## 6. Per-Phase Test Approach

**Phase 1 — CSV Contract & Import Logic (pure).** Contract-First: write `__tests__/lib/roster/contract.test.ts` asserting the column-contract artifact (header names, required vs optional, identifier precedence) **before** any parser code. Then row-level validators (good row, missing required, malformed email, duplicate identifier within file, BOM/CRLF tolerance) and a `dryRunPreview()` test that returns counts {created/updated/skipped/errors} from a parsed file alone (no Convex).

**Phase 2 — Idempotent Enrollment (Convex mock-ctx).** TDD per handler: `importRosterMutation` (insert path), re-run on identical input (zero new inserts via `by_class_and_student`), updates-by-identifier path, batch boundary (≥51 rows in one call → still ≤constant index lookups), error pass-through preserves PII rules. `getImportSummary` query round-trips the persisted result.

**Phase 3 — Teacher Onboarding UI.** jsdom component tests for: (a) wizard step progression create-class → upload → preview → commit, (b) preview renders dry-run counts and per-row errors with row numbers, (c) commit disabled while errors present, (d) summary view reads `getImportSummary`. Mock all Convex hooks; no real network.

**Phase 4 — Student Onboarding & Verification.** Pure flow-router test: new student with no placement → `runNewStudentPlacementFlow` invoked once; returning student → bypass. Then a final-verification task that runs the full gate (see §7).

## 7. Live-Proof Plan (Red command + Green/closeout gate per phase)

| Phase | Targeted Red command (single failing file) | Green/closeout gate (bounded, non-fake) |
|------|---|---|
| 1 | `npx vitest run __tests__/lib/roster/contract.test.ts` (then `__tests__/lib/roster/parser.test.ts`, `dry-run-preview.test.ts`) | `npx vitest run __tests__/lib/roster/` — **bounded directory glob**, must show ≥3 files passing. |
| 2 | `npx vitest run __tests__/convex/roster-import.test.ts` | `npx vitest run __tests__/convex/roster-import.test.ts __tests__/convex/import-summary.test.ts` then `npm run ws:im3:typecheck`. |
| 3 | `npx vitest run __tests__/components/teacher/onboarding/RosterImportWizard.test.tsx` | `npx vitest run __tests__/components/teacher/onboarding/` (directory glob). |
| 4 | `npx vitest run __tests__/lib/onboarding/student-flow.test.ts` | **Final gate (closeout):** `npm run ws:im3:lint && npm run ws:im3:typecheck && CI=true npm run ws:im3:test`. |

**Fake-harness rule:** Phase 2's `mockCtx.ts` is plumbing only — every production handler it covers must additionally have its **command-construction proof** asserted in Phase 4's final `CI=true npm run ws:im3:test` (full IM3 suite); the per-phase directory globs above prevent earlier phases from silently passing because the suite was never broadened.

**Artifact vs live behavior.** Phase 1 contract test (`contract.test.ts`) is an **artifact/documentation contract test** — it pins the CSV column shape and import-result schema; it does not prove parser behavior. The parser, validators, dry-run, mutations, components, and student-flow tests prove **live behavior** by executing real code paths against fixtures or mock-ctx in-memory state.

## 8. Intentionally-Red Files & Aggregate Suite Discovery

When a task is `[~]`, its Red test file **will** be picked up by `__tests__/**/*.test.{ts,tsx}` (vitest include in `vitest.config.ts:14`). Rule for the implementer: **do not run `npm run ws:im3:test` while any Phase task is `[~]`** — use only the targeted Red command in §7 until the matching task is `[x]`. Do not add `.skip` or per-file `vitest.skip` to suppress Red files; ownership is via plan-task status. Existing `it.skip` lines in `__tests__/lib/activities/algebraic/equivalence.test.ts` and `__tests__/convex/seed/seed-demo-e2e.test.ts` are pre-existing and unrelated to this track — leave them. The Phase 4 closeout `CI=true npm run ws:im3:test` is the first time the full aggregate suite must be green.
