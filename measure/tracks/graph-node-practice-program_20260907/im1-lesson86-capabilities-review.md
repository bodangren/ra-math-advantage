# IM1 Lesson 8-6 source and capability proposal

Lesson 8-6 needs a full source repair before activity authoring. The current lesson is a summary. It omits most of 42 problems, eleven source images, six graph tasks, three source tables, and the multi-part reasoning tasks.

Preserve all stable IDs. Repair stable 8j. Keep broad 8k as an inactive aggregate. Add six draft atomic candidates. Reuse reviewed sequence operations only where the response action is identical. Keep the later composite, open, spreadsheet, and modeling tasks manual.

Do not approve sources, practice, evidence, prerequisites, equivalence, standards, or readiness.

## Sources inspected

Original worksheet:

`apps/integrated-math-1/curriculum/source-materials/practice-worksheet-student-bundle/Int1_0806_practice.docx`

Rendered pages:

- `/tmp/int1_0806_review_20260908/render/page-1.png`
- `/tmp/int1_0806_review_20260908/render/page-2.png`
- `/tmp/int1_0806_review_20260908/render/page-3.png`
- `/tmp/int1_0806_review_20260908/render/page-4.png`

I inspected all pages and the eleven embedded PNG files. The assets contain six coordinate graphs, the paper-fold table, snowman table, County A graph, Fibonacci spreadsheet, and Tower of Hanoi diagram. Preserve the original bytes. Add exact accessible graph coordinates, table values, labels, and diagram rules.

## Source groups and stable identities

The worksheet contains these headings:

- joint `Examples 1 and 2`, Problems 1-6: find the first five terms from recursive rules
- `Example 3`, Problems 7-12: write recursive formulas from displayed sequences
- `Example 4`, Problems 13-18: write recursive formulas from discrete graphs
- `Example 5`, Problems 19-21: write recursive and explicit formulas in contexts
- `Example 6`, Problems 22-29: convert between recursive and explicit formulas
- `Mixed Exercises`, Problems 30-42

Preserve these IDs:

- `.019`: canonical joint `Examples 1 and 2, Problems 1-6`; set draft and inactive.
- `.020`: rejected inactive duplicate of the same joint heading. Do not delete or repurpose it.
- `.021`: `Example 3, Problems 7-12`; set draft and inactive.
- `.022`: `Example 4, Problems 13-18`; set draft and inactive.
- `.023`: `Example 5, Problems 19-21`; set draft and inactive.
- `.024`: `Example 6, Problems 22-29`; set draft and inactive.

Use exact DOCX source references in all four node copies. Mixed-only skills can have exact problem references and empty blueprint `sourceNodeIds`.

## Checked source mathematics

### Recursive evaluation

- P1, `a_1=23`, `a_n=a_(n-1)+7`: `23,30,37,44,51`.
- P2, `a_1=48`, `a_n=-0.5a_(n-1)+8`: `48,-16,16,0,8`.
- P3, `a_1=8`, `a_n=2.5a_(n-1)`: `8,20,50,125,312.5`.
- P4, `a_1=12`, `a_n=3a_(n-1)-21`: `12,15,24,51,132`.
- P5, `a_1=13`, `a_n=-2a_(n-1)-3`: `13,-29,55,-113,223`.
- P6, `a_1=1/2`, `a_n=a_(n-1)+3/2`: `1/2,2,7/2,5,13/2`.

Affine recurrences such as P2, P4, and P5 are not arithmetic or geometric. Stable 8j must accept general first-order recursive evaluation. Do not narrow it to arithmetic and geometric cases.

### Writing recursive rules

- P7-P9 are arithmetic with differences `-13`, `14`, and `9`.
- P10-P12 are geometric with ratios `0.8`, `-1.5`, and `1/3`.
- P19 is arithmetic with difference 175. It asks for the next five terms, a recursive formula, and an explicit formula.
- P20 has sections `2,4,8,16,32` for folds 1-5. Its ratio is 2.
- P21 has heights `6.0,5.4,4.86,4.374` feet for hours 1-4. Its ratio is 0.9. Treat this as a worksheet model. Do not claim that an actual snowman follows exact exponential decay.

The six graph tasks use discrete integer inputs. A source repair must transcribe the plotted coordinates from the original image at native resolution. Do not infer rules from a small preview alone.

### Formula conversion

Example 6 contains both arithmetic and geometric conversions:

