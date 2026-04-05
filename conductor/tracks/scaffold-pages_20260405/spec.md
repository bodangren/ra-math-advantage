# Specification — Scaffold App Pages & Layouts

## Context

The project has a complete backend (Convex functions, auth system, lib utilities) but no `app/` page or layout files. The directory structure exists (app/student/, app/teacher/, app/admin/, app/auth/, etc.) but contains no `.tsx` files. This track creates all pages and layouts needed for the application to be functional.

## Requirements

### Root Layout & Providers
- Root `app/layout.tsx` wrapping children in ConvexClientProvider → AuthProvider → ThemeProvider with HeaderSimple and Footer
- `app/globals.css` with Tailwind directives and oklch CSS custom properties

### Public Pages
- `app/page.tsx` — Landing page (public, no auth)
- `app/curriculum/page.tsx` — Public curriculum overview
- `app/preface/page.tsx` — Course preface/introduction

### Auth Pages
- `app/auth/login/page.tsx` — Login form with demo accounts
- `app/auth/forgot-password/page.tsx` — Password reset request
- `app/auth/update-password/page.tsx` — New password entry
- `app/auth/confirm/page.tsx` — Confirmation page
- `app/auth/error/page.tsx` — Auth error display
- `app/auth/layout.tsx` — Auth pages layout (centered, minimal chrome)

### Student Pages (Protected)
- `app/student/page.tsx` — Redirects to /student/dashboard
- `app/student/dashboard/page.tsx` — Student dashboard with unit/lesson progress
- `app/student/lesson/[lessonSlug]/page.tsx` — Lesson viewer with phase navigation

### Teacher Pages (Protected)
- `app/teacher/dashboard/page.tsx` — Teacher dashboard with student list
- `app/teacher/gradebook/page.tsx` — Gradebook view
- `app/teacher/students/page.tsx` — Student roster/detail
- `app/teacher/units/page.tsx` — Unit overview

### Admin Pages (Protected)
- `app/admin/dashboard/page.tsx` — Admin dashboard

### Settings
- `app/settings/page.tsx` — User settings (change password)

### API Routes
- `app/api/auth/login/route.ts` — POST login
- `app/api/auth/session/route.ts` — GET session
- `app/api/auth/logout/route.ts` — POST logout
- `app/api/auth/change-password/route.ts` — POST change password
- `app/api/phases/complete/route.ts` — POST phase completion

## Acceptance Criteria

1. All pages render without errors when navigated to
2. Auth-protected pages redirect unauthenticated users to login
3. Student pages redirect teachers/admins; teacher pages redirect students
4. API routes return correct JSON responses
5. Root layout renders all providers in correct order
6. `npm run build` succeeds
7. `npm run lint` passes
