import type { ProblemFamilyInput } from '@math-platform/practice-core';

export const UNIT6_PROBLEM_FAMILIES: ProblemFamilyInput[] = [
  // Area of Polygons
  {
    problemFamilyId: "step-by-step-solver:area-of-polygons",
    componentKey: "step-by-step-solver",
    displayName: "Area of Polygons",
    description: "Calculate the area of triangles, parallelograms, trapezoids, and regular polygons",
    objectiveIds: ["G-GPE.B.7", "G-MG.A.1"],
    difficulty: "standard",
    metadata: { unit: 6, topic: "area" },
  },
  // Surface Area
  {
    problemFamilyId: "step-by-step-solver:surface-area-3d",
    componentKey: "step-by-step-solver",
    displayName: "Surface Area",
    description: "Find the surface area of prisms, pyramids, cylinders, and cones",
    objectiveIds: ["G-GMD.A.1", "G-GMD.A.3"],
    difficulty: "standard",
    metadata: { unit: 6, topic: "surface-area" },
  },
  // Volume of Prisms and Cylinders
  {
    problemFamilyId: "step-by-step-solver:volume-prisms-cylinders",
    componentKey: "step-by-step-solver",
    displayName: "Volume of Prisms and Cylinders",
    description: "Calculate the volume of prisms and cylinders using volume formulas",
    objectiveIds: ["G-GMD.A.1", "G-GMD.A.3"],
    difficulty: "standard",
    metadata: { unit: 6, topic: "volume" },
  },
  // Volume of Cones and Spheres
  {
    problemFamilyId: "step-by-step-solver:volume-cones-spheres",
    componentKey: "step-by-step-solver",
    displayName: "Volume of Cones and Spheres",
    description: "Calculate the volume of cones and spheres and solve applied problems",
    objectiveIds: ["G-GMD.A.1", "G-GMD.A.3"],
    difficulty: "standard",
    metadata: { unit: 6, topic: "volume" },
  },
  // Cross-Sections
  {
    problemFamilyId: "comprehension-quiz:cross-sections-3d",
    componentKey: "comprehension-quiz",
    displayName: "Cross-Sections of 3D Figures",
    description: "Identify 2D cross-sections formed by slicing three-dimensional objects",
    objectiveIds: ["G-GMD.B.4"],
    difficulty: "standard",
    metadata: { unit: 6, topic: "cross-sections" },
  },
];
