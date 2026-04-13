# Implementation Plan — Wire StepByStepSolverActivity to Real Props

## Phase 1: Prop Interface & Submission Wiring

- [ ] Task: Update StepByStepSolverActivity interface
    - [ ] Write tests: verify activityId, problemType, equation props are passed through
    - [ ] Write tests: onSubmit called with correct submission envelope on practice complete
    - [ ] Write tests: onComplete called after submission
    - [ ] Implement: Accept steps, problemType, equation as props
    - [ ] Implement: Remove hardcoded sampleSteps

- [ ] Task: Wire onSubmit to buildAlgebraicSubmission
    - [ ] Write tests: submission envelope includes activityId, mode, steps, hintsUsed, interactionHistory
    - [ ] Implement: Track interaction history (hint clicks, step attempts)
    - [ ] Implement: Call buildAlgebraicSubmission on practice mode completion
    - [ ] Implement: Pass result to onSubmit

- [ ] Task: Wire onComplete callback
    - [ ] Implement: Call onComplete after onSubmit succeeds

- [ ] Task: Phase Completion Verification 'Prop Interface & Submission'

## Phase 2: Integrate distractors.ts into StepByStepper

- [ ] Task: Import generateDistractors from distractors.ts
    - [ ] Write tests: guided mode uses distractors from distractors.ts module
    - [ ] Implement: Add problemType prop to StepByStepper
    - [ ] Implement: Import generateDistractors and DistractorType

- [ ] Task: Replace placeholder with real distractor generation
    - [ ] Write tests: problem type 'quadratic_formula' generates quadratic-specific distractors
    - [ ] Implement: Replace local generateDistractors with call to imported function
    - [ ] Implement: Fall back to generic distractors when type not matched

- [ ] Task: Phase Completion Verification 'Distractor Integration'