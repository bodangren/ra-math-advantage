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

- [x] Task 1.5: Checkpoint [checkpoint: fb0a8278]
  - [x] Committed plan update with state-normalization decisions.
  - [x] Attached git note summarizing the recovered state.

## Phase 2: Revert FR-6 Violations

- [x] Task 2.1: Revert Phase 5 dropdown-menu conversion
  - [x] File: `apps/integrated-math-3/components/ui/dropdown-menu.tsx`
  - [x] Restored `const DropdownMenuShortcut = ({ ... }) => { ... };` form with JSDoc preserved on the `const` line.
  - [x] FR-6 guard: `FR6_BASE=b1a6544496d7177f5e4c821a27ca6a8156eb5b79 FR6_SCOPE=apps/integrated-math-3/components/ui/dropdown-menu.tsx` → 0 violations.

- [x] Task 2.2: Revert Phase 6 PlaceholderComponent / registry changes
  - [x] File: `apps/integrated-math-3/lib/activities/registry.ts`
  - [x] Restored `type ComponentType` import, `ActivityComponent` alias, and `const PlaceholderComponent: ActivityComponent = () => null;` with JSDoc preserved.
  - [x] FR-6 guard: `FR6_BASE=3ce011d9b7a9d4487044b0bacecc87aff4f7ea64 FR6_SCOPE=apps/integrated-math-3/lib/` → 0 violations.

- [x] Task 2.3: Revert Phase 8 source-file arrow-to-function conversions
  - [x] Audited `dc6ba80a` against its parent (`2ec69cef`) for `packages/*/src/` non-test source files.
  - [x] Finding: **zero** source-file arrow-to-function conversions remain in `packages/*/src/`; `6272266f` and subsequent commits already reverted them. The 127 non-comment diff lines cited in the spec were in test files or are accounted for by later kst-lesser-holes changes.
  - [x] Verified non-test source diff of `dc6ba80a` contains 0 non-comment lines.

- [x] Task 2.4: Revert final acceptance arrow-to-function conversions
  - [x] File: `apps/integrated-math-3/components/ui/dropdown-menu.tsx` (covered in Task 2.1).
  - [x] File: `apps/bus-math-v2/app/preface/page.tsx` — restored `const staticTimestamp = () => new Date(...);` with JSDoc preserved.
  - [x] FR-6 guard: `FR6_BASE=8dce9f4ed307ce990ad641437e4b05d0f5a4789d FR6_SCOPE=apps/bus-math-v2/app/preface/page.tsx` → 0 violations.

- [x] Task 2.5: Verify no regressions
  - [x] `npm run ws:im3:lint` → PASS.
  - [x] `npm run ws:bm2:lint` → PASS.
  - [x] `CI=true npx vitest run apps/integrated-math-3/__tests__/lib/activities/registry.test.ts` → 8/8 pass.
  - [x] `npm run ws:im3:typecheck` / `npm run ws:bm2:typecheck` → fail on pre-existing errors unrelated to these changes (cloudflare worker missing `dist/server/index.js`, `edgeCalibration.test.ts` generic constraint, Tailwind dark-mode tuple type). No new errors introduced by these reverts.

## Phase 3: Add FR-5 Type Annotations

- [~] Task 3.1: Add `{type}` to all `@param` tags in Phase 4 (IM3 `convex/`) [red: bde10833]
  - [ ] 113 `@param` tags in `apps/integrated-math-3/convex/`
  - [ ] Use TypeScript signature types, e.g., `{QueryCtx}`, `{MutationCtx}`, `{string}`, `{number}`
  - Live count (per `check-jsdoc-typed-params.sh` Red baseline): 228 `@param` in 27 files (live count supersedes the 113 plan estimate; see phase-3-red-baseline.md "Plan-vs-live scope delta").

- [~] Task 3.2: Add `{type}` to all `@returns` tags in Phase 4 [red: bde10833]
  - [ ] 62 `@returns` tags in `apps/integrated-math-3/convex/`
  - Live count: 115 `@returns` in 27 files (live count supersedes the 62 plan estimate).

- [~] Task 3.3: Add `{type}` to all `@param`/`@returns` tags in Phase 5 (IM3 `components/`) [red: bde10833]
  - [ ] 105 `@param`, 116 `@returns` tags
  - Live count: 221 combined (matches the plan estimate; no drift).

