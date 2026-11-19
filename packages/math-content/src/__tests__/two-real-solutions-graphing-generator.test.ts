import { describe, expect, it } from "vitest";
import { generatorOutputSchema } from "@math-platform/knowledge-space-practice";

import { graphingExplorerSchema } from "../schemas/graphing-explorer.schema";
import { GENERATOR_KEYS, getGenerator } from "../knowledge-space/generators/registry";

const GENERATOR_KEY = "two-real-solutions-graphing";
const ATOMIC_NODE_ID = "math.im3.skill.1.2.find-two-numbers-with-given-sum-and-product-by-graphing";

describe("two-real-solutions-graphing generator", () => {
  it("resolves the exact registry identity", () => {
    const generator = getGenerator(GENERATOR_KEY);

    expect(generator.key).toBe(GENERATOR_KEY);
    expect(generator.nodeIds).toEqual([ATOMIC_NODE_ID]);
    expect(GENERATOR_KEYS).toContain(GENERATOR_KEY);
  });

  it("emits the exact deterministic seed 0 source specimen", () => {
    const generator = getGenerator(GENERATOR_KEY);
    const input = { nodeId: ATOMIC_NODE_ID, seed: 0, difficulty: 0.5 };
    const output = generator.generate(input);
    const repeat = generator.generate(input);
    const data = output.data as Record<string, unknown>;
    const tableValues = [
      { x: 10, y: 3 },
      { x: 11, y: 0 },
      { x: 12, y: -1 },
      { x: 13, y: 0 },
      { x: 14, y: 3 },
    ];
    const rendererProps = {
      equation: "f(x) = x^2 - 24x + 143",
      variant: "plot_from_equation",
      responseVariant: "two_real_solutions",
      originalEquation: "x(24 - x) = 143",
      points: [
        [10, 3],
        [11, 0],
        [12, -1],
        [13, 0],
        [14, 3],
      ],
      domain: [8, 16],
      range: [-2, 8],
      sum: 24,
      product: 143,
    };

    expect(repeat).toEqual(output);
    expect(output.prompt).toContain("sum of 24");
    expect(output.prompt).toContain("product of 143");
    expect(output.prompt).not.toContain("11");
    expect(output.prompt).not.toContain("13");
    expect(data).toEqual({
      axis: 12,
      distance: 1,
      sum: 24,
      product: 143,
      roots: [11, 13],
      a: 1,
      b: -24,
      c: 143,
      difficulty: 0.5,
      tableValues,
      rendererProps,
    });
    expect(output.expectedAnswer).toEqual({
      table_values: tableValues,
      placed_points: tableValues,
      solutions: [11, 13],
    });
    expect(output.solutionSteps).toHaveLength(5);
    expect(output.solutionSteps.map((step) => step.expression)).toEqual([
      "x(24 - x) = 143",
      "0 = x^2 - 24x + 143",
      "x = 12",
      "(10, 3), (11, 0), (12, -1), (13, 0), (14, 3)",
      "x = 11 or x = 13; the two numbers are 11 and 13",
    ]);
    expect(output.gradingMetadata).toEqual({
      partAnswers: {
        table_values: tableValues,
        placed_points: tableValues,
        solutions: [11, 13],
      },
      partMaxScores: {
        table_values: 1,
        placed_points: 1,
        solutions: 1,
      },
      partGradingRules: {
        table_values: "custom",
        placed_points: "custom",
        solutions: "custom",
      },
    });
    expect(graphingExplorerSchema.safeParse(rendererProps).success).toBe(true);
    expect(generatorOutputSchema.safeParse(output).success).toBe(true);
  });

  it("keeps every generated specimen coherent across 1000 seeds", () => {
    const generator = getGenerator(GENERATOR_KEY);
    const axes = new Set<number>();
    const distances = new Set<number>();
    const equationSignatures = new Set<string>();

    for (let seed = 0; seed < 1000; seed += 1) {
      const input = { nodeId: ATOMIC_NODE_ID, seed, difficulty: 0.5 };
      const output = generator.generate(input);
      const repeat = generator.generate(input);
      const data = output.data as {
        axis: number;
        distance: number;
        sum: number;
        product: number;
        roots: [number, number];
        a: number;
        b: number;
        c: number;
        difficulty: number;
        tableValues: Array<{ x: number; y: number }>;
        rendererProps: Record<string, unknown>;
      };
      const expectedTableValues = [
        { x: data.axis - 2, y: (data.axis - 2) ** 2 - data.sum * (data.axis - 2) + data.product },
        { x: data.axis - 1, y: (data.axis - 1) ** 2 - data.sum * (data.axis - 1) + data.product },
        { x: data.axis, y: data.axis ** 2 - data.sum * data.axis + data.product },
        { x: data.axis + 1, y: (data.axis + 1) ** 2 - data.sum * (data.axis + 1) + data.product },
        { x: data.axis + 2, y: (data.axis + 2) ** 2 - data.sum * (data.axis + 2) + data.product },
      ];
      const expectedPoints = expectedTableValues.map(({ x, y }) => [x, y]);
      const minimumTableY = Math.min(...expectedTableValues.map(({ y }) => y));
      const maximumTableY = Math.max(...expectedTableValues.map(({ y }) => y));
      const expectedRendererProps = {
        equation: `f(x) = x^2 - ${data.sum}x + ${data.product}`,
        variant: "plot_from_equation",
        responseVariant: "two_real_solutions",
        originalEquation: `x(${data.sum} - x) = ${data.product}`,
        points: expectedPoints,
        domain: [data.axis - 4, data.axis + 4],
        range: [minimumTableY - 1, maximumTableY + 5],
        sum: data.sum,
        product: data.product,
      };

      expect(repeat).toEqual(output);
      expect(Number.isInteger(data.axis)).toBe(true);
      expect(data.axis).toBeGreaterThanOrEqual(8);
      expect(data.axis).toBeLessThanOrEqual(16);
      expect(data.distance).toBeGreaterThanOrEqual(1);
      expect(data.distance).toBeLessThanOrEqual(2);
      expect(data.distance % 1).toBe(0);
      expect(data.roots).toEqual([data.axis - data.distance, data.axis + data.distance]);
      expect(data.roots[0]).toBeLessThan(data.roots[1]);
      expect(data.roots.every(Number.isInteger)).toBe(true);
      expect(data.sum).toBe(2 * data.axis);
      expect(data.product).toBe(data.axis ** 2 - data.distance ** 2);
      expect(data.product).toBe(data.roots[0] * data.roots[1]);
      expect(data.a).toBe(1);
      expect(data.b).toBe(-data.sum);
      expect(data.c).toBe(data.product);
      expect(data.b ** 2 - 4 * data.a * data.c).toBe(4 * data.distance ** 2);
      expect(data.b ** 2 - 4 * data.a * data.c).toBeGreaterThan(0);
      expect(data.difficulty).toBe(0.5);
      expect(data.tableValues).toEqual(expectedTableValues);
      expect(data.rendererProps).toEqual(expectedRendererProps);
      expect(output.expectedAnswer).toEqual({
        table_values: expectedTableValues,
        placed_points: expectedTableValues,
        solutions: data.roots,
      });
      expect(output.solutionSteps).toHaveLength(5);
      expect(output.solutionSteps.map((step) => step.expression)).toEqual([
        `x(${data.sum} - x) = ${data.product}`,
        `0 = x^2 - ${data.sum}x + ${data.product}`,
        `x = ${data.axis}`,
        expectedTableValues.map(({ x, y }) => `(${x}, ${y})`).join(", "),
        `x = ${data.roots[0]} or x = ${data.roots[1]}; the two numbers are ${data.roots[0]} and ${data.roots[1]}`,
      ]);
      expect(output.gradingMetadata).toEqual({
        partAnswers: {
          table_values: expectedTableValues,
          placed_points: expectedTableValues,
          solutions: data.roots,
        },
        partMaxScores: {
          table_values: 1,
          placed_points: 1,
          solutions: 1,
        },
        partGradingRules: {
          table_values: "custom",
          placed_points: "custom",
          solutions: "custom",
        },
      });
      expect(output.prompt).toContain(`sum of ${data.sum}`);
      expect(output.prompt).toContain(`product of ${data.product}`);
      expect(output.prompt).not.toContain(`numbers are ${data.roots[0]} and ${data.roots[1]}`);
      expect(output.prompt).not.toContain(`x = ${data.roots[0]}`);
      expect(output.prompt).not.toContain(`x = ${data.roots[1]}`);
      expect(
        data.tableValues.every(
          ({ x, y }) =>
            x > data.axis - 4 &&
            x < data.axis + 4 &&
            y > minimumTableY - 1 &&
            y < maximumTableY + 5,
        ),
      ).toBe(true);
      expect(graphingExplorerSchema.safeParse(data.rendererProps).success).toBe(true);
      expect(generatorOutputSchema.safeParse(output).success).toBe(true);

      axes.add(data.axis);
      distances.add(data.distance);
      equationSignatures.add((data.rendererProps as { equation: string }).equation);
    }

    expect(axes.size).toBeGreaterThan(1);
    expect(distances).toEqual(new Set([1, 2]));
    expect(equationSignatures.size).toBeGreaterThan(1);
  });
});
