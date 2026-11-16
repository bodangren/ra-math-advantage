# Precalculus Q37 unit 2 final independent review

## Disposition

Accept the final 10-path patch.

The patch resolves the blocking findings in the earlier eight-path review. It updates the generic evidence boundary test. It removes one obsolete Red fixture. It transfers the three applicable rejection cases to the actual selected handler suite.

## Production rename

The production change is a 100% Git rename from `convex/learning-evidence.ts` to `convex/selectedLearningEvidence.ts`. The old and new module bodies are byte-identical.

The route uses `internal.selectedLearningEvidence.submitSelected`. The generated API declaration uses the same module key. All direct selected-flow imports use the new file name.

Commit `1cd1158e` contains no broad `convex/learningEvidence.ts` module. The patch does not import or add that pending module.

The saved patch is byte-for-byte equal to the staged candidate diff. `git diff --cached --check` passes.

## Removed obsolete test

I ran the deleted five-case fixture on the untouched `1cd1158e` archive at `/tmp/precalc-q37-clean`. All five tests fail because the baseline module does not export `createPrecalculusSubmissionLearningEvidenceHandler`. The test requires this nonexistent factory before any case can exercise runtime behavior.

The fixture also expects Guided practice to apply SRS, KST, mastery, evidence, and a receipt. The accepted selected policy stores Guided practice as ungraded participation. It does not apply SRS or mastery. The test therefore specifies a different runtime and a conflicting policy. Removal does not hide a baseline regression.

Log: `/tmp/precalc-q37-unit2-review-obsolete-head.log`.

## Preserved security coverage

The actual `createSelectedSubmissionEvidenceHandler` suite now rejects these inputs:

- An unknown submission.
- A submission that belongs to a different learner.
- A submission with a non-pilot stable activity ID.

Each case asserts that the handler does not append evidence. Each case asserts that the handler does not append a receipt. Each case asserts that the handler does not apply SRS.

The handler has no KST effect dependency. Its returned receipt fixes `kstApplied` to `false`. Existing tests verify Guided ungraded persistence, no Guided SRS update, authenticated durable replay, and no duplicate evidence or SRS effect.

The route test preserves the raw-answer boundary. It injects `rawAnswer: "do-not-return"` into a mocked internal response. It verifies that the public response equals the bounded result and does not contain that value.

## Search review

A tracked-source search under `apps/pre-calculus` found no old selected runtime import, old Convex source path, old internal module key, or `learning-evidence:submitSelected` function name. Remaining `learning-evidence` text refers to the API route, contract name, library directory, or test description.

## Independent verification

The six final focused suites pass 77 tests:

- Production route: 17.
- Runtime reference: 1.
- Generic evidence boundary: 4.
- Selected stored-submission policy: 14.
- Selected writer-to-evidence flow: 6.
- Selected teacher backend: 35.

Log: `/tmp/precalc-q37-unit2-review-tests.log`.

Mapped standalone TypeScript passes. The review configuration maps `@math-platform/practice-core` to the candidate source at commit `1cd1158e`. This avoids the shared `node_modules` symlink resolving the unrelated dirty main package.

Log: `/tmp/precalc-q37-unit2-review-tsc.log`.

The author and parent lint and build logs also pass. This review did not edit the candidate, main, or Git history.
