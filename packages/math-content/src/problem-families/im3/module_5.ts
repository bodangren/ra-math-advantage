import type { ProblemFamilyInput } from '@math-platform/practice-core';

export const MODULE5_PROBLEM_FAMILIES: ProblemFamilyInput[] = [
  // Graphing Exponential Functions (HSF-IF.C.7e, HSF-LE.A.4)
  {
    problemFamilyId: "graphing-explorer:exponential-growth",
    componentKey: "graphing-explorer",
    displayName: "Graph Exponential Growth Functions",
    description: "Graph exponential growth functions and identify key features",
    objectiveIds: ["HSF-IF.C.7e"],
    difficulty: "standard",
    metadata: { module: 5, topic: "exponential-functions" },
  },
  {
    problemFamilyId: "graphing-explorer:exponential-decay",
    componentKey: "graphing-explorer",
    displayName: "Graph Exponential Decay Functions",
    description: "Graph exponential decay functions and identify key features",
    objectiveIds: ["HSF-IF.C.7e"],
    difficulty: "standard",
    metadata: { module: 5, topic: "exponential-functions" },
  },
  // Solving Exponential Equations (HSF-LE.A.4)
  {
    problemFamilyId: "step-by-step-solver:solve-exponential-equations",
    componentKey: "step-by-step-solver",
    displayName: "Solve Exponential Equations",
    description: "Solve exponential equations using properties of exponents and logarithms",
    objectiveIds: ["HSF-LE.A.4"],
    difficulty: "standard",
    metadata: { module: 5, topic: "exponential-equations" },
  },
  {
    problemFamilyId: "step-by-step-solver:exponential-models",
    componentKey: "step-by-step-solver",
    displayName: "Exponential Model Problems",
    description: "Write and solve exponential equations from real-world contexts",
    objectiveIds: ["HSF-LE.A.4", "HSF-BF.B.5"],
    difficulty: "challenging",
    metadata: { module: 5, topic: "exponential-models" },
  },
  // Natural Base e (HSF-LE.A.1, HSF-LE.A.2)
  {
    problemFamilyId: "step-by-step-solver:natural-base-e",
    componentKey: "step-by-step-solver",
    displayName: "Exponential Functions with Base e",
    description: "Analyze and solve problems involving the natural base e",
    objectiveIds: ["HSF-LE.A.1", "HSF-LE.A.2"],
    difficulty: "challenging",
    metadata: { module: 5, topic: "natural-base" },
  },
  {
    problemFamilyId: "graphing-explorer:exponential-base-e",
    componentKey: "graphing-explorer",
    displayName: "Graph Exponential Functions with Base e",
    description: "Graph exponential functions with natural base e",
    objectiveIds: ["HSF-LE.A.1", "HSF-IF.C.7e"],
    difficulty: "standard",
    metadata: { module: 5, topic: "natural-base" },
  },
  // Geometric Sequences and Series (HSF-LE.A.2)
  {
    problemFamilyId: "step-by-step-solver:geometric-sequences",
    componentKey: "step-by-step-solver",
    displayName: "Geometric Sequences",
    description: "Generate geometric sequences and find terms",
    objectiveIds: ["HSF-LE.A.2"],
    difficulty: "standard",
    metadata: { module: 5, topic: "sequences-series" },
  },
  {
    problemFamilyId: "step-by-step-solver:geometric-series",
    componentKey: "step-by-step-solver",
    displayName: "Geometric Series",
    description: "Find sums of geometric series",
    objectiveIds: ["HSF-LE.A.2"],
    difficulty: "standard",
    metadata: { module: 5, topic: "sequences-series" },
  },
  // Compare Models (HSF-LE.A.2)
  {
    problemFamilyId: "step-by-step-solver:compare-exponential-linear",
    componentKey: "step-by-step-solver",
    displayName: "Compare Exponential and Linear Models",
    description: "Distinguish between linear and exponential growth models",
    objectiveIds: ["HSF-LE.A.1", "HSF-LE.A.2"],
    difficulty: "standard",
    metadata: { module: 5, topic: "model-comparison" },
  },
  {
    problemFamilyId: "graphing-explorer:exponential-vs-linear",
    componentKey: "graphing-explorer",
    displayName: "Compare Exponential and Linear Graphs",
    description: "Compare exponential and linear function graphs",
    objectiveIds: ["HSF-LE.A.1"],
    difficulty: "standard",
    metadata: { module: 5, topic: "model-comparison" },
  },
  // Comprehension
  {
    problemFamilyId: "comprehension-quiz:exponential-vocabulary",
    componentKey: "comprehension-quiz",
    displayName: "Exponential Functions Vocabulary",
    description: "Assess understanding of exponential function terminology",
    objectiveIds: ["HSF-IF.C.7e", "HSF-LE.A.4"],
    difficulty: "introductory",
    metadata: { module: 5, topic: "vocabulary" },
  },
];