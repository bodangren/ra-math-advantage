import type {
  GeneratorInput,
  GeneratorOutput,
  GradingMetadata,
} from '@math-platform/knowledge-space-practice';

export interface IM1GeneratorEntry {
  skillIdKey: string;
  nodeIds: string[];
  generate: (input: GeneratorInput) => GeneratorOutput;
}

/**
 * Create a seeded pseudo-random number generator.
 * @param seed - Integer seed value
 * @returns Function that returns the next random number in [0, 1)
 */
function seededRandom(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

const verbalToNumerical: IM1GeneratorEntry = {
  skillIdKey: '1-1-verbal-to-numerical',
  nodeIds: [
    'math.im1.skill.1.1.translate-verbal-descriptions-into-correct-numerical-express',
  ],
  generate: (input: GeneratorInput): GeneratorOutput => {
    const rand = seededRandom(input.seed);
    const pick = <T>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];
    const ri = (min: number, max: number) =>
      Math.floor(rand() * (max - min + 1)) + min;

    const a = ri(2, 20);
    const b = ri(2, 20);
    const c = ri(2, 15);
    const d = ri(2, 15);

    type Template = {
      verbal: string;
      expression: string;
      value: number;
      steps: Array<{ description: string; expression: string; value: number }>;
    };
    const templates: Template[] = [
      {
        verbal: `the sum of ${a} and ${b}`,
        expression: `${a} + ${b}`,
        value: a + b,
        steps: [
          { description: 'Identify the operation', expression: `"sum" means addition`, value: a + b },
          { description: 'Write the expression', expression: `${a} + ${b}`, value: a + b },
          { description: 'Evaluate', expression: `${a} + ${b} = ${a + b}`, value: a + b },
        ],
      },
      {
        verbal: `the difference of ${a + b} and ${b}`,
        expression: `${a + b} - ${b}`,
        value: a,
        steps: [
          { description: 'Identify the operation', expression: `"difference" means subtraction`, value: a },
          { description: 'Write the expression', expression: `${a + b} - ${b}`, value: a },
          { description: 'Evaluate', expression: `${a + b} - ${b} = ${a}`, value: a },
        ],
      },
      {
        verbal: `the product of ${a} and ${b}`,
        expression: `${a} * ${b}`,
        value: a * b,
        steps: [
          { description: 'Identify the operation', expression: `"product" means multiplication`, value: a * b },
          { description: 'Write the expression', expression: `${a} × ${b}`, value: a * b },
          { description: 'Evaluate', expression: `${a} × ${b} = ${a * b}`, value: a * b },
        ],
      },
      {
        verbal: `the quotient of ${a * b} and ${b}`,
        expression: `${a * b} / ${b}`,
        value: a,
        steps: [
          { description: 'Identify the operation', expression: `"quotient" means division`, value: a },
          { description: 'Write the expression', expression: `${a * b} ÷ ${b}`, value: a },
          { description: 'Evaluate', expression: `${a * b} ÷ ${b} = ${a}`, value: a },
        ],
      },
      {
        verbal: `the sum of ${a} and the product of ${b} and ${c}`,
        expression: `${a} + ${b} * ${c}`,
        value: a + b * c,
        steps: [
          { description: 'Identify the operations', expression: `"sum" (addition) and "product" (multiplication)`, value: a + b * c },
          { description: 'Write the inner product', expression: `${b} × ${c} = ${b * c}`, value: b * c },
          { description: 'Write the full expression', expression: `${a} + ${b * c}`, value: a + b * c },
          { description: 'Evaluate', expression: `${a} + ${b * c} = ${a + b * c}`, value: a + b * c },
        ],
      },
      {
        verbal: `the product of ${a} and the difference between ${b + c} and ${c}`,
        expression: `${a} * (${b + c} - ${c})`,
        value: a * b,
        steps: [
          { description: 'Identify the operations', expression: `"product" (multiplication) and "difference" (subtraction)`, value: a * b },
          { description: 'Write the inner difference', expression: `${b + c} - ${c} = ${b}`, value: b },
          { description: 'Write the full expression', expression: `${a} × ${b}`, value: a * b },
          { description: 'Evaluate', expression: `${a} × ${b} = ${a * b}`, value: a * b },
        ],
      },
      {
        verbal: `the sum of ${a} and ${b}, divided by ${c}`,
        expression: `(${a} + ${b}) / ${c}`,
        value: Math.round(((a + b) / c) * 100) / 100,
        steps: [
          { description: 'Identify the operations', expression: `"sum" then "divided by"`, value: Math.round(((a + b) / c) * 100) / 100 },
          { description: 'Write the sum', expression: `${a} + ${b} = ${a + b}`, value: a + b },
          { description: 'Write the full expression', expression: `(${a + b}) ÷ ${c}`, value: Math.round(((a + b) / c) * 100) / 100 },
          { description: 'Evaluate', expression: `${a + b} ÷ ${c} = ${Math.round(((a + b) / c) * 100) / 100}`, value: Math.round(((a + b) / c) * 100) / 100 },
        ],
      },
      {
        verbal: `the difference between the product of ${a} and ${b} and ${d}`,
        expression: `${a} * ${b} - ${d}`,
        value: a * b - d,
        steps: [
          { description: 'Identify the operations', expression: `"product" (multiplication) then "difference" (subtraction)`, value: a * b - d },
          { description: 'Write the inner product', expression: `${a} × ${b} = ${a * b}`, value: a * b },
          { description: 'Write the full expression', expression: `${a * b} - ${d}`, value: a * b - d },
          { description: 'Evaluate', expression: `${a * b} - ${d} = ${a * b - d}`, value: a * b - d },
        ],
      },
    ];

    const t = pick(templates);
    const gradingMetadata: GradingMetadata = {
      partAnswers: { result: t.value },
      partMaxScores: { result: 5 },
      partGradingRules: { result: 'exact_match' },
    };
    return {
      prompt: `Write a numerical expression for: ${t.verbal}. Then evaluate it.`,
      data: { verbal: t.verbal, expression: t.expression, seed: input.seed },
      expectedAnswer: { result: t.value },
      solutionSteps: t.steps,
      gradingMetadata,
    };
  },
};

