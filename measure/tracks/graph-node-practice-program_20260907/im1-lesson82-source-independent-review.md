# IM1 Lesson 8-2 source candidate independent review

## Decision

Reject this revision for one accessibility defect and one verification-report defect. The prompt transcription, source image mapping, and mathematical corrections otherwise match the original worksheet.

## Findings

### P1 — The accessible graph descriptions omit required mathematical givens

The proposal requires accessible descriptions that state the visible axes, scale, points, asymptotes, line style, and curve direction. The descriptions for Problems 13–16 and 37–40 use phrases such as “visible grid points” and “a horizontal level.” These phrases do not give the numeric data that a learner needs to write the requested equation.

Problem 50 also says only that the curve passes through visible grid points. A learner who cannot see the image cannot determine the parent function. Problem 41 gives the axis ranges but does not give the numeric vertical separation needed to extrapolate the antique value.

Restore faithful numeric descriptions of the source figures. Include the labeled axis scales, the visible intercepts or exact grid points, and each horizontal asymptote. For Problem 41, include enough values from the two curves to determine their separation. These are source givens. They are not answer leakage.

Problem 49 has the same problem. Its accessible description says that all exponents and constants remain visible, but it does not transcribe them. Include all three exact pairs in accessible text:

1. `f(x) = 3^(x + 2)` and `g(x) = 3^(x - 1) + 2`.
2. `f(x) = 2^x` and `g(x) = 2^(x + 3) + 2`.
3. `f(x) = 4^(x + 1)` and `g(x) = 4^(x + 4) + 2`.

Add focused assertions for the numeric figure descriptions and all six Problem 49 functions. The current tests check only general prose and image links.

### P2 — The report claims byte-comparison tests that the test file does not perform

The report says “Original asset byte comparisons: 12 passed.” The source test checks only that each copied asset is larger than 1,000 bytes. It does not compare the copied bytes with the DOCX media bytes or the extracted originals.

I independently compared each of the 12 candidate assets with the corresponding file in `/tmp/int1_0802_parent_assets` by using `cmp`. All 12 files are byte-equal. Correct the report to describe this independent comparison. If an existing repository ZIP helper can read the DOCX media in the test, add byte-equality assertions there. Do not add a dependency only for this check.

## Verified source fidelity

- The lesson has Problems 1 through 50 in exact numeric order.
- It preserves all four source groups.
- Problems 1 through 12 and 21 through 36 preserve the source equations and directions.
- Problems 13 through 16, 20, 37 through 41, 49, and 50 use the correct source image mapping.
- All 12 copied image files are byte-equal to the parent-extracted assets.
- Problem 20 preserves the depreciation definition, both models, 15 percent rate, dollar units, year axis, value axis, and all three subparts.
- Problem 41 preserves the 1,000-dollar deposits, 1.5 percent annual rate, antique context, axes, and both subparts.
- Problem 15 does not disclose its equation, intercept, or asymptote answer.
- Problem 40 does not disclose its equation or point observations.
- Problem 47 preserves the original ambiguous phrase “rises more rapidly.” It does not insert the reviewed interpretation.
- Problem 49 preserves the image with all three source pairs.
- Problem 50 preserves all four open tasks and does not prescribe one transformed function.
- The lesson contains no answer section, source note, or internal review note.

## Test evidence

I ran:

`npx vitest run __tests__/curriculum/lesson-8-2-source.test.ts`

Result: 6 tests passed. These tests do not detect the accessibility omissions described above.

## Final correction disposition

The revised source candidate resolves both findings. I accept it for integration.

The numeric accessible descriptions now match the original source assets:

- Problem 13 uses 1-unit axes, asymptote `y = 0`, and points `(0, -1)`, `(1, -2)`, and `(2, -4)`.
- Problem 14 uses 1-unit axes, asymptote `y = 0`, and points `(3, 1)`, `(4, 2)`, and `(5, 4)`.
- Problem 15 uses a 1-unit horizontal scale, a 2-unit vertical scale, asymptote `y = 5`, and points `(0, 6)` and `(-1, 7)`.
- Problem 16 uses a 1-unit horizontal scale, a 2-unit vertical scale, asymptote `y = 4`, and points `(-3, 5)`, `(-2, 6)`, `(-1, 8)`, and `(0, 12)`.
- Problems 37 through 40 and 50 now give the visible numeric points and asymptotes.
- Problem 40 correctly gives `(1, 5)` and `(2, 1)`. These points produce `5^(2-x)`.
- Problem 41 now states the axis break, axis intervals, and source baseline values `$1500` and `$1000`.
- Problem 49 now transcribes all six functions in its three source pairs.

The report now distinguishes the repository size checks from the independent byte comparison. I independently used `cmp` against `/tmp/int1_0802_parent_assets`; all 12 assets are byte-equal.

The focused source test now has seven tests. All seven passed.
