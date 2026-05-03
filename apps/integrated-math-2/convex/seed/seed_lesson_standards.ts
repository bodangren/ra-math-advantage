import { internalMutation } from "../_generated/server";

interface LessonStandardLink {
  lessonSlug: string;
  standardCode: string;
  isPrimary: boolean;
}

// Unit 1 — Relationships in Triangles
const unit1LessonStandards: LessonStandardLink[] = [
  // 1-1 Classifying Triangles
  { lessonSlug: "1-1-classifying-triangles", standardCode: "G-CO.A.1", isPrimary: true },
  { lessonSlug: "1-1-classifying-triangles", standardCode: "G-CO.D.12", isPrimary: false },
  // 1-2 Triangle Angle Relationships
  { lessonSlug: "1-2-triangle-angle-relationships", standardCode: "G-CO.C.10", isPrimary: true },
  { lessonSlug: "1-2-triangle-angle-relationships", standardCode: "G-CO.A.1", isPrimary: false },
  // 1-3 Triangle Inequality Theorem
  { lessonSlug: "1-3-triangle-inequality-theorem", standardCode: "G-CO.C.10", isPrimary: true },
  // 1-4 Congruence Criteria (SSS, SAS, ASA, AAS, HL)
  { lessonSlug: "1-4-congruence-criteria", standardCode: "G-CO.B.8", isPrimary: true },
  { lessonSlug: "1-4-congruence-criteria", standardCode: "G-CO.B.7", isPrimary: true },
  // 1-5 Proving Triangle Congruence
  { lessonSlug: "1-5-proving-triangle-congruence", standardCode: "G-CO.B.7", isPrimary: true },
  { lessonSlug: "1-5-proving-triangle-congruence", standardCode: "G-CO.B.6", isPrimary: false },
  { lessonSlug: "1-5-proving-triangle-congruence", standardCode: "G-SRT.B.5", isPrimary: false },
  // 1-6 Isosceles & Equilateral Triangle Properties
  { lessonSlug: "1-6-isosceles-equilateral-properties", standardCode: "G-CO.C.10", isPrimary: true },
  { lessonSlug: "1-6-isosceles-equilateral-properties", standardCode: "G-SRT.B.5", isPrimary: false },
];

// Unit 2 — Quadrilaterals
const unit2LessonStandards: LessonStandardLink[] = [
  // 2-1 Polygon Basics & Angle Sums
  { lessonSlug: "2-1-polygon-basics-angle-sums", standardCode: "G-CO.C.11", isPrimary: true },
  { lessonSlug: "2-1-polygon-basics-angle-sums", standardCode: "G-CO.A.1", isPrimary: false },
  // 2-2 Parallelogram Properties
  { lessonSlug: "2-2-parallelogram-properties", standardCode: "G-CO.C.11", isPrimary: true },
  { lessonSlug: "2-2-parallelogram-properties", standardCode: "G-CO.B.6", isPrimary: false },
  // 2-3 Special Parallelograms (Rectangle, Rhombus, Square)
  { lessonSlug: "2-3-special-parallelograms", standardCode: "G-CO.C.11", isPrimary: true },
  { lessonSlug: "2-3-special-parallelograms", standardCode: "G-SRT.B.5", isPrimary: false },
  // 2-4 Trapezoids and Isosceles Trapezoids
  { lessonSlug: "2-4-trapezoids", standardCode: "G-CO.C.11", isPrimary: true },
  // 2-5 Coordinate Proofs with Quadrilaterals
  { lessonSlug: "2-5-coordinate-proofs-quadrilaterals", standardCode: "G-GPE.B.4", isPrimary: true },
  { lessonSlug: "2-5-coordinate-proofs-quadrilaterals", standardCode: "G-GPE.B.5", isPrimary: true },
  { lessonSlug: "2-5-coordinate-proofs-quadrilaterals", standardCode: "G-GPE.B.7", isPrimary: false },
];

