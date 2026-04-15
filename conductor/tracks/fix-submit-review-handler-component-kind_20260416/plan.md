# Plan: Fix submitReviewHandler componentKind Derivation

## Phase 1: Fix componentKind Derivation in submitReviewHandler

### Tasks

- [x] **1.1** Import `resolveComponentKind` from `@/lib/activities/review-queue` in `convex/dev.ts`
  - Note: `resolveComponentKind` is a pure function, safe to import in Convex server context
  
- [x] **1.2** Modify `submitReviewHandler` to derive `componentKind` from `placement.phaseType`
  - If `args.placement?.phaseType` exists, use `resolveComponentKind(args.placement.phaseType)`
  - Otherwise fall back to `args.componentKind`
  - Use derived value in hash computation and storage
  
- [x] **1.3** Add test case in `__tests__/convex/dev.test.ts`
  - Create scenario where client sends `componentKind: "example"` but placement phaseType is `guided_practice`
  - Verify stored `componentKind` is `practice` (derived from phaseType)
  - Verify hash computation uses the derived kind

### Technical Notes

- `resolveComponentKind` lives in `lib/activities/review-queue.ts`
- Hash computation at line 155-160 uses `componentKind` - must use derived value
- Storage at line 165 stores `componentKind` - must use derived value

### Verification

- [x] Run `npm test -- --testPathPattern="dev.test"` - all tests pass
- [x] Run `npm run lint` - no lint errors
- [x] Run `npm run build` - build succeeds