- [~] Task 3.4: Add `{type}` to all `@param`/`@returns` tags in Phase 6 (IM3 `lib/`) [red: bde10833]
  - [ ] First, convert single-line summaries to full JSDoc blocks with typed `@param`/`@returns`
  - Live count: 2 combined (substantially under the plan's "not given"; the IM3 `lib/` scope has very little JSDoc surface).

- [~] Task 3.5: Add `{type}` to all `@param`/`@returns` tags in Phase 7 (IM3 `app/scripts/other/`) [red: bde10833]
  - [ ] 64 `@param`, 80 `@returns` tags
  - Live count: 141 combined (close to the plan's 144 estimate; minor drift).

- [~] Task 3.6: Add `{type}` to all `@param`/`@returns` tags in Phase 8 (`packages/*/src/`) [red: bde10833]
  - [ ] 537 `@param`, 322 `@returns` tags
  - Live count: 1079 combined (substantially exceeds the plan's 859 estimate; the packages tree grew post-spec).

- [~] Task 3.7: Add an FR-5 enforcement guard [red: bde10833]
  - [x] Create `measure/tracks/spec-compliance-and-process-integrity_20260612/scripts/check-jsdoc-typed-params.sh`
  - [x] Assert every `@param` and `@returns` line added by Phases 4-8 contains `{...}`
  - [ ] Add guard to CI / pre-commit (Phase 3 Green or Phase 7 closeout)

### Phase 3 Red proof (recorded 2026-06-20)

**Single most targeted Red command** (production gate; the default `TYPED_PARAMS_SCOPE` is `apps/integrated-math-3/convex/`):

```bash
bash measure/tracks/spec-compliance-and-process-integrity_20260612/scripts/check-jsdoc-typed-params.sh
```

**Red result at HEAD:** `untyped=343, typed=0, scanned_files=101, exit=1` (FAIL).
Per-file breakdown: 27 files have at least one untyped tag; top 3 are
`teacher.ts` (39), `objectiveProficiency.ts` (36), `study.ts` (33).

**Runner-plumbing self-test** (closeout gate per test-strategy §7 P3; the
guard run against a constructed bad-sample fixture must also fail):

```bash
TYPED_PARAMS_SCOPE=measure/tracks/spec-compliance-and-process-integrity_20260612/scripts/fixtures/typed-params-bad-sample.ts \
  bash measure/tracks/spec-compliance-and-process-integrity_20260612/scripts/check-jsdoc-typed-params.sh
```

**Self-test result:** `untyped=2, typed=2, scanned_files=1, exit=1` (FAIL,
by design — the fixture has 2 untyped + 2 typed tags).

**Test-strategy contract:** Red tests fail because the current implementation
is **missing** (no typed annotations exist in the IM3 `convex/` scope; 0/343
tags carry `{Type}`), not because a durable record is stale. The guard's
parser is regex-based and reads source directly, not graph.db, so the count
is always live and the failure is intrinsic to the source state.

See [`phase-3-red-baseline.md`](./phase-3-red-baseline.md) for the full
documented failing assertion, scope deltas, and Green-phase definition of done.

### Dirty-worktree classification (MID Red phase start, 2026-06-20)

`git status --porcelain` at MID Red start:

```
?? measure/tracks/spec-compliance-and-process-integrity_20260612/test-strategy.md
```

Classification:
- **`test-strategy.md` (untracked, 7430 bytes)**: **relevant** — Tech Lead
  artifact for this track, authored before MID start. Per the user rule
  "If dirty changes are relevant, fold them into the Red-phase plan/test
  commit with explicit plan notes," this file is **folded into the Phase 3
  Red commit** via `git add` (no content change, just bringing it under
  version control). It is preserved verbatim — the Tech Lead's strategy
  binds the Red-proof shape (test-strategy §1: "P3: tip = 1 new shell guard
  (typed-params). Artifact-only, no unit."), and the Red proof in this
  commit conforms to that contract.

No other dirty paths. No destructive git operations. No application source
paths modified. graph.db is unchanged (still at the master-resolved state
from Phase 1 Task 1.2; Phase 7.1 will refresh + commit it).

### Dirty-worktree classification (MID Red phase restart, 2026-06-21)

`git status --porcelain` at MID Red restart:

```
 M apps/integrated-math-3/convex/auth.ts
 M apps/integrated-math-3/convex/dashboardHelpers.ts
 M apps/integrated-math-3/convex/dev.ts
 M apps/integrated-math-3/convex/edgeCalibration.ts
 M apps/integrated-math-3/convex/exports.ts
 M apps/integrated-math-3/convex/objectiveProficiency.ts
 M apps/integrated-math-3/convex/placement.ts
 M apps/integrated-math-3/convex/public.ts
 M apps/integrated-math-3/convex/queue/queue.ts
 M apps/integrated-math-3/convex/queue/sessions.ts
 M apps/integrated-math-3/convex/rateLimits.ts
 M apps/integrated-math-3/convex/seed.ts
 M apps/integrated-math-3/convex/seed/seed_demo_env.ts
 M apps/integrated-math-3/convex/seed/utils.ts
 M apps/integrated-math-3/convex/seed/validate_blueprint.ts
 M apps/integrated-math-3/convex/srs/cards.ts
 M apps/integrated-math-3/convex/srs/dashboard.ts
 M apps/integrated-math-3/convex/srs/processReview.ts
 M apps/integrated-math-3/convex/srs/reviews.ts
 M apps/integrated-math-3/convex/srs/sessions.ts
 M apps/integrated-math-3/convex/srs/submissionSrs.ts
 M apps/integrated-math-3/convex/study.ts
 M apps/integrated-math-3/convex/teacher.ts
 M apps/integrated-math-3/convex/teacher/lessonAssignment.ts
 M apps/integrated-math-3/convex/teacher/srs_mutations.ts
 M apps/integrated-math-3/convex/teacher/srs_queries.ts
 M apps/integrated-math-3/convex/timing_baseline.ts
?? _add_types.py
?? _add_types.ts
```

Classification:

- **27 modified `apps/integrated-math-3/convex/*.ts` files** (HEAD vs worktree
  diff: 343 insertions, 344 deletions): **relevant but out-of-role**.
  These modifications add TypeScript-flavored `{Type}` annotations to every
  `@param` and `@returns` tag in IM3 `convex/` — exactly the Green work for
  Phase 3 Tasks 3.1 and 3.2. The diff pattern is consistent across files
  (e.g., `apps/integrated-math-3/convex/auth.ts`:
  `@param value - The string to normalize`
  → `@param {string | undefined} value - The string to normalize`).

  **Why out-of-role for MID Red:** the MID Red agent is explicitly forbidden
  from "implement[ing] feature logic" and "modif[ying] existing source code
  except test files and Measure docs." The 27 dirty source files are
  **Green-phase feature logic** for Phase 3 Tasks 3.1-3.2; they were
  produced by an external tooling run (the two untracked scripts at the repo
  root, see below), not by the MID agent. Per the user rule "Preserve
  unrelated user work: do not overwrite, revert, or hide it in this track's
  commit," the MID agent MUST NOT revert them (that would destroy the
  Green work). Per the user rule "Do NOT modify existing source code except
  test files and Measure docs," the MID agent MUST NOT actively rewrite or
  re-stage them. The dirty Green work is **preserved as-is** in the
  worktree and is the responsibility of the next GREEN-phase role to
  commit (single commit, Conventional-Commit `feat(spec-compliance): …` or
  similar — Phase 3 Tasks 3.1-3.2 closeout).

  **Why this is not a Red-phase failure:** the Red proof is the guard
  (`measure/tracks/spec-compliance-and-process-integrity_20260612/scripts/check-jsdoc-typed-params.sh`,
  committed in `bde10833`, hardened in `f55172d1`). The guard is proven
  against the COMMITTED HEAD state (`git archive HEAD -- apps/integrated-math-3/convex/`
  → 343 untyped / 0 typed / 101 scanned / exit 1) and against the runner-
  plumbing fixture (2 untyped / 2 typed / exit 1). The Red proof is intact
  and authoritative at HEAD. The dirty worktree's `pass=true` result is the
  EXPECTED Green outcome of uncommitted Green work, NOT a Red proof
  failure.

- **`_add_types.py` (untracked, 7203 bytes) at repo root**: **generated /
  ignorable**. This is a Python automation script that walks a directory
  and adds `{Type}` annotations to `@param`/`@returns` JSDoc tags by
  matching tags to TypeScript function signatures. It is the apparent
  producer of the 27 modified convex files above. Per its own header
  ("Add {Type} annotations to @param and @returns JSDoc tags"), it is a
  transient batch-processing tool, not a tracked codebase artifact. The
  leading underscore + root location are the conventional signals that
  this is a drop-in scratch tool that should NOT be committed.

- **`_add_types.ts` (untracked, 7319 bytes) at repo root**: **generated /
  ignorable**. TypeScript rewrite of `_add_types.py` using the TypeScript
  compiler API. Same provenance and same disposition: transient
  batch-processing tool, not a tracked codebase artifact, should NOT be
  committed. The fact that both a Python and a TypeScript version exist at
  the repo root (created at `2026-06-20 23:04` and `2026-06-21 00:09`
  respectively) suggests ad-hoc iteration between languages to handle
  edge cases; neither version is production code.

**Disposition taken by MID Red:**
1. Red proof re-verified at COMMITTED HEAD state — guard correctly reports
   343 untyped in IM3 `convex/`, exit 1. (Command + result recorded below.)
2. Red proof re-verified at dirty worktree state — guard reports 0 untyped
   in IM3 `convex/`, exit 0. (This is the EXPECTED Green outcome of the
   uncommitted Green work; the test-strategy §7 Red assertion is about the
   COMMITTED state, not the worktree.)
3. Runner-plumbing self-test re-verified — guard reports 2 untyped / 2 typed
   / exit 1 on the bad-sample fixture. Unchanged from `bde10833` /
   `f55172d1`.
4. `plan.md` updated to record this dirty-worktree classification and
   document the out-of-role disposition (this section).
5. The 27 dirty source files and 2 untracked scripts are LEFT IN THE
   WORKTREE — not reverted (preserves Green work), not committed (out of
   role), not `.gitignore`-d (out of role).
6. `graph.db` is unchanged from the Phase 1 Task 1.2 master-resolved
   state. Phase 7.1 will refresh + commit it.

**MID Red phase restart targeted Red commands + results (2026-06-21):**

```bash
# Production-gate Red proof — committed HEAD state (Red expected):
mkdir -p /tmp/opencode/red_verify && git archive HEAD -- apps/integrated-math-3/convex/ | tar -x -C /tmp/opencode/red_verify/
TYPED_PARAMS_SCOPE=/tmp/opencode/red_verify/apps/integrated-math-3/convex/ \
  bash measure/tracks/spec-compliance-and-process-integrity_20260612/scripts/check-jsdoc-typed-params.sh --json
# Result: {"scanned_files":101,"total_tags":343,"typed_tags":0,"untyped_tags":343,"pass":false}
# Exit: 1 (FAIL — Red proof intact at HEAD)

# Same gate against dirty worktree (Green expected from uncommitted Green work):
bash measure/tracks/spec-compliance-and-process-integrity_20260612/scripts/check-jsdoc-typed-params.sh --json
# Result: {"scanned_files":101,"total_tags":343,"typed_tags":343,"untyped_tags":0,"pass":true}
# Exit: 0 (PASS — Green work in dirty state satisfies the contract)

# Runner-plumbing self-test (always fails by design):
TYPED_PARAMS_SCOPE=measure/tracks/spec-compliance-and-process-integrity_20260612/scripts/fixtures/typed-params-bad-sample.ts \
  bash measure/tracks/spec-compliance-and-process-integrity_20260612/scripts/check-jsdoc-typed-params.sh
# Result: untyped=2, typed=2, exit 1 (FAIL — fixture design unchanged)
```

**Mid Red restart task-marker status:** all 7 Phase 3 sub-tasks remain
`[~]` (in progress) — no new sub-tasks were completed by the Red
restart. Tasks 3.1 and 3.2 have their Green implementation present in
the dirty worktree but UNCOMMITTED; closing them to `[x]` is the
GREEN-phase role's responsibility. Tasks 3.3-3.6 (other phase scopes)
and 3.7 (CI wiring) remain `[~]` / `[ ]` as before.

**Next-role handoff:** the GREEN-phase role should:
1. Run `git diff apps/integrated-math-3/convex/` and audit the 343 added
   `{Type}` annotations against the function signatures to confirm they
   are correct (sample audit on `auth.ts`, `study.ts`, `teacher.ts`,
   `objectiveProficiency.ts` recommended).
2. Run `bash measure/tracks/spec-compliance-and-process-integrity_20260612/scripts/check-jsdoc-typed-params.sh`
   and confirm exit 0.
3. Commit the 27 modified source files in a single Green commit
   (Conventional Commit `feat(spec-compliance): Phase 3 Green — IM3 convex/ typed annotations`).
4. Mark Tasks 3.1 and 3.2 as `[x]` in `plan.md` with the Green commit SHA.
5. Move on to Tasks 3.3-3.6 (other scopes — `components/`, `lib/`,
   `app/scripts/`, `packages/`).
6. Do NOT commit `_add_types.py` or `_add_types.ts` — they are transient
   tooling and should be deleted from the worktree after the Green commit
   lands.

### Dirty-worktree classification (MID Red phase restart #3, 2026-06-21)

`git status --porcelain` at MID Red restart #3 (worktree state unchanged
from restart #2 — same 27 modified source files, same 2 untracked
scripts):

```
 M apps/integrated-math-3/convex/auth.ts
 M apps/integrated-math-3/convex/dashboardHelpers.ts
 M apps/integrated-math-3/convex/dev.ts
 M apps/integrated-math-3/convex/edgeCalibration.ts
 M apps/integrated-math-3/convex/exports.ts
 M apps/integrated-math-3/convex/objectiveProficiency.ts
 M apps/integrated-math-3/convex/placement.ts
 M apps/integrated-math-3/convex/public.ts
 M apps/integrated-math-3/convex/queue/queue.ts
 M apps/integrated-math-3/convex/queue/sessions.ts
 M apps/integrated-math-3/convex/rateLimits.ts
 M apps/integrated-math-3/convex/seed.ts
 M apps/integrated-math-3/convex/seed/seed_demo_env.ts
 M apps/integrated-math-3/convex/seed/utils.ts
 M apps/integrated-math-3/convex/seed/validate_blueprint.ts
 M apps/integrated-math-3/convex/srs/cards.ts
 M apps/integrated-math-3/convex/srs/dashboard.ts
 M apps/integrated-math-3/convex/srs/processReview.ts
 M apps/integrated-math-3/convex/srs/reviews.ts
 M apps/integrated-math-3/convex/srs/sessions.ts
 M apps/integrated-math-3/convex/srs/submissionSrs.ts
 M apps/integrated-math-3/convex/study.ts
 M apps/integrated-math-3/convex/teacher.ts
 M apps/integrated-math-3/convex/teacher/lessonAssignment.ts
 M apps/integrated-math-3/convex/teacher/srs_mutations.ts
 M apps/integrated-math-3/convex/teacher/srs_queries.ts
 M apps/integrated-math-3/convex/timing_baseline.ts
?? _add_types.py
?? _add_types.ts
```

Classification (unchanged from restart #2 — same artifacts):

- **27 modified `apps/integrated-math-3/convex/*.ts` files** (HEAD vs
  worktree diff: 343 insertions, 344 deletions): **relevant but
  out-of-role for MID Red**. These are the Phase 3 Tasks 3.1 + 3.2
  Green implementation. The 343 insertions correspond exactly to the
  343 untyped tags documented in [`phase-3-red-baseline.md`](./phase-3-red-baseline.md)
  — the count match confirms the diff is the closing of the Red gap,
  not unrelated work. Sample diff confirms the pattern is exactly
  `@param name - desc` → `@param {Type} name - desc` (e.g., `study.ts`:
  `@param ctx - The mutation context` →
  `@param {MutationCtx} ctx - The mutation context`).

  **Why out-of-role for MID Red:** per the user rule "Do NOT modify
  existing source code except test files and Measure docs," the MID
  Red agent MUST NOT commit, revert, or rewrite these files. The
  Green-phase role owns the commit per restart #2's handoff. **The
  MID Red agent's job here is to preserve the Green work (not revert
  it) and to re-verify the Red proof at committed HEAD state** (the
  proof is intrinsic to the committed source, not the worktree).

- **`_add_types.py` (untracked, 7203 bytes) at repo root**:
  **generated / ignorable**. Python automation that walks a directory
  and adds `{Type}` annotations by matching JSDoc tags to TypeScript
  function signatures. The apparent producer of the 27 modified
  convex files above. Transient batch-processing tool; not a tracked
  codebase artifact; should NOT be committed.

- **`_add_types.ts` (untracked, 7319 bytes) at repo root**:
  **generated / ignorable**. TypeScript rewrite of `_add_types.py`.
  Same provenance and disposition: transient tooling, should NOT be
  committed.

**Disposition taken by MID Red restart #3:**
1. Red proof re-verified at COMMITTED HEAD state via
   `git archive HEAD -- apps/integrated-math-3/convex/ | tar -x -C
   /tmp/opencode/mid_red_restart/`. Guard correctly reports
   `untyped=343, typed=0, scanned_files=101, exit=1`. Red proof INTACT
   at committed HEAD state. (Command + result recorded below.)
2. Red proof re-verified at dirty worktree state. Guard reports
   `untyped=0, typed=343, scanned_files=101, exit=0`. This is the
   EXPECTED Green outcome of the uncommitted Green work; not a Red
   proof failure (the test-strategy §7 P3 Red assertion is about the
   COMMITTED state, not the worktree).
3. Runner-plumbing self-test re-verified. Guard reports
   `untyped=2, typed=2, scanned_files=1, exit=1` on the bad-sample
   fixture. Unchanged from `bde10833` / `f55172d1`.
4. `plan.md` updated to record this third restart's dirty-worktree
   classification and document the unchanged disposition (this
   section).
5. The 27 dirty source files and 2 untracked scripts are LEFT IN THE
   WORKTREE — not reverted (preserves Green work), not committed
   (out of role), not `.gitignore`-d (out of role).
6. `graph.db` is unchanged from the Phase 1 Task 1.2 master-resolved
   state. Phase 7.1 will refresh + commit it.
7. build-graph baseline verified: `graph.db` (2026-06-20, 1 day old,
   within the <24h mtime freshness window per Graph-Aware Mode) has
   14181 nodes / 20667 edges / 2067 files — consistent with the
   test-strategy.md §0 baseline. `build-graph search ./graph.db
   "check-jsdoc-typed-params"` returns no results, confirming the
   guard is a shell script under `measure/` and is not queryable
   from the TS knowledge graph (as expected per the script's
   header comment and test-strategy §6).

**MID Red restart #3 targeted Red commands + results (2026-06-21):**

```bash
# Production-gate Red proof — committed HEAD state (Red expected):
mkdir -p /tmp/opencode/mid_red_restart && \
  git archive HEAD -- apps/integrated-math-3/convex/ | tar -x -C /tmp/opencode/mid_red_restart/
TYPED_PARAMS_SCOPE=/tmp/opencode/mid_red_restart/apps/integrated-math-3/convex/ \
  bash measure/tracks/spec-compliance-and-process-integrity_20260612/scripts/check-jsdoc-typed-params.sh --json
# Result: {"scanned_files":101,"total_tags":343,"typed_tags":0,"untyped_tags":343,"pass":false}
# Exit: 1 (FAIL — Red proof intact at HEAD, unchanged from bde10833/f55172d1)

# Same gate against dirty worktree (Green expected from uncommitted Green work):
bash measure/tracks/spec-compliance-and-process-integrity_20260612/scripts/check-jsdoc-typed-params.sh --json
# Result: {"scanned_files":101,"total_tags":343,"typed_tags":343,"untyped_tags":0,"pass":true}
# Exit: 0 (PASS — Green work in dirty state satisfies the contract)

# Runner-plumbing self-test (always fails by design):
TYPED_PARAMS_SCOPE=measure/tracks/spec-compliance-and-process-integrity_20260612/scripts/fixtures/typed-params-bad-sample.ts \
  bash measure/tracks/spec-compliance-and-process-integrity_20260612/scripts/check-jsdoc-typed-params.sh --json
# Result: {"scanned_files":1,"total_tags":4,"typed_tags":2,"untyped_tags":2,"pass":false}
# Exit: 1 (FAIL — fixture design unchanged)
```

**Red proof failure cause (intrinsic, not stale):** the Red tests fail
because the committed source state is **missing** typed annotations in
343 tags across 27 files in `apps/integrated-math-3/convex/`. The
guard's parser is regex-based and reads source directly (not
graph.db), so the count is always live. The dirty worktree's
`pass=true` is the EXPECTED Green outcome of uncommitted Green work,
NOT a Red proof failure. Per the user's instruction "Red tests must
fail because the current implementation is missing or wrong, not
merely because a durable record is stale" — the failure is intrinsic
to the source, the count is not a stale durable record.

**Task-marker status (unchanged):** all 7 Phase 3 sub-tasks remain
`[~]` (in progress) — no new sub-tasks were completed by this Red
restart. Tasks 3.1 and 3.2 have their Green implementation present in
the dirty worktree but UNCOMMITTED; closing them to `[x]` is the
GREEN-phase role's responsibility. Tasks 3.3-3.6 (other phase scopes)
and 3.7 (CI wiring) remain `[~]` / `[ ]` as before. **No new tests
written this restart** — the Red proof (the guard script + fixture)
was committed in `bde10833` and hardened in `f55172d1`; re-running
it against the committed HEAD state confirms the same Red assertion
holds. Adding more tests would be redundant with the existing guard.

**Next-role handoff (unchanged from restart #2):** the GREEN-phase
role should:
1. Run `git diff apps/integrated-math-3/convex/` and audit the 343
   added `{Type}` annotations against the function signatures to
   confirm they are correct (sample audit on `auth.ts`, `study.ts`,
   `teacher.ts`, `objectiveProficiency.ts` recommended).
2. Run `bash measure/tracks/spec-compliance-and-process-integrity_20260612/scripts/check-jsdoc-typed-params.sh`
   and confirm exit 0.
3. Commit the 27 modified source files in a single Green commit
   (Conventional Commit `feat(spec-compliance): Phase 3 Green — IM3 convex/ typed annotations`).
4. Mark Tasks 3.1 and 3.2 as `[x]` in `plan.md` with the Green
   commit SHA.
5. Move on to Tasks 3.3-3.6 (other scopes — `components/`, `lib/`,
   `app/scripts/`, `packages/`).
6. Do NOT commit `_add_types.py` or `_add_types.ts` — they are
   transient tooling and should be deleted from the worktree after
   the Green commit lands.

### Dirty-worktree classification (MID Red phase restart #4, 2026-06-21)

`git status --porcelain` at MID Red restart #4 (worktree has new
unrelated changes since restart #3 — a parallel daily-automation
archival process touched `tracks.md` and deleted the `tracks/parent-portal_20260605/`
directory after commit `a2fcb516`):

```
 M apps/integrated-math-3/convex/auth.ts
 M apps/integrated-math-3/convex/dashboardHelpers.ts
 M apps/integrated-math-3/convex/dev.ts
 M apps/integrated-math-3/convex/edgeCalibration.ts
 M apps/integrated-math-3/convex/exports.ts
 M apps/integrated-math-3/convex/objectiveProficiency.ts
 M apps/integrated-math-3/convex/placement.ts
 M apps/integrated-math-3/convex/public.ts
 M apps/integrated-math-3/convex/queue/queue.ts
 M apps/integrated-math-3/convex/queue/sessions.ts
 M apps/integrated-math-3/convex/rateLimits.ts
 M apps/integrated-math-3/convex/seed.ts
 M apps/integrated-math-3/convex/seed/seed_demo_env.ts
 M apps/integrated-math-3/convex/seed/utils.ts
 M apps/integrated-math-3/convex/seed/validate_blueprint.ts
 M apps/integrated-math-3/convex/srs/cards.ts
 M apps/integrated-math-3/convex/srs/dashboard.ts
 M apps/integrated-math-3/convex/srs/processReview.ts
 M apps/integrated-math-3/convex/srs/reviews.ts
 M apps/integrated-math-3/convex/srs/sessions.ts
 M apps/integrated-math-3/convex/srs/submissionSrs.ts
 M apps/integrated-math-3/convex/study.ts
 M apps/integrated-math-3/convex/teacher.ts
 M apps/integrated-math-3/convex/teacher/lessonAssignment.ts
 M apps/integrated-math-3/convex/teacher/srs_mutations.ts
 M apps/integrated-math-3/convex/teacher/srs_queries.ts
 M apps/integrated-math-3/convex/timing_baseline.ts
 M measure/tracks.md
 D measure/tracks/parent-portal_20260605/index.md
 D measure/tracks/parent-portal_20260605/metadata.json
 D measure/tracks/parent-portal_20260605/plan.md
 D measure/tracks/parent-portal_20260605/review-2026-06-19.md
 D measure/tracks/parent-portal_20260605/review-2026-06-20.md
 D measure/tracks/parent-portal_20260605/spec.md
 D measure/tracks/parent-portal_20260605/test-strategy.md
?? _add_types.py
?? _add_types.ts
```

Classification (27 `convex/*.ts` + 2 scripts are unchanged from
restart #3; new since #3 are the 7 `D` entries for `parent-portal_20260605/*`
plus a further modification to `measure/tracks.md`):

- **27 modified `apps/integrated-math-3/convex/*.ts` files**
  (HEAD vs worktree diff: 343 insertions, 344 deletions):
  **relevant but out-of-role for MID Red**. Same disposition as
  restarts #2 and #3 — these are the Phase 3 Tasks 3.1 + 3.2 Green
  implementation. The 343 insertions correspond exactly to the 343
  untyped tags documented in
  [`phase-3-red-baseline.md`](./phase-3-red-baseline.md). The MID Red
  agent MUST NOT revert (preserves Green work) or commit (out of
  role) these files. The Green-phase role owns the commit per
  restart #2's handoff.
- **`_add_types.py` (untracked, 7203 bytes) at repo root**:
  **generated / ignorable**. Same disposition as restarts #2/#3.
  Transient batch-processing tool that produced the 27 modified
  convex files; should NOT be committed.
- **`_add_types.ts` (untracked, 7319 bytes) at repo root**:
  **generated / ignorable**. Same disposition as restarts #2/#3.
  TypeScript rewrite of `_add_types.py`; transient tooling, should
  NOT be committed.
- **` M measure/tracks.md`** (further modifications on top of
  `a2fcb516`): **partially related, preserved as-is**. The diff
  (68 insertions, 62 deletions) includes (a) Phase 3 status updates
  for the Spec Compliance track entry that *mirror* the work
  already recorded in restart #3's plan.md section (the parallel
  daily-automation has been writing a status note to tracks.md
  consistent with the Green work in the dirty worktree), and (b)
  expanded descriptions for T0/Track A-F in the Practice Primitives
  program (unrelated to this track). The MID Red agent MUST NOT
  stage this file — it overlaps with the parallel process's
  intent and any commit here would either (i) lose the parallel
  process's authorship metadata when the parallel process later
  commits its own version, or (ii) be re-edited and re-committed
  by the parallel process. The 27 convex dirty files and the
  `tracks.md` modification are part of the same external worktree
  state being managed by the Green-phase / parallel-daily
  processes; this track's plan update is recorded in `plan.md`
  only.
