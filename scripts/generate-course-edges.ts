#!/usr/bin/env tsx
// Generate course-level edges.json files for all courses.
//
// Usage:  npx tsx scripts/generate-course-edges.ts
//
// Output:
//   apps/integrated-math-1/curriculum/skill-graph/edges.json
//   apps/integrated-math-2/curriculum/skill-graph/edges.json
//   apps/integrated-math-3/curriculum/skill-graph/edges.json
//   apps/pre-calculus/curriculum/skill-graph/edges.json
//
// For IM3: merges Module 1 pilot edges (already reviewed in T8) with
//          machine-suggested edges for Modules 2–9 only.
// For all other courses: runs suggestEdges on all draft nodes.
//
// Tasks: 3.1 (renderer edges — IM3 M1 only, via pilot merge),
//        3.2 (generator edges — IM3 M1 only, via pilot merge),
//        3.3 (misconception — no taxonomy yet, noted in review queue),
//        4.1–4.4 (course edge files).

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { suggestEdges, validateKnowledgeSpace } from '@math-platform/knowledge-space-core';
import type { KnowledgeSpaceNode, KnowledgeSpaceEdge } from '@math-platform/knowledge-space-core';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '..');

function loadJson<T>(filePath: string): T {
  return JSON.parse(readFileSync(filePath, 'utf-8')) as T;
}

function writeJson(filePath: string, data: unknown): void {
  writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
}

// ---------------------------------------------------------------------------
// Course configurations
// ---------------------------------------------------------------------------

interface CourseConfig {
  name: string;
  prefix: string;
  nodesPath: string;
  standardEdgesPath: string;
  outputPath: string;
  pilotEdgesPath?: string;    // existing reviewed edges to preserve
  pilotNodesPath?: string;    // existing pilot registry nodes needed by pilot edges
  pilotModuleKey?: string;    // metadata.module value to exclude from suggestion
}

const COURSES: CourseConfig[] = [
  {
    name: 'IM1',
    prefix: 'math.im1',
    nodesPath: 'apps/integrated-math-1/curriculum/skill-graph/draft-nodes.json',
    standardEdgesPath: 'apps/integrated-math-1/curriculum/skill-graph/standard-edges.json',
    outputPath: 'apps/integrated-math-1/curriculum/skill-graph/edges.json',
  },
  {
    name: 'IM2',
    prefix: 'math.im2',
    nodesPath: 'apps/integrated-math-2/curriculum/skill-graph/draft-nodes.json',
    standardEdgesPath: 'apps/integrated-math-2/curriculum/skill-graph/standard-edges.json',
    outputPath: 'apps/integrated-math-2/curriculum/skill-graph/edges.json',
  },
  {
    name: 'IM3',
    prefix: 'math.im3',
    nodesPath: 'apps/integrated-math-3/curriculum/skill-graph/draft-nodes.json',
    standardEdgesPath: 'apps/integrated-math-3/curriculum/skill-graph/standard-edges.json',
    outputPath: 'apps/integrated-math-3/curriculum/skill-graph/edges.json',
    pilotEdgesPath: 'apps/integrated-math-3/curriculum/skill-graph/module-1/edges.json',
    pilotNodesPath: 'apps/integrated-math-3/curriculum/skill-graph/module-1/nodes.json',
    pilotModuleKey: '1',
  },
  {
    name: 'PreCalc',
    prefix: 'math.precalc',
    nodesPath: 'apps/pre-calculus/curriculum/skill-graph/draft-nodes.json',
    standardEdgesPath: 'apps/pre-calculus/curriculum/skill-graph/standard-edges.json',
    outputPath: 'apps/pre-calculus/curriculum/skill-graph/edges.json',
  },
];

// ---------------------------------------------------------------------------
// Process each course
// ---------------------------------------------------------------------------

