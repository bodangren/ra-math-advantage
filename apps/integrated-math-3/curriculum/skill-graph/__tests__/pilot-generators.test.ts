import { describe, it, expect } from 'vitest';
import { getGenerator, GENERATOR_KEYS } from '@math-platform/math-content/knowledge-space';
import { fillInTheBlankSchema, graphingExplorerSchema } from '@math-platform/math-content';
import type { FillInTheBlankProps } from '@math-platform/math-content';
import type { GeneratorInput, GeneratorOutput } from '@math-platform/knowledge-space-practice';
import { validateGeneratorOutput, generatorOutputSchema } from '@math-platform/knowledge-space-practice';

const PILOT_GENERATORS = [
  { key: 'quadratic-graph-analysis', nodeId: 'math.im3.skill.1.1.graph-quadratic-functions' },
  { key: 'average-rate-of-change', nodeId: 'math.im3.skill.1.1.find-and-interpret-the-average-rate-of-change' },
  { key: 'solve-quadratic-by-graphing', nodeId: 'math.im3.skill.1.2.solve-quadratic-equations-by-graphing' },
] as const;

describe('Module 1 Generators', () => {
  for (const { key, nodeId } of PILOT_GENERATORS) {
    describe(`Generator: ${key}`, () => {
      it('produces deterministic output for seed=42', () => {
        const generator = getGenerator(key);
        const input: GeneratorInput = { nodeId, seed: 42, difficulty: 0.5 };
        const output1 = generator.generate(input);
        const output2 = generator.generate(input);
        expect(JSON.stringify(output1)).toBe(JSON.stringify(output2));
      });

      it('produces output with required GeneratorOutput fields', () => {
        const generator = getGenerator(key);
        const input: GeneratorInput = { nodeId, seed: 42, difficulty: 0.5 };
        const output: GeneratorOutput = generator.generate(input);
        expect(output).toHaveProperty('prompt');
        expect(output).toHaveProperty('data');
        expect(output).toHaveProperty('expectedAnswer');
        expect(output).toHaveProperty('solutionSteps');
        expect(output).toHaveProperty('gradingMetadata');
        expect(typeof output.prompt).toBe('string');
        expect(output.prompt.length).toBeGreaterThan(0);
        expect(output.solutionSteps.length).toBeGreaterThan(0);
      });

      it('validates against generatorOutputSchema', () => {
        const generator = getGenerator(key);
        const input: GeneratorInput = { nodeId, seed: 42, difficulty: 0.5 };
        const output = generator.generate(input);
        const result = validateGeneratorOutput(output, generatorOutputSchema);
        if (!result.valid) {
          console.error(`Generator ${key} validation errors:`, result.errors);
        }
        expect(result.valid).toBe(true);
      });

      it('grading metadata has consistent partIds', () => {
        const generator = getGenerator(key);
        const input: GeneratorInput = { nodeId, seed: 42, difficulty: 0.5 };
        const output = generator.generate(input);
        const gm = output.gradingMetadata;
        const answerKeys = Object.keys(gm.partAnswers);
        const scoreKeys = Object.keys(gm.partMaxScores);
        const ruleKeys = Object.keys(gm.partGradingRules);
        expect(answerKeys.sort()).toEqual(scoreKeys.sort());
        expect(answerKeys.sort()).toEqual(ruleKeys.sort());
      });

      it('different seeds produce different prompts', () => {
        const generator = getGenerator(key);
        const input1: GeneratorInput = { nodeId, seed: 1, difficulty: 0.5 };
        const input2: GeneratorInput = { nodeId, seed: 999, difficulty: 0.5 };
        const output1 = generator.generate(input1);
        const output2 = generator.generate(input2);
        expect(output1.prompt).not.toBe(output2.prompt);
      });
    });
  }

  it('all pilot generator keys are registered', () => {
    for (const { key } of PILOT_GENERATORS) {
      expect(GENERATOR_KEYS).toContain(key);
    }
  });
});

const PROFIT_NODE_ID = 'math.im3.skill.1.1.build-and-simplify-a-quadratic-profit-model-from-context';
const MAXIMUM_PROFIT_NODE_ID = 'math.im3.skill.1.1.find-and-interpret-the-maximum-of-a-quadratic-profit-model';
const PROFIT_GENERATOR_KEY = 'quadratic-profit-model';

type ProfitData = {
  priceIncrease: number;
  salesDecrease: number;
  priceFactor: number;
  optimalIncreases: number;
  basePrice: number;
  baseSales: number;
  priceExpression: string;
  salesExpression: string;
  profitExpression: string;
  coefficients: { a: number; b: number; c: number };
  rendererProps: FillInTheBlankProps;
};

