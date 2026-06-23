# Test Strategy — code-review-remediation_20260624

Role: Measure Strategy (no implementation code; no source edits).
Phase scope: **Phase 1 — Malformed JSDoc remediation + recurrence guard (Cluster A).**
Baseline SHA: `908cfca4`.

> This document covers Phase 1 only. Phases 2–8 will get their own strategy
> updates (live-behavior, generator correctness, etc.). Phase 1 is **all
> artifact-contract** — no runtime behavior is being changed, so no
> vitest/unit tests are in scope unless one is needed as the host for the
> JSDoc guard.

---

## 1. Goal & scope of this phase

Phase 1 has three concrete objectives, in this order:

1. **FR-3 — recurrence guard first.** Land a cheap balanced-brace JSDoc
   guard (shell script under `measure/tracks/<track>/scripts/`) BEFORE
   touching any source. The guard is the Red contract that the rest of the
   phase must satisfy. The guard must fail loudly on (a) the stray ` {} `
   pattern committed at HEAD and (b) any unbalanced `{`/`}` inside a
   `@param`/`@returns` type block.
2. **FR-1 — fix the 4 malformed `@returns` committed at HEAD.** Each rewrite
   is a single targeted JSDoc edit; the file under it must keep its current
   runtime behavior (lint + tsc + tests still pass).
3. **FR-2 — discard and cleanly regenerate the 144-file working-tree
   JSDoc batch.** The batch shipped ~344 malformed `@returns {<type> {} …`
   patterns and ≥78 truncated/unbalanced `@param {…}` types. Strategy: do
   NOT try to surgically repair 144 files. `git restore` them to HEAD, fix
   the upstream generator template, re-run the generator, then verify zero
   violations via the FR-3 guard before re-committing.

Phase 1 is intentionally **artifact-only**. No production behavior changes,
no shipped types change, no Convex API shape changes. This is the cleanest
phase to land first because:

- It has no `learnerState`/curriculum/registry dependency on Phases 2–4.
- It produces the lint guard the rest of the track relies on (any future
  JSDoc regeneration in Phases 2–4 must pass FR-3 on commit).

What Phase 1 explicitly does **not** cover:
- Adding/removing `@param` or `@returns` tags (FR-5 typed-params is owned
  by `spec-compliance-and-process-integrity_20260612`, already complete).
- The `--db` / `--symbol` junk files (FR-15, deferred to Phase 8).
- The JSDoc generator's *coverage* (which functions get JSDoc); only its
  **template correctness** for the tags it already emits.

---

## 2. Pre-conditions / environment

- **Working-tree state at start of Phase 1:** 144 `M` packages/apps/convex
  files from the prior buggy JSDoc batch, plus the 2 untracked junk files
  (`--db`, `--symbol`). Confirmed via `git status --short | wc -l` → 148.
- **HEAD state:** baseline `908cfca4`. Four committed malformed `@returns`
  at the exact spec locations (`git grep -nP '@returns \{.+ \{\}'` returns
  exactly 4 hits at HEAD). Confirmed.
- **Order:** Discard of the 144 working-tree files (Task 1.3) MUST happen
  AFTER FR-3 guard exists and AFTER FR-1 committed fixes, so the guard's
  closeout proof (running against the working tree and getting `0`) is
  honest. If a 144-file restore happens before FR-3 is in place, we lose
  the Red baseline.
- **Test framework:** Phase 1 does not add vitest tests. Per
  `spec-compliance-and-process-integrity_20260612/test-strategy.md §1`
  pattern (artifact-only phases → shell guard, not unit test), the FR-3
  guard is a **bash script** under
  `measure/tracks/code-review-remediation_20260624/scripts/check-jsdoc-balanced-braces.sh`,
  modelled on the existing `check-jsdoc-typed-params.sh`. This keeps it
  invocable from CI, pre-commit, and any track without dragging in vitest.
- **Guard fixture:** a bounded bad-sample TS file lives under
  `measure/tracks/code-review-remediation_20260624/scripts/fixtures/jsdoc-bad-braces-sample.ts`.
  Used for runner-plumbing self-test (per spec-compliance pattern §2):
  fixture proves the guard's runner reports violations; production scope
  proves the guard runs against real code. Neither stands alone.
