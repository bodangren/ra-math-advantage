# Q40 Precalculus brand symbol report

## Result

The header and footer now pass the actual integral symbol `∫` to the shared layout components. The browser will no longer render the literal text `\u222B`.

## Scope

- `apps/pre-calculus/components/header-simple.tsx`
- `apps/pre-calculus/components/footer.tsx`
- `apps/pre-calculus/__tests__/components/brand-symbol.test.tsx`

Base: `b976547b2849f3b422f7306693f44120c18f5ae9`

Patch: `/tmp/precalc-brand-symbol-final.patch`

## Verification

- The new render regression failed before the source change and passed after it.
- Focused test: 1 passed.
- `npm run lint`: passed.
- `npm run build`: passed. Existing KaTeX duplicate-file warnings appeared.
- `npx tsc --noEmit`: passed.
- A private full-base Git index produced the patch.

## Parent acceptance

Committed as `e8770f29b`. All three staged paths match the candidate. Parent render test, lint, build, and post-build standalone TypeScript pass. Independent review accepts the patch. The actual browser shows the integral symbol in both header and footer. The browser asserts that neither element contains the literal escape text. Parent visual inspection confirms the header.
