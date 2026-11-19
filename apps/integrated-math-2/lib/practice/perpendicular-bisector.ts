import { gradeQuestion, type Question } from "./question";
export const nodeId = "math.im2.skill.1.1.perpendicular-bisector-equidistance";
export type PerpendicularBisectorMode =
  | "worked_example"
  | "guided_practice"
  | "independent_practice";
/** A finite family of valid equations. Reusing a seed replays the same question. */
export function generatePerpendicularBisector(input: {
  nodeId: string;
  seed: number;
  difficulty: number;
}) {
  if (
    input.nodeId !== nodeId ||
    !Number.isSafeInteger(input.seed) ||
    input.seed < 0 ||
    !Number.isFinite(input.difficulty) ||
    input.difficulty < 0 ||
    input.difficulty > 1
  )
    throw new Error("invalid_generator_input");
  const seed = input.seed % 960;
  const x = 2 + (seed % 10) + Math.floor(input.difficulty * 2);
  const a = 1 + (Math.floor(seed / 10) % 4);
  const b = a + 1 + (Math.floor(seed / 40) % 3);
  const c = 2 + (Math.floor(seed / 120) % 8);
  const d = c - (b - a) * x;
  const expression = (coefficient: number, constant: number) =>
    `${coefficient}x ${constant < 0 ? "-" : "+"} ${Math.abs(constant)}`;
  const left = expression(a, c);
  const right = expression(b, d);
  const prompt = `D lies on the perpendicular bisector of AB. DA = (${left}) cm and DB = (${right}) cm. Find x.`;
  const steps = [
    {
      description: "A point on the perpendicular bisector has equal distances to the endpoints.",
      expression: `${left} = ${right}`,
    },
    {
      description: "Collect the variable terms on the right and constants on the left.",
      expression: `${c - d} = ${b - a}x`,
    },
    {
      description: "Divide by the nonzero coefficient.",
      expression: `x = ${x}`,
      value: x,
    },
    {
      description: "Check that both distances are equal and positive.",
      expression: `DA = DB = ${a * x + c} cm`,
      value: a * x + c,
    },
  ];
  const question: Question = {
    kind: "numeric",
    prompt,
    answer: x,
    tolerance: 1e-9,
    hint: "The two distances are equal. Set their expressions equal to each other.",
    explanation: `Set ${left} = ${right}. This gives ${b - a}x = ${c - d}, so x = ${x}. Both distances are ${a * x + c} cm.`,
  };
  return {
    prompt,
    data: { question, coefficients: { a, b, c, d } },
    expectedAnswer: { response: x },
    solutionSteps: steps,
    gradingMetadata: {
      partAnswers: { response: x },
      partMaxScores: { response: 1 },
      partGradingRules: { response: "numeric_tolerance" as const },
      partTolerances: { response: 1e-9 },
    },
  };
}

export function projectPerpendicularBisector(
  input: { nodeId: string; seed: number; difficulty: number },
  mode: PerpendicularBisectorMode,
  activityId: string,
) {
  const generated = generatePerpendicularBisector(input);
  const publicQuestion = { activityId, mode, prompt: generated.prompt };
  if (mode === "independent_practice") return publicQuestion;
  if (mode === "guided_practice")
    return {
      ...publicQuestion,
      hint: generated.data.question.hint,
      stepPrompts: [
        "Which distances are equal?",
        "What equation follows after collecting terms?",
        "What is x?",
      ],
      hints: [
        "A point on the perpendicular bisector has equal distances to the endpoints.",
        "Collect the variable terms on one side and constants on the other.",
        "Divide both sides by the coefficient of x.",
      ],
      revealPolicy: "after_attempt" as const,
    };
  return {
    ...publicQuestion,
    answer: generated.expectedAnswer.response,
    solutionSteps: generated.solutionSteps,
  };
}

export function gradePerpendicularBisector(
  input: { nodeId: string; seed: number; difficulty: number },
  rawResponse: string,
) {
  return gradeQuestion(generatePerpendicularBisector(input).data.question, rawResponse);
}
