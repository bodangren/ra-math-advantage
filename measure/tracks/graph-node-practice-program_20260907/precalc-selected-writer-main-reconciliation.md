# Precalculus Q18 selected writer main reconciliation

## Outcome

The main worktree now uses the accepted Q18 v5 writer behavior from commit `d7b735aa` for the selected Topic 1.1 pilot. The reconciliation preserves the later-node branches in the shared `activities.ts` file.

The writer now validates the exact selected publication contract. It validates the canonical `practice.v1` envelope. It stores the server grade and canonical raw answers. It authenticates a replay before it returns the stored receipt. It validates the complete stored envelope and exact selected keys. It permits a valid replay after a later publication withdrawal, reseed, or activity deletion. It rejects malformed publication data, malformed optional fields, corrupt stored data, duplicate rubric IDs, and incompatible renderer fields.

The selected route now uses the accepted strict request contract and controlled error mapping.

## Files

The exact before snapshot is `/tmp/precalc-q18-writer-main-before-20260908`.

The exact after snapshot is `/tmp/precalc-q18-writer-main-after-20260908`.

The focused before-to-after patch is `/tmp/precalc-q18-writer-main-reconciliation.patch`.

The reconciliation changed these production paths:

- `apps/pre-calculus/convex/activities.ts`
- `apps/pre-calculus/app/api/activities/precalculus-pilot/submissions/route.ts`

The main schema already contained the accepted selected fields and indexes. This reconciliation did not change `apps/pre-calculus/convex/schema.ts`. It preserved the pending fingerprint removal and all unrelated schema work.

The two selected tests in the initial snapshot already matched the accepted HEAD tests. The reconciliation also updated three pre-existing untracked selected fixture files to the accepted contract:

- `apps/pre-calculus/__tests__/convex/activities-server-owned-submission.acceptance.test.ts`
- `apps/pre-calculus/__tests__/convex/topic11-trusted-teacher-flow.test.ts`
- `apps/pre-calculus/__tests__/convex/topic11-real-production-flow.test.ts`

Those three fixture files are not in HEAD. They were not present in the initial before snapshot. This is a snapshot coverage limit. Their current copies are in the after snapshot. Their passing tests provide the behavioral evidence.

The accepted writer made the prior selected parser declarations unused. The reconciliation removed only these dead selected declarations: `pilotSubmissionPartValidator`, `pilotSubmissionDataValidator`, `normalizeInterval`, `canonicalPilotAnswers`, and `parseServerSubmissionData`.

## Verification

The selected and related regression set passed: 171 tests in seven files.

This set includes 42 selected writer tests, seven selected route tests, five selected grader tests, 104 shared writer tests, and 13 Topic 1.1 teacher and production-flow tests.

`npm run lint` passed in `apps/pre-calculus`.

`npx tsc --noEmit` passed before the build.

`npm run build` passed.

`npx tsc --noEmit` passed after the build.

No dependency, database, staging, commit, or deployment action occurred.

## Parent acceptance

The parent passes 169 selected and related tests in six files. Independent review confirms the selected writer and preserved export inventory. The review found a wrapped conflict response defect. Commit `ad228e5a` repairs that defect. The parent then passes 52 writer and route tests, lint, a fresh build, and post-build standalone TypeScript. Independent re-review accepts the two-file correction.

The selected shared-worktree reconciliation is complete. The snapshot limitation for three old untracked fixtures remains explicit. Their current behavior is verified. Their original content was not captured.

Logs: `/tmp/precalc-q18-main-parent-tests.log`, `/tmp/precalc-q18-conflict-parent-red.log`, `/tmp/precalc-q18-conflict-parent-tests.log`, `/tmp/precalc-q18-conflict-parent-lint.log`, `/tmp/precalc-q18-conflict-parent-build.log`, and `/tmp/precalc-q18-conflict-parent-tsc.log`.
