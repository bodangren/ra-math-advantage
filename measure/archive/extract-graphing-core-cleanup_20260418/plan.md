# Implementation Plan: GraphingExplorer Parser Cleanup

## Phase 1: Refactor hasRealIntercepts

### Tasks

- [x] **Task: Import parseQuadratic from package**
  - Add import statement: `import { parseQuadratic } from '@math-platform/graphing-core';`

- [x] **Task: Replace inline quadratic parsing with parseQuadratic call**
  - Refactor `hasRealIntercepts` to use `parseQuadratic(equation)`
  - Preserve discriminant calculation: `b * b - 4 * a * c`
  - If `parseQuadratic` returns null, return `true` (fallback)

- [x] **Task: Verify hasRealIntercepts tests pass**
  - Run: `npx vitest run __tests__/components/activities/graphing/GraphingExplorer.test.tsx`

## Phase 2: Refactor hasRealIntersections

### Tasks

- [x] **Task: Import parseLinear from package**
  - Add import statement: `import { parseQuadratic, parseLinear } from '@math-platform/graphing-core';`

- [x] **Task: Replace inline parsing with package calls**
  - Refactor `hasRealIntersections` to use `parseQuadratic(equation)` and `parseLinear(linearEquation)`
  - If either returns null, return `true` (fallback)
  - Preserve discriminant formula: `(b - m) ** 2 - 4 * a * (c - k)`

- [x] **Task: Verify hasRealIntersections tests pass**
  - Run same test file

## Phase 3: Verification

### Tasks

- [x] **Task: Run full test suite**
  - Run: `npm run ws:im3:test`
  - Confirm 52 GraphingExplorer tests pass

- [x] **Task: Run typecheck**
  - Run: `npx tsc --noEmit`
  - Fix any type errors

- [x] **Task: Run build**
  - Run: `npm run ws:im3:build`
  - Confirm build succeeds

- [x] **Task: Measure - User Manual Verification 'Phase 3: Verification' (Protocol in workflow.md)**