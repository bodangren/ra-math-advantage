# IM1 Lesson 6-4 Capability Source Review

## Review scope

This review covers the complete Lesson 6-4 worksheet. It does not approve curriculum content or graph rows.

- Extracted lesson: `apps/integrated-math-1/curriculum/modules/module-6-lesson-4`
- Class plan: `apps/integrated-math-1/curriculum/module-6-class-period-plan.md`
- Original worksheet: `apps/integrated-math-1/curriculum/source-materials/practice-worksheet-student-bundle/Int1_0604_practice.docx`
- Rendered pages: `/tmp/int1_0604_review_20260907_2255/render/page-1.png` through `page-7.png`

Pages 2, 4, and 6 are blank. Pages 1, 3, 5, and 7 contain all 60 problems. The review inspected every visible equation, graph, and displayed solution.

## Current graph state and source identities

The graph has one broad approved Lesson 6-4 skill:

- `math.im1.skill.6.4.solve-absolute-value-inequalities-and-rewrite-them-as-compou`

This row combines solving and rewriting. Its blueprint is draft and has no source links. Objective 6h is absent as an atomic graph capability.

The original worksheet has two headings:

- `Examples 1, 2, 4, 5`: solve and graph Problems 1 through 20.
- `Example 3`: model the contexts in Problems 21 through 25.

The graph already has `.017` through `.021` for Examples 1 through 5. Preserve all five IDs and review states. No new source-number ID is necessary. Use these exact meanings:

- `.017`: `Example 1: Solve and Graph Absolute Value Inequalities`
- `.018`: `Example 2: Solve and Graph Absolute Value Inequalities`
- `.019`: `Example 3: Model Absolute Value Inequalities in Context`
- `.020`: `Example 4: Solve and Graph Absolute Value Inequalities`
- `.021`: `Example 5: Solve and Graph Absolute Value Inequalities`

Examples 1, 2, 4, and 5 share one source heading and one body. Do not infer an unavailable division of Problems 1 through 20 between the four example numbers.

## Proposed atomic capabilities

The source supports these draft and inactive candidates:

1. Rewrite and solve less-than absolute value inequalities as bounded `and` inequalities.
2. Rewrite and solve greater-than absolute value inequalities as exterior `or` inequalities.
3. Classify negative-bound absolute value inequalities as no solution or all real numbers.
4. Isolate a scaled or rational absolute value expression before the compound-inequality conversion.
5. Model a centered within-tolerance range with an absolute value inequality.
6. Model values outside a centered acceptable range with an absolute value inequality.
7. Write an absolute value inequality from a symmetric bounded number-line graph.
8. Write an absolute value inequality from a symmetric exterior number-line graph.
9. Solve a two-sided bound on an absolute value expression.
10. Analyze and justify equivalence and structural claims about absolute value and compound inequalities.
11. Construct an absolute value inequality from specified numerical constraints.

Candidates 1 and 2 use different compound connectors and different set operations. Candidate 3 depends on the nonnegative range of absolute value, not on ordinary compound simplification. Candidate 4 assesses isolation before a case split. It does not create a separate capability for each fraction or coefficient.

Candidates 5 and 6 require different set shapes. A within-tolerance statement gives a bounded set. An outside-acceptable statement gives an exterior union. Candidates 7 and 8 reverse this modeling process from a graph.

Candidate 9 is distinct because both a lower and upper bound apply to one absolute value expression. Its solution is a union of two bounded intervals. Candidate 10 covers comparison and justification. Candidate 11 has many valid answers and requires constraint-based grading.

Calculator use, percentages, temperature, paint, weight, test scores, forensics, architecture, and cost change the representation or context. They do not define separate mathematical capabilities.

## Reviewed reuse

The source directly reuses these draft capabilities:

- `math.im1.skill.6.3.solve-and-compound-inequalities-as-intersections`
- `math.im1.skill.6.3.solve-or-compound-inequalities-as-unions`
- `math.im1.skill.6.3.graph-compound-inequality-solution-sets`
- `math.im1.skill.6.1.interpret-inequality-solutions-in-context`
- `math.im1.skill.6.1.diagnose-inequality-solving-errors`

After conversion, the `and`, `or`, and graphing actions are the same actions reviewed in Lesson 6-3. Context interpretation is the same action reviewed in Lesson 6-1. Problems 51 and 55 supply incorrect work or an incorrect graph, so they directly assess error diagnosis.

Do not add an equivalence edge between the broad Lesson 6-4 skill and the Lesson 6-3 compound skills. The absolute value representation adds a conversion decision. The complete capabilities are not equivalent.

## Proposed source mappings

Let the shared solve source set be `.017`, `.018`, `.020`, and `.021`.

