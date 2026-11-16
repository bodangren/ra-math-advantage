# IM1 Lesson 8-1 capability source review

## Disposition

The current lesson does not preserve the complete worksheet. It replaces the Problem 1 through 5 tables with an invented table. It summarizes Problems 9 through 19. It also keeps only the broad 8a graph row although the source assesses several separate operations.

The source supports repair of the existing 8a capability, eight new draft and inactive capability candidates, and one direct reuse of the existing Lesson 8-3 two-point capability. Keep all source rows and capability decisions draft. Do not approve a blueprint, renderer, generator, activity, prerequisite, or evidence transfer in this source batch.

## Source authority

The original source is `apps/integrated-math-1/curriculum/source-materials/practice-worksheet-student-bundle/Int1_0801_practice.docx`.

The reviewed render is `/tmp/int1_0801_review_20260908/page-1.png` and `/tmp/int1_0801_review_20260908/page-2.png`. The rendered PDF is `/tmp/int1_0801_review_20260908/Int1_0801_practice.pdf`.

The source has these groups:

- `Example 1`: Problems 1 through 5.
- `Examples 2 and 3`: Problems 6 through 8.
- `Mixed Exercises`: Problems 9 through 19.

`Examples 2 and 3` is one joint worksheet heading. The worksheet does not provide separate Example 2 and Example 3 bodies.

## Source asset restoration

The DOCX contains six embedded images.

- `image1.png` through `image5.png` contain the exact tables for Problems 1 through 5.
- `image6.png` is the blank coordinate grid used by graphing prompts.

Restore the five exact tables as accessible HTML or Markdown tables. Do not replace them with a representative table. A product graphing surface can replace the blank printed grid if it preserves axes and plotting interaction. If the lesson keeps a static grid, reuse the source grid or a faithful accessible coordinate plane.

Keep verified answers in tests or author notes. Do not put them in learner prompts. Problems 6, 7, and 9 through 14 need blank graphing surfaces. Their prompt text must not include plotted points, intercepts, ranges, or asymptotes as answers.

## Verified mathematics

### Problems 1 through 5

| Problem | Source data | Result and reason |
|---|---|---|
| 1 | `x: -3,-2,-1,0`; `y: 9,12,15,18` | Not exponential. The first difference is `3`. The ratios are not constant. |
| 2 | `x: 0,5,10,15`; `y: 20,10,5,2.5` | Exponential for equal input steps of `5`. The common output ratio is `1/2`. One model is `20(1/2)^(x/5)`. |
| 3 | `x: 4,8,12,16`; `y: 20,40,80,160` | Exponential for equal input steps of `4`. The common output ratio is `2`. |
| 4 | `x: 50,30,10,-10`; `y: 90,70,50,30` | Not exponential. For equal input steps of `-20`, the output difference is `-20`. The ratios are not constant. |
| 5 | frame length `5,6,7,8,9`; picture area `6,12,20,30,42` | Not exponential. The ratios are not constant. |

For Problem 5, do not claim a specific frame-area formula unless the source gives the frame geometry. The table alone is sufficient to reject a constant ratio.

### Problems 6 through 8

Problem 6 gives `y = 1000(2)^(0.3x)`. The initial value is `1000`. It is growth. Its full mathematical domain is all real numbers, its range is positive, and its horizontal asymptote is `y = 0`. In the waste context, relevant inputs satisfy `x >= 0`, and relevant outputs satisfy `y >= 1000`.

Problem 7 gives `y = 50(1/2)^(x/8.02)`. The initial amount is `50` milligrams. The half-life is about `8.02` days. It is decay. In context, `x >= 0` and `0 < y <= 50`. The points `(0,50)`, `(8.02,25)`, and `(16.04,12.5)` are useful author checks. Do not put these points in the learner prompt.

Problem 8 gives `y = 4000(0.87)^x`. At `x = 5`, the value is about `1993.68`, so the nearest-dollar answer is `$1,994`.

### Problems 9 through 14

Each problem asks the learner to graph the function and find the y-intercept, domain, range, and horizontal asymptote.

