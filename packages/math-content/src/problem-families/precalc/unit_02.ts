import type { ProblemFamilyInput } from '@math-platform/practice-core';

export const UNIT2_PROBLEM_FAMILIES: ProblemFamilyInput[] = [
  // Arithmetic vs Geometric Sequences (HSF-LE.A.1, HSF-LE.A.2)
  {
    problemFamilyId: "comprehension-quiz:arithmetic-vs-geometric",
    componentKey: "comprehension-quiz",
    displayName: "Arithmetic vs Geometric Sequences",
    description: "Distinguish between arithmetic and geometric sequences and identify their properties",
    objectiveIds: ["HSF-LE.A.1", "HSF-LE.A.2"],
    difficulty: "introductory",
    metadata: { unit: 2, topic: "sequences" },
  },
  // Linear vs Exponential (HSF-LE.A.1, HSF-LE.A.2)
  {
    problemFamilyId: "graphing-explorer:linear-vs-exponential",
    componentKey: "graphing-explorer",
    displayName: "Linear vs Exponential Comparison",
    description: "Compare linear and exponential function graphs to understand growth differences",
    objectiveIds: ["HSF-LE.A.1", "HSF-LE.A.2"],
    difficulty: "standard",
    metadata: { unit: 2, topic: "model-comparison" },
  },
  {
    problemFamilyId: "step-by-step-solver:construct-linear-exponential",
    componentKey: "step-by-step-solver",
    displayName: "Construct Linear and Exponential Functions",
    description: "Build linear and exponential functions from graphs, tables, or verbal descriptions",
    objectiveIds: ["HSF-LE.A.1", "HSF-LE.A.2"],
    difficulty: "standard",
    metadata: { unit: 2, topic: "construct-functions" },
  },
  // Exponential Functions (HSF-IF.C.7e, HSF-LE.B.5)
  {
    problemFamilyId: "graphing-explorer:exponential-functions",
    componentKey: "graphing-explorer",
    displayName: "Graph Exponential Functions",
    description: "Graph exponential functions and identify intercepts, asymptotes, and end behavior",
    objectiveIds: ["HSF-IF.C.7e", "HSF-LE.B.5"],
    difficulty: "standard",
    metadata: { unit: 2, topic: "exponential-functions" },
  },
  // Exponential Modeling (HSF-LE.A.4, HSF-LE.B.5, HSF-BF.A.1a)
  {
    problemFamilyId: "step-by-step-solver:exponential-modeling",
    componentKey: "step-by-step-solver",
    displayName: "Exponential Modeling",
    description: "Write and solve exponential models for real-world growth and decay scenarios",
    objectiveIds: ["HSF-LE.A.4", "HSF-LE.B.5", "HSF-BF.A.1a"],
    difficulty: "challenging",
    metadata: { unit: 2, topic: "exponential-modeling" },
  },
  // Composition of Functions (HSF-IF.A.2, HSF-BF.A.1)
  {
    problemFamilyId: "step-by-step-solver:composition-of-functions",
    componentKey: "step-by-step-solver",
    displayName: "Composition of Functions",
    description: "Evaluate and interpret composite functions using function notation",
    objectiveIds: ["HSF-IF.A.2", "HSF-BF.A.1"],
    difficulty: "standard",
    metadata: { unit: 2, topic: "composition" },
  },
  // Inverse Functions (HSF-BF.B.4)
  {
    problemFamilyId: "step-by-step-solver:inverse-functions",
    componentKey: "step-by-step-solver",
    displayName: "Find Inverse Functions",
    description: "Find and verify inverse functions algebraically and graphically",
    objectiveIds: ["HSF-BF.B.4"],
    difficulty: "standard",
    metadata: { unit: 2, topic: "inverse-functions" },
  },
  // Logarithmic Functions and Properties (HSF-IF.C.7e, HSF-BF.B.5)
  {
    problemFamilyId: "graphing-explorer:logarithmic-functions",
    componentKey: "graphing-explorer",
    displayName: "Graph Logarithmic Functions",
    description: "Graph logarithmic functions and explore their relationship to exponentials",
    objectiveIds: ["HSF-IF.C.7e", "HSF-BF.B.5"],
    difficulty: "standard",
    metadata: { unit: 2, topic: "logarithmic-functions" },
  },
  // Logarithmic Equations (HSF-LE.A.4, HSF-BF.B.5)
  {
    problemFamilyId: "step-by-step-solver:logarithmic-equations",
    componentKey: "step-by-step-solver",
    displayName: "Solve Logarithmic Equations",
    description: "Solve equations involving logarithms using properties and inverse relationships",
    objectiveIds: ["HSF-LE.A.4", "HSF-BF.B.5"],
    difficulty: "challenging",
    metadata: { unit: 2, topic: "logarithmic-equations" },
  },
  // Semi-Log Plots (HSF-LE.A.1, HSF-IF.B.4)
  {
    problemFamilyId: "graphing-explorer:semi-log-plots",
    componentKey: "graphing-explorer",
    displayName: "Semi-Log Plot Analysis",
    description: "Use semi-log plots to identify exponential relationships in data",
    objectiveIds: ["HSF-LE.A.1", "HSF-IF.B.4"],
    difficulty: "challenging",
    metadata: { unit: 2, topic: "semi-log" },
  },
];
