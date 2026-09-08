# IM1 Lesson 8-3 source and capability proposal

## Decision

Lesson 8-3 needs a source repair before activity authoring. The current lesson is a summary. It omits most of the 35 learner problems. It also gives answers for Problems 1, 11, and 12. The repaired lesson must restore the source prompts and remove answers from learner content.

The current graph has two broad skill rows. Keep both stable identifiers. Narrow each row to one source-supported operation. Add five draft and inactive capability candidates. Reuse six exact existing capabilities. Keep open and multi-operation responses as manual tasks.

Do not approve a source, blueprint, renderer, generator, activity, prerequisite, or evidence mapping in this batch.

## Source review

I read `Int1_0803_practice.docx`. I rendered and inspected all four pages in `/tmp/int1_0803_review_20260908_v2`. I also inspected the six embedded source images.

The source has these groups:

1. `Example 1`, Problems 1-6. Students write `y = ab^x` from two points.
2. `Example 2`, Problems 7-10. Students write `y = ab^x` from a graph.
3. `Example 3`, Problems 11-13. Students write growth or decay models from an initial amount and a rate or repeated-change interval.
4. `Examples 4-6`, Problems 14-21. Students write and evaluate compound-interest, growth, and decay models.
5. `Mixed Exercises`, Problems 22-35. Students write models, evaluate models, solve for time, analyze a table, and explain model limits.

### Source images

- `image1.png` through `image4.png` are the graphs for Problems 7-10 in order.
- `image5.png` is the Problem 18 college-cost table.
- `image6.png` is the Problem 29 deer-population table.

The repaired lesson must use the original image bytes. It must also give accessible descriptions. For Problems 7-10, each description must state the visible axes, tick spacing, asymptote, and readable curve points. It must not state the requested equation. For Problems 18 and 29, use readable HTML tables with the exact source data.

### Stable source identities

Preserve all six identifiers. Use four canonical groups:

- `math.im1.example.8.3.007`: `Example 1: Write an exponential function from two points`. Source location: `Int1_0803_practice.docx (Example 1; Problems 1-6)`.
- `math.im1.example.8.3.008`: `Example 2: Write an exponential function from a graph`. Source location: `Int1_0803_practice.docx (Example 2; Problems 7-10)`.
- `math.im1.example.8.3.009`: `Example 3: Write exponential growth and decay models`. Source location: `Int1_0803_practice.docx (Example 3; Problems 11-13)`.
- `math.im1.example.8.3.010`: `Examples 4-6: Apply exponential and compound-interest models`. Source location: `Int1_0803_practice.docx (Examples 4-6; Problems 14-21)`.

Rows `.011` and `.012` duplicate the single `Examples 4-6` source heading. Preserve both stable identifiers as rejected and inactive historical rows. Remove their exact capability and evidence claims. Do not delete or repurpose them.

Set the four changed canonical source rows to `draft` in all node copies. Set `independentPracticeReady` to `false`. The new source transcription requires curriculum review.

## Required source repair

Restore all 35 numbered learner prompts. Preserve every equation, point pair, table value, direction, subpart, unit, rounding instruction, and context condition.

Preserve these source details:

- Problem 11 starts with 50 cells and doubles every 30 minutes. Define whether the input counts minutes or 30-minute periods.
- Problem 13 is limited to 2010 through 2016. Keep this historical boundary.
- Problem 15 gives 8,192,426 people in 2010, 8,550,405 in 2015, and an approximate annual rate of 0.9 percent.
- Problem 18 gives public costs of `$9,410` for tuition and fees and `$10,138` for room and board. It asks for a duration after 15 years, rounded to the nearest month.
- Problem 20 states exactly 52 weeks in a year.
- Problem 21 uses the worksheet's 2016 population estimate and rate. Present it as source data, not as a current population claim.
- Problem 26 gives `y = y_0(0.5)^(x/6)`, an initial dose of 20 micrograms, and three separate questions.
- Problem 27 gives `y = 2400(0.95)^x` and asks for the initial investment, direction, reasoning, and half-value time.
- Problem 28 asks whether the gas model has a continuous domain.
- Problem 29 gives years `0, 1, 2, 3` and populations `128, 160, 200, 250`.
- Problem 35 lets the learner choose rates. Keep all three dependent subparts.

