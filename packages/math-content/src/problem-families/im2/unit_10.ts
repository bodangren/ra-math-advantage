import type { ProblemFamilyInput } from '@math-platform/practice-core';

export const UNIT10_PROBLEM_FAMILIES: ProblemFamilyInput[] = [
  // Laws of Exponents
  {
    problemFamilyId: "step-by-step-solver:laws-of-exponents",
    componentKey: "step-by-step-solver",
    displayName: "Laws of Exponents",
    description: "Apply product, quotient, power, and zero exponent rules to simplify expressions",
    objectiveIds: ["N-RN.A.1", "N-RN.A.2"],
    difficulty: "standard",
    metadata: { unit: 10, topic: "exponent-laws" },
  },
  // Negative and Rational Exponents
  {
    problemFamilyId: "step-by-step-solver:negative-rational-exponents",
    componentKey: "step-by-step-solver",
    displayName: "Negative and Rational Exponents",
    description: "Convert between radical form and rational exponent form and simplify expressions",
    objectiveIds: ["N-RN.A.1", "N-RN.A.2"],
    difficulty: "standard",
    metadata: { unit: 10, topic: "rational-exponents" },
  },
  // Scientific Notation
  {
    problemFamilyId: "step-by-step-solver:scientific-notation",
    componentKey: "step-by-step-solver",
    displayName: "Scientific Notation",
    description: "Convert between standard form and scientific notation and perform operations",
    objectiveIds: ["N-RN.A.2"],
    difficulty: "introductory",
    metadata: { unit: 10, topic: "scientific-notation" },
  },
  // Radical Expressions
  {
    problemFamilyId: "step-by-step-solver:radical-expressions",
    componentKey: "step-by-step-solver",
    displayName: "Radical Expressions",
    description: "Simplify, add, subtract, multiply, and divide radical expressions",
    objectiveIds: ["N-RN.A.1", "N-RN.A.2"],
    difficulty: "standard",
    metadata: { unit: 10, topic: "radicals" },
  },
  // Radical Equations
  {
    problemFamilyId: "step-by-step-solver:radical-equations",
    componentKey: "step-by-step-solver",
    displayName: "Radical Equations",
    description: "Solve equations containing radicals and check for extraneous solutions",
    objectiveIds: ["N-RN.A.2"],
    difficulty: "challenging",
    metadata: { unit: 10, topic: "radical-equations" },
  },
];
