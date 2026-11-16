# Saved practice views first implementation review

Reject the first frozen Q38 candidate.

## Required corrections

1. Replace the query source-string checks with actual handler tests. Execute indexed queries against stored writer-shaped submissions. Verify both modes, latest selection, ownership, active identity, canonical grading, receipt states, and no writes. Test malformed timestamps before date formatting.
2. Keep historical results separate from current activity approval. Current source withdrawal must lock new practice without erasing an accepted saved result.
3. Render saved results outside the lesson's ready-for-practice branch. That branch controls new practice. It must not hide historical work.
4. Separate saved-result retry state from new-attempt submission state. The first candidate writes the old ID into submissionIdRef. A learner can open a new form, retry the old result, and cause the new form to use the old submission ID. Add a regression that exercises this action order. Also verify same-event duplicate clicks and ambiguous retry responses.
5. Label each dashboard result with its practice mode and attempt. A score alone does not identify Guided or Independent practice. Test the authentication failure path, not only that an authentication function was called.
6. Format the new code with the existing readable style.

The author will correct the existing scope. An affected lesson-page behavioral test can be updated if necessary. No new route, schema, index, dependency, or background delivery is needed.

The first 71 passing tests do not verify the new query's behavior. Do not use that total as acceptance evidence for this feature.
