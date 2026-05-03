import type { ProblemFamilyInput } from '@math-platform/practice-core';

export const MODULE6_PROBLEM_FAMILIES: ProblemFamilyInput[] = [
  // Logarithmic and Exponential Form (HSF-BF.B.5, HSF-LE.A.4)
  {
    problemFamilyId: "step-by-step-solver:logarithmic-exponential-form",
    componentKey: "step-by-step-solver",
    displayName: "Logarithmic and Exponential Form",
    description: "Convert between logarithmic and exponential forms and evaluate logarithmic expressions",
    objectiveIds: ["HSF-BF.B.5", "HSF-LE.A.4"],
    difficulty: "standard",
    metadata: { module: 6, topic: "logarithmic-functions" },
  },
  // Graphing Logarithmic Functions (HSF-IF.C.7e)
  {
    problemFamilyId: "graphing-explorer:logarithmic-functions",
    componentKey: "graphing-explorer",
    displayName: "Graph Logarithmic Functions",
    description: "Graph logarithmic functions and identify key features and transformations",
    objectiveIds: ["HSF-IF.C.7e"],
    difficulty: "standard",
    metadata: { module: 6, topic: "logarithmic-functions" },
  },
  {
    problemFamilyId: "graphing-explorer:exponential-functions-log",
    componentKey: "graphing-explorer",
    displayName: "Graph Exponential Functions with Logarithms",
    description: "Graph exponential functions and relate them to logarithmic inverses",
    objectiveIds: ["HSF-IF.C.7e", "HSF-BF.B.5"],
    difficulty: "standard",
    metadata: { module: 6, topic: "logarithmic-functions" },
  },
  // Solving Logarithmic Equations (HSF-LE.A.4)
  {
    problemFamilyId: "step-by-step-solver:solve-logarithmic-equations",
    componentKey: "step-by-step-solver",
    displayName: "Solve Logarithmic Equations",
    description: "Solve logarithmic equations using properties of equality and definitions",
    objectiveIds: ["HSF-LE.A.4"],
    difficulty: "standard",
    metadata: { module: 6, topic: "solving-log-equations" },
  },
  // Properties of Logarithms (HSF-LE.B.5)
  {
    problemFamilyId: "step-by-step-solver:properties-of-logarithms",
    componentKey: "step-by-step-solver",
    displayName: "Properties of Logarithms",
    description: "Simplify and evaluate expressions using product, quotient, and power properties of logarithms",
    objectiveIds: ["HSF-LE.B.5"],
    difficulty: "standard",
    metadata: { module: 6, topic: "log-properties" },
  },
  // Change of Base Formula (HSF-LE.B.5)
  {
    problemFamilyId: "step-by-step-solver:change-of-base",
    componentKey: "step-by-step-solver",
    displayName: "Change of Base Formula",
    description: "Evaluate logarithmic expressions using the change of base formula",
    objectiveIds: ["HSF-LE.B.5"],
    difficulty: "standard",
    metadata: { module: 6, topic: "log-properties" },
  },
  // Natural Logarithms (HSF-LE.A.1, HSF-LE.A.2)
  {
    problemFamilyId: "step-by-step-solver:natural-logarithms",
    componentKey: "step-by-step-solver",
    displayName: "Natural Logarithms",
    description: "Simplify expressions with natural logarithms and solve natural logarithmic equations",
    objectiveIds: ["HSF-LE.A.1", "HSF-LE.A.2"],
    difficulty: "challenging",
    metadata: { module: 6, topic: "natural-logarithms" },
  },
  // Continuous Growth and Decay (HSF-LE.A.2)
  {
    problemFamilyId: "step-by-step-solver:continuous-growth-decay",
    componentKey: "step-by-step-solver",
    displayName: "Continuous Growth and Decay",
    description: "Write and solve continuous exponential growth and decay equations",
    objectiveIds: ["HSF-LE.A.2"],
    difficulty: "challenging",
    metadata: { module: 6, topic: "continuous-growth" },
  },
  // Compare Exponential and Logarithmic Models (HSF-LE.A.1, HSF-LE.A.2)
  {
    problemFamilyId: "step-by-step-solver:compare-exponential-logarithmic",
    componentKey: "step-by-step-solver",
    displayName: "Compare Exponential and Logarithmic Models",
    description: "Construct and compare exponential and logarithmic models",
    objectiveIds: ["HSF-LE.A.1", "HSF-LE.A.2"],
    difficulty: "standard",
    metadata: { module: 6, topic: "model-comparison" },
  },
  // Comprehension
  {
    problemFamilyId: "comprehension-quiz:logarithmic-vocabulary",
    componentKey: "comprehension-quiz",
    displayName: "Logarithmic Functions Vocabulary",
    description: "Assess understanding of logarithmic function terminology",
    objectiveIds: ["HSF-BF.B.5", "HSF-LE.A.4"],
    difficulty: "introductory",
    metadata: { module: 6, topic: "vocabulary" },
  },
];
