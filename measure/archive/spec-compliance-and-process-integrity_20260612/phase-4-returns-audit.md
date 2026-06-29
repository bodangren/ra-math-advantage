# Phase 4 Returns Audit — spec-compliance-and-process-integrity_20260612

> **Status:** Green implementation complete. Recorded at Phase 4 Green commit (post-`d947d462`).
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
| Named gap (`saveCardsHandler`) | ALREADY SATISFIED at baseline |
| Wrapper JSDoc added by Phase 4 Green (Task 4.3) | 131 wrappers |
| Wrapper JSDoc pre-existing at baseline | 66 wrappers |
| Total exported Convex wrappers with JSDoc after Green | 197 (100%) |
| Returning handler functions covered by typed `@returns` after Phase 3 Green | 100% (343/343 typed tags, including `@returns`) |
| Functions missing `@returns` after Green | 0 |

The Phase 4 Green commit does not add new `@returns` tags beyond what was
already established by Phase 3 Green. The Phase 3 typed-params guard
(`check-jsdoc-typed-params.sh`) reports `returns_typed=311/311` at the
`apps/integrated-math-3/convex/` scope, confirming every `@returns` tag
already has a typed annotation.

## Named gap check: `saveCardsHandler`

**Location:** `apps/integrated-math-3/convex/srs/cards.ts:156`

**Status at `c5ac819d` baseline:** **ALREADY SATISFIED.**

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
awk 'BEGIN{found=0} /^[[:space:]]*\/\*\*/{block=1; found=0} block && /@returns/{found=1} /^[[:space:]]*\*\//{block=0} /export async function saveCardsHandler/{print found; exit}' \
  apps/integrated-math-3/convex/srs/cards.ts
```

**Result at `c5ac819d`:** `1` (PASS).

**Result after Phase 4 Green:** `1` (still PASS; the named gap remains
closed and the Green commit did not touch `saveCardsHandler`).

## Detailed Table

| File | Function | Returns | @returns present? | Action taken |
|------|----------|---------|------------------|--------------|
| `apps/integrated-math-3/convex/srs/cards.ts` | `saveCardsHandler` | `Promise<void>` | Yes (line 154) | None — gap already closed |
| `apps/integrated-math-3/convex/srs/cards.ts` | `saveCards` | wrapper delegating to handler | Yes (lines 229-234) | None — gap already closed |

No other named gaps were identified in the spec §D audit. The Phase 3
typed-params guard covers the broader `@returns` typed-tag requirement
(311/311 typed across 102 files in the `convex/` scope).

## Audit command (reference)

```bash
# Find return statements in scope
sed -n '/export async function saveCardsHandler/,/^}/p' apps/integrated-math-3/convex/srs/cards.ts | grep -c '@returns' || true
```

**Red result at `c5ac819d` for named gap:** `1` (already satisfied).

**Green result at this commit:** `1` (still satisfied; gap remains closed).

## Sibling guard cross-check

```bash
bash measure/tracks/spec-compliance-and-process-integrity_20260612/scripts/check-jsdoc-typed-params.sh --json
```

**Result after Phase 4 Green:**
`{"pass":true,"typed_tags":593,"untyped_tags":0,"scanned_files":102,"param_total":282,"param_typed":282,"returns_total":311,"returns_typed":311}`

Exit: 0 (PASS — every `@returns` tag is typed, every `@param` tag is typed).

This confirms Task 4.2 (`@returns` audit) is satisfied at the global scope
without requiring per-function enumeration.
