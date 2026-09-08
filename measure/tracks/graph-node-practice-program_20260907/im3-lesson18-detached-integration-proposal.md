# IM3 Lesson 1.8 detached integration proposal

## Decision

Integrate the accepted Lesson 1.8 content from preserved commit `0b5392a36` into a fresh archive of committed `HEAD`.

Do not cherry-pick either detached commit. The source commit edits old aggregate files. A cherry-pick can replace later accepted Module 1 records. Apply object-level changes for Lesson 1.8 only.

The accepted Lesson 1.8 records exist in the current main working tree. They do not exist in committed `HEAD`. This proposal does not treat the working tree as committed preservation.

## Preserved commits

The preservation branch must keep these commits:

1. `0b5392a36` — `feat(im3): reconcile lesson 1-8 systems examples`
2. `226acdbb3` — `measure(plan): mark Task M1-L8 complete`

The first commit has accepted source and graph content. The second commit is a historical plan snapshot. Do not integrate the 971-line plan file as a file replacement. The committed current plan is newer.

## Direct PDF verification

I inspected native PDF pages 57 through 62. I rendered each page and reviewed the page images. The evidence is in `/tmp/im3-lesson18-source-review/`.

| Example | Verified source equation or context | Verified source result |
| --- | --- | --- |
| 1 | `x = 2y^2 + 3y + 1`; `-x + y = -1` | `(1, 0)` and `(0, -1)` |
| 2 | `x^2 = y + 5`; `-x + y = 7` | `(4, 11)` and `(-3, 4)` |
| 3 | `x^2 - 2x + 6 = 4x + 1` | `x = 1` and `x = 5`; intersections `(1, 5)` and `(5, 21)` |
| 4 | Revenue is `R = -0.1x^2 + 4x`. The target is `R = 42`, which represents `$4.2 million`. | No intersection and no price solution. The parabola has maximum revenue `40`, or `$4.0 million`, at `x = 20`. |
| 5 | `y = x^2`; `x = (1/5)(y - 6)^2 + 6/5` | `(2, 4)` and `(3, 9)` |
| 6 | `2x^2 - y = 4`; `y = -(1/2)x^2 + 6` | `(2, 4)` and `(-2, 4)` |
| 7 | `2x^2 - 3x + 8 = 11 - 4x^2` | `x = -1/2` and `x = 1`; intersections `(-1/2, 10)` and `(1, 7)` |

The saved page mapping and all seven authored titles match the native PDF. The accepted Example 4 is on PDF page 59. It is the software developer revenue example. The civil-engineering bridge problem is the separate Check prompt on the same page. The rejected saved candidate that treated a page 63 civil-engineering item as Example 4 does not match the native source.

The algebra confirms all printed results. Example 5 reduces to `(x - 2)(x - 3)(x^2 + 5x + 7) = 0`; the last factor has no real root. Thus, the two printed real intersections are complete.

## Accepted source changes

Update the seven existing worked-example nodes. Keep all nodes in `draft` review status.

| Node | PDF page | Exact authored title | Capability boundary |
| --- | ---: | --- | --- |
| `math.im3.example.1.8.046` | 57 | `Example 1: Solve a Linear-Quadratic System by Using Substitution` | Substitute and report both ordered-pair solutions. |
| `math.im3.example.1.8.047` | 58 | `Example 2: Solve a Linear-Quadratic System by Using Elimination` | Eliminate and report both ordered-pair solutions. |
| `math.im3.example.1.8.048` | 58 | `Example 3: Use a System to Solve a Quadratic Equation` | Rewrite as a linear-quadratic system and use intersections. |
| `math.im3.example.1.8.049` | 59 | `Example 4: Solve a Linear-Quadratic System by Graphing` | Model the revenue condition, graph it, and interpret zero intersections. |
| `math.im3.example.1.8.050` | 60 | `Example 5: Solve a Quadratic-Quadratic System Graphically` | Use a value table and identify intersections. |
| `math.im3.example.1.8.051` | 61 | `Example 6: Solve a Quadratic-Quadratic System Algebraically` | Substitute and verify ordered-pair solutions. |
| `math.im3.example.1.8.052` | 62 | `Example 7: Use a System to Solve a Quadratic Equation` | Rewrite as two quadratic functions and use graph intersections. |

For each node, add the exact PDF page reference. Add `pdfPage`, `authoredTitle`, `prompt`, and `demonstratedCapability` metadata from `0b5392a36`. Preserve the existing class-period-plan reference and `rawText` field.

## Accepted blueprint changes

Add two draft blueprints:

