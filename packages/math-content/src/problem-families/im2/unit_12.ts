import type { ProblemFamilyInput } from '@math-platform/practice-core';

export const UNIT12_PROBLEM_FAMILIES: ProblemFamilyInput[] = [
  // Graphing Quadratics
  {
    problemFamilyId: "graphing-explorer:graphing-quadratic-functions",
    componentKey: "graphing-explorer",
    displayName: "Graphing Quadratic Functions",
    description: "Graph quadratic functions in standard and vertex form and identify key features",
    objectiveIds: ["HSF-IF.C.7", "HSF-IF.B.4"],
    difficulty: "standard",
    metadata: { unit: 12, topic: "graphing-quadratics" },
  },
  // Factoring Quadratics
  {
    problemFamilyId: "step-by-step-solver:factoring-quadratics",
    componentKey: "step-by-step-solver",
    displayName: "Factoring Quadratics",
    description: "Solve quadratic equations by factoring and using the zero product property",
    objectiveIds: ["HSF-IF.C.7"],
    difficulty: "standard",
    metadata: { unit: 12, topic: "factoring" },
  },
  // Completing the Square
  {
    problemFamilyId: "step-by-step-solver:completing-the-square",
    componentKey: "step-by-step-solver",
    displayName: "Completing the Square",
    description: "Solve quadratic equations by completing the square and converting to vertex form",
    objectiveIds: ["G-GPE.A.1", "HSF-IF.C.7"],
    difficulty: "standard",
    metadata: { unit: 12, topic: "completing-square" },
  },
  // Quadratic Formula
  {
    problemFamilyId: "step-by-step-solver:quadratic-formula",
    componentKey: "step-by-step-solver",
    displayName: "Quadratic Formula",
    description: "Solve quadratic equations using the quadratic formula and the discriminant",
    objectiveIds: ["HSF-IF.C.7"],
    difficulty: "standard",
    metadata: { unit: 12, topic: "quadratic-formula" },
  },
  // Quadratic Applications
  {
    problemFamilyId: "step-by-step-solver:quadratic-applications",
    componentKey: "step-by-step-solver",
    displayName: "Quadratic Applications",
    description: "Model and solve real-world problems involving quadratic functions",
    objectiveIds: ["HSF-IF.B.4", "HSF-BF.A.1"],
    difficulty: "challenging",
    metadata: { unit: 12, topic: "applications" },
  },
];
