# IM1 Lesson 7-1 capability source review

## Review boundary

This review covers Integrated Math 1 Lesson 7-1 only. It does not approve a node, blueprint, generator, activity, standard alignment, prerequisite, or equivalence.

The original source is `apps/integrated-math-1/curriculum/source-materials/practice-worksheet-student-bundle/Int1_0701_practice.docx`.

I inspected the DOCX XML at `/tmp/int1_0701_review_20260908/xml/word/document.xml`. I inspected the five embedded images in `/tmp/int1_0701_review_20260908/xml/word/media`. I rendered the five worksheet pages at `/tmp/int1_0701_review_20260908/render/page-1.png` through `page-5.png`. The rendered PDF is `/tmp/int1_0701_review_20260908/render/Int1_0701_practice.pdf`.

The schedule source is `apps/integrated-math-1/curriculum/module-7-class-period-plan.md`, rows 37-39.

## Source identity findings

The worksheet has seven source headings. The current seven IDs must stay stable. Their titles and bodies must use these exact heading groups:

| Stable ID | Exact worksheet heading | Problems |
| --- | --- | --- |
| `math.im1.example.7.1.001` | Examples 1 and 2 | 1-4 |
| `math.im1.example.7.1.002` | Examples 3 and 4 | 5-10 |
| `math.im1.example.7.1.003` | Examples 5 and 6 | 11-16 |
| `math.im1.example.7.1.004` | Example 7 | 17-18 |
| `math.im1.example.7.1.005` | Example 8 | 19-24 |
| `math.im1.example.7.1.006` | Example 9 | 25-27 |
| `math.im1.example.7.1.007` | Example 10 | 28-29 |

The current catalog titles are not exact source identities. IDs `.001-.003` repeat the schedule summary for “Examples 1-3.” IDs `.004-.007` repeat the schedule summary for “Examples 4-7.” Do not split a joint worksheet heading into invented bodies. Keep each joint heading and its complete problem set.

The mixed section has Problems 30-51. It has no numbered example heading. Do not create a worked-example ID for each mixed problem.

## Extracted lesson defects

The current extracted lesson combines and renumbers the source actions. It calls the first worksheet group “Example 1,” but the source heading is “Examples 1 and 2.” It then calls the next source group “Example 2.” This shifts all later source headings.

The current Example 1 replaces the four source systems and the labeled source graph with one authored system. Restore the four systems and an accessible description of the labeled graph. The graph has four distinct geometric lines and six visible equation labels. The equations `x - y = -4` and `y = x + 4` coincide. The equations `2x - 2y = 2` and `y = x - 1` also coincide.

The current Example 2 does not preserve Problems 5-10. Restore all six systems.

The current Example 3 does not preserve Problems 11-16. Restore all six systems.

The current Example 4 joins Problems 17 and 18 correctly in topic, but it must retain both complete prompts and distinguish continuous aviation values from integer table counts.

The current Example 5 must retain all six equations in Problems 19-24. These include one solution, an identity, and a contradiction.

The current Example 6 has the three source decimal systems. Add the independently checked solutions and the required nearest-hundredth results.

The current Example 7 must retain both Problems 28 and 29. The bookstore data produce noninteger counts. The extracted lesson must not imply a valid integer sales result.

The review notes incorrectly say the source images cannot be described. The DOCX contains all five images. Restore accessible descriptions for the graph in Problems 1-4, the parallel-line graph in Problem 40, the calculator graph in Problem 42, the four displayed systems in Problem 47, and the Francisca/Alan statements in Problem 51.

## Independently checked mathematics

Problems 1-4 have these results:

- Problem 1 has one solution, `(1, 0)`. It is consistent and independent.
- Problem 2 has infinitely many solutions. It is consistent and dependent.
- Problem 3 has no solution. It is inconsistent.
- Problem 4 has one solution, `(2, 1)`. It is consistent and independent.

Problems 5-10 have these solution counts:

- Problem 5 has one solution.
- Problem 6 has infinitely many solutions.
- Problem 7 has one solution.
- Problem 8 has no solution.
- Problems 9 and 10 each have one solution.

