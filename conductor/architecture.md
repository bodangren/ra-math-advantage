# Architecture — Integrated Math 3

Scaffolded from `bus-math-v2`. This document describes the code architecture, auth flow, routing, and course page structure.

## Directory Structure

```
integrated-math-3/
├── app/                        # Next.js App Router pages
│   ├── layout.tsx              # Root layout (providers: Convex → Auth → Theme)
│   ├── page.tsx                # Landing page (public)
│   ├── globals.css             # Tailwind + oklch CSS custom properties
│   ├── auth/                   # Auth pages
│   │   ├── login/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   ├── update-password/page.tsx
│   │   ├── confirm/page.tsx
│   │   └── error/page.tsx
│   ├── api/                    # Next.js API routes
│   │   └── auth/               # Auth endpoints (login, logout, session, change-password)
│   ├── curriculum/             # Public curriculum overview
│   ├── student/                # Student-facing pages (protected)
│   │   ├── page.tsx            # Redirects to /student/dashboard
│   │   ├── dashboard/page.tsx  # Student dashboard with unit/lesson progress
│   │   └── lesson/[lessonSlug]/ # Lesson viewer with phase navigation
│   ├── teacher/                # Teacher-facing pages (protected)
│   │   ├── dashboard/page.tsx
│   │   ├── gradebook/
│   │   ├── students/
│   │   └── units/
│   ├── admin/                  # Admin pages (protected)
│   │   └── dashboard/
│   └── settings/page.tsx       # User settings (change password, etc.)
├── components/
│   ├── auth/                   # AuthProvider (React context)
│   ├── activities/             # Activity components (domain-specific, NOT scaffolded)
│   ├── lesson/                 # Lesson rendering (shared, reusable)
│   ├── student/                # Student-facing UI components
│   ├── teacher/                # Teacher-facing UI components
│   ├── dashboard/              # Dashboard shared components
│   ├── ui/                     # shadcn/ui components (generated)
│   ├── ConvexClientProvider.tsx # Convex client provider
│   ├── header-simple.tsx       # Site header with navigation
│   ├── footer.tsx              # Site footer
│   ├── login-form.tsx          # Login form with demo accounts
│   ├── user-menu.tsx           # User dropdown menu
│   └── theme-switcher.tsx      # Dark/light mode toggle
├── convex/                     # Convex backend functions
│   ├── schema.ts               # Database schema (~20 tables)
│   ├── auth.ts                 # Auth credential CRUD
│   ├── public.ts               # Public queries (curriculum stats, units)
│   ├── student.ts              # Student queries (dashboard, progress, phase completion)
│   ├── teacher.ts              # Teacher queries (dashboard, gradebook, student details)
│   ├── activities.ts           # Activity CRUD, spreadsheet ops, submissions
│   ├── practice_submission.ts  # Practice submission envelope validator
│   ├── dashboardHelpers.ts     # Shared helper functions
│   └── seed.ts                 # Database seeding
├── lib/                        # Shared libraries
│   ├── auth/                   # Auth utilities
│   ├── convex/                 # Convex client config, server helpers
│   ├── curriculum/             # Curriculum presentation, standards
│   ├── student/                # Student dashboard, navigation, lesson runtime
│   ├── teacher/                # Teacher tools (gradebook, course overview)
│   ├── progress/               # Progress tracking
│   ├── phase-completion/       # Phase completion client
│   ├── practice/               # Practice engine, error analysis
│   ├── activities/             # Activity registry, spreadsheet validation
│   ├── api/                    # API client utilities
│   ├── assessments/            # Assessment utilities
│   └── utils.ts                # cn() helper
├── hooks/                      # Custom React hooks
├── types/                      # Shared TypeScript types
└── public/                     # Static assets
```

## Provider Hierarchy

The root layout wraps children in this order:

```
<html>
  <body>
    <ConvexClientProvider>
      <AuthProvider>
        <ThemeProvider>          {/* next-themes, class-based */}
          <HeaderSimple />
          <main>{children}</main>
          <Footer />
        </ThemeProvider>
      </AuthProvider>
    </ConvexClientProvider>
  </body>
</html>
```

- **ConvexClientProvider** — Creates `ConvexReactClient` using `getConvexUrl()`, wraps children in `<ConvexProvider>`
- **AuthProvider** — Client component; fetches `/api/auth/session` on mount; exposes `{user, profile, loading, signIn, signOut}`
- **ThemeProvider** — next-themes with `attribute="class"`, `defaultTheme="system"`

## Authentication Architecture

### Custom JWT Auth (No third-party provider)

Auth is fully self-contained using Convex as the credential store and Web Crypto API for hashing/signing.

### Data Model

```
organizations → profiles → auth_credentials
                      ↕
                 class_enrollments ← classes
```

- **organizations**: Multi-tenant grouping
- **profiles**: User profiles with role (student/teacher/admin)
- **auth_credentials**: Username, hashed password, salt, iterations, linked to profile
- **classes** / **class_enrollments**: Teacher creates classes, enrolls students

### Password Hashing

