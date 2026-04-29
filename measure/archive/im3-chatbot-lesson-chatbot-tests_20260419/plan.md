# Implementation Plan: IM3 LessonChatbot Component Tests

## Phase 1: Add LessonChatbot.tsx Unit Tests

### Context

The `LessonChatbot.tsx` component is a client-side chatbot widget that allows students to ask questions about lessons. It has 5 states: `closed`, `open`, `loading`, `response`, and `error`. The route handler (`POST /api/student/lesson-chatbot/route.ts`) is tested but the UI component itself has no test coverage.

### Tasks

- [x] **1.1** Create test file at `apps/integrated-math-3/__tests__/components/student/LessonChatbot.test.tsx`
  - Test initial closed state renders chat button
  - Test clicking button opens chat (open state)
  - Test form input and submission flow
  - Test loading state displays spinner
  - Test response state displays AI answer
  - Test error state displays error message
  - Test close button returns to closed state
  - Test reset/try again functionality

### Technical Notes

- Use `@testing-library/react` with `render`, `screen`, `fireEvent`, `waitFor`
- Mock `fetch` globally for API calls
- The component has no external dependencies beyond UI primitives

### Verification

- [x] Run `npm test -- --run apps/integrated-math-3/__tests__/components/student/LessonChatbot.test.tsx` - all tests pass
- [x] Run `npm run lint` - no lint errors
- [x] Run `npm run build` - build succeeds
- [x] Run `npx tsc --noEmit` - no type errors