Problems 11-16 have these results:

- Problem 11 has `(0, -3)`.
- Problem 12 has `(-1, -2)`.
- Problem 13 has no solution.
- Problems 14 and 15 have infinitely many solutions.
- Problem 16 has `(3, 2)`.

Problem 17 gives `x = 7` minutes and `y = 3800` meters.

Problem 18 gives 8 round tables and 6 rectangular tables.

Problems 19-24 give, in order, `x = 0`, `x = 7`, `x = 5`, `x = 4`, infinitely many solutions, and no solution.

Problems 25-27 give these exact and rounded solutions:

- Problem 25: `(1113/415, 84/83)`, approximately `(2.68, 1.01)`.
- Problem 26: `(-1593/898, 151/898)`, approximately `(-1.77, 0.17)`.
- Problem 27: `(1121/420, -739/840)`, approximately `(2.67, -0.88)`.

Problem 28 gives `x = 350/39` seconds and `y = 595/39` feet. These are approximately `8.97` seconds and `15.26` feet.

Problem 29 gives `x = 1020/7` books and `y = 800/7` magazines. These are not integer counts. The algebraic system has a real-valued intersection, but the stated sales context has no feasible whole-number solution. The lesson must state this model limit.

Problem 40 has no solution because the two lines have slope 200 and different intercepts.

Problem 41 gives `20t = 15t + 150`, so `t = 30` seconds and the finish is 600 feet from Olivia's start.

Problem 42 does not have no solution. The equations are `y = 1.21x - 3` and `y = 1.2x + 1`. They intersect at `(400, 481)`. A restricted calculator window can hide this intersection.

Problem 43 gives ride time 5 minutes and walk time 20 minutes.

Problem 44 is false. Three linear equations cannot have exactly two common points. Two distinct common points force the same line and infinitely many common points.

Problem 45 has the common solution `(-2, 3)`.

Problem 46 is “always.” Two linear equations that share `(0, 0)` and `(2, 2)` represent the same line. They have infinitely many other common points.

Problem 47 uses the four displayed systems in `image4.png`. The third system does not belong because it has no solution. The other three have one solution.

Problem 51 supports Francisca's conditional claim. A 10% discount is greater than $10 only when the price is greater than $100. The discounts are equal at $100. The $10 discount is greater below $100.

## Proposed atomic capability candidates

Add these as draft and inactive candidates. Keep the broad stable 7a node as a source-only legacy aggregate until review resolves its granularity.

1. **Determine a system solution from a graph.** Read the common intersection and report its coordinates. Map `.003` only. Problems 1-4 do not ask for coordinates.
2. **Determine the number of solutions from a graph.** Distinguish one, none, and infinitely many. Map `.001` and `.003`.
3. **Classify a linear system by its solution set.** Use consistent/inconsistent and independent/dependent correctly. Map `.001` and `.002`. Problems 11-16 do not ask for these labels.
4. **Determine the number of solutions from equation structure.** Rewrite or compare slopes and intercepts without graphing. Map `.002`.
5. **Write a two-equation system from a context.** Define variables and translate both constraints. Map `.004` and `.007`.
6. **Solve and interpret a contextual system.** Check units, domain, and discrete feasibility. Map `.004` and `.007`.
7. **Solve a linear equation by graphing its two sides as a system.** Include identity and contradiction cases. Map `.005`.
8. **Report an approximate system solution to a specified precision.** Solve the system, identify the ordered pair, and round each coordinate to the nearest hundredth. Map `.006`. Decimal coefficients are an input variant. They do not define a separate operation.

The mixed section supports four additional assessed operations. It does not supply a worked-example heading. Add them only as draft gap candidates with an explicit missing worked-source exception. Do not fabricate source example links.

9. **Evaluate a graphical claim when the intersection is outside the viewing window.** Problem 42 is direct evidence.
10. **Reason about the possible common solutions of three linear equations.** Problems 44 and 45 are direct evidence.
11. **Construct systems with a specified number of solutions.** Problems 48 and 50 are direct evidence.
12. **Explain the limits of graphing as a system-solving method.** Problem 49 is direct evidence.

