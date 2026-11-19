# Tech Stack — RA Math Advantage

Scaffolded from `bus-math-v2` (Math for Business Operations). Use the app package file for current dependency ranges.

This document gives the current state, with the versions of `package-lock.json`. A
direction item of 2026-11-14 has the marker `(planned: <track id>)`. The file paths below
are paths of the IM3 app (`apps/integrated-math-3`).

## Runtime & Framework

| Layer | Technology | Version | Rationale |
|-------|-----------|---------|-----------|
| Framework | Next.js (via `vinext`) | ^16.0.0 | App Router, RSC, server components |
| Runtime adapter | vinext (Vite-backed Next.js) | ^0.0.55 | Faster dev builds via Vite |
| Build tool | Vite | ^8.0.0 | vinext's underlying bundler |
| Language | TypeScript (strict) | ^6 | Type safety across full stack |
| React | React 19 | ^19.2.9 | Latest features, RSC support |
| Node.js | Node.js | 22 or later | vinext 0.0.55 needs `node >=22` |

Planned: vinext 1.x with no `next` package, oxfmt, and tsrs as the type-check gate. Oxlint is already in use (planned: vinext-oxc-toolchain_20261114).

Note (2026-11-14, Phase S1 of `vinext-oxc-toolchain_20261114`): the stack changes before
the work starts, as workflow principle 2 requires. Phase S1 moves every app to vinext
^1.4.5, Vite ^8, and React ^19.3.1. Phase S1 removes the `next` package from every
manifest. The types of the `next` and `next/*` modules come from `vinext/types`, which
loads `@vinext/types`. CI uses Node 24. vinext 1.4.5 needs Node 22 or later. The versions
in the table above stay as they are until the end of the phase, and Phase S5 sets the
final versions.

## Backend & Database

| Layer | Technology | Notes |
|-------|-----------|-------|
| Database | Convex | All curriculum, auth, progress, and submission data |
| Convex schema | `convex/schema.ts` | See the schema for the current tables |
| Public queries | `convex/public.ts` | Unauthenticated curriculum data |
| Internal queries | `convex/student.ts`, `convex/teacher.ts`, `convex/activities.ts` | Require server-side admin auth |
| Server-side client | `lib/convex/server.ts` | `ConvexHttpClient` with admin auth |
| Admin auth resolution | `lib/convex/admin.ts` | Local admin key or `CONVEX_DEPLOY_KEY` env |
| Generated types | `convex/_generated/` | Generated Convex API and data model types. Keep these files aligned with the backend. |

Planned: one Convex backend for the math app, with the `convex` package at 1.50 or later (planned: math-app-base_20261114).

## Authentication

Custom JWT-based auth built on Convex, from `packages/core-auth`. No third-party auth provider.

| Component | File | Details |
|-----------|------|---------|
| JWT signing/verification | `lib/auth/session.ts` (re-exports `packages/core-auth`) | HMAC-SHA256, 12-hour TTL, cookie `bm_session` |
| Password hashing | `lib/auth/session.ts` (re-exports `packages/core-auth`) | PBKDF2, SHA-256, 120k iterations |
| Server auth helpers | `lib/auth/server.ts` | Cookie-based session, role guards |
| Password policy | `lib/auth/password-policy.ts` | Role-specific requirements |
| Client auth context | `components/auth/AuthProvider.tsx` (re-exports `packages/app-shell`) | React context with signIn/signOut |

Planned: Convex Auth v2 (`@convex-dev/auth` 2.x) with username and password replaces the
custom JWT auth in the math app and in BM2 (planned: math-app-base_20261114)
(planned: bm2-convex-auth-v2_20261114).

## AI

| Layer | Technology | Notes |
|-------|-----------|-------|
| Provider | OpenRouter API through `fetch` | `packages/ai-tutoring/src/providers.ts` |
| Key | `OPENROUTER_API_KEY` | Server-only; the chatbot returns 503 when it is not set |
| Default model | `openrouter/free` | `OPENROUTER_MODEL` can change it |

Planned: `@openrouter/sdk`, one model variable for each role with no default,
`openrouter/free` for development only, structured output for the evaluation roles, and no
PII in prompts (planned: openrouter-sdk-ai-layer_20261114).

## Styling & UI

| Layer | Technology |
|-------|-----------|
| CSS framework | Tailwind CSS ^4.0.0 |
| Component library | shadcn/ui (new-york style, RSC) — installed: `button`, `dropdown-menu`, `avatar` |
| Color system | oklch CSS custom properties — brand orange (hue 40), teal accent (hue 195) |
| Dark mode | next-themes (class-based) |
| Typography | @tailwindcss/typography |
| Animation | tailwindcss-animate |
| Icons | lucide-react |
| Display font | Lora (serif) |
| Body font | DM Sans (sans) |
| Mono font | Fira Code |

## Key Dependencies

