# Implementation Plan: GBF Sequence and TLAC 3.0 Edges

**Track type:** feature

**Depends on:** `danielson-proficiency-graph_20260819`

**Source state:** Scope and sequence available; full-book enrichment deferred

**Pipeline:** Contract and Schema → Test → Implement → Generate Docs and Doctor

## Phase 1: Contract and Schema Definition [checkpoint: 3805ba28]

- [x] Task 1.1: Freeze the two supplied PDF sources
    - [x] Record filenames, hashes, visible metadata, and user-provided edition context
    - [x] Record the internal-use and quotation boundary
- [x] Task 1.2: Define the normalized GBF sequence contract
    - [x] Define phase, trajectory, action-step, order, source-page, and version fields
    - [x] Preserve parallel Management and Rigor paths
- [x] Task 1.3: Define direct and inferred TLAC mapping contracts
    - [x] Define rationale, confidence, author, date, and review status
    - [x] Define explicit unsequenced gaps
- [x] Task 1.4: Define support and prerequisite candidate rules
    - [x] Define same-step `supports` candidates
    - [x] Define consecutive-step `prerequisite_for` inference
    - [x] Prohibit default hard gates and unreviewed activation
- [x] Task 1.5: Define assignment and progress projections
    - [x] Define versioned new-teacher track assignments
    - [x] Define phase, proficiency, due-skill, and gap outputs for Track 4
- [x] Task 1.6: Measure - User Manual Verification 'Phase 1: Contract and Schema Definition' (Protocol in workflow.md)
    - User directed full-track continuation on 2026-08-19.

## Phase 2: Test

- [ ] Task 2.1: Write source-manifest and extraction Red tests
    - [ ] Test both hashes and exact phase and trajectory structure
    - [ ] Reject a changed source until a new release is reviewed
- [ ] Task 2.2: Write mapping classification Red tests
    - [ ] Test direct, inferred, and unsequenced states
    - [ ] Require source location and rationale for every inference
- [ ] Task 2.3: Write edge-candidate Red tests
    - [ ] Test `supports` and low- or medium-confidence prerequisite candidates
    - [ ] Reject automatic hard gates, cross-trajectory edges, duplicates, and dangling endpoints
- [ ] Task 2.4: Write draft-isolation and graph-validation tests
    - [ ] Prove that drafts do not change KST, SRS, reports, or assignments
    - [ ] Reject prohibited cycles and invalid endpoints
- [ ] Task 2.5: Write assignment and version-history Red tests
    - [ ] Test one versioned new-teacher assignment and progress projection
    - [ ] Prove that a later release does not rewrite historical records
- [ ] Task 2.6: Measure - User Manual Verification 'Phase 2: Test' (Protocol in workflow.md)

## Phase 3: Implement

- [ ] Task 3.1: Implement source extraction and manifests
    - [ ] Normalize the two trajectories and action-step order
    - [ ] Persist source metadata and hashes
- [ ] Task 3.2: Implement reviewed TLAC mapping data
    - [ ] Encode the approved direct and inferred mappings
    - [ ] Generate the unsequenced gap list
- [ ] Task 3.3: Implement candidate edge generation and review
    - [ ] Generate support and prerequisite candidates from approved rules
    - [ ] Add review, activation, rejection, and release states
- [ ] Task 3.4: Integrate approved edges with Track 2
    - [ ] Add only approved edges to KST graph releases
    - [ ] Keep SRS as the only due-date scheduler
- [ ] Task 3.5: Implement assignments and Track 4 progress projections
    - [ ] Assign versioned Management and Rigor paths
    - [ ] Project current phase, proficiency, due skills, and gaps
- [ ] Task 3.6: Measure - User Manual Verification 'Phase 3: Implement' (Protocol in workflow.md)

## Phase 4: Generate Docs and Doctor

- [ ] Task 4.1: Run focused and workspace quality gates
    - [ ] Run source, mapping, graph, KST, SRS, assignment, coverage, lint, typecheck, and build gates
    - [ ] Run determinism and historical-version tests
- [ ] Task 4.2: Generate source, mapping, graph, and gap reports
    - [ ] Generate review queues and release facts
    - [ ] Run `npm run generate`
- [ ] Task 4.3: Run graph validation, boundaries, and Measure Doctor
    - [ ] Run graph validation, inventory parity, monorepo boundaries, and `npm run doctor`
    - [ ] Confirm that no source-gated coaching feature entered the implementation
- [ ] Task 4.4: Measure - User Manual Verification 'Phase 4: Generate Docs and Doctor' (Protocol in workflow.md)
