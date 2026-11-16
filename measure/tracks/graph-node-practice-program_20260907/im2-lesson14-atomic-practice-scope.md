# IM2 Lesson 1.4 atomic practice scope

## Decision

Implement one finite practice set for each accepted Lesson 1.4 atomic skill. Reuse the existing IM2 pilot request, retry, grading, and evidence flow. Add a small triangle-ordering content module and a small learner component. Do not add a registry or a new practice framework.

Keep both skill nodes and both blueprints in draft. Keep `independentPracticeReady` false. Keep SRS eligibility false. A later verification task can activate the graph records after the real learner and teacher flows pass.

## Source authority

Use `apps/integrated-math-2/curriculum/modules/module-1-lesson-4` as the source. It identifies the native figures and the unanswered prompts. The shared instruction for Problems 6 through 11 is: `List the angles and sides of each triangle in order from smallest to largest.`

The source does not give a demonstrated solution. Therefore, the implementation must label each new solution as authored. It must not describe a new solution as a native Worked example.

Preserve these four legacy draft identities without changes:

- `math.im2.example.1.4.013`
- `math.im2.example.1.4.014`
- `math.im2.example.1.4.015`
- `math.im2.example.1.4.016`

Do not attach the new activities to these IDs. Bind each activity directly to one atomic skill ID.

## Atomic content

### Order angles from side lengths

Node: `math.im2.skill.1.4.order-triangle-angles-from-side-lengths`

Use these native problems in mode order:

| Mode | Native problem | Given sides | Correct order |
| --- | --- | --- | --- |
| Worked | 6 | `RS = 23.7`, `TS = 35`, `TR = 48` | `∠T, ∠R, ∠S` |
| Guided | 8 | `AB = 3.8`, `AC = 4.0`, `BC = 4.3` | `∠C, ∠B, ∠A` |
| Independent | 11 | `PR = 12`, `RQ = 18`, `PQ = 20` | `∠Q, ∠P, ∠R` |

The authored Worked solution must show these steps:

1. Label the content `Authored solution for native Problem 6`.
2. Order the side lengths from least to greatest.
3. Match each side to its opposite angle.
4. Give the final angle order.

The Guided item must ask the learner to order the side lengths first. It must then ask for each opposite angle. It can reveal hints only after an unsuccessful attempt. The Independent item must not return the answer, solution steps, or hints to the learner.

### Order sides from angle measures

Node: `math.im2.skill.1.4.order-triangle-sides-from-angle-measures`

Use these native problems in mode order:

| Mode | Native problem | Given angles | Correct order |
| --- | --- | --- | --- |
| Worked | 7 | `∠T = 40°`, `∠R = 60°`, `∠S = 80°` | `RS, ST, RT` |
| Guided | 9 | `∠E = 25°`, `∠C = 35°`, `∠D = 120°` | `CD, DE, CE` |
| Independent | 10 | `∠T = 54°`, `∠S = 60°`, derive `∠R = 66°` | `RS, RT, ST` |

The authored Worked solution must show these steps:

1. Label the content `Authored solution for native Problem 7`.
2. Order the angle measures from least to greatest.
3. Match each angle to its opposite side.
4. Give the final side order.

The Guided item must ask the learner to order the angles first. It must then ask for each opposite side. It can reveal hints only after an unsuccessful attempt. The Independent item for Problem 10 must require the learner to calculate `∠R = 180° - 60° - 54° = 66°` before ordering the sides. It must not return the answer, solution steps, or hints to the learner.

## Response and grading contract

Use the existing `Question`, `questionSchema`, and `gradeQuestion` primitives for each scored part. Do not reduce Guided practice to one final multiple-choice response.

Use these exact Guided parts for Problem 8:

1. `measure_order`: select `AB = 3.8, AC = 4.0, BC = 4.3` in increasing order.
2. `opposite_correspondence`: match `AB → ∠C`, `AC → ∠B`, and `BC → ∠A`.
3. `final_order`: select `∠C, ∠B, ∠A`.

Use these exact Guided parts for Problem 9:

1. `measure_order`: select `∠E = 25°, ∠C = 35°, ∠D = 120°` in increasing order.
2. `opposite_correspondence`: match `∠E → CD`, `∠C → DE`, and `∠D → CE`.
3. `final_order`: select `CD, DE, CE`.

