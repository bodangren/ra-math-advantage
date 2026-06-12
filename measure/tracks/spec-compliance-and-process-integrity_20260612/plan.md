# Implementation Plan: Spec Compliance and Process Integrity Remediation

## Phase 1: Repository State Triage and Safety

- [x] Task 1.1: Inspect current repository state
  - [x] Ran `git rev-parse HEAD`, `git branch -v`, `git status --short`, `git stash list`
  - [x] Documented: HEAD detached at `e2f55669`; `master` at `61d56490` (56 commits ahead); dirty `graph.db` (+122 KiB vs master); untracked `tmp_jsdoc_audit.mjs`; 28 stashes.

- [x] Task 1.2: Decide disposition of dirty `graph.db`
  - [x] Compared working-tree `graph.db` (20,049,920 bytes) with `master:graph.db` (19,947,520 bytes) and `HEAD:graph.db` (19,927,040 bytes).
  - [x] Reverted working-tree `graph.db` to `master:graph.db` intentionally. It will be refreshed via `build-graph scan` at Phase 7 and committed with a clear message.

- [x] Task 1.3: Resolve stashes
  - [x] Reviewed all 28 stash entries.
  - [x] Disposition:
    - Preserved as WIP branches:
      - `wip/bm2-auth-cleanup-stash-23` — 155-file auth/validation cleanup + package moves (committed as `16f6eded`).
      - `wip/bm2-jsdoc-stash-22` — 161-file BM2 JSDoc addition (committed as `92cd886d`).
    - Dropped: 26 remaining graph.db build-artifact, generated `.next/`, `conductor/` log, manifest-timestamp, and obsolete workspace-cleanup stashes.
  - [x] `git stash list` is now empty.

- [x] Task 1.4: Return to `master`
  - [x] Worktree is clean; `git checkout master` succeeded.
  - [x] `git status --short` returns empty.
  - [x] `git rev-parse HEAD` == `master` == `a38c4202`.

- [~] Task 1.5: Checkpoint
  - [ ] Commit any necessary state-normalization changes
  - [ ] Attach git note summarizing the recovered state

## Phase 2: Revert FR-6 Violations

- [ ] Task 2.1: Revert Phase 5 dropdown-menu conversion
  - [ ] File: `apps/integrated-math-3/components/ui/dropdown-menu.tsx`
  - [ ] Restore `const DropdownMenuShortcut = ({ ... }) => { ... };` form
  - [ ] Keep the JSDoc block on the `const` line
  - [ ] Run `bash measure/tracks/jsdoc-comments_20260526/scripts/check-jsdoc-fr6-noncomment-diff.sh FR6_SCOPE=apps/integrated-math-3/components/` → 0 violations

- [ ] Task 2.2: Revert Phase 6 PlaceholderComponent / registry changes
  - [ ] File: `apps/integrated-math-3/lib/activities/registry.ts`
  - [ ] Restore `type ComponentType` import, `ActivityComponent` alias, and original `const PlaceholderComponent: ActivityComponent = () => null;`
  - [ ] Keep JSDoc on the `const` line
  - [ ] Run FR-6 guard with `FR6_SCOPE=apps/integrated-math-3/lib/` → 0 violations

- [ ] Task 2.3: Revert Phase 8 source-file arrow-to-function conversions
  - [ ] Identify all 127 non-comment diff lines from `dc6ba80a` in `packages/*/src/` (exclude test files already fixed by `6272266f`)
  - [ ] Convert each affected function back to its original `const` arrow form
  - [ ] Preserve JSDoc on the `const` line
  - [ ] Run FR-6 guard with `FR6_SCOPE=packages/` → 0 violations

- [ ] Task 2.4: Revert final acceptance arrow-to-function conversions
  - [ ] File: `apps/integrated-math-3/components/ui/dropdown-menu.tsx` (again) and `apps/bus-math-v2/app/preface/page.tsx` (`staticTimestamp`)
  - [ ] Restore `const` arrow forms
  - [ ] Run FR-6 guard across both scopes → 0 violations

- [ ] Task 2.5: Verify no regressions
  - [ ] `npx tsc --noEmit` for affected packages/apps
  - [ ] Relevant focused tests pass
  - [ ] `npm run lint` on changed files passes

## Phase 3: Add FR-5 Type Annotations

- [ ] Task 3.1: Add `{type}` to all `@param` tags in Phase 4 (IM3 `convex/`)
  - [ ] 113 `@param` tags in `apps/integrated-math-3/convex/`
  - [ ] Use TypeScript signature types, e.g., `{QueryCtx}`, `{MutationCtx}`, `{string}`, `{number}`

- [ ] Task 3.2: Add `{type}` to all `@returns` tags in Phase 4
  - [ ] 62 `@returns` tags in `apps/integrated-math-3/convex/`

- [ ] Task 3.3: Add `{type}` to all `@param`/`@returns` tags in Phase 5 (IM3 `components/`)
  - [ ] 105 `@param`, 116 `@returns` tags

- [ ] Task 3.4: Add `{type}` to all `@param`/`@returns` tags in Phase 6 (IM3 `lib/`)
  - [ ] First, convert single-line summaries to full JSDoc blocks with typed `@param`/`@returns`

- [ ] Task 3.5: Add `{type}` to all `@param`/`@returns` tags in Phase 7 (IM3 `app/scripts/other/`)
  - [ ] 64 `@param`, 80 `@returns` tags

- [ ] Task 3.6: Add `{type}` to all `@param`/`@returns` tags in Phase 8 (`packages/*/src/`)
  - [ ] 537 `@param`, 322 `@returns` tags

