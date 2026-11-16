# IM1 Lesson 6-1 Independent Review

## Disposition

The graph repair is structurally safe and remains inactive. One source statement needs correction before integration.

The extracted lesson incorrectly groups the positive-coefficient Problems 43 and 52 with the negative-factor sign cases. The exact negative-factor cases are Problems 39 through 42, 44, 45, 48, 50, 51, 53, and 54. Problem 43 is `(2/3)h > 14`. Problem 52 is `4b <= -3`. Neither problem requires an inequality reversal. This error does not invalidate either proposed factor capability because the joint Examples 8–10 set contains direct positive-factor and negative-factor evidence. Correct the item list in the extracted lesson and the author review.

I found no graph blocker after this source-text correction.

## Source verification

I read the complete extracted lesson, the Module 6 class-period plan, the author review, and rendered pages 1 through 7 of `Int1_0601_practice.docx`.

- The class plan defines objective 6a for number-line graphing and translation. It defines objective 6b for one-step inequalities with all four operations and negative coefficients.
- The original uses the joint heading `Examples 8–10`. The three new source identities preserve this joint scope. They do not claim three different methods.
- Problem 29 is `6x + 5 >= 7z`. The repair correctly keeps two variables. It does not reduce the item to a numeric number-line solution.
- Problem 81 states `a != 0`. A correct solution requires separate cases for `a > 0` and `a < 0`.
- Problem 82 requires positive, negative, and undefined reciprocal cases. The proposed reciprocal-order candidate matches this reasoning task.
- The number-line boundaries and directions for Problems 7 through 12 match the rendered figures.
- The whole-unit conclusions are correct. Problem 75 requires at least `$22.23` when charges use cents. Problem 76 requires at least 9 whole apples. Problem 78 requires at least 74 points for a whole-number score.

## Capability and mapping review

The 15 candidates separate the source actions without adding unsupported mastery claims. The open or closed endpoint and ray direction remain evidence requirements for a number-line task. They do not need separate nodes.

The mappings for `.001` through `.007` match the visible headings and tasks. The source-only mappings for Candidates 11 through 15 are correctly empty. The joint `.source-008` through `.source-010` mapping is intentionally redundant because the source gives one shared heading and one mixed problem set.

All 15 new blueprints are source-only and draft. All new containment edges are draft. The repair adds no prerequisite edge, equivalence edge, standards edge, generator binding, or approval.

## Preservation check

I compared the current catalogs with HEAD.

- No existing node ID was removed.
- The only changed existing node records are `.001` through `.007`. Their changes are the requested source-title corrections.
- The catalogs add 18 records: 3 source identities and 15 skill candidates.
- No existing edge was removed or changed.
- `edges.json` adds only 18 draft `contains` edges.
- `standard-edges.json` keeps all 931 existing edges without a change.
- No existing blueprint or queue row was removed or changed. Each file appends the 15 new candidate rows.

## Verification

`npx vitest run __tests__/curriculum/lesson-6-1-capabilities-source.test.ts` passes 5 tests.

This review does not approve the new candidates. They remain inventory-only until a later content and assessment review.

## Parent correction and integration checks

The parent inspected original pages 1 and 4. Page 1 confirms Problem 29 uses `7z`. Page 4 confirms that Problems 43 and 52 have positive coefficients. The extraction and author report now exclude both problems from the negative-factor list. The listed solutions remain correct.

The parent compared all graph catalogs with HEAD. All prior identities and edges remain. The only changed prior node records are Examples 1 through 7. The queue retains all previous rows. Five focused tests, app lint, standalone TypeScript, and production build pass. This repair remains draft source inventory.
