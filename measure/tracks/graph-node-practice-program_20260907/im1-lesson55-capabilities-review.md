# IM1 Lesson 5-5 Capability Source Review

## Review scope

This review covers the complete Lesson 5-5 worksheet. It does not approve curriculum content or graph rows.

- Extracted lesson: `apps/integrated-math-1/curriculum/modules/module-5-lesson-5`
- Class plan: `apps/integrated-math-1/curriculum/module-5-class-period-plan.md`
- Original worksheet: `apps/integrated-math-1/curriculum/source-materials/practice-worksheet-student-bundle/Int1_0505_practice.docx`
- Rendered PDF: `/tmp/int1_0505_review_20260907/render/Int1_0505_practice.pdf`
- Rendered pages: `/tmp/int1_0505_review_20260907/render/page-1.png` through `page-4.png`

The worksheet has three worked-example headings. Examples 1 and 2 are on page 1. Example 3 is on page 2. Pages 3 and 4 contain Mixed Exercises 9 through 17.

## Current graph state

The current graph has one broad approved skill. Its ID is `math.im1.skill.5.5.use-technology-to-calculate-the-equation-of-a-best-fit-line`. The title combines regression-equation calculation, correlation-coefficient calculation, and interpretation. Its draft blueprint contains empty mode specifications.

The three worked-example IDs are valid and must remain stable.

- `.019` is Example 1. Retitle it to `Example 1: Best-Fit Line and Correlation Coefficient`.
- `.020` is Example 2. Retitle it to `Example 2: Prediction with Linear Regression`.
- `.021` is Example 3. Its current `Example 3: Residual Plot Analysis` title is accurate.

The current `.019` and `.020` titles combine Examples 1 and 2. Their source references also point only to the class plan. Replace these broad labels with the exact extracted source headings while preserving IDs and review states.

## Source-supported Lesson 5-5 candidates

The source supports the following draft capability candidates.

1. Use technology to calculate a linear regression equation.
2. Use technology to calculate a correlation coefficient.
3. Interpret the direction and strength of a correlation coefficient in context.
4. Calculate residuals from observed and predicted values.
5. Construct a residual plot.
6. Use a residual plot to assess whether a linear model is appropriate.
7. Identify constraints on a regression model in context.
8. Relate the sign and magnitude of a correlation coefficient to a strong linear model.
9. Compare a student-selected line of fit with a linear regression model.
10. Evaluate whether sample data support predictions for a larger population.

Map Candidates 1 through 3 to `.019`. Candidate 1 also maps to `.020` and `.021` because both examples explicitly calculate a regression equation. Map Candidates 4 through 6 to `.021`. Candidates 7 through 10 are mixed-only and must not receive invented worked-example links.

Candidates 1 and 2 separate two calculator outputs. Candidate 3 assesses contextual interpretation. Candidates 4, 5, and 6 separate residual calculation, graph construction, and model selection.

## Reuse from Lessons 5-3 and 5-4

Do not add duplicate prediction and causal-reasoning skills.

- Reuse `math.im1.skill.5.3.predict-response-values-with-lines-of-fit` for forward predictions in Examples 2 and Mixed Exercises 10, 13, and 17. Add `.020` as source evidence.
- Reuse `math.im1.skill.5.3.estimate-explanatory-values-with-lines-of-fit` for the inverse predictions in Exercise 11.
- Reuse `math.im1.skill.5.3.evaluate-extrapolation-reliability-and-assumptions` for Exercises 9, 10, 13, and 15.
- Reuse `math.im1.skill.5.4.explain-why-correlation-alone-does-not-establish-causation` for Exercise 16.

A linear regression line is one type of line of fit. The prediction operation is the same after the model is accepted. The method used to obtain the model remains a separate Lesson 5-5 capability.

## Verified worked mathematics

The extracted lesson contains only generic symbols. It omits all source data and worked results. The following calculations use ordinary least squares with the source definitions of `x`.