// Unit 3 — Similarity
const unit3LessonStandards: LessonStandardLink[] = [
  // 3-1 Similar Figures and Scale Factors
  { lessonSlug: "3-1-similar-figures-scale-factors", standardCode: "G-SRT.A.1", isPrimary: true },
  { lessonSlug: "3-1-similar-figures-scale-factors", standardCode: "G-SRT.A.2", isPrimary: true },
  // 3-2 Triangle Similarity (AA, SAS, SSS)
  { lessonSlug: "3-2-triangle-similarity", standardCode: "G-SRT.A.3", isPrimary: true },
  { lessonSlug: "3-2-triangle-similarity", standardCode: "G-SRT.B.5", isPrimary: true },
  // 3-3 Proportions and Indirect Measurement
  { lessonSlug: "3-3-proportions-indirect-measurement", standardCode: "G-SRT.B.5", isPrimary: true },
  { lessonSlug: "3-3-proportions-indirect-measurement", standardCode: "G-MG.A.3", isPrimary: false },
  // 3-4 Similarity Proofs
  { lessonSlug: "3-4-similarity-proofs", standardCode: "G-SRT.B.4", isPrimary: true },
  { lessonSlug: "3-4-similarity-proofs", standardCode: "G-SRT.A.3", isPrimary: false },
  // 3-5 Applications of Similarity
  { lessonSlug: "3-5-applications-similarity", standardCode: "G-SRT.B.5", isPrimary: true },
  { lessonSlug: "3-5-applications-similarity", standardCode: "G-MG.A.1", isPrimary: false },
];

// Unit 4 — Right Triangles & Trigonometry
const unit4LessonStandards: LessonStandardLink[] = [
  // 4-1 Pythagorean Theorem
  { lessonSlug: "4-1-pythagorean-theorem", standardCode: "G-SRT.C.8", isPrimary: true },
  { lessonSlug: "4-1-pythagorean-theorem", standardCode: "G-GPE.B.4", isPrimary: false },
  // 4-2 Special Right Triangles (30-60-90, 45-45-90)
  { lessonSlug: "4-2-special-right-triangles", standardCode: "G-SRT.C.6", isPrimary: true },
  { lessonSlug: "4-2-special-right-triangles", standardCode: "G-SRT.C.8", isPrimary: false },
  // 4-3 Introduction to Sine, Cosine, Tangent
  { lessonSlug: "4-3-intro-sin-cos-tan", standardCode: "G-SRT.C.6", isPrimary: true },
  { lessonSlug: "4-3-intro-sin-cos-tan", standardCode: "G-SRT.C.8", isPrimary: true },
  // 4-4 Solving Right Triangles
  { lessonSlug: "4-4-solving-right-triangles", standardCode: "G-SRT.C.8", isPrimary: true },
  { lessonSlug: "4-4-solving-right-triangles", standardCode: "G-MG.A.1", isPrimary: false },
  // 4-5 Law of Sines
  { lessonSlug: "4-5-law-of-sines", standardCode: "G-SRT.C.8", isPrimary: true },
  { lessonSlug: "4-5-law-of-sines", standardCode: "G-SRT.D.10", isPrimary: false },
  // 4-6 Law of Cosines
  { lessonSlug: "4-6-law-of-cosines", standardCode: "G-SRT.C.8", isPrimary: true },
  { lessonSlug: "4-6-law-of-cosines", standardCode: "G-MG.A.3", isPrimary: false },
];

// Unit 5 — Circles
const unit5LessonStandards: LessonStandardLink[] = [
  // 5-1 Circle Vocabulary and Basic Properties
  { lessonSlug: "5-1-circle-vocabulary-properties", standardCode: "G-C.A.1", isPrimary: true },
  { lessonSlug: "5-1-circle-vocabulary-properties", standardCode: "G-C.A.2", isPrimary: false },
  // 5-2 Angles in Circles (Central, Inscribed)
  { lessonSlug: "5-2-angles-in-circles", standardCode: "G-C.A.2", isPrimary: true },
  { lessonSlug: "5-2-angles-in-circles", standardCode: "G-C.A.3", isPrimary: false },
  // 5-3 Arcs and Chords
  { lessonSlug: "5-3-arcs-and-chords", standardCode: "G-C.A.2", isPrimary: true },
  { lessonSlug: "5-3-arcs-and-chords", standardCode: "G-C.B.5", isPrimary: false },
  // 5-4 Tangents and Secants
  { lessonSlug: "5-4-tangents-and-secants", standardCode: "G-C.A.2", isPrimary: true },
  { lessonSlug: "5-4-tangents-and-secants", standardCode: "G-C.A.3", isPrimary: false },
  // 5-5 Equations of Circles (Coordinate Plane)
  { lessonSlug: "5-5-equations-of-circles", standardCode: "G-GPE.A.1", isPrimary: true },
  { lessonSlug: "5-5-equations-of-circles", standardCode: "G-GPE.B.4", isPrimary: false },
];