const algebraicVerbalTranslation: IM1GeneratorEntry = {
  skillIdKey: '1-2-algebraic-verbal-translation',
  nodeIds: [
    'math.im1.skill.1.2.translate-between-algebraic-expressions-and-verbal-expressio',
  ],
  generate: (input: GeneratorInput): GeneratorOutput => {
    const rand = seededRandom(input.seed);
    const pick = <T>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];
    const ri = (min: number, max: number) =>
      Math.floor(rand() * (max - min + 1)) + min;

    const a = ri(2, 12);
    const b = ri(2, 12);
    const c = ri(1, 10);
    const vars = ['x', 'y', 'n', 't'];
    const v = pick(vars);
    const opWord = pick(['sum', 'difference', 'product', 'quotient']);

    let expression: string;
    let verbal: string;
    let value: number;
    let steps: Array<{ description: string; expression: string; value: number }>;

    switch (opWord) {
      case 'sum':
        expression = `${a}${v} + ${b}`;
        verbal = `the sum of ${a} times ${v} and ${b}`;
        value = a * c + b;
        steps = [
          { description: 'Identify the variable expression', expression: `${a}${v} represents "${a} times ${v}"`, value: a * c },
          { description: 'Identify the constant', expression: `${b} is added`, value: b },
          { description: 'Write the algebraic expression', expression: `${a}${v} + ${b}`, value: a * c + b },
          { description: `Evaluate for ${v} = ${c}`, expression: `${a}(${c}) + ${b} = ${a * c + b}`, value: a * c + b },
        ];
        break;
      case 'difference':
        expression = `${a * c + b} - ${b}`;
        verbal = `the difference of ${a * c + b} and ${b}`;
        value = a * c;
        steps = [
          { description: 'Identify the operation', expression: `"difference" means subtraction`, value: a * c },
          { description: 'Write the expression', expression: `${a * c + b} - ${b}`, value: a * c },
          { description: 'Evaluate', expression: `${a * c + b} - ${b} = ${a * c}`, value: a * c },
        ];
        break;
      case 'product':
        expression = `${a} * (${v} + ${c})`;
        verbal = `the product of ${a} and the sum of ${v} and ${c}`;
        value = a * (c + c);
        steps = [
          { description: 'Identify the inner sum', expression: `${v} + ${c}`, value: c + c },
          { description: 'Identify the multiplication', expression: `${a} times the sum`, value: a * (c + c) },
          { description: 'Write the algebraic expression', expression: `${a}(${v} + ${c})`, value: a * (c + c) },
          { description: `Evaluate for ${v} = ${c}`, expression: `${a}(${c} + ${c}) = ${a * (c + c)}`, value: a * (c + c) },
        ];
        break;
      default: {
        const dividend = a * b;
        expression = `${dividend} / ${b}`;
        verbal = `the quotient of ${dividend} and ${b}`;
        value = a;
        steps = [
          { description: 'Identify the operation', expression: `"quotient" means division`, value: a },
          { description: 'Write the expression', expression: `${dividend} ÷ ${b}`, value: a },
          { description: 'Evaluate', expression: `${dividend} ÷ ${b} = ${a}`, value: a },
        ];
        break;
      }
    }

    const gradingMetadata: GradingMetadata = {
      partAnswers: { verbal, expression, result: value },
      partMaxScores: { verbal: 2, expression: 2, result: 1 },
      partGradingRules: { verbal: 'exact_match', expression: 'exact_match', result: 'numeric_tolerance' },
      partTolerances: { result: 0.01 },
    };
    return {
      prompt: `Translate between the algebraic expression and verbal description.\nExpression: ${expression}\nWrite the verbal description.`,
      data: { expression, verbal, variable: v, seed: input.seed },
      expectedAnswer: { verbal, expression, result: value },
      solutionSteps: steps,
      gradingMetadata,
    };
  },
};

