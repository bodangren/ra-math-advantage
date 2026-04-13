# Specification — Wire StepByStepSolverActivity to Real Props

## Overview

Wire `StepByStepSolverActivity` to accept real activity data via props instead of hardcoded sample steps. Connect `onSubmit`/`onComplete` callbacks to enable submission tracking. Integrate `distractors.ts` module into `StepByStepper` for proper guided-mode distractor generation.

## Problem Statement

### StepByStepSolverActivity ignores passed props
```tsx
// Current code - activityId, onSubmit, onComplete are all ignored
export function StepByStepSolverActivity({
  activityId,  // eslint-disable-line -- ignored
  mode,
  onSubmit,    // eslint-disable-line -- ignored
  onComplete,  // eslint-disable-line -- ignored
}: ActivityComponentProps) {
  const sampleSteps = [/* hardcoded */];
  return <StepByStepper mode={mode} steps={sampleSteps} />;
}
```

### StepByStepper uses placeholder distractor generation
```tsx
// Current local placeholder in StepByStepper.tsx
function generateDistractors(correctAnswer: string): string[] {
  // Simple pattern matching - not using distractors.ts
  if (correctAnswer.includes('x^2')) {
    distractors.push('x + 5', '2x + 3');
  }
  // ...
}
```

### Missing submission envelope assembly
- `onSubmit` is never called
- `onComplete` is never called
- No interaction history is tracked
- No submission artifact is built

## Approach

### Phase 1: Prop Interface & Submission Wiring

1. Update `StepByStepSolverActivity` interface to accept:
   - `activityId: string` (required for submission)
   - `mode: 'teaching' | 'guided' | 'practice'`
   - `steps: AlgebraicStep[]` (from parent/registry data)
   - `problemType: ProblemType` (for distractor generation and submission)
   - `equation: string` (for submission artifact)
   - `onSubmit?: (payload: unknown) => void`
   - `onComplete?: () => void`

2. Wire `onSubmit` to call `buildAlgebraicSubmission()` when practice mode completes

3. Wire `onComplete` to be called after submission is sent

4. Track interaction history (hint usage, step attempts) for submission artifact

### Phase 2: Integrate distractors.ts into StepByStepper

1. Import `generateDistractors` from `lib/activities/algebraic/distractors.ts`

2. Add `problemType?: DistractorType` prop to `StepByStepper`

3. Replace local placeholder `generateDistractors` with call to imported function

4. Fall back to `generateGenericDistractors` when problemType doesn't match

## Acceptance Criteria

1. `StepByStepSolverActivity` accepts and uses `steps`, `problemType`, `equation` props
2. `onSubmit` is called with a properly formatted `AlgebraicSubmissionInput` when practice completes
3. `onComplete` is called after successful submission
4. `StepByStepper` guided mode uses `distractors.ts` `generateDistractors` instead of placeholder
5. Interaction history (hint usage, step attempts) is captured for submission artifact
6. All existing tests pass after refactoring