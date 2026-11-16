import { describe, expect, it } from 'vitest';
import type {
  KnowledgeSpaceEdge,
  KnowledgeSpaceNode,
} from '@math-platform/knowledge-space-core';
import moduleNodesJson from '../module-1/nodes.json';
import courseNodesJson from '../nodes.json';
import draftNodesJson from '../draft-nodes.json';
import moduleEdgesJson from '../module-1/edges.json';
import courseEdgesJson from '../edges.json';
import moduleStandardEdgesJson from '../module-1/standard-edges.json';
import courseStandardEdgesJson from '../standard-edges.json';
import moduleBlueprintsJson from '../module-1/blueprints.json';
import courseBlueprintsJson from '../blueprints.json';

const TARGET_NODE_ID = 'math.im3.skill.1.2.solve-a-quadratic-equation-with-one-real-solution-by-graphing';
const BROAD_NODE_ID = 'math.im3.skill.1.2.solve-quadratic-equations-by-graphing';

const moduleNodes = (moduleNodesJson as { nodes: KnowledgeSpaceNode[] }).nodes;
const courseNodes = (courseNodesJson as { nodes: KnowledgeSpaceNode[] }).nodes;
const draftNodes = (draftNodesJson as { nodes: KnowledgeSpaceNode[] }).nodes;
const embeddedCourseNodes = (courseEdgesJson as { nodes: KnowledgeSpaceNode[] }).nodes;
const embeddedCourseStandardNodes =
  (courseStandardEdgesJson as { nodes: KnowledgeSpaceNode[] }).nodes;
const moduleEdges = (moduleEdgesJson as { edges: KnowledgeSpaceEdge[] }).edges;
const courseEdges = (courseEdgesJson as { edges: KnowledgeSpaceEdge[] }).edges;
const moduleStandardEdges =
  (moduleStandardEdgesJson as { edges: KnowledgeSpaceEdge[] }).edges;
const courseStandardEdges =
  (courseStandardEdgesJson as { edges: KnowledgeSpaceEdge[] }).edges;
const moduleBlueprints =
  (moduleBlueprintsJson as { blueprints: Record<string, unknown>[] }).blueprints;
const courseBlueprints =
  (courseBlueprintsJson as { blueprints: Record<string, unknown>[] }).blueprints;

