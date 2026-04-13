# Integrated Math 3 (Honors)

A Convex-backed interactive digital textbook for high school Integrated Math 3. The app runs on Vinext/App Router with custom JWT username/password auth. Built as a reusable course template adapted from the [Bus Math v2](../bus-math-v2) codebase.

## Template Intent

This project doubles as a **course template**: Next.js App Router + Convex backend + simple username/password JWT auth. The curriculum, activities, and content are course-specific, but the platform scaffolding (auth, progress tracking, teacher tools, student dashboard) is designed to be reusable across courses.

## Features

- **Phase-Based Lessons**: Flexible typed phase system (Explore, Vocabulary, Learn, Key Concept, Worked Example, Guided Practice, Independent Practice, Assessment, Discourse, Reflection)
- **Progress Tracking**: Per-student, per-phase completion with time tracking
- **Student Dashboard**: Course progress, next-lesson recommendations, unit-by-unit breakdown
- **Teacher Dashboard**: Organization-scoped student roster with progress and analytics
- **Gradebook**: Unit-level grid with per-student, per-lesson progress and competency tracking
- **Competency Standards**: Activities linked to math standards with mastery tracking
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

| Role    | Username       | Password |
|---------|----------------|----------|
| Teacher | `demo_teacher` | `demo123` |
| Student | `demo_student` | `demo123` |

Demo accounts are for local development and test environments only.

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- Local Convex runtime access via `npx convex ...`

### Local Development

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd integrated-math-3
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start Convex locally:
   ```bash
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

6. Start the local stack:
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
integrated-math-3/
├── app/              # Next.js App Router pages and API routes
├── components/       # React components
│   ├── auth/         # AuthProvider (React context)
│   ├── ui/           # shadcn/ui components
│   ├── student/      # Student-facing components
│   ├── teacher/      # Teacher-facing components
│   ├── lesson/       # Lesson rendering (PhaseRenderer, LessonStepper, etc.)
│   ├── activities/   # Interactive activity components (graphing, algebraic)
│   └── dev/          # Developer-only review queue and harnesses
├── convex/           # Convex schema, queries, mutations, seeds
├── lib/
│   ├── auth/         # JWT session helpers and role guards
│   ├── convex/       # Convex client config and server helpers
│   ├── activities/   # Activity registry, schemas, content hashing
│   └── curriculum/   # Phase types, lesson helpers
├── hooks/            # Custom React hooks
├── types/            # Shared TypeScript types
├── conductor/        # Spec-driven development docs (Conductor)
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

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vinext dev server |
| `npm run dev:stack` | Start Convex + dev server together |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run Vitest suite |
| `npm run test:watch` | Vitest in watch mode |

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