- Map Examples `.046` through `.049` to `math.im3.skill.1.8.solve-systems-involving-a-linear-and-a-quadratic-equation`.
- Map Examples `.050` through `.052` to `math.im3.skill.1.8.solve-systems-of-two-quadratic-equations`.

Each blueprint aligns to `math.standard.ccss.hsa-rei-c-7`. Each blueprint keeps `rendererKey: "graphing-explorer"` for the existing skill identity. Each blueprint must have an empty `rendererModeMap`.

Do not add a Worked, Guided, or Independent specification. Do not add a generator or grading specification. The existing renderer and generator contracts do not support the complete system methods and response evidence.

## Required aggregate synchronization

The detached implementation changes only three files. The current committed graph now enforces synchronized module and course catalogs. A bounded integration must update the corresponding Lesson 1.8 objects in these existing aggregates:

1. `apps/integrated-math-3/curriculum/skill-graph/module-1/nodes.json`
2. `apps/integrated-math-3/curriculum/skill-graph/nodes.json`
3. `apps/integrated-math-3/curriculum/skill-graph/edges.json` embedded course graph, if the existing graph synchronization test requires it
4. `apps/integrated-math-3/curriculum/skill-graph/module-1/blueprints.json`
5. `apps/integrated-math-3/curriculum/skill-graph/blueprints.json`

Use the existing catalog synchronization method. Change only the seven example objects and the two blueprint objects. Do not replace an aggregate with the detached file.

The empty modality maps should produce no student activity and no SRS input for these skills. The existing teacher-evidence rows can remain. Regenerate a projection only if the projector produces a byte change from these inactive blueprints. Do not add an activity, SRS row, prerequisite, or generator-ready claim.

## Required regressions

Restore and extend `apps/integrated-math-3/curriculum/skill-graph/__tests__/lesson-1-8-reconciliation.test.ts`.

The focused tests must verify:

1. All seven exact IDs, titles, PDF pages, prompts, and capability descriptions.
2. The `.046` through `.049` source mapping for the linear-quadratic skill.
3. The `.050` through `.052` source mapping for the quadratic-quadratic skill.
4. Draft status for all source nodes and both blueprints.
5. Empty modality maps and the absence of all executable specifications, generators, and graders.
6. Exact equality of the seven example objects in the module and root node catalogs. Verify the embedded course graph with its existing synchronization contract.
7. Exact equality of both blueprint objects in the module and root blueprint catalogs.
8. No projected activity or SRS input for either skill in module and course projections.
9. Retention of the existing teacher-evidence rows with `independentPracticeReady: false`.

Run the full Module 1 integration test after the focused test. Run the curriculum graph and projection suites because these files are shared aggregates.

## Conflicts to reject

Do not restore the saved `4f74` Example 2 candidate or the saved `6457` Example 4 candidate. Those candidates use one source example for the broad skill and create three executable modes. The accepted reconciliation uses all seven source examples across two skills and keeps all modalities unavailable.

Do not restore the saved Lesson 1.8 projection rows, SRS readiness, generated practice, prerequisite edges, or source-solution reuse. They do not have the required renderer, response, generator, or server-grader support.

Do not copy older Lesson 1.1, 1.2, 1.4, 1.6, or 1.7 records from the detached aggregate. Committed `HEAD` has later accepted versions.

## Dependencies and gate order

Use a fresh isolated archive from committed `HEAD`. Overlay true candidate workspace package links. Do not read implementation bytes from the dirty main working tree during construction.

Use this order:

1. Add the focused failing Lesson 1.8 contracts.
2. Update the seven source nodes in all required catalogs.
3. Add the two inactive blueprints in both catalogs.
4. Run the focused test and Module 1 integration test.
5. Derive projections with the existing projector. Keep them unchanged if the result is unchanged.
6. Run all IM3 curriculum and seed tests.
7. Run the relevant knowledge-space projection tests.
8. Run lint, build, and standalone TypeScript checks.

No schema, dependency, registry, hash, approval, or runtime component change is required.

## Proposed bounded file scope

Expected changed paths:

- `apps/integrated-math-3/curriculum/skill-graph/__tests__/lesson-1-8-reconciliation.test.ts`
- `apps/integrated-math-3/curriculum/skill-graph/module-1/nodes.json`
- `apps/integrated-math-3/curriculum/skill-graph/nodes.json`
- `apps/integrated-math-3/curriculum/skill-graph/edges.json`, only if the existing synchronization test requires it
- `apps/integrated-math-3/curriculum/skill-graph/module-1/blueprints.json`
- `apps/integrated-math-3/curriculum/skill-graph/blueprints.json`

Projection files can enter scope only when the existing projector shows a required derived change. The accepted inactive blueprints should not create activity or SRS rows.
