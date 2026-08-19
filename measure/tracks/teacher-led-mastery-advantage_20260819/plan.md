# Implementation Plan: Teacher-Led First Exposure and Mastery Advantage Pilots

**Track type:** feature

**Contract:** `learning-evidence.v1`

**Pilot bound:** exactly one mastery-bearing node per app; three nodes total

**Pipeline:** Contract → Test (Red) → Implement (Green) → Generate/Doctor

**Coordination:** target the post-migration v3.2 interfaces from
`kst-srs-v3-2-im3-runtime-migration_20260710`; do not take ownership of its
widen–migrate–narrow or cutover work

## Lane 1: Shared Contract + IM3 Pilot

- **Owns:** The domain-neutral `learning-evidence.v1` schema and policy helpers,
  plus the IM3 adapter for
  `math.im3.skill.1.1.graph-quadratic-functions`.
- **Boundary:** Shared packages import no app code. The IM3 adapter stays app
  owned and integrates only after an overlap check with the active v3.2 runtime
  migration.
- **Proof:** Teacher exposure introduces the node without changing mastery; a
  later graded Mastery Advantage attempt can enter IM3's KST+SRS pipeline.

## Lane 2: AP Precalculus Pilot

- **Owns:** The Precalculus adapter and bounded pilot wiring for
  `math.precalc.skill.1.1.identify-intervals-of-increase-decrease-from-graphs`.
- **Boundary:** Reuse the shared evidence contract and KST+SRS APIs; retain
  Precalculus-owned curriculum, graph artifacts, auth, and persistence.
- **Proof:** The same teacher-first/no-teacher-mastery policy works without IM3
  assumptions and enables only this one Precalculus node.

## Lane 3: BM2 Pilot

- **Owns:** One app-owned BM2 skill node,
  `math.bm2.skill.1.1.apply-accounting-equation`, its activity mapping, and the
  BM2 evidence/KST+SRS adapter.
- **Boundary:** Do not perform a full BM2 graph extraction. Extend shared math ID
  support only as narrowly as required for the one reviewed BM2 node, and make no
  dependency/package-manifest change without explicit approval.
- **Proof:** BM2 can consume the same contract and teacher-first gate while its
  curriculum and persistence remain app owned.

All three lanes follow the global phase gates below. Complete all Contract tasks
before Test, confirm behavioral Red before Implement, and run Generate/Doctor
only after all three pilots are Green.

## Phase 1: Contract

- [ ] Task 1.1: Define the shared `learning-evidence.v1` contract (Lane 1)
    - [ ] Add the canonical contract version, strict schema, inferred types, and public exports in the lowest valid domain-neutral package
    - [ ] Require `nodeId`, `activityId`, positive `attemptOrdinal`, `origin`, `practice.v1` `mode`, ISO `occurredAt`, optional `gradedEvidence`, and `idempotencyKey`
    - [ ] Validate paired/bounded scores and require at least one graded outcome when `gradedEvidence` exists
    - [ ] Document that authenticated app context supplies learner/app identity and that raw answers stay in `practice.v1`
- [ ] Task 1.2: Define teacher-first state transitions and mastery eligibility (Lane 1)
    - [ ] Specify `awaiting_teacher_exposure` → `introduced` on accepted `teacher_led` evidence
    - [ ] Specify that `teacher_led` evidence never creates a mastery observation or KST/SRS mutation, even when graded
    - [ ] Specify that only post-exposure, graded `mastery_advantage` evidence may be mastery-bearing
    - [ ] Define deterministic eligibility/rejection reasons and occurred-at ordering
- [ ] Task 1.3: Freeze the exact three-node pilot manifest (All lanes)
    - [ ] Register only `math.im3.skill.1.1.graph-quadratic-functions`
    - [ ] Register only `math.precalc.skill.1.1.identify-intervals-of-increase-decrease-from-graphs`
    - [ ] Define only `math.bm2.skill.1.1.apply-accounting-equation` from BM2 Unit 1 Lesson 1
    - [ ] Reject implicit rollout through prerequisite, equivalence, transfer, or neighbor expansion
