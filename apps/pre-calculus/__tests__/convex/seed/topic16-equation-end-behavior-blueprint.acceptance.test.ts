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
  generateTopic16EquationEndBehaviorOutput,
  getGenerator,
} from "@math-platform/math-content/knowledge-space";
import {
  getPropsSchema,
  polynomialEquationEndBehaviorSchema,
} from "@math-platform/math-content/schemas";

const TEST_DIR = path.dirname(fileURLToPath(import.meta.url));
const GRAPH_DIR = path.resolve(TEST_DIR, "../../../curriculum/skill-graph");
const NODE_ID = "math.precalc.skill.1.6.determine-polynomial-end-behavior-from-equations";
const SOURCE_ID = "math.precalc.example.1.6.003";
const ALIGNMENT_IDS = ["math.standard.ccss.hsf-if-b-4", "math.standard.ccss.hsf-if-c-7c"] as const;
const RENDERER_KEY = "polynomial-equation-end-behavior";
const GENERATOR_KEY = "topic16-equation-end-behavior";
const GUIDED_STEPS = [
  "Identify the leading term for each polynomial.",
  "Use degree parity and the leading coefficient.",
  "Record whether each left and right end goes up or down.",
] as const;
const PART_IDS = [
  "a_leftEnd",
  "a_rightEnd",
  "b_leftEnd",
  "b_rightEnd",
  "c_leftEnd",
  "c_rightEnd",
  "d_leftEnd",
  "d_rightEnd",
  "e_leftEnd",
  "e_rightEnd",
  "f_leftEnd",
  "f_rightEnd",
] as const;
const AUTHORITY_KEYS = [
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
] as const;

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
    expect(AUTHORITY_KEYS).not.toContain(key);
    expectNoAuthority(child);
  }
}

describe("Topic 1.6 Example 3 equation-end-behavior blueprint", () => {
  it("stores the exact non-ready three-mode source blueprint", () => {
    const workedOutput = generateTopic16EquationEndBehaviorOutput(0);
    const guidedOutput = generateTopic16EquationEndBehaviorOutput(1);
    const independentOutput = generateTopic16EquationEndBehaviorOutput(2);
    const workedProps = {
      ...(workedOutput.data.rendererProps as Record<string, unknown>),
      presentationMode: "worked_example",
      correctAnswers: workedOutput.expectedAnswer,
      steps: workedOutput.solutionSteps.map((step) => step.description),
      finalAnswer: "The six polynomial end behaviors are shown above.",
    };
    const guidedProps = {
      ...(guidedOutput.data.rendererProps as Record<string, unknown>),
      presentationMode: "guided_practice",
      guidedSteps: GUIDED_STEPS,
      fieldHelp: "Choose Up or Down for the left and right end of each polynomial.",
    };
    const independentProps = independentOutput.data.rendererProps;
    const expectedAnswerSchema = Object.fromEntries(PART_IDS.map((partId) => [partId, "string"]));
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
        givens: [
          "Each equation has a degree and a leading coefficient that determine its two end directions.",
        ],
        target: workedOutput.expectedAnswer,
        steps: workedOutput.solutionSteps.map((step) => ({ description: step.description })),
        explanation:
          "For each equation, identify the leading term. An even degree gives matching end directions. An odd degree gives opposite end directions. A positive leading coefficient sends the right end up. A negative leading coefficient sends the right end down.",
        rendererProps: workedProps,
      },
      guidedPracticeSpec: {
        scaffoldedPrompt: guidedOutput.prompt,
        stepPrompts: GUIDED_STEPS,
        hints: [
          "Find the term with the greatest exponent in each equation.",
          "Use degree parity to decide whether the ends match or differ. Use the leading-coefficient sign to decide the right end.",
          "Choose Up or Down for both ends of each polynomial.",
        ],
        checksPerStep: [
          { check: "The leading term is identified for each polynomial." },
          { check: "Degree parity and leading-coefficient sign are used for each polynomial." },
          { check: "A left-end and right-end direction is recorded for each polynomial." },
        ],
        revealPolicy: "one_at_a_time",
        rendererProps: guidedProps,
      },
      independentPracticeSpec: {
        variantParameters: {
          seed: {
            type: "integer",
            min: 0,
            description: "Deterministic Topic 1.6 polynomial equation end-behavior variant seed",
          },
        },
        answerSchema: expectedAnswerSchema,
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
        passingScore: 12,
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
    expect(blueprints).toHaveLength(81);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids[targetIndex - 1]).toBe(
      "math.precalc.skill.1.5.solve-polynomial-inequalities-using-sign-charts",
    );
    expect(ids[targetIndex + 1]).toBe(
      "math.precalc.skill.1.6.write-polynomial-end-behavior-in-limit-notation",
    );
    expect(targetRows).toEqual([expectedBlueprint]);
    expect(knowledgeBlueprintSchema.safeParse(targetRows[0]).success).toBe(true);
    expect(validateBlueprintGeneratorReadiness(targetRows[0] as never).valid).toBe(true);
    expect(validateModeSupport(targetRows[0] as never).valid).toBe(true);
    expect(validateGradingCompatibility(targetRows[0] as never).valid).toBe(true);
    expect(polynomialEquationEndBehaviorSchema.safeParse(workedProps).success).toBe(true);
    expect(polynomialEquationEndBehaviorSchema.safeParse(guidedProps).success).toBe(true);
    expect(polynomialEquationEndBehaviorSchema.safeParse(independentProps).success).toBe(true);
    expect(getPropsSchema(RENDERER_KEY)).toBe(polynomialEquationEndBehaviorSchema);
    expect(getGenerator(GENERATOR_KEY).nodeIds).toEqual([NODE_ID]);
    expectNoAuthority(guidedProps);
    expectNoAuthority(independentProps);
    expect(JSON.stringify(targetRows[0])).not.toContain("independentPracticeReady");
  });
});
