import { describe, expect, it } from "vitest";

import { getGenerator } from "../knowledge-space/generators/registry";

const GENERATOR_KEY = "estimate-roots-by-graphing";
const ATOMIC_NODE_ID = "math.im3.skill.1.2.estimate-roots-by-graphing";

describe("estimate-roots-by-graphing generator", () => {
  it("resolves the exact registry identity", () => {
    const generator = getGenerator(GENERATOR_KEY);

    expect(generator.key).toBe(GENERATOR_KEY);
    expect(generator.nodeIds).toEqual([ATOMIC_NODE_ID]);
  });

  it("emits the exact deterministic seed 0 source specimen", () => {
    const generator = getGenerator(GENERATOR_KEY);
    const output = generator.generate({ nodeId: ATOMIC_NODE_ID, seed: 0, difficulty: 0.5 });
    const data = output.data as Record<string, unknown>;
    const tableValues = [
      { x: -2, y: -3 },
      { x: -1, y: 3 },
      { x: 0, y: 7 },
      { x: 1, y: 9 },
      { x: 2, y: 9 },
      { x: 3, y: 7 },
      { x: 4, y: 3 },
      { x: 5, y: -3 },
    ];

    expect(output.prompt).toBe(
      "Solve -x^2 + 3x + 7 = 0 by graphing. If the exact roots cannot be found, state the consecutive integers between which the roots are located.",
    );
    expect(data).toEqual({
      axisFloor: 1,
      verticalShift: 9,
      a: -1,
      b: 3,
      c: 7,
      axis: 1.5,
      difficulty: 0.5,
      tableValues,
      points: tableValues.map(({ x, y }) => [x, y]),
      rootIntervals: [
        [-2, -1],
        [4, 5],
      ],
      rendererProps: {
        equation: "f(x) = -x^2 + 3x + 7",
        variant: "plot_from_equation",
        responseVariant: "estimated_root_intervals",
        originalEquation: "-x^2 + 3x + 7 = 0",
        points: tableValues.map(({ x, y }) => [x, y]),
      },
    });
  });

  it("uses the exact interval answer and grading contract", () => {
    const generator = getGenerator(GENERATOR_KEY);
    const output = generator.generate({ nodeId: ATOMIC_NODE_ID, seed: 0, difficulty: 0.5 });
    const tableValues = [
      { x: -2, y: -3 },
      { x: -1, y: 3 },
      { x: 0, y: 7 },
      { x: 1, y: 9 },
      { x: 2, y: 9 },
      { x: 3, y: 7 },
      { x: 4, y: 3 },
      { x: 5, y: -3 },
    ];

    expect(output.expectedAnswer).toEqual({
      table_values: tableValues,
      placed_points: tableValues,
      root_intervals: [
        [-2, -1],
        [4, 5],
      ],
    });
    expect(Object.keys(output.expectedAnswer)).toEqual([
      "table_values",
      "placed_points",
      "root_intervals",
    ]);
    expect(output.gradingMetadata).toEqual({
      partAnswers: output.expectedAnswer,
      partMaxScores: {
        table_values: 1,
        placed_points: 1,
        root_intervals: 1,
      },
      partGradingRules: {
        table_values: "custom",
        placed_points: "custom",
        root_intervals: "custom",
      },
    });
    expect(output.solutionSteps).toHaveLength(5);
    expect(output.solutionSteps.map((step) => step.description)).toEqual([
      "Rewrite the equation as the related function",
      "Find the axis of symmetry",
      "Complete the table of values",
      "Plot the points and connect the curve",
      "State the consecutive-integer root intervals",
    ]);
    expect(output.expectedAnswer).not.toHaveProperty("roots");
    expect(output.expectedAnswer).not.toHaveProperty("root");
    expect(output.expectedAnswer).not.toHaveProperty("solution");
  });

  it("is deterministic and preserves interval invariants across seeds", () => {
    const generator = getGenerator(GENERATOR_KEY);

    for (let seed = 0; seed < 1000; seed += 1) {
      const input = { nodeId: ATOMIC_NODE_ID, seed, difficulty: 0.5 };
      const output = generator.generate(input);
      const repeat = generator.generate(input);
      const data = output.data as {
        axisFloor: number;
        verticalShift: number;
        a: number;
        b: number;
        c: number;
        axis: number;
        tableValues: Array<{ x: number; y: number }>;
        points: Array<[number, number]>;
        rootIntervals: Array<[number, number]>;
        rendererProps: {
          responseVariant: string;
          points: Array<[number, number]>;
          equation: string;
          originalEquation: string;
        };
      };
      const firstInterval = data.rootIntervals[0]!;
      const secondInterval = data.rootIntervals[1]!;
      const roots = [
        (-data.b - Math.sqrt(data.b ** 2 - 4 * data.a * data.c)) / (2 * data.a),
        (-data.b + Math.sqrt(data.b ** 2 - 4 * data.a * data.c)) / (2 * data.a),
      ].sort((first, second) => first - second);

      expect(repeat).toEqual(output);
      expect(data.a).toBe(-1);
      expect(Number.isInteger(data.axisFloor)).toBe(true);
      expect(data.axisFloor).toBeGreaterThanOrEqual(-3);
      expect(data.axisFloor).toBeLessThanOrEqual(3);
      expect(Number.isInteger(data.verticalShift)).toBe(true);
      expect(data.verticalShift).toBeGreaterThanOrEqual(7);
      expect(data.verticalShift).toBeLessThanOrEqual(9);
      expect(data.b).toBe(2 * data.axisFloor + 1);
      expect(data.b % 2).not.toBe(0);
      expect(data.b).toBeGreaterThanOrEqual(-5);
      expect(data.b).toBeLessThanOrEqual(7);
      expect(data.c).toBe(data.verticalShift - data.axisFloor * (data.axisFloor + 1));
      expect(data.axis).toBe(data.axisFloor + 0.5);
      expect(data.tableValues).toHaveLength(8);
      expect(data.points).toHaveLength(8);
      expect(output.expectedAnswer).toEqual({
        table_values: data.tableValues,
        placed_points: data.tableValues,
        root_intervals: data.rootIntervals,
      });
      expect(output.gradingMetadata).toEqual({
        partAnswers: {
          table_values: data.tableValues,
          placed_points: data.tableValues,
          root_intervals: data.rootIntervals,
        },
        partMaxScores: {
          table_values: 1,
          placed_points: 1,
          root_intervals: 1,
        },
        partGradingRules: {
          table_values: "custom",
          placed_points: "custom",
          root_intervals: "custom",
        },
      });
      expect(data.rendererProps.responseVariant).toBe("estimated_root_intervals");
      expect(data.rendererProps.points).toEqual(data.points);
      expect(data.rendererProps.equation.length).toBeGreaterThan(0);
      expect(data.rendererProps.originalEquation.length).toBeGreaterThan(0);
      expect(data.tableValues.map(({ x }) => x)).toEqual(
        Array.from({ length: 8 }, (_, index) => data.axisFloor - 3 + index),
      );
      expect(data.points).toEqual(data.tableValues.map(({ x, y }) => [x, y]));
      expect(data.rootIntervals).toEqual([
        [data.axisFloor - 3, data.axisFloor - 2],
        [data.axisFloor + 3, data.axisFloor + 4],
      ]);
      expect(firstInterval[1] - firstInterval[0]).toBe(1);
      expect(secondInterval[1] - secondInterval[0]).toBe(1);
      expect(firstInterval[1]).toBeLessThan(secondInterval[0]);
      expect(
        data.tableValues.every(({ x, y }) => y === data.a * x ** 2 + data.b * x + data.c),
      ).toBe(true);
      expect(data.tableValues[0]!.y * data.tableValues[1]!.y).toBeLessThan(0);
      expect(data.tableValues[6]!.y * data.tableValues[7]!.y).toBeLessThan(0);
      expect(roots.every(Number.isFinite)).toBe(true);
      expect(roots[0]).toBeLessThan(roots[1]!);
      expect(roots.every((root) => !Number.isInteger(root))).toBe(true);
      expect(roots[0]).toBeGreaterThan(firstInterval[0]);
      expect(roots[0]).toBeLessThan(firstInterval[1]);
      expect(roots[1]).toBeGreaterThan(secondInterval[0]);
      expect(roots[1]).toBeLessThan(secondInterval[1]);
    }
  });
});
