# IM1 Lesson 6-2 Capability Source Review

## Review scope

This review covers the complete Lesson 6-2 worksheet. It does not approve curriculum content or graph rows.

- Extracted lesson: `apps/integrated-math-1/curriculum/modules/module-6-lesson-2`
- Class plan: `apps/integrated-math-1/curriculum/module-6-class-period-plan.md`
- Original worksheet: `apps/integrated-math-1/curriculum/source-materials/practice-worksheet-student-bundle/Int1_0602_practice.docx`
- Rendered pages: `/tmp/int1_0602_review_20260907/render/page-1.png` through `page-6.png`

Pages 2 and 4 are blank. The complete source has three actual example headings and Problems 1 through 52.

## Current graph state

The graph has one broad approved Lesson 6-2 skill. Its ID is `math.im1.skill.6.2.solve-multi-step-linear-inequalities-using-the-distributive`. It represents objective 6c. The graph does not contain objective 6d for special solution sets.

The graph has five worked-example rows. IDs `.008`, `.009`, and `.010` represent actual Examples 1, 2, and 3. IDs `.011` and `.012` repeat Examples 2 and 3 because the class plan schedules them again on the second instruction day. They are schedule occurrences, not separate source examples. Preserve all five IDs and review states. Do not use `.011` or `.012` as separate source evidence.

Use these exact source titles:

- `.008`: `Example 1: Write and Solve Contextual Inequalities`
- `.009`: `Example 2: Translate, Solve, and Graph Verbal Inequalities`
- `.010`: `Example 3: Solve and Graph Multi-Step Inequalities`
- `.011`: `Example 2: Translate, Solve, and Graph Verbal Inequalities (schedule repeat)`
- `.012`: `Example 3: Solve and Graph Multi-Step Inequalities (schedule repeat)`

## Capability boundaries

The source supports these new draft and inactive candidates:

1. Solve multi-step linear inequalities by simplifying and collecting terms.
2. Apply the Distributive Property in a linear inequality, including a negative factor.
3. Classify an inequality as having no solution or all real numbers after variable terms cancel.
4. Generalize a contextual inequality model with a parameterized unit interval.
5. Construct a multi-step inequality with a specified solution set and required algebraic properties.
6. Explain and justify each transformation in a multi-step inequality solution.
7. Analyze dependent geometric constraints expressed by a linear inequality.

Fractions, decimals, and use of a graphing calculator change the item representation or tool. They do not define separate mathematical capabilities. Empty-set and all-real outputs are two outcomes of the same variable-cancellation classification process. Keep them in one capability.

The source also directly reuses these draft Lesson 6-1 capabilities:

- `math.im1.skill.6.1.write-inequalities-from-contextual-statements`
- `math.im1.skill.6.1.solve-contextual-inequalities`
- `math.im1.skill.6.1.interpret-inequality-solutions-in-context`
- `math.im1.skill.6.1.graph-solved-one-step-inequalities-on-number-lines`
- `math.im1.skill.6.1.translate-comparative-statements-into-symbolic-inequalities`
- `math.im1.skill.6.1.check-whether-values-satisfy-inequalities`
- `math.im1.skill.6.1.solve-literal-inequalities-with-unknown-coefficient-signs`

The graphing candidate can retain its Lesson 6-1 title. In Lesson 6-2, the graph is the final representation after a multi-step solution. The graph action itself is unchanged. Context modeling, interpretation, checking, error analysis, and unknown coefficient sign cases also remain the same assessed actions.

## Exact source mapping

Use these source mappings for the seven new candidates:

- Candidate 1 -> `.008`, `.009`, `.010`
- Candidate 2 -> `.010`
- Candidate 3 -> `.010`
- Candidate 4 -> `.008`
- Candidates 5 through 7 -> no worked-example source ID

Use these mappings for reused Lesson 6-1 candidates:

- Write contextual inequality -> `.008`
- Solve contextual inequality -> `.008`
- Interpret contextual solution -> `.008`
- Graph solved inequality -> `.009`, `.010`
- Translate comparative statement -> `.009`
- Check a solution -> no direct worked example
- Solve with unknown coefficient sign -> no direct worked example

