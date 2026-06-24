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

---

## 10. Red Evidence (mid-red, 2026-06-24)

### Guard script + fixture

- **Script:** `measure/tracks/code-review-remediation_20260624/scripts/check-jsdoc-balanced-braces.sh`
  - awk-based scanner, models on `check-jsdoc-typed-params.sh`
  - Detects 3 violation classes: UNBALANCED (missing `}`), UNBALANCED_PARENS (truncated function types), STRAY_BLOCK (orphaned `{…}` after balanced type)
  - Exit codes: 0 clean / 1 violations / 3 misuse

- **Fixtures:** `measure/tracks/code-review-remediation_20260624/scripts/fixtures/`
  - `malformed-1.ts` — `@returns {string {} desc` → violations=1, UNBALANCED, exit 1 ✅
  - `malformed-2.ts` — `@param {(expression: string, problemType: string} props` → violations=1, UNBALANCED_PARENS, exit 1 ✅
  - `malformed-3.ts` — `@returns {string} {Promise<string | null> {} extra` → violations=1, STRAY_BLOCK, exit 1 ✅
  - `clean-1.ts` — balanced types + nested generics → violations=0, exit 0 ✅

### Production-scope Red baseline

- **Dirty working tree (144 files):**
  ```
  bash .../check-jsdoc-balanced-braces.sh "apps/ packages/ convex/"
  → Scanned files: 2237, Total typed tags: 1648, Violations: 358, exit 1
  ```
  Captured to `_artifacts/guard-run-on-dirty-tree.txt`.

- **FR-1 files at HEAD (each individually):**
  - `route.ts` (review-queue): violations=1, STRAY_BLOCK, exit 1 ✅
  - `route.ts` (lesson-chatbot): violations=1, UNBALANCED, exit 1 ✅
  - `CourseOverviewGrid.tsx`: violations=1, UNBALANCED, exit 1 ✅
  - `activity-map.ts`: violations=1, UNBALANCED, exit 1 ✅

### Artifacts captured

- `_artifacts/restored-files.txt` — 144-file dirty list (captured BEFORE any restore)
- `_artifacts/guard-run-on-dirty-tree.txt` — full guard output on dirty tree
- `_artifacts/fr1-rewrites.md` — proposed rewrites for the 4 FR-1 files

### Red tasks completed

