# Implementation Plan: KST Spec v3.2 Runtime Migration

Track: `kst-v32-runtime_20261114`
Specification: [spec.md](./spec.md)
Workflow: `measure/workflow.md` (Standard Task Workflow, and the Phase Completion
Verification and Checkpointing Protocol)

## Rules for All Phases

### Start Gate

Do not start S1 until each member of the track set `unified-math-app_20261114` is closed in
`measure/tracks.md`.

### Source Rule

Read the v3.2 sections from the local clone `/home/daniebo/Desktop/mastery-advantage` at the
pinned commit (`git -C /home/daniebo/Desktop/mastery-advantage show <sha>:SPECIFICATION.md`).
Do not write in that clone. Each task names the sections that it implements.

### Gate Commands

| Gate | Command |
|------|---------|
| Format | `npm run format:check` |
| Lint | `npm run lint --workspace=<ws>` for `apps/math`, `apps/bus-math-v2`, and each package that the phase changes |
| Typecheck | `npm run typecheck --workspace=<ws>` for the same workspaces |
| Test | `CI=true npm run test --workspace=<ws>` for the same workspaces |
| Governance | `npx vitest run __tests__/governance` |
| Build | `npm run build --workspace=apps/math` and `npm run build --workspace=apps/bus-math-v2` |
| E2E | `npm run test:e2e --workspace=apps/math` |
| Scripts suite | `npx vitest run --config scripts/vitest.config.ts` |
| Boundary | `node scripts/check-monorepo-boundaries.mjs` |
| CI check | `node scripts/validate-ci.mjs` |

If `vinext-oxc-toolchain_20261114` renamed a gate script, use the new name and record it.
A gate passes when it has no failure that the baseline did not have. "Run each gate" in a
Verify task means each row of this table.

### Test Rules

- Each worked example of a story is a test with the numbers of `SPECIFICATION.md`.
  Compare decimals with a tolerance of 0.001. One exception: the S2 weighted-rate case
  uses the tolerance 0.005, because §13.1 gives two decimals.
- A v2 case of an existing test that contradicts v3.2 changes to the v3.2 value in the same
  Red task. Record each changed case under "Changed v2 Cases".
- Package tests stay in the package. App tests use the mock context helpers in
  `apps/math/__tests__/convex/_helpers/`.
- Tests resolve paths from the test file, never from `process.cwd()`.

### Commits

- Make one commit for each task, with a git note (`measure/workflow.md` steps 9 to 12).
- Do not push. Only the closeout step pushes (spec "Non-Functional Requirements").

## Phase S1: Spec pointer, retention, and readiness
_Story ref: spec.md#story-s1_

- [ ] Task: S1 Contract — record the baseline and the v3.2 inventory
    - [ ] Create `evidence.md` in this track folder with these sections: Baseline, Source, Inventory, Spec Tests, Changed v2 Cases, Hard Edges, Guess Floors, Queue, Planner Graph, Placement Gaps, Calibration.
    - [ ] Run each gate on the start commit. Record each result and each test count under "Baseline".
    - [ ] Run `git -C /home/daniebo/Desktop/mastery-advantage rev-parse HEAD`. Record the SHA under "Source" as the pinned commit (spec K1).
    - [ ] Under "Inventory", record each MIGRATION item (1 to 16) with its v3.2 sections, its files in this repository, and its phase of this plan.
    - [ ] Run `git grep -l -E "kst-srs\.v2|SPECIFICATION\.md" -- '*.test.ts' '*.test.tsx'`. Under "Spec Tests", record each file that reads the spec file or expects a link to it, with each block and its change (spec K1). Expect the eight files of the spec.
    - [ ] Count the `prerequisite_for` edges with weight 1.0 in the graph files of `GRAPH_SOURCES`. Record the count of each file under "Hard Edges" (spec K4).
    - [ ] Write the contract of `stabilityToRetention(stability, elapsedDays)` in both packages, and of `stabilityIndex(stability)` in `efficacy-core` (spec K2, K2a). Record the import `forgettingCurve` from `ts-fsrs/models/fsrs-6` and its argument order (parameters, elapsed days, stability).
    - [ ] Commit: `measure(kst-v32-runtime): record the S1 contract`.