// Unit 6 — Measurement
const unit6LessonStandards: LessonStandardLink[] = [
  // 6-1 Area of Polygons
  { lessonSlug: "6-1-area-of-polygons", standardCode: "G-GPE.B.7", isPrimary: true },
  { lessonSlug: "6-1-area-of-polygons", standardCode: "G-MG.A.1", isPrimary: false },
  // 6-2 Surface Area of 3D Figures
  { lessonSlug: "6-2-surface-area-3d", standardCode: "G-GMD.A.3", isPrimary: true },
  { lessonSlug: "6-2-surface-area-3d", standardCode: "G-MG.A.1", isPrimary: false },
  // 6-3 Volume of Prisms and Cylinders
  { lessonSlug: "6-3-volume-prisms-cylinders", standardCode: "G-GMD.A.3", isPrimary: true },
  { lessonSlug: "6-3-volume-prisms-cylinders", standardCode: "G-GMD.A.1", isPrimary: false },
  // 6-4 Volume of Cones and Spheres
  { lessonSlug: "6-4-volume-cones-spheres", standardCode: "G-GMD.A.3", isPrimary: true },
  { lessonSlug: "6-4-volume-cones-spheres", standardCode: "G-GMD.A.1", isPrimary: false },
  // 6-5 Cross-Sections and Composite Solids
  { lessonSlug: "6-5-cross-sections-composite", standardCode: "G-GMD.B.4", isPrimary: true },
  { lessonSlug: "6-5-cross-sections-composite", standardCode: "G-GMD.A.3", isPrimary: false },
];

// Unit 7 — Probability
const unit7LessonStandards: LessonStandardLink[] = [
  // 7-1 Basic Probability Concepts
  { lessonSlug: "7-1-basic-probability", standardCode: "S-CP.A.1", isPrimary: true },
  { lessonSlug: "7-1-basic-probability", standardCode: "S-CP.A.5", isPrimary: false },
  // 7-2 Counting Principle
  { lessonSlug: "7-2-counting-principle", standardCode: "S-CP.B.6", isPrimary: true },
  // 7-3 Permutations
  { lessonSlug: "7-3-permutations", standardCode: "S-CP.B.6", isPrimary: true },
  { lessonSlug: "7-3-permutations", standardCode: "S-CP.A.4", isPrimary: false },
  // 7-4 Combinations
  { lessonSlug: "7-4-combinations", standardCode: "S-CP.B.6", isPrimary: true },
  { lessonSlug: "7-4-combinations", standardCode: "S-CP.A.4", isPrimary: false },
  // 7-5 Compound Probability
  { lessonSlug: "7-5-compound-probability", standardCode: "S-CP.A.2", isPrimary: true },
  { lessonSlug: "7-5-compound-probability", standardCode: "S-CP.A.3", isPrimary: true },
  // 7-6 Fair Decisions and Expected Value
  { lessonSlug: "7-6-fair-decisions-expected-value", standardCode: "S-CP.A.5", isPrimary: true },
  { lessonSlug: "7-6-fair-decisions-expected-value", standardCode: "S-CP.A.2", isPrimary: false },
];

