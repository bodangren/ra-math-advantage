# IM1 Lesson 8-4 source and capability proposal

Lesson 8-4 needs a source repair before activity authoring. The current lesson is a short summary. It omits the 16 original problems, two source tables, and most required response actions. It also uses ambiguous language for decay factors and decay rates.

Keep the stable Lesson 8-4 source and skill identifiers. Return changed source and capability rows to draft and inactive status. Add two draft and inactive capability candidates. Keep table-model tasks manual until a fitting method is reviewed. Keep the open creation task and multi-operation table tasks manual.

Do not approve a source, blueprint, generator, activity, evidence mapping, prerequisite, equivalence, or standard alignment in this batch.

## Sources reviewed

I read the original worksheet at:

`apps/integrated-math-1/curriculum/source-materials/practice-worksheet-student-bundle/Int1_0804_practice.docx`

I inspected the document XML and all three rendered pages:

- `/tmp/int1_0804_review_20260908/render/page-1.png`
- `/tmp/int1_0804_review_20260908/render/page-2.png`
- `/tmp/int1_0804_review_20260908/render/page-3.png`

The render has two source table assets. It has no graph figure. The last sentence of Problem 16 continues on page 3.

I also read:

- `apps/integrated-math-1/curriculum/modules/module-8-lesson-4`
- `apps/integrated-math-1/curriculum/module-8-class-period-plan.md`
- the current IM1 node, edge, blueprint, activity, teacher-evidence, and SRS catalogs
- the accepted Lesson 8-1 through Lesson 8-3 source and capability reviews
- `/tmp/im1-g41-parent-rate-review.md`

## Original source inventory

The worksheet title is `Transforming Exponential Expressions • Practice`.

It has one explicit worked group:

- `Example 1`, Problems 1-5
  - Problem 1 has parts a-c. It compares 2.1% annual growth with 0.8% quarterly growth. Part a writes equivalent functions with quarterly time units. Part b selects a plan. Part c finds an effective annual rate.
  - Problem 2 has parts a-c. It compares 3.2% annual growth with 0.33% monthly growth. It uses the same three response actions.
  - Problems 3-5 compare rates with different time units. Problem 3 compares 0.95% quarterly with 3.75% annual. Problem 4 compares 0.99% per minute with 0.018% per second. Problem 5 compares 0.25% decay per quarter with 1.34% decay per year.

It has one `Mixed Exercises` group:

- Problem 6 uses a town-population table for 2012-2016. It asks for one model for each town and an effective monthly increase for each model.
- Problems 7-11 compare checking, car-depreciation, investment, certificate-of-deposit, and retirement rates with different time units.
- Problem 12 uses a hawk-population table for 2013-2016. It asks for one model for each preserve and an effective quarterly decrease for each model.
- Problem 13 gives `T(t) = 72 + (212 - 72)2.72^(-0.4t)`. It asks for an equivalent form in which the coefficient of `t` is 1.
- Problem 14 asks why a consumer must compare rates in the same unit.
- Problem 15 asks the learner to create two account cases with different rate units and compare them.
- Problem 16 asks the learner to find and explain the error in a direct comparison of 0.13% monthly interest with 1% annual interest.

The repaired learner lesson must restore every prompt and subpart. It must restore both tables as readable tables. It must preserve the original financial wording. It must not insert verified answers into learner questions.

## Mathematical checks and limits

### Exact equivalent-factor operation

For a periodic factor `b` and `n` periods in a target interval, the target-interval factor is `b^n`. For a target-interval factor `B` split into `n` equal periods, the per-period factor is `B^(1/n)`.

Problem 13 rewrites exactly as:

`T(t) = 72 + 140(2.72^(-0.4))^t`.

The factor is approximately `0.670150643`. The problem does not ask for a cooling rate or a half-life. Do not map it to those operations.

### Checked effective rates

Under the worksheet's apparent per-period interpretation, these comparisons are correct:

- P1: `(1.008)^4 - 1 ≈ 3.238605%`; Bank B exceeds 2.1%.
- P2: `(1.0033)^12 - 1 ≈ 4.032671%`; the ring exceeds 3.2%.
- P3: `(1.0095)^4 - 1 ≈ 3.854494%`; Bank A exceeds 3.75%.
- P4: `(1.00018)^60 - 1 ≈ 1.085755%`; Bacteria B exceeds 0.99% per minute.
- P5: `1 - (0.9975)^4 ≈ 0.996256%`; Species B decreases faster at 1.34% per year.
- P7: `(1.0005)^12 - 1 ≈ 0.601653%`; Plan A exceeds 0.5%.
- P8: `1 - (0.9968)^12 ≈ 3.773132%`; Car B has the larger annual proportional decrease.
- P9: `(1.023)^2 - 1 ≈ 4.6529%`; Account A exceeds 4.2%.
- P10: `(1.0113)^4 - 1 ≈ 4.597193%`; Account Z exceeds 4.5%.
- P11: `(1.005)^12 - 1 ≈ 6.167781%`; Account A exceeds 2.5%.
- P16: `(1.0013)^12 - 1 ≈ 1.571202%`; a direct comparison of 0.13 and 1 is invalid because the units differ.