interface EdgeFile {
  edges: KnowledgeSpaceEdge[];
  nodes?: KnowledgeSpaceNode[];
  meta?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

const SPEC_WEIGHTS = [0.25, 0.5, 0.75, 1.0] as const;

function normalizeWeight(weight: number): number {
  return SPEC_WEIGHTS.reduce((closest, candidate) =>
    Math.abs(candidate - weight) < Math.abs(closest - weight) ? candidate : closest,
  );
}

function normalizeEdgeWeight(edge: KnowledgeSpaceEdge): KnowledgeSpaceEdge {
  const normalizedWeight = normalizeWeight(edge.weight);
  if (normalizedWeight === edge.weight) return edge;
  return {
    ...edge,
    weight: normalizedWeight,
    metadata: {
      ...(edge.metadata ?? {}),
      originalWeight: edge.weight,
      weightNormalization: 't5-review-remediation',
    },
  };
}

function normalizePilotEndpoint(
  id: string,
  config: CourseConfig,
): string {
  if (!config.pilotModuleKey) return id;
  const legacyLessonPrefix = `${config.prefix}.lesson.`;
  if (!id.startsWith(legacyLessonPrefix)) return id;
  const lesson = id.slice(legacyLessonPrefix.length);
  if (!/^\d+$/.test(lesson)) return id;
  return `${config.prefix}.lesson.${config.pilotModuleKey}.${lesson}`;
}

function normalizePilotEdge(
  edge: KnowledgeSpaceEdge,
  config: CourseConfig,
): KnowledgeSpaceEdge {
  const sourceId = normalizePilotEndpoint(edge.sourceId, config);
  const targetId = normalizePilotEndpoint(edge.targetId, config);
  if (sourceId === edge.sourceId && targetId === edge.targetId) return edge;
  return {
    ...edge,
    sourceId,
    targetId,
    metadata: {
      ...(edge.metadata ?? {}),
      originalSourceId: edge.sourceId,
      originalTargetId: edge.targetId,
      endpointNormalization: 't5-review-remediation',
    },
  };
}

function dedupeNodes(nodes: KnowledgeSpaceNode[]): KnowledgeSpaceNode[] {
  const seen = new Set<string>();
  const deduped: KnowledgeSpaceNode[] = [];
  for (const node of nodes) {
    if (seen.has(node.id)) continue;
    seen.add(node.id);
    deduped.push(node);
  }
  return deduped.sort((a, b) => a.id.localeCompare(b.id));
}

function dedupeEdges(edges: KnowledgeSpaceEdge[]): KnowledgeSpaceEdge[] {
  const seenIds = new Set<string>();
  const seenTriples = new Set<string>();
  const deduped: KnowledgeSpaceEdge[] = [];
  for (const edge of edges) {
    const tripleKey = `${edge.type}::${edge.sourceId}::${edge.targetId}`;
    if (seenIds.has(edge.id) || seenTriples.has(tripleKey)) continue;
    seenIds.add(edge.id);
    seenTriples.add(tripleKey);
    deduped.push(normalizeEdgeWeight(edge));
  }
  return deduped.sort((a, b) => a.id.localeCompare(b.id));
}

function generateCourse(config: CourseConfig): void {
  console.log(`\n▶  ${config.name}`);

  // Load draft nodes
  const nodesData = loadJson<{ nodes: KnowledgeSpaceNode[] }>(
    resolve(ROOT, config.nodesPath),
  );
  const allNodes = nodesData.nodes;
  console.log(`   Loaded ${allNodes.length} nodes`);

  const standardData = loadJson<EdgeFile>(resolve(ROOT, config.standardEdgesPath));
  const standardNodes = standardData.nodes ?? [];
  const standardEdges = standardData.edges ?? [];
  console.log(`   Loaded ${standardEdges.length} standards alignment edges`);

  // Load pilot edges if present (preserve reviewed M1 edges for IM3)
  let pilotEdges: KnowledgeSpaceEdge[] = [];
  let pilotNodes: KnowledgeSpaceNode[] = [];
  let pilotEdgeIds = new Set<string>();
  if (config.pilotEdgesPath) {
    const pilotData = loadJson<EdgeFile>(resolve(ROOT, config.pilotEdgesPath));
    pilotEdges = (pilotData.edges ?? []).map((edge) => normalizePilotEdge(edge, config));
    pilotEdgeIds = new Set(pilotEdges.map((e) => e.id));
    console.log(`   Loaded ${pilotEdges.length} pilot edges from ${config.pilotEdgesPath}`);
  }
  if (config.pilotNodesPath) {
    const pilotNodeData = loadJson<{ nodes: KnowledgeSpaceNode[] }>(
      resolve(ROOT, config.pilotNodesPath),
    );
    pilotNodes = pilotNodeData.nodes ?? [];
    console.log(`   Loaded ${pilotNodes.length} pilot nodes from ${config.pilotNodesPath}`);
  }

  // For courses with pilot edges, exclude pilot module nodes from suggestion
  // to avoid duplicating edges that were already carefully authored.
  let nodesToSuggest = allNodes;
  if (config.pilotModuleKey) {
    nodesToSuggest = allNodes.filter((n) => {
      const mod = n.metadata?.module;
      return typeof mod !== 'string' || mod !== config.pilotModuleKey;
    });
    // Always include domain node (no module metadata)
    const domainNode = allNodes.find((n) => n.kind === 'domain');
    if (domainNode && !nodesToSuggest.find((n) => n.id === domainNode.id)) {
      nodesToSuggest = [domainNode, ...nodesToSuggest];
    }
    console.log(`   Suggesting edges for ${nodesToSuggest.length} nodes (excluding module ${config.pilotModuleKey})`);
  }

  // Run edge suggestion
  const suggestedEdges = suggestEdges({
    nodes: nodesToSuggest,
    coursePrefix: config.prefix,
    // Use a prefix that won't collide with pilot edge IDs
    idPrefix: config.pilotEdgesPath
      ? `${config.prefix}.edge.m2plus`
      : config.prefix,
  });

  console.log(`   Suggested ${suggestedEdges.length} edges`);

  // Merge: pilot edges (preserved) + suggested edges (deduped against pilot)
  const mergedEdges: KnowledgeSpaceEdge[] = [
    ...pilotEdges,
    ...standardEdges,
    ...suggestedEdges.filter((e) => !pilotEdgeIds.has(e.id)),
  ];
  const dedupedEdges = dedupeEdges(mergedEdges);
  const mergedNodes = dedupeNodes([
    ...allNodes,
    ...standardNodes,
    ...pilotNodes,
  ]);

  // Summary by type
  const byType: Record<string, number> = {};
  for (const e of dedupedEdges) {
    byType[e.type] = (byType[e.type] ?? 0) + 1;
  }
  console.log(`   Total edges: ${dedupedEdges.length}`);
  for (const [type, count] of Object.entries(byType).sort()) {
    console.log(`     ${type}: ${count}`);
  }

  // Renderer/generator edges (Task 3.1, 3.2):
  // For IM3 M1 these are in the pilot edges above.
  // For all other nodes/courses, no renderer/generator nodes exist yet.
  // Noted as review queue items (see edge-review-queue.json).
  const skillsWithoutRenderer = nodesToSuggest.filter((n) =>
    n.kind === 'skill' &&
    !dedupedEdges.some((e) => e.type === 'rendered_by' && e.sourceId === n.id),
  );
  if (skillsWithoutRenderer.length > 0) {
    console.log(`   ⚠  ${skillsWithoutRenderer.length} skills without renderer edge (review queue)`);
  }

  // Misconception edges (Task 3.3): No taxonomy exists yet.
  // All skills flagged in review queue.
  const skillsWithoutMisconception = nodesToSuggest.filter((n) => n.kind === 'skill');
  if (skillsWithoutMisconception.length > 0) {
    console.log(`   ℹ  ${skillsWithoutMisconception.length} skills lack misconception taxonomy (deferred)`);
  }

  // Write output
  const output = {
    meta: {
      course: config.name,
      generatedAt: new Date().toISOString().split('T')[0],
      derivationMethod: 'lesson-sequence-suggestion-v1',
      pilotEdgesPreserved: pilotEdges.length,
      standardEdgesMerged: standardEdges.length,
      suggestedEdges: suggestedEdges.length,
      totalEdges: dedupedEdges.length,
      totalNodes: mergedNodes.length,
      normalizedWeights: dedupedEdges.filter((e) =>
        e.metadata?.weightNormalization === 't5-review-remediation',
      ).length,
    },
    nodes: mergedNodes,
    edges: dedupedEdges,
  };
  const validation = validateKnowledgeSpace({
    nodes: mergedNodes,
    edges: dedupedEdges,
  });
  if (!validation.valid) {
    throw new Error(
      `${config.name} generated graph failed validation: ${JSON.stringify(validation.errors, null, 2)}`,
    );
  }
  writeJson(resolve(ROOT, config.outputPath), output);
  console.log(`   ✓  Written to ${config.outputPath}`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

console.log('Generating course edge files…');
for (const course of COURSES) {
  generateCourse(course);
}
console.log('\nDone.');