- [ ] Task 1.4: Define app adapter and persistence seams (All lanes)
    - [ ] Map existing activity attempts to `attemptOrdinal` without renaming `practice.v1.attemptNumber`
    - [ ] Define ISO-to-numeric timestamp adapters where Convex stores numbers
    - [ ] Define same-key replay and same-key/different-payload conflict behavior at each app boundary
    - [ ] Record the IM3 v3.2 overlap boundary and any Precalculus/BM2 dependency approval gate before runtime edits
- [ ] Task 1.5: Measure - User Manual Verification 'Phase 1: Contract' (Protocol in workflow.md)

## Phase 2: Test

- [ ] Task 2.1: Write shared contract, normalization, and idempotency tests (Lane 1)
    - [ ] Cover all required fields, both origins, all five `practice.v1` modes, and valid optional graded evidence
    - [ ] Reject invalid timestamps, ordinals, origins, scores, node/activity IDs, and idempotency keys
    - [ ] Prove normalized same-key replay is idempotent and conflicting reuse is rejected
- [ ] Task 2.2: Write adversarial no-teacher-mastery tests (Lane 1)
    - [ ] Snapshot KST mastery/readiness/outer-fringe state before and after ungraded teacher exposure
    - [ ] Repeat with correct/full-score teacher graded evidence and prove byte-equivalent KST state
    - [ ] Prove no SRS card creation, rating, scheduling, rescheduling, or mastery-attempt increment occurs
    - [ ] Prove source-presence assertions alone cannot satisfy this behavioral invariant
- [ ] Task 2.3: Write IM3 one-node pilot Red tests (Lane 1)
    - [ ] Prove Mastery Advantage returns `awaiting_teacher_exposure` before exposure and performs no write
    - [ ] Prove teacher exposure introduces only the IM3 pilot node exactly once
    - [ ] Prove one later graded Mastery Advantage attempt traverses the existing IM3 KST+SRS path
    - [ ] Prove a non-pilot IM3 node remains disabled
- [ ] Task 2.4: Write Precalculus one-node pilot Red tests (Lane 2)
    - [ ] Reuse the shared conformance fixture without importing IM3 code
    - [ ] Prove before-exposure denial, exposure-only introduction, and post-exposure KST+SRS progression
    - [ ] Prove a second Precalculus node remains disabled
- [ ] Task 2.5: Write BM2 one-node pilot Red tests (Lane 3)
    - [ ] Validate the new BM2 node ID, source mapping, and activity mapping
    - [ ] Reuse the shared conformance fixture without importing either math app
    - [ ] Prove before-exposure denial, exposure-only introduction, and post-exposure KST+SRS progression
    - [ ] Prove no second BM2 graph node is introduced by this track
- [ ] Task 2.6: Write cross-app contract and pilot-boundary tests (All lanes)
    - [ ] Run identical origin/mode/idempotency cases against all three adapters
    - [ ] Assert exactly one enabled node per app and exactly three enabled node IDs total
    - [ ] Assert shared packages contain no app or `convex/_generated` imports
    - [ ] Assert teacher-led events never enter the KST/SRS mastery bridge in any app
- [ ] Task 2.7: Confirm and record the behavioral Red baseline (All lanes)
    - [ ] Run the focused shared-package and three-app pilot suites before implementation
    - [ ] Record failures that correspond to missing contract/gate/adapter behavior
    - [ ] Separate unrelated standing app Reds without weakening or skipping the new tests
- [ ] Task 2.8: Measure - User Manual Verification 'Phase 2: Test' (Protocol in workflow.md)

## Phase 3: Implement

- [ ] Task 3.1: Implement the shared evidence contract and policy helpers (Lane 1)
    - [ ] Add the schema/type/public exports and deterministic normalization/fingerprint behavior
    - [ ] Add pure exposure eligibility and mastery-bearing classification helpers
    - [ ] Keep teacher-led evidence on a reporting-only path and Mastery Advantage evidence on the existing KST+SRS bridge
    - [ ] Preserve the package DAG and avoid dependency changes unless separately approved
