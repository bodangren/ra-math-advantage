# Implementation Plan: GBF Sequence and TLAC 3.0 Mapping

**Track type:** feature

**Depends on:** `danielson-proficiency-graph_20260819`

## Phase 1: Define the Data

- [x] Record the supplied sources and page counts.
- [x] Record the five phases and both ordered paths.
- [x] Record direct and inferred TLAC mappings.
- [x] Record the 13 unsequenced skills.

## Phase 2: Test the Behavior

- [x] Test the phase, path, step, mapping, and gap counts.
- [x] Test assignment authorization and same-assignment retry.
- [x] Test parallel progress and rating rules.
- [x] Test report and walkthrough-priority integration.

## Phase 3: Implement the Minimum Flow

- [x] Add the app-owned sequence and mapping data.
- [x] Add one current-assignment table and teacher pointer.
- [x] Add progress to teacher and leadership reports.
- [x] Add current-phase priority to the walkthrough queue.
- [x] Keep SRS as the only due-date scheduler.

## Phase 4: Remove Excess Scope

- [x] Remove source hashes.
- [x] Remove graph release and registry code.
- [x] Remove edge candidates and edge review states.
- [x] Remove release IDs from assignments and reports.
- [x] Keep only behavior tests that protect the current product flow.
