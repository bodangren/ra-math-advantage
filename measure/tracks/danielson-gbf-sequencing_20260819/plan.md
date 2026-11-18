# Implementation Plan: GBF Sequence and TLAC 3.0 Mapping

**Track type:** feature

**Depends on:** `danielson-proficiency-graph_20260819`

## Phase 1: Define the Data

- [x] Record the supplied sources and page counts. [3805ba28]
- [x] Record the five phases and both ordered paths. [3805ba28]
- [x] Record direct and inferred TLAC mappings. [3805ba28]
- [x] Record the 13 unsequenced skills. [3805ba28]

## Phase 2: Test the Behavior

- [x] Test the phase, path, step, mapping, and gap counts. [1ec1e09b]
- [x] Test assignment authorization and same-assignment retry. [4224189c]
- [x] Test parallel progress and rating rules. [1ec1e09b]
- [x] Test report and walkthrough-priority integration. [4224189c]

## Phase 3: Implement the Minimum Flow

- [x] Add the app-owned sequence and mapping data. [237f792a]
- [x] Add one current-assignment table and teacher pointer. [fe54a632]
- [x] Add progress to teacher and leadership reports. [89ce78d5]
- [x] Add current-phase priority to the walkthrough queue. [a7019238]
- [x] Keep SRS as the only due-date scheduler. [237f792a]

## Phase 4: Remove Excess Scope

- [x] Remove source hashes. [2d62eaa9]
- [x] Remove graph release and registry code. [2d62eaa9]
- [x] Remove edge candidates and edge review states. [2d62eaa9]
- [x] Remove release IDs from assignments and reports. [2d62eaa9]
- [x] Keep only behavior tests that protect the current product flow. [2d62eaa9]