- [ ] Task: S1 Test (Red) — specify retention and readiness
    - [ ] `packages/srs-engine/src/__tests__/retention.test.ts`: `stabilityToRetention(10, 0)` is 1.0 and `stabilityToRetention(10, 10)` is 0.9. The value drops when `elapsedDays` grows.
    - [ ] `packages/knowledge-space-core/src/__tests__/retention.test.ts`: the same cases for the package function with `FSRS_DECAY`.
    - [ ] `apps/math/__tests__/lib/srs/retention-parity.test.ts`: for stability 1, 5, 10, 30, and 90 and elapsed days 0, 1, 7, 30, and 90, the two functions agree.
    - [ ] `packages/efficacy-core/__tests__/metrics/stability-index.test.ts`: `stabilityIndex(30)` is 0.5. The metrics give the same values as on the start commit.
    - [ ] `packages/knowledge-space-core/src/__tests__/srs-bridge-implementation.test.ts`: an objective with variant retentions 0.95 and 0.60 (both `reps ≥ 1`) and a third card with `reps = 0` has the retention 0.60 (spec K3).
    - [ ] `packages/knowledge-space-core/src/__tests__/weighted-readiness.test.ts`: one unmastered prerequisite of weight 1.0 gives `blocked`. A graph with no edge of weight 1.0 gives the v2 score (spec K4, §2.5 worked example).
    - [ ] `packages/knowledge-space-core/src/__tests__/progress-trend.test.ts`: Δ = −2 gives `stable`, Δ = −3 gives `declining`, and Δ = +3 gives `improving`.
    - [ ] Run the package suites and the app suite. Confirm that the new cases fail.
    - [ ] Commit: `test(kst): specify the v3.2 retention and readiness`.
- [ ] Task: S1 Implement — retention, readiness, and trend
    - [ ] Change `stabilityToRetention` in `srs-engine`: `import { forgettingCurve } from 'ts-fsrs/models/fsrs-6'`, and return `forgettingCurve(parameters.w, elapsedDays, stability)`. Build `parameters` one time at module level with `generatorParameters(...)` and the values of `DEFAULT_SCHEDULER_CONFIG`, as `scheduler.ts` does (spec K2).
    - [ ] Change `stabilityToRetention` in `knowledge-space-core` to the power curve with `FSRS_DECAY = 0.1542` (spec K2). Remove the `scale` argument.
    - [ ] Change each caller to pass the elapsed days since `lastReview`.
    - [ ] Move the v2 formula to `packages/efficacy-core/src/metrics/stability-index.ts`. Change the three calls of `efficacy-core` to `stabilityIndex` (spec K2a).
    - [ ] Change `aggregateCardsToEvidence` and `srs-bridge.ts` to the objective minimum of spec K3.
    - [ ] Add `hardGateThreshold` and `trendThreshold` to `MasteryThresholds` and its schema. Change `computeWeightedReadiness` and `progress-trend.ts` (§2.5, §9.4).
    - [ ] Commit: `feat(kst): adopt the v3.2 retention and gated readiness`.
- [ ] Task: S1 Implement — the spec pointer
    - [ ] Write `kst-srs/README.md` as spec K1 gives. Run `git rm -r kst-srs.v2`.
    - [ ] Change each test file of the list "Spec Tests" as spec K1 gives.
    - [ ] Change the links in `measure/index.md` (line 20) and `measure/knowledge-space.md` (lines 5 and 129) to `kst-srs/README.md`.
    - [ ] Add the row of spec K2a to `measure/tech-debt.md`.
    - [ ] Commit: `docs(kst): point to the kst-srs.v3.2 source`.
- [ ] Task: S1 Verify — run the gates
    - [ ] Run each gate. Confirm that each gate passes.
    - [ ] Run `git grep -n "kst-srs.v2/" -- . ':!measure/archive' ':!measure/tracks'`. Confirm no match.
    - [ ] Commit: `measure(kst-v32-runtime): record the S1 results`.
- [ ] Task: S1 Docs & Doctor
    - [ ] Run `npm run generate`. Confirm exit code 0.
    - [ ] Run `npm run doctor`. Confirm exit code 0.
- [ ] Task: Measure - User Manual Verification 'Phase S1: Spec pointer, retention, and readiness' (Protocol in workflow.md)
    - [ ] Run the protocol: the automated tests, the manual verification plan, and the user confirmation.
    - [ ] Make the checkpoint commit: `measure(checkpoint): Checkpoint end of Phase S1`.
    - [ ] Append `[checkpoint: <sha>]` to the Phase S1 heading.
    - [ ] Commit: `measure(plan): Mark phase 'Phase S1: Spec pointer, retention, and readiness' as complete`.

