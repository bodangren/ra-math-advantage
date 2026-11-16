# IM1 Lesson 5-6 Capability Source Review

## Review scope

This review covers the complete Lesson 5-6 worksheet. It does not approve curriculum content or graph rows.

- Extracted lesson: `apps/integrated-math-1/curriculum/modules/module-5-lesson-6`
- Class plan: `apps/integrated-math-1/curriculum/module-5-class-period-plan.md`
- Original worksheet: `apps/integrated-math-1/curriculum/source-materials/practice-worksheet-student-bundle/Int1_0506_practice.docx`
- Rendered pages: `/tmp/int1_0506_review_20260907_v2/render/page-1.png` through `page-5.png`

The source has five rendered pages. Page 5 is blank. The worksheet has six example labels. Examples 1 and 2 share one heading. Examples 4 and 5 share one heading. The exercise groups show the intended boundary between these examples.

## Current graph state

The graph has one approved broad skill. Its ID is `math.im1.skill.5.6.find-the-inverse-of-a-relation-given-its-graph-table-or-set`. It combines inverse relations from three representations with algebraic inversion. Its blueprint is draft and has empty mode specifications.

The class plan also defines objective 5k. It covers graph reflection, contextual inverse use, and contextual interpretation. The current graph does not contain that objective as a separate skill. The source supports several smaller capabilities within both 5j and 5k.

The six worked-example IDs are stable. Their current titles combine adjacent example groups. Preserve the IDs and review states. Use these exact titles:

- `.022`: `Example 1: Find the Inverse from a Table`
- `.023`: `Example 2: Find the Inverse from Ordered Pairs`
- `.024`: `Example 3: Graph the Inverse of a Function`
- `.025`: `Example 4: Find the Inverse of a Linear Function`
- `.026`: `Example 5: Find the Inverse of Linear Functions with Fractional Coefficients`
- `.027`: `Example 6: Use Inverse Functions in Context`

Problems 1 through 3 are tables under Example 1. Problems 4 through 9 are ordered-pair sets under Example 2. Problems 10 through 15 are graphs under Example 3. Problems 16 through 18 use simple linear expressions under Example 4. Problems 19 through 21 use fractional coefficients or quotient forms under Example 5. Problems 22 through 26 are contextual tasks under Example 6.

## Proposed draft capabilities

The source supports these draft and inactive candidates:

1. Find an inverse relation from a table by switching coordinates.
2. Find an inverse relation from a set of ordered pairs.
3. Relate the domain and range of a relation to the range and domain of its inverse.
4. Graph an inverse relation by reflecting points across `y = x`.
5. Find the inverse of a nonconstant linear function algebraically.
6. Interpret the input and output quantities of an inverse function in context.
7. Use an inverse function to solve a contextual problem.
8. Write an inverse function from a linear equation in two variables.
9. Construct an inverse linear equation from slope and point conditions.
10. Match a linear function with the graph of its inverse.
11. Verify inverse relations by reversing ordered pairs.
12. Verify inverse functions by graphing them with `y = x`.
13. Relate the slopes of a nonconstant linear function and its inverse.
14. Relate the intercepts of a linear relation and its inverse.
15. Distinguish inverse-function notation from reciprocal notation.
16. Solve for unknown parameters from inverse-function conditions.
17. Evaluate whether one reversed input-output pair proves that two functions are inverses.

Candidates 1 and 2 separate table reading from symbolic coordinate reversal. Candidate 3 assesses the domain-range exchange that the current source states directly. Candidate 4 requires a graph construction. Candidate 5 is one method with different coefficient complexity. Examples 4 and 5 must not become duplicate capabilities solely because one group contains fractions.

Candidates 6 and 7 separate contextual interpretation from calculation. Candidates 8 through 17 occur only in Mixed Exercises or reasoning prompts. They need no invented worked-example source links.

## Exact worked-example mapping

Use these source mappings:

- Candidate 1 -> `.022`
- Candidate 2 -> `.023`
- Candidate 3 -> `.022`, `.023`
- Candidate 4 -> `.024`
- Candidate 5 -> `.025`, `.026`, `.027`
- Candidates 6 and 7 -> `.027`
- Candidates 8 through 17 -> no worked-example source ID

