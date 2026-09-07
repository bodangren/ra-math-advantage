# IM1 Embedded Node Source Review

## Decision

The proposed node reconciliation is safe with one metadata correction.

Use `draft-nodes.json` as the source for all nonstandard embedded nodes. Use the 77 canonical standard nodes as the source for standard nodes. Keep the existing edge arrays unchanged.

This result matches the merge order in `scripts/generate-course-edges.ts`. The script puts draft nodes before standard nodes. Its `dedupeNodes` function keeps the first node for each ID. Thus, a standard-node copy cannot replace a draft-node copy with the same ID.

## Current Differences

The canonical catalog has 756 nodes. It contains 679 nonstandard nodes and 77 standard nodes. The draft catalog has the same 679 nonstandard IDs and content. The intentional `reviewStatus` values differ between the two catalogs.

`edges.json` has 746 embedded nodes. It is missing 10 current draft nodes. It also has 32 content conflicts. All 32 conflicts are worked-example rows.

`standard-edges.json` has 728 embedded nodes. It is missing 28 current draft nodes. It has 96 content conflicts. These conflicts include 95 worked-example rows and one skill row.

The 77 standard nodes in `standard-edges.json` exactly match the 77 canonical standard nodes. Their ID sets and full content match.

The current `edges.json` graph has 17 dangling edge endpoints because its embedded node list is stale. The proposed node set resolves all 17 endpoints. The proposed node set also resolves all endpoints in `standard-edges.json`.

## Required Metadata Correction

Update `edges.json` `meta.totalNodes` to 756.

Also update `edges.json` `meta.totalEdges` to 2,239. The file has 2,239 edges, but the current value is 2,230. An update to only `totalNodes` leaves a false current count.

Do not change `meta.suggestedEdges`. The file contains manually added source-correction edges. These edges are not output from `suggestEdges`. Do not change `meta.standardEdgesMerged`. The value 941 is a historical merge count. It does not match the current standard edge array, which has 931 rows.

Do not change `generatedAt`. This repair does not run either generator.

`standard-edges.json` does not have a node-count field. Do not add one. Its stale `alignmentStats.totalEdges` and `alignmentStats.highConfidence` values must change from 941 to 931. The unchanged array has 931 high-confidence edges. Its medium-confidence and low-confidence counts are both zero.

## Generator Safety

Do not run `scripts/generate-course-edges.ts` for this repair. The script calls `suggestEdges`. It can replace the existing course edge array and its review state.

Do not run `scripts/align-standards.ts` for this repair. The script regenerates all standard alignments. It also writes `standards-review-queue.json` and a new timestamp.

A direct embedded-node replacement gives the same node-source result without edge regeneration.

## Required Tests

Add tests for these conditions:

- The nonstandard embedded rows in both files exactly equal `draft-nodes.json`.
- The embedded standard rows exactly equal the canonical standard rows.
- Each embedded node ID occurs one time.
- `edges.json` has no dangling endpoints.
- `standard-edges.json` has no dangling endpoints.
- `edges.json` `meta.totalNodes` equals the embedded node count.
- `edges.json` `meta.totalEdges` equals the edge count.
- Both edge arrays are byte-equivalent to their saved baselines after JSON parsing.
- Existing edge `reviewStatus` values do not change.

## Scope Limit

This repair synchronizes embedded node copies. It corrects count fields from the unchanged arrays. It does not prove that the historical edge derivation is correct. It does not generate new edges, approve nodes, or change canonical nodes.

## Final Disposition

The final G13 repair is correct for this bounded scope.

Both embedded node arrays now have 756 nodes. Each node ID occurs one time. All 679 nonstandard rows exactly match `draft-nodes.json`. All 77 standard rows exactly match the canonical standard rows. Draft review status remains in both embedded copies.

The `edges.json` edge array is equal to `/tmp/im1-g13-edges.json.before` after JSON parsing. The `standard-edges.json` edge array is equal to `/tmp/im1-g13-standard-edges.json.before` after JSON parsing. Thus, the repair does not change an edge or its review status.

The final `edges.json` metadata reports 756 nodes and 2,239 edges. The final standard alignment statistics report 931 total edges, 931 high-confidence edges, zero medium-confidence edges, and zero low-confidence edges. These values match the current arrays. The repair keeps both timestamps unchanged. It adds no metadata field.

The final node sets have no dangling endpoints in either edge file. The repair does not change `nodes.json`, `draft-nodes.json`, or an edge array. The historical `standardEdgesMerged` value remains 941 and has an explicit historical meaning.
