# Parent Portal — Test Strategy

Tech Lead pre-implementation guidance. Boundary rule: consume `parentVisualizationV1Schema` payloads only; never reach into the raw graph or teacher projection. Live behavior is proved through **app-local vitest** (`__tests__/**/*.test.{ts,tsx}`); the runner is `npm run ws:im3:test` (alias for `vitest run` inside `apps/integrated-math-3`). `npm run ws:im3:lint` runs ESLint; `npm run ws:im3:typecheck` runs `tsc --noEmit`. `node scripts/check-monorepo-boundaries.mjs` enforces package→app import bans.

## 1. Testing Pyramid Per Phase

| Phase | Unit (≥70%) | Integration (~25%) | E2E / Manual (~5%) |
|-------|-------------|--------------------|--------------------|
| 1 — Role/Auth/Linking | `UserRole` widening; `requireServerRoles(['parent'])`; linking mutation/revoke logic; fail-closed query guards | Convex query×session-claim×link-table fixture; API route 401/403 behavior | Manual Verification (link, revoke, deny) |
| 2 — Progress View | Pure render of `ParentVisualizationV1` payload; multi-student switcher reducer; privacy assertions (no teacher fields, no other-student leakage) | Page-level RTL render against `parentVisualizationV1Schema.parse(...)` fixtures; switcher integration | Manual Verification (multi-student, payload fidelity) |
| 3 — States & Verification | Empty/pending state branches; pre-link/no-activity guards | Aggregate gates: lint, typecheck, boundary, full vitest | Manual Verification (a11y, responsive, full flow) |

## 2. Shared Test Fixtures & Mocks

Live in `apps/integrated-math-3/__tests__/_fixtures/parent-portal/`:

- `parentClaims.ts` — `SessionClaims` builder with `role: 'parent'` (also `student`, `teacher` for negative tests).
- `parentLinks.ts` — `(parentId, studentId, status: 'active'|'revoked')` factory.
- `parentProjection.ts` — minimal **and** rich `ParentVisualizationV1` objects, every one **must** pass `parentVisualizationV1Schema.parse()` at fixture-load time (guards against drift).
- `convexMocks.ts` — `mockFetchInternalQuery` returning typed payloads, mirroring the pattern in `__tests__/lib/auth/server-guards.test.ts`.
- `mockProjectParentVisualization.ts` — vi.mock wrapper around `@math-platform/knowledge-space-practice` so tests do not require a full graph build.

No global mocks in `vitest.setup.ts` — keep mocks per-suite to avoid cross-test bleed.

## 3. Cross-Phase Edge Cases & Dependencies

- **Role widening blast radius:** `UserRole = 'student' | 'teacher' | 'admin'` (`packages/core-auth/src/session.ts:3`) is also used by `apps/bus-math-v2`. Phase 1 task 1 must add `'parent'` and run `ws:bm2:typecheck` to prove no exhaustive-switch regression. Treat as **High** caller-update risk.
- **Linking revocation race:** revoking mid-render must surface `pending` state, not stale data — covered Phase 2 + Phase 3.
- **Privacy invariant:** assertions in every Phase-2 view test that the rendered DOM/JSON contains **none** of `teacherVisualizationV1Schema` field names and **no** non-linked student IDs.
- **Empty vs pending vs revoked:** three distinct states; share fixtures, separate snapshots.
- **`projectParentVisualization` has 0 current callers** — Phase 2 introduces the first consumer; signature changes there are additive-only, otherwise update knowledge-space-practice tests in lockstep.

## 4. Architecture Guardrails

- **Boundary lint** (`scripts/check-monorepo-boundaries.mjs`) — must stay green; no `from 'apps/...'` in packages, no `convex/_generated` in packages.
- **Projection consumption only** — UI must import from `@math-platform/knowledge-space-practice` projection types, never from raw graph modules. Add a lint-grep test in Phase 2 that scans `apps/integrated-math-3/app/parent/**` and `components/parent/**` for forbidden imports (`packages/knowledge-space-core/src/(?!projections)`).
- **Read-only contract** — no Convex `mutation` exports under `convex/parent/` other than link/revoke flows. Add a Phase 3 contract test that enumerates exports.
- **Fail-closed default** — every parent-scoped query/route must require `requireServerRoles(claims, ['parent'])` AND verify the requested `studentId` appears in active links. Cover both branches per query.

## 5. Per-Phase Test Approach Notes

