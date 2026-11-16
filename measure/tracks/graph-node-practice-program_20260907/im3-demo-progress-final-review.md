# IM3 demo progress repair independent review

Result: Accepted.

I reviewed `/tmp/im3-demo-progress-seed.patch` against baseline `e910eb7e7` and the accepted Measure scope. The path list contains exactly the production helper and its existing focused test. Applying the patch to both `git show e910eb7e7:<path>` files reproduces the frozen candidate bytes exactly.

The production helper uses `student_progress` for phase state. It uses each real `phaseVersion._id` and profile ID. It implements all five descriptor boundaries. It omits an explicit row for the `not_started` descriptor. It marks only earlier phases complete for an `in_progress` descriptor. It preserves the current phase as `in_progress` without `completedAt`.

The helper treats an existing progress row as authority for the whole phase. It does not patch that row. It also does not add a descriptor-based activity completion for that phase. This preserves later or modified learner state.

The activity path reads `content.activityId`. It requires a string. It normalizes the value as an `activities` ID. It then reads the activity row before it writes a completion. It skips invalid IDs, missing rows, text-only phases, and current in-progress phases. It preserves the existing completion idempotency key and physical lesson/activity references.

The actual-handler test covers all five descriptors and 12 phases. It covers text phases, valid activity rows, a cross-table ID, a missing activity row, both in-progress boundaries, an existing modified row, rerun equality, a missing lesson, and a missing profile. The rerun comparison preserves every stored progress and completion field.

Focused verification:

`npm test -- --run __tests__/convex/seed/seed-demo-progress.test.ts`

Result: 1 file and 3 tests passed.

I found no concrete defect in the frozen repair.

## Integration

Parent review accepted the exact two-file patch. Commit: `fc5ef02cb`. All 23 related tests, lint, build, and post-build TypeScript passed. Both clean main files were updated. Native local storage verification remains pending.
