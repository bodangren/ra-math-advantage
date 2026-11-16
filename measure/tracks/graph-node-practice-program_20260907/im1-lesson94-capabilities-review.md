# IM1 Lesson 9-4 source-grounded capability proposal

## Evidence and identity

This proposal uses `Int1_0904_practice.docx`. The source has 30 numbered problems on two pages. It has three native PNG images. I inspected both rendered pages, all prompt text, and the native figures.

The source has four separate headings: `Example 1`, `Example 2`, `Example 3`, and `Example 4`. Retain the existing IDs `.011`, `.012`, `.013`, and `.014` for these four headings. Correct each title and source reference. Do not combine adjacent headings. Do not add source nodes for Mixed Exercises.

The current stable 9f and 9g nodes are broad aggregates. Keep them draft, inactive, and source-only. Remove their placeholder activities. Do not approve or activate source content.

## Complete prompt inventory

| Problem | Exact source task and data | Response boundary |
|---|---|---|
| 1 | Find range: `12,27,43,52,43,18,45,53,26`. | Calculate range. |
| 2 | Find range: `132,127,129,130,141,125,138,129`. | Calculate range. |
| 3 | Find range: `56,101,78,49,55,108,111,64`. | Calculate range. |
| 4 | Find range: `5.9,6.2,3.9,3.7,8.5,6.2,9.0,8.7,4.5,9.3`. | Calculate range. |
| 5 | EXERCISE. Minutes: `30,35,25,28,40,38 / 36,29,34,45,42,39`. Find range. | Calculate range. Native image 1 supplies the table. |
| 6 | Smartphone prices: `311,309,312,314,399,312`. Determine five-number summary and draw box plot. | Determine five-number summary; construct box plot. |
| 7 | Event attendance: `68,99,73,65,67,62,80,81,83`. Same two tasks. | Two separate responses. |
| 8 | Library books: `17,9,10,17,18,5,2`. Same two tasks. | Two separate responses. |
| 9 | Soda ounces: `36.1,35.8,35.2,36.5,36.0,36.2,35.7,35.8,35.9,36.4,35.6`. Same two tasks. | Two separate responses. |
| 10 | Roller-coaster ages: `45,17,16,22,25,19,20,21,32,37,19,21,24,20,18,22,23,19`. Same two tasks. | Two separate responses. |
| 11 | Find IQR: `43,36,51,68,50,27,38,81,33`. | Calculate interquartile range (IQR). |
| 12 | Find IQR: `201,225,217,240,232,252,228,231`. | Calculate IQR. |
| 13 | Find IQR: `94,87,105,99,118,97,102,85`. | Calculate IQR. |
| 14 | Find IQR: `8.4,7.1,6.3,6.8,9.2,7.3,8.8,7.9,5.3,8.2`. | Calculate IQR. |
| 15 | HEART RATE: `108,88,119,75,96,88,100,99,125,81`. Find IQR. | Calculate IQR. |
| 16 | Find standard deviation: `{10,9,11,6,9}`. | Calculate standard deviation. Divisor and rounding conventions are unstated. |
| 17 | Find standard deviation: `{6,8,2,3,2,9}`. | Same convention boundary. |
| 18 | Find standard deviation: `{23,18,28,36,15}`. | Same convention boundary. |
| 19 | Find standard deviation: `{44,35,40,37,43,38,40}`. | Same convention boundary. |
| 20 | PARKING. Weekday cars: `{64,79,81,53,63}`. Find standard deviation. | Same convention boundary. |
| 21 | REASONING. Hockey goals: `{2,4,0,3,7,2}`. Find and interpret standard deviation. | Calculate standard deviation; interpret it in goals. |
| 22 | FOOTBALL. Carries by year: `2006:31`, `2007:90`, `2008:105`, `2009:115`, `2010:162`. Find and interpret standard deviation of carries. | Calculate and interpret standard deviation. Native image 2 supplies the table. |
| 23a | MOVIES. Ages: `67,62,65,38,69,67,59,41,43,36,45,22,69,68,18,15,9,60,64`. Determine five-number summary. | Determine five-number summary. |
| 23b | Draw a box plot. | Construct box plot. |
| 24a | GAS PRICES: `$2.09,$2.19,$3.99,$2.39,$2.29`. Determine five-number summary. | Determine five-number summary. |
| 24b | Draw a box plot. | Construct box plot. |
| 25 | SEASHELLS: `5,11,7,12,13,17,3,15,14`. Find range, five-number summary, IQR, standard deviation; draw box plot. | Five separate operations. |
| 26 | SHOE SIZE: `6,8,8.5,10,12,6.5,7,8,8.5,7.5,9,11.5,10,13,5.5,6.5,5,9.5`. Same five tasks. | Five separate operations. |
| 27 | FIND THE ERROR. Jennifer says remove outliers to decrease standard deviation. Megan says add values equal to the mean. Decide whether either is correct and explain. | Evaluate two proposed data modifications. Native image 3 preserves both statements. Removing valid observations changes the data set and requires a stated purpose. Claims about adding mean-valued observations need a nonempty data set, a stated divisor convention, and positive-variance or zero-variance case handling. Automatic one-answer scoring is unsafe. |
| 28 | ANALYZE. Decide whether two random samples from one population have the same mean and standard deviation sometimes, always, or never. Justify. | Evaluate a sampling-variability claim. The source does not say the samples are independent. Open argument. |
| 29 | CREATE. Write a survey question; collect data from 8 classmates; find range, five-number summary, IQR, standard deviation; draw box plot. | Authentic multi-step task. Keep collection and combined submission manual. Individual calculation operations can use the atoms below after data validation. |
| 30 | WRITE. Explain what IQR says about clustering around the median. | Explain IQR as the spread of the middle half. Manual rubric. |