// Unit 8 — Relations and Functions
const unit8LessonStandards: LessonStandardLink[] = [
  // 8-1 Relations vs. Functions
  { lessonSlug: "8-1-relations-vs-functions", standardCode: "HSF-IF.A.1", isPrimary: true },
  // 8-2 Domain and Range
  { lessonSlug: "8-2-domain-and-range", standardCode: "HSF-IF.A.1", isPrimary: true },
  { lessonSlug: "8-2-domain-and-range", standardCode: "HSF-IF.B.5", isPrimary: true },
  // 8-3 Function Notation
  { lessonSlug: "8-3-function-notation", standardCode: "HSF-IF.A.2", isPrimary: true },
  { lessonSlug: "8-3-function-notation", standardCode: "HSF-IF.A.1", isPrimary: false },
  // 8-4 Linear and Nonlinear Functions
  { lessonSlug: "8-4-linear-nonlinear-functions", standardCode: "HSF-IF.B.4", isPrimary: true },
  { lessonSlug: "8-4-linear-nonlinear-functions", standardCode: "HSF-IF.C.7", isPrimary: false },
  // 8-5 Function Transformations
  { lessonSlug: "8-5-function-transformations", standardCode: "HSF-BF.B.3", isPrimary: true },
  { lessonSlug: "8-5-function-transformations", standardCode: "HSF-IF.C.9", isPrimary: false },
  // 8-6 Comparing Functions
  { lessonSlug: "8-6-comparing-functions", standardCode: "HSF-IF.C.9", isPrimary: true },
  { lessonSlug: "8-6-comparing-functions", standardCode: "HSF-IF.B.6", isPrimary: false },
];

// Unit 9 — Linear Equations, Inequalities & Systems
const unit9LessonStandards: LessonStandardLink[] = [
  // 9-1 Solving Linear Equations
  { lessonSlug: "9-1-solving-linear-equations", standardCode: "HSF-IF.A.2", isPrimary: true },
  { lessonSlug: "9-1-solving-linear-equations", standardCode: "HSF-BF.A.1", isPrimary: false },
  // 9-2 Graphing Linear Equations
  { lessonSlug: "9-2-graphing-linear-equations", standardCode: "HSF-IF.C.7", isPrimary: true },
  { lessonSlug: "9-2-graphing-linear-equations", standardCode: "HSF-IF.B.4", isPrimary: false },
  // 9-3 Linear Inequalities
  { lessonSlug: "9-3-linear-inequalities", standardCode: "HSF-IF.C.7", isPrimary: true },
  { lessonSlug: "9-3-linear-inequalities", standardCode: "HSF-IF.B.5", isPrimary: false },
  // 9-4 Systems of Equations (Graphing, Substitution, Elimination)
  { lessonSlug: "9-4-systems-of-equations", standardCode: "G-GPE.B.4", isPrimary: true },
  { lessonSlug: "9-4-systems-of-equations", standardCode: "HSF-IF.B.6", isPrimary: false },
  // 9-5 Systems of Inequalities
  { lessonSlug: "9-5-systems-of-inequalities", standardCode: "HSF-IF.C.7", isPrimary: true },
  { lessonSlug: "9-5-systems-of-inequalities", standardCode: "G-GPE.B.4", isPrimary: false },
];

// Unit 10 — Exponents and Roots
const unit10LessonStandards: LessonStandardLink[] = [
  // 10-1 Laws of Exponents
  { lessonSlug: "10-1-laws-of-exponents", standardCode: "HSF-IF.A.2", isPrimary: true },
  { lessonSlug: "10-1-laws-of-exponents", standardCode: "HSF-BF.A.1", isPrimary: false },
  // 10-2 Negative and Rational Exponents
  { lessonSlug: "10-2-negative-rational-exponents", standardCode: "HSF-IF.A.2", isPrimary: true },
  { lessonSlug: "10-2-negative-rational-exponents", standardCode: "HSF-IF.B.5", isPrimary: false },
  // 10-3 Scientific Notation
  { lessonSlug: "10-3-scientific-notation", standardCode: "HSF-BF.A.1", isPrimary: true },
  // 10-4 Radical Expressions
  { lessonSlug: "10-4-radical-expressions", standardCode: "HSF-IF.C.7", isPrimary: true },
  { lessonSlug: "10-4-radical-expressions", standardCode: "HSF-BF.B.3", isPrimary: false },
  // 10-5 Solving Radical Equations
  { lessonSlug: "10-5-solving-radical-equations", standardCode: "HSF-BF.B.4", isPrimary: true },
  { lessonSlug: "10-5-solving-radical-equations", standardCode: "HSF-IF.A.2", isPrimary: false },
];

