# IM1 Lesson 6-3 Independent Review

## Scope

This review compares the proposed Lesson 6-3 repair with the original worksheet and the current graph.

Sources reviewed:

- `apps/integrated-math-1/curriculum/source-materials/practice-worksheet-student-bundle/Int1_0603_practice.docx`
- `/tmp/int1_0603_review_20260907_2229/render/page-1.png` through `page-6.png`
- `apps/integrated-math-1/curriculum/modules/module-6-lesson-3`
- `apps/integrated-math-1/curriculum/module-6-class-period-plan.md`
- `im1-lesson63-capabilities-review.md`
- the current nodes, blueprints, and edges

This review does not approve a node or activity.

## Findings

### Withdrawn: Problem 3 endpoint

The resized render made the second symbol appear closed. Direct source XML confirms that Problem 3 states `y - 1 >= 7 or y + 3 < -1`.

The result is `y >= 8 or y < -4`. The author report is correct.

This finding is withdrawn. Preserve the strict endpoint.

### P2: Candidate 9 duplicates contextual interpretation

Candidate 9 is "Apply discrete and physical domain restrictions to contextual compound solutions."

This is the same assessed action as `math.im1.skill.6.1.interpret-inequality-solutions-in-context`. The compound expression changes the input representation. It does not change the interpretation action.

Reuse the existing interpretation capability for Problems 17, 18, 37, and 50. Add Lesson 6-3 containment. Do not add a new Candidate 9 node.

### P2: Candidate 10 is not atomic and treats a formula as a new capability

Candidate 10 is "Solve compound bounds that contain a formula and interpret the resulting quantity."

The title contains two actions: solve and interpret. The formula is a representation. Problems 18, 38, 42, and 50 use the existing compound-solving, contextual-modeling, and interpretation actions.

Do not add Candidate 10 as one atomic skill. Map the applicable source to the existing solving and interpretation boundaries. If later evidence shows that formula substitution is independently assessed, review it as a separate source capability.

### P2: The checking reuse needs a precise evidence statement

Problem 45 asks which listed value is not a solution. This directly supports `math.im1.skill.6.1.check-whether-values-satisfy-inequalities`.

The source support is mixed practice. The empty worked-example mapping is correct. The proposed containment edge is also correct. The repair report should name Problem 45 as its source evidence so that a later review does not infer evidence from a worked-example heading.

## Capability disposition

Ten proposed new boundaries are distinct and source-supported:

1. Solve `and` compounds as intersections.
2. Solve `or` compounds as unions.
3. Transform all three parts of a three-part inequality.
4. Simplify overlap, absorption, all-real, and empty compound sets.
5. Graph compound sets with two boundary decisions.
6. Write compound inequalities from two-boundary graphs.
7. Model bounded contextual ranges.
8. Model exterior or disjoint contextual conditions.
9. Compare the union and intersection of two graphed sets.
10. Classify structural compound-inequality claims as always, sometimes, or never true.

The separate `and` and `or` nodes are justified. They use different set operations. The three-part node is also justified because one operation must apply to three expressions.

The compound graphing and graph-reading nodes are more specific than the single-inequality Lesson 6-1 nodes. They require two endpoint decisions and a union or intersection decision.

Three of the four proposed reuses are direct and distinct:

- Problem 45 checks whether a value satisfies a compound inequality.
- Problem 46 diagnoses supplied incorrect work.
- Problem 44 constructs a compound inequality with a specified solution set and specified operations.

Problems 39 and 50 support the existing dependent-geometric-constraints capability. Candidate 9 should become a fifth reuse of contextual interpretation.

Problem 51 states `a > 0`. It does not support an unknown-sign capability.

## Source identity and mapping

The current graph has only `.013` through `.016`. Preserve these IDs and their review states.

- `.013` represents actual Example 1 within the joint `Examples 1, 3, and 4` heading.
- `.014` represents actual Example 2.
- `.015` is the class-plan repeat of Example 2. It is not new source evidence.
- `.016` represents actual Example 3 within the joint heading.

The worksheet also has actual Examples 4, 5, and 6. New IDs `.source-004`, `.source-005`, and `.source-006` are non-colliding and preserve the existing IDs.

The proposed mapping is conservative for the joint headings. Candidates for solving, simplification, and graphing can reference `.013`, `.016`, and `.source-004`. The graph-writing capability can reference `.source-005` and `.source-006`. Do not map `.015` into a blueprint.