Use these mappings for the new candidates:

- Candidates 1 through 4 -> the shared solve source set
- Candidates 5 and 6 -> `.019`
- Candidates 7 through 11 -> no worked-example source ID

Use these mappings for reused capabilities:

- Solve `and` compounds -> the shared solve source set
- Solve `or` compounds -> the shared solve source set
- Graph compound solution sets -> the shared solve source set
- Interpret inequality solutions in context -> `.019`
- Diagnose inequality-solving errors -> no worked-example source ID

Mixed-practice evidence must not be represented as a worked-example heading. Add Lesson 6-4 draft containment for each reuse. Preserve its original ownership metadata.

## Solved source examples

Problems 1 through 20 give:

- 1: `-24 < x < 8`
- 2: `-3 <= r <= 1`
- 3: `-3 <= c <= 4`
- 4: `-3 < h < 5`
- 5 and 6: no solution
- 7: `r < -8` or `r > 4`
- 8: `k < 1` or `k > 7`
- 9: `h <= -3` or `h >= 6`
- 10: `p <= -3` or `p >= 2`
- 11 and 12: all real numbers
- 13: `n <= -21/4` or `n >= 15/4`
- 14: `-4/5 <= t <= 8/5`
- 15: `-17/3 < h < 5`
- 16: `p <= -14` or `p >= 22`
- 17: no solution
- 18: all real numbers
- 19: `-2 < r < 2/3`
- 20: `p < -4` or `p > -2/3`

The extracted negative-coefficient example correctly reverses both inequality symbols during division. The final order must be written as `-2 < r < 2/3`.

## Context mathematics and limits

Problem 21 states that the speedometer must be within 2.5 percent of the actual speed. If `s` is the actual speed and the display reads 60, the model is `|60 - s| <= 0.025s`, with `s > 0`. It gives approximately `58.537 <= s <= 61.538` mph. The extracted lesson instead uses `|s - 60| <= 0.025(60)` and gets 58.5 through 61.5. That model uses 2.5 percent of the displayed speed. It does not match the printed statement.

Problem 22 gives midpoint 375 and radius 25. Its model is `|t - 375| <= 25`, with `350 <= t <= 400` degrees Fahrenheit.

Problem 23 gives `|p - 130| <= 3.05`, with `126.95 <= p <= 133.05` fluid ounces.

Problem 24 treats 9 through 11 pounds as the stated healthy interval. Under inclusive healthy endpoints, unhealthy values satisfy `|w - 10| > 1`. The context requires `w > 0`.

Problem 25 gives `|s - 515| <= 114`, with `401 <= s <= 629`. Two stated standard deviations give `|s - 515| <= 228`, with `287 <= s <= 743`. These are source data, not current SAT policy.

## Recovered graphs and matching

Problems 26 through 31 show:

- 26: `2 < x < 4`, so `|x - 3| < 1`
- 27: `x <= -3` or `x >= -1`, so `|x + 2| >= 1`
- 28: `x < -10` or `x > -2`, so `|x + 6| > 4`
- 29: `0 < x < 4`, so `|x - 2| < 2`
- 30: `1 <= x <= 9`, so `|x - 5| <= 4`
- 31: `x < -1` or `x > 1`, so `|x| > 1`

Problems 32 through 35 match as follows:

- 32, `|x| > 2`, matches graph b.
- 33, `|x - 2| <= 3`, matches graph d.
- 34, `|x + 1| < 4`, matches graph a.
- 35, `|-x + 1.5| < 3`, matches graph c because it is equivalent to `|x - 1.5| < 3`.

Problems 36 through 38 give `|t - 52| <= 3`, `|s - 92| <= 8`, and `|a - 87| <= 25`. Their solution intervals are 49 through 55, 84 through 100, and 62 through 112. The source phrase “within” must have a stated inclusive policy in assessment content.

## Solved mixed problems

Problems 39 through 44 give:

- 39: `-1 <= x <= 3`
- 40: `x <= -1` or `x >= 2`
- 41: `-9 <= x <= 3`
- 42: `x <= -11.5` or `x >= -2.5`
- 43: `x < -17` or `x > 18`
- 44: `-3 < x < 2`

Problem 45 has all real numbers as solutions because every absolute value is greater than `-1`.

Problem 46 gives the predicted height `2.4(47) + 46.2 = 159` centimeters. A 3-centimeter margin gives 156 through 162 centimeters. It does not include 170 centimeters.

Problem 47 sends back boxes with `|w - 516| > 4`. Their weights are less than 512 grams or greater than 520 grams. The accepted range includes the two endpoints if “within 4 grams” is inclusive.

Problem 48a is nonunique because many compound inequalities simplify to `x >= 4`. Problem 48b can use `x >= 4` and `x <= 4` to produce the singleton `{4}`.

