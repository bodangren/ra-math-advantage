# Track: KST Spec v3.2 Runtime Migration

Type: Chore
Spec format: Story-shaped (one story for each phase)
Depends on: the track set `unified-math-app_20261114` (each member closed)
Next: the track "Consume the mastery-advantage Math Graph" depends on this track.

## Overview

The knowledge space and SRS engine of this repository implements the contract
`kst-srs.v2`. The contract source moved to the private repository mastery-advantage
(`github.com/Reading-Advantage-Thailand/mastery-advantage`, file `SPECIFICATION.md`), and
its version is now `kst-srs.v3.2`. The file `MIGRATION-v3.md` of that repository lists 16
changes (items 1 to 16). Each change fixes a behavior that is wrong for learners.

This track moves `packages/knowledge-space-core`, `packages/knowledge-space-practice`,
`packages/srs-engine`, `packages/practice-core`, and their callers in `apps/math` to v3.2.
It replaces the in-repo copy `kst-srs.v2/` with a pointer to the v3.2 source.

Sprint goal: the engine of the math app gives the v3.2 results for the worked examples of
`SPECIFICATION.md`, and the repository cites v3.2 as its contract.

## Current System (checked 2026-11-14 on `0bf1900a`)

Paths below use `apps/integrated-math-3`. After the set, the same files are in `apps/math`.

- **Spec copy:** `kst-srs.v2/SPECIFICATION.md` is the in-repo contract. `measure/index.md`
  (line 20) and `measure/knowledge-space.md` (lines 5 and 129) link to it. Eight test files
  read the spec file or expect a link to it:
  - `__tests__/governance/no-stale-problem-family.test.ts` (sections §12.1 and §13).
  - `apps/integrated-math-3/__tests__/lib/placement/phase5-docs-and-doctor.test.ts` (a
    placement heading).
  - `packages/knowledge-space-core/src/__tests__/`: `docs-reconciliation.test.ts` and
    `phase-1-adversarial.test.ts` (the link in `measure/knowledge-space.md`),
    `phase4-spec-section-6-implementation.test.ts`,
    `phase5-spec-section-3-2-3-7-8-4-13-3-implementation.test.ts`, and
    `spec-markers.test.ts` (the v2 text).
  - `packages/knowledge-space-practice/src/__tests__/kst-srs-v2-planner-parity.test.ts`
    (the v2 planner text).
  - No gate runs `__tests__/governance/` today.
- **v3.2 source:** the local clone `/home/daniebo/Desktop/mastery-advantage` is at commit
  `e560a67`. `SPECIFICATION.md` has the header "Version: kst-srs.v3.2".
- **Package dependencies:** `knowledge-space-core` depends only on `zod`. `srs-engine`
  depends on `practice-core` and `ts-fsrs` (lockfile 6.0.0). `efficacy-core` depends on
  `srs-engine` and `practice-core`. `knowledge-space-practice` depends on
  `knowledge-space-core`. No package depends on both `srs-engine` and
  `knowledge-space-core`.
- **Retention (item 3):** two functions have the name `stabilityToRetention`.
  - `packages/srs-engine/src/srs/srs-proficiency.ts:81` has one required argument
    (`stability`) and the optional argument `scaleFactor`: `1 - 1 / (1 + stability / 30)`.
    `aggregateCardsToEvidence` (line 98) takes the mean of it across the cards of a
    variant. `efficacy-core` calls it at `src/metrics/retention.ts:36,43` and
    `src/metrics/time-to-mastery.ts:45`.
  - `packages/knowledge-space-core/src/knowledge-state-engine.ts:70` has two required
    arguments and the optional argument `scale`. It uses an exponential curve:
    `exp(-deltaDays / (stability × scale))`. `srs-bridge.ts:257` calls it.
  - v3.2 §13.5 uses the FSRS power curve, with the constants of the FSRS version in use.
    ts-fsrs 6.0.0 (installed) does not export `forgetting_curve` from its root module. The
    subpath `ts-fsrs/models/fsrs-6` exports `forgettingCurve(decayOrParameters, elapsed_days,
    stability)` and `FSRS6_DECAY = 0.1542`. The root module exports the same value as
    `FSRS6_DEFAULT_DECAY`. `DEFAULT_SCHEDULER_CONFIG` holds no weights. The scheduler builds
    its weights with `generatorParameters(...)`, which returns an object with the array `w`.
