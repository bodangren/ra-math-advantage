# IM1 Lesson 6-1 Capability Source Review

## Review scope

The next instructional lesson after Module 5 Lesson 5-6 is Module 6 Lesson 6-1. The Module 5 plan ends with mastery, review, and test periods. The Module 6 plan starts its instruction sequence with Lesson 6-1.

This review covers the complete Lesson 6-1 worksheet. It does not approve curriculum content or graph rows.

- Extracted lesson: `apps/integrated-math-1/curriculum/modules/module-6-lesson-1`
- Class plan: `apps/integrated-math-1/curriculum/module-6-class-period-plan.md`
- Original worksheet: `apps/integrated-math-1/curriculum/source-materials/practice-worksheet-student-bundle/Int1_0601_practice.docx`
- Rendered pages: `/tmp/int1_0601_review_20260907/render/page-1.png` through `page-7.png`

Page 2 is blank. Pages 5 and 7 contain continuations that the renderer placed on separate pages. The complete source contains Problems 1 through 82.

## Current graph state

The graph has one broad approved Lesson 6-1 skill. Its ID is `math.im1.skill.6.1.graph-the-solution-set-of-a-one-step-inequality-on-a-number`. It combines graphing solution sets with writing inequalities from graphs. The class plan also defines objective 6b for solving one-step inequalities. The graph has no separate 6b skill.

The graph contains worked-example IDs `.001` through `.007`. The source also has a joint `Examples 8–10` heading. The graph does not contain source identities for Examples 8, 9, and 10. A bounded repair must preserve `.001` through `.007` and add deterministic, noncolliding source-number IDs for 8 through 10.

Use these existing example titles:

- `.001`: `Example 1: Graph Solution Sets`
- `.002`: `Example 2: Write Inequalities from Graphs`
- `.003`, `.004`, `.005`: `Example 3–5: Solve Inequalities by Addition and Subtraction`, with the stable example number in each title
- `.006`: `Example 6: Model and Solve Contextual Inequalities`
- `.007`: `Example 7: Solve and Interpret Contextual Inequalities`

Add these source identities:

- `math.im1.example.6.1.source-008`
- `math.im1.example.6.1.source-009`
- `math.im1.example.6.1.source-010`

Each new identity must record its historical example number. The source presents Examples 8 through 10 under one joint heading, `Solve each inequality. Graph the solution on a number line.` Do not invent a distinct method for each number.

## Proposed draft capabilities

The source supports these draft and inactive candidates:

1. Graph a symbolic inequality on a number line.
2. Write an inequality from a number-line graph.
3. Solve one-step inequalities by addition or subtraction.
4. Solve inequalities with variable terms on both sides by addition or subtraction.
5. Write an inequality from a contextual statement.
6. Solve a contextual inequality.
7. Interpret an inequality solution in context.
8. Solve one-step inequalities by multiplication or division with a positive factor.
9. Solve one-step inequalities by multiplication or division with a negative factor and reverse the inequality symbol.
10. Graph a solved one-step inequality on a number line.
11. Translate comparative verbal statements into symbolic inequalities.
12. Check whether a value satisfies an inequality.
13. Diagnose an inequality-solving error.
14. Solve a literal inequality when the coefficient sign is unknown.
15. Analyze how reciprocals affect inequality order across sign cases.

Candidates 1 and 2 are the two actions in objective 6a. Candidates 3, 8, and 9 separate the operation and sign cases in objective 6b. Candidate 4 is explicit in Problems 25 through 30 even though these items need more than one algebraic collection step. Candidates 5 through 7 separate modeling, solving, and interpreting. Candidates 11 through 15 occur in mixed practice and reasoning tasks.

Open or closed boundaries and ray direction are evidence requirements for Candidates 1, 2, and 10. They do not require separate capability nodes. Decimal and fractional coefficients change item complexity. They do not require separate method nodes.

## Exact source mapping

Use these worked-example mappings:

