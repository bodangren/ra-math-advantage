# IM1 Lesson 6-3 Capability Source Review

## Review scope

This review covers the complete Lesson 6-3 worksheet. It does not approve curriculum content or graph rows.

- Extracted lesson: `apps/integrated-math-1/curriculum/modules/module-6-lesson-3`
- Class plan: `apps/integrated-math-1/curriculum/module-6-class-period-plan.md`
- Original worksheet: `apps/integrated-math-1/curriculum/source-materials/practice-worksheet-student-bundle/Int1_0603_practice.docx`
- Rendered pages: `/tmp/int1_0603_review_20260907_2229/render/page-1.png` through `page-6.png`

Pages 3 and 5 are blank. Pages 1, 2, 4, and 6 contain all 54 problems. The review inspected each visible equation, number line, table, and diagram.

## Current graph state

The graph has one broad approved Lesson 6-3 skill:

- `math.im1.skill.6.3.solve-compound-inequalities-involving-and-and-or-and-express`

This row covers objective 6e. Its blueprint is draft and has no source example links. Objective 6f is absent as an atomic graph capability.

The graph has four worked-example rows. The original worksheet has these headings:

- `Examples 1, 3, and 4`: solve and graph Problems 1 through 16.
- `Example 2`: model and solve Problems 17 and 18.
- `Examples 5 and 6`: write inequalities for the graphs in Problems 19 through 26.

The class plan lists Examples 1 and 2 on the first day. It lists Examples 2 and 3 on the second day. This schedule does not match the original worksheet headings. The second reference to Example 2 is a schedule repeat. It is not new source evidence.

Preserve `.013` through `.016` and their review states. Use these source meanings:

- `.013`: `Example 1: Solve and Graph Compound Inequalities`
- `.014`: `Example 2: Model, Solve, and Graph Contextual Compound Inequalities`
- `.015`: `Example 2: Model, Solve, and Graph Contextual Compound Inequalities (schedule repeat)`
- `.016`: `Example 3: Solve and Graph Compound Inequalities`

Add source-number identities for actual Examples 4, 5, and 6. Use non-colliding IDs such as `.source-004`, `.source-005`, and `.source-006`. Keep `.015` as a schedule row with no blueprint mapping. The existing `.016` ID can retain actual Example 3 because its metadata already gives example number 3. Do not renumber later source rows.

## Proposed capability boundaries

The source supports these draft and inactive candidates:

1. Solve compound inequalities joined by `and` as intersections.
2. Solve compound inequalities joined by `or` as unions.
3. Solve three-part linear inequalities by applying each operation to all three parts.
4. Simplify compound solution sets by detecting overlap, absorption, all real numbers, or the empty set.
5. Graph compound inequality solution sets on number lines.
6. Write compound inequalities from number-line graphs.
7. Model bounded contextual ranges with compound inequalities.
8. Model exterior or disjoint contextual conditions with compound inequalities.
9. Compare the union and intersection of two graphed solution sets.
10. Classify structural claims about compound inequalities as always, sometimes, or never true.

The connector, solution-set operation, and evidence differ between `and` and `or`. Keep Candidates 1 and 2 separate. A three-part inequality requires one transformation across three expressions. Keep Candidate 3 separate from solving two independent inequalities.

Graphing a compound set and reading a compound set each require two boundary decisions and a union or intersection decision. They are more specific than the Lesson 6-1 single-inequality graph capabilities. Do not replace Candidates 5 and 6 with the Lesson 6-1 rows.

Fractions, decimals, calculator use, BMI, density, and sales tax change the representation or context. They do not define separate capabilities.

## Reviewed reuse

The source directly supports these existing draft capabilities:

- `math.im1.skill.6.1.interpret-inequality-solutions-in-context` in Problems 17, 18, 37, and 50.
- `math.im1.skill.6.1.check-whether-values-satisfy-inequalities` in Problem 45.
- `math.im1.skill.6.1.diagnose-inequality-solving-errors` in Problem 46.
- `math.im1.skill.6.2.construct-multi-step-inequalities-with-specified-solution-sets` in Problem 44.
- `math.im1.skill.6.2.analyze-dependent-geometric-constraints-with-linear-inequalities` in Problems 39 and 50.

Problem 46 supplies an incorrect worked solution. It therefore assesses diagnosis directly. This evidence is different from Lesson 6-2, which only asks students to check their own solutions.

Do not reuse `math.im1.skill.6.1.solve-literal-inequalities-with-unknown-coefficient-signs` for Problem 51. The problem states `a > 0`. The sign is known. The task uses a positive parameter without a sign case.

Do not add a separate prerequisite edge from every compound capability to the broad Lesson 6-1 or Lesson 6-2 rows. This source review establishes containment and evidence. It does not establish prerequisite necessity.

