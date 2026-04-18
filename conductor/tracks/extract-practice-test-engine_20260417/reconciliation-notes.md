# Reconciliation Notes

## Canonical Source Decision
- Canonical source: IM3 (primary), BM2 (comparison)
- Reason: IM3 has cleaner type definitions and the `ShuffledQuestion` interface is more ergonomic

## Delta Classification
- required behavior: Both apps use same `filterQuestionsByLessonIds` and `drawRandomQuestions` logic (Fisher-Yates shuffle)
- bug/security hardening: N/A for this extraction
- domain-specific (must remain app-local):
  - Question bank data (IM3 modules, BM2 units with accounting content)
  - PracticeTestEngine component implementations (3-phase vs 6-phase flows)
  - Phase content and messaging text
- docs/comments only: N/A

## App-Local Keep List
- IM3:
  - `lib/practice-tests/types.ts` (extended with module-specific types)
  - `lib/practice-tests/question-banks.ts` (bank data + helpers that remain local)
  - `components/student/PracticeTestEngine.tsx` (3-phase engine)
  - `components/student/PracticeTestSelection.tsx` (module selection UI)
  - `components/student/PracticeTestPageClient.tsx` (page wrapper)
- BM2:
  - `lib/practice-tests/types.ts` (unit-specific types)
  - `lib/practice-tests/question-banks.ts` (unit bank data + helpers)
  - `components/student/PracticeTestEngine.tsx` (6-phase engine)
  - `components/student/PracticeTestSelection.tsx`
  - `components/student/PracticeTestPage.tsx`

## Package API Decisions
- exported symbols:
  - `PRACTICE_TEST_ENGINE_VERSION` (contract version constant)
  - `PracticeTestQuestion` (shared question interface)
  - `ShuffledQuestion` (unified shuffle result with answer + options)
  - `PracticeTestAnswer` (answer record)
  - `PracticeTestPerLessonBreakdown` (scoring breakdown)
  - `PracticeTestResult` (final test result)
  - `filterQuestionsByLessonIds()` (pure utility)
  - `drawRandomQuestions()` (Fisher-Yates sampling)
  - `shuffleAnswers()` (answer shuffling with unified interface)
  - `isAnswerCorrect()` (answer validation helper)
  - `calculateScore()` (scoring helper)
  - `calculatePercentage()` (percentage calculation)
- intentionally not exported:
  - App-specific engine state types
  - Phase content/messaging types
  - Module/unit configuration types

## Verification Results
- commands run: `npm run test` in package
- outcome: 20 tests passed