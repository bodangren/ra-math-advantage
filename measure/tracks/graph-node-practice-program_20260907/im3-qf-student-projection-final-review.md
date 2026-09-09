Committed as `97cf15aee`. Parent integration matched each staged file to the frozen candidate. Parent verification passed 137 application tests and 21 shared tests, application lint, build, and separate post-build TypeScript. The shared package also passed author lint and TypeScript checks. Existing font, route-classification, and two negative-test React act warnings remain. Real browser verification remains required.

# IM3 QF student projection independent review

Date: 2026-09-09

## Decision

Accept the corrected three-path freeze.

## Corrected findings

The QF claim check now includes `content.masteryNodeId === IM3_QF_NODE`. The defensive regression uses an expanded memory fixture. The current persisted section schema permits only `activityId` and `componentKey`. The regression proves fail-closed behavior if cached identity fields reach the projection boundary. It does not reproduce a valid current persisted section.

The successful QF result now constructs its content from the required activity ID and the six validated public identity fields. It does not spread cached section content. The defensive private-field regression also uses an expanded memory fixture. It proves exact output construction. It does not represent a valid current persisted section.

## Verified behavior

- The handler calls `ctx.db.normalizeId("activities", content.activityId)` before `ctx.db.get`.
- A malformed string ID returns an unavailable QF section. It does not cause a raw database read or fail the lesson query.
- A minimal stored section with `activityId` and `componentKey` produces the complete public projection.
- The physical stable activity ID determines `learningEvidenceMode`.
- The exact activity check validates the component key, stable mapping, mastery node, SRS flag, unreviewed approval, presentation mode, and Convex-normalized public props.
- The successful result contains only the activity ID and the required public QF fields.
- The selected Worked source check runs before the QF check.
- A QF activity in the protected selected Worked position becomes unavailable.
- The selected Worked test file changes only its database fixture. Its 11 expectations are unchanged.
- Unrelated activity content stays unchanged.

## Focused test result

Command:

`npx vitest run __tests__/convex/quadratic-formula-server-writer.test.ts __tests__/convex/selected-worked-lesson-consumer.test.tsx`

Result: 2 files passed. 63 tests passed.

## Artifact result

The path list contains exactly three paths. The patch contains the same three repository-relative path pairs.

I applied the patch to a clean archive of baseline `230afa9e0`. All three reconstructed files are byte-equal to the frozen candidate files.

The supplied freeze report states the correct three-path and 63-test results. It records passing lint, build, and separate post-build TypeScript checks.

No candidate source, test, staging area, or commit changed during this review.