- **Commands:**
  - RED_TEST_COMMAND (lifecycle inherited): `npm run --workspace=apps/integrated-math-3 test -- --run`
    — used only for the FR-1 file regressions (sanity check), not as the
    primary Red oracle.
  - **Primary Red oracle for FR-3:**
    `bash measure/tracks/code-review-remediation_20260624/scripts/check-jsdoc-balanced-braces.sh`
    on the working-tree scope `apps/ packages/ convex/` (excludes
    `node_modules`, `_generated`, `.next`, `dist`, `*.d.ts`).
    Expected at start: exit 1, >0 violations.
  - PROJECT_LINT: `npm run lint` — must remain green after each commit.
  - PROJECT_CHECKS: `npx tsc --noEmit` — must not show *new* errors versus
    baseline (pre-existing tsc red is documented in tech-debt; no
    regression allowed).

---

## 3. Red phase contract (per task in Phase 1)

Each Red is a **bounded falsifiable artifact** — never a parity oracle and
never source-grep for the symbol's *name*. The guard searches for the
**malformed shape**; it cannot be satisfied by renaming a tag.

### Task 1.1 — FR-3 balanced-brace guard (Red)

- **What is authored:** `scripts/check-jsdoc-balanced-braces.sh` +
  `scripts/fixtures/jsdoc-bad-braces-sample.ts`.
- **Fixture content (bounded):** A TS file with exactly four JSDoc tags
  reproducing the live failure modes:
  1. `@returns {string {} ` — stray ` {} ` after the type (the FR-1 mode).
  2. `@returns {JSX.Element} {Promise<string | null> {} ` — doubly broken
     (the `review-queue/route.ts` mode).
  3. `@param {(expression: string, problemType: string)} props` —
     truncated function type (the `StepByStepper.tsx:108` mode; closing
     `=> string[]` and inner `})` lost).
  4. A clean control: `@returns {string} description` — must NOT be flagged.
- **Red assertion shape:**
  - `bash scripts/check-jsdoc-balanced-braces.sh` against the fixture
    scope reports `violations=3, clean=1, exit=1`.
  - `bash scripts/check-jsdoc-balanced-braces.sh` against
    `apps/ packages/ convex/` at baseline `908cfca4` (HEAD) reports
    **4 violations** (the FR-1 commits) and exit 1.
  - `bash scripts/check-jsdoc-balanced-braces.sh` against the working
    tree (with the 144 unrestored files present) reports **≥344
    violations** and exit 1.
- **Why it is meaningful (not a parity / grep oracle):** It does not
  search for the symbol name "JSDoc" or for "malformed". It enforces a
  syntactic invariant directly derived from the JSDoc spec: inside a
  `@param`/`@returns` tag, the substring between the tag keyword and the
  next non-brace token must contain a single balanced `{…}` block, with
  no stray ` {} ` afterward and no unmatched `{`. Any future
  malformed-tag pattern that satisfies the syntactic invariant is, by
  definition, not the bug class this track fixes.
- **Detector strategy (for the implementer, not enforced here):** scan
  per-tag-line + continuation lines; count `{` and `}` across the
  contiguous tag region; flag (a) unbalanced count, (b) presence of
  ` {} ` after the closing brace of the first balanced block on the same
  line, (c) tag region that contains two `{` before any `}`. The shell
  script uses POSIX ERE + per-line aggregation, modeled on
  `check-jsdoc-typed-params.sh` so it inherits the same scope/exclusion
  pattern (node_modules, _generated, .d.ts, .next, dist, .wrangler).

### Task 1.2 — FR-1 four committed malformed `@returns` (Red)

The Red for the four files is **the FR-3 guard, already failing on each
of those four locations**. We do NOT author per-file unit tests for a
JSDoc-comment fix. Doing so would be exactly the anti-pattern Cluster G
warns about (asserting on text presence).

