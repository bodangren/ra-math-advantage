# Implementation Plan: JSDoc Comments

## Phase 1: BM2 `lib/` — 635 functions

> **Red baseline:** 495 functions with NULL summaries (147 exported + 348 internal). See [`phase-1-red-baseline.md`](./phase-1-red-baseline.md). Guard script: `measure/tracks/jsdoc-comments_20260526/scripts/check-jsdoc-coverage.sh`.
> **Red baseline (Task 1.4 supplement):** 4 JSDoc lines exceed NFR-1 120-char cap. Guard script: `measure/tracks/jsdoc-comments_20260526/scripts/check-jsdoc-line-length.sh`. See `phase-1-red-baseline.md` §"Task 1.4 supplement".
> **Red baseline (Manual Verification supplement):** `VERIFICATION_RESULT: pending` in `phase-1-verification-report.md`. Guard script: `measure/tracks/jsdoc-comments_20260526/scripts/check-phase-verification.sh`. See `phase-1-red-baseline.md` §"User Manual Verification supplement".

- [x] Task 1.1: Add JSDoc to exported functions in BM2 `lib/` [red: 4f873ab4] [green: b18b3ce6]
    - [x] Run `grep -rn "export function\|export async function" apps/bus-math-v2/lib/` to identify exported functions
    - [x] Add standard JSDoc (summary, @param, @returns, @throws) to each exported function
    - [x] Commit: `docs(bus-math-v2): Add JSDoc to exported functions in lib/`
- [x] Task 1.2: Add JSDoc to internal functions in BM2 `lib/` [red: 4f873ab4] [green: b18b3ce6]
    - [x] Run `grep -rn "^function\|^async function\|^const .* = (" apps/bus-math-v2/lib/` to identify internal functions
    - [x] Add standard JSDoc to each internal function
    - [x] Commit: `docs(bus-math-v2): Add JSDoc to internal functions in lib/`
- [x] Task 1.3: Verify phase [green: b18b3ce6]
    - [x] Run `npm run lint --workspace=apps/bus-math-v2` — pre-existing errors only (harness.test.tsx, RendererPreview.tsx)
    - [x] Run `npm run test --workspace=apps/bus-math-v2` — 346/350 files pass; 4 failures are pre-existing (UserMenu, convex-provider)
    - [x] Run `bash measure/tracks/jsdoc-comments_20260526/scripts/check-jsdoc-coverage.sh` — PASS: 0 NULL summaries
    - [x] Run `build-graph scan . ./graph.db` — graph refreshed
    - [x] Commit: `measure(checkpoint): Checkpoint end of Phase 1`
- [x] Task 1.4: Enforce NFR-1 (JSDoc line length ≤120) in BM2 `lib/` [red: b85930f5] [green: a331ea1b]
    - [x] Red: add `scripts/check-jsdoc-line-length.sh` and document baseline in `phase-1-red-baseline.md` §"Task 1.4 supplement"
    - [x] Red: confirm guard FAILS for 4 known long `@param` lines (statement-construction.ts:173, :224; statement-subtotals.ts:167; transactions.ts:301)
    - [x] Green: wrap each long `@param` description across multiple comment lines per `phase-1-red-baseline.md` §"Green-phase definition of done for Task 1.4"
    - [x] Green: re-run guard → exit 0; rerun `npm run lint --workspace=apps/bus-math-v2` (pre-existing errors only) and `npm run test --workspace=apps/bus-math-v2` (346/350 pass, 4 pre-existing failures)
    - [x] Commit (Green): `docs(bus-math-v2): wrap long @param lines for NFR-1 compliance in lib/`
- [x] Task: Measure - User Manual Verification 'Phase 1: BM2 lib/' (Protocol in workflow.md) [red: d8801493] [green: f56680c5]
    - [x] Task 1.4 Green complete — manual verification can now proceed
    - [x] Drive `workflow.md` §"Phase Completion Verification and Checkpointing Protocol" Steps 1-10 against `phase-1-verification-report.md`
    - [x] Update `phase-1-verification-report.md` §"User verdict" with `VERIFICATION_RESULT: approved`, real `VERIFIED_BY`, ISO `VERIFIED_AT`
    - [x] Re-run `bash measure/tracks/jsdoc-comments_20260526/scripts/check-phase-verification.sh` → exit 0
    - [x] [checkpoint: f56680c5]

