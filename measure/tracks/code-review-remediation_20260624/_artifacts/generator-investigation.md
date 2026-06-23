# JSDoc Generator Investigation — code-review-remediation_20260624 (Phase 1)

**Date:** 2026-06-24
**Track:** code-review-remediation_20260624
**Phase:** 1 (Cluster A — Malformed JSDoc)
**Task:** FR-2 step B — locate and document the producer of the malformed JSDoc batch

## TL;DR

The malformed JSDoc batch was **agent-driven**, not produced by a checked-in
script. The same bug class (truncated object/function type literal in
`@param {…}` tags) was previously committed by the
`spec-compliance-and-process-integrity_20260612` track (commits
`a5c2d410` and `76765734`, June 21 2026) on `apps/integrated-math-3/`, where
it escaped both the typed-params guard and `tsc --noEmit`. The 144-file
uncommitted batch is a *parallel* attempt to do the same conversion for
`packages/`, again agent-driven, again with the same defect. No checked-in
script or template corresponds to either batch.

## What was searched

- `scripts/`, `measure/scripts/`, `packages/*/scripts/`, `apps/*/scripts/`
  — no JSDoc generator script.
- `measure/archive/jsdoc-comments_20260526/scripts/add-jsdoc*.mjs` — three
  archived scripts from the prior `jsdoc-comments_20260526` track. They
  produce **untyped** JSDoc (`@param name - desc`, `@returns desc`). Not the
  producer of the malformed batch (which emits `@param {Type} name`,
  `@returns {Type} desc`).
- `git reflog`, `git log --all --grep="jsdoc|@param|@returns|typed" -i` —
  no commit that "added typed JSDoc to packages/" (the spec-compliance
  Phase 3 only touched `apps/integrated-math-3/`).
- `git log --diff-filter=M --name-only --since="30 days ago"` — confirms
  no recent typed-JSDoc batch landed on `packages/`.
- `_artifacts/`, `measure/lessons-learned.md` — no prior record of the
  producer.

## Source of the bug class (already committed at HEAD)

The same defect class — `{<type> {}` or `{{ … } <unclosed>` — was committed
in spec-compliance Phase 3, which ran the agent on `apps/integrated-math-3/`
to convert untyped JSDoc to typed. Two examples already at HEAD:

**`apps/integrated-math-3/components/teacher/srs/StrugglingStudentsPanel.tsx:23`**
(unbalanced @param object literal, unclosed outer `{`):
```diff
- * @param props - Student card configuration.
+ * @param {{ student: StrugglingStudentView; rank: number; onClick?: (studentId: string)} props - Student card configuration.
```

**`apps/integrated-math-3/components/dev/review-queue/index.tsx:493`**
(same shape):
```diff
- * @param props - Component harness panel configuration.
+ * @param {{ item: ReviewQueueItem; onCanApproveChange: (canApprove: boolean)} props - Component harness panel configuration.
```

The 4 FR-1 `@returns {<type> {}` cases in the spec are also from
spec-compliance Phase 3 (`a5c2d410`) on `apps/integrated-math-3/app/` and
on `packages/knowledge-space-practice/` (via the prior `dc6ba80a` /
`46b9498e` JSDoc-add commits, where the agent ran a typed-params follow-up
on top of the untyped JSDoc layer).

## Source of the 144-file uncommitted batch

The 144-file working-tree batch adds typed annotations to `packages/*/`
files that previously had only untyped JSDoc (added in `dc6ba80a`,
June 12 2026). The pattern is identical to the spec-compliance batch
(`@param {<type>} name`, `@returns {<type> {} desc`):

Sample diff (sampled via `git diff --stat` before restore):
```diff
- * @param props - The input configuration including value, label, and validation options
- * @returns The math input field component JSX
+ * @param {MathInputFieldProps} props - The input configuration …
+ * @returns {boolean} The math input field component JSX
```

```diff
- * @returns The formatted submission envelope object
+ * @returns {unknown { return} The formatted submission envelope object
```

The second example is especially diagnostic — the agent picked up
`return` from the implementation and stuffed it into the JSDoc type
slot. This is consistent with an LLM prompt that asks the agent to
"add the return type to the JSDoc" and the agent reading the function
body instead of the type signature.

No commit exists for the 144-file batch; it has only ever existed as
uncommitted working-tree edits. It is therefore the unfinished output
of an agent run that was either (a) abandoned after being judged
malformed, or (b) still in progress when this track started.

## What the corrected template must prevent

The corrected template (see `../templates/jsdoc-template.md`) is written
to be followed by **any future agent run** (LLM or human) doing
typed-JSDoc conversion. The template's invariants:

1. `@returns {<type>}` — exactly one balanced `{…}` block. No trailing
   ` {} `. No hallucinated extra `{<Type>}` prefixes (the
   `{JSX.Element} {Promise<string|null> {}` pattern).
2. `@param {<type>}` — either a fully-balanced inline type literal
   (object/function/array), or omit the `{type}` entirely and use
   prose. A truncated `{{ … } props` is forbidden.
3. Examples in the template use the simplest possible balanced form
   and the most complex (nested generics) to show what "balanced"
   means at both ends.

## Why the existing guards missed it

| Guard | What it checks | What it missed |
|---|---|---|
| `tsc --noEmit` | TS type errors | JSDoc type tags on `.ts` files (only consulted with `// @ts-check` on `.js`) |
| `check-jsdoc-typed-params.sh` (spec-compliance) | `@param`/`@returns` has *some* `{Type}` annotation | Does NOT check the `{Type}` is *balanced* |
| `check-jsdoc-coverage.sh` (jsdoc-comments) | Summary `IS NOT NULL` for each function | Does NOT check tag correctness |
| `npm run lint` | ESLint rules | No JSDoc-brace rule configured |

The new `check-jsdoc-balanced-braces.sh` (FR-3 guard) closes this gap.
It is the only gate that catches the class.

## Recommendation for the next role

1. **Re-run the agent** with the corrected template to regenerate the
   144-file batch. The template's three rules must be followed
   verbatim, especially rule 1 (`@returns {<type>}` with no trailing
   ` {}`) and rule 2 (`@param {<type>}` either balanced or omitted).
2. **Wire `check-jsdoc-balanced-braces.sh` into CI** (`.github/workflows/ci.yml`)
   so any future regeneration is gated automatically. Suggested:
   ```yaml
   - name: JSDoc balanced-brace guard
     run: bash measure/tracks/code-review-remediation_20260624/scripts/check-jsdoc-balanced-braces.sh
   ```
3. **Add a lessons-learned entry** capturing the anti-pattern
   (agent prompt "add @param/@returns type" without template invariants
   → 358 violations / 144 files). Mark for FR-20 in Phase 7.
4. **Audit the spec-compliance Phase 3 batch** (already in HEAD) for
   similar residuals. The 2 @param cases (StrugglingStudentsPanel,
   review-queue/index.tsx) were already fixed in this Phase 1 pass; no
   other HEAD-baseline FR-3 violations remain.
