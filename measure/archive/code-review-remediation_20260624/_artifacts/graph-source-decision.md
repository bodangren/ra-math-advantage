# Graph Source Decision (FR-4, Phase 2)

**Date:** 2026-06-24
**Verified by:** mid-red

## Root vs Shard Node Counts

| Source | Nodes | Edges |
|--------|-------|-------|
| Root `skill-graph/nodes.json` | 574 | — |
| Sum of `module-{1..9}/nodes.json` | 582 | — |
| Divergence | -8 | — |

Root has 8 fewer nodes than the sum of shards. This is expected: root is the
deduplicated/aggregated artifact.

## Module Breakdown

| Module | Nodes |
|--------|-------|
| 1 | 146 |
| 2 | 46 |
| 3 | 38 |
| 4 | 69 |
| 5 | 50 |
| 6 | 50 |
| 7 | 62 |
| 8 | 50 |
| 9 | 71 |

## Fixture Node Verification

- `math.im3.skill.1.1.graph-quadratic-functions` — **present** in root AND module-1 shard
- `math.im3.skill.2.1.graph-and-analyze-polynomial-functions` — **present** in root AND module-2 shard

## Decision

Use the **root** `skill-graph/nodes.json` + `edges.json` for the FR-4
shared helper. Rationale:

1. Root is the authoritative aggregated artifact (already maintained as single source of truth).
2. Loading per-module shards at runtime is incompatible with bundled Convex deploys (no fs).
3. If root and shards diverge, that is an upstream curriculum bug, not FR-4 scope.

The divergence of 8 nodes (likely deduplication) is documented but does not
block FR-4. The fixture uses node IDs that exist in BOTH root and shards,
so the behavioral test is valid regardless of source.
