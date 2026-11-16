# IM1 Lesson 7-2 revised proposal independent review

## Disposition

Accept the revised proposal for bounded draft authoring.

The six new capabilities are distinct learner actions. The five reused capabilities match the source within the stated part-evidence limits. The proposal keeps all source-only rows draft and inactive. It does not claim curriculum approval or runtime readiness.

## Source fidelity

I compared the revision with both prior reviews and the complete worksheet:

- The correct source is `/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-1/curriculum/source-materials/practice-worksheet-student-bundle/Int1_0702_practice.docx`.
- Rendered pages are `/tmp/int1_0702_review/page-1.png` and `/tmp/int1_0702_review/page-2.png`.
- Extracted text is `/tmp/int1_0702_text.txt`.

The source groups are correct.

- `.008` represents `Examples 1-3`, Problems 1-15.
- `.009` represents `Example 4`, Problems 16-17.
- Problems 18-29 are Mixed Exercises. They do not get invented worked-example IDs.

The revision preserves the full source inventory. It keeps Problem 21 as a data-dependent manual task. It keeps the complete Problem 27 comparison as a manual task. It does not turn either task into a fixed-answer activity.

The stated mathematics matches the rendered source. Problem 19 is `y=(1/4)x-1/2` and `8x+12y=-1/2`, with solution `(1/2,-3/8)`. Problem 22 gives the unordered pair `{35 degrees,55 degrees}`. The source does not say which named angle is larger. The proposed formula `{(90+d)/2,(90-d)/2}` correctly generalizes the complementary-angle case for absolute difference `d`.

## Capability boundaries

The revised six-node set resolves the earlier overlap.

1. The isolated-expression node represents the core substitution and ordered-pair solution. Decimal and fraction inputs remain variants. This avoids the rejected coefficient-only node.
2. The special-solution node classifies identities and contradictions. One operation can have the two valid solution-set outcomes.
3. The digit-reversal node represents place value. It does not claim the later solve-and-interpret result.
4. The algebra-error node applies only to Guillermo's incorrect substitution. It does not include Cara's interpretation error.
5. The efficient-expression node assesses a method choice and its justification. It does not imply successful system solving.
6. The complementary-angle node assesses the explicit “Generalize your method” instruction. It uses an unordered result and does not force an unsupported A/B assignment.

The Lesson 4-3 rewrite reuse is defensible for Problems 5, 6, 13, and 14. Each system requires an equation rewrite before substitution. The proposal correctly states that one undivided answer cannot grant evidence to both the rewrite and substitution skills.

Cara's Problem 25 work can support the existing contextual solve-and-interpret capability only at the correction and interpretation boundary. It must not share the new algebra-error score without part identities.

The Problem 27 reuse is also correct. The existing graphing-limit capability covers graph precision. The full comparison includes more than that capability and remains a manual task.

## Mapping and projection checks

The source-node mappings are correct.

- New capabilities 1 and 2 map to `.008`.
- New capabilities 3-6 are mixed-only and have direct problem references.
- The Lesson 4-3 rewrite reuse maps to `.008`.
- The two contextual G33 reuses map to `.009` for Problems 16-17 only.
- Construction and graphing-limit reuses have no worked source ID.
- Broad legacy 7c can retain `.008` and `.009` as a draft source aggregate.

The proposed 11 containment edges equal six new capabilities plus five reuses. This count is consistent with the revised boundary.

Remove prerequisite edges `1260` and `1261`. Both are low-confidence draft lesson-order edges. Their removal changes only inactive planning prerequisites now. The affected 7c and 7e rows have `generatorReady:false`. A later activation review must use reviewed atomic prerequisites.

Removing the three empty graphing mode specifications must remove only the three false 7c activities. The broad 7c SRS row and the six new SRS rows remain inactive planning rows with `generatorReady:false`.

## Authoring conditions

Use the revised six-node and five-reuse scope. Preserve `.008`, `.009`, all unrelated graph identities, and all unrelated edges. Draft all changed source bodies in every catalog copy. Use source-only blueprints. Keep Problems 21 and 27 in the readable lesson and source inventory.

Tests must verify the exact Problem 19 fractions, the unordered Problem 22 result, the generalization formula, separate Guillermo and Cara boundaries, and the absence of fixed answers for Problems 21 and 27.
