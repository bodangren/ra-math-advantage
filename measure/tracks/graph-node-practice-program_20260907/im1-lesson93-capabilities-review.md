# IM1 Lesson 9-3 source-grounded capability proposal

## Evidence

This proposal uses `Int1_0903_practice.docx`. The source has 22 numbered problems on two pages. It has two native PNG images. I inspected both rendered pages, the DOCX text, and both images. The current lesson and class-period plan are summaries. They are not exact prompt evidence.

The source headings are `Example 1`, `Example 2`, `Example 3`, `Example 4`, and `Mixed Exercises`.

## Complete prompt inventory

| Problem | Source task | Observable operations and boundary |
|---|---|---|
| 1 | SPORTS. Awan asks students leaving basketball practice about the favorite sport among students. Identify the intended population. Determine the potential sample bias. | Identify a target population; identify sample bias. These are two responses. |
| 2 | STORES. Raya wants the mall's most popular stores. Explain how she could choose an unbiased sample. | Design an unbiased sampling method. Open response. |
| 3a | MUSIC. The online question says, “Music education enriches student learning. Do you support music education in schools?” Identify potential bias. | Identify bias in question wording. |
| 3b | Identify whose interests the question may serve. | Identify the beneficiary of a biased question. Open response. |
| 4a | CANDIDATES. A mayoral poll appears beside an opinion piece that supports one candidate. Identify potential bias. | Identify contextual survey bias. |
| 4b | Identify whose interests the question may serve. | Identify the beneficiary of contextual bias. Open response. |
| 5 | BUTTERFLIES. Data: `1, 8, 2, 2, 5, 6, 4`. Find mean, median, and mode. State which measures accurately summarize the data. | Reuse three exact calculation capabilities. Add a separate measure-selection response. |
| 6 | OUTLIERS. Choose mean or median as the better center for a data set with an outlier. Explain. | Select a resistant measure of center and justify it. |
| 7 | SALES. Compare Vendor 1 and Vendor 2 T-shirt graphs for 2016 and 2017. Decide whether the graphs misrepresent the data. Explain the effect on interpretation. | Evaluate graph-scale misrepresentation and explain its effect. The native graphs show `70` and `120` for both vendors. Vendor 1 prints labels `60` through `160` in steps of 20; its unlabeled bottom grid line is interpreted as `40`. Vendor 2 prints `20` through `140`. Accessible text must distinguish printed labels from the inferred Vendor 1 lower bound. |
| 8 | SCALE. The same data use y-axis scales 0–10 and 0–100. Explain the effect on the representation. | Explain how axis scale changes visual emphasis. |
| 9 | SCIENCE. Choose an elective or required class to obtain the least-biased sample of student science interests. Explain. | Compare sampling frames for bias and justify the choice. |
| 10 | TAX. Surveyors give facts before a tax survey. Explain how selected facts can introduce bias even without opinions. | Explain selection or framing bias in survey information. |
| 11 | CONSTRUCT ARGUMENTS. Dolphin weights: `185, 222, 755, 801, 835, 990, 1104`. Choose the best measure of center and justify it. | Select a measure of center for a supplied distribution and justify it. The word `best` depends on the summary objective and on how the two low values are interpreted. Keep the response manual until the rubric states this objective. |
| 12 | FOOD DRIVE. Evaluate whether the Valley High School 2012/2017 canned-goods chart is misleading. Explain. | Evaluate pictorial graph misrepresentation. The native chart text says number of canned goods, while the y-axis says `Canned Goods (1000 lbs)`. The bars are approximately 20 and 40 thousand pounds. The 2017 can is both wider and taller than the 2012 can. Preserve this unit mismatch. Do not invent an exact picture-area ratio. |
| 13 | REASONING. Reading-club data: `11, 12, 10, 13, 10, 10`. Without calculation, explain how adding the outlier `24` changes which center best represents the data. | Predict an outlier's effect on measure selection. |
| 14 | PRECISION. Eight tomato plants range from `0.4` to `0.9` m. Regina rounds median `0.7` m to `1` m. Evaluate accuracy and explain. | Evaluate whether rounding preserves a statistic accurately in context. This is not a request to calculate the median. |
| 15 | REGULARITY. Describe a general method to assess a sample for bias. | Describe a bias-assessment method. Open rubric. |
| 16 | STRUCTURE. Explain how adding a fixed value such as `10` to every value affects the median and mean. | Predict the median shift; predict the mean shift. These are two atomic results in one prompt. |
| 17 | CREATE. Create two data sets and a graph or chart that shows bias toward one set. | Construct a biased comparative display. Manual review is required. |
| 18 | WRITE. Write two scenarios that have different examples of sample bias. A classmate rewrites the statements without bias. | Create two scenarios with different types of sample bias. The prompt does not specify which bias types. The classmate action is not individual learner evidence unless a collaboration contract exists. |
| 19 | CREATE. Select a teacher-survey topic, conduct the survey, and explain whether the questions introduce bias. | Conduct a survey and evaluate its question bias. This is a multi-step authentic task. Keep it manual. |
| 20 | ANALYZE. Decide whether a biased sample is sometimes, always, or never valid. Justify. | The meaning of `valid` is underspecified. Keep the argument manual until the rubric defines validity and the relevant inference target. |
| 21 | PERSEVERE. The source states that equal mean, median, and mode imply symmetry. It asks what mean less than median says about the data set. | Keep the entire prompt under manual correction review. The premise is false. For example, `[-4,-1,0,0,0,2,3]` has mean, median, and mode `0` but is asymmetric. Mean less than median alone also does not guarantee skew direction. For example, `[0,0,0,0,5,5,5,5,5,13]` has mean `3.8`, median `5`, and positive third central moment `56.784`. Do not publish the premise or assign an automatic shape label. |
| 22 | FIND THE ERROR. Olivia samples 8 turtles from one pond. Caleb samples 2 turtles from each of 4 ponds. Choose the sample more likely to be free of bias and explain. | Compare sampling designs for bias and justify the choice. |

