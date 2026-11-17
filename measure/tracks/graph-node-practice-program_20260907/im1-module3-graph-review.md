# IM1 Module 3 Graph Review

## Source scope

This review used these sources:

- `apps/integrated-math-1/curriculum/module-3-class-period-plan.md`
- `apps/integrated-math-1/curriculum/modules/module-3-lesson-1`
- `apps/integrated-math-1/curriculum/modules/module-3-lesson-2`
- `apps/integrated-math-1/curriculum/modules/module-3-lesson-3`
- `apps/integrated-math-1/curriculum/modules/module-3-lesson-4`
- `apps/integrated-math-1/curriculum/modules/module-3-lesson-5`
- `apps/integrated-math-1/curriculum/modules/module-3-lesson-6`

The class-period plan has 12 assessed objectives. The graph had only objectives 3a, 3c, 3e, 3g, 3i, and 3k. It omitted objectives 3b, 3d, 3f, 3h, 3j, and 3l.

## Corrected group

This patch restores the six omitted objectives as draft skill nodes. Each node has the deterministic assembler identifier for its objective text. Each node occurs in both node stores. No new node is approved.

The patch also restores Lesson 3-4 Example 4. The existing sequence skipped this source example. The new identifier is `math.im1.example.3.4.022`. Existing example identifiers stay unchanged.

All 33 worked-example titles now match the headings in the lesson bodies. The old titles copied a class-period group title into each example. This made one example appear to teach several different procedures.

Each of the 12 skill blueprints now points only to the applicable worked examples. The blueprints are source-only draft records. The patch removes empty mode specifications and unproven renderer assignments from the six old Module 3 blueprints. The patch does not add a generator or a runtime activity.

The patch removes seven low-confidence prerequisite edges. Those edges used lesson order as their only evidence. Lesson order does not prove a prerequisite relationship. The new skills and the restored example have draft lesson-containment edges only.

## Source mapping

| Objective | Worked examples |
|---|---|
| 3a | 3-1 Example 1 |
| 3b | 3-1 Examples 2-5 |
| 3c | 3-2 Examples 1-2 |
| 3d | 3-2 Examples 3-4 |
| 3e | 3-3 Examples 1-2 |
| 3f | 3-3 Examples 3-5 |
| 3g | 3-4 Examples 1-4 |
| 3h | 3-4 Examples 5-8 |
| 3i | 3-5 Examples 1-3 |
| 3j | 3-5 Examples 4-7 |
| 3k | 3-6 Examples 1-3 |
| 3l | 3-6 Example 4 |

## Remaining granularity work

The restored rows match the approved course-objective wording. Several objectives still combine independently assessable operations.

- Objective 3a combines representation conversion with domain and range identification.
- Objective 3b combines variable-role identification with axis, scale, and origin interpretation.
- Objective 3g combines intercept work with positive and negative intervals.
- Objective 3h combines equation solving with zero interpretation.
- Objective 3i combines line symmetry with increasing, decreasing, and constant intervals.
- Objective 3j combines extrema with end behavior.
- Objective 3k combines graph construction with six graph features.
- Objective 3l combines function comparison with cost, revenue, and profit modeling. Example 4 supports function comparison. The business model occurs only in the mixed exercises.

A later bounded patch must split these operations before runtime practice activation. That patch needs exact response contracts and reviewed visual source data. Many Lesson 3-3 through Lesson 3-6 examples depend on images that the lesson text does not contain.

No source supports the removed lesson-sequence prerequisite chain. A later prerequisite review must use procedure dependencies or validated assessment evidence.
