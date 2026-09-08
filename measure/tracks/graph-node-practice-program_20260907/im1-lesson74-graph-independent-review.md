# IM1 Lesson 7-4 graph independent review

## Decision

Reject the current patch until two source-inventory defects are corrected. The graph structure and lifecycle changes otherwise match the accepted proposal.

## P1 findings

### The six new capability rows do not identify their exact worksheet scope

All six new nodes use only these broad source references:

- `apps/integrated-math-1/curriculum/source-materials/practice-worksheet-student-bundle/Int1_0704_practice.docx`
- `apps/integrated-math-1/curriculum/modules/module-7-lesson-4`

The accepted review requires exact Lesson 7-4 source references for the Mixed Exercises capabilities. The broad paths do not distinguish the correct Jason work from the incorrect Daniela work in Problem 21. They also do not identify that Problem 24 starts with only the partial solution `(3, a)`.

Add exact locations to the two source references for each node:

- scale-factor selection: `Examples 1 and 2, Problems 1-12; Mixed Exercises, Problem 18`
- scaled-elimination execution: `Examples 1 and 2, Problems 1-12; Mixed Exercises, Problem 18`
- equation-combination error diagnosis: `Mixed Exercises, Problem 21, Jason and Daniela shown work`
- substitution-or-elimination choice: `Mixed Exercises, Problem 25`
- specified-multiplier construction: `Mixed Exercises, Problem 23`
- missing coordinate and parameter: `Mixed Exercises, Problem 24, partial solution (3, a)`

Apply the same exact rows in all four embedded node catalogs. Keep the first two blueprint `sourceNodeIds` mapped only to `.014`. Keep the other four blueprint `sourceNodeIds` empty. The direct node references supply the Mixed Exercises scope.

### The rollout audit has stale current totals

The current artifacts contain these totals:

- 948 nodes
- 2,463 edges
- 346 blueprint rows
- 175 SRS planning rows
- 396 projected activities

The audit header still says 941 nodes and 2,452 edges. The current source inventory says 340 skills have a blueprint row. The actual blueprint array has 346 rows. Change that count to 346. Keep the missing-blueprint count at 4. The source-only blueprint count of 220 is correct after the six G36 additions.

The author completion count of 340 blueprint rows is also stale. The final implementation report must use 346.

## Verified graph behavior

The patch adds exactly seven node IDs: one Example 3 source ID and six skill IDs. It removes no node IDs from any of the four catalogs. Every unrelated existing node is byte-equivalent as parsed data.

`.014` is the canonical joint `Examples 1 and 2` source. Its exact source references cover Problems 1 through 12. `.015` remains present with the same stable ID. It is rejected and inactive. It has no source references, blueprint mapping, activity projection, or lesson `contains` edge. The patch removes its old `contains` edge `math.im1.edge.1015`. It preserves its historical alignment and placement records.

`.source-003` has the exact Example 3 title and source references for Problems 13 and 14. It is draft and inactive. It has one draft lesson `contains` edge.

The patch adds exactly six draft and inactive skill candidates. It adds exactly six source-only blueprints. Only scale-factor selection and scaled-elimination execution use `.014`. The other four blueprints have empty `sourceNodeIds`.

The patch adds six new-skill `contains` edges and six reuse `contains` edges. It adds no prerequisite, equivalence, alignment, or evidence-transfer edge for a new capability. The extra thirteenth new `contains` edge links the lesson to `.source-003`, as required.

The context-writing and context-interpretation blueprints append `.source-003`. No blueprint references `.015`.

The legacy 7g node is draft and inactive in all four catalogs. Its blueprint is source-only and preserves the A-REI.C.5 alignment. It maps to `.014` and `.source-003`. Its three placeholder activities are absent.

The only removed prerequisite edge is `math.im1.edge.1263`. The other removed edge is the expected `.015` lesson containment. Both SRS copies for the Lesson 7-5 target omit the legacy 7g prerequisite. No unrelated parsed edge record changed.

The queue and coverage matrix add only the six new skill IDs. The SRS projection adds six inactive planning rows. It does not activate a generator. The activity map removes only the three legacy placeholder activities. The current array totals agree with the values above, apart from the stale audit prose.

## Test evidence

I ran:

`npx vitest run __tests__/curriculum/lesson-7-4-capabilities-source.test.ts __tests__/curriculum/lesson-7-4-source.test.ts __tests__/curriculum/coverage-matrix-regression.test.ts`

Vitest found the new focused graph test. Result: 5 tests passed in 1 file. The other two requested paths do not exist under those names in this candidate.

The focused test proves the main lifecycle, containment, placeholder, prerequisite, and derived-array rules. It does not test exact Mixed Exercises locations on the six node source references. It also does not compare the audit prose with the actual blueprint count. Add those assertions with the two corrections.
