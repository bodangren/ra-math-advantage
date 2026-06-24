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

---

# Phase 3 — advanced-math-generators correctness & quality (Cluster C)

Baseline SHA for Phase 3: `776a8c63` (Phase 2 fully closed, including the
adversarial probes commit).
Role: Measure Strategy. No source edits; no test code authored by strategy.

> Phase 3 is the second behavioural phase but, unlike Phase 2, the bugs sit
> at the **generator level** in `packages/math-content/src/`. The existing
> test files are themselves part of the defect set — three of them assert
> construction-guaranteed truths or re-derive the source formula. Per
> FR-16 + FR-20, those certifying blocks must be **replaced**, not merely
> kept green. Phase 3 ships both code fixes and corrected test contracts in
> the same commit pairs.

---

## 20. Goal & scope (Phase 3)

Five generator-correctness defects in `packages/math-content`, all
shipped behind green-but-trivial tests:

1. **FR-7 — Rational-analyzer HA triviality.** `rational-analyzer.ts`
   builds `P(x) = (x − h)(x − z)` and `Q(x) = (x − h)(x − v)` via two
   linear factors each. Both numerator and denominator are **monic
   degree-2**, so for every seed `leadingNum = leadingDen = 1`, `ratio = 1`,
   `isZero = false`, `leadingDegreeNum = leadingDegreeDen = 1`. The
   horizontal-asymptote feature is pedagogically dead. The current test
   block (`rational-analyzer.test.ts:109-135`) cements this by asserting
   `ratio === leadingNum/leadingDen` (a tautology re-deriving the source)
   and `isZero === false` because "our construction always does." Both
   must go. The adapter
   (`knowledge-space/generators/advanced-math-adapters.ts:147-200`) then
   grades the entire `horizontalAsymptote` object via `exact_match` — a
   `{leadingDegreeNum, leadingDegreeDen, ratio, isZero}` object the
   student cannot enter.
2. **FR-8 — Exp-log dead domain re-roll.** `exp-log-solver.ts:194-219`
   wraps generation in `while (true) { ... if (isDomainValid) return; seed += 1 }`.
   For every problem type the construction guarantees domain validity:
     - `exp`: domain = `(−∞, ∞)` (line 147) → `isDomainValid` returns
       `true` unconditionally (line 171).
     - `log` / `ln`: `answer = (10^D - C) / A` (line 83) / `(e^D - C) / A`
       (line 115). The check is `answer > min && answer < max` where
       `min = -C/A` if `A > 0`, `max = +∞`. Substituting:
       `(10^D - C)/A − (−C/A) = 10^D / A > 0` for `A > 0`; similar sign
       analysis on `A < 0`. The argument `Ax + C` at the solution is
       `10^D` or `e^D`, **always strictly positive**, so
       `isDomainValid` is always true. The `seed += 1` branch is
       unreachable. The `// eslint-disable-next-line no-constant-condition`
       and the JSDoc claim of "domain safety" both lie.
   The test blocks `domain re-roll` (lines 217-239) and
   `domain safety for log/ln/exp` (lines 146-211) assert only that
   `Number.isFinite(answer)` and `answer > domain.min` — both
   construction-guaranteed. The `expect(true).toBe(false)` lines
   (116, 127, 138) are hand-rolled "if we didn't find one, fail" fail
   patterns inside `for` loops; they are not Red, they are dead.
3. **FR-9 — Duplicate generator utilities.** Verified call sites:
     - `seededRandom`: **6 definitions**, not 5 as spec said —
       `polynomial-operations.ts:24`, `polynomial-division.ts:16`,
       `rational-analyzer.ts:60`, `exp-log-solver.ts:40`,
       `knowledge-space/generators/registry.ts:37`,
       `problem-families/im1/generators.ts:18`. The IM1 copy is in scope
       (same file, same algorithm, would cause future drift).
     - `generateCoefficients`: 2 definitions —
       `polynomial-operations.ts:37` and `polynomial-division.ts:29`,
       with subtly different `otherRange` defaults (`[-5,5]` vs `[-3,3]`).
       The default differs; the signature is identical. The extracted
       helper MUST preserve both behaviours (callers pass `otherRange`
       explicitly when they need the non-default).
     - `formatPolynomial`: 2 definitions —
       `rational-analyzer.ts:82` and
       `knowledge-space/generators/advanced-math-adapters.ts:26`. Both
       use the same superscript map; the two functions are byte-equal.
   Existing helpers in `utils/polynomial.ts` (`addPoly`, `subtractPoly`,
   `multiplyPoly`) are the precedent: extract beside them.
4. **FR-10 — Dual registry + empty adapter `nodeIds`.** Two
   `GENERATOR_REGISTRY` definitions:
     - `packages/math-content/src/generator-registry.ts` (34 lines, flat,
       `generate: (options) => unknown`, **re-exported via `src/index.ts:67`**).
     - `packages/math-content/src/knowledge-space/generators/registry.ts`
       (private `GENERATOR_REGISTRY` const, typed `MathGenerator`,
       exported via `GENERATOR_KEYS` / `getGenerator`).
   The flat registry is consumed only by its own test
   (`__tests__/generator-registry.test.ts`) and the `index.ts` re-export.
   No `apps/` or other `packages/` source imports `GENERATOR_REGISTRY`
   (verified: only `boundary.test.ts` references the path-string in a
   boundary-lint pattern, not the runtime symbol). The flat registry is
   redundant and must be removed.
   The four advanced adapters
   (`advanced-math-adapters.ts:66/103/147/206`) all ship with
   `nodeIds: []`. They are reachable only by key (`getGenerator('...')`);
   any node→generator path returns nothing for them. The current
   `__tests__/adapter.test.ts` (411 lines) never asserts non-empty
   `nodeIds` — the bug is invisible to the test suite. FR-10 + FR-18
   require populating each adapter's `nodeIds` with real
   `math.im3.skill.*` IDs and adding the missing assertion.
5. **FR-11 — Mislabelled PRNG.** Every `seededRandom` claims (in comments
   or JSDoc) to be the glibc LCG. The constants are glibc's
   (`1103515245`, `12345`), but JS doubles overflow `2^53` long before
   `s * 1103515245` finishes for any `s > 2^21`, so the post-multiplication
   value is not the same as the canonical 32-bit LCG. The output is
   deterministic and uniform-ish; it is just not glibc's LCG. FR-9
   subsumes this: the **single** shared helper inherits the corrected
   docstring. FR-11 is otherwise a doc-only fix.

UMV closeout follows the same protocol as Phases 1–2 (workflow.md).

What Phase 3 does **not** cover:
- The seed-523 self-contradicting comment in
  `__tests__/generator-registry.test.ts:82-100` and the vacuous
  `games-exports.test.ts` type assertion — both are FR-19, owned by
  **Phase 7** (Test integrity), not Phase 3. Phase 3 deliberately does
  not touch those tests.
- The IM1 `problem-families/im1/generators.ts:18` `seededRandom`. Spec
  enumerates 5 call sites; the IM1 copy is the 6th. **Strategy
  decision (binding):** include the IM1 copy in the FR-9 extraction.
  Reason: it is byte-equal, in the same package, and leaving it behind
  guarantees future drift. The Green commit's diff will show 6 files
  edited, not 5; that is intentional and noted here so reviewers do
  not flag it as scope creep.
- The `precalc-alignment-concept-taxonomy` script work (FR-12, FR-13)
  is **Phase 4**, not Phase 3.
- Convex-side or app-side handler/adapter wiring. All FR-7..11 work is
  contained to `packages/math-content/src/`.

---

## 21. Pre-conditions / environment (Phase 3)

- **Working-tree state at start:** clean except for tracked Phase-1/2
  artifacts; `--db` / `--symbol` junk files still untracked (Phase 8
  cleanup). FR-3 guard exit 0 invariant preserved.