- P22 `a_n=3(4)^(n-1)` is explicit geometric.
- P23 `a_1=-2`, `a_n=a_(n-1)-12` is recursive arithmetic.
- P24 `a_1=38`, `a_n=(1/2)a_(n-1)` is recursive geometric.
- P25 `a_n=-7n+52` is explicit arithmetic.
- P26 `a_1=38`, `a_n=a_(n-1)-17` is recursive arithmetic.
- P27 `a_n=5n-16` is explicit arithmetic.
- P28 `a_n=50(0.75)^(n-1)` is explicit geometric.
- P29 `a_1=16`, `a_n=4a_(n-1)` is recursive geometric.

A conversion must preserve the first term and the index domain `n>=2` for its recursive branch. Arithmetic versus geometric is a rule-family input. Explicit-to-recursive and recursive-to-explicit require different evidence because the learner constructs different output forms.

### Mixed-task limits

- P30 converts `a_n=50+25(n-1)` to a recursive cost formula.
- P31 converts `a_1=500`, `a_n=1.05a_(n-1)` to an explicit balance formula.
- P32 combines two model families, a ratio of models, graph extension, a threshold year, and explanation. Keep it manual. Preserve the printed function `(1700+10x)/(1.3(1.012)^x)` and the competitor level 1200 widgets per person.
- P33 asks whether more than 250 six-times-great-grandparents is possible and requests both formula forms. Real family trees can contain repeated ancestors. Treat the ideal binary-tree model as an explicit model assumption.
- P34 derives the arithmetic-series sum formula. This is a series task, not formula conversion.
- P35 requires spreadsheet formulas and numerical investigation of Fibonacci ratios. It is not a geometric-sequence task even though the ratios approach the golden ratio.
- P36 requires explanation of the Tower of Hanoi recurrence `a_n=a_(n-1)+1+a_(n-1)`, simplification, and `a_1`. Keep it manual composite.
- P37 sequence `2,-2,2,-2,...` has recursive and explicit representations. Both students' form claims can be correct. The prompt asks for explanation.
- P38 asks for `a_1` when `a_4=1104` and `a_n=4a_(n-1)+16`. Backward evaluation gives `a_3=272`, `a_2=64`, and `a_1=12`.
- P39 is false. A sequence can have multiple recursive representations. Keep the construction and justification manual.
- P40 `4,9,19,39,79,...` supports `a_1=4`, `a_n=2a_(n-1)+1`. It is an affine-recursive rule-writing task.
- P42 asks for a counterexample to equal first two terms forcing all later terms equal. A valid recurrence can depend on `n` or more than one prior term. Keep it open.

## Capability decisions

### Repair stable 8j: evaluate a recursive sequence

Keep:

`math.im1.skill.8.6.find-the-first-several-terms-of-a-sequence-given-a-recursive`

Use the title `Generate terms of a sequence from an initial condition and recursive rule`.

Direct evidence is `.019`, Problems 1-6. The learner applies the supplied recurrence in order. Include affine, arithmetic, geometric, negative-factor, and fractional-coefficient cases as variants. Keep the node draft, inactive, and source-only. Remove its three placeholders.

### Keep stable 8k as an inactive aggregate

Keep:

`math.im1.skill.8.6.convert-between-recursive-and-explicit-formulas-for-arithmet`

This row combines two directions and two sequence families. Keep it draft and inactive as a source-only planning aggregate. Remove its three placeholders. Do not use it as direct evidence after atomic rows exist.

### New 1: write a recursive formula from displayed sequence terms

`math.im1.skill.8.6.write-a-recursive-formula-from-displayed-sequence-terms`

Direct evidence is `.021`, Problems 7-12. Context-table evidence is `.023`, Problems 19(b), 20(a), and 21(a). Arithmetic, geometric, affine, displayed-list, and exact-table inputs are variants of determining an update rule and initial condition. Mixed Problem 40 is direct affine recursive-rule-writing evidence. Parent inspection confirms that its sole instruction asks for a recursive formula. The update a_n = 2a_(n-1) + 1 with a_1 = 4 reproduces all five printed terms. A future rubric must accept other valid rules because a finite list does not determine a unique continuation.

### New 2: write a recursive formula from a discrete sequence graph

`math.im1.skill.8.6.write-a-recursive-formula-from-a-discrete-sequence-graph`

Direct evidence is `.022`, Problems 13-18. The learner reads the ordered sequence values, determines the update rule, and states the initial condition. The graph representation adds coordinate-reading evidence and is distinct from displayed terms.

