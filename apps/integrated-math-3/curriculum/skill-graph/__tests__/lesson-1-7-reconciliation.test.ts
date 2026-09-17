import { describe, expect, it } from 'vitest';
import { getPropsSchema } from '../../../../../packages/math-content/src/schemas/index';
import { projectActivityMap } from '../../../../../packages/knowledge-space-practice/src/projections/activity-map';
import type { KnowledgeBlueprint } from '../../../../../packages/knowledge-space-practice/src/blueprints/types';
import type { ProjectedActivity } from '../../../../../packages/knowledge-space-practice/src/projections/types';
import type {
  KnowledgeSpaceEdge,
  KnowledgeSpaceNode,
} from '../../../../../packages/knowledge-space-core/src/types';
import nodesDocument from '../module-1/nodes.json';
import edgesDocument from '../module-1/edges.json';
import blueprintsDocument from '../module-1/blueprints.json';

const GRAPH_SKILL = 'math.im3.skill.1.7.graph-quadratic-inequalities-in-two-variables';
const SOLVE_SKILL = 'math.im3.skill.1.7.solve-quadratic-inequalities-in-one-variable-by-graphing';
const SOURCE_PDF = 'apps/integrated-math-3/curriculum/IM3-reveal-module-1.pdf';

const expectedExamples = [
  {
    id: 'math.im3.example.1.7.041',
    page: 51,
    title: 'Example 1: Graph a Quadratic Inequality (< or ≤)',
    prompt: 'Graph $y \\leq x^2 - 2x + 8$.'
  },
  {
    id: 'math.im3.example.1.7.042',
    page: 52,
    title: 'Example 2: Graph a Quadratic Inequality (> or ≥)',
    prompt: 'Graph $y > -5x^2 + 10x$.'
  },
  {
    id: 'math.im3.example.1.7.043',
    page: 53,
    title: 'Example 3: Solve a Quadratic Inequality (< or ≤) by Graphing',
    prompt: 'Solve $x^2 + x - 6 < 0$ by graphing.'
  },
  {
    id: 'math.im3.example.1.7.044',
    page: 53,
    title: 'Example 4: Solve a Quadratic Inequality (> or ≥) by Graphing',
    prompt: 'Solve $x^2 - 3x - 4 \\geq 0$ by graphing.'
  },
  {
    id: 'math.im3.example.1.7.045',
    page: 54,
    title: 'Example 5: Solve a Quadratic Inequality Algebraically',
    prompt: 'GARDENING Marcus is planning a garden. He has enough soil to cover 104 square feet, and wants the dimensions of the garden to be at least 5 feet by 10 feet. If he wants to increase the length and width by the same number of feet, by what value can he increase the dimensions of the garden without needing to buy more soil? Create a quadratic inequality and solve it algebraically.'
  },
] as const;

const ownedSkills = [GRAPH_SKILL, SOLVE_SKILL] as const;

function lessonNodes(): KnowledgeSpaceNode[] {
  return (nodesDocument as { nodes: KnowledgeSpaceNode[] }).nodes;
}

function lessonEdges(): KnowledgeSpaceEdge[] {
  return (edgesDocument as { edges: KnowledgeSpaceEdge[] }).edges;
}

function lessonBlueprints(): KnowledgeBlueprint[] {
  return (
    blueprintsDocument as unknown as { blueprints: KnowledgeBlueprint[] }
  ).blueprints;
}

function lessonActivities(): ProjectedActivity[] {
  return projectActivityMap(lessonNodes(), lessonEdges(), lessonBlueprints())
    .filter((activity) => ownedSkills.includes(activity.nodeId as (typeof ownedSkills)[number]));
}

describe('IM3 Lesson 1-7 candidate reconciliation', () => {
  it('records the five PDF examples with exact pages, titles, and prompts', () => {
    const nodes = lessonNodes();
    const examples = nodes
      .filter((node) => node.kind === 'worked_example' && node.metadata?.lesson === '7')
      .sort((left, right) => Number(left.metadata?.exampleNumber) - Number(right.metadata?.exampleNumber));

    expect(examples).toHaveLength(expectedExamples.length);
    expect(examples.map((node) => node.id)).toEqual(expectedExamples.map((example) => example.id));

    for (const expected of expectedExamples) {
      const node = examples.find((candidate) => candidate.id === expected.id);
      expect(node?.title).toBe(expected.title);
      expect(node?.sourceRefs).toContain(`${SOURCE_PDF}#page=${expected.page}`);
      expect(node?.metadata?.authoredPrompt).toBe(expected.prompt);
      expect(node?.reviewStatus).toBe('draft');
    }
  });

  it('maps examples to both owned skills without a one-example boundary', () => {
    const blueprints = lessonBlueprints().filter((blueprint) => ownedSkills.includes(
      blueprint.nodeId as (typeof ownedSkills)[number],
    ));

    expect(blueprints.map((blueprint) => blueprint.nodeId)).toEqual([...ownedSkills]);
    expect(new Set(blueprints.map((blueprint) => blueprint.nodeId)).size).toBe(2);
    expect(blueprints.every((blueprint) => blueprint.reviewStatus === 'draft')).toBe(true);
    expect(blueprints.find((blueprint) => blueprint.nodeId === GRAPH_SKILL)?.sourceNodeIds)
      .toEqual([
        'math.im3.example.1.7.041',
        'math.im3.example.1.7.042',
      ]);
    expect(blueprints.find((blueprint) => blueprint.nodeId === SOLVE_SKILL)?.sourceNodeIds)
      .toEqual([
        'math.im3.example.1.7.043',
        'math.im3.example.1.7.044',
      ]);
  });

  it('keeps every unsupported modality unavailable', () => {
    const blueprints = lessonBlueprints().filter((blueprint) => ownedSkills.includes(
      blueprint.nodeId as (typeof ownedSkills)[number],
    ));

    for (const blueprint of blueprints) {
      expect(blueprint.rendererModeMap).toEqual({});
      expect(blueprint.workedExampleSpec).toBeUndefined();
      expect(blueprint.guidedPracticeSpec).toBeUndefined();
      expect(blueprint.independentPracticeSpec).toBeUndefined();
    }

    const activities = lessonActivities();
    expect(activities).toEqual([]);
  });

  it('proves the existing graphing contract is valid but cannot represent this source task', () => {
    const schema = getPropsSchema('graphing-explorer');
    expect(schema?.safeParse({
      equation: 'y = x^2 - 2x + 8',
      variant: 'plot_from_equation',
    }).success).toBe(true);
    expect(schema?.safeParse({
      equation: 'y = x^2 - 2x + 8',
      variant: 'plot_from_equation',
      boundaryStyle: 'solid',
      shadedRegion: 'below',
      testPoint: [0, 0],
    }).success).toBe(false);
  });
});
