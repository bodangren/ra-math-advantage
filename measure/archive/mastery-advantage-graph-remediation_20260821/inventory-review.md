# Mastery Advantage Inventory Review

**Track:** `mastery-advantage-graph-remediation_20260821`

**Review state:** Baseline recorded. No mastery inventory is approved by a
numeric category count.

## Boundary

IM1, IM2, IM3, and AP Precalculus remain one logical course-series graph. The
existing course projections are the inventory boundary:

- [IM1 nodes](../../../../apps/integrated-math-1/curriculum/skill-graph/nodes.json)
  and [edges](../../../../apps/integrated-math-1/curriculum/skill-graph/edges.json)
- [IM2 nodes](../../../../apps/integrated-math-2/curriculum/skill-graph/nodes.json)
  and [edges](../../../../apps/integrated-math-2/curriculum/skill-graph/edges.json)
- [IM3 nodes](../../../../apps/integrated-math-3/curriculum/skill-graph/nodes.json)
  and [edges](../../../../apps/integrated-math-3/curriculum/skill-graph/edges.json)
- [AP Precalculus nodes](../../../../apps/pre-calculus/curriculum/skill-graph/nodes.json)
  and [edges](../../../../apps/pre-calculus/curriculum/skill-graph/edges.json)
- [cross-course edges](../../../../packages/math-content/src/knowledge-space/cross-course-edges.json)

Business Math is outside this graph. Its problem family registry is a
capability catalog and is not a curriculum skill inventory.

## Baseline facts

| Area | Existing artifact fact | Inventory decision |
|---|---:|---|
| Course-series node rows | 2,272 rows and 2,249 unique IDs | Keep the existing projections. Do not publish this as a skill total. |
| Course-series `skill` rows | 456 | Review by source and capability. Do not use the count as eligibility. |
| Course-series `concept` rows | 103 | Keep as aggregators unless a source review proves an assessable capability. |
| IM3 runtime projection rows | 174 | Reconcile node kind before any practice or SRS decision. |
| AP Precalculus graph rows | 73 mixed-granularity rows | Unresolved until one approved granularity rule covers the source. |
| Business Math objective strings | 261 unique published strings | Use published objectives as the source boundary. |
| Business Math problem families | 19 | Record as capability links only. Do not create one node per family. |
| Cross-course equivalence edges | 5,024 draft edges | Preserve the file. Draft edges cannot authorize mastery, readiness, or transfer. |

## Source review rules

Each proposed mastery row must identify an assessable student capability, an
authored curriculum source, and a stable graph identity. A `concept` row is not
a direct SRS or practice target. A problem family is not a skill. A topic,
standard, lesson, renderer, or generator count is not a skill decision.

## Proposed and unresolved rows

No row is approved for reclassification, split, merge, or removal in this
baseline review. The following decisions remain unresolved and require the
source review described in the track plan:

| Course | Current area | Source reference | Runtime state | Proposed disposition | Rationale |
|---|---|---|---|---|---|
| IM3 | Current concept rows used by the SRS projection | `apps/integrated-math-3/curriculum/skill-graph/nodes.json`; IM3 projection files | Some rows are direct runtime targets | unresolved | The source may define an assessable capability or an aggregator. No node kind change is safe without row-level review. |
| AP Precalculus | Current mixed-granularity rows, including Unit 4 | `apps/pre-calculus/curriculum/source/college-board/ced-topic-index.json`; `apps/pre-calculus/curriculum/topics/` | Existing projection is withdrawn from runtime rollout decisions | unresolved | Units do not yet provide one approved capability granularity. Unit 4 has no approved local learning-objective inventory. |
| Business Math | Current family-derived rows | `apps/bus-math-v2/lib/curriculum/published-manifest.ts`; lesson objectives | Fabricated family graph removed from runtime decisions | unresolved | The published objectives must define the capabilities. A family can map to zero, one, or many approved rows. |

## Current conclusion

The repository keeps one course-series graph and one separate Business Math
curriculum source boundary. The former rollout counts are incident facts only.
The bounded pilots remain available. New broad runtime eligibility remains
disabled until a row-level source decision is approved.
