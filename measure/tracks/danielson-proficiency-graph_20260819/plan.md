# Implementation Plan: Danielson Proficiency Graph and Scheduling

**Track type:** feature

**Depends on:** `danielson-app-foundation_20260819`

**Pipeline:** Contract and Schema → Test → Implement → Generate Docs and Doctor

## Phase 1: Contract and Schema Definition

- [x] Task 1.1: Define the app-owned source data
    - [x] Record the Danielson 2022 source and license boundary
    - [x] Record the 63 standalone TLAC techniques
    - [x] Define stable skill IDs and source labels
- [x] Task 1.2: Define the app-owned graph contract
    - [x] Map product terms to existing node kinds
    - [x] Define stable IDs and `contains` edge rules
    - [x] Reserve GBF prerequisite ownership for Track 6
- [x] Task 1.3: Define the teacher-proficiency evidence contract
    - [x] Define rated and `not_enough_evidence` outcomes
    - [x] Define source, target, time, version, provenance, and idempotency fields
    - [x] Keep comments and responses outside the evidence contract
- [x] Task 1.4: Define rating and formal-observation adapters
    - [x] Define the point and SRS rating maps
    - [x] Define Q1 component fan-out with shared provenance
    - [x] Define direct walkthrough target behavior
- [x] Task 1.5: Define KST and SRS persistence ports
    - [x] Reuse canonical card, review-log, proficiency, and graph interfaces
    - [x] Define the 180-day stable-skill interval cap
    - [x] Define priority projections for Track 3
- [x] Task 1.6: Measure - User Manual Verification 'Phase 1: Contract and Schema Definition' (Protocol in workflow.md)
    - User directed full-track continuation on 2026-08-19.

## Phase 2: Test

- [x] Task 2.1: Write source-data and graph Red tests
    - [x] Test exact Danielson and TLAC counts
    - [x] Test source labels and stable IDs
    - [x] Reject duplicate, dangling, invalid, and cyclic structures
- [x] Task 2.2: Write rating-map and proficiency Red tests
    - [x] Test `1 → 70`, `2 → 80`, `3 → 90`, and `4 → 100`
    - [x] Test the four SRS rating mappings
    - [x] Test that one rating below 3 remains visible and blocks all-proficient status
- [x] Task 2.3: Write no-evidence adversarial tests
    - [x] Snapshot proficiency, KST, and SRS state before and after the event
    - [x] Prove byte-equivalence and zero downstream writes
- [x] Task 2.4: Write provenance and fan-out Red tests
    - [x] Test Q1 fan-out to all component child skills
    - [x] Test one shared observation ID and provenance group
    - [x] Test direct walkthrough updates only for rated targets
- [x] Task 2.5: Write idempotency, scheduling, and comment-isolation tests
    - [x] Test replay, conflict, deterministic time, and the 180-day cap
    - [x] Inject comments and prove that all proficiency and scheduling outputs remain unchanged
- [x] Task 2.6: Measure - User Manual Verification 'Phase 2: Test' (Protocol in workflow.md)
    - User directed full-track continuation on 2026-08-19.

## Phase 3: Implement [checkpoint: 7e733a0]

- [x] Task 3.1: Implement the content import — `7e733a0`
    - [x] Create app-owned source data and normalized graph data
    - [x] Keep the sibling project out of the runtime path
- [x] Task 3.2: Implement graph validation and projections — `7e733a0`
    - [x] Reuse the canonical graph schemas and validation functions
    - [x] Expose role-safe projections instead of raw graph files
- [x] Task 3.3: Implement the proficiency evidence adapter — `7e733a0`
    - [x] Normalize and persist idempotent evidence outcomes
    - [x] Apply the raw-rating, point, and SRS mapping rules
    - [x] Exclude all comment content
- [x] Task 3.4: Implement Q1 and walkthrough evidence projection — `7e733a0`
    - [x] Fan out Q1 component evidence with shared provenance
    - [x] Limit walkthrough evidence to rated targets
- [x] Task 3.5: Implement app-owned KST and SRS adapters — `7e733a0`
    - [x] Connect app persistence to canonical card and review-log ports
    - [x] Produce due, overdue, proficiency, and evidence-gap projections
    - [x] Enforce the stable-skill interval cap
- [x] Task 3.6: Measure - User Manual Verification 'Phase 3: Implement' — user directed full-track continuation

## Phase 4: Generate Docs and Doctor [checkpoint: 7e733a0]

- [x] Task 4.1: Run focused and workspace quality gates — `7e733a0`
    - [x] Run graph, evidence, KST, SRS, coverage, lint, typecheck, and build gates
    - [x] Run deterministic replay and boundary tests
- [x] Task 4.2: Generate source and architecture facts — `7e733a0`
    - [x] Generate graph inventory and dependency facts
    - [x] Run `npm run generate`
- [x] Task 4.3: Run validation and Measure Doctor — `7e733a0`
    - [x] Run graph validation, monorepo boundaries, inventory parity, and `npm run doctor`
    - [x] Confirm that the active student evidence contract did not change
- [x] Task 4.4: Complete the independent final review — `7e733a0`
    - [x] Review the implementation against the specification and plan
    - [x] Correct authorization, idempotency, event-order, SRS, KST, source, and write-scope findings
    - [x] Confirm that no actionable finding remains
- [x] Task 4.5: Measure - User Manual Verification 'Phase 4: Generate Docs and Doctor' — user directed full-track continuation
