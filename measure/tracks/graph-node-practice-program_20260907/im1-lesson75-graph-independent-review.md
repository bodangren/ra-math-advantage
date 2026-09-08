# G37 Lesson 7-5 graph independent review

## Disposition

Accept the revised patch. The review findings are resolved.

## Findings

### Withdrawn: Problem 23 is not direct modeling evidence

The committed proposal deliberately narrows the contextual-model node to Example 3, Problems 13-14, and Mixed Exercises, Problems 21-22. Problem 23 asks only whether an ordered pair is possible. The student can use modeling as a strategy, but the response does not expose a separate system-writing deliverable. The viable-solution node correctly owns Problem 23. Keep the current source reference.

### Resolved: Rejected legacy 7k is not an authoring gap

The revised coverage builder reads `reviewStatus` and excludes rejected skill rows from current authoring coverage. The revised queue omits legacy 7k. The graph and historical blueprint retain the stable rejected identity. The audit now separates 357 total skill records from 356 non-rejected current candidates and 350 current gaps.

## Verified graph changes

- The four catalogs add exactly seven skill IDs. No skill ID is removed.
- Stable legacy 7i keeps its ID. It is draft and inactive.
- Legacy 7k keeps its ID. It is rejected and inactive.
- The lesson keeps four source IDs: `.016`, `.017`, `.018`, and `.019`.
- Source `.016` is the retained joint Examples 1 and 2 group.
- Sources `.017` and `.018` are rejected duplicate identities with no source references.
- Source `.019` is Example 3.
- The patch removes exactly four prior edges: prerequisite edge `math.im1.edge.1264` and contains edges `math.im1.edge.1018`, `math.im1.edge.1019`, and `math.im1.edge.1022`.
- The patch adds eight contains edges. It adds no prerequisite or equivalence edge.
- The patch removes exactly six activity rows. These are the three legacy 7i mode rows and the three rejected 7k mode rows.
- The standalone and embedded SRS projections keep the affected rows inactive. The removed prerequisite is absent from both projections.
- Lesson 6-4 node rows are byte-equivalent as parsed data in `nodes.json` and `draft-nodes.json`. The patch does not propose a Lesson 6-4 semantic change.
- Candidate totals are 955 nodes, 2,467 edges, 353 blueprints, 390 activities, 182 SRS inputs, 356 coverage-matrix skill rows, and 350 gap-queue rows.
- The candidate has 129 approved skill nodes. This is the correct G37 value. The earlier value of 132 was stale.

## Source-scope checks

The seven new node scopes match the accepted proposal. The contextual-model scope remains Example 3, Problems 13-14, and Mixed Exercises, Problems 21-22. The remaining scopes are:

- Write a system from a shaded region: Problems 15-18.
- Check an ordered pair: Problem 19.
- Find and interpret viable contextual solutions: Problems 13-14 and 22-23.
- Classify a feasible set from boundary relationships: Problems 25 and 28.
- Construct a system with no solution: Problem 26.
- Find the area of a bounded feasible region: Problem 27.

All seven new nodes are draft and inactive. Their blueprints are source-only. The patch does not add generator specifications or approval.

## Verification

I compared the candidate JSON artifacts with candidate HEAD by parsed IDs and edge records. I also ran these focused tests:

```text
lesson-6-4-capabilities-source.test.ts       6 passed
lesson-7-5-capabilities-source.test.ts       6 passed
lesson-7-4-capabilities-source.test.ts       6 passed
Total                                      18 passed
coverage-matrix.test.ts                   21 passed
```

The requested Lesson 7-5 source and coverage-matrix paths were not present under the supplied names, so Vitest did not run them. `git diff --check HEAD` found no whitespace error.

## Final verification

The rejected-node test failed before the builder repair. Three assertions showed 357 instead of 356 and showed rejected 7k in the matrix. After the repair, 59 focused assertions passed across the lesson, coverage, audit, and blueprint suites. `npm run lint`, `npm run build`, and `npx tsc --noEmit` passed in the current-HEAD scratch tree. `git diff --check` passed. The apply-ready patch is `/tmp/im1-g37-graph-only-final.patch`.
