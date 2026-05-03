import type { ProblemFamilyInput } from '@math-platform/practice-core';

export const MODULE2_PROBLEM_FAMILIES: ProblemFamilyInput[] = [
  // Polynomial Operations (HSA-APR.A.1)
  {
    problemFamilyId: "step-by-step-solver:polynomial-arithmetic",
    componentKey: "step-by-step-solver",
    displayName: "Polynomial Arithmetic",
    description: "Add, subtract, and multiply polynomial expressions",
    objectiveIds: ["HSA-APR.A.1"],
    difficulty: "standard",
    metadata: { module: 2, topic: "polynomial-operations" },
  },
  {
    problemFamilyId: "step-by-step-solver:binomial-expansion",
    componentKey: "step-by-step-solver",
    displayName: "Binomial Expansion",
    description: "Expand powers of binomials using various methods",
    objectiveIds: ["HSA-APR.A.1"],
    difficulty: "standard",
    metadata: { module: 2, topic: "polynomial-operations" },
  },
  // Graphing Polynomials (HSF-IF.C.7c)
  {
    problemFamilyId: "graphing-explorer:graph-polynomial",
    componentKey: "graphing-explorer",
    displayName: "Graph Polynomial Functions",
    description: "Graph polynomial functions and identify key features",
    objectiveIds: ["HSF-IF.C.7c", "HSA-APR.B.3"],
    difficulty: "standard",
    metadata: { module: 2, topic: "polynomial-graphs" },
  },
  {
    problemFamilyId: "graphing-explorer:polynomial-end-behavior",
    componentKey: "graphing-explorer",
    displayName: "Polynomial End Behavior",
    description: "Explore end behavior of polynomial functions",
    objectiveIds: ["HSF-IF.C.7c"],
    difficulty: "standard",
    metadata: { module: 2, topic: "polynomial-graphs" },
  },
  {
    problemFamilyId: "graphing-explorer:polynomial-turning-points",
    componentKey: "graphing-explorer",
    displayName: "Polynomial Turning Points",
    description: "Identify turning points and zeros of polynomial functions",
    objectiveIds: ["HSF-IF.C.7c", "HSA-APR.B.3"],
    difficulty: "standard",
    metadata: { module: 2, topic: "polynomial-graphs" },
  },
  // Remainder and Factor Theorem (HSA-APR.B.2)
  {
    problemFamilyId: "step-by-step-solver:remainder-theorem",
    componentKey: "step-by-step-solver",
    displayName: "Remainder Theorem",
    description: "Use synthetic substitution to evaluate polynomials",
    objectiveIds: ["HSA-APR.B.2"],
    difficulty: "standard",
    metadata: { module: 2, topic: "remainder-factor-theorem" },
  },
  {
    problemFamilyId: "step-by-step-solver:factor-theorem",
    componentKey: "step-by-step-solver",
    displayName: "Factor Theorem",
    description: "Use the Factor Theorem to determine factors of polynomials",
    objectiveIds: ["HSA-APR.B.2", "HSA-APR.B.3"],
    difficulty: "challenging",
    metadata: { module: 2, topic: "remainder-factor-theorem" },
  },
  // Dividing Polynomials
  {
    problemFamilyId: "step-by-step-solver:polynomial-division",
    componentKey: "step-by-step-solver",
    displayName: "Polynomial Division",
    description: "Divide polynomials using long division or synthetic division",
    objectiveIds: ["HSA-APR.A.1"],
    difficulty: "standard",
    metadata: { module: 2, topic: "polynomial-division" },
  },
  // Comprehension
  {
    problemFamilyId: "comprehension-quiz:polynomial-vocabulary",
    componentKey: "comprehension-quiz",
    displayName: "Polynomial Vocabulary",
    description: "Assess understanding of polynomial terminology",
    objectiveIds: ["HSA-APR.A.1"],
    difficulty: "introductory",
    metadata: { module: 2, topic: "vocabulary" },
  },
];