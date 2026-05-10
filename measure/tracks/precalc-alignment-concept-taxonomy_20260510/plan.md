# Implementation Plan: PreCalc Standards Alignment & Concept Taxonomy

- [ ] **Phase 1: PreCalc Standards Mapping**
  - [ ] Write `scripts/align-precalc-standards.ts` to process a mapping file.
  - [ ] Execute script to update `apps/pre-calculus/curriculum/skill-graph/edges.json`.
  - [ ] Run `npm run validate:graph -w pre-calculus` to ensure structural integrity.

- [ ] **Phase 2: Concept Resolution Engine**
  - [ ] Open `measure/knowledge-space.md` and explicitly document the Concept Aggregator resolution rule.
  - [ ] Open `packages/knowledge-space-practice/src/projections/activity-map.ts`.
  - [ ] Implement the `findChildSkills` and `selectSkill` logic inside the projection loop.
  - [ ] Write a unit test in `projections.test.ts` verifying that passing a concept node correctly outputs a practice row derived from a child skill's blueprint.

- [ ] **Phase 3: Cleanup Concept Blueprints**
  - [ ] Write a one-off script `scripts/remediate-concept-blueprints.ts`.
  - [ ] Read all IM3 `blueprints.json` files, filter out `nodeId`s matching `/\.concept\./`, and rewrite the JSON files.
  - [ ] Execute `projectActivityMap` for IM3 and verify it completes without errors, producing the correct number of mapped activities.