The wording of Problems 9-11 is financially ambiguous. Standard finance language can interpret 2.3%, 1.13%, and 0.5% as nominal annual percentage rates with semiannual, quarterly, or monthly compounding. Under that interpretation, the effective annual rates are approximately 2.313225%, 1.134797%, and 0.501147%. Each winner reverses. Preserve the source wording. A future rubric must state the per-period worksheet convention or accept a correctly explained nominal annual interpretation. It must not mark one convention wrong without this clarification.

A larger decay factor means a slower proportional decrease. A larger positive decay rate means a faster proportional decrease. The current lesson says that a larger factor can mean faster decay. Remove that statement.

### Table models

The Town A data are 8,000; 8,480; 8,989; 9,528; and 10,100. The Town B data are 9,500; 9,975; 10,474; 10,997; and 11,547. The values are rounded. Consecutive ratios are not exactly equal. A model and its effective monthly rate therefore depend on a stated method.

An endpoint-fit check gives annual factors of approximately `1.060004836` and `1.049992967`. It gives monthly increases of approximately `0.486793%` and `0.407356%`. A future rubric must accept the source's intended rounded-ratio method and other stated reasonable fitting methods within a reviewed tolerance. It must not require exact equality from the rounded table.

The Preserve A data are 114, 111, 108, and 105. The Preserve B data are 120, 115, 110, and 106. These values also do not have exact constant ratios. An endpoint-fit check gives annual factors of approximately `0.972959619` and `0.959492401`. It gives quarterly decreases of approximately `0.682975%` and `1.028447%`. Apply the same model-method rule.

## Stable source identity

Keep this source identifier:

`math.im1.example.8.4.013`

Retitle it to identify the real group:

`Example 1, Problems 1-5: Rewrite and compare exponential rates across time units`

Use the exact source reference:

`apps/integrated-math-1/curriculum/source-materials/practice-worksheet-student-bundle/Int1_0804_practice.docx (Example 1, Problems 1-5)`

Do not assign an `exampleNumber` to a mixed-exercise group. The worksheet has no second example heading. Mixed-only capability blueprints can use exact worksheet problem references and an empty `sourceNodeIds` array under the established source-only draft lifecycle.

Set `.013` to draft in all four node catalogs. Set `independentPracticeReady` to `false`. The source body and exact mapping change.

## Capability decisions

### Repair stable 8g: rewrite an exponential model for a new time unit

Keep this identifier:

`math.im1.skill.8.4.rewrite-exponential-functions-so-rates-share-the-same-time-u`

Use the title:

`Rewrite an exponential model with an equivalent factor for a specified time unit`

The learner uses powers or roots to change the unit represented by one exponent step. Direct evidence is `.013`, Problems 1(a) and 2(a), and Mixed Problem 13. Growth, decay, money, population, seconds, months, quarters, and years are input variants.

Do not include rate comparison in this atomic operation. Do not include model fitting from a table.

Keep this node draft, inactive, and source-only. Remove its three placeholder activity rows. Set its SRS planning row to `generatorReady: false`.

### New 1: determine an effective percent rate for a specified interval

Proposed identifier:

`math.im1.skill.8.4.determine-an-effective-percent-rate-for-a-specified-time-interval`

The learner converts a periodic factor to a target-interval factor and reports the corresponding percent increase or decrease. Direct evidence is `.013`, Problems 1(c) and 2(c). Mixed direct evidence is Problems 6(c) and 12(c).

This operation is distinct from rewriting notation because the response must convert the factor to a percent change. It is distinct from the Lesson 8-3 percent-from-factor task because Lesson 8-4 must first create the equivalent factor for a new interval.

### New 2: compare exponential growth or decay rates expressed in different time units

Proposed identifier:

`math.im1.skill.8.4.compare-exponential-growth-or-decay-rates-across-different-time-units`