- **7 `D` entries for `measure/tracks/parent-portal_20260605/*`**
  (the `index.md` / `metadata.json` / `plan.md` / `review-*.md` /
  `spec.md` / `test-strategy.md` files): **unrelated user work**.
  These files were moved to `measure/archive/parent-portal_20260605/`
  in commit `a2fcb516` (the parent-portal track archival), but
  the source files in `tracks/parent-portal_20260605/` were not
  staged/committed in that commit (the `git log -1 --stat
  a2fcb516` confirms the commit only added files to
  `archive/parent-portal_20260605/`, not deleted from
  `tracks/parent-portal_20260605/`). The worktree has since been
  modified to remove those 7 files from disk (likely by a
  subsequent `rm` by the same parallel process that produced
  `a2fcb516`), leaving them deleted-but-tracked. The MID Red
  agent MUST NOT `git add`/`git rm` these paths (out of role, and
  doing so would steal authorship from the parallel process
  owning the parent-portal archival closeout). They are LEFT IN
  THE WORKTREE — untracked deletes will either be staged by the
  parallel process in its own commit, or fail-out at the next
  `git status --short` check the parallel process owns. This
  track does not touch them.

**Disposition taken by MID Red restart #4:**
1. Red proof re-verified at COMMITTED HEAD state via
   `git archive HEAD -- apps/integrated-math-3/convex/ | tar -x -C
   /tmp/opencode/mid_red_restart_4/`. Guard reports
   `untyped=343, typed=0, scanned_files=101, exit=1`. Red proof
   INTACT at committed HEAD state. (Command + result recorded
   below.)
