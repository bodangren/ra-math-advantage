# Reconciliation Notes

## Canonical Source Decision
- Canonical source: IM3
- Reason: IM3 has the canonical content-hash.ts and review-queue.ts implementations; BM2 imports from IM3's content-hash

## Delta Classification
- required behavior: none
- bug/security hardening: none
- domain-specific (must remain app-local): Convex type integration in review-queue.ts, harness components in app/components/dev/review-harness/
- docs/comments only: none

## App-Local Keep List
- IM3:
  - `lib/activities/review-queue.ts` (Convex-specific integration layer, keeps Doc<> types)
  - `convex/dev.ts` (Convex internal handlers)
  - `app/api/dev/review-queue/route.ts` (API route wiring)
  - `app/dev/component-approval/page.tsx` (page component)
  - `components/dev/review-queue/` (UI components)
  - `components/dev/review-harness/` (review harness components)
- BM2:
  - `lib/component-approval/component-ids.ts` (app-specific registry dependencies)
  - `lib/component-approval/version-hashes.ts` (wraps IM3 content-hash)

## Package API Decisions
- exported symbols:
  - `computeComponentContentHash` (from content-hash)
  - `ComponentKind` type
  - `HashableComponent` interface
  - `resolveComponentKind`, `buildActivityPlacementMap`, `assembleReviewQueueItem` (from review-queue)
  - `ActivityPlacement`, `ReviewQueueItem` interfaces
  - `PhaseSection`, `PhaseVersion`, `ActivityDoc`, `ApprovalRecord` generic interfaces
- intentionally not exported:
  - BM2-specific component registry helpers (component-ids.ts)
  - BM2-specific version hash wrappers (version-hashes.ts)

## Verification Results
- commands run:
  - `npm test` (package): 25 tests passed
  - `npm run typecheck` (package): clean
  - `npm run typecheck` (IM3): clean
  - `npm run test` (IM3): 3356/3362 pass (6 pre-existing equivalence failures)
  - `npm run build` (IM3): success
- outcome: PASS
