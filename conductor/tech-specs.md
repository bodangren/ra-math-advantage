# Tech Specs — Integrated Math 3

Scaffolded from `bus-math-v2` (Math for Business Operations). This document describes the actual running tech stack as discovered in the source project.

## Runtime & Framework

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (via `vinext`) | latest |
| Runtime adapter | vinext (Vite-backed Next.js) | ^0.0.5 |
| Build tool | Vite | ^7.3.1 |
| Language | TypeScript (strict) | ^5 |
| React | React 19 | ^19.0.0 |

## Backend & Database

| Layer | Technology | Notes |
|-------|-----------|-------|
| Primary database | Convex | All curriculum, auth, progress, and submission data |
| Convex queries/mutations | `convex/*.ts` | Internal + public functions |
| Convex schema | `convex/schema.ts` | ~302 lines, ~20 tables |
| Server-side Convex client | `lib/convex/server.ts` | `ConvexHttpClient` with admin auth for internal functions |
| Admin auth resolution | `lib/convex/admin.ts` | Reads local admin key or `CONVEX_DEPLOY_KEY` env |

> **Note:** The source project contains legacy Supabase/PostgreSQL code (`lib/supabase/`, `lib/db/`, `drizzle.config.ts`) that is NOT part of the active data path. These are excluded from the scaffold.

## Authentication

Custom JWT-based auth built on top of Convex. No third-party auth provider.

| Component | File | Details |
|-----------|------|---------|
| Session token (JWT) | `lib/auth/session.ts` | HMAC-SHA256 signed, 12-hour TTL |
| Password hashing | `lib/auth/session.ts` | PBKDF2, SHA-256, 120k iterations |
| Server auth helpers | `lib/auth/server.ts` | Cookie-based session reading, role guards |
| Password policy | `lib/auth/password-policy.ts` | Students: 6+ chars; Teachers/Admins: 8+ chars + letter + number |
| Auth constants | `lib/auth/constants.ts` | Cookie name, TTL, alphabet |
| Demo provisioning | `lib/auth/demo-provisioning.ts` | Auto-enabled in dev/test |
| Login API route | `app/api/auth/login/route.ts` | POST, verifies credentials, sets JWT cookie |
| Session API route | `app/api/auth/session/route.ts` | GET, returns user + profile |
| Logout API route | `app/api/auth/logout/route.ts` | POST, clears cookie |
| Change password | `app/api/auth/change-password/route.ts` | POST, validates current, hashes new |
| Client auth context | `components/auth/AuthProvider.tsx` | React context with `signIn`/`signOut`/`loading` |

### Auth flow
1. User submits username + password to `/api/auth/login`
2. Server looks up credential in Convex `auth_credentials` table
3. Verifies password with PBKDF2
4. Signs JWT with claims: `{sub, username, role, organizationId, iat, exp}`
5. Sets httpOnly cookie (`bm_session`)
6. Client `AuthProvider` fetches `/api/auth/session` to hydrate state
7. Server pages call `getServerSessionClaims()` or `requireStudentSessionClaims()` / `requireTeacherSessionClaims()`

### Roles
- `student` — access to `/student/*` routes
- `teacher` — access to `/teacher/*` routes
- `admin` — treated as teacher-compatible

## Styling & UI

| Layer | Technology |
|-------|-----------|
| CSS framework | Tailwind CSS ^3.4.1 |
| Component library | shadcn/ui (new-york style, RSC) |
| Color system | oklch CSS custom properties |
| Dark mode | `next-themes` (class-based) |
| Typography plugin | `@tailwindcss/typography` |
| Animation plugin | `tailwindcss-animate` |
| Icon library | `lucide-react` |
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
| `react-spreadsheet` | Spreadsheet activities |
| `zod` | Schema validation |
| `class-variance-authority` | Component variants |
| `clsx` + `tailwind-merge` | Class name utilities |
| `geist` | Font family |

## Testing

| Tool | Config file | Purpose |
|------|------------|---------|
| Vitest | `vitest.config.ts`, `vitest.setup.ts` | Unit/integration tests |
| Playwright | `playwright.config.ts` | E2E tests |
| Testing Library | `@testing-library/react`, `@testing-library/jest-dom` | Component tests |
| jsdom | `jsdom` | DOM environment for Vitest |

## Environment Variables

```env
# Convex
NEXT_PUBLIC_CONVEX_URL=http://127.0.0.1:3210
CONVEX_DEPLOY_KEY=

# Auth
AUTH_JWT_SECRET=replace-with-a-long-random-secret
```

## Dev Commands

```bash
npm run dev          # Start dev server (vinext dev)
npm run dev:stack    # Start full stack (node scripts/dev-stack.mjs)
npm run build        # Production build (vinext build)
npm run lint         # Lint (vinext lint)
npm run test         # Run Vitest
npm run test:watch   # Vitest in watch mode
```

## Deployment

- Platform: Vercel (primary)
- Convex Cloud or Convex Local for database
- `vinext` handles the Vite-based build pipeline