- **Phase 1.1 (role + guards):** TDD — start with a `UserRole` exhaustive-check test, then guard tests mirroring `__tests__/lib/auth/server-guards.test.ts`. Add fail-closed query test (parent requesting non-linked student → null/forbidden, never the data).
- **Phase 1.2 (linking):** mutation tests for create/revoke; idempotency; teacher-initiated path uses `requireServerRoles(['teacher','admin'])`.
- **Phase 2.1 (render):** RTL tests with schema-validated fixtures; assert plain-language summary fields render; assert no teacher fields present.
- **Phase 2.2 (switcher):** behavior test that switching does not refetch teacher data; URL/state sync.
- **Phase 2.3 (privacy):** snapshot of rendered JSON serializes **no** keys from `teacherVisualizationV1Schema`; cross-student isolation test.
- **Phase 3.1 (states):** branch tests for `links.length === 0`, `links[0].status === 'pending'`, projection nodes empty.
- **Phase 3.2 (gates):** see §7 closeout.

## 6. Build-Graph Findings That Shaped This Strategy

Graph stats: 14182 nodes / 20676 edges; `graph.db` mtime 2026-06-19 (~12h, fresh). Findings:

- `function:projectParentVisualization` (`packages/knowledge-space-practice/src/projections/visualization.ts:208–280`) exists and is **exported with 0 incoming `references` edges** → safe to add the first caller without breaking anyone.
- `parentVisualizationV1Schema` fields confirmed: `schemaVersion`, `nodes`, `canDoSummary`, `nextFocus`, `blockers`, `progressTrend` — fixtures must hit all six.
- `function:requireServerRoles` exists in both `apps/integrated-math-3/lib/auth/server.ts` and `apps/bus-math-v2/lib/auth/server.ts` — Phase 1 widening of `UserRole` impacts **both apps**; mitigation = run `ws:bm2:typecheck` as a Phase-1 cross-app gate.
- `search parent` returned **zero existing parent-portal source/test files in IM3** → no intentionally-red predecessors; new test files are owned entirely by their tasks. No exclusion rules required.
- No `parent` role usage in `convex/auth.ts` or any IM3 query → all parent-scoped Convex code is greenfield (Phase 1 owns it).

## 7. Live-Proof Plan (Per Phase)

These are the **exact commands** that prove behavior. Artifact/contract checks (boundary lint, schema-shape tests, export enumeration) are explicitly tagged **[CONTRACT]**; live-behavior tests are **[LIVE]**. Fake harnesses are forbidden for any gate listed below — every command runs the real vitest binary against a real test file path.

| Phase | Red command (one failing test, narrowly scoped) | Green / closeout gate |
|-------|--------------------------------------------------|------------------------|
| 1 | **[LIVE]** `npm run ws:im3:test -- __tests__/lib/auth/parent-role-guard.test.ts` (single file, must fail before code) | **[LIVE]** `npm run ws:im3:test -- __tests__/lib/auth __tests__/convex/parent` + **[CONTRACT]** `npm run ws:im3:typecheck` + `npm run ws:bm2:typecheck` + `node scripts/check-monorepo-boundaries.mjs` |
| 2 | **[LIVE]** `npm run ws:im3:test -- __tests__/components/parent/ParentDashboard.test.tsx` (single file) | **[LIVE]** `npm run ws:im3:test -- __tests__/components/parent __tests__/app/parent` + **[CONTRACT]** boundary lint + projection-import grep test |
| 3 | **[LIVE]** `npm run ws:im3:test -- __tests__/components/parent/ParentEmptyStates.test.tsx` (single file) | **[LIVE+CONTRACT]** `npm run ws:im3:lint && npm run ws:im3:typecheck && CI=true npm run ws:im3:test && node scripts/check-monorepo-boundaries.mjs` |

**Bounded smoke vs full suite:** every Red command above targets a single explicit file path; vitest's `include` pattern in `vitest.config.ts` means a stray un-pathed invocation could pull the whole suite, so each Red task must use the explicit path form. Closeout gates intentionally widen to directory paths, then the Phase-3 final gate runs the full suite — that is the **only** sanctioned full-suite invocation, and it must arrive green (no `[~]` tasks left red). Any test added in a still-`[~]` task must live under the path that task owns (`__tests__/lib/auth/parent-*`, `__tests__/components/parent/*`, etc.) so a green directory implies a green task.

**No fake harnesses** are required for Phase 1–3; production gates are bounded vitest invocations against real source. If a future task introduces a fake (e.g., a stub Convex client), it must be scoped to `__tests__/_fixtures/` and never substitute for a gate command.