## Phase S2: Corrected evidence, rating, and scheduler stamps
_Story ref: spec.md#story-s2_

- [ ] Task: S2 Contract — define the evidence inputs
    - [ ] Record each practice variant source of `apps/math` with its answer format. Give each format its guess floor (spec K5). Record the table under "Guess Floors".
    - [ ] Write the contract of `computeCorrectedCorrectness(passes, guessFloor)` in `objective-proficiency.ts` (§13.1, spec K5): the input is the passes of the variant cards, newest first (a pass is each rating except `Again`), and the guess floor. The return value is `{ weightedRate, effectiveSampleSize, wilsonLower, retentionStrength }`.
    - [ ] Write the contract of the guess floor declaration on the adapter interface of `packages/knowledge-space-core/src/adapters.ts`, and of the math adapter in `apps/math/lib/srs/guess-floors.ts`.
    - [ ] Record the stages of §8.4 and the current behavior of `srs-rating.ts` for each stage. Record the first bullet of MIGRATION item 6 (the §8.4 reference to §13.3) with the comment of stage 5 as its place.
    - [ ] Record `FSRS_PARAMS_VERSION` and the schema change: `srs_review_log.paramsVersion` (optional string) (spec K7).
    - [ ] Commit: `measure(kst-v32-runtime): record the S2 contract`.
- [ ] Task: S2 Test (Red) — specify evidence, rating, and stamps
    - [ ] `packages/srs-engine/src/__tests__/corrected-correctness.test.ts`: `computeCorrectedCorrectness` returns `retentionStrength` 0 for 3/10 on g = 0.25, 0.388 for 8/10 on g = 0.25, and 0.541 for 8/10 on g = 0.
    - [ ] Also: for the 12-attempt case of §13.1 (the newest 6 pass, the oldest 6 fail), `computeCorrectedCorrectness(passes, 0).weightedRate` is 0.60 (±0.005, because §13.1 gives two decimals). The raw rate is 0.50.
    - [ ] Also: `computeObjectiveProficiency` gives an evidence confidence that is not `high` for 5/5 correct, and at most `low` for 2 attempts.
    - [ ] `packages/srs-engine/src/__tests__/objective-proficiency.test.ts`: the thresholds of §13.2 apply to the corrected retention.
    - [ ] `packages/practice-core/src/__tests__/srs-rating.test.ts`: 0 hints allow `Easy`. 1 to 2 hints cap at `Good`. 3 hints cap at `Hard`.
    - [ ] Also: one revealed step caps at `Hard`. All steps revealed give `Again`. The timing stage needs confidence `medium` or higher and 10 baseline samples.
    - [ ] `packages/srs-engine/src/__tests__/scheduler.test.ts`: with `requestRetentionByPriority`, an `essential` card uses 0.95. With no value, each card uses `requestRetention`.
    - [ ] `apps/math/__tests__/convex/srs/review-log.test.ts`: each new review log entry holds `paramsVersion`.
    - [ ] Run the package suites and the app suite. Confirm that the new cases fail.
    - [ ] Commit: `test(kst): specify the v3.2 evidence and rating`.
- [ ] Task: S2 Implement — evidence, rating, and stamps
    - [ ] Implement `computeCorrectedCorrectness` in `packages/srs-engine/src/srs/objective-proficiency.ts`. Change `computeObjectiveProficiency` to use it (§13.1, §13.2).
    - [ ] Add the guess floor declaration to the adapter interface. Write `apps/math/lib/srs/guess-floors.ts`. Change the app callers to pass the ratings and the floors.
    - [ ] Change `srs-rating.ts` to §8.4. Make the comment of the misconception cap (stage 5) cite §13.3 (MIGRATION item 6, first bullet; no behavior change).
    - [ ] Add `requestRetentionByPriority` and `FSRS_PARAMS_VERSION` to `scheduler.ts`. Add `srs_review_log.paramsVersion` to `apps/math/convex/schema.ts`, and write it on each new entry.
    - [ ] Commit: `feat(kst): adopt the v3.2 evidence and rating`.
- [ ] Task: S2 Verify — run the gates
    - [ ] Run each gate. Confirm that each gate passes.
    - [ ] Run `git grep -n "13\.3" -- packages/practice-core/src/practice/srs-rating.ts`. Confirm a match in the comment of stage 5.
    - [ ] Commit: `measure(kst-v32-runtime): record the S2 results`.
