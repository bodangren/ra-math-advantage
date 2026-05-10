# Implementation Plan: Blueprint QA & Authoring Harness

- [ ] **Phase 1: Foundation & Layout**
  - [ ] Create `apps/bus-math-v2/app/(dev)/blueprint-qa/page.tsx` using a client component wrapper.
  - [ ] Create Server Action `fetchGraphData()` in `actions.ts` that reads `nodes.json` and `blueprints.json` via `fs`.
  - [ ] Implement the 3-column UI: Sidebar (Node List), Middle (Inputs + JSON Viewer), Right (Component Preview).

- [ ] **Phase 2: Generator Invocation**
  - [ ] Implement `ExecutionEngine.tsx`.
  - [ ] Add inputs for `Seed` (number) and `Difficulty` (range slider 0.1 to 1.0).
  - [ ] On change (debounced), look up the `generatorKey` from the selected blueprint.
  - [ ] Instantiate the generator and call `.generate({ nodeId, seed, difficulty })`.
  - [ ] Display the JSON output.

- [ ] **Phase 3: Context Mocking**
  - [ ] Create `HarnessSubmissionProvider.tsx` implementing a mock of `PracticeSubmissionContext`.
  - [ ] Add a local grading evaluator that compares the submitted `rawAnswer` against `output.gradingMetadata.partAnswers` (implementing `exact_match` and `numeric_tolerance` locally).

- [ ] **Phase 4: Component Mounting**
  - [ ] Create `RendererPreview.tsx`.
  - [ ] Dynamically resolve the component using the `rendererKey` from the blueprint.
  - [ ] Pass the `generatorOutput` as props.
  - [ ] Render a "Submission Log" panel below the component that displays the payload intercepted by the `HarnessSubmissionProvider`.

- [ ] **Phase 5: UX & Polish**
  - [ ] Add a search bar to the Node List sidebar to filter by skill ID or title.
  - [ ] Add visual indicators (🟢 / 🔴) in the sidebar based on whether the blueprint has a `generatorKey` assigned.