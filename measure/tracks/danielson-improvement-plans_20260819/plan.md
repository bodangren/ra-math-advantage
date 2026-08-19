# Implementation Plan: Performance Improvement Plans

**Track type:** feature

**Depends on:** Tracks 1–4 of the Danielson Teacher Growth program

**Source state:** Current PIP form available from the user

**Pipeline:** Contract and Schema → Test → Implement → Generate Docs and Doctor

## Phase 1: Contract and Schema Definition [checkpoint: f9ab7ef]

- [x] Task 1.1: Freeze the normalized PIP source contract
    - [x] Preserve each supplied form field and fixed text section
    - [x] Define source version and content hash for the normalized form
- [x] Task 1.2: Define plan and target schemas
    - [x] Define teacher, department, supervisor, dates, narrative fields, targets, and expected standards
    - [x] Define stable Danielson and GBF or TLAC source references
- [x] Task 1.3: Define the lifecycle and authorization matrix
    - [x] Define proposed, active, and closed states
    - [x] Define supervisor proposal and SLT approval and closure permissions
    - [x] Define one-active-plan and organization-scope rules
- [x] Task 1.4: Define acknowledgment and version contracts
    - [x] Define teacher and supervisor acknowledgment records
    - [x] Define immutable approval and material-revision behavior
- [x] Task 1.5: Define cadence, progress, and report projections
    - [x] Define seven-day target intervals and high priority
    - [x] Define on-track, off-track, days-remaining, and outcome fields
    - [x] Exclude no-evidence outcomes and all comments
- [x] Task 1.6: Measure - User Manual Verification 'Phase 1: Contract and Schema Definition' (Protocol in workflow.md)
    - User directed full-track continuation on 2026-08-19.

## Phase 2: Test [checkpoint: 9f4b078, ce125841]

- [x] Task 2.1: Write source and schema Red tests
    - [x] Test every supplied form field, required value, date, target, and fixed text section
    - [x] Reject an unreviewed source change
- [x] Task 2.2: Write proposal and approval authorization Red tests
    - [x] Test HOD, coach, school-head, SLT, system-administrator, teacher, and cross-organization cases
    - [x] Prove that a proposal is inactive until SLT approval
- [x] Task 2.3: Write immutable version and acknowledgment Red tests
    - [x] Reject update or delete of an approved plan
    - [x] Test a new version and one teacher and supervisor acknowledgment
- [x] Task 2.4: Write cadence and progress Red tests
    - [x] Test seven-day active-target intervals and evidence due status
    - [x] Test rated evidence and no-evidence or comment non-interference
- [x] Task 2.5: Write closure and no-automated-discipline tests
    - [x] Test both closure outcomes, actor, time, note, and report projection
    - [x] Prove that no retention or disciplinary recommendation is produced
- [x] Task 2.6: Measure - User Manual Verification 'Phase 2: Test' (Protocol in workflow.md)
    - User directed full-track continuation on 2026-08-19.

## Phase 3: Implement

- [ ] Task 3.1: Implement PIP persistence and source versioning
    - [ ] Add app-owned plans, versions, targets, acknowledgments, and lifecycle events
    - [ ] Add bounded indexes and stable source references
- [ ] Task 3.2: Implement proposal and SLT approval
    - [ ] Build the accessible source-aligned proposal form
    - [ ] Enforce scope and activate only through an audited approval mutation
- [ ] Task 3.3: Implement immutable versions and acknowledgments
    - [ ] Freeze approved versions and create revisions as new proposals
    - [ ] Record teacher and supervisor acknowledgment without a legal-signature claim
- [ ] Task 3.4: Implement target cadence and evidence progress
    - [ ] Apply high priority and seven-day intervals through Track 2 SRS policy
    - [ ] Derive progress from valid rated evidence only
- [ ] Task 3.5: Implement Track 4 projection and SLT closure
    - [ ] Show plan status, days, targets, evidence, support, criteria, and outcome
    - [ ] Record successful or insufficient-improvement closure without an automated recommendation
- [ ] Task 3.6: Measure - User Manual Verification 'Phase 3: Implement' (Protocol in workflow.md)

## Phase 4: Generate Docs and Doctor

- [ ] Task 4.1: Run focused and workspace quality gates
    - [ ] Run PIP source, authorization, version, cadence, progress, closure, accessibility, coverage, lint, typecheck, and build gates
    - [ ] Run private-data and no-automated-discipline adversarial tests
- [ ] Task 4.2: Generate schema, route, ownership, and source facts
    - [ ] Run `npm run generate`
    - [ ] Confirm that generated facts identify restricted PIP surfaces
- [ ] Task 4.3: Run boundaries and Measure Doctor
    - [ ] Run inventory parity, monorepo boundaries, and `npm run doctor`
    - [ ] Inspect the final audit and immutable-record behavior
- [ ] Task 4.4: Measure - User Manual Verification 'Phase 4: Generate Docs and Doctor' (Protocol in workflow.md)
