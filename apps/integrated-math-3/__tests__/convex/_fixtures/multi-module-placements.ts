import type { Id } from '@/convex/_generated/dataModel';

/**
 * Multi-module placement fixtures for FR-4 Red tests.
 *
 * Contains placement rows spanning modules 1 and 2 of the IM3 skill graph.
 * Both node IDs are verified to exist in the root `skill-graph/nodes.json`
 * (574 nodes) and in their respective per-module shards.
 *
 * At HEAD (pre-fix), the handlers only load module-1 nodes via static
 * `import ... from '../curriculum/skill-graph/module-1/nodes.json'`.
 * A module-2 placement's nodeId will not appear in the projection output
 * because the module-2 node is not in the loaded graph.
 */

interface PlacementResultRow {
  _id: Id<'placement_results'>;
  _creationTime: number;
  studentId: Id<'profiles'>;
  nodeId: string;
  masteryEstimate: number;
  confidence: 'low' | 'medium';
  source: string;
  createdAt: number;
}

export const STUDENT_ID = 'profiles_test_multi_module' as Id<'profiles'>;

/**
 * Two placement rows — one in module 1, one in module 2.
 * Both have masteryEstimate >= 0.3 so they classify as 'ready' and are
 * not filtered out by the learnerState derivation.
 */
export const multiModulePlacementRows: PlacementResultRow[] = [
  {
    _id: 'placement_results_m1' as Id<'placement_results'>,
    _creationTime: 1_780_000_000_000,
    studentId: STUDENT_ID,
    nodeId: 'math.im3.skill.1.1.graph-quadratic-functions',
    masteryEstimate: 0.85,
    confidence: 'medium',
    source: 'placement',
    createdAt: 1_780_000_000_000,
  },
  {
    _id: 'placement_results_m2' as Id<'placement_results'>,
    _creationTime: 1_780_000_000_001,
    studentId: STUDENT_ID,
    nodeId: 'math.im3.skill.2.1.graph-and-analyze-polynomial-functions',
    masteryEstimate: 0.5,
    confidence: 'medium',
    source: 'placement',
    createdAt: 1_780_000_000_001,
  },
];

/** Expected module segments for assertion convenience. */
export const expectedModulesSeen = ['1', '2'];