- Candidate 1 -> `.001`
- Candidate 2 -> `.002`
- Candidate 3 -> `.003`, `.004`, `.005`
- Candidate 4 -> `.003`, `.004`, `.005`
- Candidate 5 -> `.006`, `.007`
- Candidate 6 -> `.006`, `.007`
- Candidate 7 -> `.006`, `.007`
- Candidates 8, 9, and 10 -> `source-008`, `source-009`, `source-010`
- Candidates 11 through 15 -> no worked-example source ID

The joint Examples 8–10 source does not show three independently labeled submethods. Map all three identities to each directly demonstrated multiplication, division, sign-reversal, and graphing capability. This preserves the source schedule without claiming a false method boundary.

Keep the existing broad 6a row as a stable aggregate if the graph contract requires it. Restore objective 6b through the atomic candidates. Do not approve any new row.

## Reuse and overlap

Lesson 2 equation-solving skills supply inverse-operation knowledge. Inequality solving adds order preservation and sign reversal. Do not reuse an equation-solving node as a substitute for Candidates 3, 8, or 9.

Lesson 1-6 includes ratios and percentages. Problems 31, 35, 36, 75, 76, and 78 use percentages, averages, or rates inside inequality models. The assessed action remains inequality modeling and interpretation. Do not add duplicate ratio or average capabilities to Lesson 6-1.

No current IM1 skill separately covers number-line inequality translation, the negative-factor reversal rule, or literal inequalities with an unknown coefficient sign. A future prerequisite review can connect these concepts. This source repair must not add prerequisites automatically.

## Source mathematics

### Number-line graphs

The visible graphs in Problems 7 through 12 give:

- 7: `x < -1`
- 8: `x > -6`
- 9: `x < 5`
- 10: `x <= 1`
- 11: `x >= -5`
- 12: `x <= -6`

An open circle excludes the boundary. A closed circle includes it. The ray shows the solution direction.

### Context examples

Problem 31 gives `4.50 >= (3/10)c`, where `c` is the total pizza cost. Thus, `c <= 15`. The phrase “at least her fair share” makes $15 a maximum total cost under the stated payment model.

For Problem 32a, `162 + x >= 207`, so the wind speed must increase by at least 45 mph to reach F4. For Problem 32b, the slowest listed tornado speed is 40 mph. A speed of at least 158 mph is at least 118 mph greater.

Problem 33 leaves at most `4.6 - 2.5 = 2.1` pounds for landfill. Problem 34 gives Marshall's service as `2079 + 10463 = 12542` days, so surpassing the record requires more than 12,542 days. Problem 35 leaves at least 2% of at least 25,000 pieces unresolved, so at least 500 pieces remain lost. Problem 36 gives `(86 + 88 + 78 + x) / 4 >= 83`, so `x >= 80`.

### Multiplication and division examples

Problems 37 through 54 have these solutions:

- 37: `m <= -68`
- 38: `a < 40`
- 39: `c > 121`
- 40: `d >= 68`
- 41: `x <= 20`
- 42: `f < 432`
- 43: `h > 21`
- 44: `j <= -16`
- 45: `n >= 108`
- 46: `p <= 16`
- 47: `r < 16`
- 48: `y > -16`
- 49: `t > -1`
- 50: `v < 12`
- 51: `z >= 11`
- 52: `b <= -3/4`
- 53: `d > -5/2`
- 54: `f < -5/7`

Problems 39 through 42, 44, 45, 48, 50, 51, 53, and 54 require negative-factor sign checks. Problems 43 and 52 use positive coefficients and do not require reversal. Reverse the inequality only when the operation multiplies or divides both sides by a negative number.

## Mixed-practice mathematics

The matching answers for Problems 55 through 60 are 55-d, 56-f, 57-a, 58-c, 59-b, and 60-e.

Problems 61 through 66 give:

- 61: `n <= -25`
- 62: `n >= 35`
- 63: `n <= -1`
- 64: `n <= 24`
- 65: `n >= -7`
- 66: `n >= 2`

Problems 67 through 74 give `c > 4`, `b >= -6`, `x < 36`, `x <= 20`, `m < 5.4`, `n > 1`, `c >= 3.7`, and `k > -5/12`.

Problem 75 gives `225x >= 5000`. The mathematical lower bound is approximately $22.222 per person. Currency requires at least $22.23 per person if the charge uses cents.

