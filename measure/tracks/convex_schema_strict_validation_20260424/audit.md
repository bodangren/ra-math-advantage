# Convex Schema v.any() Field Audit

> Phase 1 output: Catalog and map all 21 `v.any()` fields to their usage context.

## Audit Summary

Total `v.any()` fields: 21 across 16 tables

---

## Field Catalog

### 1. `organizations.settings` — `v.optional(v.any())`
- **Table:** organizations
- **Line:** 8
- **Usage:** Unknown - not found in handlers
- **Expected Shape:** `Record<string, unknown>` or specific org settings object
- **Risk:** Low — optional metadata field

### 2. `profiles.metadata` — `v.optional(v.any())`
- **Table:** profiles
- **Line:** 19
- **Usage:** Unknown - not found in handlers
- **Expected Shape:** `Record<string, unknown>`
- **Risk:** Low — optional metadata field

### 3. `classes.metadata` — `v.optional(v.any())`
- **Table:** classes
- **Line:** 47
- **Usage:** Unknown - not found in handlers
- **Expected Shape:** `Record<string, unknown>`
- **Risk:** Low — optional metadata field

### 4. `lessons.metadata` — `v.optional(v.any())`
- **Table:** lessons
- **Line:** 80
- **Usage:** Unknown - not found in handlers
- **Expected Shape:** `Record<string, unknown>`
- **Risk:** Low — optional metadata field

### 5. `phase_versions.metadata` — `v.optional(v.any())`
- **Table:** phase_versions
- **Line:** 116
- **Usage:** Unknown - not found in handlers
- **Expected Shape:** `Record<string, unknown>`
- **Risk:** Low — optional metadata field

### 6. `phase_sections.content` — `v.any()`
- **Table:** phase_sections
- **Line:** 132
- **Usage:** CRITICAL — actual curriculum content
- **Expected Shape:**
  ```typescript
  // Text section
  { markdown: string }
  // Activity section
  { componentKey: string, props: Record<string, unknown>, activityId?: Id<"activities"> }
  // Callout section
  { calloutType: string, content: string }
  // Video section
  { videoUrl: string, caption?: string }
  // Image section
  { imageUrl: string, alt?: string, caption?: string }
  ```
- **Risk:** HIGH — core curriculum content, directly rendered

### 7. `activities.props` — `v.any()`
- **Table:** activities
- **Line:** 161
- **Usage:** CRITICAL — component-specific props passed to activity renderers
- **Expected Shape:** Varies by `componentKey` — see activity registry
  ```typescript
  // graphing-explorer
  { variant: string, equation: string, title?: string }
  // step-by-step-solver
  { problemType: string, equation: string, steps: Array<{expression: string, explanation: string}> }
  // comprehension-quiz
  { questions: Array<{id: string, question: string, options: string[], correct: number}> }
  // fill-in-the-blank
  { sentences: Array<{id: string, text: string, blanks: Array<{position: number, answer: string}>}> }
  // etc.
  ```
- **Risk:** HIGH — passed to component renderers

### 8. `activities.gradingConfig` — `v.optional(v.any())`
- **Table:** activities
- **Line:** 162
- **Usage:** Grading configuration
- **Expected Shape:**
  ```typescript
  { autoGrade: boolean, partialCredit: boolean }
  ```
- **Risk:** Medium — used in submission grading

### 9. `resources.metadata` — `v.optional(v.any())`
- **Table:** resources
- **Line:** 207
- **Usage:** Unknown - not found in handlers
- **Expected Shape:** `Record<string, unknown>`
- **Risk:** Low — optional metadata field

### 10. `activity_submissions.submissionData` — `v.any()`
- **Table:** activity_submissions
- **Line:** 232
- **Usage:** CRITICAL — student submission payload
- **Expected Shape:** Validated by `practiceSubmissionEnvelopeValidator` at write time
  ```typescript
  {
    contractVersion: "practice.v1",
    activityId: string,
    mode: "worked_example" | "guided_practice" | "independent_practice" | "assessment" | "teaching",
    status: "draft" | "submitted" | "graded" | "returned",
    attemptNumber: number,
    submittedAt: string,
    answers: Record<string, unknown>,  // rawAnswer per part
    parts: Array<{
      partId: string,
      rawAnswer: unknown,
      normalizedAnswer?: string,
      isCorrect?: boolean,
      score?: number,
      maxScore?: number,
      misconceptionTags?: string[],
      hintsUsed?: number,
      revealStepsSeen?: number,
      changedCount?: number,
      firstInteractionAt?: string,
      answeredAt?: string,
      wallClockMs?: number,
      activeMs?: number,
    }>,
    artifact?: Record<string, unknown>,
    interactionHistory?: unknown[],
    analytics?: Record<string, unknown>,
    studentFeedback?: string,
    teacherSummary?: string,
    timing?: {
      startedAt: string,
      submittedAt: string,
      wallClockMs: number,
      activeMs: number,
      idleMs: number,
      pauseCount: number,
      focusLossCount: number,
      visibilityHiddenCount: number,
      longestIdleMs?: number,
      confidence: "high" | "medium" | "low",
      confidenceReasons?: string[],
    },
  }
  ```
