# Phase 4 Returns Audit — spec-compliance-and-process-integrity_20260612

> **Status:** Template (jr-green populates)
>
> This table enumerates functions in the Phase 4 scope that return values but
> lack a `@returns` tag in their JSDoc block.
>
> Per spec §D (Missing `@throws` and `@returns`) and FR-4: every function that
> returns a value must have a `@returns` tag in its JSDoc block.
>
> Named gap from spec §D: `saveCardsHandler` in `apps/integrated-math-3/convex/srs/cards.ts`
> lacks `@returns`.

## Summary

| Metric | Count |
|--------|-------|
| Returning functions in scope | _TBD_ |
| With `@returns` | _TBD_ |
| Without `@returns` | _TBD_ |
| Action needed | _TBD_ |

## Detailed Table

| File | Function | Returns | @returns present? | Action needed |
|------|----------|---------|------------------|---------------|
| _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ |

## Audit command (reference)

```bash
# Find functions that return but lack @returns
grep -rn 'return ' apps/integrated-math-3/convex/ apps/integrated-math-3/lib/ \
  | grep -v '_generated/' \
  | grep -v '\.d\.ts' \
  | wc -l \
  | xargs -I{} echo "return_sites:{}"

# Named gap check: saveCardsHandler
grep -n '@returns' apps/integrated-math-3/convex/srs/cards.ts \
  | grep -c saveCardsHandler || true
# Expected at HEAD: 0 (function lacks @returns)
# Green: >= 1
```