### New 3: convert an explicit arithmetic formula to a recursive formula

`math.im1.skill.8.6.convert-an-explicit-arithmetic-formula-to-a-recursive-formula`

Direct evidence is `.024`, Problems 25 and 27. Mixed direct evidence is Problem 30.

### New 4: convert a recursive arithmetic formula to an explicit formula

`math.im1.skill.8.6.convert-a-recursive-arithmetic-formula-to-an-explicit-formula`

Direct evidence is `.024`, Problems 23 and 26.

### New 5: convert an explicit geometric formula to a recursive formula

`math.im1.skill.8.6.convert-an-explicit-geometric-formula-to-a-recursive-formula`

Direct evidence is `.024`, Problems 22 and 28.

### New 6: convert a recursive geometric formula to an explicit formula

`math.im1.skill.8.6.convert-a-recursive-geometric-formula-to-an-explicit-formula`

Direct evidence is `.024`, Problems 24 and 29. Mixed direct evidence is Problem 31.

Do not merge conversion directions. A correct explicit output does not prove that the learner can construct the corresponding recursive initial condition and update rule.

## Exact reuse and manual boundaries

Add Lesson 8-6 containment for these reviewed Lesson 4-5 and G42 capabilities:

- `math.im1.skill.4.5.extend-an-arithmetic-sequence` for Problem 19(a).
- `math.im1.skill.4.5.write-an-explicit-equation-for-an-arithmetic-sequence` for Problem 19(c).
- `math.im1.skill.8.5.write-an-explicit-formula-for-a-geometric-sequence-from-displayed-terms` for Problems 20(b) and 21(b). An exact table is another display of terms.

Do not add the G42 geometric-extension capability for Problem 19(a). The sequence is arithmetic. Do not add a separate paper-folding or snow-model node.

Problems 19-21 remain multi-part tasks, but their separately identified child responses support these direct mappings and New 1. Keep Problems 32-42 manual except Problem 40 recursive-rule writing. Problems 30 and 31 supply the exact conversion responses stated above. Do not create separate skills for money, widgets, ancestry, Fibonacci, Tower of Hanoi, or counterexamples. These are contexts, composites, or open tasks.

## Graph effects

- Preserve all stable IDs.
- Draft `.019`, `.021-.024` in all four node copies.
- Retain `.020` as a rejected inactive duplicate of the joint heading. Remove its containment and exact projection claims.
- Repair stable 8j and keep broad 8k draft, inactive, and source-only.
- Add six new draft, inactive, source-only capability rows.
- Retain existing valid Lesson 8-6 containments for stable 8j and aggregate 8k.
- Add six new containments. Add three exact reuse containments for arithmetic extension, arithmetic explicit-formula writing, and geometric explicit-formula writing.
- Remove no prerequisite based only on lesson order without checking its current identity and reviewed source. G42 removes the 8.5-to-8.6 sequence edge. Do not restore it.
- Remove six placeholder activities for 8j and 8k.
- Add inactive SRS planning rows with `generatorReady:false`.
- Add no equivalence, evidence, standard, or readiness claim.

## Required tests

1. Restore all 42 problems and every subpart.
2. Assert all recursive and explicit formulas, fractions, signs, inequalities, units, and table values.
3. Assert all eleven original asset bytes.
4. Assert exact accessible coordinates for Problems 13-18 after native-image inspection.
5. Assert the complete County A expression, competitor level, axes, and task.
6. Assert the complete Fibonacci sheet values and formulas requested.
7. Assert all Tower of Hanoi rules and both subparts.
8. Assert no checked result appears in a learner prompt.
9. Assert `.019` canonical, `.020` rejected duplicate, and `.021-.024` exact source identities in all node copies.
10. Assert repaired 8j, aggregate 8k, and all six new skills remain draft, inactive, source-only, and unavailable for active SRS.
11. Assert exact Lesson 8-6 containment and removal of only duplicate or unsupported rows.
12. Assert no new prerequisite, equivalence, activity, evidence, standard, or readiness claim.
13. Assert all unrelated graph records remain unchanged.

## Decisions before implementation

Parent review confirms that the accepted G42 explicit-formula node includes exact tables: its direct Problem 29 source is the museum table. Reuse it for Problems 20(b) and 21(b). Parent inspection of page 4 accepts Problem 40 as direct affine rule-writing evidence. No source blocker remains.
