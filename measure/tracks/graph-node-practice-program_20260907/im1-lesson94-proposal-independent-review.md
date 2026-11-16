# IM1 G47 Lesson 9-4 proposal independent review

## Decision

Accept the corrected ten-candidate proposal for source implementation and graph authoring review.

The proposal preserves the source task boundaries. It does not turn composite prompts into false atomic evidence. It does not approve content.

## Source verification

I read the original `Int1_0904_practice.docx`, the parent source review, and the current graph records. The worksheet has 30 numbered problems, four example headings, and three native images.

The proposal preserves all source data and subparts. Independent checks confirm these ranges for Problems 1 through 5: 41, 16, 62, 5.6, and 20. These checks support the transcribed data. They are not proposed source answer text.

The three images contain the exercise-minute table, the football-carries table, and the two Problem 27 statements. The proposal transcribes the first two tables correctly. It also keeps Jennifer's and Megan's statements as separate responses.

The four retained source IDs have exact and distinct scopes:

- `.011` maps to Example 1, Problems 1 through 5.
- `.012` maps to Example 2, Problems 6 through 10.
- `.013` maps to Example 3, Problems 11 through 15.
- `.014` maps to Example 4, Problems 16 through 20.

The current titles combine adjacent source headings. The proposed correction separates them without changing the retained IDs. Mixed Exercises do not need new source nodes.

## Capability boundaries

The ten candidates are distinct observable responses:

- range calculation;
- five-number-summary calculation;
- box-plot construction from a supplied summary;
- interquartile-range calculation;
- standard-deviation calculation under stated conventions;
- standard-deviation interpretation in context;
- evaluation of Jennifer's removal proposal;
- evaluation of Megan's added-mean-values proposal;
- evaluation of statistics across random samples;
- explanation of interquartile range as middle-half spread.

No current node is an exact reuse. Stable 9f and 9g combine multiple operations. The later display and transformation nodes also have broader or different response contracts.

Problem 25, Problem 26, and Problem 29 are composite tasks. Their individual calculations can provide direct source references for the matching atoms. Their combined completion must remain manual. The learner-generated survey and data in Problem 29 cannot become a fixed automatic item.

## Convention and manual boundaries

The worksheet does not state a quartile convention for odd data counts. It also does not state the population or sample divisor for standard deviation. It does not state a rounding rule. The proposed capabilities correctly require each generated task to state these conventions before automatic grading.

Problem 27 needs two manual rubrics. Adding one or more values equal to the existing mean reduces positive variance under the usual population and sample formulas. It leaves zero variance unchanged. Removing observations changes the data set and needs a stated purpose and membership assumption. These conditions make one shared automatic answer unsafe.

Problem 28 is sometimes true. The source does not state that the random samples are independent. The proposal preserves this omission and requires an argument.

Problem 30 asks for an explanation. The proposed manual boundary is correct. Interquartile range measures the spread of the middle half. It does not by itself prove symmetric clustering around the median.

## Edge review

The proposed median-to-five-number-summary edge is a direct operation dependency. A five-number summary includes the median.

Do not add a five-number-summary-to-box-plot edge when the box-plot task supplies the summary. Do not add a full-summary-to-IQR edge. Do not require standard-deviation calculation when an interpretation task supplies the value.

The corrected proposal removes the earlier supplied-summary-to-box-plot prerequisite proposal. It proposes no replacement lesson-sequence edge. Edge 1273 is absent from the active graph. Its old review-queue row is stale derived inventory and must not be treated as an active edge.

## Implementation limits

Keep all ten candidates draft, inactive, and source-only. Keep stable 9f and 9g as inactive aggregates. Remove only their demonstrated placeholder activities. Preserve the four stable source identities and their containment. Add no `assesses`, equivalence, approval, readiness, or unsupported evidence claims.
