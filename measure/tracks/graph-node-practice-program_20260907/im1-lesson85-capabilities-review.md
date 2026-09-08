# IM1 Lesson 8-5 source and capability proposal

Lesson 8-5 needs a complete source repair before activity authoring. The current lesson is a summary. It omits most of the 52 original problems, five figures, exact fraction data, and required explanation tasks. It also treats the five scheduled source rows as five separate example headings. The worksheet has four headings: joint `Examples 1 and 2`, `Example 3`, `Example 4`, and `Example 5`.

Preserve all stable identifiers. Repair stable 8h. Keep broad 8i as an inactive planning aggregate. Add four draft and inactive atomic capability candidates. Reuse two reviewed Module 8 operations. Keep open, research, comparison, construction, and multi-operation tasks manual.

Do not approve source, practice, evidence, prerequisite, equivalence, or readiness claims.

## Source inspection

Original source:

`apps/integrated-math-1/curriculum/source-materials/practice-worksheet-student-bundle/Int1_0805_practice.docx`

I read the document XML and inspected all five rendered pages:

- `/tmp/int1_0805_review_20260908/render/page-1.png`
- `/tmp/int1_0805_review_20260908/render/page-2.png`
- `/tmp/int1_0805_review_20260908/render/page-3.png`
- `/tmp/int1_0805_review_20260908/render/page-4.png`
- `/tmp/int1_0805_review_20260908/render/page-5.png`

The document contains five embedded PNG files. They are the museum table, United States population table, payment table, polygon diagram, and Haro/Matthew work. Preserve the original bytes. Provide complete accessible table or figure descriptions.

## Complete source groups

- Joint `Examples 1 and 2`, Problems 1-12: determine whether each sequence is geometric and explain.
- `Example 3`, Problems 13-24: find the next three terms of each geometric sequence.
- `Example 4`, Problems 25-28: use an explicit formula to find the tenth term.
- `Example 5`, Problems 29-31: write or use geometric and exponential models in museum, population, and depreciation contexts.
- `Mixed Exercises`, Problems 32-52: classification, formula writing, term evaluation, research, missing and previous terms, graph comparison, linear-versus-geometric payment models, parameter recovery, error analysis, justification, and open construction.

The repaired lesson must preserve every fraction, sign, subpart, unit, table value, and displayed student-work line. It must not insert verified answers into learner prompts.

## Checked mathematics

### Classification, extension, and explicit evaluation

- P1 is not geometric: ratios are `1/4` and `2`.
- P3 has ratio 5. P4 has ratio `1/2`. P7 has ratio `1/2`. P12 has ratio 6.
- P6 is not geometric because the last displayed step changes sign behavior: `5,-10,20,40` has ratios `-2,-2,2`.
- P9 is not geometric: ratios are 3, 9, and 81.
- P11 is `3/8,-1/8,-5/8,-9/8`; its differences are constant, but its ratios are not.
- P13 extends with `-250,1250,-6250`.
- P18 extends with `-2,1/4,-1/32`.
- P21 extends with `1/10,1/20,1/40`.
- P25 gives `a_10=9^9=387,420,489`.
- P26 gives `a_10=2(4^9)=524,288`.
- P27 gives `a_10=-9(-3)^9=177,147`.
- P28 gives `a_10=6(-4)^9=-1,572,864`.

Negative values, fractions, and ratios with magnitude below 1 are variants. They do not justify separate capabilities.

### Context and mixed checks