- **Red assertion shape (recorded for the mid-red role):**
  - At HEAD baseline:
    ```
    bash scripts/check-jsdoc-balanced-braces.sh apps/integrated-math-3/app/api/dev/review-queue/route.ts
    bash scripts/check-jsdoc-balanced-braces.sh apps/integrated-math-3/app/api/student/lesson-chatbot/route.ts
    bash scripts/check-jsdoc-balanced-braces.sh apps/integrated-math-3/components/teacher/gradebook/CourseOverviewGrid.tsx
    bash scripts/check-jsdoc-balanced-braces.sh packages/knowledge-space-practice/src/projections/activity-map.ts
    ```
    Each → exit 1, violations=1.
  - Aggregate at HEAD with those four files in scope → violations=4.
- **No vitest is added for FR-1.** A "JSDoc text matches X" vitest is a
  doc-presence assertion, not a behavioral test. The guard is the
  evidence. The file's existing unit tests must keep passing as a sanity
  check that the JSDoc edit did not accidentally damage code.

### Task 1.3 — FR-2 discard + regenerate (Red)

- **Pre-Red artifact:** capture the 144-file list before restore:
  `git status --short | rg "^ M " > measure/tracks/code-review-remediation_20260624/_artifacts/restored-files.txt`
  (committed inside the eventual FR-2 commit's body, NOT into the tree,
  so the artifact survives review and can be diffed against the
  re-generated batch.) Note: `_artifacts/` directory creation is owned
  by mid-red. Strategy reserves the path.
- **Red assertion shape (after `git restore` but before regeneration):**
  - FR-3 guard against `apps/ packages/ convex/` reports `4` violations
    (only the committed FR-1 cases remain — if FR-1 is landed first, it
    reports `0`).
  - `git diff --name-only` reports `0` working-tree changes.
- **Red after regeneration (intermediate):** the regenerated batch is
  scanned by the FR-3 guard. Target: `0` violations. If any non-zero
  count appears, the generator template fix is incomplete; iterate
  on the generator, not on the output, until the guard is clean.
- **Why the generator fix is the real Red, not a per-file test:** the
  144-file batch is regenerated machine output. Fixing it file-by-file
  would re-create the same defect on the next regeneration. The
  generator template — wherever it lives in tooling/agent prompts —
  is the root cause. Strategy permission: mid-red may treat the
  generator-template fix as the Green for FR-2, with the FR-3 guard's
  `0` count as the Red→Green pivot.

---

## 4. Green phase contract

### Task 1.1 — Green
- Implement `scripts/check-jsdoc-balanced-braces.sh` so it:
  - Exits `0` when scope contains no malformed tags.
  - Exits `1` and emits a top-25 file list (untyped vs unbalanced
    counts) when violations exist.
  - Exits `3` on misuse (missing grep/xargs/scope).
- Commit shape: `test(code-review-remediation): Phase 1 Red — FR-3
  balanced-brace JSDoc guard`. The fixture is committed in the same
  commit so the runner-plumbing self-test is reproducible.

### Task 1.2 — Green (four FR-1 fixes)
- Rewrite each malformed `@returns` to the canonical
  `@returns {<balanced type>} <prose>` form. Suggested rewrites
  (mid-red is not bound to these but they're the minimal correct
  shape — types match the actual function signatures):
  - `app/api/dev/review-queue/route.ts:141` →
    `@returns {Promise<string | null>} The Convex profile ID, or null if no profile exists.`
  - `app/api/student/lesson-chatbot/route.ts:24` →
    `@returns {string} The sanitized input safe for inclusion in an AI prompt.`
  - `components/teacher/gradebook/CourseOverviewGrid.tsx:16` →
    `@returns {CourseOverviewRow[]} Sorted rows array.`
  - `packages/knowledge-space-practice/src/projections/activity-map.ts:65` →
    `@returns {ProjectedActivity[]} Sorted array of projected activities.`
- After each fix: `npm run lint` + `npx tsc --noEmit` + the workspace
  test command must pass. The FR-3 guard run against just that file
  goes from violations=1 to violations=0.
- **Order:** all four can land in a single commit. The four files have
  no shared semantic dependency; the diff is purely cosmetic.
