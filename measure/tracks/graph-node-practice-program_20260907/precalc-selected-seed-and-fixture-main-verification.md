# Precalculus Q18 and Q22 shared-worktree verification

Checked on 2026-09-08.

## Result

The parent applied the independently reviewed Q18 evidence-fixture repair and Q22 Worked source seed repair to the shared worktree. The combined run passed 212 tests. Four old source assertions failed. Those assertions expected source text and mappings from before the accepted Topic 1.1 source correction. Independent review accepted their correction. The parent applied that test-only patch and reran all seven files. All 216 tests passed. The exact source descriptions and both interval source mappings remain asserted.

The parent ran all seven files together:

- `learning-evidence-production-flow.red.test.ts`
- `learning-evidence-bounded-authority.red.test.ts`
- `selected-topic11-submission-writer.test.ts`
- `seed/topic11-worked-source-lifecycle.test.ts`
- `seed/topic11-source-link.acceptance.test.ts`
- `topic11-selected-teacher-backend.test.ts`
- `selected-topic11-writer-evidence-flow.test.ts`

App lint, a fresh production build, and standalone TypeScript after that build passed. These checks use the current shared workspace. They do not prove a clean independent dependency installation.

## Evidence fixtures

The repaired fixtures use the real submission writers and evidence dispatcher. They retain active authentication and exact physical source identity. Guided participation remains ungraded in learning evidence. Independent evidence uses stored server grades. Bounded authority tests retain wrong-scope, future-event, duplicate-ordinal, and replay checks. The fixture repair changes no production handler.

## Worked source seed

The seed preserves the selected stable identity and stores the physical activity ID in the exact Worked phase link. A new source remains unreviewed. Identical replay preserves human approval. A changed identity resets approval to unreviewed.

The seed rejects duplicate source rows, duplicate current lesson versions, duplicate Worked phases or links, an incorrect phase type, a selected link in another current phase, and an occupied sequence. It preserves historical versions and unrelated sections. Independent review accepted the final nine-test lifecycle suite after two phase-ownership defects were corrected.

## Remaining work

Correct ordinary lesson and seed text under Q23. Then deliver the strict Worked projection, learner acknowledgement, teacher action, and mode visibility from the accepted teacher delivery plan.

No source was approved. No live seed or deployment ran. Real Convex rollback and concurrency checks and the positive signed-in student flow remain open. Later-topic code and catalogs remain pending in the shared worktree. This record does not commit or approve those changes.

## Local logs

- `/tmp/precalc-q18-q22-parent-main-tests.log`
- `/tmp/precalc-q18-q22-parent-main-lint.log`
- `/tmp/precalc-q18-q22-parent-main-build.log`
- `/tmp/precalc-q18-q22-parent-main-tsc.log`

Final combined test log: `/tmp/precalc-q18-q22-parent-main-final-tests.log`. Source fixture review: `precalc-source-fixture-independent-review.md`.
