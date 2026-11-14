# Tech Stack — RA Math Advantage

Scaffolded from `bus-math-v2` (Math for Business Operations). The stack is fully active with no legacy layers in the data path.

This document gives the current state, with the versions of `package-lock.json`. A
direction item of 2026-11-14 has the marker `(planned: <track id>)`. The file paths below
are paths of the IM3 app (`apps/integrated-math-3`).

## Runtime & Framework

| Layer | Technology | Version | Rationale |
|-------|-----------|---------|-----------|
| Framework | Next.js App Router API (via `vinext`) | `next` 16.2.7 | App Router, RSC, server components |
| Runtime adapter | vinext (Vite-backed Next.js) | 0.0.55 | Faster dev builds via Vite |
| Build tool | Vite | 8.0.16 | vinext's underlying bundler |
| Language | TypeScript (strict) | 6.0.3 | Type safety across full stack |
| React | React 19 | 19.2.7 | Latest features, RSC support |
| Node.js | Node.js | 22 or later | vinext 0.0.55 needs `node >=22` |

Planned: vinext 1.x with no `next` package, oxlint instead of ESLint, oxfmt, and tsrs as
the type-check gate. The repository is a test bed for the Oxc tools
(planned: vinext-oxc-toolchain_20261114).

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
| Database | Convex 1.40.0 | All curriculum, auth, progress, and submission data |
| Convex schema | `convex/schema.ts` | 41 tables (IM3) |
| Public queries | `convex/public.ts` | Unauthenticated curriculum data |
| Internal queries | `convex/student.ts`, `convex/teacher.ts`, `convex/activities.ts` | Require server-side admin auth |
| Server-side client | `lib/convex/server.ts` | `ConvexHttpClient` with admin auth |
| Admin auth resolution | `lib/convex/admin.ts` | Local admin key or `CONVEX_DEPLOY_KEY` env |
| Generated types | `convex/_generated/` | Committed. `npx convex dev` regenerates them. |

Planned: one Convex backend for the math app, with the `convex` package at 1.50 or later
(planned: math-app-base_20261114).

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
| CSS framework | Tailwind CSS 4.3.0 (`@tailwindcss/postcss`) |
| Component library | shadcn/ui (new-york style, RSC) with Radix UI primitives |
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
| Vitest 4.1.8 | Unit/integration tests (jsdom environment) |
| Playwright 1.60.0 | E2E tests |
| Testing Library | Component tests (React) |
| @testing-library/jest-dom | DOM matchers |
| ESLint | Lint (`eslint . --max-warnings 0`) |

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
npm run lint         # Lint (eslint . --max-warnings 0)
npm run typecheck    # Type check (tsc --noEmit)
npm run test         # Run Vitest
npm run test:watch   # Vitest in watch mode
```

## Deployment

- Platform: Cloudflare Workers through `wrangler` 4.98.0. Each app has a `wrangler.jsonc`.
  The Workers `integrated-math-3` and `bus-math-v2` exist on workers.dev with no traffic,
  and no deploy has run from this repository.
- Database: Convex Cloud or Convex Local.
- Build: vinext handles the Vite-based pipeline.
- Planned: local deploys with the OAuth logins of `wrangler` and `convex`, with a smoke test
  and a rollback, run by the orchestrator. Not Vercel
  (planned: prod-deploy-pipeline_20261114).
