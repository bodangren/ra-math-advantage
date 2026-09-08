# IM1 G43 Lesson 8-6 graph independent review

## Disposition

Accept the bounded graph patch.

I found no blocking graph, identity, projection, or test defect.

## Verified graph scope

The patch adds six skill nodes. It repairs stable 8j as general recursive evaluation. It keeps stable 8k as a draft source-only aggregate. All eight Lesson 8-6 skill rows are draft and have `independentPracticeReady:false`.

The patch preserves source ID `.020` as a rejected duplicate. It sets `.019` and `.021` through `.024` to draft. The selected source and skill records are equal in `nodes.json`, `draft-nodes.json`, `edges.json`, and `standard-edges.json`.

The six new source references match the accepted response boundaries. They separate displayed-term rule writing, graph rule writing, and the four formula-conversion direction and family combinations. The displayed-term row identifies Problem 40 as finite-list evidence. Its description states that more than one rule can reproduce a finite list.

The six new blueprints use only reviewed source-node IDs. Mixed-problem evidence remains in exact source references and does not invent a source node. Stable 8j and 8k are source-only. No selected blueprint has a Worked, Guided, or Independent mode specification.

## Verified edges and projections

The semantic edge comparison gives these exact changes:

- Add six containment edges for the new skills.
- Add three containment edges for reviewed reuse.
- Remove duplicate edge `math.im1.edge.1050`.
- Change only the rationale of `math.im1.edge.1055` and `math.im1.edge.1056`.
- Keep all 942 standard edges unchanged.

The resulting Lesson 8-6 capability containment has six new skills, stable 8j, broad 8k, and three reused skills. The rejected `.020` row has no containment.

Each of the eight Lesson 8-6 skill rows has one inactive SRS planning row with `generatorReady:false`. Each has one generator-gap row. None has a projected practice activity. This removes the six placeholder activities for stable 8j and 8k without adding a readiness or evidence claim.

The reported derived counts match the candidate:

- 988 canonical nodes
- 2,504 graph edges
- 390 skill rows
- 389 non-rejected skill rows
- 386 blueprints
- 383 generator-gap rows
- 215 SRS planning rows
- 360 practice activities
- 119 approved skill rows

## Test review

The new permanent test reads current graph artifacts. It does not read Git history or a fixed baseline commit. It checks all four catalog copies, exact source boundaries, source-only blueprints, the complete Lesson 8-6 skill containment, the rejected duplicate, the removed edge, the two retained rationale changes, and Problem 40 nonuniqueness.

I ran the new test with the three affected reuse tests. All 29 tests passed.

The author also reports these successful gates:

- 231 curriculum and seed tests
- 37 coverage and audit tests
- 48 final graph, coverage, and audit tests
- lint
- build
- standalone TypeScript after build

## Scope limit

The graph patch does not include the Lesson 8-6 source lesson, assets, or source tests. Those files came from the separate source repair. The graph rows remain draft and inactive. This review does not approve practice generation or publication.
