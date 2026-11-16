# IM2 pilot implementation review

Date: 2026-09-07

Scope: `math.im2.skill.1.1.perpendicular-bisector-equidistance` only.

This is an independent review. It does not approve the node, blueprint, activity, or implementation.

## Findings

### P0: Independent evidence can bypass the required first exposure

`apps/integrated-math-2/convex/activities.ts:62-68` writes `learning_evidence` directly after a correct Independent response. The handler checks graph readiness, activity approval, SRS eligibility, mode, and assistance counters. It does not load prior evidence. It does not apply the existing `learning-evidence.v1` exposure policy.

An approved and ready pilot can therefore create mastery evidence on a learner's first contact with this node. This is not a conservative pilot path. Use the existing evidence decision function or the course's established exposure state. Require a trusted prior exposure before an Independent attempt can become mastery-bearing. Add a negative test with no prior exposure and a positive test with valid prior exposure.

### P1: Worked mode does not use the selected source example

`apps/integrated-math-2/convex/seed/seed_perpendicular_bisector_pilot.ts:5` assigns seed `101` to Worked mode. At difficulty `1`, that seed generates `DA = 3x + 2` and `DB = 6x - 13`. The selected Lesson 1.1 Example 1 uses `DA = 3x + 2` and `DB = 5x - 6`, with `x = 4` and equal distances of `14 cm`.

The current generator produces the exact source problem with seed `60` at difficulty `1`. Use that source-faithful seed for Worked mode. Keep generated seeds for Guided and Independent modes.

Sources:

- `apps/integrated-math-2/curriculum/modules/module-1-lesson-1:45-49`
- `apps/integrated-math-2/curriculum/skill-graph/blueprints.json`
- `apps/integrated-math-2/lib/practice/perpendicular-bisector.ts:19-29`

### P1: Guided mode does not implement the approved blueprint behavior

The blueprint has three step prompts, three hints, three checks, and `revealPolicy: after_attempt`. `projectPerpendicularBisector` returns one general hint at `apps/integrated-math-2/lib/practice/perpendicular-bisector.ts:78`. The component shows that hint before any answer attempt at `apps/integrated-math-2/components/student/PerpendicularBisectorPilot.tsx:18`.

The result is a one-field numeric question with an immediate hint. It is not the authored Guided sequence. Either implement the existing step prompts and after-attempt reveal rule, or reduce the blueprint before approval through curriculum review. Do not treat the current Guided renderer as complete three-mode content.

The assistance counter is conservative after the hint is used. Any Guided submission is also non-mastery-bearing because evidence requires Independent mode. These controls do not correct the content mismatch.

### P1: The pilot repeats the full sequence on every visit

`getApprovedPilotHandler` has no learner input and reads no submission history. It returns Worked, Guided, and Independent every time. The page at `apps/integrated-math-2/app/student/practice/page.tsx:4-7` therefore restarts the same three activities after completion.

The page is separate from the assigned lesson flow. The current dashboard has no link to `/student/practice`. Thus, the pilot does not replace the normal assigned lesson sequence. It also has no queue or first-exposure integration. Add a learner-aware completion rule before this route becomes visible in normal navigation. Do not repeat Worked and Guided after durable completion.

### P1: Convex result validators are missing

The new registered query and mutation at `apps/integrated-math-2/convex/activities.ts:35` and `:71` have argument validators but no `returns` validators. The new seed mutation at `apps/integrated-math-2/convex/seed/seed_perpendicular_bisector_pilot.ts:19` also has no `returns` validator.

Add exact result validators. This protects the server component from malformed or private output and follows the generated Convex rules for this app.

### P2: The main persistence test does not cover a wrong attempt followed by a correct attempt

The backend test stores one correct response and replays it. The component test mocks one wrong and one correct Independent response. It does not invoke the real server handler for that sequence.

Add one handler test that persists a wrong attempt under one key, then persists the correct response under a new key. Assert two submission rows, increasing attempt ordinals, and one evidence row only after the eligible correct attempt. Also test that a transport retry of the Worked acknowledgement reuses one key and one stored row.

### P2: Seed review preservation has no direct test

The seed compares the stored content with the canonical projection. It preserves approval and SRS state when content is unchanged. It removes approval and sets `srsEligible` to false when content changes. This logic is reasonable from source inspection.

Add a seed handler test for both cases. The test must prove that an unchanged reseed preserves the review and that a changed prompt, seed, mode, or component clears the review before runtime use.

## Verified behavior

The current canonical node and blueprint are both `draft`. The node also has `independentPracticeReady: false`. The blueprint metadata has `independentPracticeReady: false`. The current query returns no pilot activities. The current submission handler throws `unpublished_curriculum`. The tests verify both paths.

The approved fixture path checks the exact node, blueprint, activity approval, `masteryNodeId`, stable activity ID, mode, component key, seed, and difficulty. Independent props contain only `activityId`, `mode`, and `prompt`. They do not contain the answer, hint, explanation, or solution steps.

Worked mode displays the answer and four reasoning steps. Its client retry keeps the idempotency key after a failed request. A durable acknowledgement advances the sequence and removes the key.

Wrong graded responses are stored. The client removes the key after a durable wrong grade. A corrected response therefore uses a new key. A replay with the same key and different response is rejected.

Guided hint use increments `hintsUsed`. The server stores this value. Guided mode cannot write evidence. Independent evidence also requires zero hints and zero reveals. The current UI has no reveal control and sends `revealStepsSeen: 0`.

The seed is an internal mutation. No call site or deployment path for the new seed was found. No live backend verification exists in this review. Runtime availability still requires an explicit seed run, activity review, canonical graph approval, node readiness, blueprint readiness, and Independent SRS eligibility.

## Verification run

The following current-tree checks passed:

- 10 focused tests in the generator, Convex pilot, and component suites.
- IM2 Oxlint.
- IM2 application TypeScript check.
- IM2 Convex TypeScript check.

These tests do not close the first-exposure, source-faithful Worked, Guided sequence, repeat-session, or seed-preservation findings.