- [ ] Task: S2 Docs & Doctor
    - [ ] Run `npm run generate`. Confirm exit code 0.
    - [ ] Run `npm run doctor`. Confirm exit code 0.
- [ ] Task: Measure - User Manual Verification 'Phase S2: Corrected evidence, rating, and scheduler stamps' (Protocol in workflow.md)
    - [ ] Run the protocol: the automated tests, the manual verification plan, and the user confirmation.
    - [ ] Make the checkpoint commit: `measure(checkpoint): Checkpoint end of Phase S2`.
    - [ ] Append `[checkpoint: <sha>]` to the Phase S2 heading.
    - [ ] Commit: `measure(plan): Mark phase 'Phase S2: Corrected evidence, rating, and scheduler stamps' as complete`.

## Phase S3: Daily queue and session composition
_Story ref: spec.md#story-s3_

- [ ] Task: S3 Contract — define the queue and the session
    - [ ] Record the rules 1 to 6 of §12.7 and the current behavior of `buildDailyQueue` for each rule. Record the place where remediation items enter the queue today (rule 2).
    - [ ] Write the contracts of `composeSession(items)` in `packages/srs-engine/src/srs/session.ts` and `applyIntervalFuzz(input)` in `packages/srs-engine/src/srs/interval-fuzz.ts` (spec K8).
    - [ ] `applyIntervalFuzz` takes `cardId`, `reps`, the scheduler interval, the due count of each day of the fuzz window, and `maximumInterval`. It returns the due date.
    - [ ] Record the review path of `apps/math` that calls the scheduler, and the query that gives the due counts of the student for the fuzz window. Record them under "Queue".
    - [ ] Record the daily queue page of `apps/math` and the place of the "Review day" message.
    - [ ] Commit: `measure(kst-v32-runtime): record the S3 contract`.
- [ ] Task: S3 Test (Red) — specify the queue and the session
    - [ ] `packages/srs-engine/src/__tests__/queue.test.ts`: the backlog example of §12.7 gives 20 reviews with the lowest retention and 0 new. The normal-day example gives 12 reviews, then 4 new. `triaged` objectives give no card.
    - [ ] `packages/srs-engine/src/__tests__/session.test.ts`: 3×A, 2×B, 1×C give A, B, C, A, B, A. New cards follow the reviews.
    - [ ] `packages/srs-engine/src/__tests__/interval-fuzz.test.ts`: the same `cardId` and `reps` give the same date. The interval stays within ±5%. The date is the day of the lowest due count in the window. The interval never exceeds `maximumInterval`.
    - [ ] `apps/math/__tests__/components/student/daily-queue.test.tsx`: backlog mode shows "Review day".
    - [ ] Run the package suites and the app suite. Confirm that the new cases fail.
    - [ ] Commit: `test(kst): specify the v3.2 queue and session`.
- [ ] Task: S3 Implement — the queue and the session
    - [ ] Rewrite `buildDailyQueue` to §12.7 rules 1 to 6. Add `composeSession` and `applyIntervalFuzz`.
    - [ ] Set `enable_fuzz: false` in the scheduler. Change the review path of `apps/math` to call `applyIntervalFuzz` with the due counts.
    - [ ] Change `apps/math/convex/queue/queue.ts` to call `composeSession`. Add the "Review day" message to the daily queue page.
    - [ ] Add the row of spec K8 (the BM2 queue) to `measure/tech-debt.md`.
    - [ ] Commit: `feat(kst): adopt the v3.2 queue and session composition`.
- [ ] Task: S3 Verify — run the gates
    - [ ] Run each gate. Confirm that each gate passes.
    - [ ] Commit: `measure(kst-v32-runtime): record the S3 results`.
- [ ] Task: S3 Docs & Doctor
    - [ ] Run `npm run generate`. Confirm exit code 0.
    - [ ] Run `npm run doctor`. Confirm exit code 0.
- [ ] Task: Measure - User Manual Verification 'Phase S3: Daily queue and session composition' (Protocol in workflow.md)
    - [ ] Run the protocol: the automated tests, the manual verification plan, and the user confirmation.
    - [ ] Make the checkpoint commit: `measure(checkpoint): Checkpoint end of Phase S3`.
    - [ ] Append `[checkpoint: <sha>]` to the Phase S3 heading.
    - [ ] Commit: `measure(plan): Mark phase 'Phase S3: Daily queue and session composition' as complete`.

