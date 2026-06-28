# Phase 4 Throws Audit — spec-compliance-and-process-integrity_20260612

> **Status:** Template (jr-green populates)
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
| Throw sites in scope | _TBD_ |
| With `@throws` | _TBD_ |
| Without `@throws` | _TBD_ |
| Action needed | _TBD_ |

## Detailed Table

| File | Function | Throw statement | @throws present? | Action needed |
|------|----------|----------------|-----------------|---------------|
| _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ |

## Audit command (reference)

```bash
grep -rEn '^\s*throw\b' apps/integrated-math-3/convex/ apps/integrated-math-3/lib/ \
  | wc -l \
  | xargs -I{} echo "throw_sites:{}"
```
