# IM3 quadratic-formula Worked seed independent review

Verdict: ACCEPT for the current frozen production and test bytes.

## Source review

I compared phases 4 to 6 with `apps/integrated-math-3/curriculum/IM3-reveal-module-1.pdf`, pages 43 and 44.

- Phase 4 preserves the Example 1 contest prompt, coefficients, all printed formula stages, both approximate roots, Part B, and the contextual rejection of the negative root.
- Phase 5 preserves the Example 2 prompt, coefficients, all printed radical simplification stages, and `x = -2 ± √21`.
- Phase 6 preserves the Example 3 prompt, coefficients, all printed complex-root stages, and `x = (-4 ± i√39)/5`.
- The LaTeX commands use correct template-literal escaping. The rendered strings keep `frac`, `pm`, and `sqrt` commands.
- Source IDs and native PDF pages appear in code comments. Runtime Markdown contains no hidden provenance metadata.

## Scope review

- The production diff changes only phase 4, phase 5, and phase 6 section bodies.
- Each changed phase now has one inline text section.
- The obsolete physical `step-by-step-solver` section is absent from each changed phase.
- Phases 1 to 3 and 7 to 11 are unchanged.
- Lesson and lesson-version creation behavior is unchanged.
- The published status is unchanged.
- The two draft generated activity records remain separate. This batch does not place them in the published lesson.
- The batch does not change runtime routing, approval, evidence, competency, SRS, or learner progression.

## Test review

The new executable seed test invokes the real `seedLesson6` handler with a memory database. It verifies one text section in each changed phase. It checks every printed formula stage, both final exact results, both approximate Example 1 roots, and the exact Example 1 context statement.

Independent command:

`npm test --workspace=apps/integrated-math-3 -- --run __tests__/convex/seed/seed-lesson-1-6.test.ts`

Result: 1 file passed. All 12 tests passed.

## Parent integration

Committed as `6b6f07375`. Both staged files matched the reviewed candidate. Parent and independent seed tests passed all 12 cases. Lint, build, and separate TypeScript passed. The previously clean test file now matches HEAD. The mixed seed working file remains intact. This change repairs new seed output. It does not migrate deployed lesson versions.