- **Readiness (item 1):** `packages/knowledge-space-core/src/weighted-readiness.ts`
  `computeWeightedReadiness` gives the weighted mean of the prerequisite mastery values. It
  has no hard gate. `MasteryThresholds` (`mastery-state.ts:21`) has `masteryEnter` (0.9),
  `masteryExit` (0.7), and the readiness thresholds. It has no `hardGateThreshold` and no
  `trendThreshold`.
- **Progress trend (item 6):** `packages/knowledge-space-core/src/progress-trend.ts` has no
  `trendThreshold`.
- **Proficiency evidence (item 7):** `retentionStrength` is the mean stability index of
  `aggregateCardsToEvidence`, not a corrected correctness. No adapter declares a guess
  floor.
- **Rating mapper (item 8):** `packages/practice-core/src/practice/srs-rating.ts` has
  `computeBaseRating` (line 109) and `applyTimingToRating` (line 193).
- **Scheduler (items 10 and 11):** `packages/srs-engine/src/srs/scheduler.ts` has
  `requestRetention: 0.9` (line 50) and no `requestRetentionByPriority`. The table
  `srs_review_log` (`convex/schema.ts:658`) has no `paramsVersion`.
- **Daily queue (item 5):** `packages/srs-engine/src/srs/queue.ts` `buildDailyQueue` puts
  new cards first, then overdue cards by days overdue, then due cards by due date, and cuts
  the list at `maxReviewsPerDay`. `convex/queue/queue.ts:185` calls it. BM2 has its own
  queue in `apps/bus-math-v2/lib/srs/queue.ts`, which imports only a type of `srs-engine`.
- **Session composition (item 16):** the queue has no interleaving. The scheduler uses the
  random fuzz of ts-fsrs, not a fuzz from `hash(cardId, reps)`, and no load balancing.
- **Planner (items 13 to 15):** `packages/knowledge-space-practice/src/planner/priority.ts`
  has four terms (`a` to `d`) with raw values. `projections/visualization.ts:177` calls
  `getRecommendedNext` with the weights `{ a: 1, b: 1, c: 1, d: 1 }` and top 5.
  `planner/recommended-next.ts` has no diversity cap. No `utility` term, no sparse mode, and
  no `reviewLoadState` or `reviewLoadStates` field exist.
- **Placement (items 4 and 9):** `packages/knowledge-space-core/src/placement-engine.ts`
  `runPlacementTraversal` makes one probe for each node (`pass` 0.85 medium, `fail` 0.15
  low, `partial` 0.4 low). `placement.ts` `buildKnowledgeStateSeed` seeds the knowledge
  state with no card. The app side is `lib/placement/{im3-probe-adapter,placement-flow,
  seed-knowledge-state}.ts`. The table `placement_results` has `nodeId`,
  `masteryEstimate`, `confidence` (`low` or `medium`), and `source`. The same two values
  limit the type and the zod schema in `placement.ts` (lines 24, 34, 58, and 98), the
  Convex mutation `convex/placement.ts` (lines 11, 30, and 124), and `schema.ts:773`.
- **Edge calibration (items 2 and 12):** `packages/srs-engine/src/srs/edge-calibration.ts`
  `updatePosterior` (line 246) increments `alpha` or `beta` for each observation.
  `convex/edgeCalibration.ts` starts each edge at `alpha: 0, beta: 0` (line 73) and replays
  each observation. No ability band exists.
- **Domain adapter:** `packages/knowledge-space-core/src/adapters.ts` has the adapter
  interface. It declares no guess floor and no utility provider.

## Decisions (defaults of 2026-11-14)

