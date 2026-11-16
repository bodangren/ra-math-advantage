# IM1 Lesson 10-3 inventory independent review

## Verdict

Reject the proposal until the capability and response mapping issues below are corrected.

The source inventory is complete. It covers all 51 numbered prompts and all 23 native figures. The numeric answers, units, point orders, brackets, and congruence marks match the committed DOCX. The proposed six-atom graph model has one duplicate atom and three response-mapping errors. The exact-reuse section also makes one incorrect approval claim.

This was a read-only review. I did not edit the proposal, source, graph, candidate, or main.

## Source review

I inspected the committed `Int1_1003_practice.docx`. I read its full paragraph sequence and Office Math content. I also inspected all 23 extracted native PNG files in `/tmp/im1-g54-native`.

The inventory preserves these source groups:

- Examples 1 and 2: Problems 1 through 9.
- Example 3: Problems 10 through 23.
- Example 4: Problems 24 through 27.
- Example 5: Problems 28 through 33.
- Mixed Exercises: Problems 34 through 51.

The arithmetic checks pass. This includes `AB = 5184 ft` in Problem 41, `x = 3` and `MJ = 13 miles` in Problem 43, roots `6` and `-5` in Problem 47, and `x = 3`, `y = 4` in Problem 49.

The native figure inventory is accurate. It preserves all visible point orders, total-length brackets, units, values, and congruence marks. Image 20 also includes the `10 mi` to `1 cm` map scale. Image 22 shows the `48 stories` and `29 stories` markers.

## Required response corrections

Problems 32 and 33 ask only for the final segment measure under the direction `Find the measure of each segment.` The current item lines first describe `x` and the segment as responses. Their later boundary text correctly says that `x` is only a calculation stage. Rewrite the item lines so that they identify only these observed responses:

- Problem 32: `DE = 26`; `x = 9.5` is an intermediate stage.
- Problem 33: `UX = 66`; `x = 7` is an intermediate stage.

Problem 36 has the same internal conflict. The source asks for `LO`, not for `x`. Record `LO = 33 in.` as the observed response. Record `x = 4` only as a calculation stage.

The inventory correctly keeps two observed responses for every Problem 10 through 23. The direction explicitly requests the variable and `YZ`. It also correctly keeps both requested results for Problems 25, 43, 46, 47, 49, and 50.

## Stable source identities

The four existing identities are correct:

- `.008` for the printed combined Examples 1 and 2 group.
- `.009` for the same combined group under the second existing identity.
- `.010` for Example 3.
- `.011` for Example 4.

A repository-wide search finds no `math.im1.example.10.3.028` collision. Suffix `.012` already belongs to Lesson 10-4. The proposed append-only `.028` identity is collision-safe and does not renumber later lessons. The proposal must state that `.008` and `.009` intentionally share the same Problems 1 through 9 source group. It must not divide those problems between identities without source evidence.

## Capability correction

Remove proposed atom 1, `Determine segment lengths from labeled part-whole diagrams`.

The approved existing skill `math.im1.skill.10.3.apply-the-segment-addition-postulate-to-find-missing-segment` already covers finding missing segment lengths with the Segment Addition Postulate. The proposed atom repeats that scope. Its prompt list also mixes diagrams with prose contexts, such as Problems 24, 26, and 44. Problem 50 has no numeric calculation. It asks for two explanations. Do not map Problem 50 to this proposed calculation atom.

Use the existing segment-addition skill for these stages:

- Direct part-whole results in Problems 1 through 9, 24 through 27a, 34 through 36, 38, and 42 through 46.
- The segment-addition model stage in Problems 10 through 23, 25, 27a, 32, 33, 35, 36, 41, 43, 45, 46, 47, 49, 50, and 51 when the source directly observes or supplies that stage.

Keep the task-stage boundary. A final numeric response does not independently prove an authored equation unless the prompt requests the equation or the implementation separately observes it.

After this deletion, five provisional draft atoms remain:

1. Use congruent subsegments, equal spacing, or a midpoint to determine segment measures.
2. Write a segment-addition equation or statement from betweenness.
3. Solve a segment-addition equation with quadratic expressions and reject a root that gives a negative segment length.
4. Classify and justify a part-whole segment inequality from betweenness.
5. Model two segment constraints as a linear system.

These five atoms are independently assessable. Keep them draft and inactive. Do not add executable specifications.

## Reuse correction

The proposal says to reuse an approved system-solving capability for Problem 49. The committed graph has no approved linear-system-solving skill. The relevant broad and atomic system skills are draft.

Reuse an exact draft system-solving capability only for the solving stage after the learner supplies or accepts both segment constraints. Keep that reused node draft. Do not promote it through this lesson. Name the exact selected node ID in the corrected proposal. Choose it by equation form and accepted response evidence. Do not use a broad system skill without this check.

The algebra-stage reuse boundary is otherwise correct. Use the Lesson 2.3 or 2.4 skill only when the resulting equation has the matching form. Do not infer algebra evidence from a final segment value.

The rejection of the coordinate-reading skill for Problems 1 through 9 is correct. Those figures provide segment measures. They do not provide endpoint coordinates.

## Manual review boundaries

The proposed manual boundaries are sound with these refinements:

- Problem 27b must observe the assumption and explanation separately from 27a.
- Problem 39 can use controlled equivalent segment-addition forms. Use manual review if the response permits unrestricted notation.
- Problem 46 must preserve the written equation and numeric result as separate observed parts.
- Problem 47 must preserve the root-rejection explanation. A correct final pair alone does not prove this step.
- Problem 48 must preserve classification and justification as separate parts.
- Problem 50 must preserve both requested explanations. Do not score it as a calculation.
- Problem 51 remains fully manual. Require the sketch, point order, two measurements, equation, and consistent solution.

Problem 41 needs a controlled feet-to-miles conversion stage. Problem 49 must observe both `x` and `y`.

## Edge and standard review

Remove `math.im1.edge.1193`. Its only rationale is lesson order. The Lesson 10-3 source does not show that naming points, lines, and planes is a necessary prerequisite for segment addition.

Do not decide `math.im1.edge.1194` from this lesson. Its rationale is also lesson order. Review the Lesson 10-4 source before a keep or remove decision.

Do not copy the existing G-CO.A.2 or G-GPE.B.4 alignments to the new atoms. G-CO.A.2 concerns transformations. G-GPE.B.4 concerns coordinate proofs. This worksheet does not directly observe either capability.

## Required proposal revision

Revise the proposal before graph approval:

1. Correct the observed-response wording for Problems 32, 33, and 36.
2. Remove the duplicate diagram-length atom.
3. Map Problem 50 only to its equation or explanation stages and manual rubric.
4. State five provisional new atoms.
5. Replace the incorrect approved-system claim with one exact draft system-skill reuse ID and a stage boundary.
6. Add a complete prompt-to-skill and prompt-to-atom mapping. Include Problems 25, 27a, 35, 36, 42, 43, and 45 explicitly.
7. Preserve the shared source group for `.008` and `.009`.
8. Keep edge `1194` unresolved until the Lesson 10-4 source review.

The source restoration scope can proceed from the verified 51-prompt and 23-image inventory after these wording corrections. Graph implementation must wait for the revised five-atom proposal and an exact Problem 49 reuse decision.
