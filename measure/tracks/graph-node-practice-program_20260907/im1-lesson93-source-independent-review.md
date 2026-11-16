# IM1 Lesson 9-3 source independent review

## Decision

Reject the candidate for one exact-text defect and its missing regression assertion. The source restoration otherwise matches the reviewed DOCX and images.

## Blocking finding

Problem 8 changes the literal source range `0-100` to `0–100`. The task requires the complete original wording. Restore the ASCII hyphen in `a scale of 0-100 on the y-axis`.

The focused test does not assert this condition. Add an assertion for the complete Problem 8 scale sentence before the correction. This will make the test fail against the current candidate and protect the exact source text.

## Confirmed source fidelity

The candidate restores all 22 numbered prompts, every printed subpart, and all four example headings. I compared the lesson text with the DOCX paragraph extraction and both rendered pages. Apart from the Problem 8 range character, the prompt wording, contexts, numerical lists, and stated conditions match.

Problem 7 gives an accurate accessible description. Both graphs show approximately 70 T-shirts for 2016 and 120 for 2017. Vendor 1 prints labels 60 through 160 in steps of 20. Its bottom grid line is unlabeled, and the text clearly marks 40 as an inference. Vendor 2 prints labels 20 through 140.

Problem 12 preserves the source mismatch between the prompt's number of canned goods and the y-axis label `Canned Goods (1000 lbs)`. It describes the plotted heights as approximately 20 and 40 thousand pounds. It states that the 2017 can is wider and taller. It does not invent a picture-area ratio.

Problem 21 preserves the false source premise as learner prompt text. The lesson does not add an answer, a correction, or a shape label. The test also rejects the review-only `third central moment` phrase.

The lesson contains no answer-bearing summary. It does not add capabilities, graph state, approval, or readiness claims.

## Media and tests

Both public PNG files are byte-identical to `word/media/image1.png` and `image2.png` in the original DOCX.

The focused source test passes 6 of 6. It checks problem numbering, four headings, selected context and subpart text, all numerical data sets, both accessible graph descriptions, the Problem 21 premise, answer absence, and both assets. It needs the Problem 8 exact-range assertion described above.

## Required correction

Change only the Problem 8 range character and its focused regression test. Then rerun the six focused tests and the two image comparisons. No other source change is necessary.

## Final resolution

The main-tree integration fixes the rejected defect. Problem 8 now preserves the literal `0-100`. The focused test asserts the complete source sentence.

I compared the main lesson with the reviewed candidate after normalizing only `0–100` to `0-100`. The files match. I compared the main test with the reviewed candidate after removing only the new complete-sentence assertion. The files match.

The corrected focused source test passes 6 of 6. Accept the final main-tree G46 source restoration.
