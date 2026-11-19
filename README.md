# RA Math Advantage

This monorepo holds the Reading Advantage math course apps and the shared packages that they
use. Each app is a Convex-backed interactive digital textbook. The apps run on vinext (a
Vite-based Next.js App Router) and deploy to Cloudflare Workers.

This README gives the current state first. The section "Planned Direction" gives the
direction of 2026-11-14. Each planned item has the marker `(planned: <track id>)`, and the
track in `measure/tracks/<track id>/` does the work.

## Current State

### Apps

| App | Course | State |
|-----|--------|-------|
| `apps/integrated-math-3/` | Integrated Math 3 (Honors) | Primary course app: 9 modules, 52 lessons |
| `apps/integrated-math-1/` | Integrated Math 1 | Separate app with its own Convex schema, seeds, and skill graph |
| `apps/integrated-math-2/` | Integrated Math 2 | Separate app with its own Convex schema, seeds, and skill graph |
| `apps/pre-calculus/` | AP Precalculus | Separate app with its own Convex schema and skill graph |
| `apps/bus-math-v2/` | Math for Business Operations v2 | Separate app, maintained |

Each app has its own `wrangler.jsonc` and its own design system (`DESIGN.md`).

### Packages

| Package | Contents |
|---------|----------|
| `packages/_template/` | Package scaffold template |
| `packages/activity-components/` | Shared activity components (quiz, blanks, graphing, algebraic, rate of change, discriminant) |
| `packages/activity-runtime/` | Phase types, activity modes, completion tracking |
| `packages/ai-tutoring/` | OpenRouter provider, retry wrapper, lesson context assembly |
| `packages/app-shell/` | Shared auth context, providers, layout, and header components |
| `packages/component-approval/` | Content hashing, review queue assembly |
| `packages/core-auth/` | JWT session, password hashing, demo provisioning |
| `packages/core-convex/` | Convex client config, admin auth, query helpers |
| `packages/efficacy-core/` | Efficacy metrics (retention, time to mastery) |
| `packages/graphing-core/` | Quadratic and linear parsers, canvas utilities |
| `packages/knowledge-space-core/` | Graph schemas, validation, readiness, knowledge state, placement |
| `packages/knowledge-space-practice/` | Blueprints, next-skill planner, projections, misconception loop |
| `packages/lesson-renderer/` | Lesson and textbook rendering components |
| `packages/math-content/` | Problem families, algebraic logic, glossary, knowledge-space tooling |
| `packages/practice-core/` | Practice contract, timing, rating, error analysis |
| `packages/practice-test-engine/` | Shared test types and question utilities |
| `packages/rate-limiter/` | Sliding-window rate limits |
| `packages/srs-engine/` | FSRS scheduler, review processor, queue, adapters |
| `packages/study-hub-core/` | Flashcard and review session primitives, shuffle utilities |
| `packages/teacher-reporting-core/` | Gradebook, course overview, competency heatmap, CSV export |
| `packages/workbook-pipeline/` | Workbook filename, manifest, and path utilities |

Shared packages do not import from `apps/` or `convex/_generated/`.

### Stack

- **Framework:** vinext 0.0.55 with `next` 16.2.7, React 19.2.7, App Router.
- **Backend and database:** Convex 1.40.0. Each app has its own Convex schema.
- **Auth:** the custom JWT username and password auth of `packages/core-auth`. The session
  cookie is `bm_session`, with a TTL of 12 hours, signed with `AUTH_JWT_SECRET`.
- **AI:** `packages/ai-tutoring` calls the OpenRouter API with `OPENROUTER_API_KEY`. The
  default model for development is `openrouter/free`.
- **Skill graph:** each math app has graph files under `curriculum/skill-graph/`. The
  in-repo contract is `kst-srs.v2/SPECIFICATION.md`.
- **UI:** shadcn/ui and Radix UI, Tailwind CSS 4.3.0, Recharts for charts.
- **Tests:** Vitest 4.1.8, Testing Library, Playwright 1.60.0.
- **Lint and types:** ESLint, TypeScript 6.0.3 (strict).
- **Deploy:** Cloudflare Workers through `wrangler` 4.98.0. The Workers
  `integrated-math-3` and `bus-math-v2` exist on workers.dev with no traffic. No deploy has
  run from this repository. `.github/workflows/cloudflare-deploy.yml` is a dispatched
  workflow.

### Features of the IM3 App