Problem 76 gives `6a >= 50`. A person must eat at least 9 whole apples.

Problem 77 states that the blue whale can reach up to 83 decibels more than 105 decibels. The stated upper level is 188 decibels. The wording supports an upper-bound inequality. The item also asks for an external source check. The curriculum source alone cannot certify that factual claim.

Problem 78 says Michelle loses less than 27 points from 100. Her score is greater than 73. For whole-number scores, she earns at least 74, which is grade C or higher under the visible table. The prompt changes the name to Mary in part a. Treat this as a source typo, not a second person.

Problem 79 has answer B. Choice B gives `x > -2`; the other choices give `x < -2`.

Problem 80 shows `3m >= -21`. Heath keeps the symbol and gets `m >= -7`. Marty reverses the symbol while dividing by positive 3 and is incorrect.

Problem 81 cannot have one unconditional quotient answer because `a` can be positive or negative. For `ax < 7`, the result is `x < 7/a` when `a > 0` and `x > 7/a` when `a < 0`. Apply the same sign split to each part. The source states `a != 0`.

Problem 82 is sometimes true. If `a > b`, the claim `1/a > 1/b` is false when both values are positive and also false when both are negative. It is true when `a` is positive and `b` is negative. Cases with zero are undefined and must be excluded.

## Source corrections and limits

The current extraction says the image content is unavailable. The six number-line graphs, Fujita table, grade table, and Problem 80 work samples are readable in the original render. Restore them.

The extracted source calls Problems 25 through 30 “variables on both sides” within one-step inequalities. Problems 25 through 28 and Problem 30 require collecting like variable terms before isolation. Preserve their source placement but do not use them as evidence for a strict one-operation item family.

Problem 29 is `6x + 5 >= 7z` in the original. The extraction changes `z` to `x`. The original is a two-variable literal inequality. It cannot be reduced to one numeric ray without a value or constraint for one variable. Restore `z` and map this item to the literal-inequality candidate instead of the ordinary variable-on-both-sides candidate.

Example 7 currently says the average American creates 4.6 pounds of garbage and at least 2.5 pounds “could be recycled.” The source asks how much would still go to landfill. The conclusion is an upper bound of 2.1 pounds, not one exact amount.

Problem 35 combines two lower bounds. The source supports “at least 500,” not exactly 500.

Problem 77 needs external factual verification. Do not convert its textbook numbers into an approved current-world fact without a separate source review.

Problem 81 requires a case split on the sign of `a`. A grader that divides by `a` without this split teaches an invalid rule.

## Minimum bounded repair

Retitle `.001` through `.007` with their actual source scopes. Preserve all IDs and review states. Add `source-008`, `source-009`, and `source-010` for the missing joint heading. Store the source heading and historical example number.

Restore the readable graphs, tables, worked samples, equations, and mixed-practice text. Add the 15 proposed capabilities as draft and inactive nodes. Add source-only draft blueprints and draft Lesson 6-1 containment edges.

Keep mixed-only capabilities without invented worked-example links. Keep the existing broad 6a row as a stable aggregate. Add no generator, prerequisite, equivalence edge, standards alignment, approval, or readiness claim.


## G26 source repair result

The G26 repair restores the readable graphs, tables, work samples, equations, and context limits. It preserves worked-example IDs `.001` through `.007`. It adds source-number IDs `source-008` through `source-010` for the joint Examples 8–10 heading.

The repair adds the 15 candidates as draft and inactive nodes. It adds source-only draft blueprints and draft Lesson 6-1 containment edges. The broad 6a row remains unchanged as a stable aggregate. The new candidates restore objective 6b without approval. The repair adds no generator, prerequisite, equivalence edge, or standards alignment.

## G26 verification

The focused test failed in four expected areas before the repair. It passes all five tests after the repair. The complete IM1 curriculum suite passes 81 tests in 22 files. The standards inventory passes five tests. The math-content coverage and audit suites pass 36 tests. IM1 lint and standalone TypeScript checks pass.

Before copies are in `/tmp/im1_l61_g26_20260907_213700/before`. After copies are in `/tmp/im1_l61_g26_20260907_213700/after`.
