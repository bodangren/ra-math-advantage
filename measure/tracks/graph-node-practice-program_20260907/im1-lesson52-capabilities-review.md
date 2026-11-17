# IM1 Lesson 5-2 Capability Source Review

## Source evidence

I reviewed the extracted lesson, class plan, original worksheet, and all rendered pages.

- Extracted lesson: `apps/integrated-math-1/curriculum/modules/module-5-lesson-2`
- Class plan: `apps/integrated-math-1/curriculum/module-5-class-period-plan.md`
- Original worksheet: `apps/integrated-math-1/curriculum/source-materials/practice-worksheet-student-bundle/Int1_0502_practice.docx`
- Rendered PDF: `/tmp/int1_0502_review_194609/render/Int1_0502_practice.pdf`
- Rendered pages: `/tmp/int1_0502_review_194609/render/page-1.png` through `/tmp/int1_0502_review_194609/render/page-5.png`
- Before copies: `/tmp/int1_0502_review_194609/before/`

Pages 1 and 2 contain Examples 1 through 9. Pages 3 through 5 contain mixed practice.

## Source correction

The extracted cricket model did not match the graph. The graph shows points `(0, 40)`, `(5, 45)`, `(10, 50)`, `(15, 55)`, and `(20, 60)`. The slope is 1 degree Fahrenheit for each chirp in 14 seconds. The source now uses `(20, 60)` and `y - 60 = 1(x - 20)`.

The other checked calculations are correct. Example 6 gives `2x + 3y = -13`. The Example 7 parallel line is `y = x - 5`. The Example 8 perpendicular line is `y = -x + 1`. The first Example 9 pair has slopes 4 and -4, so it is neither parallel nor perpendicular.

## Draft capability candidates

The source supports twelve candidates.

1. Write a point-slope equation from a point and slope.
2. Write a point-slope equation from two points.
3. Convert point-slope form to slope-intercept form.
4. Model a context in point-slope form.
5. Convert a linear equation to standard form.
6. Write a standard-form equation from two points.
7. Write a parallel line through a point.
8. Write a perpendicular line through a point.
9. Classify lines as parallel, perpendicular, or neither.
10. Graph a line from point-slope information.
11. Write a standard-form equation from intercepts.
12. Find a missing coordinate for collinear points.

Each candidate is draft and inactive. Each blueprint is source-only. Each edge is a draft `contains` edge from Lesson 5-2. This change adds no generator, prerequisite, equivalence, alignment, approval, or runtime claim.

## Source identities

The change preserves the seven prior IDs `.007` through `.013`. It corrects their broad titles to the visible source headings. The old extraction omitted Examples 4 and 6. These examples now use `math.im1.example.5.2.014` and `math.im1.example.5.2.015`. The new IDs do not replace an occupied ID.

## Verification

The new source test failed in all three cases before the correction. It passed after the source and catalog changes.

The current graph has 817 canonical nodes, 226 skill candidates, and 2,298 edges. It has 222 blueprint rows. Of these rows, 90 are source-only. Six generator bindings exist. The gap queue has 220 rows. The queue keeps its prior 208 rows in the same order and appends the twelve Lesson 5-2 rows.

## Caveats

Example 4 depends on a graph image. Future practice content must use the visible plotted points. Examples 7 and 8 share one worksheet heading and one prompt set. Both retained source IDs use the combined heading. Both parallel and perpendicular candidates reference both source IDs. The two candidate skills separate the response types. Mixed Exercises 37 and 44 through 55 add further evidence, but they do not have worked-example identities.
