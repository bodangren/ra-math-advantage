#!/usr/bin/env tsx
// Generate cross-course equivalent_to edges across IM1, IM2, IM3, and PreCalc.
//
// Usage:  npx tsx scripts/generate-cross-course-edges.ts
//
// Output:
//   packages/math-content/src/knowledge-space/cross-course-edges.json
//   measure/skill-graph-cross-course-equivalence-audit.md

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  findCrossCourseEquivalences,
  validateCrossCourseEdges,
  computeEquivalenceComponents,
} from '@math-platform/knowledge-space-core';
import type {
  KnowledgeSpaceNode,
  KnowledgeSpaceEdge,
} from '@math-platform/knowledge-space-core';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '..');

function loadJson<T>(filePath: string): T {
  return JSON.parse(readFileSync(filePath, 'utf-8')) as T;
}

interface WrappedGraph {
  nodes: KnowledgeSpaceNode[];
}
interface WrappedEdges {
  edges: KnowledgeSpaceEdge[];
}

function loadNodes(filePath: string): KnowledgeSpaceNode[] {
  const data = loadJson<WrappedGraph | KnowledgeSpaceNode[]>(filePath);
  if (Array.isArray(data)) return data;
  return data.nodes ?? [];
}

function loadEdges(filePath: string): KnowledgeSpaceEdge[] {
  const data = loadJson<WrappedEdges | KnowledgeSpaceEdge[]>(filePath);
  if (Array.isArray(data)) return data;
  return data.edges ?? [];
}

function writeJson(filePath: string, data: unknown): void {
  writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
}

// ---------------------------------------------------------------------------
// Course configurations
// ---------------------------------------------------------------------------

