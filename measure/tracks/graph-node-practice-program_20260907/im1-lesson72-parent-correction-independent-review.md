# G34 parent correction independent review

## Result

Accept the final metadata and audit corrections. I found no remaining blocker in this bounded correction.

## Source identity metadata

I inspected `math.im1.example.7.2.008` and `math.im1.example.7.2.009` in all four catalog copies:

- `nodes.json`
- `draft-nodes.json`
- the embedded node catalog in `edges.json`
- the embedded node catalog in `standard-edges.json`

All four copies have the same result.

- `.008` has no `metadata.exampleNumber` field. It retains `metadata.historicalExampleNumber: 1`.
- `.009` has no `metadata.exampleNumber` field. It retains `metadata.historicalExampleNumber: 2`.
- `.008` uses the current title `Examples 1-3: Solve Systems by Substitution`.
- `.009` uses the current title `Example 4: Model and Solve Systems by Substitution`.
- Each row has exact DOCX and extracted-lesson source references with its current heading and problem range.

This separation is correct. The historical number records the old catalog identity. It does not claim that the number is the current source example number. The current title and source references supply the repaired source identity.

The new source test checks both requirements in every catalog copy. It rejects `metadata.exampleNumber`. It checks the retained historical number and current title.

## Audit counts

I recalculated the current values from `nodes.json` and `blueprints.json`.

- Current skill candidates: 342.
- Skill candidates with a blueprint row: 338.
- Skill candidates without a blueprint row: 4.
- Approved skill candidates: 133.

The corrected rollout audit states 338 blueprint-covered skills and 133 approved skills. Both values match the current artifacts.

## Main and candidate parity

The four catalog files, the Lesson 7-2 source test, and the rollout audit are byte-identical between current main and `/tmp/im1-g34-head-20260908`.

## Verification

The focused Lesson 7-2 source suite passes 5 of 5 tests in the isolated candidate. The parent Red log establishes the regression before correction. The parent owns the broader 115-test rerun.
