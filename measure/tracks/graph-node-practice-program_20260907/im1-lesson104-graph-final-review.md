# IM1 G55 Lesson 10-4 graph independent review

## Verdict

ACCEPT the corrected 14-path G55 graph patch, subject to the parent's confirmation that the one coverage-order failure is identical on the pre-G55 baseline.

The G55 semantic rows are correct. The corrected freeze removes the prior unrelated Unicode serialization churn. It preserves the relative order and exact serialized bytes of the 495 existing coverage rows. The remaining coverage test failure concerns 11 rows from earlier G51 and G53 work. It does not concern any G55 row or value.

## Capability scope

The candidate adds exactly four draft skill nodes. All four node catalogs contain each node with `reviewStatus: "draft"` and `independentPracticeReady: false`.

Each new blueprint is source-only. It has no renderer, mode map, Worked specification, Guided specification, Independent specification, alignment, approval, or readiness claim. No projected activity exists for any new skill.

The source bindings are exact:

- Coordinate-defined segment congruence uses Example `.013` and the Lesson 10-4 source. It cites Problems 15–20, 43, and 46.
- Inverse distance uses only the Lesson 10-4 source. It cites Problems 44, 45, and 53.
- Rectangle and midpoint congruence uses only Problem 49 and states manual review.
- The Pythagorean-Theorem explanation uses only Problem 50 and states manual review.

The source catalogs preserve exactly four approved worked-example IDs: `.012`, `.013`, `.014`, and `.015`. They add no Mixed Exercises example node.

## Reuse and containment

The candidate adds eight Lesson 10-4 containment edges. Four bind the new skills. Four bind the accepted existing skills.

The existing source bindings preserve the required response boundaries:

- 10e uses `.012` for Problems 1–14.
- 10g uses `.014`, `.015`, and the lesson. It limits `.015` to Problem 27 and records the accepted Mixed Exercise stages.
- 10h uses `.015` and the lesson. It limits `.015` to Problems 28–30 and records Problems 47–48.
- 10k uses the lesson for Problem 51 only.

The containment rationales state the exact problem ranges and manual-review boundaries. No new prerequisite or equivalence edge touches the four new skills.

## Edge and alignment scope

Canonical edge `math.im1.edge.1194` is absent. It is also absent from both SRS prerequisite copies. Edge `math.im1.edge.1195` remains present.

Both edge catalogs began with 12 Lesson 10-4 alignment rows. The candidate removes exactly 10 unsupported alignments. It keeps only:

- `math.alignment.im1-example-10-4-015-to-ccss-g-mg-a-1`
- `math.alignment.im1-skill-10-4-apply-the-distance-formula-to-solve-real-world-problems-to-ccss-g-mg-a-1`

Both retained rows have the accepted contextual modeling rationales. The 10g blueprint has no alignment. The 10h blueprint has only `math.standard.ccss.g-mg-a-1`.

## Placeholder and projection scope

The candidate removes the three empty mode specifications from each touched 10g and 10h blueprint. It removes exactly their six placeholder activity rows. It preserves the two approved skill and blueprint identities and their existing generator exceptions.

The four new skills appear in the gap queue, SRS projection, and teacher-evidence projection. They remain inactive. The stored affected activity, SRS, and teacher rows equal fresh projector output.

The final counts match the stored arrays:

- 1,101 canonical nodes
- 2,614 canonical edges
- 500 skill records
- 499 non-rejected skill candidates
- 108 approved skill records
- 496 blueprints
- 291 activities
- 325 SRS rows
- 493 generator gaps
- 499 coverage rows

These counts do not establish approval or usable practice.

## Byte and order review

The first freeze rewrote escaped Unicode in unrelated edge records. The corrected freeze fixes this defect.

I compared common keyed records with the pre-G55 `HEAD` tree. Common record order remains unchanged in both edge catalogs. Parsed common records outside the authorized source and alignment rows remain unchanged. The corrected patch has only four removed escaped-em-dash lines. All four belong to the four authorized Lesson 10-4 example source records. It no longer rewrites unrelated raw text.

All 495 pre-G55 coverage rows keep their exact relative order. The four G55 rows are the only added coverage records.

## Independent tests

I ran:

`npm test --workspace=apps/integrated-math-1 -- --run __tests__/curriculum/lesson-10-4-capabilities-source.test.ts __tests__/curriculum/lesson-10-3-capabilities-source.test.ts __tests__/curriculum/lesson-7-5-capabilities-source.test.ts`

Result: 3 files and 17 tests passed.

I also ran:

`npm test --workspace=packages/math-content -- --run src/problem-families/im1/__tests__/audit-diff.test.ts src/problem-families/im1/__tests__/coverage-matrix.test.ts`

Result: 36 tests passed and 1 test failed. The failing full-object equality moves 11 earlier G51 and G53 rows from their baseline append positions into global sorted positions. The failure diff does not add, remove, or alter a G55 row. All four G55 rows equal the fresh builder values.

The parent must confirm the same single failure on the pre-G55 baseline before integration. If the baseline passes, reject this patch and repair the coverage contract before integration.

## Limits

The patch does not add runtime code, source content, dependencies, approval changes, hashes, or manifests. It does not make a practice-readiness claim.

## Parent integration

Committed as `cd3966d85`. All fourteen staged files matched the accepted candidate. Final app tests passed 425 cases. Lint, build, and separate TypeScript passed. Exact committed HEAD inputs reproduced the coverage order failure before this change. The affected package check passed 36 of 37 cases. The baseline order defect remains open. Two absent or clean working files now match HEAD. Twelve mixed working files remain intact.
