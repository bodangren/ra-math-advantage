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
import { suggestEdges } from '@math-platform/knowledge-space-core';
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
  outputPath: string;
  pilotEdgesPath?: string;    // existing reviewed edges to preserve
  pilotModuleKey?: string;    // metadata.module value to exclude from suggestion
}

const COURSES: CourseConfig[] = [
  {
    name: 'IM1',
    prefix: 'math.im1',
    nodesPath: 'apps/integrated-math-1/curriculum/skill-graph/draft-nodes.json',
    outputPath: 'apps/integrated-math-1/curriculum/skill-graph/edges.json',
  },
  {
    name: 'IM2',
    prefix: 'math.im2',
    nodesPath: 'apps/integrated-math-2/curriculum/skill-graph/draft-nodes.json',
    outputPath: 'apps/integrated-math-2/curriculum/skill-graph/edges.json',
  },
  {
    name: 'IM3',
    prefix: 'math.im3',
    nodesPath: 'apps/integrated-math-3/curriculum/skill-graph/draft-nodes.json',
    outputPath: 'apps/integrated-math-3/curriculum/skill-graph/edges.json',
    pilotEdgesPath: 'apps/integrated-math-3/curriculum/skill-graph/module-1/edges.json',
    pilotModuleKey: '1',
  },
  {
    name: 'PreCalc',
    prefix: 'math.precalc',
    nodesPath: 'apps/pre-calculus/curriculum/skill-graph/draft-nodes.json',
    outputPath: 'apps/pre-calculus/curriculum/skill-graph/edges.json',
  },
];

// ---------------------------------------------------------------------------
// Process each course
// ---------------------------------------------------------------------------

interface EdgeFile {
  edges: KnowledgeSpaceEdge[];
  meta?: Record<string, unknown>;
}

function generateCourse(config: CourseConfig): void {
  console.log(`\n▶  ${config.name}`);

  // Load draft nodes
  const nodesData = loadJson<{ nodes: KnowledgeSpaceNode[] }>(
    resolve(ROOT, config.nodesPath),
  );
  const allNodes = nodesData.nodes;
  console.log(`   Loaded ${allNodes.length} nodes`);

  // Load pilot edges if present (preserve reviewed M1 edges for IM3)
  let pilotEdges: KnowledgeSpaceEdge[] = [];
  let pilotEdgeIds = new Set<string>();
  if (config.pilotEdgesPath) {
    const pilotData = loadJson<EdgeFile>(resolve(ROOT, config.pilotEdgesPath));
    pilotEdges = pilotData.edges ?? [];
    pilotEdgeIds = new Set(pilotEdges.map((e) => e.id));
    console.log(`   Loaded ${pilotEdges.length} pilot edges from ${config.pilotEdgesPath}`);
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
    ...suggestedEdges.filter((e) => !pilotEdgeIds.has(e.id)),
  ];

  // Summary by type
  const byType: Record<string, number> = {};
  for (const e of mergedEdges) {
    byType[e.type] = (byType[e.type] ?? 0) + 1;
  }
  console.log(`   Total edges: ${mergedEdges.length}`);
  for (const [type, count] of Object.entries(byType).sort()) {
    console.log(`     ${type}: ${count}`);
  }

  // Renderer/generator edges (Task 3.1, 3.2):
  // For IM3 M1 these are in the pilot edges above.
  // For all other nodes/courses, no renderer/generator nodes exist yet.
  // Noted as review queue items (see edge-review-queue.json).
  const skillsWithoutRenderer = nodesToSuggest.filter((n) =>
    n.kind === 'skill' &&
    !mergedEdges.some((e) => e.type === 'rendered_by' && e.sourceId === n.id),
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
      suggestedEdges: suggestedEdges.length,
      totalEdges: mergedEdges.length,
    },
    edges: mergedEdges,
  };
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
