# JSDoc Generator Template — code-review-remediation_20260624 (Phase 1)

**Date:** 2026-06-24
**Track:** code-review-remediation_20260624
**Phase:** 1 (Cluster A — Malformed JSDoc)
**Task:** FR-2 step B — corrected template for any future JSDoc regeneration

> **This template is the canonical specification for how `@param` and
> `@returns` tags MUST be emitted by any JSDoc-generation run (agent or
> script).** It is enforced by the FR-3 balanced-brace guard at
> `../scripts/check-jsdoc-balanced-braces.sh`. Any tag that violates these
> rules will fail the guard and must be fixed before commit.

## The three rules

### Rule 1 — `@returns {<type>}` MUST be a single balanced block

```
@returns {<type>} <prose description>
```

- Exactly **one** `{…}` block containing the type.
- The `{` and `}` must balance (every `{` has a matching `}`).
- **No** trailing ` {} ` after the type.
- **No** hallucinated extra `{<Type>}` prefixes.
- For union/intersection/conditional types, the `{}` block may contain
  spaces, pipes, `&`, `?`, `|`, `[]`, `keyof`, etc., but the brace depth
  must still balance.

**Forbidden (FR-1 modes):**
```js
// UNBALANCED — opening { never closed
@returns {string {} The sanitized input.

// STRAY_BLOCK — balanced {…} followed by orphaned {…} block
@returns {JSX.Element} {Promise<string | null> {} The profile ID.

// DOUBLE-PREFIX — hallucinated type prefix
@returns {JSX.Element} {Promise<string | null> {} The profile ID.
```

**Required (canonical form):**
```js
@returns {Promise<string | null>} The Convex profile ID, or null if no profile exists.
```

### Rule 2 — `@param {<type>}` MUST be balanced or omitted

Two options are valid:

**Option A — Balanced inline type:**
```
@param {<type>} <name> - <description>
```

- The type block must be fully balanced (every `{` has a matching `}`,
  every `(` has a matching `)`).
- For object/function/array types, this is the most common case.
- Verify the count of `{` and `}` match before emitting.

**Option B — Prose only (no type annotation):**
```
@param <name> - <description>
```

- Use this when the type is not knowable from context or when emitting
  it would risk imbalance.
- The spec-compliance track chose to type all `@param`s; new JSDoc
  runs may follow that precedent, but the type MUST be balanced.

**Forbidden (FR-1 modes):**
```js
// UNBALANCED — outer { never closed (object literal with embedded function type)
@param {{ student: View; rank: number; onClick?: (id: string)} props - The card props.

// UNBALANCED_PARENS — function type with closing ) lost
@param {(expression: string, problemType: string} props - The props object.
```

**Required (Option A — balanced):**
```js
@param {{ student: View; rank: number; onClick?: (id: string) => void }} props - The card props.
```

**Required (Option B — prose only):**
```js
@param props - The card props.
```

### Rule 3 — Nested generics ARE allowed (the guard handles them)

A balanced `{…}` block may contain `Promise<…>`, `Map<…>`, `Array<…>`,
or any nesting. The brace-depth counter in the FR-3 guard tracks
**every** `{` and `}` inside the tag region, so nested generics are
**not** flagged as long as the total depth balances to 0.

```js
// CLEAN — nested generics, balanced
@param {Promise<Map<string, { a: number; b: number }>>} data - Complex input.

// CLEAN — object literal with multiple fields, balanced
@returns {{ valid: boolean; errors?: string[] }} Validation result.

// CLEAN — discriminated union
@returns {error is Error & { status?: number }} Type guard.
```

## Worked examples (before/after)

### Example 1 — Simple function

**Before (original, may be untyped or have broken annotations):**
```js
/**
 * Strip prompt-injection markers from chatbot input.
 *
 * @param input - The raw user question string.
 * @returns The sanitized input safe for inclusion in an AI prompt.
 */
function sanitizeInput(input: string): string { … }
```

**After (corrected, both `@param` and `@returns` typed and balanced):**
```js
/**
 * Strip prompt-injection markers from chatbot input.
 *
 * @param {string} input - The raw user question string.
 * @returns {string} The sanitized input safe for inclusion in an AI prompt.
 */
function sanitizeInput(input: string): string { … }
```

