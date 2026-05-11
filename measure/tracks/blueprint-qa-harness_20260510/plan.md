# Implementation Plan: Blueprint QA & Authoring Harness

- [x] **Phase 1: Foundation & Layout**
  - [x] Create `apps/bus-math-v2/app/(dev)/blueprint-qa/page.tsx` using a client component wrapper.
  - [x] Create Server Action `fetchGraphData()` in `actions.ts` that reads `nodes.json` and `blueprints.json` via `fs`.
  - [x] Implement the 3-column UI: Sidebar (Node List), Middle (Inputs + JSON Viewer), Right (Component Preview).

- [x] **Phase 2: Generator Invocation**
  - [x] Implement `GeneratorPanel.tsx` (serving as the ExecutionEngine).
  - [x] Add inputs for `Seed` (number) and `Difficulty` (range slider 0.1 to 1.0).
  - [x] On change (debounced), look up the `generatorKey` from the selected blueprint.
  - [x] Instantiate the generator and call `.generate({ nodeId, seed, difficulty })`.
  - [x] Display the JSON output.

- [x] **Phase 3: Context Mocking**
  - [x] Create `RendererPreview.tsx` with a `MockSubmissionContext` implementing a mock of `PracticeSubmissionContext`.
  - [x] Add a local grading evaluator that compares the submitted `rawAnswer` against `output.gradingMetadata.partAnswers` (implementing `exact_match` and `numeric_tolerance` locally).

- [x] **Phase 4: Component Mounting**
  - [x] RendererPreview includes dynamic component loading via `getActivityComponent` using the `rendererKey` from the blueprint.
  - [x] Pass the `generatorOutput.data` as props.
  - [x] Render a "Submission Log" panel below the component that displays the payload intercepted by the `MockSubmissionContext`.

- [x] **Phase 5: UX & Polish**
  - [x] Add a search bar to the Node List sidebar to filter by skill ID or title.
  - [x] Add visual indicators (green/red dot) in the sidebar based on whether the blueprint/skill has a `generatorKey` assigned.

[checkpoint: df1afb6]
