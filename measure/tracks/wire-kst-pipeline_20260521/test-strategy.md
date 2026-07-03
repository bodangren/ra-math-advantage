# Test Strategy — Track 1: Wire the KST Pipeline + v2 Mastery Model

Track: `wire-kst-pipeline_20260521`
Program: Knowledge Space Engine Alignment (kst-srs.v2) — Track 1 of N
Baseline SHA: `bf36f407a1f6776b4e14f8d085e8e5838e162e75`
Phase in scope of this strategy's depth: **Phase 1 — Canonical Contract & Schema** (contract-first).
Phases 2–5: shorter roadmap below.

Gate commands (owned by the orchestrator; repeated here for the Red/Green roles):

| Gate | Command |
|------|---------|
| `RED_TEST_COMMAND` | `CI=true npx vitest run packages/knowledge-space-core` |
| `GREEN_TEST_COMMAND` | `CI=true npx vitest run packages/knowledge-space-core` |
| `PROJECT_LINT` | `npm run ws:im3:lint` (Phase 5 also runs `node scripts/check-monorepo-boundaries.mjs`) |
| `PROJECT_CHECKS` | `npx tsc --noEmit` |
| `PROJECT_TESTS` | `CI=true npm run test` |

---

## 0. Cross-cutting decisions (bind all phases)

### 0.1 SPECIFICATION.md already exists — no drafting required

The kst-srs.v2 `SPECIFICATION.md` **already lives in-repo** at `kst-srs.v2/SPECIFICATION.md` (510 lines, drafted through §16). It is already test-anchored: `packages/knowledge-space-practice/src/__tests__/kst-srs-v2-planner-parity.test.ts` reads it via the relative path `../../../../kst-srs.v2/SPECIFICATION.md` and asserts §7 content. Therefore FR1's "bring SPECIFICATION.md into the repo" is **effectively already satisfied for the file-bring-in**; the remaining FR1 work is reconciliation of `measure/knowledge-space.md` and `measure/index.md`.

**Canonical-location recommendation.** The orchestrator prefers co-location at `packages/knowledge-space-core/SPECIFICATION.md`. Because the file is already wired into a green test at the root path, co-location is a **coupled change**: move the file *and* update the parity test's relative path in the same commit. To keep Phase 1 (contract-first, low-churn) focused, Phase 1 **keeps the canonical file at `kst-srs.v2/SPECIFICATION.md`** and only adds the cross-references. Co-location is deferred to Phase 5 (Docs/Audit) where a doc-reorg commit is natural and the parity-test path update can be batched. **If the Mid Red role discovers the parity test is flaky or the root path is undesirable, it may co-locate in Phase 1 instead — but only as a single coupled commit (move + path update + Green re-run).**

### 0.2 Naming collision: `KnowledgeState` is already taken

`packages/knowledge-space-core/src/level-projection.ts` already exports `KnowledgeState = { skills: { nodeId, mastery }[] }` — a **flat list** consumed by `projectDisplayLevel` (presentation-only, §16). The v2 spec §3.5 `getKnowledgeState` returns `Map<NodeId, KnowledgeStateEntry>` where `KnowledgeStateEntry` carries the four-way state, mastery, retention, and isProficient. These are **different shapes**. The strategy mandates:

- The v2 per-skill entry is named **`KnowledgeStateEntry`** (matches spec §3.5).
- The v2 return container is **not** aliased to `KnowledgeState`. Use `Map<NodeId, KnowledgeStateEntry>` directly, or introduce `KnowledgeStateMap`/`LearnerKnowledgeState`. Do **not** shadow the existing projection type.
- The existing `level-projection.ts` `KnowledgeState` stays unchanged; `projectDisplayLevel` keeps its consumer.

This is a **changed-contract risk** (A5-adjacent): a Green role that "helpfully" renames the projection type to match the v2 engine will break `projectDisplayLevel` callers. The Red suite includes a type-level guard (see §1.4).

### 0.3 Domain-neutral boundary rule

