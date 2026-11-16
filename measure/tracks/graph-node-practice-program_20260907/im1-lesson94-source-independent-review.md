# IM1 G47 Lesson 9-4 source independent review

## Initial decision

Reject the first frozen source candidate.

The candidate does not preserve the original contexts. Its claimed Green log also contains two failed tests.

## Source defects

The first candidate changes these source facts:

- Problem 5 adds a 12-day condition that the prompt does not state.
- Problem 7 changes event attendance to a festival and adds thousands as a unit.
- Problem 8 changes books checked out by one student to books checked out by seven students.
- Problem 9 changes soda in 36-ounce cups to soda in 11 bottles.
- Problem 10 changes ages of riders on one roller coaster to ages of 18 roller coasters.
- Problem 20 changes counts of parked cars to parking-meter revenue in dollars.
- Problem 21 changes a hockey team's game totals to one player's totals.
- Problem 24 changes Renee's online gas-station search for a trip to her aunt's house to an aunt who records prices.
- Problem 26 changes randomly recorded high-school student shoe sizes to customer shoe sizes.

The candidate also shortens or changes source wording in Problems 6, 15, 22, 23, 25, and 27 through 30. A source restoration must retain the complete prompt conditions and labels. It must not replace them with inferred equivalents.

## Test and asset evidence

I inspected the actual file and the test log. `/tmp/im1-g47-source-green.log` reports two failed tests and four passed tests. The table-data assertion expects a comma-separated string that cannot occur in the Markdown table. The Problem 25 assertion expects the shared direction inside the Problem 25 body, although the direction occurs before its heading.

All three candidate PNG files are byte-identical to the three DOCX media files. This asset result does not fix the text defects.

## Required correction

Restore the complete DOCX wording for all 30 prompts and all subparts. Keep accessible tables and exact native assets. Add full-context regressions for the changed problems. Make the test parse table cells and shared directions correctly. Run the focused source suite again before a final review.

## Final review

Accept the corrected source-only candidate.

The corrected lesson restores the complete original contexts for all 30 problems. It preserves all shared directions and all subparts. It removes the invented festival, units, bottles, customer, player, revenue, and other changed contexts from the first candidate.

The lesson keeps the four example headings and Mixed Exercises separate. It preserves the unstated quartile, divisor, and rounding conventions. It adds no answer text. Problems 27 and 28 retain their exact reasoning prompts without an independence assumption.

The three accessible equivalents contain the exercise-minute values, the football year and carry values, and both Problem 27 statements. I compared all three candidate PNG files with the DOCX media files. All three files are byte-identical.

I ran the final focused source test independently. All 7 tests passed. The final author log also reports 7 passed tests. The corrected report accurately records the first invalid Green claim and the later context Red and Green runs.

The final patch contains five paths: one lesson file, one source test, and three PNG assets. It contains no graph or approval change.
