# Evidence: docs-new-direction_20261114

## Facts

Checked on 2026-11-14 at `8d65b94f`.

| Fact | Value | Check |
|------|-------|-------|
| Apps | `bus-math-v2`, `integrated-math-1`, `integrated-math-2`, `integrated-math-3`, `pre-calculus` | `ls apps` |
| Wrangler config in each app | 5 files | `ls apps/*/wrangler.jsonc` |
| Packages | 20 packages and `_template` | `ls packages` |
| vinext | 0.0.55 (`engines.node` `>=22`) | `package-lock.json` entry `node_modules/vinext` |
| next | 16.2.7 | `package-lock.json` |
| react | 19.2.7 | `package-lock.json` |
| convex | 1.40.0 | `package-lock.json` |
| typescript | 6.0.3 | `package-lock.json` |
| tailwindcss | 4.3.0 | `package-lock.json` |
| vite | 8.0.16 (`engines.node` `^20.19.0 \|\| >=22.12.0`) | `package-lock.json` |
| vitest | 4.1.8 | `package-lock.json` |
| @playwright/test | 1.60.0 | `package-lock.json` |
| wrangler | 4.98.0 | `package-lock.json` |
| Root `engines` field | none | `package.json` |
| Auth | `packages/core-auth`, cookie `bm_session`, TTL 12 hours | `packages/core-auth/src/constants.ts` |
| AI | `fetch` to `https://openrouter.ai/api/v1`, `OPENROUTER_API_KEY`, default model `openrouter/free` | `packages/ai-tutoring/src/providers.ts` |
| IM3 demo accounts | `teacher@demo`, `student1@demo` to `student5@demo`, password `Demo1234!` | `apps/integrated-math-3/convex/seed.ts:1492` |
| IM3 seed entry | `seedAll` (internal action) | `apps/integrated-math-3/convex/seed.ts:12` |
| IM3 app scripts | `dev`, `dev:stack`, `build`, `start`, `lint`, `typecheck`, `test`, `test:watch`, `test:e2e`, `test:a11y` | `apps/integrated-math-3/package.json` |
| IM3 schema tables | 41 `defineTable` calls | `grep -c defineTable apps/integrated-math-3/convex/schema.ts` |
| Root scripts | `lint`, `build`, `test`, `ws:<app>:{lint,test,typecheck,build}` for `im3`, `bm2`, `im2`, `pc`, `im1`, `generate`, `doctor`, `guard:fr5-typed-params*` | `package.json` |
| Workflows | `ci.yml`, `cloudflare-deploy.yml`, `jsdoc-typed-params.yml`, `scale-benchmarks.yml` | `ls .github/workflows` |
| Cloud | Workers `integrated-math-3` and `bus-math-v2` on workers.dev, no traffic; no deploy from this repository | `prod-deploy-pipeline_20261114` spec, inventory of 2026-11-14 |

## Unchanged Files

## INTEGRATION Sections

## Test Constraints