## Phase 2: BM2 `components/` — 399 functions

> **Red baseline:** 350 functions with NULL summaries (190 exported + 160 internal; 9 already documented). See [`phase-2-red-baseline.md`](./phase-2-red-baseline.md). Guards: `scripts/check-jsdoc-coverage-components.sh`, `scripts/check-jsdoc-line-length-components.sh`, `scripts/check-phase-verification-2.sh`. Plan-vs-graph delta documented in `phase-2-red-baseline.md` §"Plan-vs-graph scope delta".
> **Red baseline (NFR-1 supplement):** 0 JSDoc lines currently exceed 120 chars in scope (the 9 already-documented functions all stay within the cap). The line-length guard is included from the start as a regression net — Green acceptance requires it to remain at 0 violations after Phase 2.
> **Live Red re-verification (2026-06-08, MID at HEAD `37ac2ed1`):** Re-ran all three Phase 2 guards against the fresh `graph.db` (mtime 2026-06-07 19:11). Coverage guard `bash measure/tracks/jsdoc-comments_20260526/scripts/check-jsdoc-coverage-components.sh` → **FAIL (exit 1), 350 NULL summaries** (190 exported / 160 internal; all under `package_id='bus-math-v2'`, scope-isolated). Verification guard `bash measure/tracks/jsdoc-comments_20260526/scripts/check-phase-verification-2.sh` → **FAIL (exit 1), `VERIFICATION_RESULT: pending`** (3 unfilled fields). Line-length guard `bash measure/tracks/jsdoc-comments_20260526/scripts/check-jsdoc-line-length-components.sh` → PASS (0 violations — regression net only, must remain 0 at Green). Red contract holds: the failing guards fail because 350 functions genuinely lack JSDoc in source and the manual-verification protocol has not yet run, not because a durable record is stale. No new guards needed; Phase 2 Red phase remains satisfied by commit `23ab09e2`.
> **Live Red re-verification (2026-06-08, MID at HEAD `9ded32ff`):** Re-ran the three Phase 2 guards at the new HEAD (previous-MID audit-trail commit; no Phase 2 source files modified between `37ac2ed1` and `9ded32ff`, so the graph.db is unchanged and the Red contract remains identical). **Targeted Red command (single, bounded — primary test):** `bash measure/tracks/jsdoc-comments_20260526/scripts/check-jsdoc-coverage-components.sh` → **FAIL (exit 1), 350 NULL summaries** (matches `23ab09e2` baseline; fail count and breakdown 190 exported / 160 internal unchanged). Companion guards: `check-jsdoc-line-length-components.sh` → PASS (0 violations), `check-phase-verification-2.sh` → FAIL (VERIFICATION_RESULT: pending, 3 unfilled fields). No new Red tests added — per test-strategy.md §1, the doc-only track bans new vitest files; the three executable guards in `scripts/` are the complete Red contract and they all execute correctly. Red contract holds at HEAD `9ded32ff`; Phase 2 Red phase remains satisfied by commit `23ab09e2`.
>
> **MID dirty-worktree classification (2026-06-08, at HEAD `9ded32ff`):** The worktree picked up 6 modified files in `apps/bus-math-v2/components/` (all in Phase 2 scope) since the previous MID pass — these are **Green-phase JSDoc implementation work, not Red-phase artifacts**:
> - `apps/bus-math-v2/components/activities/accounting/JournalEntryActivity.tsx` (29 +, 0 −; JSDoc on 4 of 7 NULL functions)
> - `apps/bus-math-v2/components/activities/shared/CategorizationList.tsx` (100 +, 0 −; JSDoc on 11 of 11 NULL functions — fully covered)
> - `apps/bus-math-v2/components/activities/shared/StatementLayout.tsx` (20 +, 0 −; JSDoc on 4 of 7 NULL functions)
> - `apps/bus-math-v2/components/activities/simulations/PayStructureDecisionLab.tsx` (29 +, 0 −; JSDoc on 4 of 10 NULL functions)
> - `apps/bus-math-v2/components/activities/spreadsheet/SpreadsheetHelpers.ts` (100 +, 13 −; JSDoc on 13 of 13 NULL functions — fully covered; 13 single-line `// …` comments replaced with multi-line JSDoc blocks, no logic touched)
> - `apps/bus-math-v2/components/teacher/SubmissionDetailModal.tsx` (83 +, 0 −; JSDoc on 11 of 11 NULL functions — fully covered)
>
> **Classification: relevant to this track/phase, but out of scope for the Red commit.** They are application source-code modifications, not test/plan artifacts; per the MID/Red boundary ("Do NOT modify existing source code except test files and Measure docs"), they cannot be folded into a Red-phase commit. The Red commit (`23ab09e2`) is already in place and the audit-trail update is the only commit this MID owns. **FR-6 invariant holds on the dirty changes**: `git diff --numstat` shows only `+` and `// → /** */` comment-replacement lines (no imports, no signatures, no logic) — verified safe to preserve. All 361 added JSDoc lines stay within NFR-1 120-char cap (per-line awk scan of `git diff` returns 0 violations; line-length guard run against the working tree also returns PASS). The untracked `apps/integrated-math-3/.next/` is generated/ignorable Next.js build output (not in any nested .gitignore, but unrelated to this track) — preserved as user work. **Dirty worktree handling policy for the next role (Green author):** the 6 source files are preserved uncommitted in the working tree; the Green author is expected to add JSDoc to the remaining 303 functions across the other Phase 2 files, fold the 6 dirty files into the appropriate Task 2.1 / Task 2.2 Green commits, and then run `build-graph scan . ./graph.db` once before the Phase 2 Task 2.3 verify step. The Red contract and the three guards continue to be owned by `23ab09e2` and the audit-trail entries above.
>
> **Live Red re-verification (2026-06-08, MID at HEAD `ae377185`):** Re-ran the three Phase 2 guards at the new HEAD (this is the previous-MID audit-trail commit `ae377185`, which only touched `plan.md` and zero source files; the `9ded32ff` → `ae377185` delta is purely a docs-only blockquote append). **Targeted Red command (single, bounded — primary test):** `bash measure/tracks/jsdoc-comments_20260526/scripts/check-jsdoc-coverage-components.sh` → **FAIL (exit 1), 350 NULL summaries** (190 exported / 160 internal — matches `23ab09e2` Red baseline; count and breakdown unchanged). Companion guards: `check-jsdoc-line-length-components.sh` → **PASS (exit 0, 0 violations)** — regression net holds; `check-phase-verification-2.sh` → **FAIL (exit 1, `VERIFICATION_RESULT: pending`, 3 unfilled fields)**. Direct cross-check via `build-graph query ./graph.db "SELECT COUNT(*) FROM nodes WHERE type='function' AND file_path LIKE '%/apps/bus-math-v2/components/%' AND summary IS NULL"` → 350; exported subset → 190 — both match the `23ab09e2` baseline and the `9ded32ff` re-verification. graph.db is unchanged from the last scan (no committed source edits between `9ded32ff` and `ae377185`; the 6 dirty files are uncommitted in the working tree only). No new Red tests added — per test-strategy.md §1, the doc-only track bans new vitest files for doc text; the three executable guards in `measure/tracks/jsdoc-comments_20260526/scripts/` are the complete Red contract and they all execute correctly. Red contract holds at HEAD `ae377185`; Phase 2 Red phase remains satisfied by commit `23ab09e2`.
>
> **MID dirty-worktree classification (2026-06-08, at HEAD `ae377185`):** The dirty worktree is **byte-identical** to the previous MID's classification at `9ded32ff` — the 6 modified files in `apps/bus-math-v2/components/` have not been touched by anyone since (no source-side changes are in `ae377185`; only `plan.md` was modified in that commit). Re-ran the FR-6 invariant probes on the working tree: (a) per-file `git diff | grep -E '^[+-]' | grep -vE '^[+-]\s*(\*|//|/\*\*|\*/|/)' | grep -vE '^[+-]{3}'` returns 0 lines for each of the 6 dirty files — confirming JSDoc/comment additions only, no imports / signatures / logic changes; (b) `find apps/bus-math-v2/components -type f \( -name '*.ts' -o -name '*.tsx' \) -print0 | xargs -0 awk '/^[[:space:]]*\*/ && length > 120 {print FILENAME ":" FNR ":" length}'` returns 0 violations — the line-length guard run against the working tree (which includes the 6 dirty files) still PASSes with 0 violations. The 361 added JSDoc lines and 13 single-line `// …` → `/** */` replacements remain safe to preserve. Untracked `apps/integrated-math-3/.next/` is unchanged: generated Next.js build output, preserved as user work. **Dirty worktree handling policy for the next role (Green author) is unchanged from `9ded32ff`**: preserve the 6 dirty files uncommitted, add JSDoc to the remaining 303 functions across the other Phase 2 files, fold the 6 dirty files into the appropriate Task 2.1 / Task 2.2 Green commits, then run `build-graph scan . ./graph.db` once before Task 2.3 verify. Task markers unchanged: 2.1 [~], 2.2 [~], 2.3 [~], UMV [~] — all still `red: 23ab09e2` — awaiting Green author.
>
> **Supervisor gate feedback (2026-06-08, after MID attempt 1 at HEAD `793dd024`):** The supervisor flagged the mid role for "changing non-test/non-Measure files" because the worktree at the end of mid-attempt-1 contained 6 modified source files in `apps/bus-math-v2/components/`. The mid-attempt-1 commit `793dd024` itself was strictly docs-only (4 insertions to `plan.md`; the diff stat for that commit is `1 file changed, 4 insertions(+)`) — it did not stage or commit the 6 source files. **The 6 files were dirty before mid-attempt-1 started and remained in the working tree untouched by the mid role.** Final FR-6 invariant re-probe confirms 0 non-comment +/- lines across all 6 dirty files; working-tree NFR-1 line-length probe returns 0 violations.
>
> **Resolution / blocked rationale (2026-06-08, MID attempt 2 at HEAD `793dd024`):** Per the user workflow rules, the mid role cannot safely resolve the contaminated worktree:
> - **Boundary:** "Do NOT modify existing source code except test files and Measure docs." The 6 files are in Phase 2 source-code scope, so the mid role cannot add/remove/change any line in them — even though the existing edits are JSDoc-only and FR-6-safe.
> - **No destructive git ops:** AGENTS.md forbids `git reset --hard`, `git checkout -- <file>`, `git push --force`. The 6 files cannot be reverted, dropped, or stashed by destructive means.
> - **No `git stash`:** User rules say "do not overwrite, revert, or hide" user work. `git stash` would hide the 6 files; `git stash --keep-index` would not remove the dirty state.
> - **No fold-into-Red-commit:** The 6 files are "related to this track/phase" (Phase 2 source scope), so the user rule "If dirty changes are relevant, fold them into the Red-phase plan/test commit with explicit plan notes" would normally apply — but the Red-phase boundary forbids modifying/committing source code, so a Red commit can only contain `plan.md` and `scripts/`, not the 6 source files.
>
> **Status: blocked.** The mid role has taken the only action available: (a) re-verify the Red contract at HEAD `793dd024` (3 guards all produce expected results: coverage FAIL exit 1 with 350 NULL summaries, line-length PASS exit 0 with 0 violations, verification FAIL exit 1 with `VERIFICATION_RESULT: pending`); (b) this docs-only `plan.md` blockquote documenting the supervisor feedback and the unresolvable worktree contamination; (c) end with `MEASURE_AGENT_RESULT status: blocked`. **The valid work from the previous attempt is preserved**: the Red baseline at `23ab09e2` and the audit-trail commits `9ded32ff`, `ae377185`, and `793dd024` are all intact in the git log; the new commit for this attempt touches only `plan.md`. **Recommended unblock path (for the supervisor / user, NOT the mid role):** (1) the user/operator commits the 6 dirty files via a `docs(bus-math-v2): partial JSDoc coverage in components/ (Green-phase work-in-progress)` commit, OR (2) the user/operator runs `git stash` to set the 6 files aside and hands the mid role a clean worktree, OR (3) the supervisor relaxes the gate to allow mid role runs with a pre-existing Green-phase worktree (i.e., a worktree with `package_id='bus-math-v2'` source files that have JSDoc-only diffs and pass FR-6/NFR-1). Once the worktree is clean of those 6 files, the next mid role can proceed with normal Red-phase re-verification without further supervision. Task markers unchanged: 2.1 [~], 2.2 [~], 2.3 [~], UMV [~] — all still `red: 23ab09e2` — awaiting unblock.
>
> **Live Red re-verification (2026-06-08, MID at HEAD `16c808ab`):** Re-ran the three Phase 2 guards at the new HEAD (the previous-MID audit-trail commit `16c808ab`, which only touched `plan.md` and zero source files; the `ae377185` → `793dd024` → `16c808ab` delta is purely docs-only blockquote appends). **Targeted Red command (single, bounded — primary test):** `bash measure/tracks/jsdoc-comments_20260526/scripts/check-jsdoc-coverage-components.sh` → **FAIL (exit 1), 350 NULL summaries** (190 exported / 160 internal — matches `23ab09e2` Red baseline; count and breakdown unchanged across all re-verifications). Companion guards: `check-jsdoc-line-length-components.sh` → **PASS (exit 0, 0 violations)** — regression net holds; `check-phase-verification-2.sh` → **FAIL (exit 1, `VERIFICATION_RESULT: pending`, 3 unfilled fields)**. Direct cross-check via `build-graph query ./graph.db "SELECT COUNT(*) AS total, SUM(CASE WHEN summary IS NULL THEN 1 ELSE 0 END) AS null_count, SUM(CASE WHEN summary IS NULL AND tags LIKE '%exported%' THEN 1 ELSE 0 END) AS exported_null FROM nodes WHERE type='function' AND file_path LIKE '%/apps/bus-math-v2/components/%'"` → `total=359, null_count=350, exported_null=190` — all match the `23ab09e2` baseline and every prior re-verification. graph.db is unchanged from the last scan (mtime 2026-06-07 19:11; no committed source edits in the last three audit-trail commits). No new Red tests added — per test-strategy.md §1, the doc-only track bans new vitest files for doc text; the three executable guards in `measure/tracks/jsdoc-comments_20260526/scripts/` are the complete Red contract and they all execute correctly. Red contract holds at HEAD `16c808ab`; Phase 2 Red phase remains satisfied by commit `23ab09e2`.
>
> **MID dirty-worktree classification (2026-06-08, at HEAD `16c808ab`):** The dirty worktree is **byte-identical** to the previous MID's classification at `ae377185` / `793dd024` — the 6 modified files in `apps/bus-math-v2/components/` have not been touched by anyone since (no source-side changes in `16c808ab`; only `plan.md` was modified in that commit). Re-ran the FR-6 invariant probes on the working tree: (a) per-file `git diff | grep -E '^[+-]' | grep -vE '^[+-]\s*(\*|//|/\*\*|\*/|/)' | grep -vE '^[+-]{3}'` returns 0 lines for each of the 6 dirty files — confirming JSDoc/comment additions only, no imports / signatures / logic changes; (b) `find apps/bus-math-v2/components -type f \( -name '*.ts' -o -name '*.tsx' \) -print0 | xargs -0 awk '/^[[:space:]]*\*/ && length > 120 {print FILENAME ":" FNR ":" length}'` returns 0 violations — the line-length guard run against the working tree (which includes the 6 dirty files) still PASSes with 0 violations. The 361 added JSDoc lines and 13 single-line `// …` → `/** */` replacements remain safe to preserve. Untracked `apps/integrated-math-3/.next/` is unchanged: generated Next.js build output, preserved as user work. **Dirty worktree handling policy for the next role (Green author) is unchanged from prior MIDs**: preserve the 6 dirty files uncommitted, add JSDoc to the remaining 303 functions across the other Phase 2 files, fold the 6 dirty files into the appropriate Task 2.1 / Task 2.2 Green commits, then run `build-graph scan . ./graph.db` once before Task 2.3 verify. Task markers unchanged: 2.1 [~], 2.2 [~], 2.3 [~], UMV [~] — all still `red: 23ab09e2` — awaiting unblock.
>
> **Resolution / blocked rationale (2026-06-08, MID at HEAD `16c808ab`):** The situation is identical to the `793dd024` / `16c808ab` block above — the mid role cannot safely resolve the contaminated worktree:
> - **Boundary:** "Do NOT modify existing source code except test files and Measure docs." The 6 files are in Phase 2 source-code scope, so the mid role cannot add/remove/change any line in them.
> - **No destructive git ops:** AGENTS.md forbids `git reset --hard`, `git checkout -- <file>`, `git push --force`. The 6 files cannot be reverted, dropped, or stashed by destructive means.
> - **No `git stash`:** User rules say "do not overwrite, revert, or hide" user work. `git stash` would hide the 6 files.
> - **No fold-into-Red-commit:** The user rule "If dirty changes are relevant, fold them into the Red-phase plan/test commit" would normally apply — but the Red-phase boundary forbids modifying/committing source code, so a Red commit can only contain `plan.md` and `scripts/`, not the 6 source files.
>
> **Status: blocked.** The mid role has taken the only action available: (a) re-verify the Red contract at HEAD `16c808ab` (3 guards all produce expected results: coverage FAIL exit 1 with 350 NULL summaries, line-length PASS exit 0 with 0 violations, verification FAIL exit 1 with `VERIFICATION_RESULT: pending`); (b) this docs-only `plan.md` blockquote documenting the current attempt and the unresolvable worktree contamination; (c) end with `MEASURE_AGENT_RESULT status: blocked`. **The valid work from the previous attempts is preserved**: the Red baseline at `23ab09e2` and the audit-trail commits `9ded32ff`, `ae377185`, `793dd024`, and `16c808ab` are all intact in the git log; the new commit for this attempt touches only `plan.md`. **Recommended unblock path (for the supervisor / user, NOT the mid role)**: (1) the user/operator commits the 6 dirty files via a `docs(bus-math-v2): partial JSDoc coverage in components/ (Green-phase work-in-progress)` commit, OR (2) the user/operator runs `git stash` to set the 6 files aside and hands the mid role a clean worktree, OR (3) the supervisor relaxes the gate to allow mid role runs with a pre-existing Green-phase worktree (a worktree with `package_id='bus-math-v2'` source files that have JSDoc-only diffs and pass FR-6/NFR-1). Once the worktree is clean of those 6 files, the next mid role can proceed with normal Red-phase re-verification without further supervision. Task markers unchanged: 2.1 [~], 2.2 [~], 2.3 [~], UMV [~] — all still `red: 23ab09e2` — awaiting unblock.

- [~] Task 2.1: Add JSDoc to exported functions in BM2 `components/` [red: 23ab09e2]
    - [ ] Run `grep -rn "export function\|export async function\|export default function" apps/bus-math-v2/components/`
    - [ ] Add standard JSDoc (summary, @param, @returns, @throws) to each exported function
    - [ ] Commit: `docs(bus-math-v2): Add JSDoc to exported functions in components/`
- [~] Task 2.2: Add JSDoc to internal functions in BM2 `components/` [red: 23ab09e2]
    - [ ] Identify internal helper functions, event handlers, and callbacks
    - [ ] Add standard JSDoc to each internal function
    - [ ] Commit: `docs(bus-math-v2): Add JSDoc to internal functions in components/`
- [~] Task 2.3: Verify phase
    - [ ] Run `npm run lint --workspace=apps/bus-math-v2`
    - [ ] Run `npm run test --workspace=apps/bus-math-v2`
    - [ ] Run `build-graph scan . ./graph.db` to refresh graph
    - [ ] Re-run `bash measure/tracks/jsdoc-comments_20260526/scripts/check-jsdoc-coverage-components.sh` — must PASS
    - [ ] Re-run `bash measure/tracks/jsdoc-comments_20260526/scripts/check-jsdoc-line-length-components.sh` — must PASS
    - [ ] Commit: `measure(checkpoint): Checkpoint end of Phase 2`
- [~] Task: Measure - User Manual Verification 'Phase 2: BM2 components/' (Protocol in workflow.md) [red: 23ab09e2]

## Phase 3: BM2 `app/`, `convex/`, `scripts/`, `other/` — 253 functions

- [ ] Task 3.1: Add JSDoc to exported functions in BM2 `app/`, `convex/`, `scripts/`, `other/`
    - [ ] Identify exported functions across all remaining BM2 directories
    - [ ] Add standard JSDoc to each exported function
    - [ ] Commit: `docs(bus-math-v2): Add JSDoc to exported functions in app/convex/scripts/other/`
- [ ] Task 3.2: Add JSDoc to internal functions in BM2 `app/`, `convex/`, `scripts/`, `other/`
    - [ ] Identify internal functions across all remaining BM2 directories
    - [ ] Add standard JSDoc to each internal function
    - [ ] Commit: `docs(bus-math-v2): Add JSDoc to internal functions in app/convex/scripts/other/`
- [ ] Task 3.3: Verify phase
    - [ ] Run `npm run lint --workspace=apps/bus-math-v2`
    - [ ] Run `npm run test --workspace=apps/bus-math-v2`
    - [ ] Run `build-graph scan . ./graph.db` to refresh graph
    - [ ] Commit: `measure(checkpoint): Checkpoint end of Phase 3`
- [ ] Task: Measure - User Manual Verification 'Phase 3: BM2 remaining dirs' (Protocol in workflow.md)

## Phase 4: IM3 `convex/` — 146 functions

- [ ] Task 4.1: Add JSDoc to exported functions in IM3 `convex/`
    - [ ] Run `grep -rn "export function\|export async function\|export const" apps/integrated-math-3/convex/`
    - [ ] Add standard JSDoc to each exported function
    - [ ] Commit: `docs(integrated-math-3): Add JSDoc to exported functions in convex/`
- [ ] Task 4.2: Add JSDoc to internal functions in IM3 `convex/`
    - [ ] Identify internal query/mutation/action helpers
    - [ ] Add standard JSDoc to each internal function
    - [ ] Commit: `docs(integrated-math-3): Add JSDoc to internal functions in convex/`
- [ ] Task 4.3: Verify phase
    - [ ] Run `npm run lint --workspace=apps/integrated-math-3`
    - [ ] Run `npm run test --workspace=apps/integrated-math-3`
    - [ ] Run `build-graph scan . ./graph.db` to refresh graph
    - [ ] Commit: `measure(checkpoint): Checkpoint end of Phase 4`
- [ ] Task: Measure - User Manual Verification 'Phase 4: IM3 convex/' (Protocol in workflow.md)

## Phase 5: IM3 `components/` — 125 functions

- [ ] Task 5.1: Add JSDoc to exported functions in IM3 `components/`
    - [ ] Run `grep -rn "export function\|export async function\|export default function" apps/integrated-math-3/components/`
    - [ ] Add standard JSDoc to each exported function
    - [ ] Commit: `docs(integrated-math-3): Add JSDoc to exported functions in components/`
- [ ] Task 5.2: Add JSDoc to internal functions in IM3 `components/`
    - [ ] Identify internal helper functions, event handlers, and callbacks
    - [ ] Add standard JSDoc to each internal function
    - [ ] Commit: `docs(integrated-math-3): Add JSDoc to internal functions in components/`
- [ ] Task 5.3: Verify phase
    - [ ] Run `npm run lint --workspace=apps/integrated-math-3`
    - [ ] Run `npm run test --workspace=apps/integrated-math-3`
    - [ ] Run `build-graph scan . ./graph.db` to refresh graph
    - [ ] Commit: `measure(checkpoint): Checkpoint end of Phase 5`
- [ ] Task: Measure - User Manual Verification 'Phase 5: IM3 components/' (Protocol in workflow.md)

## Phase 6: IM3 `lib/` — 108 functions

- [ ] Task 6.1: Add JSDoc to exported functions in IM3 `lib/`
    - [ ] Run `grep -rn "export function\|export async function" apps/integrated-math-3/lib/`
    - [ ] Add standard JSDoc to each exported function
    - [ ] Commit: `docs(integrated-math-3): Add JSDoc to exported functions in lib/`
- [ ] Task 6.2: Add JSDoc to internal functions in IM3 `lib/`
    - [ ] Identify internal helper functions
    - [ ] Add standard JSDoc to each internal function
    - [ ] Commit: `docs(integrated-math-3): Add JSDoc to internal functions in lib/`
- [ ] Task 6.3: Verify phase
    - [ ] Run `npm run lint --workspace=apps/integrated-math-3`
    - [ ] Run `npm run test --workspace=apps/integrated-math-3`
    - [ ] Run `build-graph scan . ./graph.db` to refresh graph
    - [ ] Commit: `measure(checkpoint): Checkpoint end of Phase 6`
- [ ] Task: Measure - User Manual Verification 'Phase 6: IM3 lib/' (Protocol in workflow.md)

## Phase 7: IM3 `app/`, `scripts/`, `other/` — 119 functions

- [ ] Task 7.1: Add JSDoc to exported functions in IM3 `app/`, `scripts/`, `other/`
    - [ ] Identify exported functions across all remaining IM3 directories
    - [ ] Add standard JSDoc to each exported function
    - [ ] Commit: `docs(integrated-math-3): Add JSDoc to exported functions in app/scripts/other/`
- [ ] Task 7.2: Add JSDoc to internal functions in IM3 `app/`, `scripts/`, `other/`
    - [ ] Identify internal functions across all remaining IM3 directories
    - [ ] Add standard JSDoc to each internal function
    - [ ] Commit: `docs(integrated-math-3): Add JSDoc to internal functions in app/scripts/other/`
- [ ] Task 7.3: Verify phase
    - [ ] Run `npm run lint --workspace=apps/integrated-math-3`
    - [ ] Run `npm run test --workspace=apps/integrated-math-3`
    - [ ] Run `build-graph scan . ./graph.db` to refresh graph
    - [ ] Commit: `measure(checkpoint): Checkpoint end of Phase 7`
- [ ] Task: Measure - User Manual Verification 'Phase 7: IM3 remaining dirs' (Protocol in workflow.md)

## Phase 8: Packages `src/` — 282 functions

- [ ] Task 8.1: Add JSDoc to exported functions in packages `src/`
    - [ ] Run `grep -rn "export function\|export async function\|export const" packages/*/src/`
    - [ ] Add standard JSDoc to each exported function
    - [ ] Commit: `docs(packages): Add JSDoc to exported functions in src/`
- [ ] Task 8.2: Add JSDoc to internal functions in packages `src/`
    - [ ] Identify internal helper functions across all package `src/` dirs
    - [ ] Add standard JSDoc to each internal function
    - [ ] Commit: `docs(packages): Add JSDoc to internal functions in src/`
- [ ] Task 8.3: Verify phase
    - [ ] Run `npm run lint` at repo root
    - [ ] Run `npm run test` at repo root
    - [ ] Run `build-graph scan . ./graph.db` to refresh graph
    - [ ] Commit: `measure(checkpoint): Checkpoint end of Phase 8`
- [ ] Task: Measure - User Manual Verification 'Phase 8: Packages src/' (Protocol in workflow.md)

## Phase 9: Packages `components/`, `lib/`, `other/` — 41 functions

- [ ] Task 9.1: Add JSDoc to exported functions in packages `components/`, `lib/`, `other/`
    - [ ] Identify exported functions across remaining package directories
    - [ ] Add standard JSDoc to each exported function
    - [ ] Commit: `docs(packages): Add JSDoc to exported functions in components/lib/other/`
- [ ] Task 9.2: Add JSDoc to internal functions in packages `components/`, `lib/`, `other/`
    - [ ] Identify internal functions across remaining package directories
    - [ ] Add standard JSDoc to each internal function
    - [ ] Commit: `docs(packages): Add JSDoc to internal functions in components/lib/other/`
- [ ] Task 9.3: Final verification
    - [ ] Run `npm run lint` at repo root
    - [ ] Run `npm run test` at repo root
    - [ ] Run `build-graph scan . ./graph.db` to refresh graph
    - [ ] Verify 0 functions with NULL summaries in scope
    - [ ] Commit: `measure(checkpoint): Checkpoint end of Phase 9`
- [ ] Task: Measure - User Manual Verification 'Phase 9: Packages remaining dirs' (Protocol in workflow.md)
