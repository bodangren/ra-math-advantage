# Test Strategy — Primitive Layer Contract (T0)

Tech-lead test plan for `primitive-layer-contract_20260615`. Pairs with `spec.md` and `plan.md`.
This is a contract-only track: **the only live behavior under test is `CoordinatePlane`**;
everything else is artifact/structural verification or doc contract.

## 1. Testing Pyramid (per phase)

| Phase | Layer | What dominates |
|------|------|----------------|
| 1 — Contract & Schema | **Compile-time** (tsc) + doc contract | `MathPrimitiveProps<TValue>` exported & typecheck-green; doc sections present (no runtime tests yet). |
| 2 — Test (Red) | **Unit (RTL/jsdom)** + **Static-scan** | One controlled-component contract test for `CoordinatePlane`; one filesystem-scanning boundary test (it/o). No integration/e2e. |
| 3 — Implement (Green) | Unit + Regression | Same Phase-2 tests pass; **all 5 existing activity-components suites stay green unchanged**. |
| 4 — Docs & Doctor | Static / artifact | tracks.md grep-style assertions (manual or measure doctor); full quality-gate pass. |

No e2e, no integration tests. The track is intentionally a thin contract seam.

## 2. Shared Fixtures & Mocks

- **No new shared fixtures.** Reuse `@testing-library/react` + jsdom env from `vitest.config.ts`.
- `CoordinatePlane` test must NOT mock `GraphingCanvas`; render the real wrapped component
  so wiring (`readonly`, `onPointAdd`, `onPointRemove(label)`) is exercised end-to-end inside
  the package boundary. Mocking `GraphingCanvas` would defeat FR-4's "prove the seam" goal.
- Boundary test reuses the precedent at
  `packages/knowledge-space-core/src/__tests__/boundary.test.ts` — copy the
  `collectTsFiles` / `checkImports` helpers verbatim and swap the forbidden-pattern list
  to: `apps/`, `convex/_generated/`, `lib/practice`, and `practice` envelope `contract`
  imports (per spec FR-7).
- The boundary test's "planted bad import" sub-case is **inline string fixture only**
  (positive/negative `checkImports()` calls) — never a real planted file on disk, which
  would leak into other suites.

## 3. Cross-Phase Edge Cases & Dependencies

- **Controlled-component invariants** (must hold across all interaction states):
  - `mode` omitted ⇒ behaves as `'interactive'` (FR-2 default).
  - `mode === 'readonly' | 'static'` **or** `disabled === true` ⇒ `onChange` never fires
    even on synthetic add/remove events. Test via spy + simulated click on canvas.
  - `onChange` absent (uncontrolled-style usage) ⇒ no throw; no internal state mutation.
- **`GraphingCanvas` removal semantics**: `onPointRemove` receives a `label` string, not a
  `Point`. `CoordinatePlane`'s `onChange` must filter `value.points` by the label-matching
  identity used by `GraphingCanvas` (lines 92–95 / 152–156 of `GraphingCanvas.tsx`).
  Spec FR-4 wording (`pt !== p`) is approximate — test against the **actual** label-based
  contract, not the spec snippet.
- **Phase 1 → Phase 2 dependency**: Phase-2 contract test imports
  `MathPrimitiveProps` and `CoordinatePlane` from the package root; if Phase 1 forgets the
  root re-export the test fails with a module-resolution error rather than an assertion —
  treat that as a contract-test failure, not infra noise.
- **No regressions**: `components.test.tsx`, `registry.test.ts`, `renderer.test.tsx`,
  `schemas.test.ts`, `types.test.ts` must remain byte-identical (verified by `git diff`).

## 4. Architecture Guardrails

- `primitives/` is **leaf**: it imports only from `./types`, sibling primitives, and
  existing `components/graphing/GraphingCanvas` (re-export). No `apps/`, no
  `convex/_generated/`, no `lib/practice`, no `practice.v1` envelope. Enforced by FR-7
  boundary test.
- No edits to `GraphingCanvas.tsx`, `GraphingExplorer.tsx`, `GraphingExplorerActivity.tsx`
  or any test file under existing component dirs (verified by review-time `git diff`).
- Package root `index.ts` is the only sanctioned barrel edit; subdir `primitives/index.ts`
  re-exports types + each primitive subdir barrel only.
- `CoordinatePlane` is **controlled**: no `useState` for `value` — only transient UI state
  (cursor, hover) is permitted. Reviewer spot-checks at green.

## 5. Per-Phase Test Approach

- **Phase 1**: Author types + barrel; rely on `tsc --noEmit` as the test. Doc edits land
  here so the consumption example in the contract compiles against the (still absent)
  `CoordinatePlane` only as prose; type imports inside fenced code blocks are not executed.