Contextual Example 2 supports bounded and exterior modeling. It also supports interpretation through the existing interpretation node. Mixed-practice capabilities must keep empty worked-example mappings.

## Verified mathematics

- Problems 1 and 2 give `6 <= f < 11` and `-12 <= n <= -7`.
- Problem 3 gives `y >= 8 or y < -4`.
- Problem 8 gives all real numbers.
- Problem 10 gives no solution.
- Problem 14 gives all real numbers except `-3`.
- Problem 17 gives `x < 12 or x > 27`. A positive-height policy gives `0 < x < 12 or x > 27`.
- Problem 18 gives approximately `2109.589 <= x <= 4383.562`. The printed rounding instruction gives endpoint reports of 2,110 and 4,384. An integer-feasibility policy would instead have an upper integer of 4,383. Grading must name its policy.
- Problems 19 through 26 match the recovered endpoint and shading descriptions in the author report.
- Problem 37 has a minimum of 67 students. The 100-seat capacity controls the maximum.
- Problem 39 gives `2 < x < 7`.
- Problem 42 gives `2/7 < v < 10/23`.
- Problem 45 gives `x < 2 or x >= 4`. The value 2 is not a solution.
- Problem 46 contains a sign error when the right expression becomes `-4x - 1`.
- The union in Problem 47 is `x > -1`. The intersection in Problem 48 is `x >= 4`.
- Problem 50 gives `12 <= a <= 46/3` under inclusive budget endpoints.
- Problem 51 uses the known condition `a > 0`.
- Problems 52 and 54 have more than one valid response.
- Problem 53 is sometimes true under the two-boundary-point interpretation. Its natural language is ambiguous and needs an explicit grading definition.

## Disposition

The source identity repair, missing example IDs, four reviewed reuse mappings, and critical contextual limits are suitable.

Reduce the proposed 12 new nodes to ten. Reuse contextual interpretation for Candidate 9. Represent Candidate 10 with the reviewed solving, modeling, and interpretation nodes. Keep all new and reused rows draft and inactive.

## Parent source disposition

The parent checked the original page render and the DOCX XML. Problem 3 states `y - 1 >= 7` or `y + 3 < -1`. The correct result is `y >= 8` or `y < -4`. The strict endpoint in the author review was correct. Do not apply the endpoint finding above. The ten-node granularity findings remain accepted.

## Final graph disposition

The final before-and-after snapshot has no blocking source or graph defect in the Lesson 6-3 repair.

The repair adds 13 nodes. Ten nodes are draft skills. Three nodes are draft source identities for actual Examples 4, 5, and 6. The repair preserves all old node IDs. It changes only the source title and source reference fields for retained Examples `.013` through `.016`. These changes match the original worksheet headings. Example `.015` remains the class-plan repeat and has no blueprint source mapping.

The repair adds 18 draft `contains` edges. These edges cover the ten new skills, the three new source identities, and the five reused skills. It removes no edge. It changes no old edge. The embedded node copies match the canonical source changes. The standard-edge array stays unchanged.

The repair adds ten draft source-only blueprints. The first five solving and graphing skills use the joint Examples 1, 3, and 4 source set. The graph-writing skill uses actual Examples 5 and 6. The two contextual-modeling skills use actual Example 2. The two mixed-practice skills have no worked-example source mapping. The existing interpretation blueprint adds Example 2 and keeps its Lesson 6-1 ownership. No blueprint uses schedule-repeat Example `.015`.

The restored source text keeps the verified mathematical boundaries. Problem 3 has the strict result `y >= 8` or `y < -4`. Problem 39 gives `2 < x < 7`. Problem 42 gives the strict density interval `2/7 < v < 10/23`. Problem 44 gives `-1 <= x < 8` and remains open to multiple constructions. Problem 46 identifies the coefficient sign error. Problem 51 uses the stated condition `a > 0`. Problems 18 and 38 state their rounding policy. Problems 52 and 54 remain nonunique. Problem 53 keeps its interpretation limit.

This disposition accepts the bounded source and identity repair. It does not approve the draft skills for independent practice. It does not establish a generator or an automatic grading contract.

## Parent integration check

The parent verified all 2,380 prior edges remain unchanged. The repair adds 18 draft containment edges and 13 nodes. The queue preserves its prior rows and adds ten rows. The blueprint identities remain intact and the schedule repeat has no mapping. The original DOCX and rendered page confirm the strict Problem 3 endpoint. The final app build passes.