## Proposed source mappings

Use these direct worked-example mappings:

- Candidates 1 through 5 -> `.013`, `.016`, `.source-004`
- Candidates 7 and 8 -> `.014`
- Candidate 6 -> `.source-005`, `.source-006`
- Candidates 9 and 10 -> no worked-example source ID

Use these mappings for reused capabilities:

- Interpret inequality solutions in context -> `.014`
- Check whether values satisfy inequalities -> no worked-example source ID
- Diagnose inequality-solving errors -> no worked-example source ID
- Construct multi-step inequalities with specified solution sets -> no worked-example source ID
- Analyze dependent geometric constraints -> no worked-example source ID

Mixed-practice evidence must not be represented as a worked-example heading. Add Lesson 6-3 draft containment for each reused capability. Preserve its original ownership metadata.

The joint headings mean that the source-number identities share the complete heading body. Do not infer an unavailable division of Problems 1 through 16 between Examples 1, 3, and 4. Do not infer an unavailable division of Problems 19 through 26 between Examples 5 and 6.

## Solved example problems

Problems 1 through 16 give:

- 1: `6 <= f < 11`
- 2: `-12 <= n <= -7`
- 3: `y >= 8` or `y < -4`
- 4: `t >= 1` or `t < -1`
- 5: `-4 < p <= 5`
- 6: `-1 <= c < 2`
- 7: `2 <= h < 3`
- 8: all real numbers because `m <= 6` or `m >= 6`
- 9: `y < -3` because this interval absorbs `y <= -4`
- 10: no solution because `a <= -4` and `a > 4` do not intersect
- 11: `4 < b <= 5`
- 12: `-3 < a <= 1/2`
- 13: `m < -6` or `m > -1`
- 14: `n < -3` or `n > -3`, which is all real numbers except `-3`
- 15: `2 <= m < 4`
- 16: `y < 1` or `y >= 6`

Problem 17 gives `x + 8 < 20` or `x + 8 > 35`. Thus, `x < 12` or `x > 27`. A pole height is positive, so the contextual solution is `0 < x < 12` or `x > 27` feet.

Problem 18 gives `770000 <= 365x <= 1600000`. The unrounded daily range is approximately `2109.589 <= x <= 4383.562` gallons. The requested whole-gallon bounds are 2,110 through 4,384 gallons. A grader must state whether it grades the exact inequality or the requested rounded report.

## Recovered number-line graphs

Problems 19 through 26 show:

- 19: `-3 < x <= 3`
- 20: `1 <= x <= 4`
- 21: `x < -2` or `x >= 1`
- 22: `x < -1` or `x > 2`
- 23: `x <= 0` or `x > 3`
- 24: `-2 <= x <= 3`
- 25: `x < -1` or `x >= 1`
- 26: `x <= -1` or `x > 2`

Problem 35 shows the closed interval `54 <= t <= 68` degrees Fahrenheit.

Problem 44 shows `-1 <= x < 8`. It asks for a constructed compound inequality that needs distribution, addition, and division. Many valid constructions satisfy these conditions. A finite single-answer grader is not sufficient.

The two graphs for Problems 47 through 49 show `x > -1` and `x >= 4`. Their union is `x > -1`. Their intersection is `x >= 4`. The tasks assess absorption and the relation between the original sets and the combined sets.

## Solved mixed algebra

Problems 27 through 34 give:

- 27: `-2 < f < -1`
- 28: `w <= -3` or `w >= 2`
- 29: `-2 < b < 6`
- 30: `p <= 0` or `p > 3`
- 31: `-2 <= a < 5`
- 32: `0 < x <= 3`
- 33: `n <= 6` or `n >= 11`
- 34: `n <= 5` or `n > 9`

Problem 36 describes values outside the stated ideal interval. Under an inclusive ideal range, discomfort values are `p < 7.0` or `p > 7.6`. The source says “between” and does not explicitly define endpoint inclusion. Assessment content must state that policy.

Problem 37 gives `2000 <= 1000 + 15s <= 3000` and a bus capacity of 100. For a whole-number student count, the minimum is 67 and the maximum is 100. The upper budget bound alone permits more than 100 students. The capacity constraint controls the contextual maximum.

Problem 38 gives `18.5 <= 703w/72^2 <= 24.9`. The exact bounds are approximately `136.421 <= w <= 183.615` pounds. The requested nearest-tenth report is `136.4 <= w <= 183.6`. This is a textbook BMI calculation. It is not medical guidance.

Problem 39 has side lengths 5, `x`, and `9 - x`. The Triangle Inequality gives `2 < x < 7`. The two unknown side lengths sum to 9. Each unknown side is greater than 2 and less than 7. The labels of the two unknown sides can be exchanged.

