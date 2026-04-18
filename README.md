# Integrated Math 3 (Honors)

A Convex-backed interactive digital textbook for high school Integrated Math 3. The app runs on Vinext/App Router with custom JWT username/password auth. Built as a reusable course template adapted from the [Bus Math v2](apps/bus-math-v2) codebase.

## Monorepo Structure

This repo uses npm workspaces. The IM3 app lives in `apps/integrated-math-3/` and shared packages will live in `packages/`. Conductor planning docs remain at the repo root in `conductor/`.

```
ra-integrated-math-3/          # Monorepo root
├── apps/
│   ├── integrated-math-3/     # The IM3 application
│   └── bus-math-v2/           # Business Math v2 (reference and migration source)
├── packages/
│   ├── _template/              # Package scaffold template
│   ├── activity-runtime/       # Phase types, activity modes, completion tracking
│   ├── component-approval/     # Content hashing, review queue assembly
│   ├── core-auth/              # JWT session, password hashing, demo provisioning
│   ├── core-convex/            # Convex client config, admin auth, query helpers
│   ├── graphing-core/          # Quadratic/linear parsers, canvas utilities
│   ├── practice-core/          # Practice contract, timing, rating, error analysis
│   └── srs-engine/             # FSRS scheduler, review processor, queue, adapters
├── conductor/                  # Spec-driven development docs
└── README.md
```

## Template Intent

This project doubles as a **course template**: Next.js App Router + Convex backend + simple username/password JWT auth. The curriculum, activities, and content are course-specific, but the platform scaffolding (auth, progress tracking, teacher tools, student dashboard) is designed to be reusable across courses.

## Features

- **Phase-Based Lessons**: Flexible typed phase system (Explore, Vocabulary, Learn, Key Concept, Worked Example, Guided Practice, Independent Practice, Assessment, Discourse, Reflection)
- **Progress Tracking**: Per-student, per-phase completion with time tracking
- **Student Dashboard**: Course progress, next-lesson recommendations, unit-by-unit breakdown
- **Teacher Dashboard**: Organization-scoped student roster with progress and analytics
- **Gradebook**: Unit-level grid with per-student, per-lesson progress and competency tracking
- **Competency Standards**: Activities linked to math standards with mastery tracking
- **Study Hub**: Flashcards, SRS review sessions, matching game, and speed round game using a 708-term IM3 glossary
- **Daily Practice SRS**: FSRS-powered spaced repetition with due card queue, timing baselines, and objective proficiency measurement
- **Practice Tests**: Module-level practice tests with question banks, score persistence, and post-answer feedback
- **Custom Auth**: JWT-based username/password authentication with role-based access (student/teacher/admin)
- **Multi-Tenant**: Organization-scoped data isolation

## Curriculum

9 modules covering the full Integrated Math 3 (Honors) scope:

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

See `conductor/product.md` for the full lesson-by-lesson breakdown with learning objectives.

## Demo Credentials

| Role    | Username          | Password    |
|---------|-------------------|-------------|
| Teacher | `teacher@demo`    | `Demo1234!` |
| Student | `student1@demo`   | `Demo1234!` |
| Student | `student2@demo`   | `Demo1234!` |
| Student | `student3@demo`   | `Demo1234!` |
| Student | `student4@demo`   | `Demo1234!` |
| Student | `student5@demo`   | `Demo1234!` |

Demo accounts are seeded via `convex/seed.ts`. Run the seed action to create demo data.

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- Local Convex runtime access via `npx convex ...`

### Local Development

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd ra-integrated-math-3
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start Convex locally (from the app directory):
   ```bash
   cd apps/integrated-math-3
   npx convex dev --local --once
   ```

4. Copy the environment template:
   ```bash
   cp .env.example .env.local
   ```

5. Configure `.env.local`:
   ```env
   AUTH_JWT_SECRET=<long-random-secret>
   ```

   `NEXT_PUBLIC_CONVEX_URL` is typically written by the Convex CLI during local setup. The local default is `http://127.0.0.1:3210`.

6. Start the local stack (from `apps/integrated-math-3/`):
   ```bash
   npm run dev:stack
   ```

   Use `npm run dev` only when Convex is already running separately.

7. Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

```env
NEXT_PUBLIC_CONVEX_URL=<your-convex-url>
CONVEX_DEPLOY_KEY=<server-only deploy key for cloud Convex calls>
AUTH_JWT_SECRET=<server-only JWT secret for session cookies>
```

Keep `CONVEX_DEPLOY_KEY` and `AUTH_JWT_SECRET` server-only. Never expose via `NEXT_PUBLIC_*`.

## Project Structure

```
apps/integrated-math-3/
├── app/              # Next.js App Router pages and API routes
├── components/       # React components
│   ├── auth/         # AuthProvider (React context)
│   ├── ui/           # shadcn/ui components
│   ├── student/      # Student-facing components (PracticeTestEngine, StudyHub, MatchingGame, etc.)
│   ├── teacher/      # Teacher-facing components
│   ├── lesson/       # Lesson rendering (PhaseRenderer, LessonStepper, etc.)
│   ├── activities/   # Activity components (graphing, algebraic, quiz, blanks, roc, discriminant)
│   └── dev/          # Developer-only review queue and harnesses
├── convex/           # Convex schema, queries, mutations, seeds
│   └── seed/         # Seed data types, utils, and entry point
├── lib/
│   ├── auth/         # JWT session helpers and role guards
│   ├── convex/       # Convex client config and server helpers
│   ├── activities/   # Activity registry, schemas, content hashing
│   ├── practice/     # Proficiency logic, objective policy, error analysis re-exports
│   ├── practice-tests/ # Practice test types, question banks, module configs
│   ├── srs/          # Convex-backed SRS adapters (card store, review log, session store)
│   ├── teacher/      # Gradebook and course overview pure logic
│   ├── study/        # Glossary, SRS utilities, types
│   └── curriculum/   # Phase types, lesson helpers
├── hooks/            # Custom React hooks
├── types/            # Shared TypeScript types
└── public/           # Static assets
```

## Tech Stack

- **Framework**: Vinext (Vite-backed Next.js) + React 19 App Router
- **Backend / Database**: Convex
- **Authentication**: Custom JWT username/password (no third-party provider)
- **UI Components**: shadcn/ui + Radix UI
- **Styling**: Tailwind CSS with oklch color system
- **Charts**: Recharts
- **Testing**: Vitest + Testing Library + Playwright
- **TypeScript**: Strict mode

## Scripts

Run from `apps/integrated-math-3/`:

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vinext dev server |
| `npm run dev:stack` | Start Convex + dev server together |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run Vitest suite |
| `npm run test:watch` | Vitest in watch mode |

Or from the monorepo root:

| Command | Description |
|---------|-------------|
| `npm run ws:im3:lint` | Lint IM3 |
| `npm run ws:im3:test` | Run IM3 tests |
| `npm run ws:im3:typecheck` | Typecheck IM3 |
| `npm run ws:im3:build` | Build IM3 |

## Documentation

Canonical project docs live in `conductor/`:

- `conductor/product.md` — Product scope, curriculum, and feature definitions
- `conductor/architecture.md` — Backend/frontend architecture reference
- `conductor/tech-stack.md` — Technology choices and rationale
- `conductor/tech-specs.md` — Technical specifications
- `conductor/workflow.md` — Development workflow and quality gates
- `conductor/tracks.md` — Active and completed implementation tracks

## Contributing

This project uses the Conductor skill for spec-driven development. See `AGENTS.md` for AI agent guidelines and `CLAUDE.md` for the entry point.

## License

Proprietary - All rights reserved