Each part must have a stable private correct choice ID and at least two source-plausible incorrect choices. Grade each choice with `gradeQuestion`. Save one `practice.v1` part for each scored part. Give each part score `0` or `1` and max score `1`. The overall score is the sum of the part scores. The Guided component must require the learner to complete the parts in the listed order. It can reveal the next hint only after an unsuccessful saved attempt for the current part.

Use one `final_order` choice part for Independent Problem 11.

Use two parts for Independent Problem 10:

1. `missing_angle`: a numeric question with the exact answer `66` and the calculation `180 - 60 - 54`.
2. `final_order`: a choice question with the exact answer `RS, RT, ST`.

The learner must submit the missing-angle part before the side-order part. Each last-part attempt includes both parts. It becomes a completed receipt only when both parts are correct. The overall score is 2 only when both parts are correct.

The current graph has no atomic skill for finding a missing triangle angle from the 180-degree triangle-angle sum. `math.standard.ccss.g-co-c-10` states that theorem. It is a standard record and is not a skill prerequisite. The later Module 2 polygon-interior-angle skill is not an accurate prerequisite for this Lesson 1.4 task. Do not add either record as a prerequisite edge in this batch.

Keep the P10 `missing_angle` result as a non-mastery support part in the same submission. Do not create learning evidence for that part. If exact target-node evidence is activated later, allow target evidence only when `missing_angle` and `final_order` are both correct. Build the target node graded evidence from `final_order`; retain `missing_angle` in the receipt as the prerequisite gate. This prevents a missing-angle error from becoming evidence against the side-ordering atom and prevents a guessed side order from becoming accepted evidence without its prerequisite calculation. A future source review can add an atomic triangle-angle-sum skill and a prerequisite edge. That work is outside this scope.

Worked items use the same part definitions in read-only solution form. They require only the existing acknowledgement submission. They must not write grades or learning evidence.

Use the native figure path and its current alternative text in each projected item. Render the figure with the current public asset. Do not edit, copy, or rename the six source images. Do not change the restored source lesson.

## Deterministic allocation

This is a finite source set. Do not create a random generator. Resolve the item from the exact node ID and mode:

- the node ID selects one of the two atomic capabilities;
- the mode selects its fixed native problem;
- `generatorSeed` stores the native problem number;
- difficulty is fixed at `1` for compatibility with the existing activity record.

Reject a node, mode, seed, or difficulty that does not match this table. A repeated read must return the same public item.

Use these six stable activity IDs:

- `math.im2.skill.1.4.order-triangle-angles-from-side-lengths.worked_example`
- `math.im2.skill.1.4.order-triangle-angles-from-side-lengths.guided_practice`
- `math.im2.skill.1.4.order-triangle-angles-from-side-lengths.independent_practice`
- `math.im2.skill.1.4.order-triangle-sides-from-angle-measures.worked_example`
- `math.im2.skill.1.4.order-triangle-sides-from-angle-measures.guided_practice`
- `math.im2.skill.1.4.order-triangle-sides-from-angle-measures.independent_practice`

The seed mutation must be idempotent. It must preserve review fields when the exact stored content is unchanged. It must clear approval and force `srsEligible: false` when reviewed content changes. New records must start without approval and with `srsEligible: false`.

Do not add this seed mutation to `seedAll`. The six records need a separate reviewed seed and activation step.

## Learner flow

Add the two sequences below the existing perpendicular-bisector sequence on `/student/practice`. Do not remove or rename the existing pilot.

The query must return a triangle sequence only when all three records for that node have exact stable IDs, node IDs, modes, component keys, seeds, difficulty, and approved activity state. It must also require the exact graph node and blueprint publication state through the existing publication check pattern. With the current draft graph records, the query returns no triangle items.

The learner component must:

- render the source figure and alternative text;
- render the authored Worked label and steps;
- render each Guided scored part in its required order;
- render the P10 numeric prerequisite part before its final-order choice;
- render a choice control for choice parts and a numeric control for `missing_angle`;
- preserve one idempotency key and one body for a failed request;
- block duplicate in-flight submission;
- reveal Guided hints only after an unsuccessful saved attempt;
- replace the current part with `nextPart` after an intermediate correct response;
- stay on the last part after an incorrect last-part response;
- advance to the next activity only when `complete` is true;
- hydrate `acceptedAnswers`, `hintsUsed`, and `revealStepsSeen` after reload;
- keep private answers out of Independent projection and client state.