// Unit 11 — Polynomials
const unit11LessonStandards: LessonStandardLink[] = [
  // 11-1 Polynomial Vocabulary and Classification
  { lessonSlug: "11-1-polynomial-vocabulary", standardCode: "HSF-IF.A.2", isPrimary: true },
  { lessonSlug: "11-1-polynomial-vocabulary", standardCode: "HSF-IF.B.5", isPrimary: false },
  // 11-2 Adding and Subtracting Polynomials
  { lessonSlug: "11-2-adding-subtracting-polynomials", standardCode: "HSF-IF.A.2", isPrimary: true },
  { lessonSlug: "11-2-adding-subtracting-polynomials", standardCode: "HSF-BF.A.1", isPrimary: false },
  // 11-3 Multiplying Polynomials
  { lessonSlug: "11-3-multiplying-polynomials", standardCode: "HSF-IF.A.2", isPrimary: true },
  { lessonSlug: "11-3-multiplying-polynomials", standardCode: "HSF-BF.A.1", isPrimary: false },
  // 11-4 Special Products
  { lessonSlug: "11-4-special-products", standardCode: "HSF-IF.A.2", isPrimary: true },
  { lessonSlug: "11-4-special-products", standardCode: "HSF-BF.B.3", isPrimary: false },
  // 11-5 Factoring Techniques
  { lessonSlug: "11-5-factoring-techniques", standardCode: "HSF-IF.A.2", isPrimary: true },
  { lessonSlug: "11-5-factoring-techniques", standardCode: "HSF-BF.A.1", isPrimary: false },
  // 11-6 Solving Polynomial Equations
  { lessonSlug: "11-6-solving-polynomial-equations", standardCode: "HSF-IF.A.2", isPrimary: true },
  { lessonSlug: "11-6-solving-polynomial-equations", standardCode: "HSF-IF.B.4", isPrimary: false },
];

// Unit 12 — Quadratic Functions
const unit12LessonStandards: LessonStandardLink[] = [
  // 12-1 Graphing Quadratics (Vertex Form)
  { lessonSlug: "12-1-graphing-quadratics", standardCode: "HSF-IF.C.7", isPrimary: true },
  { lessonSlug: "12-1-graphing-quadratics", standardCode: "HSF-BF.B.3", isPrimary: true },
  { lessonSlug: "12-1-graphing-quadratics", standardCode: "HSF-IF.B.4", isPrimary: false },
  // 12-2 Factoring Quadratics
  { lessonSlug: "12-2-factoring-quadratics", standardCode: "HSF-IF.A.2", isPrimary: true },
  { lessonSlug: "12-2-factoring-quadratics", standardCode: "HSF-IF.B.4", isPrimary: false },
  // 12-3 Completing the Square
  { lessonSlug: "12-3-completing-the-square", standardCode: "HSF-IF.C.7", isPrimary: true },
  { lessonSlug: "12-3-completing-the-square", standardCode: "HSF-BF.B.3", isPrimary: false },
  // 12-4 Quadratic Formula
  { lessonSlug: "12-4-quadratic-formula", standardCode: "HSF-IF.A.2", isPrimary: true },
  { lessonSlug: "12-4-quadratic-formula", standardCode: "HSF-IF.C.7", isPrimary: false },
  // 12-5 Applications of Quadratic Models
  { lessonSlug: "12-5-quadratic-applications", standardCode: "HSF-BF.A.1", isPrimary: true },
  { lessonSlug: "12-5-quadratic-applications", standardCode: "G-MG.A.3", isPrimary: false },
];

