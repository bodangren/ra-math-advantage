# IM1 Lesson 5-3 Capability Source Review

## Review scope

This review covers the complete Lesson 5-3 worksheet. It does not approve curriculum content or graph rows.

- Extracted lesson: `apps/integrated-math-1/curriculum/modules/module-5-lesson-3`
- Class plan: `apps/integrated-math-1/curriculum/module-5-class-period-plan.md`
- Original worksheet: `apps/integrated-math-1/curriculum/source-materials/practice-worksheet-student-bundle/Int1_0503_practice.docx`
- Rendered PDF: `/tmp/int1_0503_review_20260907/render/Int1_0503_practice.pdf`
- Rendered pages: `/tmp/int1_0503_review_20260907/render/page-1.png` through `/tmp/int1_0503_review_20260907/render/page-4.png`

The worksheet has two worked-example headings. Page 1 contains Examples 1 and 2. Pages 2 through 4 contain Mixed Exercises 7 through 21.

## Current graph state

The current graph has one broad approved skill. Its ID is `math.im1.skill.5.3.analyze-scatter-plots-to-determine-whether-they-show-positiv`. The title combines correlation classification with interpretation in context. Its blueprint is draft and contains empty mode specifications.

The graph has three worked-example IDs:

- `.014` represents Example 1.
- `.015` represents Example 2.
- `.016` also represents Example 2 because the class plan repeats Example 2 on the next instruction day.

The original worksheet has only one Example 2 heading. ID `.016` is a schedule repetition. It is not a third source example. Preserve all three stable IDs during the next correction. Use `.015` as the canonical first source identity for Example 2. Do not use `.016` as separate source evidence. A later duplicate-resolution task can redirect live references before it removes a duplicate row.

The current `.014` title is incorrect because it also includes line-of-fit work. Example 1 only assesses correlation classification and interpretation. The current `.015` title is also incorrect because it includes Example 1 content. Example 2 assesses equations and predictions from lines of fit.

## Source-supported capability candidates

The source supports the following draft capability candidates.

1. Classify a scatter plot as positive, negative, or no correlation.
2. Interpret positive or negative correlation in context.
3. Construct a scatter plot from paired quantitative data.
4. Draw a reasonable line of fit for a scatter plot.
5. Write a line-of-fit equation from two specified points.
6. Write an equation from two points that a student selects on a line of fit.
7. Use a line of fit to predict a response value from an explanatory value.
8. Use a line of fit to estimate an explanatory value from a response value.
9. Evaluate the reliability of an extrapolation and state its assumptions.
10. Interpret whether the intercept of a line of fit is meaningful in context.
11. Compare candidate lines of fit and justify which line fits the data better.
12. Create or select a context that has a specified correlation pattern.

Candidates 1 and 2 split the current broad 5e skill. Example 1 supports both candidates. Candidates 5 and 7 split the current class-plan 5f objective. Example 2 supports both candidates.

Mixed Exercise 7 supports Candidates 1, 3, 5, and 7. Exercises 8 through 10 support Candidates 1 and 2. Exercises 11 and 12 support Candidates 1, 2, 3, 4, 6, 7, and 9 as applicable. Exercise 13 supports Candidates 1, 2, 5, and 7. Exercise 14 supports Candidates 1, 2, and 12. Exercise 15 supports Candidates 3, 4, 7, and 9. Exercise 16 supports Candidates 3, 4, 6, 8, and 10. Exercises 17, 18, and 21 support Candidate 12. Exercise 19 supports Candidate 11. Exercise 20 supports Candidate 9.

Candidate 6 is separate from Candidate 5. A specified pair gives one equation. A student-drawn fit line permits different valid point pairs and different valid equations. Candidate 8 is also separate from Candidate 7 because the student must solve the model for the explanatory variable.

Lesson 5-5 uses technology to calculate a best-fit line and a correlation coefficient. Lesson 5-3 uses student-selected lines of fit. Do not merge these capabilities. Lesson 5-4 covers correlation and causation. Lesson 5-3 does not ask students to infer causation.

## Worked mathematics

