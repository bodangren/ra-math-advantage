# IM3 quadratic-formula learner integration scope

## Current published lesson

`seedLesson6` creates or reuses one `lesson_versions` row with `status: "published"`. It uses the first existing version without checking its status or version number. It then inserts only missing phases. It does not update an existing phase or section.

The seed defines 11 phases:

- Phases 1 to 3 are Explore, Vocabulary, and Learn.
- Phases 4 to 6 are three Worked Example phases for quadratic-formula solving.
- Phase 7 teaches the discriminant.
- Phases 8 and 9 are discriminant Worked Example phases.
- Phases 10 and 11 are Discourse and Reflection.

There is no Guided Practice or Independent Practice phase. Adding draft QF sections to this seed would put them in a normal published learner lesson on a new database. It would not update an existing database because the seed skips existing phases. Do not add the draft modes to `seedLesson6`.

## Current rendering and receipt gaps

Phases 4 to 6 contain invented `step-by-step-solver` examples. Their activity source uses `content.props`. The stored section keeps this field. `PhaseRenderer` forwards only `content.activityProps`. The existing activity therefore receives no authored props through the normal lesson read.

The shared QF Worked component is display-only. It does not submit or call `onComplete`. `LessonRenderer` treats each activity section as required. A physical QF Worked activity would add an unnecessary completion gate and would need a new acknowledgement contract. Use exact inline Worked content in the published lesson instead.

The server seed batch has two stored generated QF activity IDs only:

- `guided_practice`
- `independent_practice`

It does not have or need a generated Worked activity ID.

`LessonRenderer.handleActivitySubmit` sends a normal lesson activity to `/api/activities/submit`. The generic writers correctly reject a QF physical relation. A future QF learner placement must use `createServerOwnedActivitySubmission` and wait for its strict receipt.

## Concrete first batch

The first batch must change only the published source Worked content. It must not expose either draft generated mode in the learner lesson.

Production path:

- `apps/integrated-math-3/convex/seed/seed_lesson_1_6.ts`

Test path:

- `apps/integrated-math-3/__tests__/convex/seed/seed-lesson-1-6.test.ts`

Required changes:

- Replace the invented phase 4 to 6 text with exact source examples `.036`, `.037`, and `.038` from pages 43 and 44.
- Keep these phases as inline text sections.
- Remove their `step-by-step-solver` activity sections. Do not create physical Worked activities.
- Preserve `.036` as a contextual source example. Include both approximate roots and the rejection of the negative time.
- Preserve the exact irrational response in `.037` and the exact complex response in `.038`.
- Do not change phases 1 to 3 or 7 to 11 in this batch.
- Do not change the current published version behavior in this batch.
- Add exact seed-document tests for the three source IDs, page identities, prompts, and requested responses.
- Add a test that phases 4 to 6 contain no physical activity section.
- Keep the two generated draft activity documents separate from `seedLesson6` publication.

This batch repairs new database seeds. It does not repair an already seeded published version. A later data migration or new reviewed lesson version is required for existing deployments. Do not silently patch the current published row.

## Remaining Guided and Independent contracts

### Reviewed placement boundary

Do not place the draft generated activities in the published learner lesson. Use the existing stored activity and variant model for draft quality assurance. After source, browser, and approval review, create a new reviewed lesson version or a reviewed practice placement that references the two stored IDs. Do not mutate the old published version in place.

The approved placement must include these public fields only:

- stored activity ID;
- `componentKey: "quadratic-formula"`;
- stable activity ID;
- mastery node ID;
- learning-evidence mode;
- `srsEligible` value from approval;
- stored public activity props.

It must not include variant metadata, a seed, canonical roots, or Worked steps.

### Strict receipt wiring

When the reviewed placement exists, change `LessonRenderer` and its focused tests. Match the exact QF stable ID, node ID, component key, mode, and approval fields. Send the frozen envelope to `createServerOwnedActivitySubmission`. Keep the same body and idempotency key after an ambiguous failure. Complete the activity only after a successful opaque receipt.

While the records remain draft, this wiring can be tested with fixtures. It must not make the draft modes visible in the normal published lesson. Draft submissions must continue to omit a mastery contract and produce no progression.

### Guided step checks

The QF component has no intermediate server check. Add one optional Guided check callback. Add one authenticated route that calls an internal query. The internal query must load the stored activity, item, and private variant. It must call one exported QF authority helper from `server-grading.ts`. Do not copy the parser, seed reconstruction, relation checks, or answer comparison into the route.

The check request contains the activity ID, field ID, and raw answer. The first supported field is `discriminant`. The response contains only a correct or incorrect decision. It must not contain the seed, canonical discriminant, roots, or future steps. A check does not insert a submission and does not apply progression.

After a correct discriminant check, Guided mode can enable the root fields. The final receipt still uses the existing three-part submission.

### Later-attempt variation

No current IM3, IM2, IM1, or Precalculus flow allocates a new immutable generated variant for each later attempt. Existing flows increment `attemptOrdinal` for one fixed activity. Some UI tests remount a new attempt, but they do not allocate a new private seed.

Do not add a new identity or storage mechanism in the first batch. Keep later-attempt variation open as a required contract. Before implementation, define how one idempotent allocation maps learner, stable activity, mode, and next ordinal to one immutable stored variant. Reuse `activities`, `practice_items`, and `practice_variants` if the reviewed design can preserve old attempts. Do not overwrite the fixed seed that grades an earlier receipt. Do not let the client select a seed.

## Completion tests for later batches

- Draft activities are absent from the normal published learner lesson.
- A reviewed placement passes the real stored ID and public props through `PhaseRenderer`.
- The strict create promise reaches the QF component.
- Failure and retry preserve the exact body and idempotency key.
- Guided roots stay unavailable until the internal query accepts the discriminant.
- The check response contains no private answer data.
- A later attempt uses a different immutable seed identity.
- Reload returns the same pending attempt.
- Guided and Independent receipts contain server grades.
- Draft receipts contain no mastery contract and cause no evidence, competency, SRS, knowledge-state, or scheduler effect.

The first batch is two paths. Guided checks, strict placement wiring, and later-attempt allocation remain separate reviewed contracts. Approval and learner publication remain separate actions.