Remove the current `Review Notes`. Do not put verified results in learner prompts. Keep verified results in tests and review records.

## Mathematical verification

Use these results only for author review and tests:

### Functions from two points

- P1: `y = 4(2)^x`.
- P2: `y = 2(1/2)^x`.
- P3: `y = 10(3)^x`.
- P4: `y = (1/2)^x`.
- P5: `y = 3(4)^x`.
- P6: `y = 9(2)^x`.
- P22: `y = 0.35(2)^x`.
- P23: `y = 2.6(4)^x`.
- P24: `y = 5.25(8)^x`.

These source cases have positive outputs and positive bases. A future grader must not generalize the real-root calculation to invalid base or sign cases without a reviewed domain contract.

### Functions from graphs

The source grids use one unit per major square.

- P7 has horizontal asymptote `y = 0` and readable points `(0,3)` and `(-1,1.5)`. The equation is `y = 3(2)^x`.
- P8 has horizontal asymptote `y = 0` and readable points `(0,-1)` and `(1,-3)`. The equation is `y = -(3)^x`.
- P9 has horizontal asymptote `y = 0` and readable points `(0,1)` and `(-1,4)`. The equation is `y = (1/4)^x`.
- P10 has horizontal asymptote `y = 0` and readable points `(0,-1)` and `(-1,-2)`. The equation is `y = -(1/2)^x`.

A source test must compare these coordinates with the original images. Do not infer a coordinate from file order alone.

### Context and finance checks

- P11 can use `N(t) = 50(2)^(t/30)` for minutes or `N(p) = 50(2)^p` for 30-minute periods.
- P12: `V(x) = 32500(0.88)^x`.
- P13: `U(t) = 43(1.23)^t`, where `t` is years after 2010 and `0 <= t <= 6` for the stated period.
- P14: `A(t) = 1500(1 + 0.0485/4)^(4t)`.
- P15: `P(t) = 8192426(1.009)^t`; P15(b) is approximately `9,370,872` for 2025.
- P16 balances are approximately `$1,485.95` after 5 years and `$15,996.47` after 35 years.
- P17: `Z(t) = 60000(0.9)^t`; after 6 years, the value is `$31,886.46` before any source-required rounding.
- P18 gives a balance of approximately `$29,423.33`. At the fixed annual public cost of `$19,548`, it covers approximately `18.06` months. The required rounded result is `18 months`. The annual-cost division is a second operation.
- P19 gives approximately `$2,244.16`; the source requests the nearest hundred, so the reported value is `$2,200`.
- P20 gives approximately `$1,224.24`.
- P21 gives approximately `360.5` million; the source requests the nearest ten million, so the reported value is `360` million.
- P25 gives approximately `77,529` under the stated trend.
- P26 gives approximately `17.8` micrograms after 1 day and `5` micrograms after 12 days. The amount equals `1` microgram at `t = 6 log2(20)`, approximately `25.9316` days. It is less than `1` only for times greater than that crossing. There is no earliest real time in that strict solution set. The first whole elapsed day is day `26` if whole-day reporting is used.
- P27 starts at `$2,400`, decreases, and reaches half value after about `13.51` years.
- P28 gives approximately `94.1` cubic centimeters after 11 hours. Time is continuous under the stated physical model.
- P29 fits `P(t) = 128(1.25)^t`. Its average rate of change from year 0 through year 3 is `122/3`, or about `40.67`, deer per year. The successive differences are not constant. The successive ratios are `1.25`.
- P30 has growth factor `4`, so the growth rate is `300%`.
- P31 reaches `$2,500` after about `9.21` years under monthly compounding.
- P32 is half-full after 7 minutes.
- P35 has no single numeric answer because the learner chooses both rates.

Treat all money, population, and depreciation statements as worksheet assumptions. Do not present them as financial advice or current data.

## Capability decisions

### Repair stable 8e

Keep this identifier:

`math.im1.skill.8.3.write-an-exponential-function-given-two-points-on-its-graph`

Use the title `Write an exponential function from two points`. The learner must determine both `a` and `b` in `y = ab^x`. Direct evidence is `.007`, Problems 1-6. Mixed Problems 22-24 assess the same operation. Keep the node draft and inactive because its source and blueprint claims change.