Keep the existing broad 5j row as a draft aggregate if the graph contract requires its stable identity. Restore the missing 5k scope through the atomic candidates. Do not approve the aggregate or the candidates.

## Reuse and overlap

Lesson 3-1 already has `math.im1.skill.3.1.express-a-relation-as-a-table-a-graph-a-mapping-and-a-set-of`. That skill supplies representation knowledge, but it does not assess coordinate reversal or the domain-range exchange for an inverse. Do not use it as a substitute for Candidates 1 through 3.

Lesson 2-7 has `math.im1.skill.2.7.solve-literal-equations-and-formulas-for-a-specified-variabl`. The inverse algebra method uses the same equation-solving operation. The Lesson 5-6 source still assesses a distinct inverse-function procedure and notation. A future prerequisite review can consider the Lesson 2-7 relationship. This source repair must not assert a prerequisite automatically.

No other current IM1 skill covers inverse-function graphs, contextual inverse interpretation, inverse notation, or proof of an inverse relationship. Do not duplicate the Lesson 5-6 candidates in another lesson.

## Independently solved examples

The following results use the visible source expressions.

- Problem 16: if `f(x) = 8x - 5`, then `f^-1(x) = (x + 5) / 8`.
- Problem 17: if `f(x) = 6(x + 7)`, then `f^-1(x) = x / 6 - 7`.
- Problem 18: if `f(x) = (3/4)x + 9`, then `f^-1(x) = (4/3)x - 12`.
- Problem 19: if `f(x) = -16 + (2/5)x`, then `f^-1(x) = (5/2)x + 40`.
- Problem 20: if `f(x) = (3x + 5) / 4`, then `f^-1(x) = (4x - 5) / 3`.
- Problem 21: if `f(x) = (-4x + 1) / 5`, then `f^-1(x) = (1 - 5x) / 4`.

The visible graph coordinates support these representative checks:

- Problem 10 has `y = (1/2)x - 4`. Its inverse is `y = 2x + 8`.
- Problem 13 has `y = -2x + 3`. Its inverse is `y = -(1/2)x + 3/2`.
- Problem 14 has `y = (1/2)x - 1`. Its inverse is `y = 2x + 2`.
- Problem 15 has `y = -(3/4)x - 2`. Its inverse is `y = -(4/3)x - 8/3`.

A graph task must accept the reflected line or valid reflected points. It must not require one drawing trace.

## Independently solved context tasks

- Problem 22: `P(x) = 1.25x - 15`, so `P^-1(x) = (x + 15) / 1.25 = 0.8x + 12`. A profit of $10 requires 20 glasses.
- Problem 23: `P(x) = 7.6x - 36`, so `P^-1(x) = (x + 36) / 7.6`. Positive profit requires more than `36 / 7.6`, so whole-dozen sales require at least 5 dozen. The phrase “make a profit” specifies an inequality, not one target profit value.
- Problem 24: `C(x) = 70x + 50`, so `C^-1(x) = (x - 50) / 70`. A charge of $470 represents 6 family members.
- Problem 25: `C(x) = 125 + 16x`, so `C^-1(x) = (x - 125) / 16`. A cost of $269 represents 9 pieces. At 12 feet per piece, the total is 108 feet.
- Problem 26: the source says the base area is `12π` square feet and gives `V(h) = 12πh`. Thus `V^-1(x) = x / (12π)`. A volume of `420π` cubic feet gives a height of 35 feet.

The extracted lesson incorrectly omits `π` from Problem 26. It states an area of 12 square feet and uses `V(h) = 12h`. The repair must restore both occurrences of `π`. The prompt writes `V^-1(h)`, but the inverse input represents volume. A source explanation must identify this unit change.

## Independently solved mixed exercises

Problems 27 through 32 have these inverse equations:

- 27: `f^-1(x) = x/4 + 6`
- 28: `f^-1(x) = 10 - 3x`
- 29: `f^-1(x) = 6x - 42`
- 30: `f^-1(x) = (3/2)x + 12`
- 31: `f^-1(x) = (7/2)x - 14`
- 32: `f^-1(x) = 12x - 7`