- Commit shape: `fix(code-review-remediation): Phase 1 Green — FR-1
  rewrite 4 committed malformed @returns annotations`.
- Closeout for FR-1: aggregate FR-3 guard run across
  `apps/ packages/ convex/` (with working tree NOT yet restored) drops
  from `>=348` violations to `>=344` (HEAD-committed 4 removed). After
  Task 1.3 lands, that count goes to `0`.

### Task 1.3 — Green (FR-2)
- **Step A:** `git restore -- $(git status --short | rg "^ M " | sed 's/^ M //')`
  (or equivalent; mid-red may use `git checkout -- .` only after
  verifying no Phase-1 work files are unstaged). Record the file list
  before restore.
- **Step B:** Identify and fix the JSDoc generator that produced the
  malformed batch. Strategy could not locate a checked-in generator
  script (`scripts/`, `measure/scripts/`, and package-level toolchains
  contain no JSDoc generator); the batch was likely produced by an
  agent-driven workflow whose prompt template is the actual root cause.
  Mid-red's first sub-task here is **discovery**: trace the malformed
  batch back to its producer. If the producer is an agent prompt, the
  template fix is a documented prompt-template diff committed to
  `measure/lessons-learned.md` plus the corrected template stored under
  `measure/tracks/code-review-remediation_20260624/templates/jsdoc-template.md`.
  If the producer is a checked-in script, fix the script's
  `@returns`/`@param` emitter and commit alongside.
- **Step C:** Re-run the generator across the same 144 files.
- **Step D:** Run the FR-3 guard against
  `apps/ packages/ convex/` — must return `0`.
- **Step E:** `npm run lint` + `npx tsc --noEmit` must pass. Test
  suites must still pass.
- Commit shape: split into 2 commits:
  1. `chore(code-review-remediation): Phase 1 Green — discard malformed
     JSDoc working-tree batch (FR-2 step A)` — pure `git restore`, no
     other diff. This commit's body lists the 144 file paths.
  2. `fix(code-review-remediation): Phase 1 Green — corrected JSDoc
     generator template + clean regeneration (FR-2 steps B–E)` — the
     template fix plus the regenerated 144 files.
  Splitting these matters because step A is a pure revert (auditable
  in 1 click) and step B–E is the real fix (auditable on its own).

### Phase 1 closeout gate

- `git grep -nP '@returns \{.+ \{\}' -- '*.ts' '*.tsx'` → 0 matches.
- `git grep -nP '@param \{[^{}]*$'  -- '*.ts' '*.tsx'` → 0 matches.
- `bash scripts/check-jsdoc-balanced-braces.sh` (default scope) → exit
  0, violations 0.
- `bash scripts/check-jsdoc-balanced-braces.sh fixtures/jsdoc-bad-braces-sample.ts`
  → exit 1, violations 3 (runner-plumbing self-test).
- `npm run lint` → green.
- `npx tsc --noEmit` → no NEW errors vs baseline.
- `npm run --workspace=apps/integrated-math-3 test -- --run` →
  unchanged pass count vs baseline.

---

## 5. Anti-pattern guards (Phase 1 specifically)

Per `lessons-learned.md` (2026-06-12 spec-compliance entry) and
spec §FR-20, these patterns are **prohibited** in Phase 1 work:

1. **Source-grep for a symbol name.** A test/guard that searches for
   the literal `"JSDoc"`, `"@returns"`, or a function name and asserts
   presence/absence does not prove the bug class is gone. The FR-3
   guard must check **syntactic shape**, not symbol name.
2. **"Balanced braces parse" as the only assertion.** Counting
   `{`/`}` globally per file would pass even if the malformed pattern
   has been merely rearranged. The guard MUST tie balance to the
   `@param`/`@returns` tag region, not to whole-file brace counts.
3. **Type-only checks.** `npx tsc --noEmit` is silent on JSDoc type
   tags inside `.ts` files (only `.js` with `// @ts-check` consults
   them). Relying on tsc to catch this class is exactly why the
   defects shipped. Phase 1 must not lean on tsc as the FR-3 oracle.
