# Specification: GraphingExplorer Parser Cleanup

## Overview

Refactor `GraphingExplorer.tsx` to use `parseQuadratic` and `parseLinear` from `@math-platform/graphing-core` package instead of inline regex implementations for `hasRealIntercepts` and `hasRealIntersections` functions.

## Problem

`GraphingExplorer.tsx` contains inline parser implementations that duplicate logic available in `@math-platform/graphing-core`:
- `hasRealIntercepts` (lines 138-148): inline quadratic discriminant check
- `hasRealIntersections` (lines 150-180): inline quadratic-linear intersection discriminant check

This violates DRY and creates maintenance burden.

## Solution

Replace inline implementations with calls to `parseQuadratic` and `parseLinear` from `@math-platform/graphing-core`, maintaining the same discriminant-based logic for determining real roots.

## Acceptance Criteria

1. `hasRealIntercepts` uses `parseQuadratic` from package
2. `hasRealIntersections` uses `parseQuadratic` and `parseLinear` from package
3. All 52 GraphingExplorer tests pass after refactoring
4. No type errors (`npx tsc --noEmit` clean)
5. Build passes (`npm run ws:im3:build`)

## Technical Notes

- Both inline and package parsers handle the same equation formats: `y = x^2 ± bx ± c`
- Fallback behavior preserved: if parsing returns null, return `true` (assume real solutions exist)
- The inline regex pattern differs slightly from package regex, but produces equivalent results for the test equation formats