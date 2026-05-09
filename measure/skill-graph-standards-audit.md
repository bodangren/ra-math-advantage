# Skill Graph Standards Alignment Audit

Generated: 2026-05-09

## Summary Table

| Course | Skills | Worked Examples | High Conf | Medium Conf | Low Conf | Exceptions | Missing Stds | Review Queue |
|--------|--------|-----------------|-----------|-------------|----------|------------|--------------|---------------|
| im1 | 138 | 401 | 941 | 0 | 0 | 0 | 77 | 0 |
| im2 | 149 | 400 | 938 | 0 | 0 | 0 | 41 | 0 |
| im3 | 96 | 260 | 548 | 261 | 0 | 0 | 0 | 0 |
| precalc | 0 | 158 | 294 | 0 | 0 | 0 | 0 | 0 |

## Acceptance Criteria Status

- [x] Standard node inventories exist or are referenced for each course
  - IM3: 44 standards from seed data, all referenced codes have definitions
  - PreCalc: 36 standards from seed data, all referenced codes have definitions
  - IM1: 77 placeholder standard nodes created (no seed_standards.ts exists)
  - IM2: 41 placeholder standard nodes created (48 definitions; 41 referenced codes without definitions)
- [x] Every skill has at least one standard edge or exception
  - All courses: 0 exceptions (all nodes aligned)
- [x] Low-confidence mappings are listed in a review queue
  - All courses have 0 low-confidence edges (all alignments are high from lesson-standards, or medium from family objectives)
  - Review queue files written to `apps/<course>/curriculum/skill-graph/standards-review-queue.json`
- [x] Missing standards are listed in an audit report
  - IM1: 77 missing standard definitions (placeholder nodes created)
  - IM2: 41 missing standard definitions (placeholder nodes created)
  - IM3: 0 missing definitions
  - PreCalc: 0 missing definitions
- [x] Existing lesson-level mappings remain intact
  - All lesson-standard links consumed exactly as defined in seed files
  - `isPrimary` flag correctly propagates to edge weights (primary=0.8, secondary=0.5)
- [x] Validation catches dangling standard IDs and missing skill IDs
  - knowledge-space.v1 Zod schema validation passes for all 4 courses
  - `validateKnowledgeSpace()` passes for all 4 courses
  - No dangling edges, no duplicate IDs

## Validation Results

| Course | Nodes | Edges | Zod Valid | KS Valid |
|--------|-------|-------|-----------|----------|
| IM1 | 724 | 941 | ✓ | ✓ |
| IM2 | 722 | 938 | ✓ | ✓ |
| IM3 | 565 | 809 | ✓ | ✓ |
| PreCalc | 252 | 294 | ✓ | ✓ |

## Manual Review Checklist

Spot-checked 5+ skills/examples per course:
- IM3 skill "1b: Find and interpret the average rate of change" → HSF-IF.C.7c (high, primary), HSA-SSE.B.3 (high, merged), HSA-REI.B.4 (medium via families), HSF-IF.A.2 (medium via families). ✓ Matches source.
- IM1 skill "1a: Translate verbal descriptions" → 6.EE.A.2 (high, primary placeholder), 6.EE.A.1 (high, secondary). ✓ Matches source.
- IM2 skill "1b: Apply properties of circumcenters" → G-CO.C.9 (high, primary placeholder), G-GPE.B.4 (high, secondary). ✓ Matches source.
- PreCalc Example 1 in U1.1 → HSF-IF.B.4 (high, CED topic 1.1), HSF-BF.A.1 (high, CED topic 1.1). ✓ Matches CED.

## Tech Debt

1. **IM1 missing seed_standards.ts**: IM1 has 77 placeholder standard nodes without descriptions. These should be backfilled with official CCSS descriptions in a future track.
2. **IM2 standards gap**: 41 standards referenced in lesson-standards lack definitions in seed_standards.ts. Placeholder nodes were created.
3. **IM1 problem families missing**: No problem-family data exists for IM1, so no medium-confidence family-objective alignments are possible.
4. **PreCalc has 0 skill nodes**: T3 inventory produced only worked_examples for PreCalc. Skill-level alignment will need T5 (edge authoring) or manual skill extraction for PreCalc.