- **K1 Spec pointer:** delete `kst-srs.v2/`. Add `kst-srs/README.md`. It names the source
  repository, the file `SPECIFICATION.md`, the version `kst-srs.v3.2`, the pinned commit,
  and the items that this track defers (K10). The pinned commit is the `HEAD` of the local
  clone at the S1 Contract; the evidence file records it. The README copies no text of the
  specification.
  - `measure/index.md` and `measure/knowledge-space.md` link to `kst-srs/README.md`.
  - In the eight test files that read the v2 spec or expect a link to it: a block that
    checks the v2 text goes away, and a file with only such blocks goes away. A block that
    checks the link in `measure/knowledge-space.md` expects `kst-srs/README.md`. Each other
    block stays.
  - A code comment that cites `kst-srs.v2 §n` changes to the v3.2 section only in a file
    that this track changes for another reason.
- **K2 Retention:** `stabilityToRetention(stability, elapsedDays)` follows §13.5.
  - In `srs-engine`, it imports `forgettingCurve` from the subpath `ts-fsrs/models/fsrs-6`
    and returns `forgettingCurve(parameters.w, elapsedDays, stability)`. The argument order
    of the library is parameters, elapsed days, stability. The value `parameters` comes from
    `generatorParameters(...)` with the values of `DEFAULT_SCHEDULER_CONFIG`
    (`requestRetention`, `maximumInterval`, `enableShortTermPreview`). These are the same
    parameters as the scheduler uses.
  - In `knowledge-space-core`, it uses the same power curve with the constant
    `FSRS_DECAY = 0.1542`. This value equals `FSRS6_DEFAULT_DECAY` of ts-fsrs 6.0.0 and
    the last default weight (`w[20]`). The `scale` argument goes away. The package gets no
    new dependency.
  - The curve in `knowledge-space-core` is `(1 + FACTOR × elapsedDays / stability)^(−FSRS_DECAY)`.
    The constant `FACTOR` pairs with `FSRS_DECAY` as `FACTOR = 0.9^(−1/FSRS_DECAY) − 1`
    (about 0.980). This is the form of `computeDecayFactor` in ts-fsrs 6.0.0:
    `exp(ln(0.9) / −DECAY) − 1`. The retention at `elapsedDays = stability` is then 0.9.
    The S1 Red case and the parity test pin this value. The §13.5 value `FACTOR = 19/81`
    pairs with the decay 0.5 only. With `FSRS_DECAY` it gives 0.968 at
    `elapsedDays = stability`, so the track does not use it.
  - The new test `apps/math/__tests__/lib/srs/retention-parity.test.ts` compares the two
    functions on a grid of values.
- **K2a Efficacy metrics:** `efficacy-core` keeps the v2 stability index for its reports.
  The formula moves to `packages/efficacy-core/src/metrics/stability-index.ts` as
  `stabilityIndex(stability)`, with the same values. `measure/tech-debt.md` gets a row: the
  efficacy retention metrics use a stability index, not the v3.2 retention.
- **K3 Objective retention:** the live retention of an objective is the minimum of
  `stabilityToRetention` across its variant cards with `reps ≥ 1` (§2.1.1). This applies in
  `srs-bridge.ts` and in each place that computes the mastery level of an objective.
- **K4 Gated readiness:** `computeWeightedReadiness` gives `gate(B) × comp(B)` (§2.5).
  `MasteryThresholds` gets `hardGateThreshold` (default 1.0) and `trendThreshold` (default
  3). Each caller of `computeWeightedReadiness` keeps its call. The evidence file records
  the count of `prerequisite_for` edges with weight 1.0 in the graph files, because these
  edges now gate.
- **K5 Corrected correctness:** `retentionStrength` follows §13.1.
  - The attempts are the `srs_review_log` entries of the variant cards, newest first. A
    pass is each rating except `Again`.
  - The math adapter declares the guess floors (§15.2): a multiple-choice format with k
    options gets `1/k`, and each other format gets 0. The S2 Contract records the answer
    format of each practice variant source and its floor.
  - The confidence caps of §13.1 apply (fewer than 3 attempts: at most `low`; fewer than
    6: at most `medium`).
  - The new exported function `computeCorrectedCorrectness(passes, guessFloor)` in
    `objective-proficiency.ts` takes the passes (newest first) and returns
    `{ weightedRate, effectiveSampleSize, wilsonLower, retentionStrength }`. The tests read
    each step of §13.1 on this function.
