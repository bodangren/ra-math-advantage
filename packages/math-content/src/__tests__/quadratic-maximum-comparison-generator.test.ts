import { describe, expect, it } from "vitest";
import {
  generatorOutputSchema,
  type GeneratorOutput,
} from "@math-platform/knowledge-space-practice";
import { parseQuadratic } from "@math-platform/graphing-core";

import { graphingExplorerSchema } from "../schemas/graphing-explorer.schema";
import { getGenerator } from "../knowledge-space/generators/registry";

const COMPARISON_NODE_ID = "math.im3.skill.1.1.compare-maximum-values-of-quadratic-functions";

describe("quadratic-graph-analysis comparison maximum generator", () => {
  it("generates deterministic comparison maximum outputs across all seeds", () => {
    const generator = getGenerator("quadratic-graph-analysis");
    const outputs: GeneratorOutput[] = [];
    const repeats: GeneratorOutput[] = [];

    for (let seed = 0; seed < 1000; seed += 1) {
      const input = { nodeId: COMPARISON_NODE_ID, seed, difficulty: 0.5 };
      outputs.push(generator.generate(input));
      repeats.push(generator.generate(input));
    }

    expect(generator.nodeIds).toContain(COMPARISON_NODE_ID);

    const equationPairs = new Set<string>();
    const winners = new Set<"first" | "second">();

    for (let index = 0; index < outputs.length; index += 1) {
      const output = outputs[index];
      const repeat = repeats[index];
      if (!output || !repeat) throw new Error("Expected generated output for every seed");

      expect(repeat).toEqual(output);
      expect(generatorOutputSchema.safeParse(output).success).toBe(true);

      const data = output.data as {
        rendererProps: {
          equation: string;
          variant: string;
          responseVariant: string;
          comparisonEquation: string;
          comparisonQuestion: string;
          comparisonAnswer: "first" | "second";
          vertex: [number, number];
          yIntercept: [number, number];
          domain: [number, number];
          range: [number, number];
        };
      };
      const props = data.rendererProps;
      const first = parseQuadratic(props.equation);
      const second = parseQuadratic(props.comparisonEquation);

      expect(graphingExplorerSchema.safeParse(props).success).toBe(true);
      expect(Object.keys(props).sort()).toEqual(
        [
          "equation",
          "variant",
          "responseVariant",
          "comparisonEquation",
          "comparisonQuestion",
          "comparisonAnswer",
          "vertex",
          "yIntercept",
          "domain",
          "range",
        ].sort(),
      );
      expect(props.variant).toBe("compare_functions");
      expect(props.responseVariant).toBe("compare_maximums");
      expect(props.comparisonQuestion).toBe(output.prompt);
      expect(["first", "second"]).toContain(props.comparisonAnswer);
      expect(first).not.toBeNull();
      expect(second).not.toBeNull();
      if (!first || !second) throw new Error("Expected both emitted equations to parse");

      expect(Number.isFinite(first.a)).toBe(true);
      expect(first.a).not.toBe(0);
      expect(first.a).toBeLessThan(0);
      expect(Number.isFinite(second.a)).toBe(true);
      expect(second.a).not.toBe(0);
      expect(second.a).toBeLessThan(0);

      const firstVertexX = -first.b / (2 * first.a);
      const firstMaximum = first.c - first.b ** 2 / (4 * first.a);
      const secondVertexX = -second.b / (2 * second.a);
      const secondMaximum = second.c - second.b ** 2 / (4 * second.a);
      const expectedWinner = firstMaximum > secondMaximum ? "first" : "second";
      const reflectedPoint = {
        x: 2 * secondVertexX - props.yIntercept[0],
        y: props.yIntercept[1],
      };

      expect(Number.isFinite(firstVertexX)).toBe(true);
      expect(Number.isFinite(firstMaximum)).toBe(true);
      expect(Number.isFinite(secondVertexX)).toBe(true);
      expect(Number.isFinite(secondMaximum)).toBe(true);
      expect(firstMaximum).not.toBe(secondMaximum);
      expect([1, 2, 3]).toContain(firstVertexX);
      expect([1, 2]).toContain(secondVertexX);
      expect(firstMaximum).toBeGreaterThanOrEqual(-2);
      expect(firstMaximum).toBeLessThanOrEqual(7);
      expect(secondMaximum).toBeGreaterThanOrEqual(-2);
      expect(secondMaximum).toBeLessThanOrEqual(7);
      expect(Math.abs(second.c)).toBeLessThanOrEqual(14);
      expect(props.comparisonAnswer).toBe(expectedWinner);
      expect(props.vertex).toEqual([secondVertexX, secondMaximum]);
      expect(props.yIntercept).toEqual([0, second.c]);
      expect(props.domain[0]).toBeLessThan(props.domain[1]);
      expect(props.range[0]).toBeLessThan(props.range[1]);
      for (const value of [...props.domain, ...props.range]) {
        expect(Number.isFinite(value)).toBe(true);
      }

      for (const point of [
        { x: firstVertexX, y: firstMaximum },
        { x: secondVertexX, y: secondMaximum },
        { x: props.yIntercept[0], y: props.yIntercept[1] },
        reflectedPoint,
      ]) {
        expect(point.x).toBeGreaterThan(props.domain[0]);
        expect(point.x).toBeLessThan(props.domain[1]);
        expect(point.y).toBeGreaterThan(props.range[0]);
        expect(point.y).toBeLessThan(props.range[1]);
      }

      expect(output.prompt).toMatch(/f\(x\).*shown/i);
      expect(output.prompt).toMatch(/\bg(?:\(x\))?\b/i);
      expect(output.prompt).toMatch(/vertex/i);
      expect(output.prompt).toMatch(/y-intercept/i);
      expect(output.prompt).toContain(`(${secondVertexX}, ${secondMaximum})`);
      expect(output.prompt).toContain(`y-intercept of ${second.c}`);
      expect(output.prompt).not.toContain(`y-intercept of (0,`);
      expect(output.prompt).not.toContain(props.equation);
      expect(output.prompt).not.toContain(props.comparisonEquation);
      expect(output.prompt).not.toContain(`(${reflectedPoint.x}, ${reflectedPoint.y})`);
      expect(output.prompt).not.toMatch(
        /\b(?:f|g)\(x\)\s+(?:has|has a)\s+(?:maximum|maximum value)\b/i,
      );
      expect(output.prompt).not.toMatch(/\bmaximum(?: value)?\s+of\s+(?:f|g)\(x\)\b/i);

      expect(Object.keys(output.expectedAnswer)).toEqual(["greater_maximum"]);
      expect(output.expectedAnswer).toEqual({ greater_maximum: expectedWinner });
      expect(output.gradingMetadata).toEqual({
        partAnswers: { greater_maximum: expectedWinner },
        partMaxScores: { greater_maximum: 1 },
        partGradingRules: { greater_maximum: "exact_match" },
      });
      expect(output.solutionSteps).toHaveLength(4);
      expect(output.solutionSteps[0]?.description).toMatch(/f.*maximum/i);
      expect(output.solutionSteps[1]?.description).toMatch(/g.*(?:vertex|maximum)/i);
      expect(output.solutionSteps[2]?.description).toMatch(/compare.*value/i);
      expect(output.solutionSteps[2]?.expression).toBe(
        `${firstMaximum} ${firstMaximum > secondMaximum ? ">" : "<"} ${secondMaximum}`,
      );
      const finalStep = `${output.solutionSteps[3]?.description ?? ""} ${output.solutionSteps[3]?.expression ?? ""}`;
      expect(finalStep).toMatch(/greater/i);
      expect(finalStep).toContain(expectedWinner === "first" ? "f(x)" : "g(x)");
      const winnerFunction = expectedWinner === "first" ? "f(x)" : "g(x)";
      expect(output.solutionSteps[3]?.expression).toBe(
        `${winnerFunction} has the greater maximum value.`,
      );

      equationPairs.add(`${props.equation}|${props.comparisonEquation}`);
      winners.add(props.comparisonAnswer);
    }

    expect(equationPairs.size).toBeGreaterThan(1);
    expect(winners.has("first")).toBe(true);
    expect(winners.has("second")).toBe(true);
  });
});
