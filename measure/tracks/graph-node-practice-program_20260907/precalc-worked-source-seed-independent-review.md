# Q22 independent review

## Result

Accept the repaired Q22 seed patch. The first candidate had two phase-ownership defects. The final candidate fixes both defects with real-handler regressions.

## Exact source identity

The seed uses the committed selected identity constants:

- stable activity ID: the Topic 1.1 interval-classification node plus `.worked_example`;
- component key: `precalculus-topic-1-1-daily-curriculum`;
- node ID: the exact Topic 1.1 interval-classification skill;
- mode: `worked_example`;
- source: `teacher_led`;
- grading seed: `0`.

The phase attachment stores the physical activity `_id`. It does not store the stable ID in the physical link.

A new physical source uses `approval.status: "unreviewed"`. An identical replay preserves the physical ID and the complete human approval object. The structural comparison includes stable ID, component, display name, description, props, and grading configuration. It sorts object keys and preserves array order. A changed identity is repaired and returns to `unreviewed`.

## Phase and conflict boundary

The seed performs selected conflict checks before its selected writes.

- It rejects more than one stable source activity.
- It rejects duplicate version-2 lesson rows.
- It reads all phases in the current version.
- It rejects duplicate phase-4 rows.
- It requires an existing phase 4 to have `phaseType: "worked_example"`.
- It counts physical selected links across all phases in the current version.
- It rejects a selected physical link in another phase.
- It rejects duplicate selected links.
- It rejects duplicate sequence-2 rows.
- It rejects a selected link at another sequence.
- It rejects an unrelated row that occupies sequence 2.

The wrong-phase and cross-phase checks fix the two defects found during independent review. The seed does not inspect historical lesson versions. This matches the current-version source contract.

The shared helper still updates the ordinary phase content owned by the Lesson 1.1 seed. It does not delete extra sections. The selected branch does not query or change later lessons.

## Tests and scope

The final lifecycle suite has nine passing tests. It covers creation, replay approval, content repair, duplicate stable source, occupied sequence, duplicate selected link, duplicate phase or sequence, wrong sequence, wrong phase type, and a cross-phase selected link.

I ran the final lifecycle suite independently. All 9 tests passed.

The existing mixed source-link file has one updated occupied-sequence assertion. Its unrelated source catalog assertions depend on separate pending Topic 1.1 source repairs. The author report correctly limits its claim to the repaired seed assertion.

The patch changes the seed, its lifecycle test, and the exact occupied-sequence case. It does not approve content. It does not add the Worked projection, learner provider, route, or interface.

The author reports focused lint, fresh build, post-build standalone TypeScript, and patch application checks as passed. The final report correctly withdraws the earlier TypeScript attribution.