### Repair stable 8f

Keep this identifier:

`math.im1.skill.8.3.apply-the-compound-interest-formula-to-investment-and-deprec`

Use the title `Calculate a compound-interest balance from principal, rate, compounding frequency, and time`. Direct evidence is `.010`, Problems 16 and 20. Problem 18 has a hidden balance calculation within a duration task; it does not directly assess this node. Depreciation problems in this lesson use `a(1-r)^t`; they do not use the compound-interest formula. Remove depreciation from the title and description. Keep the node draft and inactive.

### New 1: write a contextual percent or repeated-factor exponential model

`math.im1.skill.8.3.write-an-exponential-growth-or-decay-model-from-context`

The learner identifies the initial value, converts the change statement to a factor, and defines the time unit. Direct evidence is `.009`, Problems 11-13, and `.010`, Problems 15(a) and 17(a). Mixed Problem 28(a) assesses the same operation. Problem 25 asks only for an estimate and is not direct model-writing evidence. Doubling intervals, annual percent growth, annual depreciation, and hourly loss are variants of this operation.

Do not include compound interest. It has an additional compounding-frequency parameter. Do not include Problem 29(a). That problem requires the learner to infer the factor from table data.

### New 2: write a compound-interest model

`math.im1.skill.8.3.write-a-compound-interest-model-from-financial-terms`

The learner maps principal, annual rate, compounding frequency, and time to `A = P(1 + r/n)^(nt)`. Direct evidence is `.010`, Problem 14. The equation-writing response is distinct from a numeric balance calculation.

### New 3: write an exponential model from equally spaced table data

`math.im1.skill.8.3.write-an-exponential-function-from-equally-spaced-table-data`

Direct evidence is Mixed Problem 29(a). The learner identifies the input-zero value and common ratio, then writes the function. Use no worked-example source node. Reuse the common-ratio classification skill for Problem 29(d), but do not treat classification alone as proof that the learner can write the model.

### New 4: solve an exponential model for time with technology

`math.im1.skill.8.3.solve-an-exponential-model-for-time-with-technology`

Direct mixed evidence is Problems 26(c), 27, and 31. The learner finds an input that reaches a target or threshold and interprets the result. Equality, strict inequality, half-value, and compound-interest targets are variants. Keep calculator or graphing-technology methods valid. Do not require logarithms unless a later reviewed source requires them.

### New 5: determine percent growth from a growth factor

`math.im1.skill.8.3.determine-the-percent-growth-rate-from-an-exponential-growth-factor`

Direct evidence is Mixed Problem 30 only. The learner uses `b = 1 + r`. A factor of 4 means `r = 3`, or `300%`. Use no worked-example source node.

## Exact reuse

Add Lesson 8-3 containment for these six existing skills:

- `math.im1.skill.8.1.evaluate-and-interpret-an-exponential-model-at-a-given-input`
  - Direct problems: 15(b), 17(b), 19, 21, 25, 26(a-b), and 28(a).
- `math.im1.skill.8.1.determine-the-initial-value-or-y-intercept-of-an-exponential-function`
  - Direct problem: 27, initial investment.
- `math.im1.skill.8.1.classify-growth-or-decay-in-an-exponential-model`
  - Direct problem: 27, increasing or decreasing with reasoning.
- `math.im1.skill.8.1.identify-exponential-behavior-from-data-using-common-ratios`
  - Direct problem: 29(d), exponential rather than linear.

- `math.im1.skill.8.2.write-equations-for-transformed-exponential-functions-given`
  - Direct problems: 7–10, source `.008`. Extend the draft node and blueprint source scope to this group. Zero translation is an input variant of the same graph-to-equation operation.
- `math.im1.skill.4.2.calculate-the-rate-of-change-from-a-table`
  - Direct problem: 29(b), average rate over years 0 through 3.

Problem 28(b) requests domain continuity only. It cannot prove the combined domain-and-range skill. Keep that response manual.

Do not add a second skill for evaluating a simple growth or decay model. Do not add a separate half-life evaluation skill. Do not add a separate depreciation skill. These are input variants of the listed operations.

## Manual and composite tasks