| Package | Purpose |
|---------|---------|
| `convex` | Database, real-time queries, internal functions |
| `react-markdown` + `remark-gfm` | Markdown rendering in lesson content |
| `recharts` | Data visualization (charts) - NOT used for graphing activities |
| `@hello-pangea/dnd` | Drag-and-drop activities |
| `zod` ^4 | Schema validation |
| `ts-fsrs` 5.4.1 | FSRS scheduler (through `packages/srs-engine`) |
| `class-variance-authority` | Component variants |
| `clsx` + `tailwind-merge` | Class name utilities |

## Graphing Canvas (2026-04-10)

**Decision:** Custom SVG-based coordinate plane for interactive graphing activities

**Rationale:**
- Recharts is designed for data visualization, not interactive coordinate planes
- Custom SVG provides full control over: click detection, point placement, snap-to-grid, parameter sliders
- Direct React + SVG implementation is simpler than extending Recharts for these use cases
- Better performance for real-time updates in Explore mode (parameter sliders)
- Easier to implement touch interaction for mobile devices

**Implementation:**
- `components/activities/graphing/GraphingCanvas.tsx` - Core coordinate plane with SVG
- Event handlers for click/tap to place/remove points
- Math utilities for function plotting and coordinate transformation
- Recharts remains available for future data visualization needs (charts, graphs)

## Shared Business Logic (`lib/`)

| Module | File | Purpose |
|--------|------|---------|
| Progress utilities | `lib/progress/published-curriculum.ts` | Phase/lesson progress row assembly, snapshot building |
| Student dashboard | `lib/student/dashboard.ts` | `buildStudentDashboardViewModel` |
| Student dashboard UI | `lib/student/dashboard-presentation.ts` | Status badge helpers |
| Lesson runtime | `lib/student/lesson-runtime.ts` | `resolveLessonLandingPhase`, `buildLessonContinueState` |
| Gradebook logic | `lib/teacher/gradebook.ts` | `assembleGradebookRows`, cell color computation |
| Course overview logic | `lib/teacher/course-overview.ts` | `assembleCourseOverviewRows` |
| Practice contract | `lib/practice/contract.ts` | `practice.v1` zod schema and types |
| Error analysis | `lib/practice/error-analysis/index.ts` | `buildDeterministicSummary` for teacher review |

## Testing

| Tool | Purpose |
|------|---------|
| Vitest ^4 + `@vitest/coverage-v8` | Unit/integration tests (jsdom environment) and reproducible package coverage gates |
| Playwright ^1.56 | E2E tests |
| Testing Library | Component tests (React) |
| @testing-library/jest-dom | DOM matchers |
| oxlint | Lint (`oxlint --config .oxlintrc.json --max-warnings 0`) |

## Monorepo Quality Tooling

| Surface | Command | Contract |
|---|---|---|
| Package lint | `npm run lint` | Runs the manifest-declared lint command for all 20 packages |
| Package tests | `npm run test` | Runs the manifest-declared test command for all 20 packages |
| Package types | `npm run typecheck` | Runs standalone TypeScript checks for all 20 packages |
| Package builds | `npm run build` | Runs every supported package build capability |
| Boundaries | `node scripts/check-monorepo-boundaries.mjs` | Validates imports, exports, dependency declarations, layers, domains, and cycles |
| Inventory parity | `node scripts/architecture/check-quality-parity.mjs` | Requires manifest, root commands, and CI matrices to cover the same 26 workspaces |
| Generated facts | `npm run generate` | Writes deterministic DAG, ownership, exports, and gate reports |
| Architecture doctor | `npm run doctor` | Checks report freshness and the live repository boundary contract |

CI runs lint, test, and typecheck for all 20 packages. App jobs remain separate,
while the boundary job blocks drift between the manifest, root commands, and
the CI matrix.

## Static Analysis

The repository uses Oxlint 1.79.0 as the standard lint engine. The root
`.oxlintrc.json` file defines the ESLint-compatible policy for six apps and 20
packages. The policy keeps native Oxlint rules where behavior matches and uses
JavaScript plugins only where the migration contract requires them.

The compatibility plugins are temporary adapters for verified rule gaps. The
track does not add type-aware Oxlint or `oxlint-tsgolint`. TypeScript uses the
separate blocking `tsc --noEmit` gate. A root ESLint package can remain only as
a peer resolution required by an approved compatibility plugin. It cannot be a
root dependency or override, and no command can execute its binary or API.

Run `npm run lint` for the governed workspace lint gate. Run
`npm run lint:anti-slop` for the separate generic anti-slop gate. The
anti-slop configuration is `oxlint.anti-slop.config.ts` and contains 15
generic rules. The generic plugin is enabled without the optional Effect rule
group because no workspace declares a direct `effect` dependency.

### S2 lint contract (2026-11-18, `vinext-oxc-toolchain_20261114`)

