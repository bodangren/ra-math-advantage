import { describe, expect, it } from 'vitest';

import {
  TOPIC16_LIMIT_NOTATION_END_BEHAVIOR_NODE_ID,
  generateTopic16LimitNotationEndBehavior,
  generateTopic16LimitNotationEndBehaviorOutput,
} from '../topic16-limit-notation-end-behavior';

const SOURCE_PROMPT =
  'Write limit statements for the end behavior of the following polynomials.';

const SOURCE_ITEMS = [
  { id: 'a', functionName: 'f', expression: '-3x^4' },
  { id: 'b', functionName: 'g', expression: '5x^3 + 2x^2 - 7' },
] as const;

const SOURCE_ANSWERS = {
  a_leftLimit: 'negative_infinity',
  a_rightLimit: 'negative_infinity',
  b_leftLimit: 'negative_infinity',
  b_rightLimit: 'positive_infinity',
} as const;

const SOURCE_SOLUTION_STEPS = [
  'a) The leading term is -3x^4. The degree is even and the leading coefficient is negative, so lim(x to -infinity) f(x) = -infinity and lim(x to infinity) f(x) = -infinity.',
  'b) The leading term is 5x^3. The degree is odd and the leading coefficient is positive, so lim(x to -infinity) g(x) = -infinity and lim(x to infinity) g(x) = infinity.',
] as const;

const PART_IDS = [
  'a_leftLimit',
  'a_rightLimit',
  'b_leftLimit',
  'b_rightLimit',
] as const;

const SOURCE_MAX_SCORES = Object.fromEntries(PART_IDS.map((partId) => [partId, 1]));
const SOURCE_GRADING_RULES = Object.fromEntries(
  PART_IDS.map((partId) => [partId, 'exact_match']),
);

const AUTHORITY_KEYS = [
  'answer',
  'answers',
  'correctAnswer',
  'correctAnswers',
  'expectedAnswer',
  'grading',
  'gradingMetadata',
  'leftLimit',
  'limitFrame',
  'limitStatement',
  'rightLimit',
  'score',
  'solution',
  'solutionSteps',
  'steps',
];

type GeneratedOutput = {
  readonly prompt: string;
  readonly data: {
    readonly seed: number;
    readonly rendererProps: Record<string, unknown>;
  };
  readonly expectedAnswer: Record<string, string>;
  readonly solutionSteps: ReadonlyArray<{ description: string }>;
  readonly gradingMetadata: {
    readonly partAnswers: Record<string, string>;
    readonly partMaxScores: Record<string, number>;
    readonly partGradingRules: Record<string, string>;
  };
};

type GeneratedItem = {
  readonly id: string;
  readonly functionName: string;
  readonly expression: string;
};

function serializedKeys(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(serializedKeys);
  if (!value || typeof value !== 'object') return [];
  return Object.entries(value).flatMap(([key, child]) => [key, ...serializedKeys(child)]);
}

function expectNoAuthority(value: unknown): void {
  for (const key of serializedKeys(value)) {
    expect(AUTHORITY_KEYS).not.toContain(key);
  }
}

function asOutput(value: unknown): GeneratedOutput {
  return value as GeneratedOutput;
}

function leadingTerm(expression: string): { coefficient: number; exponent: number } {
  const match = expression.match(/^(-?)(\d*)x\^(\d+)/);
  if (!match) throw new Error(`Invalid generated leading term: ${expression}`);
  const sign = match[1] === '-' ? -1 : 1;
  return {
    coefficient: sign * (match[2] === '' ? 1 : Number(match[2])),
    exponent: Number(match[3]),
  };
}

function expectedEnds(coefficient: number, exponent: number): [string, string] {
  const right = coefficient > 0 ? 'positive_infinity' : 'negative_infinity';
  const left = exponent % 2 === 0
    ? right
    : right === 'positive_infinity' ? 'negative_infinity' : 'positive_infinity';
  return [left, right];
}

