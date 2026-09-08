# IM1 G41 Lesson 8-4 source independent review

## Disposition

Accept the corrected source-only patch.

## Source findings

The extraction preserves all 16 numbered problems. It preserves all subparts for Problems 1, 2, 6, and 12. Problem 16 includes the continuation on page 3 and keeps the complete Marsha error-analysis prompt.

Problems 9 through 11 retain the original account values, compounding periods, and comparison questions. The added interpretation note tells the future activity author to identify the rate unit before comparison. It does not state an answer.

Problem 13 uses the source equation `T(t) = 72 + (212 - 72)(2.72)^(-0.4t)`. It retains the source definition of `-0.4` per minute and the request to rewrite the exponent. It does not solve the rewrite.

The two added model notes for Problems 6 and 12 correctly identify that the table rows do not have one exact constant ratio. They require the student to state an estimation method. They do not supply a fitted model or answer. The patch does not claim that the worksheet specifies a rounding or regression method.

The two table transcriptions match the visible source values. The linked images remain readable alternatives for the original table layout.

## Asset identity

I extracted both media files from `Int1_0804_practice.docx` and compared them with the candidate public assets.

- Original `image1.png` and `source-image-1.png` have identical bytes.
- Original `image2.png` and `source-image-2.png` have identical bytes.

## Test evidence

The focused source suite passed: 7 tests.

Command:

`npx vitest run __tests__/curriculum/lesson-8-4-source.test.ts`

The command ran from `apps/integrated-math-1`.

## Scope

This review accepts the source transcription and accessibility repair only. It does not approve a graph node, activity, generator, grading rule, or curriculum status.
