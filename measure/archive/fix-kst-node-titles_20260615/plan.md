# Implementation Plan: Fix KST Worked-Example Node Titles

## Phase 1: Fix the Parser

- [x] Task 1.1: Update `parseWorkedExamplesCell()` in `parser.ts` to split semicolon-separated titles per example number
- [x] Task 1.2: Update parser test assertions — 34/34 pass
- [x] Task 1.3: Assembler tests — 18/18 pass

## Phase 2: Eliminate ALL Group Titles from Class Period Plans

- [x] Task 2.1: Systematic audit of all 9 class period plans against 52 lesson source files — found 77 mismatches
- [x] Task 2.2: Fixed 53 cells across all 9 modules (12 + 5 + 5 + 1 + 2 + 6 + 13 + 2 + 7)
- [x] Task 2.3: Fixed 2 additional edge cases manually (4-2 Example 6, 8-2 Example 2)
- [x] Task 2.4: Final audit: ZERO mismatches — all class period plan titles match lesson source headings

## Phase 3: Regenerate All KST Artifacts

- [x] Task 3.1: Regenerated `draft-nodes.json` (526 nodes)
- [x] Task 3.2: Patched `nodes.json` and 9 per-module `nodes.json` files (250+ titles)
- [x] Task 3.3: Regenerated `activity-map.json` (655 activities) and `class-period-packages/module-*.json` (180 packages)
- [x] Task 3.4: Final verification: 237/237 nodes with source titles match (0 mismatches); 23 nodes from lessons without standard example headings (source gap, not title bug)

## Verification

- `npx vitest run` in `packages/math-content`: 290/306 pass (16 pre-existing IM1 failures)
- Parser: 34/34 pass
- Assembler: 18/18 pass
