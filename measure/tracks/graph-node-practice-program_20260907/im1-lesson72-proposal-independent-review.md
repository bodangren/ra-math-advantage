# IM1 Lesson 7-2 proposal independent review

## Result

The source repair requires four capability changes. Candidates 4, 6, and 8 are not distinct atomic capabilities as written. Problem 22 also assesses a symbolic generalization that the proposal omits.

This review does not approve a source, node, blueprint, renderer, generator, or practice mode.

## Source verification

I read the DOCX text and inspected both rendered pages:

- `/Users/daniel.bodanske/Desktop/ra-math-advantage/apps/integrated-math-1/curriculum/source-materials/practice-worksheet-student-bundle/Int1_0702_practice.docx`
- `/tmp/int1_0702_review/page-1.png`
- `/tmp/int1_0702_review/page-2.png`
- `/tmp/int1_0702_text.txt`

The source has two worked groups.

- `Examples 1-3` contains Problems 1-15.
- `Example 4` contains Problems 16-17.
- `Mixed Exercises` contains Problems 18-29.

The proposed meanings for `.008` and `.009` match these headings. Mixed Problems 18-29 must not become invented worked examples.

The proposed solutions for Problems 1-20 are correct. The rendered fraction in Problem 19 is `y = (1/4)x - 1/2`, and the second equation is `8x + 12y = -1/2`. The XML text loses the fraction formatting. The rendered page is authoritative for this expression.

The contextual results need one correction. Problem 22 gives the unordered pair `{35 degrees, 55 degrees}` because the source does not state which named angle is larger. The contextual calculations for Problem 24 give 255 Big Cats adults and 845 Petting Zoo children. Part c has 2,145 visitors. Part d has 530 adults, 3,450 children, and 3,980 visitors. Problem 25 has `a = 4` and `b = 3`. Guillermo uses the wrong expression for `b`. Cara finds `b` but misstates the contextual pair.

## Capability findings

Candidates 1, 2, 3, 5, and 7 are defensible draft boundaries.

- Candidate 1 assesses substitution when an expression is already isolated.
- Candidate 2 adds the decision and operation to isolate a variable first.
- Candidate 3 assesses an identity or contradiction as a solution-set result.
- Candidate 5 assesses the place-value representation `10t + u` and `10u + t`. The full Problem 23 response also uses the reused contextual solve-and-interpret capability. A later activity needs part-level evidence before one response can update both nodes.
- Candidate 7 assesses method choice and justification. It does not prove that the learner solved the system.

### Required change 1: remove Candidate 4

Decimal and fractional coefficients change the input. They do not change the substitution operation. Objective 7d makes this variation required course coverage, but it does not make it a separate learner action. Map Problems 18-20 to Candidate 1 or Candidate 2 according to whether a variable is already isolated. Record decimal and fraction coverage in source references and future variant tests. Do not create a rational-coefficient skill.

### Required change 2: split Candidate 6

Candidate 6 combines two different assessed errors.

- Guillermo makes an algebraic substitution error.
- Cara makes a contextual interpretation error after a correct algebraic step.

Use two draft capabilities if both results must have separate learner evidence:

1. Diagnose and correct an algebraic substitution error.
2. Diagnose and correct an interpretation of a contextual system solution.

If the repair must keep the node count smaller, reuse the existing contextual solve-and-interpret capability for Cara's error and add only the algebraic diagnostic capability. Do not keep one score for both error types.

### Required change 3: remove Candidate 8

Candidate 8 is a composite comparison task. It includes common-solution meaning, graphical approximation, and algebraic exactness. The existing G33 capability `math.im1.skill.7.1.explain-the-limits-of-graphing-as-a-system-solving-method` already covers the distinct graphing-limit operation that Problem 27 assesses.

Reuse that node for Problem 27. Record the broader comparison response as a manual source task. Do not add a second capability only because the prompt uses “compare and contrast.” A reviewed multipart rubric can later identify another atomic result if the curriculum needs one.

### Required change 4: cover the Problem 22 generalization

Problem 22 does not specify whether angle A or angle B is larger. The numerical answer is the unordered pair `{35 degrees, 55 degrees}`. Do not state `A = 55` and `B = 35` as the only answer.

The instruction “Generalize your method” asks for more than writing and solving one contextual system. A source-supported result is: for complementary measures with absolute difference `d`, the measures are `(90 + d) / 2` and `(90 - d) / 2`. Add a draft mixed-only capability only if the program wants separate evidence for generalizing a sum-and-difference system. Otherwise, keep this response as a manual task and do not claim that the contextual writing and solving nodes cover the generalization.

With these changes, the bounded proposal has five retained new candidates, plus one algebra-error candidate if contextual interpretation reuses the G33 node. A separate symbolic-generalization candidate is optional but source-supported. This gives six required new candidates, or seven if the generalization is tracked separately.

## Reuse and mapping findings

The four proposed G33 reuses match the source within the limits below.

- Contextual writing: Problems 16, 17, 22, 24, and 28.
- Contextual solve and interpretation: Problems 16, 17, 22, 23, 24, 25, and 26.
- Construct a system with a specified solution count: Problem 28.
- Explain graphing limits: Problem 27.

Problem 21 must remain in the source inventory. It requires the learner to research population data, select two countries, write a model, and predict an intersection. The worksheet supplies no dataset or fixed answer. Keep it as a data-dependent manual task with a direct Problem 21 source reference. Do not map it to a fixed-answer activity or silently omit it.

The `.008` mapping is valid for Candidates 1-3. The `.009` mapping is valid for the two contextual G33 nodes. The mixed-only nodes correctly have no worked `sourceNodeIds`. Their node source references must identify the exact worksheet problems.

The broad legacy 7c row can keep `.008` and `.009` as a draft source aggregate. Its current three empty graphing activities do not assess substitution. Their removal is correct.

## Sequence-edge review

Remove `math.im1.edge.1260`. Graphing a system is not a mathematical prerequisite for solving it by substitution.

Remove `math.im1.edge.1261`. Solving a complete system by substitution is not a prerequisite for elimination. Elimination often uses a final substitution step to recover the second variable, but that operation does not justify a prerequisite on the full broad 7c objective.

Both edges are low-confidence draft edges derived only from lesson order. Their removal does not remove an approved relationship.

The current 7c and 7e SRS rows are inactive and have `generatorReady:false`. Therefore, removal has no present scheduling effect. It removes the graphing prerequisite from the 7c planning row and the broad substitution prerequisite from the 7e planning row. A later activation review must set prerequisites from reviewed atomic dependencies. It must not restore lesson order as a prerequisite.

## Minimum repair scope

Proceed with the source corrections, draft lifecycle, placeholder removal, four reuse links, and two edge removals. Revise the candidate set before graph authoring:

- remove Candidate 4 and map its rational inputs to the applicable substitution operation;
- replace Candidate 6 with an algebra-error node and reuse contextual interpretation, or split it into two nodes;
- remove Candidate 8 and reuse the existing graphing-limit node;
- preserve Problem 21 as a data-dependent manual source task;
- correct Problem 22 to an unordered numerical pair and record its uncovered generalization task.

Keep all new and changed content draft and inactive. Preserve `.008` and `.009`. Use the existing projectors for SRS, activity, teacher, gap, and coverage artifacts.
