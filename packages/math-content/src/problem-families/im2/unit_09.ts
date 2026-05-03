import type { ProblemFamilyInput } from '@math-platform/practice-core';

export const UNIT9_PROBLEM_FAMILIES: ProblemFamilyInput[] = [
  // Solving Linear Equations
  {
    problemFamilyId: "step-by-step-solver:solving-linear-equations",
    componentKey: "step-by-step-solver",
    displayName: "Solving Linear Equations",
    description: "Solve one-variable linear equations including multi-step and variables on both sides",
    objectiveIds: ["HSF-IF.A.2"],
    difficulty: "standard",
    metadata: { unit: 9, topic: "linear-equations" },
  },
  // Graphing Linear Equations
  {
    problemFamilyId: "graphing-explorer:graphing-linear-equations",
    componentKey: "graphing-explorer",
    displayName: "Graphing Linear Equations",
    description: "Graph linear equations in slope-intercept and standard form",
    objectiveIds: ["HSF-IF.C.7", "G-GPE.B.5"],
    difficulty: "standard",
    metadata: { unit: 9, topic: "graphing-lines" },
  },
  // Linear Inequalities
  {
    problemFamilyId: "graphing-explorer:linear-inequalities",
    componentKey: "graphing-explorer",
    displayName: "Linear Inequalities",
    description: "Graph linear inequalities on the coordinate plane and identify solution regions",
    objectiveIds: ["HSF-IF.C.7", "HSF-IF.B.5"],
    difficulty: "standard",
    metadata: { unit: 9, topic: "linear-inequalities" },
  },
  // Systems of Equations
  {
    problemFamilyId: "step-by-step-solver:systems-of-equations",
    componentKey: "step-by-step-solver",
    displayName: "Systems of Equations",
    description: "Solve systems of linear equations using substitution and elimination methods",
    objectiveIds: ["HSF-IF.A.2", "HSF-BF.A.1"],
    difficulty: "standard",
    metadata: { unit: 9, topic: "systems" },
  },
  // Systems of Inequalities
  {
    problemFamilyId: "graphing-explorer:systems-of-inequalities",
    componentKey: "graphing-explorer",
    displayName: "Systems of Inequalities",
    description: "Graph systems of linear inequalities and identify the feasible region",
    objectiveIds: ["HSF-IF.C.7", "G-GPE.B.5"],
    difficulty: "challenging",
    metadata: { unit: 9, topic: "systems-inequalities" },
  },
];
