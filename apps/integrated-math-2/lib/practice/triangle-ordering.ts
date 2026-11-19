import { gradeQuestion, type Question } from "./question";

export const triangleNodeIds = {
  angles: "math.im2.skill.1.4.order-triangle-angles-from-side-lengths",
  sides: "math.im2.skill.1.4.order-triangle-sides-from-angle-measures",
} as const;
export type TriangleNodeId = (typeof triangleNodeIds)[keyof typeof triangleNodeIds];
export type TriangleMode = "worked_example" | "guided_practice" | "independent_practice";
export type TrianglePart = { id: string; question: Question };
export type TriangleItem = {
  problem: number;
  figure: string;
  alt: string;
  prompt: string;
  label?: string;
  answer?: string;
  steps?: string[];
  parts?: TrianglePart[];
};
const choice = (prompt: string, answer: string, texts: string[], hint?: string): Question => ({
  kind: "choice",
  prompt,
  choices: texts.map((text, index) => ({ id: `choice-${index + 1}`, text })),
  answer,
  hint,
  explanation: `The correct order is ${texts[Number(answer.slice(-1)) - 1]}.`,
});
const items: Record<string, TriangleItem> = {
  [`${triangleNodeIds.angles}:worked_example`]: {
    problem: 6,
    figure: "/curriculum/module-1-lesson-4/image3.png",
    alt: "Triangle TRS with side lengths TR 48 centimeters, TS 35 centimeters, and RS 23.7 centimeters.",
    prompt: "Order the angles from smallest to largest.",
    label: "Authored solution for native Problem 6",
    answer: "∠T, ∠R, ∠S",
    steps: [
      "Order the sides: RS = 23.7, TS = 35, TR = 48.",
      "Match the opposite measures: RS → ∠T, TS → ∠R, TR → ∠S.",
      "The angle order is ∠T, ∠R, ∠S.",
    ],
  },
  [`${triangleNodeIds.angles}:guided_practice`]: {
    problem: 8,
    figure: "/curriculum/module-1-lesson-4/image4.png",
    alt: "Triangle ABC with side lengths AB 3.8, AC 4.0, and BC 4.3.",
    prompt: "Order the angles from smallest to largest.",
    parts: [
      {
        id: "measure_order",
        question: choice(
          "Order the side lengths.",
          "choice-1",
          [
            "AB = 3.8, AC = 4.0, BC = 4.3",
            "BC = 4.3, AC = 4.0, AB = 3.8",
            "AC = 4.0, AB = 3.8, BC = 4.3",
          ],
          "Compare the three side lengths.",
        ),
      },
      {
        id: "opposite_correspondence",
        question: choice(
          "Match each side to its opposite angle.",
          "choice-1",
          ["AB → ∠C, AC → ∠B, BC → ∠A", "AB → ∠A, AC → ∠C, BC → ∠B", "AB → ∠B, AC → ∠A, BC → ∠C"],
          "Look across the triangle from each side.",
        ),
      },
      {
        id: "final_order",
        question: choice(
          "Order the angles.",
          "choice-1",
          ["∠C, ∠B, ∠A", "∠A, ∠B, ∠C", "∠B, ∠C, ∠A"],
          "The shortest side is opposite the smallest angle.",
        ),
      },
    ],
  },
  [`${triangleNodeIds.angles}:independent_practice`]: {
    problem: 11,
    figure: "/curriculum/module-1-lesson-4/image5.png",
    alt: "Triangle PQR with side lengths PR 12, RQ 18, and PQ 20.",
    prompt: "Order the angles from smallest to largest.",
    parts: [
      {
        id: "final_order",
        question: choice("Order the angles.", "choice-1", [
          "∠Q, ∠P, ∠R",
          "∠R, ∠P, ∠Q",
          "∠P, ∠Q, ∠R",
        ]),
      },
    ],
  },
  [`${triangleNodeIds.sides}:worked_example`]: {
    problem: 7,
    figure: "/curriculum/module-1-lesson-4/image2.png",
    alt: "Triangle RST with angle measures R 60 degrees, S 80 degrees, and T 40 degrees.",
    prompt: "Order the sides from smallest to largest.",
    label: "Authored solution for native Problem 7",
    answer: "RS, ST, RT",
    steps: [
      "Order the angles: ∠T = 40°, ∠R = 60°, ∠S = 80°.",
      "Match the opposite measures: ∠T → RS, ∠R → ST, ∠S → RT.",
      "The side order is RS, ST, RT.",
    ],
  },
  [`${triangleNodeIds.sides}:guided_practice`]: {
    problem: 9,
    figure: "/curriculum/module-1-lesson-4/image7.png",
    alt: "Triangle CDE with angle measures C 35 degrees, D 120 degrees, and E 25 degrees.",
    prompt: "Order the sides from smallest to largest.",
    parts: [
      {
        id: "measure_order",
        question: choice(
          "Order the angles.",
          "choice-1",
          [
            "∠E = 25°, ∠C = 35°, ∠D = 120°",
            "∠D = 120°, ∠C = 35°, ∠E = 25°",
            "∠C = 35°, ∠E = 25°, ∠D = 120°",
          ],
          "Compare the angle measures.",
        ),
      },
      {
        id: "opposite_correspondence",
        question: choice(
          "Match each angle to its opposite side.",
          "choice-1",
          ["∠E → CD, ∠C → DE, ∠D → CE", "∠E → CE, ∠C → CD, ∠D → DE", "∠E → DE, ∠C → CE, ∠D → CD"],
          "Look across the triangle from each angle.",
        ),
      },
      {
        id: "final_order",
        question: choice(
          "Order the sides.",
          "choice-1",
          ["CD, DE, CE", "CE, DE, CD", "DE, CD, CE"],
          "The smallest angle is opposite the shortest side.",
        ),
      },
    ],
  },
  [`${triangleNodeIds.sides}:independent_practice`]: {
    problem: 10,
    figure: "/curriculum/module-1-lesson-4/image6.png",
    alt: "Triangle RST with angle measures S 60 degrees and T 54 degrees.",
    prompt: "Find the missing angle. Then order the sides.",
    parts: [
      {
        id: "missing_angle",
        question: {
          kind: "numeric",
          prompt: "Find ∠R in degrees.",
          answer: 66,
          explanation: "180 - 60 - 54 = 66.",
        },
      },
      {
        id: "final_order",
        question: choice("Order the sides.", "choice-1", [
          "RS, RT, ST",
          "ST, RT, RS",
          "RT, RS, ST",
        ]),
      },
    ],
  },
};
export function triangleItem(
  nodeId: string,
  mode: TriangleMode,
  seed: number,
  difficulty: number,
): TriangleItem {
  const item = items[`${nodeId}:${mode}`];
  if (!item || item.problem !== seed || difficulty !== 1) throw Error("invalid_triangle_item");
  return item;
}
export function gradeTrianglePart(
  nodeId: string,
  mode: TriangleMode,
  seed: number,
  difficulty: number,
  partId: string,
  answer: string,
) {
  const part = triangleItem(nodeId, mode, seed, difficulty).parts?.find(
    (candidate) => candidate.id === partId,
  );
  if (!part) throw Error("invalid_triangle_part");
  return gradeQuestion(part.question, answer);
}
function publicPart(part: TrianglePart) {
  return {
    id: part.id,
    prompt: part.question.prompt,
    kind: part.question.kind,
    choices: part.question.kind === "choice" ? part.question.choices : undefined,
  };
}
export function projectTriangleItem(
  nodeId: string,
  mode: TriangleMode,
  seed: number,
  difficulty: number,
  activityId: string,
) {
  const item = triangleItem(nodeId, mode, seed, difficulty);
  const base = {
    activityId: activityId,
    mode,
    problem: item.problem,
    figure: item.figure,
    alt: item.alt,
    prompt: item.prompt,
    acceptedAnswers: {},
    hintsUsed: 0,
    revealStepsSeen: 0,
  };
  if (mode === "worked_example")
    return {
      ...base,
      authoredLabel: item.label,
      answer: item.answer,
      solutionSteps: item.steps,
    };
  return { ...base, currentPart: publicPart(item.parts![0]) };
}
export function triangleModes(nodeId: string): ReadonlyArray<{ mode: TriangleMode; seed: number }> {
  return nodeId === triangleNodeIds.angles
    ? [
        { mode: "worked_example", seed: 6 },
        { mode: "guided_practice", seed: 8 },
        { mode: "independent_practice", seed: 11 },
      ]
    : nodeId === triangleNodeIds.sides
      ? [
          { mode: "worked_example", seed: 7 },
          { mode: "guided_practice", seed: 9 },
          { mode: "independent_practice", seed: 10 },
        ]
      : [];
}