- **Phase-based lessons:** typed phases (Explore, Vocabulary, Learn, Key Concept, Worked
  Example, Guided Practice, Independent Practice, Assessment, Discourse, Reflection).
- **Progress tracking:** completion and time for each student and phase.
- **Student dashboard:** course progress, next-lesson recommendations, unit breakdown.
- **Teacher dashboard and gradebook:** organization-scoped roster, unit grid, competency
  tracking.
- **Study Hub:** flashcards, SRS review sessions, matching game, and speed round, with a
  708-term IM3 glossary.
- **Daily practice:** FSRS spaced repetition with a due-card queue, timing baselines, and
  objective proficiency.
- **Practice tests:** module practice tests with question banks and feedback.
- **Roles:** student, teacher, and admin, with organization-scoped data.

### IM3 Curriculum

| Module | Title | Lessons |
|--------|-------|---------|
| 1 | Quadratic Functions and Complex Numbers | 8 |
| 2 | Polynomials and Polynomial Functions | 5 |
| 3 | Polynomial Equations | 5 |
| 4 | Inverses and Radical Functions | 6 |
| 5 | Exponential Functions and Geometric Series | 5 |
| 6 | Logarithmic Functions | 5 |
| 7 | Rational Functions and Equations | 6 |
| 8 | Inferential Statistics | 5 |
| 9 | Trigonometric Functions | 7 |

`measure/product.md` and `apps/integrated-math-3/product.md` give the lesson details.

## Planned Direction

The orchestrator and Daniel set this direction on 2026-11-14. `measure/tracks.md` gives the
track order.

1. **One math app.** `apps/math` holds IM1, IM2, IM3, and AP Precalculus as course data
   (planned: math-app-base_20261114). The course imports move the other three courses in
   (planned: math-app-course-im1_20261114)
   (planned: math-app-course-im2_20261114)
   (planned: math-app-course-precalc_20261114).
   AP Calculus and AP Statistics come later. The old apps retire with no redirects
   (planned: math-app-retire-old-apps_20261114). BM2 stays a separate app.
2. **Danielson app.** `apps/danielson` is in the tree since the merge of 2026-11-16. The app
   holds no code from `hdkwa-danielson`.
3. **Students across years.** One student account and one history across courses and
   years (planned: math-app-student-history_20261114). A license covers one seat for one
   year (planned: math-app-seat-licensing_20261114).
4. **Convex Auth v2.** The math app uses Convex Auth v2 with username and password
   (planned: math-app-base_20261114). BM2 moves to it, and the custom JWT auth retires
   (planned: bm2-convex-auth-v2_20261114).
5. **Graph source.** The skill graph comes from the mastery-advantage repository
   (`github.com/Reading-Advantage-Thailand/mastery-advantage`), with the contract
   kst-srs.v3.2 (planned: kst-srs-v3-2-im3-runtime-migration_20260710, math-graph-consume_20261114).
6. **AI layer.** AI calls go through OpenRouter with `@openrouter/sdk`. Each role has one
   model variable. `openrouter/free` is for development only. Evaluation roles use
   structured output. Prompts contain no PII. Zero data retention applies only where a
   role needs it. Decision models come later
   (planned: openrouter-sdk-ai-layer_20261114).
7. **Toolchain.** vinext 1.x with no `next`, oxlint, oxfmt, and tsrs. The repository is a
   test bed for the Oxc tools.
8. **Deploys.** Cloudflare Workers and Convex, not Vercel. Deploys run locally on this
   machine with the OAuth logins of `wrangler` and `convex`. Deploy keys go through a pipe
   into `wrangler secret put`. The orchestrator runs the prod deploys and the cloud cleanup
   (Daniel, 2026-11-14), and reports each first deploy of an app to the PM
   (planned: prod-deploy-pipeline_20261114).

## Getting Started

### Prerequisites

- Node.js 22 or later (vinext 0.0.55 needs `node >=22`).
- npm.
- Local Convex runtime access through `npx convex ...`.

### Local Development (IM3)

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd ra-math-advantage
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

3. Start Convex locally (from the app folder):
   ```bash
   cd apps/integrated-math-3
   npx convex dev --local --once
   ```

4. Create `.env.local` in `apps/integrated-math-3/`:
   ```env
   AUTH_JWT_SECRET=<long-random-secret>
   ```

   The Convex CLI usually writes `NEXT_PUBLIC_CONVEX_URL` during the local setup. The
   local default is `http://127.0.0.1:3210`.

