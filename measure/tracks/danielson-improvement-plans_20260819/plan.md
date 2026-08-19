# Implementation Plan: Performance Improvement Plans

**Track type:** feature

**Depends on:** Tracks 1–4 of the Danielson Teacher Growth program

**Source state:** Current PIP form available from the user

**Pipeline:** Contract and Schema → Test → Implement → Generate Docs and Doctor

## Phase 1: Contract and Schema Definition

- [ ] Task 1.1: Freeze the normalized PIP source contract
    - [ ] Preserve each supplied form field and fixed text section
    - [ ] Define source version and content hash for the normalized form
- [ ] Task 1.2: Define plan and target schemas
    - [ ] Define teacher, department, supervisor, dates, narrative fields, targets, and expected standards
    - [ ] Define stable Danielson and GBF or TLAC source references
- [ ] Task 1.3: Define the lifecycle and authorization matrix
    - [ ] Define proposed, active, and closed states
    - [ ] Define supervisor proposal and SLT approval and closure permissions
    - [ ] Define one-active-plan and organization-scope rules
- [ ] Task 1.4: Define acknowledgment and version contracts
    - [ ] Define teacher and supervisor acknowledgment records
    - [ ] Define immutable approval and material-revision behavior
- [ ] Task 1.5: Define cadence, progress, and report projections
    - [ ] Define seven-day target intervals and high priority
    - [ ] Define on-track, off-track, days-remaining, and outcome fields
    - [ ] Exclude no-evidence outcomes and all comments
- [ ] Task 1.6: Measure - User Manual Verification 'Phase 1: Contract and Schema Definition' (Protocol in workflow.md)

## Phase 2: Test

- [ ] Task 2.1: Write source and schema Red tests
    - [ ] Test every supplied form field, required value, date, target, and fixed text section
    - [ ] Reject an unreviewed source change
- [ ] Task 2.2: Write proposal and approval authorization Red tests
    - [ ] Test HOD, coach, school-head, SLT, system-administrator, teacher, and cross-organization cases
    - [ ] Prove that a proposal is inactive until SLT approval
- [ ] Task 2.3: Write immutable version and acknowledgment Red tests
    - [ ] Reject update or delete of an approved plan
    - [ ] Test a new version and one teacher and supervisor acknowledgment
- [ ] Task 2.4: Write cadence and progress Red tests
    - [ ] Test seven-day active-target intervals and evidence due status
    - [ ] Test rated evidence and no-evidence or comment non-interference
- [ ] Task 2.5: Write closure and no-automated-discipline tests
    - [ ] Test both closure outcomes, actor, time, note, and report projection
    - [ ] Prove that no retention or disciplinary recommendation is produced
- [ ] Task 2.6: Measure - User Manual Verification 'Phase 2: Test' (Protocol in workflow.md)

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