const propertiesOfEquality: IM1GeneratorEntry = {
  skillIdKey: '1-3-properties-of-equality',
  nodeIds: [
    'math.im1.skill.1.3.identify-and-apply-the-reflexive-symmetric-and-transitive-pr',
  ],
  generate: (input: GeneratorInput): GeneratorOutput => {
    const rand = seededRandom(input.seed);
    const pick = <T>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];
    const ri = (min: number, max: number) =>
      Math.floor(rand() * (max - min + 1)) + min;

    const x = ri(1, 20);
    const y = ri(1, 20);
    const z = ri(1, 20);

    type PropTemplate = {
      scenario: string;
      property: string;
      explanation: string;
      expression: string;
    };
    const templates: PropTemplate[] = [
      {
        scenario: `If ${x} = ${x}, then ___`,
        property: 'Reflexive Property of Equality',
        explanation: `The Reflexive Property states that any quantity is equal to itself: a = a.`,
        expression: `${x} = ${x}`,
      },
      {
        scenario: `If a = b, then b = a. This is the ___`,
        property: 'Symmetric Property of Equality',
        explanation: `The Symmetric Property states that if a = b, then b = a.`,
        expression: `a = b → b = a`,
      },
      {
        scenario: `If a = b and b = c, then a = c. This is the ___`,
        property: 'Transitive Property of Equality',
        explanation: `The Transitive Property states that if a = b and b = c, then a = c.`,
        expression: `a = b ∧ b = c → a = c`,
      },
      {
        scenario: `Given ${x} + ${y} = ${x + y}. By which property can we say ${x + y} = ${x} + ${y}?`,
        property: 'Symmetric Property of Equality',
        explanation: `Since ${x} + ${y} = ${x + y}, by the Symmetric Property, ${x + y} = ${x} + ${y}.`,
        expression: `${x} + ${y} = ${x + y} → ${x + y} = ${x} + ${y}`,
      },
      {
        scenario: `If ${x} = ${x} and ${x} = ${y}, then ${x} = ${y}. Which property justifies this?`,
        property: 'Transitive Property of Equality',
        explanation: `Since ${x} = ${x} (reflexive) and ${x} = ${y} (given), by the Transitive Property, ${x} = ${y}.`,
        expression: `${x} = ${x} ∧ ${x} = ${y} → ${x} = ${y}`,
      },
      {
        scenario: `Which property states that ${z} = ${z}?`,
        property: 'Reflexive Property of Equality',
        explanation: `The Reflexive Property states any quantity equals itself. ${z} = ${z} is always true.`,
        expression: `${z} = ${z}`,
      },
    ];

    const t = pick(templates);
    const gradingMetadata: GradingMetadata = {
      partAnswers: { property: t.property },
      partMaxScores: { property: 5 },
      partGradingRules: { property: 'exact_match' },
    };
    return {
      prompt: `Identify the property of equality.\n${t.scenario}`,
      data: { scenario: t.scenario, property: t.property, seed: input.seed },
      expectedAnswer: { property: t.property },
      solutionSteps: [
        { description: 'Recall the properties of equality', expression: 'Reflexive: a = a; Symmetric: a = b → b = a; Transitive: a = b ∧ b = c → a = c', value: t.property },
        { description: 'Match the scenario', expression: t.expression, value: t.property },
        { description: 'Answer', expression: t.explanation, value: t.property },
      ],
      gradingMetadata,
    };
  },
};

