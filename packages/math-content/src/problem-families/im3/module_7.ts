import type { ProblemFamilyInput } from '@math-platform/practice-core';

export const MODULE7_PROBLEM_FAMILIES: ProblemFamilyInput[] = [
  // Simplify Rational Expressions (HSA-APR.D.6)
  {
    problemFamilyId: "step-by-step-solver:simplify-rational-expressions",
    componentKey: "step-by-step-solver",
    displayName: "Simplify Rational Expressions",
    description: "Simplify rational expressions by factoring and canceling common factors",
    objectiveIds: ["HSA-APR.D.6"],
    difficulty: "standard",
    metadata: { module: 7, topic: "rational-expressions" },
  },
  // Multiply and Divide Rational Expressions (HSA-APR.D.6)
  {
    problemFamilyId: "step-by-step-solver:multiply-divide-rational",
    componentKey: "step-by-step-solver",
    displayName: "Multiply and Divide Rational Expressions",
    description: "Multiply and divide rational expressions",
    objectiveIds: ["HSA-APR.D.6"],
    difficulty: "standard",
    metadata: { module: 7, topic: "rational-expressions" },
  },
  // Add and Subtract Rational Expressions (HSA-APR.D.6)
  {
    problemFamilyId: "step-by-step-solver:add-subtract-rational",
    componentKey: "step-by-step-solver",
    displayName: "Add and Subtract Rational Expressions",
    description: "Add and subtract rational expressions with monomial and polynomial denominators",
    objectiveIds: ["HSA-APR.D.6"],
    difficulty: "standard",
    metadata: { module: 7, topic: "rational-expressions" },
  },
  // Complex Fractions (HSA-APR.D.6)
  {
    problemFamilyId: "step-by-step-solver:complex-fractions",
    componentKey: "step-by-step-solver",
    displayName: "Simplify Complex Fractions",
    description: "Simplify complex fractions using LCD strategies",
    objectiveIds: ["HSA-APR.D.6"],
    difficulty: "challenging",
    metadata: { module: 7, topic: "rational-expressions" },
  },
  // Graph Reciprocal Functions (HSF-IF.C.7d)
  {
    problemFamilyId: "graphing-explorer:reciprocal-functions",
    componentKey: "graphing-explorer",
    displayName: "Graph Reciprocal Functions",
    description: "Graph reciprocal functions by making tables and analyzing asymptotes",
    objectiveIds: ["HSF-IF.C.7d"],
    difficulty: "standard",
    metadata: { module: 7, topic: "rational-functions" },
  },
  // Graph Rational Functions (HSF-IF.C.7d)
  {
    problemFamilyId: "graphing-explorer:rational-functions",
    componentKey: "graphing-explorer",
    displayName: "Graph Rational Functions",
    description: "Graph rational functions and identify vertical, horizontal, and oblique asymptotes",
    objectiveIds: ["HSF-IF.C.7d"],
    difficulty: "challenging",
    metadata: { module: 7, topic: "rational-functions" },
  },
  // Variation (HSA-CED.A.2)
  {
    problemFamilyId: "step-by-step-solver:direct-joint-variation",
    componentKey: "step-by-step-solver",
    displayName: "Direct and Joint Variation",
    description: "Recognize and solve direct and joint variation equations",
    objectiveIds: ["HSA-CED.A.2"],
    difficulty: "standard",
    metadata: { module: 7, topic: "variation" },
  },
  {
    problemFamilyId: "step-by-step-solver:inverse-combined-variation",
    componentKey: "step-by-step-solver",
    displayName: "Inverse and Combined Variation",
    description: "Recognize and solve inverse and combined variation equations",
    objectiveIds: ["HSA-CED.A.2"],
    difficulty: "standard",
    metadata: { module: 7, topic: "variation" },
  },
  // Solve Rational Equations (HSA-REI.A.2)
  {
    problemFamilyId: "step-by-step-solver:solve-rational-equations",
    componentKey: "step-by-step-solver",
    displayName: "Solve Rational Equations",
    description: "Solve rational equations in one variable and check for extraneous solutions",
    objectiveIds: ["HSA-REI.A.2"],
    difficulty: "standard",
    metadata: { module: 7, topic: "rational-equations" },
  },
  // Comprehension
  {
    problemFamilyId: "comprehension-quiz:rational-functions-vocabulary",
    componentKey: "comprehension-quiz",
    displayName: "Rational Functions Vocabulary",
    description: "Assess understanding of rational function terminology",
    objectiveIds: ["HSA-APR.D.6", "HSF-IF.C.7d"],
    difficulty: "introductory",
    metadata: { module: 7, topic: "vocabulary" },
  },
];
