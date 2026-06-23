# Specification: Code Review Remediation (2026-06-24)

## Overview

A line-by-line review of all code-touching commits from the 72-hour window
ending 2026-06-24 (tracks: `advanced-math-generators`, `planner-prod-wiring`,
`parent-portal-prod-wiring`, `unified-auth-monorepo`,
`precalc-alignment-concept-taxonomy`, `study-hub-games-adoption`, and the
`spec-compliance-and-process-integrity` JSDoc batch) surfaced a cluster of
defects that the green test suites and `tsc --noEmit` did **not** catch —
because they are either invisible to the type checker (JSDoc type tags on
`.ts` files) or because tests assert the presence of behavior that is dead,
trivial, or scoped to a no-op.

This is a **high-priority** remediation track. Its goal is to remove the
shipped defects, correct the half-finished work, and add a guard so the
worst class (malformed machine-generated JSDoc) cannot recur.

This is a **chore/bug remediation** track using the Classic FR list format.

## Functional Requirements

### Cluster A — Malformed JSDoc (highest priority)

**FR-1 — Remove the 4 committed malformed `@returns` annotations at HEAD.**
The buggy JSDoc generator emitted `@returns {<type> {} …` (stray empty braces,
dropped closing brace). Four instances are committed and live at HEAD:
- `apps/integrated-math-3/app/api/dev/review-queue/route.ts:141`
  (`@returns {JSX.Element} {Promise<string | null> {} …` — doubly broken)
- `apps/integrated-math-3/app/api/student/lesson-chatbot/route.ts:24`
- `apps/integrated-math-3/components/teacher/gradebook/CourseOverviewGrid.tsx:16`
- `packages/knowledge-space-practice/src/projections/activity-map.ts:65`
Each must be rewritten to valid JSDoc (`@returns {<balanced type>} <desc>`).

**FR-2 — Discard and cleanly regenerate the uncommitted JSDoc batch.**
The 144-file working-tree batch contains ~345 malformed `@returns` and several
truncated `@param` function/object types. Per the chosen approach:
1. `git restore` the 144 working-tree files to HEAD (discard the malformed batch).
2. Fix the JSDoc generator's templating: `@returns` must emit `{<type>}` with no
   trailing ` {}`; `@param {type}` must emit fully-balanced inline object/function
   types (e.g. `(expression: string, problemType: string) => string[]`) or omit
   the `{type}` and keep prose only.
3. Re-run the generator and verify zero unbalanced-brace annotations before
   committing.

**FR-3 — Add a JSDoc balanced-brace lint guard.**
Add a cheap check (lint rule or test) that fails when any added
`@param {…}` / `@returns {…}` annotation has unbalanced `{`/`}` or a stray
empty `{}` after the type. This prevents recurrence of FR-1/FR-2 and must run
in the package(s) where the JSDoc batch lands.

### Cluster B — Production-wiring scope & dead work

**FR-4 — Generalize student & parent projections beyond Module 1.**
`apps/integrated-math-3/convex/student.ts` (`getStudentVisualizationHandler`)
and `apps/integrated-math-3/convex/parent/visualization.ts`
(`projectParentVisualizationHandler`) hardcode `module-1/nodes.json` +
`module-1/edges.json`, so projections only ever reflect 1 of 9 curriculum
modules regardless of the student's placement data. Load/merge the full
curriculum knowledge graph (all modules) so projections reflect every module
the student has data for. Both handlers must use the same shared graph-loading
helper (no per-handler duplication).

**FR-5 — Remove the planner's throwaway `student_competency` read.**
In `getStudentVisualizationHandler`, the
`ctx.db.query("student_competency").withIndex(...).collect()` call discards its
result and exists only so a test can assert the table is read. Remove the dead
read (and adjust the offending test), OR actually consume the competency rows in
`learnerState` derivation. Production must not pay a full-table read for data it
throws away.

**FR-6 — Surface `review_due` learner state (or remove it from the union).**
Both projection handlers map mastery to only `mastered`/`ready`/`blocked`; the
`review_due` state is in the type union but never produced. Either derive it
from SRS/review data or narrow the union so the dead value is not misleading.

### Cluster C — `advanced-math-generators` correctness & quality

**FR-7 — Fix rational-analyzer horizontal-asymptote triviality & grading.**
`packages/math-content/src/rational-analyzer.ts` builds monic degree-2
numerator and denominator, so every generated problem has horizontal asymptote
`y = 1` (`ratio`, `isZero`, `leadingDegree*` are constant). Introduce real
variation (e.g. non-monic leading coefficients and/or unequal degrees) so the
horizontal-asymptote feature is pedagogically meaningful. In
`advanced-math-adapters.ts`, stop grading the `horizontalAsymptote` **object**
with `exact_match` — grade a student-enterable value (e.g. the numeric `y`
or `"none"`), or drop it from `partAnswers`.

**FR-8 — Remove the exp-log dead domain re-roll.**
`packages/math-content/src/exp-log-solver.ts` wraps generation in a
`while (true)` re-roll guarded by `isDomainValid`, which is provably always
`true` (the argument at the solution is `10^D` / `e^D` > 0 by construction).
Remove the dead loop, the `seed += 1` re-roll, the `no-constant-condition`
eslint-disable, and the misleading "domain safety" doc.