Problems 33 through 36 have these inverse equations:

- 33: `f^-1(x) = x/7 - 6/7`
- 34: `f^-1(x) = (3/2)x - 12`
- 35: `f^-1(x) = 2x - 22`
- 36: `f^-1(x) = x/4 + 3/4`

For Problems 37 through 39, function 37 matches graph B, function 38 matches graph C, and function 39 matches graph A.

Problem 40 gives `f^-1(x) = 3x + 10`, `g^-1(x) = (4/3)x - 8`, and `h^-1(x) = -(x + 7)/5`.

Problem 41 reverses the inverse relation to `{(-k, b), (p, -g), (-m, -w), (q, r)}`. Problem 46 gives `a = 15`. Problem 47 gives `a = 2` and `b = 14`.

Problem 48 is always true when `f` and `g` are inverse functions. Problem 49 is sometimes true. One reversed input-output pair is necessary at that pair, but it does not prove that the complete functions are inverses.

## Mathematical and source corrections

The statement “the inverse of a linear function is also a linear function” needs a nonconstant condition. A constant linear function does not have an inverse function on its full domain. Its inverse relation is vertical.

The slope relationship also needs a nonzero condition. If `f(x) = mx + b` with `m != 0`, the inverse slope is `1/m`. The slopes are reciprocals, not negative reciprocals.

The intercept statement is coordinate reversal. An original x-intercept `(a, 0)` becomes the inverse y-intercept `(0, a)`. An original y-intercept `(0, b)` becomes the inverse x-intercept `(b, 0)`. This does not guarantee distinct intercepts, and an assessment must retain the coordinates.

Inverse notation `f^-1(x)` does not mean `1/f(x)`. Problem 45 assesses this distinction directly.

A relation always has an inverse relation after coordinate reversal. An inverse relation is an inverse function only when the original relation is one-to-one on its stated domain. The current extracted source uses “inverse relation” and “inverse function” too freely. The repair must keep this distinction.

Problems 22 through 26 have discrete or physical domains. Glasses, dozens, family members, and wood pieces require whole-number interpretation. Water height can be continuous and must include units.

The current review notes say the graphs and tables cannot be read. All three tables in Problems 1 through 3 and all nine graph groups on pages 1 and 3 are visible in the rendered original. Replace the unavailable-content note with the recovered source values and points. Keep a caveat when a graph line does not cross an exact grid point.

## Minimum bounded repair

Retitle `.022` through `.027` with the exact example scopes. Preserve all stable IDs and review states. Restore the visible tables, ordered-pair sets, equations, graph points, contexts, and mixed exercises in the extracted source.

Add the 17 proposed candidates as draft and inactive nodes. Add source-only draft blueprints. Add only Lesson 5-6 draft containment edges. Keep mixed-only candidates without invented example links.

Keep the existing broad 5j row unchanged as a stable aggregate. Record the missing 5k scope through atomic draft candidates. Add no generator, prerequisite, equivalence edge, standards alignment, approval, or readiness claim.


## G25 source repair result

The G25 repair restores the readable tables, ordered pairs, equations, graph evidence, contexts, and mixed exercises. It preserves worked-example IDs `.022` through `.027`. It adds the 17 atomic candidates as draft and inactive nodes. It adds source-only draft blueprints and draft Lesson 5-6 containment edges.

The broad 5j row remains unchanged as a stable aggregate. The new candidates restore the missing 5k scope without approval. The repair adds no generator, prerequisite, equivalence edge, or standards alignment.

## G25 verification

The focused test failed in four expected areas before the repair. It passes all five tests after the repair. The complete IM1 curriculum suite passes 76 tests in 21 files. The standards inventory passes five tests. The math-content coverage and audit suites pass 36 tests. IM1 lint and standalone TypeScript checks pass.

Before copies are in `/tmp/im1_l56_g25_20260907_212500/before`. After copies are in `/tmp/im1_l56_g25_20260907_212500/after`.
