import type { ProblemFamilyInput } from '@math-platform/practice-core';

export const MODULE3_PROBLEM_FAMILIES: ProblemFamilyInput[] = [
  // Solving Polynomial Equations (HSA-REI.B.4, HSA-APR.C.4)
  {
    problemFamilyId: "step-by-step-solver:solve-polynomial-equations",
    componentKey: "step-by-step-solver",
    displayName: "Solve Polynomial Equations",
    description: "Solve polynomial equations by factoring and using quadratic form",
    objectiveIds: ["HSA-REI.B.4", "HSA-APR.C.4"],
    difficulty: "standard",
    metadata: { module: 3, topic: "solving-polynomial-equations" },
  },
  {
    problemFamilyId: "graphing-explorer:solve-polynomial-by-graphing",
    componentKey: "graphing-explorer",
    displayName: "Solve Polynomial Equations by Graphing",
    description: "Find solutions of polynomial equations using graphs",
    objectiveIds: ["HSA-REI.B.4", "HSF-IF.A.2"],
    difficulty: "standard",
    metadata: { module: 3, topic: "solving-polynomial-equations" },
  },
  // Proving Polynomial Identities (HSA-APR.C.4)
  {
    problemFamilyId: "step-by-step-solver:prove-polynomial-identities",
    componentKey: "step-by-step-solver",
    displayName: "Prove Polynomial Identities",
    description: "Prove polynomial identities and use them to describe relationships",
    objectiveIds: ["HSA-APR.C.4"],
    difficulty: "challenging",
    metadata: { module: 3, topic: "polynomial-identities" },
  },
  {
    problemFamilyId: "step-by-step-solver:numerical-relationships",
    componentKey: "step-by-step-solver",
    displayName: "Polynomial Numerical Relationships",
    description: "Use polynomial identities to describe numerical relationships",
    objectiveIds: ["HSA-APR.C.4"],
    difficulty: "standard",
    metadata: { module: 3, topic: "polynomial-identities" },
  },
  // Remainder and Factor Theorems (HSA-APR.B.2, HSA-APR.B.3)
  {
    problemFamilyId: "step-by-step-solver:synthetic-substitution",
    componentKey: "step-by-step-solver",
    displayName: "Synthetic Substitution",
    description: "Evaluate polynomial functions using synthetic substitution",
    objectiveIds: ["HSA-APR.B.2", "HSF-IF.A.2"],
    difficulty: "standard",
    metadata: { module: 3, topic: "synthetic-substitution" },
  },
  {
    problemFamilyId: "step-by-step-solver:find-zeros-polynomials",
    componentKey: "step-by-step-solver",
    displayName: "Find Zeros of Polynomial Functions",
    description: "Find zeros of polynomial functions using various methods",
    objectiveIds: ["HSA-APR.B.3", "HSA-APR.B.2"],
    difficulty: "challenging",
    metadata: { module: 3, topic: "zeros-polynomials" },
  },
  // Linear-Quadratic Systems (HSA-REI.C.7)
  {
    problemFamilyId: "step-by-step-solver:linear-quadratic-systems",
    componentKey: "step-by-step-solver",
    displayName: "Linear-Quadratic Systems",
    description: "Solve systems consisting of linear and quadratic equations",
    objectiveIds: ["HSA-REI.C.7"],
    difficulty: "standard",
    metadata: { module: 3, topic: "systems" },
  },
  {
    problemFamilyId: "graphing-explorer:linear-quadratic-systems",
    componentKey: "graphing-explorer",
    displayName: "Graph Linear-Quadratic Systems",
    description: "Solve systems graphically and identify intersection points",
    objectiveIds: ["HSA-REI.C.7"],
    difficulty: "standard",
    metadata: { module: 3, topic: "systems" },
  },
  // Fundamental Theorem of Algebra
  {
    problemFamilyId: "step-by-step-solver:fundamental-theorem-algebra",
    componentKey: "step-by-step-solver",
    displayName: "Fundamental Theorem of Algebra",
    description: "Apply the Fundamental Theorem of Algebra to find zeros of polynomials",
    objectiveIds: ["HSA-APR.B.3", "N-CN.A.1"],
    difficulty: "challenging",
    metadata: { module: 3, topic: "fundamental-theorem" },
  },
  // Comprehension
  {
    problemFamilyId: "comprehension-quiz:polynomial-equations-vocabulary",
    componentKey: "comprehension-quiz",
    displayName: "Polynomial Equations Vocabulary",
    description: "Assess understanding of polynomial equation terminology",
    objectiveIds: ["HSA-APR.C.4"],
    difficulty: "introductory",
    metadata: { module: 3, topic: "vocabulary" },
  },
];