## Phase S4: Planner and review-load budget
_Story ref: spec.md#story-s4_

- [ ] Task: S4 Contract — define the planner
    - [ ] Write the contract of the five terms of §10.1 and of `DEFAULT_PRIORITY_WEIGHTS` in `planner/types.ts` (spec K9).
    - [ ] Write the contract of `analyzePlannerGraph(graph)` in `planner/graph-analysis.ts`: it returns `maxReach`, the reach of each skill, and the sparse flag (§10.4).
    - [ ] Write the contracts of the diversity cap (§10.2) and of the review-load budget (§10.5) with `loadBudgetFactor = 0.8`.
    - [ ] Record the optional field `utilityProvider` on the adapter interface (§10.3).
    - [ ] Run `git grep -l -E "projectStudentVisualization|projectTeacherVisualization" -- apps/math`. Record each page and component that shows the projections, and the place of `reviewLoadState` (student) or `reviewLoadStates` (teacher) in each.
    - [ ] Commit: `measure(kst-v32-runtime): record the S4 contract`.
- [ ] Task: S4 Test (Red) — specify the planner
    - [ ] `packages/knowledge-space-practice/src/__tests__/priority.test.ts`: the §10.1 worked example gives P = 0.452 and Q = 0.396. With no utility provider, `utility` is 0.
    - [ ] `packages/knowledge-space-practice/src/__tests__/recommended-next.test.ts`: six top skills of one unit give at most 2 of that unit in the top 5. Ties sort by priority, then `nodeId`.
    - [ ] `packages/knowledge-space-practice/src/__tests__/graph-analysis.test.ts`: a graph where 4% of the skills have a prerequisite in-edge is sparse, and 5% is not. In sparse mode, the rank is `0.7·utility + 0.3·weaknessFit`.
    - [ ] `packages/knowledge-space-practice/src/__tests__/review-load.test.ts`: the §10.5 example gives `saturated` and 0 new skills. 60% of the budget gives `elevated`.
    - [ ] `apps/math/__tests__/lib/curriculum/planner-graph.test.ts`: the math graph is not sparse. The test records the share in its output.
    - [ ] `apps/math/__tests__/components/student/review-load.test.tsx` and the teacher page test of the S4 Contract: the student page shows `reviewLoadState`, and the teacher page shows `reviewLoadStates`.
    - [ ] Run the package suites and the app suite. Confirm that the new cases fail.
    - [ ] Commit: `test(kst): specify the v3.2 planner`.
- [ ] Task: S4 Implement — the planner
    - [ ] Change `priority.ts`, `unlock-value.ts`, `goal-proximity.ts`, and `weakness-fit.ts` to the normalized terms. Add the `utility` term and `DEFAULT_PRIORITY_WEIGHTS`.
    - [ ] Add `planner/graph-analysis.ts`. Change the math graph loader to call `analyzePlannerGraph` one time for each loaded graph.
    - [ ] Add the diversity cap to `recommended-next.ts`. Add the review-load budget to the student projection (`reviewLoadState`) and to the teacher projection (`reviewLoadStates`, a map from student ID to state; §9.4).
    - [ ] Change `visualization.ts` to use `DEFAULT_PRIORITY_WEIGHTS`. Show the review-load state on each page of the S4 Contract.
    - [ ] Commit: `feat(kst): adopt the v3.2 planner and review-load budget`.
- [ ] Task: S4 Verify — run the gates
    - [ ] Run each gate. Confirm that each gate passes.
    - [ ] Record the share of math skills with a prerequisite in-edge under "Planner Graph".
    - [ ] Commit: `measure(kst-v32-runtime): record the S4 results`.
- [ ] Task: S4 Docs & Doctor
    - [ ] Run `npm run generate`. Confirm exit code 0.
    - [ ] Run `npm run doctor`. Confirm exit code 0.
- [ ] Task: Measure - User Manual Verification 'Phase S4: Planner and review-load budget' (Protocol in workflow.md)
    - [ ] Run the protocol: the automated tests, the manual verification plan, and the user confirmation.
    - [ ] Make the checkpoint commit: `measure(checkpoint): Checkpoint end of Phase S4`.
    - [ ] Append `[checkpoint: <sha>]` to the Phase S4 heading.
    - [ ] Commit: `measure(plan): Mark phase 'Phase S4: Planner and review-load budget' as complete`.