function generateProfit(seed: number): GeneratorOutput {
  return getGenerator(PROFIT_GENERATOR_KEY).generate({
    nodeId: PROFIT_NODE_ID,
    seed,
    difficulty: 0.5,
  });
}

function generateMaximumProfit(seed: number): GeneratorOutput {
  return getGenerator(PROFIT_GENERATOR_KEY).generate({
    nodeId: MAXIMUM_PROFIT_NODE_ID,
    seed,
    difficulty: 0.5,
  });
}

function profitData(output: GeneratorOutput): ProfitData {
  return output.data as unknown as ProfitData;
}

describe('quadratic-profit-model generator', () => {
  it('is registered for the Example 3 skill', () => {
    const generator = getGenerator(PROFIT_GENERATOR_KEY);

    expect(generator.nodeIds).toEqual([PROFIT_NODE_ID, MAXIMUM_PROFIT_NODE_ID]);
  });

  it('returns valid GeneratorOutput and fill-in-the-blank props', () => {
    const output = generateProfit(0);
    const data = profitData(output);

    expect(generatorOutputSchema.safeParse(output).success).toBe(true);
    expect(fillInTheBlankSchema.safeParse(data.rendererProps).success).toBe(true);
    expect(output.solutionSteps).toHaveLength(6);
    expect(Object.values(output.gradingMetadata.partGradingRules)).toEqual(
      Array(7).fill('exact_match'),
    );
  });

  it('reproduces the authored ski-pass values for seed 0', () => {
    const output = generateProfit(0);
    const data = profitData(output);

    expect(data).toMatchObject({
      priceIncrease: 5,
      salesDecrease: 20,
      priceFactor: 24,
      optimalIncreases: 5,
      basePrice: 120,
      baseSales: 680,
      coefficients: { a: -100, b: 1000, c: 81600 },
    });
    expect(output.prompt).toContain('ski resort');
    expect(output.prompt).toContain('680 passes');
    expect(output.prompt).toContain('$120');
    expect(output.prompt).toContain('$5');
    expect(output.prompt).toContain('20 fewer passes');
    expect(output.expectedAnswer).toEqual({
      priceBase: '120',
      priceStep: '5',
      salesBase: '680',
      salesLoss: '20',
      coefficientA: '-100',
      coefficientB: '1000',
      coefficientC: '81600',
    });
  });

  it('is deterministic for the same seed and varies across seeds', () => {
    expect(JSON.stringify(generateProfit(7))).toBe(JSON.stringify(generateProfit(7)));
    expect(JSON.stringify(generateProfit(7))).not.toBe(JSON.stringify(generateProfit(8)));
  });

  it('uses the named blank IDs as the answer and grading keys', () => {
    const output = generateProfit(0);
    const props = profitData(output).rendererProps;
    const blankIds = props.blanks.map(blank => blank.id);
    const templateIds = [...props.template.matchAll(/\{\{blank:(\w+)\}\}/g)].map(
      match => match[1],
    );
    const expectedKeys = [
      'priceBase',
      'priceStep',
      'salesBase',
      'salesLoss',
      'coefficientA',
      'coefficientB',
      'coefficientC',
    ];

    expect(blankIds).toEqual(expectedKeys);
    expect(new Set(blankIds).size).toBe(blankIds.length);
    expect(new Set(templateIds).size).toBe(templateIds.length);
    expect(templateIds.sort()).toEqual([...blankIds].sort());
    expect(props.blanks.every(blank => typeof blank.correctAnswer === 'string')).toBe(true);
    expect(Object.keys(output.expectedAnswer).sort()).toEqual(expectedKeys.sort());
    expect(Object.keys(output.gradingMetadata.partAnswers).sort()).toEqual(expectedKeys.sort());
    expect(Object.keys(output.gradingMetadata.partMaxScores).sort()).toEqual(expectedKeys.sort());
    expect(Object.keys(output.gradingMetadata.partGradingRules).sort()).toEqual(expectedKeys.sort());
    expect(output.gradingMetadata.partAnswers).toEqual(output.expectedAnswer);
  });

  it('keeps generated answers out of the student-facing prompt', () => {
    const output = generateProfit(0);
    const data = profitData(output);

    expect(output.prompt).not.toContain(data.priceExpression);
    expect(output.prompt).not.toContain(data.salesExpression);
    expect(output.prompt).not.toContain(data.profitExpression);
    expect(output.prompt).not.toMatch(/\ba\s*=|\bb\s*=|\bc\s*=/);
  });

  it('starts renderer instructions with the generated source givens', () => {
    const data = profitData(generateProfit(0));
    const template = data.rendererProps.template;

    expect(template.startsWith(`A ski resort sells ${data.baseSales} passes at a base price of $${data.basePrice}.`)).toBe(true);
    expect(template).toContain(`$${data.priceIncrease}`);
    expect(template).toContain(`${data.salesDecrease} fewer passes`);
    expect(template).toContain('Let x be the number of price increases.');
  });

  it('generates the exact maximum-profit contract for seed 0', () => {
    const output = generateMaximumProfit(0);
    const data = profitData(output);
    const maximumAnswerKeys = [
      'optimalIncreases',
      'optimalPrice',
      'maximumProfit',
    ];
    const maximumRendererProps = data.rendererProps;
    const templateIds = [...maximumRendererProps.template.matchAll(/\{\{blank:(\w+)\}\}/g)].map(
      match => match[1],
    );

    expect(output.expectedAnswer).toEqual({
      optimalIncreases: '5',
      optimalPrice: '145',
      maximumProfit: '84100',
    });
    expect(output.gradingMetadata?.partAnswers).toEqual(output.expectedAnswer);
    expect(Object.keys(output.expectedAnswer)).toEqual([
      'optimalIncreases',
      'optimalPrice',
      'maximumProfit',
    ]);
    expect(output.prompt).toContain('P(x) = -100x^2 + 1000x + 81600');
    expect(output.prompt).not.toContain('P(x) = (');
    expect(output.solutionSteps).toEqual([
      {
        description: 'Find the axis of symmetry.',
        expression: 'x = -b/(2a) = -1000/(2(-100)) = 5',
        value: 5,
      },
      {
        description: 'Interpret the maximizing input as the price per pass.',
        expression: '120 + 5(5) = 145 dollars per pass',
        value: 145,
      },
      {
        description: 'Evaluate P(x) at the maximum.',
        expression: 'P(5) = -100(5)^2 + 1000(5) + 81600 = 84100 dollars',
        value: 84100,
      },
    ]);
    expect(fillInTheBlankSchema.safeParse(maximumRendererProps).success).toBe(true);
    expect(maximumRendererProps.template).toContain(
      `A ski resort sells ${data.baseSales} passes at a base price of $${data.basePrice}.`,
    );
    expect(maximumRendererProps.template).toContain(
      `P(x) = ${data.coefficients.a}x^2 + ${data.coefficients.b}x + ${data.coefficients.c}`,
    );
    expect(maximumRendererProps.template).toContain('Let x be the number of price increases.');
    expect(maximumRendererProps.template).not.toMatch(/domain|range/i);
    expect(maximumRendererProps.template).not.toContain('expand');
    expect(templateIds).toEqual(maximumAnswerKeys);
    expect(maximumRendererProps.blanks).toEqual(maximumAnswerKeys.map((id) => ({
      id,
      correctAnswer: output.expectedAnswer[id],
      isMath: true,
    })));
    expect(JSON.stringify(output)).not.toMatch(/domain|range/i);
  });

  it('keeps maximum-profit output deterministic across repeated seeds', () => {
    expect(generateMaximumProfit(7)).toEqual(generateMaximumProfit(7));
    expect(Object.keys(generateMaximumProfit(7).expectedAnswer)).toEqual([
      'optimalIncreases',
      'optimalPrice',
      'maximumProfit',
    ]);
  });

  it('preserves the coefficient identities across twenty seeds', () => {
    for (let seed = 0; seed < 20; seed += 1) {
      const data = profitData(generateProfit(seed));
      const { priceIncrease, salesDecrease, priceFactor, optimalIncreases } = data;

      expect(data.basePrice).toBe(priceIncrease * priceFactor);
      expect(data.baseSales).toBe(
        salesDecrease * (priceFactor + 2 * optimalIncreases),
      );
      expect(data.coefficients.a).toBe(-priceIncrease * salesDecrease);
      expect(data.coefficients.b).toBe(
        priceIncrease * data.baseSales - data.basePrice * salesDecrease,
      );
      expect(data.coefficients.c).toBe(data.basePrice * data.baseSales);
    }
  });
});

