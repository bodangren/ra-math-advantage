# Implementation Plan: Leadership Portfolio and Teacher Reports

**Track type:** feature

**Depends on:** Tracks 1–3 of the Danielson Teacher Growth program

**Pipeline:** Contract and Schema → Test → Implement → Generate Docs and Doctor

## Phase 1: Contract and Schema Definition [checkpoint: 93d3fa7]

- [x] Task 1.1: Define portfolio and attention projections — `93d3fa7`
    - [x] Define the compact teacher row and attention reasons
    - [x] Define deterministic ordering, pagination, and neutral unavailable states
- [x] Task 1.2: Define teacher drill-down projections — `93d3fa7`
    - [x] Separate official formal ratings from current proficiency
    - [x] Define component, skill, evidence, amendment, IP, GBF, and due sections
- [x] Task 1.3: Define public and private comment contracts — `93d3fa7`
    - [x] Store visibility as separate record types rather than a mutable toggle
    - [x] Define source observation, author, date, and immutable content
    - [x] Define safe authorized projections
- [x] Task 1.4: Define the teacher-response contract — `93d3fa7`
    - [x] Define one optional final response per submitted observation
    - [x] Define concurrency, visibility, immutability, and no-reply behavior
- [x] Task 1.5: Define privacy and non-interference rules — `93d3fa7`
    - [x] Define subject exclusion and role-scope enforcement
    - [x] Define forbidden fields for teacher, system-administrator, search, summary, notification, and export projections
    - [x] Define read-only report behavior
- [x] Task 1.6: Measure - User Manual Verification 'Phase 1: Contract and Schema Definition' (Protocol in workflow.md)
    - User directed full-track continuation on 2026-08-19.

## Phase 2: Test [checkpoint: f2f1e83]

- [x] Task 2.1: Write portfolio Red tests — `395a1c25`, `58555c8f`
    - [x] Test more than 50 teachers, pagination, compact rows, attention order, and reasons
    - [x] Test neutral IP and GBF states before their source tracks are active
- [x] Task 2.2: Write drill-down and score-integrity Red tests — `395a1c25`, `58555c8f`
    - [x] Test official versus current evidence separation
    - [x] Test raw ratings, derived points, and a below-Proficient blocking component
- [x] Task 2.3: Write comment authorization and isolation Red tests — `58555c8f`
    - [x] Test teacher, HOD, coach, school-head, SLT, system-administrator, self-subject, and cross-organization views
    - [x] Inject comments and prove all proficiency and scheduling outputs remain unchanged
- [x] Task 2.4: Write private-data leak adversarial tests — `58555c8f`
    - [x] Test unauthorized report, search, summary, notification, and export shapes
    - [x] Assert that private text, author, and count are absent before rendering
- [x] Task 2.5: Write teacher-response concurrency Red tests — `58555c8f`, `c9964248`
    - [x] Test one response, concurrent second submission, visibility, and no reply
    - [x] Prove that a response makes no evidence, KST, or SRS write
- [x] Task 2.6: Measure - User Manual Verification 'Phase 2: Test' (Protocol in workflow.md)
    - User directed full-track continuation on 2026-08-19.

## Phase 3: Implement

- [ ] Task 3.1: Implement bounded portfolio queries and presentation
    - [ ] Batch and group source data without one query per teacher
    - [ ] Render compact rows, attention reasons, filters, and pagination
- [ ] Task 3.2: Implement teacher drill-down reports
    - [ ] Render official ratings, current proficiency, history, amendments, and due evidence
    - [ ] Preserve each below-standard component
- [ ] Task 3.3: Implement public and private comments
    - [ ] Persist separate record types
    - [ ] Enforce role scope and self-subject exclusion before returning data
- [ ] Task 3.4: Implement teacher reports and one response
    - [ ] Render only teacher-visible fields
    - [ ] Enforce one final response and no replies
- [ ] Task 3.5: Implement IP and GBF projection seams
    - [ ] Render neutral states before Tracks 5 and 6 publish projections
    - [ ] Keep missing source data out of attention reasons
- [ ] Task 3.6: Measure - User Manual Verification 'Phase 3: Implement' (Protocol in workflow.md)

## Phase 4: Generate Docs and Doctor

- [ ] Task 4.1: Run focused and workspace quality gates
    - [ ] Run reporting, privacy, authorization, concurrency, accessibility, pagination, coverage, lint, typecheck, and build gates
    - [ ] Verify zero report-side proficiency and scheduling writes
- [ ] Task 4.2: Generate route, ownership, and dependency facts
    - [ ] Run `npm run generate`
    - [ ] Confirm public and protected report surfaces in generated facts
- [ ] Task 4.3: Run boundaries and Measure Doctor
    - [ ] Run inventory parity, monorepo boundaries, and `npm run doctor`
    - [ ] Inspect the final data-return shapes for private-field leakage
- [ ] Task 4.4: Measure - User Manual Verification 'Phase 4: Generate Docs and Doctor' (Protocol in workflow.md)