Add Lesson 6-2 draft containment to each reused capability. Preserve its Lesson 6-1 ownership metadata. Do not map `.011` or `.012` into a blueprint.

## Independently solved Example 1

Problem 1 gives `15 + 2h <= 35`, so `h <= 10` hours.

Problem 2 gives `x + (x + 1) + (x + 2) > 60`, so `x > 19`. For whole-number ages, the youngest is at least 20 and the oldest is at least 22. The question “How old can the oldest brother be?” has no maximum under the stated inequality. A source explanation must state the lower bound instead of inventing one age.

Problem 3 uses fifth-mile segments. The number of additional fifth miles in `x` miles is `5x - 1`. Thus, `1.50 + 0.25(5x - 1) <= 3.75`, so `x <= 2` miles. For a first `1/a` mile and each additional `1/a` mile, the count of additional segments is `ax - 1`. This generalization assumes that `ax` is a valid whole segment count and that `a > 0`.

Problem 4 gives `7.65 + 0.49x <= 10`, so `x <= 4.7959...`. Keshila can buy at most 4 whole stamps.

Problem 5 gives `100 + 40x <= 250`, so `x <= 3.75`. Nathaniel can invite at most 3 whole people under the stated one-table model.

## Independently solved Examples 2 and 3

Problems 6 through 15 give:

- 6: `n >= -2`
- 7: `n < 3`
- 8: `n <= -40`
- 9: `n > 56`
- 10: `n >= 1`
- 11: `n < -3`
- 12: `n <= -9`
- 13: `n > -24/5`
- 14: `n <= -1`
- 15: `n < -15`

Problem 12 means `8 - n/3 >= 11`. The wording does not mean `(8 - n)/3 >= 11`. A generated item must make the grouping explicit.

Problems 16 through 21 give:

- 16: `n > -1/3`
- 17: `a <= 11`
- 18: no solution, because it reduces to `4 > 6`
- 19: all real numbers, because it reduces to `6 < 10`
- 20: `t >= -1`
- 21: `a >= -9`

Problems 18 and 19 directly support the special-solution capability. Do not teach variable cancellation as automatic evidence of no solution. Evaluate the remaining numerical statement.

## Mixed algebra and boundary cases

Problems 22 through 27 give `x >= 8`, `x >= 1/2`, `z < -2`, `m >= 18`, `m <= 3`, and `w > -2`.

Problems 28 through 33 ask for graphing-calculator use and give `x < -2`, `x <= 8`, `x > -3`, `x > -6`, `x >= -64/3`, and `x >= 3/2`. These items do not state a separate calculator-analysis method. The source still requires the correct mathematical solution.

Problems 34 through 36 give `g > 4.5`, `p <= 10/9`, and `r <= 2.3`.

Problem 37 gives `4 + 2h <= 13`, so one level is at most 4.5 feet tall. If one 8-foot level replaces the two levels, its height above ground is at most 5 feet.

Problem 38a uses Clark's Rule. A child who weighs no more than 90 pounds receives no more than 600 milligrams when the adult dose is 1,000 milligrams. The visible label gives 10 mL for weights 48 through 95 pounds. If Clark's Rule and that closed range are used, an adult dose that produces 10 mL is `1500/w` mL. The adult minimum is approximately 15.79 mL at 95 pounds. The adult maximum is 31.25 mL at 48 pounds. This is textbook mathematics, not current medical guidance.

Problem 39 gives `15 + 6p < 20`, so `p < 5/6`. With a nonnegative whole-number count, Eric has 0 pencils. This unusual result follows from the printed statement.

Problem 40 gives `w <= 22` and `2l + 2w <= 120`, so `l <= 60 - w`. The source does not give one width. It therefore does not give one fixed maximum length. A response must keep the dependent constraint and positive-length assumptions.

Problem 41 gives `n < -1`.

Problem 42 reduces `2(2x + 4) < 4(x + 1)` to `8 < 4`, so it has no solution. Replacing `<` with `>=` gives `8 >= 4`, so all real numbers are solutions.

Problem 43 gives `(76 + 80 + 78 + x)/4 >= 82`, so `x >= 94`.

