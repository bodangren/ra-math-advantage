# IM1 Lesson 10-2 source independent review

## Verdict

Reject pending three bounded accessibility corrections.

The lesson preserves all 50 numbered prompts, the original directions, the two explicit Problem 31 subparts, and the mathematical line notation. The 14 published image files match the DOCX media through the focused byte-comparison test. The focused suite passes 3 tests. I found no changed prompt text or invented teaching section.

## Required corrections

### Figure 8

The current text is improved, but it does not fully state the visible lower triangle structure. Use a neutral description that gives the visible incidence data:

`A labeled three-dimensional figure. Segments form upper triangle F-E-D-F. Points A, B, and C lie in plane W. Segments A-B and B-C are visible, and segment A-C is dashed. Segments F-A, E-B, and D-C connect the two triangles.`

This describes the source marks. It does not state a plane count or a coplanarity answer.

### Figure 9

The current text only lists labels A through H. A learner who cannot see the image cannot determine which labeled edges are formed by adjacent roof and wall faces for Problem 29.

Add the visible vertex and segment arrangement without stating the requested answer list. A sufficient neutral description is:

`A house with upper vertices A, B, G, H, and F and lower wall vertices C, D, and E. Visible segments connect A-B, A-G, A-H, B-H, G-F, H-F, B-C, H-D, F-E, C-D, and D-E. The roof and two exterior wall faces meet along these labeled boundaries.`

Verify the final segment list once more against the native image before use. The description must preserve the visible shared-edge arrangement. It must not add hidden edges.

### Figure 10

The current text gives the horizon and receding lines. It does not describe the flat surfaces that Problem 31b asks the learner to identify.

Add a neutral structural statement such as:

`The drawing shows vertical building faces and side faces bounded by vertical and receding lines. It also shows a flat ground surface below the buildings.`

This supplies the visual structure needed for an accessible response. It does not give a fixed answer key because multiple visible planes remain valid.

## Verified source details

- The source title is `Points, Lines, and Planes ⸱ Practice`.
- Example 1 through Example 5 and Mixed Exercises remain separate source groups.
- Problems 20, 32, 33, 39, and 41 preserve line notation.
- Problem 36 correctly asks for a point on line `n`.
- Problem 41 does not say that point H is outside plane B.
- Problems 47 through 50 preserve their labels and complete wording.
- Figure 1 includes line `p`, point `L`, both plane labels, and the required line directions.
- Figure 8 includes dashed segment A-C in the current text and test.
- Figure 11 gives the line-to-point incidence facts needed for Problems 35 through 38.
- Figure 13 preserves both printed student claims.

## Test assessment

Command:

`npx vitest run __tests__/curriculum/lesson-10-2-source.test.ts`

Result: 3 tests passed.

The test verifies all 50 headings, source groups, critical prompt fragments, all 14 media links, and all 14 native byte comparisons. Add exact assertions for the completed Figure 8, Figure 9, and Figure 10 descriptions. The current Figure 8 assertions do not require all lower-triangle segments. The test has no useful accessibility assertion for Figure 9 or the plane-bearing surfaces in Figure 10.

No answer key, graph record, approval state, or generic teaching content is required for this correction.