## Phase S5: Placement walk and seeding
_Story ref: spec.md#story-s5_

- [ ] Task: S5 Contract — define the walk and the seeding
    - [ ] Write the contract of `runPlacementTraversal` for §11.2 steps 1 to 6, with the budget 24 and the stop after 4 probes with no frontier change.
    - [ ] Write the contract of the seeding (§11.4): the synthesized card, `H`, the provisional state, the closure over hard edges, and the evidence type.
    - [ ] For each node of the math probe bank, record its second probe source: another variant, a new generator seed, or none. List each node with no second probe under "Placement Gaps" (spec K11).
    - [ ] Record the schema change: `srs_cards.source` (optional `"placement"`) and `placement_results.evidenceType` (optional `"direct"` or `"inferred"`).
    - [ ] Record the widening of the `confidence` union to `low`, `medium`, and `high` (spec K11, §11.4). Run `git grep -n -E "'low' \| 'medium'|\"low\" \| \"medium\"|literal\(\"medium\"\)" -- packages apps`. Record each place that holds the union.
    - [ ] Commit: `measure(kst-v32-runtime): record the S5 contract`.
- [ ] Task: S5 Test (Red) — specify the walk and the seeding
    - [ ] `packages/knowledge-space-core/src/__tests__/placement-engine.test.ts`: pass-pass advances. Fail-fail retreats. Pass-fail gets a third probe. `partial` counts as half a pass.
    - [ ] Also: a node with an unresolved hard-edge parent is not eligible. The walk stops at 24 probes. Direct estimates cap at `medium`.
    - [ ] `packages/knowledge-space-core/src/__tests__/placement-knowledge-state-seed.test.ts`: the §11.4 worked example gives `S₀ = 28.5` for B and `S₀ = 14.25` with `medium` for its hard-edge parent. A result of 0.60 with `low` gives `S₀ = 3` and `inProgress`.
    - [ ] Also: a soft-edge parent gets nothing. A result of 0.95 with `high` is valid input and gives `S₀ = 28.5`.
    - [ ] `apps/math/__tests__/convex/placement.test.ts`: the case "rejects PlacementResult with confidence="high"" changes to accept `high` and to reject another value (for example `"extreme"`). Record the change under "Changed v2 Cases".
    - [ ] `apps/integrated-math-3/__tests__/lib/placement/phase5-docs-and-doctor.test.ts` (line 264 in the start commit): the case that asserts `z.enum(['low', 'medium'])` in `placement.ts` changes to the three-value enum with `high`. After the app move to `apps/math`, the same case is in `apps/math/__tests__/lib/placement/`. Record the change under "Changed v2 Cases".
    - [ ] `apps/math/__tests__/lib/placement/seed-knowledge-state.test.ts`: the seeding writes one `srs_cards` row for each objective with `source: "placement"`. A later practice submission replaces an inferred estimate.
    - [ ] Run the package suites and the app suite. Confirm that the new cases fail.
    - [ ] Commit: `test(kst): specify the v3.2 placement`.
- [ ] Task: S5 Implement — the walk and the seeding
    - [ ] Rewrite `runPlacementTraversal` in `placement-engine.ts` to §11.2. Change `buildKnowledgeStateSeed` in `placement.ts` to §11.4.
    - [ ] Widen the `confidence` union to add `"high"` in these files (spec K11): `packages/knowledge-space-core/src/placement.ts` (the type, the zod enum, and the two guards), `apps/math/convex/placement.ts` (the handler type, the check, and the mutation validator), `apps/math/convex/schema.ts` (`placement_results`), and `apps/math/lib/placement/seed-knowledge-state.ts` (the type). Change the test types that hold the union (`multi-module-placements.ts`, `fixtures.ts`, `placement.test.ts`).
    - [ ] Change `apps/math/lib/placement/im3-probe-adapter.ts` to give a second probe as the S5 Contract records. Use the guess floors of S2 for a pass.
    - [ ] Change `apps/math/lib/placement/seed-knowledge-state.ts` and `placement-flow.ts` to write the synthesized cards and the evidence type. Add the two schema fields.
    - [ ] Commit: `feat(kst): adopt the v3.2 placement walk and seeding`.
