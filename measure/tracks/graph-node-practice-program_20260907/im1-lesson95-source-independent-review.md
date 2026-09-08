# G48 Lesson 9.5 source independent review

## Decision

Accept the corrected frozen candidate.

The candidate preserves the 27 numbered prompts, their subparts, and the source contexts. It preserves all nine 36-value lists. It also preserves the college-visit context, the 2017 Supreme Court context, the presidential inauguration-age data, and the open research prompts. Problem 21 does not invent a raw data set or calculated statistics.

All 11 committed image files match the corresponding native DOCX media bytes. The candidate does not add answer keys or solution claims to the open prompts.

## Corrected findings

- The Problem 11 accessibility table now uses the exact source label `Wheeler Peak NM`.
- The elevation table does not add a `ft` unit that is absent from the native figure.
- Figure 9.5-6 now gives both horizontal ranges, the vertical range, the peak locations, and the relative curve widths.
- Figure 9.5-8 now gives the relative median locations, range, interquartile range, and box geometry. It correctly says that the upper median is closer to the right side of its box.
- Figure 9.5-10 now describes the whisker and median geometry for plots i, ii, and iii without stating the matches.
- Figure 9.5-11 identifies A, B, and C from left to right. It describes each visible shape without stating the matches.
- The focused test now asserts these source details.

## Verification

I ran:

```text
npm run test --workspace=apps/integrated-math-1 -- --run __tests__/curriculum/lesson-9-5-source.test.ts
```

Result: 7 tests passed.

The prior full-text and native-image byte verification remains unchanged. No candidate or main worktree file was changed during this review.
