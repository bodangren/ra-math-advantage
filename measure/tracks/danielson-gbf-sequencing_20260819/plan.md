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

## Phase 2: Test [checkpoint: 07c392bb]

- [x] Task 2.1: Write source-manifest and extraction Red tests — `1ec1e09b`, `ae218cec`
    - [x] Test both hashes and exact phase and trajectory structure
    - [x] Reject a changed source until a new release is reviewed
- [x] Task 2.2: Write mapping classification Red tests — `1ec1e09b`, `ae218cec`
    - [x] Test direct, inferred, and unsequenced states
    - [x] Require source location and rationale for every inference
- [x] Task 2.3: Write edge-candidate Red tests — `1ec1e09b`, `ae218cec`, `07c392bb`
    - [x] Test `supports` and low- or medium-confidence prerequisite candidates
    - [x] Reject automatic hard gates, cross-trajectory edges, duplicates, and dangling endpoints
- [x] Task 2.4: Write draft-isolation and graph-validation tests — `1ec1e09b`, `ae218cec`, `07c392bb`
    - [x] Prove that drafts do not change KST, SRS, reports, or assignments
    - [x] Reject prohibited cycles and invalid endpoints
- [x] Task 2.5: Write assignment and version-history Red tests — `4224189c`, `ae218cec`, `07c392bb`
    - [x] Test one versioned new-teacher assignment and progress projection
    - [x] Prove that a later release does not rewrite historical records
- [x] Task 2.6: Measure - User Manual Verification 'Phase 2: Test' (Protocol in workflow.md)
    - User directed full-track continuation on 2026-08-19.

## Phase 3: Implement [checkpoint: 07f632a3]

- [x] Task 3.1: Implement source extraction and manifests — `237f792a`
    - [x] Normalize the two trajectories and action-step order
    - [x] Persist source metadata and hashes
- [x] Task 3.2: Implement reviewed TLAC mapping data — `237f792a`, `9ddf2fa2`
    - [x] Encode the approved direct and inferred mappings
    - [x] Generate the unsequenced gap list
- [x] Task 3.3: Implement candidate edge generation and review — `237f792a`, `9ddf2fa2`, `07f632a3`
    - [x] Generate support and prerequisite candidates from approved rules
    - [x] Add review, activation, rejection, and release states
- [x] Task 3.4: Integrate approved edges with Track 2 — `237f792a`, `9ddf2fa2`, `07f632a3`
    - [x] Add only approved edges to KST graph releases
    - [x] Keep SRS as the only due-date scheduler
- [x] Task 3.5: Implement assignments and Track 4 progress projections — `fe54a632`, `89ce78d5`, `ef23c38c`, `07f632a3`
    - [x] Assign versioned Management and Rigor paths
    - [x] Project current phase, proficiency, due skills, and gaps
- [x] Task 3.6: Measure - User Manual Verification 'Phase 3: Implement' (Protocol in workflow.md)
    - User directed full-track continuation on 2026-08-19.

## Phase 4: Generate Docs and Doctor [checkpoint: e0ef7aa5]

- [x] Task 4.1: Run focused and workspace quality gates
    - [x] Run source, mapping, graph, KST, SRS, assignment, coverage, lint, typecheck, and build gates
    - [x] Run determinism and historical-version tests
- [x] Task 4.2: Generate source, mapping, graph, and gap reports
    - [x] Generate review queues and release facts
    - [x] Run `npm run generate`
- [x] Task 4.3: Run graph validation, boundaries, and Measure Doctor
    - [x] Run graph validation, inventory parity, monorepo boundaries, and `npm run doctor`
    - [x] Confirm that no source-gated coaching feature entered the implementation
- [x] Task 4.4: Measure - User Manual Verification 'Phase 4: Generate Docs and Doctor' (Protocol in workflow.md)
    - User directed full-track continuation on 2026-08-19.