Problem 44 has `b = a + 2` and `c = a + 4`. The perimeter constraint gives `3a + 6 <= 20`, so `a <= 14/3`. A valid nondegenerate triangle also requires `a + b > c`, so `a > 2`. The shortest side must satisfy `2 < a <= 14/3` feet. A solution that omits the triangle inequality admits invalid side lengths.

Problem 45 shows `x < 3`. Many inequalities satisfy the requested solution set and required use of distribution, addition, and division. Grading must accept mathematically valid constructions, not one stored expression.

Problem 46 asks whether `ab > 2a` follows from `b > 2`. It does when `a > 0`. Equality holds when `a = 0`. The inequality reverses when `a < 0`.

Problem 47 gives `4x > 5x - 15`, so `x < 15`. A nonnegative whole-number card count is from 0 through 14.

Problem 48 solves `-3p + 7 >= -2` without division by a negative number: add `3p`, then add 2, to get `9 >= 3p`, so `p <= 3`.

Problem 49 states that `ax + b < ax + c` is true for all real `x`. Thus, `b < c`. The inequality `ax + b > ax + c` reduces to `b > c`, so it has no solution.

Problem 50 contains four readable inequalities. `4y + 9 > -3` gives `y > -3`. Each other choice gives `y > 3`. The first inequality does not belong.

Problem 51 asks for constructed examples of an empty solution set and all real numbers. Many valid examples exist.

Problem 52 states `a != 0`. Each part needs separate cases for `a > 0` and `a < 0`. For example, `ax + 5 < 11` gives `x < 6/a` when `a > 0` and `x > 6/a` when `a < 0`. A grader must not divide by `a` without checking its sign.

## Source corrections and limits

The current extraction says the medicine label, exam prompt, carpet figure, number-line graph, and Problem 50 inequalities are unavailable. All are readable in the rendered original. Restore them.

The source defines `inequality` with `!=` in the vocabulary list. This lesson uses order inequalities. A not-equal relation does not have one ray solution in the same form. Keep `!=` out of the operational definition for this lesson unless a task teaches its two-ray solution set.

The phrase “graphing calculator to solve” in Problems 28 through 33 names a tool. It does not establish a distinct graph-analysis capability without a required method or evidence trace.

Problem 2 has no maximum age. Problem 3 assumes discrete fifth-mile segments. Problems 4, 5, 39, and 47 require whole-number interpretations. Problem 38 must remain a textbook calculation. Problem 40 is underdetermined without a width. Problem 44 needs the triangle inequality. Problem 45 is nonunique. Problem 52 needs coefficient-sign cases.

## Minimum bounded repair

Retitle `.008` through `.012` with the exact source and schedule-repeat meanings. Preserve all IDs and review states. Treat `.011` and `.012` as schedule repeats with no blueprint source links.

Restore all readable source expressions, labels, figures, and contextual limits. Add the seven new candidates as draft and inactive nodes. Add source-only draft blueprints and draft Lesson 6-2 containment edges.

Add the stated Lesson 6-2 containment and direct source links to the seven reused Lesson 6-1 candidates. Preserve their Lesson 6-1 ownership metadata. Add no generator, prerequisite, equivalence edge, standards alignment, approval, or readiness claim.

## Author repair result

The bounded repair implements the seven new draft candidates and the seven reviewed reuses. All candidates remain inactive. The new blueprints contain source references only. The repair adds no generator, prerequisite, equivalence edge, standards alignment, approval, or readiness claim.

The repair preserves `.008` through `.012`. It maps only the three actual examples. The schedule-repeat rows `.011` and `.012` do not supply blueprint evidence. The source now records the readable figures and expressions and the verified mathematical limits.

The Lesson 6-1 source test now permits the exact reviewed Lesson 6-2 containment edges for the seven reused capabilities. It continues to reject other incident edges. This test change records reuse. It does not change the Lesson 6-1 ownership metadata.

### Independent review disposition

The independent review rejected Lesson 6-2 containment for `math.im1.skill.6.1.diagnose-inequality-solving-errors`. The worksheet asks students to check answers and explain valid methods. It does not give an incorrect solution for diagnosis. The author removed only that Lesson 6-2 containment edge. The Lesson 6-1 node, blueprint, ownership, and draft status remain unchanged. The final repair has seven new candidates, seven reused capabilities, and 14 new containment edges.