const COURSES = [
  {
    courseId: 'im1',
    label: 'Integrated Math 1',
    nodesPath: 'apps/integrated-math-1/curriculum/skill-graph/nodes.json',
    edgesPath: 'apps/integrated-math-1/curriculum/skill-graph/edges.json',
  },
  {
    courseId: 'im2',
    label: 'Integrated Math 2',
    nodesPath: 'apps/integrated-math-2/curriculum/skill-graph/nodes.json',
    edgesPath: 'apps/integrated-math-2/curriculum/skill-graph/edges.json',
  },
  {
    courseId: 'im3',
    label: 'Integrated Math 3',
    nodesPath: 'apps/integrated-math-3/curriculum/skill-graph/nodes.json',
    edgesPath: 'apps/integrated-math-3/curriculum/skill-graph/edges.json',
  },
  {
    courseId: 'precalc',
    label: 'AP Precalculus',
    nodesPath: 'apps/pre-calculus/curriculum/skill-graph/nodes.json',
    edgesPath: 'apps/pre-calculus/curriculum/skill-graph/edges.json',
  },
];

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main(): void {
  const courses = COURSES.map((cfg) => {
    const nodes = loadNodes(resolve(ROOT, cfg.nodesPath));
    const edges = loadEdges(resolve(ROOT, cfg.edgesPath));
    return {
      courseId: cfg.courseId,
      label: cfg.label,
      nodes,
      edges,
    };
  });

  console.log('Loaded course graphs:');
  for (const c of courses) {
    console.log(`  ${c.label} (${c.courseId}): ${c.nodes.length} nodes, ${c.edges.length} edges`);
  }

  // Generate equivalences
  const equivEdges = findCrossCourseEquivalences({
    courses: courses.map((c) => ({ courseId: c.courseId, nodes: c.nodes, edges: c.edges })),
    idPrefix: 'cross-course',
  });

  console.log(`\nGenerated ${equivEdges.length} cross-course equivalence edges`);

  // Validate endpoints — all nodes across all courses
  const allNodes = courses.flatMap((c) => c.nodes);
  let validationErrors = 0;
  for (const edge of equivEdges) {
    const result = validateCrossCourseEdges(edge, allNodes);
    if (!result.valid) {
      console.error(`  VALIDATION ERROR: ${edge.id}: ${result.reason}`);
      validationErrors++;
    }
  }
  if (validationErrors > 0) {
    console.error(`\n${validationErrors} validation errors found!`);
    process.exitCode = 1;
  } else {
    console.log('All edges pass endpoint validation');
  }

  // Counts by confidence and match type
  const byConfidence = new Map<string, number>();
  const byMatchType = new Map<string, number>();
  const byCoursePair = new Map<string, number>();
  for (const edge of equivEdges) {
    const conf = edge.confidence;
    byConfidence.set(conf, (byConfidence.get(conf) ?? 0) + 1);

    const mt = (edge.metadata?.matchType as string) ?? 'unknown';
    byMatchType.set(mt, (byMatchType.get(mt) ?? 0) + 1);

    const sp = edge.sourceId.split('.');
    const tp = edge.targetId.split('.');
    // Determine course prefix: first two segments for math.im*, or domain-level
    const sc = fp(sp.slice(0, 2));
    const tc = fp(tp.slice(0, 2));
    const pairKey = [sc, tc].sort().join(' ↔ ');
    byCoursePair.set(pairKey, (byCoursePair.get(pairKey) ?? 0) + 1);
  }

  console.log('\nBy confidence:');
  for (const [conf, count] of [...byConfidence.entries()].sort()) {
    console.log(`  ${conf}: ${count}`);
  }

  console.log('\nBy match type:');
  for (const [mt, count] of [...byMatchType.entries()].sort()) {
    console.log(`  ${mt}: ${count}`);
  }

  console.log('\nBy course pair:');
  for (const [pair, count] of [...byCoursePair.entries()].sort()) {
    console.log(`  ${pair}: ${count}`);
  }

  // Compute connected components
  const components = computeEquivalenceComponents(equivEdges);
  console.log(`\nConnected components: ${components.length}`);

  // Low-confidence review queue
  const reviewQueue = equivEdges
    .filter((e) => e.confidence === 'low')
    .map((e) => ({
      id: e.id,
      sourceId: e.sourceId,
      targetId: e.targetId,
      rationale: e.rationale,
    }));

  console.log(`\nReview queue (low confidence): ${reviewQueue.length} edges`);

  // ---------------------------------------------------------------------------
  // Write cross-course-edges.json
  // ---------------------------------------------------------------------------

  const outputPath = resolve(
    ROOT,
    'packages/math-content/src/knowledge-space/cross-course-edges.json',
  );
  writeJson(outputPath, equivEdges);
  console.log(`\nWrote ${equivEdges.length} edges to cross-course-edges.json`);

  // ---------------------------------------------------------------------------
  // Write audit report
  // ---------------------------------------------------------------------------

  const auditPath = resolve(
    ROOT,
    'measure/skill-graph-cross-course-equivalence-audit.md',
  );

  const lines: string[] = [
    '# Cross-Course Equivalence Audit',
    '',
    `**Generated:** ${new Date().toISOString().split('T')[0]}`,
    `**Total equivalence edges:** ${equivEdges.length}`,
    `**Connected components:** ${components.length}`,
    '',
    '## Confidence Distribution',
    '',
    ...['high', 'medium', 'low'].map(
      (c) => `- **${c}:** ${byConfidence.get(c) ?? 0}`,
    ),
    '',
    '## Match Type Distribution',
    '',
    ...['familyKey', 'familyKey+title', 'standard', 'title'].map(
      (mt) => `- **${mt}:** ${byMatchType.get(mt) ?? 0}`,
    ),
    '',
    '## Course Pair Counts',
    '',
    ...[...byCoursePair.entries()]
      .sort(([, a], [, b]) => b - a)
      .map(([pair, count]) => `- **${pair}:** ${count}`),
    '',
    '## Connected Components',
    '',
    `Total components identified: **${components.length}**`,
    '',
    'Components with 3+ nodes (multi-course equivalence clusters):',
    '',
  ];

  const multiCourse = components
    .filter((c) => c.nodeIds.length >= 3)
    .sort((a, b) => b.nodeIds.length - a.nodeIds.length);

  if (multiCourse.length > 0) {
    for (const comp of multiCourse) {
      lines.push(`### ${comp.componentId} (${comp.nodeIds.length} nodes, ${comp.courses.length} courses)`);
      lines.push('');
      for (const nodeId of comp.nodeIds) {
        lines.push(`- \`${nodeId}\``);
      }
      lines.push('');
    }
  } else {
    lines.push('_No components with 3+ nodes found._');
    lines.push('');
  }

  // Two-node components summary
  const twoNode = components.filter((c) => c.nodeIds.length === 2);
  lines.push('');
  lines.push(`### Two-node components (${twoNode.length} total)`);
  lines.push('');
  if (twoNode.length > 0 && twoNode.length <= 50) {
    for (const comp of twoNode) {
      const [a, b] = comp.nodeIds;
      lines.push(`- ${comp.componentId}: \`${a}\` ↔ \`${b}\` (${comp.courses[0]} ↔ ${comp.courses[1]})`);
    }
    lines.push('');
  } else if (twoNode.length > 50) {
    lines.push(`_${twoNode.length} two-node components — too many to list individually. See cross-course-edges.json for details._`);
    lines.push('');
  }

  lines.push('## Review Queue (Low Confidence)');
  lines.push('');
  lines.push(`${reviewQueue.length} edges require human review:`);
  lines.push('');

  if (reviewQueue.length > 0) {
    lines.push('| ID | Source | Target | Rationale |');
    lines.push('|----|--------|--------|-----------|');
    for (const item of reviewQueue.slice(0, 100)) {
      lines.push(
        `| ${item.id} | \`${item.sourceId}\` | \`${item.targetId}\` | ${item.rationale ?? '-'} |`,
      );
    }
    if (reviewQueue.length > 100) {
      lines.push('');
      lines.push(`_...and ${reviewQueue.length - 100} more low-confidence edges. See cross-course-edges.json for the full list._`);
    }
    lines.push('');
  }

  lines.push('---');
  lines.push('');
  lines.push(
    '_This audit is machine-generated. Review low-confidence edges before promoting to source truth. High-confidence components should be spot-checked manually before SRS projection integration._',
  );
  lines.push('');

  writeFileSync(auditPath, lines.join('\n'), 'utf-8');
  console.log(`Wrote audit to ${auditPath}`);
}

function fp(parts: string[]): string {
  return parts.join('.');
}

main();