## Minimal atomic capability proposal

All new candidates are draft, inactive, and source-only.

| Stable ID | Capability | Direct source evidence |
|---|---|---|
| `math.im1.skill.9.4.calculate-the-range-of-a-data-set` | Calculate maximum minus minimum. | 1–5, 25, 26; 29 calculation only |
| `math.im1.skill.9.4.determine-the-five-number-summary-of-a-data-set` | Determine minimum, first quartile, median, third quartile, and maximum under a stated quartile convention. | 6–10, 23a, 24a, 25, 26; 29 calculation only |
| `math.im1.skill.9.4.construct-a-box-plot-from-a-five-number-summary` | Construct a box plot from a five-number summary. | 6–10, 23b, 24b, 25, 26; 29 graph only |
| `math.im1.skill.9.4.calculate-the-interquartile-range-of-a-data-set` | Calculate third quartile minus first quartile under a stated quartile convention. | 11–15, 25, 26; 29 calculation only |
| `math.im1.skill.9.4.calculate-standard-deviation-under-a-stated-divisor-convention` | Calculate standard deviation when the population or sample divisor and rounding rule are stated. | 16–22, 25, 26; 29 calculation only. Source convention is missing, so generated forms must state it. |
| `math.im1.skill.9.4.interpret-standard-deviation-in-context` | Interpret a supplied or calculated standard deviation in the variable's units. | 21, 22 |
| `math.im1.skill.9.4.evaluate-outlier-removal-as-a-way-to-decrease-standard-deviation` | Evaluate Jennifer's proposal to remove outliers to decrease standard deviation and state the data-membership assumption. | 27, Jennifer response; manual rubric |
| `math.im1.skill.9.4.evaluate-adding-mean-values-as-a-way-to-decrease-standard-deviation` | Evaluate Megan's proposal to add values equal to the mean and state divisor, nonempty-set, and variance assumptions. | 27, Megan response; manual rubric |
| `math.im1.skill.9.4.evaluate-variability-of-statistics-across-random-samples` | Evaluate whether two random samples from one population must have equal mean and standard deviation. | 28; manual rubric |
| `math.im1.skill.9.4.explain-interquartile-range-as-middle-half-spread` | Explain what IQR states about clustering of the middle half around the median. | 30; manual rubric |

This proposal adds ten atomic candidates. It makes no exact prior-capability reuse claim. Existing 9f and 9g are broader aggregates. Later 9h, 9j, and 9k nodes combine other representations, transformations, or comparisons and are not exact reuses.

## Stable source identities

- `.011`: Example 1, Problems 1–5, calculate range.
- `.012`: Example 2, Problems 6–10, five-number summary and box plot.
- `.013`: Example 3, Problems 11–15, calculate IQR.
- `.014`: Example 4, Problems 16–20, calculate standard deviation.

Retain existing containment for these four identities and both stable aggregates. Add containment only for accepted atomic candidates. Use exact Mixed Exercise problem references on capabilities. Do not add Mixed Exercise source nodes or `assesses` edges.

## Prerequisite edges for review

These are the only candidate edges for explicit review. Do not infer other edges from lesson order.

- Existing `math.im1.skill.9.1.determine-the-median-of-a-data-set` → new five-number-summary capability. Rationale: the five-number summary includes the median. This is a direct operation dependency.
Do not add five-number-summary calculation → box-plot construction. The proposed box-plot task supplies the summary as input. The learner does not need to calculate it for that task.

Do not add the full-summary → IQR edge. IQR needs Q1 and Q3, but it does not need minimum, median, or maximum. Do not add mean → standard-deviation only because one common procedure calculates the mean first. The task contract can own that internal calculation. Do not add standard-deviation calculation → interpretation when a task can supply the value. Review the concrete task inputs before any such edge.

Do not add prerequisites for Problems 27–30 without a reviewed rubric and task form. `math.im1.edge.1273` was the sequence-only Lesson 9-3 → Lesson 9-4 edge. It is already absent after G46 commit `a161f18b`. The current graph has no prerequisite edge incident to Lesson 9-4. Do not propose another removal ID.

## Manual and source boundaries

The DOCX does not state whether standard deviation uses a population or sample divisor. It does not state rounding precision. Its quartile ambiguity applies to odd-size data sets: it does not state whether the overall median is included or excluded when Q1 and Q3 are found. Preserve worked source text, but do not automatically score convention-dependent answers until each task states its convention.

Problem 27 changes the membership of the data set. Its word `correct` depends on whether the goal permits changing the observed population and on nonempty and variance assumptions. Keep it manual. Problem 28 needs an argument rubric and must not disclose its classification in source content. Problem 29 requires actual data from 8 classmates, learner-supplied data validation, and manual review for survey collection. Problem 30 needs a bounded explanation rubric.

Do not add answers, approval, readiness, equivalence, evidence, or active generator claims.
