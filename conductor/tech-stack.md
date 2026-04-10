# Tech Stack — Integrated Math 3

Scaffolded from `bus-math-v2` (Math for Business Operations). The stack is fully active with no legacy layers in the data path.

## Runtime & Framework

| Layer | Technology | Version | Rationale |
|-------|-----------|---------|-----------|
| Framework | Next.js (via `vinext`) | latest | App Router, RSC, server components |
| Runtime adapter | vinext (Vite-backed Next.js) | ^0.0.5 | Faster dev builds via Vite |
| Build tool | Vite | ^7.3.1 | vinext's underlying bundler |
| Language | TypeScript (strict) | ^5 | Type safety across full stack |
| React | React 19 | ^19.0.0 | Latest features, RSC support |

## Backend & Database

| Layer | Technology | Notes |
|-------|-----------|-------|
| Database | Convex | All curriculum, auth, progress, and submission data |
| Convex schema | `convex/schema.ts` | ~228 lines, 15 tables |
| Public queries | `convex/public.ts` | Unauthenticated curriculum data |
| Internal queries | `convex/student.ts`, `convex/teacher.ts`, `convex/activities.ts` | Require server-side admin auth |
| Server-side client | `lib/convex/server.ts` | `ConvexHttpClient` with admin auth |
| Admin auth resolution | `lib/convex/admin.ts` | Local admin key or `CONVEX_DEPLOY_KEY` env |
| Generated types | `convex/_generated/` | **Empty until `npx convex dev` is run.** Must be initialized before pages resolve `@/convex/_generated/api`. |

## Authentication

Custom JWT-based auth built on Convex. No third-party auth provider.

| Component | File | Details |
|-----------|------|---------|
| JWT signing/verification | `lib/auth/session.ts` | HMAC-SHA256, 12-hour TTL |
| Password hashing | `lib/auth/session.ts` | PBKDF2, SHA-256, 120k iterations |
| Server auth helpers | `lib/auth/server.ts` | Cookie-based session, role guards |
| Password policy | `lib/auth/password-policy.ts` | Role-specific requirements |
| Client auth context | `components/auth/AuthProvider.tsx` | React context with signIn/signOut |

## Styling & UI

| Layer | Technology |
|-------|-----------|
| CSS framework | Tailwind CSS ^3.4.1 |
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
| Vitest ^4 | Unit/integration tests (jsdom environment) |
| Playwright ^1.56 | E2E tests |
| Testing Library | Component tests (React) |
| @testing-library/jest-dom | DOM matchers |

## Environment Variables

```env
NEXT_PUBLIC_CONVEX_URL=http://127.0.0.1:3210
CONVEX_DEPLOY_KEY=
AUTH_JWT_SECRET=replace-with-a-long-random-secret
```

## Dev Commands

```bash
npm run dev          # Start dev server (vinext dev)
npm run dev:stack    # Start full stack (convex + dev server)
npm run build        # Production build (vinext build)
npm run lint         # Lint (vinext lint)
npm run test         # Run Vitest
npm run test:watch   # Vitest in watch mode
```

## Deployment

- Platform: Vercel (primary)
- Database: Convex Cloud or Convex Local
- Build: vinext handles the Vite-based pipeline