- **K6 Rating mapper:** `srs-rating.ts` follows §8.4 (stages 1 to 5). The comment of the
  misconception cap (stage 5) cites §13.3, as MIGRATION item 6 (first bullet) requires. This
  part of item 6 changes no behavior.
- **K7 Scheduler:** `requestRetentionByPriority` is optional with the defaults 0.95, 0.90,
  and 0.80 (§12.3). The app does not set it. Each new `srs_review_log` entry gets
  `paramsVersion` (an optional field in the schema), with the value of the constant
  `FSRS_PARAMS_VERSION` in `scheduler.ts`.
- **K8 Daily queue and session composition:** `buildDailyQueue` follows §12.7 rules 1 to 6.
  - The new function `composeSession` in `packages/srs-engine/src/srs/session.ts` applies
    the interleaving after the selection.
  - The scheduler sets `enable_fuzz: false` in ts-fsrs. The new function
    `applyIntervalFuzz` in `packages/srs-engine/src/srs/interval-fuzz.ts` applies the
    ±5% fuzz from `hash(cardId, reps)` and the load balancing. The caller gives the due
    count of each day of the fuzz window.
  - The daily queue page of the math app shows "Review day" when the queue is in backlog
    mode.
  - The BM2 queue (`apps/bus-math-v2/lib/srs/queue.ts`) does not change.
    `measure/tech-debt.md` gets a row for it.
- **K9 Planner:** the priority follows §10.1 with five normalized terms and the defaults
  `a=0.35, b=0.20, c=0.15, d=0.10, e=0.20` in `DEFAULT_PRIORITY_WEIGHTS`
  (`planner/types.ts`). `visualization.ts` uses `DEFAULT_PRIORITY_WEIGHTS`.
  - `maxReach` and the sparse flag (§10.4) come from the new function
    `analyzePlannerGraph(graph)` in `planner/graph-analysis.ts`. The math graph loader
    calls it one time for each loaded graph.
  - `recommendedNext` applies the diversity cap of §10.2.
  - The math domain registers no utility provider, so `utility = 0` (§10.3 rule 3). The
    adapter interface gets the optional `utilityProvider` field.
  - The review-load budget follows §10.5 with `loadBudgetFactor = 0.8`. The field names
    follow §9.4. The student projection holds `reviewLoadState`. The teacher projection
    holds `reviewLoadStates`, a map from each student ID to a state. Both appear in their
    pages.
- **K10 Deferred items:** the FSRS parameter fit (§12.10) and the offline evaluation
  harness (§17) of item 11 are out of scope. Only the `paramsVersion` stamp of item 11 is in
  scope (K7). `kst-srs/README.md` lists the deferred items.
- **K11 Placement:** `runPlacementTraversal` follows §11.2 (two probes for each decision,
  a third on a mixed result, the frontier walk, the budget of 24, the confidence cap
  `medium`).
  - The math probe adapter takes the second probe from another practice variant of the
    node. When the node has one variant only, the adapter uses a new seed of the same
    generator. When the node has no generator, one probe decides, and the evidence file
    lists the node.
  - The seeding follows §11.4: one synthesized `srs_cards` row for each objective, with
    `S₀ = H(confidence) × masteryEstimate` and `H = { low: 5, medium: 15, high: 30 }`.
  - `srs_cards` gets the optional field `source` (`"placement"`). `placement_results` gets
    `evidenceType` (`"direct"` or `"inferred"`).
  - The §11.4 high-confidence case needs the value `high`. The union of `confidence` gets
    the value `high`, in the type and the zod schema of `placement.ts`, in the two Convex
    validators of `convex/placement.ts`, and in `placement_results` of `schema.ts`. The
    walk of §11.2 still caps its own direct estimates at `medium`. The v2 test that
    rejects `high` changes to accept it (the plan lists it under "Changed v2 Cases").
