# G4 Source Implementation Review

Date: 2026-09-07

## Review boundary

This review checks the current IM1 Module 1 and Module 2 source reconciliation. It compares graph rows with the actual lesson files. It does not approve curriculum rows.

Sources checked:

- `apps/integrated-math-1/curriculum/modules/module-1-lesson-1` through `module-1-lesson-6`
- `apps/integrated-math-1/curriculum/modules/module-2-lesson-1` through `module-2-lesson-7`
- `apps/integrated-math-1/curriculum/skill-graph/nodes.json`
- `apps/integrated-math-1/curriculum/skill-graph/draft-nodes.json`
- `apps/integrated-math-1/curriculum/skill-graph/edges.json`
- `apps/integrated-math-1/curriculum/skill-graph/blueprints.json`
- `apps/integrated-math-1/__tests__/curriculum/module-1-2-example-reconciliation.test.ts`

## Verified corrections

The lesson files contain 67 actual example occurrences. The new test reads each lesson file. It extracts each heading. It compares the exact example number, title, and heading line with all three node documents. This is source-backed verification. It is not an arbitrary fixture comparison.

The four old duplicate IDs are absent from nodes, draft nodes, edges, and blueprints:

- `math.im1.example.1.4.022`
- `math.im1.example.1.5.028`
- `math.im1.example.2.3.014`
- `math.im1.example.2.6.025`

All current edges have present endpoints. The four new source IDs represent actual headings that had no stable numeric ID. Their titles and source lines are correct.

Focused verification passed: 7 tests in the reconciliation and Module 2 source suites.

## Blocking blueprint mappings

### `math.im1.example.1.4.021`

The source heading is “Examples 3 and 4 — Simplify Algebraic Expressions.” The content simplifies algebraic expressions. The example correctly supports the new `1h` skill.

The change also adds it to `math.im1.skill.1.4.apply-the-distributive-property-to-rewrite-and-evaluate-nume`. That skill is the `1g` numerical-expression capability. Remove this new link. Keep the original numerical sources for `1g`.

### `math.im1.example.1.5.027`

The source heading is “Example 2 — Evaluate Absolute Value Expressions with Integers.” The content substitutes values and evaluates an expression. It correctly supports the new `1j` skill.

The change also adds it to `math.im1.skill.1.5.write-absolute-value-expressions-that-model-real-world-dista`. That skill is the `1i` modeling capability. Lesson Example 1 `.026` is its direct source. Remove `.027` from the `1i` blueprint.

### `math.im1.example.2.3.013`

The source heading is “Example 2 — Write and Solve Equations from Word Problems.” It does not teach literal equations.

The change adds it to `math.im1.skill.2.3.solve-literal-equations-for-a-specified-variable-and-solve-e`. Remove this link. Lesson Example 3 `.015` is the literal-equation source.

### Lesson 2-5 graph-solution mapping

Example 3 `.020` applies and solves an absolute-value equation. It does not graph the solution set. Remove it from the graph-solution blueprint.

Example 1 `math.im1.example.2.5.source-001` explicitly solves and graphs simple absolute-value equations. Use this source for `math.im1.skill.2.5.graph-the-solution-set-of-an-absolute-value-equation-on-a-nu`.

Example 4 `.021` performs the inverse task. It writes an absolute-value equation from a graph. Keep the source node. Do not map it to the current graph-solution capability. Record the missing inverse-task capability for later source inventory work.

The added `.024` links in Lesson 2-6 are supportable. Example 3 solves real-world rate, ratio, and scaling proportions. It can support both the algebraic proportion skill and the broader application skill.

## Test correction

The reconciliation test currently labels several rows as shared examples. It then asserts the incorrect `.021`, `.027`, and `.020` shared mappings. These assertions preserve the source defect.

Replace them with explicit capability assertions:

- `1.4.021` is present for `1h` and absent for `1g`.
- `1.5.027` is present for `1j` and absent for `1i`.
- `2.3.013` is absent for literal equations. `.015` remains present.
- `2.5.020` is present for solve-absolute-value and absent for graph-solution.
- Restored Example 1 `2.5.source-001` supports graph-solution.
- Example 4 `.021` is absent from graph-solution. Its inverse-task capability remains missing.
- `2.6.024` can remain on both proportion capabilities.

Use the extracted lesson heading title in the assertion message. This connects the blueprint decision to the actual source capability.

## Review conclusion

The 67-row source inventory and duplicate removal are correct. The corrected blueprints now exclude the unsupported links. The graph-solution skill uses Lesson 2-5 Example 1. Example 4 remains an unmapped inverse-task source until a later inventory correction adds or selects its exact capability.
