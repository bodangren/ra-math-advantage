import { describe, it, expect } from 'vitest';
import { projectActivityMap } from '@math-platform/knowledge-space-practice';
import { projectSrsInputs } from '@math-platform/knowledge-space-practice';
import { projectTeacherEvidence } from '@math-platform/knowledge-space-practice';
import type { KnowledgeSpaceNode, KnowledgeSpaceEdge } from '@math-platform/knowledge-space-core';
import type { KnowledgeBlueprint } from '@math-platform/knowledge-space-practice';
import { getPropsSchema } from '@math-platform/activity-components/schemas';
import nodesJson from '../module-1/nodes.json';
import edgesJson from '../module-1/edges.json';
import standardEdgesJson from '../module-1/standard-edges.json';
import blueprintsJson from '../module-1/blueprints.json';

const blueprintDocument =
  blueprintsJson as unknown as { blueprints: KnowledgeBlueprint[] };
const module1Blueprints = blueprintDocument.blueprints;

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
  return module1Blueprints;
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
    const profitEntries = srsEntries.filter(
      entry => entry.nodeId === 'math.im3.skill.1.1.build-and-simplify-a-quadratic-profit-model-from-context',
    );
    expect(profitEntries).toHaveLength(1);
    expect(profitEntries[0]).toMatchObject({
      generatorReady: true,
      generatorKey: 'quadratic-profit-model',
    });
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

  it('matches fresh Guided and Independent activity eligibility to exact node readiness', () => {
    const activities = projectActivityMap(graph.nodes, graph.edges, blueprints);
    const practiceActivities = activities.filter(
      activity => activity.mode === 'guided_practice' || activity.mode === 'independent_practice',
    );
    for (const activity of practiceActivities) {
      const node = graph.nodes.find(candidate => candidate.id === activity.nodeId);
      expect(node).toBeDefined();
      expect(activity.srsEligible).toBe(node?.independentPracticeReady === true);
    }
    const profitActivities = practiceActivities.filter(
      activity => activity.nodeId ===
        'math.im3.skill.1.1.build-and-simplify-a-quadratic-profit-model-from-context',
    );
    expect(profitActivities).toHaveLength(2);
    expect(profitActivities.map(activity => activity.mode)).toEqual([
      'guided_practice',
      'independent_practice',
    ]);
    expect(profitActivities.map(activity => activity.srsEligible)).toEqual([true, true]);
    const profitWorked = activities.find(
      activity => activity.nodeId ===
        'math.im3.skill.1.1.build-and-simplify-a-quadratic-profit-model-from-context' &&
        activity.mode === 'worked_example',
    );
    expect(profitWorked?.srsEligible).toBe(false);
  });

  it('projects renderer-ready props for the graph-quadratic Worked, Guided, and Independent modalities', () => {
    const activities = projectActivityMap(graph.nodes, graph.edges, blueprints)
      .filter((activity) => (
        activity.nodeId === 'math.im3.skill.1.1.graph-quadratic-functions'
      ));

    expect(activities).toHaveLength(3);
    expect(activities[0]?.sourceNodeIds).toContain('math.im3.example.1.1.001');
    expect(activities.map((activity) => activity.props)).toEqual([
      { equation: 'f(x) = x^2 + 2x - 3', variant: 'plot_from_equation' },
      {
        equation: 'y = x^2 - x - 2',
        variant: 'plot_from_equation',
        responseVariant: 'table_graph',
        domain: [-5, 5],
        range: [-10, 10],
      },
      {
        equation: 'y = -x^2 - 1',
        variant: 'plot_from_equation',
        responseVariant: 'table_graph',
        domain: [-5, 5],
        range: [-10, 10],
      },
    ]);

    const expectedGradingConfig = {
      partIds: ['table_values', 'placed_points'],
      passingScore: 2,
      partialCredit: true,
      rubric: [
        {
          criteria: 'Complete the five-value table for the quadratic.',
          points: 1,
          partId: 'table_values',
        },
        {
          criteria: 'Plot all five points for the quadratic.',
          points: 1,
          partId: 'placed_points',
        },
      ],
    };
    expect(activities.map((activity) => activity.srsEligible)).toEqual([false, true, true]);
    for (const activity of activities) {
      const propsSchema = getPropsSchema(activity.rendererKey);
      expect(propsSchema?.safeParse(activity.props).success).toBe(true);
      expect(activity.gradingConfig).toEqual(expectedGradingConfig);
    }
  });

  it('every blueprint has at least one alignment through edges or blueprint alignmentNodeIds', () => {
    for (const bp of blueprints) {
      const hasAlignments = bp.alignmentNodeIds.length > 0;
      expect(hasAlignments).toBe(true);
    }
  });
});