- **K12 Edge calibration:** `updatePosterior` follows §6.4. Only the not-proficient-in-A
  rows change the posterior. The prior is `Beta(1, 1)`.
  - The stratified verdict follows §6.7 (terciles of the overall proficiency rate, at
    least 2 bands with `c + d ≥ 5`, agreement within 0.2). Else the status is `untested`
    with the reason `confounded_by_ability`.
  - `edge_calibration` gets the optional field `untestedReason`. The next run of
    `refreshCalibrationReviewQueue` recomputes each posterior from the observations.

## Stories

### Story S1: Spec pointer, retention, and readiness
**As a** student
**I want** my retention and readiness computed with the v3.2 rules
**So that** a skill that I forgot or that has an unmastered hard prerequisite shows the right state

**Acceptance Criteria:**
- Given the repository after S1, When `kst-srs/README.md` is read, Then it names the source repository, `SPECIFICATION.md`, `kst-srs.v3.2`, the pinned commit, and the deferred items, and `kst-srs.v2/` does not exist.
- Given `stabilityToRetention(10, 0)` and `stabilityToRetention(10, 10)`, When each package computes them, Then the results are 1.0 and 0.9, and the two packages agree on the parity grid.
- Given an objective with two variant cards with `reps ≥ 1` and the retentions 0.95 and 0.60, When the bridge computes the objective retention, Then it is 0.60.
- Given a skill with one prerequisite of weight 1.0 that is not mastered, When readiness is computed, Then the state is `blocked`. Given a graph with no edge of weight 1.0, Then readiness equals the v2 value.
- Given a mastered count that drops by 2 with `trendThreshold = 3`, When the trend is computed, Then it is `stable`.

**Estimate:** M
**Priority:** Must

### Story S2: Corrected evidence, rating, and scheduler stamps
**As a** teacher
**I want** proficiency that removes lucky guesses and old failures
**So that** a proficient verdict means real skill

**Acceptance Criteria:**
- Given 3 passes in 10 attempts on a 4-option multiple-choice format, When `retentionStrength` is computed, Then it is 0. Given 8 passes in 10 on the same format, Then it is 0.388 (±0.001). Given 8 in 10 on free response, Then it is 0.541 (±0.001).
- Given 5 passes in 5 attempts, When the evidence confidence is computed, Then it is not `high`.
- Given a correct submission with 3 hints, When the rating is computed, Then it is `Hard`. Given all worked steps revealed, Then it is `Again`.
- Given a review, When the app writes the review log entry, Then the entry holds `paramsVersion`.

**Estimate:** M
**Priority:** Must

### Story S3: Daily queue and session composition
**As a** student
**I want** reviews of what I forgot most before new material
**So that** a return after an absence does not bury me

**Acceptance Criteria:**
- Given 25 overdue reviews, 6 new candidates, `maxReviewsPerDay = 20`, and `newCardsPerDay = 4`, When the queue is built, Then it holds the 20 reviews with the lowest retention and 0 new cards, and the page shows "Review day".
- Given 12 due reviews and 6 new candidates with the same caps, When the queue is built, Then it holds 12 reviews and then 4 new cards.
- Given 3 reviews of objective A, 2 of B, and 1 of C, When the session is composed, Then the order is A, B, C, A, B, A.
- Given one card and one rep count, When the fuzz runs two times, Then both results give the same due date, and the interval is within ±5% of the scheduler interval.

**Estimate:** M
**Priority:** Must

### Story S4: Planner and review-load budget
**As a** student
**I want** recommendations that weigh readiness, reach, goals, and weakness fairly
**So that** the next skill fits me and my review load

**Acceptance Criteria:**
- Given the §10.1 worked example (max reach 120; P with readiness 0.85 and reach 40; Q with readiness 1.0 and reach 2), When the priority is computed with the default weights, Then P is 0.452 and Q is 0.396 (±0.001).
- Given six ready skills of one unit with the top priorities, When `recommendedNext` takes the top 5, Then it holds at most 2 skills of that unit.
- Given 180 cards due in the next 7 days and `maxReviewsPerDay = 20`, When the planner runs, Then the student `reviewLoadState` is `saturated`, the planner recommends 0 new skills, and the student page and the teacher page (`reviewLoadStates`) show the state.
- Given the math graph, When `analyzePlannerGraph` runs, Then the sparse flag is false, and the evidence file records the share of skills with a prerequisite in-edge.