5. Start the local stack (from `apps/integrated-math-3/`):
   ```bash
   npm run dev:stack
   ```

   Use `npm run dev` only when Convex already runs separately.

6. Open [http://localhost:3000](http://localhost:3000).

### Environment Variables (IM3)

`apps/integrated-math-3/.env.example` lists them:

```env
NEXT_PUBLIC_CONVEX_URL=<your-convex-url>
AUTH_JWT_SECRET=<server-only JWT secret for session cookies>
OPENROUTER_API_KEY=<optional; the chatbot returns 503 when it is not set>
CONVEX_DEPLOY_KEY=<server-only deploy key for cloud Convex calls>
```

Keep `CONVEX_DEPLOY_KEY`, `AUTH_JWT_SECRET`, and `OPENROUTER_API_KEY` server-only. Do not
expose them through `NEXT_PUBLIC_*`.

### Demo Credentials (IM3)

| Role    | Username          | Password    |
|---------|-------------------|-------------|
| Teacher | `teacher@demo`    | `Demo1234!` |
| Student | `student1@demo`   | `Demo1234!` |
| Student | `student2@demo`   | `Demo1234!` |
| Student | `student3@demo`   | `Demo1234!` |
| Student | `student4@demo`   | `Demo1234!` |
| Student | `student5@demo`   | `Demo1234!` |

`convex/seed.ts` makes the demo accounts. Run the seed to make the demo data:

```bash
npx convex run seed:seedAll
```

## Scripts

Run from `apps/integrated-math-3/`:

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the vinext dev server |
| `npm run dev:stack` | Start Convex and the dev server together |
| `npm run build` | Production build |
| `npm run start` | Start the production server |
| `npm run lint` | Run Oxlint |
| `npm run typecheck` | Run the type check (IM3 uses the `tsc` fallback) |
| `npm test` | Run the Vitest suite |
| `npm run test:watch` | Run Vitest in watch mode |
| `npm run test:e2e` | Run the Playwright tests |

Run from the monorepo root:

| Command | Description |
|---------|-------------|
| `npm run ws:im3:lint` | Lint IM3 |
| `npm run ws:im3:test` | Run the IM3 tests |
| `npm run ws:im3:typecheck` | Typecheck IM3 |
| `npm run ws:im3:build` | Build IM3 |
| `npm run ws:bm2:lint` | Lint BM2 |
| `npm run ws:bm2:test` | Run the BM2 tests |
| `npm run ws:bm2:typecheck` | Typecheck BM2 |
| `npm run ws:bm2:build` | Build BM2 |
| `npm run ws:im2:lint` | Lint IM2 |
| `npm run ws:im2:test` | Run the IM2 tests |
| `npm run ws:im2:typecheck` | Typecheck IM2 |
| `npm run ws:im2:build` | Build IM2 |
| `npm run ws:im1:lint` | Lint IM1 |
| `npm run ws:im1:test` | Run the IM1 tests |
| `npm run ws:im1:typecheck` | Typecheck IM1 |
| `npm run ws:im1:build` | Build IM1 |
| `npm run ws:pc:lint` | Lint AP Precalculus |
| `npm run ws:pc:test` | Run the AP Precalculus tests |
| `npm run ws:pc:typecheck` | Typecheck AP Precalculus |
| `npm run ws:pc:build` | Build AP Precalculus |
| `npm run generate` | Generate the Measure facts |
| `npm run doctor` | Run the Measure doctor |

Always run `npm run typecheck` together with `npm run build`, because the vinext build does
not enforce the TypeScript types.

## Documentation

The project documents are in `measure/`:

- `measure/index.md`: the index of the Measure documents.
- `measure/product.md`: the product scope and the shared features.
- `measure/architecture.md`: the architecture of the apps.
- `measure/tech-stack.md`: the technology choices.
- `measure/workflow.md`: the development workflow and the quality gates.
- `measure/tracks.md`: the active and completed tracks.

## Contributing

All work runs through Measure tracks (spec-driven development). Each phase ends with a
checkpoint, and each track ends with a sync with origin. `AGENTS.md` gives the rules for AI
agents.

## License Facts

- The curriculum content is reproducible material from various publishers (Daniel,
  2026-11-14).
- The repository stays public (Daniel, 2026-11-14: "Public is fine.").
- The school holds the license of the Danielson Framework that `apps/danielson` will show
  (Daniel, 2026-11-14: "Yes. We have that through the school.").

## License

Proprietary - All rights reserved