The extracted Example 2 stops before it calculates either complete equation or prediction. A complete source extraction must include these results.

- CD sales: `m = (1172.5 - 2485.6) / (6 - 2) = -328.275`. The equation is `y = -328.275x + 3142.15`. For 2019, `x = 9`, so the prediction is `187.675` million CDs. The stated context uses millions even though the displayed values are large for that unit. Preserve the source unit and flag it for curriculum review.
- Housing prices: `m = (275.2 - 226.9) / (4 - 1) = 16.1`. The equation is `y = 16.1x + 210.8`, where `y` is in thousands of dollars. For 2025, `x = 15`, so the prediction is `$452,300`.
- Family cost in Exercise 7: the specified points give `m = 270` and `y = 270x + 10,640`. The age-17 prediction is `$15,230`.
- Football tickets in Exercise 13: use `x = 1` for 2007 and `x = 10` for 2016. The rounded equation is approximately `y = 2.87x + 64.24`. For 2030, `x = 24`. The rounded-equation prediction is `$133.12`.

## Figure and extraction corrections

The source review notes are too broad. Problems 1 through 4 are visible scatter plots. They show positive, no, negative, and positive correlation, respectively. Problems 8 through 10 show negative, no, and positive correlation, respectively.

Problems 6, 7, 11, 12, 15, and 16 contain readable data tables. The extraction must retain their values. Problem 18 contains four readable situations. It is not an unavailable image. Problem 19 contains two visible candidate lines, `f` and `g`, on one scatter plot. Problems 13 and 14 also contain readable scatter plots.

The DOCX render clips some floating text at page boundaries. For example, part 6a appears as `a. U` on page 1, and part 16a is above the visible page-4 start. The DOCX paragraph text confirms the full prompts. This is a render-layout defect. It is not missing curriculum content.

Problem 18 permits more than one justified answer because the prompt asks which situation does not belong. Problem 21 is also open response. These items can provide source evidence for reasoning. They must not define one exact answer without a reviewed rubric.

## Line-of-fit grading policy

A student-selected line of fit is not unique. Do not grade its equation against one canonical equation.

For a task with specified points, grade the equation against the line through those points. Accept algebraically equivalent forms within the stated rounding rule.

For a task with a student-drawn line, first verify that the line has the correct trend and covers the plotted data domain. Then verify that it gives a reasonable balance of points above and below the line. Grade the equation for consistency with two points on the student's accepted line. Grade each prediction for consistency with that accepted equation and the requested rounding rule.

For a displayed source line, grade against the displayed line or its specified points. For comparison tasks, use a rubric that checks residual size or visual balance and the student's justification. Do not require the student's freehand line to equal a regression line from Lesson 5-5.

## Recommended next graph correction

Add the twelve candidates as draft and inactive nodes. Use source-only draft blueprints. Add only draft lesson-containment edges. Do not add generators, standards alignments, prerequisites, equivalence edges, approval, or readiness.

Retitle `.014` to the exact Example 1 heading. Retitle `.015` to the exact Example 2 heading. Preserve `.016`, but do not treat it as a distinct original example. Map Candidates 1 and 2 to `.014`. Map Candidates 5 and 7 to `.015`. Leave mixed-only candidates without worked-example links.

The source does not provide a worked example for drawing a student-selected line, inverse prediction, extrapolation reliability, intercept interpretation, line comparison, or context creation. Do not add invented worked-example links for these candidates.

## Source correction result

The graph now contains the twelve candidates as draft and inactive nodes. Each new blueprint is source-only and draft. Each new edge is a draft `contains` edge from Lesson 5-3. The queue appends twelve generator gaps without changing the prior row order.

The correction preserves `.014`, `.015`, and `.016`. It gives `.014` and `.015` exact source headings. No new blueprint maps `.016`. The source now includes the complete CD and housing calculations. It also records the readable plots, tables, situations, and DOCX clipping limits.

The current graph has 829 canonical nodes, 238 skill candidates, and 2,310 edges. It has 234 blueprint rows. Of these rows, 102 are source-only. Six generator bindings exist. The gap queue and rebuilt coverage matrix contain 232 unbound candidates.
