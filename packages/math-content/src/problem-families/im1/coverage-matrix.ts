import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { IM1_GENERATORS } from './generators';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CoverageStatus = 'served' | 'gap' | 'newComponent';

export type CoverageMatrixSkillEntry = {
  skillId: string;
  module: string;
  status: CoverageStatus;
  tier: 't17' | 't18' | 't19' | 'none';
  rendererKey: string;
  priority: 'high' | 'medium' | 'standard';
};

export type CoverageMatrixCounts = {
  served: number;
  gap: number;
  newComponent: number;
};

export type CoverageMatrixByModule = {
  module: string;
  totalSkills: number;
  served: number;
  gap: number;
  newComponent: number;
};

export type CoverageMatrix = {
  version: number;
  course: 'im1';
  totalSkills: number;
  counts: CoverageMatrixCounts;
  byModule: CoverageMatrixByModule[];
  skills: CoverageMatrixSkillEntry[];
};

// ---------------------------------------------------------------------------
// Rollout-artifact types (minimal shapes for parsing)
// ---------------------------------------------------------------------------

type RolloutNode = {
  id: string;
  kind: string;
  metadata?: { module?: string; course?: string; lesson?: string };
};

type RolloutNodesFile = {
  nodes: RolloutNode[];
};

type GapQueueEntry = {
  nodeId: string;
  module: string;
  rendererKey: string;
  priority: 'high' | 'medium' | 'standard';
};

type GapQueueFile = {
  queue: GapQueueEntry[];
};

type BlueprintEntry = {
  nodeId: string;
  rendererKey: string;
  metadata?: { module?: string };
};

type BlueprintsFile = {
  blueprints: BlueprintEntry[];
};

// ---------------------------------------------------------------------------
// Path resolution
// ---------------------------------------------------------------------------

const HERE = fileURLToPath(import.meta.url);
const PKG_ROOT = resolve(HERE, '../../../../../..');
const IM1_ROLLOUT_DIR = resolve(
  PKG_ROOT,
  'apps/integrated-math-1/curriculum/skill-graph',
);
const NODES_JSON = resolve(IM1_ROLLOUT_DIR, 'nodes.json');
const GAP_QUEUE_JSON = resolve(IM1_ROLLOUT_DIR, 'generator-gap-queue.json');
const BLUEPRINTS_JSON = resolve(IM1_ROLLOUT_DIR, 'blueprints.json');
const MATRIX_JSON = resolve(IM1_ROLLOUT_DIR, 'im1-coverage-matrix.json');

// ---------------------------------------------------------------------------
// buildCoverageMatrix
// ---------------------------------------------------------------------------

/**
 * Build the IM1 coverage matrix from rollout artifacts and the generator registry.
 * @returns Coverage matrix with per-skill status, counts, and module breakdowns
 */
export function buildCoverageMatrix(): CoverageMatrix {
  const nodes = JSON.parse(
    readFileSync(NODES_JSON, 'utf-8'),
  ) as RolloutNodesFile;
  const gapQueue = JSON.parse(
    readFileSync(GAP_QUEUE_JSON, 'utf-8'),
  ) as GapQueueFile;
  const blueprints = JSON.parse(
    readFileSync(BLUEPRINTS_JSON, 'utf-8'),
  ) as BlueprintsFile;

  const skills = nodes.nodes.filter((n) => n.kind === 'skill');

  // Build lookup maps from gap-queue and blueprints for rendererKey / priority.
  const gapByNodeId = new Map<string, GapQueueEntry>(
    gapQueue.queue.map((e) => [e.nodeId, e]),
  );
  const bpByNodeId = new Map<string, BlueprintEntry>(
    blueprints.blueprints.map((b) => [b.nodeId, b]),
  );
  const servedNodeIds = new Set(
    IM1_GENERATORS.flatMap((entry) => entry.nodeIds),
  );

  const matrixSkills: CoverageMatrixSkillEntry[] = skills.map((skill) => {
    const gap = gapByNodeId.get(skill.id);
    const bp = bpByNodeId.get(skill.id);
    const module = skill.metadata?.module ?? '0';
    const isServed = servedNodeIds.has(skill.id);
    const status: CoverageStatus = isServed ? 'served' : 'gap';
    const tier: CoverageMatrixSkillEntry['tier'] = isServed ? 't17' : 'none';

    const rendererKey =
      gap?.rendererKey ?? bp?.rendererKey ?? 'unknown';
    const priority = gap?.priority ?? 'standard';

    return {
      skillId: skill.id,
      module,
      status,
      tier,
      rendererKey,
      priority,
    };
  });

  // Sort skills by module (numeric) then skillId for deterministic output.
  matrixSkills.sort((a, b) => {
    const modDiff = Number(a.module) - Number(b.module);
    if (modDiff !== 0) return modDiff;
    return a.skillId.localeCompare(b.skillId);
  });

  // Aggregate by module.
  const moduleMap = new Map<
    string,
    { served: number; gap: number; newComponent: number; total: number }
  >();
  for (const s of matrixSkills) {
    const existing = moduleMap.get(s.module) ?? {
      served: 0,
      gap: 0,
      newComponent: 0,
      total: 0,
    };
    existing[s.status] += 1;
    existing.total += 1;
    moduleMap.set(s.module, existing);
  }

  const byModule: CoverageMatrixByModule[] = [...moduleMap.entries()]
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([module, agg]) => ({
      module,
      totalSkills: agg.total,
      served: agg.served,
      gap: agg.gap,
      newComponent: agg.newComponent,
    }));

  const counts: CoverageMatrixCounts = matrixSkills.reduce(
    (acc, skill) => {
      acc[skill.status] += 1;
      return acc;
    },
    { served: 0, gap: 0, newComponent: 0 } as CoverageMatrixCounts,
  );

  return {
    version: 1,
    course: 'im1',
    totalSkills: matrixSkills.length,
    counts,
    byModule,
    skills: matrixSkills,
  };
}
