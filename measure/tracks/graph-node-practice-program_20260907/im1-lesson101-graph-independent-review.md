# G51 Lesson 10-1 graph independent review

## Verdict

Accept the corrected frozen graph candidate.

Candidate: `/tmp/im1-g51-source-head-kk83le7a`

Patch: `/tmp/im1-g51-graph-final.patch`

## Corrective review

The Problem 20 construct atom now keeps only its applicable incidence boundary. It states that the axioms do not require all points to lie on lines. It does not mention curved lines.

The Problems 17 and 21 candidate-model atom now states the curved-line boundary. It says that curved lines are allowed because the stated axioms do not define a line as straight. It also keeps Problem 17 as the full three-route system and Problem 21 as the selected failing diagram plus cited axiom.

The focused test checks that the curved-line text is present on the Problem 21 atom and absent from the Problem 20 atom.

The edge-review queue now changes only the `math.im1.edge.1192` row and `lowConfidencePrerequisites` count. Both unrelated rotation titles retain literal `°` characters. No unrelated queue bytes change.

## Full semantic result

The candidate adds five draft, inactive capability atoms. It reuses the existing axiom-role skill for the Problem 19 role mapping. It does not add a duplicate role-mapping atom. The conclusion atom covers only the separately observed conclusion derivation.

The conclusion atom requires all stated premises, separate scoring for each requested conclusion, and a uniqueness check before a converse inference. This keeps the average-time and price boundaries.

The Problem 22 atom requires all three judgments. It records two valid conclusions and one invalid conclusion. It requires the invalid-inference explanation.

The graph preserves `math.im1.example.10.1.001` for conclusion derivation and `math.im1.example.10.1.002` for geometry classification. It adds no Mixed Exercises example node.

The two existing broad skill nodes remain approved. Their empty executable mode specifications and six placeholder activity rows are removed. The five new atoms have no activity rows, generator, prerequisite, equivalence, evidence, approval, or readiness claim.

`math.im1.edge.1192` is absent from both edge artifacts, the low-confidence review queue, and both prerequisite projections. The G52 parity test covers the two projection copies.

The count labels are accurate. There are 490 total skill records and 489 non-rejected skill candidates.

## Independent verification

Command:

`npx vitest run __tests__/curriculum/lesson-10-1-capabilities-source.test.ts __tests__/curriculum/lesson-7-4-capabilities-source.test.ts __tests__/curriculum/lesson-7-5-capabilities-source.test.ts __tests__/curriculum/lesson-8-1-capabilities-source.test.ts __tests__/curriculum/lesson-8-2-capabilities-source.test.ts __tests__/curriculum/projected-prerequisites-consistency.test.ts`

Result: 6 files passed. 31 tests passed.

The parent must rerun the full curriculum, seed, lint, build, and TypeScript gates on the corrected freeze.

I made no candidate or main-worktree edit.
