# G51 format repair independent review

## Verdict

Accept the nine-path format repair.

Candidate: `/tmp/im1-g51-source-head-kk83le7a`

Path list: `/tmp/im1-g51-format-paths.txt`

## Preservation result

I parsed each corrected JSON file and the corresponding file from commit `2ee8bcc1a`.

For each top-level record array, I normalized only record order. I used the first applicable unique key from `id`, `stableActivityId`, `nodeId`, `edgeId`, `skillId`, and `module`. I kept all nested arrays order-sensitive.

All nine files are semantically equal to commit `2ee8bcc1a` after this top-level order normalization. Metadata and all nested record values are equal. The repair does not change G51 semantics.

The net diff against `2ee8bcc1a^` is narrow. It contains the intended new records, removed records, count updates, and prerequisite updates. It no longer contains whole-file serialization or ordering churn.

## G51 invariants

Lesson 10-1 has seven skill records. Five are new draft atoms. Two are the preserved approved skills.

The graph contains 490 total skill records and 489 non-rejected skill candidates.

Edge `math.im1.edge.1192` is absent from `edges.json`, `standard-edges.json`, and `edge-review-queue.json`.

The corrected Problem 20 and Problem 21 source boundaries remain present. The new atoms remain inactive. The existing broad skills retain their approval state and have no placeholder activities.

## Focused verification

Command:

`npx vitest run __tests__/curriculum/lesson-10-1-capabilities-source.test.ts __tests__/curriculum/lesson-7-4-capabilities-source.test.ts __tests__/curriculum/lesson-7-5-capabilities-source.test.ts __tests__/curriculum/lesson-8-1-capabilities-source.test.ts __tests__/curriculum/lesson-8-2-capabilities-source.test.ts __tests__/curriculum/projected-prerequisites-consistency.test.ts`

Result: 6 files passed. 31 tests passed.

I created one temporary comparison directory for the read-only review. I removed it after verification.

I made no candidate or main-worktree edit.
