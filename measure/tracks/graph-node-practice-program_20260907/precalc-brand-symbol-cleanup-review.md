# Q40 Precalculus brand symbol cleanup review

## Archive

`/tmp/precalc-saved-views-head-6_4_6dxd`

The archive was refreshed from base `b976547b2849f3b422f7306693f44120c18f5ae9` before Q40 work.

## Authored content

All three Q40 files match commit `e8770f29b` exactly:

- `apps/pre-calculus/__tests__/components/brand-symbol.test.tsx`
- `apps/pre-calculus/components/footer.tsx`
- `apps/pre-calculus/components/header-simple.tsx`

The complete authored-tree comparison found no other Q40 source change. The archive also contains known generated files from app verification:

- `apps/pre-calculus/.wrangler/deploy/config.json`
- `apps/pre-calculus/next-env.d.ts`
- `apps/pre-calculus/tsconfig.tsbuildinfo`

The archive has dependency links under `node_modules`. Many links resolve to the shared main dependency installation. The `@math-platform` workspace links resolve inside the candidate archive.

## Recommendation

The archive is safe to remove after parent browser verification and committed-byte verification. Remove only the archive root. Do not follow symbolic links. Do not remove any resolved shared dependency target.

## Parent removal

The parent confirmed all three file bytes against `e8770f29b`. The real browser verified both integral symbols. The parent removed the completed Q38/Q40 archive without following dependency links. All authored changes remain committed.