const distributiveProperty: IM1GeneratorEntry = {
  skillIdKey: '1-4-distributive-property',
  nodeIds: [
    'math.im1.skill.1.4.apply-the-distributive-property-to-rewrite-and-evaluate-nume',
  ],
  generate: (input: GeneratorInput): GeneratorOutput => {
    const rand = seededRandom(input.seed);
    const pick = <T>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];
    const ri = (min: number, max: number) =>
      Math.floor(rand() * (max - min + 1)) + min;

    const a = ri(2, 9);
    const b = ri(2, 9);
    const c = ri(2, 9);

    type DistTemplate = {
      prompt: string;
      rewritten: string;
      value: number;
      steps: Array<{ description: string; expression: string; value: number }>;
    };
    const templates: DistTemplate[] = [
      {
        prompt: `Apply the distributive property to rewrite and evaluate: ${a} × (${b} + ${c})`,
        rewritten: `${a}×${b} + ${a}×${c}`,
        value: a * b + a * c,
        steps: [
          { description: 'Identify the distributive property pattern', expression: `a × (b + c) = a×b + a×c`, value: a * b + a * c },
          { description: 'Distribute the factor', expression: `${a} × ${b} + ${a} × ${c}`, value: a * b + a * c },
          { description: 'Evaluate each term', expression: `${a * b} + ${a * c}`, value: a * b + a * c },
          { description: 'Simplify', expression: `${a * b} + ${a * c} = ${a * b + a * c}`, value: a * b + a * c },
        ],
      },
      {
        prompt: `Apply the distributive property to rewrite and evaluate: ${a} × (${b} - ${c})`,
        rewritten: `${a}×${b} - ${a}×${c}`,
        value: a * b - a * c,
        steps: [
          { description: 'Identify the distributive property pattern', expression: `a × (b - c) = a×b - a×c`, value: a * b - a * c },
          { description: 'Distribute the factor', expression: `${a} × ${b} - ${a} × ${c}`, value: a * b - a * c },
          { description: 'Evaluate each term', expression: `${a * b} - ${a * c}`, value: a * b - a * c },
          { description: 'Simplify', expression: `${a * b} - ${a * c} = ${a * b - a * c}`, value: a * b - a * c },
        ],
      },
      {
        prompt: `Use the distributive property to factor: ${a * b} + ${a * c}`,
        rewritten: `${a} × (${b} + ${c})`,
        value: a * (b + c),
        steps: [
          { description: 'Find the common factor', expression: `GCF of ${a * b} and ${a * c} is ${a}`, value: a },
          { description: 'Factor out the GCF', expression: `${a} × (${b} + ${c})`, value: a * (b + c) },
          { description: 'Verify by distributing', expression: `${a}×${b} + ${a}×${c} = ${a * b} + ${a * c}`, value: a * b + a * c },
        ],
      },
      {
        prompt: `Apply the distributive property: ${a} × ${b} + ${a} × ${c} = ?`,
        rewritten: `${a} × (${b} + ${c})`,
        value: a * (b + c),
        steps: [
          { description: 'Factor out the common factor', expression: `${a} × (${b} + ${c})`, value: a * (b + c) },
          { description: 'Evaluate the sum inside', expression: `${b} + ${c} = ${b + c}`, value: b + c },
          { description: 'Multiply', expression: `${a} × ${b + c} = ${a * (b + c)}`, value: a * (b + c) },
        ],
      },
    ];

    const t = pick(templates);
    const gradingMetadata: GradingMetadata = {
      partAnswers: { result: t.value, rewritten: t.rewritten },
      partMaxScores: { result: 3, rewritten: 2 },
      partGradingRules: { result: 'numeric_tolerance', rewritten: 'exact_match' },
      partTolerances: { result: 0.01 },
    };
    return {
      prompt: t.prompt,
      data: { a, b, c, rewritten: t.rewritten, seed: input.seed },
      expectedAnswer: { result: t.value, rewritten: t.rewritten },
      solutionSteps: t.steps,
      gradingMetadata,
    };
  },
};