All new Phase 1 modules live under `packages/knowledge-space-core/src/`. They must not import from `apps/`, `convex/_generated/`, domain content, or `knowledge-space-practice` (core is the lowest level — `measure/knowledge-space.md` Implementation Rule 6). The boundary linter `scripts/check-monorepo-boundaries.mjs` (run in Phase 5, but available now) is the live-behavior proof; a Phase 1 Red test additionally asserts no `apps/`/`convex/` import strings sneak in.

### 0.4 Artifact vs live-behavior tests

Phase 1 is contract-first: most tests are **artifact/contract tests** — they assert that types are exported, Zod schemas parse known-valid input and reject known-invalid input, the thresholds module exports the named constants with the spec's default values, and the `getKnowledgeState`/`getOuterFringe`/bridge **signatures** compile. They do **not** assert algorithmic behavior (no hysteresis enter/exit, no fringe membership logic) — that is Phase 2/3. The live-behavior proof for Phase 1 is: `npx tsc --noEmit` (signatures type-check) + `CI=true npx vitest run packages/knowledge-space-core` (schema parse/reject + export-existence tests pass) + boundary linter clean. The reconciliation docs (`knowledge-space.md`, `index.md`) are **documentation artifact tests** — asserted by content-existence checks, not by runtime behavior.

---

## 1. Phase 1 — Canonical Contract & Schema (in depth)

### 1.1 Files to be created (Green role target)

All under `packages/knowledge-space-core/src/`:

| File | Contents | Notes |
|------|----------|-------|
| `mastery-state.ts` | `MasteryThresholds` interface; `MASTERY_THRESHOLDS_DEFAULT` const (`masteryEnter 0.90`, `masteryExit 0.70`, `readyThreshold 0.80`, `nearThreshold 0.50`); `MasteryState` union (`'mastered' \| 'decaying' \| 'inProgress' \| 'untouched'`); `KnowledgeStateEntry` interface (mastery, retention, isProficient, state, nodeId, evidence refs); `masteryThresholdsSchema`, `knowledgeStateEntrySchema` Zod schemas; exported TS types. | The thresholds module is the "named, configurable thresholds in one place" (FR2). |
| `knowledge-state-engine.ts` | **Signature only** for `getKnowledgeState(student, evidence, graph, now, thresholds?) : Map<NodeId, KnowledgeStateEntry>` — no body. Use a `// Phase 2 implements` marker. Export the function symbol so a type-export test resolves. | Must be `export function getKnowledgeState(...): ...` (typed, throws `new Error('Phase 2')` or returns empty). |
| `outer-fringe.ts` | **Signature only** for `getOuterFringe(state, graph, readinessFn?) : FringeEntry[]`. `FringeEntry` type (nodeId, readiness?, readinessState?). Standalone exported function (not inside the visualization projection). | Structured so Track 2 can swap `readinessFn` for weighted readiness (FR3). |
| `srs-bridge.ts` | **Interface only** for the SRS→KST bridge: `SrsBridgeInput` (card states + `ObjectiveProficiencyResult[]`), `LearnerStateOutput`, `SrsToKstBridge` interface with a single `buildLearnerState(input, now) : LearnerStateOutput` method. No implementation. | Domain-neutral; references `ObjectiveProficiencyResult` via a local re-declared structural type (do **not** import from `srs-engine` to keep core dependency-free; structural typing preserves compatibility). |

Updates to existing files:
- `packages/knowledge-space-core/src/index.ts` — re-export the new types, schemas, and function symbols.
- `measure/knowledge-space.md` — reconcile to an architecture summary that points at `kst-srs.v2/SPECIFICATION.md` (see §1.6).
- `measure/index.md` — add a "Knowledge Space Contract" reference row (see §1.7).

### 1.2 Red tests (Mid Red role authors these)

All new Red tests live in `packages/knowledge-space-core/src/__tests__/`. They are **intentionally red** until the Green role creates the modules above. The `RED_TEST_COMMAND` (`CI=true npx vitest run packages/knowledge-space-core`) will fail on the new files and pass on the existing suite — this is expected and is the falsifiability signal.