- **Phase 2 (Red)**: Author `coordinate-plane.test.tsx` and `boundary.test.ts`. Confirm
  `coordinate-plane.test.tsx` fails (`Cannot find module .../CoordinatePlane`). Confirm
  `boundary.test.ts` passes vacuously, then plant-and-revert a bad import to prove the
  scanner catches it (in-line string fixture only).
- **Phase 3 (Green)**: Implement `CoordinatePlane.tsx` + subdir barrel; both new tests go
  green; existing 5 suites stay green. Run `npx tsc --noEmit` and `npm run lint` from repo
  root and from `packages/activity-components`.
- **Phase 4**: `tracks.md` text edits validated by reading the file (no automated test);
  rerun all gates as the closeout proof.

## 6. Build-Graph Findings That Shaped This Strategy

- `build-graph stats`: 14179 nodes, 20673 edges, graph fresh (~13 min old). 38 files in
  `activity-components` — small surface, justifies a single new contract test rather than
  a parameterized matrix.
- `build-graph search GraphingCanvas`: 3 distinct `GraphingCanvas` symbols across
  `packages/activity-components`, `apps/bus-math-v2`, and `apps/integrated-math-3`
  (test-only). T0 must wrap **only** the `packages/activity-components` one — confirmed by
  spec FR-4 path. Bus-math-v2's copy is out of scope.
- `build-graph callers` for the package's `GraphingCanvas` returned *no in-graph callers*
  even though `GraphingExplorer.tsx` imports it (lines 4, 419, 485). The graph under-counts
  intra-package JSX `renders` edges here — **do not rely on the graph alone** to prove
  "no consumer change"; supplement with a `git diff --stat` review gate in Phase 3.
- No existing symbol named `MathPrimitiveProps` / `PrimitiveMode` / `CoordinatePlane`
  (graph search empty) — zero collision risk in package-root re-exports.
- Boundary precedent (`knowledge-space-core/.../boundary.test.ts`, 130 lines) is the only
  filesystem-scanning test in the repo — copy its structure exactly to keep the precedent
  uniform.

## 7. Live-Proof Plan (Red command → Green/closeout gate)

All commands run from `packages/activity-components/` unless noted. `CI=true` keeps vitest
in single-run mode.

| Phase | Targeted Red command (must FAIL before impl) | Green/closeout gate (must PASS at done) |
|------|----------------------------------------------|------------------------------------------|
| 1 | *(no red)* — `npx tsc --noEmit` from repo root must already be green after types/barrel land. | `npx tsc --noEmit` (root) green; manual grep confirms `MathPrimitiveProps` exported from `packages/activity-components/src/index.ts`. |
| 2 | `CI=true npx vitest run src/primitives/__tests__/coordinate-plane.test.tsx` → **fails** with module-not-found for `CoordinatePlane`. | Same command after Phase 3 → passes. Boundary test: `CI=true npx vitest run src/primitives/__tests__/boundary.test.ts` → passes (vacuous + fixture assertions). |
| 3 | Re-run the Phase-2 file-targeted vitest commands (still red until impl lands). | **Bounded smoke**: `CI=true npx vitest run src/primitives` (directory-scoped, runs only the 2 new files) → both green. **Full-suite gate**: `CI=true npm run test` (activity-components) → all 7 suites green. `npx tsc --noEmit` + `npm run lint` green. `git diff --name-only` shows zero edits to `GraphingCanvas.tsx`, `GraphingExplorer*.tsx`, or pre-existing `__tests__/*`. |
| 4 | *(no red)* — doc/registry edits. | `CI=true npm run test` (activity-components) green; `npx tsc --noEmit` (root) green; `npm run lint` green; `tracks.md` contains "Practice Primitives & Components Program" and updated T15/T16 entries (verified by `grep -n`). |

**Artifact vs. live distinction**:
- *Live behavior*: `coordinate-plane.test.tsx` (RTL renders the real component tree
  including `GraphingCanvas`) — this is the ONLY proof of runtime behavior in the track.
- *Artifact / contract*: `boundary.test.ts` (filesystem scan), tsc, doc-section presence,
  `tracks.md` registry edits — these prove structure, not behavior.

**Fake-harness policy**: No fake harnesses are used. Vitest directory-scoped runs
(`vitest run src/primitives`) are bounded by path glob, not by test-name filter, so they
cannot silently widen into the full repo. The Phase-3 closeout deliberately runs the
**unbounded** `npm run test` to catch any cross-suite leakage from the new files.

**Intentionally-red tests**: None at green. Phase-2 leaves `coordinate-plane.test.tsx`
red, but it is owned by the still-`[~]` Phase-2 task and is collected by the package's
default vitest glob — that is acceptable while Phase 2 is in progress and unacceptable at
any commit boundary where Phase 3 is marked `[x]`. The boundary test's "planted bad
import" check uses inline string fixtures only and never writes a red file to disk.
