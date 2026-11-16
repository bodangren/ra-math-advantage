# IM3 quadratic-formula generator repair report

## Scope

Base commit: `bdd6303420da2ee483e0adcf1d829d2080442a23`.

Candidate: `/tmp/im3-lesson18-recovery-v6l3h06f`.

Patch: `/tmp/im3-qf-generator-final.patch`.

Path list: `/tmp/im3-qf-generator-paths.txt`.

The patch has three paths:

- `packages/math-content/src/quadratic-formula.ts`
- `packages/math-content/src/__tests__/quadratic-formula.test.ts`
- `packages/math-content/src/__tests__/t17-adversarial.test.ts`

I refreshed the reviewed package files from committed `HEAD` before the change. I did not change the repository working tree. I did not change grading policy, runtime routes, graph data, or approval state.

## Result

The generator now returns separate plus and minus forms for irrational roots. It does the same for complex roots. It returns the correct root count for each regime. The final solution step lists all returned roots. The discriminant substitution puts a negative value of `b` in parentheses.

The adapter code did not need a change. It already maps each root array item to `x1` and `x2`. A new regression verifies the exact adapter answer fields after the generator repair.

The test-only complex parser now computes the imaginary magnitude with the square root of the radicand. The adversarial test no longer requires two duplicate combined `±` strings.

This repair keeps symbolic grading as `exact_match`. The runtime proposal records that limitation in `/tmp/im3-lesson16-runtime-proposal.md`. A separate response and server-grading task must define unordered mathematical root equivalence before learner activation.

## Test evidence

The red run failed three new tests. It showed duplicate symbolic roots, a missing second integer result, and an unparenthesized negative `b` value.

The focused command passed 4 files and 130 tests:

`npm test --workspace=packages/math-content -- --run src/__tests__/quadratic-formula.test.ts src/__tests__/t17-adversarial.test.ts src/__tests__/generator-registry.test.ts src/__tests__/t17-algebra-generators-qa.test.ts`

The full math-content command ran 617 tests. It passed 615 tests. Two unrelated IM1 tests failed because the stored IM1 coverage matrix and rollout gap queue differ from their current derived data. The log is `/tmp/im3-qf-generator-math-content.log`.

The Integrated Math 3 lint passed. The log is `/tmp/im3-qf-generator-lint.log`.

The Integrated Math 3 build passed. The log is `/tmp/im3-qf-generator-build.log`.

The separate post-build TypeScript command passed with no output. The log is `/tmp/im3-qf-generator-tsc.log`.

A private temporary Git index applied the full-base patch. All three staged file bytes matched the candidate files exactly.