**`mastery-state-contract.test.ts`** — thresholds + four-way state + entry schema:
1. `MASTERY_THRESHOLDS_DEFAULT` is exported and equals `{ masteryEnter: 0.90, masteryExit: 0.70, readyThreshold: 0.80, nearThreshold: 0.50 }` (deep-equal, **labeled property checks**, not digit regex — defends A3).
2. `MasteryState` union exhausts exactly `mastered | decaying | inProgress | untouched` (assert each string is a member; assert no extras — defends A4 vacuous-pass).
3. `masteryThresholdsSchema.parse(MASTERY_THRESHOLDS_DEFAULT)` succeeds.
4. `masteryThresholdsSchema.parse({ masteryEnter: 1.2, ... })` **throws** (out-of-range rejection — positive falsification).
5. `masteryThresholdsSchema.parse({ masteryEnter: 0.9 })` **throws** (missing required fields — partial rejected).
6. `masteryThresholdsSchema.parse({ ...valid, extraKey: 1 })` **throws** if schema is `strictObject` (defends against silent extra-key drift).
7. `knowledgeStateEntrySchema` parses a valid entry (`{ nodeId, mastery: 0.85, retention: 0.95, isProficient: true, state: 'mastered' }`) and rejects: `mastery: 1.5`, `retention: -0.1`, `state: 'unknown'`, missing `nodeId`.
8. Threshold object is frozen / readonly (configurable but not mutably global — guards accidental threshold drift at runtime).

**`knowledge-state-engine-signature.test.ts`** — export + signature existence (artifact test):
1. `getKnowledgeState` is exported from `../index` and is a `function` (not undefined).
2. Calling with a minimal synthetic graph + empty evidence returns a `Map` (Phase 1 may return an empty Map or throw `Phase 2`; the test asserts the **type/return-shape contract**, not behavior — see §1.4 for the throw-vs-empty decision).
3. The function accepts a `now: number` parameter and an optional `thresholds?: Partial<MasteryThresholds>` (compile-time guard via `Parameters<...>`).
4. Return type is `Map<string, KnowledgeStateEntry>` (compile-time guard via `ReturnType<...>`).

**`outer-fringe-signature.test.ts`** — export + standalone-ness:
1. `getOuterFringe` is exported from `../index` and is a `function`.
2. It is **not** a property on any visualization-projection object (defends FR3 "not buried in the visualization projection" — assert it is a top-level export, not nested under a projection namespace).
3. Accepts `state: Map<NodeId, KnowledgeStateEntry>`, `graph: KnowledgeGraph`, optional `readinessFn?`.
4. Return type is `FringeEntry[]` (compile-time guard).
5. `readinessFn` is optional (binary gating is the Phase 1 default; weighted readiness is Track 2 — assert the seam exists).

**`srs-bridge-contract.test.ts`** — interface existence:
1. `SrsToKstBridge` is exported as an interface (type-only; the test asserts a value typed `SrsToKstBridge` compiles when given a stub object with `buildLearnerState`).
2. `SrsBridgeInput` includes `cards` and `proficiencyResults` fields.
3. `LearnerStateOutput` is structurally compatible with the input `getKnowledgeState` expects (evidence-shaped) — this is the cross-module contract seam.
4. No implementation exists yet (assert the module exports the interface and types but **not** a concrete `buildLearnerState` function — defends against the Green role accidentally shipping a Phase 3 impl in Phase 1).

**`boundary-phase1.test.ts`** — domain-neutrality guard:
1. Grep the new modules' source for `apps/` and `convex/_generated/` import literals — must be zero (live-behavior proof of the boundary rule; complements the Phase 5 boundary linter).
2. Assert `knowledge-space-core` does not import from `knowledge-space-practice` (core-is-lowest rule).

### 1.3 Fixtures, mocks, and live-behavior proof (Phase 1)

