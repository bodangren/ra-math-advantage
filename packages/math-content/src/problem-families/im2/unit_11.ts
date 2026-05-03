import type { ProblemFamilyInput } from '@math-platform/practice-core';

export const UNIT11_PROBLEM_FAMILIES: ProblemFamilyInput[] = [
  // Polynomial Vocabulary
  {
    problemFamilyId: "fill-in-the-blank:polynomial-vocabulary",
    componentKey: "fill-in-the-blank",
    displayName: "Polynomial Vocabulary",
    description: "Identify polynomial terms, degree, leading coefficient, and classify by number of terms",
    objectiveIds: ["HSF-IF.B.4"],
    difficulty: "introductory",
    metadata: { unit: 11, topic: "vocabulary" },
  },
  // Add and Subtract Polynomials
  {
    problemFamilyId: "step-by-step-solver:add-subtract-polynomials",
    componentKey: "step-by-step-solver",
    displayName: "Add and Subtract Polynomials",
    description: "Add and subtract polynomial expressions by combining like terms",
    objectiveIds: ["HSF-BF.A.1"],
    difficulty: "introductory",
    metadata: { unit: 11, topic: "add-subtract" },
  },
  // Multiply Polynomials
  {
    problemFamilyId: "step-by-step-solver:multiply-polynomials",
    componentKey: "step-by-step-solver",
    displayName: "Multiply Polynomials",
    description: "Multiply polynomials using the distributive property and FOIL method",
    objectiveIds: ["HSF-BF.A.1"],
    difficulty: "standard",
    metadata: { unit: 11, topic: "multiplication" },
  },
  // Special Products
  {
    problemFamilyId: "step-by-step-solver:special-products",
    componentKey: "step-by-step-solver",
    displayName: "Special Products",
    description: "Recognize and apply patterns for perfect square trinomials and difference of squares",
    objectiveIds: ["HSF-BF.A.1"],
    difficulty: "standard",
    metadata: { unit: 11, topic: "special-products" },
  },
  // Factoring Polynomials
  {
    problemFamilyId: "step-by-step-solver:factoring-polynomials",
    componentKey: "step-by-step-solver",
    displayName: "Factoring Polynomials",
    description: "Factor polynomials using GCF, grouping, and trinomial factoring methods",
    objectiveIds: ["HSF-BF.A.1"],
    difficulty: "standard",
    metadata: { unit: 11, topic: "factoring" },
  },
  // Solving Polynomial Equations
  {
    problemFamilyId: "step-by-step-solver:solving-polynomial-equations",
    componentKey: "step-by-step-solver",
    displayName: "Solving Polynomial Equations",
    description: "Solve polynomial equations by factoring and using the zero product property",
    objectiveIds: ["HSF-IF.B.4", "HSF-BF.A.1"],
    difficulty: "challenging",
    metadata: { unit: 11, topic: "solving" },
  },
];