- Problem 9: `y = 2(1/6)^x`. The y-intercept is `2`. The domain is all real numbers. The range is `(0, infinity)`. The asymptote is `y = 0`.
- Problem 10: `y = (1/12)^x`. The y-intercept is `1`. The domain is all real numbers. The range is `(0, infinity)`. The asymptote is `y = 0`.
- Problem 11: `y = -3(9^x)`. The y-intercept is `-3`. The domain is all real numbers. The range is `(-infinity, 0)`. The asymptote is `y = 0`.
- Problem 12: `y = -4(10^x)`. The y-intercept is `-4`. The domain is all real numbers. The range is `(-infinity, 0)`. The asymptote is `y = 0`.
- Problem 13: `y = 3(11^x)`. The y-intercept is `3`. The domain is all real numbers. The range is `(0, infinity)`. The asymptote is `y = 0`.
- Problem 14: `y = 4^x + 3`. The y-intercept is `4`. The domain is all real numbers. The range is `(3, infinity)`. The asymptote is `y = 3`.

Problem 14 is the vertical-shift variant. It shows that the source does not assess only unshifted `ab^x` functions.

### Problems 15 through 19

Problem 15 gives `f(x) = 1038(1.000134)^(-x)` for `0 <= x <= 10,000`. Sea-level pressure is `1038` millibars. At `2000` meters, the model gives approximately `793.99` millibars. Pressure decreases as altitude increases.

Problem 16 asks for a table-and-graph comparison of `f(x) = ab^x + c` and `g(x) = ax + c`, where `a != 0`, `b > 0`, and `b != 1`. The response must compare intercepts, symmetry, end behavior, extrema, increasing or decreasing intervals, and positive or negative intervals. The values depend on `a`, `b`, and `c`. This is a manual multi-part reasoning task. A fixed answer is not valid for all allowed parameters.

Problem 17 asks for an exponential function through `(0,3)` and `(1,6)`. One valid function is `y = 3(2^x)`. The prompt does not restrict the family to unshifted `ab^x`. The shifted function `y = 4^x + 2` also passes through both points. Do not require a unique fixed equation.

Problem 18 asks whether `y = ab^x`, under the stated nonzero and positive-base conditions, has an x-intercept. It never has one because `b^x > 0` and `a != 0` for every real input.

Problem 19 is nonunique. It asks the learner to create a real-world exponential model, graph it, analyze it, and justify why exponential behavior is more suitable than linear behavior. This requires a coherent manual artifact. Do not supply a model in the learner prompt.

## Current graph defects and stable source identities

The current graph has these source IDs:

- `math.im1.example.8.1.001`
- `math.im1.example.8.1.002`
- `math.im1.example.8.1.003`

Retain `.001` as the canonical `Example 1` source for Problems 1 through 5. Use the title `Example 1: Identify exponential behavior from tables`.

Retain `.002` as the canonical joint `Examples 2 and 3` source for Problems 6 through 8. Use the title `Examples 2 and 3: Analyze exponential functions in context`.

Retain `.003` as a rejected and inactive historical duplicate. Remove its direct source mapping and lesson containment. Preserve its stable ID and historical example number.

The existing 8a node exactly owns the table common-ratio operation. Preserve its stable ID. Repair its exact Problem 1 through 5 source reference and its `.001` blueprint mapping. Make it draft, source-only, and inactive because the reviewed content replaces the previous summary. Remove its empty mode specifications and placeholder renderer claim.

## Selected capability boundaries

### Reuse 8a: identify exponential behavior from equally spaced table data

Use the existing ID:

`math.im1.skill.8.1.identify-exponential-behavior-from-data-using-common-ratios`

Problems 1 through 5 assess this operation. Equal input spacing can be `1`, `4`, `5`, `-20`, or another nonzero step. Growth, decay, linear counterexamples, and nonlinear nonexponential counterexamples are variants. The learner must compare ratios for equal input increments and explain the classification.

### New 1: determine the initial value or y-intercept

Suggested ID:

`math.im1.skill.8.1.determine-the-initial-value-or-y-intercept-of-an-exponential-function`

Suggested title:

`Determine and interpret the initial value or y-intercept of an exponential function`

Problems 9 through 14 explicitly ask for the y-intercept. Problems 6 and 7 support initial value through their key-features request. The input-zero value and its interpretation form this capability. Use `.002` for Problems 6 and 7. Add exact references for Mixed Exercises, Problems 9-14.

### New 2: classify growth or decay in an exponential model

