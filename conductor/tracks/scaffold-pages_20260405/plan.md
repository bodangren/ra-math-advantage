# Implementation Plan — Scaffold App Pages & Layouts

## Phase 1: Foundation (Root Layout & Global Styles) [checkpoint: 9047660]

- [x] Create `app/globals.css` with Tailwind directives and oklch CSS custom properties (a6a2a3a)
- [x] Create `app/layout.tsx` with provider hierarchy (ConvexClientProvider → AuthProvider → ThemeProvider) and chrome (header, footer) (397155a)

## Phase 2: Auth API Routes [checkpoint: e003df9]

- [x] Create `app/api/auth/login/route.ts` — POST endpoint for credential verification and JWT cookie setting (9163510)
- [x] Create `app/api/auth/session/route.ts` — GET endpoint returning current user + profile from JWT (5f7729c)
- [x] Create `app/api/auth/logout/route.ts` — POST endpoint clearing JWT cookie (8d431cc)
- [x] Create `app/api/auth/change-password/route.ts` — POST endpoint for password change with current password verification (29e4f47)
- [x] Create `app/api/phases/complete/route.ts` — POST endpoint for phase completion with idempotency (499a000)

## Phase 3: Auth Pages

- [x] Create `app/auth/layout.tsx` — Centered layout for auth pages (minimal chrome) (526125b)
- [x] Create `app/auth/login/page.tsx` — Login form with username/password fields and demo account buttons (42a89f7)
- [ ] Create `app/auth/forgot-password/page.tsx` — Password reset request form
- [ ] Create `app/auth/update-password/page.tsx` — New password entry form
- [ ] Create `app/auth/confirm/page.tsx` — Confirmation/status page
- [ ] Create `app/auth/error/page.tsx` — Auth error display

## Phase 4: Public Pages

- [ ] Create `app/page.tsx` — Public landing page with hero section and curriculum stats
- [ ] Create `app/curriculum/page.tsx` — Public curriculum overview with unit cards
- [ ] Create `app/preface/page.tsx` — Course preface/introduction page

## Phase 5: Student Pages (Protected)

- [ ] Create `app/student/page.tsx` — Redirect to /student/dashboard
- [ ] Create `app/student/dashboard/page.tsx` — Student dashboard fetching data via `internal.student.getDashboardData`, building view model via `buildStudentDashboardViewModel`
- [ ] Create `app/student/lesson/[lessonSlug]/page.tsx` — Lesson viewer fetching lesson content and student progress, rendering phases with phase navigation

## Phase 6: Teacher Pages (Protected)

- [ ] Create `app/teacher/dashboard/page.tsx` — Teacher dashboard with student list and progress
- [ ] Create `app/teacher/gradebook/page.tsx` — Gradebook grid per unit
- [ ] Create `app/teacher/students/page.tsx` — Student roster and detail view
- [ ] Create `app/teacher/units/page.tsx` — Unit overview page

## Phase 7: Admin & Settings

- [ ] Create `app/admin/dashboard/page.tsx` — Admin dashboard (teacher-compatible)
- [ ] Create `app/settings/page.tsx` — User settings with change password form

## Phase 8: Integration Verification

- [ ] Run `npm run lint` and fix any errors
- [ ] Run `npm run build` and fix any build errors
- [ ] Write integration tests for API routes (login, session, logout, phase completion)
- [ ] Write tests for root layout provider hierarchy