describe('Topic 1.6 limit-notation end-behavior generator', () => {
  it('uses the exact node identity and rejects invalid seeds', () => {
    expect(TOPIC16_LIMIT_NOTATION_END_BEHAVIOR_NODE_ID).toBe(
      'math.precalc.skill.1.6.write-polynomial-end-behavior-in-limit-notation',
    );

    for (const seed of [
      -1,
      1.5,
      Number.NaN,
      Number.POSITIVE_INFINITY,
      Number.NEGATIVE_INFINITY,
      Number.MAX_SAFE_INTEGER + 1,
      '1',
      null,
      undefined,
    ]) {
      expect(() => generateTopic16LimitNotationEndBehavior(seed as number)).toThrow(RangeError);
      expect(() => generateTopic16LimitNotationEndBehaviorOutput(seed as number)).toThrow(RangeError);
    }
  });

  it('reproduces the authored PDF Example 4 at seed 0', () => {
    const variant = generateTopic16LimitNotationEndBehavior(0) as Record<string, unknown>;
    const output = asOutput(generateTopic16LimitNotationEndBehaviorOutput(0));
    const rendererProps = output.data.rendererProps;

    expect(variant).toEqual({
      seed: 0,
      prompt: SOURCE_PROMPT,
      items: SOURCE_ITEMS,
    });
    expect(output.prompt).toBe(SOURCE_PROMPT);
    expect(output.data.seed).toBe(0);
    expect(rendererProps).toEqual({
      prompt: SOURCE_PROMPT,
      items: SOURCE_ITEMS,
      presentationMode: 'independent_practice',
    });
    expect(Object.keys(rendererProps).sort()).toEqual([
      'items',
      'presentationMode',
      'prompt',
    ]);
    expect(output.expectedAnswer).toEqual(SOURCE_ANSWERS);
    expect(output.solutionSteps.map((step) => step.description)).toEqual(SOURCE_SOLUTION_STEPS);
    expect(output.gradingMetadata).toEqual({
      partAnswers: SOURCE_ANSWERS,
      partMaxScores: SOURCE_MAX_SCORES,
      partGradingRules: SOURCE_GRADING_RULES,
    });
    expect(Object.values(output.gradingMetadata.partMaxScores)).toEqual([1, 1, 1, 1]);
    expect(Object.values(output.gradingMetadata.partGradingRules)).toEqual([
      'exact_match',
      'exact_match',
      'exact_match',
      'exact_match',
    ]);
    expectNoAuthority(rendererProps);
  });

  it('is deterministic and varies nonzero output', () => {
    expect(generateTopic16LimitNotationEndBehavior(1)).toEqual(
      generateTopic16LimitNotationEndBehavior(1),
    );
    expect(generateTopic16LimitNotationEndBehaviorOutput(1)).toEqual(
      generateTopic16LimitNotationEndBehaviorOutput(1),
    );
    expect(generateTopic16LimitNotationEndBehavior(1)).not.toEqual(
      generateTopic16LimitNotationEndBehavior(2),
    );
  });

  it('keeps both source-like item forms and covers every canonical end pattern', () => {
    const patterns = new Map<string, Set<string>>([
      ['a', new Set<string>()],
      ['b', new Set<string>()],
    ]);

    for (let seed = 1; seed <= 16; seed += 1) {
      const output = asOutput(generateTopic16LimitNotationEndBehaviorOutput(seed));
      const rendererProps = output.data.rendererProps;
      const items = rendererProps.items as GeneratedItem[];

      expect(output.prompt).toBe(SOURCE_PROMPT);
      expect(rendererProps.prompt).toBe(SOURCE_PROMPT);
      expect(output.data.seed).toBe(seed);
      expect(items).toHaveLength(2);
      expect(items.map((item) => item.id)).toEqual(['a', 'b']);
      expect(items.map((item) => item.functionName)).toEqual(['f', 'g']);
      expect(Object.keys(rendererProps).sort()).toEqual([
        'items',
        'presentationMode',
        'prompt',
      ]);
      expect(rendererProps.presentationMode).toBe('independent_practice');
      expectNoAuthority(rendererProps);

      const itemA = items[0];
      const itemB = items[1];
      expect(itemA.expression).toMatch(/^-?\d*x\^\d+$/);
      expect(itemB.expression).toMatch(/^-?\d*x\^\d+ [+-] \d*x(?:\^\d+)? [+-] \d+$/);
      const itemALeadingTerm = leadingTerm(itemA.expression);
      expect(itemALeadingTerm.coefficient).not.toBe(0);
      expect(itemALeadingTerm.exponent).toBeGreaterThanOrEqual(2);
      expect(itemALeadingTerm.exponent).toBeLessThanOrEqual(7);
      const itemBLeadingTerm = leadingTerm(itemB.expression);
      expect(itemBLeadingTerm.coefficient).not.toBe(0);
      expect(itemBLeadingTerm.exponent).toBeGreaterThanOrEqual(3);
      expect(itemBLeadingTerm.exponent).toBeLessThanOrEqual(7);
      const itemBTerms = [...itemB.expression.matchAll(/x(?:\^(\d+))?/g)].map((match) => (
        match[1] === undefined ? 1 : Number(match[1])
      ));
      expect(itemBTerms).toHaveLength(2);
      expect(itemB.expression).not.toContain('x^1');
      expect(itemBTerms[1]).toBeGreaterThanOrEqual(1);
      expect(itemBTerms[1]).toBeLessThan(itemBTerms[0]);
      const itemBConstant = itemB.expression.match(/ [+-] (\d+)$/);
      expect(itemBConstant).not.toBeNull();
      expect(Number(itemBConstant?.[1])).not.toBe(0);

      for (const item of items) {
        const [left, right] = expectedEnds(
          leadingTerm(item.expression).coefficient,
          leadingTerm(item.expression).exponent,
        );
        const answer = output.expectedAnswer;
        expect(answer[`${item.id}_leftLimit`]).toBe(left);
        expect(answer[`${item.id}_rightLimit`]).toBe(right);
        expect(output.gradingMetadata.partAnswers[`${item.id}_leftLimit`]).toBe(left);
        expect(output.gradingMetadata.partAnswers[`${item.id}_rightLimit`]).toBe(right);
        patterns.get(item.id)?.add(`${left}|${right}`);
      }

      expect(output.solutionSteps).toHaveLength(2);
      for (const item of items) {
        const step = output.solutionSteps.find((candidate) => candidate.description.includes(`${item.id})`));
        expect(step?.description).toContain(item.expression.split(' ')[0]);
        expect(step?.description).toContain(
          output.expectedAnswer[`${item.id}_leftLimit`].replace('_', ' '),
        );
        expect(step?.description).toContain(
          output.expectedAnswer[`${item.id}_rightLimit`].replace('_', ' '),
        );
        const term = leadingTerm(item.expression);
        expect(step?.description).toContain(term.exponent % 2 === 0 ? 'even' : 'odd');
        expect(step?.description).toContain(term.coefficient > 0 ? 'positive' : 'negative');
      }

      expect(Object.keys(output.expectedAnswer)).toEqual([...PART_IDS]);
      expect(Object.keys(output.gradingMetadata.partAnswers)).toEqual([...PART_IDS]);
      expect(Object.keys(output.gradingMetadata.partMaxScores)).toEqual([...PART_IDS]);
      expect(Object.keys(output.gradingMetadata.partGradingRules)).toEqual([...PART_IDS]);
      expect(Object.values(output.expectedAnswer).every(
        (value) => value === 'positive_infinity' || value === 'negative_infinity',
      )).toBe(true);
    }

    const allPatterns = new Set([
      'positive_infinity|positive_infinity',
      'positive_infinity|negative_infinity',
      'negative_infinity|positive_infinity',
      'negative_infinity|negative_infinity',
    ]);
    expect(patterns.get('a')).toEqual(allPatterns);
    expect(patterns.get('b')).toEqual(allPatterns);
  });
});
