import type { ProblemFamilyInput } from '@math-platform/practice-core';

export const UNIT4_PROBLEM_FAMILIES: ProblemFamilyInput[] = [
  // Parametric Functions and Motion (HSN-VM.A.1, HSN-VM.A.3)
  {
    problemFamilyId: "graphing-explorer:parametric-motion",
    componentKey: "graphing-explorer",
    displayName: "Parametric Functions and Motion",
    description: "Graph parametric equations to model particle motion and trajectories",
    objectiveIds: ["HSN-VM.A.1", "HSN-VM.A.3"],
    difficulty: "standard",
    metadata: { unit: 4, topic: "parametric" },
  },
  {
    problemFamilyId: "step-by-step-solver:parametric-rectangular",
    componentKey: "step-by-step-solver",
    displayName: "Convert Parametric to Rectangular",
    description: "Eliminate the parameter to convert parametric equations to rectangular form",
    objectiveIds: ["HSN-VM.A.1", "HSN-VM.A.3"],
    difficulty: "challenging",
    metadata: { unit: 4, topic: "parametric" },
  },
  // Conic Sections (HSF-IF.C.7c)
  {
    problemFamilyId: "graphing-explorer:conic-sections",
    componentKey: "graphing-explorer",
    displayName: "Graph Conic Sections",
    description: "Graph parabolas, ellipses, and hyperbolas from their equations",
    objectiveIds: ["HSF-IF.C.7c"],
    difficulty: "standard",
    metadata: { unit: 4, topic: "conic-sections" },
  },
  // Vectors (HSN-VM.A.1, HSN-VM.A.2, HSN-VM.A.3, HSN-VM.B.4)
  {
    problemFamilyId: "step-by-step-solver:vector-components",
    componentKey: "step-by-step-solver",
    displayName: "Vector Components and Magnitude",
    description: "Find vector components, magnitude, and direction from coordinates",
    objectiveIds: ["HSN-VM.A.1", "HSN-VM.A.2", "HSN-VM.B.4"],
    difficulty: "standard",
    metadata: { unit: 4, topic: "vectors" },
  },
  {
    problemFamilyId: "step-by-step-solver:vector-operations",
    componentKey: "step-by-step-solver",
    displayName: "Vector Operations",
    description: "Add, subtract, and scale vectors in component form",
    objectiveIds: ["HSN-VM.B.4", "HSN-VM.B.5"],
    difficulty: "standard",
    metadata: { unit: 4, topic: "vectors" },
  },
  {
    problemFamilyId: "comprehension-quiz:vector-applications",
    componentKey: "comprehension-quiz",
    displayName: "Vector Applications",
    description: "Apply vector concepts to solve velocity, force, and displacement problems",
    objectiveIds: ["HSN-VM.A.3", "HSN-VM.B.4"],
    difficulty: "challenging",
    metadata: { unit: 4, topic: "vectors" },
  },
  // Vector-Valued Functions (HSN-VM.A.1, HSN-VM.A.3)
  {
    problemFamilyId: "graphing-explorer:vector-valued-functions",
    componentKey: "graphing-explorer",
    displayName: "Vector-Valued Functions",
    description: "Graph and interpret vector-valued functions as parametric curves",
    objectiveIds: ["HSN-VM.A.1", "HSN-VM.A.3"],
    difficulty: "challenging",
    metadata: { unit: 4, topic: "vector-functions" },
  },
  // Matrix Operations and Transformations (HSN-VM.C.6, HSN-VM.C.7, HSN-VM.C.8, HSN-VM.C.9)
  {
    problemFamilyId: "step-by-step-solver:matrix-operations",
    componentKey: "step-by-step-solver",
    displayName: "Matrix Operations",
    description: "Add, subtract, multiply, and scale matrices",
    objectiveIds: ["HSN-VM.C.6", "HSN-VM.C.7", "HSN-VM.C.8"],
    difficulty: "standard",
    metadata: { unit: 4, topic: "matrices" },
  },
  {
    problemFamilyId: "comprehension-quiz:matrix-properties",
    componentKey: "comprehension-quiz",
    displayName: "Matrix Properties",
    description: "Understand properties of matrix multiplication including non-commutativity, identity, and zero matrices",
    objectiveIds: ["HSN-VM.C.9", "HSN-VM.C.10"],
    difficulty: "standard",
    metadata: { unit: 4, topic: "matrices" },
  },
  // Matrix Systems (HSA-REI.C.8, HSA-REI.C.9, HSN-VM.C.10, HSN-VM.C.11)
  {
    problemFamilyId: "step-by-step-solver:matrix-systems",
    componentKey: "step-by-step-solver",
    displayName: "Solve Systems with Matrices",
    description: "Represent and solve systems of linear equations using matrix equations and inverses",
    objectiveIds: ["HSA-REI.C.8", "HSA-REI.C.9", "HSN-VM.C.10"],
    difficulty: "challenging",
    metadata: { unit: 4, topic: "matrix-systems" },
  },
  {
    problemFamilyId: "graphing-explorer:matrix-transformations",
    componentKey: "graphing-explorer",
    displayName: "Matrix Transformations",
    description: "Use matrices to transform vectors and visualize geometric transformations",
    objectiveIds: ["HSN-VM.C.11", "HSN-VM.C.8"],
    difficulty: "challenging",
    metadata: { unit: 4, topic: "matrix-transformations" },
  },
];