4. **Vitest test asserting JSDoc text presence.** Doc-presence
   assertions are forbidden by FR-20. Phase 1 has no behavioral
   surface to test; the artifact guard is the proof.
5. **Surgical per-file repair of the 144-file batch.** The batch is
   regenerated output. Repairing files would mask the upstream
   template defect and let it recur on next generation.
6. **Tagging the 4 FR-1 commits before FR-3 lands.** The guard must
   exist FIRST so its Red baseline is honest. Reversing order makes
   the guard's "I caught these" claim unfalsifiable.
7. **Restoring the 144 files before FR-3 + FR-1 land.** The 344-violation
   baseline is evidence the guard works at production scale.
8. **Aggregate `npm test` swallowing the FR-3 guard.** The guard exits
   non-zero on violations; it must be invoked explicitly in CI and in
   pre-commit, not piped through a try/catch.

---

## 6. Test file inventory (Phase 1)

| Path | Purpose |
|---|---|
| `measure/tracks/code-review-remediation_20260624/scripts/check-jsdoc-balanced-braces.sh` | FR-3 balanced-brace JSDoc guard (production gate, shell script). Modeled on `spec-compliance.../scripts/check-jsdoc-typed-params.sh`. |
| `measure/tracks/code-review-remediation_20260624/scripts/fixtures/jsdoc-bad-braces-sample.ts` | Bounded bad-sample fixture proving the guard reports violations (runner plumbing self-test, NOT a production gate). |
| `measure/tracks/code-review-remediation_20260624/_artifacts/restored-files.txt` | Snapshot of the 144 working-tree files before `git restore` (audit trail for FR-2 step A). |
| `measure/tracks/code-review-remediation_20260624/templates/jsdoc-template.md` | Documented corrected JSDoc generator template (FR-2 step B output). Conditional — only if the generator turns out to be a prompt/template rather than a checked-in script. |

No vitest files are added or modified in Phase 1.

`apps/integrated-math-3/components/teacher/gradebook/CourseOverviewGrid.tsx`
and the other three FR-1 files are source edits, not test files; they are
listed under §4 commit plan, not here.

---

## 7. Acceptance evidence

When Phase 1 completes, the following artifacts must be attached to the
Phase-1 checkpoint commit's git note (per workflow.md §70–§104):

1. **Guard output (clean):**
   `bash measure/tracks/code-review-remediation_20260624/scripts/check-jsdoc-balanced-braces.sh`
   stdout, exit 0, violations 0, scanned-files count.
2. **Guard output (fixture, Red proof):**
   `TYPED_PARAMS_SCOPE=measure/tracks/code-review-remediation_20260624/scripts/fixtures/jsdoc-bad-braces-sample.ts bash .../check-jsdoc-balanced-braces.sh`
   stdout, exit 1, violations=3.
3. **`git grep` final scans:** `@returns \{.+ \{\}` → 0, `@param \{[^{}]*$` → 0.
4. **Commit SHAs (in order):**
   - FR-3 guard commit (test).
   - FR-1 four-file fix commit (fix).
   - FR-2 step-A restore commit (chore).
   - FR-2 step-B generator+regenerate commit (fix).
   - Plan-update commit marking Phase 1 complete.
5. **Lint + tsc + test outputs:** stored under `_artifacts/phase-1-gates.txt`.
6. **The 144-file restore list:** `_artifacts/restored-files.txt`, attached
   inline to the step-A commit's git note.

---

## 8. Risks & open questions (for the next role)

1. **Generator producer is unknown.** Strategy could not locate a
   JSDoc generator under `scripts/`, `measure/scripts/`, `packages/*/scripts`,
   or any obvious `.mjs`/`.ts` toolchain file. The malformed batch is
   most likely from an agent run. Mid-red MUST trace the producer
   (via `git reflog`, the most recent staged batch's commit message
   pattern, or by asking the user) before re-running. Re-running with
   the same buggy template wastes the whole regeneration step.
2. **Working-tree restore is destructive.** `git restore` discards the
   working-tree edits permanently. Capture `restored-files.txt`
   FIRST. If the user has any other unstaged work in those files
   (unlikely, but possible), confirm before restore.
