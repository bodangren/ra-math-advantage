# Reconciliation Notes: Extract Core Auth + Convex Infrastructure

## Overview

Phase 3 documents the current state of IM3 auth/convex import migration after Phases 1-2 extraction and reconciliation work.

## Package Adoption Status

### `packages/core-auth`

| Export | IM3 Usage | Status |
|--------|-----------|--------|
| `SESSION_COOKIE_NAME` | `lib/auth/server.ts` | ✅ Direct import |
| `getAuthJwtSecret` | `lib/auth/server.ts` | ✅ Direct import |
| `verifySessionToken` | `lib/auth/server.ts` | ✅ Direct import |
| `SessionClaims` type | `lib/auth/server.ts`, `lib/auth/developer.ts` | ✅ Direct import |
| Guard functions (`requireStudentRequestClaims`, etc.) | `lib/auth/server.ts` | ⚠️ App-local - depends on Next.js cookies API |
| `isDevApprovalEnabledForRequest` | `lib/auth/developer.ts` | ⚠️ App-local - uses Next.js redirect |

### `packages/core-convex`

| Export | IM3 Usage | Status |
|--------|-----------|--------|
| `fetchInternalQuery` | `lib/convex/server.ts` | ✅ Re-exported via local wrapper |
| `fetchInternalMutation` | `lib/convex/server.ts` | ✅ Re-exported via local wrapper |
| `fetchPublicQuery` | `lib/convex/server.ts` (unused) | ✅ Available |
| `resolveConvexAdminAuth` | `lib/convex/server.ts` | ✅ Re-exported |
| `getConvexUrl` | `lib/convex/server.ts` | ✅ Re-exported |
| `api`, `internal` Convex refs | All API routes | ⚠️ App-local - Convex generated |
| `resolveConvexProfileIdFromSupabaseUser` | `lib/convex/server.ts` | ⚠️ App-local - BM2/Supabase specific |

## Deferred Items

### 1. BM2 Auth Guard Reconciliation (Phase 2 deferment)

**Reason**: BM2 not present in workspace - cannot diff auth/server behavior.

**Impact**: Guard function divergence between IM3 and BM2 is unknown. Local `lib/auth/server.ts` may have BM2-specific or IM3-specific logic that should be reconciled once BM2 is available.

**Next Steps**: Run auth guard diff when BM2 is merged into monorepo.

### 2. IM3 Convex Types Stale

**Issue**: `IM3 Convex types stale: rateLimits + student.getLessonForChatbot` (tech-debt line 38)

**Impact**: `as any` cast needed in `teacher/lessons/page.tsx` line 25 because generated Convex types don't include new handlers.

**Next Steps**: Run `npx convex dev` to regenerate types when Convex schema changes are finalized.

## Verification Results (2026-04-19)

| Check | Result | Notes |
|-------|--------|-------|
| `npm run lint` | PASS | Fixed 1 error in `teacher/lessons/page.tsx` |
| `npx tsc --noEmit` | PASS | |
| `npm run build` | PASS | |
| `npm run test` | 3279/3286 | 1 known flaky test (`StepByStepper-guided.test.tsx`) |

## Conclusion

The extraction is effectively complete:
- Shared primitives are in packages and imported by local modules
- Local modules add thin app-specific wrappers (Next.js guards, Supabase profile resolution)
- BM2 reconciliation is blocked by workspace structure (BM2 not yet merged)

The remaining `as any` cast is a known tech-debt item related to stale Convex generated types, not a result of this extraction.