Suggested ID:

`math.im1.skill.8.1.classify-growth-or-decay-in-an-exponential-model`

Suggested title:

`Classify growth or decay in an exponential model and explain the direction of change`

Problems 6 and 7 support this action through key features. Problem 15(c) explicitly asks how pressure changes with altitude. Use `.002` for Problems 6 and 7 and an exact mixed reference to Problem 15(c). Do not use Problems 9-14 as direct growth-or-decay classification evidence. The source context models have positive quantities. A base greater than one alone does not make a negative-valued function increase. Keep that distinction explicit in future task design.

### New 3: determine the horizontal asymptote

Suggested ID:

`math.im1.skill.8.1.determine-the-horizontal-asymptote-of-an-exponential-function`

Suggested title:

`Determine the horizontal asymptote of an exponential function from its equation or graph`

Problems 9 through 14 explicitly ask for an asymptote. Use exact mixed references for those problems. Problems 6 and 7 support the feature through their broad key-features request and can use `.002`. A vertical shift is a variant. Problem 14 supplies that variant.

### New 4: graph an exponential equation

Suggested ID:

`math.im1.skill.8.1.graph-an-exponential-function-from-its-equation`

Suggested title:

`Graph an exponential function from its equation`

Problems 6, 7, and 9 through 14 directly assess this operation. Evidence must preserve the y-intercept, curve direction, sign, and horizontal asymptote. A feature list alone does not prove the graph artifact.

Use `.002` for Problems 6 and 7. Add an exact file-and-problem source reference for Mixed Exercises Problems 9 through 14.

### New 5: determine mathematical domain and range

Suggested ID:

`math.im1.skill.8.1.determine-the-domain-and-range-of-an-exponential-function`

Suggested title:

`Determine the domain and range of an exponential function from its equation or graph`

Problems 9 through 14 directly assess the full mathematical domain and range. Positive, negative, and vertically shifted ranges are variants.

Do not use a generic relation domain-and-range row as exact evidence. This source requires exponential asymptotic behavior and sign reasoning.

### New 6: restrict exponential domain and range for context

Suggested ID:

`math.im1.skill.8.1.determine-a-context-relevant-domain-and-range-for-an-exponential-model`

Suggested title:

`Determine and interpret a context-relevant domain and range for an exponential model`

Problems 6 and 7 directly assess this operation. Problem 15 supplies a bounded input domain and supports interpretation, but it does not separately ask the learner to state the domain and range. Use `.002` as the direct source node. Record Problem 15 as supporting source context, not as a separate exact deliverable.

### New 7: evaluate an exponential model

Suggested ID:

`math.im1.skill.8.1.evaluate-and-interpret-an-exponential-model-at-a-given-input`

Suggested title:

`Evaluate and interpret an exponential model at a given input`

Problems 8 and 15 directly assess this operation. Decimal bases and equivalent negative-exponent forms are variants. Evidence must include substitution, numerical evaluation, requested rounding, and units.

Use `.002` for Problem 8. Add an exact file-and-problem reference for Problem 15.

### Manual source task: compare exponential and linear functions

Problem 16 requests tables, graphs, intercepts, symmetry, end behavior, extrema, and intervals of increase, decrease, positivity, and negativity. Keep this as a manual composite source task. Do not add a broad atomic comparison node. Do not transfer a whole-task result to a child capability. The parameter-dependent answer needs a reviewed rubric and separately identified evidence for its parts.

### New 8: justify the x-intercept behavior of an exponential function

Suggested ID:

`math.im1.skill.8.1.justify-why-a-nonzero-exponential-function-has-no-x-intercept`

Suggested title:

`Justify why a nonzero exponential function has no x-intercept`

Problem 18 directly assesses this general claim. It requires reasoning from `a != 0` and `b^x > 0`. Reading one graph is not sufficient evidence.

### Manual source task: create and justify a contextual exponential model

Problem 19 combines context creation, equation writing, graphing, feature analysis, and comparison with a linear model. Do not create a broad atomic skill row for the whole response. Record it as a manual source task assembled from reviewed capabilities. It currently exposes a content gap for contextual model construction and justification. Add it to the source gap record. Do not project whole-task evidence to one child skill.

## Existing capability reuse

Add one draft Lesson 8-1 containment for Problem 17:

`math.im1.skill.8.3.write-an-exponential-function-given-two-points-on-its-graph`

Problem 17 uses this operation. Preserve the existing stable ID and ownership. Do not create a Lesson 8-1 duplicate. Require manual or structural grading that accepts valid nonunique exponential functions. The source does not impose the unshifted `ab^x` restriction. The valid equations `y = 3(2^x)` and `y = 4^x + 2` demonstrate why a fixed answer check would be insufficient.

Do not reuse `math.im1.skill.8.5.determine-whether-a-given-sequence-is-geometric-by-checking` for Problems 1 through 5. A geometric sequence uses term position and a common term ratio. Lesson 8-1 asks whether table data is exponential for equally spaced numerical input values that can have a step other than one. The reasoning is related, but the observable input contract differs.

Do not reuse the Lesson 7-5 graph-system capability. Its graph artifact uses boundary lines, half-planes, and an intersection. Exponential graphing uses curve shape, intercept, and asymptotic behavior.

## Relationship boundaries

Add only draft `contains` edges for the eight new candidates and the one exact Problem 17 reuse. Preserve the existing 8a lesson containment. Preserve source containment for canonical `.001` and `.002`. Remove duplicate `.003` containment.

Do not add prerequisite edges in this source batch. Feature identification can support graphing, and common-ratio recognition can support later model selection, but the graph requires a separate edge review and accepted endpoints.

G37 removes edge `math.im1.edge.1264`, which connects unsupported Lesson 7-5 optimization to 8a by sequence. The current G38 baseline can still contain it if G37 is not yet integrated. Do not restore or use it. If the G38 patch follows G37, assert that it remains absent and do not count it as a new G38 removal.

Do not add equivalence or evidence-transfer edges between 8a and the geometric-sequence row. Related common-ratio language does not prove interchangeable evidence.

Preserve historical standards alignments on stable legacy rows. Do not copy them to new nodes without a standards review.

## Expected bounded inventory

The source batch has:

- Eight new draft, inactive skill candidates.
- One repaired existing 8a skill.
- One exact reuse of the existing 8e two-point skill.
- Two canonical source rows: `.001` and `.002`.
- One rejected historical duplicate source row: `.003`.
- Nine new lesson capability containments: eight new skills and the one 8e reuse.
- One existing 8a containment retained.
- No new prerequisite, equivalence, renderer, activity, or evidence row.

The selected Lesson 8-1 skill set therefore has nine owned capabilities: repaired 8a plus eight new candidates. Problem 17 adds one reused capability from Lesson 8-3. Problems 16 and 19 remain manual composite source gaps.

## Required tests

1. Restore all 19 source problem prompts with exact equations, table values, units, domains, and questions.
2. Verify all five exact source tables. Do not accept an invented substitute table.
3. Verify the Problem 7 half-life exponent is `x/8.02`.
4. Verify Problems 9 through 14 retain their exact coefficients, signs, bases, and the vertical shift in Problem 14.
5. Keep author solutions out of learner prompts.
6. Verify `.001` and `.002` are canonical draft sources and `.003` is a preserved rejected duplicate.
7. Verify the existing 8a ID is reused. Reject a duplicate common-ratio skill ID.
8. Verify eight new nodes are draft, inactive, source-only, and identical across all four node copies.
9. Verify exact file-and-problem source references for every new node.
10. Verify one Lesson 8-1 containment for each selected owned capability and the Problem 17 reuse. Reject duplicate containments.
11. Verify the 8a and new blueprints have no renderer key, mode specifications, generator exception, or activity projection.
12. Verify Problems 16 and 19 have no whole-task exact mastery projection.
13. Verify edge `1264` is absent after G37 integration and absent from both SRS projection copies.
14. Verify all unrelated stable IDs, edges, standards alignments, and projection rows remain unchanged.
15. Rebuild the generator gap queue, coverage matrix, SRS projections, activity map, and rollout audit with existing projectors. Keep every selected planning row inactive.

## Parent review correction

The parent viewed both original pages. Independent review split the feature bundle into initial value, growth or decay, and horizontal asymptote. It removed the broad Problem 16 comparison atom. The final scope is eight new capabilities plus repaired 8a and the existing 8e reuse. All direct source scopes and nonunique-answer requirements above control implementation.
