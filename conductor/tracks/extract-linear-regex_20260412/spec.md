# Specification — Extract Linear Regex to Shared Utility

## Track Overview

Extract the duplicated linear expression regex pattern from two files (`canvas-utils.ts`, `InterceptIdentification.tsx`) into a shared utility function to improve maintainability and reduce code duplication.

## Problem Statement

The linear expression parsing regex `/(-?\d*\.?\d*)?x(?:\s*([+-]\s*\d*\.?\d*)?)?/` is duplicated across two files:

1. `lib/activities/graphing/canvas-utils.ts` - line 108 in `evaluateFunction()`
2. `components/activities/graphing/InterceptIdentification.tsx` - line 48 in `calculateXIntercepts()`

This duplication creates maintenance burden: any change to the regex logic requires updating two separate locations.

## Acceptance Criteria

- [ ] Create `parseLinear()` utility function in `lib/activities/graphing/linear-parser.ts`
- [ ] Function parses linear expressions and returns `{ m, b }` coefficients
- [ ] Update `canvas-utils.ts` to use the shared utility
- [ ] Update `InterceptIdentification.tsx` to use the shared utility
- [ ] All existing tests pass
- [ ] No functionality regressions in graphing components

## Dependencies

- Track 5: Graphing Components (in progress)

## Out of Scope

- Changing the regex pattern itself (unless a bug is found)
- Changes to component behavior or UI

## Success Metrics

- Linear regex defined in exactly one location
- Both files import and use the shared utility
- All existing tests pass
- No changes to component behavior