## Source identity reconciliation

- Retain `math.im1.example.9.3.008` for Example 1, Problems 1 and 2. Replace the period-plan source reference with the exact lesson source reference.
- Retain `math.im1.example.9.3.009` for Example 2, Problems 3 and 4. Correct its title and source reference. Its current title incorrectly includes measures of center.
- Retain `math.im1.example.9.3.010` for Example 3, Problems 5 and 6. Correct its title and source reference. It is not a duplicate of Example 2.
- Add `math.im1.example.9.3.025` for the actual Example 4, Problems 7 and 8. Preserve all existing IDs. `.025` is unused in `nodes.json`, `draft-nodes.json`, `edges.json`, and `standard-edges.json`. Do not renumber Lesson 9-4 or later examples.
- Do not add source nodes for Mixed Exercises. Use exact problem and subpart source references on capabilities.

## Exact prior reuse

Problem 5 directly reuses these three atomic Lesson 9-1 capabilities:

- `math.im1.skill.9.1.calculate-the-arithmetic-mean-of-a-data-set`
- `math.im1.skill.9.1.determine-the-median-of-a-data-set`
- `math.im1.skill.9.1.identify-all-modes-of-a-data-set`

Do not reuse the stable Lesson 9-1 aggregate. Do not reuse the stable Lesson 9-6 transformation aggregate for Problem 16. It combines adding, multiplying, five statistics, and comparison work that this prompt does not request.

## Stable aggregate treatment

Preserve these stable IDs as draft, inactive, source-only aggregates. Remove their placeholder activities.

- `math.im1.skill.9.3.identify-sample-bias-in-survey-and-sampling-methods-and-expl`
- `math.im1.skill.9.3.recognize-biased-survey-questions-and-identify-whose-interes`

The first combines bias identification with effect explanation. The second combines bias identification with beneficiary identification. Their child responses must remain separate.

## Proposed atomic candidates

All candidates are draft, inactive, and source-only.

