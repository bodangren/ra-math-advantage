import { describe, expect, it } from 'vitest';
import { getPropsSchema } from '@math-platform/activity-components/schemas';
import {
  fillInTheBlankSchema,
  graphingExplorerSchema,
  rateOfChangeCalculatorSchema,
} from '@math-platform/math-content/schemas';
import { getGenerator } from '@math-platform/math-content/knowledge-space';
import type { KnowledgeBlueprint } from '@math-platform/knowledge-space-practice';
import {
  projectActivityMap,
  knowledgeBlueprintSchema,
  validateBlueprintGeneratorReadiness,
  validateGradingCompatibility,
  validateModeSupport,
  workedStepSchema,
} from '@math-platform/knowledge-space-practice';
import type {
  KnowledgeSpaceEdge,
  KnowledgeSpaceNode,
} from '@math-platform/knowledge-space-core';
import nodesJson from '../module-1/nodes.json';
import courseNodesJson from '../nodes.json';
import draftNodesJson from '../draft-nodes.json';
import blueprintsJson from '../module-1/blueprints.json';
import courseBlueprintsJson from '../blueprints.json';
import edgesJson from '../module-1/edges.json';
import courseEdgesJson from '../edges.json';
import moduleProjectionJson from '../module-1/projection/practice-v1-activity-map.json';
import rootProjectionJson from '../projection/practice-v1-activity-map.json';
import courseStandardEdgesJson from '../standard-edges.json';
import standardEdgesJson from '../module-1/standard-edges.json';

const moduleBlueprintDocument =
  blueprintsJson as unknown as { blueprints: KnowledgeBlueprint[] };
const courseBlueprintDocument =
  courseBlueprintsJson as unknown as { blueprints: KnowledgeBlueprint[] };
const moduleBlueprints = moduleBlueprintDocument.blueprints;
const rootBlueprints = courseBlueprintDocument.blueprints;

const GRAPH_SKILL = 'math.im3.skill.1.1.graph-quadratic-functions';
const DOMAIN_RANGE_FROM_GRAPH_SKILL = 'math.im3.skill.1.1.state-the-domain-and-range-of-a-quadratic-from-its-graph';
const DOMAIN_RANGE_CONTAINS_EDGE = 'math.im3.edge.m1.151';
const EQUATION_RATE_CONTAINS_EDGE = 'math.im3.edge.m1.152';
const TABLE_RATE_CONTAINS_EDGE = 'math.im3.edge.m1.153';
const GRAPH_RATE_CONTAINS_EDGE = 'math.im3.edge.m1.154';
const CONTEXT_RATE_CONTAINS_EDGE = 'math.im3.edge.m1.155';
const PROFIT_MODEL_GENERATED_BY_EDGE = 'math.im3.edge.m1.156';
const DOMAIN_RANGE_GENERATED_BY_EDGE = 'math.im3.edge.m1.157';
const PROFIT_MAXIMUM_GENERATED_BY_EDGE = 'math.im3.edge.m1.158';
const EQUATION_RATE_STANDARD_ALIGNMENT_EDGE = 'math.alignment.im3-skill-1-1-calculate-average-rate-of-change-from-an-equation-to-ccss-hsf-if-b-6';
const TABLE_RATE_STANDARD_ALIGNMENT_EDGE = 'math.alignment.im3-skill-1-1-calculate-average-rate-of-change-from-a-table-to-ccss-hsf-if-b-6';
const GRAPH_RATE_STANDARD_ALIGNMENT_EDGE = 'math.alignment.im3-skill-1-1-estimate-and-verify-average-rate-of-change-from-a-graph-to-ccss-hsf-if-b-6';
const CONTEXT_RATE_STANDARD_ALIGNMENT_EDGE = 'math.alignment.im3-skill-1-1-interpret-average-rate-of-change-in-context-to-ccss-hsf-if-b-6';
const EQUATION_RATE_STANDARD_ORDER_ANCHOR = 'math.alignment.im3-example-9-7-033-to-ccss-hsf-tf-a-2';
const ATOMIC_RATE_STANDARD_ALIGNMENT_EDGES = [
  EQUATION_RATE_STANDARD_ALIGNMENT_EDGE,
  TABLE_RATE_STANDARD_ALIGNMENT_EDGE,
  GRAPH_RATE_STANDARD_ALIGNMENT_EDGE,
  CONTEXT_RATE_STANDARD_ALIGNMENT_EDGE,
] as const;
const LEGACY_RATE_STANDARD_ALIGNMENT_EDGES = [
  'math.alignment.im3-skill-1-1-find-and-interpret-the-average-rate-of-change-to-ccss-hsf-if-c-7c',
  'math.alignment.im3-skill-1-1-find-and-interpret-the-average-rate-of-change-to-ccss-hsa-sse-b-3',
  'math.alignment.im3-skill-1-1-find-and-interpret-the-average-rate-of-change-to-ccss-hsa-rei-b-4',
  'math.alignment.im3-skill-1-1-find-and-interpret-the-average-rate-of-change-to-ccss-hsf-if-a-2',
  'math.alignment.im3-skill-1-1-find-and-interpret-the-average-rate-of-change-to-ccss-n-cn-a-1',
  'math.alignment.im3-skill-1-1-find-and-interpret-the-average-rate-of-change-to-ccss-n-cn-c-7',
] as const;
const LEGACY_RATE_STANDARD_ALIGNMENT_EDGE = 'math.alignment.im3-skill-1-1-find-and-interpret-the-average-rate-of-change-to-ccss-hsf-if-b-6';
const DOMAIN_RANGE_PRIMARY_EDGE = 'math.alignment.im3-skill-1-1-state-the-domain-and-range-of-a-quadratic-from-its-graph-to-ccss-hsf-if-b-5';
const DOMAIN_RANGE_SUPPORTING_EDGE = 'math.alignment.im3-skill-1-1-state-the-domain-and-range-of-a-quadratic-from-its-graph-to-ccss-hsf-if-b-4';
const EXAMPLE_ONE = 'math.im3.example.1.1.001';
const GRAPH_STANDARD = 'math.standard.ccss.hsf-if-c-7a';
const EXAMPLE_ONE_STANDARD_EDGE = 'math.alignment.im3-example-1-1-001-to-ccss-hsf-if-c-7a';
const GRAPH_STANDARD_EDGE = 'math.alignment.im3-skill-1-1-graph-quadratic-functions-to-ccss-hsf-if-c-7a';
const DOMAIN_STANDARD = 'math.standard.ccss.hsf-if-b-5';
const MAXIMUM_SKILL = 'math.im3.skill.1.1.identify-a-quadratic-maximum-from-its-graph';
const MAXIMUM_STANDARD = 'math.standard.ccss.hsf-if-b-4';
const MAXIMUM_STANDARD_EDGE = 'math.alignment.im3-skill-1-1-identify-a-quadratic-maximum-from-its-graph-to-ccss-hsf-if-b-4';
const KEY_FEATURES_SKILL = 'math.im3.skill.1.1.graph-a-quadratic-from-a-vertex-and-y-intercept-using-symmetry';
const KEY_FEATURES_STANDARD_EDGE = 'math.alignment.im3-skill-1-1-graph-a-quadratic-from-a-vertex-and-y-intercept-using-symmetry-to-ccss-hsf-if-c-7a';
const COMPARE_MAXIMUMS_SKILL = 'math.im3.skill.1.1.compare-maximum-values-of-quadratic-functions';
const COMPARE_MAXIMUMS_STANDARD_EDGE = 'math.alignment.im3-skill-1-1-compare-maximum-values-of-quadratic-functions-to-ccss-hsf-if-c-9';
const PROFIT_MODEL_SKILL = 'math.im3.skill.1.1.build-and-simplify-a-quadratic-profit-model-from-context';
const PROFIT_MODEL_STANDARD_EDGES = [
  'math.alignment.im3-skill-1-1-build-and-simplify-a-quadratic-profit-model-from-context-to-ccss-hsf-bf-a-1a',
  'math.alignment.im3-skill-1-1-build-and-simplify-a-quadratic-profit-model-from-context-to-ccss-hsa-apr-a-1',
] as const;
const PROFIT_MAXIMUM_SKILL = 'math.im3.skill.1.1.find-and-interpret-the-maximum-of-a-quadratic-profit-model';
const PROFIT_MAXIMUM_STANDARD_EDGES = [
  'math.alignment.im3-skill-1-1-find-and-interpret-the-maximum-of-a-quadratic-profit-model-to-ccss-hsf-if-b-4',
  'math.alignment.im3-skill-1-1-find-and-interpret-the-maximum-of-a-quadratic-profit-model-to-ccss-hsf-if-a-2',
] as const;
const PROFIT_MAXIMUM_GUIDED_PRACTICE_SPEC = {
  scaffoldedPrompt:
    'A ski resort sells 270 passes at a base price of $230. Each $10 price increase results in 10 fewer passes sold. Given P(x) = -100x^2 + 400x + 62100, use the axis of symmetry to find the maximizing number of price increases, the resulting price per pass, and the maximum profit.',
  stepPrompts: [
    'Identify a and b, then use x = -b/(2a).',
    'Use the maximizing x value in 230 + 10x to find the price per pass.',
    'Evaluate P(x) at the maximizing x value.',
  ],
  hints: [
    'Here, a = -100 and b = 400.',
    'The maximizing input is x = 2.',
    'Substitute x = 2 into P(x) = -100x^2 + 400x + 62100.',
  ],
  checksPerStep: [
    { check: 'x = -400/(2(-100)) = 2.' },
    { check: '230 + 10(2) = 250 dollars per pass.' },
    { check: 'P(2) = -100(2)^2 + 400(2) + 62100 = 62500 dollars.' },
  ],
  revealPolicy: 'one_at_a_time',
  rendererProps: {
    template:
      'A ski resort sells 270 passes at a base price of $230. Each price increase is $10, and 10 fewer passes are sold for each increase. Let x be the number of price increases. Given P(x) = -100x^2 + 400x + 62100, enter the maximizing x value: {{blank:optimalIncreases}}. Enter the price per pass in dollars: {{blank:optimalPrice}}. Enter the maximum profit in dollars: {{blank:maximumProfit}}.',
    blanks: [
      { id: 'optimalIncreases', correctAnswer: '2', isMath: true },
      { id: 'optimalPrice', correctAnswer: '250', isMath: true },
      { id: 'maximumProfit', correctAnswer: '62500', isMath: true },
    ],
  },
} as const;
const PROFIT_MAXIMUM_INDEPENDENT_PRACTICE_SPEC = {
  variantParameters: {
    priceIncrease: { type: 'integer', min: 5, max: 10, step: 5 },
    salesDecrease: { type: 'integer', min: 10, max: 30, step: 10 },
    priceFactor: { type: 'integer', min: 22, max: 28, step: 1 },
    optimalIncreases: { type: 'integer', min: 2, max: 6, step: 1 },
  },
  answerSchema: {
    optimalIncreases: 'string',
    optimalPrice: 'string',
    maximumProfit: 'string',
  },
  gradingRules: [
    { partId: 'optimalIncreases', ruleType: 'exact_match', maxScore: 1 },
    { partId: 'optimalPrice', ruleType: 'exact_match', maxScore: 1 },
    { partId: 'maximumProfit', ruleType: 'exact_match', maxScore: 1 },
  ],
  replayPolicy: 'unique_seeds',
  rendererProps: {
    template:
      'A ski resort sells 1080 passes at a base price of $120. Each price increase is $5, and 30 fewer passes are sold for each increase. Let x be the number of price increases. Given P(x) = -150x^2 + 1800x + 129600, enter the maximizing x value: {{blank:optimalIncreases}}. Enter the price per pass in dollars: {{blank:optimalPrice}}. Enter the maximum profit in dollars: {{blank:maximumProfit}}.',
    blanks: [
      { id: 'optimalIncreases', correctAnswer: '6', isMath: true },
      { id: 'optimalPrice', correctAnswer: '150', isMath: true },
      { id: 'maximumProfit', correctAnswer: '135000', isMath: true },
    ],
  },
} as const;
const PROFIT_MAXIMUM_GRADING_SPEC = {
  partIds: ['optimalIncreases', 'optimalPrice', 'maximumProfit'],
  passingScore: 3,
  partialCredit: true,
  rubric: [
    { criteria: 'Correct optimalIncreases', points: 1, partId: 'optimalIncreases' },
    { criteria: 'Correct optimalPrice', points: 1, partId: 'optimalPrice' },
    { criteria: 'Correct maximumProfit', points: 1, partId: 'maximumProfit' },
  ],
} as const;
const PROFIT_DOMAIN_SKILL = 'math.im3.skill.1.1.determine-the-contextual-domain-and-range-of-a-quadratic-model';
const PROFIT_PART_IDS = [
  'priceBase',
  'priceStep',
  'salesBase',
  'salesLoss',
  'coefficientA',
  'coefficientB',
  'coefficientC',
] as const;
const PROFIT_DOMAIN_STANDARD_EDGES = [
  'math.alignment.im3-skill-1-1-determine-the-contextual-domain-and-range-of-a-quadratic-model-to-ccss-hsf-if-b-5',
  'math.alignment.im3-skill-1-1-determine-the-contextual-domain-and-range-of-a-quadratic-model-to-ccss-hsa-ced-a-3',
  'math.alignment.im3-skill-1-1-determine-the-contextual-domain-and-range-of-a-quadratic-model-to-ccss-hsf-if-b-4',
] as const;
const EXAMPLE_THREE_STANDARD_TARGETS = [
  'math.standard.ccss.hsf-bf-a-1a',
  'math.standard.ccss.hsa-apr-a-1',
  'math.standard.ccss.hsf-if-b-4',
  'math.standard.ccss.hsf-if-a-2',
  'math.standard.ccss.hsf-if-b-5',
  'math.standard.ccss.hsa-ced-a-3',
] as const;
const EXAMPLE_TWO_SKILL_IDS = [KEY_FEATURES_SKILL, COMPARE_MAXIMUMS_SKILL];
const RATE_SKILL = 'math.im3.skill.1.1.find-and-interpret-the-average-rate-of-change';
const EQUATION_RATE_SKILL = 'math.im3.skill.1.1.calculate-average-rate-of-change-from-an-equation';
const AVERAGE_RATE_GENERATOR = 'math.im3.generator.m1.average-rate-of-change';
const AVERAGE_RATE_GENERATED_EDGE = 'math.im3.edge.m1.084';
const RATE_RENDERER = 'math.im3.renderer.rate-of-change-calculator';
const EQUATION_RATE_RENDERED_EDGE = 'math.im3.edge.m1.129';
const LEGACY_RATE_RENDERED_EDGE = 'math.im3.edge.m1.068';
const STEP_BY_STEP_RENDERER = 'math.im3.renderer.step-by-step-solver';
const ALEKS_RATE_RENDERED_EDGE = 'math.im3.edge.m1.130';
const TABLE_RATE_SKILL = 'math.im3.skill.1.1.calculate-average-rate-of-change-from-a-table';
const GRAPH_RATE_SKILL = 'math.im3.skill.1.1.estimate-and-verify-average-rate-of-change-from-a-graph';
const CONTEXT_RATE_SKILL = 'math.im3.skill.1.1.interpret-average-rate-of-change-in-context';
const PDF_PATH = 'apps/integrated-math-3/curriculum/IM3-reveal-module-1.pdf';

const SOURCE_EXAMPLES = [
  {
    id: 'math.im3.example.1.1.001',
    exampleNumber: 1,
    page: 4,
    title: 'Example 1 Graph a Quadratic Function by Using a Table',
    prompt: 'Graph f(x) = x^2 + 2x - 3. State the domain and range.',
    capability: 'Graph a quadratic function by using a table and state its domain and range.',
  },
  {
    id: 'math.im3.example.1.1.002',
    exampleNumber: 2,
    page: 4,
    title: 'Example 2 Compare Quadratic Functions',
    prompt: 'Compare the graph of f(x) to a quadratic function g(x) with a y-intercept of -1 and a vertex at (1, 2). Which function has a greater maximum?',
    capability: 'Compare the maximum values of quadratic functions from their graphs and key features.',
  },
  {
    id: 'math.im3.example.1.1.003',
    exampleNumber: 3,
    page: 5,
    title: 'Example 3 Use Quadratic Functions',
    prompt: 'SKIING A ski resort has extended hours on one holiday weekend per year. Last year, the resort sold 680 ski passes at $120 per holiday weekend pass. This year, the resort is considering a price increase. They estimate that for each $5 increase, they will sell 20 fewer holiday weekend passes. Part A How much should they charge in order to maximize profit? Part B Find the domain and range in the context of the situation.',
    capability: 'Model profit with a quadratic function, find its maximum, and interpret contextual domain and range.',
  },
  {
    id: 'math.im3.example.1.1.004',
    exampleNumber: 4,
    page: 6,
    title: 'Example 4 Find Average Rate of Change from an Equation',
    prompt: 'Determine the average rate of change of f(x) = -x^2 + 2x - 1 over the interval [-4, 4].',
    capability: 'Calculate average rate of change from an equation over an interval.',
  },
  {
    id: 'math.im3.example.1.1.005',
    exampleNumber: 5,
    page: 6,
    title: 'Example 5 Find Average Rate of Change from a Table',
    prompt: 'Determine the average rate of change of f(x) over the interval [-3, 3].',
    capability: 'Calculate average rate of change from table values over an interval.',
  },
  {
    id: 'math.im3.example.1.1.006',
    exampleNumber: 6,
    page: 7,
    title: 'Example 6 Find Average Rate of Change from a Graph',
    prompt: 'Part A Use the graph to estimate the average rate of change of spending on sports footwear from 2005 to 2015. Then check your results algebraically.',
    capability: 'Estimate average rate of change from a graph and check the result algebraically.',
  },
] as const;

const SKILL_MATRIX = [
  { exampleNumber: 1, graph: true, rate: false },
  { exampleNumber: 2, graph: false, rate: false },
  { exampleNumber: 3, graph: false, rate: false },
  { exampleNumber: 4, graph: false, rate: true },
  { exampleNumber: 5, graph: false, rate: true },
  { exampleNumber: 6, graph: false, rate: true },
] as const;

function lessonNodes(): KnowledgeSpaceNode[] {
  return (nodesJson as { nodes: KnowledgeSpaceNode[] }).nodes;
}

function courseNodes(): KnowledgeSpaceNode[] {
  return (courseNodesJson as { nodes: KnowledgeSpaceNode[] }).nodes;
}

function draftNodes(): KnowledgeSpaceNode[] {
  return (draftNodesJson as { nodes: KnowledgeSpaceNode[] }).nodes;
}

function lessonEdges(): KnowledgeSpaceEdge[] {
  return (edgesJson as { edges: KnowledgeSpaceEdge[] }).edges;
}

function courseEdges(): KnowledgeSpaceEdge[] {
  return (courseEdgesJson as { edges: KnowledgeSpaceEdge[] }).edges;
}

function embeddedCourseNodes(): KnowledgeSpaceNode[] {
  return (courseEdgesJson as { nodes: KnowledgeSpaceNode[] }).nodes;
}

function standardEdges(): KnowledgeSpaceEdge[] {
  return (standardEdgesJson as { edges: KnowledgeSpaceEdge[] }).edges;
}

function courseStandardNodes(): KnowledgeSpaceNode[] {
  return (courseStandardEdgesJson as { nodes: KnowledgeSpaceNode[] }).nodes;
}

function courseStandardEdges(): KnowledgeSpaceEdge[] {
  return (courseStandardEdgesJson as { edges: KnowledgeSpaceEdge[] }).edges;
}

function moduleStandardNodes(): KnowledgeSpaceNode[] {
  return (standardEdgesJson as { nodes: KnowledgeSpaceNode[] }).nodes;
}

function ownedBlueprints(): KnowledgeBlueprint[] {
  return moduleBlueprints.filter(
    blueprint => [
      GRAPH_SKILL,
      RATE_SKILL,
      PROFIT_MODEL_SKILL,
      PROFIT_MAXIMUM_SKILL,
    ].includes(blueprint.nodeId),
  );
}

function courseBlueprints(): KnowledgeBlueprint[] {
  return rootBlueprints;
}

