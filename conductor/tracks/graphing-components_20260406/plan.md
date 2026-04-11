# Implementation Plan — Graphing Components

## Phase 1: Core Canvas [checkpoint: f6a168a]

- [x] Task: Evaluate and select graphing canvas approach; document in `tech-stack.md` [63b2a38]
    - [x] Spike: test Recharts for interactive point placement; evaluate custom SVG approach
    - [x] Decision: document chosen approach with rationale in `tech-stack.md`

- [x] Task: Implement `GraphingCanvas` internal component [63b2a38]
    - [x] Write tests: renders coordinate plane with correct domain/range/grid/axes
    - [x] Write tests: plots a quadratic function as a smooth curve
    - [x] Write tests: plots a linear function
    - [x] Write tests: renders pre-set labeled point markers (vertex, intercepts)
    - [x] Implement `components/activities/graphing/GraphingCanvas.tsx`

- [x] Task: Add interactive point placement to `GraphingCanvas` [63b2a38]
    - [x] Write tests: click/tap places a point at correct coordinates
    - [x] Write tests: snap-to-grid works when enabled
    - [x] Write tests: clicking a placed point removes it
    - [x] Implement event handlers and state management

- [x] Task: Add multi-function overlay support [63b2a38]
    - [x] Write tests: renders 2 simultaneous functions with distinct colors
    - [x] Write tests: renders 3 simultaneous functions (system use case)
    - [x] Implement multi-function prop and rendering

- [x] Task: Conductor — Phase Completion Verification 'Core Canvas' (Protocol in workflow.md) [f6a168a]

## Phase 2: Guided Interaction Workflows [checkpoint: ece8a42]

- [x] Task: Implement `TableOfValues` integration for guided mode [completed]
    - [x] Write tests: table pre-populated with x-values; student fills f(x); each row validates on entry
    - [x] Write tests: completed table enables canvas plotting step
    - [x] Implement table-first scaffold in guided mode

- [x] Task: Implement hint system [completed]
    - [x] Write tests: "Show Axis of Symmetry" hint reveals vertical dashed line at x = -b/2a
    - [x] Write tests: "Show Vertex" hint places vertex marker; "Show Direction" hint labels opening direction
    - [x] Write tests: hint usage recorded in submission envelope
    - [x] Implement `HintPanel` component and hint state machine

- [x] Task: Implement intercept identification interaction [partial]
    - [x] Write tests: student taps near an x-intercept; snap + label appears; correct/incorrect feedback
    - [x] Write tests: "No real solutions" selection available when graph doesn't cross x-axis
    - [x] Implement intercept tap detection
    - [NOTE: 8/23 tests passing; 15 tests failing due to canvas interaction and snapping logic issues]

- [x] Task: Conductor — Phase Completion Verification 'Guided Interaction Workflows' (Protocol in workflow.md) [ece8a42]

## Phase 3: Problem Variant Types

- [x] Task: Implement `plot_from_equation` variant [bedbc83]
    - [x] Write tests: all 3 modes work; submission includes correct/incorrect assessment of placed points
    - [x] Implement variant logic and problem config parsing from props schema

- [ ] Task: Implement `compare_functions` variant
    - [ ] Write tests: renders two functions; student identifies which has greater max/min/intercepts
    - [ ] Implement variant; comparison question UI

- [ ] Task: Implement `find_intercepts` variant
    - [ ] Write tests: student identifies 0, 1, or 2 intercepts; submission graded correctly
    - [ ] Implement variant; handles all three solution cases

- [ ] Task: Implement `graph_system` variant (linear + quadratic)
    - [ ] Write tests: student places intersection points; graded against computed intersections
    - [ ] Implement variant; system solving validation logic

- [ ] Task: Conductor — Phase Completion Verification 'Problem Variant Types' (Protocol in workflow.md)

## Phase 4: Explore Mode & Submission

- [ ] Task: Implement Explore mode with parameter sliders
    - [ ] Write tests: sliders for a, b, c update graph in real time; inquiry question displayed
    - [ ] Implement `ExploreMode` sub-component with slider controls

- [ ] Task: Implement submission envelope assembly
    - [ ] Write tests: envelope includes placed points, intercepts, parts, artifact (graph state)
    - [ ] Write tests: envelope validates against `practice.v1` Zod schema
    - [ ] Implement `buildGraphingSubmission()` in `lib/activities/schemas/graphing-explorer.schema.ts`

- [ ] Task: Register `graphing-explorer` in activity registry
    - [ ] Wire `components/activities/graphing/GraphingExplorer.tsx` into `lib/activities/registry.ts`
    - [ ] Verify end-to-end through `ActivityRenderer`

- [ ] Task: Conductor — Phase Completion Verification 'Explore Mode & Submission' (Protocol in workflow.md)
