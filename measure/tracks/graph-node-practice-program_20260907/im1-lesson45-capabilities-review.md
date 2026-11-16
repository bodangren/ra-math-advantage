# IM1 Lesson 4-5 source note

Status: Author source inventory. The parent accepted the provisional source mapping in `im1-lesson45-independent-review.md`. Capability approval remains open.

## Inspected sources

I read these sources before the graph change:

- `apps/integrated-math-1/curriculum/modules/module-4-lesson-5`
- `apps/integrated-math-1/curriculum/module-4-class-period-plan.md`
- `apps/integrated-math-1/curriculum/source-materials/practice-worksheet-student-bundle/Int1_0405_practice.docx`

I inspected all four pages of the original DOCX. Local renderings are available at `/tmp/int1_0405_review_1825/render/page-1.png` through `/tmp/int1_0405_review_1825/render/page-4.png`.

## Source decision

The current graph retains objective 4j. It covers the decision that a sequence is arithmetic and the justification with a common difference. The source and class plan also require capabilities that the graph did not record separately.

Seven new provisional candidates record these capabilities:

- Find a common difference.
- Extend an arithmetic sequence.
- Write an explicit equation for an arithmetic sequence.
- Use an explicit equation to find a specified term.
- Model a real-world situation with an arithmetic sequence.
- Graph an arithmetic sequence as a discrete function.
- Answer a contextual question with an arithmetic sequence model.

The four retained example IDs and numbers did not change. Their titles now identify only their actual source sections. Each new source-only blueprint links to the direct Example 2, Example 3, or Example 4 section. Each candidate has only one draft lesson-containment edge.

The new candidates are draft and inactive. They have no renderer, mode specification, generator, prerequisite, equivalence, standard alignment, or approval. Existing evidence and relationships did not change.

## Extraction error corrected

The extracted Example 4 gives an incorrect worked answer for the cooler problem. The original says that a 128-ounce cooler loses 4 ounces for each cup. After the 14th cup, 72 ounces remain.

The earlier extraction set `a_1 = 128`, wrote `f(n) = 132 - 4n`, and reported `f(14) = 76`. This mixed the amount before the first cup with the first sequence term. The corrected extraction defines `n` as the number of cups handed out. It records `f(0) = 128`, `f(n) = 128 - 4n` for integer `n` in the physical domain `0 <= n <= 32`, `f(1) = 124`, and `f(14) = 72`. The finite domain applies to this cooler context. It does not change the general definition of an arithmetic sequence.

Example 4 remains valid source evidence for the three requested task types. This correction does not approve the worked content or an answer key.

## Derived inventory

The current graph has 184 skill candidates. Six candidates have registered generator bindings. The gap queue has 178 entries. The blueprint catalog has 180 rows. Of these rows, 48 are source-only rows without mode specifications. These counts describe inventory only. They do not prove production readiness.

## Scope

The source lesson changed only to correct the cooler model and its physical domain. No class plan, standard edge, existing prerequisite, existing equivalence, evidence mapping, renderer, generator, or approval changed.
