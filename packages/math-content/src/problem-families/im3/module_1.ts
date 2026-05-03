import type { ProblemFamilyInput } from '@math-platform/practice-core';

export const MODULE1_PROBLEM_FAMILIES: ProblemFamilyInput[] = [
  // Graphing Quadratic Functions (HSA-SSE.B.3, HSA-REI.B.4)
  {
    problemFamilyId: "step-by-step-solver:graphing-quadratics-from-equation",
    componentKey: "step-by-step-solver",
    displayName: "Graph Quadratics from Equation",
    description: "Graph quadratic functions by creating a table of values from an equation",
    objectiveIds: ["HSA-SSE.B.3", "HSA-REI.B.4"],
    difficulty: "standard",
    metadata: { module: 1, topic: "quadratic-functions" },
  },
  {
    problemFamilyId: "graphing-explorer:quadratic-vertex-form",
    componentKey: "graphing-explorer",
    displayName: "Explore Quadratic Vertex Form",
    description: "Explore transformations of quadratic functions in vertex form using interactive graphing",
    objectiveIds: ["HSA-SSE.B.3", "HSA-REI.B.4"],
    difficulty: "introductory",
    metadata: { module: 1, topic: "quadratic-functions" },
  },
  {
    problemFamilyId: "graphing-explorer:quadratic-standard-form",
    componentKey: "graphing-explorer",
    displayName: "Explore Quadratic Standard Form",
    description: "Explore how coefficients in standard form affect the parabola",
    objectiveIds: ["HSA-SSE.B.3", "HSA-REI.B.4"],
    difficulty: "introductory",
    metadata: { module: 1, topic: "quadratic-functions" },
  },
  {
    problemFamilyId: "graphing-explorer:quadratic-rate-of-change",
    componentKey: "graphing-explorer",
    displayName: "Rate of Change from Quadratic Graph",
    description: "Estimate and calculate average rate of change from a quadratic function graph",
    objectiveIds: ["HSA-SSE.B.3", "HSF-IF.A.2"],
    difficulty: "standard",
    metadata: { module: 1, topic: "quadratic-functions" },
  },
  // Solving Quadratics (HSA-REI.B.4)
  {
    problemFamilyId: "step-by-step-solver:solve-quadratic-by-graphing",
    componentKey: "step-by-step-solver",
    displayName: "Solve Quadratic by Graphing",
    description: "Find x-intercepts of quadratic functions by graphing",
    objectiveIds: ["HSA-REI.B.4"],
    difficulty: "standard",
    metadata: { module: 1, topic: "solving-quadratics" },
  },
  {
    problemFamilyId: "step-by-step-solver:average-rate-of-change",
    componentKey: "step-by-step-solver",
    displayName: "Average Rate of Change",
    description: "Calculate average rate of change for quadratic functions from equations or tables",
    objectiveIds: ["HSF-IF.A.2"],
    difficulty: "standard",
    metadata: { module: 1, topic: "rate-of-change" },
  },
  // Complex Numbers (N-CN.A.1, N-CN.C.7)
  {
    problemFamilyId: "step-by-step-solver:complex-number-operations",
    componentKey: "step-by-step-solver",
    displayName: "Complex Number Operations",
    description: "Add, subtract, multiply, and divide complex numbers",
    objectiveIds: ["N-CN.A.1", "N-CN.C.7"],
    difficulty: "challenging",
    metadata: { module: 1, topic: "complex-numbers" },
  },
  {
    problemFamilyId: "step-by-step-solver:solve-quadratic-complex-solutions",
    componentKey: "step-by-step-solver",
    displayName: "Solve Quadratics with Complex Solutions",
    description: "Solve quadratic equations that result in complex solutions",
    objectiveIds: ["N-CN.C.7", "HSA-REI.B.4"],
    difficulty: "challenging",
    metadata: { module: 1, topic: "complex-numbers" },
  },
  // Vocabulary and Comprehension
  {
    problemFamilyId: "comprehension-quiz:quadratic-vocabulary",
    componentKey: "comprehension-quiz",
    displayName: "Quadratic Function Vocabulary",
    description: "Assess understanding of key quadratic function terminology",
    objectiveIds: ["HSA-SSE.B.3"],
    difficulty: "introductory",
    metadata: { module: 1, topic: "vocabulary" },
  },
  // Discourse activities are not practice items
];