const absoluteValueDistance: IM1GeneratorEntry = {
  skillIdKey: '1-5-absolute-value-distance',
  nodeIds: [
    'math.im1.skill.1.5.write-absolute-value-expressions-that-model-real-world-dista',
  ],
  generate: (input: GeneratorInput): GeneratorOutput => {
    const rand = seededRandom(input.seed);
    const pick = <T>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];
    const ri = (min: number, max: number) =>
      Math.floor(rand() * (max - min + 1)) + min;

    const target = ri(10, 100);
    const tolerance = ri(1, 10);
    const actual = target + (rand() > 0.5 ? 1 : -1) * ri(0, tolerance - 1);

    type AbsTemplate = {
      prompt: string;
      expression: string;
      distance: number;
      explanation: string;
      steps: Array<{ description: string; expression: string; value: number }>;
    };
    const templates: AbsTemplate[] = [
      {
        prompt: `A measurement is supposed to be ${target} units. The actual measurement is ${actual} units. Write an absolute value expression for the distance between the actual and target measurements, and evaluate it.`,
        expression: `|${actual} - ${target}|`,
        distance: Math.abs(actual - target),
        explanation: `The distance is |${actual} - ${target}| = ${Math.abs(actual - target)}`,
        steps: [
          { description: 'Identify the two values', expression: `Target: ${target}, Actual: ${actual}`, value: Math.abs(actual - target) },
          { description: 'Write the distance expression', expression: `|actual - target| = |${actual} - ${target}|`, value: Math.abs(actual - target) },
          { description: 'Evaluate the absolute value', expression: `|${actual - target}| = ${Math.abs(actual - target)}`, value: Math.abs(actual - target) },
        ],
      },
      {
        prompt: `Point A is at position ${target} on a number line. Point B is at position ${actual}. Write an absolute value expression for the distance between A and B.`,
        expression: `|${actual} - ${target}|`,
        distance: Math.abs(actual - target),
        explanation: `Distance = |${actual} - ${target}| = ${Math.abs(actual - target)}`,
        steps: [
          { description: 'Recall the distance formula', expression: `Distance = |a - b|`, value: Math.abs(actual - target) },
          { description: 'Substitute the values', expression: `|${actual} - ${target}|`, value: Math.abs(actual - target) },
          { description: 'Evaluate', expression: `|${actual - target}| = ${Math.abs(actual - target)}`, value: Math.abs(actual - target) },
        ],
      },
      {
        prompt: `A package weighs ${target} oz. The shipping label allows a tolerance of ${tolerance} oz. Write an absolute value inequality that represents acceptable weights, and find the distance from the target for a package weighing ${actual} oz.`,
        expression: `|w - ${target}| ≤ ${tolerance}`,
        distance: Math.abs(actual - target),
        explanation: `The inequality is |w - ${target}| ≤ ${tolerance}. For ${actual} oz: |${actual} - ${target}| = ${Math.abs(actual - target)}`,
        steps: [
          { description: 'Write the tolerance inequality', expression: `|w - ${target}| ≤ ${tolerance}`, value: Math.abs(actual - target) },
          { description: 'Substitute the actual weight', expression: `|${actual} - ${target}|`, value: Math.abs(actual - target) },
          { description: 'Evaluate the distance', expression: `|${actual - target}| = ${Math.abs(actual - target)}`, value: Math.abs(actual - target) },
          { description: 'Check if within tolerance', expression: `${Math.abs(actual - target)} ≤ ${tolerance} → ${Math.abs(actual - target) <= tolerance ? 'Yes, within tolerance' : 'No, outside tolerance'}`, value: Math.abs(actual - target) },
        ],
      },
      {
        prompt: `The temperature was forecast to be ${target}°F but the actual temperature was ${actual}°F. Write an absolute value expression for how far off the forecast was.`,
        expression: `|${actual} - ${target}|`,
        distance: Math.abs(actual - target),
        explanation: `The forecast error is |${actual} - ${target}| = ${Math.abs(actual - target)}°F`,
        steps: [
          { description: 'Define the error', expression: `Error = |actual - forecast|`, value: Math.abs(actual - target) },
          { description: 'Substitute', expression: `|${actual} - ${target}|`, value: Math.abs(actual - target) },
          { description: 'Evaluate', expression: `|${actual - target}| = ${Math.abs(actual - target)}`, value: Math.abs(actual - target) },
        ],
      },
    ];

    const t = pick(templates);
    const gradingMetadata: GradingMetadata = {
      partAnswers: { expression: t.expression, distance: t.distance },
      partMaxScores: { expression: 3, distance: 2 },
      partGradingRules: { expression: 'exact_match', distance: 'numeric_tolerance' },
      partTolerances: { distance: 0.01 },
    };
    return {
      prompt: t.prompt,
      data: { target, actual, tolerance, seed: input.seed },
      expectedAnswer: { expression: t.expression, distance: t.distance },
      solutionSteps: t.steps,
      gradingMetadata,
    };
  },
};

