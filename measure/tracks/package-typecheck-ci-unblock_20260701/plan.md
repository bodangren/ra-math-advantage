# Plan — Unblock CI package typecheck

Track: `package-typecheck-ci-unblock_20260701` · Type: bug · Priority: High

TDD framing: the "test" for this config fix is the CI Phase-1 gate itself —
`npm run typecheck --workspace=packages/<pkg>` (`tsc --noEmit`). Red = currently
failing (captured in spec.md, 42 errors across 4 packages). Green = all four
exit 0.

## Phase 1: Add node ambient types to shared package tsconfigs

- [x] **T1 (Red, evidence):** Capture the failing `tsc --noEmit` output for
  `practice-core`, `core-convex`, `core-auth`, `ai-tutoring` (TS2591 node
  globals + cascaded TS7006). Recorded in `spec.md` Problem table (7/11/5/19 =
  42 errors). `ee10aa4`
- [x] **T2 (Green):** Set `compilerOptions.types = ["node", "vitest/globals"]`
  in each of the four package `tsconfig.json` files, and declare
  `@types/node@^22` as a devDependency of each package (user-approved dependency
  change; matches the app convention, removes reliance on root hoisting).
  `node` resolves the node globals; `vitest/globals` preserves the ambient test
  globals (root `scripts/vitest.config.ts` sets `globals: true`). `ee10aa4`
- [x] **T3 (Verify):** `npm run typecheck --workspace=packages/<pkg>` exits 0 for
  all four; vitest suites still green (193/14/54/75, FR-4); lockfile change scoped
  to `@types/node@22.20.0` ×4; no source files changed. `ee10aa4`

## Phase 2: Registry hygiene

- [~] **T4:** Update `measure/tech-debt.md`:
  - Line 35 (deploy): Phase-1 package-typecheck **root cause FIXED** by this
    track; deploy landing now unblocked pending a CI run on push. (done)
  - Line 30 (spec-compliance, Critical): flipped to **Resolved** — the
    `spec-compliance-and-process-integrity_20260612` track is archived/COMPLETED
    (2026-06-30, Green `3d4243e8`); its gate on `jsdoc-comments` /
    `kst-lesser-holes` no longer applies. (Stale entry found during this track's
    triage.) (done)
- [x] **T5:** ~~Log the `@types/node` devDependency as a Low tech-debt follow-up~~
  **Not needed** — user approved the dependency change, so it was done inline in
  T2 rather than deferred.

## Known Gaps / Out of scope

- Observing an actually-green remote CI run + the IM3 Cloudflare deploy landing
  (cannot trigger remote CI from here).
- `math-content` lint gate / standalone tsc red (separate rows, same class).