**Estimate:** L
**Priority:** Must

### Story S5: Placement walk and seeding
**As a** new student
**I want** a placement that a lucky guess does not fool, and that gives me live review cards
**So that** placement puts me at the right start and keeps my state current

**Acceptance Criteria:**
- Given a decision node, When the first two probes give pass and fail, Then a third probe decides. Given pass and pass, Then the walk advances.
- Given the default budget, When the walk runs, Then it stops at 24 probes or earlier by the §11.2 rules.
- Given a direct result of 0.95 with `high` confidence, When the seeding runs, Then it writes one card with `S₀ = 28.5` days, `source: "placement"`, and the state provisional `mastered`. Given a hard-edge parent, Then the parent gets an inferred result with `medium` confidence and `S₀ = 14.25` days.
- Given a later practice submission on an inferred node, When the state is computed, Then the direct evidence replaces the inferred estimate.

**Estimate:** L
**Priority:** Must

### Story S6: Edge calibration
**As a** curriculum reviewer
**I want** edge verdicts that test necessity and correct for strong students
**So that** the review queue shows real evidence

**Acceptance Criteria:**
- Given the cohort `a=470, b=20, c=4, d=6` with the prior `Beta(1, 1)`, When the posterior is computed, Then it is `Beta(7, 5)` and the status is `untested`.
- Given `c=40, d=10`, When the posterior is computed, Then it is `Beta(11, 41)` and the status is `refuted`.
- Given band posterior means 0.85 (low band) and 0.30 (high band), When the stratified verdict is computed, Then the status is `untested` with the reason `confounded_by_ability`.

**Estimate:** M
**Priority:** Must

## Non-Functional Requirements

- No dependency change. No package gets a new dependency (K2).
- The packages stay domain-neutral (§15.3 rule 1). The math values (guess floors, probe
  adapter) live in `apps/math`.
- Each schema change adds an optional field, or widens a literal union so that each stored
  document stays valid. No data migration.
- Tests are behavioral (`measure/lessons-learned.md`, 2026-06-24). Each worked example of
  the stories is a test with the numbers of `SPECIFICATION.md`.
- BM2 changes only where a changed package signature breaks a BM2 call. The BM2 gates
  pass.
- Do not write in the mastery-advantage repository or its local clone. Read it only.
- Each phase passes the gates of `measure/workflow.md`, as `vinext-oxc-toolchain_20261114`
  sets them.
- Commit after each task, as `measure/workflow.md` requires. Each phase ends with the
  Phase Completion Verification and Checkpointing Protocol of `measure/workflow.md`.
- After closeout, the track syncs with origin: git fetch origin, git pull --ff-only origin master, then git push origin master. If the pull cannot fast-forward, stop and report.
- No step before closeout pushes to the remote.
- Write all new prose in ASD-STE100.

## Acceptance Criteria

- AC1: `kst-srs/README.md` points to the v3.2 source at a pinned commit, and
  `kst-srs.v2/` does not exist.
- AC2: MIGRATION items 1 to 10 and 12 to 16 are in the runtime, each with a test of its
  worked example. Item 11 has only the `paramsVersion` stamp (K10).
- AC3: The math domain declares guess floors and no utility provider.
- AC4: `measure/tech-debt.md` has the rows of K2a and K8.
- AC5: Each gate passes.

## Out of Scope

- The FSRS parameter fit (§12.10) and the offline evaluation harness (§17).
- A Domain Utility Provider for math.
- The released math graph and the graph data files (the track "Consume the
  mastery-advantage Math Graph").
- §14 cross-course equivalence. The merged graph replaces it, and the consume track
  removes `cross-course-equivalence.ts`.
- The BM2 queue and the efficacy retention metrics (K2a, K8).
