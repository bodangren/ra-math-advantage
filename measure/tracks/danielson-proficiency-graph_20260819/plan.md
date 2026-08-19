# Implementation Plan: Danielson Proficiency Graph and Scheduling

**Track type:** feature

**Depends on:** `danielson-app-foundation_20260819`

**Pipeline:** Contract and Schema → Test → Implement → Generate Docs and Doctor

## Phase 1: Contract and Schema Definition

- [ ] Task 1.1: Freeze the source and import manifests
    - [ ] Record the Danielson 2022 source and license boundary
    - [ ] Inventory both sibling technique datasets and record hashes
    - [ ] Define the reconciliation and review-status rules
- [ ] Task 1.2: Define the app-owned graph contract
    - [ ] Map product terms to existing node kinds
    - [ ] Define stable IDs and `contains` edge rules
    - [ ] Reserve GBF prerequisite ownership for Track 6
- [ ] Task 1.3: Define the teacher-proficiency evidence contract
    - [ ] Define rated and `not_enough_evidence` outcomes
    - [ ] Define source, target, time, version, provenance, and idempotency fields
    - [ ] Keep comments and responses outside the evidence contract
- [ ] Task 1.4: Define rating and formal-observation adapters
    - [ ] Define the point and SRS rating maps
    - [ ] Define Q1 component fan-out with shared provenance
    - [ ] Define direct walkthrough target behavior
- [ ] Task 1.5: Define KST and SRS persistence ports
    - [ ] Reuse canonical card, review-log, proficiency, and graph interfaces
    - [ ] Define the 180-day stable-skill interval cap
    - [ ] Define priority projections for Track 3
- [ ] Task 1.6: Measure - User Manual Verification 'Phase 1: Contract and Schema Definition' (Protocol in workflow.md)

## Phase 2: Test

- [ ] Task 2.1: Write source-manifest and graph Red tests
    - [ ] Test exact Danielson counts and reviewed technique reconciliation
    - [ ] Test source labels, hashes, stable IDs, and review states
    - [ ] Reject duplicate, dangling, invalid, and cyclic structures
- [ ] Task 2.2: Write rating-map and proficiency Red tests
    - [ ] Test `1 → 70`, `2 → 80`, `3 → 90`, and `4 → 100`
    - [ ] Test the four SRS rating mappings
    - [ ] Test that one rating below 3 remains visible and blocks all-proficient status
- [ ] Task 2.3: Write no-evidence adversarial tests
    - [ ] Snapshot proficiency, KST, and SRS state before and after the event
    - [ ] Prove byte-equivalence and zero downstream writes
- [ ] Task 2.4: Write provenance and fan-out Red tests
    - [ ] Test Q1 fan-out to all component child skills
    - [ ] Test one shared observation ID and provenance group
    - [ ] Test direct walkthrough updates only for rated targets
- [ ] Task 2.5: Write idempotency, scheduling, and comment-isolation tests
    - [ ] Test replay, conflict, deterministic time, and the 180-day cap
    - [ ] Inject comments and prove that all proficiency and scheduling outputs remain unchanged
- [ ] Task 2.6: Measure - User Manual Verification 'Phase 2: Test' (Protocol in workflow.md)

## Phase 3: Implement

- [ ] Task 3.1: Implement the reviewed content import
    - [ ] Create app-owned source manifests and normalized graph data
    - [ ] Preserve unresolved mappings in a review queue
- [ ] Task 3.2: Implement graph validation and projections
    - [ ] Reuse the canonical graph schemas and validation functions
    - [ ] Expose role-safe projections instead of raw graph files
- [ ] Task 3.3: Implement the proficiency evidence adapter
    - [ ] Normalize and persist idempotent evidence outcomes
    - [ ] Apply the raw-rating, point, and SRS mapping rules
    - [ ] Exclude all comment content
- [ ] Task 3.4: Implement Q1 and walkthrough evidence projection
    - [ ] Fan out Q1 component evidence with shared provenance
    - [ ] Limit walkthrough evidence to rated targets
- [ ] Task 3.5: Implement app-owned KST and SRS adapters
    - [ ] Connect app persistence to canonical card and review-log ports
    - [ ] Produce due, overdue, proficiency, and evidence-gap projections
    - [ ] Enforce the stable-skill interval cap
- [ ] Task 3.6: Measure - User Manual Verification 'Phase 3: Implement' (Protocol in workflow.md)

## Phase 4: Generate Docs and Doctor

- [ ] Task 4.1: Run focused and workspace quality gates
    - [ ] Run graph, evidence, KST, SRS, coverage, lint, typecheck, and build gates
    - [ ] Run deterministic replay and boundary tests
- [ ] Task 4.2: Generate source and architecture facts
    - [ ] Generate graph inventory, provenance, review-queue, and dependency facts
    - [ ] Run `npm run generate`
- [ ] Task 4.3: Run validation and Measure Doctor
    - [ ] Run graph validation, monorepo boundaries, inventory parity, and `npm run doctor`
    - [ ] Confirm that the active student evidence contract did not change
- [ ] Task 4.4: Measure - User Manual Verification 'Phase 4: Generate Docs and Doctor' (Protocol in workflow.md)
