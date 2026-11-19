import { describe, expect, it } from "vitest";
import { generatorOutputSchema } from "@math-platform/knowledge-space-practice";

import { getGenerator } from "../knowledge-space/generators/registry";

const MAXIMUM_READING_NODE_ID = "math.im3.skill.1.1.identify-a-quadratic-maximum-from-its-graph";
const GRAPH_NODE_ID = "math.im3.skill.1.1.graph-quadratic-functions";
const DOMAIN_RANGE_NODE_ID =
  "math.im3.skill.1.1.state-the-domain-and-range-of-a-quadratic-from-its-graph";

describe("IM3 quadratic maximum-reading generator", () => {
  it("claims the exact node and emits one maximum-value part for deterministic seeds", () => {
    const generator = getGenerator("quadratic-graph-analysis");

    expect(generator.nodeIds).toContain(MAXIMUM_READING_NODE_ID);

    for (const [seed, equation, vertexX, maximum] of [
      [0, "y = -x^2 - 1", 0, -1],
      [34, "y = -x^2 + 2", 0, 2],
    ] as const) {
      const output = generator.generate({ nodeId: MAXIMUM_READING_NODE_ID, seed, difficulty: 0.5 });
      const data = output.data as {
        a: number;
        b: number;
        c: number;
        rendererProps: Record<string, unknown>;
      };

      expect(output.prompt).toBe("Use the displayed graph to identify its maximum value.");
      expect(output.prompt).not.toContain(equation);
      expect(output.prompt).not.toMatch(/\b(?:a|b|c)\s*=/i);
      expect(data).toEqual({
        a: -1,
        b: 0,
        c: maximum === -1 ? -1 : 2,
        difficulty: 0.5,
        rendererProps: {
          equation,
          variant: "plot_from_equation",
          responseVariant: "maximum_value",
          domain: [-5, 5],
          range: [-10, 10],
        },
      });
      expect(output.expectedAnswer).toEqual({ maximum_value: maximum });
      expect(output.gradingMetadata).toEqual({
        partAnswers: { maximum_value: maximum },
        partMaxScores: { maximum_value: 1 },
        partGradingRules: { maximum_value: "numeric_tolerance" },
      });
      expect(output.solutionSteps).toEqual([
        {
          description: "Locate the highest point on the displayed graph",
          expression: `Vertex = (${vertexX}, ${maximum})`,
        },
        {
          description: "Take the y-coordinate of the vertex",
          expression: `Maximum = ${maximum}`,
          value: maximum,
        },
      ]);
      expect(output.solutionSteps[0]?.description).toMatch(/highest point.*graph/i);
      expect(output.solutionSteps[0]?.expression).toMatch(/^Vertex = \(/);
      expect(output.solutionSteps[1]?.description).toMatch(/y-coordinate.*vertex/i);
      expect(output.solutionSteps[1]?.expression).toBe(`Maximum = ${maximum}`);
      expect(generatorOutputSchema.safeParse(output).success).toBe(true);
    }
  });

  it("keeps every maximum-reading seed downward, finite, correct, deterministic, and varied", () => {
    const generator = getGenerator("quadratic-graph-analysis");
    const equations = new Set<string>();
    const maxima = new Set<number>();

    for (let seed = 0; seed < 1000; seed += 1) {
      const input = { nodeId: MAXIMUM_READING_NODE_ID, seed, difficulty: 0.5 };
      const output = generator.generate(input);
      const repeat = generator.generate(input);
      const data = output.data as {
        a: number;
        b: number;
        c: number;
        rendererProps: Record<string, unknown>;
      };
      const expectedAnswer = output.expectedAnswer as { maximum_value: number };
      const vertexX = -data.b / (2 * data.a);
      const vertexY = data.c - data.b ** 2 / (4 * data.a);

      expect(repeat).toEqual(output);
      expect(data.a).toBe(-1);
      expect(Number.isFinite(vertexX)).toBe(true);
      expect(Number.isFinite(vertexY)).toBe(true);
      expect(output.prompt).toBe("Use the displayed graph to identify its maximum value.");
      expect(output.prompt).not.toContain(data.rendererProps.equation as string);
      expect(output.prompt).not.toMatch(/\b(?:a|b|c)\s*=/i);
      expect(expectedAnswer).toEqual({ maximum_value: vertexY });
      expect(output.gradingMetadata).toEqual({
        partAnswers: { maximum_value: vertexY },
        partMaxScores: { maximum_value: 1 },
        partGradingRules: { maximum_value: "numeric_tolerance" },
      });
      expect(data.rendererProps).toEqual({
        equation: expect.any(String),
        variant: "plot_from_equation",
        responseVariant: "maximum_value",
        domain: [-5, 5],
        range: [-10, 10],
      });
      expect(output.solutionSteps).toEqual([
        {
          description: "Locate the highest point on the displayed graph",
          expression: `Vertex = (${vertexX}, ${vertexY})`,
        },
        {
          description: "Take the y-coordinate of the vertex",
          expression: `Maximum = ${vertexY}`,
          value: vertexY,
        },
      ]);
      expect(output.solutionSteps[0]?.description).toMatch(/highest point.*graph/i);
      expect(output.solutionSteps[0]?.expression).toMatch(/^Vertex = \(/);
      expect(output.solutionSteps[1]?.description).toMatch(/y-coordinate.*vertex/i);
      expect(output.solutionSteps[1]?.expression).toBe(`Maximum = ${vertexY}`);
      equations.add(data.rendererProps.equation as string);
      maxima.add(vertexY);
    }

    expect(equations.size).toBeGreaterThan(1);
    expect(maxima.size).toBeGreaterThan(1);
  });

  it("keeps the existing graph and domain-range outputs unchanged", () => {
    const generator = getGenerator("quadratic-graph-analysis");

    expect(generator.generate({ nodeId: GRAPH_NODE_ID, seed: 1, difficulty: 0.5 })).toEqual({
      prompt:
        "Complete the table for y = x^2 - x - 2 using x = -2, -1, 0, 1, 2, then plot all five points.",
      data: {
        a: 1,
        b: -1,
        c: -2,
        difficulty: 0.5,
        tableValues: [
          { x: -2, y: 4 },
          { x: -1, y: 0 },
          { x: 0, y: -2 },
          { x: 1, y: -2 },
          { x: 2, y: 0 },
        ],
        rendererProps: {
          equation: "y = x^2 - x - 2",
          variant: "plot_from_equation",
          responseVariant: "table_graph",
          domain: [-5, 5],
          range: [-10, 10],
        },
      },
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
      solutionSteps: [
        {
          description: "Substitute each x-value",
          expression: "y = x^2 - x - 2 for x = -2, -1, 0, 1, 2",
        },
        {
          description: "Complete the table",
          expression: "(-2, 4), (-1, 0), (0, -2), (1, -2), (2, 0)",
        },
        {
          description: "Plot all five points",
          expression: "(-2, 4), (-1, 0), (0, -2), (1, -2), (2, 0)",
        },
      ],
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
        partGradingRules: { table_values: "custom", placed_points: "custom" },
      },
    });

    expect(generator.generate({ nodeId: DOMAIN_RANGE_NODE_ID, seed: 2, difficulty: 0.5 })).toEqual({
      prompt:
        "Use the displayed quadratic graph to state the domain and range of y = -x^2 + x - 1.",
      data: {
        a: -1,
        b: 1,
        c: -1,
        difficulty: 0.5,
        rendererProps: {
          equation: "y = -x^2 + x - 1",
          variant: "plot_from_equation",
          responseVariant: "domain_range",
          domain: [-5, 5],
          range: [-10, 10],
        },
      },
      expectedAnswer: { domain: "all_real_numbers", range: { relation: "lte", boundary: -0.75 } },
      solutionSteps: [
        {
          description: "State the domain of a quadratic function",
          expression: "Domain = all real numbers",
        },
        {
          description: "Use the vertex to find the range boundary",
          expression: "y = -0.75",
          value: -0.75,
        },
        {
          description: "State the range from the opening direction",
          expression: "Range: y ≤ -0.75",
          value: { relation: "lte", boundary: -0.75 },
        },
      ],
      gradingMetadata: {
        partAnswers: { domain: "all_real_numbers", range: { relation: "lte", boundary: -0.75 } },
        partMaxScores: { domain: 1, range: 1 },
        partGradingRules: { domain: "exact_match", range: "custom" },
      },
    });
  });
});
