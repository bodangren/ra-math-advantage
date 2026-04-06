# Specification — Activity Infrastructure

## Context

The practice component contract (`conductor/practice-component-contract.md`) defines the architecture: a component registry mapping `componentKey` strings to React components, a submission envelope (`practice.v1`), and a mode system (`worked_example`, `guided_practice`, `independent_practice`, `assessment`, `teaching`). The contract file and `lib/practice/contract.ts` already exist with the Zod envelope schema.

What's missing is the actual registry, the mode-aware rendering pipeline, the submission persistence layer, and the Zod props schemas for each component key.

## Requirements

### Activity Registry

1. **`lib/activities/registry.ts`** — Map of `componentKey` → lazy-loaded React component. Start with the component keys needed for Module 1:
   - `graphing-explorer`
   - `step-by-step-solver`
   - `comprehension-quiz`
   - `fill-in-the-blank`
   - `rate-of-change-calculator`
   - `discriminant-analyzer`

2. **`getActivityComponent(key: string)`** — Returns the React component for a given key, or `null` if not registered.

3. **`getRegisteredKeys()`** — Returns all registered component keys (useful for validation and admin views).

### Mode System

4. **`lib/activities/modes.ts`** — Utilities for the activity mode system:
   - `ActivityMode` type: `'teaching' | 'guided' | 'practice'` (simplified from the 5-mode contract to the 3 user-facing modes the user specified)
   - `resolveActivityMode(userRole, phaseType, activityConfig?)` — Determines the correct mode based on context:
     - Teachers always get `teaching` mode
     - `worked_example` phases default to `guided` mode for students
     - `independent_practice` phases default to `practice` mode
     - `assessment` phases default to `practice` mode
     - Can be overridden by activity-level config

5. **Mode-aware component props** — Every activity component receives:
   ```typescript
   interface ActivityComponentProps {
     activity: Activity;
     mode: ActivityMode;
     onSubmit?: (payload: PracticeSubmissionEnvelope) => void;
     onComplete?: () => void;
   }
   ```

### Props Schemas

6. **`lib/activities/schemas/`** — Zod schemas for each component key's `props` field:
   - `graphing-explorer.schema.ts`
   - `step-by-step-solver.schema.ts`
   - `comprehension-quiz.schema.ts`
   - `fill-in-the-blank.schema.ts`
   - `rate-of-change-calculator.schema.ts`
   - `discriminant-analyzer.schema.ts`

   Each schema defines the structure of the `props` JSON stored in the Convex `activities` table. These schemas are used for validation in the seed script and in the activity renderer.

### Submission Pipeline

7. **`lib/activities/submission.ts`** — Client-side submission handler:
   - Validates the envelope against the `practice.v1` Zod schema
   - Posts to a submission API endpoint
   - Handles optimistic UI updates

8. **API route `app/api/activities/submit/route.ts`** — POST endpoint:
   - Validates the submission envelope server-side
   - Calls `convex/activities.ts` `submitActivity` mutation
   - Returns confirmation with score (if auto-graded)

9. **Update `convex/activities.ts`** — Ensure `submitActivity` mutation:
   - Creates `activity_submissions` record
   - Creates/updates `activity_completions` record
   - Updates `student_competency` if `standardId` is linked

### Activity Completion Tracking

10. **`lib/activities/completion.ts`** — Tracks which activities within a phase are completed, so `PhaseCompleteButton` can determine if the phase is completable.

## Acceptance Criteria

1. Registry returns correct component for all 6 Module 1 keys (components will be placeholders until Tracks 5-7)
2. `resolveActivityMode()` returns correct mode for all role × phaseType combinations
3. Props schemas validate correct data and reject malformed data
4. Submission pipeline: client builds envelope → validates → posts → Convex persists → response returned
5. Activity completion tracking correctly gates phase completion
6. All functions have unit tests with >80% coverage
7. `npm run lint` and `npm run build` pass

## Out of Scope

- Actual activity component UI implementations (Tracks 5-7)
- Seed data (Track 8)
- Error analysis integration (existing in `lib/practice/error-analysis/` — wire in later)