Use the existing `/api/activities/[activityId]/submissions` route. Change its backend target from the perpendicular-specific mutation name to a bounded practice mutation that supports the existing perpendicular node and the two new nodes. Preserve the existing perpendicular request and public response contract. Add one strict triangle request branch.

### Part request lifecycle

Do not require all future part keys on an intermediate request. Use a strict prefix request:

```text
{ answers: { <completed part IDs in order>, <current part ID> }, hintsUsed, revealStepsSeen }
```

The first request contains only the first part. The second request contains the accepted first answer and the current second answer. The final request contains all part answers. Reject a missing prefix key, a future key, an extra key, or a malformed answer before a write. JSON object key order has no authority. Compare the exact required prefix key set and use the fixed part order from the server contract. Do not accept a client-supplied stage number, next-part ID, score, or completion flag. The server derives these values from the fixed item contract and stored rows.

Use one existing `activity_submissions` row for each saved part attempt. Do not add a session table or mutable draft row. Store a normal `practice.v1` envelope. Store the prefix answers in `answers`. Store only the current graded part in `parts` for an intermediate attempt. Put the fixed current part ID and `finalPart: false` in the existing `artifact` record. A last-part attempt stores all regraded parts, the complete answer set, and `finalPart: true`, whether its current answer is correct or incorrect. `finalPart` describes position only. The public and stored `complete: true` value requires all fixed parts to be correct. Do not use `finalPart` alone as completion proof.

Before each request, read only the newest submission row for that learner and activity with the existing descending attempt-ordinal index. Validate its full stored envelope, artifact, fixed item identity, and part shape. If the newest row is a correct intermediate receipt, its full answer prefix is the accepted prefix and the next fixed part is current. If it is an incorrect intermediate receipt, drop only its current answer to recover the accepted prefix and keep that same part current. Require every earlier supplied answer to equal this derived accepted prefix. This prevents the client from changing an accepted part or skipping a part. It also avoids an unbounded history scan. A correct current answer advances the next required part. An incorrect last-part row keeps the last part current. A row marks the sequence complete only when `finalPart` is true and every stored part is correct. Reject a malformed newest row and perform no write.

Each part attempt uses the existing positive safe activity attempt ordinal. Derive cumulative `hintsUsed` and `revealStepsSeen` from the newest valid row. Require each new request value to be greater than or equal to the stored value. Reject a decrease before a write. When the server returns a Guided hint after a wrong answer, increment and store the cumulative hint count in that row. Retain both counters across incorrect retries, accepted prefixes, reloads, and the final receipt. Use the cumulative final values for any later evidence decision. An exact idempotency-key retry returns the same row and response. The same key with any changed prefix, current answer, hint count, or reveal count returns conflict. A new key creates a new attempt for the current required part.

Use these bounded public responses:

- Intermediate incorrect: `kind: "graded"`, the saved submission ID, current part score and max score, `complete: false`, and the current part hint when Guided policy permits it.
- Intermediate correct: `kind: "graded"`, the saved submission ID, current part score and max score, `complete: false`, and the next public part definition without its answer or hint.
- Last-part incorrect: `kind: "graded"`, the saved submission ID, current part score and max score, `finalPart: true`, `complete: false`, and the current part hint when Guided policy permits it.
- Last-part correct: `kind: "graded"`, the final submission ID, total score, total max score, all public graded parts, `finalPart: true`, and `complete: true`.

Every graded response returns the authoritative cumulative `hintsUsed` and `revealStepsSeen`. Intermediate responses set `finalPart: false`. Public graded parts contain only `partId`, the learner raw answer, `isCorrect`, `score`, `maxScore`, and public feedback. They contain no normalized private answer or answer key.

Do not return a future part before the immediately prior part has a correct saved row. Do not include a correct choice ID, explanation, solution step, or unrevealed hint in a part definition. Return only the current hint after the server has saved an unsuccessful attempt for that same part. Independent responses never return hints.

The client keeps accepted prefix answers only for the current activity in memory. It sends them again as the next strict prefix. The query returns `acceptedAnswers`, cumulative `hintsUsed`, cumulative `revealStepsSeen`, and only the current public part. `acceptedAnswers` contains the learner responses for correct earlier parts. It does not contain future part keys, private answer keys, grades, explanations, or hints. The component hydrates this prefix and both counters after reload. A page reload does not need a new session model. The query uses the same newest-row derivation and returns only the current public part. If the newest row has `finalPart: true` and all parts are correct, it treats the sequence as complete. If the newest row is malformed or claims a skipped or future part, it returns unavailable and performs no write. Exact retry remains an indexed idempotency-key lookup and does not depend on this newest-row read.

