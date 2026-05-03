import type { ProblemFamilyInput } from '@math-platform/practice-core';

export const MODULE9_PROBLEM_FAMILIES: ProblemFamilyInput[] = [
  // Unit Circle and Special Angles (HSF-TF.A.1, HSF-TF.A.2)
  {
    problemFamilyId: "step-by-step-solver:unit-circle-values",
    componentKey: "step-by-step-solver",
    displayName: "Unit Circle Values",
    description: "Find values of trigonometric functions using the unit circle and special angles",
    objectiveIds: ["HSF-TF.A.1", "HSF-TF.A.2"],
    difficulty: "standard",
    metadata: { module: 9, topic: "unit-circle" },
  },
  // Reference Angles (HSF-TF.A.2)
  {
    problemFamilyId: "step-by-step-solver:reference-angles",
    componentKey: "step-by-step-solver",
    displayName: "Reference Angles",
    description: "Find values of trigonometric functions using reference angles",
    objectiveIds: ["HSF-TF.A.2"],
    difficulty: "standard",
    metadata: { module: 9, topic: "unit-circle" },
  },
  // Periodicity and Modeling (HSF-TF.A.4, HSF-TF.B.5)
  {
    problemFamilyId: "step-by-step-solver:periodic-modeling",
    componentKey: "step-by-step-solver",
    displayName: "Periodic Modeling",
    description: "Find values of trigonometric functions that model periodic events",
    objectiveIds: ["HSF-TF.A.4", "HSF-TF.B.5"],
    difficulty: "standard",
    metadata: { module: 9, topic: "periodic-modeling" },
  },
  // Graph Sine and Cosine (HSF-TF.B.5)
  {
    problemFamilyId: "graphing-explorer:sine-cosine-graphs",
    componentKey: "graphing-explorer",
    displayName: "Graph Sine and Cosine Functions",
    description: "Graph and analyze sine and cosine functions with amplitude, period, and phase shifts",
    objectiveIds: ["HSF-TF.B.5"],
    difficulty: "standard",
    metadata: { module: 9, topic: "trig-graphs" },
  },
  // Graph Tangent and Reciprocal Functions (HSF-TF.B.5)
  {
    problemFamilyId: "graphing-explorer:tangent-reciprocal-graphs",
    componentKey: "graphing-explorer",
    displayName: "Graph Tangent and Reciprocal Functions",
    description: "Graph and analyze tangent, cosecant, secant, and cotangent functions",
    objectiveIds: ["HSF-TF.B.5"],
    difficulty: "challenging",
    metadata: { module: 9, topic: "trig-graphs" },
  },
  // Transformations of Trigonometric Functions (HSF-TF.B.5)
  {
    problemFamilyId: "graphing-explorer:trig-transformations",
    componentKey: "graphing-explorer",
    displayName: "Trigonometric Function Transformations",
    description: "Graph horizontal and vertical translations of trigonometric functions",
    objectiveIds: ["HSF-TF.B.5"],
    difficulty: "standard",
    metadata: { module: 9, topic: "trig-graphs" },
  },
  // Inverse Trigonometric Functions (HSF-TF.A.1, HSF-TF.A.2)
  {
    problemFamilyId: "step-by-step-solver:inverse-trig",
    componentKey: "step-by-step-solver",
    displayName: "Inverse Trigonometric Functions",
    description: "Find angle measures using inverse trigonometric functions",
    objectiveIds: ["HSF-TF.A.1", "HSF-TF.A.2"],
    difficulty: "standard",
    metadata: { module: 9, topic: "inverse-trig" },
  },
  // Symmetry and Periodicity (HSF-TF.A.4)
  {
    problemFamilyId: "step-by-step-solver:symmetry-periodicity",
    componentKey: "step-by-step-solver",
    displayName: "Symmetry and Periodicity",
    description: "Use the unit circle to explain symmetry and periodicity of trigonometric functions",
    objectiveIds: ["HSF-TF.A.4"],
    difficulty: "standard",
    metadata: { module: 9, topic: "unit-circle" },
  },
  // Comprehension
  {
    problemFamilyId: "comprehension-quiz:trigonometric-vocabulary",
    componentKey: "comprehension-quiz",
    displayName: "Trigonometric Functions Vocabulary",
    description: "Assess understanding of trigonometric function terminology",
    objectiveIds: ["HSF-TF.A.1", "HSF-TF.A.2"],
    difficulty: "introductory",
    metadata: { module: 9, topic: "vocabulary" },
  },
];