Problem 49 compares `|x - 2| > 4`, whose set is `x < -2` or `x > 6`, with `-2x < 4` or `x > 6`, whose set simplifies to `x > -2`. The sets are not equal. Division of `-2x < 4` by a negative number reverses the symbol.

Problem 50a gives a positive house width no greater than `90 - 40 = 50` feet. Using 50 feet in part b gives `2800 <= 50l <= 3200`, so `56 <= l <= 64` feet. Part c gives `|c - 175000| <= 20000`, so the stated cost range is $155,000 through $195,000.

Problem 51 has solution `x > 7` or `x < -13`. Jordan is correct. Chloe changes `-(x + 3)` to `-x + 3`; the correct distribution is `-x - 3`.

Problem 52 has many valid inequalities because it only specifies the numbers 3, 2, and -7. A grader must evaluate the submitted inequality and its solution together.

Problem 53 gives `-8 <= n < -3` or `1 < n <= 6`. The strict lower absolute-value bound excludes `-3` and 1. The closed upper bound includes -8 and 6.

Problem 54 shows `-3 < x < 5`. Statements I and III have this solution set. Statement II is all real numbers because `x < 5` or `x > -1` covers every real value. The answer is C.

Problem 55 should show `a < 1` or `a > 2`. Lucita shades only to the right and marks an extra hole. Her graph is incorrect.

Problem 56 is sometimes true. A positive-threshold greater-than absolute value inequality gives a union of two rays. A less-than inequality gives one bounded interval. A negative threshold can give all real numbers or no solution.

Problem 57 excludes zero because `|0|` is not greater than zero. Problem 59 asks for the connector rule and a complete solution method.

Problem 60 permits more than one defensible “does not belong” argument. The four displayed inequalities have exterior, bounded, all-real, and empty solution-set behavior. Grade the mathematical justification instead of one label.

## Source corrections and limits

Correct the joint source heading to `Examples 1, 2, 4, 5`. Keep Example 3 as the context heading. Retitle `.017` through `.021` without changing their identities or status.

Restore all number-line graphs, matching graphs, displayed student work, and the four Problem 60 inequalities. Remove each false “not described” note.

Correct the speedometer model to use 2.5 percent of actual speed. Preserve endpoint rules for `within`, `inclusive`, and exterior ranges. Apply positive measurement, score, and geometry domains where the context requires them.

Keep Problems 48, 52, and 60 open to multiple valid responses. Keep Problem 53 endpoint types exact. Do not treat the presence of a fraction, decimal, or context as a separate capability.

## Minimum bounded repair

Preserve `.017` through `.021`. Retitle each row with its actual source meaning. Restore the readable source expressions, graphs, displayed work, and verified mathematical limits.

Add the 11 candidates as draft and inactive nodes. Add source-only draft blueprints and draft Lesson 6-4 containment edges. Add Lesson 6-4 containment and the stated direct source links to the five reused capabilities. Preserve their original ownership metadata.

Add no generator, prerequisite, equivalence edge, standards alignment, approval, or readiness claim.

## Implementation result

The bounded repair implements the accepted draft inventory. It adds 11 draft and inactive skill rows. It adds 11 source-only draft blueprints. It adds 16 draft containment edges: 11 for the new candidates and five for the reviewed reuses.

The repair preserves source IDs `.017` through `.021`. Examples 1, 2, 4, and 5 use the same joint source heading and body. Example 3 keeps the contextual body. The repair preserves all earlier graph rows and edges.

The extracted lesson now records the recovered graph meanings, displayed student work, Problem 60 expressions, endpoint policies, and nonunique response limits. Problem 21 now uses `|60 - s| <= 0.025s`. Its exact bounds are `2400/41 <= s <= 800/13`.

All new nodes and blueprints remain draft. All new nodes have `independentPracticeReady: false`. The repair adds no generator, prerequisite, equivalence edge, standards alignment, approval, or runtime readiness claim.

## Verification result

The focused Lesson 6-4 test failed in five of six cases before the repair. The source, identity, capability, reuse, and draft-boundary cases were Red.

The complete IM1 curriculum suite passes: 98 tests in 25 files. The coverage-matrix and audit suites pass: 36 tests in two files. The IM1 app lint and standalone TypeScript checks pass. The math-content package lint and standalone TypeScript checks pass.

The optional scaffold suite has one pre-existing failure in 50 tests. Its old vertical-slice assertion requires each Module 1 gap-queue row to have a registered generator. The before-copy already contains six restored Module 1 source gaps without generators. G29 does not change those rows or that test.

Before-copies are in `/tmp/g29_lesson64_before_20260907_231427`.
