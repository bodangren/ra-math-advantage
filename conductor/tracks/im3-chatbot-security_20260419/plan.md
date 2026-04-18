# Implementation Plan: IM3 Chatbot Security Fixes

## Phase 1: Add Lesson Enrollment Authorization Check

### Tasks

- [x] **1.1** Create internal query `isStudentEnrolledInOrganization` in `convex/student.ts`
  - Query `class_enrollments` by `studentId` (from profile)
  - Filter for `status === "active"` enrollments
  - Return `true` if at least one exists

- [x] **1.2** Add enrollment check to `POST /api/student/lesson-chatbot/route.ts`
  - After line 67 (profile found), call enrollment check
  - If not enrolled in any active class, return 403 Forbidden with message "Not enrolled in any active class"
  - Pass `profile.id` and `profile.organizationId` to the check

- [x] **1.3** Add route test in `app/api/student/lesson-chatbot/__tests__/route.test.ts`
  - Mock `fetchInternalQuery` to return enrolled and unenrolled scenarios
  - Verify 403 for unenrolled students
  - Verify enrollment check is called before lesson lookup

### Technical Notes

- `class_enrollments` table has index `by_student` on `studentId`
- Enrollment check should be a simple exists query, not a full list
- Use `.take(1)` to limit results since we only need to know if any exist

### Verification

- [x] Run `npm test` for lesson-chatbot - all tests pass
- [x] Run `npm run lint` - no lint errors
- [x] Run `npm run build` - build succeeds
- [x] Run `npx tsc --noEmit` - no type errors

---

## Phase 2: Sanitize Teacher-Authored Content Before AI Prompt

### Tasks

- [x] **2.1** Add `sanitizeMarkdownForPrompt` function in `packages/ai-tutoring/src/lesson-context.ts`
  - Remove backticks (code blocks)
  - Replace square brackets with parentheses (neutralize link syntax)
  - Remove greater-than signs (blockquotes)
  - Remove header markers at line start
  - Remove list markers at line start
  - Collapse excessive newlines (3+ to 2)

- [x] **2.2** Apply sanitization in `assembleLessonChatbotContext`
  - Apply `stripHtml` first, then `sanitizeMarkdownForPrompt` to content
  - Apply `sanitizeMarkdownForPrompt` to lesson title, unit title, and phase title

- [x] **2.3** Add unit tests in `packages/ai-tutoring/src/__tests__/lesson-context.test.ts`
  - Test injection attempts with markdown special chars
  - Test that newlines are properly handled
  - Test that legitimate content is preserved

- [x] **2.4** Test full prompt assembly with injected content
  - Verify the final prompt string doesn't contain exploitable patterns

### Technical Notes

- Sanitization order: first strip HTML, then sanitize markdown
- Don't over-sanitize - preserve readability of legitimate content
- Current approach neutralizes markdown syntax while keeping content readable

### Verification

- [x] Run `npm test` for ai-tutoring - all 43 tests pass
- [x] Run `npm run lint` - no lint errors
- [x] Run `npm run build` - build succeeds
- [x] Run `npx tsc --noEmit` - no type errors

---

## Final Verification

- [x] Run full IM3 test suite: 3255/3256 pass (1 pre-existing flaky StepByStepper-guided test)
- [x] Run full ai-tutoring tests: 43/43 pass
- [x] Run lint on IM3: clean
- [x] Run build on IM3: success
- [x] TypeScript type check passes (both apps)