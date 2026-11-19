import type { GeneratorInput, GeneratorOutput } from "@math-platform/knowledge-space-practice";
import { IM1_GENERATORS } from "../../problem-families/im1/generators";

export type IM1TranslationMode = "worked_example" | "guided_practice" | "independent_practice";

export interface IM1TranslationProjection {
  componentKey: "fill-in-the-blank";
  props: {
    activityId: string;
    mode: "teaching" | "guided" | "practice";
    template: string;
    blanks: Array<{
      id: "expression";
      isMath: true;
      correctAnswer?: string;
      acceptedAnswers?: string[];
    }>;
    reasoningSteps?: Array<{ description: string; expression: string }>;
    guidedSupport?: {
      feedback: "on_check";
      hints: string[];
      revealAfterAttempts: 1;
    };
  };
}

export interface IM1TranslationGrade {
  score: number;
  maxScore: 1;
  parts: Array<{
    partId: "expression";
    rawAnswer: string;
    isCorrect: boolean;
    score: number;
    maxScore: 1;
  }>;
}

const entry = IM1_GENERATORS.find(
  (candidate) => candidate.skillIdKey === "1-1-verbal-to-numerical",
);

if (!entry) {
  throw new Error("The IM1 verbal-to-numerical generator is not registered.");
}
const verbalToNumericalEntry = entry;

function normalizeNotation(value: string): string {
  return value
    .toLowerCase()
    .replace(/\\left|\\right/g, "")
    .replace(/\\times|\\cdot|×/g, "*")
    .replace(/\\div|÷/g, "/")
    .replace(/[−–]/g, "-")
    .replace(/\s+/g, "");
}

function acceptedExpressions(output: GeneratorOutput): string[] {
  const forms = output.data.acceptedExpressions;
  if (!Array.isArray(forms) || forms.some((form) => typeof form !== "string")) {
    throw new Error("The IM1 translation generator did not provide accepted expressions.");
  }
  return forms;
}

/**
 * Generate one deterministic expression-translation problem.
 * @param {GeneratorInput} input - Server-owned generator settings.
 * @returns {GeneratorOutput} Problem and private grading data.
 */
export function generateIM1VerbalToNumericalOutput(input: GeneratorInput): GeneratorOutput {
  return verbalToNumericalEntry.generate(input);
}

/**
 * Build the selected mode's display props without Independent answer data.
 * @param {GeneratorInput} input - Server-owned generator settings.
 * @param {IM1TranslationMode} mode - Requested learning mode.
 * @param {string} activityId - Exact activity identity.
 * @returns {IM1TranslationProjection} Display component and mode props.
 */
export function projectIM1VerbalToNumerical(
  input: GeneratorInput,
  mode: IM1TranslationMode,
  activityId: string,
): IM1TranslationProjection {
  const output = generateIM1VerbalToNumericalOutput(input);
  const verbal = output.data.verbal;
  const expression = output.data.expression;
  if (typeof verbal !== "string" || typeof expression !== "string") {
    throw new Error("The IM1 translation generator returned invalid public content.");
  }

  const blank = { id: "expression" as const, isMath: true as const };
  const displayExpression = expression.replace(/\*/g, "×").replace(/\//g, "÷");
  const reasoningSteps = output.solutionSteps
    .filter((step) => step.description !== "Evaluate" && typeof step.expression === "string")
    .map((step) => ({ description: step.description, expression: step.expression as string }));
  if (!reasoningSteps.some((step) => step.expression === displayExpression)) {
    reasoningSteps.push({
      description: "Write the complete numerical expression.",
      expression: displayExpression,
    });
  }
  return {
    componentKey: "fill-in-the-blank",
    props: {
      activityId,
      mode:
        mode === "worked_example" ? "teaching" : mode === "guided_practice" ? "guided" : "practice",
      template: `Write a numerical expression for “${verbal}”: {{blank:expression}}`,
      blanks:
        mode === "independent_practice"
          ? [blank]
          : [
              {
                ...blank,
                correctAnswer: expression,
                acceptedAnswers: [...acceptedExpressions(output)],
              },
            ],
      ...(mode === "worked_example" && { reasoningSteps }),
      ...(mode === "guided_practice" && {
        guidedSupport: {
          feedback: "on_check" as const,
          hints: reasoningSteps
            .slice(0, -1)
            .map((step) => `${step.description} ${step.expression}`)
            .slice(0, 2),
          revealAfterAttempts: 1 as const,
        },
      }),
    },
  };
}

/**
 * Compare the response with the generated finite expression forms.
 * @param {GeneratorInput} input - Server-owned generator settings.
 * @param {{ expression: string }} answers - Validated learner response.
 * @returns {IM1TranslationGrade} Exact expression-part grade.
 */
export function gradeIM1VerbalToNumerical(
  input: GeneratorInput,
  answers: { expression: string },
): IM1TranslationGrade {
  const output = generateIM1VerbalToNumericalOutput(input);
  const normalizedAnswer = normalizeNotation(answers.expression);
  const isCorrect = acceptedExpressions(output).some(
    (form) => normalizeNotation(form) === normalizedAnswer,
  );
  const score = isCorrect ? 1 : 0;
  return {
    score,
    maxScore: 1,
    parts: [
      {
        partId: "expression",
        rawAnswer: answers.expression,
        isCorrect,
        score,
        maxScore: 1,
      },
    ],
  };
}

export const im1VerbalToNumericalGenerator = {
  key: "1-1-verbal-to-numerical",
  nodeIds: [...verbalToNumericalEntry.nodeIds],
  description: "Generates IM1 verbal-to-numerical expression translations.",
  generate: generateIM1VerbalToNumericalOutput,
};
