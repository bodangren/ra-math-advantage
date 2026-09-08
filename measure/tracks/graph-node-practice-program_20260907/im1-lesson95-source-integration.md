# G48 Lesson 9-5 source restoration report

## Scope

This candidate restores the Lesson 9-5 source only. It does not change the skill graph or source approval state.

Candidate: `/tmp/im1-g48-source-head-20260908.Bht5R8`
Base commit: `7be7b3e223fda56246e09f9b9a774acaf1b1c245`
Patch: `/tmp/im1-g48-source-final.patch`

## Changes

- Restored the exact source wording for all 27 problems and all source subparts.
- Restored all nine complete 36-value lists.
- Preserved source names, dates, contexts, and printed table labels.
- Added accessible tables for native data figures.
- Added all 11 native PNG files byte for byte from `Int1_0905_practice.docx`.
- Restored the visible A, B, and C labels that the DOCX stores outside image 11.
- Described the visible axes and shapes in image 6.
- Described median, quartile, and whisker relationships in images 8 and 10.
- Described each labeled histogram in image 11 without giving a matching answer.
- Added a source restoration test with seven checks.

## Verification

- Initial red test: 7 of 7 checks failed before restoration. See `/tmp/im1-g48-source-red.log`.
- Correction red test: 2 checks failed before the review corrections. See `/tmp/im1-g48-source-correction-red.log`.
- Focused source test: 7 of 7 checks pass. See `/tmp/im1-g48-source-correction-green.log`.
- Module 9 source tests: 31 of 31 checks pass. See `/tmp/im1-g48-source-curriculum.log`.
- Integrated Math 1 lint: pass. See `/tmp/im1-g48-source-app-lint.log`.
- Integrated Math 1 build: pass. See `/tmp/im1-g48-source-build.log`.
- Post-build TypeScript check: pass. See `/tmp/im1-g48-source-tsc.log`.
- `git diff --check`: pass.

The build reports existing Vinext middleware and route-classification notices. It completes successfully.

## Final geometry correction

- Corrected the upper box plot median. It is closer to the right side of its box.
- Added the visible mapping: the histograms are A, B, and C from left to right.
- Final correction red test: one figure-description check failed before the correction. See `/tmp/im1-g48-source-final-correction-red.log`.
- Final focused source test: 7 of 7 checks pass. See `/tmp/im1-g48-source-final-correction-green.log`.
- Repeated Module 9 source tests, lint, build, TypeScript, and diff checks. All pass.

## Parent integration

Independent review accepts the final source. Parent inspection checked all 11 native images. The final seven source tests, lint, build, and post-build standalone TypeScript passed with workspace packages resolved inside the candidate. Source approval and graph implementation remain open.