```
PBKDF2(password, salt, 120000 iterations, SHA-256) → base64url-encoded 256-bit hash
```

### JWT Session

```
Header:  {alg: "HS256", typ: "JWT"}
Payload: {sub: profileId, username, role, organizationId, iat, exp}
Signature: HMAC-SHA256(header.payload, AUTH_JWT_SECRET)
```

- Cookie name: `bm_session`
- TTL: 12 hours
- Flags: httpOnly, secure (production), sameSite=lax

### API Endpoints

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/auth/login` | POST | Verify credentials, set JWT cookie |
| `/api/auth/session` | GET | Return current user + profile from JWT |
| `/api/auth/logout` | POST | Clear JWT cookie |
| `/api/auth/change-password` | POST | Change password (requires current password) |
| `/api/users/ensure-demo` | POST | Provision demo users (dev only) |
| `/api/users/create-student` | POST | Teacher creates a student |
| `/api/users/bulk-create-students` | POST | Teacher bulk-creates students |

### Server-Side Auth Helpers

```typescript
// lib/auth/server.ts
getServerSessionClaims()        // Reads cookie → verifies JWT → returns claims or null
requireServerSessionClaims()    // Same, but redirects to login if no session
requireStudentSessionClaims()   // Redirects non-students to /teacher
requireTeacherSessionClaims()   // Redirects non-teachers to /student/dashboard
getRequestSessionClaims(req)    // Reads claims from request (for API routes)
requireRequestSessionClaims(req) // Returns 401 if not authenticated
```

### Client-Side Auth

```typescript
// components/auth/AuthProvider.tsx
const { user, profile, loading, signIn, signOut } = useAuth();
```

- `signIn(username, password)` — POSTs to `/api/auth/login`, then fetches session
- `signOut()` — POSTs to `/api/auth/logout`, clears state
- On mount, fetches `/api/auth/session` to hydrate

## Course Page Structure

### Curriculum Hierarchy

```
Course
└── Unit (1-8 + capstone)
    └── Lesson
        └── LessonVersion (draft/review/published/archived)
            └── Phase (1-6: Hook, Introduction, Guided Practice, Independent Practice, Assessment, Closing)
                └── PhaseSection (text | callout | activity | video | image)
```

### Student Lesson Flow

1. Student navigates to `/student/lesson/[lessonSlug]`
2. Server fetches lesson content from Convex (`api.getLessonWithContent`)
3. Server checks student progress via `internal.student.getLessonProgress`
4. Determines which phase the student should land on (`resolveLessonLandingPhase`)
5. Renders `<LessonRenderer>` with phases, current phase number, completion state
6. Student moves through phases sequentially
7. Each phase has a "Complete" button that POSTs to `/api/phases/complete`
8. Progress is tracked in `student_progress` table

### Student Dashboard

- Fetches `internal.student.getDashboardData` for all units with lesson progress
- Builds view model via `buildStudentDashboardViewModel`
- Shows overall progress, next lesson card, unit-by-unit breakdown
- Each unit shows lessons with progress bars

### Teacher Dashboard

- Fetches `internal.teacher.getTeacherDashboardData` for all students in org
- Shows student list with progress percentages
- Course overview, gradebook per unit, student detail views

## Route Protection

Routes are protected at the server component level using the auth helpers:

- **Student routes**: `requireStudentSessionClaims()` — redirects to `/auth/login` if unauthenticated, `/teacher` if teacher/admin
- **Teacher routes**: `requireTeacherSessionClaims()` — redirects to `/auth/login` if unauthenticated, `/student/dashboard` if student
- **API routes**: `requireRequestSessionClaims()` — returns 401 JSON if unauthenticated
- **Public routes**: No auth check (landing page, curriculum, preface)

## Activity System

Activities are stored in the `activities` Convex table with:
- `componentKey` — maps to a React component in `components/activities/`
- `props` — JSONB configuration
- `gradingConfig` — optional grading rules
- `standardId` — optional link to competency standards

The activity registry (`lib/activities/registry.ts`) maps component keys to lazy-loaded React components.

## Convex Function Visibility

- **Public queries** (`query`): Fetch curriculum, stats — no auth required
- **Internal queries** (`internalQuery`): Require server-side admin auth key
- **Internal mutations** (`internalMutation`): Require server-side admin auth key

Server-side code uses `fetchInternalQuery` / `fetchInternalMutation` which resolve admin auth from either `CONVEX_DEPLOY_KEY` env or local `.convex/` admin key.

## Key Conventions

1. **oklch colors** — All theme colors defined as oklch triplets in CSS custom properties
2. **Font families** — `font-display` (Lora), `font-body` (DM Sans), `font-mono-num` (Fira Code)
3. **Utility classes** — Custom CSS classes for financial/accounting theming (`.ledger-bg`, `.card-workbook`, `.gradient-financial`, etc.)
4. **Path aliases** — `@/*` maps to project root
5. **"use client"** — Applied to interactive components (AuthProvider, login form, user menu, etc.)
6. **RSC** — Page components are server components by default; data fetching happens server-side
