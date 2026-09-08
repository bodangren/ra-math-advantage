# Precalculus Q37 prerequisite unit 1 report

## Result

Current HEAD `1cd1158e` already contains this prerequisite unit. No production or test change is necessary.

Candidate: `/tmp/precalc-q37-unit1-head.bTJD`

Patch: `/tmp/precalc-q37-unit1.patch`

The patch is empty because the selected contracts and writer behavior are already in HEAD.

## Selected constants and grader

HEAD contains these exact Topic 1.1 contracts:

- selected node ID
- selected Worked activity ID
- selected source component key
- Guided activity ID
- Independent activity ID
- Guided seed 0
- Independent seed 2
- three-part server grader

The pending main change in `topic11-interval-graph.ts` changes formatting and shortens equivalent code. It does not add required selected behavior. I did not copy it.

## Shared evidence policy

HEAD already supports the enabled-node manifest, same-node teacher-first timing, ungraded participation, eligible graded evidence, replay, and conflict decisions.

HEAD still exports `learningEvidenceFingerprintV1`. The accepted Q36 selected writer does not require its removal. Removing this public helper is a separate shared-contract change. I did not include it.

The current pending `precalc-pilot.ts` diff adds many later-topic constants and changes the store interface for broader runtime work. The selected Topic 1.1 constants already exist in HEAD. I did not copy the later-topic changes.

## Schema and selected writer

I followed the task instruction to inspect the next prerequisite unit after unit 1 proved complete.

HEAD already contains:

- stable activity identity fields and indexes
- server-owned attempt ordinals and idempotency keys
- learning evidence, receipt, SRS card, and review tables
- `createTopic11DailySubmission`
- `createServerOwnedSubmission`
- strict selected source and activity identity checks
- private Topic 1.1 grading
- replay and conflict checks

No selected schema or writer repair is required in this unit.

## Verification

The unchanged HEAD candidate passed 95 focused tests:

- 5 Topic 1.1 graph-grader tests
- 7 Precalculus evidence-runtime tests
- 35 shared learning-evidence tests
- 42 selected submission-writer tests
- 6 selected writer-to-evidence tests

Lint passed.

Build passed.

The first plain post-build TypeScript command resolved `@math-platform/practice-core` through the shared main-worktree symlink. That main package has a pending removal of the fingerprint export, while isolated HEAD still imports it. This produced one false cross-worktree error.

I reran TypeScript with a temporary path mapping to the isolated HEAD `packages/practice-core` source. The source-mapped TypeScript check passed. I removed the temporary configuration file.

## Exclusions

I excluded all later-topic constants, broader evidence-store changes, fingerprint removal, pending schema changes, later activity writers, local fixtures, build output, and dependency changes.

I did not edit main. I did not commit.
