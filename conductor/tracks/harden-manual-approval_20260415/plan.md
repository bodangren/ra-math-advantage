# Harden Manual Component Approval - Implementation Plan

## Phase 1: Queue Coverage and Real Review Targets [checkpoint: 08a5932]

- [x] Task: Audit current approval target discovery [08a5932]
  - [x] Read `convex/_generated/ai/guidelines.md` before Convex work
  - [x] Write tests proving the queue includes stored activities
  - [x] Write tests describing missing example and practice placement coverage
  - [x] Document the stable identity scheme for embedded examples and practice placements (activityId derived from phase_sections.content.activityId)

- [x] Task: Enumerate example and practice targets from persisted lesson data [08a5932]
  - [x] Write tests for lesson section and activity placement discovery
  - [x] Implement real target assembly with lesson, phase, and section placement context
  - [x] Include unreviewed targets even when no `component_approvals` row exists yet
  - [x] Preserve existing filters for kind, status, stale state, tag, and priority

- [x] Task: Conductor - Phase Completion Verification 'Queue Coverage and Real Review Targets' (Protocol in workflow.md) [97a8fbd]

## Phase 2: Content Hashing and Stale Approval [checkpoint: TBD]

- [x] Task: Replace placeholder example/practice hashes
  - [x] Write hash stability tests for embedded example and practice target content
  - [x] Include kind, key, props/content, grading config, and deterministic solution config
  - [x] Exclude approval metadata, reviewer IDs, timestamps, and review history
  - [x] Remove `"todo-hash-for-example-practice"` from `convex/dev.ts`

- [x] Task: Verify stale detection for all review kinds
  - [x] Write tests proving activity content changes become stale
  - [x] Write tests proving example content changes become stale
  - [x] Write tests proving practice props/config changes become stale
  - [x] Ensure unchanged content remains approved and not stale

- [ ] Task: Conductor - Phase Completion Verification 'Content Hashing and Stale Approval' (Protocol in workflow.md)

## Phase 3: Harness Data and Approval Gating

- [ ] Task: Feed harnesses from real stored data
  - [ ] Write component tests for activity harness rendering stored props
  - [ ] Write component tests for example harness rendering selected content/modes
  - [ ] Write component tests for practice harness using selected practice props
  - [ ] Remove hardcoded sample-only behavior where real target data is available

- [ ] Task: Enforce manual checklist gating before approval
  - [ ] Write tests that `approved` is disabled until required harness checks are complete
  - [ ] Require teaching/guided/practice review for examples where applicable
  - [ ] Require correct/incorrect attempt inspection for practice where feasible
  - [ ] Keep `needs_changes` and `rejected` available with required comments

- [ ] Task: Conductor - Phase Completion Verification 'Harness Data and Approval Gating' (Protocol in workflow.md)

## Phase 4: Convex Integration Coverage and Auth Boundaries

- [ ] Task: Add Convex behavior tests for dev approval functions
  - [ ] Test unreviewed component appears in queue
  - [ ] Test approving stores summary and review history
  - [ ] Test content changes make approval stale
  - [ ] Test needs-changes comments appear in LLM audit context

- [ ] Task: Strengthen review mutation trust boundary
  - [ ] Evaluate deriving reviewer identity inside the trusted server/Convex boundary
  - [ ] Keep route-level `requireDeveloperRequestClaims` in place
  - [ ] Document any remaining internal-function auth assumptions
  - [ ] Add regression tests for unauthorized API access

- [ ] Task: Conductor - Phase Completion Verification 'Convex Integration Coverage and Auth Boundaries' (Protocol in workflow.md)

## Phase 5: Documentation and Status Reconciliation

- [ ] Task: Update developer documentation
  - [ ] Update approval workflow notes with real queue coverage and hash behavior
  - [ ] Document remaining manual-review limitations, if any
  - [ ] Confirm LLM repair restrictions remain explicit

- [ ] Task: Reconcile Conductor records
  - [ ] Mark moved/deferred items in the original component-approval plan coherently
  - [ ] Update `conductor/tech-debt.md` for resolved approval items
  - [ ] Update `conductor/current_directive.md` with the next priority
  - [ ] Update `conductor/tracks.md` with final track status

- [ ] Task: Final quality gates
  - [ ] Run `npm run lint`
  - [ ] Run relevant component/API/Convex tests
  - [ ] Run `npm run build` if route, Convex, or generated types change

- [ ] Task: Conductor - Phase Completion Verification 'Documentation and Status Reconciliation' (Protocol in workflow.md)
