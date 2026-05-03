import type { ProblemFamilyInput } from '@math-platform/practice-core';

export const UNIT3_PROBLEM_FAMILIES: ProblemFamilyInput[] = [
  // Periodic Phenomena (HSF-TF.A.4, HSF-TF.B.5)
  {
    problemFamilyId: "comprehension-quiz:periodic-phenomena",
    componentKey: "comprehension-quiz",
    displayName: "Periodic Phenomena",
    description: "Identify and describe periodic behavior in real-world contexts",
    objectiveIds: ["HSF-TF.A.4", "HSF-TF.B.5"],
    difficulty: "introductory",
    metadata: { unit: 3, topic: "periodic-phenomena" },
  },
  // Basic Trig Functions (HSF-TF.A.1, HSF-TF.A.2)
  {
    problemFamilyId: "step-by-step-solver:basic-trig-functions",
    componentKey: "step-by-step-solver",
    displayName: "Basic Trigonometric Functions",
    description: "Evaluate sine, cosine, and tangent for standard angles using definitions",
    objectiveIds: ["HSF-TF.A.1", "HSF-TF.A.2"],
    difficulty: "standard",
    metadata: { unit: 3, topic: "basic-trig" },
  },
  // Unit Circle (HSF-TF.A.1, HSF-TF.A.2, HSF-TF.A.4)
  {
    problemFamilyId: "graphing-explorer:unit-circle",
    componentKey: "graphing-explorer",
    displayName: "Explore the Unit Circle",
    description: "Explore the unit circle to understand trigonometric values for all angles",
    objectiveIds: ["HSF-TF.A.1", "HSF-TF.A.2", "HSF-TF.A.4"],
    difficulty: "standard",
    metadata: { unit: 3, topic: "unit-circle" },
  },
  {
    problemFamilyId: "step-by-step-solver:unit-circle-values",
    componentKey: "step-by-step-solver",
    displayName: "Unit Circle Values",
    description: "Find exact trigonometric values for angles on the unit circle",
    objectiveIds: ["HSF-TF.A.2", "HSF-TF.A.4"],
    difficulty: "standard",
    metadata: { unit: 3, topic: "unit-circle" },
  },
  // Sinusoidal Transformations and Applications (HSF-TF.B.5)
  {
    problemFamilyId: "graphing-explorer:sinusoidal-transformations",
    componentKey: "graphing-explorer",
    displayName: "Sinusoidal Transformations",
    description: "Explore amplitude, period, phase shift, and vertical shift on sinusoidal graphs",
    objectiveIds: ["HSF-TF.B.5"],
    difficulty: "standard",
    metadata: { unit: 3, topic: "sinusoidal" },
  },
  {
    problemFamilyId: "step-by-step-solver:sinusoidal-modeling",
    componentKey: "step-by-step-solver",
    displayName: "Sinusoidal Modeling",
    description: "Write sinusoidal functions to model real-world periodic phenomena with specified parameters",
    objectiveIds: ["HSF-TF.B.5"],
    difficulty: "challenging",
    metadata: { unit: 3, topic: "sinusoidal" },
  },
  // Tangent Function (HSF-TF.A.2, HSF-TF.B.5)
  {
    problemFamilyId: "graphing-explorer:tangent-function",
    componentKey: "graphing-explorer",
    displayName: "Graph the Tangent Function",
    description: "Graph and analyze the tangent function, including period and asymptotes",
    objectiveIds: ["HSF-TF.A.2", "HSF-TF.B.5"],
    difficulty: "standard",
    metadata: { unit: 3, topic: "tangent" },
  },
  // Inverse Trig (HSF-TF.A.1, HSF-TF.A.2)
  {
    problemFamilyId: "step-by-step-solver:inverse-trig-functions",
    componentKey: "step-by-step-solver",
    displayName: "Inverse Trigonometric Functions",
    description: "Evaluate arcsin, arccos, and arctan and understand their restricted domains",
    objectiveIds: ["HSF-TF.A.1", "HSF-TF.A.2"],
    difficulty: "standard",
    metadata: { unit: 3, topic: "inverse-trig" },
  },
  // Trig Equations (HSF-TF.A.2, HSF-TF.B.5)
  {
    problemFamilyId: "step-by-step-solver:trig-equations",
    componentKey: "step-by-step-solver",
    displayName: "Solve Trigonometric Equations",
    description: "Solve trigonometric equations over restricted and unrestricted domains",
    objectiveIds: ["HSF-TF.A.2", "HSF-TF.B.5"],
    difficulty: "challenging",
    metadata: { unit: 3, topic: "trig-equations" },
  },
  // Polar Coordinates and Functions (HSF-TF.A.1, HSF-TF.A.4)
  {
    problemFamilyId: "graphing-explorer:polar-coordinates",
    componentKey: "graphing-explorer",
    displayName: "Polar Coordinates and Functions",
    description: "Plot points and graph functions in polar coordinates",
    objectiveIds: ["HSF-TF.A.1", "HSF-TF.A.4"],
    difficulty: "challenging",
    metadata: { unit: 3, topic: "polar" },
  },
];
