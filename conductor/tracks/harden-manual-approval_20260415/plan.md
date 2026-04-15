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

## Phase 2: Content Hashing and Stale Approval [checkpoint: a6bc0a0]

- [x] Task: Replace placeholder example/practice hashes [73864a2]
  - [x] Write hash stability tests for embedded example and practice target content
  - [x] Include kind, key, props/content, grading config, and deterministic solution config
  - [x] Exclude approval metadata, reviewer IDs, timestamps, and review history
  - [x] Remove `"todo-hash-for-example-practice"` from `convex/dev.ts`

- [x] Task: Verify stale detection for all review kinds [73864a2]
  - [x] Write tests proving activity content changes become stale
  - [x] Write tests proving example content changes become stale
  - [x] Write tests proving practice props/config changes become stale
  - [x] Ensure unchanged content remains approved and not stale

- [x] Task: Conductor - Phase Completion Verification 'Content Hashing and Stale Approval' (Protocol in workflow.md) [a6bc0a0]

## Phase 3: Harness Data and Approval Gating [checkpoint: ab3e604]

- [x] Task: Feed harnesses from real stored data [ab3e604]
  - [x] Write component tests for activity harness rendering stored props
  - [x] Write component tests for example harness rendering selected content/modes
  - [x] Write component tests for practice harness using selected practice props
  - [x] Remove hardcoded sample-only behavior where real target data is available

- [x] Task: Enforce manual checklist gating before approval [ab3e604]
  - [x] Write tests that `approved` is disabled until required harness checks are complete
  - [x] Require teaching/guided/practice review for examples where applicable
  - [x] Require correct/incorrect attempt inspection for practice where feasible
  - [x] Keep `needs_changes` and `rejected` available with required comments

- [x] Task: Conductor - Phase Completion Verification 'Harness Data and Approval Gating' (Protocol in workflow.md) [ab3e604]

## Phase 4: Convex Integration Coverage and Auth Boundaries [checkpoint: d6fe166]

- [x] Task: Add Convex behavior tests for dev approval functions
  - [x] Test unreviewed component appears in queue
  - [x] Test approving stores summary and review history
  - [x] Test content changes make approval stale
  - [x] Test needs-changes comments appear in LLM audit context

- [x] Task: Strengthen review mutation trust boundary
  - [x] Evaluate deriving reviewer identity inside the trusted server/Convex boundary
  - [x] Keep route-level `requireDeveloperRequestClaims` in place
  - [x] Document any remaining internal-function auth assumptions
  - [x] Add regression tests for unauthorized API access

- [x] Task: Conductor - Phase Completion Verification 'Convex Integration Coverage and Auth Boundaries' (Protocol in workflow.md)

## Phase 5: Documentation and Status Reconciliation

- [x] Task: Update developer documentation [9c3052e]
  - [x] Update approval workflow notes with real queue coverage and hash behavior
  - [x] Document remaining manual-review limitations, if any
  - [x] Confirm LLM repair restrictions remain explicit

- [x] Task: Reconcile Conductor records [38ab9c2]
  - [x] Mark moved/deferred items in the original component-approval plan coherently
  - [x] Update `conductor/tech-debt.md` for resolved approval items
  - [x] Update `conductor/current_directive.md` with the next priority
  - [x] Update `conductor/tracks.md` with final track status

- [x] Task: Final quality gates
  - [x] Run `npm run lint`
  - [x] Run relevant component/API/Convex tests
  - [x] Run `npm run build` if route, Convex, or generated types change

- [x] Task: Conductor - Phase Completion Verification 'Documentation and Status Reconciliation' (Protocol in workflow.md) [797fee0]
