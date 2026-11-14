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

Group 4 changed only two files: `measure/tech-specs.md` (the lint command comment and the
"Vercel (primary)" deploy line) and `measure/monorepo-ops.md` (the IM3 `npm run dev`
comment and the two `npx convex run seed.ts` commands). Spec W7 excludes
`measure/workflow.md`, `measure/tracks.md`, `measure/lessons-learned.md`, and
`measure/tech-debt.md`.

These `measure/*.md` files stay as they are. They hold no instruction that is wrong today.
Some of them hold dated history or old facts, which the later tracks own:

| File | Note |
|------|------|
| `anti-patterns.md` | No wrong instruction |
| `autonomous-prompt.md` | No wrong instruction |
| `autonomous_prompt.md` | No wrong instruction |
| `bm2-alignment-report.md` | Dated report |
| `course-objectives.md` | No wrong instruction |
| `daily-practice-srs-roadmap.md` | Roadmap; no wrong instruction |
| `knowledge-space-practice-projection-audit.md` | Dated audit |
| `modules-3-9-roadmap.md` | Roadmap; no wrong instruction |
| `monorepo-jr-execution-spec.md` | Migration history of 2026-04 (Supabase mentions are history) |
| `monorepo-migration-index.md` | Migration history |
| `monorepo-migration-report-20260419.md` | Dated report |
| `monorepo-plan.md` | Migration roadmap of 2026-04-17 (history) |
| `monorepo-track-playbook.md` | Migration playbook (history) |
| `practice-component-contract.md` | No wrong instruction |
| `practice-primitives-roadmap.md` | Names the four math apps; `math-app-retire-old-apps_20261114` FR-5 changes it |
| `product-guidelines.md` | The ESLint rule is true today; `vinext-oxc-toolchain_20261114` owns the move to oxlint |
| `review-prompt.md` | Says `npm run lint && npm run typecheck (or equivalent)`; the root has no `typecheck` script, but the text allows an equivalent |
| `skill-graph-cross-course-equivalence-audit.md` | Dated audit |
| `skill-graph-deprecation-report.md` | Dated report |
| `skill-graph-edge-audit.md` | Dated audit |
| `skill-graph-im1-rollout-audit.md` | Dated audit |
| `skill-graph-im2-rollout-audit.md` | Dated audit |
| `skill-graph-im3-m1-pilot-audit.md` | Dated audit |
| `skill-graph-im3-rollout-audit.md` | Dated audit |
| `skill-graph-inventory-audit.md` | Dated audit |
| `skill-graph-precalc-rollout-audit.md` | Dated audit |
| `skill-graph-standards-audit.md` | Dated audit |

## INTEGRATION Sections

Group 5 changed these contradictions in `INTEGRATION.md`: the monorepo name, the structure
tree (5 apps and 21 package folders), the package verification commands (the root has no
`ws:lint`, `ws:typecheck`, `ws:test`, or `ws:build`), the app adoption step (a workspace
range `"*"` and a root `npm install` after approval), the package test command (two
places), the Convex project names, the removed `npx convex schema push`, and the
Deployment section (Workers, not Pages, with a planned marker).

These old sections stay for `math-app-retire-old-apps_20261114` (FR-6) and the other owner
tracks:

| Section | Old content | Owner |
|---------|-------------|-------|
| App Adoption | IM3 and BM2 only | `math-app-retire-old-apps_20261114` |
| App-Local Keep List | `apps/integrated-math-3/...` paths | `math-app-retire-old-apps_20261114` |
| Review Checklist | "Both IM3 and BM2 tests pass" | `math-app-retire-old-apps_20261114` |
| Local Development: Environment Variables | `AUTH_JWT_SECRET` for IM3 and BM2 | `math-app-base_20261114`, `bm2-convex-auth-v2_20261114` |
| Local Development: Running Both Apps | IM3 and BM2 paths | `math-app-retire-old-apps_20261114` |
| Testing: App Tests, Full Gates | IM3 paths | `math-app-retire-old-apps_20261114` |
| Ownership Map | the `core-auth` row and the "BM2 Supabase" remainders | `bm2-convex-auth-v2_20261114` |

## Phase 1 Checks

| Check | Result |
|-------|--------|
| `bash measure/scripts/doctor.sh` (the command of `npm run doctor`) | Exit code 0: "No monorepo boundary violations found." |
| `npm run generate` | Not run. It rewrites `measure/generated/routes.md`, which has an unrelated uncommitted change that this session must not change. The checkpoint runs it after that change is resolved. |
| Wrapped markers (`grep -n "(planned:"` without `)` on the same line) | None |
| Retire marker grep (`git grep -c -E "planned: [^)]*(math-app-base\|math-app-course-(im1\|im2\|precalc)\|math-app-retire-old-apps)_20261114" -- README.md AGENTS.md INTEGRATION.md ':(glob)measure/*.md'`) | AGENTS.md 2, INTEGRATION.md 2, README.md 6, architecture.md 7, index.md 1, knowledge-space.md 1, product.md 6, tech-stack.md 2 |

## Test Constraints

Checked after group 3 with `grep` (no `node_modules` on this machine, so the Vitest suites
did not run).

| Constraint | Command | Result |
|------------|---------|--------|
| `measure/index.md` has the row `\| **Knowledge Space Contract** \|` | `grep -c "\| \*\*Knowledge Space Contract\*\* \|" measure/index.md` | 1 |
| The row path cell names `SPECIFICATION.md` | `grep -o` on the row | `../kst-srs.v2/SPECIFICATION.md` |
| `measure/knowledge-space.md` links to `kst-srs.v2/SPECIFICATION.md` | `grep -c "kst-srs.v2/SPECIFICATION.md"` | 2 |
| `measure/knowledge-space.md` has no "source of truth" | `grep -ci "source of truth"` | 0 |
| `measure/knowledge-space.md` has the pointer language | `grep -ciE "canonical\|defers\|pointer\|specification"` | 5 |
| `measure/architecture.md` does not name `cloudflare-launch-checklist` | `grep -c` | 0 |