- [ ] Task 3.2: Implement the IM3 pilot adapter (Lane 1)
    - [ ] Complete the overlap review against the active v3.2 migration before touching shared IM3 runtime surfaces
    - [ ] Persist idempotent teacher-led exposure for only the frozen IM3 node
    - [ ] Gate the pilot planner/bridge path on prior exposure and map eligible graded evidence into v3.2 KST+SRS
    - [ ] Make the focused IM3 Red tests Green without enabling neighboring nodes
- [ ] Task 3.3: Implement the Precalculus pilot adapter (Lane 2)
    - [ ] Persist idempotent teacher-led exposure for only the frozen Precalculus node
    - [ ] Add the smallest app-owned KST+SRS adapter needed for the bounded node
    - [ ] Keep curriculum, graph, auth, and storage details inside Precalculus
    - [ ] Make the focused Precalculus Red tests Green without enabling neighboring nodes
- [ ] Task 3.4: Implement the BM2 pilot node and adapter (Lane 3)
    - [ ] Add the reviewed app-owned node/activity mapping for Unit 1 Lesson 1 only
    - [ ] Extend shared math ID support narrowly for `bm2` with compatibility tests
    - [ ] Persist idempotent teacher-led exposure and gate BM2 Mastery Advantage progression
    - [ ] Reuse canonical KST+SRS behavior rather than introducing an app-local planner or scheduler
    - [ ] Make the focused BM2 Red tests Green without starting a full graph rollout
- [ ] Task 3.5: Complete cross-app Green and refactor pass (All lanes)
    - [ ] Make the shared conformance and exact-three-node boundary suites Green
    - [ ] Remove duplicated app policy logic while retaining app-owned persistence/auth adapters
    - [ ] Verify duplicate delivery causes one logical event and one downstream effect in every app
    - [ ] Re-run behavioral no-teacher-mastery tests after refactoring
- [ ] Task 3.6: Measure - User Manual Verification 'Phase 3: Implement' (Protocol in workflow.md)

## Phase 4: Generate/Doctor

- [ ] Task 4.1: Run focused tests and coverage (All lanes)
    - [ ] Run the shared contract/policy suites and all three app pilot suites
    - [ ] Run relevant existing KST, SRS, practice, and adapter regression suites
    - [ ] Meet at least 80% coverage for new code and report exact commands/results
- [ ] Task 4.2: Run lint, typecheck, and build gates (All lanes)
    - [ ] Run package and app lint for every touched workspace
    - [ ] Run `npx tsc --noEmit` for every touched package/app in addition to builds
    - [ ] Run relevant builds and record any unrelated standing baseline separately without suppressing failures
- [ ] Task 4.3: Generate and verify repository facts (All lanes)
    - [ ] Run `measure/generate.sh`
    - [ ] Verify generated architecture/routes are fresh and deterministic
    - [ ] Confirm generated output reflects only the intended shared seam and three bounded pilots
- [ ] Task 4.4: Run Measure Doctor and architecture boundaries (All lanes)
    - [ ] Run `measure/doctor.sh`
    - [ ] Run package-boundary and dependency-DAG checks
    - [ ] Resolve any shared-to-app, app-to-app, or `convex/_generated` boundary violation
- [ ] Task 4.5: Produce the three-pilot acceptance audit (All lanes)
    - [ ] Report one teacher-led exposure and one post-exposure Mastery Advantage proof per pilot node
    - [ ] Prove teacher-led processing changed no mastery/SRS state in all three apps
    - [ ] Prove exactly three node IDs are enabled and document graph-wide rollout as future scope
    - [ ] Reconcile findings with the active IM3 v3.2 migration without taking over its cutover or backfill scope
- [ ] Task 4.6: Measure - User Manual Verification 'Phase 4: Generate/Doctor' (Protocol in workflow.md)