## Submission and evidence behavior

Extend the existing handler with direct branches for the three supported node IDs. Do not create a registry.

For a triangle activity, require all of these values before a write:

- active student ownership;
- approved activity;
- exact stable activity ID;
- exact mastery node ID;
- exact mode;
- `componentKey: "im2-question"`;
- exact source problem seed and fixed difficulty;
- published graph node and blueprint for the selected node;
- source lesson slug `module-1-lesson-4`.

Preserve exact idempotency replay and conflict behavior. Preserve the stored request body. Use the next positive safe attempt ordinal. Reject an ordinal overflow before a write.

For Guided and Independent submissions, grade each private fixed part. Bind every part-attempt row to Lesson 1.4. Store the exact prefix answers and current graded part. A last-part attempt row stores the complete part set. Only an all-correct last-part row is a completed activity receipt. Create an evidence candidate only from a validated Independent last-part attempt with the selected atomic node ID and stable activity ID, under the readiness rules below. For P10, use the `final_order` result as target-node graded evidence and require the correct accepted `missing_angle` prefix as an eligibility gate. After later readiness activation, a correct or incorrect `final_order` can provide target-node evidence when that prerequisite gate passes. `complete` remains false for an incorrect final order. During this implementation batch, draft readiness and `srsEligible: false` keep both outcomes at zero evidence writes.

Keep evidence and SRS writes disabled while either graph readiness flag is false or `srsEligible` is false. When later activation is authorized, preserve the existing rules: only correct or incorrect Independent grades with zero hints and zero reveals can enter the exact-node evidence decision; Guided and Worked activity cannot create mastery-bearing evidence. Use a node-specific SRS variant key if readiness is activated later.

## Teacher review behavior

Update the existing teacher evidence query for the staged triangle rows. Keep its attempt-list policy. Include each saved triangle part attempt. For an intermediate or incorrect row, show the current public part ID and raw learner answer from the stored graded part selected by `currentPartId`, with the current-part score. For a complete last-part row, show the total score and max score. Keep the current perpendicular answer projection unchanged.

Keep `canRecordExposure` false for both triangle nodes. The existing teacher-led exposure mutation is a perpendicular-bisector intervention. Do not broaden that authority in this scope. Add a regression that a triangle Guided submission appears in the generic teacher list but cannot use the perpendicular exposure action.

After later Independent evidence activation, the existing teacher evidence projection can report the exact atomic node. Keep both teacher-evidence projection rows inactive in this implementation batch.

## Exact implementation paths

Production paths:

1. `apps/integrated-math-2/lib/practice/triangle-ordering.ts` (new)
2. `apps/integrated-math-2/components/student/TriangleOrderingPractice.tsx` (new)
3. `apps/integrated-math-2/app/student/practice/page.tsx`
4. `apps/integrated-math-2/convex/activities.ts`
5. `apps/integrated-math-2/convex/seed/seed_triangle_ordering_practice.ts` (new)
6. `apps/integrated-math-2/app/api/activities/[activityId]/submissions/route.ts`
7. `apps/integrated-math-2/convex/teacher.ts`

Test paths:

8. `apps/integrated-math-2/__tests__/lib/triangle-ordering.test.ts` (new)
9. `apps/integrated-math-2/__tests__/components/triangle-ordering-practice.test.tsx` (new)
10. `apps/integrated-math-2/__tests__/app/student/practice-page.test.tsx` (new)
11. `apps/integrated-math-2/__tests__/convex/triangle-ordering-practice.test.ts` (new)
12. `apps/integrated-math-2/__tests__/convex/triangle-ordering-practice-seed.test.ts` (new)
13. `apps/integrated-math-2/__tests__/app/api/activities/submissions-route.test.ts`
14. `apps/integrated-math-2/__tests__/convex/perpendicular-bisector-pilot.test.ts`
15. `apps/integrated-math-2/__tests__/convex/perpendicular-bisector-teacher-candidate.test.ts`

Do not edit graph JSON, the native lesson source, public images, `questions.json`, generated curriculum outputs, schema, generic lesson renderer, teacher pages, the teacher exposure route, or the four legacy example records in this implementation batch.

## Required tests

Write failing tests before implementation. Prove these behaviors:

