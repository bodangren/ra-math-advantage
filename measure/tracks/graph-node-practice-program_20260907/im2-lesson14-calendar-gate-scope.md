# IM2 Lesson 1.4 calendar gate repair scope

## Finding

The failure exists on committed `HEAD` (`adf00a095`). A clean `git archive HEAD` snapshot fails only `calendar.test.ts:24`. Period `m1-p06` has zero `workedExamples`.

Commit `1b63e8274` caused the failure as a direct and correct taxonomy change. It changed the Lesson 1.4 phases `Example 1`, `Examples 2 and 3`, and `Example 4` from `worked_example` to `learn`. The native source contains unanswered problems. It does not contain a `Solution` segment for these phases. The generated calendar therefore has no source-backed worked example for `m1-p06`.

The calendar test still applies the old rule that every instruction period must have one worked example. That rule conflicts with the corrected source taxonomy. Changing a Lesson 1.4 phase back to `worked_example` would make an unanswered prompt look like a worked solution.

## Minimum change

Change only:

- `apps/integrated-math-2/__tests__/curriculum/calendar.test.ts`

For each instruction period, derive the source lesson's phases whose `phaseType` is `worked_example`.

- If the source lesson has one or more worked-example phases, require the calendar period to contain at least one worked example.
- If the source lesson has no worked-example phase, require the calendar period to contain zero worked examples.
- Keep the maximum of three.
- Keep the existing title-membership check.
- Keep all period counts and exact source lesson coverage checks.

This change preserves the global calendar check. It also makes the check follow the source taxonomy. It does not change curriculum source, generated data, or runtime behavior.

## Verification

Run the calendar test first. Then run the full IM2 test suite, lint, build, and the separate post-build TypeScript check with the frozen 15-path patch present.
