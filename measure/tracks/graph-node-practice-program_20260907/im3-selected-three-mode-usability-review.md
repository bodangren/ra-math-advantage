# IM3 Selected Three-Mode Usability Review

## Disposition

The selected Worked and Independent activities have usable content. The Guided activity has useful scaffolding, but its evidence-to-SRS adapter drops assistance fields. The Worked acknowledgement also records before the learner confirms that they viewed the solution.

Do not treat `learningEvidenceMode` as a user interface mode. The lesson phase maps the Worked activity to `teaching`. The practice queue maps the selected Guided stable ID to `guided`. It maps the selected Independent stable ID to `practice`.

## Worked activity

`buildIm3WorkedPilotSeedDocument` stores `f(x) = x^2` with `plot_from_equation`. The student lesson query supplies the stored activity props. `PhaseRenderer` changes a `worked_example` phase to `teaching` mode.

The shared `GraphingExplorer` detects this teaching case. It shows a complete worked solution. It identifies `a`, `b`, and `c`. It calculates the axis of symmetry and vertex. It fills the table for five points. It plots the points. It states the opening direction, domain, and range. This is an actual explanation for the selected source equation.

The lesson currently sends the Worked acknowledgement automatically when the phase becomes active. The learner does not select an acknowledgement control. A teacher must still attest the exposure before later mastery evidence can apply. However, the stored student acknowledgement proves only that the phase rendered. It does not prove that the learner viewed the steps.

Minimum reuse fix: use the existing durable submission and retry path. Trigger it from an explicit `Continue` or `I reviewed this example` action after the worked solution. Do not create a second evidence system.

## Guided activity

The Guided seed uses `y = x^2 - x - 2`. It does not include expected points in public props. The practice renderer recognizes the exact Guided stable ID and sends `guided` mode to the real graph component.

The Guided user interface requires the learner to complete the table before point placement. It shows a transition message after table completion. It enables grid snapping. It also provides three optional hints for the axis of symmetry, vertex, and opening direction. These hints give meaningful graph structure. They do not expose the five expected table and graph points.

The shared component now puts the total HintPanel count on the `placed_points` part and puts zero on the `table_values` part. The server grader and writer preserve these fields. Do not put the same total on both parts because the normative policy sums assistance across parts.

`kst-srs.v3.2/SPECIFICATION.md` section 8.4 is authoritative. It permits an assisted correct response to update SRS. It caps one or two hints at `Good`. It caps three or more hints at `Hard`. A partial reveal caps the rating at `Hard`. A full reveal produces `Again`. The pilot specification permits a graded Mastery Advantage attempt after teacher exposure. It does not make all Guided attempts non-mastery-bearing.

The selected evidence adapter rebuilds an SRS submission from `learning-evidence.v1`. That rebuilt submission contains one synthetic correctness part. It drops the server-stored `hintsUsed` fields. A real-handler regression confirms that the stored Guided submission retains `hintsUsed: 0` and `hintsUsed: 2`, but the SRS review reasons omit `hints_1_2`.

Minimum reuse fix: pass the server-stored graded parts to the existing `SubmissionSrsAdapter`. Preserve the current exact Guided eligibility rule. Let the existing v3.2 rating mapper apply the assistance caps. Do not disable all Guided mastery.

## Independent activity

The Independent seed uses `y = -x^2 - 1`. Its public props contain the equation, graph bounds, variant, and `table_graph` response type. They contain no expected answer.

The practice renderer sends `practice` mode. The component does not show the Guided hints. It requires the table before point placement. It hides the function plot during the deferred response. It submits only raw table values, raw placed points, the graph artifact, and interaction history.

The server grader reconstructs the fixed expected points for the exact stable ID. It grades `table_values` and `placed_points` separately. The production writer stores the server grade. The Independent activity therefore conceals answers and has usable server grading.

## Exact path reviewed

- `apps/integrated-math-3/convex/seed/seed_lesson_1_1.ts`
- `apps/integrated-math-3/convex/student.ts`
- `apps/integrated-math-3/convex/queue/queue.ts`
- `apps/integrated-math-3/convex/activities.ts`
- `apps/integrated-math-3/convex/learningEvidence.ts`
- `apps/integrated-math-3/components/lesson/LessonRenderer.tsx`
- `apps/integrated-math-3/components/lesson/PhaseRenderer.tsx`
- `apps/integrated-math-3/components/lesson/ActivityRenderer.tsx`
- `apps/integrated-math-3/components/student/PracticeCardRenderer.tsx`
- `apps/integrated-math-3/components/student/PracticeSessionProvider.tsx`
- `apps/integrated-math-3/components/activities/graphing/GraphingExplorerActivity.tsx`
- `packages/activity-components/src/components/graphing/GraphingExplorerActivity.tsx`
- `packages/activity-components/src/components/graphing/GraphingExplorer.tsx`
- `packages/activity-components/src/components/graphing/HintPanel.tsx`
- `apps/integrated-math-3/lib/activities/server-grading.ts`

This review does not approve the selected graph node, blueprint, or physical activities.

## Author response for Q11

The selected SRS path now reloads the physical submission by `submissionId`. It applies the existing IM3 stored-evidence boundary again. It rejects a learner, stable activity, node, mode, ordinal, or grade mismatch. It gives the `SubmissionSrsAdapter` the authoritative stored parts and timing.

The focused real-handler tests pass. Two hints produce `Good` with `hints_1_2`. Three hints produce `Hard` with `hints_3_plus`. A reported reveal produces `Again` with `reveal_all`. An identical replay keeps one SRS card and one review log.

The `practice.v1` response reports `revealStepsSeen`. It does not report the total available reveal steps. The selected graph user interface currently has hints and no reveal control. The boundary handles a reported reveal conservatively as a full reveal. A future partial-reveal interface needs an authoritative total before it can distinguish the `Hard` and `Again` cases.

Verification on 2026-09-07:

- 139 focused tests passed.
- Oxlint passed with zero warnings.
- TypeScript found three existing test-harness return-type errors in `activities-create-idempotency.red.test.ts`, `activities-public-create-boundary.red.test.ts`, and `selected-quadratic-writer.test.ts`. The errors are outside this Q11 change.
