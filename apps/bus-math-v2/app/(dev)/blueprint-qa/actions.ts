'use server';

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { KnowledgeBlueprint } from '@math-platform/knowledge-space-practice';
import type { SkillNode, GraphData } from './types';

export type { SkillNode, GraphData } from './types';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../../');

export async function fetchGraphData(): Promise<GraphData> {
  const skillGraphDir = path.join(REPO_ROOT, 'apps', 'integrated-math-3', 'curriculum', 'skill-graph');

  const nodesRaw = readFileSync(path.join(skillGraphDir, 'nodes.json'), 'utf-8');
  const blueprintsRaw = readFileSync(path.join(skillGraphDir, 'blueprints.json'), 'utf-8');

  const nodesData = JSON.parse(nodesRaw) as { nodes: SkillNode[] };
  const blueprintsData = JSON.parse(blueprintsRaw) as { blueprints: KnowledgeBlueprint[] };

  return {
    nodes: nodesData.nodes,
    blueprints: blueprintsData.blueprints,
  };
}