- **Existing utils:** `packages/math-content/src/utils/polynomial.ts`
  (63 lines) already exports `addPoly`, `subtractPoly`, `multiplyPoly`.
  This is the structural precedent for FR-9; the new helpers MUST land
  in the same directory (`utils/`), either appended to `polynomial.ts`
  (for `formatPolynomial`, which is polynomial-specific) or as new
  sibling files (`utils/prng.ts` for `seededRandom`,
  `utils/coefficients.ts` for `generateCoefficients`). Strategy
  recommendation (non-binding): three sibling files, one symbol each,
  so the change is auditable per FR.
- **Determinism contract (non-negotiable):** every existing test that
  asserts seed-determinism MUST keep passing after FR-9. Specifically:
    - `rational-analyzer.test.ts:91-104` (same-seed equality;
      different-seed difference).
    - `exp-log-solver.test.ts:76-90` (same-seed equality).
    - `__tests__/generator-registry.test.ts:81-100` (seed-523 golden,
      `polynomial-operations` result `[8, 0, 0, 4]`).
    - All four pilot generators in `registry.ts:45-160` use
      `seededRandom(input.seed)`. The extracted helper MUST produce
      byte-identical PRNG sequences (same `(s * 1103515245 + 12345) & 0x7fffffff`
      formulation), or those tests' golden values change and the Phase
      breaks.
  This means FR-11's "32-bit-safe formulation" option (e.g. `Math.imul`)
  is **rejected** unless paired with a re-derivation of every existing
  golden assertion. **Strategy decision (binding):** FR-11 is a
  **docstring-only fix**. The shared util keeps the current arithmetic
  (which is deterministic, just not actually glibc LCG semantics) and
  the corrected JSDoc describes it as "deterministic seeded PRNG using
  glibc's LCG constants under JS double arithmetic; output is uniform
  and reproducible but not bit-identical to a true 32-bit LCG due to
  intermediate `2^53` overflow."
- **Schema/contract entry points** that consume the rational HA target:
  no production caller in `apps/` consumes the `horizontalAsymptote`
  object from `RationalProblem` — confirmed via grep — so the FR-7
  adapter change (dropping the object, adding scalar `y`/`"none"`) is
  contained. The adapter is the only public surface; the
  `RationalProblem` interface itself may remain unchanged or be
  augmented with a `horizontalAsymptoteY: number | 'none'` scalar.
  Strategy recommendation: augment with the scalar (don't break the
  interface), and change ONLY the adapter's `partAnswers` /
  `expectedAnswer` to use the scalar.
- **Node-ID verification (FR-10).** Verified to exist in
  `apps/integrated-math-3/curriculum/skill-graph/nodes.json` (root,
  574-node aggregate from Phase 2):
    - `polynomial-operations` → `math.im3.skill.2.3.add-and-subtract-polynomials`
      (line 3252), `math.im3.skill.2.3.multiply-polynomials` (line 3268),
      `math.im3.skill.2.aleks.polynomial-add-subtract` (line 3378),
      `math.im3.skill.2.aleks.polynomial-multiplication` (line 3472).
    - `polynomial-division` → `math.im3.skill.2.4.divide-polynomials-by-using-long-division`
      (line 3284), `math.im3.skill.2.aleks.polynomial-long-division` (line 3449).
    - `rational-analyzer` → `math.im3.skill.7.4.graph-and-analyze-rational-functions-with-vertical-and-horiz`
      (line 8056), `math.im3.skill.7.aleks.rational-function-asymptote-analysis`
      (line 8323). (Also `7.1.simplify-rational-expressions` for upstream
      coverage — green role may broaden.)
    - `exp-log-solver` → `math.im3.skill.5.2.solve-exponential-equations-in-one-variable`
      (line 6111), `math.im3.skill.6.2.solve-logarithmic-equations-using-properties-of-equality`
      (line 6954), `math.im3.skill.6.3.solve-exponential-equations-by-using-common-logarithms`
      (line 6970), `math.im3.skill.6.4.solve-exponential-equations-by-using-natural-logarithms`
      (line 7002), `math.im3.skill.6.aleks.logarithmic-equation-solving`
      (line 7192). (Multi-skill is correct: the generator emits all three
      problem types.)
  Mid-red MUST re-verify each ID with `grep` before committing — root
  graph aggregation may have changed since Phase 2.