**FR-9 — De-duplicate generator utilities.**
`seededRandom` is copy-pasted in 5 files
(`polynomial-operations.ts`, `polynomial-division.ts`, `rational-analyzer.ts`,
`exp-log-solver.ts`, `knowledge-space/generators/registry.ts`);
`generateCoefficients` is duplicated 2×; `formatPolynomial` is duplicated 2×.
Extract single shared implementations into `packages/math-content/src/utils/`
and import them. Behavior must be preserved (determinism unchanged).

**FR-10 — Consolidate the two `GENERATOR_REGISTRY` definitions & wire adapter nodeIds.**
There are two registries for the same four generators:
`packages/math-content/src/generator-registry.ts` (flat, returns `unknown`) and
`knowledge-space/generators/registry.ts` (typed `MathGenerator`). Remove the
redundant flat registry (or document why both must exist). The four advanced
adapters all ship with `nodeIds: []`, so they are unreachable through any
node-based generator resolution — map each to its real `math.im3.skill.*`
node id(s), consistent with the IM3 blueprint `generatorKey` metadata, or
document why key-only reachability is sufficient.

**FR-11 — Correct PRNG labelling.**
The `s * 1103515245` LCG overflows `2^53` in JS doubles, so it is not the
glibc LCG the comments claim. Determinism is preserved, so this is a comment/
labelling fix (and is resolved for the shared copy by FR-9): correct the
docstring to describe the actual deterministic generator, or switch to a
32-bit-safe formulation (e.g. `Math.imul`) if exact LCG semantics are wanted.

### Cluster D — `precalc-alignment-concept-taxonomy`

**FR-12 — Fix the concept-blueprint remediation script's scan path.**
`scripts/remediate-concept-blueprints.ts` only collects files literally named
`blueprints.json`, but IM3 blueprints live in
`curriculum/implementation/practice-v1/activity-map.json` (per the track's own
commit notes). The script reported "0 concept blueprints across 0 files" —
a false clean. Point the scan at the real blueprint artifact(s), re-run, and
record the true result.

**FR-13 — Address concept resolution dropping sibling skills.**
`selectSkill` in `activity-map.ts` resolves a `concept` node to only the
alphabetically-first child skill, silently discarding the rest, so a concept
aggregating N skills emits practice rows for only 1. Either emit rows for all
child skills, or document the single-skill resolution as intentional with its
rationale.

### Cluster E — `unified-auth-monorepo` follow-through

**FR-14 — Finish the IM3 auth-wrapper unification (deferred).**
`apps/integrated-math-3/lib/auth/server.ts` still carries inline
`getCookieValueFromHeader`, 401/403/503 response builders, and request guards
that BM2 already replaced with composition over
`packages/core-auth/request-guards`. The deferral was blocked by the IM3 test
mock stubbing only `verifySessionToken`. Update the IM3 auth test harness to
stub the new request-guard exports, then replace the inline helpers with
core-auth composition. (Already tracked as an Open tech-debt item from
`unified-auth-monorepo_20260609` Phase 4.)

### Cluster F — Repo hygiene

**FR-15 — Remove stray untracked junk files.**
Delete the empty `--db` and `--symbol` files in the repo root (created by a
misfired CLI flag, likely a `build-graph` invocation). Add a guard/`.gitignore`
entry if the offending command pattern recurs.

## Non-Functional Requirements

- **No behavior regression** in determinism of any generator (same seed → same
  output) except where FR-7 intentionally changes generated rational problems.
- All changed packages/apps must pass `npm run lint`, relevant tests, and
  `npx tsc --noEmit` (no *new* type errors; pre-existing baselines noted in
  tech-debt are out of scope).
- TDD: each behavioral fix lands as a failing test (Red) first, then the fix
  (Green), per the project workflow.

## Acceptance Criteria

1. `git grep -nP '@returns \{.+ \{\} '` and an equivalent unbalanced-`@param`
   scan return **zero** matches across committed `*.ts`/`*.tsx` (excl.
   `node_modules`); the new lint guard fails on a deliberately-malformed fixture.
2. Student dashboard and parent portal projections reflect nodes from **all**
   curriculum modules present in the student's placement data, proven by a test
   with multi-module placement rows.
3. `getStudentVisualizationHandler` performs no DB read whose result is unused.
4. Rational-analyzer generates problems with varying horizontal asymptotes;
   the HA part is graded against a student-enterable answer.
5. `exp-log-solver.ts` contains no `while (true)` re-roll; all exp/log/ln tests
   still pass.
6. `seededRandom`/`generateCoefficients`/`formatPolynomial` each have exactly
   one definition in `packages/math-content`.
7. The remediation script scans the real blueprint artifact and its reported
   count matches a manual inspection.
8. IM3 `lib/auth/server.ts` composes core-auth request-guards (no inline
   duplicate guards); IM3 + BM2 + core-auth auth tests pass.
9. `--db` and `--symbol` no longer exist in the working tree.
10. Every FR above is either implemented or explicitly converted to a
    documented tech-debt entry with rationale (no silent drops).

## Out of Scope

- Pre-existing `tsc --noEmit` baselines (BM2 29 errors; math-content standalone
  red) — tracked separately in tech-debt.
- The IM3 React-19 react-hooks violations (separate tech-debt item / track).
- Broadening generator *coverage* (more skills/modules getting generators) —
  this track fixes existing generators, it does not add new ones.
- The `gate_mid` / automation-supervisor remediation (separate tech-debt item).