- **Fixtures**: reuse `packages/knowledge-space-core/src/fixtures.ts` (`syntheticMathFixture`) for the minimal graph in the signature tests. Do **not** introduce app/domain fixtures (boundary rule). For schema tests, inline literal objects (a known-valid entry, a known-invalid entry) are preferred over fixture files — they make the falsification condition explicit.
- **Mocks**: none required. Phase 1 is pure types/schemas — no I/O, no Convex, no `Date.now()`. The `now` parameter is a plain number passed by the test.
- **Live-behavior proof** (the thing that proves the contract actually compiles and runs, not just "exists"):
  - `npx tsc --noEmit` passes (signatures type-check across the new modules and the existing `index.ts` re-exports).
  - `CI=true npx vitest run packages/knowledge-space-core` passes (schema parse + reject + export-existence).
  - `node scripts/check-monorepo-boundaries.mjs` is clean (can be run now even though it's a Phase 5 gate — early signal).
- **Documentation artifact proof**: `measure/knowledge-space.md` contains a pointer line to `kst-srs.v2/SPECIFICATION.md`; `measure/index.md` contains a "Knowledge Space Contract" row. Asserted by a content-existence test (see §1.5), not by runtime behavior.

### 1.4 Changed-contract risks (Phase 1)

1. **`KnowledgeState` shadowing** (§0.2). Defense: a compile-time test asserting `KnowledgeStateEntry` is **not** assignable to the projection `KnowledgeState` (different shape), and that `projectDisplayLevel` still accepts the flat list. If the Green role renames the projection type, `tsc --noEmit` fails on `projectDisplayLevel` callers — the falsification condition.
2. **`getKnowledgeState` Phase 1 return shape**. Decision: Phase 1 returns an **empty `Map`** (or throws `new Error('Phase 2: not implemented')`). The signature test asserts the return is a `Map` instance when called with empty evidence; it does **not** assert hysteresis (that's Phase 2). Returning `Map` (not throwing) is preferred so the contract test is a true positive ("the function runs and returns the typed shape") rather than a try/catch that could mask a missing export.
3. **`ObjectiveProficiencyResult` source**. `srs-bridge.ts` must not import from `packages/srs-engine` (core stays dependency-free). It re-declares a structural type matching the SRS proficiency result. Risk: drift if `srs-engine` changes its proficiency shape. Defense: a structural-compatibility comment in `srs-bridge.ts` + a Phase 3 test that round-trips a real `srs-engine` proficiency result through the bridge. Phase 1 only asserts the local structural type exists.
4. **SPECIFICATION.md location** (§0.1). If co-located in Phase 1, the parity test's relative path breaks. Defense: the coupled-commit rule (move + path update together) and a Red test that asserts the parity test file still resolves the spec path.

### 1.5 Documentation artifact tests (Phase 1)

**`measure/reconciliation.test.ts`** (or extend an existing `measure/*` test if convention prefers) — content-existence, not runtime:
1. `measure/knowledge-space.md` contains a line pointing at `kst-srs.v2/SPECIFICATION.md` (or `packages/knowledge-space-core/SPECIFICATION.md` if co-located) as the canonical contract.
2. `measure/index.md` table contains a row whose Name is `Knowledge Space Contract` and whose Path points at the SPECIFICATION.md location.
3. `measure/knowledge-space.md` no longer claims to be the "source of truth" for KST theory details (it becomes an architecture summary) — assert the phrase "source of truth" is removed or re-scoped. *(Defends A5/A6: the doc must not overstate its role once the canonical spec exists.)*

These are **artifact tests**: they assert Markdown content, not function behavior. They are live in the sense that `vitest` runs them (via `fs.readFileSync`), but they prove documentation correctness, not algorithm correctness.

### 1.6 Reconciling `measure/knowledge-space.md`

Current state: 118 lines claiming to be "the project-wide source of truth for the Knowledge Space plan" with embedded theory (vocabulary, package boundaries, implementation rules). Reconciliation:
- **Keep**: package-boundary section, generalization rule, visualization-projection rules, concept-aggregator rule, vocabulary (these are repo-architecture, not contract theory).
- **Remove/defer-to-spec**: any mastery-model, readiness-formula, hysteresis, or fringe-definition prose — replace with a one-line pointer: "Canonical KST+SRS contract: `kst-srs.v2/SPECIFICATION.md` (§3 mastery, §4 fringe, §5 readiness, §7 planner). This document is the repo-architecture summary."
- **Update** the "Current Measure Tracks" footer to reflect that Track 1 (`wire-kst-pipeline_20260521`) is now active and that the v2 contract is canonical.

### 1.7 Updating `measure/index.md`

Add a row to the reference table:
```
| **Knowledge Space Contract** | `../kst-srs.v2/SPECIFICATION.md` |
```
(Or `../packages/knowledge-space-core/SPECIFICATION.md` if co-located.) The existing `**Knowledge Space Architecture** | ./knowledge-space.md` row stays — it now points at the architecture summary, not the contract.

### 1.8 Phase 1 Green gate

- `GREEN_TEST_COMMAND` (`CI=true npx vitest run packages/knowledge-space-core`) exits 0 — all Red tests in §1.2 now pass.
- `npx tsc --noEmit` exits 0 — new signatures type-check and the `KnowledgeState`/`KnowledgeStateEntry` distinction holds.
- `node scripts/check-monorepo-boundaries.mjs` is clean (early signal; formally a Phase 5 gate).
- `npm run ws:im3:lint` clean on the new files.

### 1.9 Phase 1 closeout gate

- All Phase 1 tasks in `plan.md` flipped `[ ] → [x]` **except** the UMV task (Task 5), which carries `[b] deferred:user` (see §1.10).
- `measure/tracks/wire-kst-pipeline_20260521/plan.md` Phase 1 section has ≥1 `[x]` and the deferred UMV is the only non-`[x]` (defends A4 — closeout does not PASS on an all-`[~]` phase).
- The reconciliation artifact test (§1.5) passes.
- No `tests/*.sh` guard regression: `tests/measure_orchestrator_audit.sh` still exits 0 (A1/A8/A11/A12 stay green).

### 1.10 Deferred marker classification — Task 5 UMV

Phase 1's Task 5 ("Measure - User Manual Verification 'Phase 1'") is classified **`[b] deferred:user`**. Per anti-pattern A1, the supervisor's `is_task_structurally_blocked` helper recognizes `[b]` (blocked / human-gated) and the trailing `deferred:user` owner field, and **excludes** this task from the incomplete-count. This is the correct handling: the UMV is a human-gated verification that cannot be auto-completed by the Green role. The strategy mandates:
- The marker is written **exactly** `[b] deferred:user` in `plan.md` (not free-text "deferred" — defends A1).
- The closeout gate (§1.9) treats `[b] deferred:user` as the sole legitimate non-`[x]` and does **not** inflate the phase to "Green with zero `[x]`" (defends A4).

### 1.11 Anti-pattern coverage — Phase 1

| A-class | Defense in Phase 1 |
|---------|--------------------|
| **A1** (substring-as-structured-signal) | The UMV `[b] deferred:user` marker is structured, not free-text "deferred". The supervisor's structured-signal helper (already fixed) recognizes it. Falsification: if a future agent writes `[~] deferred` free-text, the closeout gate's "all-`[x]` except `[b] deferred:user`" check fails. |
| **A3** (digit-only as labeled count) | Threshold-value assertions use **labeled property deep-equal** (`expect(MASTERY_THRESHOLDS_DEFAULT).toEqual({ masteryEnter: 0.90, ... })`), not `rg '[0-9]+'`. Falsification: a wrong default value (e.g. `0.9` vs `0.90`) fails the deep-equal. |
| **A4** (vacuous-pass on nothing-done) | Every Red test has a **positive and negative** assertion (schema parses valid AND rejects invalid; export exists AND is a function). No "module loaded → pass" vacuous checks. The `MasteryState` union test asserts exact membership. Falsification: an empty module exports nothing → the export-existence test fails. |
| **A5** (false-claim text vs test reality) | The plan must not claim "schemas pass" / "all green" unless `GREEN_TEST_COMMAND` actually exits 0. The UMV is `[b] deferred:user`, so no false "Phase 1 verified" claim is made. Falsification: a plan note claiming "all checks pass" while the Red suite is red → closeout gate blocks. |
| **A6** (registry-note overstatement) | `measure/index.md` and `measure/knowledge-space.md` reconciliation must not claim the v2 pipeline is "wired" or "resolved" — only that the **contract** is canonical. Falsification: the reconciliation artifact test (§1.5) fails if "source of truth" mastery claims remain in `knowledge-space.md`. |
| **A11** (missing live contract-test suite) | Already satisfied: `tests/measure_orchestrator_audit.sh` exists and is green. Phase 1 does **not** need to add a new `tests/*.sh` guard. **Optional/non-blocking**: a `tests/kst-v2-contract-guard.sh` asserting the SPECIFICATION.md exists and the four core exports resolve could be added in Phase 5 — not required for Phase 1 closeout. |
| **A12** (supervisor peer-review rule) | Out of scope for Phase 1; no `automation-supervisor.py` edits. The existing AGENTS.md rule holds. |

---

## 2. Phase 2 — Knowledge State & Mastery Engine (roadmap)

**Red command**: `CI=true npx vitest run packages/knowledge-space-core` (filter on the new `knowledge-state-engine` and `outer-fringe` test files).
**Green gate**: hysteresis enter (`isProficient && retention ≥ 0.90` → `mastered`), exit (`< 0.70` → `decaying`), re-enter on recovery, decay over time, and fringe membership (all prereqs satisfied, not mastered) all pass with concrete retention values. `getOuterFringe` standalone (not nested in projection). Visualization `computeNodeState` refactored to consume the engine (no duplicated threshold literals — defends A4 against a parallel-threshold drift).
**Closeout gate**: ≥1 `[x]`, UMV `[b] deferred:user`; `tsc --noEmit` clean; engine is pure (no `Date.now()` — `now` injected).
**Anti-patterns**: A4 (concrete state-transition assertions, not "ran"); A5 (plan claims match test outcomes); A3 (if asserting threshold counts, labeled).

---

## 3. Phase 3 — SRS→KST Bridge (roadmap)

**Red command**: `CI=true npx vitest run packages/knowledge-space-core` (bridge test files) + a path test exercising bridge → `getKnowledgeState` → `getOuterFringe`.
**Green gate**: synthetic fixtures drive mastered/decaying/inProgress/untouched transitions; `stabilityToRetention` feeds retention; the structural `ObjectiveProficiencyResult` re-declared in core round-trips a real `srs-engine` proficiency result (defends the §1.4 drift risk).
**Closeout gate**: full bridge→state→fringe path green on synthetic fixtures; UMV `[b] deferred:user`.
**Anti-patterns**: A4 (concrete learner-state outputs per fixture); A5 (claims match); A9 (if any test references a `measure/tracks/` path that may archive, use the resolve helper — unlikely here but noted).

---

## 4. Phase 4 — Production Wiring (apps/integrated-math-3) (roadmap)

**Red command**: route/component test under `apps/integrated-math-3/` (vitest) + a Convex query test; if a new package is introduced, add `vitest.config.ts` `resolve.alias` (lessons-learned 2026-05-03).
**Green gate**: one IM3 production route renders KST-derived student state (mastered/ready/review-due) from live data via the Convex query composing bridge + `getKnowledgeState` + projection; batched `Promise.all` reads (no N+1); IM3 graph loadable at runtime from rollout artifacts; closed-system validation caveat documented (lessons-learned 2026-05-10).
**Closeout gate**: route renders real state; UMV `[b] deferred:user`; `PROJECT_TESTS` green.
**Anti-patterns**: A5 ("route renders KST state" backed by a live test, not just a claim); A2 (N/A — no publish/consent gate here, noted as not-applicable); A6 (registry note must not claim "pipeline live" until the route test is green).

---

## 5. Phase 5 — Docs, Audit & Doctor (roadmap)

**Red command**: `node scripts/check-monorepo-boundaries.mjs` + `npx tsc --noEmit` + `CI=true npm run test` + the projection-audit doc test.
**Green gate**: `knowledge-space-practice-projection-audit.md` updated from placeholder to wired Math (IM3) status; boundary lints, `tsc`, and full test suite green; `measure/generate.sh`/`doctor.sh` do not exist (plan.md line 57) — use the real boundary linter, do not fabricate a doctor script (defends A10 drift and A5 false-claim).
**Closeout gate**: all gates green; audit doc claims match test reality (A5/A6); `tests/measure_orchestrator_audit.sh` still green (A11/A12); optional co-location of `SPECIFICATION.md` (§0.1) batched here if not done in Phase 1, with the parity-test path updated in the same commit.
**Anti-patterns**: A5/A6 (audit doc + registry truthful); A10 (generated-facts: no fake doctor/generate scripts — only real linters); A11 (guard suite present); A9 (any track-path test uses resolve helper).

---

## 6. Intentionally-red aggregate-suite handling

The Mid Red role adds new test files under `packages/knowledge-space-core/src/__tests__/`. Until the Green role creates the modules in §1.1, `RED_TEST_COMMAND` fails **only on the new files** (import errors / missing exports); the existing suite (`contract.test.ts`, `placement-engine.test.ts`, etc.) stays green. This is the intended falsifiability signal — the Red is **scoped**, not a blanket failure. The orchestrator must NOT mark Phase 1 Green until `GREEN_TEST_COMMAND` exits 0 on the full package (new + existing). If the aggregate `PROJECT_TESTS` (`CI=true npm run test`) is run mid-Red, it will show the new-file failures plus the existing green — this is expected and is **not** a regression; the closeout gate distinguishes "intentionally-red new contract tests" from "regression in existing tests" by requiring the existing subset to remain green at the baseline SHA.

---

## 7. Falsifiability summary (every test has a falsification condition)

- Schema tests: a wrong default value, a missing field, or an accepted extra-key falsifies (A3/A4).
- Export tests: an unexported symbol or a non-function export falsifies (A4).
- Signature tests: a return-type mismatch or a missing optional param falsifies (compile-time, A4).
- Boundary tests: an `apps/`/`convex/` import literal in core falsifies (live-behavior, boundary rule).
- Naming-collision guard: `KnowledgeStateEntry` assignable to projection `KnowledgeState` falsifies (changed-contract risk).
- Doc artifact tests: a missing pointer line or a lingering "source of truth" claim falsifies (A5/A6).
- Deferred-marker: free-text "deferred" instead of `[b] deferred:user` falsifies the closeout gate (A1/A4).

---

## MEASURE_AGENT_RESULT

role: measure-strategy
track: wire-kst-pipeline_20260521
phase: 1 — Canonical Contract & Schema
status: strategy-written
strategy_file: measure/tracks/wire-kst-pipeline_20260521/test-strategy.md
red_command: CI=true npx vitest run packages/knowledge-space-core
green_command: CI=true npx vitest run packages/knowledge-space-core
phase1_green_gates:
  - vitest run packages/knowledge-space-core exits 0
  - npx tsc --noEmit exits 0 (signatures type-check; KnowledgeState/KnowledgeStateEntry distinction holds)
  - node scripts/check-monorepo-boundaries.mjs clean (early signal)
  - npm run ws:im3:lint clean on new files
phase1_closeout_gates:
  - plan.md Phase 1 tasks [x] except UMV [b] deferred:user
  - reconciliation artifact test passes (knowledge-space.md + index.md updated)
  - tests/measure_orchestrator_audit.sh still green (A1/A8/A11/A12)
key_risks_flagged:
  - SPECIFICATION.md already exists at kst-srs.v2/SPECIFICATION.md; co-location to packages/knowledge-space-core/ is a coupled change (move + parity-test path update) — deferred to Phase 5 unless Mid Red opts to do it in Phase 1 as one coupled commit
  - KnowledgeState naming collision (level-projection flat list vs v2 Map<NodeId, KnowledgeStateEntry>) — must not shadow; v2 entry named KnowledgeStateEntry, container not aliased to KnowledgeState
  - srs-bridge.ts must not import from packages/srs-engine (core dependency-free); structural type re-declaration with Phase 3 round-trip test
deferred_marker:
  - task: "Measure - User Manual Verification 'Phase 1'"
  - classification: "[b] deferred:user"
  - supervisor_handling: is_task_structurally_blocked recognizes [b] + deferred:user; excluded from incomplete count (A1-compliant)
anti_pattern_coverage:
  phase1: [A1, A3, A4, A5, A6, A11-optional, A12-out-of-scope]
  phase2: [A3, A4, A5]
  phase3: [A4, A5, A9-if-track-paths]
  phase4: [A5, A6, A2-N/A]
  phase5: [A5, A6, A9, A10, A11]
next_role: measure-mid-red