describe('Lesson 1.2 Example 1 atomic node', () => {
  it('defines the atomic Example 1 graphing node in every required mirror', () => {
    const expectedNode = {
      id: TARGET_NODE_ID,
      kind: 'skill',
      title: 'Solve a quadratic equation with one real solution by graphing',
      domain: 'math.im3',
      description: 'Solve a quadratic equation with one real solution by graphing.',
      sourceRefs: [
        'apps/integrated-math-3/curriculum/module-1-class-period-plan.md (1-2, Example 1)',
        'apps/integrated-math-3/curriculum/IM3-reveal-module-1.pdf#page=13',
      ],
      reviewStatus: 'draft',
      metadata: { course: 'im3', module: '1', lesson: '2' },
    };
    const catalogs = [
      moduleNodes,
      draftNodes,
      courseNodes,
      embeddedCourseNodes,
      embeddedCourseStandardNodes,
    ];

    const targetNodes = catalogs.map((catalog) => {
      const matches = catalog.filter((node) => node.id === TARGET_NODE_ID);
      expect(matches).toHaveLength(1);
      expect(matches[0]).toEqual(expectedNode);
      return matches[0];
    });

    expect(targetNodes[1]).toEqual(targetNodes[0]);
    expect(targetNodes[2]).toEqual(targetNodes[0]);
    expect(targetNodes[3]).toEqual(targetNodes[0]);
    expect(targetNodes[4]).toEqual(targetNodes[0]);

    const broadMatches = moduleNodes.filter((node) => node.id === BROAD_NODE_ID);
    expect(broadMatches).toHaveLength(1);
    expect(broadMatches[0]).not.toEqual(expectedNode);
    expect(broadMatches[0].id).not.toBe(TARGET_NODE_ID);
  });

  it('defines the atomic Example 1 blueprint in both blueprint mirrors', () => {
    const expectedBlueprint = {
      nodeId: TARGET_NODE_ID,
      sourceNodeIds: [
        'math.im3.example.1.2.007',
      ],
      alignmentNodeIds: [
        'math.standard.ccss.hsa-rei-b-4',
      ],
      rendererKey: 'graphing-explorer',
      rendererModeMap: {
        worked: 'graphing-explorer',
        guidedPractice: 'graphing-explorer',
        independentPractice: 'graphing-explorer',
      },
      workedExampleSpec: {
        prompt: 'Solve 10 - x^2 = 4x + 14 by graphing.',
        givens: [
          '10 - x^2 = 4x + 14',
          '0 = x^2 + 4x + 4',
          'f(x) = x^2 + 4x + 4',
        ],
        target: {
          related_function: 'f(x) = x^2 + 4x + 4',
          axis_of_symmetry: 'x = -2',
          x_values: [-4, -3, -2, -1, 0],
          y_values: [4, 1, 0, 1, 4],
          solution: 'x = -2',
        },
        steps: [
          {
            description: 'Rewrite the equation.',
            expression: '10 - x^2 = 4x + 14',
            result: '0 = x^2 + 4x + 4',
          },
          {
            description: 'Identify the related function and axis of symmetry.',
            expression: 'f(x) = x^2 + 4x + 4; x = -b/(2a) = -4/(2(1))',
            result: 'The axis of symmetry is x = -2.',
          },
          {
            description: 'Make a table and graph the related function.',
            expression: 'x: -4, -3, -2, -1, 0; y: 4, 1, 0, 1, 4',
            result: 'Plot the five points and connect them with a parabola.',
          },
          {
            description: 'Read the solution from the graph.',
            expression: 'f(-2) = 0',
            result: 'The solution is x = -2.',
          },
        ],
        explanation: "The solution is the x-coordinate where the related function reaches zero.",
        rendererProps: {
          equation: 'f(x) = x^2 + 4x + 4',
          variant: 'plot_from_equation',
          responseVariant: 'one_real_solution',
          originalEquation: '10 - x^2 = 4x + 14',
          domain: [-5, 1],
          range: [-1, 10],
        },
      },
      guidedPracticeSpec: {
        scaffoldedPrompt: 'Solve 8 - x^2 = 6x + 17 by graphing.',
        stepPrompts: [
          'Rewrite the equation as a related function with one side equal to 0.',
          'Identify the repeated root and axis of symmetry.',
          'Complete the table for x = -5, -4, -3, -2, -1.',
          'Plot the five points and state the solution.',
        ],
        hints: [
          'Move all terms to one side to get f(x) = x^2 + 6x + 9.',
          'The repeated root is at the vertex of the upward-opening parabola.',
          'Substitute each x-value into f(x) = x^2 + 6x + 9.',
          'The only x-intercept gives the solution.',
        ],
        checksPerStep: [
          {
            check: 'f(x) = x^2 + 6x + 9',
          },
          {
            check: 'The repeated root and axis of symmetry are x = -3.',
          },
          {
            check: 'The y-values are 4, 1, 0, 1, and 4.',
          },
          {
            check: 'The solution is x = -3.',
          },
        ],
        revealPolicy: 'one_at_a_time',
        rendererProps: {
          equation: 'f(x) = x^2 + 6x + 9',
          variant: 'plot_from_equation',
          responseVariant: 'one_real_solution',
          originalEquation: '8 - x^2 = 6x + 17',
          domain: [-6, 0],
          range: [-1, 10],
        },
      },
      independentPracticeSpec: {
        variantParameters: {
          root: {
            type: 'integer',
            min: -4,
            max: 4,
            step: 1,
            description: 'The repeated x-value where the related function touches the x-axis.',
          },
          scale: {
            type: 'integer',
            min: 1,
            max: 3,
            step: 1,
            description: 'The positive scale in the related quadratic function.',
          },
        },
        answerSchema: {
          table_values: {
            type: 'array',
            description: 'Five numeric table points with x and y coordinates.',
          },
          placed_points: {
            type: 'array',
            description: 'Five plotted points with x and y coordinates.',
          },
          solution: {
            type: 'number',
            description: 'The repeated x-value solution.',
          },
        },
        gradingRules: [
          {
            partId: 'table_values',
            ruleType: 'custom',
            maxScore: 1,
          },
          {
            partId: 'placed_points',
            ruleType: 'custom',
            maxScore: 1,
          },
          {
            partId: 'solution',
            ruleType: 'numeric_tolerance',
            tolerance: 0.01,
            maxScore: 1,
          },
        ],
        replayPolicy: 'unique_seeds',
        rendererProps: {
          equation: 'f(x) = x^2 + 2x + 1',
          variant: 'plot_from_equation',
          responseVariant: 'one_real_solution',
          originalEquation: '7 - x^2 = 2x + 8',
          domain: [-4, 2],
          range: [-1, 10],
        },
      },
      generatorKey: 'one-real-solution-graphing',
      gradingSpec: {
        partIds: [
          'table_values',
          'placed_points',
          'solution',
        ],
        passingScore: 3,
        partialCredit: true,
        rubric: [
          {
            criteria: 'Complete the five-value table.',
            points: 1,
            partId: 'table_values',
          },
          {
            criteria: 'Plot the five points.',
            points: 1,
            partId: 'placed_points',
          },
          {
            criteria: 'Identify the repeated-root solution.',
            points: 1,
            partId: 'solution',
          },
        ],
      },
      reviewStatus: 'draft',
      metadata: {
        course: 'im3',
        module: '1',
        lesson: '2',
      },
    };
    const moduleMatches = moduleBlueprints.filter(
      (blueprint) => blueprint.nodeId === TARGET_NODE_ID,
    );
    const courseMatches = courseBlueprints.filter(
      (blueprint) => blueprint.nodeId === TARGET_NODE_ID,
    );

    expect(moduleMatches).toHaveLength(1);
    expect(courseMatches).toHaveLength(1);
    expect(moduleMatches[0]).toEqual(expectedBlueprint);
    expect(courseMatches[0]).toEqual(expectedBlueprint);
    expect(courseMatches[0]).toEqual(moduleMatches[0]);

    const broadMatches = moduleBlueprints.filter(
      (blueprint) => blueprint.nodeId === BROAD_NODE_ID,
    );
    expect(broadMatches).toHaveLength(1);
    expect(broadMatches[0]).not.toEqual(expectedBlueprint);
    expect(broadMatches[0].nodeId).not.toBe(TARGET_NODE_ID);
  });

  it('defines only the authored containment and standard alignment edges', () => {
    const containsEdge = {
      id: 'math.im3.edge.m1.159',
      type: 'contains',
      sourceId: 'math.im3.lesson.1.2',
      targetId: TARGET_NODE_ID,
      weight: 1,
      confidence: 'high',
      reviewStatus: 'draft',
      metadata: { course: 'im3', module: '1' },
      rationale: 'Skill contained in Lesson 1.2',
      sourceRefs: [
        'apps/integrated-math-3/curriculum/module-1-class-period-plan.md (1-2, Example 1)',
        'apps/integrated-math-3/curriculum/IM3-reveal-module-1.pdf#page=13',
      ],
    };
    const alignmentEdge = {
      id: 'math.alignment.im3-skill-1-2-solve-a-quadratic-equation-with-one-real-solution-by-graphing-to-ccss-hsa-rei-b-4',
      type: 'aligned_to_standard',
      sourceId: TARGET_NODE_ID,
      targetId: 'math.standard.ccss.hsa-rei-b-4',
      weight: 0.8,
      confidence: 'high',
      sourceRefs: [{
        source: 'apps/integrated-math-3/curriculum/IM3-reveal-module-1.pdf#page=13',
        note: 'Primary alignment for authored Example 1',
      }],
      reviewStatus: 'draft',
      rationale: 'Primary alignment for the authored Example 1 one-real-solution graphing capability',
      metadata: { isPrimary: true, course: 'im3' },
    };

    expect(moduleEdges.filter(
      (edge) => edge.sourceId === TARGET_NODE_ID || edge.targetId === TARGET_NODE_ID,
    )).toEqual([containsEdge]);
    expect(courseEdges.filter(
      (edge) => edge.sourceId === TARGET_NODE_ID || edge.targetId === TARGET_NODE_ID,
    ).sort((left, right) => left.id.localeCompare(right.id))).toEqual(
      [containsEdge, alignmentEdge].sort((left, right) => left.id.localeCompare(right.id)),
    );
    expect(moduleStandardEdges.filter((edge) => edge.sourceId === TARGET_NODE_ID))
      .toEqual([alignmentEdge]);
    expect(courseStandardEdges.filter((edge) => edge.sourceId === TARGET_NODE_ID))
      .toEqual([alignmentEdge]);
  });
});
