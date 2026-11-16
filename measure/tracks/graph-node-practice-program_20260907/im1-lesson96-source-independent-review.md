# Independent G49 Lesson 9-6 source review

Result: Accept.

Candidate: `/tmp/im1-g49-source-head-20260908.koZ3PG`

Patch: `/tmp/im1-g49-source-final.patch`

## Source parity

The 12-path patch contains one lesson file, one focused source test, and 10 native PNG files. It does not change the graph.

The lesson preserves all 33 numbered problems. It preserves every listed subpart. It preserves the four printed headings: Example 1, Example 2, Examples 3 and 4, and Mixed Exercises.

The lesson preserves the exact transformation lists and operation order. Problems 15 and 16 have separate 12-value lists. Problem 16 multiplies by 3 and then adds −8. Problem 19 adds −7 and then multiplies by 2. Problem 20 multiplies by 2 and then adds 5.

The lesson restores the Office Math multiplication signs in Problems 5–8. It restores the complete Celsius rule `C = (5/9)(F – 32)` in Problem 23.

The Problem 23 accessible table now contains `40, 45, 55, 65, 74, 82, 86, 85, 78, 67, 55, 44`. The corrected value is 86. The prior incorrect value 88 is absent from this table.

The accessible tables preserve all values and pairings from the 10 native figures. They preserve names, labels, units, and contexts. The lesson does not invent rival prices, population data, or an answer key.

The transformation note correctly multiplies mean, median, and each mode by signed `k`. It multiplies range and standard deviation by `|k|`.

## Native assets and tests

An independent byte comparison confirms that each published PNG is identical to `word/media/image1.png` through `word/media/image10.png` in the DOCX.

The focused source suite passes all 5 tests. The test checks all 33 problem headings, all source subparts, the Office Math content, all accessible native-table values, all 10 image references, all 10 native-image byte comparisons, and the corrected negative-multiplier rule.

The source restoration is ready for parent integration.
