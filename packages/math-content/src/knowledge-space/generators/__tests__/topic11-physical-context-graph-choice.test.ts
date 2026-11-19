import { describe, expect, it } from "vitest";
import { generatorOutputSchema } from "@math-platform/knowledge-space-practice";

import { physicalContextGraphChoiceSchema } from "../../../schemas/physical-context-graph-choice.schema";
import {
  generateTopic11PhysicalContextGraphChoice,
  generateTopic11PhysicalContextGraphChoiceOutput,
  TOPIC11_PHYSICAL_CONTEXT_GRAPH_CHOICE_NODE_ID,
} from "../topic11-physical-context-graph-choice";
import { getGenerator } from "../registry";

const seedZero = {
  seed: 0,
  prompt:
    "The figure shows an empty vase. At t = 0, water pours into the vase at a constant rate until the vase is full. Time in seconds is the independent variable, and water height in inches is the dependent variable. Select the possible graph.",
  contextDescription: "The vase has a narrow base, a wide rounded middle, and a narrow neck.",
  xLabel: "Time (seconds)",
  yLabel: "Height (inches)",
  containerProfile: "narrow-wide-narrow",
  options: [
    {
      id: "A",
      label: "A",
      shape: "linear-increasing",
      accessibleDescription: "A straight line that rises at a constant rate.",
    },
    {
      id: "B",
      label: "B",
      shape: "slope-increases-then-decreases",
      accessibleDescription:
        "A graph that stays increasing while its slope increases and then decreases.",
    },
    {
      id: "C",
      label: "C",
      shape: "rise-fall-rise",
      accessibleDescription: "A graph that rises, then falls, then rises again.",
    },
    {
      id: "D",
      label: "D",
      shape: "steep-gentle-steep",
      accessibleDescription: "A graph that rises steeply, then gently, then steeply.",
    },
  ],
  correctOptionId: "D",
  reasoning: [
    "Time in seconds is the independent variable, and water height in inches is the dependent variable.",
    "A constant inflow does not make height increase at a constant rate because the vase width changes.",
    "The narrow base, wide middle, and narrow neck produce fast, gentle, and fast height change, so graph D is possible.",
  ],
};

describe("topic11 physical-context graph-choice generator", () => {
  it("resolves the exact registry entry and node objective", () => {
    const generator = getGenerator("topic11-physical-context-graph-choice");

    expect(generator.key).toBe("topic11-physical-context-graph-choice");
    expect(generator.nodeIds).toEqual([TOPIC11_PHYSICAL_CONTEXT_GRAPH_CHOICE_NODE_ID]);
  });

  it("returns the source-faithful seed-0 variant", () => {
    expect(generateTopic11PhysicalContextGraphChoice(0)).toEqual(seedZero);
  });

  it("is deterministic and produces all profiles, correct letters, and varying assignments", () => {
    const variants = Array.from({ length: 60 }, (_, seed) =>
      generateTopic11PhysicalContextGraphChoice(seed),
    );
    expect(generateTopic11PhysicalContextGraphChoice(17)).toEqual(
      generateTopic11PhysicalContextGraphChoice(17),
    );
    expect(new Set(variants.map((variant) => variant.containerProfile))).toEqual(
      new Set(["constant-width", "wide-narrow-wide", "narrow-wide-narrow"]),
    );
    expect(new Set(variants.map((variant) => variant.correctOptionId)).size).toBeGreaterThanOrEqual(
      3,
    );
    expect(
      new Set(variants.map((variant) => variant.options.map((option) => option.shape).join("|")))
        .size,
    ).toBeGreaterThan(1);
  });

  it("keeps every generated option assignment and Independent props valid", () => {
    const expectedCorrectShapes = {
      "constant-width": "linear-increasing",
      "wide-narrow-wide": "slope-increases-then-decreases",
      "narrow-wide-narrow": "steep-gentle-steep",
    } as const;

    for (let seed = 0; seed < 40; seed += 1) {
      const variant = generateTopic11PhysicalContextGraphChoice(seed);
      expect(variant.options).toHaveLength(4);
      expect(new Set(variant.options.map((option) => option.id)).size).toBe(4);
      expect(new Set(variant.options.map((option) => option.shape)).size).toBe(4);
      const correct = variant.options.find((option) => option.id === variant.correctOptionId);
      expect(correct).toBeDefined();
      expect(correct?.shape).toBe(expectedCorrectShapes[variant.containerProfile]);
      expect(variant.reasoning.length).toBeGreaterThanOrEqual(3);
      expect(variant.reasoning.every((step) => step.trim().length > 0)).toBe(true);
      expect(JSON.stringify(variant.reasoning)).not.toMatch(/placeholder|stub|TODO/i);
      expect(JSON.stringify(variant.reasoning)).not.toMatch(
        /constant-width|wide-narrow-wide|narrow-wide-narrow|slope-increases-then-decreases|steep-gentle-steep/i,
      );
      const {
        seed: _seed,
        reasoning: _reasoning,
        correctOptionId: _correctOptionId,
        ...independentProps
      } = variant;
      expect(
        physicalContextGraphChoiceSchema.safeParse({
          ...independentProps,
          presentationMode: "independent_practice",
        }).success,
      ).toBe(true);
    }
  });

  it("adapts pure variants to strict GeneratorOutput without solution leakage", () => {
    for (const seed of [0, 1, 2]) {
      const variant = generateTopic11PhysicalContextGraphChoice(seed);
      const output = generateTopic11PhysicalContextGraphChoiceOutput(seed);
      expect(generatorOutputSchema.safeParse(output).success).toBe(true);
      expect(output.prompt).toBe(variant.prompt);
      expect(output.expectedAnswer).toEqual({ selectedOptionId: variant.correctOptionId });
      expect(output.solutionSteps).toEqual(
        variant.reasoning.map((description) => ({ description })),
      );
      expect(output.gradingMetadata).toEqual({
        partAnswers: { selectedOptionId: variant.correctOptionId },
        partMaxScores: { selectedOptionId: 1 },
        partGradingRules: { selectedOptionId: "exact_match" },
      });
      const data = output.data as { seed: number; rendererProps: Record<string, unknown> };
      expect(data.seed).toBe(seed);
      expect(Object.keys(data.rendererProps).sort()).toEqual([
        "containerProfile",
        "contextDescription",
        "options",
        "presentationMode",
        "prompt",
        "xLabel",
        "yLabel",
      ]);
      expect(data.rendererProps).not.toHaveProperty("correctOptionId");
      expect(data.rendererProps).not.toHaveProperty("reasoning");
      expect(physicalContextGraphChoiceSchema.safeParse(data.rendererProps).success).toBe(true);
    }
  });

  it("rejects invalid seeds", () => {
    for (const seed of [-1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
      expect(() => generateTopic11PhysicalContextGraphChoice(seed)).toThrow(RangeError);
    }
  });
});
