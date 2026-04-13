# Implementation Plan — Graphing Explorer Explore Mode

## Phase 1: Explore Mode with Parameter Sliders

- [ ] Task: Add 'explore' to mode union type and update GraphingExplorerProps interface
    - [ ] Write tests: mode 'explore' is accepted by GraphingExplorer component
    - [ ] Write tests: exploreQuestion and explorationPrompts props are optional and typed correctly
    - [ ] Implement type updates

- [ ] Task: Implement ExploreMode slider controls sub-component
    - [ ] Write tests: sliders render with correct ranges (a: [-5,5], b: [-10,10], c: [-10,10])
    - [ ] Write tests: sliders show current coefficient values
    - [ ] Write tests: reset button restores default values
    - [ ] Write tests: equation preview displays current formula
    - [ ] Implement `ExploreModeControls` component

- [ ] Task: Integrate ExploreMode into GraphingExplorer for 'explore' mode
    - [ ] Write tests: 'explore' mode renders slider controls
    - [ ] Write tests: slider changes update graph in real time
    - [ ] Write tests: exploreQuestion displayed when provided
    - [ ] Write tests: explorationPrompts displayed when provided
    - [ ] Write tests: no Submit button appears in explore mode
    - [ ] Implement explore mode branch in GraphingExplorer render

- [ ] Task: End-to-end verification
    - [ ] Verify component renders within lesson explorer phase context
    - [ ] Run full test suite
    - [ ] Run `npm run lint` and `npm run build`

- [ ] Task: Conductor — Phase Completion Verification