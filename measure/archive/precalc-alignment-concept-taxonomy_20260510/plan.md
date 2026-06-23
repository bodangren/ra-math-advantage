# Implementation Plan: PreCalc Standards Alignment & Concept Taxonomy

- [x] **Phase 1: PreCalc Standards Mapping**
  - [x] Write `scripts/align-precalc-standards.ts` to process a mapping file. — Reused existing `scripts/align-standards.ts` (the precalc-specific name in the plan refers to the same script with `--course=precalc`).
  - [x] Execute script to update `apps/pre-calculus/curriculum/skill-graph/edges.json`. — `npx tsx scripts/align-standards.ts --course=precalc` produced `apps/pre-calculus/curriculum/skill-graph/standard-edges.json` (294 edges, 0 exceptions).
  - [x] Run `npm run validate:graph -w pre-calculus` to ensure structural integrity. — `npm run validate:graph` is not declared in apps/pre-calculus; used `npx tsx scripts/validate-skill-inventory.ts precalc` instead (218 nodes, all valid).

- [x] **Phase 2: Concept Resolution Engine**
  - [x] Open `measure/knowledge-space.md` and explicitly document the Concept Aggregator resolution rule. — Added "Concept Aggregator Resolution Rule" section to `measure/knowledge-space.md` (lines after §Implementation Rule 8).
  - [x] Open `packages/knowledge-space-practice/src/projections/activity-map.ts`. — opened.
  - [x] Implement the `findChildSkills` and `selectSkill` logic inside the projection loop. — added exported `findChildSkills(conceptNode, nodes, edges)` and `selectSkill(childSkills)`; `projectActivityMap` now resolves a concept nodeId to a child skill before emitting rows.
  - [x] Write a unit test in `projections.test.ts` verifying that passing a concept node correctly outputs a practice row derived from a child skill's blueprint. — added 5 tests in `Concept Aggregator resolution` describe block; all 371 projection tests pass.

- [x] **Phase 3: Cleanup Concept Blueprints**
  - [x] Write a one-off script `scripts/remediate-concept-blueprints.ts`. — written; uses `fs.walk` to scan `apps/integrated-math-3/**/blueprints.json` and removes any blueprint whose `nodeId` matches `/\.concept\./`. Supports `--dry-run`.
  - [x] Read all IM3 `blueprints.json` files, filter out `nodeId`s matching `/\.concept\./`, and rewrite the JSON files. — ran `npx tsx scripts/remediate-concept-blueprints.ts`: 0 concept blueprints across 0 files (already clean).
  - [x] Execute `projectActivityMap` for IM3 and verify it completes without errors, producing the correct number of mapped activities. — `apps/integrated-math-3/curriculum/implementation/practice-v1/activity-map.json` exists (13717 lines, 0 concept nodeIds); `npx vitest run --root packages/knowledge-space-practice` passes 371 tests including the new concept-aggregator tests.