The four mixed-only capabilities can use source-only draft blueprints with empty `sourceNodeIds` and exact Lesson 7-1 source references. This follows the existing source-review lifecycle. Do not invent a worked-example node or a generator exception.

Do not create a separate atomic node for each representation, coefficient type, or story setting. These are variants of the assessed operations above.

Do not map Problem 51 to a systems capability. Its discount comparison does not require a system of equations as written.

## Existing capability reuse

Reuse `math.im1.skill.4.3.graph-linear-functions-from-slope-intercept-or-standard-form` for the graph-construction step. Lesson 7-1 repeats the line-graphing operation for each equation. Do not add a second “graph two lines” capability. The system-specific assessed operations are the common-intersection and solution-set decisions after both lines are present.

Do not reuse the Module 7 substitution or elimination skills. Lesson 7-1 asks for graphing, structural comparison, or an unspecified method only in the decimal group. It does not assess the named substitution or elimination procedures from Lessons 7-2 through 7-4.

The broad stable node `math.im1.skill.7.1.graph-systems-of-linear-equations-and-determine-the-number-o` mixes graph construction, solution reading, solution-count reasoning, and two classification vocabularies. Preserve its ID. Set it to draft in every catalog copy. Keep its blueprint draft and source-only. Set all readiness projections from actual mode content. Do not treat empty objects as implemented modes.

## Relationship review

Use draft `contains` edges from Lesson 7-1 to the atomic candidates and the reused line-graphing capability. Do not infer prerequisite edges from lesson order.

The prior edge `1259` removal is now reflected in the stored SRS projections. The broad 7a row has an empty prerequisite list. Do not restore a lesson-sequence prerequisite.

No source evidence supports an `equivalent_to` edge between the broad 7a aggregate and one atomic candidate. Containment is the defensible relationship.

The existing CCSS 8.EE.C.8 and A-REI.D.10 alignments fit the broad lesson topic. They do not automatically approve every proposed atomic node. Review each atomic alignment separately.

## Projection defects and minimum repair

The blueprint has three empty mode objects. The practice activity map converts them to three placeholder activities. The same projection reports `generatorReady: true`. This conflicts with the blueprint's generator exception and `independentPracticeReady: false`.

For the source-repair batch:

- Keep every new atomic node draft and `independentPracticeReady: false`.
- Use source-only draft blueprints for candidates with valid worked source IDs.
- Do not create placeholder mode specifications.
- Do not create active practice activities.
- Keep SRS rows inactive with `generatorReady: false`.
- Remove or deactivate the broad node's placeholder activity rows.
- Preserve teacher inventory rows as unavailable planning rows when the current projection contract requires them.

The seven worked-example nodes currently differ across catalog copies: `nodes.json` records them as approved, while `draft-nodes.json` records them as draft. The repaired bodies replace incomplete or shifted source content. Set all seven repaired source nodes to draft in every catalog copy, as required by the source-repair lifecycle. Keep the legacy 7a aggregate draft and inactive. Do not transfer its prior approval to a repaired source body or a new capability node.

## Bounded implementation proposal

1. Correct the extracted lesson headings, complete givens, figures, solutions, model limits, and mixed-problem descriptions.
2. Retitle `.001-.007` to the exact seven worksheet headings. Preserve their IDs. Set all seven changed source bodies to draft in every catalog copy.
3. Add eight source-backed atomic draft candidates with the mappings above.
4. Add four mixed-only draft candidates with empty `sourceNodeIds` and exact lesson source references.
5. Add only draft containment edges. Reuse the existing line-graphing capability.
6. Remove no stable node or source example.
7. Rebuild only the derived queue, matrix, audit, and inactive projections through the established builders.
8. Add focused tests for source identity, complete mathematics, exact source mapping, inactive lifecycle, no placeholder activities, no sequence prerequisites, and no unexpected equivalence.

This scope restores the source and separates assessable actions. It does not make the lesson ready for generated practice.