3. **Some FR-2 patterns may not be a pure restore.** A small number of
   working-tree files may contain legitimate non-JSDoc edits
   inadvertently bundled with the JSDoc batch. Strategy did not audit
   the 144 diffs file-by-file. Mid-red should `git diff --stat` first
   and sample 3–5 files; if any contain non-JSDoc changes, those must
   be preserved (e.g., via `git stash` of a narrowed range, or
   per-file revert of only JSDoc hunks). The default assumption is
   pure JSDoc; deviations must be flagged.
4. **`packages/knowledge-space-core/src/__tests__/placement-engine-extra*.test.ts`
   are intentionally-RED** (per spec-compliance test-strategy §8). They
   must not be silently swallowed by the closeout `npm test` aggregate.
   Phase 1 should not run a full aggregate suite; the workspace test
   command in the env is `--workspace=apps/integrated-math-3 test`,
   which does not include those files. Mid-red: do not "expand to all
   packages" without consulting that exclude policy.
5. **FR-3 guard's regex must allow nested generics and union types.**
   Real `@returns` types include `Promise<Map<string, KnowledgeSpaceNode[]>>`,
   `error is Error & { status?: number }`, and
   `{ a: number; b: number; c: number } | null`. The balance check is
   NOT "any nested `{` is malformed" — it is "every `{` has a matching
   `}` inside the tag region, and there is no orphaned ` {} ` after the
   first balanced block." Test the regex against the 4 FR-1 cases AND
   the existing clean cases (`packages/core-auth/src/session.ts` has
   ~12 well-formed `@returns` tags — they must all stay clean).
6. **The fixture must include a clean control.** If the fixture is
   100% malformed, a guard with a hard-coded "always fail" branch
   would pass the runner-plumbing test. Include at least one clean
   `@returns {string} description` to prove the guard distinguishes.

---

## 9. Commit & handoff plan

**Expected Phase-1 commit sequence (5 commits + checkpoint):**

| # | Type | Scope | Subject |
|---|---|---|---|
| 1 | `test` | code-review-remediation | Phase 1 Red — FR-3 balanced-brace JSDoc guard + fixture |
| 2 | `fix`  | code-review-remediation | Phase 1 Green — FR-1 rewrite 4 committed malformed `@returns` |
| 3 | `chore` | code-review-remediation | Phase 1 Green — discard malformed JSDoc working-tree batch (FR-2 step A) |
| 4 | `fix`  | code-review-remediation | Phase 1 Green — corrected JSDoc generator template + clean regeneration (FR-2 steps B–E) |
| 5 | `measure(plan)` | — | Mark Phase 1 tasks complete with commit SHAs |
| 6 | `measure(checkpoint)` | — | Checkpoint end of Phase 1 |

Each of commits 1–4 gets a git note per workflow.md step 10 (task
summary, files changed, why).

**What mid-red needs to know (handoff):**

1. Start with the FR-3 guard (Task 1.1). Do not touch the four FR-1
   source files or run `git restore` until the guard exists and is
   failing on the baseline.
2. The guard's primary contract is the **syntactic invariant**, not a
   symbol list. Use POSIX ERE + per-line aggregation. Cross-check
   against `packages/core-auth/src/session.ts` clean tags to avoid
   false positives.
3. For FR-1, do not author JSDoc-text vitest tests. The guard is the
   evidence. The FR-1 commit's lint/tsc/test runs are sanity checks
   only.
4. For FR-2, **trace the generator producer before re-running**. If
   the producer is a prompt template, commit the corrected template
   to `measure/tracks/code-review-remediation_20260624/templates/`
   and reference it in lessons-learned.
5. Capture `_artifacts/restored-files.txt` BEFORE `git restore`.
6. Closeout requires both the production-scope guard run (exit 0) and
   the fixture-scope guard run (exit 1). Both must be in the
   checkpoint git note.
7. Do not touch `--db`, `--symbol`, or any Phase 2–8 scope from this
   phase. They are explicitly out of Phase 1.
