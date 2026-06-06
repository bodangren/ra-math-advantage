# Test Strategy — Data Export Teacher UI

Track: `data-export-teacher-ui_20260605` · Role: Tech Lead · App: integrated-math-3
Verification gates: `npm run ws:im3:lint`, `npm run ws:im3:test`, `npx tsc --noEmit`.

## 1. Testing Pyramid by Phase

| Phase | Unit (vitest, pure) | Integration (vitest + Convex mock ctx) | Component (vitest + RTL) | Snapshot |
|------|--------------------:|---------------------------------------:|-------------------------:|---------:|
| P1 Helpers & Mapping | 70% | 20% | — | 10% |
| P2 Export Panel UI | 30% | 10% | 55% | 5% |
| P3 Authorization | 25% | 65% | 10% | — |

Target: >80% coverage on **new** helpers (filename builder, scope→query mapping, public query wrappers). Existing `toCsv`/`escapeCsvField`/`buildGradebookCsv` are already covered — re-use, do not re-test.

## 2. Shared Fixtures & Mocks

Create one fixture module under `apps/integrated-math-3/__tests__/fixtures/exports/`:

- `studentExportFixture.ts` — sample `StudentExportData` (3 lessons, mix of null `activityScore`/`lastActive`, comma & quote in `studentName`).
- `classExportFixture.ts` — sample `ClassExportRow[]` (2 students, one with `averageScore: null`).
- `submissionExportFixture.ts` — sample `SubmissionExportRow[]` straddling `hasMore` boundary (limit + 1 rows).
- `convexMockCtx.ts` — extend the existing `makeTeacherSrsMockCtx` pattern (`__tests__/convex/teacher/srs-dashboard.test.ts`) for `getStudentExportHandler` / `getClassExportHandler` / `getSubmissionExportHandler`.

Browser-only deps mocked once in `__tests__/setup/browserDownloadMock.ts`: `URL.createObjectURL`, `URL.revokeObjectURL`, `Blob`, `HTMLAnchorElement.prototype.click`. Mirror the approach implied by `downloadGradebookCsv` in `lib/teacher/gradebook-export.ts:5`.

## 3. Cross-Phase Edge Cases & Dependencies

- **Empty datasets** — `toCsv([])` returns `""` (verified in `data-export.test.ts:?`). P1 mapping helpers must preserve this so P2 can render the empty state without calling download.
- **Escaping parity (AC2)** — UI **must not** re-implement escaping. Snapshot the filename + first 3 rows from each dataset against `toCsv(formatXExport(fixture))` to lock in column order and escaping. If P1 changes column order, P2 snapshot fails — intentional coupling.
- **`null` numerics** — `activityScore`/`averageScore` map to `""` (not `0`); `overallProgress` maps to `0`. Test both branches in P1.
- **Date range round-tripping** — UI sends `startDate`/`endDate` as ms epoch; `filterByDateRange` (`convex/exports.ts:47`) is inclusive on both ends. Boundary test at exact `startDate` and exact `endDate`.
- **Submission pagination** — `getSubmissionExportHandler` returns `hasMore: true` at `limit + 1`. P2 large-state copy must reflect this; P3 authorization test must run on a multi-class fixture to prove the limit applies *after* scoping, not before.
- **Filename safety** — class names may contain `/`, spaces, unicode. Filename builder must sanitize (`/` → `-`, collapse whitespace) and remain deterministic given `{class, dataset, date}`.
- **Role gate vs class gate (FR6)** — these are two failures: not-a-teacher (401) ≠ teacher-but-not-owner (403). Test both in P3.

## 4. Architecture Guardrails

- **No new business logic in UI.** Components import from `lib/teacher/data-export.ts`, `lib/teacher/gradebook-export.ts`, and `@math-platform/teacher-reporting-core` only. ESLint boundary: no `lib/teacher/` import from `convex/`.
- **Public query wrappers required.** All three handlers are currently `internalQuery` (`convex/exports.ts:192,333,442`) with **zero callers** (graph confirms). Track must add `query({...})` wrappers that call `validateTeacherOwnsClass` (`convex/teacher/lessonAssignment.ts`) **before** the handler. Do not call the `internal*` handlers from the client.
- **Reuse `validateTeacherOwnsClass`** for class/submission scopes; reuse `getStudentInTeacherOrg` (`convex/auth.ts`) for the student scope. Do not invent a new guard.
- **Pure helpers stay pure.** Filename builder and scope→query mapping take primitives + return primitives — no `Date.now()`, no `crypto`, inject clock/uuid if needed.
- **Client-side download only** (FR4). No server file storage, no Convex action that returns a blob URL.

## 5. Per-Phase Test Approach Notes

**Phase 1 — Helpers & Scope Mapping**
- Red-first: write `filename-builder.test.ts` (sanitization, date format `YYYY-MM-DD`, extension by format) and `scope-mapping.test.ts` (each dataset → correct query ref + arg shape) before code.
- Snapshot `toCsv(formatStudentExport(fixture))` and `toCsv(formatClassExport(fixture))` to lock the FR3 contract.
- Pure-function only — no React, no Convex, no DOM.

**Phase 2 — Export Panel UI**
- RTL: render panel, assert dataset/scope/format controls have labels (a11y), assert disabled state until valid scope chosen.
- Mock Convex `useQuery`/`useAction` via `convex/react` testing utility. Verify empty (`rows.length === 0`), large (`hasMore: true`), and error states render distinct copy.
- Download wiring: spy on `URL.createObjectURL`; assert filename matches builder output. **Do not** assert CSV bytes here — that is P1's snapshot.
- Role gate: render with non-teacher session → panel returns `null` / forbidden notice.

**Phase 3 — Authorization & Verification**
- Convex handler tests with mock `ctx`: teacher-of-class succeeds; teacher-not-of-class throws (assert exact error code, not message); unauthenticated throws.
- Cross-class denial: build a fixture with 2 classes, request export for class B as teacher of class A → must throw before any DB read of class B (assert via `ctx.db.get` spy call count).
- Run full gate: `npm run ws:im3:lint && CI=true npm run ws:im3:test && npx tsc --noEmit`.

## 6. Build-Graph Findings That Shaped This Strategy

- `build-graph stats` → IM3 has 501 files; export surface is small and isolated to `apps/integrated-math-3/{convex/exports.ts, lib/teacher/, components/teacher/}`.
- `build-graph inspect getClassExportHandler` / `getStudentExportHandler` → **0 incoming `references`/`calls` edges**. Adding the public wrappers is purely **additive** (blast radius = 0); no existing caller can break.
- `build-graph inspect downloadGradebookCsv` & `GradebookExportButton` → 24-line component already encodes the client-download recipe; reuse this shape verbatim in the new panel to keep one mock setup.
- `build-graph search "teacher"` (convex/) → `validateTeacherOwnsClass` already exists in `convex/teacher/lessonAssignment.ts` and is the canonical class-ownership guard; no new guard required (satisfies FR6 + NFR "no new export business logic").
- `build-graph search "csv"` → exactly one IM3 escape implementation (`escapeCsvField` at `lib/teacher/data-export.ts:1`). Locks AC2: snapshot tests reference this single source of truth.
- Existing test patterns (`data-export.test.ts` 206 LOC, `gradebook-export.test.ts` 120 LOC, `srs-dashboard.test.ts` mock ctx) → reuse style and `makeTeacherSrsMockCtx` factory; do not introduce a new mocking library.
