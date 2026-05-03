import type { ProblemFamilyInput } from '@math-platform/practice-core';

export const UNIT2_PROBLEM_FAMILIES: ProblemFamilyInput[] = [
  // Polygon Angle Sums
  {
    problemFamilyId: "step-by-step-solver:polygon-angle-sums",
    componentKey: "step-by-step-solver",
    displayName: "Polygon Angle Sums",
    description: "Calculate interior and exterior angle sums for convex polygons",
    objectiveIds: ["G-CO.C.10"],
    difficulty: "standard",
    metadata: { unit: 2, topic: "polygon-angles" },
  },
  // Parallelogram Properties
  {
    problemFamilyId: "comprehension-quiz:parallelogram-properties",
    componentKey: "comprehension-quiz",
    displayName: "Parallelogram Properties",
    description: "Identify and apply properties of parallelograms including opposite sides, angles, and diagonals",
    objectiveIds: ["G-CO.C.11"],
    difficulty: "standard",
    metadata: { unit: 2, topic: "parallelograms" },
  },
  // Special Parallelograms
  {
    problemFamilyId: "step-by-step-solver:special-parallelograms",
    componentKey: "step-by-step-solver",
    displayName: "Special Parallelograms",
    description: "Solve problems involving rectangles, rhombi, and squares using their unique properties",
    objectiveIds: ["G-CO.C.11"],
    difficulty: "standard",
    metadata: { unit: 2, topic: "special-parallelograms" },
  },
  // Trapezoids
  {
    problemFamilyId: "step-by-step-solver:trapezoid-properties",
    componentKey: "step-by-step-solver",
    displayName: "Trapezoid Properties",
    description: "Apply properties of trapezoids and isosceles trapezoids to find missing measures",
    objectiveIds: ["G-CO.C.11"],
    difficulty: "standard",
    metadata: { unit: 2, topic: "trapezoids" },
  },
  // Coordinate Proofs
  {
    problemFamilyId: "step-by-step-solver:coordinate-proofs-quadrilaterals",
    componentKey: "step-by-step-solver",
    displayName: "Coordinate Proofs with Quadrilaterals",
    description: "Use coordinates and distance/slope formulas to prove quadrilateral properties",
    objectiveIds: ["G-GPE.B.4", "G-GPE.B.5"],
    difficulty: "challenging",
    metadata: { unit: 2, topic: "coordinate-proofs" },
  },
];