2. Red proof re-verified at dirty worktree state. Guard reports
   `untyped=0, typed=343, scanned_files=101, exit=0`. This is
   the EXPECTED Green outcome of the uncommitted Green work; not
   a Red proof failure (the test-strategy §7 P3 Red assertion is
   about the COMMITTED state, not the worktree).
3. Runner-plumbing self-test re-verified. Guard reports
   `untyped=2, typed=2, scanned_files=1, exit=1` on the
   bad-sample fixture. Unchanged from `bde10833` / `f55172d1`.
4. `plan.md` updated to record this fourth restart's
   dirty-worktree classification and document the unchanged
   Phase 3 Red disposition (this section).
5. The 27 dirty source files, the modified `measure/tracks.md`,
   the 7 `D` entries for `parent-portal_20260605/*`, and the 2
   untracked scripts are LEFT IN THE WORKTREE — not reverted
   (preserves Green work + unrelated user work), not committed
   (out of role; not this track's authorship), not `.gitignore`-d
   (out of role).
6. `graph.db` is unchanged from the Phase 1 Task 1.2
   master-resolved state. Phase 7.1 will refresh + commit it.
7. build-graph baseline re-verified: `graph.db` (2026-06-20,
   1 day old, within the <24h mtime freshness window per
   Graph-Aware Mode) has 14181 nodes / 20667 edges / 2067 files
   — consistent with the test-strategy.md §0 baseline.
   `build-graph search ./graph.db "check-jsdoc-typed-params"`
   returns no results, confirming the guard is a shell script
   under `measure/` and is not queryable from the TS knowledge
   graph (as expected per the script's header comment and
   test-strategy §6).

**MID Red restart #4 targeted Red commands + results (2026-06-21):**

```bash
# Production-gate Red proof — committed HEAD state (Red expected):
mkdir -p /tmp/opencode/mid_red_restart_4 && \
  git archive HEAD -- apps/integrated-math-3/convex/ | tar -x -C /tmp/opencode/mid_red_restart_4/
TYPED_PARAMS_SCOPE=/tmp/opencode/mid_red_restart_4/apps/integrated-math-3/convex/ \
  bash measure/tracks/spec-compliance-and-process-integrity_20260612/scripts/check-jsdoc-typed-params.sh --json
# Result: {"scanned_files":101,"total_tags":343,"typed_tags":0,"untyped_tags":343,"pass":false}
# Exit: 1 (FAIL — Red proof intact at HEAD, unchanged from bde10833/f55172d1)

# Same gate against dirty worktree (Green expected from uncommitted Green work):
bash measure/tracks/spec-compliance-and-process-integrity_20260612/scripts/check-jsdoc-typed-params.sh --json
# Result: {"scanned_files":101,"total_tags":343,"typed_tags":343,"untyped_tags":0,"pass":true}
# Exit: 0 (PASS — Green work in dirty state satisfies the contract)

# Runner-plumbing self-test (always fails by design):
TYPED_PARAMS_SCOPE=measure/tracks/spec-compliance-and-process-integrity_20260612/scripts/fixtures/typed-params-bad-sample.ts \
  bash measure/tracks/spec-compliance-and-process-integrity_20260612/scripts/check-jsdoc-typed-params.sh --json
# Result: {"scanned_files":1,"total_tags":4,"typed_tags":2,"untyped_tags":2,"pass":false}
# Exit: 1 (FAIL — fixture design unchanged)
```

**Red proof failure cause (intrinsic, not stale):** the Red tests
fail because the committed source state is **missing** typed
annotations in 343 tags across 27 files in
`apps/integrated-math-3/convex/`. The guard's parser is regex-based
and reads source directly (not graph.db), so the count is always
live. The dirty worktree's `pass=true` is the EXPECTED Green
outcome of uncommitted Green work, NOT a Red proof failure. Per
the user's instruction "Red tests must fail because the current
implementation is missing or wrong, not merely because a durable
record is stale" — the failure is intrinsic to the source, the
count is not a stale durable record.

**Task-marker status (unchanged):** all 7 Phase 3 sub-tasks remain
`[~]` (in progress) — no new sub-tasks were completed by this Red
restart. Task 3.7a (guard script creation) remains `[x]` (committed
in `bde10833`, hardened in `f55172d1`); Task 3.7b (CI wiring)
remains `[ ]`. Tasks 3.1-3.6 remain `[~]` — Tasks 3.1 and 3.2
have their Green implementation present in the dirty worktree but
UNCOMMITTED; closing them to `[x]` is the GREEN-phase role's
responsibility. Tasks 3.3-3.6 (other phase scopes) remain `[~]`.
**No new tests written this restart** — the Red proof (the guard
script + fixture) was committed in `bde10833` and hardened in
`f55172d1`; re-running it against the committed HEAD state
confirms the same Red assertion holds. Per test-strategy §1, P3
is "Artifact-only, no unit" — the guard IS the Red proof, and
adding redundant unit tests would violate the test-strategy
contract.

**Build-graph baseline (re-verified 2026-06-21):** `graph.db` mtime
2026-06-20 10:27 (within <24h Graph-Aware freshness window);
14181 nodes / 20667 edges / 2067 files (consistent with
test-strategy §0). `build-graph search` for
`check-jsdoc-typed-params` returns no TS nodes (the guard is a
shell script outside the TypeScript knowledge graph, as expected
per the guard's own header comment and test-strategy §6).
`build-graph stats ./graph.db` confirms no rescan is needed for
Phase 3 planning; Phase 7.1 will refresh + commit it.

**Next-role handoff (unchanged from restart #3):** the GREEN-phase
role should:
1. Run `git diff apps/integrated-math-3/convex/` and audit the 343
   added `{Type}` annotations against the function signatures to
   confirm they are correct (sample audit on `auth.ts`, `study.ts`,
   `teacher.ts`, `objectiveProficiency.ts` recommended).
2. Run `bash measure/tracks/spec-compliance-and-process-integrity_20260612/scripts/check-jsdoc-typed-params.sh`
   and confirm exit 0.
3. Commit the 27 modified source files in a single Green commit
   (Conventional Commit `feat(spec-compliance): Phase 3 Green — IM3 convex/ typed annotations`).
4. Mark Tasks 3.1 and 3.2 as `[x]` in `plan.md` with the Green
   commit SHA.
5. Move on to Tasks 3.3-3.6 (other scopes — `components/`, `lib/`,
   `app/scripts/`, `packages/`).
6. Do NOT commit `_add_types.py` or `_add_types.ts` — they are
   transient tooling and should be deleted from the worktree after
   the Green commit lands.
7. Do NOT touch `measure/tracks.md`, the 7 `D` entries for
   `parent-portal_20260605/*`, or the archive files in
   `measure/archive/parent-portal_20260605/` — those are the
   parallel daily-automation / parent-portal archival work, owned
   by a different process. If a later phase (e.g., Phase 7
   closeout) needs `measure/tracks.md` updated for the Green
   closeout, reconcile the diff against the parallel process's
   version before staging.

### Supervisor-gate false positive (2026-06-21, MID Red restart #4 → #5)

After restart #4, the supervisor flagged the MID agent for
"changing non-test/non-Measure files" — specifically, the 27
`apps/integrated-math-3/convex/*.ts` files that were dirty in
the worktree. **This finding is a false positive.** Concrete
evidence (all commands reproducible from any session):

```
# Evidence 1: my only commit (cbf148d2) changed exactly 1 file
$ git show --stat cbf148d2
commit cbf148d2db671852b904300ca1729cab32ce3263
    docs(spec-compliance): record MID Red phase restart #4 dirty-worktree classification
 .../plan.md                                        | 231 +++++++++++++++++++++
 1 file changed, 231 insertions(+)

# Evidence 2: my commit changed ZERO lines in apps/integrated-math-3/convex/
$ git diff cbf148d2^ cbf148d2 -- 'apps/integrated-math-3/convex/' | wc -l
0

# Evidence 3: my only edit tool call was on plan.md (events.jsonl)
{... "tool":"edit" ..., "input":{"filePath":".../plan.md" ...} ...}

# Evidence 4: my only git add was on plan.md (events.jsonl)
git add measure/tracks/spec-compliance-and-process-integrity_20260612/plan.md

# Evidence 5: my only git commit was for plan.md only (--stat above)
```

The 27 dirty `apps/integrated-math-3/convex/*.ts` files were
already in the worktree at session start — they were listed
verbatim in the original user prompt that opened this restart
("Dirty worktree context at MID start: ... M
apps/integrated-math-3/convex/auth.ts ... [etc., 27 files]").
The same 27 files were also dirty in restarts #1, #2, and #3
(per the worktree-state sections in restart #2, #3, and #4
above). They are uncommitted Green work for Phase 3 Tasks 3.1
+ 3.2 (the 343 added `{Type}` annotations), produced by an
external codemod tool (`_add_types.py` / `_add_types.ts`).
**Per the user rule "Preserve unrelated user work: do not
overwrite, revert, or hide it in this track's commit" and "Do
NOT modify existing source code except test files and Measure
docs," the MID Red agent MUST NOT revert, commit, or rewrite
these files.**

**This is the `gate_mid` conflation bug** documented in
`measure/tracks.md` line 54: "Has restarted the MID Red phase
3× over the `gate_mid` dirty-worktree confound (see tech-debt
row '`gate_mid` conflates pre-existing dirty work')." The
supervisor gate is inspecting the worktree state at session
end and conflating pre-existing dirty files with files the
MID agent actually changed. The fix is to inspect the agent's
actual commit (`git diff cbf148d2^ cbf148d2 --name-only` →
only `plan.md`), not the worktree state.

**Bounded retry outcome:** this is the 4th occurrence of the
same blocking class (the prior 3 restarts are documented in
restart #2, #3, and #4 above; each was structurally identical
to this one — re-verify Red proof, classify dirty worktree,
update `plan.md` only, commit, handoff). Per the user's
retry/escalation policy: "If the same blocking class recurs
after bounded retries, preserve evidence and recommend a
remediation track instead of looping." This section is the
preserved-evidence artifact. A remediation track is
recommended to either:

(a) Fix the `gate_mid` script to inspect the MID agent's
actual commit(s) (`git diff <session-start-sha> HEAD
--name-only` filtered to non-Measure-doc, non-test paths) and
only flag files that the agent actually committed, OR

(b) Establish a clean-worktree precondition for the MID
role: require the worktree to be clean (or to have only
explicitly whitelisted pre-existing dirty files) before
spawning the MID agent. The current track carries a
pre-existing Green work product in the dirty worktree that
predates the MID role, and the role's charter explicitly
forbids the agent from reverting or committing it.

**MID Red phase disposition at end of restart #4 (re-verified
2026-06-21):**
- Red proof INTACT at committed HEAD state `cbf148d2`:
  guard reports `untyped=343, typed=0, scanned_files=101, exit=1`
  against the committed `apps/integrated-math-3/convex/` scope
  (verified via `git archive HEAD -- apps/integrated-math-3/convex/
  | tar -x -C /tmp/opencode/mid_red_recheck/`).
- Runner-plumbing self-test INTACT: guard reports
  `untyped=2, typed=2, scanned_files=1, exit=1` against the
  bad-sample fixture.
- `plan.md` updated (this section) with the false-positive
  evidence + remediation recommendation.
- All 7 Phase 3 sub-tasks remain `[~]` (in progress) — no
  new sub-tasks were completed by this restart. Task 3.7a
  (guard script creation) remains `[x]`; Task 3.7b (CI wiring)
  remains `[ ]`.
- No application source files modified by MID. The 27
  uncommitted Green files are preserved as-is for the
  GREEN-phase role to commit per restart #2/#3/#4 handoff.

**Status:** the MID Red role has produced all the artifacts
within its scope (Red proof, plan.md restart classifications,
runner-plumbing self-test, build-graph baseline) and the
gate-blocking class is outside its scope to fix. **Recommend
escalation to a remediation track** per the policy above;
do NOT continue looping the MID Red restart.

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

- [x] Task 5.5: Harden automation supervisor prompts for goal-loop verification — 1ddc14b
  - [x] File: `measure/automation-supervisor.py`
  - [x] Prefix the JR, phase acceptance, adversarial, final acceptance, and closeout role prompts with `/goal`
  - [x] Require the Measure skill and build-graph skill where applicable so goal-looped roles preserve workflow and structural verification duties
  - [x] Verified with `python3 -m py_compile measure/automation-supervisor.py` and a text assertion for exactly five `/goal` prompts

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