- [ ] Task: S5 Verify — run the gates
    - [ ] Run each gate. Confirm that each gate passes.
    - [ ] Commit: `measure(kst-v32-runtime): record the S5 results`.
- [ ] Task: S5 Docs & Doctor
    - [ ] Run `npm run generate`. Confirm exit code 0.
    - [ ] Run `npm run doctor`. Confirm exit code 0.
- [ ] Task: Measure - User Manual Verification 'Phase S5: Placement walk and seeding' (Protocol in workflow.md)
    - [ ] Run the protocol: the automated tests, the manual verification plan, and the user confirmation.
    - [ ] Make the checkpoint commit: `measure(checkpoint): Checkpoint end of Phase S5`.
    - [ ] Append `[checkpoint: <sha>]` to the Phase S5 heading.
    - [ ] Commit: `measure(plan): Mark phase 'Phase S5: Placement walk and seeding' as complete`.

## Phase S6: Edge calibration
_Story ref: spec.md#story-s6_

- [ ] Task: S6 Contract — define the calibration
    - [ ] Write the contract of `updatePosterior` for §6.4 with the prior `Beta(1, 1)` (spec K12).
    - [ ] Write the contract of the stratified verdict (§6.7): the overall proficiency rate of each student in the cohort window, the terciles, and the band rule.
    - [ ] Record the schema change: `edge_calibration.untestedReason` (optional string).
    - [ ] Commit: `measure(kst-v32-runtime): record the S6 contract`.
- [ ] Task: S6 Test (Red) — specify the calibration
    - [ ] `packages/srs-engine/src/__tests__/edge-calibration-posterior.test.ts`: `a=470, b=20, c=4, d=6` gives `Beta(7, 5)` and `untested`. `c=40, d=10` gives `Beta(11, 41)` and `refuted`.
    - [ ] Also: cells `a` and `b` do not change the posterior.
    - [ ] `packages/srs-engine/src/__tests__/edge-calibration-stratified.test.ts`: band means 0.83 and 0.75 keep the pooled verdict. Band means 0.85 and 0.30 give `untested` with `confounded_by_ability`. One band with `c + d ≥ 5` gives no adjusted verdict.
    - [ ] `apps/math/__tests__/convex/edgeCalibration.test.ts`: the refresh starts each edge at `Beta(1, 1)` and writes `untestedReason`.
    - [ ] Run the package suites and the app suite. Confirm that the new cases fail.
    - [ ] Commit: `test(kst): specify the v3.2 edge calibration`.
- [ ] Task: S6 Implement — the calibration
    - [ ] Change `updatePosterior` in `edge-calibration.ts` to §6.4. Add the stratified verdict of §6.7.
    - [ ] Change `apps/math/convex/edgeCalibration.ts` to the prior `Beta(1, 1)` and the stratified verdict. Add `edge_calibration.untestedReason`.
    - [ ] Run `refreshCalibrationReviewQueue` on the dev deployment. Record the count of each status under "Calibration".
    - [ ] Commit: `feat(kst): adopt the v3.2 edge calibration`.
- [ ] Task: S6 Verify — run the gates
    - [ ] Run each gate. Confirm that each gate passes.
    - [ ] Confirm that each MIGRATION item of "Inventory" has its test, except the deferred parts of item 11.
    - [ ] Commit: `measure(kst-v32-runtime): record the S6 results`.
- [ ] Task: S6 Docs & Doctor
    - [ ] Run `npm run generate`. Confirm exit code 0.
    - [ ] Run `npm run doctor`. Confirm exit code 0.
- [ ] Task: Measure - User Manual Verification 'Phase S6: Edge calibration' (Protocol in workflow.md)
    - [ ] Run the protocol: the automated tests, the manual verification plan, and the user confirmation.
    - [ ] Make the checkpoint commit: `measure(checkpoint): Checkpoint end of Phase S6`.
    - [ ] Append `[checkpoint: <sha>]` to the Phase S6 heading.
    - [ ] Commit: `measure(plan): Mark phase 'Phase S6: Edge calibration' as complete`.

## Closeout (after the last phase)

- [ ] Task: Close out the track and sync with origin
    - [ ] Run the closeout of the Measure `implement` workflow, sections 3.0 to 5.0: the metadata, the registry, the generated facts, and the archive choice.
    - [ ] Run `git fetch origin`.
    - [ ] Run `git pull --ff-only origin master`. If the pull cannot fast-forward, stop and report.
    - [ ] Run `git push origin master`.
