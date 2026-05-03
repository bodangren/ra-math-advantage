import type { ProblemFamilyInput } from '@math-platform/practice-core';

export const UNIT4_PROBLEM_FAMILIES: ProblemFamilyInput[] = [
  // Pythagorean Theorem
  {
    problemFamilyId: "step-by-step-solver:pythagorean-theorem",
    componentKey: "step-by-step-solver",
    displayName: "Pythagorean Theorem",
    description: "Use the Pythagorean theorem to find missing side lengths in right triangles",
    objectiveIds: ["G-SRT.C.8"],
    difficulty: "introductory",
    metadata: { unit: 4, topic: "pythagorean-theorem" },
  },
  // Special Right Triangles
  {
    problemFamilyId: "step-by-step-solver:special-right-triangles",
    componentKey: "step-by-step-solver",
    displayName: "Special Right Triangles",
    description: "Solve problems involving 45-45-90 and 30-60-90 triangles",
    objectiveIds: ["G-SRT.C.6", "G-SRT.C.8"],
    difficulty: "standard",
    metadata: { unit: 4, topic: "special-triangles" },
  },
  // Sine, Cosine, Tangent
  {
    problemFamilyId: "step-by-step-solver:trig-ratios-sin-cos-tan",
    componentKey: "step-by-step-solver",
    displayName: "Trigonometric Ratios",
    description: "Find sine, cosine, and tangent ratios and use them to solve for missing sides",
    objectiveIds: ["G-SRT.C.6", "G-SRT.C.8"],
    difficulty: "standard",
    metadata: { unit: 4, topic: "trig-ratios" },
  },
  // Solving Right Triangles
  {
    problemFamilyId: "step-by-step-solver:solving-right-triangles",
    componentKey: "step-by-step-solver",
    displayName: "Solving Right Triangles",
    description: "Find all missing sides and angles of right triangles using trigonometry",
    objectiveIds: ["G-SRT.C.8"],
    difficulty: "standard",
    metadata: { unit: 4, topic: "solve-right-triangles" },
  },
  // Law of Sines
  {
    problemFamilyId: "step-by-step-solver:law-of-sines",
    componentKey: "step-by-step-solver",
    displayName: "Law of Sines",
    description: "Use the law of sines to solve non-right triangles",
    objectiveIds: ["G-SRT.C.8"],
    difficulty: "challenging",
    metadata: { unit: 4, topic: "law-of-sines" },
  },
  // Law of Cosines
  {
    problemFamilyId: "step-by-step-solver:law-of-cosines",
    componentKey: "step-by-step-solver",
    displayName: "Law of Cosines",
    description: "Use the law of cosines to solve non-right triangles",
    objectiveIds: ["G-SRT.C.8"],
    difficulty: "challenging",
    metadata: { unit: 4, topic: "law-of-cosines" },
  },
];
