import type { ProblemFamilyInput } from '@math-platform/practice-core';

export const UNIT1_PROBLEM_FAMILIES: ProblemFamilyInput[] = [
  // Classify Triangles
  {
    problemFamilyId: "comprehension-quiz:classify-triangles",
    componentKey: "comprehension-quiz",
    displayName: "Classify Triangles",
    description: "Classify triangles by sides and angles using geometric vocabulary",
    objectiveIds: ["G-CO.A.1"],
    difficulty: "introductory",
    metadata: { unit: 1, topic: "classify-triangles" },
  },
  // Angle Sum Theorem
  {
    problemFamilyId: "step-by-step-solver:triangle-angle-sum",
    componentKey: "step-by-step-solver",
    displayName: "Triangle Angle Sum Theorem",
    description: "Use the triangle angle sum theorem to find missing angles",
    objectiveIds: ["G-CO.C.10"],
    difficulty: "standard",
    metadata: { unit: 1, topic: "angle-sum" },
  },
  // Triangle Inequality
  {
    problemFamilyId: "step-by-step-solver:triangle-inequality",
    componentKey: "step-by-step-solver",
    displayName: "Triangle Inequality Theorem",
    description: "Determine if three side lengths can form a triangle using the triangle inequality theorem",
    objectiveIds: ["G-CO.C.10"],
    difficulty: "standard",
    metadata: { unit: 1, topic: "triangle-inequality" },
  },
  // SSS/SAS Congruence
  {
    problemFamilyId: "comprehension-quiz:sss-sas-congruence",
    componentKey: "comprehension-quiz",
    displayName: "SSS and SAS Congruence",
    description: "Identify when triangles are congruent using SSS and SAS criteria",
    objectiveIds: ["G-CO.B.7", "G-CO.B.8"],
    difficulty: "standard",
    metadata: { unit: 1, topic: "congruence" },
  },
  // ASA/AAS/HL Congruence
  {
    problemFamilyId: "comprehension-quiz:asa-aas-hl-congruence",
    componentKey: "comprehension-quiz",
    displayName: "ASA, AAS, and HL Congruence",
    description: "Identify congruent triangles using ASA, AAS, and hypotenuse-leg criteria",
    objectiveIds: ["G-CO.B.7", "G-CO.B.8"],
    difficulty: "standard",
    metadata: { unit: 1, topic: "congruence" },
  },
  // Proving Congruence
  {
    problemFamilyId: "step-by-step-solver:prove-triangle-congruence",
    componentKey: "step-by-step-solver",
    displayName: "Prove Triangle Congruence",
    description: "Write two-column proofs showing triangles are congruent using rigid motions",
    objectiveIds: ["G-CO.B.6", "G-CO.B.7", "G-CO.B.8"],
    difficulty: "challenging",
    metadata: { unit: 1, topic: "proofs" },
  },
];
