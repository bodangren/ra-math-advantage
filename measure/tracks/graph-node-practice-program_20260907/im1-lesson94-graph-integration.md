# IM1 Lesson 9-4 graph integration

Parent review accepts the corrected 14-path graph candidate. The source restoration is unchanged.

The graph adds ten draft capabilities from the reviewed worksheet. Four source headings retain their stable IDs. The two broad aggregate skills remain inactive. Six placeholder activities are removed. The only new prerequisite connects median calculation to the five-number summary. No prior edge changes. The stale review queue loses only edge 1273 and its count entry.

The current inventory has 1,039 nodes, 2,552 course edges, 440 skill rows, 439 non-rejected skill rows, 436 blueprint rows, and 433 gaps. There are 112 approved skill rows. These counts do not prove usable practice or source approval.

Parent checks passed: 339 curriculum and seed tests in 58 files; 37 coverage and audit tests; app lint; fresh build; post-build standalone TypeScript with candidate package source mappings. The parent inspected the node, edge, blueprint, projection, source-reference, and queue changes. All prior edge IDs and bodies are unchanged.

Commands: `CI=true npm test -- __tests__/curriculum __tests__/convex/seed` from the IM1 app; root Vitest for the IM1 coverage-matrix and audit-diff tests; `npm run lint`; `npm run build`; `npx tsc --noEmit -p tsconfig.parent-check.json`. The temporary configuration disabled incremental compilation and mapped practice-core to the candidate source. It was removed after the check.

The first patch omitted the new regression test. The corrected patch includes all 14 paths. Temporary-index application and parent byte comparison prove that each integrated path matches the tested candidate. Source approval, authored practice, grading, teacher review, and student-flow verification remain open.
