# IM1 Lesson 7-3 capability source proposal

## Disposition

The current extraction does not preserve the source. It changes equations, omits most problem data, and assigns false Example groups. Do not use the current module text as evidence until a source repair restores Problems 1 through 49.

Add only two new atomic capability candidates for this lesson:

1. Recognize whether direct addition or direct subtraction will eliminate a variable.
2. Solve a one-solution linear system by direct elimination and show the equation-combination step.

Keep both candidates draft and inactive. Use coefficient values, decimals, fractions, and preliminary simplification as variants. Do not create separate capabilities for these numeric forms.

Reuse the existing system capabilities for modeling, contextual interpretation, graph checks, solution-set classification, construction, and digit representation. Do not create duplicate Lesson 7-3 capabilities for those actions.

## Source authority

The source is `apps/integrated-math-1/curriculum/source-materials/practice-worksheet-student-bundle/Int1_0703_practice.docx`.

The reviewed render is `/tmp/int1_0703_review/page-1.png` through `/tmp/int1_0703_review/page-4.png`. The DOCX XML supplies the text that overlaps the table in Problem 42.

The source groups are:

- `Examples 1, 3`: Problems 1 through 27.
- `Example 2`: Problems 28 through 30.
- `Example 4`: Problems 31 through 32.
- `Mixed Exercises`: Problems 33 through 49.

The joint `Examples 1, 3` heading is one source group. It does not identify a boundary between Example 1 practice and Example 3 practice.

## Verified source corrections

Restore each original problem before graph authoring. Include these checked corrections:

- Problem 3 starts with `-4x + 5y = 17`. The minus sign is required.
- Problem 11 starts with `-3x - 8y = -24`. Both minus signs are required.
- Problem 40 gives 12 tulips in each Spring Mix bouquet and 16 tulips in each Garden Delight bouquet. Monday uses 96 tulips. Tuesday uses 192 tulips, with the same Spring Mix count and three times the Garden Delight count. The solution is 4 Spring Mix bouquets and 3 Garden Delight bouquets on Monday. Garden Delight bouquets use 192 tulips across both days.
- Problem 41 gives `4p + 2n = 18.50` and `7p + 2n = 26.75`. A bag of popcorn costs `$2.75`. A plate of nachos costs `$3.75`.
- Problem 42 gives `0.25j + 0.5w = 3.5` for Saturday and `j + 0.5w = 8` for Sunday. The missing DOCX prompts ask the learner to write a system, define the variables, solve by elimination, show the work, and interpret the solution. Erin jogs at 6 miles per hour and walks at 4 miles per hour.
- Problem 43 starts with `0.4x - 2y = 6` and `0.8x + 2y = 0`. The solution is `(5,-2)`. Replacing the second equation with `x - 5y = 15` makes the equations equivalent and gives infinitely many solutions. Replacing it with `0.4x - 2y = 0` gives parallel distinct equations and no solution.
- Problems 44 and 45 ask for counterexamples to false claims about `0 = 0` and `0 = 2`.
- Problem 46 asks for a system that can use addition and for a general construction rule.
- Problem 47 requires a second equation that has `(-3,2)` as a common solution and can use addition.
- Problem 48 gives a digit sum of 8 and `tens - units = -4`. The number is 26.
- Problem 49 asks when elimination is the best method choice.

## Existing source identity repair

Preserve the four stable IDs. Do not invent two separate source ranges under the joint heading.

| Stable ID | Proposed disposition | Exact source |
|---|---|---|
| `math.im1.example.7.3.010` | Retain as the one source node for the joint direct-elimination group. Rename its title and raw text to `Examples 1 and 3: Solve systems by direct elimination`. Keep it draft. | `module-7-lesson-3`, heading `Examples 1, 3`, Problems 1-27 |
| `math.im1.example.7.3.011` | Retain and correct to `Example 2: Model number relationships with a system and solve by elimination`. Keep it draft. | `module-7-lesson-3`, heading `Example 2`, Problems 28-30 |
| `math.im1.example.7.3.012` | Preserve the historical ID as a rejected duplicate of the joint `Examples 1, 3` source group. Remove direct source mappings and evidence links. Do not assign an arbitrary subset of Problems 1-27. | Historical duplicate only |
| `math.im1.example.7.3.013` | Retain and correct to `Example 4: Model and solve contextual systems by elimination`. Keep it draft. | `module-7-lesson-3`, heading `Example 4`, Problems 31-32 |

The current class-plan references are secondary planning references. They do not override the DOCX grouping. Correct all four graph catalogs consistently. Do not transfer evidence from `.012` to `.010`.

## New atomic capability candidates

### Recognize the direct elimination operation

Suggested stable ID:

`math.im1.skill.7.3.choose-addition-or-subtraction-for-direct-elimination`

Suggested title:

`Choose addition or subtraction to eliminate a variable from an aligned linear system`

The learner must identify opposite coefficients for addition or equal coefficients for subtraction. Problem 43(a) and Problem 49 directly require method reasoning. Problems 1 through 27 supply repeated coefficient structures.

Use `.010` as the direct source node. Do not use `.012`.

### Execute direct elimination with procedure evidence

Suggested stable ID:

`math.im1.skill.7.3.solve-one-solution-systems-by-direct-elimination`

Suggested title:

`Solve a one-solution linear system by direct elimination and show the equation-combination step`

The response must show these actions:

1. Align corresponding terms.
2. Add or subtract the equations to cancel one variable.
3. Solve the resulting one-variable equation.
4. Substitute to find the second coordinate.
5. Check the ordered pair in both original equations.

Use `.010` as the direct source node. Problems 1 through 27 are direct procedural practice. Problems 33 through 38 are mixed variants with grouping, decimal coefficients, or fractional coefficients.

A final ordered pair is not sufficient evidence for this capability. The same pair can come from graphing, substitution, inspection, or an external solver. A Worked, Guided, or Independent specification must capture the equation-combination step and the resulting one-variable equation.

## Reuse of existing capabilities

Use these existing nodes instead of new Lesson 7-3 duplicates:

| Source work | Existing capability |
|---|---|
| Write a two-equation system from Problems 28-32 and 39-42 | `math.im1.skill.7.1.write-a-two-equation-system-from-a-context` |
| Solve and interpret Problems 28-32 and 39-42 | `math.im1.skill.7.1.solve-and-interpret-a-contextual-system` |
| Use the graph in Problem 43(c) to check the common solution | `math.im1.skill.7.1.determine-a-system-solution-from-a-graph` |
| Classify the changed systems in Problem 43(d-e) and reason about `0=0` or `0=2` in Problems 44-45 | `math.im1.skill.7.1.classify-a-linear-system-by-its-solution-set` |
| Construct systems in Problems 44-47 | `math.im1.skill.7.1.construct-systems-with-a-specified-number-of-solutions` |
| Represent the two-digit number in Problem 48 | `math.im1.skill.7.2.represent-a-two-digit-number-and-its-digit-reversal-with-lin` |

Problem 49 also supports the new operation-choice candidate. It does not support the substitution-specific efficiency node because the prompt asks about elimination.

Do not use `math.im1.skill.7.2.diagnose-and-correct-an-algebraic-substitution-error` for Problems 44 and 45. Those problems concern elimination outcomes. The solution-set classification node covers the mathematical decision. The counterexample format is an evidence form, not a new mathematical capability.

## Blueprint and edge proposal

Create source-only blueprints for the two new candidates. Use `.010` as the only `sourceNodeId`. Leave all three mode specifications absent. Do not select a renderer or generator. Keep `reviewStatus: draft` and `independentPracticeReady: false`.

Add only `contains` edges from the two new capability candidates to `math.im1.lesson.7.3`. Preserve every existing edge. Add no prerequisite, equivalence, or evidence-transfer edge in the source repair.

The following prerequisite relations are mathematically plausible, but they require a separate edge review:

- `math.im1.skill.2.3.solve-multi-step-linear-equations-using-properties-of-equali` before direct-elimination execution.
- The new operation-choice candidate before direct-elimination execution.
- Direct-elimination execution before elimination-based contextual solution work.

Do not add these prerequisite edges from source proximity alone. The worksheet order does not prove a graph prerequisite.

## Required source test

Add one focused Lesson 7-3 source test. The test must:

1. Read the repaired module and assert all 49 problem numbers are present.
2. Assert the corrected equations for Problems 3, 11, 41, 42, 43, and 48.
3. Assert the full contextual givens and questions for Problems 40 through 42.
4. Assert the verified solutions for Problems 40 through 43 and 48.
5. Assert that `.010`, `.011`, and `.013` use their exact source groups in all four catalogs.
6. Assert that `.012` remains present but rejected, has no direct source mapping, and transfers no evidence.
7. Assert that both new capability rows are draft and inactive in all four catalogs.
8. Assert that the two new blueprints are source-only and reference only `.010`.
9. Assert that only `contains` edges are added for the new capabilities.
10. Assert that all previous node IDs and edge IDs remain present.

Do not use counts or substrings as the only source test. Check the exact equations and contextual data.

## Remaining limits

The original worksheet supplies practice groups. It does not expose the textbook Worked Example bodies. The repaired module can give accurate procedure instruction, but it must not present invented worked steps as recovered textbook prose.

The class plan has a separate `7f` objective for subtraction, decimals, fractions, and simplification. The current graph has no distinct `7f` node. The two atomic candidates cover the source actions without creating coefficient-format skills. A later curriculum review can decide whether the legacy `7e` aggregator remains a legacy objective aggregator or receives a corrected broader source role.

## Accepted review corrections

The implementation must apply these corrections from the independent review.

- The direct-elimination procedure does not require separate term-alignment evidence. The source supplies aligned systems.
- The procedure does not require a check in both original equations. The minimum evidence is the equation-combination operation, the resulting one-variable equation, the first solved variable, and substitution for the second variable.
- Problem 48 does not support the digit-reversal capability. It uses a digit sum and a tens-minus-units condition. Keep positional digit representation as a gap.
- Limit specified-solution-set construction reuse to Problems 44 and 45.
- Problem 46 supports operation choice and a general coefficient-construction rule.
- Keep Problem 47 as manual mixed work. It combines a prescribed solution with an addition-elimination constraint.
- Problem 49 supports operation choice. It does not support the substitution-efficiency capability.
- Keep legacy 7e draft and inactive in all catalogs. Remove its three placeholder activities. Preserve its inactive SRS planning row.
- Remove edge `math.im1.edge.1262`. Recompute both SRS copies for its 7.4 target so they do not retain the removed prerequisite.
- Keep `.012` as a rejected inactive duplicate. Preserve the ID. Remove its direct source and evidence mappings.
- Add exact draft `contains` edges for the two new capabilities and each valid reused capability. Do not add prerequisite, equivalence, alignment, or evidence-transfer edges.
