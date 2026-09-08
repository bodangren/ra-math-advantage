# G50 Lesson 9-7 graph implementation report

The candidate is `/tmp/im1-g50-source-head-20260908.140ok6_u`.

The base is `925ec0cf8`. The full-base binary patch is `/tmp/im1-g50-graph-final.patch`. It contains the 13 paths in `/tmp/im1-g50-graph-paths.txt`.

The graph adds 17 draft, inactive capabilities. It preserves the approved broad table-construction capability. It binds the exact source examples as follows:

- `.023`, printed `Example 1`: broad table construction, joint-frequency reading, marginal-frequency reading, and named-frequency difference.
- `.024`, printed `Example 2`: overall relative-frequency table construction, overall joint relative frequency, and joint-or-marginal interpretation.
- `.025`, printed `Example 3`: conditional relative-frequency calculation, conditional table construction, conditional interpretation, and reversed-condition comparison.

Mixed-exercise-only capabilities keep empty `sourceNodeIds`. The graph adds the `.025` `appears_in_context` and lesson `contains` edges. These edges use direct source rationales.

The graph removes `math.im1.edge.1277` and its queue row. It also removes its prerequisite residue from both SRS projections. That edge used only lesson sequence as evidence.

The edge artifact now contains 2,622 edges. The other derived inventory values do not change:

- Nodes: 1,085.
- Skill records: 485.
- Non-rejected skills: 484.
- Generator gaps: 478.
- Blueprint rows: 481.
- Approved skills: 108.
- Source-only blueprint rows: 379.
- Empty mode-specification rows: 96.

Verification passed:

- Focused Lesson 9-7 contract: 5 tests.
- Full curriculum and seed suite: 64 files and 387 tests.
- Math-content knowledge-space suite: 47 tests.
- Integrated Math 1 lint.
- Integrated Math 1 build.
- Standalone TypeScript with `--noEmit`.
- Full patch whitespace check.
- All 21 `@math-platform` application dependencies resolve to candidate package directories.

Edge 1276 residue remains outside this correction scope. Both `projection/srs-input.json` and `projection/practice-v1-activity-map.json` still list the Lesson 9-6 broad transformation skill as a prerequisite of the Lesson 9-7 broad table skill. This report does not claim that edge is valid.

The patch does not change the Lesson 9-7 source, dependencies, hashes, or manifests. The candidate is frozen.

## Parent verification

The parent verified all 13 staged files against the frozen candidate. The final curriculum and seed suite passed all 387 tests. Coverage and audit checks passed all 37 tests. Lint, build, and standalone TypeScript passed. Independent review accepts the final correction. These draft counts do not establish source approval or usable practice coverage.
