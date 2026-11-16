# IM1 Lesson 10-1 source restoration report

## Result

The candidate is frozen at `/tmp/im1-g51-source-head-kk83le7a`.

The complete binary patch is `/tmp/im1-g51-source-final.patch`.

The patch has 19 paths:

- the extensionless Lesson 10-1 source file,
- one new source regression test,
- 14 PNG figures,
- three JPEG figures.

## Source preservation

The lesson contains all 23 numbered prompts. It keeps the `Example 1`, `Example 2`, and `Mixed Exercises` headings.

The lesson keeps the original premises and question wording. It keeps the average service times in Problem 3. It asks for two conclusions in Problem 4. It keeps all three routes in one Problem 17 model question. It keeps the curved-line diagrams in Problem 21. It keeps all three of Grant's conclusions in Problem 22.

The restoration does not add a solution or an answer key. It does not add a price converse. It does not add a straight-line condition. It does not claim that the protractor makes Problem 12 analytic.

Each native figure has an accessible description. The Problem 8 description keeps the P-Q and P′-Q′ endpoint structure. The Problem 16 descriptions identify the ball, cube, and can. The Problem 23 coordinate figure description keeps T(0, 0), V(5, 0), and U(5, 3).

All 17 files came directly from `word/media` in the committed DOCX. Their bytes equal the native DOCX entries.

## Test-driven development

The new source test first failed in four tests. The old lesson had no numbered prompt structure, no complete route constraints, no native image links, and no published native files.

After restoration, the focused source test passed: one file and four tests.

## Gates

Full curriculum and seed command:

`npm test --workspace=apps/integrated-math-1 -- --run __tests__/curriculum __tests__/convex/seed`

Result: 65 files passed. 391 tests passed.

Lint command:

`npm run lint --workspace=apps/integrated-math-1`

Result: passed with zero warnings.

Build command:

`npm run build --workspace=apps/integrated-math-1`

Result: passed.

Post-build TypeScript command from `apps/integrated-math-1`:

`npx tsc --noEmit`

Result: passed.

## Patch verification

The patch was generated against current main `HEAD`.

It has exactly 19 diff headers. It includes binary payloads for all 17 figures.

It applies cleanly to a fresh archive of current main `HEAD`.

After application, `cmp` confirmed exact candidate bytes for all 19 paths.

No graph, approval, seed, dependency, main-worktree, or deployment file changed.

## Independent review corrections

The refreeze uses the exact printed title separator `⸱`.

Problem 2 keeps both printed `Tshirts` forms. It keeps the separate printed `T-shirts` forms unchanged.

The Problem 8 accessible description gives P(-3, -1), Q(0, 6), P′(-3, 3), and Q′(0, 10). The focused test asserts these exact details.

All 17 image bytes are unchanged from the first freeze and still match the DOCX media.

The candidate also contains exact overlays of the six G52 paths listed in `/tmp/im1-g52-paths.txt` from commit `c808c365f`. These overlays were present for the final integration gates. They are excluded from the 19-path G51 source patch.

Final integrated curriculum and seed result: 66 files passed. 393 tests passed.

Final lint, build, and post-build TypeScript checks passed.

The refrozen patch has 19 diff headers and 17 binary patches. It applies to a fresh archive of current main `HEAD`. Exact byte comparison passed for all 19 source-owned paths.

## Parent verification

The parent checked all 23 numbered prompts and all 17 native image bytes. The parent accepted the corrected printed title, both Tshirts forms, and the four Problem 8 coordinate pairs. All 19 staged source paths match the frozen candidate. Parent integrated verification passed 393 curriculum and seed tests, lint, build, and post-build standalone TypeScript after the six committed G52 paths were overlaid. Final independent review accepts the correction. The source remains subject to the existing approval process.