const GRAPH_QUADRATIC_NODE_ID = 'math.im3.skill.1.1.graph-quadratic-functions';
const DOMAIN_RANGE_NODE_ID = 'math.im3.skill.1.1.state-the-domain-and-range-of-a-quadratic-from-its-graph';
const GRAPH_QUADRATIC_GENERATOR_KEY = 'quadratic-graph-analysis';
const MAXIMUM_READING_NODE_ID = 'math.im3.skill.1.1.identify-a-quadratic-maximum-from-its-graph';
const SYMMETRY_NODE_ID = 'math.im3.skill.1.1.graph-a-quadratic-from-a-vertex-and-y-intercept-using-symmetry';
const GRAPH_X_VALUES = [-2, -1, 0, 1, 2];

type GraphQuadraticData = {
  a: -1 | 1;
  b: -1 | 0 | 1;
  c: -2 | -1 | 0 | 1 | 2;
  tableValues: Array<{ x: number; y: number }>;
  rendererProps: {
    equation: string;
    variant: 'plot_from_equation';
    responseVariant: 'table_graph';
    domain: [number, number];
    range: [number, number];
  };
};

function generateGraphQuadratic(seed: number): GeneratorOutput {
  return getGenerator(GRAPH_QUADRATIC_GENERATOR_KEY).generate({
    nodeId: GRAPH_QUADRATIC_NODE_ID,
    seed,
    difficulty: 0.5,
  });
}

