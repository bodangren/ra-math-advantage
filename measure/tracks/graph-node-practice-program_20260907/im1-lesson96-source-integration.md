# G49 Lesson 9-6 source restoration report

The candidate is `/tmp/im1-g49-source-head-20260908.koZ3PG`.

The patch is `/tmp/im1-g49-source-final.patch`.

The patch uses the full repository `HEAD` index as its baseline. It contains 12 paths. These paths are the lesson source, one source test, and 10 native PNG files.

The lesson restores all 33 numbered prompts and all source subparts. It preserves the four printed headings. It preserves all names, contexts, labels, units, data values, multiplication signs, and the Celsius fraction. It keeps Problems 15 and 16 as separate 12-value lists. It preserves the operation order in Problems 16, 19, and 20.

Each native figure has an accessible table. The test checks every reviewed table value and every paired row. The corrected temperature list is `40, 45, 55, 65, 74, 82, 86, 85, 78, 67, 55, 44`. Each published PNG has the same bytes as the corresponding DOCX image.

The lesson corrects the negative-multiplier statement. It multiplies mean, median, and each mode by `k`. It multiplies range and standard deviation by `|k|`.

The patch does not change the graph. It does not approve the provisional capability proposal. It does not add answers or scoring conventions.

Verification passed:

- Lesson 9-6 source test: 5 tests.
- All Module 9 source tests: 10 files and 98 tests.
- Integrated Math 1 lint.
- Integrated Math 1 build.
- Standalone TypeScript check with `tsc --noEmit`.
- Git patch whitespace check.

Logs:

- `/tmp/im1-g49-module9-tests.log`
- `/tmp/im1-g49-lint.log`
- `/tmp/im1-g49-build.log`
- `/tmp/im1-g49-tsc.log`

## Parent integration

The parent inspected all 33 prompts and all 10 native images. The first candidate transcribed 86°F as 88°F. The corrected candidate and its full-table regression use 86°F. Independent review accepts all source text, tables, operation order, Office Math notation, and native image bytes.

The parent overlaid the committed Lesson 9-5 graph before running the complete curriculum and seed suite, lint, build, and standalone post-build TypeScript. All checks pass. The 12 integrated source paths match the tested candidate bytes. The parent rebuilt the patch with binary content because the author patch listed the PNG differences without their content. The graph is unchanged by this source commit.
