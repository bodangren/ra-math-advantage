# Precalculus Q37 unit 2 report

## Result

The isolated candidate uses `selectedLearningEvidence.ts` as the valid Convex module name for the selected Topic 1.1 evidence and teacher flow.

Candidate: `/tmp/precalc-q37-unit1-head.bTJD`

Patch: `/tmp/precalc-q37-unit2.patch`

## Design

HEAD `1cd1158e` stored the selected evidence and Topic 1.1 teacher confirmation handler in `convex/learning-evidence.ts`. I renamed that file to `convex/selectedLearningEvidence.ts`. The module body is byte-identical. The accepted HEAD fingerprint contract remains in use.

I updated the route, generated API declaration, direct imports, route mock, runtime-name assertion, and the generic evidence boundary test source path.

The tracked `learning-evidence-submission-authority.red.test.ts` required `createPrecalculusSubmissionLearningEvidenceHandler`. The old HEAD module did not export this function before the rename. Its five cases also required Guided submissions to apply mastery, KST, and SRS. That requirement conflicts with the accepted selected policy. Guided evidence is ungraded participation and cannot update SRS.

I removed this obsolete Red fixture. I preserved its applicable security checks in the actual selected handler suite. The selected suite now checks an unknown submission, a different learner owner, and a non-pilot stable activity. Each case asserts no evidence, receipt, or SRS effect. Existing actual-flow cases verify Guided ungraded persistence and durable replay without duplicate effects.

## Verification

The first path-only run loaded all seven files. It passed 74 of 79 tests. The five obsolete submission-authority cases failed because the selected module did not export their legacy factory. This proves that the failure was not a missing file after the path update.

The corrected six-file suite passed 77 tests. The selected policy file now has 14 passing tests. Lint passed. A fresh build passed. Post-build TypeScript passed with `tsconfig.q37-source-check.json` mapped to the candidate HEAD `practice-core` source. I removed the temporary configuration after the check.

I searched all tracked files under `apps/pre-calculus` for the old relative import, old source path, old Convex module key, old `submitSelected` reference, and old internal module key. The search returned no matches. Build output and untracked files were outside this search.

## Patch scope

The patch contains 10 paths. It includes one byte-identical production rename, one obsolete test deletion, one strengthened selected test, one generic test source-path update, and the previously reviewed route, generated API, and test reference updates.

It has 32 inserted lines and 362 removed lines. The large deletion is the obsolete 343-line Red fixture.

## Exclusions

I did not add the pending broad `learningEvidence.ts` module. I did not remove the HEAD fingerprint contract. I did not copy later-topic evidence handlers. I did not edit main. I did not commit or deploy.
