import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";
import {
  knowledgeBlueprintSchema,
  validateBlueprintGeneratorReadiness,
  validateGradingCompatibility,
  validateModeSupport,
} from "@math-platform/knowledge-space-practice";
import {
  generateTopic16LimitNotationEndBehaviorOutput,
  getGenerator,
} from "@math-platform/math-content/knowledge-space";
import {
  getPropsSchema,
  polynomialLimitNotationEndBehaviorSchema,
  SCHEMA_REGISTRY,
} from "@math-platform/math-content/schemas";

const TEST_DIR = path.dirname(fileURLToPath(import.meta.url));
const GRAPH_DIR = path.resolve(TEST_DIR, "../../../curriculum/skill-graph");
const NODE_ID = "math.precalc.skill.1.6.write-polynomial-end-behavior-in-limit-notation";
const SOURCE_ID = "math.precalc.example.1.6.004";
const ALIGNMENT_IDS = ["math.standard.ccss.hsf-if-b-4", "math.standard.ccss.hsf-if-c-7c"] as const;
const RENDERER_KEY = "polynomial-limit-notation-end-behavior";
const GENERATOR_KEY = "topic16-limit-notation-end-behavior";
const PART_IDS = ["a_leftLimit", "a_rightLimit", "b_leftLimit", "b_rightLimit"] as const;
const GUIDED_STEPS = [
  "Identify the leading term for each polynomial.",
  "Use degree parity and the leading coefficient.",
  "Write the left-end and right-end limit statements.",
] as const;
const FIELD_HELP = "Choose positive infinity or negative infinity for each formal limit statement.";

type JsonDocument = {
  blueprints?: Array<Record<string, unknown>>;
};

function readJson(fileName: string): JsonDocument {
  return JSON.parse(fs.readFileSync(path.join(GRAPH_DIR, fileName), "utf8")) as JsonDocument;
}

function expectNoAuthority(value: unknown): void {
  if (Array.isArray(value)) {
    value.forEach(expectNoAuthority);
    return;
  }
  if (!value || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value)) {
    expect([
      "answer",
      "answerKey",
      "correctAnswer",
      "correctAnswers",
      "expectedAnswer",
      "grading",
      "gradingMetadata",
      "isCorrect",
      "normalizedAnswer",
      "score",
      "solution",
      "solutionSteps",
      "steps",
      "finalAnswer",
      "authority",
    ]).not.toContain(key);
    expectNoAuthority(child);
  }
}