function graphQuadraticData(output: GeneratorOutput): GraphQuadraticData {
  return output.data as unknown as GraphQuadraticData;
}

type DomainRangeData = {
  a: -1 | 1;
  b: -1 | 0 | 1;
  c: -2 | -1 | 0 | 1 | 2;
  rendererProps: {
    equation: string;
    variant: 'plot_from_equation';
    responseVariant: 'domain_range';
    domain: [number, number];
    range: [number, number];
  };
};

function generateDomainRange(seed: number): GeneratorOutput {
  return getGenerator(GRAPH_QUADRATIC_GENERATOR_KEY).generate({
    nodeId: DOMAIN_RANGE_NODE_ID,
    seed,
    difficulty: 0.5,
  });
}

function domainRangeData(output: GeneratorOutput): DomainRangeData {
  return output.data as unknown as DomainRangeData;
}

describe('quadratic-graph-analysis table-and-graph generator contract', () => {
  it('keeps the existing graph node on its table-and-graph contract', () => {
    const output = generateGraphQuadratic(42);
    const data = graphQuadraticData(output);

    expect(data.rendererProps.responseVariant).toBe('table_graph');
    expect(Object.keys(output.expectedAnswer)).toEqual(['table_values', 'placed_points']);
    expect(Object.keys(output.gradingMetadata.partAnswers)).toEqual(['table_values', 'placed_points']);
    expect(output.gradingMetadata.partMaxScores).toEqual({ table_values: 1, placed_points: 1 });
  });

  it('retains the supported quadratic graph nodes on the existing generator', () => {
    expect(getGenerator(GRAPH_QUADRATIC_GENERATOR_KEY).nodeIds).toEqual(expect.arrayContaining([
      GRAPH_QUADRATIC_NODE_ID,
      DOMAIN_RANGE_NODE_ID,
      MAXIMUM_READING_NODE_ID,
      SYMMETRY_NODE_ID,
    ]));
  });

  it('is deterministic for the same seed', () => {
    expect(generateGraphQuadratic(42)).toEqual(generateGraphQuadratic(42));
  });

  it('returns renderer props accepted by the graphing explorer schema', () => {
    const data = graphQuadraticData(generateGraphQuadratic(0));

    expect(graphingExplorerSchema.safeParse(data.rendererProps).success).toBe(true);
    expect(Object.keys(data.rendererProps)).toEqual([
      'equation',
      'variant',
      'responseVariant',
      'domain',
      'range',
    ]);
  });

  it('formats clean equations and varies them across seeds', () => {
    const equations = Array.from({ length: 32 }, (_, seed) => (
      graphQuadraticData(generateGraphQuadratic(seed)).rendererProps.equation
    ));

    expect(new Set(equations).size).toBeGreaterThan(1);
    for (const equation of equations) {
      expect(equation).toMatch(/^y = -?x\^2(?: [+-] x)?(?: [+-] [12])?$/);
      expect(equation).not.toContain('1x');
      expect(equation).not.toContain('+ -');
      expect(equation).not.toContain('0x');
      expect(equation).not.toMatch(/ [+-] 0$/);
    }
  });

  it('computes exact table arithmetic and expected grading parts', () => {
    const output = generateGraphQuadratic(7);
    const data = graphQuadraticData(output);
    const expectedTable = GRAPH_X_VALUES.map((x) => ({
      x,
      y: data.a * x * x + data.b * x + data.c,
    }));

    expect([-1, 1]).toContain(data.a);
    expect([-1, 0, 1]).toContain(data.b);
    expect([-2, -1, 0, 1, 2]).toContain(data.c);
    expect(data.tableValues).toEqual(expectedTable);
    expect(output.expectedAnswer).toEqual({
      table_values: expectedTable,
      placed_points: expectedTable,
    });
    expect(output.gradingMetadata).toEqual({
      partAnswers: { table_values: expectedTable, placed_points: expectedTable },
      partMaxScores: { table_values: 1, placed_points: 1 },
      partGradingRules: { table_values: 'custom', placed_points: 'custom' },
    });
  });

  it('keeps answer authority out of renderer props and keeps points in bounds', () => {
    for (let seed = 0; seed < 32; seed += 1) {
      const data = graphQuadraticData(generateGraphQuadratic(seed));

      expect(Object.keys(data.rendererProps).some((key) => (
        /answer|grading|solution|correct/i.test(key)
      ))).toBe(false);
      expect(data.rendererProps).toMatchObject({
        variant: 'plot_from_equation',
        responseVariant: 'table_graph',
        domain: [-5, 5],
        range: [-10, 10],
      });
      for (const point of data.tableValues) {
        expect(point.x).toBeGreaterThanOrEqual(-5);
        expect(point.x).toBeLessThanOrEqual(5);
        expect(point.y).toBeGreaterThanOrEqual(-10);
        expect(point.y).toBeLessThanOrEqual(10);
      }
    }
  });
});

