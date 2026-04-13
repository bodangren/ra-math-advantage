# Implementation Plan — Wire StepByStepSolverActivity to Real Props

## Phase 1: Prop Interface & Submission Wiring

- [x] Task: Update StepByStepSolverActivity interface
    - [x] Write tests: verify activityId, problemType, equation props are passed through
    - [x] Write tests: onSubmit called with correct submission envelope on practice complete
    - [x] Write tests: onComplete called after submission
    - [x] Implement: Accept steps, problemType, equation as props (with defaults for backward compat)
    - [x] Implement: Remove hardcoded sampleSteps (now used as default fallback)

- [x] Task: Wire onSubmit to buildAlgebraicSubmission
    - [x] Write tests: submission envelope includes activityId, mode, steps, hintsUsed, interactionHistory
    - [x] Implement: Track interaction history (hint clicks, step attempts)
    - [x] Implement: Call buildAlgebraicSubmission on practice mode completion
    - [x] Implement: Pass result to onSubmit

- [x] Task: Wire onComplete callback
    - [x] Implement: Call onComplete after onSubmit succeeds

- [x] Task: Phase Completion Verification 'Prop Interface & Submission'

## Phase 2: Integrate distractors.ts into StepByStepper

- [x] Task: Import generateDistractors from distractors.ts
    - [x] Write tests: guided mode uses distractors from distractors.ts module
    - [x] Implement: Add problemType prop to StepByStepper
    - [x] Implement: Import generateDistractors and DistractorType

- [x] Task: Replace placeholder with real distractor generation
    - [x] Write tests: problem type 'quadratic_formula' generates quadratic-specific distractors
    - [x] Implement: Replace local generateDistractors with call to imported function
    - [x] Implement: Fall back to generic distractors when type not matched

- [x] Task: Phase Completion Verification 'Distractor Integration'