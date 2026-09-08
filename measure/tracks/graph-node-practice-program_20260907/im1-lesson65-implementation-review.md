# IM1 Lesson 6-5 implementation review

## Review state

The parent reviewed the candidate in `/tmp/im1-g32-head-20260908` against its base `91bea18c`. The implementation is not accepted yet. The shared working tree remains unchanged by this source repair.

## Verified graph changes

The candidate preserves all 910 prior node identities and adds 11 draft capabilities. It has 921 node records. These are graph records, not a count of approved assessable capabilities.

The candidate preserves all prior blueprint identities and adds 11 source-only blueprints. It has 320 blueprint records. The new capabilities are inactive. They have no renderer specification or Independent practice readiness.

The candidate removes exactly `math.im1.edge.1258` and `math.im1.edge.1259`. These are the two unsupported sequence prerequisites identified in the accepted proposal. It adds 14 draft containment edges: 11 new capabilities and three reused capabilities. The result has 2,426 edge records. It adds no prerequisite or equivalence edge.

The new source mappings use `sourceNodeIds`. The slope-intercept capability references the preserved joint Examples 1 and 2 source IDs. The broad legacy skill rows remain stable, draft, and inactive.

The rejected duplicate `.025` remains present. Its historical context and containment edges remain present. Its two standard alignment edges change to rejected. The author must explain why this extra status change is necessary for the selected projection before acceptance.

## Required source corrections

The current lesson rewrite is an answer summary. Restore the source givens that a learner needs to solve each problem. In particular, include all four tested points in Problem 13, the original inequalities in Problems 15 through 17, the context and variable meanings in Problems 24 through 26, and the three required solution points in Problem 29.

Preserve useful goals, vocabulary, and teaching steps from the previous lesson when they remain accurate. Keep the corrected joint Examples 1 and 2 source heading. Keep the corrected Problem 28 graph analysis and the nonunique or domain-dependent answers.

The modified source examples `.022`, `.023`, `.024`, and `.026` remain approved in `nodes.json` but draft in the other three node copies. The author must resolve this selected approval boundary. Historical approval must not silently approve replacement content. Do not change unrelated historical status differences.

## Verification limits

The author reports 105 curriculum tests, 36 coverage and audit tests, and lint passing. Four existing test typing errors remain in the isolated baseline. The build was running when this review started.

These results do not resolve the missing source conditions or selected source approval status. The parent must inspect the final candidate and required gates before integration.

## Parent projection review

The candidate removes exactly six legacy Lesson 6-5 placeholder activities. Every remaining activity record is unchanged. It preserves all prior SRS and teacher skill identities. It adds 11 inactive planning rows to each projection. The generator queue preserves its prior order and changes only the two selected legacy reason fields before appending 11 gaps.

A direct assertion found an incomplete prerequisite repair. The graph removes edge `math.im1.edge.1259`, but the Lesson 7-1 systems capability still lists the legacy Lesson 6-5 systems row as a prerequisite in both `projection/srs-input.json` and the embedded SRS inputs in `projection/practice-v1-activity-map.json`.

Regenerate the exact affected Lesson 7-1 projection through the existing projector. Preserve its other fields. Add a regression that checks the withdrawn prerequisite in both consumer projections. Also check prerequisite gaps derived from the two removed edges. Graph edge removal alone does not complete this repair.

## Final candidate verification

The revised lesson restores the missing givens. The four modified source examples are draft in all node copies. The existing standards edge objects are unchanged. Both saved SRS projections now omit the withdrawn Lesson 6-5 to Lesson 7-1 prerequisite. The parent reran the direct assertion and it passed.

The parent candidate passes 105 curriculum tests, lint, a fresh build, and post-build standalone TypeScript. Logs: `/tmp/im1-g32-parent-tests.log`, `/tmp/im1-g32-parent-lint.log`, `/tmp/im1-g32-parent-build.log`, and `/tmp/im1-g32-parent-tsc.log`.

Commit `2c231607` integrates the separate test-only typing prerequisite. It widens three inferred source ID arrays for string membership checks. It changes no assertion or curriculum data. The final source patch remains pending parent integration and shared-worktree preservation checks.
