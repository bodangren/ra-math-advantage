# Implementation Plan: Ranked Walkthroughs and Formal Observations

**Track type:** feature

**Depends on:** `danielson-app-foundation_20260819`, `danielson-proficiency-graph_20260819`

**Pipeline:** Contract and Schema → Test → Implement → Generate Docs and Doctor

## Phase 1: Contract and Schema Definition

- [ ] Task 1.1: Define walkthrough and formal-observation schemas
    - [ ] Define draft and submitted records
    - [ ] Define three target outcomes and optional evidence notes
    - [ ] Define Q1 and Q4 record types and observer permissions
- [ ] Task 1.2: Define the ranked queue contract
    - [ ] Define candidate, priority input, reason, and deterministic tie-break fields
    - [ ] Define grouping of Track 2 due skills by teacher
    - [ ] Define the fewer-than-three shortfall result
- [ ] Task 1.3: Define submission and publication transitions
    - [ ] Define draft save, resume, discard, and submit behavior
    - [ ] Define immediate publication and idempotency rules
- [ ] Task 1.4: Define the amendment contract
    - [ ] Define original record, author, reason, changed fields, and event time
    - [ ] Define superseded evidence behavior without double counting
- [ ] Task 1.5: Define annual continuity
    - [ ] Define school-year labels without state reset or record cloning
    - [ ] Define cross-year query and report inputs
- [ ] Task 1.6: Measure - User Manual Verification 'Phase 1: Contract and Schema Definition' (Protocol in workflow.md)

## Phase 2: Test

- [ ] Task 2.1: Write scoped queue Red tests
    - [ ] Test HOD, coach, school-head, SLT, cross-organization, and subject access
    - [ ] Test deterministic ordering and visible reasons
- [ ] Task 2.2: Write three-target Red tests
    - [ ] Test exactly three unique skills and parent components
    - [ ] Test shortfall and duplicate rejection
- [ ] Task 2.3: Write observation lifecycle Red tests
    - [ ] Test recoverable drafts and immediate publication
    - [ ] Test valid ratings, optional notes, and all-no-evidence visits
    - [ ] Prove that no-evidence outcomes make zero Track 2 writes
- [ ] Task 2.4: Write formal-observation Red tests
    - [ ] Test Q1 and Q4 role rules and official-record separation
    - [ ] Test Q1 fan-out provenance through the Track 2 port
- [ ] Task 2.5: Write immutability, amendment, idempotency, and carryover tests
    - [ ] Reject direct update, delete, cross-scope amendment, and conflicting replay
    - [ ] Preserve original bytes and prevent evidence double counting
    - [ ] Prove that the school-year boundary does not reset KST or SRS state
- [ ] Task 2.6: Measure - User Manual Verification 'Phase 2: Test' (Protocol in workflow.md)

## Phase 3: Implement

- [ ] Task 3.1: Implement bounded ranked-queue projections
    - [ ] Reuse Track 2 KST, SRS, proficiency, and evidence-gap outputs
    - [ ] Apply Track 1 scope before ranking
    - [ ] Return deterministic teacher and target reasons
- [ ] Task 3.2: Implement walkthrough drafts and submission
    - [ ] Add recoverable draft persistence
    - [ ] Add the accessible three-target form
    - [ ] Finalize and publish with one idempotent mutation
- [ ] Task 3.3: Implement Q1 and Q4 formal observations
    - [ ] Enforce observer permissions and record types
    - [ ] Send approved evidence through the Track 2 adapter
- [ ] Task 3.4: Implement immutable amendments
    - [ ] Preserve original records and append correction events
    - [ ] Supersede downstream evidence without double counting
- [ ] Task 3.5: Implement annual continuity and bounded history reads
    - [ ] Keep KST and SRS state continuous across year labels
    - [ ] Paginate historical observations and amendments
- [ ] Task 3.6: Measure - User Manual Verification 'Phase 3: Implement' (Protocol in workflow.md)

## Phase 4: Generate Docs and Doctor

- [ ] Task 4.1: Run focused and workspace quality gates
    - [ ] Run queue, form, formal-observation, amendment, carryover, coverage, lint, typecheck, and build gates
    - [ ] Run authorization, idempotency, and accessibility tests
- [ ] Task 4.2: Generate route, schema, ownership, and dependency facts
    - [ ] Run `npm run generate`
    - [ ] Confirm that generated facts contain the observation surfaces
- [ ] Task 4.3: Run boundaries and Measure Doctor
    - [ ] Run inventory parity, monorepo boundaries, and `npm run doctor`
    - [ ] Inspect for unrelated active-track changes
- [ ] Task 4.4: Measure - User Manual Verification 'Phase 4: Generate Docs and Doctor' (Protocol in workflow.md)
