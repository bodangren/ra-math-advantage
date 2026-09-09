# IM2 Lesson 1.4 source restoration review

Accepted commit: `4b858feac`.

## Source correction

The lesson now contains all 39 original worksheet prompts. It preserves Example 1, the combined Examples 2 and 3 heading, Example 4, and Mixed Exercises. It reuses all 19 native figures. It adds no supplied solution. Three supported original lesson goals remain. The incorrect sum-of-two-sides theorem goal and definition are removed.

Parent review inspected all 19 native images and four rendered pages from the committed Word document. The existing public images match the embedded bytes. Visual problem order differs from XML media order for Problems 6 through 11 and Problems 15 and 16. The source and regression use the verified visual order. Problem 13 has no figure. Mathematical segment and triangle terms are preserved. Figure descriptions state givens without supplying answers.

The original render crops parts of Problems 15 and 16 and Problems 26 and 27. The review used the complete original XML and media for those tasks. It did not infer missing text from the cropped pages.

## Required generated outputs

The existing build contract requires both the lesson bundle and calendar outputs. The source-only and three-path freezes failed these freshness checks. The final six-path batch includes the lesson source, source test, lesson bundle, calendar, Unit 1 period package, and Module 1 plan. No generator changed.

Only Lesson 1.4 changes among 96 lesson records. Only m1-p06 changes among 180 calendar periods. Its actual combined example heading replaces the synthetic heading. The three supported goals keep the existing instruction objective valid. All lesson and period IDs retain their order. The other 95 lessons, 179 periods, 12 unit packages, 12 module plans, and activity map remain unchanged.

## Verification

The new source test failed before restoration. The lesson bundle assertion failed before generation. The parent goal and calendar assertion failed before the final dependency repair. The final focused test passes all eight cases. Parent lint, build, and separate post-build TypeScript pass.

A separate reviewer accepted the original transcription and identified the incomplete generated dependency set. After the parent corrected it, the original source author independently reviewed the parent’s goal and generated-output changes. That review reconstructed all six files from the patch and verified exact candidate bytes. Parent review also checked all native figures and the complete generated differences.

All six staged files matched the accepted candidate. All six main paths were clean before integration and were materialized from the commit. Unrelated main changes remain intact.

## Remaining work

This is source restoration, not graph or practice completion. The occupied .013 through .016 graph IDs remain unchanged. Their old phase metadata and the shared Examples 2 and 3 identity require a later correction. Source approval, exact capability mapping, and usable Worked, Guided, and Independent practice remain open.

## Cleanup

Remove completed source extracts, renders, baseline copies, patches, path lists, review reports, and gate logs after this report is committed. The native Word document and all figures remain in the repository. Keep the shared candidate for active IM3 work. Only the main checkout remains registered with Git.