The S2 task records the lint change of this track. The root `package.json`
declares `oxlint` `^1.79.0` in `devDependencies`. The installed version is
1.93.0. No other manifest declares `oxlint` or an `oxlint` plugin.

The tree has one `.oxlintrc.json`, at the root. No `eslint.config.*` file is
tracked. No second `.oxlintrc.json` exists outside `node_modules`. The config
uses native oxlint rules and three `jsPlugins` compatibility adapters:
`oxlint-plugin-eslint`, `eslint-plugin-react`, and `eslint-plugin-react-hooks`.
The adapters are the r6 exception of strategy section 14.2. Do not remove them
or their `jsPlugins` entries.

The app lint script is `oxlint --config ../../.oxlintrc.json . --max-warnings 0`.
The package lint script is `oxlint --config ../../.oxlintrc.json src --max-warnings 0`.
26 of the 27 workspace lint scripts name `../../.oxlintrc.json`.
`packages/_template` keeps its `echo` line.

Open: no ESLint config remains. No ESLint "before" lint timing can run. The S2
Verify task fills the "before" cell of the lint row in evidence section 5.

### S3 type-check contract (2026-11-19, `vinext-oxc-toolchain_20261114`)

The S3 task records the type-check change of this track. The root
`package.json` declares `typescript` `^7.0.2` in `devDependencies` and in
`overrides`. The root declares `tsrs` `0.25.0-ts7.1.0-beta` (exact) in
`devDependencies` only. No workspace manifest declares `tsrs`.

Final state (2026-11-19): the root declares no `typescript` and no `overrides` entry. The root holds the `typescript6` and `@typescript/native` aliases. BM2, IM1, IM3, and PreCalc keep `tsc --noEmit` in `TSC_FALLBACK_LIST`. The other 23 workspaces run tsrs.

tsrs `0.25.0-ts7.1.0-beta` uses the TypeScript 7.1.0-beta compiler line.
The kept `typescript` package uses 7.0.2.

The app typecheck script is `TSRS_FAST=1 oxlint --config ../../.oxlintrc.json --type-aware --type-check --max-warnings 0 .`.
The package typecheck script is the same command with `src` in place of `.`.
Each package `build` script that is `tsc --noEmit` now becomes `npm run typecheck`.
bus-math-v2 gets the app typecheck script. Each CI typecheck step becomes
`npm run typecheck --workspace=<app folder>`.

The oxlint type-check gate runs with `TSRS_FAST=1`. When oxlint reports that
`--type-aware` needs `oxlint-tsgolint`, the root `devDependencies` add
`oxlint-tsgolint` `^7.0.2007`, and evidence section 8 records it.

### S4 format contract (2026-11-19, `vinext-oxc-toolchain_20261114`)

The S4 task records the format change of this track. The root `package.json`
will declare `oxfmt` `0.78.0` (exact) in `devDependencies`. The registry latest
is `0.79.0` (`npm view oxfmt version`, checked 2026-11-19). No other manifest
declares `oxfmt`.

The repository uses the default oxfmt style. The root `.oxfmtrc.json` holds
`$schema` and `ignorePatterns` only. It holds no style option. The root scripts
are `"format": "oxfmt"` and `"format:check": "oxfmt --check"`. The
`format:check` script is the format gate. The format-only commit
`style: format the repo with oxfmt` goes in `.git-blame-ignore-revs`, so blame
skips it.

## Environment Variables

`apps/integrated-math-3/.env.example`:

```env
NEXT_PUBLIC_CONVEX_URL=http://127.0.0.1:3210
AUTH_JWT_SECRET=replace-with-a-long-random-secret
OPENROUTER_API_KEY=
# OPENROUTER_MODEL=openrouter/free
# OPENROUTER_API_BASE=https://openrouter.ai/api/v1
# NEXT_PUBLIC_SITE_URL=http://localhost:3000
# CONVEX_DEPLOY_KEY=
```

## Dev Commands

```bash
npm run dev          # Start dev server (vinext dev)
npm run dev:stack    # Start full stack (convex + dev server)
npm run build        # Production build (vinext build)
npm run lint         # Lint (Oxlint)
npm run typecheck    # Type check (tsc --noEmit)
npm run test         # Run Vitest
npm run test:watch   # Vitest in watch mode
```

## Deployment

- Platform: Cloudflare Workers through vinext
- Database: Convex Cloud or Convex Local
- Build: vinext handles the Vite-based pipeline

## Business Math development

Use `apps/bus-math-v2/DEVELOPMENT.md` for Business Math setup, resource storage, verification, and Cloudflare deployment. This app uses the same Convex and cookie-session architecture. Its teacher resources stay outside the public asset directory.

Planned: local deploys with the OAuth logins of `wrangler` and `convex`, with a smoke test and a rollback (planned: prod-deploy-pipeline_20261114).