> **Why this is correct:** the type is the literal `string` — no
> nested braces. The `{` and `}` are exactly one pair. No trailing
> ` {} `. No hallucinated prefix.

### Example 2 — Function returning a Promise with a generic Map

**Before (typical agent output that is wrong in 2 ways):**
```js
/**
 * Look up the student's mastery map.
 *
 * @param userId - The student user ID.
 * @returns {Promise<Map<string, number> {} The student's mastery map.
 */
async function getMasteryMap(userId: string): Promise<Map<string, number>> { … }
```

**After (corrected, fully balanced with nested generics):**
```js
/**
 * Look up the student's mastery map.
 *
 * @param {string} userId - The student user ID.
 * @returns {Promise<Map<string, number>>} The student's mastery map.
 */
async function getMasteryMap(userId: string): Promise<Map<string, number>> { … }
```

> **Why this is correct:** the type is `Promise<Map<string, number>>`.
> The outer `{}` contains the entire type. Inside, `<` and `>` delimit
> generics (these are NOT counted as braces by the FR-3 guard). The
> opening `{` and closing `}` are exactly one pair, balanced. No
> trailing ` {} `.

### Example 3 — Function with object-typed parameter (the most error-prone case)

**Before (typical agent output, unbalanced):**
```js
/**
 * Render a struggling-student card.
 *
 * @param {{ student: View; rank: number; onClick?: (id: string)} props - The card props.
 * @returns {JSX.Element} The rendered card.
 */
function StudentCard({ student, rank, onClick }: { student: View; rank: number; onClick?: (id: string) => void }) { … }
```

**After (corrected, both layers of the object literal balanced):**
```js
/**
 * Render a struggling-student card.
 *
 * @param {{ student: View; rank: number; onClick?: (id: string) => void }} props - The card props.
 * @returns {JSX.Element} The rendered card.
 */
function StudentCard({ student, rank, onClick }: { student: View; rank: number; onClick?: (id: string) => void }) { … }
```

> **Why this is correct:** the object type literal has TWO levels of
> braces — the outer `{ … }` (the object) and an inner `=> void`
> (just parens). Both layers balance. Note the `=>` arrow is *not* a
> brace; it is part of the function type. The closing `}}` at the
> end closes the outer object literal AND the type block.

## Anti-patterns to AVOID when generating

| Anti-pattern | Why it fails the guard | Example |
|---|---|---|
| Stray `{}` after type | `STRAY_BLOCK` violation | `@returns {string} {} desc` |
| Missing closing `}` | `UNBALANCED` violation | `@returns {string {} desc` |
| Extra `{<Type>}` prefix | `STRAY_BLOCK` violation | `@returns {JSX.Element} {Promise<…> {} desc` |
| Unclosed object literal | `UNBALANCED_PARENS` (or `UNBALANCED`) violation | `@param {{ a: number; b: number} props` |
| Truncated function type | `UNBALANCED_PARENS` violation | `@param {(x: number, y: number} props` |
| Implementation leaking into JSDoc | `STRAY_BLOCK` violation (and semantically wrong) | `@returns {unknown { return} desc` |
| Missing `{Type}` for `@returns void` | Permitted (omit the `{void}`) | `@returns Nothing.` |

## How to verify before committing

After any JSDoc regeneration, run:

```bash
bash measure/tracks/code-review-remediation_20260624/scripts/check-jsdoc-balanced-braces.sh
```

Expected output: `Violations: 0` and `exit 0`. Any non-zero count means
the template was not followed; do not commit until the count is 0.

For per-file or per-package checks:

```bash
BALANCED_BRACES_SCOPE="packages/foo/src" \
  bash measure/tracks/code-review-remediation_20260624/scripts/check-jsdoc-balanced-braces.sh
```

## Provenance

This template is the documented output of
`measure/tracks/code-review-remediation_20260624/_artifacts/generator-investigation.md`
(FR-2 step B). It is referenced by `lessons-learned.md` and by the
spec-compliance track's next iteration.
