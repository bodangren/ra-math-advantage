# IM1 Lesson 5-4 Capability Source Review

## Review scope

This review covers the complete Lesson 5-4 worksheet. It does not approve curriculum content or graph rows.

- Extracted lesson: `apps/integrated-math-1/curriculum/modules/module-5-lesson-4`
- Class plan: `apps/integrated-math-1/curriculum/module-5-class-period-plan.md`
- Original worksheet: `apps/integrated-math-1/curriculum/source-materials/practice-worksheet-student-bundle/Int1_0504_practice.docx`
- Rendered PDF: `/tmp/int1_0504_review_20260907/render/Int1_0504_practice.pdf`
- Rendered pages: `/tmp/int1_0504_review_20260907/render/page-1.png` and `page-2.png`

The worksheet has two worked-example headings. Page 1 contains Examples 1 and 2 and the start of Mixed Exercise 7. Page 2 completes Exercises 7 through 13.

## Current graph state

The current graph has one broad approved skill. Its ID is `math.im1.skill.5.4.distinguish-between-correlation-and-causation-in-real-world`. The title combines classification, explanation, and lurking-variable identification. Its blueprint is draft and contains empty mode specifications.

The current worked-example IDs are stable and distinct.

- `.017` is Example 1, which uses bivariate tables, scatter plots, correlation classification, and possible outside factors.
- `.018` is Example 2, which classifies described relationships as correlation without causation or causation.

Both current example titles combine both headings. Retitle `.017` to `Example 1: Analyze Real-World Data with Scatter Plots`. Retitle `.018` to `Example 2: Classify Relationships as Correlation or Causation`. Preserve both IDs and their current review states.

## Reuse from Lesson 5-3

Lesson 5-4 repeats two capabilities that Lesson 5-3 already supports.

- `math.im1.skill.5.3.construct-scatter-plots-from-paired-data`
- `math.im1.skill.5.3.classify-scatter-plot-correlation`

Examples 1 and Mixed Exercises 7 and 8 assess both capabilities. Do not add duplicate Lesson 5-4 skill nodes for these methods. This correction adds draft source mappings and lesson-containment edges to the existing draft candidates. This reuse does not approve either candidate.

## Source-supported Lesson 5-4 candidates

The source supports five additional draft capability candidates.

1. Assess causal interpretations of described relationships.
2. Explain a correlation-or-causation classification with a direct dependency, a possible mechanism, or a limit in the evidence.
3. Identify plausible lurking variables or common causes for an observed association.
4. Explain why correlation alone does not establish causation.
5. Critique a causal conclusion or recommendation that uses only correlational evidence.

Candidate 1 is a source-school classification task. It is not a claim that the short description supplies sufficient scientific evidence. Candidate 2 records the required justification separately from the selected label. Candidate 3 is explicit in Examples 1 and Exercises 7 and 8. Candidate 4 is explicit in Exercise 11. Candidate 5 is explicit in Exercise 13.

Map Candidates 1 and 2 to `.018`. Map Candidate 3 to `.017`. Candidates 4 and 5 are mixed-only and must not receive invented worked-example links.

## Source data and correlation results

The extracted source omits readable table values and results.

- Frozen desserts: frozen yogurt values are `0.9, 1.0, 1.2, 1.1, 1.4, 1.3, 1.4, 1.2`. Sherbet values are `1.0, 1.0, 0.9, 0.8, 0.9, 0.9, 0.8, 0.8`. The scatter plot has a negative association. The year, season, consumer preferences, and market conditions can affect both variables. The table alone does not establish that consumption of one dessert causes consumption of the other.
- Leisure activities: reading values are `7, 9, 12, 17, 30, 50`. Television values are `117, 115, 113, 127, 155, 236`. The full set has a positive association. Age is a measured grouping variable that changes with both reported averages. The table does not show that reading causes television viewing or that television viewing causes reading.
- Gardening: strawberry weights are `6.5, 8, 12, 13.5, 20`. Blueberry weights are `6, 5, 4.5, 3, 2.5`. The scatter plot has a negative association. Week, plant growth, weather, and harvest timing can affect both crops.
- Shoe sales: sandal sales are `12, 153, 215, 27`. Snow-boot sales are `268, 34, 6, 272`. The scatter plot has a strong negative association. Month, season, and temperature affect both sales quantities. Sales of one product do not need to cause sales of the other product.
- Swimsuits and air conditioning have a strong positive association in the displayed plot. Warm weather is a plausible common cause. The plot does not support the claim that buying fewer swimsuits will reduce electricity use.

The current review note says these tables and the scatter plot cannot be described. All values and plotted relationships are readable in the rendered original. Replace the unavailable-content note with the verified data and figure limits.

The DOCX render places floating tables over some prompt lines. The paragraph text retains the complete prompts. It also contains the source typo `show boots` in Exercise 8a. The extracted lesson should use `snow boots` and identify the source typo in its review notes.

## Causal reasoning limits

The extracted lesson says that a direct mechanism can support causation and gives a controlled experiment as an example. A plausible mechanism does not by itself prove causation. A controlled experiment must use an appropriate intervention and controls. Random assignment can reduce confounding when it is feasible. Other evidence can also support causal inference, but an observed scatter plot alone does not establish a causal effect.

The worksheet uses a simplified school classification. Items 5 and 6 likely expect causation because price can affect demand and temperature can affect time outside. The statements still report associations. They do not describe an intervention, random assignment, or control of other variables. An assessment must accept a well-supported answer that identifies this evidence limit. It must not grade the expected school label as proof of causation.

Items 9 and 10 describe more direct dependencies. More pizzas sold requires more cheese when recipe quantity is held constant. More words generally require more pages when layout conditions are held constant. These conditions belong in a strong explanation.

Item 3 gives palm width and television time. Item 4 gives shoe size and reading level. These are correlation-only examples. Age, development, and other factors can affect both variables.

## Minimal repair scope

Retitle `.017` and `.018` to their exact source headings. Complete the extracted source with the readable table values, observed correlation directions, and the evidence limits above.

Add the five Lesson 5-4 candidates as draft and inactive nodes. Use source-only draft blueprints. Add only draft lesson-containment edges. Reuse the two Lesson 5-3 scatter-plot candidates. Do not add duplicate correlation or scatter-plot skills.

Do not add generators, prerequisites, equivalence edges, standards alignments, approval, or readiness. Do not encode a causal label as verified scientific causation when the prompt supplies only observational association.

## Source correction result

The graph now contains the five candidates as draft and inactive nodes. Each new blueprint is source-only and draft. Each new edge is a draft `contains` edge from Lesson 5-4.

Lesson 5-4 also contains the existing Lesson 5-3 scatter-plot construction and correlation-classification candidates. Example `.017` is now a source for both reused blueprints. Their ownership metadata remains Lesson 5-3.

The correction preserves `.017` and `.018` and gives each row its exact source heading. The source now records the readable table values and the causal evidence limits.

The current graph has 834 canonical nodes, 243 skill candidates, and 2,317 edges. It has 239 blueprint rows. Of these rows, 107 are source-only. Six generator bindings exist. The gap queue and rebuilt matrix contain 237 unbound candidates.