const ratiosAndPercentages: IM1GeneratorEntry = {
  skillIdKey: '1-6-ratios-and-percentages',
  nodeIds: [
    'math.im1.skill.1.6.use-ratios-and-percentages-as-metrics-to-model-real-world-si',
  ],
  generate: (input: GeneratorInput): GeneratorOutput => {
    const rand = seededRandom(input.seed);
    const pick = <T>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];
    const ri = (min: number, max: number) =>
      Math.floor(rand() * (max - min + 1)) + min;

    const part = ri(5, 40);
    const total = ri(50, 200);
    const pct = Math.round((part / total) * 10000) / 100;
    const ratio = `${part}:${total - part}`;
    const simplifiedGcd = (x: number, y: number): number => (y === 0 ? x : simplifiedGcd(y, x % y));
    const g = simplifiedGcd(part, total - part);
    const totalG = simplifiedGcd(part, total);
    const simplifiedRatio = `${part / g}:${(total - part) / g}`;
    const simplifiedPartToTotalRatio = `${part / totalG}:${total / totalG}`;

    type RatioTemplate = {
      prompt: string;
      answer: Record<string, unknown>;
      steps: Array<{ description: string; expression: string; value: unknown }>;
    };
    const templates: RatioTemplate[] = [
      {
        prompt: `In a class of ${total} students, ${part} passed the test. Express the ratio of students who passed to those who did not, and find the pass percentage.`,
        answer: { ratio, simplifiedRatio, percentage: pct },
        steps: [
          { description: 'Find the number who did not pass', expression: `${total} - ${part} = ${total - part}`, value: total - part },
          { description: 'Write the ratio (passed : not passed)', expression: `${part}:${total - part}`, value: ratio },
          { description: 'Simplify the ratio', expression: `${part / g}:${(total - part) / g}`, value: simplifiedRatio },
          { description: 'Calculate the percentage', expression: `(${part} / ${total}) × 100 = ${pct}%`, value: pct },
        ],
      },
      {
        prompt: `A store sold ${part} items out of ${total} in stock. What percentage of items were sold? Express the sold-to-remaining ratio.`,
        answer: { percentage: pct, ratio, simplifiedRatio },
        steps: [
          { description: 'Find items remaining', expression: `${total} - ${part} = ${total - part}`, value: total - part },
          { description: 'Calculate the percentage sold', expression: `(${part} / ${total}) × 100 = ${pct}%`, value: pct },
          { description: 'Write the ratio (sold : remaining)', expression: `${part}:${total - part}`, value: ratio },
          { description: 'Simplify the ratio', expression: `${part / g}:${(total - part) / g}`, value: simplifiedRatio },
        ],
      },
      {
        prompt: `A survey found that ${part} out of ${total} people prefer option A. Express the prefer-A-to-total ratio and the percentage.`,
        answer: { ratio: `${part}:${total}`, percentage: pct, simplifiedRatio: simplifiedPartToTotalRatio },
        steps: [
          { description: 'Write the ratio (prefer A : total)', expression: `${part}:${total}`, value: `${part}:${total}` },
          { description: 'Calculate the percentage', expression: `(${part} / ${total}) × 100 = ${pct}%`, value: pct },
          { description: 'Interpret the result', expression: `${pct}% of people prefer option A`, value: pct },
        ],
      },
      {
        prompt: `A recipe calls for ${part} grams of sugar in a ${total}-gram mixture. What percentage of the mixture is sugar? What is the ratio of sugar to other ingredients?`,
        answer: { percentage: pct, ratio, simplifiedRatio },
        steps: [
          { description: 'Find the non-sugar amount', expression: `${total} - ${part} = ${total - part} grams`, value: total - part },
          { description: 'Calculate the sugar percentage', expression: `(${part} / ${total}) × 100 = ${pct}%`, value: pct },
          { description: 'Write the ratio (sugar : other)', expression: `${part}:${total - part}`, value: ratio },
          { description: 'Simplify', expression: `${part / g}:${(total - part) / g}`, value: simplifiedRatio },
        ],
      },
    ];

    const t = pick(templates);
    const gradingMetadata: GradingMetadata = {
      partAnswers: t.answer,
      partMaxScores: { ratio: 2, percentage: 2, simplifiedRatio: 1 },
      partGradingRules: { ratio: 'exact_match', percentage: 'numeric_tolerance', simplifiedRatio: 'exact_match' },
      partTolerances: { percentage: 0.1 },
    };
    return {
      prompt: t.prompt,
      data: { part, total, percentage: pct, seed: input.seed },
      expectedAnswer: t.answer,
      solutionSteps: t.steps,
      gradingMetadata,
    };
  },
};

export const IM1_GENERATORS: IM1GeneratorEntry[] = [
  verbalToNumerical,
  algebraicVerbalTranslation,
  propertiesOfEquality,
  distributiveProperty,
  absoluteValueDistance,
  ratiosAndPercentages,
];
