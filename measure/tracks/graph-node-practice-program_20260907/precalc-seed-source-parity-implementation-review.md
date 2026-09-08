# Q23 implementation independent review

## Result

Reject the current candidate pending four bounded corrections. The model mathematics is correct, but the student text exposes an answer and one interval statement has incorrect endpoints.

## Prior findings

All three prior findings are resolved.

1. The Explore text gives `h(t)=-24t^2+60t+6`, the vertex `t=1.25`, and maximum height `43.5`. It states that the model increases through the vertex and then decreases. It explicitly states that `h(1)=h(1.5)=42` does not show a constant interval. The physical cutoff `(5+sqrt(29))/4`, approximately `2.60`, is correct. The value at 3 seconds is correctly labeled as an algebraic continuation.

2. The Independent text preserves the authored average-rate task as a Topic 1.2 preview. It also adds the Topic 1.1 value-comparison task. The arithmetic is correct. The increases are 5, 0, 5, and 6 over equal input gaps of 2. The greatest average rate is 3 on `[7,9]`. The earlier positive rates are 2.5. The text states that the preview gives no Topic 1.1 mastery evidence.

3. The accepted lesson and runtime seed now use the same seven ordinary bodies. The lesson adds the two authored Worked tasks under a separate authored heading. It keeps the recovered Passwater Examples 1 through 12 unchanged. I verified one occurrence of each numbered Example 1 through Example 12 before and after the patch. The patch does not edit that recovered-source section.

## Other source checks

The variable, domain, and range definitions are correct. The authored tables have explicit source labels. The temperature task has a monotonic interpolation assumption. The `p` and `m` tasks have linear interpolation assumptions. The `g` task limits its conclusion to consecutive displayed values. The piecewise-linear task supplies behavior between endpoints directly.

The ordinary Worked tasks no longer use the recovered `Example 1` and `Example 2` labels. The Learn sentence frame no longer contains `$amount$`.

The patch changes only the seed, the accepted lesson, and one new test. It does not change activity IDs, stable IDs, component keys, approval data, grading data, or the phase-4 sequence-2 selected link.

## Required corrections

### Independent answer exposure

The Topic 1.2 preview gives the complete result immediately after Problem 2. It states the greatest increase, the interval, the average rate, and the competing rates. This reveals the answer to the preceding Independent question. Keep only the preview question and the no-Topic-1.1-evidence label in student content. Put the verified result in a teacher solution or the source review report.

### Guided sign intervals

Guided Problem 2 says the function is below the x-axis on `[-4,-1]` and above it on `[-1,4]`, while it also says the graph crosses the axis at `x=-1`. Use `[-4,-1)` for negative values and `(-1,4]` for positive values. The point `x=-1` has value zero.

### Table interpolation wording

“Changes monotonically” can permit flat subintervals under the standard non-strict definition. It does not prove strict increase or decrease between every pair of inputs. State that temperature changes linearly between consecutive recorded hours, or explicitly state strict monotonic change with the direction for each pair. A linear assumption is the simpler existing convention.

### Test path and unrelated replay fixture

The new test reads the lesson through `process.cwd()`. This is not stable from the repository root or another workspace runner. Resolve the fixture from `import.meta.url` with `fileURLToPath`.

The new test takes its replay snapshot immediately after the first seed. It does not insert an unrelated phase section before replay. Therefore, it does not prove the stated requirement that replay preserves an unrelated section.

Before integration, add one unrelated section at an unused sequence in a current phase. Run the seed again. Assert that the row remains byte-semantically unchanged and that the selected source link remains unique. This is a small test-only correction. The shared helper appears to preserve extra rows, but the required regression must prove it.

## Verification

I ran the new parity test and the Q22 lifecycle test. All 10 tests passed. The author reports lint, build, and post-build standalone TypeScript as passed.
