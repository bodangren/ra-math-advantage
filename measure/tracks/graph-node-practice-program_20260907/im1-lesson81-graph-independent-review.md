# IM1 Lesson 8-1 graph candidate independent review

## Decision

Reject this revision for one source-scope defect. The graph structure and inactive lifecycle are otherwise consistent with the accepted proposal.

## Finding

### P1 — The contextual domain-and-range node claims Problem 15 as direct capability evidence

The node `math.im1.skill.8.1.determine-a-context-relevant-domain-and-range-for-an-exponential-model` has this source reference in all four node copies:

`Int1_0801_practice.docx (Examples 2 and 3, Problems 6-7; Mixed Exercises, Problem 15 context)`

The corrected proposal states that Problems 6 and 7 directly assess the operation. It also states that Problem 15 supplies its input bounds and context but does not ask the learner to determine the domain or range. The Problem 15 reference therefore overstates the assessed source scope. Remove `Mixed Exercises, Problem 15 context` from this node's source reference in all four copies. Keep `.002` as the blueprint source node. Add a regression assertion for the exact source reference so that Problem 15 cannot return as direct evidence.

This correction does not require a node, edge, blueprint, projection, or count change.

## Verified scope

- The candidate adds exactly eight skill IDs.
- It changes exactly four existing node IDs in each node catalog: `.001`, `.002`, rejected `.003`, and stable 8a.
- It adds nine draft `contains` edges. Eight target the new atoms. One targets the existing 8e two-point skill for Problem 17.
- It removes only `math.im1.edge.1025`, which was the duplicate `.003` containment.
- It adds no prerequisite or equivalence edge.
- Problems 16 and 19 do not create capability nodes or containments. They remain composite manual tasks.
- Problem 17 reuses 8e. The candidate does not assert a unique exponential formula.
- All eight new nodes are `draft` and have `independentPracticeReady: false`.
- The candidate adds no practice activity for the eight new nodes. It removes the three placeholder 8a activities.
- Both stored SRS projections add the same eight inactive planning rows. Each has `generatorReady: false`, no generator, and no prerequisite.
- `standard-edges.json` is semantically unchanged.
- The semantic node counts are 963 total nodes, 365 skills, 364 non-rejected skills, and 128 approved skills.
- The other reported totals match the candidate: 2,475 edges, 361 blueprints, 387 activities, and 190 SRS rows.

## Test evidence

I ran these tests in the isolated candidate:

`npx vitest run __tests__/curriculum/lesson-8-1-capabilities-source.test.ts __tests__/curriculum/lesson-7-5-capabilities-source.test.ts`

Result: 12 tests passed in 2 files.

The current Lesson 8-1 test accepts `sourceRefs.length === 2`. It does not verify the exact second source reference for each candidate. This omission permits the Problem 15 defect above.

## Correction disposition

The parent applied the requested source-scope correction in the main workspace. The contextual domain-and-range node now cites only `Examples 2 and 3, Problems 6-7`. All four node copies have the same exact `sourceRefs` value. The new regression checks this exact value in all four copies.

I ran the focused Lesson 8-1 test after the correction. All 7 tests passed. This resolves the only blocking finding. I accept the corrected G38 graph batch for integration.