Problem 40 is false. The set `x < k` or `x > k` excludes `k`.

Problem 41 gives `-2 < x < 5`. Of the three conditions, `x > -2` is more restrictive than `x > -7`.

Problem 42 uses densities 1.40 g/mL and 0.92 g/mL. A 0.4 gram tablet that sinks in alcohol and floats in calcium chloride has `0.92 < 0.4/v < 1.40` for `v > 0`. Thus, `2/7 < v < 10/23`, or approximately `0.286 < v < 0.435` mL. Equality would describe neutral density, not the stated sink-or-float behavior.

Problem 43 gives an original price from $500 through $1,000. After a 20 percent discount, the range is $400 through $800. After 7 percent sales tax on the discounted price, the range is $428 through $856.

Problem 45 has solution `x < 2` or `x >= 4`. Choice B, `2`, is not a solution.

Problem 46 contains a sign error. The expression `-3x + 7x - 1` simplifies to `4x - 1`, not `-4x - 1`. The displayed division direction is consistent with the incorrect negative coefficient, but the coefficient itself is wrong.

Problem 50 gives `60 <= 1.50(3a + 4) <= 75` if “between” includes both budget limits. Thus, `12 <= a <= 46/3`. The triangle condition `2a > a + 4` gives `a > 4` and does not change the lower bound. The shortest side is 12 feet under the inclusive-budget interpretation. If the budget endpoints are strict, a continuous model has no attained shortest length. Assessment content must state the endpoint policy.

Problem 51a gives `-4/a < x <= 4/a` because `a > 0`. Problem 51b gives `x > 5a` or `x < -6/a`. These results depend on the stated positive parameter.

Problem 52 is nonunique. Many `or` statements have infinitely many solutions. Problem 53 is sometimes true if “bounded on the left and right by two values” means that two boundary values appear. Some `or` sets have two boundary values. Overlapping sets can simplify to all real numbers, and absorbed sets can have one boundary value. The phrase does not mean that the solution set is bounded as an interval. Problem 54 is also nonunique and requires a valid context plus correct union-or-intersection classification.

## Source corrections and limits

Restore all graphs, the store-sign diagram, the BMI formula, the triangle diagram, the density table, the sale label, and the displayed error work. The current “not described” notes are false because each item is readable in the rendered original.

Correct the extraction heading. The worksheet says `Examples 1, 3, and 4`, not only Example 1. It later says `Examples 5 and 6`, not Example 3.

Keep endpoint policies explicit in Problems 18, 36, and 50. Apply positive, whole-number, capacity, and geometric constraints where the context requires them. Keep Problem 38 as textbook mathematics. Keep Problems 44, 52, and 54 open to multiple valid responses.

Problem 53 uses ambiguous natural language. Do not grade “sometimes” from the connector alone. Define whether “bounded by two values” means two boundary points or a bounded solution set.

## Minimum bounded repair

Preserve `.013` through `.016`. Retitle them with the actual source and schedule meanings. Add `.source-004` through `.source-006` for the missing actual example numbers. Keep `.015` unmapped as a schedule repeat.

Restore the readable source figures, formulas, tables, displayed work, and verified mathematical limits. Add the ten candidates as draft and inactive nodes. Add source-only draft blueprints and draft Lesson 6-3 containment edges.

Add Lesson 6-3 draft containment to the five reviewed reused capabilities. Preserve their original ownership metadata. Add no generator, prerequisite, equivalence edge, standards alignment, approval, or readiness claim.

## Independent review disposition

The author accepted the independent review. The original render and DOCX XML confirm that Problem 3 uses a strict less-than symbol. Its result remains `y >= 8` or `y < -4`. The repair will add ten new candidates. It will reuse `math.im1.skill.6.1.interpret-inequality-solutions-in-context` instead of a separate domain-restriction candidate. It will not add a combined formula-solving-and-interpretation candidate. Problems 18, 38, 42, and 50 use the selected compound-solving, contextual-modeling, and interpretation capabilities. Problem 45 is the exact mixed-practice evidence for the checking reuse.

## Author repair result

The bounded repair adds ten new draft and inactive candidates. It adds three draft source-number identities for Examples 4 through 6. It preserves `.013` through `.016` and keeps `.015` as an unmapped schedule repeat.

The repair reuses five capabilities. Only contextual interpretation receives the direct Example 2 source link. The four mixed-practice reuses receive containment without a worked-example link. The repair adds 18 draft containment edges: three source identities, ten new capabilities, and five reused capabilities.

The source now includes the readable graphs, tables, formulas, diagrams, and displayed error. It keeps the strict endpoint in Problem 3. It records the rounding, domain, capacity, geometry, and nonunique-response limits. The repair adds no generator, prerequisite, equivalence edge, standards alignment, approval, or readiness claim.
