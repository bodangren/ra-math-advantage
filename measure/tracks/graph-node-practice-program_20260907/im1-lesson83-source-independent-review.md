# IM1 Lesson 8-3 source candidate independent review

## Decision

Accept this source-only candidate. It restores the complete worksheet and does not add graph or runtime changes.

## Verified source content

- All 35 numbered problems are present in source order.
- Problems 1–6 and 22–24 preserve every point pair.
- Problems 7–10 use the four correct original graph assets.
- Problems 11–21 preserve the original context values, units, time bases, subparts, and rounding directions.
- Problem 18 preserves both public and private cost-table rows. Its learner prompt asks for a duration rounded to the nearest month.
- Problem 20 preserves the exact 52-week assumption and nearest-cent instruction.
- Problem 21 preserves the 2016 source estimate and the 2030 question.
- Problem 26 preserves the half-life equation, 20-microgram dose, and all three questions.
- Problems 27–29 preserve all requested explanations and subparts.
- Problem 29 includes the exact deer table as accessible text.
- Problems 30–35 preserve the analysis, justification, comparison, and learner-selected-rate tasks.
- The lesson does not include verified answers or internal review notes.

## Accessible figures

The graph descriptions match the native source images:

- Problem 7: asymptote `y = 0`, points `(0, 3)` and `(-1, 1.5)`.
- Problem 8: asymptote `y = 0`, points `(0, -1)` and `(1, -3)`.
- Problem 9: asymptote `y = 0`, points `(0, 1)` and `(-1, 4)`.
- Problem 10: asymptote `y = 0`, points `(0, -1)` and `(-1, -2)`.

Each graph description states one-unit grid intervals. It gives the source data without giving the requested equation.

The Problem 18 and Problem 29 tables are readable without their images. The six copied public assets are byte-equal to `word/media/image1.png` through `image6.png` in the original DOCX. I verified this with direct byte comparison.

## Test evidence

I ran:

`npx vitest run __tests__/curriculum/lesson-8-3-source.test.ts`

Result: all 6 tests passed.

The repository test checks asset presence and size. The independent review performed the original-asset byte comparison.