Keep these responses manual until a reviewed multi-part rubric exists:

- Problem 18: calculate a compound balance, combine two table costs, and convert the balance to a duration rounded to months.
- Problem 27: report initial value, classify direction, justify the classification, and solve a half-value time.
- Problem 28: write and evaluate a model, then justify a continuous domain.
- Problem 29(c): explain why exponential growth does not imply a constant additive increase. Problem 29(b) reuses the existing table rate-of-change skill.
- Problem 32: reverse a doubling process and justify the result.
- Problem 33: explain decision limits for exponential models.
- Problem 34: compare growth and decay formulas.
- Problem 35: choose two rates, solve two half or double times, and solve an intersection. The answer depends on the learner's chosen rates.

A multi-part response can use reviewed child capabilities. Do not map the whole response as exact evidence for every child.

## Graph and projection corrections

- Preserve all existing stable identifiers.
- Keep four canonical source rows and reject duplicate rows `.011` and `.012`.
- Retain one lesson containment for each canonical source row.
- Remove containment and exact mapping claims for rejected duplicate source rows.
- Retain containment for repaired 8e and 8f.
- Add five containment edges for the new capability candidates.
- Add six containment edges for exact reused capabilities.
- Add no prerequisite or equivalence edge for the new capabilities.
- Remove `math.im1.edge.1267`. Writing a function from two points is not a required operation for rewriting rates to a common time unit in Lesson 8-4. The edge records lesson sequence only.
- Edge `math.im1.edge.1266` is already in the accepted Lesson 8-2 repair scope. Do not restore it.
- Recompute affected SRS prerequisite copies with the existing projector.
- Remove the six placeholder activity rows from the empty 8e and 8f mode specifications.
- Preserve inactive planning rows for repaired 8e and 8f. Add inactive planning rows for five new skills. Set `generatorReady` to `false`.
- Add no exact activity or evidence mapping. Source presence does not prove a reviewed three-mode activity.
- Preserve historical standard alignments. Do not add a standard alignment from this review.

The source batch and graph batch must preserve separate approval decisions. Replacing approved source text requires those changed source rows to return to draft.

## Required tests

1. Parse all 35 numbered source problems.
2. Assert all point pairs, equations, table values, subparts, units, historical boundaries, and rounding directions.
3. Assert the four graph assets and two table assets use the original bytes.
4. Assert accessible graph descriptions use correct axes, one-unit tick spacing, asymptote, and readable points without giving the equation.
5. Assert no verified result appears in a learner prompt.
6. Assert the four canonical source identities and two rejected duplicate identities in every node copy.
7. Assert repaired 8e and 8f stay draft, inactive, and source-only.
8. Assert all five new skills stay draft, inactive, source-only, and use exact problem references in every node copy.
9. Assert exactly one Lesson 8-3 containment edge for each new and reused skill.
10. Assert manual Problems 18, 27-29, and 32-35 have no false whole-task activity or evidence mapping.
11. Assert edge `1267` and its downstream SRS copies are absent.
12. Assert the six placeholder activities are absent and the inactive planning rows remain.
13. Run the curriculum, coverage matrix, audit, lint, build, and post-build TypeScript checks.

## Proposed counts

- Four canonical source groups.
- Two preserved rejected duplicate source rows.
- Two repaired stable skill rows.
- Five new draft and inactive skill candidates.
- Six exact reused skills: four from Lesson 8-1, one from Lesson 8-2, and one from Lesson 4-2.
- Eleven new lesson-to-skill containment edges: five new and six reuse edges.
- One unsupported prerequisite edge removed in this batch: `math.im1.edge.1267`.
- Six placeholder activity rows removed.
- Seven inactive SRS planning rows for repaired and new Lesson 8-3 skills.

The implementation must derive repository-wide totals from the actual projectors. Do not hard-code current global counts in a source test.

## Expected bounded scope

The source batch changes the Lesson 8-3 text, six extracted assets or accessible equivalents, and one source test. The graph batch changes the four node copies, blueprints, containment and prerequisite edges, the gap queue, coverage matrix, activity projection, SRS projections, rollout audit, and one graph test.

This proposal does not approve source content. It does not add a renderer, generator, activity, evidence path, dependency, or runtime contract.
