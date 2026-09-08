# Q21 independent review

## Result

Accept the Q21 application changes with one integration condition. Exclude the `measure/tracks/graph-node-practice-program_20260907/plan.md` formatting hunk from the application patch. The hunk changes indentation outside the Q21 behavior and is not required.

## Projection verification

I compared the current main activity projection with the isolated candidate by `stableActivityId`.

- Both projections contain 181 activity rows.
- Both projections contain the same 181 activity IDs.
- Exactly 32 rows differ.
- Each changed row changes only `srsEligible` from `true` to `false`.
- The 32 rows are the Guided and Independent rows for exactly 16 nodes.
- Each of the 16 nodes has `reviewStatus: "draft"` in `nodes.json` and `draft-nodes.json`.
- No activity props, modes, node IDs, activity IDs, or other fields change.
- The standalone SRS projection contains 88 rows before and after the change. Its complete JSON value is unchanged.

The added graph regression selects the same 16 node IDs. It requires both Guided and Independent rows for each node. It requires all 32 rows to have `srsEligible: false`. The existing full projection equality assertions remain active for the activity map and the standalone SRS input.

## Source assertion verification

The source test changes apply only to `unit-1-topic-1.1.md`.

- The old FRQ keyword assertion still runs for the other 43 assessed topic files.
- The old 80-line assertion still runs for the other 43 assessed topic files.
- The Topic 1.1 replacement checks the official Course and Exam Description source path and PDF pages 39 and 40.
- It checks the exact Learning Objective 1.1.A and Learning Objective 1.1.B text used in the repaired topic file.
- It checks the introductory proficiency limit.
- It checks the source instruction, worked and practice content, application requirement, and remaining-gap sections.
- The planning test checks the exact Passwater page range.
- Existing application-build checks and other course checks remain unchanged.
- No source approval field changes in this Q21 patch.

The HEAD-only source assertion patch contains only the two source test files. `git apply --check` succeeds against current HEAD `88ade22e8408e60479e5643a714c7e093260a9f8`.

## Test evidence

I ran the three focused candidate files directly:

- `curriculum-depth.test.ts`: 337 passed.
- `planning-structure.test.ts`: 2 passed.
- `graph-integrity.test.ts`: 6 passed.
- Total: 345 passed, 0 failed.

The author report also records 373 of 373 curriculum tests, lint, build, and standalone TypeScript checks as passed. I did not repeat those broader gates.

## Integration scope

Apply these application files:

- `apps/pre-calculus/__tests__/curriculum/curriculum-depth.test.ts`
- `apps/pre-calculus/__tests__/curriculum/planning-structure.test.ts`
- `apps/pre-calculus/__tests__/curriculum/graph-integrity.test.ts`
- `apps/pre-calculus/curriculum/skill-graph/projection/practice-v1-activity-map.json`

Do not apply the plan formatting hunk from `/tmp/precalc-q21-current-main-reconciliation.patch`. The Q21 change does not require a change to `projection/srs-input.json`.

Parent count check: there are 58 topic files. The legacy keyword and line-count loops cover 44 assessed topics in Units 1 through 3. After the Topic 1.1 exception, 43 assessed topics remain in those loops. Unit 4 was not part of those loops.
