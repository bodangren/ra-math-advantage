# Phase 4 Returns Audit — spec-compliance-and-process-integrity_20260612

> **Status:** Red baseline recorded at `c5ac819d` (Phase 4 baseline SHA).
>
> This table enumerates functions in the Phase 4 scope that return values but
> lack a `@returns` tag in their JSDoc block.
>
> Per spec §D (Missing `@throws` and `@returns`) and FR-4: every function that
> returns a value must have a `@returns` tag in its JSDoc block.
>
> Named gap from spec §D: `saveCardsHandler` in `apps/integrated-math-3/convex/srs/cards.ts`.

## Summary

| Metric | Count |
|--------|-------|
| Returning functions in scope | _TBD (jr-green completes during Green)_ |
| With `@returns` | _TBD_ |
| Without `@returns` | _TBD_ |
| Action needed | _TBD_ |

## Named gap check: `saveCardsHandler`

**Location:** `apps/integrated-math-3/convex/srs/cards.ts:156`

**Status at `c5ac819d`:** **ALREADY SATISFIED.**

The JSDoc block immediately preceding `export async function saveCardsHandler`
contains a typed `@returns` tag (line 154):

```ts
/**
 * Saves or updates multiple SRS cards in a single batch operation.
 * @param {MutationCtx} ctx - The mutation context
 * @param {{ cards: Array<{ ... } > }} args - Object containing an array of card data to save
 * @returns {Promise<void>} Resolves when every card has been upserted; failures in the `Promise.all` are surfaced to the caller
 */
export async function saveCardsHandler(...)
```

The exported wrapper `saveCards` (`internalMutation` at line 235) also has a
JSDoc block with `@returns` (lines 229–234). The named gap from spec §D is
closed at this baseline.

## Correct verification command

The command in the original test strategy (`grep -n '@returns' ... | grep -c
saveCardsHandler`) is structurally broken because the `@returns` line does not
contain the function name. Use this instead:

```bash
sed -n '/export async function saveCardsHandler/,/^}/p' apps/integrated-math-3/convex/srs/cards.ts | grep -c '@returns' || true
```

**Result at `c5ac819d`:** `1` (PASS).

## Detailed Table

| File | Function | Returns | @returns present? | Action needed |
|------|----------|---------|------------------|---------------|
| _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ |

## Audit command (reference)

```bash
# Find return statements in scope
sed -n '/export async function saveCardsHandler/,/^}/p' apps/integrated-math-3/convex/srs/cards.ts | grep -c '@returns' || true
```

**Red result at `c5ac819d` for named gap:** `1` (already satisfied).
