# IM1 Lesson 9-1 source and capability proposal

## Source review

The parent read the DOCX text and all five rendered pages of `Int1_0901_practice.docx`. Rendered pages are at `/tmp/int1_0901_review_20260908/render/page-1.png` through `page-5.png`. Page 5 contains Problem 39. The worksheet has 39 problems and ten embedded images.

The current lesson is a summary. It omits most original prompts and tables. It incorrectly describes the first two images as likely blank spaces. They contain the complete data sets for Problems 3 and 4. Its percentile vocabulary uses values at or below the selected value, while its displayed formula uses values strictly below. Do not preserve this contradiction.

Preserve original prompts, units, values, labels, requested explanations, and all ten original images. Add complete accessible tables. Keep verified answers in review notes, not learner prompts.

## Source identities

Preserve `math.im1.example.9.1.001` as Example 1, Problems 1–9, which asks for mean, median, and mode. Preserve `.002` as Example 2, Problems 10–12, which asks for percentile rank from the marching-band table. The current titles combine both headings. Correct the titles and original DOCX references in all four catalogs. Both rows must become draft and inactive. Neither is a duplicate.

Preserve `math.im1.skill.9.1.calculate-the-mean-median-and-mode-of-a-data-set` as an inactive draft aggregate. Do not repurpose its stable ID as one child operation. Mean, median, and mode require separate responses and can be correct or incorrect independently.

The inspected IM1 inventory contains no existing atomic mean, median, mode, or percentile-rank skill to reuse. The later Lesson 9-6 transformation aggregate also includes range and standard deviation. It is not exact evidence for one Lesson 9-1 center response.

## Proposed atomic capabilities

Add four draft, inactive, source-only candidates:

1. `math.im1.skill.9.1.calculate-the-arithmetic-mean-of-a-data-set`. Direct sources: mean responses in Problems 1–9; mixed mean responses in 15, 17, 19, 24(a), 25(a), 26, and 30(a).
2. `math.im1.skill.9.1.determine-the-median-of-a-data-set`. Direct sources: median responses in Problems 1–9; mixed median responses in 15, 19, 24(a), 25(a), 26, and 30(a).
3. `math.im1.skill.9.1.identify-all-modes-of-a-data-set`. Direct sources: mode responses in Problems 1–9; mixed mode responses in 15, 19, 22, 24(a), 25(a), 26, and 30(a). Support no mode and multiple modes. Do not return only the first tied mode.
4. `math.im1.skill.9.1.calculate-a-percentile-rank-under-a-stated-counting-convention`. Direct sources: Problems 10–12; mixed Problems 18, 20, 23, 24(c), and 31. The source does not explicitly define the counting formula. Runtime authoring must state its convention, denominator, tie treatment, and rounding. A table and a supplied count of lower scores are input variants of this operation.

Use source `.001` for the first three blueprint source lists and `.002` for the fourth. Mixed references must identify exact response portions. Lists, ungrouped tables, decimals, and contexts are input variants. They do not justify separate capabilities.

Keep broad 9a inactive. Remove its three placeholder activities. Add four lesson containments and inactive SRS planning rows. Review the existing incident edges before changing any prerequisite. Do not infer a prerequisite or equivalence from lesson order or similar titles. Add no approval, generator, active activity, evidence, or readiness claim.

## Percentile convention and source limits

Under the explicitly chosen strict-below count divided by total count, the marching-band ranks are Hamilton 9/12 = 75%, Monmouth 3/12 = 25%, and Freeport 6/12 = 50%. Counting the selected value as at-or-below would instead give 83 1/3%, 33 1/3%, and 58 1/3%. The worksheet supplies no formula that resolves this difference. Do not silently claim either convention is printed in the source.

Problems 18 and 23 state how many contestants scored lower: 40/50 = 80% and 27/30 = 90% under strict-below counting. Problem 20 includes Shawnte among 25 competitors, so 19/25 = 76%. Problem 31 includes Pascal among 16 competitors, so 12/16 = 75%. Do not exclude the selected person from the denominator.

