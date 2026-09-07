# IM1 Lesson 4-3 source note

Status: Author source inventory. Independent review is required.

## Source decision

The full lesson has four explicit goals. The class-period plan combines them into objectives 4f and 4g. The graph retains the existing combined 4f identity and review state. It did not contain a 4g skill identity. The four new atomic source capabilities restore the missing 4g content without creating a 4g aggregate.

- Write a slope-intercept equation from a slope and y-intercept. Example 1 directly demonstrates this capability.
- Rewrite a standard-form equation in slope-intercept form. Example 2 directly demonstrates this capability.
- Model a context and interpret slope and intercept. Examples 3 and 7 directly demonstrate this capability.
- Graph a linear function from slope-intercept or standard form. Examples 4 through 7 directly demonstrate this capability.

The four new nodes are draft and inactive. Their blueprints contain source identity only. They have no renderer, mode specification, generator, prerequisite, equivalence, standard alignment, or approval.

## Example correction

The seven retained example IDs and example numbers did not change. Their titles now match the full lesson headings. The same corrected node rows are in `nodes.json`, `draft-nodes.json`, `edges.json`, and `standard-edges.json`.

## Relationship decision

Each new capability has one draft lesson-containment edge in `edges.json`. No other relationship was added. Existing same-ID relationships and evidence mappings were not changed. Standard edges remain unchanged.

## Verification

The new source test failed in all three sections before the catalog change. It passed after the change. Oxlint and TypeScript passed. The focused source and embedded-node checks passed 14 tests in four files before the metadata count correction. The final rerun passed eight tests in the two affected files.

## Derived inventory synchronization

The current graph has 171 skill candidates. Six have registered generator bindings. The generator gap queue now has 165 rows. The four Lesson 4-3 rows are appended after all prior rows. Existing row order did not change.

The coverage matrix now reports 171 total skill candidates, 6 registered generator bindings, and 165 gaps. Module 4 now reports 20 candidates.

The current blueprint inventory has 167 rows. Six rows have three schema-valid mode specifications. A further 126 rows have three empty mode specifications. The 35 source-only rows have no mode specifications. Four skill candidates do not have blueprint rows.

The audit keeps the frozen 138-skill denominator in its historical sections. It labels the live total as current skill candidates.
