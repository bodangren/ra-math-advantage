# Precalculus G31 source integration review

Date: 2026-09-08

Base: `b9a5eb1e`

Candidate: `/tmp/precalc-g31-source-head-20260908`

## Disposition

The source integration has no remaining source-schema blocker.

The first review found `exceptions[0].type: "duplicate-capability"` on `math.precalc.skill.1.1.describe-covariation-in-tandem-change`. The current `knowledgeSpaceNodeSchema` permits only `alignment`, `generator`, `source`, or `other`. The correction uses `type: "other"` in all four catalogs. It keeps the reason, reviewer, and date unchanged. I confirmed one corrected row in each catalog. Each row passes the current schema.

## Stable identity and scope

The four node catalogs remove no base node ID. They preserve the rejected legacy ID exactly once. They add 10 source examples and four skill IDs. They change only Examples 1 and 2, the rejected legacy skill, and the preserved interval skill among existing node rows. The changes are within Topic 1.1.

The edge catalog removes no base edge. It adds 26 Topic 1.1 `contains` and `supports` edges. All new edges are draft. The rejected legacy ID has no edge. No new equivalence, prerequisite, or evidence-transfer edge uses a Topic 1.1 capability.

The blueprint catalog removes only the obsolete placeholder blueprint for the rejected legacy ID. It changes only the preserved interval blueprint. It adds source-only blueprints for the physical-context, function-sign, rate-sign, and rate-change or concavity skills. Together with the interval blueprint, all five current capability blueprints are source-only drafts. They contain no generator or mode specification in this HEAD integration.

The generator gap queue removes the rejected legacy item. It records all five current capability gaps as source-only drafts. It does not claim that the pending pilot generator or renderer exists in HEAD.

## Source fidelity

The physical-context skill maps only to Example 1. The interval skill maps to Examples 2, 3, 4, 5, 8, 9, 10, and 11. Function sign maps to Examples 3, 4, 5, and 10. Rate sign maps to Examples 6 and 12. Rate change and concavity map to Examples 3, 4, 7, 8, 11, and 12. These mappings match the reviewed Passwater actions.

The topic document now uses the official CED objective text. It states that graph construction remains a gap. It no longer attributes the local ball table, sentence frames, worksheet sketch, or average-rate task to Passwater. The lesson labels its tables and text-only graphs as authored extensions. It keeps average-rate calculation outside the graph capability inventory. The class plan assigns the original Passwater pages to Topic 1.1 and labels new tasks as authored practice.

The rejected legacy skill receives no source mapping or evidence transfer. The physical-context skill is a separate stable identity. The interval skill keeps its prior ID.

## Derived projections

I independently ran the current projectors without writing candidate files.

- Selected activity projection: exact match; zero Topic 1.1 activities.
- Combined SRS planning projection: exact match; six rows.
- Separate SRS planning projection: exact match; six rows.
- All six SRS rows have `generatorReady: false`.
- Teacher skills, attempt artifacts, and prerequisite gaps: exact match.
- Recomputed standard rows for `HSF-BF.A.1`, `HSF-IF.A.2`, and `HSF-IF.B.4`: exact match to `projectTeacherEvidence`.

The standard rows are aggregate rows. Their recomputation changes membership outside Topic 1.1 because the base projection is stale relative to the current projector. The candidate values are the exact current projector output. This is a derived correction. It does not change source nodes or relationships for another topic.

The rejected legacy node has one inactive SRS planning row. It has no blueprint and no activity row. The candidate transfers no evidence to another node.

## Dependency limit

The reviewed prerequisite edge from the interval skill to `math.precalc.skill.1.4.identify-relative-and-absolute-extrema-from-graphs` remains in the current main tree. The target ID is absent from base `b9a5eb1e`. Therefore, the source-only HEAD candidate cannot add that edge without importing the separate Topic 1.4 dependency. This batch must leave the edge out. This omission does not change the reviewed main edge.

## Tests

The three new focused tests pass. They verify stable identity, source mappings, no legacy relationship, no Topic 1.1 active activity, and inactive SRS planning rows. The first test now imports `knowledgeSpaceNodeSchema` from the existing `/schemas` export. It parses every selected Topic 1.1 skill and source row across all four catalogs.

The recorded Red run in `/tmp/precalc-g31-schema-red.log` restored the invalid exception type and failed on the rejected legacy ID. After the corrected bytes were restored, the focused suite passed 3 of 3 tests.

The candidate build passes. The full lint gate still has the pre-existing native-anchor error at `apps/pre-calculus/app/auth/register/page.tsx:120`. Standalone TypeScript still has the pre-existing tuple mock error in `submission-authority.red.test.ts` and the shared-main missing `fingerprint` export. These baseline errors are outside the selected source patch. The full gate is not complete.

## Commit boundary

The selected source group is coherent. Do not add `update-topic11-projections.ts` to the repository. Do not include Topic 1.2 through Topic 1.6 source changes. Keep G31 open until its prerequisite quality and pilot integration work is complete.

## Parent gate follow-up

Commit `d72209ee` integrates the two existing lint and mock-type corrections. Candidate lint and build pass. Standalone TypeScript passes when it resolves the committed practice-core sources. This mapping preserves the existing serializer contract and excludes no source files. The authority suite still has three pre-existing behavioral failures. The committed route expects browser evidence. Task Q18 owns the selected writer and opaque-ID route repair.

The final candidate passes eight source tests. The shared worktree passes 15 related source and pilot acceptance tests. The parent verified that every prior edge and every unrelated node, blueprint, and queue row remain unchanged in the source patch.