- **Risk:** HIGH — student work data

### 11. `student_spreadsheet_responses.spreadsheetData` — `v.any()`
- **Table:** student_spreadsheet_responses
- **Line:** 249
- **Usage:** Spreadsheet activity response
- **Expected Shape:** `Record<string, unknown>` — varies by spreadsheet activity type
- **Risk:** Medium — student work data

### 12. `student_spreadsheet_responses.lastValidationResult` — `v.optional(v.any())`
- **Table:** student_spreadsheet_responses
- **Line:** 252
- **Usage:** Validation result for draft data
- **Expected Shape:** `Record<string, unknown>` or null
- **Risk:** Low — internal validation state

### 13. `student_spreadsheet_responses.draftData` — `v.optional(v.any())`
- **Table:** student_spreadsheet_responses
- **Line:** 254
- **Usage:** Draft spreadsheet data before submission
- **Expected Shape:** Same as `spreadsheetData`
- **Risk:** Low — draft work

### 14. `activity_completions.completionData` — `v.optional(v.any())`
- **Table:** activity_completions
- **Line:** 269
- **Usage:** Completion metadata
- **Expected Shape:** `Record<string, unknown>`
- **Risk:** Low — completion metadata

### 15. `problem_families.metadata` — `v.optional(v.any())`
- **Table:** problem_families
- **Line:** 346
- **Usage:** Problem family metadata
- **Expected Shape:** `Record<string, unknown>`
- **Risk:** Low — metadata field

### 16. `srs_review_log.evidence` — `v.any()`
- **Table:** srs_review_log
- **Line:** 404
- **Usage:** SRS evidence from submission
- **Expected Shape:** `Record<string, unknown>` — submission evidence object
- **Risk:** Medium — SRS data

### 17. `srs_review_log.stateBefore` — `v.any()`
- **Table:** srs_review_log
- **Line:** 405
- **Usage:** SRS card state before review
- **Expected Shape:** `SrsCardState` from @math-platform/srs-engine
  ```typescript
  {
    stability: number,
    difficulty: number,
    state: "new" | "learning" | "review" | "relearning",
    dueDate: string,
    elapsedDays: number,
    scheduledDays: number,
    reps: number,
    lapses: number,
    lastReview?: string,
  }
  ```
- **Risk:** Medium — SRS state

### 18. `srs_review_log.stateAfter` — `v.any()`
- **Table:** srs_review_log
- **Line:** 406
- **Usage:** SRS card state after review
- **Expected Shape:** Same as `stateBefore`
- **Risk:** Medium — SRS state

### 19. `srs_sessions.config` — `v.any()`
- **Table:** srs_sessions
- **Line:** 419
- **Usage:** SRS session configuration
- **Expected Shape:**
  ```typescript
  {
    maxCards?: number,
    mode?: "review" | "learn",
    filter?: {
      objectiveIds?: string[],
      problemFamilyIds?: string[],
    },
  }
  ```
- **Risk:** Low — session config

### 20. `due_reviews.fsrsState` — `v.any()`
- **Table:** due_reviews
- **Line:** 493
- **Usage:** FSRS state for due reviews
- **Expected Shape:** `SrsCardState` (same as stateBefore/stateAfter)
- **Risk:** Medium — SRS state

### 21. `study_preferences.preferences` — `v.any()`
- **Table:** study_preferences
- **Line:** 504
- **Usage:** User study preferences
- **Expected Shape:** `Record<string, unknown>`
- **Risk:** Low — user preferences

---

## Recommended Priorities

### Tier 1 — Critical (directly rendered/executed)
1. `phase_sections.content` — curriculum content
2. `activities.props` — component props
3. `activity_submissions.submissionData` — student work

### Tier 2 — High (student data)
4. `srs_review_log.stateBefore/After` — SRS state
5. `due_reviews.fsrsState` — SRS state
6. `srs_review_log.evidence` — submission evidence

### Tier 3 — Medium
7. `activities.gradingConfig` — grading config
8. `student_spreadsheet_responses.spreadsheetData` — spreadsheet work
9. `srs_sessions.config` — session config

### Tier 4 — Low (metadata)
10-21. All `metadata` fields and `study_preferences.preferences`

---

## `as any` Cast Locations

1. `app/api/student/lesson-chatbot/route.ts:8` — `(internal as any).rateLimits`
2. `app/api/student/lesson-chatbot/route.ts:10` — `(internal as any).student`
3. `convex/seed.ts:6` — `(internal as any).seed`
4. `app/api/phases/skip/route.ts:39` — `(internal.student as any).skipPhase`

Note: Only 4 found, not 5 as mentioned in directive. May need re-audit.