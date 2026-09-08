# IM1 Lesson 8-6 source independent review

## Disposition

Accept the corrected source-only patch.

I compared the final candidate with the original `Int1_0806_practice.docx`, its extracted text, and all four rendered pages. The candidate restores Problems 1 through 42 in order. It preserves all prompt subparts and the six source example groups.

## Source and mathematics

The recursive formulas preserve their initial values, coefficients, fractions, signs, and index conditions. Problem 24 now includes the required factor `1/2`.

Problems 13 through 18 keep the original graphs. Their descriptions clearly label the one-unit grid as an interpretation convention. The corrected coordinates are present. In particular:

- Problem 16 uses `(1, −5), (2, −3.5), (3, −2), (4, −0.5), (5, 1), (6, 2.5), (7, 4)`.
- Problem 18 uses nine points from `(1, −3.25)` through `(9, 2.75)`.

Problems 19 through 21 preserve each context, table, and requested formula form. Problems 22 through 29 preserve each conversion prompt.

Problem 32 preserves the population and production data, the full quotient `(1700 + 10x)/(1.3(1.012)ˣ)`, the 1200-widget comparison, both task parts, and an accessible description of the graph axes and values. The final description distinguishes the 0-through-10 prompt span from the printed x-axis labels 0, 2, 4, 6, and 8. It also records the continuing axis arrow.

Problem 35 preserves all spreadsheet headers and displayed values for rows 1 through 10. The accessible table maps spreadsheet columns A, B, and C to `n`, `aₙ`, and `aₙ/aₙ₋₁`. This mapping makes the B3 and C2 prompt usable without the image. It also preserves both spreadsheet questions.

Problem 36 preserves the three Tower of Hanoi rules, the stated recurrence, and both task parts. Problems 37 through 42 preserve their full reasoning and writing prompts.

The source does not add solved recursive or explicit formulas. The graph descriptions transcribe visible input data. They do not state the requested recursive rules.

## Asset identity

I extracted `word/media/image1.png` through `image11.png` from the original DOCX. I compared each file with `source-image-1.png` through `source-image-11.png` in the candidate. All 11 byte comparisons matched.

The assets comprise six sequence graphs, two context tables, the County A graph, the Fibonacci spreadsheet, and the Tower of Hanoi diagram.

## Test evidence

I ran this command from the Integrated Math 1 application directory:

`npx vitest run __tests__/curriculum/lesson-8-6-source.test.ts`

Result: 1 file passed and 6 tests passed.

The final tests cover the 42-problem sequence, key formulas, corrected graph coordinates, compound context data, the County A quotient and graph description, the Fibonacci table, all 11 asset paths, and the absence of answer-key text.

The initial source test failed 6 of 6 tests. Later review tests also failed before the Problem 24, Problem 32, Problem 33, and Problem 35 corrections. The final accessibility regression failed before the x-axis label and spreadsheet-column corrections. The final Green result applies to the corrected candidate and refreshed patch.

## Scope

The patch changes one extracted lesson, one focused test, and 11 source image files. It does not change graph catalogs, runtime behavior, approval state, or curriculum readiness.