- [x] Task 1.1 Red: guard script + fixture authored and verified
- [x] Task 1.2 Red: FR-1 files confirmed as violations by guard (no vitest needed)
- [x] Task 1.3 Red: `restored-files.txt` captured (NO `git restore` performed — Green's job)

## 11. Green Evidence (jr-green, 2026-06-24)

### FR-3 guard (production scope) — Clean

```
bash .../check-jsdoc-balanced-braces.sh "apps/ packages/ convex/"
→ Scanned files: 2237, Total typed tags: 663, Violations: 0, exit 0
```

Captured to `_artifacts/guard-run-on-clean-tree.txt`.

### FR-3 guard (fixtures) — 3 violations detected, 0 on clean

| Fixture | Class | Violations | Exit |
|---|---|---|---|
| `malformed-1.ts` | UNBALANCED | 1 | 1 |
| `malformed-2.ts` | UNBALANCED_PARENS | 1 | 1 |
| `malformed-3.ts` | STRAY_BLOCK | 1 | 1 |
| `clean-1.ts` | (none) | 0 | 0 |

### `git grep` final scans (production scope, `apps/**/*.ts(x)`, `packages/**/*.ts(x)`, `convex/**/*.ts(x)`)

- `@returns \{.+ \{\}` → **0 matches**
- `@param \{[^{}]*$` → **0 matches**

### Commit SHAs (Phase 1 Green)

| # | Commit | Subject |
|---|---|---|
| 1 | e195fded (Red, mid-red) | `test(code-review-remediation): Phase 1 Red — FR-3 balanced-brace JSDoc guard + fixtures + evidence` |
| 2 | d26ecd52 (Green A) | `fix(code-review-remediation): rewrite 4 malformed FR-1 @returns annotations` |
| 3 | 5ebf5195 (Green A.5) | `fix(code-review-remediation): close 2 additional @param unbalanced braces at HEAD` |
| 4 | 0006074f (Green B) | `chore(code-review-remediation): restore 144 working-tree files to HEAD` |
| 5 | b3cf07e6 (Green C) | `docs(code-review-remediation): add jsdoc generator template + investigation` |
| 6 | (this plan update) | Mark Phase 1 tasks complete with commit evidence |

### Lint / tsc / test (targeted — per test-strategy §2)

- Lint on the 4 FR-1 + 2 @param fixed files: 0 errors, 0 new warnings
  - 2 pre-existing warnings in `apps/integrated-math-3/__tests__/lib/onboarding/student-flow.test.ts`
    are unrelated to this track (file last touched by `83f52501` onboarding-roster-import Phase 4 Red).
- Tsc on the 4 FR-1 + 2 @param fixed files: 0 new errors
  - 318 pre-existing errors in IM3 + 10 in ksp are out of scope per test-strategy §2
    (documented in `measure/tech-debt.md`).
- Targeted vitest on `apps/integrated-math-3/__tests__/components/teacher/gradebook`
  (incl. CourseOverviewGrid): **45/45 pass**.
- Targeted vitest on `apps/integrated-math-3/__tests__/lib/auth`: **45/45 pass**.
- Targeted vitest on `packages/knowledge-space-practice/src/__tests__/projections.test.ts`
  (incl. activity-map): **17/17 pass**.

### Discovery beyond spec

- The strategy's Red baseline (4 FR-1 violations at HEAD) was an
  undercount. The actual baseline at HEAD is **6 violations** — the 4
  FR-1 `@returns` cases + 2 additional `@param` cases:
  - `apps/integrated-math-3/components/teacher/srs/StrugglingStudentsPanel.tsx:23`
  - `apps/integrated-math-3/components/dev/review-queue/index.tsx:493`
  These were committed by spec-compliance Phase 3 (`a5c2d410`) and not
  caught by the spec-compliance typed-params guard. They are the same
  bug class (truncated object/function type literal in `@param`).
  Fixed in commit `5ebf5195`. The Phase 1 closeout gate
  (exit 0 / violations 0) required fixing them; the spec enumerated
  only 4 cases but the gate is general.
- The 144-file working-tree batch is **agent-driven**, not from a
  checked-in script. The bug class was previously committed by
  spec-compliance Phase 3 (a5c2d410, 76765734) on apps/integrated-math-3/.
  The 144-file batch is a parallel agent run for packages/ with the
  same defect. Generator investigation: `_artifacts/generator-investigation.md`.
  Corrected template: `templates/jsdoc-template.md`.

### Green tasks completed

- [x] Task 1.1 Green: guard script implemented and verified
- [x] Task 1.2 Green: 4 FR-1 files rewritten, per-file guard violations=0
- [x] Task 1.2.5 Green: 2 additional HEAD @param fixes (extension beyond FR-1 spec)
- [x] Task 1.3 Green-A: 144-file restore committed
- [x] Task 1.3 Green-B: generator template + investigation committed
- [x] Phase 1 closeout: FR-3 guard exit 0 / violations 0; fixtures pass; grep clean

---

# Phase 2 — Production-wiring scope & dead work (Cluster B)

Baseline SHA for Phase 2: `e992abbf` (Phase 1 fully closed).
Role: Measure Strategy. No source edits; no test code authored by strategy.

> Phase 2 is the first **behavioral** phase of the track. Unlike Phase 1 (all
> artifact/lint), every Red here MUST be a live-behavior test executing the
> production handler against a Convex-style mock context and asserting on its
> observable output. This is the phase the FR-20 anti-pattern guard exists to
> protect.

---

## 11. Goal & scope (Phase 2)

Three production-wiring scope bugs in IM3 Convex projection handlers, plus the
test that currently *certifies* one of them:

1. **FR-4 — Multi-module projections.** Both
   `apps/integrated-math-3/convex/student.ts` (`getStudentVisualizationHandler`)
   and `apps/integrated-math-3/convex/parent/visualization.ts`
   (`projectParentVisualizationHandler`) statically import
   `../curriculum/skill-graph/module-1/{nodes,edges}.json` (lines 15–16 and
   48–49 respectively). Any node from modules 2–9 is invisible. Phase 2 must
   load the full curriculum graph and prove a placement in module 2 produces a
   visualization node in module 2.
2. **FR-5 — Throwaway `student_competency` read + replacement of its
   certifying test.** `student.ts:520–523` performs an indexed
   `student_competency` query and discards the result. The
   `studentVisualization.test.ts:246–258` test asserts
   `ctx.queryCalls.toContain('student_competency')` — a spy assertion on a
   table name. Removing the read breaks this test by design; the replacement
   must be **behavioral** or the test must be deleted with the read.
3. **FR-6 — `review_due` learner state.** The union
   `"mastered" | "ready" | "blocked" | "review_due"` is declared in both
   handlers (student.ts:501, visualization.ts:56/67/126) and consumed by the
   downstream projection (`packages/knowledge-space-practice/src/projections/visualization.ts:161`,
   `184`). But no handler branch ever writes `"review_due"`: both classify
   placements only into mastered (≥0.8) / ready (≥0.3) / blocked (<0.3).
   Phase 2 must either **produce** `review_due` from a real signal
   (`srs_cards.dueDate <= now`, or a `student_competency.lastUpdated`-based
   stale heuristic) or **narrow** the union by removing `review_due` end-to-end.

UMV closeout follows the same protocol as Phase 1 (workflow.md).

What Phase 2 does **not** cover:
- The Cluster C generator fixes (FR-7/8/9/10/11) — those are Phase 3.
- The planner grep-contract behavioral path test (FR-17) — that is Phase 7.
  Phase 2 only addresses the *handler*-level multi-module proof; the
  dashboard render-level proof is folded into Phase 7 and shares the same
  multi-module fixture.
- Editing the `packages/knowledge-space-practice` projection itself. The
  scope bug is at the handler level (which graph data is fed in), not in the
  projection. The projection already handles `review_due` correctly.
- BM2 parity. BM2 has its own SRS table and its own dashboard; Phase 2 is
  IM3-only.

---

## 12. Pre-conditions / environment (Phase 2)

- **Working-tree state at start:** clean (Phase 1 closed at e992abbf,
  bd3ac8f5 includes the artifacts). No stray files.
- **Skill-graph artifacts available on disk:**
  - `apps/integrated-math-3/curriculum/skill-graph/nodes.json` (574 nodes)
    and `edges.json` (2708 edges) — the **root** aggregated graph. This is the
    likely source of truth for the full-curriculum loader, but mid-red must
    confirm that the root files are kept in sync with the per-module shards
    (sum-of-modules = 582 nodes / 2669 edges, slightly different from root —
    almost certainly because some module folders contain nodes that the root
    aggregation deduplicates or re-categorizes).
  - `apps/integrated-math-3/curriculum/skill-graph/module-{1..9}/{nodes,edges}.json`
    — per-module shards. Module-1 has 146 nodes; module-2 has 46. All nine
    exist on disk.
- **Strategy decision (binding):** the FR-4 helper MUST load the **root**
  `skill-graph/{nodes,edges}.json`. Reasons:
  1. It is the authoritative aggregated artifact and is already maintained as
     a single source of truth (`__tests__/pilot-graph-validation.test.ts`
     scans both root and per-module).
  2. Loading + concatenating per-module shards would require enumerating the
     directory at build time, which is incompatible with bundled Convex
     deploys (no fs at runtime). A static import of `nodes.json` works.
  3. If root and sum-of-modules diverge, that is an upstream curriculum bug,
     not an FR-4 concern. Mid-red MUST verify the divergence cause and
     document it in `_artifacts/graph-source-decision.md` before authoring
     the Green helper.
- **Multi-module placement fixture pattern.** Reuse
  `apps/integrated-math-3/__tests__/convex/_fixtures/student-viz-fixture.ts`
  as the structural model. Phase 2 ships a **new** fixture file
  (`_fixtures/multi-module-placements.ts`) containing:
  - At least one `placement_results` row with a `nodeId` whose first
    segment after `math.im3.skill.` is `1.x`.
  - At least one row whose first segment is `2.x`.
  - Real node ids drawn from the on-disk graph (do not invent ids — the
    projection filters unknown ids out). Candidates verified to exist:
    - `math.im3.skill.1.1.graph-quadratic-functions` (module 1, line 1124 of
      module-1/nodes.json)
    - `math.im3.skill.2.1.graph-and-analyze-polynomial-functions` (module 2,
      line 481 of module-2/nodes.json)
  - Optional third module for stress: `math.im3.skill.3.*` if present at
    runtime.
- **Mock-ctx pattern.** Phase 2 inherits the
  `studentVisualization.test.ts`/`student-viz-fixture.ts` mock-ctx pattern
  (vi.fn + per-table `rowsByTable` + chained `withIndex`). It MUST NOT
  introduce `convex-test`. The new parent-projection test uses the same
  pattern, extended with the `parent_links` and `profiles` tables required
  by `projectParentVisualizationHandler`.
- **Commands:**
  - RED_TEST_COMMAND: `npm run --workspace=apps/integrated-math-3 test -- --run`
    scoped via vitest's filename filter
    (e.g. `--testNamePattern='multi-module'` or by file path).
  - PROJECT_LINT: `npm run lint`.
  - PROJECT_CHECKS: `npx tsc --noEmit` — must show no NEW errors versus the
    Phase 1 closeout baseline (318 pre-existing IM3 errors, 10 ksp errors,
    per Phase 1 §11). The Phase 1 lone TS2769 in `review-queue/index.tsx:45`
    is out of scope.
  - **No aggregate `npm test`.** The repo has intentionally-RED suites in
    `packages/knowledge-space-core/src/__tests__/placement-engine-extra*.test.ts`
    (per spec-compliance test-strategy §8). Phase 2 must stay scoped.

---

## 13. Red phase contract (per task in Phase 2)

Every Red below executes the production handler (or a thin shared helper) and
asserts on its **observable output**. None of them are permitted to:
- compare against a re-implementation of the projection (parity oracle),
- search source files for a symbol name (grep oracle),
- inspect `ctx.queryCalls` to prove a table was *read* (spy oracle),
- depend solely on a type-only assertion that the production code never
  exercises at runtime.

### Task 2.1 — FR-4 multi-module projections (Red)

**Test file (new):**
`apps/integrated-math-3/__tests__/convex/studentVisualizationMultiModule.test.ts`

Why a new file, not an addition to `studentVisualization.test.ts`: that file
owns Phase-2-of-the-prior-track's contract; the multi-module proof is a
separate behavioral surface and gets its own bounded vitest scope so it can
be filtered cleanly via `--testNamePattern='multi-module'` in mid-red.

**New fixture (file):**
`apps/integrated-math-3/__tests__/convex/_fixtures/multi-module-placements.ts`
exporting:
- `multiModulePlacementRows: PlacementResultRow[]` — at least 2 rows, one
  with a verified `math.im3.skill.1.*` nodeId, one with a verified
  `math.im3.skill.2.*` nodeId, each with `masteryEstimate` in the `>= 0.3`
  band so the projection classifies them as `ready` (so they are eligible
  for `recommendedNext` and are not filtered out by `learnerState`).
- (Optional) `expectedModulesSeen: ['1','2']` — for the assertion.

**Red assertion shape (student handler):**
```
const result = await getStudentVisualizationHandler(ctx, { userId: STUDENT_ID });

const nodeIds = result.nodes.map(n => n.nodeId);
const modulesSeen = new Set(
  nodeIds
    .filter(id => id.startsWith('math.im3.skill.'))
    .map(id => id.split('.')[3]) // "1" or "2" or …
);
expect(modulesSeen.size).toBeGreaterThanOrEqual(2);
expect(modulesSeen).toContain('1');
expect(modulesSeen).toContain('2');
```

Plus a stronger node-presence check:
```
expect(nodeIds).toContain('math.im3.skill.2.1.graph-and-analyze-polynomial-functions');
```

This MUST fail at HEAD (e992abbf) because the static import loads only
module-1 nodes, so the module-2 placement's `nodeId` never appears in
`result.nodes`.

**Red assertion shape (parent handler, in the same test file under a second
`describe` block):**
Same shape, but invokes `projectParentVisualizationHandler` with a mock
context that also serves the active `parent_links` row and a `profiles` row
with `role: 'student'`. The parent projection output schema differs from
the student schema (no `recommendedNext` etc.) but `nodes` is present and
node-id-keyed; `modulesSeen.size >= 2` is the same assertion shape.

**Architectural assertion (complementary, not the sole oracle):**
A third test in the same file:
```
const studentSource = await readFile('apps/integrated-math-3/convex/student.ts', 'utf8');
const parentSource  = await readFile('apps/integrated-math-3/convex/parent/visualization.ts', 'utf8');
expect(studentSource).not.toMatch(/curriculum\/skill-graph\/module-1\//);
expect(parentSource).not.toMatch(/curriculum\/skill-graph\/module-1\//);
```
This is an **architecture lint** that prevents regression — it pins the
contract "no per-handler module-1/*.json import" — and is FR-20-compliant
*as a complement to* the behavioral assertion above, never as the sole
evidence. Mid-red MUST author both, not one or the other.

**Why this is not a parity oracle:** the oracle is the *presence of
module-2 nodes in the handler's output*. It is NOT a re-call to
`projectStudentVisualization` with a hand-curated learnerState. The Red
checks an end-to-end observable fact that depends on the production
handler's data sourcing.

### Task 2.2 — FR-5 throwaway `student_competency` + test replacement (Red)

This task **replaces** the existing
`studentVisualization.test.ts:246–258` test in place. Strategy decision
(binding):

> **The dead read is removed (option b in the spec).** The
> `student_competency` table has no observable contribution to the current
> `learnerState` derivation (the handler ignores its result), and the
> placement-results path already covers the proficiency signal. Wiring
> `student_competency` into `learnerState` would require a non-trivial
> design (precedence vs. placements, mastery-level to state mapping,
> tie-breaking) that is *out of FR-5 scope*. FR-5 says "remove the dead
> read OR consume it"; consuming it would expand scope into a design
> decision that belongs in a follow-up track. Strategy picks **remove**.

Mid-red implications:
1. **Delete the test** `studentVisualization.test.ts:246–258` ("loads
   prerequisite proficiency data from student_competency …") rather than
   replacing it with a placeholder. Delete the `student_competency: []`
   entry in `rowsByTable` (line 117) and the `queryCalls` array if no
   other test relies on it (verify: it is also referenced by the schema
   parser test but only as table presence — confirm with grep before
   deletion).
2. The Red for FR-5 is therefore **the absence of the test** combined
   with the existence of a Green that removes the dead read. There is no
   new vitest authored for FR-5.
3. **Anti-pattern context:** the original test reads
   `ctx.queryCalls.toContain('student_competency')` (line 255–258). The
   spec calls this exactly: "a table name in a spy array … not acceptable
   evidence that data is 'used.'" A query-call spy proves only that a
   query was *issued*, never that its result *affects observable output*.
   By the time Phase 2 lands, the data is no longer issued AND no longer
   used; the spy assertion would invert into the wrong direction
   (`not.toContain`), which is the same anti-pattern with sign flipped.
   The correct move is **deletion**.
4. **What the Green for FR-5 must look like (handoff for green role):**
   delete student.ts:512–523 (the comment block and the
   `await ctx.db.query("student_competency")…collect()`). Update the
   JSDoc on `getStudentVisualizationHandler` (lines 469–488) to remove
   the "and the student's `student_competency` rows for prerequisite
   proficiency data (per test-strategy §3)" sentence — that JSDoc claim
   becomes a lie after the read is removed.

**Red baseline at e992abbf:** the existing test passes at HEAD (because
the production code DOES issue the query). Removing the read without
removing the test would make the test fail. The Phase-2 commit sequence
MUST land the test deletion and the production deletion together in a
single commit so the suite stays consistent.

### Task 2.3 — FR-6 `review_due` resolution (Red)

Strategy decision (binding) — choose between produce-vs-narrow:

> **Narrow the union.** Producing `review_due` correctly requires reading
> `srs_cards.dueDate` (IM3 already has the `by_student_and_due` index, per
> `convex/schema.ts:508–530`) and mapping objective-id-keyed cards into
> node-id-keyed learner state — a cross-id-system mapping that the FR-6
> spec does NOT specify and that has no other call site to validate
> against. Narrowing is the FR-6-conformant minimal fix. The downstream
> projection
> (`packages/knowledge-space-practice/src/projections/visualization.ts:161,
> 184`) already handles the three-state union correctly; removing
> `review_due` from the *handler* union is invisible to the projection.

This is consistent with the spec: *"Either derive it from SRS/review data
OR narrow the union so the dead value is not misleading."* Narrowing the
union is the simpler, lower-risk option and respects FR-6's intent
(remove the misleading dead value).

Mid-red implications:
1. The narrowing is **at the handler boundary only**, not in
   `packages/knowledge-space-practice`. The projection's
   `LearnerStateValue` union still includes `'review_due'` — that union is
   shared with other apps (BM2, etc.) and changing it is out of scope.
2. The two handler local types become
   `'mastered' | 'ready' | 'blocked'` (student.ts:501,
   visualization.ts:56, 67, 126).
3. The handlers pass the narrower learnerState upcast (TypeScript
   widening) into `projectStudentVisualization` /
   `projectParentVisualization`, which still accept the broader union.
   No projection signature changes.

**Test file (new):**
`apps/integrated-math-3/__tests__/convex/visualizationLearnerStateUnion.test.ts`

**Red assertion shape:**
Two complementary tests, both behavioral:

(a) **Output never contains `review_due` as a *handler*-emitted state.**
The new fixture seeds placements across the full `[0, 1]` masteryEstimate
range (e.g. 0.0, 0.15, 0.3, 0.5, 0.79, 0.8, 0.95). The handler is invoked
and the resulting `learnerState` (extracted via the projection's
node-state mapping — pull from `result.nodes[i].state`) is collected.
```
const states = new Set(result.nodes.map(n => n.state));
expect(states).not.toContain('review_due');
```
At HEAD this **passes accidentally** (because the union is declared but
never produced). After Green narrows the type, this passes by
construction. Therefore (a) alone is insufficient as Red.

(b) **Type-level: the handler's return type does not include
`review_due` in its handler-local learner state.** Strategy notes that a
pure type-level assertion is not a behavioral test by itself; however,
FR-6 is fundamentally a type-narrowing requirement. The honest Red for
FR-6 is therefore:
```
import type { Handler } from '...';
// expectTypeOf or a `satisfies` check that the handler's local
// learnerState union has exactly 3 members.
```
plus a **source assertion** (architecture lint, complement only):
```
const src = await readFile('apps/integrated-math-3/convex/student.ts','utf8');
expect(src).not.toMatch(/'review_due'/);   // in handler scope
const parentSrc = await readFile('apps/integrated-math-3/convex/parent/visualization.ts','utf8');
expect(parentSrc).not.toMatch(/'review_due'/);
```
This source assertion is **strictly a complement** to (a). It pins the
narrowing — without it, a developer could re-introduce a no-op
`review_due` branch and (a) would still pass.

**Joint Red contract (the test fails at HEAD and passes after Green):**
- (a) is invariant (always passes); it documents the behavioural fact.
- (b) FAILS at HEAD because the source still contains `'review_due'` in
  the handler-local union and the type-level assertion (e.g.
  `expectTypeOf<HandlerLearnerStateUnion>().toEqualTypeOf<'mastered'|'ready'|'blocked'>()`)
  is false.
- Together (a) + (b) form a meaningful Red.

**Why this is not a grep oracle masquerading as behavioral:** the source
assertion is gated as a complement, exactly as FR-20 + Phase-1 §5 anti-
pattern #1 require. It is allowed *only* when paired with a runtime
output assertion. The runtime output assertion exists ((a)) and exercises
the handler.

**Open option (note for green role):** if Green prefers to keep the
shared union and instead emit a runtime branch (e.g.
`masteryEstimate >= 0.3 && masteryEstimate < 0.5 && lastUpdated < 30d ago`
→ `review_due`), strategy permits that **only if** the green role adds a
new test that seeds a placement triggering the new branch and asserts
`states.has('review_due')`. This converts (a) into the Red oracle. The
default decision is narrow; deviation requires an explicit handoff note.

### Task 2.4 — UMV closeout (Red contract = none)

UMV is performed by the user per workflow.md. The strategy artifact for
UMV is the set of Green artifacts attached to the Phase-2 checkpoint git
note (see §17 below).

---

## 14. Green phase contract (Phase 2)

### Task 2.1 Green — FR-4
1. Create a shared graph-loading helper. Strategy-recommended path:
   `apps/integrated-math-3/lib/curriculum/skill-graph-loader.ts`
   (sibling to existing `lib/curriculum/audit.ts`). Exports:
   ```
   export function loadFullCurriculumGraph(): {
     nodes: KnowledgeSpaceNode[];
     edges: KnowledgeSpaceEdge[];
   }
   ```
   The implementation is a single pair of static imports of
   `../../curriculum/skill-graph/nodes.json` and `edges.json`
   (the root aggregated files, 574 nodes / 2708 edges).
2. Replace `student.ts:15-16` and `visualization.ts:48-49` with a call
   to `loadFullCurriculumGraph()`. No conditional branching, no per-handler
   filtering. Both handlers import the helper.
3. Delete the static module-1 imports. Verify with the architecture-lint
   test (the third test in §13 Task 2.1).
4. Lint + tsc + the FR-4 test go green.
5. Commit shape:
   - Single commit, atomic: helper + both handler updates + module-1
     import removal. Splitting risks half-green state where one handler
     still imports module-1.
   - Subject: `fix(code-review-remediation): Phase 2 Green — FR-4 load full curriculum graph in student + parent projections`.

### Task 2.2 Green — FR-5
1. Delete `student.ts:512–523` (the comment block + the
   `student_competency` query + `.withIndex(...).collect()` chain).
2. Update the `getStudentVisualizationHandler` JSDoc (lines 469–488) to
   remove the `student_competency` claim.
3. Delete `studentVisualization.test.ts:246–258`.
4. Verify no other test references the `student_competency: []` mock-ctx
   key; if confirmed unused, leave the mock-ctx entry intact (it is
   harmless and keeps the helper symmetric) OR remove it — green role
   chooses based on diff size.
5. Run the targeted vitest scoped to `studentVisualization` — must pass
   (one fewer test, no regressions).
6. Commit shape:
   - Single atomic commit: test deletion + production read deletion +
     JSDoc update. Splitting creates a red intermediate state.
   - Subject: `fix(code-review-remediation): Phase 2 Green — FR-5 remove dead student_competency read + its spy-only test (FR-16)`.

### Task 2.3 Green — FR-6
1. In `student.ts:501`, narrow the union annotation to
   `'mastered' | 'ready' | 'blocked'`.
2. In `visualization.ts:56, 67, 126`, narrow the same way. The
   `EMPTY_LEARNER_STATE` constant (line 54–57) becomes
   `Record<string, 'mastered' | 'ready' | 'blocked'>`.
3. The `buildParentProjectionPayload` parameter (line 67) is the only
   exported function whose signature narrows. Strategy assessment:
   `buildParentProjectionPayload` has no external callers (grep was
   clean for the symbol). Narrowing its parameter is safe.
4. tsc must be green. The downstream `projectParentVisualization` call
   widens automatically (an assignable type).
5. The new test (Task 2.3 Red) goes from failing (type assertion) to
   passing.
6. Commit shape:
   - Single atomic commit: narrowing both handlers + the helper export +
     the new test.
   - Subject: `fix(code-review-remediation): Phase 2 Green — FR-6 narrow handler learner-state union (drop unreachable review_due)`.

### Phase 2 closeout gate

All of:
- `bash measure/tracks/code-review-remediation_20260624/scripts/check-jsdoc-balanced-braces.sh "apps/ packages/ convex/"`
  → still exit 0 (Phase 1 invariant preserved).
- `npm run --workspace=apps/integrated-math-3 test -- --run studentVisualization`
  → pass.
- `npm run --workspace=apps/integrated-math-3 test -- --run studentVisualizationMultiModule`
  → pass (new file, the FR-4 Red→Green pivot).
- `npm run --workspace=apps/integrated-math-3 test -- --run visualizationLearnerStateUnion`
  → pass.
- `npm run lint` → green (no new warnings).
- `npx tsc --noEmit` → no NEW errors versus the Phase 1 closeout baseline.
- `git grep -nP "module-1/(nodes|edges)\.json" -- 'apps/integrated-math-3/convex/**/*.ts'`
  → **0 matches** (architecture invariant).
- `git grep -n "'review_due'" -- 'apps/integrated-math-3/convex/student.ts' 'apps/integrated-math-3/convex/parent/visualization.ts'`
  → **0 matches** (FR-6 invariant).
- `git grep -n 'student_competency' -- 'apps/integrated-math-3/convex/student.ts'`
  → **0 matches** (FR-5 invariant). The string may still appear in
  `convex/student.ts`'s `completePhase` mutation (lines 213–233) which
  is a legitimate insert/update path — that is not in scope and must
  remain. Grep specifically the `getStudentVisualizationHandler` region
  or accept the broader match and verify by line number.

  Refined check:
  `git grep -nP "student_competency" -- apps/integrated-math-3/convex/student.ts | grep -v "completePhase\|205-235"`
  → should return only the JSDoc reference being deleted.

---

## 15. Anti-pattern guards (Phase 2 specifically)

Per `spec.md` FR-16, FR-17, FR-20 and `test-strategy.md` Phase-1 §5,
these patterns are **prohibited** in Phase 2 work:

1. **Spy assertion on `ctx.queryCalls`.** The exact pattern
   `expect(ctx.queryCalls).toContain('<table_name>')` is forbidden as
   the sole evidence for any FR. The Phase-1-2 transition is precisely
   the moment this anti-pattern gets surgically removed.
2. **Parity oracle.** A test that re-invokes `projectStudentVisualization`
   with a hand-curated `learnerState` and asserts equality with the
   handler's output is **forbidden as the only behavioral assertion**.
   `studentVisualization.test.ts:202-244` already does this for the
   single-module case (Phase 2 of the prior track); the multi-module
   test must NOT replicate that pattern. The oracle must be an
   end-to-end fact (e.g. *module-2 nodeIds appear*), not a parity.
3. **Source-grep as sole oracle.** The architecture-lint assertions in
   §13 (no `module-1/*.json` import, no `'review_due'` in handler) are
   **complements only**. Each Red MUST also exercise the handler and
   assert on its observable output.
4. **Module-1-only fixtures.** Any new Phase-2 test that seeds only
   `math.im3.skill.1.*` nodeIds re-creates the bug it is meant to catch.
   The fixture file MUST contain at least 2 modules' worth of nodeIds.
5. **Asserting `not.toContain('review_due')` on a handler that never
   produced it.** This passes at HEAD already (the Red→Green delta would
   be zero behavioural change). It is a no-op assertion. The Red for
   FR-6 MUST include a type-level or source-level component that fails
   at HEAD.
6. **Re-introducing `student_competency` as a spy-assertion target.**
   If green refactors the FR-5 deletion into a "read + return result for
   future use", the test must assert the **result**, never that the read
   *happened*.
7. **Convex-test runtime dependency.** Phase 2 inherits the mock-ctx
   pattern. Pulling in `convex-test` is a scope expansion and is
   forbidden.
8. **Loading the graph per-call inside the handler.** The shared helper
   must be module-scoped (static import resolves once). A function that
   parses JSON on every Convex invocation is a perf regression masked
   as a fix.
9. **JSON modules at the helper boundary that re-export module-1
   imports.** The helper must use the root `skill-graph/nodes.json`,
   not concatenate per-module shards (per §12 strategy decision).

---

## 16. Test file inventory (Phase 2)

| Path | Status | Purpose |
|---|---|---|
| `apps/integrated-math-3/__tests__/convex/_fixtures/multi-module-placements.ts` | NEW | Multi-module placement_results fixture (≥2 modules, verified real nodeIds). |
| `apps/integrated-math-3/__tests__/convex/studentVisualizationMultiModule.test.ts` | NEW | FR-4 behavioural Red for both `getStudentVisualizationHandler` and `projectParentVisualizationHandler`, plus the architecture-lint complement. |
| `apps/integrated-math-3/__tests__/convex/visualizationLearnerStateUnion.test.ts` | NEW | FR-6 behavioural + type-level + source-lint Red for narrowed union. |
| `apps/integrated-math-3/__tests__/convex/studentVisualization.test.ts` | MODIFIED | DELETE test "loads prerequisite proficiency data from student_competency" (lines 246–258). |
| `apps/integrated-math-3/__tests__/convex/_fixtures/student-viz-fixture.ts` | UNCHANGED | Keep as-is; the fixture is reused by Phase 2 of the prior track. |
| `apps/integrated-math-3/lib/curriculum/skill-graph-loader.ts` | NEW (source, not test — listed for cross-reference only) | Shared FR-4 helper. Owned by Green. |

`_artifacts/graph-source-decision.md` (NEW, in this track's `_artifacts/`)
records the root-vs-per-module decision and the 574-vs-582-node
divergence note. Mid-red MUST author it before Green's helper lands.

---

## 17. Acceptance evidence (Phase 2)

Attached to the Phase-2 checkpoint git note:

1. **FR-4 multi-module test stdout** (red → green diff):
   - Red baseline at e992abbf: test asserting module-2 nodeId in result fails.
   - Green: same test passes; second assertion `modulesSeen.size >= 2`
     also passes.
2. **FR-5 deletion proof:**
   - `git diff e992abbf..HEAD -- apps/integrated-math-3/convex/student.ts`
     showing only the JSDoc + query block removed (no other production change).
   - `git diff e992abbf..HEAD -- apps/integrated-math-3/__tests__/convex/studentVisualization.test.ts`
     showing only the targeted `describe`/`it` block removed.
   - Targeted vitest stdout: 3 tests pass (was 4, one deleted).
3. **FR-6 narrowing proof:**
   - `git grep -n "'review_due'" -- apps/integrated-math-3/convex/student.ts apps/integrated-math-3/convex/parent/visualization.ts`
     → 0 matches.
   - The new `visualizationLearnerStateUnion.test.ts` test stdout (pass).
4. **Production-scope grep:**
   - `git grep -nP "curriculum/skill-graph/module-1/(nodes|edges)\.json" -- apps/integrated-math-3/convex/`
     → 0 matches.
5. **Phase 1 invariants preserved:**
   - FR-3 guard exit 0 on the post-Phase-2 tree.
   - Phase-1 `_artifacts/phase-1-gates.txt` rerun deltas (any drift is
     escalation-worthy).
6. **Commit SHAs (in order):**
   - FR-4 Red (test + fixture + arch-lint).
   - FR-4 Green (helper + handler edits).
   - FR-5 Green (test deletion + production deletion + JSDoc fix, atomic).
   - FR-6 Red (new test).
   - FR-6 Green (narrowing edits).
   - Plan-update commit marking Phase 2 tasks complete.
   - Checkpoint commit (workflow.md §70).
   Alternative shape (mid-red discretion): FR-4 Red+Green may be a
   single Red commit immediately followed by a single Green commit; FR-5
   is irreducible (deletion); FR-6 follows the same Red/Green pair.
   Strict atomic-per-task is the default.
7. **Lint + tsc + targeted test outputs** under `_artifacts/phase-2-gates.txt`.
8. **`_artifacts/graph-source-decision.md`** — records why the root
   `skill-graph/{nodes,edges}.json` is loaded (and why per-module shard
   concatenation is rejected).

---

## 18. Risks & open questions (Phase 2)

1. **Root-vs-per-module-shard divergence (574 vs 582 nodes; 2708 vs 2669
   edges).** Strategy's verified counts. Possible causes: (a) root
   deduplicates standards/CCSS nodes that appear in multiple modules;
   (b) module shards contain `draft-nodes.json` entries that the root
   excludes; (c) genuine drift (some module-only nodes were never
   merged into root). Mid-red MUST confirm cause and document in
   `_artifacts/graph-source-decision.md`. If cause (c), open a
   follow-up tech-debt entry (not in Phase 2 scope).
2. **The verified module-2 nodeId** —
   `math.im3.skill.2.1.graph-and-analyze-polynomial-functions` — was
   confirmed via `grep -n` of `module-2/nodes.json:481`. Mid-red MUST
   re-verify presence in the root `skill-graph/nodes.json` before
   shipping the fixture. If absent (root drift), pick a different
   module-2 nodeId that IS in root (any `math.im3.skill.2.*` will do —
   `grep '"id": "math\.im3\.skill\.2\.' apps/integrated-math-3/curriculum/skill-graph/nodes.json`).
3. **`projectParentVisualizationHandler` requires `parent_links` row +
   active `profiles` row.** The new multi-module test mock-ctx must
   serve these tables. Pattern is documented in
   `apps/integrated-math-3/__tests__/_fixtures/parent-portal/convexMocks.ts`
   (referenced from `parent-portal/parentLinks.ts`). Mid-red MUST
   reuse this pattern, not invent a new one.
4. **The `student_competency` table still has insert paths in
   `completePhase` (student.ts:206–235).** FR-5's deletion is scoped
   to the read in `getStudentVisualizationHandler` only. The mutation's
   table use is correct and out of scope. The closeout grep MUST be
   line-scoped to avoid false positives.
5. **The `studentVisualization.test.ts` parity test
   (lines 202–244)** — "recommendedNext matches a direct
   `projectStudentVisualization` call with the same inputs" — is a
   parity oracle and would normally violate FR-20. Strategy notes it
   was the Phase-2 Red of the *prior* track (planner-prod-wiring) and
   was honest at that time *for that track's scope* (proving the new
   handler matches the projection it delegates to). Phase 2 of *this*
   track does NOT delete it. Reason: it tests a different invariant
   (handler-vs-projection consistency for a single-module input)
   which remains a valid sanity check after FR-4. If the parity test
   starts to *certify* the module-1-only bug (i.e. quietly only
   exercising module-1 nodes), Phase 7 will revisit it under FR-17.
   For Phase 2: leave it alone.
6. **Convex `internalQuery` signature changes.** The named handler
   exports stay; only their internal data sourcing + union narrowing
   change. Convex-generated types (`convex/_generated/api.d.ts`) should
   not change. If they do, that's a signal of an over-broad edit.
7. **TS narrowing assignability.** When the FR-6 narrowed
   `learnerState` is passed to `projectStudentVisualization` (which
   accepts the broader union), TS widens it automatically. No `as`
   casts needed. If green role finds themselves writing
   `learnerState as Record<…, 'mastered'|'ready'|'blocked'|'review_due'>`,
   they have over-narrowed somewhere — re-check the projection's
   parameter type.
8. **The `studentVisualizationV1Schema.safeParse` test
   (`studentVisualization.test.ts:190-200`)** uses `makeMockCtx()`
   with zero placements. After FR-4, the handler loads 574 root
   graph nodes regardless. The schema parse should still pass (the
   projection handles empty learnerState gracefully). Mid-red MUST
   spot-check this test after FR-4 lands; if the larger graph makes
   the schema reject (e.g. node-count cap), that is a real bug to
   escalate, not a fixture tweak.
9. **No `srs_cards` integration is planned for FR-6.** The IM3
   `srs_cards` table is keyed by `objectiveId`, not by
   `KnowledgeSpaceNode.id`. Bridging the two id systems is
   non-trivial and out of scope. If a future track needs runtime
   `review_due`, that mapping is the first design problem to solve.

---

## 19. Commit & handoff plan (Phase 2)

**Expected Phase-2 commit sequence (≤7 commits + checkpoint):**

| # | Type | Scope | Subject |
|---|---|---|---|
| 1 | `test` | code-review-remediation | Phase 2 Red — FR-4 multi-module student + parent projection tests + fixture |
| 2 | `fix`  | code-review-remediation | Phase 2 Green — FR-4 load full curriculum graph in student + parent projections (shared helper) |
| 3 | `fix`  | code-review-remediation | Phase 2 Green — FR-5 remove dead student_competency read + its spy-only test (FR-16) |
| 4 | `test` | code-review-remediation | Phase 2 Red — FR-6 narrowed learner-state union test |
| 5 | `fix`  | code-review-remediation | Phase 2 Green — FR-6 narrow handler learner-state union (drop unreachable review_due) |
| 6 | `docs` | code-review-remediation | Phase 2 _artifacts (graph-source-decision, phase-2-gates) |
| 7 | `measure(plan)` | — | Mark Phase 2 tasks complete with commit SHAs |
| 8 | `measure(checkpoint)` | — | Checkpoint end of Phase 2 |

Each of commits 1–5 gets a git note per workflow.md step 10.

**What mid-red needs to know (handoff):**

1. **Verify the root-vs-per-module decision before authoring fixtures.**
   Open `_artifacts/graph-source-decision.md` first, run the
   `python3` node-count check from §12, and confirm the module-2
   nodeId (`math.im3.skill.2.1.graph-and-analyze-polynomial-functions`)
   exists in root `skill-graph/nodes.json`. If it doesn't, pick a
   different one before authoring the fixture.
2. **Author Task 2.1 Red first.** It's the largest test surface and
   the one most prone to drift. Get the multi-module fixture +
   architecture-lint right before touching FR-5/FR-6.
3. **Task 2.2 (FR-5) is irreducible Red+Green in one commit.** There
   is no separable Red. The existing test at line 246 IS the Red
   baseline (it passes at HEAD, exercising the dead read); deleting
   it and the read together is the single atomic Green.
4. **Task 2.3 (FR-6) Red MUST include a failing-at-HEAD assertion.**
   Either a type-level assertion (`expectTypeOf` of the handler's
   local union) or a source-lint regex. The runtime
   `not.toContain('review_due')` is a no-op at HEAD; on its own it
   is FR-20 anti-pattern #5 above.
5. **Do NOT touch
   `packages/knowledge-space-practice/src/projections/visualization.ts`.**
   The projection union stays as-is. Phase 2 narrows handler-local
   types only.
6. **Do NOT introduce `convex-test`.** Mock-ctx pattern only.
7. **Closeout greps are line-scoped for `student_competency`** — the
   `completePhase` mutation legitimately writes the table.
8. **Phase 1 invariants are gates.** The FR-3 balanced-brace guard
   must still exit 0; the production-scope JSDoc grep must still be
   clean. Phase 2 must not regress Phase 1.
9. **If you find that the root graph is missing a module-2 nodeId
   that the per-module shard has,** escalate as a curriculum-data
   tech-debt entry — do NOT try to fix it in Phase 2 by switching the
   helper to per-module-shard concatenation.