The learner converts rates to a common interval, compares the equivalent factors or percent changes, and identifies the faster growth or decay. Direct evidence is `.013`, Problems 1(b), 2(b), and 3-5. Mixed direct evidence is Problems 7-11 and 16. Problem 16 presents an erroneous comparison, but the learner performs the same common-interval conversion, comparison, and explanation. The error-presented input is a variant, not a separate atomic operation.

A future grading contract must preserve the Problem 9-11 convention boundary. For decay, it must distinguish a decay factor from a positive decay rate.

## Deferred table-model mapping

Do not add Lesson 8-4 containment for `math.im1.skill.8.3.write-an-exponential-function-from-equally-spaced-table-data` in this batch. Problems 6(a-b) and 12(a-b) ask for estimates from rounded data. The current Lesson 8-3 node covers a table with an exact common ratio. A reviewer must first define an approximate fitting method, accepted alternatives, and tolerance. Keep these model-writing parts manual.

## Manual and composite tasks

Keep these tasks manual until a reviewed multi-part rubric exists:

- Problems 6 and 12 combine model fitting for two data sets with effective-rate conversion. Each table also requires a model-method assumption.
- Problem 14 asks for a general consumer explanation.
- Problem 15 asks the learner to create the rates, units, account context, comparison method, and conclusion. Its answer space is open.

A manual composite task can use reviewed child capabilities. Do not map the whole task as exact evidence for every child.

## Graph and projection effects

- Preserve all stable identifiers.
- Keep source `.013`, but set the changed row to draft and inactive in all four node copies.
- Keep the stable 8g identifier, but narrow its scope and set it to draft and inactive in all four node copies.
- Add two draft, inactive, source-only capability rows.
- Retain the existing containment edge for repaired 8g. Do not add a duplicate.
- Add two containment edges for the new capabilities.
- Add no Lesson 8-3 table-model reuse edge in this batch.
- Add no prerequisite or equivalence edge for these capabilities.
- Remove `math.im1.edge.1268`. Rewriting exponential time units is not a prerequisite for determining whether a sequence is geometric. The edge records lesson order only.
- Do not restore `math.im1.edge.1267` if the accepted Lesson 8-3 batch removes it. Writing an exponential function from two points is not required for the Lesson 8-4 operations.
- Remove only the three placeholder activities for stable 8g.
- Retain the inactive SRS planning row for repaired 8g. Add inactive SRS planning rows for the two new skills. Set `generatorReady` to `false`.
- Add no activity or evidence mapping. Source presence does not prove a reviewed Worked, Guided, or Independent activity.
- Preserve existing standard alignments as historical rows. Do not approve them or add a new alignment in this source batch.

The proposed result is three Lesson 8-4 atomic skills: one repaired stable skill and two new draft candidates. It has no reuse edge in this batch. The proposal does not count manual tasks as skills.

## Required source repair

The repaired lesson must:

1. Restore all 16 numbered problems and every subpart.
2. Restore both tables with exact years and values.
3. Preserve the original rate wording in Problems 9-11.
4. State the worksheet per-period interpretation separately from the original prompt.
5. State that standard nominal annual percentage rate language gives a different result for Problems 9-11.
6. Preserve Problem 13 exactly as `72 + (212 - 72)2.72^(-0.4t)`.
7. Remove the incorrect larger-decay-factor statement.
8. Keep answers and verification calculations out of learner prompts.
9. Keep source limitations and grading boundaries in teacher or review text.

## Required tests

1. Parse all 16 numbered problems.
2. Assert every subpart and the page-3 continuation of Problem 16.
3. Assert both table data sets exactly.
4. Assert Problems 9-11 preserve their original wording.
5. Assert the lesson states the interpretation boundary without changing the source prompt.
6. Assert Problem 13 preserves the exact equation and requests only an exponent-coefficient rewrite.
7. Assert no verified result appears in a learner prompt.
8. Assert `.013` and repaired 8g remain draft, inactive, and source-only in every node copy.
9. Assert both new skills are draft, inactive, source-only, and use exact problem references.
10. Assert one Lesson 8-4 containment for repaired 8g and each new capability.
11. Assert no new prerequisite, equivalence, activity, evidence, or active SRS row.
12. Assert edges `1267` and `1268` are absent after their owning source batches apply.
13. Assert unrelated nodes, edges, activities, and SRS rows remain unchanged.

## Unresolved curriculum decisions

The source does not define whether Problems 9-11 use periodic rates or nominal annual rates. This is a real response-contract decision. The source repair can preserve both interpretations. A reviewer must select the default convention before an automatically graded activity uses these problems.

The rounded tables do not define a fitting method. A reviewer must select the accepted model method and tolerance before these items support automatic grading.