Under strict-below counting, laptop retailers C, F, and J have ranks 20%, 30%, and 40%. Problem 25(b) needs separate review: the middle novel has strict-below rank 3/7, which is below 50%, even though it is the median length. An instruction about ranks below 50% differs from lengths below the median. Keep this interpretation task manual until the rubric makes the intended comparison explicit.

## Checked source values

Problem 3 contains rows `2,1,1,5,7` and `3,2,4,6,2`. Problem 4 contains rows `50,30,40,10`; `20,80,60,90`; and `10,30,110,70`.

Checked mean, median, and modes:

| Problem | Mean | Median | Modes |
| --- | --- | --- | --- |
| 1 | 15.625 | 15.5 | none |
| 2 | 4.63 | 4.65 | 6.4 |
| 3 | 3.3 | 2.5 | 2 |
| 4 | 50 | 45 | 10 and 30 |
| 5 | 5 | 4 | 3 |
| 6 | 200 | 200 | 199 and 201 |
| 7 | 54.75 | 54 | 53 |
| 8 | 32 1/3 | 23 | 23 |
| 9 | 39.5/14 | 2.75 | 2 |
| 15 | 252 | 245 | none |
| 17 | 23 | not requested | not requested |
| 19 | 51.5 | 51 | none |
| 24(a) | 392 | 384 | 425 |
| 25(a) | 767433/7 | 66556 | none |
| 26 | 40 | 35 | 25 |
| 30(a), before requested rounding | 228.5 | 222.5 | 220 |

Problem 21 requires score 20. The fifth score makes the mean and median both 21. Keep this compound constraint task manual.

Problem 25(c) changes Lord of the Flies from 59900 to 69920 words. The median changes from 66556 to 69920. The mean increases by 10020/7. A claim that the median never changes when one value changes would be wrong.

Problem 28 starts with mean 20, median 20.5, and mode 20. Adding 65 changes the mean to 25 and median to 21. The mode stays 20.

## Manual boundaries

Keep the explanation, assumption, research, transformation, and construction tasks manual: Problems 13–14, 16, 21, 24(b), 25(b–c), 27–29, 30(b), and 32–39. Their required reasoning is not established by a correct center value alone.

Problem 27 requests research about the 2016 Olympics. Preserve the original research instruction. Do not invent medal data.

Problem 35 does not restrict the multiplier. A nonzero factor multiplies all modes and both mean and median by that factor. For factor zero, all values become zero. A previously modeless data set can acquire mode zero. Preserve this case in a future rubric.

Problem 36 contains three situations: art prices with luxury paintings, student volunteer hours with one larger value, and amusement-park attendance with one tripled day. Each can support a median-based description of a typical observation. The source does not supply enough detail for a unique forced-choice answer. Keep the original options and accept justified reasoning through teacher review.

Problem 37 asks whether median is the best summary of tomato-plant growth. The prompt does not define the purpose of the summary. Do not require a single unqualified answer or claim that median is always wrong. Problems 38–39 request explanations, not numerical computations.

## Source assets

1. Problem 3 data table.
2. Problem 4 data table.
3. Marching-band scores for Problems 10–12.
4. Basketball points for Problem 19.
5. Laptop prices for Problem 24.
6. Novel titles and word counts for Problem 25.
7. Volunteer hours for Problem 26.
8. Pet adoptions for Problem 28.
9. Bowling scores for Problem 30.
10. Three complete situations for Problem 36.

## Required review before implementation

Independently verify all five pages, native image values, calculations, the four candidate boundaries, existing reuse search, exact source identities, and the percentile interpretation. Confirm all manual reasoning responses remain represented in the program. No source implementation or graph mutation is authorized by this proposal alone until the planned independent review is complete.
