import type { ProblemFamilyInput } from '@math-platform/practice-core';

export const UNIT1_PROBLEM_FAMILIES: ProblemFamilyInput[] = [
  // Change in Tandem (HSF-IF.B.4)
  {
    problemFamilyId: "comprehension-quiz:change-in-tandem",
    componentKey: "comprehension-quiz",
    displayName: "Change in Tandem",
    description: "Interpret how two quantities change together using function graphs and tables",
    objectiveIds: ["HSF-IF.B.4"],
    difficulty: "introductory",
    metadata: { unit: 1, topic: "change-in-tandem" },
  },
  // Rates of Change (HSF-IF.B.4, HSA-APR.A.1)
  {
    problemFamilyId: "rate-of-change-calculator:polynomial-rate-of-change",
    componentKey: "rate-of-change-calculator",
    displayName: "Polynomial Rate of Change",
    description: "Calculate and interpret average and instantaneous rates of change for polynomial functions",
    objectiveIds: ["HSF-IF.B.4", "HSA-APR.A.1"],
    difficulty: "standard",
    metadata: { unit: 1, topic: "rates-of-change" },
  },
  // Polynomial Functions and Complex Zeros (HSF-IF.C.7c, HSA-APR.B.2, HSA-APR.B.3)
  {
    problemFamilyId: "step-by-step-solver:polynomial-zeros",
    componentKey: "step-by-step-solver",
    displayName: "Find Polynomial Zeros",
    description: "Find zeros of polynomial functions using factorization and the Remainder Theorem",
    objectiveIds: ["HSF-IF.C.7c", "HSA-APR.B.2", "HSA-APR.B.3"],
    difficulty: "standard",
    metadata: { unit: 1, topic: "polynomial-functions" },
  },
  {
    problemFamilyId: "step-by-step-solver:polynomial-complex-zeros",
    componentKey: "step-by-step-solver",
    displayName: "Polynomial Complex Zeros",
    description: "Find and interpret complex zeros of polynomial functions",
    objectiveIds: ["HSF-IF.C.7c", "HSA-APR.B.3"],
    difficulty: "challenging",
    metadata: { unit: 1, topic: "polynomial-functions" },
  },
  // Polynomial End Behavior (HSF-IF.C.7c)
  {
    problemFamilyId: "graphing-explorer:polynomial-end-behavior",
    componentKey: "graphing-explorer",
    displayName: "Polynomial End Behavior",
    description: "Explore how the degree and leading coefficient affect the end behavior of polynomial graphs",
    objectiveIds: ["HSF-IF.C.7c"],
    difficulty: "standard",
    metadata: { unit: 1, topic: "polynomial-graphs" },
  },
  // Rational Functions and Asymptotes (HSF-IF.C.7d, HSA-APR.D.6, HSA-REI.A.2)
  {
    problemFamilyId: "graphing-explorer:rational-functions-asymptotes",
    componentKey: "graphing-explorer",
    displayName: "Rational Functions and Asymptotes",
    description: "Graph rational functions by identifying vertical, horizontal, and oblique asymptotes",
    objectiveIds: ["HSF-IF.C.7d", "HSA-APR.D.6"],
    difficulty: "standard",
    metadata: { unit: 1, topic: "rational-functions" },
  },
  {
    problemFamilyId: "step-by-step-solver:rational-equations",
    componentKey: "step-by-step-solver",
    displayName: "Solve Rational Equations",
    description: "Solve rational equations and identify extraneous solutions",
    objectiveIds: ["HSA-REI.A.2", "HSA-APR.D.6"],
    difficulty: "challenging",
    metadata: { unit: 1, topic: "rational-functions" },
  },
  // Equivalent Representations (HSF-BF.A.1, HSA-APR.A.1)
  {
    problemFamilyId: "step-by-step-solver:equivalent-representations",
    componentKey: "step-by-step-solver",
    displayName: "Equivalent Representations",
    description: "Convert between factored, standard, and other equivalent forms of polynomial and rational expressions",
    objectiveIds: ["HSF-BF.A.1", "HSA-APR.A.1"],
    difficulty: "standard",
    metadata: { unit: 1, topic: "equivalent-representations" },
  },
  // Transformations (HSF-BF.B.3)
  {
    problemFamilyId: "graphing-explorer:polynomial-transformations",
    componentKey: "graphing-explorer",
    displayName: "Polynomial Transformations",
    description: "Explore how shifting, stretching, and reflecting affects polynomial function graphs",
    objectiveIds: ["HSF-BF.B.3"],
    difficulty: "standard",
    metadata: { unit: 1, topic: "transformations" },
  },
  // Function Model Selection (HSF-IF.B.4, HSF-BF.A.1)
  {
    problemFamilyId: "comprehension-quiz:function-model-selection",
    componentKey: "comprehension-quiz",
    displayName: "Function Model Selection",
    description: "Select and justify appropriate function types to model real-world data and relationships",
    objectiveIds: ["HSF-IF.B.4", "HSF-BF.A.1"],
    difficulty: "standard",
    metadata: { unit: 1, topic: "model-selection" },
  },
];
