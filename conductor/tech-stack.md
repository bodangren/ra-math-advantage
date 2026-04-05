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
| Component library | shadcn/ui (new-york style, RSC) |
| Color system | oklch CSS custom properties |
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
| `recharts` | Data visualization (charts) |
| `@hello-pangea/dnd` | Drag-and-drop activities |
| `zod` ^4 | Schema validation |
| `class-variance-authority` | Component variants |
| `clsx` + `tailwind-merge` | Class name utilities |

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
