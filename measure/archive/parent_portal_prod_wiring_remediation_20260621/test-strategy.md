# Test Strategy — Parent Portal Production Wiring Remediation

This track closes the 2026-06-21 completion-audit finding that `parent-portal_20260605` closed against proxy/component tests while the production `/parent` route stayed a static stub with no live caller. Testing focuses on **runtime route behavior** and **non-test caller proof**, not source-shape acceptance.

## 1. Testing Pyramid

| Phase | Unit / Integration | Route / Contract | E2E / Manual |
|-------|-------------------|------------------|--------------|
| Phase 1 — Contract & Red Tests | Reuse existing parent-portal fixtures and auth/convex mocks | RTL render of the production `/parent` route against stubbed guard + Convex data; scan for non-test callers | None |
| Phase 2 — Production Wiring | Confirm guard is called; confirm `convex/parent/visualization.ts` query is wired | Route renders `ParentDashboard`, `StudentSwitcher`, and `ParentEmptyStates` from live data | None |
| Phase 3 — Verification & Closeout | Lint, typecheck, boundary lint | Full targeted suite green; archive note links the rejected closeout to this remediation | Manual spot-check of `/parent` on a running dev server |

## 2. Shared Fixtures & Mocks

- `apps/integrated-math-3/__tests__/_fixtures/parent-portal/parentClaims.ts` — parent/student/teacher/admin `SessionClaims` builders.
- `apps/integrated-math-3/__tests__/_fixtures/parent-portal/parentLinks.ts` — one-student, multi-student, revoked, and pending link lists.
- `apps/integrated-math-3/__tests__/_fixtures/parent-portal/parentProjection.ts` — schema-validated `ParentVisualizationV1` payloads plus `TEACHER_ONLY_KEYS` negative fixture.
- Per-suite `vi.mock('@/lib/auth/parent-server-guards')` and `vi.mock('@/lib/convex/server')` so the route tests exercise the real production page component against stubbed auth/data surfaces.

## 3. Cross-Phase Edge Cases & Dependencies

- The canonical page-level guard is `requireParentServerSessionClaims('/parent')` from `apps/integrated-math-3/lib/auth/parent-server-guards.ts`.
- The canonical parent link query is `internal.parent.links.listParentLinksQuery` (`convex/parent/links.ts`).
- The missing parent projection surface is `convex/parent/visualization.ts` exposing `internal.parent.visualization.projectParentVisualizationQuery`.
- Fail-closed behavior must be proved for both the guard itself (existing Phase 1 tests) and the route's use of the guard.
- Teacher-only keys (`heatmap`, `bottleneckNodes`, etc.) must never appear in route-rendered output.
- The prior track's component tests remain valuable as unit tests, but they are **not** proof of production wiring.

## 4. Architecture Guardrails

- No edits to non-test production source during the Red phase.
- `graph.db` must not be committed or re-dirtied by read-only probes; skip `build-graph` scans during Red-phase attempts.
- Parent portal UI must consume only `@math-platform/knowledge-space-practice` projection types, never raw graph modules.
- Non-test caller contract: every parent portal component/service claimed complete must have at least one import/call from a non-test production file.

## 5. Per-Phase Test Approach

- **Phase 1:** Add `__tests__/app/parent/parent-portal-prod-wiring.test.tsx` with Red route-render tests for one-student, multi-student, and no-link states; fail-closed tests for non-parent sessions and teacher-only fields; and a non-test-caller grep contract test.
- **Phase 2:** Implement the route, add `convex/parent/visualization.ts`, and re-run the same test file until green.
- **Phase 3:** Run `npx vitest run __tests__/app/parent/ __tests__/components/parent/ __tests__/convex/parent/`, `npm run ws:im3:lint`, `npm run ws:im3:typecheck`, and `node scripts/check-monorepo-boundaries.mjs`; update tracks/archive notes.

## 6. Build-Graph Findings

Build-graph probing is intentionally skipped during the Red phase to avoid the SQLite mtime/journal issue that re-dirtied `graph.db` in prior parent-portal attempts. Manually inspected surfaces at HEAD (baseline `61bc4d19`):

- `apps/integrated-math-3/app/parent/page.tsx` is a static stub; it does not call the parent guard or fetch links/projection data.
- `apps/integrated-math-3/lib/auth/parent-server-guards.ts` exports `requireParentServerSessionClaims`.
- `apps/integrated-math-3/components/parent/ParentDashboard.tsx`, `StudentSwitcher.tsx`, and `ParentEmptyStates.tsx` exist but have **zero** non-test callers.
- `convex/parent/links.ts` exports `listParentLinksQuery`; `convex/parent/visualization.ts` does not exist.
- `convex/_generated/api.d.ts` has `parent/links` but no `parent/visualization` module.

## 7. Live-Proof Plan

| Phase | Red command | Green / closeout gate |
|-------|-------------|-----------------------|
| 1 | `npx vitest run parent-portal-prod-wiring --root apps/integrated-math-3` | Same command green after Phase 2 wiring |
| 2 | Same as Phase 1 | `npx vitest run __tests__/app/parent/ __tests__/components/parent/ __tests__/convex/parent/` |
| 3 | `npm run ws:im3:lint && npm run ws:im3:typecheck` | `npx vitest run __tests__/app/parent/ __tests__/components/parent/ __tests__/convex/parent/ && node scripts/check-monorepo-boundaries.mjs` |

All commands run the real vitest binary against real source paths; no fake harnesses substitute for a gate.