- P29 table values are 4, 6, 9, and `13 1/2` million for years 1-4. The exact rule is `a_n=4(3/2)^(n-1)`.
- P30 uses the source claim 7.3 billion in 2015 and 1.167% annual growth. Treat it as worksheet data, not a current population claim. For 2025, `n=10` under the source indexing and the estimate is approximately 8.20 billion.
- P31 gives `5000(4/5)^6=1310.72` dollars before a rounding instruction is selected.
- P32 data are 334,503,000; 359,402,000; 380,219,000; 398,328,000; and 416,795,000. Neither differences nor ratios are constant. These are source projections, not current claims.
- P33 gives `A_n=500(1.005)^n` if `n` is elapsed months and approximately `$538.84` after 15 months. A sequence-index form that calls the deposit `a_1` needs an exponent shift. A rubric must state the index convention.
- P34 has ratio `-8` and `a_9=3(-8)^8=50,331,648`.
- P35 has ratio `2/3` and `a_7=(9/16)(2/3)^6=4/81`.
- P36 has ratio `1/5` and `a_5=8/5`.
- P37 has ratio `1/4` and `a_8=-1/2048`.
- P38 has ratio `3/2` and `a_6=243`.
- P40(a) starts `0.5,6`, so the ratio is 12. P40(b) has second term 10 and fourth term 40, so `r^2=4`. Both `r=2` and `r=-2` satisfy the given positions. The missing terms and tenth term are not unique unless the task states a positive ratio. Preserve this nonuniqueness.
- P41 has ratio 4. The previous three terms are `-3,-12,-48` in chronological order before `-192`.
- P43 Method 1 is arithmetic with difference `$8`. Method 2 is geometric with ratio 2. A two-year plan comparison depends on whether each table value is monthly pay or a salary rate and whether the question compares the final month or cumulative pay. A rubric must state the interpretation.
- P44 first sequence has ratio `1/2`. From `b_3=7168` and `b_7=28`, `r^4=1/256`. Real ratios `r=1/4` and `r=-1/4` both satisfy the two terms. For sequence `b`, the initial term is `114,688` for either sign because the exponent from term 1 to term 3 is even. The first sequence is printed as `a_n=512(0.5)^x`, with inconsistent `n` and `x` notation. Its initial term is 512 if the source means input `x=0`, but its first sequence term is 256 if the source means `a_n=512(0.5)^n` with `n=1`. Preserve the printed formula and require an explicit index convention. The prompt does not state that the second ratio is positive. A unique-ratio grader would be invalid.
- P45 uses polygon angle sums `180(n-2)`. The values for 3, 4, and 5 sides are 180, 360, and 540. The ratios differ, so the relationship is not geometric.
- P46 can use any constant nonzero sequence: it is arithmetic with difference 0 and geometric with ratio 1. The all-zero sequence makes the ratio test undefined, so do not require it as the canonical example.
- P47: Haro prints `a_9=-5(-2)^(9-1)`, then changes the power to positive `512` and reports `-2560`. Matthew prints the same correct exponent, then treats the even power as `-256` and reports `1280`. Neither is correct. The ninth term is `-1280`. Preserve every displayed line exactly.
- P51 is disproved by a geometric ratio with magnitude between 0 and 1, such as `1,1/2,1/4,...`.

## Stable source identities

Preserve these IDs:

- `.014`: use as the canonical joint `Examples 1 and 2, Problems 1-12` source. Set draft and inactive.
- `.015`: retain as a rejected and inactive duplicate of the same joint heading. Do not delete or repurpose it. Remove exact capability, activity, and evidence claims.
- `.016`: `Example 3, Problems 13-24`. Set draft and inactive.
- `.017`: `Example 4, Problems 25-28`. Set draft and inactive.
- `.018`: `Example 5, Problems 29-31`. Set draft and inactive.

Use exact DOCX references in all four node copies. Do not assign mixed exercises to a fabricated example number. Mixed-only source references can use exact problem ranges with an empty blueprint `sourceNodeIds` list.

## Capability decisions

### Repair stable 8h

Keep:

`math.im1.skill.8.5.determine-whether-a-given-sequence-is-geometric-by-checking`

Use the title `Determine whether a sequence is geometric by checking consecutive ratios`.

Direct evidence is `.014`, Problems 1-12. The learner calculates enough consecutive ratios, states whether they are constant, and explains the conclusion. Arithmetic and neither cases in Problems 32 and 45 can exercise this child operation, but each full prompt requires additional classification or polygon reasoning. Keep both full responses manual.

Keep the row draft, inactive, and source-only. Remove its three placeholder activities.

### Keep stable 8i as an inactive aggregate

Keep:

`math.im1.skill.8.5.write-and-use-explicit-formulas-to-model-real-world-situatio`

This row combines formula writing, evaluation, context modeling, and interpretation. Keep it draft and inactive as a source-only planning aggregate. Remove its three placeholder activities. Do not use it for direct mastery evidence after the atomic rows exist.

### New 1: extend a geometric sequence forward or backward

`math.im1.skill.8.5.extend-a-geometric-sequence-forward-or-backward-using-its-common-ratio`

Direct evidence is `.016`, Problems 13-24. Mixed direct evidence is Problem 41. Forward and previous terms are directions of the same repeated-factor operation. P40 is not direct evidence because its missing-term constraints can be nonunique.

### New 2: evaluate a specified term with an explicit geometric formula

`math.im1.skill.8.5.evaluate-a-specified-term-of-a-geometric-sequence-with-an-explicit-formula`

Direct evidence is `.017`, Problems 25-28. Mixed direct evidence is the evaluation parts of Problems 34-38. The learner substitutes the term number into `a_n=a_1r^(n-1)` and evaluates with correct sign and exponent precedence.

