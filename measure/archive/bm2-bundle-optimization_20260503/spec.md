# Spec: BM2 Worker-Entry Bundle Optimization

## Problem

The BM2 worker-entry bundle is 5.1 MB, consuming 49% of Cloudflare's 10 MB limit. With no code-splitting in place, any import growth pushes the app toward the hard deployment ceiling. This blocks future feature additions and makes deployments fragile.

## Goal

Reduce the BM2 worker-entry bundle to under 3 MB via tree-shaking, code-splitting, and import auditing — creating headroom for future growth.

## Requirements

1. **Bundle Analysis**: Profile the worker-entry chunk to identify the largest contributors (dependencies, duplicate modules, unused code).
2. **Tree-Shaking Audit**: Verify all shared packages (`@math-platform/*`) export only what's consumed; eliminate barrel re-exports of unused modules.
3. **Dynamic Imports**: Lazy-load non-critical routes (AI tutoring chatbot, workbook pipeline, study hub games) via `next/dynamic`.
4. **Duplicate Elimination**: Check for duplicate React/Convex/Zod instances across packages and hoist to root workspace.
5. **Monitoring**: Add a bundle size check to CI that fails if worker-entry exceeds 5 MB.

## Non-Goals

- Migrating off Cloudflare Workers
- Refactoring BM2 to a different bundler
- Reducing IM3 bundle (separate concern)

## Success Criteria

- BM2 worker-entry bundle under 3 MB
- CI fails build if bundle exceeds 5 MB
- No runtime behavior changes
- All existing tests pass