- The six fixed source items have the exact native facts, figure paths, alternative text, and answer orders listed in this scope.
- Problem 10 derives the missing 66-degree angle and orders all three sides.
- Each Worked projection includes its authored-solution label, answer, and complete steps.
- Guided projections contain all three ordered scored parts and after-attempt hints.
- Independent projections omit private answers, explanations, solution steps, and hints.
- Problem 10 requires a numeric `missing_angle` part before `final_order`. Its receipt keeps the two results separate.
- A wrong `missing_angle` result cannot produce target-node evidence even if `final_order` is correct. No evidence is written for the missing-angle part.
- Wrong node, mode, seed, difficulty, and unsupported choice IDs fail safely.
- Repeated projection is identical.
- The component renders figures and choices, preserves a failed request identity, blocks duplicate submission, gates hints, and advances only on accepted success.
- The query rejects a missing, duplicate, malformed, unapproved, or partially approved activity set.
- The current draft graph state returns no triangle practice.
- The seed creates exactly six immutable stable identities and preserves unchanged review fields.
- A changed seeded activity loses approval and remains ineligible for SRS.
- The handler rejects forged ownership, node, mode, stable ID, seed, difficulty, and source lesson claims before a write.
- Exact retry returns the stored part or final receipt. A changed body with the same key returns conflict.
- A part request accepts only the exact prefix through its current part. It rejects skipped, changed, future, and extra answers without a write. It treats JSON object key order as irrelevant.
- A correct intermediate row unlocks only the next part. An incorrect row does not advance.
- Reload after each accepted Guided prefix and after an incorrect current-part attempt returns the exact `acceptedAnswers` prefix and cumulative counters.
- A new-key request cannot reduce hint or reveal counters after a wrong answer, accepted prefix, or reload.
- Hints appear only after an unsuccessful saved attempt for that same Guided part. Future parts and Independent hints do not leak.
- `finalPart` identifies last-part position. Only `finalPart` plus all-correct parts produces `complete: true`.
- Exact replay preserves intermediate-correct, last-part-incorrect, and last-part-complete response shapes.
- Draft state produces no evidence. A later ready Independent last-part receipt can produce correct or incorrect target evidence. P10 also requires the correct stored missing-angle prefix.
- Worked writes no grade or evidence.
- Guided and Independent use the selected atomic grader and Lesson 1.4 relation.
- Draft readiness produces no learning evidence, SRS card, or SRS review log.
- Each triangle staged attempt appears in teacher review with its current part ID and raw answer. Only a complete last-part row shows total score. Every triangle row has `canRecordExposure: false`.
- The existing perpendicular pilot, route contract, exact-node evidence, and teacher exposure behavior remain unchanged.

Run the focused tests above. Run the complete IM2 application test set. Then run `npm run lint`, `npm run build`, and a separate `npx tsc --noEmit` in the IM2 application workspace.

Memory fixtures do not prove transaction behavior or real rendering. After source review, use this sequence. First, seed the six activities without approval and confirm that the draft graph returns no learner items. Second, run handler and component tests with injected approved publication fixtures. Third, review the six source projections and authorize the separate graph and activity-approval activation patch. Fourth, apply that activation to a disposable local Convex database. Fifth, run the real learner and teacher browser flows for both three-mode sequences, reload after staged attempts, exact retry, wrong-answer recovery, Problem 10, teacher visibility, and zero evidence/SRS effects. Remove the fixture after evidence review. Do not use a temporary production bypass to make the draft query return items.

## Verified activation scope

The implementation patch intentionally keeps the activity hidden while the two graph records are draft. This is a temporary verification state. It is not the final learner state.

After the source, handler, local transaction, and browser evidence pass review, apply a separate activation patch for these existing files:

- `apps/integrated-math-2/curriculum/skill-graph/nodes.json`
- `apps/integrated-math-2/curriculum/skill-graph/blueprints.json`
- `apps/integrated-math-2/curriculum/skill-graph/projection/teacher-evidence-map.json`
- `apps/integrated-math-2/curriculum/skill-graph/projection/srs-input.json`
- the existing graph/source mapping test

That activation patch must set each node and blueprint to the reviewed publication state and set the exact renderer and finite-source generator fields. This makes the two verified sequences usable on `/student/practice`. Keep `independentPracticeReady` and SRS eligibility false during this first activation. After a separate real Independent evidence test passes, a final readiness patch can enable exact-node Independent evidence and SRS. The readiness patch must keep the P10 missing-angle part as a prerequisite gate and must emit no separate evidence for it.
