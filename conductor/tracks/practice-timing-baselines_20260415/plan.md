# Practice Timing Baselines - Implementation Plan

## Phase 1: Baseline and Feature Model

- [x] Task: Define timing baseline semantics [a56eff8]
  - [x] Confirm the stable identifier for a problem family or practice item
  - [x] Define minimum sample count before baselines affect scoring
  - [x] Define conservative speed bands and thresholds
  - [x] Document why median/percentiles are preferred over mean
- [x] Task: Write baseline unit tests [188b24d]
  - [x] Test median and percentile calculation
  - [x] Test outlier resistance
  - [x] Test low-confidence submissions are excluded
  - [x] Test below-minimum sample count returns inactive baseline
- [x] Task: Implement reusable baseline calculations [188b24d]
  - [x] Add a course-agnostic baseline module
  - [x] Keep Convex and React dependencies out of pure calculations
  - [x] Return serializable baseline objects
- [x] Task: Document baseline feature contract [43d5d06]
  - [x] Add developer docs explaining `timeRatio`, `speedBand`, and timing confidence
  - [x] Include examples for narrow/easy and broad/hard objectives
  - [x] Note that timing features are diagnostic inputs, not standalone grades
- [ ] Task: Conductor - Phase Completion Verification 'Baseline and Feature Model' (Protocol in workflow.md)

## Phase 2: Baseline Persistence and Aggregation

- [ ] Task: Design Convex persistence for timing baselines
  - [ ] Decide whether baselines belong in a dedicated table or problem-family metadata
  - [ ] Add indexes for problem family and last computed time
  - [ ] Ensure schema remains compatible with future courses
- [ ] Task: Write Convex tests for baseline aggregation
  - [ ] Seed submissions with mixed confidence levels
  - [ ] Verify only valid timing evidence contributes
  - [ ] Verify aggregation is idempotent
  - [ ] Verify stale baseline recomputation updates the expected row
- [ ] Task: Implement baseline aggregation
  - [ ] Query eligible practice reviews/submissions by problem family
  - [ ] Compute robust timing statistics
  - [ ] Store sample count, median, percentiles, and computation timestamp
- [ ] Task: Add operational safeguards
  - [ ] Batch work to avoid Convex transaction limits
  - [ ] Avoid unbounded scans in hot student or teacher queries
  - [ ] Document any remaining performance shortcuts as tech debt
- [ ] Task: Conductor - Phase Completion Verification 'Baseline Persistence and Aggregation' (Protocol in workflow.md)

## Phase 3: Time-Aware SRS Rating Adapter

- [ ] Task: Write rating adapter tests for timing influence
  - [ ] Correct plus fast plus clean evidence may become `Easy`
  - [ ] Correct plus slow/high-confidence evidence becomes or remains `Hard`
  - [ ] Incorrect plus fast evidence remains `Again`
  - [ ] Missing, low-confidence, or below-baseline timing does not modify rating
- [ ] Task: Implement timing feature derivation
  - [ ] Join submission timing with the matching problem-family baseline
  - [ ] Compute `timeRatio` and `speedBand`
  - [ ] Return reasons for every timing-based adjustment
- [ ] Task: Integrate timing with the deterministic rating mapper
  - [ ] Ensure correctness, score, hints, reveal steps, and misconceptions remain primary
  - [ ] Apply timing only as a conservative modifier
  - [ ] Keep student self-assessment out of the rating path
- [ ] Task: Add audit output
  - [ ] Store or expose why timing affected the rating
  - [ ] Include baseline sample count in debug/review output
  - [ ] Ensure teachers can inspect "slow because timing was reliable" versus "timing ignored"
- [ ] Task: Conductor - Phase Completion Verification 'Time-Aware SRS Rating Adapter' (Protocol in workflow.md)

## Phase 4: Objective Proficiency and Fluency Signals

- [ ] Task: Write objective proficiency tests with timing features
  - [ ] Narrow objective with enough families can reach high confidence
  - [ ] Broad essential objective requires its configured evidence policy
  - [ ] Triaged objective is excluded or labeled separately
  - [ ] Slow but correct work affects fluency confidence, not raw correctness
- [ ] Task: Implement time-aware evidence confidence
  - [ ] Add timing/fluency confidence as a separate dimension
  - [ ] Keep retention strength separate from fluency
  - [ ] Keep practice coverage separate from retention and fluency
- [ ] Task: Integrate with objective practice policy
  - [ ] Respect priority values: essential, supporting, extension, triaged
  - [ ] Respect expected problem-family counts per objective
  - [ ] Avoid global card-count assumptions across objectives
- [ ] Task: Add reporting-ready view models
  - [ ] Provide fields for student progress summaries
  - [ ] Provide fields for teacher diagnostics
  - [ ] Include explanations for low confidence and missing baselines
- [ ] Task: Conductor - Phase Completion Verification 'Objective Proficiency and Fluency Signals' (Protocol in workflow.md)

## Phase 5: UI Integration, Validation, and Handoff

- [ ] Task: Write student and teacher display tests
  - [ ] Test student copy does not create speed pressure
  - [ ] Test teacher copy distinguishes retention, coverage, and fluency
  - [ ] Test missing baseline states render clearly
- [ ] Task: Implement minimal UI surfaces
  - [ ] Add student-facing fluency/progress language only where useful
  - [ ] Add teacher-facing diagnostics for slow reliable timing and baseline gaps
  - [ ] Avoid leaderboards or comparative speed rankings
- [ ] Task: Run validation commands
  - [ ] Run focused baseline/rating/proficiency tests
  - [ ] Run relevant dashboard/view-model tests
  - [ ] Run `npm run lint`
  - [ ] Run `npm run typecheck` or document known pre-existing failures
- [ ] Task: Update Conductor planning artifacts
  - [ ] Mark completed tasks and phases in this plan
  - [ ] Update `conductor/tracks.md`
  - [ ] Update `conductor/current_directive.md` if this becomes active work
- [ ] Task: Conductor - Phase Completion Verification 'UI Integration, Validation, and Handoff' (Protocol in workflow.md)