describe("Topic 1.6 Example 4 limit-notation blueprint", () => {
  it("stores the exact source-backed three-mode blueprint", () => {
    const workedOutput = generateTopic16LimitNotationEndBehaviorOutput(0);
    const guidedOutput = generateTopic16LimitNotationEndBehaviorOutput(1);
    const independentOutput = generateTopic16LimitNotationEndBehaviorOutput(2);
    const workedProps = {
      ...(workedOutput.data.rendererProps as Record<string, unknown>),
      presentationMode: "worked_example",
      correctAnswers: workedOutput.expectedAnswer,
      steps: workedOutput.solutionSteps.map((step) => step.description),
      finalAnswer: "The four polynomial end-behavior limit statements are shown above.",
    };
    const guidedProps = {
      ...(guidedOutput.data.rendererProps as Record<string, unknown>),
      presentationMode: "guided_practice",
      guidedSteps: GUIDED_STEPS,
      fieldHelp: FIELD_HELP,
    };
    const independentProps = independentOutput.data.rendererProps;
    const answerSchema = Object.fromEntries(PART_IDS.map((partId) => [partId, "string"]));
    const expectedBlueprint = {
      nodeId: NODE_ID,
      sourceNodeIds: [SOURCE_ID],
      alignmentNodeIds: ALIGNMENT_IDS,
      rendererKey: RENDERER_KEY,
      rendererModeMap: {
        worked: RENDERER_KEY,
        guidedPractice: RENDERER_KEY,
        independentPractice: RENDERER_KEY,
      },
      workedExampleSpec: {
        prompt: workedOutput.prompt,
        givens: ["Each polynomial's leading term determines its two end-behavior limits."],
        target: workedOutput.expectedAnswer,
        steps: workedOutput.solutionSteps.map((step) => ({
          description: step.description,
        })),
        explanation:
          "Identify each leading term. Use degree parity to decide whether the two limits match. Use the leading-coefficient sign to decide the right-end limit. Then write both formal limit statements.",
        rendererProps: workedProps,
      },
      guidedPracticeSpec: {
        scaffoldedPrompt: guidedOutput.prompt,
        stepPrompts: GUIDED_STEPS,
        hints: [
          "Find the term with the greatest exponent in each polynomial.",
          "An even degree gives matching limits. An odd degree gives opposite limits. The leading-coefficient sign determines the right-end limit.",
          "Choose positive infinity or negative infinity for each formal limit statement.",
        ],
        checksPerStep: [
          { check: "The leading term is identified for each polynomial." },
          {
            check: "Degree parity and leading-coefficient sign are used for each polynomial.",
          },
          {
            check: "Both formal limit statements are recorded for each polynomial.",
          },
        ],
        revealPolicy: "one_at_a_time",
        rendererProps: guidedProps,
      },
      independentPracticeSpec: {
        variantParameters: {
          seed: {
            type: "integer",
            min: 0,
            description:
              "Deterministic Topic 1.6 polynomial limit-notation end-behavior variant seed",
          },
        },
        answerSchema,
        gradingRules: PART_IDS.map((partId) => ({
          partId,
          ruleType: "exact_match",
          maxScore: 1,
        })),
        replayPolicy: "any_seed",
        rendererProps: independentProps,
      },
      generatorKey: GENERATOR_KEY,
      gradingSpec: {
        partIds: [...PART_IDS],
        passingScore: 4,
        partialCredit: true,
      },
      reviewStatus: "draft",
      metadata: { course: "precalc", unit: "1", lesson: "6" },
    };

    const blueprints = readJson("blueprints.json").blueprints ?? [];
    const targetRows = blueprints.filter((blueprint) => blueprint.nodeId === NODE_ID);
    const ids = blueprints.map((blueprint) => blueprint.nodeId);
    const targetIndex = ids.indexOf(NODE_ID);

    expect(targetRows).toHaveLength(1);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids[targetIndex - 1]).toBe(
      "math.precalc.skill.1.6.determine-polynomial-end-behavior-from-equations",
    );
    expect(ids[targetIndex + 1]).toBe(
      "math.precalc.skill.1.7.classify-rational-end-behavior-three-cases",
    );
    expect(targetRows).toEqual([expectedBlueprint]);
    expect(knowledgeBlueprintSchema.safeParse(targetRows[0]).success).toBe(true);
    expect(validateBlueprintGeneratorReadiness(targetRows[0] as never).valid).toBe(true);
    expect(validateModeSupport(targetRows[0] as never).valid).toBe(true);
    expect(validateGradingCompatibility(targetRows[0] as never).valid).toBe(true);
    expect(polynomialLimitNotationEndBehaviorSchema.safeParse(workedProps).success).toBe(true);
    expect(polynomialLimitNotationEndBehaviorSchema.safeParse(guidedProps).success).toBe(true);
    expect(polynomialLimitNotationEndBehaviorSchema.safeParse(independentProps).success).toBe(true);
    expect(getPropsSchema(RENDERER_KEY)).toBe(polynomialLimitNotationEndBehaviorSchema);
    expect(SCHEMA_REGISTRY[RENDERER_KEY]).toBe(polynomialLimitNotationEndBehaviorSchema);
    expect(getGenerator(GENERATOR_KEY).nodeIds).toEqual([NODE_ID]);
    expectNoAuthority(guidedProps);
    expectNoAuthority(independentProps);
    expect(JSON.stringify(targetRows[0])).not.toContain("independentPracticeReady");
  });
});