describe('quadratic-graph-analysis domain-and-range generator contract', () => {
  it('returns schema-valid renderer props and exact domain/range parts', () => {
    const output = generateDomainRange(1);
    const data = domainRangeData(output);

    expect(generatorOutputSchema.safeParse(output).success).toBe(true);
    expect(graphingExplorerSchema.safeParse(data.rendererProps).success).toBe(true);
    expect(data.rendererProps).toEqual({
      equation: data.rendererProps.equation,
      variant: 'plot_from_equation',
      responseVariant: 'domain_range',
      domain: [-5, 5],
      range: [-10, 10],
    });
    expect(output.prompt).toContain('displayed quadratic graph');
    expect(Object.keys(output.expectedAnswer)).toEqual(['domain', 'range']);
    expect(output.expectedAnswer).toEqual({
      domain: 'all_real_numbers',
      range: {
        relation: data.a > 0 ? 'gte' : 'lte',
        boundary: data.c - data.b ** 2 / (4 * data.a),
      },
    });
    expect(output.gradingMetadata).toEqual({
      partAnswers: output.expectedAnswer,
      partMaxScores: { domain: 1, range: 1 },
      partGradingRules: { domain: 'exact_match', range: 'custom' },
    });
    expect(Object.keys(data.rendererProps).some((key) => /answer|grading|solution|correct/i.test(key))).toBe(false);
  });

  it('is deterministic for a seed and varies across seeds', () => {
    expect(generateDomainRange(7)).toEqual(generateDomainRange(7));
    const equations = Array.from({ length: 32 }, (_, seed) => (
      domainRangeData(generateDomainRange(seed)).rendererProps.equation
    ));
    expect(new Set(equations).size).toBeGreaterThan(1);
  });

  it('uses the exact vertex boundary and a valid relation for varied quadratics', () => {
    const relations = new Set<string>();
    const boundaries: number[] = [];

    for (let seed = 0; seed < 32; seed += 1) {
      const output = generateDomainRange(seed);
      const data = domainRangeData(output);
      const answer = output.expectedAnswer as {
        domain: string;
        range: { relation: 'gte' | 'lte'; boundary: number };
      };
      const vertexY = data.c - data.b ** 2 / (4 * data.a);

      expect(answer.domain).toBe('all_real_numbers');
      expect(answer.range.boundary).toBe(vertexY);
      expect(answer.range.boundary).toBeGreaterThanOrEqual(data.rendererProps.range[0]);
      expect(answer.range.boundary).toBeLessThanOrEqual(data.rendererProps.range[1]);
      expect(data.rendererProps.domain).toEqual([-5, 5]);
      expect(data.rendererProps.range).toEqual([-10, 10]);
      relations.add(answer.range.relation);
      boundaries.push(answer.range.boundary);
    }

    expect(relations).toEqual(new Set(['gte', 'lte']));
    expect(boundaries.some((boundary) => !Number.isInteger(boundary))).toBe(true);
  });
});
