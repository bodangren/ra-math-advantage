import type { ProblemFamilyInput } from '@math-platform/practice-core';

export const UNIT13_PROBLEM_FAMILIES: ProblemFamilyInput[] = [
  // Fundamental Trig Identities
  {
    problemFamilyId: "step-by-step-solver:fundamental-trig-identities",
    componentKey: "step-by-step-solver",
    displayName: "Fundamental Trig Identities",
    description: "Simplify expressions using reciprocal, quotient, and Pythagorean identities",
    objectiveIds: ["G-SRT.C.6", "G-SRT.C.8"],
    difficulty: "standard",
    metadata: { unit: 13, topic: "fundamental-identities" },
  },
  // Pythagorean Identities
  {
    problemFamilyId: "step-by-step-solver:pythagorean-identities",
    componentKey: "step-by-step-solver",
    displayName: "Pythagorean Identities",
    description: "Apply and prove Pythagorean identities to simplify and verify trig expressions",
    objectiveIds: ["G-SRT.C.6", "G-SRT.C.8"],
    difficulty: "standard",
    metadata: { unit: 13, topic: "pythagorean-identities" },
  },
  // Sum and Difference Identities
  {
    problemFamilyId: "step-by-step-solver:sum-difference-identities",
    componentKey: "step-by-step-solver",
    displayName: "Sum and Difference Identities",
    description: "Use sum and difference formulas to find exact values of trigonometric functions",
    objectiveIds: ["G-SRT.C.6", "G-SRT.C.8"],
    difficulty: "challenging",
    metadata: { unit: 13, topic: "sum-difference" },
  },
  // Double and Half-Angle Identities
  {
    problemFamilyId: "step-by-step-solver:double-half-angle-identities",
    componentKey: "step-by-step-solver",
    displayName: "Double and Half-Angle Identities",
    description: "Apply double-angle and half-angle identities to evaluate and simplify expressions",
    objectiveIds: ["G-SRT.C.6", "G-SRT.C.8"],
    difficulty: "challenging",
    metadata: { unit: 13, topic: "double-half-angle" },
  },
  // Solving Trig Equations
  {
    problemFamilyId: "step-by-step-solver:solving-trig-equations",
    componentKey: "step-by-step-solver",
    displayName: "Solving Trigonometric Equations",
    description: "Solve trigonometric equations using identities and inverse trig functions",
    objectiveIds: ["G-SRT.C.6", "G-SRT.C.8"],
    difficulty: "challenging",
    metadata: { unit: 13, topic: "solving-trig" },
  },
];
