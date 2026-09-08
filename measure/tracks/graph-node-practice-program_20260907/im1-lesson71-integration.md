# IM1 Lesson 7-1 source integration

## Result

The repair preserves the seven stable worksheet example IDs. It corrects the joint example headings, source references, full learner prompts, contextual givens, and descriptions of all five figures. The old catalog positions remain explicit historical metadata. All seven changed source bodies are draft in all four catalogs.

Twelve new draft capabilities separate the assessed operations. Eight have exact worked-source mappings. Four mixed-only candidates have empty worked-source mappings. The graph reuses the existing line-graphing capability and adds 13 draft containment edges. It adds no prerequisite, equivalence, or standard edge.

The legacy 7a aggregate remains draft and source-only. The repair removes its three placeholder activities and sets its generator readiness to false. The parent preserves the legacy blueprint's two existing standard references. The reused line-graphing blueprint gains the actual Lesson 7-1 graphing source.

## Verified inventory

- Nodes: 921 to 933. No old ID is removed. Seven source nodes and one legacy capability change.
- Graph edges: 2,426 to 2,439. Every old edge stays unchanged.
- Standard edges: 931 to 931. Every edge stays unchanged.
- Skill candidates: 336.
- Blueprints: 320 to 332.
- Generator gaps: 318 to 330.
- Practice activities: 408 to 405.
- Inactive and existing SRS planning rows: 149 to 161.

These are inventory totals. They are not ready-practice totals. No new capability is approved or active.

## Verification

The parent ran the full curriculum suite: 110 tests in 27 files pass. Lint, a fresh build, and post-build standalone TypeScript pass. The final standard-reference preservation correction passes the 12 focused Lesson 6-5 and Lesson 7-1 tests and the app gates again.

The main checkout passes the 12 focused tests. All 13 patch files match the reviewed isolated candidate. Independent review accepts the repaired source and graph scope. The first review rejected incomplete source content and false class-plan references; both defects are repaired.

Logs: `/tmp/im1-g33-parent-tests.log`, `/tmp/im1-g33-main-parent-tests.log`, and `/tmp/im1-g33-final-parent-{tests,lint,build,tsc}.log`.

Source approval, Worked examples, Guided practice, Independent practice, generators, and positive student delivery remain open for the new capabilities. No dependency change or deployment occurred.
