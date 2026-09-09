# IM3 Lesson 1.6 server-owned quiz freeze

Baseline: `b6e99cac704ccbefa36e57176077dbe17fd9ca6c`.

The patch contains the exact 17 accepted paths. It adds the Convex-only private quiz content. It uses the canonical lesson, selected version, phase 10, sequence 2, and physical activity relation as authority. It grades all 16 ordered answer pairs on the server. It rejects answers outside the fixed options. It stores and returns only public receipt data. GET reads only the newest `by_user_and_activity` row. It rejects a malformed newest row without an older-row fallback.

The route uses `receipt=lesson-1-6-quiz`. The default Worked GET remains unchanged. The parent freezes the first request and key. It validates receipts before phase completion. It restores a valid GET receipt. It rejects stale GET and POST results. A current same-identity retry can adopt a shared live POST after phase re-entry. The stale first invocation cannot update the parent. The wrapper restores and locks the frozen visible answers during that retry. Convex key-order transport does not change the exact public-content match.

Red evidence: `/tmp/im3-lesson16-quiz-red.log` records 2 expected failures before the GET helper existed.

Final focused command:

`npx vitest run __tests__/lib/activities/submission.test.ts __tests__/components/lesson/ActivityRenderer-activity-families.test.tsx __tests__/components/lesson/LessonRenderer-activity-submission.test.tsx __tests__/app/api/activities/submissions/selected-route.test.ts __tests__/convex/seed/seed-lesson-1-6.test.ts __tests__/convex/quadratic-formula-server-writer.test.ts __tests__/lib/activities/server-grading-selected-quadratic.test.ts`

Result: 7 files passed. 181 tests passed.

Other gates:

- `npm run lint`: passed.
- `npm run build`: passed.
- `npx tsc --noEmit --pretty false` after build: passed with no output.

The build contains the public question IDs and public option text. No client chunk imports `lesson_1_6_quiz`. Inspection found no client object that pairs either fixed question ID with a `correctAnswer` field. The shared trusted quiz implementation and its unrelated sample answer data remain in its client chunk.

Memory fixtures prove handler logic and write effects. They do not prove real Convex transaction behavior. The accepted scope still requires a disposable local learner flow after source review. No database, seed, deployment, environment, staging, or commit action ran.
