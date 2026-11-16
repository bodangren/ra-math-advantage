# IM1 G44 Lesson 9-1 source independent review

## Disposition

Accept the source-only patch.

The candidate restores all 39 numbered prompts from `Int1_0901_practice.docx`. It preserves the six multi-part prompts and all source data. It adds no answer key and no percentile-rank convention.

## Source comparison

I inspected all five rendered pages. I also extracted the DOCX paragraph text. The candidate preserves Problems 1 through 39 in source order.

The candidate preserves these multi-part structures:

- Problem 24 has parts a through c.
- Problem 25 has parts a through c.
- Problem 30 has parts a and b.
- Problem 34 has the statement to analyze.
- Problem 36 has all three situations and the explanation request.
- Problem 37 has the complete tomato-growth data and both questions.

The numeric data matches the rendered source. This includes the two unlabeled arrays in Problems 3 and 4, all 12 marching-band scores, the basketball scores, all 10 laptop prices, all seven novel lengths, the volunteer-hours array, and all 10 bowling scores.

Problem 28 uses the correct source reading order. The source image presents two rows of four values: `7, 19, 26, 20` and `23, 21, 24, 20`. The accessible table maps this row-major order to Week 1 through Week 8. It does not sort or rearrange the values.

The candidate preserves the exact conditions for Problems 18, 20, 21, 23, 25(c), 27, 28, 30(a), and 31. It preserves units, counts, year, rounding direction, and comparison language.

## Percentile boundary

The worksheet asks learners to find percentile ranks. It does not state one calculation convention in this practice file. The candidate does not add a formula. It does not add “strictly below” or “less than or equal to” language. Problem 34 remains a learner prompt that asks the learner to correct a false statement.

## Answer boundary

The removed summary contained worked results, including `15.625`. The restored source does not contain those results. I found no answer key, review note, computed percentile, or resolved reasoning response in a learner prompt.

## Media verification

The DOCX contains 10 PNG media files. I extracted each file and compared it with the corresponding candidate asset. All 10 files are byte-identical.

The accessible tables transcribe the visible data. The Problem 36 list transcribes the three image situations. The candidate uses “luxury-priced” where the image uses “luxury priced.” This punctuation normalization does not change the prompt or its response boundary.

## Test result

The focused Lesson 9-1 source suite passes all five tests.

Log: `/tmp/im1-g44-source-independent-tests.log`

## Scope

The patch changes one curriculum source file, adds one focused source test, and adds 10 original image assets. It does not change the graph, capability status, practice readiness, generator status, or source approval. I made no candidate or main worktree changes. I created no commit.
