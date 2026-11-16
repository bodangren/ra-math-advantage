import { describe, expect, it } from 'vitest';
import { generatorOutputSchema } from '@math-platform/knowledge-space-practice';

import {
  generateTopic12GraphAverageRateChoice,
  generateTopic12GraphAverageRateChoiceOutput,
  TOPIC12_GRAPH_AVERAGE_RATE_CHOICE_NODE_ID,
} from '../topic12-graph-average-rate-choice';
import { getGenerator } from '../registry';

const SOURCE_INTERVALS = [
  { id: 'A', label: 'A', startInput: 2, endInput: 3 },
  { id: 'B', label: 'B', startInput: 3, endInput: 5 },
  { id: 'C', label: 'C', startInput: 5, endInput: 7 },
  { id: 'D', label: 'D', startInput: 7, endInput: 8 },
];

describe('Topic 1.2 graph average-rate generator', () => {
  it('reproduces the authored Example 3 source values at seed 0', () => {
    const variant = generateTopic12GraphAverageRateChoice(0);

    expect(variant.prompt).toBe('The figure shows the graph of y = h(x). On which interval is the average rate of change of h greatest?');
    expect(variant.domain).toEqual([0, 9]);
    expect(variant.range).toEqual([0, 11]);
    expect(variant.xLabel).toBe('x');
    expect(variant.yLabel).toBe('h(x)');
    expect(variant.options).toEqual(SOURCE_INTERVALS);
    expect(variant.correctOptionId).toBe('C');
    expect(variant.graphPoints).toEqual([
      { x: 0.8, y: 0 },
      { x: 1, y: 7 },
      { x: 1.3, y: 8.6 },
      { x: 2, y: 6 },
      { x: 2.2, y: 5.2 },
      { x: 3, y: 6 },
      { x: 3.5, y: 6.6 },
      { x: 4, y: 6 },
      { x: 5, y: 4 },
      { x: 5.2, y: 3.8 },
      { x: 6.6, y: 7.3 },
      { x: 7, y: 6 },
      { x: 7.7, y: 1.2 },
      { x: 8, y: 3 },
      { x: 8.2, y: 10.8 },
    ]);
    const rates = SOURCE_INTERVALS.map((option) => {
      const start = variant.graphPoints.find((point) => point.x === option.startInput)!;
      const end = variant.graphPoints.find((point) => point.x === option.endInput)!;
      return (end.y - start.y) / (end.x - start.x);
    });
    expect(rates).toEqual([0, -1, 1, -3]);
    expect(variant.solutionSteps).toHaveLength(5);
    expect(variant.solutionSteps.slice(0, 4).every((step) => (
      step.includes('(change in output)/(change in input)')
    ))).toBe(true);
    expect(variant.solutionSteps[4]).toContain('C');
    expect(variant.solutionSteps[4]).toContain('greatest');
  });

  it('resolves through the registry with the exact source node', () => {
    const generator = getGenerator('topic12-graph-average-rate-choice');

    expect(generator.key).toBe('topic12-graph-average-rate-choice');
    expect(generator.nodeIds).toEqual([TOPIC12_GRAPH_AVERAGE_RATE_CHOICE_NODE_ID]);
  });

  it('is deterministic and generates a non-C correct option', () => {
    expect(generateTopic12GraphAverageRateChoice(42)).toEqual(generateTopic12GraphAverageRateChoice(42));

    const correctOptions = new Set(
      Array.from({ length: 100 }, (_, seed) => generateTopic12GraphAverageRateChoice(seed + 1).correctOptionId),
    );
    expect([...correctOptions]).toEqual(expect.arrayContaining(['A', 'B', 'D']));
  });

  it('keeps 1,000 generated graphs bounded with one recomputed greatest rate', () => {
    for (let seed = 0; seed < 1000; seed += 1) {
      const variant = generateTopic12GraphAverageRateChoice(seed);
      const rates = variant.options.map((option) => {
        const start = variant.graphPoints.find((point) => point.x === option.startInput)!;
        const end = variant.graphPoints.find((point) => point.x === option.endInput)!;
        return (end.y - start.y) / (end.x - start.x);
      });
      const greatest = Math.max(...rates);
      const greatestIndexes = rates.filter((rate) => Math.abs(rate - greatest) <= 1e-9);

      expect(variant.graphPoints.length).toBeGreaterThan(4);
      expect(variant.graphPoints.every((point) => (
        point.x >= variant.domain[0]
        && point.x <= variant.domain[1]
        && point.y >= variant.range[0]
        && point.y <= variant.range[1]
      ))).toBe(true);
      expect(variant.graphPoints.every((point, index) => (
        index === 0 || point.x > variant.graphPoints[index - 1]!.x
      ))).toBe(true);
      expect(variant.options).toHaveLength(4);
      expect(new Set(variant.options.map((option) => option.id)).size).toBe(4);
      expect(greatestIndexes).toHaveLength(1);
      expect(variant.options[rates.indexOf(greatest)]!.id).toBe(variant.correctOptionId);
      expect(variant.solutionSteps).toHaveLength(5);
    }
  });

  it('rejects invalid seeds and adapts output without answer leakage in public data', () => {
    for (const seed of [-1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
      expect(() => generateTopic12GraphAverageRateChoice(seed)).toThrow(RangeError);
    }

    const output = generateTopic12GraphAverageRateChoiceOutput(0);
    expect(generatorOutputSchema.safeParse(output).success).toBe(true);
    expect(output.expectedAnswer).toEqual({ selectedOptionId: 'C' });
    expect(output.gradingMetadata).toEqual({
      partAnswers: { selectedOptionId: 'C' },
      partMaxScores: { selectedOptionId: 1 },
      partGradingRules: { selectedOptionId: 'exact_match' },
    });
    expect(output.solutionSteps).toEqual(
      generateTopic12GraphAverageRateChoice(0).solutionSteps.map((description) => ({ description })),
    );
    const data = output.data as Record<string, unknown>;
    for (const key of ['expectedAnswer', 'gradingMetadata', 'correctOptionId']) {
      expect(data).not.toHaveProperty(key);
    }
  });
});
