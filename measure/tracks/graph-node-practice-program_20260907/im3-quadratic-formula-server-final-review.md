# IM3 quadratic-formula server correction review

Verdict: ACCEPT.

I reviewed the final frozen nine-path candidate in `/tmp/im3-lesson18-recovery-v6l3h06f`.

## Trust boundaries

- The server reconstructs the authoritative problem from the private seed.
- The server grades the discriminant and roots. It does not accept client scores.
- The public seed document has an exact public-content check. The private variant keeps the seed and canonical roots.
- The stored submission keeps the client attempt number, submitted time, answers, and part telemetry. The indexed attempt ordinal remains server-owned.
- Replay compares the canonical request after a real `convexToJson` and `jsonToConvex` round trip. Nested part telemetry remains in the comparison.
- Draft authority requires one exact draft skill and one exact draft blueprint. Missing, malformed, duplicate, or approved records fail closed.
- Generic writers inspect every indexed physical item relation. A quadratic-formula relation in the third position fails closed. Two unrelated valid item relations remain accepted.

## Public reads and evidence

- The consumer fixture exercises a nonempty QF activity read.
- Its synthetic published lesson has a phase and an activity section that references the QF activity.
- Its QF SRS card produces the QF objective in the objective, student, teacher, and knowledge-state results.
- Its active enrollment produces a nonempty teacher result.
- All six results exclude the private sentinel, `privateSentinel`, and `canonicalRoots`.
- The evidence test receives the exact `{ accepted: false, reason: 'submission_not_found' }` result for a draft QF submission.
- The test checks the five real effect tables. It also checks that the scheduler received no call.
- The test does not check a nonexistent `student_knowledge_state` table.

The in-memory store does not model transaction rollback. The candidate and its report do not claim that it does.

## Independent gate

Command:

`npm test --workspace=apps/integrated-math-3 -- --run __tests__/convex/quadratic-formula-server-writer.test.ts __tests__/convex/seed/seed-lesson-1-6.test.ts __tests__/app/api/activities/submissions/selected-route.test.ts __tests__/lib/activities/server-grading-quadratic-formula.test.ts`

Result: 4 files passed. All 42 tests passed.

No production defect remains in this bounded server scope.

## Parent integration

Committed as `91e71dd6d`. All nine staged files matched the accepted candidate. Parent and independent tests passed all 42 cases. App lint, build, and separate TypeScript passed. Four absent or clean files now match HEAD. Five mixed working files remain intact. The test fixture does not prove live database rollback. No live seed, deployment, source approval, or learner placement occurred.