// Unit 13 — Trigonometric Identities & Equations
const unit13LessonStandards: LessonStandardLink[] = [
  // 13-1 Fundamental Trig Identities
  { lessonSlug: "13-1-fundamental-trig-identities", standardCode: "G-SRT.C.6", isPrimary: true },
  { lessonSlug: "13-1-fundamental-trig-identities", standardCode: "G-SRT.C.8", isPrimary: false },
  // 13-2 Pythagorean Identities
  { lessonSlug: "13-2-pythagorean-identities", standardCode: "G-SRT.C.6", isPrimary: true },
  { lessonSlug: "13-2-pythagorean-identities", standardCode: "HSF-IF.A.2", isPrimary: false },
  // 13-3 Sum and Difference Identities
  { lessonSlug: "13-3-sum-difference-identities", standardCode: "G-SRT.C.8", isPrimary: true },
  { lessonSlug: "13-3-sum-difference-identities", standardCode: "G-SRT.C.6", isPrimary: false },
  // 13-4 Double-Angle and Half-Angle Identities
  { lessonSlug: "13-4-double-half-angle-identities", standardCode: "G-SRT.C.8", isPrimary: true },
  { lessonSlug: "13-4-double-half-angle-identities", standardCode: "HSF-BF.B.3", isPrimary: false },
  // 13-5 Solving Trigonometric Equations
  { lessonSlug: "13-5-solving-trig-equations", standardCode: "G-SRT.C.8", isPrimary: true },
  { lessonSlug: "13-5-solving-trig-equations", standardCode: "HSF-IF.C.7", isPrimary: false },
];

const allLessonStandards: LessonStandardLink[] = [
  ...unit1LessonStandards,
  ...unit2LessonStandards,
  ...unit3LessonStandards,
  ...unit4LessonStandards,
  ...unit5LessonStandards,
  ...unit6LessonStandards,
  ...unit7LessonStandards,
  ...unit8LessonStandards,
  ...unit9LessonStandards,
  ...unit10LessonStandards,
  ...unit11LessonStandards,
  ...unit12LessonStandards,
  ...unit13LessonStandards,
];

export const seedLessonStandards = internalMutation({
  args: {},
  handler: async (ctx) => {
    const results: {
      lessonSlug: string;
      standardCode: string;
      success: boolean;
      error?: string;
    }[] = [];

    for (const link of allLessonStandards) {
      try {
        const lesson = await ctx.db
          .query("lessons")
          .withIndex("by_slug", (q) => q.eq("slug", link.lessonSlug))
          .unique();

        if (!lesson) {
          results.push({
            lessonSlug: link.lessonSlug,
            standardCode: link.standardCode,
            success: false,
            error: `Lesson not found: ${link.lessonSlug}`,
          });
          continue;
        }

        const lessonVersion = await ctx.db
          .query("lesson_versions")
          .withIndex("by_lesson", (q) => q.eq("lessonId", lesson._id))
          .first();

        if (!lessonVersion) {
          results.push({
            lessonSlug: link.lessonSlug,
            standardCode: link.standardCode,
            success: false,
            error: `Lesson version not found: ${link.lessonSlug}`,
          });
          continue;
        }

        const standard = await ctx.db
          .query("competency_standards")
          .withIndex("by_code", (q) => q.eq("code", link.standardCode))
          .unique();

        if (!standard) {
          results.push({
            lessonSlug: link.lessonSlug,
            standardCode: link.standardCode,
            success: false,
            error: `Standard not found: ${link.standardCode}`,
          });
          continue;
        }

        const existing = await ctx.db
          .query("lesson_standards")
          .withIndex("by_lesson_version_and_standard", (q) =>
            q.eq("lessonVersionId", lessonVersion._id).eq("standardId", standard._id)
          )
          .unique();

        if (!existing) {
          await ctx.db.insert("lesson_standards", {
            lessonVersionId: lessonVersion._id,
            standardId: standard._id,
            isPrimary: link.isPrimary,
            createdAt: Date.now(),
          });
        }

        results.push({
          lessonSlug: link.lessonSlug,
          standardCode: link.standardCode,
          success: true,
        });
      } catch (error) {
        results.push({
          lessonSlug: link.lessonSlug,
          standardCode: link.standardCode,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return results;
  },
});
