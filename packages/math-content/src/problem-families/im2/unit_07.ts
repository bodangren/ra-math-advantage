import type { ProblemFamilyInput } from '@math-platform/practice-core';

export const UNIT7_PROBLEM_FAMILIES: ProblemFamilyInput[] = [
  // Basic Probability
  {
    problemFamilyId: "step-by-step-solver:basic-probability",
    componentKey: "step-by-step-solver",
    displayName: "Basic Probability",
    description: "Calculate probabilities of events using sample spaces and favorable outcomes",
    objectiveIds: ["S-CP.A.1"],
    difficulty: "introductory",
    metadata: { unit: 7, topic: "basic-probability" },
  },
  // Counting Principle
  {
    problemFamilyId: "step-by-step-solver:fundamental-counting-principle",
    componentKey: "step-by-step-solver",
    displayName: "Fundamental Counting Principle",
    description: "Use the fundamental counting principle to determine the number of possible outcomes",
    objectiveIds: ["S-CP.A.1"],
    difficulty: "standard",
    metadata: { unit: 7, topic: "counting" },
  },
  // Permutations
  {
    problemFamilyId: "step-by-step-solver:permutations",
    componentKey: "step-by-step-solver",
    displayName: "Permutations",
    description: "Calculate permutations to find the number of arrangements when order matters",
    objectiveIds: ["S-CP.A.1"],
    difficulty: "standard",
    metadata: { unit: 7, topic: "permutations" },
  },
  // Combinations
  {
    problemFamilyId: "step-by-step-solver:combinations",
    componentKey: "step-by-step-solver",
    displayName: "Combinations",
    description: "Calculate combinations to find the number of selections when order does not matter",
    objectiveIds: ["S-CP.A.1"],
    difficulty: "standard",
    metadata: { unit: 7, topic: "combinations" },
  },
  // Compound Probability
  {
    problemFamilyId: "step-by-step-solver:compound-probability",
    componentKey: "step-by-step-solver",
    displayName: "Compound Probability",
    description: "Find probabilities of compound events using addition and multiplication rules",
    objectiveIds: ["S-CP.A.2", "S-CP.A.3"],
    difficulty: "standard",
    metadata: { unit: 7, topic: "compound-probability" },
  },
  // Expected Value
  {
    problemFamilyId: "step-by-step-solver:expected-value",
    componentKey: "step-by-step-solver",
    displayName: "Expected Value",
    description: "Calculate and interpret the expected value of a probability distribution",
    objectiveIds: ["S-CP.A.2", "S-CP.B.6"],
    difficulty: "challenging",
    metadata: { unit: 7, topic: "expected-value" },
  },
];