- Soccer: `y = -1.3142857x + 50.952381` and `r = -0.713772`. This is a moderate negative linear association.
- Ringtone and ringback revenue: `y = -63.132143x + 353.667857` and `r = -0.910866`. This is a strong negative linear association.
- Health and beauty sales: `y = 8.52x + 3.18` and `r = 0.998661`. This is a very strong positive linear association.
- Sunscreen: `y = 2100x + 54,960`. For 2025, `x = 15`, so the prediction is `86,460` bottles.
- Gold: `y = 103.765179x + 108.064286`. For 2030, `x = 30`, so the prediction is approximately `$3,221.02`.
- Golf: `y = -3.1x + 115.1`. For week 10, the prediction is `84.1` strokes.
- Sunlight and plant height: `y = 0.591837x + 1.510204`. The source values give `r = 0.892780`.
- Fertilizer and plant height: `y = -0.266901x + 10.276875`. The source table contains height values of zero at 25, 22, and 30 drops. These zeros are visible in the original and produce `r = -0.495631`.

The source does not state a rounding rule for most equations. A future assessment must define the coefficient precision before it grades a numeric equation or prediction.

## Mixed-practice findings

Exercise 9 adds a percent constraint. A predicted percentage must remain between 0 and 100. The small four-year sample also limits long-range use.

Exercise 10 gives pH values only from 5.7 through 7.1 and states that barley grows best from pH 6 through 7.5. Its regression is approximately `y = 52.693603x - 300.454545`. Substitution at pH 10 gives about `226.48` bushels, but this is a distant and scientifically unsuitable extrapolation. Part 10c explicitly asks the student to reject unrestricted use at extreme acidity.

Exercise 11 requires inverse use of the regression model. The model is approximately `y = 140.426396x + 13.756345`. It reaches 950 yards near game 6.67 and 1,000 yards near game 7.02. A response must interpret the continuous estimate in the discrete game context.

Exercise 12 states that `y = 1.43x - 4.2` models the data very well. The positive slope requires positive `r`. A very good linear fit requires `r` to be close to 1. The equation alone does not determine one exact `r` value.

Exercise 13 combines regression, `r`, residual analysis, and a 2035 extrapolation. Exercise 14 compares informal lines of fit with regression. Exercise 15 tests sample representativeness and generalization. Exercise 16 tests the rule that a high correlation coefficient does not establish causation.

## Source and reasoning corrections

The current review note says 13 data-table images cannot be read. All source tables are readable in the rendered original. Replace that note with the verified values and any remaining figure limits.

Examples 3, Exercises 8, and Exercise 10 use the words `effect` or describe an intervention-like variable. The tables alone do not establish a causal effect because the worksheet does not state random assignment, controls, or another causal design. Describe the measured association unless the task asks students to evaluate causal evidence.

The residual rule needs a qualification. Random scatter around zero supports a linear model, but it does not prove that the model is correct. A visible pattern is evidence against the linear model. The scale, outliers, unequal spread, and context also matter.

The extracted statement that interpolation is generally more reliable than extrapolation is useful but incomplete. Reliability also depends on model fit, sample quality, domain constraints, and whether the process remains stable.

## Minimum repair scope

Retitle the three worked examples with exact source headings. Preserve all IDs and review states. Add the ten Lesson 5-5 candidates as draft and inactive nodes. Add source-only draft blueprints and draft lesson-containment edges.

Add only the stated source mappings to the four reused Lesson 5-3 and Lesson 5-4 candidates. Preserve their ownership metadata. Do not add generators, prerequisites, equivalence edges, standards alignments, approval, or readiness.

Restore the readable source data and representative regression results. State all rounding rules in future assessment specifications. Keep causal claims separate from observed associations.


## G24 source repair result

The G24 repair restores all readable source tables. It records independently calculated regression fixtures and the source limits. It preserves worked-example IDs `.019` through `.021`. It adds the ten candidates as draft and inactive nodes. It adds source-only draft blueprints and draft Lesson 5-5 containment edges.

The repair reuses the Lesson 5-3 forward prediction, inverse prediction, and extrapolation candidates. It also reuses the Lesson 5-4 correlation-causation candidate. Only the forward prediction blueprint receives a worked-example source link because Example 2 directly demonstrates that capability. The mixed-only reuse receives Lesson 5-5 containment without an invented worked-example link.

The graph remains unapproved. The repair adds no generator, prerequisite, equivalence edge, or standards alignment.

## G24 verification

The new focused test failed in five expected areas before the repair. The completed repair passes all six focused assertions. The complete IM1 curriculum suite passes 71 tests in 20 files. The standards inventory passes five tests. The math-content coverage and audit suites pass 36 tests. IM1 lint and standalone TypeScript checks pass.

Before copies are in `/tmp/im1_l55_g24_20260907_214000/before`. After copies are in `/tmp/im1_l55_g24_20260907_214000/after`.
