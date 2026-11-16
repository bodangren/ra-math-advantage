# IM1 Lesson 6-4 Independent Review

## Scope

This review compares the Lesson 6-4 proposal with the original worksheet, its document XML, the rendered pages, and the current graph. It does not approve graph rows or practice readiness.

## Source identity

The original heading is `Examples 1, 2, 4, 5`. It covers Problems 1 through 20 as one joint solve-and-graph section. The separate `Example 3` heading covers the contextual Problems 21 through 25.

Preserve source IDs `.017` through `.021`. Their proposed titles match the source numbers. Examples 1, 2, 4, and 5 must use the same joint source body. The source does not support a problem-level division between those four numbers. Example 3 is the only direct worked source for contextual modeling.

## Capability boundaries

The 11 proposed draft boundaries are supported.

The bounded `and` conversion and exterior `or` conversion require different connectors and set operations. Keep them separate. The negative-bound special cases use the nonnegative range of absolute value. The scaled-expression boundary adds an isolation step before conversion. The within-tolerance and outside-range models produce different solution-set shapes. Graph-to-inequality work reverses the normal solve-and-graph direction. A two-sided bound such as Problem 53 has two bounds on one absolute value expression and produces two bounded intervals. Structural analysis and constrained construction require justification that a fixed-answer grader cannot infer from a final interval alone.

Do not add separate capabilities for fractions, decimals, percentages, temperature, weight, architecture, or calculator use. These items change the representation or context. They do not change the mathematical action.

The five proposed reuses are correct. The Lesson 6-3 `and`, `or`, and graphing skills apply after the absolute value conversion. The Lesson 6-1 interpretation skill applies to the contextual result. Problems 51 and 55 directly assess error diagnosis. Preserve the original ownership metadata for all five reused rows.

## Source mapping

Map Candidates 1 through 4 to the joint source set `.017`, `.018`, `.020`, and `.021`. Map Candidates 5 and 6 to `.019`. Leave Candidates 7 through 11 without worked-example source IDs because their evidence occurs in mixed practice.

Use the same joint source set for the reused `and`, `or`, and graphing skills. Add `.019` to contextual interpretation. Do not add a worked-example source to error diagnosis. These mappings preserve the difference between a worked heading and a mixed-practice problem.

## Verified mathematics

The original symbols support the listed solutions for Problems 1 through 20. In particular, Problems 5, 6, and 17 have no solution. Problems 11, 12, and 18 have all real numbers as solutions. Problem 19 requires symbol reversal after division by `-6` and gives `-2 < r < 2/3`. Problem 20 gives `p < -4` or `p > -2/3`.

Problem 21 states that the tolerance is 2.5 percent of the actual speed. For actual speed `s`, the correct model is `|60 - s| <= 0.025s`, with `s > 0`. Its exact bounds are `2400/41 <= s <= 800/13`. These bounds are approximately `58.537 <= s <= 61.538`. The current extracted lesson uses 2.5 percent of 60 and is incorrect. Correct this text before it becomes source evidence.

Problems 22 and 23 use closed tolerance intervals. Problem 24 uses an exterior strict inequality if the stated healthy endpoints remain included. Problem 25 uses closed intervals around 515. Assessment content must retain these endpoint policies.

The number-line results for Problems 26 through 35 match the report. Problem 35 uses `|-x + 1.5| < 3`, which equals `|x - 1.5| < 3`.

The mixed-problem calculations also match. Problem 45 has all real solutions. Problem 49 is not an equivalence because its compound statement simplifies to `x > -2`. Problem 50 gives a positive width no greater than 50 feet, a length from 56 through 64 feet when width is 50 feet, and a cost from $155,000 through $195,000. Problem 51 gives `x > 7` or `x < -13` and identifies Chloe's distribution error. Problem 53 gives `-8 <= n < -3` or `1 < n <= 6`. Problem 54 accepts Statements I and III. Problem 55 gives `a < 1` or `a > 2`.

Problems 48, 52, and 60 permit multiple valid responses. Problem 56 depends on the inequality direction and threshold. Their future graders must assess the justification or construction. They must not use one fixed response.

## Disposition

The proposed 11 new boundaries, five reuses, and source mappings are suitable for a bounded draft graph repair. The speedometer correction is required in the extracted source. Keep every new capability draft and inactive. Add no prerequisite, equivalence, standards alignment, generator, or automatic grading claim from this review.

## Parent integration review

The parent compared the authored graph with `/tmp/g29_lesson64_before_20260907_231427`. All prior node IDs remain present. Each node catalog adds the same 11 draft inactive skill rows. Only the five existing Lesson 6-4 example rows change. All 2,398 prior graph edges remain present. The 16 added edges are draft Lesson 6-4 containment edges. The standard edge array is unchanged. The generator gap queue retains its entire prior prefix.

Four existing blueprints gain the accepted direct source references. The error-diagnosis reuse gains containment only. Ownership metadata stays unchanged. The resulting inventory has 910 nodes, 313 provisional skill candidates, 2,414 edges, 309 blueprints, and 307 generator gaps. These counts do not establish practice readiness.

The parent checked the restored Problems 1 through 20 against the independently reviewed expressions and solutions. The restored speedometer model uses actual speed as its percentage base. The source now retains sample derivations and the construction constraints for Problems 48 and 52. The final source uses numbered list rows. Absolute-value bars no longer split Markdown table cells. The focused 17 tests pass after this repair.

The app build passed in `/tmp/im1-g29-parent-build.log`. The author reports 98 curriculum tests, 36 coverage and audit tests, app lint and standalone TypeScript, and package lint and standalone TypeScript passing. The separate scaffold suite retains its pre-existing missing-generator expectation failure. Source approval and runtime practice remain open.
