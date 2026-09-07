# IM1 Lesson 4.1 Example Review

Date: 2026-09-07

## Result

The bounded Lesson 4.1 identity repair is correct. I found no blocking defect in the final diff.

The source has three example headings:

1. `Example 1 — Graph by Making a Table`
2. `Example 2 — Graph Using x- and y-Intercepts`
3. `Example 3 — Interpret Intercepts in Context`

The retained graph identities match these headings:

- `math.im1.example.4.1.001` matches Example 1.
- `math.im1.example.4.1.002` matches Example 2.
- `math.im1.example.4.1.004` matches Example 3.

The repair keeps each retained identifier. It changes only its title, source reference, and source metadata. It keeps each node kind and review status.

## Duplicate removal

`math.im1.example.4.1.003` combined parts of source Examples 2 and 3. It did not identify a fourth source example. The retained `002` and `004` nodes now represent those source headings exactly. Removal of `003` is correct.

The diff removes all four edges that referenced `003`:

- Two standard alignment edges.
- One `appears_in_context` edge.
- One `contains` edge.

The retained `002` node still has one `contains` edge and one `appears_in_context` edge. The retained standard mappings remain present. No surviving edge changed.

The practice projection removed two `003` references. The teacher projection removed two `003` references. References to `001`, `002`, and `004` did not change in either projection.

## Scope checks

The skill-node counts did not change:

- Canonical nodes: 159 skills.
- Draft nodes: 159 skills.
- Edges embedded nodes: 150 skills.
- Standard-edges embedded nodes: 138 skills.

The only status-count change in each catalog is the removal of the duplicate worked-example row. No retained node changed status.

The focused identity test passed with 2 tests. It checks all four graph catalogs and both derived projections.

## Existing catalog limits

The embedded catalog counts still differ from the canonical catalog. The current counts are 745 canonical nodes, 668 draft nodes, 735 edge-embedded nodes, and 719 standard-edge-embedded nodes. Earlier G8 and G9 work did not synchronize these catalogs. This G10 change does not claim to repair that existing assembly difference.

The historical `standardEdgesMerged` and alignment statistics remain stale. Task 3.1 owns that broader correction. These existing issues do not invalidate the bounded Lesson 4.1 identity repair.