### New 3: write an explicit formula from displayed geometric terms

`math.im1.skill.8.5.write-an-explicit-formula-for-a-geometric-sequence-from-displayed-terms`

Direct evidence is `.018`, Problem 29. Mixed direct evidence is the formula-writing parts of Problems 34-38. The learner determines `a_1`, determines `r`, and writes `a_n=a_1r^(n-1)`. Context labels are variants when the first sequence term is supplied.

### New 4: determine an initial term from two nonconsecutive geometric-sequence terms

`math.im1.skill.8.5.determine-an-initial-term-from-two-nonconsecutive-geometric-sequence-terms`

Direct evidence is only the second-sequence initial-term response in Problem 44(b). The learner uses the two nonconsecutive terms to solve for all allowed real ratios, then determines the initial term. Problem 44(a), the first sequence, and the full comparison remain manual. The response contract must not assume a positive ratio.

## Exact reuse

Add Lesson 8-5 containment for these two reviewed candidates:

- `math.im1.skill.8.1.evaluate-and-interpret-an-exponential-model-at-a-given-input`
  - Direct evidence: `.018`, Problems 30(b) and 31; Mixed Problem 33(b).
- `math.im1.skill.8.3.write-an-exponential-growth-or-decay-model-from-context`
  - Direct evidence: `.018`, Problem 30(a); Mixed Problem 33(a). Both prompts use `n` as elapsed periods. This is the same context-model operation. Sequence notation is an input representation, not a new capability.

Stable 8h remains the Lesson 8-5 sequence classifier. The Lesson 8-1 table classifier overlaps only some positive-ratio cases. Add no containment or equivalence to the Lesson 8-1 classifier.

## Manual and composite tasks

Keep these manual:

- P39 requires external research, an authored data choice, formula writing, evaluation, and interpretation.
- P40 combines missing-term inference, equation writing, and evaluation. Part b is nonunique without a sign assumption.
- P42 combines an assumption, reciprocal-ratio reasoning, graph comparison, and graph construction. The source requires two different sequences. Thus the positive ratio cannot equal 1, and the shared starting constant cannot equal 0. A graphing rubric must also state the integer sequence domain and the exponent-index convention.
- P43 combines arithmetic and geometric classification, two model equations, a 24-month decision, and explanation. Its pay interpretation needs review.
- P46, P48, P51, and P52 are open constructions or counterexamples.
- P47 is source-supported error analysis. Keep it manual until a reviewed diagnostic rubric exists. Do not create a new error skill from one item.
- P49 and P50 are broad explanatory synthesis tasks.

## Graph effects

- Preserve every stable ID.
- Draft the four canonical changed source rows in all four copies. Reject only duplicate `.015` and keep it inactive.
- Repair stable 8h and keep broad 8i draft, inactive, and source-only.
- Add four new source-only skills.
- Add two exact reuse containments for model evaluation and contextual model writing.
- Add one containment for each accepted new or reused capability. Retain each existing valid containment. Do not duplicate it.
- Remove the unsupported Lesson 8-5 to Lesson 8-6 sequence prerequisite if present. Lesson order does not prove a prerequisite.
- Edge 1268 is already removed by G41. Do not restore it.
- Remove only the six placeholder activities for stable 8h and broad 8i.
- Keep all repaired and new SRS rows inactive with `generatorReady:false`.
- Add no evidence, equivalence, standard, or readiness claim.

## Required tests

1. Restore all 52 numbered problems and every subpart.
2. Verify all fractions, negative signs, equations, table values, units, and displayed work.
3. Verify all five original image bytes and complete accessible descriptions.
4. Verify P40(b) and P44 preserve their sign nonuniqueness.
5. Verify P43 preserves the source table and records the pay-interpretation boundary outside the learner prompt.
6. Verify no checked answer appears in a learner prompt.
7. Verify `.014` canonical, `.015` rejected duplicate, and `.016-.018` exact headings in all four node copies.
8. Verify repaired 8h and aggregate 8i are draft, inactive, and source-only.
9. Verify each accepted new skill is draft, inactive, source-only, and has exact problem references.
10. Verify exact Lesson 8-5 containments and no new prerequisite, equivalence, activity, evidence, or active SRS claim.
11. Verify all unrelated graph rows remain unchanged.

## Decisions required before implementation

Parent review must also decide whether stable 8h supersedes the Lesson 8-1 common-ratio classification node for sequence inputs. Do not create an equivalence edge from title similarity.

P40(b), P43, and P44 need explicit response assumptions before automatic grading. Source restoration can proceed without those grading decisions.
