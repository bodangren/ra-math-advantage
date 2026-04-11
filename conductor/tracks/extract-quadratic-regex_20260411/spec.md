# Specification — Extract Quadratic Regex to Shared Utility

## Track Overview

Extract the duplicated quadratic expression regex pattern from three files (`canvas-utils.ts`, `HintPanel.tsx`, `InterceptIdentification.tsx`) into a shared utility function to improve maintainability and reduce code duplication.

## Problem Statement

The quadratic expression parsing regex `/-?\d*\.?\d*?x\^2(?:\s*([+-]\s*\d*\.?\d*)?x)?(?:\s*([+-]\s*\d*\.?\d*)?)?/` is duplicated across three files:

1. `lib/activities/graphing/canvas-utils.ts` - line 95 in `evaluateFunction()`
2. `components/activities/graphing/HintPanel.tsx` - line 31 in `parseQuadratic()`
3. `components/activities/graphing/InterceptIdentification.tsx` - line 44 in `calculateXIntercepts()`

This duplication creates maintenance burden: any change to the regex logic requires updating three separate locations.

## Acceptance Criteria

- [ ] Create `parseQuadratic()` utility function in `lib/activities/graphing/quadratic-parser.ts`
- [ ] Function parses quadratic expressions and returns `{ a, b, c }` coefficients
- [ ] Update `canvas-utils.ts` to use the shared utility
- [ ] Update `HintPanel.tsx` to use the shared utility
- [ ] Update `InterceptIdentification.tsx` to use the shared utility
- [ ] All existing tests pass
- [ ] No functionality regressions in graphing components

## Dependencies

- Track 5: Graphing Components (in progress)

## Out of Scope

- Changing the regex pattern itself (unless a bug is found)
- Refactoring linear expression regex (different pattern, less duplication)
- Changes to component behavior or UI

## Success Metrics

- Quadratic regex defined in exactly one location
- All three files import and use the shared utility
- All existing tests pass
- No changes to component behavior
