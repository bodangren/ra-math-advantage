# Phase 4 Throws Audit — spec-compliance-and-process-integrity_20260612

> **Status:** Green implementation complete. Recorded at Phase 4 Green commit (post-`d947d462`).
>
> This table enumerates every `throw` site in the Phase 4 scope
> (`apps/integrated-math-3/convex/`, `apps/integrated-math-3/lib/`) and records
> whether the enclosing function's JSDoc contains a `@throws` tag.
>
> Per spec §D (Missing `@throws` and `@returns`) and FR-4: every function that
> throws must have a `@throws` tag in its JSDoc block.

## Summary

| Metric | Count |
|--------|-------|
| Throw sites in scope | 74 |
| Throw sites in test files (`__tests__/`) — excluded | 2 |
| Throw sites processed by Green | 72 |
| Already had `@throws` at baseline | 22 |
| `@throws` newly added (in existing JSDoc) | 12 |
| `@throws` newly added (via synthesized JSDoc for previously undocumented function) | 7 |
| `@throws` covered by an already-queued insertion (same JSDoc block as a sibling throw) | 13 |
| `@throws` covered by an already-synthesized JSDoc on the wrapper | 18 |
| Throw sites without `@throws` after Green | 0 |

The 22 "already had @throws" entries are functions whose JSDoc was authored
correctly in earlier phases; the Green commit added nothing for those.

The 12 + 7 + 13 + 18 = 50 entries are the ones where this Green commit added
or augmented `@throws` coverage (50 total `throw` sites newly covered or
already-queued on the same JSDoc). The deduplication logic means each
JSDoc block receives exactly one `@throws` insertion per throwing function.

## Detailed Table

The full per-site audit is generated from the in-script audit JSON at
`/tmp/opencode/phase4_throws_audit.json` during the Green run. Per-site summary:

| File | Throws | @throws added | Already present |
|------|--------|---------------|-----------------|
| apps/integrated-math-3/convex/activities.ts | 1 | 0 | 1 |
| apps/integrated-math-3/convex/dev.ts | 2 | 0 | 2 |
| apps/integrated-math-3/convex/exports.ts | 9 | 9 | 0 |
| apps/integrated-math-3/convex/misconceptionState.ts | 1 | 1 | 0 |
| apps/integrated-math-3/convex/onboarding/roster-import.ts | 3 | 3 | 0 |
| apps/integrated-math-3/convex/parent/visualization.ts | 3 | 3 | 0 |
| apps/integrated-math-3/convex/placement.ts | 2 | 0 | 2 |
| apps/integrated-math-3/convex/queue/sessions.ts | 2 | 1 | 1 |
| apps/integrated-math-3/convex/rateLimits.ts | 1 | 1 | 0 |
| apps/integrated-math-3/convex/srs/processReview.ts | 4 | 0 | 4 |
| apps/integrated-math-3/convex/srs/reviews.ts | 5 | 0 | 5 |
| apps/integrated-math-3/convex/srs/sessions.ts | 1 | 0 | 1 |
| apps/integrated-math-3/convex/study.ts | 3 | 0 | 3 |
| apps/integrated-math-3/convex/teacher/lessonAssignment.ts | 2 | 0 | 2 |
| apps/integrated-math-3/convex/teacher/srs_mutations.ts | 1 | 0 | 1 |
| apps/integrated-math-3/lib/phase-completion/client.ts | 2 | 2 | 0 |
| apps/integrated-math-3/lib/placement/im3-probe-adapter.ts | 1 | 1 | 0 |
| apps/integrated-math-3/lib/placement/seed-knowledge-state.ts | 2 | 2 | 0 |
| apps/integrated-math-3/lib/scale/budget-evaluator.ts | 4 | 4 | 0 |
| apps/integrated-math-3/lib/scale/cost-record.ts | 1 | 1 | 0 |
| apps/integrated-math-3/lib/scale/insights-parser.ts | 16 | 16 | 0 |
| apps/integrated-math-3/lib/srs/convexCardStore.ts | 1 | 1 | 0 |
| apps/integrated-math-3/lib/teacher/data-export.ts | 5 | 5 | 0 |
| **Total in scope** | **72** | **50** | **22** |

The two throw sites in `apps/integrated-math-3/convex/migrations/__tests__/rename-problem-family.test.ts`
are inside `__tests__/` directories (test-only memory-DB helpers). They are
intentionally excluded from the `@throws` requirement per Phase 4 audit
convention: test helpers have no public contract and their throw behavior
is governed by vitest's assertion machinery, not by Convex's runtime. This
exclusion is documented here as required by the audit table.

## Audit command (reference)

```bash
grep -rEn '^\s*throw\b' apps/integrated-math-3/convex/ apps/integrated-math-3/lib/ \
  | wc -l \
  | xargs -I{} echo "throw_sites:{}"
```

**Red result at `c5ac819d`:** `throw_sites:74` (72 in production code + 2 in test files).

**Green result at this commit:** every production throw site has a JSDoc
`@throws` tag (or shares a JSDoc block with another throw site that has one).
See the per-file table above.

## Green Implementation Notes

- `@throws {Error}` is added for `throw new Error(...)` statements.
- `@throws {ConvexError}` is added for `throw new ConvexError(...)` statements.
- Custom error types (`Im3ProbeAdapterError`, `PhaseCompletionError`,
  `PhaseSkipError`) are tagged with their respective custom type.
- Multi-line JSDoc blocks receive an inserted `@throws` line before the
  closing `*/`.
- Single-line JSDoc blocks (`/** description */`) are converted to multi-line
  form (`/** \n * description \n * @throws {...} \n */`) before the tag is
  added.
- For functions without any prior JSDoc, a minimal JSDoc block is synthesized
  that includes `@throws` (and a brief description derived from the function
  name).
- For exported Convex wrappers (`export const X = internalQuery(...)` etc.)
  whose body delegates to a named `*Handler` function, `@throws` is added
  to the wrapper's JSDoc (the wrapper is the Convex-exported surface per
  spec §E / FR-5).
