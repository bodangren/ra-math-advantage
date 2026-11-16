# IM1 G42 Lesson 8-5 source independent review

## Disposition

Accept the corrected source-only patch.

## Resolved P1 source fidelity findings

1. Problems 34 through 38 omit the source statement that each listed sequence is geometric. A short finite list does not identify an arbitrary continuation without this task-class condition. Restore “geometric sequence” in each prompt.
2. Problem 40 changes “For each of the geometric sequences below” to “For each sequence.” Restore the geometric-sequence condition.
3. Problem 41 omits “geometric” from “Find the previous three terms of the geometric sequence.” Restore it.
4. Problem 43(c) replaces the source condition with “the stated performance condition,” but the condition is no longer stated. Restore that the manager promises to raise the salary as described in the table when the learner meets the minimum performance rating each month.

The refreshed candidate resolves all four findings. Problems 34 through 38, 40, and 41 now state the geometric-sequence condition. Problem 43(c) now states the manager promise and the minimum monthly performance condition.

## Verified source content

The candidate restores Problems 1 through 52 in order and preserves the required subparts. It preserves Problem 16 and the five-page continuation.

It preserves the listed fractions, signs, tables, and displayed work. Problem 35 shows `9/16, 3/8, 1/4`. Problem 40(b) does not add a positive-ratio assumption. Problem 44 preserves `a_n=512(0.5)^x`, `b_3=7168`, and `b_7=28`, with a labeled notation note. Problem 47 preserves Haro's `9-1` exponent followed by the incorrect 512 and preserves Matthew's incorrect negative even power.

The Problem 42 proposal records the necessary `r != 1` and nonzero-start implications without inserting them as source text. The source prompt itself remains a task about two different sequences.

The five public image files are byte-identical to the five DOCX media files. The two data tables are transcribed. The payment table is transcribed. The polygon prompt states the triangle and pentagon sums and requires the square value. The student-work lines are transcribed before the original image. No checked result is inserted into a learner prompt.

## Test evidence and process

The strengthened focused app test passes 7 tests:

`npx vitest run __tests__/curriculum/lesson-8-5-source.test.ts`

A disposable read of the old HEAD source fails the same substantive assertions for the 52-problem sequence, fractions, table value, Problem 44 givens, and Haro work. This confirms that the focused checks distinguish the old source from the candidate.

The author added the tests after the implementation. This is a TDD process deviation. The result must not be described as a Red-before-code TDD cycle. The later old-source rejection check demonstrates regression sensitivity, but it does not change the chronology.
