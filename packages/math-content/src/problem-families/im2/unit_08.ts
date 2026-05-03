import type { ProblemFamilyInput } from '@math-platform/practice-core';

export const UNIT8_PROBLEM_FAMILIES: ProblemFamilyInput[] = [
  // Relations vs Functions
  {
    problemFamilyId: "comprehension-quiz:relations-vs-functions",
    componentKey: "comprehension-quiz",
    displayName: "Relations vs Functions",
    description: "Determine whether a relation is a function using tables, mappings, and graphs",
    objectiveIds: ["HSF-IF.A.1"],
    difficulty: "introductory",
    metadata: { unit: 8, topic: "relations-functions" },
  },
  // Domain and Range
  {
    problemFamilyId: "step-by-step-solver:domain-and-range",
    componentKey: "step-by-step-solver",
    displayName: "Domain and Range",
    description: "Identify the domain and range of functions from graphs, tables, and equations",
    objectiveIds: ["HSF-IF.A.1", "HSF-IF.B.5"],
    difficulty: "standard",
    metadata: { unit: 8, topic: "domain-range" },
  },
  // Function Notation
  {
    problemFamilyId: "step-by-step-solver:function-notation",
    componentKey: "step-by-step-solver",
    displayName: "Function Notation",
    description: "Evaluate functions using f(x) notation and interpret function values in context",
    objectiveIds: ["HSF-IF.A.2"],
    difficulty: "standard",
    metadata: { unit: 8, topic: "function-notation" },
  },
  // Linear vs Nonlinear
  {
    problemFamilyId: "graphing-explorer:linear-vs-nonlinear",
    componentKey: "graphing-explorer",
    displayName: "Linear vs Nonlinear Functions",
    description: "Compare linear and nonlinear functions by examining their graphs and tables",
    objectiveIds: ["HSF-IF.B.4", "HSF-IF.C.7"],
    difficulty: "standard",
    metadata: { unit: 8, topic: "linear-nonlinear" },
  },
  // Transformations of Functions
  {
    problemFamilyId: "graphing-explorer:function-transformations",
    componentKey: "graphing-explorer",
    displayName: "Transformations of Functions",
    description: "Explore vertical and horizontal shifts, stretches, and reflections of function graphs",
    objectiveIds: ["HSF-BF.B.3"],
    difficulty: "standard",
    metadata: { unit: 8, topic: "transformations" },
  },
  // Comparing Functions
  {
    problemFamilyId: "comprehension-quiz:comparing-functions",
    componentKey: "comprehension-quiz",
    displayName: "Comparing Functions",
    description: "Compare properties of functions represented in different ways: algebraically, graphically, and in tables",
    objectiveIds: ["HSF-IF.C.9"],
    difficulty: "standard",
    metadata: { unit: 8, topic: "comparing-functions" },
  },
];
