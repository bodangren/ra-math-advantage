import { describe, it, expect } from 'vitest';
import { projectActivityMap } from '@math-platform/knowledge-space-practice';
import { projectSrsInputs } from '@math-platform/knowledge-space-practice';
import { projectTeacherEvidence } from '@math-platform/knowledge-space-practice';
import type { KnowledgeSpaceNode, KnowledgeSpaceEdge } from '@math-platform/knowledge-space-core';
import type { KnowledgeBlueprint } from '@math-platform/knowledge-space-practice';
import nodesJson from '../module-1/nodes.json';
import edgesJson from '../module-1/edges.json';
import standardEdgesJson from '../module-1/standard-edges.json';
import blueprintsJson from '../module-1/blueprints.json';

function loadModule1Graph(): { nodes: KnowledgeSpaceNode[]; edges: KnowledgeSpaceEdge[] } {
  const module1Nodes = (nodesJson as { nodes: KnowledgeSpaceNode[] }).nodes
    .filter(n => n.metadata?.module === '1' || n.kind === 'domain');
  const module1NodeIds = new Set(module1Nodes.map(n => n.id));
  const standardNodes = (standardEdgesJson as { nodes: KnowledgeSpaceNode[] }).nodes
    .filter(n => n.kind === 'standard');
  const allNodes = [...module1Nodes];
  const seenIds = new Set(allNodes.map(n => n.id));
  for (const n of standardNodes) {
    if (!seenIds.has(n.id)) {
      allNodes.push(n);
      seenIds.add(n.id);
    }
  }
  const module1Edges = (edgesJson as { edges: KnowledgeSpaceEdge[] }).edges
    .filter(e => module1NodeIds.has(e.sourceId) || module1NodeIds.has(e.targetId));
  const alignmentEdges = (standardEdgesJson as { edges: KnowledgeSpaceEdge[] }).edges
    .filter(e => module1NodeIds.has(e.sourceId));
  const allEdges = [...module1Edges, ...alignmentEdges];
  return { nodes: allNodes, edges: allEdges };
}

function loadModule1Blueprints(): KnowledgeBlueprint[] {
  return (blueprintsJson as { blueprints: KnowledgeBlueprint[] }).blueprints;
}

describe('Module 1 Runtime Projection', () => {
  const graph = loadModule1Graph();
  const blueprints = loadModule1Blueprints();

  it('projects activity map with entries for Module 1 skills', () => {
    const activities = projectActivityMap(graph.nodes, graph.edges, blueprints);
    expect(activities.length).toBeGreaterThan(0);
  });

  it('projected activities reference Module 1 skill IDs', () => {
    const activities = projectActivityMap(graph.nodes, graph.edges, blueprints);
    const nodeIds = new Set(graph.nodes.map(n => n.id));
    for (const activity of activities) {
      expect(nodeIds.has(activity.nodeId)).toBe(true);
    }
  });

  it('projected activities reference valid renderer keys', () => {
    const activities = projectActivityMap(graph.nodes, graph.edges, blueprints);
    const validRenderers = new Set([
      'step-by-step-solver',
      'graphing-explorer',
      'comprehension-quiz',
      'fill-in-the-blank',
      'rate-of-change-calculator',
      'discriminant-analyzer',
    ]);
    for (const activity of activities) {
      expect(validRenderers.has(activity.rendererKey)).toBe(true);
    }
  });

  it('projects SRS inputs for Module 1 skills', () => {
    const srsEntries = projectSrsInputs(graph.nodes, graph.edges, blueprints);
    expect(srsEntries.length).toBeGreaterThan(0);
  });

  it('SRS entries reference Module 1 skill IDs', () => {
    const srsEntries = projectSrsInputs(graph.nodes, graph.edges, blueprints);
    const nodeIds = new Set(graph.nodes.map(n => n.id));
    for (const entry of srsEntries) {
      expect(nodeIds.has(entry.nodeId)).toBe(true);
    }
  });

  it('projects teacher evidence referencing skill IDs and standards', () => {
    const evidence = projectTeacherEvidence(graph.nodes, graph.edges);
    expect(evidence.standards.length).toBeGreaterThan(0);
    expect(evidence.skills.length).toBeGreaterThan(0);
  });

  it('activity map covers worked_example, guided_practice, and independent_practice modes', () => {
    const activities = projectActivityMap(graph.nodes, graph.edges, blueprints);
    const modes = new Set(activities.map(a => a.mode));
    expect(modes.has('worked_example')).toBe(true);
    expect(modes.has('guided_practice')).toBe(true);
    expect(modes.has('independent_practice')).toBe(true);
  });

  it('independent practice activities are SRS-eligible', () => {
    const activities = projectActivityMap(graph.nodes, graph.edges, blueprints);
    const independentActivities = activities.filter(a => a.mode === 'independent_practice');
    for (const act of independentActivities) {
      expect(act.srsEligible).toBe(true);
    }
  });

  it('every blueprint has at least one alignment through edges or blueprint alignmentNodeIds', () => {
    for (const bp of blueprints) {
      const hasAlignments = bp.alignmentNodeIds.length > 0;
      expect(hasAlignments).toBe(true);
    }
  });
});