- [ ] Task 3.7: Add an FR-5 enforcement guard
  - [ ] Create `measure/tracks/spec-compliance-and-process-integrity_20260612/scripts/check-jsdoc-typed-params.sh`
  - [ ] Assert every `@param` and `@returns` line added by Phases 4-8 contains `{...}`
  - [ ] Add guard to CI / pre-commit

## Phase 4: Missing `@throws`, `@returns`, and Convex Exported Surface

- [ ] Task 4.1: Audit throwing functions in scope
  - [ ] Search for `throw` in `apps/integrated-math-3/convex/`, `apps/integrated-math-3/lib/`
  - [ ] Add `@throws` to every throwing function documented by Phases 4-6

- [ ] Task 4.2: Audit functions missing `@returns`
  - [ ] Add `@returns` to `saveCardsHandler` and any other returning function that lacks it

- [ ] Task 4.3: Document exported Convex wrappers
  - [ ] Find every `export const X = internalQuery(...)` / `internalMutation(...)` / `action(...)` / `cron(...)` in `apps/integrated-math-3/convex/`
  - [ ] Move or duplicate the existing JSDoc block onto the exported wrapper line
  - [ ] Ensure internal `*Handler` functions still have JSDoc if they remain exported or reused

- [ ] Task 4.4: Add exported-surface coverage guard
  - [ ] Extend `check-jsdoc-exported-im3-app.sh` pattern to `convex/` scope
  - [ ] Assert every exported wrapper has a preceding JSDoc block

## Phase 5: Verification Process Integrity

- [ ] Task 5.1: Reset all verification reports to `pending`
  - [ ] Files: `measure/tracks/jsdoc-comments_20260526/phase-{1..9}-verification-report.md`
  - [ ] Change `VERIFICATION_RESULT: approved` → `pending`
  - [ ] Clear `VERIFIED_BY` and `VERIFIED_AT` placeholders

- [ ] Task 5.2: Harden verification guard
  - [ ] File: `measure/tracks/jsdoc-comments_20260526/scripts/check-phase-verification-*.sh`
  - [ ] Add check that `VERIFIED_BY` is not `automation` / `measure-mid` / bot values
  - [ ] Optional: require a signed git note or human-attested artifact
  - [ ] Guard must FAIL if report was self-approved

- [ ] Task 5.3: Drive real manual verification
  - [ ] For each phase, execute `measure/workflow.md` Steps 1-10 for real
  - [ ] Human verifier reviews changed files, runs lint/test/typecheck, inspects guards
  - [ ] Only after explicit human confirmation, update report with real name and ISO timestamp

- [ ] Task 5.4: Remove false excuses from verification reports
  - [ ] Replace "npm not on PATH" and "Not available in sandbox" with actual command output
  - [ ] If a command timed out, record "timed out at N seconds", not "PASS"

## Phase 6: kst-lesser-holes_20260521 Phase 1 Quality

- [ ] Task 6.1: Record real adversarial findings
  - [ ] File: adversarial result JSON for kst Phase 1
  - [ ] Populate `"findings"` with the public-API gap and other issues
  - [ ] Do not mark audit `"pass"` with empty findings

- [ ] Task 6.2: Tighten Level Projection schema
  - [ ] `packages/knowledge-space-core/src/level-projection.ts`
  - [ ] Add `.refine`/`.superRefine` to enforce non-empty `displayLevels`, non-decreasing `minMastery`, unique ids
  - [ ] Constrain `LevelProjectionFn` return type to a level id, not bare `string`

- [ ] Task 6.3: Tighten progressTrend schema
  - [ ] `packages/knowledge-space-core/src/progress-trend.ts`
  - [ ] Enforce chronological order, non-empty window, unique `masteredNodeIds` per snapshot

- [ ] Task 6.4: Deduplicate edge endpoint rules
  - [ ] Move canonical `EDGE_ENDPOINT_RULES` to one module
  - [ ] Import it in both `schemas.ts` and `validation.ts`
  - [ ] Add a test that fails if the two lists diverge

- [ ] Task 6.5: Expand transfers_to tests
  - [ ] Add parametrized cases for all allowed/disallowed endpoint kinds
  - [ ] Add wrong source/target kind rejections and zero-weight acceptance

- [ ] Task 6.6: Strengthen public-api-contract test
  - [ ] Import all named exports from root and subpaths
  - [ ] Add negative schema cases and a real level-projection instance test

- [ ] Task 6.7: Remove stale Red-phase comments
  - [ ] Rewrite test file headers to describe current contract/regression purpose

- [ ] Task 6.8: Reconcile test count
  - [ ] Confirm actual suite size and update plan claims to match

## Phase 7: Final Verification and Checkpoint

- [ ] Task 7.1: Refresh `graph.db`
  - [ ] Run `build-graph scan ./ ./graph.db`
  - [ ] Commit the refreshed graph with a clear message

- [ ] Task 7.2: Run all guards
  - [ ] All jsdoc phase coverage guards → PASS
  - [ ] All line-length guards → PASS
  - [ ] All FR-6 guards → PASS
  - [ ] New FR-5 typed-param guard → PASS
  - [ ] New exported-surface guard → PASS

- [ ] Task 7.3: Run real lint / typecheck / tests
  - [ ] `npm run lint` in affected workspaces
  - [ ] `npx tsc --noEmit` for affected tsconfig projects
  - [ ] `CI=true npm run test` for affected workspaces
  - [ ] Record actual command output in verification reports

- [ ] Task 7.4: User Manual Verification
  - [ ] Drive `measure/workflow.md` Steps 1-10 for this track
  - [ ] Human verifier signs off

- [ ] Task 7.5: Checkpoint
  - [ ] Commit: `measure(checkpoint): Checkpoint end of Phase 7 — spec compliance and process integrity remediation`
  - [ ] Attach git note with full summary
