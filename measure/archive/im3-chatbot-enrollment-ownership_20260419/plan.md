# Implementation Plan: IM3 Chatbot Enrollment Ownership Check

## Phase 1: Add class_lessons Table and Ownership Query

### Tasks

- [x] **1.1** Add `class_lessons` table to `convex/schema.ts`
  - Fields: `classId`, `lessonId`, `assignedAt`
  - Compound index `by_class_and_lesson` on `[classId, lessonId]`
  - Index `by_lesson` on `lessonId` for reverse lookup

- [x] **1.2** Create `isStudentEnrolledInClassForLesson` internal query in `convex/student.ts`
  - Accept `studentId` and `lessonId` arguments
  - Query student's active enrollments
  - For each enrolled class, check if `class_lessons` contains the lesson
  - Return `true` if any enrolled class owns the lesson, `false` otherwise
  - Use early exit once ownership is confirmed

- [x] **1.3** Update chatbot route to use new ownership query
  - In `route.ts`, replace `isStudentActivelyEnrolled` call with `isStudentEnrolledInClassForLesson`
  - Pass both `studentId` and `lessonId` to the new query
  - Keep rate limiting AFTER enrollment check

- [x] **1.4** Add/update tests for new ownership check
  - In `__tests__/app/api/student/lesson-chatbot/route.test.ts`
  - Test: student enrolled in Class A (owns lesson) → 200
  - Test: student enrolled in Class A (does NOT own lesson) → 403
  - Test: student not enrolled anywhere → 403

### Technical Notes

- The `class_lessons` table establishes explicit ownership: a class can only access lessons it owns
- If no `class_lessons` entries exist for a class, that class's students cannot access ANY lessons via chatbot
- Consider adding seed data for `class_lessons` in demo environment

### Verification

- [x] Run `npm test` for lesson-chatbot tests - 8 tests pass
- [x] Run `npm run lint` - no lint errors
- [x] Run `npm run build` - build succeeds
- [x] Run `npx tsc --noEmit` - no type errors