- **Commands:**
  - RED_TEST_COMMAND (per task):
    `npm run --workspace=packages/math-content test -- --run`
    scoped via vitest's filename filter (e.g.
    `rational-analyzer.test.ts`, `exp-log-solver.test.ts`,
    `adapter.test.ts`).
  - PROJECT_LINT: `npm run lint` — math-content lint gate is in
    `tech-debt.md` (item #19). Mid-red MUST scope lint to the changed
    files; whole-package lint is not the gate. Targeted ESLint via
    `npx eslint packages/math-content/src/<file>.ts`.
  - PROJECT_CHECKS: `npx tsc --noEmit` — math-content has a known-red
    standalone tsc baseline (tech-debt #25). Mid-red runs tsc from the
    repo root; the gate is **no NEW errors versus the Phase 2 closeout
    baseline**, not a clean run.
  - **No aggregate `npm test`** — see Phase-2 §12 "intentionally-red
    suite" note. Per Phase 2 §15 anti-pattern #1 (`generator-qa` package
    `placement-engine-extra*.test.ts` files), the closeout uses scoped
    test filters only.
  - Phase-1 invariant: `bash measure/tracks/code-review-remediation_20260624/scripts/check-jsdoc-balanced-braces.sh "apps/ packages/ convex/"`
    → exit 0 must still hold after every Phase-3 commit.

---

## 22. Red phase contract (per task in Phase 3)

Every Red below executes the production generator (or the adapter) and
asserts on its **observable output**. No spy oracles, no parity oracles,
no source-grep oracles standing alone. Source-grep is permitted only as a
**complement** to a runtime assertion, per the Phase-1 §5 / Phase-2 §15
rule.

### Task 3.1 — FR-7 rational-analyzer HA triviality + adapter grading (Red)

**Test file (modified):**
`packages/math-content/src/__tests__/rational-analyzer.test.ts`

**Block REPLACED:** `describe('horizontal asymptote', () => { ... })`
(currently lines 109-135 — three `it` blocks). The third `it` block
("leadingDegreeNum and leadingDegreeDen are the actual leading
coefficients") is a TAUTOLOGY (asserts a struct field equals the value
just plucked from the source array) and must also go.

**Replacement block (new tests in the same `describe`):**

1. **HA varies across seeds** (the variation assertion):
   ```ts
   it('horizontal asymptote ratio varies across seeds', () => {
     const ratios = new Set<number>();
     for (let seed = 1; seed <= 50; seed++) {
       const r = generateRationalProblem({ seed });
       ratios.add(r.horizontalAsymptote!.ratio);
     }
     // At HEAD: ratios = { 1 } (size 1). After FR-7: size > 1.
     expect(ratios.size).toBeGreaterThan(1);
   });
   ```
   This **fails at HEAD** (`776a8c63`): every seed produces `ratio: 1`,
   so the set has size 1. After Green introduces non-monic leading
   coefficients, multiple ratios appear.

2. **At least one seed produces a non-unit HA** (sanity for the
   variation):
   ```ts
   it('at least one of seeds 1..50 has horizontalAsymptote.ratio !== 1', () => {
     const found = Array.from({ length: 50 }, (_, i) => i + 1)
       .map(seed => generateRationalProblem({ seed }))
       .some(r => r.horizontalAsymptote!.ratio !== 1);
     expect(found).toBe(true);
   });
   ```
   Fails at HEAD; passes after Green.

3. **Adapter HA target is student-enterable** (the grading correctness):
   This is a new test in a new file (or in
   `__tests__/generator-registry.test.ts` — green role's choice; strategy
   recommends a new file `__tests__/advanced-math-adapters.test.ts` to
   keep the inventory clean):
   ```ts
   it('rational-analyzer adapter: horizontalAsymptote target is scalar (number | "none"), not the source object', () => {
     const gen = getGenerator('rational-analyzer');
     const output = gen.generate({ nodeId: 'x', seed: 1, difficulty: 0.5 });
     const ha = output.gradingMetadata.partAnswers.horizontalAsymptote;
     // FAIL at HEAD: ha is { leadingDegreeNum, leadingDegreeDen, ratio, isZero }
     // PASS after Green: ha is a number or the literal "none".
     const isStudentEnterable =
       typeof ha === 'number' || ha === 'none';
     expect(isStudentEnterable).toBe(true);
   });
   ```
   Plus a matching `output.expectedAnswer.horizontalAsymptote` shape
   assertion.

**Architectural complement (not the sole oracle):**
```ts
it('rational-analyzer source does not hardcode isZero: false', () => {
  const src = readFileSync(
    'packages/math-content/src/rational-analyzer.ts', 'utf8'
  );
  // FAIL at HEAD (line 179): `isZero: false, // degrees always equal`
  // After Green: either the field is computed (`isZero: numDeg < denDeg`)
  // or the construction varies degrees and the hardcoded `false` is gone.
  expect(src).not.toMatch(/isZero:\s*false,?\s*\/\/\s*degrees always/);
});
```
This pins the source-level invariant that the always-`y=1` bug shape
is gone. It is permitted ONLY because it complements the runtime
variation oracle above.

**Existing tests that must stay green (do not delete):**
- "return shape" (lines 26-53) — invariant.
- "seed 1 — structural verification" (lines 58-87) — the seed-1
  golden h/v/z values may shift after FR-7 introduces variation;
  green role MUST re-derive the seed-1 golden expectations (h, v, z,
  expected numerator/denominator) from the new generator and update
  the goldens. **This is the one place where a golden value updates
  are licit** — they encode a deliberate generator output change, not a
  test-relaxation. Mid-red note: do NOT update them defensively before
  Green; let the test fail, then derive correctly.
- "determinism" (lines 91-104) — invariant (still same-seed → same
  output).
- "invariants (seeds 1–50)" + "mathematical correctness" (lines 138-194)
  — invariants (still hold under the new construction).
- "step-by-step-solver fallback" (lines 198-210) — invariant.

**Why this Red is meaningful (not a parity / grep oracle):** the runtime
oracle is the **set-cardinality** of HA ratios across 50 seeds — a
falsifiable observable. At HEAD it has size 1 (the bug); after Green
it has size > 1 (the fix). No re-derivation of the source formula.

### Task 3.2 — FR-8 exp-log dead domain re-roll (Red)

**Test file (modified):**
`packages/math-content/src/__tests__/exp-log-solver.test.ts`

**Blocks REPLACED:**
- `describe('domain safety for log problems'…)` (lines 146-169) —
  delete the inner `expect(Number.isFinite(r.answer)).toBe(true)` and
  `expect(r.answer).toBeGreaterThan(r.domain.min)` assertions:
  both are construction-guaranteed and prove only that the function
  returned. Keep the outer `describe` only if it is repurposed.
- `describe('domain safety for ln problems'…)` (lines 175-193) —
  delete (same reasoning).
- `describe('domain safety for exp problems'…)` (lines 199-211) —
  delete (`Number.isFinite` on an integer in `[1,8]`).
- `describe('domain re-roll'…)` (lines 217-239) — DELETE both
  `it` blocks. The first claims to test re-roll behaviour but never
  exercises an invalid domain; the second is a generic 200-seed stress
  test that belongs (if anywhere) in a separate "stress" describe.
- The `expect(true).toBe(false)` lines at 116, 127, 138 in the LaTeX
  block — these are hand-rolled fail-this-test sentinels. **Strategy
  decision:** rewrite the loop bodies to assert "we saw at least one
  occurrence per problem type across N seeds" using `Array.some` +
  `expect(found).toBe(true)`, which is the same semantic without the
  fail-sentinel anti-pattern.

**Replacement block (new tests):**

1. **Single-pass generation (no re-roll)** — the canonical FR-8 Red:
   ```ts
   it('generateExpLogProblem makes exactly one call to its internal PRNG (no re-roll)', () => {
     // After FR-8, the public function constructs once and returns.
     // Black-box proof: re-run with N seeds, assert the output for
     // seed S is reachable WITHOUT incrementing seed.
     // Concretely: for every seed, the generator returns an answer
     // satisfying the domain constraint, AND the result for seed S
     // is the result that *would* be produced by the body of the
     // (currently-looping) construction at iteration 0.
     //
     // The cleanest expression: deterministic single-call PRNG ⇒
     // generateExpLogProblem({ seed: S }) returns a problem whose
     // first PRNG draw (typeDraw) is the same as a fresh
     // seededRandom(S)(). Until FR-9 lands the shared helper, we
     // assert the looser invariant: for every S in [1, 200], the
     // returned problem's domain is valid (no infinite loop, no
     // NaN), AND the function returns within 1 ms (a re-roll-free
     // path is fast; a buggy re-roll that loops forever would time
     // out, but a 1ms guard is a flaky oracle — use a counter
     // probe instead, see below).
     // …
   });
   ```
   **Strategy decision (binding):** the canonical re-roll-free proof
   is a **call-counter probe**. Spy the PRNG by injecting a counting
   wrapper. The honest way to do this *after* FR-9 lands the shared
   util is:
   ```ts
   import * as prng from '../utils/prng';
   const spy = vi.spyOn(prng, 'seededRandom');
   generateExpLogProblem({ seed: 7 });
   // Re-roll = re-construct seededRandom with a new seed.
   // Single-pass = exactly one call.
   expect(spy).toHaveBeenCalledTimes(1);
   ```
   This is BEHAVIOURAL (it observes a function's runtime call shape)
   and not a spy-on-spy anti-pattern (it does not stand in for a
   data-flow proof; the data-flow proof is the existing same-seed
   determinism test). **The FR-8 Red therefore depends on FR-9 having
   landed the shared util** so it can be spied. Strategy declares
   binding execution order: **FR-9 lands first, then FR-8 Red+Green**.
   See §24 commit sequence.

2. **Source-level architectural lint (complement only):**
   ```ts
   it('exp-log-solver.ts source contains no while(true) re-roll', () => {
     const src = readFileSync(
       'packages/math-content/src/exp-log-solver.ts', 'utf8'
     );
     // FAIL at HEAD (line 200): `while (true) {`
     // FAIL at HEAD (line 199): the eslint-disable comment.
     // FAIL at HEAD (line 218): `seed += 1;`
     expect(src).not.toMatch(/while\s*\(\s*true\s*\)/);
     expect(src).not.toMatch(/no-constant-condition/);
     expect(src).not.toMatch(/seed\s*\+=\s*1/);
   });
   ```
   Permitted as complement to the call-counter probe.

**Existing tests that must stay green:**
- All "return shape" tests (lines 22-70).
- "determinism" (lines 76-90).
- LaTeX correctness (lines 96-140 after the `expect(true).toBe(false)`
  rewrite). Mid-red note: the existence-of-problem-type-per-50-seeds
  loop is fine after rewrite — see strategy decision above.
- "steps" (lines 245-256).

**Why this Red is meaningful:** the call-counter probe is a behaviour
observation (function call shape), not a doc-presence or symbol-grep
oracle. The source-lint is gated as a complement. The Red→Green delta
is a real behaviour delta (one call vs. potentially multiple).

### Task 3.3 — FR-9 de-duplicate generator utilities (Red = none required)

**Per the spec: Green only. No new tests.**

Strategy adds a closeout invariant rather than a Red:

- **The Phase-3 closeout gate** (§24) requires that
  `grep -rn 'function seededRandom' packages/math-content/src/` returns
  exactly **1** match (the new util file). Similarly for
  `function generateCoefficients` (1 match) and `function formatPolynomial`
  (1 match). This is an architecture-lint gate, not a vitest test.
- **Determinism preservation:** all existing seed-dependent tests
  (`rational-analyzer.test.ts` "seed 1 — structural verification",
  `__tests__/generator-registry.test.ts` "seed-523 golden",
  `exp-log-solver.test.ts` "determinism", `adapter.test.ts` "advanced
  math generators produce valid GeneratorOutput") MUST stay green
  byte-for-byte after the extraction. This is the closeout gate.

Strategy decision (binding): Task 3.3 is **executed first** in Phase 3
because Task 3.2's call-counter probe imports the shared util module.
See §24.

### Task 3.4 — FR-10 dual registry + adapter `nodeIds` (Red)

**Test file (modified):**
`packages/math-content/src/knowledge-space/__tests__/adapter.test.ts`

**Additions (no replacements — the existing tests are valid; they
just don't cover `nodeIds`):**

1. **Non-empty `nodeIds` per advanced adapter** — the FR-18 missing
   assertion:
   ```ts
   describe('advanced math adapter nodeIds', () => {
     const advancedKeys = [
       'polynomial-operations',
       'polynomial-division',
       'rational-analyzer',
       'exp-log-solver',
     ];

     it.each(advancedKeys)('%s has non-empty nodeIds', (key) => {
       const gen = getGenerator(key);
       expect(Array.isArray(gen.nodeIds)).toBe(true);
       expect(gen.nodeIds.length).toBeGreaterThan(0);
     });

     it.each(advancedKeys)('%s nodeIds all match math.im3.skill.* pattern', (key) => {
       const gen = getGenerator(key);
       for (const id of gen.nodeIds) {
         expect(id).toMatch(/^math\.im3\.skill\./);
       }
     });
   });
   ```
   Both **FAIL at HEAD**: each adapter has `nodeIds: []` (length 0).

2. **Adapter `nodeIds` reference IDs that exist in the knowledge
   graph** — a stronger correctness probe:
   ```ts
   import nodes from '../../../../../apps/integrated-math-3/curriculum/skill-graph/nodes.json';
   const allNodeIds = new Set((nodes as Array<{ id: string }>).map(n => n.id));

   it.each(advancedKeys)('%s nodeIds are all present in the IM3 skill graph', (key) => {
     const gen = getGenerator(key);
     for (const id of gen.nodeIds) {
       expect(allNodeIds.has(id)).toBe(true);
     }
   });
   ```
   **Strategy caveat:** `packages/math-content` importing from
   `apps/integrated-math-3/curriculum/` is a directionality violation
   per the boundary contract (`apps/` depends on `packages/`, never
   the reverse). **Strategy decision (binding):** this test is
   **OPTIONAL — green role MAY add it as a stand-alone test file
   under `apps/integrated-math-3/__tests__/curriculum/`** rather than
   under `packages/math-content/`, so the directionality is preserved.
   The non-empty + pattern-match assertions (1 above) are sufficient
   for the FR-18 requirement; the graph-presence assertion is a
   defence-in-depth check that lives on the app side.

3. **Flat registry removal — architectural lint:**
   ```ts
   it('packages/math-content/src/generator-registry.ts is removed', () => {
     const exists = existsSync('packages/math-content/src/generator-registry.ts');
     expect(exists).toBe(false);
   });

   it('@math-platform/math-content does not re-export the flat GENERATOR_REGISTRY', () => {
     const indexSrc = readFileSync(
       'packages/math-content/src/index.ts', 'utf8'
     );
     expect(indexSrc).not.toMatch(/from\s+['"]\.\/generator-registry['"]/);
   });
   ```
   **Strategy caveat on file-existence assertions:** these are
   architecture lints, permitted as complements to the runtime
   `getGenerator` tests already in `adapter.test.ts:212-264`. They are
   NOT the sole oracle — the runtime tests prove the typed
   `MathGenerator` registry still works.

   **The existing flat-registry test file**
   `packages/math-content/src/__tests__/generator-registry.test.ts`
   (120 lines) must be **modified, not deleted**. Reasons:
   - Lines 17-47 (`describe('GENERATOR_REGISTRY')`) test the flat
     registry — must be deleted with the flat registry.
   - Lines 53-75 (`describe('index.ts re-exports')`) test the
     `generatePolynomialOperation` / `generatePolynomialDivision` / etc.
     re-exports — these MUST stay (those re-exports are not the flat
     registry).
   - Lines 81-119 (seed-523 golden + sparse-polynomial tests) — these
     test the underlying generator functions and the `multiplyPoly`
     / `addPoly` / `subtractPoly` utils. They MUST stay.
   Mid-red: delete only the `describe('GENERATOR_REGISTRY')` block
   (top of file + the import-line `GENERATOR_REGISTRY` symbol).
   Rename the file if appropriate (e.g.
   `generator-exports.test.ts`); strategy recommends keeping the
   filename for git-blame continuity.

**Why this Red is meaningful:** Non-empty `nodeIds` is a directly
observable property of the registered `MathGenerator`. The "matches
`math.im3.skill.*`" assertion is a falsifiable pattern check. The
runtime probes (1) above stand alone; (2) is optional defence-in-depth;
(3) complements the runtime.

### Task 3.5 — FR-11 PRNG labelling (Red = none required)

**Per the spec: docstring-only fix, subsumed by FR-9 shared util.**

The FR-9 extraction lands a single `seededRandom` with a corrected
JSDoc string. No Red is authored. The closeout invariant:
`grep -n 'glibc' packages/math-content/src/utils/prng.ts` (or
wherever the helper lands) returns a docstring that explicitly
acknowledges the JS-double-overflow caveat. **Strategy decision
(binding):** docstring-only.

### Task 3.6 — UMV closeout (Red contract = none)

UMV is performed by the user per workflow.md. Strategy artifact = the
set of Green outputs attached to the Phase-3 checkpoint git note
(see §25).

---

## 23. Green phase contract (Phase 3)

### Task 3.3 Green — FR-9 (lands first)

1. Create `packages/math-content/src/utils/prng.ts`:
   ```ts
   /**
    * Deterministic seeded PRNG using the glibc LCG constants
    * (1103515245, 12345) under JavaScript double-precision arithmetic.
    *
    * Important: JS doubles can only represent integers up to 2^53.
    * Multiplying a 31-bit state by 1103515245 produces intermediate
    * values that overflow 2^53 long before the `& 0x7fffffff` mask
    * is applied, so the bit pattern is NOT identical to a true 32-bit
    * glibc LCG. The output is still uniform-ish in [0, 1), strictly
    * deterministic (same seed → same sequence), and adequate for
    * problem-generation reproducibility. Do not use for cryptographic
    * or statistical work that requires the canonical 32-bit LCG.
    */
   export function seededRandom(seed: number): () => number {
     let s = seed | 0;
     return () => {
       s = (s * 1103515245 + 12345) & 0x7fffffff;
       return s / 0x7fffffff;
     };
   }
   ```
2. Create `packages/math-content/src/utils/coefficients.ts` with
   `generateCoefficients(rand, degree, leadingRange, otherRange?)`. The
   signature MUST accept the optional `otherRange` parameter; the two
   call sites pass `[-5,5]` (polynomial-operations) and `[-3,3]`
   (polynomial-division) explicitly via the call site — the **default**
   must not change behaviour for either, so keep the
   `polynomial-operations`-original default of `[-5, 5]` and update
   `polynomial-division` to pass `[-3, 3]` explicitly. Strategy
   recommendation: make the parameter required to remove ambiguity.
3. Move `formatPolynomial` into
   `packages/math-content/src/utils/polynomial-format.ts` (sibling to
   `polynomial.ts`; or append to `polynomial.ts` — green role's
   choice. Strategy recommends a new file to keep the precedent of
   one-symbol-per-utility-file).
4. Update all callers (6 files for `seededRandom`, 2 for
   `generateCoefficients`, 2 for `formatPolynomial`):
   - `polynomial-operations.ts` (remove local definitions, import).
   - `polynomial-division.ts` (same).
   - `rational-analyzer.ts` (same; also drops the local
     `formatPolynomial`).
   - `exp-log-solver.ts` (only `seededRandom`).
   - `knowledge-space/generators/registry.ts` (only `seededRandom`).
   - `knowledge-space/generators/advanced-math-adapters.ts` (only
     `formatPolynomial`).
   - `problem-families/im1/generators.ts` (only `seededRandom`). See
     scope-decision note in §20.
5. Existing tests MUST stay green byte-for-byte:
   - Same-seed determinism (rational, exp-log, registry seed-523).
   - All structural goldens (seed-1 in rational-analyzer remains
     unchanged AT THIS POINT — FR-7 will change them in Task 3.1).
6. Commit shape: single atomic commit per FR-9 (one diff, multiple
   files). Splitting into per-file commits risks half-extracted state
   where the helper exists but only some callers import it.
   Subject: `refactor(code-review-remediation): Phase 3 Green — FR-9
   extract seededRandom / generateCoefficients / formatPolynomial to
   utils/ (single-source-of-truth; FR-11 docstring corrected)`.

### Task 3.1 Green — FR-7

1. **Source change (`rational-analyzer.ts`):** introduce non-monic
   leading coefficients OR unequal degrees. Strategy recommendation
   (binding): introduce a **non-monic numerator leading coefficient**
   `aNum ∈ {1, 2, 3}` and **non-monic denominator leading coefficient**
   `aDen ∈ {1, 2, 3}` chosen via two extra PRNG draws after picking
   h/v/z. Apply by scaling the numerator factor:
   `factorH_scaled = [-aNum * h, aNum]`. This preserves the roots
   (and hence holes / VAs / x-intercepts) while varying the leading
   coefficient. Document the construction in the file's JSDoc header.
   - The `horizontalAsymptote.ratio` becomes `aNum / aDen`, which
     takes values in `{1/3, 1/2, 2/3, 1, 3/2, 2, 3}` (etc.) across
     seeds → satisfies the Set-cardinality Red.
   - `isZero` remains `false` (degrees still equal), but the
     hardcoded `false` is replaced with a computed expression
     `numerator.length < denominator.length` so the source-lint Red
     no longer fails. Optional extension: introduce ~33% of seeds
     producing unequal degrees (a 3-factor numerator vs. 2-factor
     denominator) — this makes `isZero` actually variable. Strategy
     allows this as a stretch goal; the minimum FR-7 Green is the
     non-monic-leading-coeff variation.
2. **Source change (`advanced-math-adapters.ts`):** in
   `rationalAnalyzerAdapter` (lines 147-200), replace the
   `horizontalAsymptote` partAnswer with:
   ```ts
   horizontalAsymptote: problem.horizontalAsymptote.isZero
     ? 'none'  // not "0" — student-enterable label for y=0 OR no HA
     : problem.horizontalAsymptote.ratio,  // scalar number
   ```
   and update `expectedAnswer` similarly. `partGradingRules.horizontalAsymptote`
   stays `'exact_match'` (a numeric match on the scalar) or change to
   `'numeric_tolerance'` with a 0.001 tolerance — green role's choice.
   Strategy recommendation: `numeric_tolerance` with 0.001 so `1/3`
   doesn't fail to display-string mismatch.
3. **Test goldens:** update `rational-analyzer.test.ts` seed-1
   structural goldens (h, v, z, expected numerator, expected
   denominator) to reflect the new construction. **Mid-red MUST run
   the test ONCE with `console.log(JSON.stringify(generateRationalProblem({seed:1})))`
   to derive the new goldens; do NOT hand-derive them.** This is a
   licit golden update per §22 Task 3.1.
4. Commit shape: single atomic commit (source + adapter + test
   updates + new HA-variation tests).
   Subject: `fix(code-review-remediation): Phase 3 Green — FR-7
   rational-analyzer non-monic HA variation + scalar adapter grading
   (FR-16 test replacement)`.

### Task 3.2 Green — FR-8 (depends on FR-9 having landed)

1. **Source change (`exp-log-solver.ts`):**
   - Delete lines 199-219 (the `// eslint-disable`, `while (true) {`,
     the `if (isDomainValid)` branch, and the `seed += 1`).
   - Inline the loop body so the function constructs one problem and
     returns it.
   - Delete the `isDomainValid` function (lines 164-176) — unused
     after the loop deletion.
   - Update the JSDoc on `generateExpLogProblem` (lines 182-193) to
     remove the misleading "Domain safety" paragraph. Replace with:
     "By construction, the argument `Ax + C` at the solution equals
     `10^D` (log) or `e^D` (ln), both strictly positive, so the
     domain constraint is always satisfied." This is the corrected
     docstring; do NOT silently delete the paragraph.
2. **Test changes (`exp-log-solver.test.ts`):**
   - Delete the four `describe('domain …')` blocks (lines 146-239)
     EXCEPT keep the new single-pass assertion (the call-counter
     probe from §22 Task 3.2).
   - Rewrite the three `expect(true).toBe(false)` patterns in the
     LaTeX block (lines 116, 127, 138) using the `Array.some` pattern
     described in §22.
3. Commit shape: single atomic commit (source + test edits + new
   single-pass test).
   Subject: `fix(code-review-remediation): Phase 3 Green — FR-8
   remove dead exp-log domain re-roll + single-pass test (FR-16
   replacement)`.

### Task 3.4 Green — FR-10

1. **Adapter `nodeIds` population** in
   `knowledge-space/generators/advanced-math-adapters.ts`:
   - `polynomialOperationsAdapter.nodeIds`:
     `['math.im3.skill.2.3.add-and-subtract-polynomials',
       'math.im3.skill.2.3.multiply-polynomials',
       'math.im3.skill.2.aleks.polynomial-add-subtract',
       'math.im3.skill.2.aleks.polynomial-multiplication']`.
   - `polynomialDivisionAdapter.nodeIds`:
     `['math.im3.skill.2.4.divide-polynomials-by-using-long-division',
       'math.im3.skill.2.aleks.polynomial-long-division']`.
   - `rationalAnalyzerAdapter.nodeIds`:
     `['math.im3.skill.7.4.graph-and-analyze-rational-functions-with-vertical-and-horiz',
       'math.im3.skill.7.aleks.rational-function-asymptote-analysis']`.
   - `expLogSolverAdapter.nodeIds`:
     `['math.im3.skill.5.2.solve-exponential-equations-in-one-variable',
       'math.im3.skill.6.2.solve-logarithmic-equations-using-properties-of-equality',
       'math.im3.skill.6.3.solve-exponential-equations-by-using-common-logarithms',
       'math.im3.skill.6.4.solve-exponential-equations-by-using-natural-logarithms']`.
   Mid-red MUST re-verify each ID via `grep` against
   `apps/integrated-math-3/curriculum/skill-graph/nodes.json` before
   committing. If any ID has shifted, pick the closest match in the
   same module/topic.
2. **Flat registry removal:**
   - Delete `packages/math-content/src/generator-registry.ts`.
   - Delete the two lines `export { GENERATOR_REGISTRY } from './generator-registry';`
     and `export type { GeneratorEntry } from './generator-registry';`
     in `packages/math-content/src/index.ts` (lines 67-68).
   - Delete the `describe('GENERATOR_REGISTRY', …)` block in
     `__tests__/generator-registry.test.ts:17-47` and the
     `import { GENERATOR_REGISTRY } from '../generator-registry';`
     line. Keep the rest of the file.
3. **Test changes (`adapter.test.ts`):** add the new
   `describe('advanced math adapter nodeIds')` block from §22 Task 3.4.
4. Commit shape: single atomic commit (adapter `nodeIds` population
   + flat-registry removal + test additions + flat-registry test
   surgery).
   Subject: `fix(code-review-remediation): Phase 3 Green — FR-10
   populate advanced-adapter nodeIds + remove redundant flat
   generator-registry (FR-18)`.

### Task 3.5 Green — FR-11

Subsumed by FR-9. No separate commit.

### Phase 3 closeout gate

All of:
- `npm run --workspace=packages/math-content test -- --run rational-analyzer`
  → pass (including 2 new HA-variation tests + new seed-1 goldens).
- `npm run --workspace=packages/math-content test -- --run exp-log-solver`
  → pass (with new single-pass test, all `expect(true).toBe(false)`
  patterns gone).
- `npm run --workspace=packages/math-content test -- --run adapter`
  → pass (new `nodeIds` tests).
- `npm run --workspace=packages/math-content test -- --run generator-registry`
  → pass (flat-registry block deleted; remaining tests still cover
  index re-exports and seed-523 golden).
- `npm run --workspace=packages/math-content test -- --run`
  (whole package) → pass count after Phase 3 = (pass count at
  baseline `776a8c63`) + new tests − deleted tests. Strategy
  estimate: +4 HA-variation tests, +5 nodeIds tests, +1 single-pass
  test, +1 flat-registry-removal lint, −3 trivial HA tests, −2
  domain-safety blocks (~6 tests), −2 domain re-roll tests, −5 flat
  registry tests = net **−1 to +1** (within noise). Mid-red MUST
  capture exact deltas.
- `grep -c '^function seededRandom' packages/math-content/src/**/*.ts`
  → **1** (the new util). The current count is **6**.
- `grep -c '^function generateCoefficients' packages/math-content/src/**/*.ts`
  → **1**. Current: 2.
- `grep -c '^function formatPolynomial' packages/math-content/src/**/*.ts`
  → **1**. Current: 2.
- `ls packages/math-content/src/generator-registry.ts` → not found.
- `grep -n "from './generator-registry'" packages/math-content/src/index.ts`
  → 0 matches.
- `grep -c 'nodeIds: \[\]' packages/math-content/src/knowledge-space/generators/advanced-math-adapters.ts`
  → **0** (all four populated). Current: 4.
- `grep -n 'while.*true' packages/math-content/src/exp-log-solver.ts`
  → 0 matches. Same for `no-constant-condition` and `seed += 1`.
- `grep -n 'isZero: false' packages/math-content/src/rational-analyzer.ts`
  → 0 matches.
- `bash measure/tracks/code-review-remediation_20260624/scripts/check-jsdoc-balanced-braces.sh "apps/ packages/ convex/"`
  → exit 0 (Phase-1 invariant).
- `npx tsc --noEmit` (from repo root) → **no NEW errors versus
  Phase-2 closeout baseline** (the package-standalone math-content
  red is pre-existing, tech-debt #25). Specifically, the changed files
  must compile clean in the monorepo context.
- `npx eslint packages/math-content/src/utils/prng.ts packages/math-content/src/utils/coefficients.ts packages/math-content/src/utils/polynomial-format.ts packages/math-content/src/rational-analyzer.ts packages/math-content/src/exp-log-solver.ts packages/math-content/src/polynomial-operations.ts packages/math-content/src/polynomial-division.ts packages/math-content/src/knowledge-space/generators/advanced-math-adapters.ts packages/math-content/src/knowledge-space/generators/registry.ts packages/math-content/src/problem-families/im1/generators.ts`
  → 0 errors (math-content package-level lint is in tech-debt; targeted
  file lint is the gate per Phase-2 §12).

---

## 24. Anti-pattern guards (Phase 3 specifically)

Per FR-16, FR-20, and Phase-1 §5 / Phase-2 §15, these patterns are
**prohibited** in Phase 3 work:

1. **Construction-guaranteed assertions.** `expect(Number.isFinite(r.answer))`
   and `expect(r.answer > r.domain.min)` are the canonical FR-20
   anti-pattern: the production code's construction makes them true
   by structure. They cannot fail. Any Phase-3 test that adds a new
   `Number.isFinite` / `> domain.min` assertion on the exp-log output
   is reverting FR-8.
2. **Hand-rolled fail sentinels.** `expect(true).toBe(false)` inside an
   `if`/`for` to mean "this code path was reached" is forbidden. Use
   `Array.some` + `expect(found).toBe(true)`, or restructure the loop
   so the assertion is the loop body.
3. **Tautological field-equality assertions.** `expect(ha.ratio).toBeCloseTo(
   leadingNum/leadingDen)` where the same arrays' indices were used to
   produce `ratio` is re-derivation, not verification. Forbidden as
   the FR-7 oracle.
4. **Encoding the bug as the requirement.** `isZero is false … our
   construction always does` is the canonical "test certifies the
   defect" pattern. The Red MUST replace such assertions, not invert
   them (`isZero is true` would be the same anti-pattern with sign
   flipped).
5. **Snapshot tests on the rational-analyzer output.** A new
   `toMatchSnapshot` would freeze the bug shape into the test ledger.
   Forbidden.
6. **PRNG swap as a "fix" for FR-11.** Strategy decision in §21:
   FR-11 is docstring-only. Switching to `Math.imul` changes the bit
   pattern, breaks every seed-determinism golden in the package
   (~10+ tests), and is out of scope. If a future track wants 32-bit
   semantics, that is a separate task with a golden-rewrite plan.
7. **Surgical preservation of the flat `generator-registry.ts`.**
   Keeping the flat registry "just in case" violates FR-10. The
   removal must be atomic with the adapter `nodeIds` population —
   anything less leaves a defected artefact in HEAD.
8. **Importing curriculum graph data into `packages/math-content`.**
   The `apps/integrated-math-3/curriculum/skill-graph/nodes.json`
   reachability test (§22 Task 3.4 #2) is **OPTIONAL** and must live
   on the `apps/` side if used. Pulling curriculum JSON into the
   `packages/` package inverts the boundary.
9. **Aggregate `npm test` or full-package vitest at closeout.** Phase
   2 §15 anti-pattern #1 still applies: targeted vitest scopes only.
10. **Re-derivation of seed-523 / seed-1 goldens from the production
    code in the test itself.** When the FR-7 Green changes the seed-1
    rational-analyzer output, the new golden is updated to the new
    observed output by ONE-TIME inspection (capture via console.log,
    inspect, paste). Writing the test as `expect(r.numerator).toEqual(generateRationalProblem({seed:1}).numerator)`
    is a parity oracle. Forbidden.
11. **Spy-on-spy as the FR-8 single-pass oracle.** A test that mocks
    `seededRandom` to return a fake counter and asserts the counter
    incremented exactly once is FR-20 anti-pattern (it tests the
    test, not the code). The licit pattern is `vi.spyOn(prng, 'seededRandom')`
    which leaves the real implementation in place and counts call
    invocations on the real export.

---

## 25. Test file inventory (Phase 3)

| Path | Status | Purpose |
|---|---|---|
| `packages/math-content/src/utils/prng.ts` | NEW (source) | Single-source `seededRandom`. FR-9 + FR-11. Listed for cross-reference. |
| `packages/math-content/src/utils/coefficients.ts` | NEW (source) | Single-source `generateCoefficients`. FR-9. |
| `packages/math-content/src/utils/polynomial-format.ts` | NEW (source) | Single-source `formatPolynomial`. FR-9. (Green role may instead append to `polynomial.ts`.) |
| `packages/math-content/src/__tests__/rational-analyzer.test.ts` | MODIFIED | DELETE `describe('horizontal asymptote')` block (lines 109-135). ADD HA-variation tests + adapter scalar-grading test + source-lint complement. UPDATE seed-1 structural goldens (h/v/z + expected polynomials). |
| `packages/math-content/src/__tests__/exp-log-solver.test.ts` | MODIFIED | DELETE 4 domain blocks (lines 146-239). ADD call-counter single-pass test + source-lint complement. REWRITE 3 `expect(true).toBe(false)` patterns to `Array.some` + boolean. |
| `packages/math-content/src/knowledge-space/__tests__/adapter.test.ts` | MODIFIED | ADD `describe('advanced math adapter nodeIds')` (3 nested tests). No deletions. |
| `packages/math-content/src/__tests__/generator-registry.test.ts` | MODIFIED | DELETE `describe('GENERATOR_REGISTRY')` block (lines 17-47) + the `import { GENERATOR_REGISTRY } from '../generator-registry'`. KEEP the index-reexport + seed-523 + multiplyPoly/addPoly/subtractPoly blocks. |
| `packages/math-content/src/generator-registry.ts` | DELETED | FR-10 redundant flat registry. |
| `packages/math-content/src/__tests__/advanced-math-adapters.test.ts` | NEW (optional) | Adapter-level scalar-grading assertion (the FR-7 adapter Red). Green role MAY instead place this assertion inside `adapter.test.ts`. Strategy recommends a separate file to keep `adapter.test.ts` focused on its existing 6 describe blocks. |
| `apps/integrated-math-3/__tests__/curriculum/advanced-adapter-graph-coverage.test.ts` | NEW (optional) | The `nodeIds ⊆ graph` defence-in-depth check. **Only if green role chooses to add it.** Lives on the app side to preserve the boundary. |

No changes to `__tests__/exports.test.ts`, `__tests__/integration.test.ts`,
`__tests__/schemas.test.ts`, `__tests__/polynomial.test.ts`, or the
`knowledge-space/generators/__tests__/registry-sweep.test.ts` (which
is its own Red owned by `generated-math-correctness-qa` archive track).

---

## 26. Acceptance evidence (Phase 3)

Attached to the Phase-3 checkpoint git note:

1. **FR-7 evidence (red → green diff):**
   - `rational-analyzer.test.ts` HA-block Red run at `776a8c63`:
     pass (the trivial assertions hold at HEAD); the **new**
     variation test fails when run against HEAD (set size = 1).
   - Same test on Green: variation test passes (set size > 1);
     scalar-adapter test passes.
   - Adapter scalar test stdout: `gradingMetadata.partAnswers.horizontalAsymptote`
     is `number` or `'none'`.
2. **FR-8 evidence:**
   - `exp-log-solver.test.ts` deletion proof:
     `git diff baseline..HEAD -- packages/math-content/src/__tests__/exp-log-solver.test.ts`
     showing the 4 domain blocks removed and the new call-counter test added.
   - Source diff:
     `git diff baseline..HEAD -- packages/math-content/src/exp-log-solver.ts`
     showing the `while (true)` loop, `isDomainValid`, and `seed += 1`
     deleted.
   - Call-counter probe stdout: `seededRandom` called exactly once
     per `generateExpLogProblem` invocation.
3. **FR-9 evidence:**
   - `grep` counts as in §23 closeout (3 unique-source-symbol gates).
   - All seed-determinism tests still green (rational seed-1
     structural — with NEW goldens; exp-log determinism; registry
     seed-523 unchanged; quadratic-graph-analysis adapter sweep
     unchanged).
4. **FR-10 evidence:**
   - `git diff baseline..HEAD -- packages/math-content/src/knowledge-space/generators/advanced-math-adapters.ts`
     showing 4 `nodeIds: [...]` populations.
   - `ls packages/math-content/src/generator-registry.ts` → not found.
   - `nodeIds` test stdout: each advanced adapter has ≥ 1 entry, all
     matching `math.im3.skill.*`.
5. **FR-11 evidence:**
   - `git diff baseline..HEAD -- packages/math-content/src/utils/prng.ts`
     showing the corrected docstring with the JS-double-overflow
     caveat.
6. **Phase-1+2 invariants preserved:**
   - FR-3 guard exit 0 on the post-Phase-3 tree.
   - Phase-2 `studentVisualization` / `studentVisualizationMultiModule`
     / `visualizationLearnerStateUnion` suites still green (run
     scoped — no full repo aggregate).
7. **Commit SHAs (in order, per §27):**
   1. FR-9 Green (refactor extraction).
   2. FR-7 Green (rational + adapter + test goldens).
   3. FR-8 Green (exp-log + test replacement).
   4. FR-10 Green (adapter nodeIds + flat-registry removal + test
      additions).
   5. Plan-update commit marking Phase 3 tasks complete.
   6. Checkpoint commit (workflow.md §70).
8. **Closeout artifact:** `_artifacts/phase-3-gates.txt` with the
   grep counts, vitest pass-counts, lint+tsc outputs.

---

## 27. Risks & open questions (Phase 3)

1. **`problem-families/im1/generators.ts:18` `seededRandom` scope
   creep.** Spec enumerates 5 sites; strategy adds the 6th. If green
   role disagrees, the IM1 copy stays — but FR-9's "single source of
   truth" goal is then only partially achieved. Strategy
   recommendation: include it. Document the decision in the FR-9
   commit body.
2. **FR-7 non-monic introduction changes seed-1 golden.** The
   existing `rational-analyzer.test.ts` "seed 1 — structural
   verification" tests assert exact `numerator` / `denominator`
   arrays. After FR-7 introduces `aNum`/`aDen` PRNG draws, the seed-1
   draw sequence shifts: `h, v, z` are no longer the first three
   integers from `seededRandom(1)`. Mid-red MUST capture the new seed-1
   values by console.log and paste-update the golden. This is the ONLY
   licit golden update in Phase 3. **Strategy expectation:** the test
   comment "PRNG seed 1 yields: h=0, v=-6, z=-7" (line 56) is
   stale-after-Green; update it.
3. **Call-counter probe boundary (`vi.spyOn(prng, 'seededRandom')`).**
   This requires `prng.ts` to export `seededRandom` as a *named*
   import that vitest can intercept (not as `default`). Strategy
   default in §23: named export. Mid-red: verify ES module spy works
   under vitest's default config; if not, fall back to a counting
   wrapper exported from a `utils/prng-instrumented.ts` test helper.
4. **`@math-platform/math-content` re-export breakage.** Removing the
   flat `GENERATOR_REGISTRY` re-export from `index.ts` is a public-API
   break of the package. Verified: no consumer outside the package
   uses it (the only `import` of the symbol is the test file). Still,
   green role MUST grep for any external consumer one more time before
   committing:
   `grep -rn "GENERATOR_REGISTRY" --include='*.ts' --include='*.tsx' apps/ packages/`
   — if any non-test source uses it, escalate.
5. **`tsc --noEmit` math-content standalone baseline.** Tech-debt
   item #25 documents that `packages/math-content` has a red standalone
   tsc. The Phase-3 gate is "no NEW errors in the changed files versus
   Phase 2 closeout baseline" — not a clean run. Mid-red MUST run
   `npx tsc --noEmit -p packages/math-content` BEFORE editing to
   capture the baseline error count, then re-run AFTER each commit and
   diff. Strategy recommendation: capture the baseline once at start of
   Phase 3 into `_artifacts/phase-3-tsc-baseline.txt`.
6. **`seededRandom` byte-equality across the extraction.** The FR-9
   helper MUST produce identical output to every current call site for
   every seed. Strategy decision: keep the **exact** arithmetic
   (`(s * 1103515245 + 12345) & 0x7fffffff` and `s / 0x7fffffff`).
   Any cosmetic rewrite (e.g. `Math.fround`, `Math.imul`,
   `Number.MAX_SAFE_INTEGER`) changes the bit pattern and breaks
   determinism. The FR-11 fix is the **comment**, not the math.
7. **Adapter `nodeIds` may overlap with the typed pilot generators**
   (`quadraticGraphAnalysisGenerator.nodeIds`, etc., at
   `registry.ts:47-204`). Two generators registering the same nodeId
   is a different kind of bug (which one resolves for a given node?).
   Strategy verified: no pilot generator currently lists any of the
   advanced-adapter target nodeIds. If FR-10's chosen IDs collide,
   escalate to a curriculum-data tech-debt entry (do NOT silently
   pick a different ID — that hides the collision).
8. **Adapter test boundary** for the `nodeIds ⊆ graph` check.
   Strategy default: OPTIONAL, on the app side. Mid-red may decide
   against authoring it. The non-empty + pattern-match assertions are
   the binding FR-18 minimum.
9. **PRNG advance count after FR-7.** Adding two `aNum`/`aDen` draws
   to `generateRationalProblem` will affect the relative
   sequence-position of subsequent draws (h/v/z). The existing test
   `rational-analyzer.test.ts:96-104` "different seeds produce
   different structures" is structural and stays green; the seed-1
   golden update (§27 risk #2) is the only fallout.
10. **Schema parser test on the rational HA shape.** The
    `__tests__/schemas.test.ts` file (not opened by strategy) MAY
    contain a schema for the `RationalProblem` interface or the
    adapter's `gradingMetadata`. If FR-7 introduces a
    `horizontalAsymptoteY: number | 'none'` scalar to
    `RationalProblem`, mid-red MUST verify
    `schemas.test.ts` still passes (or update the schema). Strategy
    recommendation: keep `RationalProblem.horizontalAsymptote` as the
    rich object (so the structural-feature tests stay green); the
    adapter alone projects it to the scalar at the boundary. No
    interface change.
11. **`exp-log-solver` JSDoc post-Green.** The Phase-1 FR-3 guard
    counts JSDoc balanced braces. The corrected JSDoc on
    `generateExpLogProblem` MUST keep `@param {…}` and `@returns {…}`
    balanced. Mid-red: re-run the FR-3 guard scoped to the changed
    file after each Phase-3 commit to catch any accidental brace
    introduction.

---

## 28. Commit & handoff plan (Phase 3)

**Strict execution order (binding):**

1. **FR-9 first.** The shared util MUST exist before FR-8's
   call-counter probe can spy on it. Any other order forces FR-8's
   Red to be authored against the per-file `seededRandom` and then
   re-targeted after the extraction — pure waste.
2. **FR-7 next.** Changes seed-1 goldens; isolated to
   `rational-analyzer.ts` + the adapter + that single test file.
3. **FR-8.** Now that the spied util exists, the single-pass test
   can be authored cleanly.
4. **FR-10.** Adapter `nodeIds` + flat-registry removal — fully
   independent of FR-7/8/9 changes; could land in parallel but is
   placed last so its post-Phase-2 commit history is contiguous.
5. **FR-11.** Subsumed by FR-9 (no separate commit).

**Expected Phase-3 commit sequence (≤6 commits + checkpoint):**

| # | Type | Scope | Subject |
|---|---|---|---|
| 1 | `refactor` | code-review-remediation | Phase 3 Green — FR-9 extract seededRandom / generateCoefficients / formatPolynomial to utils/ (FR-11 docstring corrected) |
| 2 | `fix` | code-review-remediation | Phase 3 Green — FR-7 rational-analyzer non-monic HA variation + scalar adapter grading (FR-16 test replacement) |
| 3 | `fix` | code-review-remediation | Phase 3 Green — FR-8 remove dead exp-log domain re-roll + single-pass test (FR-16 replacement) |
| 4 | `fix` | code-review-remediation | Phase 3 Green — FR-10 populate advanced-adapter nodeIds + remove redundant flat generator-registry (FR-18) |
| 5 | `docs` | code-review-remediation | Phase 3 _artifacts (phase-3-gates, phase-3-tsc-baseline) |
| 6 | `measure(plan)` | — | Mark Phase 3 tasks complete with commit SHAs |
| 7 | `measure(checkpoint)` | — | Checkpoint end of Phase 3 |

Each of commits 1–4 gets a git note per workflow.md step 10 (task
summary, files changed, why, evidence excerpts).

**Strategy note on Red/Green commit pairing:** Phases 1 and 2 ran with
explicit `test:` (Red) commits followed by `fix:` (Green) commits. In
Phase 3, the Red and Green for each FR are tightly coupled (the test
deletions/additions and the source change must land together or the
suite goes red mid-sequence). Strategy permits **atomic Red+Green
commits** here, NOT separate. Reason: every FR-7/8/10 Red is a test
**replacement** (delete certifying block, add behavioural block) —
the suite cannot stay green across a separated Red→Green split.
Reviewers see the test/source delta in one diff, which is also
clearer for FR-16's "test replacement" audit trail.

**What mid-red needs to know (handoff):**

1. **Order is FR-9 → FR-7 → FR-8 → FR-10.** Do not start FR-8 before
   FR-9 lands (the call-counter probe imports the shared util).
2. **Capture `_artifacts/phase-3-tsc-baseline.txt` at the very start**
   (run `npx tsc --noEmit -p packages/math-content` against
   `776a8c63`). This is the diff baseline for every subsequent commit.
3. **Re-verify node IDs (§21) immediately before committing FR-10.**
   The root graph may have shifted since Phase 2; do not blindly trust
   the strategy's IDs.
4. **For FR-7, capture seed-1 goldens by console.log AFTER the source
   change.** Do not predict them. Update the test once with the
   captured values.
5. **For FR-8, the call-counter probe is the canonical Red.** If
   `vi.spyOn` on a named ES export fails under vitest config, fall
   back to a counting wrapper (see §27 risk #3). Do NOT fall back to
   `Number.isFinite` — that is the anti-pattern the test is replacing.
6. **For FR-9, include the IM1 `problem-families/im1/generators.ts`**
   `seededRandom` in the extraction. Strategy decision; document in
   commit body.
7. **For FR-10, the `nodeIds ⊆ graph` test is OPTIONAL** and lives
   on the app side. The non-empty + pattern tests are mandatory.
8. **Atomic Red+Green per FR is permitted.** Separate `test:` /
   `fix:` commits would briefly red the suite (because the test
   replacement and the source change are coupled). Land them
   together; reviewers audit the Red→Green pivot via diff.
9. **Phase-1 + Phase-2 invariants are gates.** FR-3 JSDoc guard exit
   0; Phase-2 multi-module + learner-state-union suites green. Do
   not regress.
10. **Do not touch `__tests__/generator-registry.test.ts` seed-523
    golden.** It is FR-19 (Phase 7), not Phase 3. The
    self-contradicting comment stays as-is for now.
11. **Do not touch `games-exports.test.ts`.** Also FR-19, Phase 7.
12. **Targeted vitest scopes only.** No aggregate `npm test`. The
    `placement-engine-extra*.test.ts` files are intentionally red and
    will swallow any Phase-3 signal if invoked.