describe('IM3 Lesson 1-1 source reconciliation', () => {
  it('moves the average-rate-of-change generated_by edge to the atomic equation-rate skill', () => {
    const expectedEdge: KnowledgeSpaceEdge = {
      id: AVERAGE_RATE_GENERATED_EDGE,
      type: 'generated_by',
      sourceId: EQUATION_RATE_SKILL,
      targetId: AVERAGE_RATE_GENERATOR,
      weight: 1,
      confidence: 'high',
      reviewStatus: 'draft',
      metadata: { course: 'im3', module: '1' },
      rationale: `Skill ${EQUATION_RATE_SKILL} generated by ${AVERAGE_RATE_GENERATOR}`,
      sourceRefs: [{ source: 'pilot', note: 'Module 1 pilot generator' }],
      derived: true,
      derivationMethod: 'generator-registry-mapping',
    };
    const catalogs = [lessonEdges(), courseEdges()];
    const matches = catalogs.map(catalog => catalog.filter(edge => edge.id === AVERAGE_RATE_GENERATED_EDGE));

    for (const catalogMatches of matches) {
      expect(catalogMatches).toHaveLength(1);
      expect(catalogMatches[0]).toEqual(expectedEdge);
    }
    expect(matches[1][0]).toEqual(matches[0][0]);

    for (const catalog of catalogs) {
      expect(
        catalog.filter(
          edge =>
            edge.type === 'generated_by' &&
            edge.sourceId === RATE_SKILL &&
            edge.targetId === AVERAGE_RATE_GENERATOR,
        ),
      ).toHaveLength(0);
      expect(
        catalog.filter(
          edge =>
            edge.type === 'generated_by' &&
            edge.sourceId === EQUATION_RATE_SKILL &&
            edge.targetId === AVERAGE_RATE_GENERATOR,
        ),
      ).toHaveLength(1);
    }

    const moduleIndex = lessonEdges().findIndex(edge => edge.id === AVERAGE_RATE_GENERATED_EDGE);
    expect(lessonEdges()[moduleIndex - 1]?.id).toBe('math.im3.edge.m1.083');
    expect(lessonEdges()[moduleIndex + 1]?.id).toBe('math.im3.edge.m1.085');
    const rootIndex = courseEdges().findIndex(edge => edge.id === AVERAGE_RATE_GENERATED_EDGE);
    expect(courseEdges()[rootIndex - 1]?.id).toBe('math.im3.edge.m1.083');
    expect(courseEdges()[rootIndex + 1]?.id).toBe('math.im3.edge.m1.085');
  });

  it('moves the average-rate-of-change rendered_by edge to the atomic equation-rate skill', () => {
    const expectedEdge: KnowledgeSpaceEdge = {
      id: EQUATION_RATE_RENDERED_EDGE,
      type: 'rendered_by',
      sourceId: EQUATION_RATE_SKILL,
      targetId: RATE_RENDERER,
      weight: 1,
      confidence: 'high',
      reviewStatus: 'draft',
      rationale: `Skill ${EQUATION_RATE_SKILL} rendered by ${RATE_RENDERER}`,
      sourceRefs: [{ source: 'component-registry', note: 'Registered renderer mapping' }],
      derived: true,
      derivationMethod: 'renderer-registry-mapping',
      metadata: { course: 'im3', module: '1' },
    };
    const catalogs = [lessonEdges(), courseEdges()];
    const matches = catalogs.map(catalog => catalog.filter(edge => edge.id === EQUATION_RATE_RENDERED_EDGE));

    for (const catalogMatches of matches) {
      expect(catalogMatches).toHaveLength(1);
      expect(catalogMatches[0]).toEqual(expectedEdge);
    }
    expect(matches[1][0]).toEqual(matches[0][0]);

    for (const catalog of catalogs) {
      expect(
        catalog.filter(
          edge =>
            edge.type === 'rendered_by' &&
            edge.sourceId === RATE_SKILL &&
            edge.targetId === RATE_RENDERER,
        ),
      ).toHaveLength(0);
      expect(
        catalog.filter(
          edge =>
            edge.type === 'rendered_by' &&
            edge.sourceId === EQUATION_RATE_SKILL &&
            edge.targetId === RATE_RENDERER,
        ),
      ).toHaveLength(1);
    }

    const moduleIndex = lessonEdges().findIndex(edge => edge.id === EQUATION_RATE_RENDERED_EDGE);
    expect(lessonEdges()[moduleIndex - 1]?.id).toBe('math.im3.edge.m1.128');
    expect(lessonEdges()[moduleIndex + 1]?.id).toBe('math.im3.edge.m1.130');
    const rootIndex = courseEdges().findIndex(edge => edge.id === EQUATION_RATE_RENDERED_EDGE);
    expect(courseEdges()[rootIndex - 1]?.id).toBe('math.im3.edge.m1.128');
    expect(courseEdges()[rootIndex + 1]?.id).toBe('math.im3.edge.m1.130');
  });

  it('removes the false composite step-by-step renderer edge', () => {
    const catalogs = [lessonEdges(), courseEdges()];

    for (const catalog of catalogs) {
      expect(catalog.filter(edge => edge.id === LEGACY_RATE_RENDERED_EDGE)).toHaveLength(0);
      expect(
        catalog.filter(
          edge =>
            edge.type === 'rendered_by' &&
            edge.sourceId === RATE_SKILL &&
            edge.targetId === STEP_BY_STEP_RENDERER,
        ),
      ).toHaveLength(0);

      const previousIndex = catalog.findIndex(edge => edge.id === 'math.im3.edge.m1.067');
      expect(catalog[previousIndex + 1]?.id).toBe('math.im3.edge.m1.069');

      const equationRendererEdge = catalog.find(edge => edge.id === EQUATION_RATE_RENDERED_EDGE);
      expect(equationRendererEdge?.sourceId).toBe(EQUATION_RATE_SKILL);
      expect(equationRendererEdge?.targetId).toBe(RATE_RENDERER);

      const aleksRendererEdge = catalog.find(edge => edge.id === ALEKS_RATE_RENDERED_EDGE);
      expect(aleksRendererEdge?.sourceId).toBe('math.im3.skill.1.aleks.average-rate-of-change');
      expect(aleksRendererEdge?.targetId).toBe(RATE_RENDERER);
    }

  });

  it('defines generator-backed Worked and Guided profit-model views', () => {
    const blueprint = ownedBlueprints().find(item => item.nodeId === PROFIT_MODEL_SKILL);
    const generator = getGenerator('quadratic-profit-model');
    const seed0 = generator.generate({ nodeId: PROFIT_MODEL_SKILL, seed: 0, difficulty: 0.5 });
    const seed1 = generator.generate({ nodeId: PROFIT_MODEL_SKILL, seed: 1, difficulty: 0.5 });
    const seed0Data = seed0.data as {
      rendererProps: Record<string, unknown>;
      baseSales: number;
      basePrice: number;
      priceIncrease: number;
      salesDecrease: number;
    };
    const seed1Data = seed1.data as { rendererProps: Record<string, unknown> };

    expect(blueprint?.rendererKey).toBe('fill-in-the-blank');
    expect(blueprint?.rendererModeMap).toEqual({
      worked: 'fill-in-the-blank',
      guidedPractice: 'fill-in-the-blank',
      independentPractice: 'fill-in-the-blank',
    });
    const workedSteps = blueprint?.workedExampleSpec?.steps ?? [];
    const generatedStepContent = seed0.solutionSteps.map(({ description, expression }) => ({
      description,
      expression,
    }));
    expect(workedSteps.map(({ description, expression }) => ({ description, expression }))).toEqual(
      generatedStepContent,
    );
    expect(workedSteps).toHaveLength(6);
    for (const step of workedSteps) {
      expect(Object.prototype.hasOwnProperty.call(step, 'value')).toBe(false);
      expect(workedStepSchema.safeParse(step).success).toBe(true);
    }
    expect(blueprint?.workedExampleSpec).toMatchObject({
      prompt: seed0.prompt,
      givens: [
        '680 passes sold at $120 per pass.',
        '$5 price increase for each increase.',
        '20 fewer passes for each increase.',
      ],
      target: seed0.expectedAnswer,
    });
    expect(blueprint?.workedExampleSpec?.rendererProps).toMatchObject({
      blanks: seed0Data.rendererProps.blanks,
    });
    expect(blueprint?.workedExampleSpec?.rendererProps?.template).toContain(
      'P(x) = (120 + 5x)(680 - 20x)',
    );
    expect(blueprint?.workedExampleSpec?.rendererProps?.template).toContain(
      '120(680) - 120(20x) + 5x(680) - 5x(20x)',
    );
    expect(blueprint?.workedExampleSpec?.rendererProps?.template).toContain(
      '-100x^2 + 1000x + 81600',
    );
    expect(blueprint?.guidedPracticeSpec).toMatchObject({
      scaffoldedPrompt: seed1.prompt,
      rendererProps: seed1Data.rendererProps,
      revealPolicy: 'one_at_a_time',
    });
    expect(fillInTheBlankSchema.safeParse(blueprint?.workedExampleSpec?.rendererProps).success).toBe(true);
    expect(fillInTheBlankSchema.safeParse(blueprint?.guidedPracticeSpec?.rendererProps).success).toBe(true);
  });

  it('defines generator-backed Independent profit-model practice with source readiness', () => {
    const blueprint = ownedBlueprints().find(item => item.nodeId === PROFIT_MODEL_SKILL);
    const generator = getGenerator('quadratic-profit-model');
    const seed2 = generator.generate({ nodeId: PROFIT_MODEL_SKILL, seed: 2, difficulty: 0.5 });
    const seed2Data = seed2.data as { rendererProps: Record<string, unknown> };

    expect(blueprint).toBeDefined();
    if (!blueprint) return;
    const independent = blueprint.independentPracticeSpec;
    expect(blueprint.rendererKey).toBe('fill-in-the-blank');
    expect(blueprint.rendererModeMap).toEqual({
      worked: 'fill-in-the-blank',
      guidedPractice: 'fill-in-the-blank',
      independentPractice: 'fill-in-the-blank',
    });
    expect(blueprint.generatorKey).toBe('quadratic-profit-model');
    expect(independent).toMatchObject({
      variantParameters: {
        priceIncrease: { type: 'integer', min: 5, max: 10, step: 5 },
        salesDecrease: { type: 'integer', min: 10, max: 30, step: 10 },
        priceFactor: { type: 'integer', min: 22, max: 28, step: 1 },
        optimalIncreases: { type: 'integer', min: 2, max: 6, step: 1 },
      },
      answerSchema: Object.fromEntries(PROFIT_PART_IDS.map(partId => [partId, 'string'])),
      replayPolicy: 'unique_seeds',
      rendererProps: seed2Data.rendererProps,
    });
    expect(independent?.gradingRules).toEqual(
      PROFIT_PART_IDS.map(partId => ({ partId, ruleType: 'exact_match', maxScore: 1 })),
    );
    expect(blueprint.gradingSpec).toEqual({
      partIds: [...PROFIT_PART_IDS],
      passingScore: 7,
      partialCredit: true,
      rubric: PROFIT_PART_IDS.map(partId => ({
        criteria: `Correct ${partId}`,
        points: 1,
        partId,
      })),
    });

    const answerKeys = Object.keys(independent?.answerSchema ?? {});
    const ruleKeys = independent?.gradingRules.map(rule => rule.partId) ?? [];
    expect(answerKeys).toEqual([...PROFIT_PART_IDS]);
    expect(new Set(answerKeys).size).toBe(PROFIT_PART_IDS.length);
    expect(ruleKeys).toEqual([...PROFIT_PART_IDS]);
    expect(blueprint.gradingSpec?.partIds).toEqual([...PROFIT_PART_IDS]);
    expect(fillInTheBlankSchema.safeParse(independent?.rendererProps).success).toBe(true);
    expect(validateBlueprintGeneratorReadiness(blueprint).valid).toBe(true);
    expect(validateModeSupport(blueprint).valid).toBe(true);
    expect(validateGradingCompatibility(blueprint).valid).toBe(true);

    const activities = projectActivityMap(lessonNodes(), lessonEdges(), [blueprint])
      .filter(activity => activity.nodeId === PROFIT_MODEL_SKILL);
    expect(activities).toHaveLength(3);
    expect(activities.map(activity => activity.mode)).toEqual([
      'worked_example',
      'guided_practice',
      'independent_practice',
    ]);
    expect(activities.map(activity => activity.srsEligible)).toEqual([false, true, true]);
  });

  it('synchronizes the Example 3 profit-model candidate node catalogs', () => {
    const moduleNode = lessonNodes().find(node => node.id === PROFIT_MODEL_SKILL);
    expect(moduleNode).toBeDefined();
    const catalogs = [draftNodes(), courseNodes(), courseStandardNodes(), embeddedCourseNodes()];
    for (const nodes of catalogs) {
      const matches = nodes.filter(node => node.id === PROFIT_MODEL_SKILL);
      expect(matches).toHaveLength(1);
      expect(matches[0]).toEqual(moduleNode);
    }
    expect(lessonNodes().filter(node => node.id === PROFIT_MODEL_SKILL)).toHaveLength(1);

    const moduleBlueprint = moduleBlueprints.find(
      blueprint => blueprint.nodeId === PROFIT_MODEL_SKILL,
    );
    const rootBlueprints = courseBlueprints().filter(blueprint => blueprint.nodeId === PROFIT_MODEL_SKILL);
    expect(moduleBlueprint).toBeDefined();
    expect(rootBlueprints).toHaveLength(1);
    expect(rootBlueprints[0]).toEqual(moduleBlueprint);
  });

  it('synchronizes HSF-IF.B.5 into the root node catalogs', () => {
    const moduleNode = lessonNodes().find(node => node.id === DOMAIN_STANDARD);
    expect(moduleNode).toBeDefined();
    const roots = [courseNodes(), courseStandardNodes(), embeddedCourseNodes()];
    for (const nodes of roots) {
      const matches = nodes.filter(node => node.id === DOMAIN_STANDARD);
      expect(matches).toHaveLength(1);
      expect(matches[0]).toEqual(moduleNode);
    }
  });

  it('synchronizes the Example 3 profit-maximum candidate node catalogs', () => {
    const moduleNode = lessonNodes().find(node => node.id === PROFIT_MAXIMUM_SKILL);
    expect(moduleNode).toBeDefined();
    const catalogs = [draftNodes(), courseNodes(), courseStandardNodes(), embeddedCourseNodes()];
    for (const nodes of catalogs) {
      const matches = nodes.filter(node => node.id === PROFIT_MAXIMUM_SKILL);
      expect(matches).toHaveLength(1);
      expect(matches[0]).toEqual(moduleNode);
    }
    expect(lessonNodes().filter(node => node.id === PROFIT_MAXIMUM_SKILL)).toHaveLength(1);

    const moduleBlueprint = moduleBlueprints.find(
      blueprint => blueprint.nodeId === PROFIT_MAXIMUM_SKILL,
    );
    const rootBlueprints = courseBlueprints().filter(blueprint => blueprint.nodeId === PROFIT_MAXIMUM_SKILL);
    expect(moduleBlueprint).toBeDefined();
    expect(rootBlueprints).toHaveLength(1);
    expect(rootBlueprints[0]).toEqual(moduleBlueprint);
  });

  it('uses fill-in-the-blank for the Example 3 profit-maximum blueprint in both mirrors', () => {
    const moduleBlueprintsForTarget = moduleBlueprints.filter(
      blueprint => blueprint.nodeId === PROFIT_MAXIMUM_SKILL,
    );
    const rootBlueprintsForTarget = courseBlueprints().filter(
      blueprint => blueprint.nodeId === PROFIT_MAXIMUM_SKILL,
    );

    expect(moduleBlueprintsForTarget).toHaveLength(1);
    expect(rootBlueprintsForTarget).toHaveLength(1);
    const moduleBlueprint = moduleBlueprintsForTarget[0];
    const rootBlueprint = rootBlueprintsForTarget[0];
    expect(moduleBlueprint?.rendererKey).toBe('fill-in-the-blank');
    expect(rootBlueprint?.rendererKey).toBe('fill-in-the-blank');
    expect(moduleBlueprint?.rendererModeMap).toEqual({
      worked: 'fill-in-the-blank',
      guidedPractice: 'fill-in-the-blank',
      independentPractice: 'fill-in-the-blank',
    });
    expect(rootBlueprint?.rendererModeMap).toEqual({
      worked: 'fill-in-the-blank',
      guidedPractice: 'fill-in-the-blank',
      independentPractice: 'fill-in-the-blank',
    });
    expect(moduleBlueprint?.generatorKey).toBe('quadratic-profit-model');
    expect(rootBlueprint?.generatorKey).toBe('quadratic-profit-model');
    if (!moduleBlueprint || !rootBlueprint) return;
    const seed0 = getGenerator('quadratic-profit-model').generate({
      nodeId: PROFIT_MAXIMUM_SKILL,
      seed: 0,
      difficulty: 0.5,
    });
    const seed0RendererProps = (seed0.data as { rendererProps: Record<string, unknown> }).rendererProps;
    expect(moduleBlueprint.workedExampleSpec).toEqual(rootBlueprint.workedExampleSpec);
    expect(moduleBlueprint.workedExampleSpec?.rendererProps).toEqual(seed0RendererProps);
    expect(validateModeSupport(moduleBlueprint).valid).toBe(true);
    expect(moduleBlueprint.independentPracticeSpec).toEqual(PROFIT_MAXIMUM_INDEPENDENT_PRACTICE_SPEC);
    expect(moduleBlueprint.gradingSpec).toEqual(PROFIT_MAXIMUM_GRADING_SPEC);
    expect(validateBlueprintGeneratorReadiness(moduleBlueprint).valid).toBe(true);
    for (const catalog of [
      lessonNodes(),
      draftNodes(),
      courseNodes(),
      courseStandardNodes(),
      embeddedCourseNodes(),
    ]) {
      const matches = catalog.filter(node => node.id === PROFIT_MAXIMUM_SKILL);
      expect(matches).toHaveLength(1);
      expect(matches[0]?.independentPracticeReady).toBe(true);
      expect(matches[0]).not.toHaveProperty('generatorKey');
      expect(matches[0]).not.toHaveProperty('rendererKey');
    }
    expect(rootBlueprint).toEqual(moduleBlueprint);
  });

  it('adds the exact Worked maximum-profit specification to both blueprint mirrors', () => {
    const generator = getGenerator('quadratic-profit-model');
    const seed0 = generator.generate({
      nodeId: PROFIT_MAXIMUM_SKILL,
      seed: 0,
      difficulty: 0.5,
    });
    const seed0RendererProps = (seed0.data as { rendererProps: Record<string, unknown> }).rendererProps;
    const workedExampleSpec = {
      prompt: 'A ski resort sells 680 passes at a base price of $120. For each $5 increase, it sells 20 fewer passes. Given P(x) = -100x^2 + 1000x + 81600, find the maximizing x, the price per pass, and the maximum profit.',
      givens: [
        'A ski resort sells 680 passes at $120 per pass.',
        'Each $5 price increase results in 20 fewer passes sold.',
        'P(x) = -100x^2 + 1000x + 81600.',
      ],
      target: {
        optimalIncreases: '5',
        optimalPrice: '145',
        maximumProfit: '84100',
      },
      steps: [
        {
          description: 'Find the axis of symmetry.',
          expression: 'x = -b/(2a) = -1000/(2(-100)) = 5',
          result: 'x = 5 means 5 price increases.',
        },
        {
          description: 'Find the price per pass.',
          expression: '120 + 5(5) = 145 dollars per pass',
          result: 'The price is $145 per pass.',
        },
        {
          description: 'Evaluate the profit at the maximum.',
          expression: 'P(5) = -100(5)^2 + 1000(5) + 81600 = 84100 dollars',
          result: 'The maximum profit is $84,100.',
        },
      ],
      explanation: 'The axis of symmetry gives the maximizing number of price increases. Use it to find the price per pass, then evaluate P(x) to find the maximum profit.',
      rendererProps: seed0RendererProps,
    };
    const targetBlueprints = [
      moduleBlueprints.find(blueprint => blueprint.nodeId === PROFIT_MAXIMUM_SKILL),
      rootBlueprints.find(blueprint => blueprint.nodeId === PROFIT_MAXIMUM_SKILL),
    ];

    for (const blueprint of targetBlueprints) {
      expect(blueprint?.workedExampleSpec).toEqual(workedExampleSpec);
      expect(knowledgeBlueprintSchema.safeParse(blueprint).success).toBe(true);
    }
    expect(targetBlueprints[1]).toEqual(targetBlueprints[0]);
  });

  it('adds the exact Guided maximum-profit specification to both blueprint mirrors', () => {
    const moduleBlueprintMatches = moduleBlueprints.filter(
      blueprint => blueprint.nodeId === PROFIT_MAXIMUM_SKILL,
    );
    const rootBlueprintMatches = rootBlueprints.filter(
      blueprint => blueprint.nodeId === PROFIT_MAXIMUM_SKILL,
    );
    expect(moduleBlueprintMatches).toHaveLength(1);
    expect(rootBlueprintMatches).toHaveLength(1);
    const moduleBlueprint = moduleBlueprintMatches[0];
    const rootBlueprint = rootBlueprintMatches[0];
    expect(moduleBlueprint).toEqual(rootBlueprint);
    if (!moduleBlueprint || !rootBlueprint) return;

    const seed0 = getGenerator('quadratic-profit-model').generate({
      nodeId: PROFIT_MAXIMUM_SKILL,
      seed: 0,
      difficulty: 0.5,
    });
    const seed1 = getGenerator('quadratic-profit-model').generate({
      nodeId: PROFIT_MAXIMUM_SKILL,
      seed: 1,
      difficulty: 0.5,
    });
    const seed2 = getGenerator('quadratic-profit-model').generate({
      nodeId: PROFIT_MAXIMUM_SKILL,
      seed: 2,
      difficulty: 0.5,
    });
    const seed0RendererProps = (seed0.data as { rendererProps: Record<string, unknown> }).rendererProps;
    const seed1RendererProps = (seed1.data as { rendererProps: Record<string, unknown> }).rendererProps;
    const seed2RendererProps = (seed2.data as { rendererProps: Record<string, unknown> }).rendererProps;

    for (const blueprint of [moduleBlueprint, rootBlueprint]) {
      expect(blueprint.rendererKey).toBe('fill-in-the-blank');
      expect(blueprint.rendererModeMap).toEqual({
        worked: 'fill-in-the-blank',
        guidedPractice: 'fill-in-the-blank',
        independentPractice: 'fill-in-the-blank',
      });
      expect(blueprint.guidedPracticeSpec).toEqual(PROFIT_MAXIMUM_GUIDED_PRACTICE_SPEC);
      expect(blueprint.guidedPracticeSpec?.rendererProps).toEqual(seed1RendererProps);
      expect(fillInTheBlankSchema.safeParse(blueprint.guidedPracticeSpec?.rendererProps).success).toBe(true);
      expect(knowledgeBlueprintSchema.safeParse(blueprint).success).toBe(true);
      expect(validateModeSupport(blueprint).valid).toBe(true);
      expect(validateBlueprintGeneratorReadiness(blueprint).valid).toBe(true);
      expect(validateGradingCompatibility(blueprint).valid).toBe(true);
      expect(blueprint.workedExampleSpec?.rendererProps).toEqual(seed0RendererProps);
      expect(blueprint.independentPracticeSpec).toEqual(PROFIT_MAXIMUM_INDEPENDENT_PRACTICE_SPEC);
      expect(blueprint.independentPracticeSpec?.rendererProps).toEqual(seed2RendererProps);
      expect(fillInTheBlankSchema.safeParse(blueprint.independentPracticeSpec?.rendererProps).success).toBe(true);
      expect(blueprint.gradingSpec).toEqual(PROFIT_MAXIMUM_GRADING_SPEC);
    }

    for (const catalog of [
      lessonNodes(),
      draftNodes(),
      courseNodes(),
      courseStandardNodes(),
      embeddedCourseNodes(),
    ]) {
      const matches = catalog.filter(node => node.id === PROFIT_MAXIMUM_SKILL);
      expect(matches).toHaveLength(1);
      expect(matches[0]?.independentPracticeReady).toBe(true);
    }
  });

  it('adds the exact Independent and grading maximum-profit specifications to both blueprint mirrors', () => {
    const moduleBlueprintMatches = moduleBlueprints.filter(
      blueprint => blueprint.nodeId === PROFIT_MAXIMUM_SKILL,
    );
    const rootBlueprintMatches = rootBlueprints.filter(
      blueprint => blueprint.nodeId === PROFIT_MAXIMUM_SKILL,
    );
    expect(moduleBlueprintMatches).toHaveLength(1);
    expect(rootBlueprintMatches).toHaveLength(1);
    const moduleBlueprint = moduleBlueprintMatches[0];
    const rootBlueprint = rootBlueprintMatches[0];
    expect(moduleBlueprint).toEqual(rootBlueprint);
    if (!moduleBlueprint || !rootBlueprint) return;

    const generator = getGenerator('quadratic-profit-model');
    const seed0 = generator.generate({ nodeId: PROFIT_MAXIMUM_SKILL, seed: 0, difficulty: 0.5 });
    const seed1 = generator.generate({ nodeId: PROFIT_MAXIMUM_SKILL, seed: 1, difficulty: 0.5 });
    const seed2 = generator.generate({ nodeId: PROFIT_MAXIMUM_SKILL, seed: 2, difficulty: 0.5 });
    const seed0RendererProps = (seed0.data as { rendererProps: Record<string, unknown> }).rendererProps;
    const seed1RendererProps = (seed1.data as { rendererProps: Record<string, unknown> }).rendererProps;
    const seed2RendererProps = (seed2.data as { rendererProps: Record<string, unknown> }).rendererProps;
    const independentKeys = ['optimalIncreases', 'optimalPrice', 'maximumProfit'];

    expect(seed2.expectedAnswer).toEqual({
      optimalIncreases: '6',
      optimalPrice: '150',
      maximumProfit: '135000',
    });
    expect(seed2.gradingMetadata).toEqual({
      partAnswers: {
        optimalIncreases: '6',
        optimalPrice: '150',
        maximumProfit: '135000',
      },
      partMaxScores: { optimalIncreases: 1, optimalPrice: 1, maximumProfit: 1 },
      partGradingRules: {
        optimalIncreases: 'exact_match',
        optimalPrice: 'exact_match',
        maximumProfit: 'exact_match',
      },
    });

    for (const blueprint of [moduleBlueprint, rootBlueprint]) {
      expect(blueprint.rendererKey).toBe('fill-in-the-blank');
      expect(blueprint.rendererModeMap).toEqual({
        worked: 'fill-in-the-blank',
        guidedPractice: 'fill-in-the-blank',
        independentPractice: 'fill-in-the-blank',
      });
      expect(blueprint.independentPracticeSpec).toEqual(PROFIT_MAXIMUM_INDEPENDENT_PRACTICE_SPEC);
      expect(blueprint.gradingSpec).toEqual(PROFIT_MAXIMUM_GRADING_SPEC);
      expect(blueprint.independentPracticeSpec?.rendererProps).toEqual(seed2RendererProps);
      expect(fillInTheBlankSchema.safeParse(blueprint.independentPracticeSpec?.rendererProps).success).toBe(true);
      expect(knowledgeBlueprintSchema.safeParse(blueprint).success).toBe(true);
      expect(validateModeSupport(blueprint).valid).toBe(true);
      expect(validateBlueprintGeneratorReadiness(blueprint).valid).toBe(true);
      expect(validateGradingCompatibility(blueprint).valid).toBe(true);
      expect(blueprint.workedExampleSpec?.rendererProps).toEqual(seed0RendererProps);
      expect(blueprint.guidedPracticeSpec?.rendererProps).toEqual(seed1RendererProps);

      expect(Object.keys(PROFIT_MAXIMUM_INDEPENDENT_PRACTICE_SPEC.answerSchema)).toEqual(independentKeys);
      expect(PROFIT_MAXIMUM_INDEPENDENT_PRACTICE_SPEC.gradingRules.map(rule => rule.partId)).toEqual(independentKeys);
      expect(PROFIT_MAXIMUM_GRADING_SPEC.partIds).toEqual(independentKeys);
      const rendererProps = blueprint.independentPracticeSpec?.rendererProps as {
        blanks: Array<{ id: string }>;
      } | undefined;
      expect(rendererProps?.blanks.map(blank => blank.id)).toEqual(independentKeys);
      expect(Object.keys(seed2.expectedAnswer)).toEqual(independentKeys);
      expect(Object.keys(seed2.gradingMetadata.partAnswers)).toEqual(independentKeys);
      expect(Object.keys(seed2.gradingMetadata.partMaxScores)).toEqual(independentKeys);
      expect(Object.keys(seed2.gradingMetadata.partGradingRules)).toEqual(independentKeys);
      expect(new Set(independentKeys).size).toBe(independentKeys.length);
    }

    const activities = projectActivityMap(lessonNodes(), lessonEdges(), [moduleBlueprint])
      .filter(activity => activity.nodeId === PROFIT_MAXIMUM_SKILL);
    expect(activities).toHaveLength(3);
    expect(activities.map(activity => activity.mode)).toEqual([
      'worked_example',
      'guided_practice',
      'independent_practice',
    ]);
    expect(activities.map(activity => activity.stableActivityId)).toEqual([
      `${PROFIT_MAXIMUM_SKILL}.worked_example`,
      `${PROFIT_MAXIMUM_SKILL}.guided_practice`,
      `${PROFIT_MAXIMUM_SKILL}.independent_practice`,
    ]);
    expect(activities.map(activity => activity.srsEligible)).toEqual([false, true, true]);

    for (const catalog of [lessonNodes(), draftNodes(), courseNodes(), courseStandardNodes(), embeddedCourseNodes()]) {
      const matches = catalog.filter(node => node.id === PROFIT_MAXIMUM_SKILL);
      expect(matches).toHaveLength(1);
      expect(matches[0]?.independentPracticeReady).toBe(true);
      expect(matches[0]).not.toHaveProperty('generatorKey');
      expect(matches[0]).not.toHaveProperty('rendererKey');
    }
  });

  it('synchronizes the Example 3 profit-domain candidate node catalogs', () => {
    const moduleNode = lessonNodes().find(node => node.id === PROFIT_DOMAIN_SKILL);
    expect(moduleNode).toBeDefined();
    const catalogs = [draftNodes(), courseNodes(), courseStandardNodes(), embeddedCourseNodes()];
    for (const nodes of catalogs) {
      const matches = nodes.filter(node => node.id === PROFIT_DOMAIN_SKILL);
      expect(matches).toHaveLength(1);
      expect(matches[0]).toEqual(moduleNode);
    }
    expect(lessonNodes().filter(node => node.id === PROFIT_DOMAIN_SKILL)).toHaveLength(1);

    const moduleBlueprint = moduleBlueprints.find(
      blueprint => blueprint.nodeId === PROFIT_DOMAIN_SKILL,
    );
    const rootBlueprints = courseBlueprints().filter(blueprint => blueprint.nodeId === PROFIT_DOMAIN_SKILL);
    expect(moduleBlueprint).toBeDefined();
    expect(rootBlueprints).toHaveLength(1);
    expect(rootBlueprints[0]).toEqual(moduleBlueprint);
  });

  it('synchronizes the Example 3 profit-model candidate edges', () => {
    const moduleContains = lessonEdges().filter(
      edge => edge.sourceId === 'math.im3.lesson.1.1' && edge.targetId === PROFIT_MODEL_SKILL,
    );
    expect(moduleContains).toHaveLength(1);
    const rootContains = courseEdges().filter(
      edge => edge.sourceId === 'math.im3.lesson.1.1' && edge.targetId === PROFIT_MODEL_SKILL,
    );
    expect(rootContains).toHaveLength(1);
    expect(rootContains[0]).toEqual(moduleContains[0]);

    const moduleStandardEdges = standardEdges().filter(
      edge => PROFIT_MODEL_STANDARD_EDGES.includes(edge.id as (typeof PROFIT_MODEL_STANDARD_EDGES)[number]),
    );
    expect(moduleStandardEdges).toHaveLength(2);
    expect(moduleStandardEdges.map(edge => edge.id)).toEqual([...PROFIT_MODEL_STANDARD_EDGES]);
    for (const catalog of [courseStandardEdges(), courseEdges()]) {
      const rootStandardEdges = catalog.filter(
        edge => PROFIT_MODEL_STANDARD_EDGES.includes(edge.id as (typeof PROFIT_MODEL_STANDARD_EDGES)[number]),
      );
      expect(rootStandardEdges).toHaveLength(2);
      expect(rootStandardEdges).toEqual(moduleStandardEdges);
    }
  });

  it('keeps HSF-IF.B.5 equal in the Module 1 standard catalogs', () => {
    const expected = {
      id: DOMAIN_STANDARD,
      kind: 'standard',
      title: 'HSF-IF.B.5: Relate the domain of a function to its graph and, where applicable, to the quantitative relationship it describes.',
      domain: 'math',
      description: 'Relate the domain of a function to its graph and, where applicable, to the quantitative relationship it describes.',
      sourceRefs: [
        {
          source: 'seed-standards:ccss',
          note: 'HSF-IF.B.5',
        },
      ],
      reviewStatus: 'reviewed',
      metadata: {
        framework: 'ccss',
        code: 'HSF-IF.B.5',
      },
    };
    const moduleNodes = lessonNodes().filter(node => node.id === DOMAIN_STANDARD);
    const standardCatalogNodes = moduleStandardNodes().filter(node => node.id === DOMAIN_STANDARD);
    expect(moduleNodes).toHaveLength(1);
    expect(standardCatalogNodes).toHaveLength(1);
    expect(moduleNodes[0]).toEqual(expected);
    expect(standardCatalogNodes[0]).toEqual(expected);
    expect(moduleNodes[0]).toEqual(standardCatalogNodes[0]);
  });

  it('keeps the official 7a and 7b standard nodes in the Module 1 and root node catalogs', () => {
    const expectedStandards = [
      {
        id: 'math.standard.ccss.hsf-if-c-7a',
        code: 'HSF-IF.C.7a',
        description: 'Graph linear and quadratic functions and show intercepts, maxima, and minima',
      },
      {
        id: 'math.standard.ccss.hsf-if-c-7b',
        code: 'HSF-IF.C.7b',
        description: 'Graph square root, cube root, and piecewise-defined functions, including step functions and absolute value functions',
      },
    ];
    const catalogs = [lessonNodes(), moduleStandardNodes(), courseNodes()];

    for (const catalog of catalogs) {
      for (const standard of expectedStandards) {
        const matches = catalog.filter(node => node.id === standard.id);
        expect(matches).toHaveLength(1);
        expect(matches[0]).toEqual({
          id: standard.id,
          kind: 'standard',
          title: `${standard.code}: ${standard.description}`,
          domain: 'math',
          description: standard.description,
          sourceRefs: [
            {
              source: 'seed-standards:ccss',
              note: standard.code,
            },
          ],
          reviewStatus: 'reviewed',
          metadata: {
            framework: 'ccss',
            code: standard.code,
          },
        });
      }
    }
  });

  it('keeps the HSF-IF.B.6 and HSF-IF.C.9 standard nodes in the Module 1 and root node catalogs', () => {
    const expectedStandards = [
      {
        id: 'math.standard.ccss.hsf-if-b-6',
        code: 'HSF-IF.B.6',
        description: 'Calculate and interpret the average rate of change of a function (presented symbolically or as a table) over a specified interval. Estimate the rate of change from a graph.',
      },
      {
        id: 'math.standard.ccss.hsf-if-c-9',
        code: 'HSF-IF.C.9',
        description: 'Compare properties of two functions each represented in a different way (algebraically, graphically, numerically in tables, or by verbal descriptions).',
      },
    ];
    const catalogs = [lessonNodes(), moduleStandardNodes(), courseNodes()];

    for (const catalog of catalogs) {
      for (const standard of expectedStandards) {
        const matches = catalog.filter(node => node.id === standard.id);
        expect(matches).toHaveLength(1);
        expect(matches[0]).toEqual({
          id: standard.id,
          kind: 'standard',
          title: `${standard.code}: ${standard.description}`,
          domain: 'math',
          description: standard.description,
          sourceRefs: [
            {
              source: 'seed-standards:ccss',
              note: standard.code,
            },
          ],
          reviewStatus: 'reviewed',
          metadata: {
            framework: 'ccss',
            code: standard.code,
          },
        });
      }
    }
  });

  it('keeps all four official standard nodes in the root edge catalogs', () => {
    const expectedStandards = [
      {
        id: 'math.standard.ccss.hsf-if-c-7a',
        code: 'HSF-IF.C.7a',
        description: 'Graph linear and quadratic functions and show intercepts, maxima, and minima',
      },
      {
        id: 'math.standard.ccss.hsf-if-c-7b',
        code: 'HSF-IF.C.7b',
        description: 'Graph square root, cube root, and piecewise-defined functions, including step functions and absolute value functions',
      },
      {
        id: 'math.standard.ccss.hsf-if-b-6',
        code: 'HSF-IF.B.6',
        description: 'Calculate and interpret the average rate of change of a function (presented symbolically or as a table) over a specified interval. Estimate the rate of change from a graph.',
      },
      {
        id: 'math.standard.ccss.hsf-if-c-9',
        code: 'HSF-IF.C.9',
        description: 'Compare properties of two functions each represented in a different way (algebraically, graphically, numerically in tables, or by verbal descriptions).',
      },
    ];
    const catalogs = [courseStandardNodes(), embeddedCourseNodes()];

    for (const catalog of catalogs) {
      for (const standard of expectedStandards) {
        const matches = catalog.filter(node => node.id === standard.id);
        expect(matches).toHaveLength(1);
        expect(matches[0]).toEqual({
          id: standard.id,
          kind: 'standard',
          title: `${standard.code}: ${standard.description}`,
          domain: 'math',
          description: standard.description,
          sourceRefs: [
            {
              source: 'seed-standards:ccss',
              note: standard.code,
            },
          ],
          reviewStatus: 'reviewed',
          metadata: {
            framework: 'ccss',
            code: standard.code,
          },
        });
      }
    }
  });

  it('preserves the two Lesson 1 skill objects in the draft graph source', () => {
    for (const skillId of [GRAPH_SKILL, MAXIMUM_SKILL]) {
      const draftMatches = draftNodes().filter(node => node.id === skillId);
      const moduleMatches = lessonNodes().filter(node => node.id === skillId);

      expect(draftMatches).toHaveLength(1);
      expect(moduleMatches).toHaveLength(1);
      expect(draftMatches[0]).toEqual(moduleMatches[0]);
    }
  });

  it('preserves the two Example 2 candidate skill objects in the draft graph source', () => {
    for (const skillId of EXAMPLE_TWO_SKILL_IDS) {
      const draftMatches = draftNodes().filter(node => node.id === skillId);
      const moduleMatches = lessonNodes().filter(node => node.id === skillId);

      expect(draftMatches).toHaveLength(1);
      expect(moduleMatches).toHaveLength(1);
      expect(draftMatches[0]).toEqual(moduleMatches[0]);
    }
  });

  it('keeps the two Lesson 1 skills and blueprints synchronized in the root graph', () => {
    for (const skillId of [GRAPH_SKILL, MAXIMUM_SKILL]) {
      const rootNodeMatches = courseNodes().filter(node => node.id === skillId);
      const moduleNodeMatches = lessonNodes().filter(node => node.id === skillId);
      const rootBlueprintMatches = courseBlueprints().filter(blueprint => blueprint.nodeId === skillId);
      const moduleBlueprintMatches = moduleBlueprints.filter(
        blueprint => blueprint.nodeId === skillId,
      );

      expect(rootNodeMatches).toHaveLength(1);
      expect(moduleNodeMatches).toHaveLength(1);
      expect(rootNodeMatches[0]).toEqual(moduleNodeMatches[0]);
      expect(rootBlueprintMatches).toHaveLength(1);
      expect(moduleBlueprintMatches).toHaveLength(1);
      expect(rootBlueprintMatches[0]).toEqual(moduleBlueprintMatches[0]);
    }
  });

  it('keeps the Example 2 graph-from-key-features skill and blueprint synchronized in the root graph', () => {
    const rootNodeMatches = courseNodes().filter(node => node.id === KEY_FEATURES_SKILL);
    const moduleNodeMatches = lessonNodes().filter(node => node.id === KEY_FEATURES_SKILL);
    const rootBlueprintMatches = courseBlueprints().filter(
      blueprint => blueprint.nodeId === KEY_FEATURES_SKILL,
    );
    const moduleBlueprintMatches = moduleBlueprints.filter(
      blueprint => blueprint.nodeId === KEY_FEATURES_SKILL,
    );

    expect(rootNodeMatches).toHaveLength(1);
    expect(moduleNodeMatches).toHaveLength(1);
    expect(rootNodeMatches[0]).toEqual(moduleNodeMatches[0]);
    expect(rootBlueprintMatches).toHaveLength(1);
    expect(moduleBlueprintMatches).toHaveLength(1);
    expect(rootBlueprintMatches[0]).toEqual(moduleBlueprintMatches[0]);
  });

  it('keeps the Example 2 compare-maximums skill and blueprint synchronized in the root graph', () => {
    const rootNodeMatches = courseNodes().filter(node => node.id === COMPARE_MAXIMUMS_SKILL);
    const moduleNodeMatches = lessonNodes().filter(node => node.id === COMPARE_MAXIMUMS_SKILL);
    const rootBlueprintMatches = courseBlueprints().filter(
      blueprint => blueprint.nodeId === COMPARE_MAXIMUMS_SKILL,
    );
    const moduleBlueprintMatches = moduleBlueprints.filter(
      blueprint => blueprint.nodeId === COMPARE_MAXIMUMS_SKILL,
    );

    expect(rootNodeMatches).toHaveLength(1);
    expect(moduleNodeMatches).toHaveLength(1);
    expect(rootNodeMatches[0]).toEqual(moduleNodeMatches[0]);
    expect(rootBlueprintMatches).toHaveLength(1);
    expect(moduleBlueprintMatches).toHaveLength(1);
    expect(rootBlueprintMatches[0]).toEqual(moduleBlueprintMatches[0]);
  });

  it('aligns Example 1 and its graph skill only to HSF-IF.C.7a', () => {
    expect(courseBlueprints().find(blueprint => blueprint.nodeId === GRAPH_SKILL)?.alignmentNodeIds).toEqual([
      GRAPH_STANDARD,
    ]);
    expect(moduleBlueprints.find(
      blueprint => blueprint.nodeId === GRAPH_SKILL,
    )?.alignmentNodeIds).toEqual([GRAPH_STANDARD]);

    const expectedEdges = [
      {
        id: EXAMPLE_ONE_STANDARD_EDGE,
        sourceId: EXAMPLE_ONE,
        note: 'Primary alignment for authored Example 1',
      },
      {
        id: GRAPH_STANDARD_EDGE,
        sourceId: GRAPH_SKILL,
        note: 'Primary alignment for the Example 1 graph skill',
      },
    ];

    for (const catalog of [courseEdges(), standardEdges(), courseStandardEdges()]) {
      for (const expected of expectedEdges) {
        const matches = catalog.filter(
          edge => edge.type === 'aligned_to_standard' && edge.sourceId === expected.sourceId,
        );
        expect(matches).toHaveLength(1);
        expect(matches[0]).toEqual({
          id: expected.id,
          type: 'aligned_to_standard',
          sourceId: expected.sourceId,
          targetId: GRAPH_STANDARD,
          weight: 0.8,
          confidence: 'high',
          sourceRefs: [
            {
              source: 'apps/integrated-math-3/curriculum/IM3-reveal-module-1.pdf#page=4',
              note: expected.note,
            },
          ],
          reviewStatus: 'draft',
          metadata: { isPrimary: true, course: 'im3' },
        });
      }
    }
  });

  it('synchronizes the Lesson 1 nodes and maximum edge in the root catalogs', () => {
    for (const skillId of [GRAPH_SKILL, MAXIMUM_SKILL]) {
      const rootNode = courseNodes().find(node => node.id === skillId);
      for (const catalog of [courseEdgesJson, courseStandardEdgesJson]) {
        const matches = (catalog as { nodes: KnowledgeSpaceNode[] }).nodes.filter(
          node => node.id === skillId,
        );
        expect(matches).toHaveLength(1);
        expect(matches[0]).toEqual(rootNode);
      }
    }

    const moduleMaximumEdge = standardEdges().filter(
      edge => edge.sourceId === MAXIMUM_SKILL && edge.type === 'aligned_to_standard',
    );
    expect(moduleMaximumEdge).toHaveLength(1);
    for (const catalog of [courseEdges(), courseStandardEdges()]) {
      const matches = catalog.filter(
        edge => edge.sourceId === MAXIMUM_SKILL && edge.type === 'aligned_to_standard',
      );
      expect(matches).toHaveLength(1);
      expect(matches[0]).toEqual(moduleMaximumEdge[0]);
    }
  });

  it('keeps the graph skill ready across all five node catalogs', () => {
    const expectedGraphNode = {
      id: GRAPH_SKILL,
      kind: 'skill',
      title: '1a: Graph a quadratic function by using a table',
      domain: 'math.im3',
      description: 'Graph a quadratic function from an equation by using a table.',
      sourceRefs: ['apps/integrated-math-3/curriculum/module-1-class-period-plan.md'],
      reviewStatus: 'draft',
      metadata: { course: 'im3', module: '1', lesson: '1' },
      generatorKey: 'quadratic-graph-analysis',
      independentPracticeReady: true,
      rendererKey: 'graphing-explorer',
    };
    const catalogs = [
      lessonNodes(),
      draftNodes(),
      courseNodes(),
      courseStandardNodes(),
      embeddedCourseNodes(),
    ];

    for (const catalog of catalogs) {
      const matches = catalog.filter(node => node.id === GRAPH_SKILL);
      expect(matches).toHaveLength(1);
      expect(matches[0]).toEqual(expectedGraphNode);
    }
  });

  it('freezes the seed-1 Guided graph-by-table contract', () => {
    const generator = getGenerator('quadratic-graph-analysis');
    const seed1 = generator.generate({
      nodeId: GRAPH_SKILL,
      seed: 1,
      difficulty: 0.5,
    });
    const expectedSeed1 = {
      prompt:
        'Complete the table for y = x^2 - x - 2 using x = -2, -1, 0, 1, 2, then plot all five points.',
      expectedAnswer: {
        table_values: [
          { x: -2, y: 4 },
          { x: -1, y: 0 },
          { x: 0, y: -2 },
          { x: 1, y: -2 },
          { x: 2, y: 0 },
        ],
        placed_points: [
          { x: -2, y: 4 },
          { x: -1, y: 0 },
          { x: 0, y: -2 },
          { x: 1, y: -2 },
          { x: 2, y: 0 },
        ],
      },
      gradingMetadata: {
        partAnswers: {
          table_values: [
            { x: -2, y: 4 },
            { x: -1, y: 0 },
            { x: 0, y: -2 },
            { x: 1, y: -2 },
            { x: 2, y: 0 },
          ],
          placed_points: [
            { x: -2, y: 4 },
            { x: -1, y: 0 },
            { x: 0, y: -2 },
            { x: 1, y: -2 },
            { x: 2, y: 0 },
          ],
        },
        partMaxScores: { table_values: 1, placed_points: 1 },
        partGradingRules: { table_values: 'custom', placed_points: 'custom' },
      },
      rendererProps: {
        equation: 'y = x^2 - x - 2',
        variant: 'plot_from_equation',
        responseVariant: 'table_graph',
        domain: [-5, 5],
        range: [-10, 10],
      },
    };
    const moduleBlueprint = moduleBlueprints.find(item => item.nodeId === GRAPH_SKILL);
    const rootBlueprint = rootBlueprints.find(item => item.nodeId === GRAPH_SKILL);

    expect(seed1.prompt).toBe(expectedSeed1.prompt);
    expect(seed1.expectedAnswer).toEqual(expectedSeed1.expectedAnswer);
    expect(seed1.gradingMetadata).toEqual(expectedSeed1.gradingMetadata);
    expect((seed1.data as { rendererProps: unknown }).rendererProps).toEqual(
      expectedSeed1.rendererProps,
    );
    expect(generator.generate({ nodeId: GRAPH_SKILL, seed: 1, difficulty: 0.5 })).toEqual(seed1);
    expect(moduleBlueprint).toBeDefined();
    expect(rootBlueprint).toEqual(moduleBlueprint);
    for (const blueprint of [moduleBlueprint, rootBlueprint]) {
      expect(blueprint?.guidedPracticeSpec).toEqual({
        scaffoldedPrompt:
          'Complete the table for y = x^2 - x - 2 using x = -2, -1, 0, 1, 2, then plot all five points.',
        stepPrompts: [
          'Substitute each x-value into the equation to complete the five-value table.',
          'Plot the five ordered pairs from the completed table.',
          'Draw the quadratic through the plotted points.',
        ],
        hints: [
          'Substitute each x-value into y = x^2 - x - 2 to find its y-value.',
          'Use each ordered pair (x, y) from the table as one graph point.',
          'A quadratic function graphs as a parabola through the plotted points.',
        ],
        checksPerStep: [
          { check: 'The five table y-values are 4, 0, -2, -2, and 0.' },
          {
            check: 'The plotted points are (-2, 4), (-1, 0), (0, -2), (1, -2), and (2, 0).',
          },
          { check: 'The points form the parabola y = x^2 - x - 2.' },
        ],
        revealPolicy: 'one_at_a_time',
        rendererProps: expectedSeed1.rendererProps,
      });
      expect(blueprint?.guidedPracticeSpec?.stepPrompts).not.toContain(
        expect.stringMatching(/domain|range/i),
      );
      expect(blueprint?.guidedPracticeSpec?.stepPrompts).not.toContain(
        expect.stringMatching(/vertex|intercept|axis of symmetry/i),
      );
      expect(blueprint?.gradingSpec).toEqual({
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
      });
    }
    expect(lessonNodes().find(node => node.id === GRAPH_SKILL)?.independentPracticeReady).toBe(true);
  });

  it('adds the quadratic-profit-model generator node to the synchronized catalogs', () => {
    const generatorNodeId = 'math.im3.generator.m1.quadratic-profit-model';
    const expectedNode = {
      id: generatorNodeId,
      kind: 'generator',
      title: 'Quadratic Profit Model Generator',
      domain: 'math.im3',
      sourceRefs: [
        { source: 'pilot', note: 'Module 1 pilot generator' },
      ],
      derived: true,
      derivationMethod: 'registered-generator',
      reviewStatus: 'draft',
      metadata: {
        course: 'im3',
        module: '1',
        generatorKey: 'quadratic-profit-model',
      },
    };
    const catalogs = [
      lessonNodes(),
      courseNodes(),
      embeddedCourseNodes(),
    ];

    for (const catalog of catalogs) {
      const matches = catalog.filter(node => node.id === generatorNodeId);
      expect(matches).toHaveLength(1);
      expect(matches[0]).toEqual(expectedNode);
    }
  });

  it('adds the two-real-solutions generator node and generated_by edge to synchronized catalogs', () => {
    const generatorNodeId = 'math.im3.generator.m1.two-real-solutions-graphing';
    const skillNodeId = 'math.im3.skill.1.2.find-two-numbers-with-given-sum-and-product-by-graphing';
    const generatedByEdgeId = 'math.im3.edge.m1.161';
    const expectedNode = {
      id: generatorNodeId,
      kind: 'generator',
      title: 'Two Real Solutions Graphing Generator',
      domain: 'math.im3',
      sourceRefs: [
        { source: 'pilot', note: 'Module 1 pilot generator' },
      ],
      derived: true,
      derivationMethod: 'registered-generator',
      reviewStatus: 'draft',
      metadata: {
        course: 'im3',
        module: '1',
        generatorKey: 'two-real-solutions-graphing',
      },
    };
    const expectedEdge: KnowledgeSpaceEdge = {
      id: generatedByEdgeId,
      type: 'generated_by',
      sourceId: skillNodeId,
      targetId: generatorNodeId,
      weight: 1,
      confidence: 'high',
      reviewStatus: 'draft',
      metadata: { course: 'im3', module: '1' },
      rationale: `Skill ${skillNodeId} generated by ${generatorNodeId}`,
      sourceRefs: [{ source: 'pilot', note: 'Module 1 pilot generator' }],
      derived: true,
      derivationMethod: 'generator-registry-mapping',
    };
    const nodeCatalogs = [lessonNodes(), courseNodes(), embeddedCourseNodes()];
    const edgeCatalogs = [lessonEdges(), courseEdges()];
    const nodeMatches = nodeCatalogs.map(catalog => catalog.filter(node => node.id === generatorNodeId));
    const edgeMatches = edgeCatalogs.map(catalog => catalog.filter(edge => edge.id === generatedByEdgeId));

    for (const matches of nodeMatches) {
      expect(matches).toHaveLength(1);
      expect(matches[0]).toEqual(expectedNode);
    }
    expect(nodeMatches[1][0]).toEqual(nodeMatches[0][0]);
    expect(nodeMatches[2][0]).toEqual(nodeMatches[0][0]);

    for (const matches of edgeMatches) {
      expect(matches).toHaveLength(1);
      expect(matches[0]).toEqual(expectedEdge);
      expect(matches[0]?.sourceId).toBe(skillNodeId);
      expect(matches[0]?.targetId).toBe(generatorNodeId);
    }
    expect(edgeMatches[1][0]).toEqual(edgeMatches[0][0]);
  });

  it('adds the Example 1 domain-and-range skill node to all five node catalogs', () => {
    const expectedNode = {
      id: DOMAIN_RANGE_FROM_GRAPH_SKILL,
      kind: 'skill',
      title: 'State the domain and range of a quadratic function from its graph',
      domain: 'math.im3',
      description: 'State the domain and range of a quadratic function from its graph.',
      sourceRefs: [
        'apps/integrated-math-3/curriculum/module-1-class-period-plan.md (1-1, Example 1)',
        'apps/integrated-math-3/curriculum/IM3-reveal-module-1.pdf#page=4',
      ],
      reviewStatus: 'draft',
      metadata: { course: 'im3', module: '1', lesson: '1' },
      generatorKey: 'quadratic-graph-analysis',
      independentPracticeReady: true,
      rendererKey: 'graphing-explorer',
    };
    const catalogs = [
      lessonNodes(),
      draftNodes(),
      courseNodes(),
      courseStandardNodes(),
      embeddedCourseNodes(),
    ];

    for (const catalog of catalogs) {
      const matches = catalog.filter(node => node.id === DOMAIN_RANGE_FROM_GRAPH_SKILL);
      expect(matches).toHaveLength(1);
      expect(matches[0]).toEqual(expectedNode);
    }
  });

  it('adds the Example 1 domain-and-range blueprint to both blueprint catalogs', () => {
    const expectedRendererProps = [
      {
        equation: 'f(x) = x^2 + 2x - 3',
        variant: 'plot_from_equation',
        responseVariant: 'domain_range',
        domain: [-5, 5],
        range: [-10, 10],
      },
      {
        equation: 'y = x^2 - x - 2',
        variant: 'plot_from_equation',
        responseVariant: 'domain_range',
        domain: [-5, 5],
        range: [-10, 10],
      },
      {
        equation: 'y = -x^2 - 1',
        variant: 'plot_from_equation',
        responseVariant: 'domain_range',
        domain: [-5, 5],
        range: [-10, 10],
      },
    ];
    const catalogs = [moduleBlueprints, rootBlueprints];
    const matches = catalogs.map(catalog =>
      catalog.filter(blueprint => blueprint.nodeId === DOMAIN_RANGE_FROM_GRAPH_SKILL),
    );
    expect(matches[0]).toHaveLength(1);
    expect(matches[1]).toHaveLength(1);
    expect(matches[0][0]).toEqual(matches[1][0]);
    expect(knowledgeBlueprintSchema.safeParse(matches[0][0]).success).toBe(true);
    const blueprint = matches[0][0];
    if (!blueprint) return;

    expect(blueprint.sourceNodeIds).toEqual([EXAMPLE_ONE]);
    expect(blueprint.workedExampleSpec?.prompt).toBe(
      'Graph f(x) = x^2 + 2x - 3 by using a table. State the domain and range.',
    );
    expect(blueprint.workedExampleSpec?.givens).toEqual(['f(x) = x^2 + 2x - 3']);
    expect(blueprint.workedExampleSpec?.target).toMatchObject({
      domain: 'all real numbers',
      vertex: '(-1, -4)',
      range: 'y >= -4',
    });
    expect(blueprint.rendererModeMap).toEqual({
      worked: 'graphing-explorer',
      guidedPractice: 'graphing-explorer',
      independentPractice: 'graphing-explorer',
    });
    expect(blueprint.generatorKey).toBe('quadratic-graph-analysis');
    expect(blueprint.gradingSpec).toEqual({
      partIds: ['domain', 'range'],
      passingScore: 2,
      partialCredit: true,
      rubric: [
        { criteria: 'State the domain of the quadratic.', points: 1, partId: 'domain' },
        { criteria: 'State the range of the quadratic.', points: 1, partId: 'range' },
      ],
    });
    const rendererProps = [
      blueprint.workedExampleSpec?.rendererProps,
      blueprint.guidedPracticeSpec?.rendererProps,
      blueprint.independentPracticeSpec?.rendererProps,
    ];
    expect(rendererProps).toEqual(expectedRendererProps);
    for (const [index, props] of rendererProps.entries()) {
      expect(graphingExplorerSchema.safeParse(props).success).toBe(true);
      if (index > 0) {
        expect(JSON.stringify(props)).not.toMatch(
          /"(answer|answers|correctAnswer|expectedAnswer|solutionSteps|gradingRules|gradingMetadata|partAnswers|finalAnswer|isCorrect|score|maxScore)"/,
        );
      }
    }
  });

  it('connects the Example 1 domain-and-range skill to its lesson and standards', () => {
    const expectedContainment = {
      id: DOMAIN_RANGE_CONTAINS_EDGE,
      type: 'contains',
      sourceId: 'math.im3.lesson.1.1',
      targetId: DOMAIN_RANGE_FROM_GRAPH_SKILL,
      weight: 1,
      confidence: 'high',
      reviewStatus: 'draft',
      metadata: { course: 'im3', module: '1' },
      rationale: 'Skill contained in lesson 1.1',
      sourceRefs: [
        'apps/integrated-math-3/curriculum/module-1-class-period-plan.md (1-1, Example 1)',
      ],
    };
    const moduleContainment = lessonEdges().filter(edge => edge.id === DOMAIN_RANGE_CONTAINS_EDGE);
    const rootContainment = courseEdges().filter(edge => edge.id === DOMAIN_RANGE_CONTAINS_EDGE);
    expect(moduleContainment).toHaveLength(1);
    expect(rootContainment).toHaveLength(1);
    expect(moduleContainment[0]).toEqual(expectedContainment);
    expect(rootContainment[0]).toEqual(moduleContainment[0]);

    const expectedAlignments = [
      {
        id: DOMAIN_RANGE_PRIMARY_EDGE,
        type: 'aligned_to_standard',
        sourceId: DOMAIN_RANGE_FROM_GRAPH_SKILL,
        targetId: 'math.standard.ccss.hsf-if-b-5',
        weight: 0.8,
        confidence: 'high',
        sourceRefs: [
          {
            source: 'apps/integrated-math-3/curriculum/IM3-reveal-module-1.pdf#page=4',
            note: 'Primary alignment for relating the authored Example 1 domain to its graph',
          },
        ],
        reviewStatus: 'draft',
        rationale: 'Primary alignment for relating the domain to the graph',
        metadata: { isPrimary: true, course: 'im3' },
      },
      {
        id: DOMAIN_RANGE_SUPPORTING_EDGE,
        type: 'aligned_to_standard',
        sourceId: DOMAIN_RANGE_FROM_GRAPH_SKILL,
        targetId: 'math.standard.ccss.hsf-if-b-4',
        weight: 0.6,
        confidence: 'high',
        sourceRefs: [
          {
            source: 'apps/integrated-math-3/curriculum/IM3-reveal-module-1.pdf#page=4',
            note: 'Supporting alignment for using the quadratic minimum to state the output range',
          },
        ],
        reviewStatus: 'draft',
        rationale: 'Supporting alignment for using the quadratic minimum to state the output range',
        metadata: { isPrimary: false, course: 'im3' },
      },
    ];
    const moduleAlignments = standardEdges().filter(
      edge => edge.type === 'aligned_to_standard' && edge.sourceId === DOMAIN_RANGE_FROM_GRAPH_SKILL,
    );
    expect(moduleAlignments).toHaveLength(2);
    expect(moduleAlignments).toEqual(expectedAlignments);
    expect(new Set(moduleAlignments.map(edge => edge.targetId))).toEqual(
      new Set(['math.standard.ccss.hsf-if-b-5', 'math.standard.ccss.hsf-if-b-4']),
    );

    for (const catalog of [courseStandardEdges(), courseEdges()]) {
      const rootAlignments = catalog.filter(
        edge => edge.type === 'aligned_to_standard' && edge.sourceId === DOMAIN_RANGE_FROM_GRAPH_SKILL,
      );
      expect(rootAlignments).toHaveLength(2);
      expect(rootAlignments).toEqual(moduleAlignments);
    }
  });

  it('synchronizes the two Example 2 candidate edge sets in the root graph catalogs', () => {
    for (const skillId of EXAMPLE_TWO_SKILL_IDS) {
      const moduleContains = lessonEdges().filter(
        edge => edge.type === 'contains' &&
          edge.sourceId === 'math.im3.lesson.1.1' &&
          edge.targetId === skillId,
      );
      const rootContains = courseEdges().filter(
        edge => edge.type === 'contains' &&
          edge.sourceId === 'math.im3.lesson.1.1' &&
          edge.targetId === skillId,
      );
      expect(moduleContains).toHaveLength(1);
      expect(rootContains).toHaveLength(1);
      expect(rootContains[0]).toEqual(moduleContains[0]);

      const moduleAlignments = standardEdges().filter(
        edge => edge.type === 'aligned_to_standard' && edge.sourceId === skillId,
      );
      expect(moduleAlignments).toHaveLength(1);
      const rootStandardAlignments = courseStandardEdges().filter(
        edge => edge.id === moduleAlignments[0]?.id,
      );
      const rootCombinedAlignments = courseEdges().filter(
        edge => edge.id === moduleAlignments[0]?.id,
      );
      expect(rootStandardAlignments).toHaveLength(1);
      expect(rootCombinedAlignments).toHaveLength(1);
      expect(rootStandardAlignments[0]).toEqual(moduleAlignments[0]);
      expect(rootCombinedAlignments[0]).toEqual(moduleAlignments[0]);
    }
  });

  it('mirrors the Example 2 graph-from-key-features node in the root edge catalogs', () => {
    const rootNodeMatches = courseNodes().filter(node => node.id === KEY_FEATURES_SKILL);
    expect(rootNodeMatches).toHaveLength(1);

    for (const catalog of [courseEdgesJson, courseStandardEdgesJson]) {
      const matches = (catalog as { nodes: KnowledgeSpaceNode[] }).nodes.filter(
        node => node.id === KEY_FEATURES_SKILL,
      );
      expect(matches).toHaveLength(1);
      expect(matches[0]).toEqual(rootNodeMatches[0]);
    }
  });

  it('mirrors the Example 2 compare-maximums node in the root edge catalogs', () => {
    const rootNodeMatches = courseNodes().filter(node => node.id === COMPARE_MAXIMUMS_SKILL);
    expect(rootNodeMatches).toHaveLength(1);

    for (const catalog of [courseEdgesJson, courseStandardEdgesJson]) {
      const matches = (catalog as { nodes: KnowledgeSpaceNode[] }).nodes.filter(
        node => node.id === COMPARE_MAXIMUMS_SKILL,
      );
      expect(matches).toHaveLength(1);
      expect(matches[0]).toEqual(rootNodeMatches[0]);
    }
  });

  it('keeps the compare-maximum node readiness fields equal across all five node mirrors', () => {
    const expectedNode: KnowledgeSpaceNode = {
      id: COMPARE_MAXIMUMS_SKILL,
      kind: 'skill',
      title: 'Compare maximum values of quadratic functions',
      domain: 'math.im3',
      description: 'Compare the maximum values of two quadratic functions represented in different ways.',
      generatorKey: 'quadratic-graph-analysis',
      rendererKey: 'graphing-explorer',
      independentPracticeReady: true,
      sourceRefs: [
        'apps/integrated-math-3/curriculum/module-1-class-period-plan.md (1-1, Example 2)',
        `${PDF_PATH}#page=4`,
      ],
      reviewStatus: 'draft',
      metadata: { course: 'im3', module: '1', lesson: '1' },
    };
    const catalogs = [
      lessonNodes(),
      draftNodes(),
      courseNodes(),
      courseStandardNodes(),
      embeddedCourseNodes(),
    ];
    const targetNodes = catalogs.map(catalog => {
      const matches = catalog.filter(node => node.id === COMPARE_MAXIMUMS_SKILL);
      expect(matches).toHaveLength(1);
      return matches[0];
    });
    for (const targetNode of targetNodes) {
      expect(targetNode).toEqual(targetNodes[0]);
      expect(targetNode).toEqual(expectedNode);
    }
  });

  it('connects the Example 4 equation-rate skill to Lesson 1.1', () => {
    const expectedEdge: KnowledgeSpaceEdge = {
      id: EQUATION_RATE_CONTAINS_EDGE,
      type: 'contains',
      sourceId: 'math.im3.lesson.1.1',
      targetId: EQUATION_RATE_SKILL,
      weight: 1,
      confidence: 'high',
      reviewStatus: 'draft',
      metadata: {
        course: 'im3',
        module: '1',
      },
      rationale: 'Skill contained in lesson 1.1',
      sourceRefs: [
        'apps/integrated-math-3/curriculum/module-1-class-period-plan.md (1-1, Example 4)',
      ],
    };

    const moduleMatches = lessonEdges().filter(edge => edge.id === EQUATION_RATE_CONTAINS_EDGE);
    const rootMatches = courseEdges().filter(edge => edge.id === EQUATION_RATE_CONTAINS_EDGE);
    expect(moduleMatches).toHaveLength(1);
    expect(rootMatches).toHaveLength(1);
    expect(moduleMatches[0]).toEqual(expectedEdge);
    expect(rootMatches[0]).toEqual(expectedEdge);
    expect(rootMatches[0]).toEqual(moduleMatches[0]);

    const moduleAnchorIndex = lessonEdges().findIndex(edge => edge.id === DOMAIN_RANGE_CONTAINS_EDGE);
    const rootAnchorIndex = courseEdges().findIndex(edge => edge.id === DOMAIN_RANGE_CONTAINS_EDGE);
    const moduleEdgeIndex = lessonEdges().findIndex(edge => edge.id === EQUATION_RATE_CONTAINS_EDGE);
    const rootEdgeIndex = courseEdges().findIndex(edge => edge.id === EQUATION_RATE_CONTAINS_EDGE);
    expect(moduleEdgeIndex).toBe(moduleAnchorIndex + 1);
    expect(rootEdgeIndex).toBe(rootAnchorIndex + 1);
  });

  it('connects the Example 5 table-rate skill to Lesson 1.1', () => {
    const expectedEdge: KnowledgeSpaceEdge = {
      id: TABLE_RATE_CONTAINS_EDGE,
      type: 'contains',
      sourceId: 'math.im3.lesson.1.1',
      targetId: TABLE_RATE_SKILL,
      weight: 1,
      confidence: 'high',
      reviewStatus: 'draft',
      metadata: {
        course: 'im3',
        module: '1',
      },
      rationale: 'Skill contained in lesson 1.1',
      sourceRefs: [
        'apps/integrated-math-3/curriculum/module-1-class-period-plan.md (1-1, Example 5)',
      ],
    };

    const moduleMatches = lessonEdges().filter(edge => edge.id === TABLE_RATE_CONTAINS_EDGE);
    const rootMatches = courseEdges().filter(edge => edge.id === TABLE_RATE_CONTAINS_EDGE);
    expect(moduleMatches).toHaveLength(1);
    expect(rootMatches).toHaveLength(1);
    expect(moduleMatches[0]).toEqual(expectedEdge);
    expect(rootMatches[0]).toEqual(expectedEdge);
    expect(rootMatches[0]).toEqual(moduleMatches[0]);

    const moduleAnchorIndex = lessonEdges().findIndex(edge => edge.id === EQUATION_RATE_CONTAINS_EDGE);
    const rootAnchorIndex = courseEdges().findIndex(edge => edge.id === EQUATION_RATE_CONTAINS_EDGE);
    const moduleEdgeIndex = lessonEdges().findIndex(edge => edge.id === TABLE_RATE_CONTAINS_EDGE);
    const rootEdgeIndex = courseEdges().findIndex(edge => edge.id === TABLE_RATE_CONTAINS_EDGE);
    expect(moduleEdgeIndex).toBe(moduleAnchorIndex + 1);
    expect(rootEdgeIndex).toBe(rootAnchorIndex + 1);
  });

  it('connects the Example 6 graph-rate skill to Lesson 1.1', () => {
    const expectedEdge: KnowledgeSpaceEdge = {
      id: GRAPH_RATE_CONTAINS_EDGE,
      type: 'contains',
      sourceId: 'math.im3.lesson.1.1',
      targetId: GRAPH_RATE_SKILL,
      weight: 1,
      confidence: 'high',
      reviewStatus: 'draft',
      metadata: {
        course: 'im3',
        module: '1',
      },
      rationale: 'Skill contained in lesson 1.1',
      sourceRefs: [
        'apps/integrated-math-3/curriculum/module-1-class-period-plan.md (1-1, Example 6)',
      ],
    };

    const moduleMatches = lessonEdges().filter(edge => edge.id === GRAPH_RATE_CONTAINS_EDGE);
    const rootMatches = courseEdges().filter(edge => edge.id === GRAPH_RATE_CONTAINS_EDGE);
    expect(moduleMatches).toHaveLength(1);
    expect(rootMatches).toHaveLength(1);
    expect(moduleMatches[0]).toEqual(expectedEdge);
    expect(rootMatches[0]).toEqual(expectedEdge);
    expect(rootMatches[0]).toEqual(moduleMatches[0]);

    const moduleAnchorIndex = lessonEdges().findIndex(edge => edge.id === TABLE_RATE_CONTAINS_EDGE);
    const rootAnchorIndex = courseEdges().findIndex(edge => edge.id === TABLE_RATE_CONTAINS_EDGE);
    const moduleEdgeIndex = lessonEdges().findIndex(edge => edge.id === GRAPH_RATE_CONTAINS_EDGE);
    const rootEdgeIndex = courseEdges().findIndex(edge => edge.id === GRAPH_RATE_CONTAINS_EDGE);
    expect(moduleEdgeIndex).toBe(moduleAnchorIndex + 1);
    expect(rootEdgeIndex).toBe(rootAnchorIndex + 1);
  });

  it('connects the Example 6 contextual-rate skill to Lesson 1.1', () => {
    const expectedEdge: KnowledgeSpaceEdge = {
      id: CONTEXT_RATE_CONTAINS_EDGE,
      type: 'contains',
      sourceId: 'math.im3.lesson.1.1',
      targetId: CONTEXT_RATE_SKILL,
      weight: 1,
      confidence: 'high',
      reviewStatus: 'draft',
      metadata: {
        course: 'im3',
        module: '1',
      },
      rationale: 'Skill contained in lesson 1.1',
      sourceRefs: [
        'apps/integrated-math-3/curriculum/module-1-class-period-plan.md (1-1, Example 6)',
      ],
    };

    const moduleMatches = lessonEdges().filter(edge => edge.id === CONTEXT_RATE_CONTAINS_EDGE);
    const rootMatches = courseEdges().filter(edge => edge.id === CONTEXT_RATE_CONTAINS_EDGE);
    expect(moduleMatches).toHaveLength(1);
    expect(rootMatches).toHaveLength(1);
    expect(moduleMatches[0]).toEqual(expectedEdge);
    expect(rootMatches[0]).toEqual(expectedEdge);
    expect(rootMatches[0]).toEqual(moduleMatches[0]);

    const moduleAnchorIndex = lessonEdges().findIndex(edge => edge.id === GRAPH_RATE_CONTAINS_EDGE);
    const rootAnchorIndex = courseEdges().findIndex(edge => edge.id === GRAPH_RATE_CONTAINS_EDGE);
    const moduleEdgeIndex = lessonEdges().findIndex(edge => edge.id === CONTEXT_RATE_CONTAINS_EDGE);
    const rootEdgeIndex = courseEdges().findIndex(edge => edge.id === CONTEXT_RATE_CONTAINS_EDGE);
    expect(moduleEdgeIndex).toBe(moduleAnchorIndex + 1);
    expect(rootEdgeIndex).toBe(rootAnchorIndex + 1);
  });

  it('aligns the Example 4 equation-rate skill to HSF-IF.B.6', () => {
    const expectedEdge: KnowledgeSpaceEdge = {
      id: EQUATION_RATE_STANDARD_ALIGNMENT_EDGE,
      type: 'aligned_to_standard',
      sourceId: EQUATION_RATE_SKILL,
      targetId: 'math.standard.ccss.hsf-if-b-6',
      weight: 0.8,
      confidence: 'high',
      sourceRefs: [
        {
          source: 'apps/integrated-math-3/curriculum/IM3-reveal-module-1.pdf#page=6',
          note: 'Primary alignment for authored Example 4',
        },
      ],
      reviewStatus: 'draft',
      rationale: 'Primary alignment for calculating average rate of change from an equation',
      metadata: {
        isPrimary: true,
        course: 'im3',
      },
    };

    const catalogs = [standardEdges(), courseStandardEdges(), courseEdges()];
    const matches = catalogs.map(catalog => catalog.filter(edge => edge.id === EQUATION_RATE_STANDARD_ALIGNMENT_EDGE));
    for (const catalogMatches of matches) {
      expect(catalogMatches).toHaveLength(1);
      expect(catalogMatches[0]).toEqual(expectedEdge);
    }
    expect(matches[1][0]).toEqual(matches[0][0]);
    expect(matches[2][0]).toEqual(matches[0][0]);

    for (const catalog of catalogs) {
      const anchorIndex = catalog.findIndex(edge => edge.id === EQUATION_RATE_STANDARD_ORDER_ANCHOR);
      const edgeIndex = catalog.findIndex(edge => edge.id === EQUATION_RATE_STANDARD_ALIGNMENT_EDGE);
      expect(edgeIndex).toBe(anchorIndex + 2);
    }
  });

  it('aligns the Example 5 table-rate skill to HSF-IF.B.6', () => {
    const expectedEdge: KnowledgeSpaceEdge = {
      id: TABLE_RATE_STANDARD_ALIGNMENT_EDGE,
      type: 'aligned_to_standard',
      sourceId: TABLE_RATE_SKILL,
      targetId: 'math.standard.ccss.hsf-if-b-6',
      weight: 0.8,
      confidence: 'high',
      sourceRefs: [
        {
          source: 'apps/integrated-math-3/curriculum/IM3-reveal-module-1.pdf#page=6',
          note: 'Primary alignment for authored Example 5',
        },
      ],
      reviewStatus: 'draft',
      rationale: 'Primary alignment for calculating average rate of change from a table',
      metadata: {
        isPrimary: true,
        course: 'im3',
      },
    };

    const catalogs = [standardEdges(), courseStandardEdges(), courseEdges()];
    const matches = catalogs.map(catalog => catalog.filter(edge => edge.id === TABLE_RATE_STANDARD_ALIGNMENT_EDGE));
    for (const catalogMatches of matches) {
      expect(catalogMatches).toHaveLength(1);
      expect(catalogMatches[0]).toEqual(expectedEdge);
    }
    expect(matches[1][0]).toEqual(matches[0][0]);
    expect(matches[2][0]).toEqual(matches[0][0]);

    for (const catalog of catalogs) {
      const anchorIndex = catalog.findIndex(edge => edge.id === EQUATION_RATE_STANDARD_ALIGNMENT_EDGE);
      const edgeIndex = catalog.findIndex(edge => edge.id === TABLE_RATE_STANDARD_ALIGNMENT_EDGE);
      expect(edgeIndex).toBe(anchorIndex + 1);
    }
  });

  it('aligns the Example 6 graph-rate skill to HSF-IF.B.6', () => {
    const expectedEdge: KnowledgeSpaceEdge = {
      id: GRAPH_RATE_STANDARD_ALIGNMENT_EDGE,
      type: 'aligned_to_standard',
      sourceId: GRAPH_RATE_SKILL,
      targetId: 'math.standard.ccss.hsf-if-b-6',
      weight: 0.8,
      confidence: 'high',
      sourceRefs: [
        {
          source: 'apps/integrated-math-3/curriculum/IM3-reveal-module-1.pdf#page=7',
          note: 'Primary alignment for estimating average rate of change in authored Example 6',
        },
        {
          source: 'apps/integrated-math-3/curriculum/IM3-reveal-module-1.pdf#page=8',
          note: 'Algebraic verification for authored Example 6',
        },
      ],
      reviewStatus: 'draft',
      rationale: 'Primary alignment for estimating and verifying average rate of change from a graph',
      metadata: {
        isPrimary: true,
        course: 'im3',
      },
    };

    const catalogs = [standardEdges(), courseStandardEdges(), courseEdges()];
    const matches = catalogs.map(catalog => catalog.filter(edge => edge.id === GRAPH_RATE_STANDARD_ALIGNMENT_EDGE));
    for (const catalogMatches of matches) {
      expect(catalogMatches).toHaveLength(1);
      expect(catalogMatches[0]).toEqual(expectedEdge);
    }
    expect(matches[1][0]).toEqual(matches[0][0]);
    expect(matches[2][0]).toEqual(matches[0][0]);

    for (const catalog of catalogs) {
      const anchorIndex = catalog.findIndex(edge => edge.id === TABLE_RATE_STANDARD_ALIGNMENT_EDGE);
      const edgeIndex = catalog.findIndex(edge => edge.id === GRAPH_RATE_STANDARD_ALIGNMENT_EDGE);
      expect(edgeIndex).toBe(anchorIndex + 1);
    }
  });

  it('aligns the Example 6 contextual-rate skill to HSF-IF.B.6', () => {
    const expectedEdge: KnowledgeSpaceEdge = {
      id: CONTEXT_RATE_STANDARD_ALIGNMENT_EDGE,
      type: 'aligned_to_standard',
      sourceId: CONTEXT_RATE_SKILL,
      targetId: 'math.standard.ccss.hsf-if-b-6',
      weight: 0.8,
      confidence: 'high',
      sourceRefs: [
        {
          source: 'apps/integrated-math-3/curriculum/IM3-reveal-module-1.pdf#page=8',
          note: 'Primary alignment for contextual interpretation in authored Example 6',
        },
      ],
      reviewStatus: 'draft',
      rationale: 'Primary alignment for interpreting average rate of change in context',
      metadata: {
        isPrimary: true,
        course: 'im3',
      },
    };

    const catalogs = [standardEdges(), courseStandardEdges(), courseEdges()];
    const matches = catalogs.map(catalog => catalog.filter(edge => edge.id === CONTEXT_RATE_STANDARD_ALIGNMENT_EDGE));
    for (const catalogMatches of matches) {
      expect(catalogMatches).toHaveLength(1);
      expect(catalogMatches[0]).toEqual(expectedEdge);
    }
    expect(matches[1][0]).toEqual(matches[0][0]);
    expect(matches[2][0]).toEqual(matches[0][0]);

    for (const catalog of catalogs) {
      const anchorIndex = catalog.findIndex(edge => edge.id === GRAPH_RATE_STANDARD_ALIGNMENT_EDGE);
      const edgeIndex = catalog.findIndex(edge => edge.id === CONTEXT_RATE_STANDARD_ALIGNMENT_EDGE);
      expect(edgeIndex).toBe(anchorIndex + 1);
    }
  });

  it('replaces the invalid composite rate-of-change standard alignments', () => {
    const expectedEdge: KnowledgeSpaceEdge = {
      id: LEGACY_RATE_STANDARD_ALIGNMENT_EDGE,
      type: 'aligned_to_standard',
      sourceId: RATE_SKILL,
      targetId: 'math.standard.ccss.hsf-if-b-6',
      weight: 0.8,
      confidence: 'high',
      sourceRefs: [
        {
          source: 'apps/integrated-math-3/curriculum/IM3-reveal-module-1.pdf#page=6',
          note: 'Primary alignment for authored Examples 4 and 5',
        },
        {
          source: 'apps/integrated-math-3/curriculum/IM3-reveal-module-1.pdf#page=7',
          note: 'Primary alignment for authored Example 6',
        },
      ],
      reviewStatus: 'draft',
      rationale: 'Primary alignment for the authored average-rate-of-change examples',
      metadata: {
        isPrimary: true,
        course: 'im3',
      },
    };
    const catalogs = [standardEdges(), courseStandardEdges(), courseEdges()];

    const legacyMatches = catalogs.map(catalog =>
      catalog.filter(edge => edge.id === LEGACY_RATE_STANDARD_ALIGNMENT_EDGE),
    );
    for (const catalogMatches of legacyMatches) {
      expect(catalogMatches).toHaveLength(1);
      expect(catalogMatches[0]).toEqual(expectedEdge);
    }
    expect(legacyMatches[1][0]).toEqual(legacyMatches[0][0]);
    expect(legacyMatches[2][0]).toEqual(legacyMatches[0][0]);

    const edge = legacyMatches[0][0];
    expect(lessonNodes().find(node => node.id === edge?.sourceId)?.kind).toBe('skill');
    expect(courseNodes().find(node => node.id === edge?.sourceId)?.kind).toBe('skill');
    expect(moduleStandardNodes().find(node => node.id === edge?.targetId)?.kind).toBe('standard');
    expect(courseStandardNodes().find(node => node.id === edge?.targetId)?.kind).toBe('standard');
    expect(embeddedCourseNodes().find(node => node.id === edge?.targetId)?.kind).toBe('standard');

    for (const catalog of catalogs) {
      const equationIndex = catalog.findIndex(edge => edge.id === EQUATION_RATE_STANDARD_ALIGNMENT_EDGE);
      const legacyIndex = catalog.findIndex(edge => edge.id === LEGACY_RATE_STANDARD_ALIGNMENT_EDGE);
      expect(legacyIndex).toBe(equationIndex - 1);
    }

    for (const catalog of catalogs) {
      expect(
        catalog.filter(
          edge =>
            edge.type === 'aligned_to_standard' &&
            edge.sourceId === RATE_SKILL,
        ),
      ).toHaveLength(1);

      for (const edgeId of LEGACY_RATE_STANDARD_ALIGNMENT_EDGES) {
        expect(catalog.filter(edge => edge.id === edgeId)).toHaveLength(0);
      }

      const atomicMatches = ATOMIC_RATE_STANDARD_ALIGNMENT_EDGES.map(edgeId => {
        const matches = catalog.filter(edge => edge.id === edgeId);
        expect(matches).toHaveLength(1);
        return matches[0];
      });
      expect(atomicMatches.map(edge => edge.id)).toEqual([...ATOMIC_RATE_STANDARD_ALIGNMENT_EDGES]);
    }
  });

  it('records the exact page, title, prompt, and capability for all six source examples', () => {
    const lessonExampleNodes = lessonNodes().filter(
      node => node.kind === 'worked_example' && node.metadata?.sourceLesson === '1-1',
    );
    expect(lessonExampleNodes).toHaveLength(6);
    const nodesById = new Map(lessonNodes().map(node => [node.id, node]));

    for (const sourceExample of SOURCE_EXAMPLES) {
      const node = nodesById.get(sourceExample.id);
      expect(node).toBeDefined();
      expect(node?.title).toBe(sourceExample.title);
      expect(node?.reviewStatus).toBe('draft');
      expect(node?.sourceRefs).toContain(`${PDF_PATH}#page=${sourceExample.page}`);
      expect(node?.metadata).toMatchObject({
        sourcePdfPage: sourceExample.page,
        exampleNumber: sourceExample.exampleNumber,
        rawText: sourceExample.prompt,
        demonstratedCapability: sourceExample.capability,
      });
    }
  });

  it('adds the authored Example 4 equation-rate skill to all five node mirrors', () => {
    const expectedNode: KnowledgeSpaceNode = {
      id: EQUATION_RATE_SKILL,
      kind: 'skill',
      title: 'Calculate average rate of change from an equation',
      domain: 'math.im3',
      description: 'Calculate the average rate of change of a function given by an equation over a specified interval.',
      generatorKey: 'average-rate-of-change',
      rendererKey: 'rate-of-change-calculator',
      independentPracticeReady: true,
      sourceRefs: [
        'apps/integrated-math-3/curriculum/module-1-class-period-plan.md (1-1, Example 4)',
        `${PDF_PATH}#page=6`,
      ],
      reviewStatus: 'draft',
      metadata: {
        course: 'im3',
        module: '1',
        lesson: '1',
      },
    };

    const catalogs = [
      lessonNodes(),
      draftNodes(),
      courseNodes(),
      courseStandardNodes(),
      embeddedCourseNodes(),
    ];
    const targetNodes = catalogs.map(catalog => {
      const matches = catalog.filter(node => node.id === EQUATION_RATE_SKILL);
      expect(matches).toHaveLength(1);
      return matches[0];
    });
    for (const targetNode of targetNodes) {
      expect(targetNode).toEqual(targetNodes[0]);
    }

    for (const catalog of catalogs) {
      const matches = catalog.filter(node => node.id === EQUATION_RATE_SKILL);
      expect(matches).toHaveLength(1);
      expect(matches[0]).toEqual(expectedNode);
      const compositeIndex = catalog.findIndex(node => node.id === RATE_SKILL);
      const equationSkillIndex = catalog.findIndex(node => node.id === EQUATION_RATE_SKILL);
      expect(equationSkillIndex).toBe(compositeIndex + 1);
    }

    expect(getGenerator('average-rate-of-change').nodeIds).toEqual([EQUATION_RATE_SKILL]);
    for (const catalog of [lessonEdges(), courseEdges()]) {
      expect(catalog.filter(edge => edge.id === AVERAGE_RATE_GENERATED_EDGE)[0]?.sourceId).toBe(EQUATION_RATE_SKILL);
      expect(catalog.filter(edge => edge.id === EQUATION_RATE_RENDERED_EDGE)[0]?.sourceId).toBe(EQUATION_RATE_SKILL);
    }
  });

  it('adds the authored Example 5 table-rate skill after the equation-rate skill', () => {
    const expectedNode: KnowledgeSpaceNode = {
      id: TABLE_RATE_SKILL,
      kind: 'skill',
      title: 'Calculate average rate of change from a table',
      domain: 'math.im3',
      description: 'Calculate the average rate of change of a function from table values over a specified interval.',
      sourceRefs: [
        'apps/integrated-math-3/curriculum/module-1-class-period-plan.md (1-1, Example 5)',
        `${PDF_PATH}#page=6`,
      ],
      reviewStatus: 'draft',
      metadata: {
        course: 'im3',
        module: '1',
        lesson: '1',
      },
    };

    const catalogs = [
      lessonNodes(),
      draftNodes(),
      courseNodes(),
      courseStandardNodes(),
      embeddedCourseNodes(),
    ];

    for (const catalog of catalogs) {
      const matches = catalog.filter(node => node.id === TABLE_RATE_SKILL);
      expect(matches).toHaveLength(1);
      expect(matches[0]).toEqual(expectedNode);
      expect(matches[0]).not.toHaveProperty('generatorKey');
      expect(matches[0]).not.toHaveProperty('rendererKey');
      expect(matches[0]).not.toHaveProperty('independentPracticeReady');
      const equationSkillIndex = catalog.findIndex(node => node.id === EQUATION_RATE_SKILL);
      const tableSkillIndex = catalog.findIndex(node => node.id === TABLE_RATE_SKILL);
      expect(tableSkillIndex).toBe(equationSkillIndex + 1);
    }
  });

  it('adds the authored Example 6 graph-rate skill after the table-rate skill', () => {
    const expectedNode: KnowledgeSpaceNode = {
      id: GRAPH_RATE_SKILL,
      kind: 'skill',
      title: 'Estimate and verify average rate of change from a graph',
      domain: 'math.im3',
      description: 'Estimate the average rate of change from a graph over a specified interval and verify the result algebraically.',
      sourceRefs: [
        'apps/integrated-math-3/curriculum/module-1-class-period-plan.md (1-1, Example 6)',
        `${PDF_PATH}#page=7`,
        `${PDF_PATH}#page=8`,
      ],
      reviewStatus: 'draft',
      metadata: {
        course: 'im3',
        module: '1',
        lesson: '1',
      },
    };

    const catalogs = [
      lessonNodes(),
      draftNodes(),
      courseNodes(),
      courseStandardNodes(),
      embeddedCourseNodes(),
    ];

    for (const catalog of catalogs) {
      const matches = catalog.filter(node => node.id === GRAPH_RATE_SKILL);
      expect(matches).toHaveLength(1);
      expect(matches[0]).toEqual(expectedNode);
      expect(matches[0]).not.toHaveProperty('generatorKey');
      expect(matches[0]).not.toHaveProperty('rendererKey');
      expect(matches[0]).not.toHaveProperty('independentPracticeReady');
      const tableSkillIndex = catalog.findIndex(node => node.id === TABLE_RATE_SKILL);
      const graphSkillIndex = catalog.findIndex(node => node.id === GRAPH_RATE_SKILL);
      expect(graphSkillIndex).toBe(tableSkillIndex + 1);
    }
  });

  it('adds the authored Example 6 contextual-rate skill after the graph-rate skill', () => {
    const expectedNode: KnowledgeSpaceNode = {
      id: CONTEXT_RATE_SKILL,
      kind: 'skill',
      title: 'Interpret average rate of change in context',
      domain: 'math.im3',
      description: 'Interpret the average rate of change of a contextual function over a specified interval by stating the direction, amount, and units.',
      sourceRefs: [
        'apps/integrated-math-3/curriculum/module-1-class-period-plan.md (1-1, Example 6)',
        `${PDF_PATH}#page=7`,
        `${PDF_PATH}#page=8`,
      ],
      reviewStatus: 'draft',
      metadata: {
        course: 'im3',
        module: '1',
        lesson: '1',
      },
    };

    const catalogs = [
      lessonNodes(),
      draftNodes(),
      courseNodes(),
      courseStandardNodes(),
      embeddedCourseNodes(),
    ];

    for (const catalog of catalogs) {
      const matches = catalog.filter(node => node.id === CONTEXT_RATE_SKILL);
      expect(matches).toHaveLength(1);
      expect(matches[0]).toEqual(expectedNode);
      expect(matches[0]).not.toHaveProperty('generatorKey');
      expect(matches[0]).not.toHaveProperty('rendererKey');
      expect(matches[0]).not.toHaveProperty('independentPracticeReady');
      const graphSkillIndex = catalog.findIndex(node => node.id === GRAPH_RATE_SKILL);
      const contextSkillIndex = catalog.findIndex(node => node.id === CONTEXT_RATE_SKILL);
      expect(contextSkillIndex).toBe(graphSkillIndex + 1);
    }
  });

  it('keeps exactly one draft blueprint for each owned skill', () => {
    const blueprints = ownedBlueprints();
    expect(blueprints).toHaveLength(4);
    expect(new Set(blueprints.map(blueprint => blueprint.nodeId))).toEqual(
      new Set([GRAPH_SKILL, RATE_SKILL, PROFIT_MODEL_SKILL, PROFIT_MAXIMUM_SKILL]),
    );
    expect(blueprints.every(blueprint => blueprint.reviewStatus === 'draft')).toBe(true);
  });

  it('adds the Example 2 maximum capability with source-aligned modalities', () => {
    const node = lessonNodes().find(item => item.id === MAXIMUM_SKILL);
    const rootNode = courseNodes().find(item => item.id === MAXIMUM_SKILL);
    const moduleBlueprint = moduleBlueprints.find(
      item => item.nodeId === MAXIMUM_SKILL,
    );
    const rootBlueprint = rootBlueprints.find(
      item => item.nodeId === MAXIMUM_SKILL,
    );
    expect(moduleBlueprints.filter(item => item.nodeId === MAXIMUM_SKILL)).toHaveLength(1);
    expect(rootBlueprints.filter(item => item.nodeId === MAXIMUM_SKILL)).toHaveLength(1);
    const expectedBlueprint = {
      nodeId: MAXIMUM_SKILL,
      sourceNodeIds: ['math.im3.example.1.1.002'],
      alignmentNodeIds: [MAXIMUM_STANDARD],
      rendererKey: 'graphing-explorer',
      rendererModeMap: {
        worked: 'graphing-explorer',
        guidedPractice: 'graphing-explorer',
        independentPractice: 'graphing-explorer',
      },
      workedExampleSpec: {
        prompt: 'From the graph, f(x) appears to have a maximum of 5.',
        givens: ['The displayed graph of f(x).'],
        target: { vertex: '(3, 5)', maximum_value: 5 },
        steps: [
          {
            description: 'Locate the highest point on the graph.',
            expression: '(3, 5)',
            result: 'The vertex is (3, 5).',
          },
          {
            description: 'Read the y-coordinate of the highest point.',
            expression: 'maximum = 5',
            result: 'The maximum value of f is 5.',
          },
        ],
        explanation:
          'The maximum value is the y-coordinate of the vertex. The graph of f has vertex (3, 5), so its maximum is 5.',
        rendererProps: {
          equation: 'f(x) = -x^2 + 6x - 4',
          variant: 'plot_from_equation',
          responseVariant: 'maximum_value',
          domain: [-2, 8],
          range: [-3, 7],
        },
      },
      guidedPracticeSpec: {
        scaffoldedPrompt: 'Use the displayed graph to identify its maximum value.',
        stepPrompts: [
          'Locate the highest point on the displayed graph.',
          'Read the y-coordinate of that point.',
        ],
        hints: ['Find the highest point on the graph. Use its y-coordinate.'],
        checksPerStep: [
          {
            check: 'The highest point is the vertex (0, -1).',
            answerPattern: '(0, -1)',
          },
          {
            check: 'The maximum value is -1.',
            answerPattern: '-1',
          },
        ],
        revealPolicy: 'one_at_a_time',
        rendererProps: {
          equation: 'y = -x^2 - 1',
          variant: 'plot_from_equation',
          responseVariant: 'maximum_value',
          domain: [-5, 5],
          range: [-10, 10],
        },
      },
      independentPracticeSpec: {
        variantParameters: {
          a: {
            type: 'enum',
            options: ['-1'],
            description: 'Leading coefficient. The graph opens downward.',
          },
          b: {
            type: 'integer',
            min: -1,
            max: 1,
            step: 1,
            description: 'Linear coefficient.',
          },
          c: {
            type: 'integer',
            min: -2,
            max: 2,
            step: 1,
            description: 'Constant term.',
          },
        },
        answerSchema: {
          maximum_value: {
            type: 'number',
            description: 'The maximum value read from the displayed graph.',
          },
        },
        gradingRules: [
          {
            partId: 'maximum_value',
            ruleType: 'numeric_tolerance',
            tolerance: 0.01,
            maxScore: 1,
          },
        ],
        replayPolicy: 'unique_seeds',
        rendererProps: {
          equation: 'y = -x^2 + 2',
          variant: 'plot_from_equation',
          responseVariant: 'maximum_value',
          domain: [-5, 5],
          range: [-10, 10],
        },
      },
      generatorKey: 'quadratic-graph-analysis',
      gradingSpec: {
        partIds: ['maximum_value'],
        passingScore: 1,
        partialCredit: false,
        rubric: [
          {
            criteria: 'Identify the maximum value from the displayed graph.',
            points: 1,
            partId: 'maximum_value',
          },
        ],
      },
      reviewStatus: 'draft',
      metadata: { course: 'im3', module: '1', lesson: '1' },
    };

    expect(node).toMatchObject({
      id: MAXIMUM_SKILL,
      kind: 'skill',
      title: 'Identify a quadratic maximum from its graph',
      description: 'Identify the maximum value of a quadratic function from its graph.',
      generatorKey: 'quadratic-graph-analysis',
      rendererKey: 'graphing-explorer',
      independentPracticeReady: true,
      reviewStatus: 'draft',
      metadata: { course: 'im3', module: '1', lesson: '1' },
    });
    expect(rootNode).toEqual(node);
    expect(moduleBlueprint).toEqual(expectedBlueprint);
    expect(rootBlueprint).toEqual(moduleBlueprint);
    expect(moduleBlueprint).toBeDefined();
    expect(rootBlueprint).toBeDefined();
    expect(knowledgeBlueprintSchema.safeParse(moduleBlueprint).success).toBe(true);
    expect(knowledgeBlueprintSchema.safeParse(rootBlueprint).success).toBe(true);

    const rendererProps = [
      expectedBlueprint.workedExampleSpec.rendererProps,
      expectedBlueprint.guidedPracticeSpec.rendererProps,
      expectedBlueprint.independentPracticeSpec.rendererProps,
    ];
    for (const props of rendererProps) {
      expect(graphingExplorerSchema.safeParse(props).success).toBe(true);
    }

    const projected = projectActivityMap(
      lessonNodes(),
      lessonEdges(),
      [moduleBlueprint].filter((blueprint): blueprint is KnowledgeBlueprint => blueprint !== undefined),
    );
    expect(projected.map(activity => activity.mode)).toEqual([
      'worked_example',
      'guided_practice',
      'independent_practice',
    ]);
    expect(projected.map(activity => activity.stableActivityId)).toEqual([
      `${MAXIMUM_SKILL}.worked_example`,
      `${MAXIMUM_SKILL}.guided_practice`,
      `${MAXIMUM_SKILL}.independent_practice`,
    ]);
    expect(projected.map(activity => activity.srsEligible)).toEqual([false, true, true]);
  });

  it('aligns the Example 2 maximum skill to the existing standard', () => {
    const nodeIds = new Set(lessonNodes().map(node => node.id));
    const edge = standardEdges().find(item => item.id === MAXIMUM_STANDARD_EDGE);

    expect(edge).toMatchObject({
      id: MAXIMUM_STANDARD_EDGE,
      type: 'aligned_to_standard',
      sourceId: MAXIMUM_SKILL,
      targetId: MAXIMUM_STANDARD,
      reviewStatus: 'draft',
      metadata: { isPrimary: true, course: 'im3' },
      sourceRefs: [
        {
          source: 'apps/integrated-math-3/curriculum/IM3-reveal-module-1.pdf#page=4',
          note: 'Primary alignment for authored Example 2',
        },
      ],
    });
    expect(nodeIds.has(edge?.sourceId ?? '')).toBe(true);
    expect(nodeIds.has(edge?.targetId ?? '')).toBe(true);
  });

  it('adds the Example 2 graph-from-key-features candidate', () => {
    const moduleNodeMatches = lessonNodes().filter(node => node.id === KEY_FEATURES_SKILL);
    const rootNodeMatches = courseNodes().filter(node => node.id === KEY_FEATURES_SKILL);
    expect(moduleNodeMatches).toHaveLength(1);
    expect(rootNodeMatches).toHaveLength(1);
    const expectedNode = {
      id: KEY_FEATURES_SKILL,
      kind: 'skill',
      title: 'Graph a quadratic from a vertex and y-intercept by using symmetry',
      domain: 'math.im3',
      description: 'Graph a quadratic function from its vertex and y-intercept by using symmetry.',
      sourceRefs: [
        'apps/integrated-math-3/curriculum/module-1-class-period-plan.md (1-1, Example 2)',
        `${PDF_PATH}#page=4`,
      ],
      reviewStatus: 'draft',
      metadata: { course: 'im3', module: '1', lesson: '1' },
      generatorKey: 'quadratic-graph-analysis',
      rendererKey: 'graphing-explorer',
      independentPracticeReady: true,
    };
    expect(moduleNodeMatches[0]).toEqual(expectedNode);
    expect(rootNodeMatches[0]).toEqual(expectedNode);
    expect(rootNodeMatches[0]).toEqual(moduleNodeMatches[0]);

    const moduleBlueprintMatches = moduleBlueprints.filter(
      blueprint => blueprint.nodeId === KEY_FEATURES_SKILL,
    );
    const rootBlueprintMatches = rootBlueprints.filter(
      blueprint => blueprint.nodeId === KEY_FEATURES_SKILL,
    );
    expect(moduleBlueprintMatches).toHaveLength(1);
    expect(rootBlueprintMatches).toHaveLength(1);
    expect(rootBlueprintMatches[0]).toEqual(moduleBlueprintMatches[0]);

    const moduleProjected = projectActivityMap(
      lessonNodes(),
      lessonEdges(),
      [moduleBlueprintMatches[0]].filter(
        (blueprint): blueprint is KnowledgeBlueprint => blueprint !== undefined,
      ),
    );
    const rootProjected = projectActivityMap(
      courseNodes(),
      courseEdges(),
      [rootBlueprintMatches[0]].filter(
        (blueprint): blueprint is KnowledgeBlueprint => blueprint !== undefined,
      ),
    );
    for (const projected of [moduleProjected, rootProjected]) {
      expect(projected.map(activity => activity.mode)).toEqual([
        'worked_example',
        'guided_practice',
        'independent_practice',
      ]);
      expect(projected.map(activity => activity.stableActivityId)).toEqual([
        `${KEY_FEATURES_SKILL}.worked_example`,
        `${KEY_FEATURES_SKILL}.guided_practice`,
        `${KEY_FEATURES_SKILL}.independent_practice`,
      ]);
      expect(projected.map(activity => activity.srsEligible)).toEqual([false, true, true]);
    }
  });

  it('defines the source-aligned Example 2 symmetry activity blueprint', () => {
    const moduleMatches = moduleBlueprints.filter(
      blueprint => blueprint.nodeId === KEY_FEATURES_SKILL,
    );
    const rootMatches = rootBlueprints.filter(
      blueprint => blueprint.nodeId === KEY_FEATURES_SKILL,
    );
    expect(moduleMatches).toHaveLength(1);
    expect(rootMatches).toHaveLength(1);
    expect(rootMatches[0]).toEqual(moduleMatches[0]);

    const expectedBlueprint = {
      nodeId: KEY_FEATURES_SKILL,
      sourceNodeIds: ['math.im3.example.1.1.002'],
      alignmentNodeIds: ['math.standard.ccss.hsf-if-c-7a'],
      rendererKey: 'graphing-explorer',
      rendererModeMap: {
        worked: 'graphing-explorer',
        guidedPractice: 'graphing-explorer',
        independentPractice: 'graphing-explorer',
      },
      workedExampleSpec: {
        prompt:
          'Function g has a y-intercept of -1 and a vertex at (1, 2). Graph g by using symmetry.',
        givens: ['vertex (1, 2)', 'y-intercept (0, -1)'],
        target: {
          vertex: '(1, 2)',
          axis_of_symmetry: 'x = 1',
          y_intercept: '(0, -1)',
          reflected_point: '(2, -1)',
          direction: 'downward',
        },
        steps: [
          {
            description:
              'Plot the vertex (1, 2) and identify the axis of symmetry x = 1.',
            expression: '(1, 2); x = 1',
            result: 'The vertex is (1, 2) and the axis of symmetry is x = 1.',
          },
          {
            description: 'Plot the y-intercept (0, -1).',
            expression: '(0, -1)',
            result: 'The y-intercept is (0, -1).',
          },
          {
            description: 'Reflect the y-intercept across x = 1 to get (2, -1).',
            expression: '(0, -1) → (2, -1)',
            result: 'The reflected point is (2, -1).',
          },
          {
            description:
              'Draw the downward-opening parabola through (1, 2), (0, -1), and (2, -1).',
            expression: '(1, 2), (0, -1), (2, -1)',
            result: 'The parabola opens downward through the three points.',
          },
        ],
        explanation:
          'The points (0, -1) and (2, -1) are equally far from x = 1, so they reflect across the axis of symmetry. The downward-opening parabola passes through the vertex and both points.',
        rendererProps: {
          equation: 'g(x) = -3x^2 + 6x - 1',
          variant: 'plot_from_equation',
          responseVariant: 'symmetry_graph',
          vertex: [1, 2],
          yIntercept: [0, -1],
          domain: [-3, 5],
          range: [-10, 5],
        },
      },
      guidedPracticeSpec: {
        scaffoldedPrompt:
          'The vertex is (2, 3), and the y-intercept is (0, -1). Graph the quadratic by using symmetry.',
        stepPrompts: [
          'Plot the vertex (2, 3) and identify the axis of symmetry x = 2.',
          'Plot the y-intercept (0, -1).',
          'Reflect (0, -1) across x = 2 to get (4, -1).',
          'Draw the downward-opening parabola through (2, 3), (0, -1), and (4, -1).',
        ],
        hints: [
          'Plot the vertex at (2, 3) and use x = 2 as the axis of symmetry.',
          'Plot the y-intercept at (0, -1).',
          'Reflect (0, -1) across x = 2 to find (4, -1).',
          'Draw a downward-opening parabola through the three points.',
        ],
        checksPerStep: [
          { check: 'The vertex is (2, 3).', answerPattern: '(2, 3)' },
          { check: 'The y-intercept is (0, -1).', answerPattern: '(0, -1)' },
          { check: 'The reflected point is (4, -1).', answerPattern: '(4, -1)' },
          {
            check:
              'The points form a downward-opening parabola through (2, 3), (0, -1), and (4, -1).',
          },
        ],
        revealPolicy: 'one_at_a_time',
        rendererProps: {
          equation: 'y = -x^2 + 4x - 1',
          variant: 'plot_from_equation',
          responseVariant: 'symmetry_graph',
          vertex: [2, 3],
          yIntercept: [0, -1],
          domain: [-3, 7],
          range: [-10, 6],
        },
      },
      independentPracticeSpec: {
        variantParameters: {
          vertexX: {
            type: 'integer',
            min: 1,
            max: 2,
            step: 1,
            description: 'The x-coordinate of the vertex.',
          },
          vertexY: {
            type: 'integer',
            min: -3,
            max: 3,
            step: 1,
            description: 'The y-coordinate of the vertex.',
          },
          verticalScale: {
            type: 'enum',
            options: ['-3', '-2', '-1', '1', '2', '3'],
            description: 'The nonzero coefficient in vertex form.',
          },
        },
        description: 'The y-intercept is derived by substituting x = 0 into vertex form.',
        answerSchema: {
          placed_points: {
            type: 'array',
            description:
              'Exactly three numeric points: the vertex, the y-intercept, and its reflection.',
          },
        },
        gradingRules: [
          { partId: 'placed_points', ruleType: 'custom', maxScore: 1 },
        ],
        replayPolicy: 'unique_seeds',
        rendererProps: {
          equation: 'g(x) = -3x^2 + 6x - 1',
          variant: 'plot_from_equation',
          responseVariant: 'symmetry_graph',
          vertex: [1, 2],
          yIntercept: [0, -1],
          domain: [-3, 5],
          range: [-10, 5],
        },
      },
      generatorKey: 'quadratic-graph-analysis',
      gradingSpec: {
        partIds: ['placed_points'],
        passingScore: 1,
        partialCredit: false,
        rubric: [
          {
            criteria: 'Place the vertex, the y-intercept, and the reflected point.',
            points: 1,
            partId: 'placed_points',
          },
        ],
      },
      reviewStatus: 'draft',
      metadata: { course: 'im3', module: '1', lesson: '1' },
    };
    const moduleBlueprint = moduleMatches[0];
    const rootBlueprint = rootMatches[0];

    expect(moduleBlueprint).toEqual(expectedBlueprint);
    expect(rootBlueprint).toEqual(expectedBlueprint);
    expect(moduleBlueprint).not.toHaveProperty('pilotSequence');
    expect(knowledgeBlueprintSchema.safeParse(moduleBlueprint).success).toBe(true);
    expect(knowledgeBlueprintSchema.safeParse(rootBlueprint).success).toBe(true);
    expect(validateBlueprintGeneratorReadiness(moduleBlueprint).valid).toBe(true);
    expect(validateModeSupport(moduleBlueprint).valid).toBe(true);
    expect(validateGradingCompatibility(moduleBlueprint).valid).toBe(true);

    const rendererProps = [
      expectedBlueprint.workedExampleSpec.rendererProps,
      expectedBlueprint.guidedPracticeSpec.rendererProps,
      expectedBlueprint.independentPracticeSpec.rendererProps,
    ];
    for (const props of rendererProps) {
      expect(graphingExplorerSchema.safeParse(props).success).toBe(true);
    }

  });

  it('connects the Example 2 graph-from-key-features candidate', () => {
    const nodeIds = new Set(lessonNodes().map(node => node.id));
    const contains = lessonEdges().find(
      edge => edge.sourceId === 'math.im3.lesson.1.1' && edge.targetId === KEY_FEATURES_SKILL,
    );
    expect(contains).toMatchObject({
      id: 'math.im3.edge.m1.146',
      type: 'contains',
      sourceId: 'math.im3.lesson.1.1',
      targetId: KEY_FEATURES_SKILL,
      reviewStatus: 'draft',
    });
    expect(nodeIds.has(contains?.sourceId ?? '')).toBe(true);
    expect(nodeIds.has(contains?.targetId ?? '')).toBe(true);

    const standardEdgeMatches = standardEdges().filter(
      edge => edge.id === KEY_FEATURES_STANDARD_EDGE,
    );
    expect(standardEdgeMatches).toHaveLength(1);
    expect(standardEdgeMatches[0]).toEqual({
      id: KEY_FEATURES_STANDARD_EDGE,
      type: 'aligned_to_standard',
      sourceId: KEY_FEATURES_SKILL,
      targetId: GRAPH_STANDARD,
      weight: 0.8,
      confidence: 'high',
      sourceRefs: [
        {
          source: `${PDF_PATH}#page=4`,
          note: 'Primary alignment for authored Example 2 graph-from-key-features skill',
        },
      ],
      reviewStatus: 'draft',
      rationale: 'Primary alignment for the authored Example 2 graph-from-key-features capability',
      metadata: { isPrimary: true, course: 'im3' },
    });
    expect(standardEdgeMatches[0]).not.toHaveProperty('derived');
    expect(standardEdgeMatches[0]).not.toHaveProperty('derivationMethod');
    expect(nodeIds.has(standardEdgeMatches[0].sourceId)).toBe(true);
    expect(standardEdges().some(edge => edge.targetId === GRAPH_STANDARD)).toBe(true);
  });

  it('adds the Example 2 compare-maximums candidate', () => {
    const nodeMatches = lessonNodes().filter(node => node.id === COMPARE_MAXIMUMS_SKILL);
    expect(nodeMatches).toHaveLength(1);
    expect(nodeMatches[0]).toEqual({
      id: COMPARE_MAXIMUMS_SKILL,
      kind: 'skill',
      title: 'Compare maximum values of quadratic functions',
      domain: 'math.im3',
      description: 'Compare the maximum values of two quadratic functions represented in different ways.',
      sourceRefs: [
        'apps/integrated-math-3/curriculum/module-1-class-period-plan.md (1-1, Example 2)',
        `${PDF_PATH}#page=4`,
      ],
      reviewStatus: 'draft',
      metadata: { course: 'im3', module: '1', lesson: '1' },
      generatorKey: 'quadratic-graph-analysis',
      rendererKey: 'graphing-explorer',
      independentPracticeReady: true,
    });

    const blueprintMatches = moduleBlueprints.filter(
      blueprint => blueprint.nodeId === COMPARE_MAXIMUMS_SKILL,
    );
    expect(blueprintMatches).toHaveLength(1);
    const expectedBlueprint: KnowledgeBlueprint = {
      nodeId: COMPARE_MAXIMUMS_SKILL,
      sourceNodeIds: ['math.im3.example.1.1.002'],
      alignmentNodeIds: ['math.standard.ccss.hsf-if-c-9'],
      rendererKey: 'graphing-explorer',
      rendererModeMap: {
        worked: 'graphing-explorer',
        guidedPractice: 'graphing-explorer',
        independentPractice: 'graphing-explorer',
      },
      workedExampleSpec: {
        prompt: 'The graph of f(x) is shown. Function g has a y-intercept of -1 and a vertex at (1, 2). Which function has the greater maximum value?',
        givens: [
          'The graph of f(x) is shown.',
          'The vertex of g is (1, 2).',
          'The y-intercept of g is (0, -1).',
        ],
        target: {
          f_maximum: 5,
          g_maximum: 2,
          greater_maximum: 'first',
        },
        steps: [
          {
            description: 'Read the maximum value of f(x) from its graph.',
            expression: 'f maximum = 5',
          },
          {
            description: 'Use the vertex of g to identify its maximum value of 2.',
            expression: 'g maximum = 2',
          },
          {
            description: 'Plot the vertex of g and identify the axis of symmetry x = 1.',
            expression: '(1, 2); x = 1',
          },
          {
            description: 'Plot the y-intercept (0, -1) and reflect it across x = 1 to get (2, -1).',
            expression: '(0, -1) → (2, -1)',
          },
          {
            description: 'Connect the three points with a smooth downward-opening parabola.',
            expression: '(1, 2), (0, -1), (2, -1)',
          },
          {
            description: 'Compare 5 and 2, then state which function has the greater maximum value.',
            expression: '5 > 2; f(x) has the greater maximum value.',
          },
        ],
        explanation: 'The maximum value of f(x) is 5 and the maximum value of g is 2, so f(x) is greater because 5 > 2.',
        rendererProps: {
          equation: 'y = -x^2 + 6x - 4',
          variant: 'compare_functions',
          responseVariant: 'compare_maximums',
          comparisonEquation: 'y = -3x^2 + 6x - 1',
          comparisonQuestion: 'The graph of f(x) is shown. Function g has a y-intercept of -1 and a vertex at (1, 2). Which function has the greater maximum value?',
          comparisonAnswer: 'first',
          vertex: [1, 2],
          yIntercept: [0, -1],
          domain: [-2, 6],
          range: [-6, 8],
        },
      },
      guidedPracticeSpec: {
        scaffoldedPrompt: 'The graph of f(x) is shown. Function g has a y-intercept of -10 and a vertex at (2, 2). Which function has the greater maximum value?',
        stepPrompts: [
          'Read the maximum value of f(x) from its graph.',
          "Use the y-coordinate of g's vertex as its maximum value.",
          'Compare the two maximum values and select the greater function.',
        ],
        hints: [
          'Find the highest point on the graph for f.',
          "Use the y-coordinate of g's vertex as its maximum.",
          'Compare the two maximum values before selecting a function.',
        ],
        checksPerStep: [
          { check: 'The maximum value of f(x) is -1.' },
          { check: 'The maximum value of g(x) is 2.' },
          { check: 'Since -1 < 2, g(x) is greater.', answerPattern: 'second' },
        ],
        revealPolicy: 'one_at_a_time',
        rendererProps: {
          equation: 'y = -3x^2 + 12x - 13',
          variant: 'compare_functions',
          responseVariant: 'compare_maximums',
          comparisonEquation: 'y = -3x^2 + 12x - 10',
          comparisonQuestion: 'The graph of f(x) is shown. Function g has a y-intercept of -10 and a vertex at (2, 2). Which function has the greater maximum value?',
          comparisonAnswer: 'second',
          vertex: [2, 2],
          yIntercept: [0, -10],
          domain: [-2, 6],
          range: [-13, 5],
        },
      },
      independentPracticeSpec: {
        variantParameters: {
          firstVertexX: {
            type: 'integer',
            min: 1,
            max: 3,
            step: 1,
            description: 'The x-coordinate of the vertex of f(x).',
          },
          secondVertexX: {
            type: 'integer',
            min: 1,
            max: 2,
            step: 1,
            description: 'The x-coordinate of the vertex of g(x).',
          },
          firstScale: {
            type: 'enum',
            options: ['-3', '-2', '-1'],
            description: 'The negative vertical scale of f(x).',
          },
          secondScale: {
            type: 'enum',
            options: ['-3', '-2', '-1'],
            description: 'The negative vertical scale of g(x).',
          },
          baseMaximum: {
            type: 'integer',
            min: -2,
            max: 4,
            step: 1,
            description: 'The lower base maximum value.',
          },
          gap: {
            type: 'integer',
            min: 1,
            max: 3,
            step: 1,
            description: 'The positive gap between the two maximum values.',
          },
          winner: {
            type: 'enum',
            options: ['first', 'second'],
            description: 'The function with the greater maximum value.',
          },
        },
        answerSchema: {
          greater_maximum: {
            type: 'enum',
            options: ['first', 'second'],
            description: 'The function with the greater maximum value.',
          },
        },
        gradingRules: [
          { partId: 'greater_maximum', ruleType: 'exact_match', maxScore: 1 },
        ],
        replayPolicy: 'unique_seeds',
        rendererProps: {
          equation: 'y = -3x^2 + 6x + 2',
          variant: 'compare_functions',
          responseVariant: 'compare_maximums',
          comparisonEquation: 'y = -x^2 + 2x + 3',
          comparisonQuestion: 'The graph of f(x) is shown. Function g has a y-intercept of 3 and a vertex at (1, 4). Which function has the greater maximum value?',
          comparisonAnswer: 'first',
          vertex: [1, 4],
          yIntercept: [0, 3],
          domain: [-2, 6],
          range: [0, 8],
        },
      },
      generatorKey: 'quadratic-graph-analysis',
      gradingSpec: {
        partIds: ['greater_maximum'],
        passingScore: 1,
        partialCredit: false,
        rubric: [
          {
            criteria: 'Identify the function with the greater maximum.',
            points: 1,
            partId: 'greater_maximum',
          },
        ],
      },
      reviewStatus: 'draft',
      metadata: { course: 'im3', module: '1', lesson: '1' },
    };
    expect(blueprintMatches[0]).toEqual(expectedBlueprint);

    const rootBlueprintMatches = rootBlueprints.filter(
      blueprint => blueprint.nodeId === COMPARE_MAXIMUMS_SKILL,
    );
    expect(rootBlueprintMatches).toHaveLength(1);
    expect(rootBlueprintMatches[0]).toEqual(expectedBlueprint);
    expect(rootBlueprintMatches[0]).toEqual(blueprintMatches[0]);
    expect(knowledgeBlueprintSchema.safeParse(blueprintMatches[0]).success).toBe(true);
    expect(knowledgeBlueprintSchema.safeParse(rootBlueprintMatches[0]).success).toBe(true);
    expect(validateBlueprintGeneratorReadiness(blueprintMatches[0]).valid).toBe(true);
    expect(validateModeSupport(blueprintMatches[0]).valid).toBe(true);
    expect(validateGradingCompatibility(blueprintMatches[0]).valid).toBe(true);
    for (const rendererProps of [
      expectedBlueprint.workedExampleSpec?.rendererProps,
      expectedBlueprint.guidedPracticeSpec?.rendererProps,
      expectedBlueprint.independentPracticeSpec?.rendererProps,
    ]) {
      expect(graphingExplorerSchema.safeParse(rendererProps).success).toBe(true);
    }
  });

  it('connects the Example 2 compare-maximums candidate', () => {
    const nodeIds = new Set(lessonNodes().map(node => node.id));
    const contains = lessonEdges().find(
      edge => edge.sourceId === 'math.im3.lesson.1.1' && edge.targetId === COMPARE_MAXIMUMS_SKILL,
    );
    expect(contains).toMatchObject({
      id: 'math.im3.edge.m1.147',
      type: 'contains',
      sourceId: 'math.im3.lesson.1.1',
      targetId: COMPARE_MAXIMUMS_SKILL,
      reviewStatus: 'draft',
    });
    expect(nodeIds.has(contains?.sourceId ?? '')).toBe(true);
    expect(nodeIds.has(contains?.targetId ?? '')).toBe(true);

    const standardEdgeMatches = standardEdges().filter(
      edge => edge.id === COMPARE_MAXIMUMS_STANDARD_EDGE,
    );
    expect(standardEdgeMatches).toHaveLength(1);
    expect(standardEdgeMatches[0]).toEqual({
      id: COMPARE_MAXIMUMS_STANDARD_EDGE,
      type: 'aligned_to_standard',
      sourceId: COMPARE_MAXIMUMS_SKILL,
      targetId: 'math.standard.ccss.hsf-if-c-9',
      weight: 0.8,
      confidence: 'high',
      sourceRefs: [
        {
          source: `${PDF_PATH}#page=4`,
          note: 'Primary alignment for authored Example 2 compare-maximums skill',
        },
      ],
      reviewStatus: 'draft',
      rationale: 'Primary alignment for the authored Example 2 compare-maximums capability',
      metadata: { isPrimary: true, course: 'im3' },
    });
    expect(standardEdgeMatches[0]).not.toHaveProperty('derived');
    expect(standardEdgeMatches[0]).not.toHaveProperty('derivationMethod');
    expect(nodeIds.has(standardEdgeMatches[0].sourceId)).toBe(true);

    const moduleContains = lessonEdges().filter(
      edge => edge.sourceId === 'math.im3.lesson.1.1' && edge.targetId === COMPARE_MAXIMUMS_SKILL,
    );
    expect(moduleContains).toHaveLength(1);
    for (const catalog of [courseEdges()]) {
      const rootMatches = catalog.filter(
        edge => edge.sourceId === 'math.im3.lesson.1.1' && edge.targetId === COMPARE_MAXIMUMS_SKILL,
      );
      expect(rootMatches).toHaveLength(1);
      expect(rootMatches[0]).toEqual(moduleContains[0]);
    }

    for (const catalog of [courseStandardEdges(), courseEdges()]) {
      const rootMatches = catalog.filter(
        edge => edge.id === COMPARE_MAXIMUMS_STANDARD_EDGE,
      );
      expect(rootMatches).toHaveLength(1);
      expect(rootMatches[0]).toEqual(standardEdgeMatches[0]);
    }
  });

  it('adds the Example 3 quadratic profit-model candidate', () => {
    const nodeMatches = lessonNodes().filter(node => node.id === PROFIT_MODEL_SKILL);
    expect(nodeMatches).toHaveLength(1);
    expect(nodeMatches[0]).toEqual({
      id: PROFIT_MODEL_SKILL,
      kind: 'skill',
      title: 'Build and simplify a quadratic profit model from context',
      domain: 'math.im3',
      description: 'Define price and sales expressions from a context, form their product, and expand and simplify the quadratic profit model.',
      sourceRefs: [
        'apps/integrated-math-3/curriculum/module-1-class-period-plan.md (1-1, Example 3)',
        'apps/integrated-math-3/curriculum/IM3-reveal-module-1.pdf#page=5',
      ],
      reviewStatus: 'draft',
      metadata: { course: 'im3', module: '1', lesson: '1' },
      independentPracticeReady: true,
    });
    expect(nodeMatches[0]).not.toHaveProperty('generatorKey');
    expect(nodeMatches[0]).not.toHaveProperty('rendererKey');

    const blueprintMatches = moduleBlueprints.filter(
      blueprint => blueprint.nodeId === PROFIT_MODEL_SKILL,
    );
    expect(blueprintMatches).toHaveLength(1);
    expect(blueprintMatches[0]).toMatchObject({
      nodeId: PROFIT_MODEL_SKILL,
      sourceNodeIds: ['math.im3.example.1.1.003'],
      alignmentNodeIds: ['math.standard.ccss.hsf-bf-a-1a', 'math.standard.ccss.hsa-apr-a-1'],
      rendererKey: 'fill-in-the-blank',
      rendererModeMap: {
        worked: 'fill-in-the-blank',
        guidedPractice: 'fill-in-the-blank',
        independentPractice: 'fill-in-the-blank',
      },
      reviewStatus: 'draft',
      metadata: { course: 'im3', module: '1', lesson: '1' },
    });
  });

  it('connects the Example 3 quadratic profit-model candidate', () => {
    const nodeIds = new Set(lessonNodes().map(node => node.id));
    const contains = lessonEdges().find(
      edge => edge.sourceId === 'math.im3.lesson.1.1' && edge.targetId === PROFIT_MODEL_SKILL,
    );
    expect(contains).toMatchObject({
      id: 'math.im3.edge.m1.148',
      type: 'contains',
      sourceId: 'math.im3.lesson.1.1',
      targetId: PROFIT_MODEL_SKILL,
      reviewStatus: 'draft',
    });
    expect(nodeIds.has(contains?.sourceId ?? '')).toBe(true);
    expect(nodeIds.has(contains?.targetId ?? '')).toBe(true);

    const standardEdgeMatches = standardEdges().filter(
      edge => PROFIT_MODEL_STANDARD_EDGES.includes(edge.id as (typeof PROFIT_MODEL_STANDARD_EDGES)[number]),
    );
    expect(standardEdgeMatches).toHaveLength(2);
    expect(standardEdgeMatches.map(edge => edge.id)).toEqual([...PROFIT_MODEL_STANDARD_EDGES]);
    const primaryEdge = standardEdgeMatches.find(
      edge => edge.targetId === 'math.standard.ccss.hsf-bf-a-1a',
    );
    expect(primaryEdge).toMatchObject({
      type: 'aligned_to_standard',
      sourceId: PROFIT_MODEL_SKILL,
      targetId: 'math.standard.ccss.hsf-bf-a-1a',
      weight: 0.8,
      confidence: 'high',
      reviewStatus: 'draft',
      metadata: { isPrimary: true, course: 'im3' },
      sourceRefs: [
        {
          source: `${PDF_PATH}#page=5`,
          note: 'Primary alignment for the authored Example 3 quadratic profit-model skill',
        },
      ],
      rationale: 'Primary alignment for the authored Example 3 quadratic profit-model capability',
    });
    const supportingEdge = standardEdgeMatches.find(
      edge => edge.targetId === 'math.standard.ccss.hsa-apr-a-1',
    );
    expect(supportingEdge).toMatchObject({
      type: 'aligned_to_standard',
      sourceId: PROFIT_MODEL_SKILL,
      targetId: 'math.standard.ccss.hsa-apr-a-1',
      weight: 0.6,
      confidence: 'high',
      reviewStatus: 'draft',
      metadata: { isPrimary: false, course: 'im3' },
      sourceRefs: [
        {
          source: `${PDF_PATH}#page=5`,
          note: 'Supporting alignment for expanding the authored Example 3 profit model',
        },
      ],
      rationale: 'Supporting alignment for expanding the authored Example 3 profit model',
    });
    for (const edge of standardEdgeMatches) {
      expect(edge).not.toHaveProperty('derived');
      expect(edge).not.toHaveProperty('derivationMethod');
      expect(nodeIds.has(edge.sourceId)).toBe(true);
      expect(edge.targetId).toMatch(/^math\.standard\.ccss\.(hsf-bf-a-1a|hsa-apr-a-1)$/);
    }
  });

  it('adds the Example 3 quadratic profit-model generated-by edge to both catalogs', () => {
    const expectedEdge = {
      id: PROFIT_MODEL_GENERATED_BY_EDGE,
      type: 'generated_by',
      sourceId: PROFIT_MODEL_SKILL,
      targetId: 'math.im3.generator.m1.quadratic-profit-model',
      weight: 1,
      confidence: 'high',
      reviewStatus: 'draft',
      rationale: `Skill ${PROFIT_MODEL_SKILL} generated by math.im3.generator.m1.quadratic-profit-model`,
      sourceRefs: [
        { source: 'pilot', note: 'Module 1 pilot generator' },
      ],
      derived: true,
      derivationMethod: 'generator-registry-mapping',
      metadata: { course: 'im3', module: '1' },
    };
    const moduleMatches = lessonEdges().filter(edge => edge.id === PROFIT_MODEL_GENERATED_BY_EDGE);
    const rootMatches = courseEdges().filter(edge => edge.id === PROFIT_MODEL_GENERATED_BY_EDGE);

    expect(moduleMatches).toHaveLength(1);
    expect(rootMatches).toHaveLength(1);
    expect(moduleMatches[0]).toEqual(expectedEdge);
    expect(rootMatches[0]).toEqual(expectedEdge);
    expect(rootMatches[0]).toEqual(moduleMatches[0]);

    for (const [catalog, edge] of [
      [lessonNodes(), moduleMatches[0]],
      [courseNodes(), rootMatches[0]],
    ] as const) {
      expect(catalog.find(node => node.id === edge.sourceId)?.kind).toBe('skill');
      expect(catalog.find(node => node.id === edge.targetId)?.kind).toBe('generator');
    }

    expect(lessonEdges().filter(
      edge => edge.type === 'generated_by' && edge.sourceId === PROFIT_MAXIMUM_SKILL,
    )).toHaveLength(1);
    expect(courseEdges().filter(
      edge => edge.type === 'generated_by' && edge.sourceId === PROFIT_MAXIMUM_SKILL,
    )).toHaveLength(1);
  });

  it('adds the Example 1 domain-range generated-by edge to both catalogs', () => {
    const expectedEdge = {
      id: DOMAIN_RANGE_GENERATED_BY_EDGE,
      type: 'generated_by',
      sourceId: DOMAIN_RANGE_FROM_GRAPH_SKILL,
      targetId: 'math.im3.generator.m1.quadratic-graph-analysis',
      weight: 1,
      confidence: 'high',
      reviewStatus: 'draft',
      rationale: `Skill ${DOMAIN_RANGE_FROM_GRAPH_SKILL} generated by math.im3.generator.m1.quadratic-graph-analysis`,
      sourceRefs: [
        { source: 'pilot', note: 'Module 1 pilot generator' },
      ],
      derived: true,
      derivationMethod: 'generator-registry-mapping',
      metadata: { course: 'im3', module: '1' },
    };
    const moduleMatches = lessonEdges().filter(edge => edge.id === DOMAIN_RANGE_GENERATED_BY_EDGE);
    const rootMatches = courseEdges().filter(edge => edge.id === DOMAIN_RANGE_GENERATED_BY_EDGE);

    expect(moduleMatches).toHaveLength(1);
    expect(rootMatches).toHaveLength(1);
    expect(moduleMatches[0]).toEqual(expectedEdge);
    expect(rootMatches[0]).toEqual(expectedEdge);
    expect(rootMatches[0]).toEqual(moduleMatches[0]);
    expect(lessonEdges().findIndex(edge => edge.id === DOMAIN_RANGE_GENERATED_BY_EDGE)).toBe(
      lessonEdges().findIndex(edge => edge.id === PROFIT_MODEL_GENERATED_BY_EDGE) + 1,
    );
    expect(courseEdges().findIndex(edge => edge.id === DOMAIN_RANGE_GENERATED_BY_EDGE)).toBe(
      courseEdges().findIndex(edge => edge.id === PROFIT_MODEL_GENERATED_BY_EDGE) + 1,
    );

    for (const [catalog, edge] of [
      [lessonNodes(), moduleMatches[0]],
      [courseNodes(), rootMatches[0]],
    ] as const) {
      expect(catalog.find(node => node.id === edge.sourceId)?.kind).toBe('skill');
      expect(catalog.find(node => node.id === edge.targetId)?.kind).toBe('generator');
    }
  });

  it('adds the Example 3 quadratic profit maximum candidate', () => {
    const nodeMatches = lessonNodes().filter(node => node.id === PROFIT_MAXIMUM_SKILL);
    expect(nodeMatches).toHaveLength(1);
    expect(nodeMatches[0]).toEqual({
      id: PROFIT_MAXIMUM_SKILL,
      kind: 'skill',
      title: 'Find and interpret the maximum of a quadratic profit model',
      domain: 'math.im3',
      description: 'Use x = -b/(2a) to find the input that maximizes a quadratic profit model, evaluate the maximum profit, and interpret both values in context.',
      sourceRefs: [
        'apps/integrated-math-3/curriculum/module-1-class-period-plan.md (1-1, Example 3)',
        'apps/integrated-math-3/curriculum/IM3-reveal-module-1.pdf#page=5',
      ],
      reviewStatus: 'draft',
      metadata: { course: 'im3', module: '1', lesson: '1' },
      independentPracticeReady: true,
    });
    expect(nodeMatches[0].description).not.toContain('$145');
    expect(nodeMatches[0].description).not.toContain('$84,100');
    expect(nodeMatches[0]).not.toHaveProperty('generatorKey');
    expect(nodeMatches[0]).not.toHaveProperty('rendererKey');

    const blueprintMatches = ownedBlueprints().filter(item => item.nodeId === PROFIT_MAXIMUM_SKILL);
    expect(blueprintMatches).toHaveLength(1);
    expect(blueprintMatches[0]).toEqual({
      nodeId: PROFIT_MAXIMUM_SKILL,
      sourceNodeIds: ['math.im3.example.1.1.003'],
      alignmentNodeIds: [
        'math.standard.ccss.hsf-if-b-4',
        'math.standard.ccss.hsf-if-a-2',
      ],
      rendererKey: 'fill-in-the-blank',
      rendererModeMap: {
        worked: 'fill-in-the-blank',
        guidedPractice: 'fill-in-the-blank',
        independentPractice: 'fill-in-the-blank',
      },
      generatorKey: 'quadratic-profit-model',
      workedExampleSpec: {
        prompt: 'A ski resort sells 680 passes at a base price of $120. For each $5 increase, it sells 20 fewer passes. Given P(x) = -100x^2 + 1000x + 81600, find the maximizing x, the price per pass, and the maximum profit.',
        givens: [
          'A ski resort sells 680 passes at $120 per pass.',
          'Each $5 price increase results in 20 fewer passes sold.',
          'P(x) = -100x^2 + 1000x + 81600.',
        ],
        target: {
          optimalIncreases: '5',
          optimalPrice: '145',
          maximumProfit: '84100',
        },
        steps: [
          {
            description: 'Find the axis of symmetry.',
            expression: 'x = -b/(2a) = -1000/(2(-100)) = 5',
            result: 'x = 5 means 5 price increases.',
          },
          {
            description: 'Find the price per pass.',
            expression: '120 + 5(5) = 145 dollars per pass',
            result: 'The price is $145 per pass.',
          },
          {
            description: 'Evaluate the profit at the maximum.',
            expression: 'P(5) = -100(5)^2 + 1000(5) + 81600 = 84100 dollars',
            result: 'The maximum profit is $84,100.',
          },
        ],
        explanation: 'The axis of symmetry gives the maximizing number of price increases. Use it to find the price per pass, then evaluate P(x) to find the maximum profit.',
        rendererProps: {
          template: 'A ski resort sells 680 passes at a base price of $120. Each price increase is $5, and 20 fewer passes are sold for each increase. Let x be the number of price increases. Given P(x) = -100x^2 + 1000x + 81600, enter the maximizing x value: {{blank:optimalIncreases}}. Enter the price per pass in dollars: {{blank:optimalPrice}}. Enter the maximum profit in dollars: {{blank:maximumProfit}}.',
          blanks: [
            { id: 'optimalIncreases', correctAnswer: '5', isMath: true },
            { id: 'optimalPrice', correctAnswer: '145', isMath: true },
            { id: 'maximumProfit', correctAnswer: '84100', isMath: true },
          ],
        },
      },
      guidedPracticeSpec: PROFIT_MAXIMUM_GUIDED_PRACTICE_SPEC,
      independentPracticeSpec: PROFIT_MAXIMUM_INDEPENDENT_PRACTICE_SPEC,
      gradingSpec: PROFIT_MAXIMUM_GRADING_SPEC,
      reviewStatus: 'draft',
      metadata: { course: 'im3', module: '1', lesson: '1' },
    });
  });

  it('adds the Example 3 quadratic profit maximum generated-by edge', () => {
    const expectedEdge: KnowledgeSpaceEdge = {
      id: PROFIT_MAXIMUM_GENERATED_BY_EDGE,
      type: 'generated_by',
      sourceId: PROFIT_MAXIMUM_SKILL,
      targetId: 'math.im3.generator.m1.quadratic-profit-model',
      weight: 1,
      confidence: 'high',
      reviewStatus: 'draft',
      rationale: `Skill ${PROFIT_MAXIMUM_SKILL} generated by math.im3.generator.m1.quadratic-profit-model`,
      sourceRefs: [{ source: 'pilot', note: 'Module 1 pilot generator' }],
      derived: true,
      derivationMethod: 'generator-registry-mapping',
      metadata: { course: 'im3', module: '1' },
    };
    const catalogs = [lessonEdges(), courseEdges()];
    const matches = catalogs.map(catalog =>
      catalog.filter(edge => edge.id === PROFIT_MAXIMUM_GENERATED_BY_EDGE),
    );

    for (const catalogMatches of matches) {
      expect(catalogMatches).toHaveLength(1);
      expect(catalogMatches[0]).toEqual(expectedEdge);
    }
    expect(matches[1][0]).toEqual(matches[0][0]);
    expect(lessonEdges().findIndex(edge => edge.id === PROFIT_MAXIMUM_GENERATED_BY_EDGE)).toBe(
      lessonEdges().findIndex(edge => edge.id === DOMAIN_RANGE_GENERATED_BY_EDGE) + 1,
    );
    expect(courseEdges().findIndex(edge => edge.id === PROFIT_MAXIMUM_GENERATED_BY_EDGE)).toBe(
      courseEdges().findIndex(edge => edge.id === DOMAIN_RANGE_GENERATED_BY_EDGE) + 1,
    );

    for (const [nodes, edge] of [
      [lessonNodes(), matches[0][0]],
      [courseNodes(), matches[1][0]],
    ] as const) {
      expect(nodes.find(node => node.id === edge?.sourceId)?.kind).toBe('skill');
      expect(nodes.find(node => node.id === edge?.targetId)?.kind).toBe('generator');
    }

    for (const nodes of [
      lessonNodes(),
      draftNodes(),
      courseNodes(),
      courseStandardNodes(),
      embeddedCourseNodes(),
    ]) {
      const maximumNodes = nodes.filter(node => node.id === PROFIT_MAXIMUM_SKILL);
      expect(maximumNodes).toHaveLength(1);
      expect(maximumNodes[0]?.independentPracticeReady).toBe(true);
    }
  });

  it('marks the Example 3 quadratic profit maximum ready across all node mirrors', () => {
    const nodeCatalogs = [
      lessonNodes(),
      draftNodes(),
      courseNodes(),
      courseStandardNodes(),
      embeddedCourseNodes(),
    ];
    const targetNodes = nodeCatalogs.map(nodes => {
      const matches = nodes.filter(node => node.id === PROFIT_MAXIMUM_SKILL);
      expect(matches).toHaveLength(1);
      expect(matches[0]?.independentPracticeReady).toBe(true);
      return matches[0];
    });
    for (const node of targetNodes.slice(1)) {
      expect(node).toEqual(targetNodes[0]);
    }

    const generatedByEdges = [lessonEdges(), courseEdges()].map(edges =>
      edges.filter(edge => edge.id === PROFIT_MAXIMUM_GENERATED_BY_EDGE),
    );
    for (const matches of generatedByEdges) {
      expect(matches).toHaveLength(1);
      expect(matches[0]).toMatchObject({
        type: 'generated_by',
        sourceId: PROFIT_MAXIMUM_SKILL,
        targetId: 'math.im3.generator.m1.quadratic-profit-model',
      });
    }
    expect(generatedByEdges[1][0]).toEqual(generatedByEdges[0][0]);
    expect(lessonEdges().findIndex(edge => edge.id === PROFIT_MAXIMUM_GENERATED_BY_EDGE)).toBe(
      lessonEdges().findIndex(edge => edge.id === DOMAIN_RANGE_GENERATED_BY_EDGE) + 1,
    );
    expect(courseEdges().findIndex(edge => edge.id === PROFIT_MAXIMUM_GENERATED_BY_EDGE)).toBe(
      courseEdges().findIndex(edge => edge.id === DOMAIN_RANGE_GENERATED_BY_EDGE) + 1,
    );

    const moduleBlueprint = moduleBlueprints.find(
      blueprint => blueprint.nodeId === PROFIT_MAXIMUM_SKILL,
    );
    const rootBlueprint = rootBlueprints.find(
      blueprint => blueprint.nodeId === PROFIT_MAXIMUM_SKILL,
    );
    expect(moduleBlueprint).toBeDefined();
    expect(rootBlueprint).toBeDefined();
    if (!moduleBlueprint || !rootBlueprint) return;

    const activityOrders = [
      projectActivityMap(lessonNodes(), lessonEdges(), [moduleBlueprint]),
      projectActivityMap(courseNodes(), courseEdges(), [rootBlueprint]),
    ].map(activities => activities.filter(activity => activity.nodeId === PROFIT_MAXIMUM_SKILL));
    for (const activities of activityOrders) {
      expect(activities).toHaveLength(3);
      expect(activities.map(activity => activity.mode)).toEqual([
        'worked_example',
        'guided_practice',
        'independent_practice',
      ]);
      expect(activities.map(activity => activity.stableActivityId)).toEqual([
        `${PROFIT_MAXIMUM_SKILL}.worked_example`,
        `${PROFIT_MAXIMUM_SKILL}.guided_practice`,
        `${PROFIT_MAXIMUM_SKILL}.independent_practice`,
      ]);
      expect(activities.map(activity => activity.srsEligible)).toEqual([false, true, true]);
    }

    for (const nodes of nodeCatalogs) {
      const matches = nodes.filter(node => node.id === PROFIT_DOMAIN_SKILL);
      expect(matches).toHaveLength(1);
      expect(matches[0]?.independentPracticeReady).toBe(false);
    }
  });

  it('connects the Example 3 quadratic profit maximum candidate', () => {
    const nodeIds = new Set(lessonNodes().map(node => node.id));
    const contains = lessonEdges().find(
      edge => edge.sourceId === 'math.im3.lesson.1.1' && edge.targetId === PROFIT_MAXIMUM_SKILL,
    );
    expect(contains).toMatchObject({
      id: 'math.im3.edge.m1.149',
      type: 'contains',
      sourceId: 'math.im3.lesson.1.1',
      targetId: PROFIT_MAXIMUM_SKILL,
      reviewStatus: 'draft',
    });
    expect(nodeIds.has(contains?.sourceId ?? '')).toBe(true);
    expect(nodeIds.has(contains?.targetId ?? '')).toBe(true);

    const standardEdgeMatches = standardEdges().filter(
      edge => PROFIT_MAXIMUM_STANDARD_EDGES.includes(edge.id as (typeof PROFIT_MAXIMUM_STANDARD_EDGES)[number]),
    );
    expect(standardEdgeMatches).toHaveLength(2);
    expect(standardEdgeMatches.map(edge => edge.id)).toEqual([...PROFIT_MAXIMUM_STANDARD_EDGES]);
    const primaryEdge = standardEdgeMatches.find(
      edge => edge.targetId === 'math.standard.ccss.hsf-if-b-4',
    );
    expect(primaryEdge).toMatchObject({
      type: 'aligned_to_standard',
      sourceId: PROFIT_MAXIMUM_SKILL,
      targetId: 'math.standard.ccss.hsf-if-b-4',
      weight: 0.8,
      confidence: 'high',
      reviewStatus: 'draft',
      metadata: { isPrimary: true, course: 'im3' },
      sourceRefs: [
        {
          source: `${PDF_PATH}#page=5`,
          note: 'Primary alignment for the authored Example 3 profit-maximum capability',
        },
      ],
      rationale: 'Primary alignment for the authored Example 3 profit-maximum capability',
    });
    const supportingEdge = standardEdgeMatches.find(
      edge => edge.targetId === 'math.standard.ccss.hsf-if-a-2',
    );
    expect(supportingEdge).toMatchObject({
      type: 'aligned_to_standard',
      sourceId: PROFIT_MAXIMUM_SKILL,
      targetId: 'math.standard.ccss.hsf-if-a-2',
      weight: 0.6,
      confidence: 'high',
      reviewStatus: 'draft',
      metadata: { isPrimary: false, course: 'im3' },
      sourceRefs: [
        {
          source: `${PDF_PATH}#page=5`,
          note: 'Supporting alignment for interpreting the authored Example 3 profit maximum',
        },
      ],
      rationale: 'Supporting alignment for interpreting the authored Example 3 profit maximum',
    });
    for (const edge of standardEdgeMatches) {
      expect(edge).not.toHaveProperty('derived');
      expect(edge).not.toHaveProperty('derivationMethod');
      expect(nodeIds.has(edge.sourceId)).toBe(true);
    }

    const rootContains = courseEdges().filter(
      edge => edge.sourceId === 'math.im3.lesson.1.1' && edge.targetId === PROFIT_MAXIMUM_SKILL,
    );
    expect(rootContains).toHaveLength(1);
    expect(rootContains[0]).toEqual(contains);
    for (const catalog of [courseStandardEdges(), courseEdges()]) {
      const rootStandardEdges = catalog.filter(
        edge => PROFIT_MAXIMUM_STANDARD_EDGES.includes(edge.id as (typeof PROFIT_MAXIMUM_STANDARD_EDGES)[number]),
      );
      expect(rootStandardEdges).toHaveLength(2);
      expect(rootStandardEdges).toEqual(standardEdgeMatches);
    }
  });

  it('keeps the Example 3 profit maximum standard roles explicit', () => {
    const edges = standardEdges().filter(
      edge => edge.sourceId === PROFIT_MAXIMUM_SKILL,
    );
    expect(edges).toHaveLength(2);
    expect(edges.find(edge => edge.targetId === 'math.standard.ccss.hsf-if-b-4')).toMatchObject({
      weight: 0.8,
      metadata: { isPrimary: true, course: 'im3' },
    });
    expect(edges.find(edge => edge.targetId === 'math.standard.ccss.hsf-if-a-2')).toMatchObject({
      weight: 0.6,
      metadata: { isPrimary: false, course: 'im3' },
    });
  });

  it('adds the Example 3 contextual domain-and-range candidate', () => {
    const nodeMatches = lessonNodes().filter(node => node.id === PROFIT_DOMAIN_SKILL);
    expect(nodeMatches).toHaveLength(1);
    expect(nodeMatches[0]).toEqual({
      id: PROFIT_DOMAIN_SKILL,
      kind: 'skill',
      title: 'Determine the contextual domain and range of a quadratic model',
      domain: 'math.im3',
      description: "Determine the input values allowed by a quadratic model's context, use extrema and boundary values to determine its output range, and interpret both intervals in context.",
      sourceRefs: [
        'apps/integrated-math-3/curriculum/module-1-class-period-plan.md (1-1, Example 3)',
        'apps/integrated-math-3/curriculum/IM3-reveal-module-1.pdf#page=5',
      ],
      reviewStatus: 'draft',
      metadata: { course: 'im3', module: '1', lesson: '1' },
      independentPracticeReady: false,
    });
    expect(nodeMatches[0].description).not.toContain('34');
    expect(nodeMatches[0].description).not.toContain('84,100');
    expect(nodeMatches[0]).not.toHaveProperty('generatorKey');
    expect(nodeMatches[0]).not.toHaveProperty('rendererKey');

    const blueprintMatches = moduleBlueprints.filter(
      item => item.nodeId === PROFIT_DOMAIN_SKILL,
    );
    expect(blueprintMatches).toHaveLength(1);
    expect(blueprintMatches[0]).toEqual({
      nodeId: PROFIT_DOMAIN_SKILL,
      sourceNodeIds: ['math.im3.example.1.1.003'],
      alignmentNodeIds: [
        'math.standard.ccss.hsf-if-b-5',
        'math.standard.ccss.hsa-ced-a-3',
        'math.standard.ccss.hsf-if-b-4',
      ],
      rendererKey: 'step-by-step-solver',
      rendererModeMap: {},
      reviewStatus: 'draft',
      metadata: { course: 'im3', module: '1', lesson: '1' },
    });
  });

  it('connects the Example 3 contextual domain-and-range candidate', () => {
    const nodeIds = new Set(lessonNodes().map(node => node.id));
    const contains = lessonEdges().find(
      edge => edge.sourceId === 'math.im3.lesson.1.1' && edge.targetId === PROFIT_DOMAIN_SKILL,
    );
    expect(contains).toMatchObject({
      id: 'math.im3.edge.m1.150',
      type: 'contains',
      sourceId: 'math.im3.lesson.1.1',
      targetId: PROFIT_DOMAIN_SKILL,
      reviewStatus: 'draft',
    });
    expect(nodeIds.has(contains?.sourceId ?? '')).toBe(true);
    expect(nodeIds.has(contains?.targetId ?? '')).toBe(true);

    const standardEdgeMatches = standardEdges().filter(
      edge => PROFIT_DOMAIN_STANDARD_EDGES.includes(edge.id as (typeof PROFIT_DOMAIN_STANDARD_EDGES)[number]),
    );
    expect(standardEdgeMatches).toHaveLength(3);
    expect(standardEdgeMatches.map(edge => edge.id)).toEqual([...PROFIT_DOMAIN_STANDARD_EDGES]);
    expect(standardEdgeMatches.find(edge => edge.targetId === 'math.standard.ccss.hsf-if-b-5')).toMatchObject({
      type: 'aligned_to_standard',
      sourceId: PROFIT_DOMAIN_SKILL,
      targetId: 'math.standard.ccss.hsf-if-b-5',
      weight: 0.8,
      confidence: 'high',
      reviewStatus: 'draft',
      metadata: { isPrimary: true, course: 'im3' },
      sourceRefs: [
        {
          source: `${PDF_PATH}#page=5`,
          note: 'Primary alignment for relating the authored Example 3 domain to its context',
        },
      ],
      rationale: 'Primary alignment for relating the model domain to its quantitative context',
    });
    expect(standardEdgeMatches.find(edge => edge.targetId === 'math.standard.ccss.hsa-ced-a-3')).toMatchObject({
      type: 'aligned_to_standard',
      sourceId: PROFIT_DOMAIN_SKILL,
      targetId: 'math.standard.ccss.hsa-ced-a-3',
      weight: 0.6,
      confidence: 'high',
      reviewStatus: 'draft',
      metadata: { isPrimary: false, course: 'im3' },
      sourceRefs: [
        {
          source: `${PDF_PATH}#page=5`,
          note: 'Supporting alignment for interpreting the authored Example 3 contextual domain and range',
        },
      ],
      rationale: 'Supporting alignment for interpreting the authored Example 3 contextual domain and range',
    });
    expect(standardEdgeMatches.find(edge => edge.targetId === 'math.standard.ccss.hsf-if-b-4')).toMatchObject({
      type: 'aligned_to_standard',
      sourceId: PROFIT_DOMAIN_SKILL,
      targetId: 'math.standard.ccss.hsf-if-b-4',
      weight: 0.6,
      confidence: 'high',
      reviewStatus: 'draft',
      metadata: { isPrimary: false, course: 'im3' },
      sourceRefs: [
        {
          source: `${PDF_PATH}#page=5`,
          note: 'Supporting alignment for using extrema and boundary values to interpret the output range',
        },
      ],
      rationale: 'Supporting alignment for using extrema and boundary values to interpret the output range',
    });

    const rootContains = courseEdges().filter(
      edge => edge.sourceId === 'math.im3.lesson.1.1' && edge.targetId === PROFIT_DOMAIN_SKILL,
    );
    expect(rootContains).toHaveLength(1);
    expect(rootContains[0]).toEqual(contains);
    for (const catalog of [courseStandardEdges(), courseEdges()]) {
      const rootStandardEdges = catalog.filter(
        edge => PROFIT_DOMAIN_STANDARD_EDGES.includes(edge.id as (typeof PROFIT_DOMAIN_STANDARD_EDGES)[number]),
      );
      expect(rootStandardEdges).toHaveLength(3);
      expect(rootStandardEdges).toEqual(standardEdgeMatches);
    }
  });

  it('keeps the Example 3 source alignments limited to the six approved targets', () => {
    const edges = standardEdges().filter(
      edge => edge.type === 'aligned_to_standard' && edge.sourceId === 'math.im3.example.1.1.003',
    );
    expect(edges).toHaveLength(6);
    expect(edges.map(edge => edge.targetId).sort()).toEqual([...EXAMPLE_THREE_STANDARD_TARGETS].sort());
    expect(new Set(edges.map(edge => edge.targetId)).size).toBe(6);
    expect(edges.every(edge => edge.reviewStatus === 'draft')).toBe(true);
    expect(edges.every(edge => edge.confidence === 'high')).toBe(true);
    expect(edges.every(edge => edge.weight === 0.6 || edge.weight === 0.8)).toBe(true);
    expect(edges.every(edge => edge.sourceRefs?.some(ref => typeof ref !== 'string' && ref.source.endsWith('#page=5')) ?? false)).toBe(true);
    expect(edges.filter(edge => edge.metadata?.isPrimary === true)).toHaveLength(1);
    expect(edges.find(edge => edge.targetId === 'math.standard.ccss.hsf-if-b-5')).toMatchObject({
      sourceRefs: [
        {
          note: 'Supporting alignment for the authored Example 3 contextual domain',
        },
      ],
      rationale: 'Supporting alignment for relating the model domain to its context',
    });
    expect(edges.find(edge => edge.targetId === 'math.standard.ccss.hsf-bf-a-1a')).toMatchObject({
      weight: 0.8,
      metadata: { isPrimary: true, course: 'im3' },
    });
    for (const targetId of EXAMPLE_THREE_STANDARD_TARGETS.filter(
      target => target !== 'math.standard.ccss.hsf-bf-a-1a',
    )) {
      expect(edges.find(edge => edge.targetId === targetId)).toMatchObject({
        weight: 0.6,
        metadata: { isPrimary: false, course: 'im3' },
      });
    }
    expect(edges.map(edge => edge.targetId)).not.toEqual(expect.arrayContaining([
      'math.standard.ccss.hsf-if-c-7c',
      'math.standard.ccss.hsa-sse-b-3',
      'math.standard.ccss.hsa-rei-b-4',
      'math.standard.ccss.n-cn-a-1',
      'math.standard.ccss.n-cn-c-7',
    ]));
    for (const catalog of [courseStandardEdges(), courseEdges()]) {
      const rootEdges = catalog.filter(
        edge => edge.type === 'aligned_to_standard' && edge.sourceId === 'math.im3.example.1.1.003',
      );
      expect(rootEdges).toHaveLength(6);
      expect(rootEdges).toEqual(edges);
    }
  });

  it('maps each source example to the skill capability it supports', () => {
    const blueprints = ownedBlueprints();
    const blueprintBySkill = new Map(blueprints.map(blueprint => [blueprint.nodeId, blueprint]));

    for (const mapping of SKILL_MATRIX) {
      const exampleId = `math.im3.example.1.1.00${mapping.exampleNumber}`;
      const graphMatches = blueprintBySkill.get(GRAPH_SKILL)?.sourceNodeIds.includes(exampleId);
      const rateMatches = blueprintBySkill.get(RATE_SKILL)?.sourceNodeIds.includes(exampleId);
      expect(graphMatches).toBe(mapping.graph);
      expect(rateMatches).toBe(mapping.rate);
    }

    expect(blueprintBySkill.get(GRAPH_SKILL)?.sourceNodeIds).toEqual([
      'math.im3.example.1.1.001',
    ]);
    expect(blueprintBySkill.get(RATE_SKILL)?.sourceNodeIds).toEqual([
      'math.im3.example.1.1.004',
      'math.im3.example.1.1.005',
      'math.im3.example.1.1.006',
    ]);
  });

  it('keeps the graph skill as an unapproved Example 1 ready practice candidate', () => {
    const blueprint = ownedBlueprints().find(item => item.nodeId === GRAPH_SKILL);
    const node = lessonNodes().find(item => item.id === GRAPH_SKILL);
    expect(node).toMatchObject({
      title: '1a: Graph a quadratic function by using a table',
      description: 'Graph a quadratic function from an equation by using a table.',
      reviewStatus: 'draft',
      independentPracticeReady: true,
    });
    expect(blueprint?.sourceNodeIds).toEqual(['math.im3.example.1.1.001']);
    expect(blueprint?.workedExampleSpec).toMatchObject({
      prompt: 'Graph f(x) = x^2 + 2x - 3 by using a table. State the domain and range.',
      target: {
        vertex: '(-1, -4)',
        axis_of_symmetry: 'x = -1',
        y_intercept: '(0, -3)',
        direction: 'upward',
        domain: 'all real numbers',
        range: '{y | y >= -4}',
      },
      rendererProps: {
        equation: 'f(x) = x^2 + 2x - 3',
        variant: 'plot_from_equation',
      },
    });
    expect(blueprint?.guidedPracticeSpec?.stepPrompts.length).toBeGreaterThan(0);
    expect(blueprint?.guidedPracticeSpec?.hints.length).toBeGreaterThan(0);
    expect(blueprint?.guidedPracticeSpec?.rendererProps).toEqual({
      equation: 'y = x^2 - x - 2',
      variant: 'plot_from_equation',
      responseVariant: 'table_graph',
      domain: [-5, 5],
      range: [-10, 10],
    });
  });

  it('connects the graph skill to the existing Lesson 1.1 node', () => {
    const nodeIds = new Set(lessonNodes().map(node => node.id));
    const lesson = lessonNodes().find(node => node.id === 'math.im3.lesson.1.1');
    const edge = lessonEdges().find(edge => edge.id === 'math.im3.edge.m1.011');

    expect(lesson).toBeDefined();
    expect(edge).toMatchObject({
      sourceId: 'math.im3.lesson.1.1',
      targetId: GRAPH_SKILL,
    });
    expect(nodeIds.has(edge?.sourceId ?? '')).toBe(true);
    expect(nodeIds.has(edge?.targetId ?? '')).toBe(true);
  });

  it('connects the Example 2 maximum skill with a non-dangling contains edge', () => {
    const nodeIds = new Set(lessonNodes().map(node => node.id));
    const edge = lessonEdges().find(edge => edge.id === 'math.im3.edge.m1.145');

    expect(edge).toMatchObject({
      id: 'math.im3.edge.m1.145',
      type: 'contains',
      sourceId: 'math.im3.lesson.1.1',
      targetId: MAXIMUM_SKILL,
      reviewStatus: 'draft',
    });
    expect(nodeIds.has(edge?.sourceId ?? '')).toBe(true);
    expect(nodeIds.has(edge?.targetId ?? '')).toBe(true);
  });

  it('synchronizes the Example 2 maximum-reading containment edge in the course catalog', () => {
    const moduleEdge = lessonEdges().find(edge => edge.id === 'math.im3.edge.m1.145');
    const courseEdge = courseEdges().find(edge => edge.id === 'math.im3.edge.m1.145');

    expect(courseEdge).toEqual(moduleEdge);
    expect(courseEdge).toEqual({
      id: 'math.im3.edge.m1.145',
      type: 'contains',
      sourceId: 'math.im3.lesson.1.1',
      targetId: 'math.im3.skill.1.1.identify-a-quadratic-maximum-from-its-graph',
      weight: 1.0,
      confidence: 'high',
      reviewStatus: 'draft',
      metadata: {
        course: 'im3',
        module: '1',
      },
      rationale: 'Skill contained in lesson 1.1',
      sourceRefs: [
        'apps/integrated-math-3/curriculum/module-1-class-period-plan.md (1-1, Example 2)',
      ],
    });
  });

  it('uses one HSF-IF.B.6 alignment for the legacy average-rate umbrella blueprint', () => {
    const oldAlignmentNodeIds = [
      'math.standard.ccss.hsf-if-c-7c',
      'math.standard.ccss.hsa-sse-b-3',
      'math.standard.ccss.hsa-rei-b-4',
      'math.standard.ccss.hsf-if-a-2',
      'math.standard.ccss.n-cn-a-1',
      'math.standard.ccss.n-cn-c-7',
    ];
    const targetBlueprints = [
      moduleBlueprints.filter(blueprint => blueprint.nodeId === RATE_SKILL),
      rootBlueprints.filter(blueprint => blueprint.nodeId === RATE_SKILL),
    ];

    expect(targetBlueprints[0]).toHaveLength(1);
    expect(targetBlueprints[1]).toHaveLength(1);
    expect(targetBlueprints[1][0]).toEqual(targetBlueprints[0][0]);
    expect(targetBlueprints[0][0]?.alignmentNodeIds).toEqual(['math.standard.ccss.hsf-if-b-6']);
    for (const oldAlignmentNodeId of oldAlignmentNodeIds) {
      expect(targetBlueprints[0][0]?.alignmentNodeIds).not.toContain(oldAlignmentNodeId);
    }

    const activityRows = targetBlueprints.map(([blueprint], index) =>
      projectActivityMap(
        index === 0 ? lessonNodes() : courseNodes(),
        index === 0 ? lessonEdges() : courseEdges(),
        blueprint ? [blueprint] : [],
      ).filter(activity => activity.nodeId === RATE_SKILL),
    );
    for (const rows of activityRows) {
      expect(rows).toHaveLength(2);
      expect(rows.map(row => row.mode)).toEqual(['worked_example', 'guided_practice']);
      expect(rows.map(row => row.alignmentNodeIds)).toEqual([
        ['math.standard.ccss.hsf-if-b-6'],
        ['math.standard.ccss.hsf-if-b-6'],
      ]);
      expect(rows.some(row => row.mode === 'independent_practice')).toBe(false);
    }

    expect(lessonNodes().find(node => node.id === RATE_SKILL)?.independentPracticeReady).toBeUndefined();
  });

  it('uses the existing rate component for source-backed Worked and Guided views', () => {
    const blueprint = ownedBlueprints().find(item => item.nodeId === RATE_SKILL);
    expect(blueprint?.workedExampleSpec).toMatchObject({
      prompt: 'Determine the average rate of change of f(x) over the interval [-3, 3].',
      target: { rate: '-12' },
      rendererProps: {
        sourceType: 'table',
        data: {
          x: [-3, -2, -1, 0, 1, 2, 3],
          y: [48, 21, 0, -15, -24, -27, -24],
        },
        interval: { start: -3, end: 3 },
      },
    });
    expect(blueprint?.guidedPracticeSpec).toMatchObject({
      scaffoldedPrompt: 'Part A Use the graph to estimate the average rate of change of spending on sports footwear from 2005 to 2015. Then check your results algebraically.',
      rendererProps: {
        sourceType: 'graph',
        data: { points: [[0, 15.72], [10, 20.99]] },
        interval: { start: 0, end: 10 },
      },
    });
    expect(blueprint?.guidedPracticeSpec?.stepPrompts.length).toBeGreaterThan(0);
    expect(blueprint?.guidedPracticeSpec?.hints.length).toBeGreaterThan(0);
    expect(blueprint?.guidedPracticeSpec?.checksPerStep.length).toBeGreaterThan(0);
  });

  it('keeps the source-faithful equation-rate Worked blueprint after modality activation', () => {
    const expectedBlueprint: KnowledgeBlueprint = {
      nodeId: EQUATION_RATE_SKILL,
      sourceNodeIds: ['math.im3.example.1.1.004'],
      alignmentNodeIds: ['math.standard.ccss.hsf-if-b-6'],
      rendererKey: 'rate-of-change-calculator',
      rendererModeMap: { worked: 'rate-of-change-calculator' },
      workedExampleSpec: {
        prompt: 'Determine the average rate of change of f(x) = -x^2 + 2x - 1 over the interval [-4, 4].',
        givens: ['f(x) = -x^2 + 2x - 1', 'Interval: [-4, 4]'],
        target: { f_a: '-25', f_b: '-9', rate: '2' },
        rendererProps: {
          sourceType: 'function',
          data: { expression: 'f(x) = -x^2 + 2x - 1' },
          interval: { start: -4, end: 4 },
        },
        steps: [
          {
            description: 'Evaluate f(-4)',
            expression: 'f(-4) = -(-4)^2 + 2(-4) - 1',
            result: 'f(-4) = -25',
          },
          {
            description: 'Evaluate f(4)',
            expression: 'f(4) = -(4)^2 + 2(4) - 1',
            result: 'f(4) = -9',
          },
          {
            description: 'Apply the average rate of change formula',
            expression: '(f(4) - f(-4)) / (4 - (-4)) = (-9 - (-25)) / 8 = 16 / 8',
            result: '2',
          },
        ],
        explanation: 'The average rate of change is the change in the function values divided by the change in the x-values.',
      },
      reviewStatus: 'draft',
      metadata: { course: 'im3', module: '1', lesson: '1' },
    };
    const catalogs = [moduleBlueprints, rootBlueprints];

    for (const catalog of catalogs) {
      const matches = catalog.filter(blueprint => blueprint.nodeId === EQUATION_RATE_SKILL);
      expect(matches).toHaveLength(1);
      expect(matches[0]?.workedExampleSpec).toEqual(expectedBlueprint.workedExampleSpec);
      expect(knowledgeBlueprintSchema.safeParse(matches[0]).success).toBe(true);
      expect(matches[0]).not.toHaveProperty('misconceptionTags');
      const rendererProps = matches[0]?.workedExampleSpec?.rendererProps;
      expect(rateOfChangeCalculatorSchema.safeParse(rendererProps).success).toBe(true);
      expect(JSON.stringify(rendererProps)).not.toMatch(
        /"(correctAnswer|expectedAnswer|solutionSteps|gradingMetadata|partAnswers|isCorrect|score|maxScore)"/,
      );
    }

    expect(
      moduleBlueprints.find(blueprint => blueprint.nodeId === EQUATION_RATE_SKILL),
    ).toEqual(rootBlueprints.find(blueprint => blueprint.nodeId === EQUATION_RATE_SKILL));
    expect(moduleBlueprints.findIndex(blueprint => blueprint.nodeId === EQUATION_RATE_SKILL)).toBe(
      moduleBlueprints.findIndex(blueprint => blueprint.nodeId === RATE_SKILL) + 1,
    );
    expect(rootBlueprints.findIndex(blueprint => blueprint.nodeId === EQUATION_RATE_SKILL)).toBe(
      rootBlueprints.findIndex(blueprint => blueprint.nodeId === RATE_SKILL) + 1,
    );
  });

  it('activates the exact equation-rate Guided and Independent blueprint contract', () => {
    const generator = getGenerator('average-rate-of-change');
    const seed1 = generator.generate({ nodeId: EQUATION_RATE_SKILL, seed: 1, difficulty: 0.5 });
    const seed2 = generator.generate({ nodeId: EQUATION_RATE_SKILL, seed: 2, difficulty: 0.5 });
    const seed1RendererProps = (seed1.data as { rendererProps: unknown }).rendererProps;
    const seed2RendererProps = (seed2.data as { rendererProps: unknown }).rendererProps;
    const expectedWorkedExampleSpec = {
      prompt: 'Determine the average rate of change of f(x) = -x^2 + 2x - 1 over the interval [-4, 4].',
      givens: ['f(x) = -x^2 + 2x - 1', 'Interval: [-4, 4]'],
      target: { f_a: '-25', f_b: '-9', rate: '2' },
      rendererProps: {
        sourceType: 'function',
        data: { expression: 'f(x) = -x^2 + 2x - 1' },
        interval: { start: -4, end: 4 },
      },
      steps: [
        {
          description: 'Evaluate f(-4)',
          expression: 'f(-4) = -(-4)^2 + 2(-4) - 1',
          result: 'f(-4) = -25',
        },
        {
          description: 'Evaluate f(4)',
          expression: 'f(4) = -(4)^2 + 2(4) - 1',
          result: 'f(4) = -9',
        },
        {
          description: 'Apply the average rate of change formula',
          expression: '(f(4) - f(-4)) / (4 - (-4)) = (-9 - (-25)) / 8 = 16 / 8',
          result: '2',
        },
      ],
      explanation:
        'The average rate of change is the change in the function values divided by the change in the x-values.',
    };
    const expectedGuidedPracticeSpec = {
      scaffoldedPrompt:
        'Find the average rate of change of f(x) = x^2 - 3x - 4 on the interval [-4, -1].',
      stepPrompts: [
        'Evaluate f(-4) using the equation.',
        'Evaluate f(-1) using the equation.',
        'Set up the average-rate quotient using the two function values.',
        'Compute the average rate of change.',
      ],
      hints: [
        'Substitute -4 into the equation to find f(-4).',
        'Substitute -1 into the equation to find f(-1).',
        'Use (f(-1) - f(-4)) / (-1 - (-4)).',
        'Divide the change in function values by the change in x-values.',
      ],
      checksPerStep: [
        { check: 'f(-4) = 24.' },
        { check: 'f(-1) = 0.' },
        { check: '(0 - 24) / (-1 - (-4)) = -24 / 3 = -8.' },
        { check: 'The average rate of change is -8.' },
      ],
      revealPolicy: 'one_at_a_time',
      rendererProps: seed1RendererProps,
    };
    const expectedIndependentPracticeSpec = {
      variantParameters: {
        a: {
          type: 'enum',
          options: ['-2', '-1', '1', '2'],
          description: 'Leading coefficient for the quadratic.',
        },
        b: {
          type: 'integer',
          min: -4,
          max: 4,
          step: 1,
          description: 'Linear coefficient for the quadratic.',
        },
        c: {
          type: 'integer',
          min: -5,
          max: 5,
          step: 1,
          description: 'Constant term for the quadratic.',
        },
        intervalStart: {
          type: 'integer',
          min: -4,
          max: 0,
          step: 1,
          description: 'Starting x-value for the interval.',
        },
        intervalWidth: {
          type: 'integer',
          min: 2,
          max: 6,
          step: 1,
          description: 'Width of the interval.',
        },
      },
      answerSchema: {
        f_a: { type: 'number', description: 'Value of f at the interval start.' },
        f_b: { type: 'number', description: 'Value of f at the interval end.' },
        rate: { type: 'number', description: 'Average rate of change over the interval.' },
      },
      gradingRules: [
        { partId: 'f_a', ruleType: 'numeric_tolerance', tolerance: 0.01, maxScore: 2 },
        { partId: 'f_b', ruleType: 'numeric_tolerance', tolerance: 0.01, maxScore: 2 },
        { partId: 'rate', ruleType: 'numeric_tolerance', tolerance: 0.01, maxScore: 3 },
      ],
      replayPolicy: 'unique_seeds',
      rendererProps: seed2RendererProps,
    };
    const expectedGradingSpec = {
      partIds: ['f_a', 'f_b', 'rate'],
      passingScore: 7,
      partialCredit: true,
      rubric: [
        { criteria: 'Calculate f(a) at the interval start.', points: 2, partId: 'f_a' },
        { criteria: 'Calculate f(b) at the interval end.', points: 2, partId: 'f_b' },
        { criteria: 'Calculate the average rate of change.', points: 3, partId: 'rate' },
      ],
    };
    const moduleBlueprint = moduleBlueprints.find(item => item.nodeId === EQUATION_RATE_SKILL);
    const rootBlueprint = rootBlueprints.find(item => item.nodeId === EQUATION_RATE_SKILL);
    const targetBlueprints = [moduleBlueprint, rootBlueprint];

    expect(seed1.prompt).toBe(
      'Find the average rate of change of f(x) = x^2 - 3x - 4 on the interval [-4, -1].',
    );
    expect(seed1.expectedAnswer).toEqual({ f_a: 24, f_b: 0, rate: -8 });
    expect(seed1.gradingMetadata).toEqual({
      partAnswers: { f_a: 24, f_b: 0, rate: -8 },
      partMaxScores: { f_a: 2, f_b: 2, rate: 3 },
      partGradingRules: {
        f_a: 'numeric_tolerance',
        f_b: 'numeric_tolerance',
        rate: 'numeric_tolerance',
      },
      partTolerances: { f_a: 0.01, f_b: 0.01, rate: 0.01 },
    });
    expect(seed1RendererProps).toEqual({
      sourceType: 'function',
      data: { expression: 'f(x) = x^2 - 3x - 4' },
      interval: { start: -4, end: -1 },
    });
    expect(seed2.prompt).toBe(
      'Find the average rate of change of f(x) = -2x^2 + 2x - 2 on the interval [0, 4].',
    );
    expect(seed2.expectedAnswer).toEqual({ f_a: -2, f_b: -26, rate: -6 });
    expect(seed2.gradingMetadata).toEqual({
      partAnswers: { f_a: -2, f_b: -26, rate: -6 },
      partMaxScores: { f_a: 2, f_b: 2, rate: 3 },
      partGradingRules: {
        f_a: 'numeric_tolerance',
        f_b: 'numeric_tolerance',
        rate: 'numeric_tolerance',
      },
      partTolerances: { f_a: 0.01, f_b: 0.01, rate: 0.01 },
    });
    expect(seed2RendererProps).toEqual({
      sourceType: 'function',
      data: { expression: 'f(x) = -2x^2 + 2x - 2' },
      interval: { start: 0, end: 4 },
    });
    for (const catalog of [moduleBlueprints, rootBlueprints]) {
      expect(catalog.filter(item => item.nodeId === EQUATION_RATE_SKILL)).toHaveLength(1);
    }
    expect(targetBlueprints).toHaveLength(2);
    expect(moduleBlueprint).toBeDefined();
    expect(rootBlueprint).toEqual(moduleBlueprint);
    if (!moduleBlueprint) return;

    expect(moduleBlueprint.rendererModeMap).toEqual({
      worked: 'rate-of-change-calculator',
      guidedPractice: 'rate-of-change-calculator',
      independentPractice: 'rate-of-change-calculator',
    });
    expect(moduleBlueprint.generatorKey).toBe('average-rate-of-change');
    expect(moduleBlueprint.workedExampleSpec).toEqual(expectedWorkedExampleSpec);
    expect(moduleBlueprint.guidedPracticeSpec).toEqual(expectedGuidedPracticeSpec);
    expect(moduleBlueprint.independentPracticeSpec).toEqual(expectedIndependentPracticeSpec);
    expect(moduleBlueprint.gradingSpec).toEqual(expectedGradingSpec);
    expect(knowledgeBlueprintSchema.safeParse(moduleBlueprint).success).toBe(true);
    for (const rendererProps of [seed1RendererProps, seed2RendererProps]) {
      expect(rateOfChangeCalculatorSchema.safeParse(rendererProps).success).toBe(true);
      expect(JSON.stringify(rendererProps)).not.toMatch(
        /"(correctAnswer|expectedAnswer|solutionSteps|gradingMetadata|partAnswers|identifiedValues|finalAnswer|isCorrect|score|maxScore)"/,
      );
    }
  });

  it('stores the equation-rate Worked, Guided, and Independent activity rows in both projections', () => {
    const gradingConfig = {
      partIds: ['f_a', 'f_b', 'rate'],
      passingScore: 7,
      partialCredit: true,
      rubric: [
        { criteria: 'Calculate f(a) at the interval start.', points: 2, partId: 'f_a' },
        { criteria: 'Calculate f(b) at the interval end.', points: 2, partId: 'f_b' },
        { criteria: 'Calculate the average rate of change.', points: 3, partId: 'rate' },
      ],
    };
    const expectedRows = [
      {
        stableActivityId: `${EQUATION_RATE_SKILL}.worked_example`,
        nodeId: EQUATION_RATE_SKILL,
        sourceNodeIds: ['math.im3.example.1.1.004'],
        rendererKey: 'rate-of-change-calculator',
        mode: 'worked_example',
        alignmentNodeIds: ['math.standard.ccss.hsf-if-b-6'],
        props: {
          sourceType: 'function',
          data: { expression: 'f(x) = -x^2 + 2x - 1' },
          interval: { start: -4, end: 4 },
        },
        gradingConfig,
        srsEligible: false,
      },
      {
        stableActivityId: `${EQUATION_RATE_SKILL}.guided_practice`,
        nodeId: EQUATION_RATE_SKILL,
        sourceNodeIds: ['math.im3.example.1.1.004'],
        rendererKey: 'rate-of-change-calculator',
        mode: 'guided_practice',
        alignmentNodeIds: ['math.standard.ccss.hsf-if-b-6'],
        props: {
          sourceType: 'function',
          data: { expression: 'f(x) = x^2 - 3x - 4' },
          interval: { start: -4, end: -1 },
        },
        gradingConfig,
        srsEligible: true,
      },
      {
        stableActivityId: `${EQUATION_RATE_SKILL}.independent_practice`,
        nodeId: EQUATION_RATE_SKILL,
        sourceNodeIds: ['math.im3.example.1.1.004'],
        rendererKey: 'rate-of-change-calculator',
        mode: 'independent_practice',
        alignmentNodeIds: ['math.standard.ccss.hsf-if-b-6'],
        props: {
          sourceType: 'function',
          data: { expression: 'f(x) = -2x^2 + 2x - 2' },
          interval: { start: 0, end: 4 },
        },
        gradingConfig,
        srsEligible: true,
      },
    ];
    const moduleBlueprint = moduleBlueprints.find(blueprint => blueprint.nodeId === EQUATION_RATE_SKILL);
    const rootBlueprint = rootBlueprints.find(blueprint => blueprint.nodeId === EQUATION_RATE_SKILL);
    const freshRows = [
      projectActivityMap(lessonNodes(), lessonEdges(), moduleBlueprint ? [moduleBlueprint] : [])
        .filter(activity => activity.nodeId === EQUATION_RATE_SKILL),
      projectActivityMap(courseNodes(), courseEdges(), rootBlueprint ? [rootBlueprint] : [])
        .filter(activity => activity.nodeId === EQUATION_RATE_SKILL),
    ];
    const storedRows = [
      (moduleProjectionJson as { activities: typeof expectedRows }).activities
        .filter(activity => activity.nodeId === EQUATION_RATE_SKILL),
      (rootProjectionJson as { activities: typeof expectedRows }).activities
        .filter(activity => activity.nodeId === EQUATION_RATE_SKILL),
    ];

    for (const [index, rows] of freshRows.entries()) {
      expect(rows).toHaveLength(3);
      expect(rows).toEqual(expectedRows);
      expect(storedRows[index]).toHaveLength(3);
      expect(storedRows[index]).toEqual(rows);
      expect(storedRows[index]).toEqual(expectedRows);
      expect(storedRows[index].map(row => row.srsEligible)).toEqual([false, true, true]);
      expect(storedRows[index].map(row => row.stableActivityId)).toEqual(
        expectedRows.map(row => row.stableActivityId),
      );
      expect(storedRows[index].map(row => row.mode)).toEqual([
        'worked_example',
        'guided_practice',
        'independent_practice',
      ]);
      for (const row of storedRows[index]) {
        expect(rateOfChangeCalculatorSchema.safeParse(row.props).success).toBe(true);
        expect(JSON.stringify(row.props)).not.toMatch(
          /"(correctAnswer|expectedAnswer|solutionSteps|gradingMetadata|partAnswers|identifiedValues|finalAnswer|isCorrect|score|maxScore)"/,
        );
      }
      const activities = index === 0
        ? (moduleProjectionJson as { activities: typeof expectedRows }).activities
        : (rootProjectionJson as { activities: typeof expectedRows }).activities;
      const targetIndex = activities.findIndex(
        activity => activity.stableActivityId === expectedRows[0].stableActivityId,
      );
      expect(activities[targetIndex - 1]?.stableActivityId).toBe(
        `${PROFIT_MODEL_SKILL}.independent_practice`,
      );
      expect(activities.slice(
        targetIndex + expectedRows.length,
        targetIndex + expectedRows.length + 3,
      ).map(activity => activity.stableActivityId)).toEqual([
        `${COMPARE_MAXIMUMS_SKILL}.worked_example`,
        `${COMPARE_MAXIMUMS_SKILL}.guided_practice`,
        `${COMPARE_MAXIMUMS_SKILL}.independent_practice`,
      ]);
      expect(activities[targetIndex + expectedRows.length + 3]?.stableActivityId).toBe(
        `${RATE_SKILL}.worked_example`,
      );
    }
    expect(storedRows[0]).toEqual(storedRows[1]);
  });

  it('validates every supplied renderer prop against its existing component contract', () => {
    for (const blueprint of ownedBlueprints()) {
      const schema = getPropsSchema(blueprint.rendererKey);
      expect(schema).toBeDefined();

      for (const spec of [
        blueprint.workedExampleSpec,
        blueprint.guidedPracticeSpec,
        blueprint.independentPracticeSpec,
      ]) {
        if (spec?.rendererProps) {
          expect(schema?.safeParse(spec.rendererProps).success).toBe(true);
        }
      }
    }
  });

  it('restores the graph practice contract with Guided and Independent eligibility', () => {
    const blueprints = ownedBlueprints();
    const activities = projectActivityMap(lessonNodes(), [], blueprints);

    const graphBlueprint = blueprints.find(item => item.nodeId === GRAPH_SKILL);
    expect(graphBlueprint?.independentPracticeSpec).toEqual({
      variantParameters: {
        a: {
          type: 'enum',
          options: ['-1', '1'],
          description: 'Leading coefficient for the quadratic.',
        },
        b: {
          type: 'integer',
          min: -1,
          max: 1,
          step: 1,
          description: 'Linear coefficient for the quadratic.',
        },
        c: {
          type: 'integer',
          min: -2,
          max: 2,
          step: 1,
          description: 'Constant term for the quadratic.',
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
      },
      gradingRules: [
        { partId: 'table_values', ruleType: 'custom', maxScore: 1 },
        { partId: 'placed_points', ruleType: 'custom', maxScore: 1 },
      ],
      replayPolicy: 'unique_seeds',
      rendererProps: {
        equation: 'y = -x^2 - 1',
        variant: 'plot_from_equation',
        responseVariant: 'table_graph',
        domain: [-5, 5],
        range: [-10, 10],
      },
    });
    expect(graphBlueprint?.rendererModeMap).toEqual({
      worked: 'graphing-explorer',
      guidedPractice: 'graphing-explorer',
      independentPractice: 'graphing-explorer',
    });
    const graphActivities = activities.filter(
      item => item.nodeId === GRAPH_SKILL,
    );
    expect(graphActivities.map(activity => activity.mode)).toEqual([
      'worked_example',
      'guided_practice',
      'independent_practice',
    ]);
    expect(graphActivities).toHaveLength(3);
    expect(graphActivities.map(activity => activity.srsEligible)).toEqual([false, true, true]);
    expect(lessonNodes().find(node => node.id === GRAPH_SKILL)?.independentPracticeReady).toBe(true);
    expect(graphActivities[2]?.props).toEqual({
      equation: 'y = -x^2 - 1',
      variant: 'plot_from_equation',
      responseVariant: 'table_graph',
      domain: [-5, 5],
      range: [-10, 10],
    });
    expect(graphActivities[2]?.gradingConfig).toEqual({
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
    });
    for (const graphActivity of graphActivities) {
      expect(getPropsSchema(graphActivity.rendererKey)?.safeParse(graphActivity.props).success).toBe(true);
    }

    const rateBlueprint = blueprints.find(item => item.nodeId === RATE_SKILL);
    expect(rateBlueprint?.independentPracticeSpec).toBeUndefined();
    expect(rateBlueprint?.generatorKey).toBeUndefined();
    expect(rateBlueprint?.rendererModeMap.independentPractice).toBeUndefined();
    const rateNode = lessonNodes().find(node => node.id === RATE_SKILL);
    expect(rateNode?.generatorKey).toBeUndefined();
    expect(rateNode?.independentPracticeReady).toBeUndefined();
    const rateActivity = activities.find(
      item => item.nodeId === RATE_SKILL && item.mode === 'independent_practice',
    );
    expect(rateActivity).toBeUndefined();
  });
});
