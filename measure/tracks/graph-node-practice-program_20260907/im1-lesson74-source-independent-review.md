# IM1 Lesson 7-4 source-only independent review

## Decision

Accept the source-only patch. The repaired lesson preserves the worksheet tasks and figures. It does not add answer-key content to the learner questions.

## Source verification

I compared the repaired lesson with these sources:

- `apps/integrated-math-1/curriculum/source-materials/practice-worksheet-student-bundle/Int1_0704_practice.docx`
- `/tmp/int1_0704_review_20260908/page-1.png`
- `/tmp/int1_0704_review_20260908/page-2.png`
- `/tmp/int1_0704_review_20260908/page-3.png`
- `/tmp/int1_0704_review_20260908/media/image3.png`

The repaired lesson contains Problems 1 through 25 in order. It preserves the joint `Examples 1 and 2` heading, `Example 3`, and `Mixed Exercises`.

Problems 1 through 12 preserve all 12 systems. I solved each system independently. The results agree with the accepted source review:

1. `(-1, 3)`
2. `(-2, 6)`
3. `(-3, 4)`
4. `(-7, 3)`
5. `(-2, 3)`
6. `(0, 2)`
7. `(3, 5)`
8. `(2, -4)`
9. `(1, -5)`
10. `(-6, -8)`
11. `(0, 1)`
12. `(1/2, 1)`

Problem 13 preserves both Fan Cost Index conditions and both subparts. Problem 14 preserves the full firing-clay and polymer-clay table and both subparts.

Problems 15 through 17 preserve their complete prompts. Problem 18 preserves both equations and subparts a through c. Problem 19 preserves the pineapple table and subparts a through c. Problem 20 preserves the bill count, total value, variable-description instruction, and interpretation instruction.

Problem 21 preserves the complete Jason and Daniela columns. It preserves source errors as source givens. In particular, Daniela writes `7t = -25`, then writes a positive `25/7` on the right side of the division line, and then gives `t = -3.6`. The repaired lesson does not silently correct these lines. It also preserves Jason's subtraction marker, scaled equation, `25t = 25`, substitution, and final ordered pair.

Problem 22 preserves the statement and justification request. Problem 23 preserves the nonunique construction prompt and multiplier `-3`. Problem 24 preserves only the partial solution `(3, a)` and asks for `a` and `b`. It does not disclose `a = -2` or `b = 22`. Problem 25 preserves the method-choice explanation task.

The accessible tables contain all values from the first two source figures. The line-by-line Problem 21 transcription contains all mathematical content from the third figure. The source note correctly identifies the tables and student work as worksheet givens.

## Answer disclosure check

The lesson does not include the solved values for Problems 1 through 20, 22 through 24, or the nonunique response for Problem 23. Problem 21 includes displayed answers because the original worksheet gives those answers for error analysis. The source note makes this purpose explicit.

The added `Learn` section gives a general elimination procedure. It does not give a solution to a worksheet problem. The accepted review permits accurate method instruction when it is not described as recovered textbook prose.

## Test evidence

I ran:

`npx vitest run __tests__/curriculum/lesson-7-4-source.test.ts`

Result: 5 tests passed in 1 file.

The test verifies all 25 numbered sections, all 12 literal systems, the context details, both tables, all required subparts, the complete Problem 21 work, and absence of selected answer-key values.

## Nonblocking source normalization

The repaired text normalizes typography and one source grammar form. For example, it uses straight apostrophes and `ten-dollar bills` instead of the worksheet's `ten-dollars bills`. These changes do not change the mathematical task.
