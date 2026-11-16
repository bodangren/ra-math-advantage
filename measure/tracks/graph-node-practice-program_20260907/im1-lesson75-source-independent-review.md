# IM1 Lesson 7-5 source independent review

## Result

Accept the G37 source-only repair.

I found no source fidelity blocker. I found no answer disclosure.

## Evidence

I reviewed the original worksheet at:

`apps/integrated-math-1/curriculum/source-materials/practice-worksheet-student-bundle/Int1_0705_practice.docx`

I rendered and inspected both original pages:

- `/tmp/int1_0705_g37_review_2/render/page-1.png`
- `/tmp/int1_0705_g37_review_2/render/page-2.png`

I compared the original with:

- `apps/integrated-math-1/curriculum/modules/module-7-lesson-5`
- `apps/integrated-math-1/__tests__/curriculum/lesson-7-5-source.test.ts`
- `apps/integrated-math-1/public/curriculum/module-7-lesson-5/problem-15.png`
- `apps/integrated-math-1/public/curriculum/module-7-lesson-5/problem-16.png`
- `apps/integrated-math-1/public/curriculum/module-7-lesson-5/problem-17.png`
- `apps/integrated-math-1/public/curriculum/module-7-lesson-5/problem-18.png`

The extracted lesson contains Problems 1 through 28 in order. Problems 1 through 12 contain all 12 source systems. Problems 13, 14, and 22 contain all source subparts. Problems 19 through 28 preserve each requested operation and each context constraint.

The four public PNG files are byte-for-byte copies of the original DOCX media. The corrected mapping is:

- Problem 15 uses original `word/media/image3.png`.
- Problem 16 uses original `word/media/image1.png`.
- Problem 17 uses original `word/media/image2.png`.
- Problem 18 uses original `word/media/image4.png`.

Each accessible graph description matches its figure. Problem 15 shows the included parallel strip. Problem 16 shows the open region above both dashed diagonal boundaries. Problem 17 shows the region above the solid rising boundary and below the dashed horizontal boundary. Problem 18 shows the included trapezoid with vertices `(1, 1)`, `(2, 3)`, `(3, 3)`, and `(4, 1)`.

The learner source does not include solved systems or authored final answers. It preserves the source-provided inequalities and reasoning questions. The general Learn text is clearly identified as guidance. The Source Notes do not claim that it is recovered textbook prose.

## Verification

Command:

`npx vitest run __tests__/curriculum/lesson-7-5-source.test.ts`

Result: 4 tests passed.

The test verifies the complete problem sequence, the 12 initial systems, the four image references, context constraints, requested operations, and selected answer-concealment cases.
