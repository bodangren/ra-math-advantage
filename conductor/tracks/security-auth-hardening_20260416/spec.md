# Specification: Security & Auth Hardening

## Overview

Port the proven security architecture from `bus-math-v2` into `ra-integrated-math-3`. The current project has basic JWT auth but lacks fail-closed API route guards, Convex-layer authorization, credential revocation, and middleware role checks. This track hardens the auth boundary across all layers.

## Source Reference

Port patterns from `bus-math-v2/lib/auth/server.ts`, `bus-math-v2/middleware.ts`, and `bus-math-v2/convex/teacher.ts`.

## Functional Requirements

### 1. Fail-Closed API Route Guards

- `requireRequestSessionClaims(request)` — Returns `SessionClaims | Response` (401 JSON)
- `requireStudentRequestClaims(request, message?)` — Returns `SessionClaims | Response` (401/403 JSON)
- `requireTeacherRequestClaims(request, message?)` — Returns `SessionClaims | Response` (401/403 JSON)
- `requireActiveRequestSessionClaims(request)` — Verifies JWT + checks credential `isActive` flag in Convex. Returns 401/503 (fail-closed if Convex is down)
- All return types force the caller to handle both outcomes via TypeScript discrimination

### 2. Convex-Layer Authorization

- `getAuthorizedTeacher(ctx, userId)` — Verifies profile exists, role is teacher/admin, returns profile or null
- `getStudentInTeacherOrg(ctx, studentProfileId, teacher)` — Verifies student exists, role is student, same `organizationId` as teacher
- Apply to all teacher-scoped and student-scoped internal mutations/queries

### 3. Middleware Role Guards

- Extend `middleware.ts` to protect dev-only routes (component review) with admin-only role check
- Pattern: extract JWT from cookie, verify signature, check role, redirect or 403

### 4. Credential Revocation

- `requireActiveRequestSessionClaims` calls Convex to verify `credential.isActive` before allowing sensitive operations
- Fail-closed: if Convex is unreachable, return 503

### 5. Input Validation Standard

- All API routes validate input with Zod `safeParse` before processing
- Auth check precedes validation (fail fast on unauthenticated)

## Non-Functional Requirements

- Timing-safe JWT signature comparison (already implemented, verify port)
- No stack traces in production error responses
- All protected routes have corresponding test coverage

## Acceptance Criteria

- [ ] Every API route under `app/api/` uses one of the fail-closed guard functions
- [ ] Convex internal mutations verify org membership for cross-tenant operations
- [ ] Dev-only routes require admin role via middleware
- [ ] Deactivated credentials are immediately locked out
- [ ] All new auth helpers have >80% test coverage
- [ ] No lint or TypeScript errors

## Out of Scope

- Rate limiting (separate track: AI Chatbot)
- Changes to JWT signing/verification algorithm
- New auth provider integration