| Stable ID | Capability | Direct evidence |
|---|---|---|
| `math.im1.skill.9.3.identify-the-intended-population-for-a-survey` | Identify the intended population for a survey. | 1, population response only |
| `math.im1.skill.9.3.identify-sample-bias-in-a-sampling-method` | Identify sample bias in a stated sampling method. | 1, bias response only |
| `math.im1.skill.9.3.design-an-unbiased-sampling-method` | Design an unbiased sampling method for a stated population. | 2 |
| `math.im1.skill.9.3.identify-bias-in-survey-wording` | Identify or evaluate bias in the wording of a survey question. | 3a; Problem 19 question-bias evaluation only |
| `math.im1.skill.9.3.identify-contextual-bias-around-a-survey` | Identify bias caused by the context around a survey. | 4a |
| `math.im1.skill.9.3.identify-who-benefits-from-survey-bias` | Identify whose interests a stated survey bias can serve. | 3b, 4b |
| `math.im1.skill.9.3.select-a-measure-of-center-and-justify-the-selection` | Select a suitable measure of center and justify it from the data shape. | Problem 5, selection response only; Problem 6, selection and justification; Problem 11 stays manual until `best` has a defined objective |
| `math.im1.skill.9.3.evaluate-graph-scale-misrepresentation` | Decide whether axis-scale choices misrepresent data and explain the effect. | 7 |
| `math.im1.skill.9.3.explain-how-axis-scale-affects-a-data-display` | Explain how a stated axis scale changes visual emphasis. | 8 |
| `math.im1.skill.9.3.compare-sampling-frames-for-bias` | Compare stated sampling frames and justify which is less biased. | 9, 22 |
| `math.im1.skill.9.3.explain-bias-from-selected-survey-information` | Explain how selected factual information can bias a survey. | 10 |
| `math.im1.skill.9.3.evaluate-pictorial-graph-misrepresentation` | Evaluate whether picture size or chart design misrepresents displayed values. | 12 |
| `math.im1.skill.9.3.predict-how-an-outlier-affects-measure-selection` | Predict how an added outlier changes the appropriate measure of center. | 13 |
| `math.im1.skill.9.3.evaluate-contextual-accuracy-of-a-rounded-statistic` | Evaluate whether rounding a reported statistic is accurate for its context. | 14 |
| `math.im1.skill.9.3.describe-a-method-for-assessing-sample-bias` | Describe a general method for assessing sample bias. | 15 |
| `math.im1.skill.9.3.predict-the-mean-after-adding-a-constant-to-all-values` | Predict how adding a constant to all values changes the mean. | 16, mean response |
| `math.im1.skill.9.3.predict-the-median-after-adding-a-constant-to-all-values` | Predict how adding a constant to all values changes the median. | 16, median response |
| `math.im1.skill.9.3.construct-a-biased-comparative-data-display` | Construct two data sets and a display that visually favors one set. | 17; manual |
| `math.im1.skill.9.3.create-a-scenario-with-sample-bias` | Create two scenarios with different sample biases. | 18, learner-created scenarios only |
| `math.im1.skill.9.3.evaluate-when-a-biased-sample-can-be-valid` | Make and justify a bounded claim about when a biased sample is valid. | 20 |

This proposal adds 20 atomic candidates and reuses three exact capabilities. Problem 5 has mean `4`, median `4`, and mode `2`. It does not support an equal-three-centers rule or a new three-center aggregate.

## Graph and manual boundaries

Retain existing Lesson 9-3 containment for `.008`, `.009`, `.010`, and both stable aggregates. Add containment for `.025` and only the accepted atomic candidates. Remove unsupported prerequisite edges that exist only because of lesson order. Do not add prerequisite or equivalence edges from this worksheet alone.

Use exact source references for direct evidence. Do not add Mixed Exercise source IDs or `assesses` edges. Keep Problems 11, 17, 19, 20, and 21 manual as specified above. Keep open explanations and arguments under manual rubrics until accepted response criteria exist.

Do not publish, approve, activate, or mark any node ready. The source lesson must first restore all 22 prompts, all subparts, and both original images with accessible graph descriptions. It must not include answers from the current summary.
