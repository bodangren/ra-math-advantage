import { internalMutation } from "../_generated/server";

interface LessonStandardLink {
  lessonSlug: string;
  standardCode: string;
  isPrimary: boolean;
}

const unit1LessonStandards: LessonStandardLink[] = [
  // 1-1 Change in Tandem
  { lessonSlug: "1-1-change-in-tandem", standardCode: "HSF-IF.B.4", isPrimary: true },
  { lessonSlug: "1-1-change-in-tandem", standardCode: "HSF-BF.A.1", isPrimary: false },
  // 1-2 Rates of Change
  { lessonSlug: "1-2-rates-of-change", standardCode: "HSF-IF.B.4", isPrimary: true },
  // 1-3 Rates of Change: Linear & Quadratic
  { lessonSlug: "1-3-rates-of-change-linear-quadratic", standardCode: "HSF-IF.B.4", isPrimary: true },
  { lessonSlug: "1-3-rates-of-change-linear-quadratic", standardCode: "HSA-APR.A.1", isPrimary: false },
  // 1-4 Polynomial Functions and Rates of Change
  { lessonSlug: "1-4-polynomial-functions-rates", standardCode: "HSA-APR.A.1", isPrimary: true },
  { lessonSlug: "1-4-polynomial-functions-rates", standardCode: "HSF-IF.C.7c", isPrimary: true },
  // 1-5 Polynomial Functions: Complex Zeros
  { lessonSlug: "1-5-polynomial-functions-complex-zeros", standardCode: "HSA-APR.B.2", isPrimary: true },
  { lessonSlug: "1-5-polynomial-functions-complex-zeros", standardCode: "HSA-APR.B.3", isPrimary: true },
  // 1-6 Polynomial Functions: End Behavior
  { lessonSlug: "1-6-polynomial-functions-end-behavior", standardCode: "HSF-IF.C.7c", isPrimary: true },
  { lessonSlug: "1-6-polynomial-functions-end-behavior", standardCode: "HSF-IF.B.4", isPrimary: false },
  // 1-7 Rational Functions: End Behavior
  { lessonSlug: "1-7-rational-functions-end-behavior", standardCode: "HSF-IF.C.7d", isPrimary: true },
  { lessonSlug: "1-7-rational-functions-end-behavior", standardCode: "HSA-APR.D.6", isPrimary: true },
  // 1-8 Rational Functions: Zeros
  { lessonSlug: "1-8-rational-functions-zeros", standardCode: "HSF-IF.C.7d", isPrimary: true },
  { lessonSlug: "1-8-rational-functions-zeros", standardCode: "HSA-APR.D.6", isPrimary: false },
  // 1-9 Rational Functions: Vertical Asymptotes
  { lessonSlug: "1-9-rational-functions-vertical-asymptotes", standardCode: "HSF-IF.C.7d", isPrimary: true },
  { lessonSlug: "1-9-rational-functions-vertical-asymptotes", standardCode: "HSA-REI.A.2", isPrimary: false },
  // 1-10 Rational Functions: Holes
  { lessonSlug: "1-10-rational-functions-holes", standardCode: "HSF-IF.C.7d", isPrimary: true },
  // 1-11 Equivalent Representations
  { lessonSlug: "1-11-equivalent-representations", standardCode: "HSA-APR.A.1", isPrimary: true },
  { lessonSlug: "1-11-equivalent-representations", standardCode: "HSA-APR.D.6", isPrimary: false },
  // 1-12 Transformations of Functions
  { lessonSlug: "1-12-transformations-of-functions", standardCode: "HSF-BF.B.3", isPrimary: true },
  // 1-13 Function Model Selection
  { lessonSlug: "1-13-function-model-selection", standardCode: "HSF-BF.A.1", isPrimary: true },
  { lessonSlug: "1-13-function-model-selection", standardCode: "HSF-IF.B.4", isPrimary: false },
  // 1-14 Function Model Construction
  { lessonSlug: "1-14-function-model-construction", standardCode: "HSF-BF.A.1", isPrimary: true },
  { lessonSlug: "1-14-function-model-construction", standardCode: "HSF-BF.B.3", isPrimary: false },
];

const unit2LessonStandards: LessonStandardLink[] = [
  // 2-1 Arithmetic & Geometric Sequences
  { lessonSlug: "2-1-arithmetic-geometric-sequences", standardCode: "HSF-LE.A.2", isPrimary: true },
  { lessonSlug: "2-1-arithmetic-geometric-sequences", standardCode: "HSF-LE.A.1", isPrimary: false },
  // 2-2 Linear & Exponential Change
  { lessonSlug: "2-2-linear-exponential-change", standardCode: "HSF-LE.A.1", isPrimary: true },
  { lessonSlug: "2-2-linear-exponential-change", standardCode: "HSF-LE.B.5", isPrimary: false },
  // 2-3 Exponential Functions
  { lessonSlug: "2-3-exponential-functions", standardCode: "HSF-LE.A.1", isPrimary: true },
  { lessonSlug: "2-3-exponential-functions", standardCode: "HSF-IF.C.7e", isPrimary: true },
  // 2-4 Exponential Manipulation
  { lessonSlug: "2-4-exponential-manipulation", standardCode: "HSF-LE.A.2", isPrimary: true },
  { lessonSlug: "2-4-exponential-manipulation", standardCode: "HSF-BF.A.1a", isPrimary: false },
  // 2-5 Exponential Modeling
  { lessonSlug: "2-5-exponential-modeling", standardCode: "HSF-LE.B.5", isPrimary: true },
  { lessonSlug: "2-5-exponential-modeling", standardCode: "HSF-BF.A.1", isPrimary: false },
  // 2-6 Model Validation
  { lessonSlug: "2-6-model-validation", standardCode: "HSF-IF.A.2", isPrimary: true },
  { lessonSlug: "2-6-model-validation", standardCode: "HSF-BF.A.1", isPrimary: false },
  // 2-7 Composition of Functions
  { lessonSlug: "2-7-composition-of-functions", standardCode: "HSF-BF.A.1", isPrimary: true },
  { lessonSlug: "2-7-composition-of-functions", standardCode: "HSF-IF.A.2", isPrimary: false },
  // 2-8 Inverse Functions
  { lessonSlug: "2-8-inverse-functions", standardCode: "HSF-BF.B.4", isPrimary: true },
  { lessonSlug: "2-8-inverse-functions", standardCode: "HSF-BF.B.5", isPrimary: false },
  // 2-9 Logarithmic Expressions
  { lessonSlug: "2-9-logarithmic-expressions", standardCode: "HSF-BF.B.5", isPrimary: true },
  { lessonSlug: "2-9-logarithmic-expressions", standardCode: "HSF-LE.A.4", isPrimary: false },
  // 2-10 Logarithmic Functions
  { lessonSlug: "2-10-logarithmic-functions", standardCode: "HSF-IF.C.7e", isPrimary: true },
  { lessonSlug: "2-10-logarithmic-functions", standardCode: "HSF-BF.B.4", isPrimary: false },
  // 2-11 Logarithmic Properties
  { lessonSlug: "2-11-logarithmic-properties", standardCode: "HSF-BF.B.5", isPrimary: true },
  // 2-12 Logarithmic Equations
  { lessonSlug: "2-12-logarithmic-equations", standardCode: "HSF-LE.A.4", isPrimary: true },
  { lessonSlug: "2-12-logarithmic-equations", standardCode: "HSF-BF.B.5", isPrimary: false },
  // 2-13 Exp/Log Equations & Inequalities
  { lessonSlug: "2-13-exp-log-equations-inequalities", standardCode: "HSF-LE.A.4", isPrimary: true },
  { lessonSlug: "2-13-exp-log-equations-inequalities", standardCode: "HSA-REI.A.2", isPrimary: false },
  // 2-14 Logarithmic Modeling
  { lessonSlug: "2-14-logarithmic-modeling", standardCode: "HSF-BF.A.1", isPrimary: true },
  { lessonSlug: "2-14-logarithmic-modeling", standardCode: "HSF-LE.B.5", isPrimary: false },
  // 2-15 Semi-Log Plots
  { lessonSlug: "2-15-semi-log-plots", standardCode: "HSF-IF.C.7e", isPrimary: true },
  { lessonSlug: "2-15-semi-log-plots", standardCode: "HSF-LE.A.1", isPrimary: false },
];

const unit3LessonStandards: LessonStandardLink[] = [
  // 3-1 Periodic Phenomena
  { lessonSlug: "3-1-periodic-phenomena", standardCode: "HSF-TF.B.5", isPrimary: true },
  { lessonSlug: "3-1-periodic-phenomena", standardCode: "HSF-TF.A.4", isPrimary: false },
  // 3-2 Basic Trig Functions
  { lessonSlug: "3-2-basic-trig-functions", standardCode: "HSF-TF.A.1", isPrimary: true },
  { lessonSlug: "3-2-basic-trig-functions", standardCode: "HSF-TF.A.2", isPrimary: false },
  // 3-3 Trig Functions & the Unit Circle
  { lessonSlug: "3-3-trig-functions-unit-circle", standardCode: "HSF-TF.A.2", isPrimary: true },
  { lessonSlug: "3-3-trig-functions-unit-circle", standardCode: "HSF-TF.A.1", isPrimary: false },
  // 3-4 Graphs & Transformations
  { lessonSlug: "3-4-graphs-transformations", standardCode: "HSF-IF.C.7e", isPrimary: true },
  { lessonSlug: "3-4-graphs-transformations", standardCode: "HSF-BF.B.3", isPrimary: false },
  // 3-5 Sinusoidal Transformations
  { lessonSlug: "3-5-sinusoidal-transformations", standardCode: "HSF-TF.B.5", isPrimary: true },
  { lessonSlug: "3-5-sinusoidal-transformations", standardCode: "HSF-BF.B.3", isPrimary: false },
  // 3-6 Sinusoidal Applications
  { lessonSlug: "3-6-sinusoidal-applications", standardCode: "HSF-TF.B.5", isPrimary: true },
  { lessonSlug: "3-6-sinusoidal-applications", standardCode: "HSF-IF.B.4", isPrimary: false },
  // 3-7 Sinusoidal Modeling
  { lessonSlug: "3-7-sinusoidal-modeling", standardCode: "HSF-TF.B.5", isPrimary: true },
  { lessonSlug: "3-7-sinusoidal-modeling", standardCode: "HSF-BF.A.1", isPrimary: false },
  // 3-8 Tangent Function
  { lessonSlug: "3-8-tangent-function", standardCode: "HSF-TF.A.2", isPrimary: true },
  { lessonSlug: "3-8-tangent-function", standardCode: "HSF-IF.C.7e", isPrimary: false },
  // 3-9 Inverse Trig Functions
  { lessonSlug: "3-9-inverse-trig-functions", standardCode: "HSF-TF.A.2", isPrimary: true },
  { lessonSlug: "3-9-inverse-trig-functions", standardCode: "HSF-BF.B.4", isPrimary: false },
  // 3-10 Trig Equations & Inequalities
  { lessonSlug: "3-10-trig-equations-inequalities", standardCode: "HSF-TF.A.4", isPrimary: true },
  { lessonSlug: "3-10-trig-equations-inequalities", standardCode: "HSA-REI.A.2", isPrimary: false },
  // 3-11 Other Trig Functions
  { lessonSlug: "3-11-other-trig-functions", standardCode: "HSF-TF.A.1", isPrimary: true },
  { lessonSlug: "3-11-other-trig-functions", standardCode: "HSF-TF.A.2", isPrimary: false },
  // 3-12 Equivalent Trig Representations
  { lessonSlug: "3-12-equivalent-trig-representations", standardCode: "HSF-TF.A.4", isPrimary: true },
  { lessonSlug: "3-12-equivalent-trig-representations", standardCode: "HSF-TF.A.2", isPrimary: false },
  // 3-13 Polar Coordinates
  { lessonSlug: "3-13-polar-coordinates", standardCode: "HSF-TF.A.1", isPrimary: true },
  // 3-14 Polar Functions
  { lessonSlug: "3-14-polar-functions", standardCode: "HSF-TF.B.5", isPrimary: true },
  { lessonSlug: "3-14-polar-functions", standardCode: "HSF-IF.C.7e", isPrimary: false },
  // 3-15 Polar Representations
  { lessonSlug: "3-15-polar-representations", standardCode: "HSF-TF.A.1", isPrimary: false },
  { lessonSlug: "3-15-polar-representations", standardCode: "HSF-BF.B.3", isPrimary: true },
];

const unit4LessonStandards: LessonStandardLink[] = [
  // 4-1 Parametric Functions
  { lessonSlug: "4-1-parametric-functions", standardCode: "HSF-BF.A.1", isPrimary: true },
  // 4-2 Parametric Motion Modeling
  { lessonSlug: "4-2-parametric-motion-modeling", standardCode: "HSF-BF.A.1a", isPrimary: true },
  // 4-3 Rates of Change in Parametric
  { lessonSlug: "4-3-rates-of-change-parametric", standardCode: "HSF-IF.B.4", isPrimary: true },
  // 4-4 Parametric Circles & Lines
  { lessonSlug: "4-4-parametric-circles-lines", standardCode: "HSF-BF.A.1", isPrimary: true },
  // 4-5 Implicit Functions
  { lessonSlug: "4-5-implicit-functions", standardCode: "HSF-BF.B.3", isPrimary: true },
  // 4-6 Conic Sections
  { lessonSlug: "4-6-conic-sections", standardCode: "HSF-IF.C.7d", isPrimary: false },
  { lessonSlug: "4-6-conic-sections", standardCode: "HSF-BF.A.1", isPrimary: true },
  // 4-7 Parametrization
  { lessonSlug: "4-7-parametrization", standardCode: "HSF-BF.A.1a", isPrimary: true },
  // 4-8 Vectors
  { lessonSlug: "4-8-vectors", standardCode: "HSN-VM.A.1", isPrimary: true },
  { lessonSlug: "4-8-vectors", standardCode: "HSN-VM.A.2", isPrimary: true },
  { lessonSlug: "4-8-vectors", standardCode: "HSN-VM.B.4", isPrimary: false },
  // 4-9 Vector-Valued Functions
  { lessonSlug: "4-9-vector-valued-functions", standardCode: "HSN-VM.A.3", isPrimary: true },
  { lessonSlug: "4-9-vector-valued-functions", standardCode: "HSN-VM.B.5", isPrimary: false },
  // 4-10 Matrix Operations
  { lessonSlug: "4-10-matrix-operations", standardCode: "HSN-VM.C.6", isPrimary: true },
  { lessonSlug: "4-10-matrix-operations", standardCode: "HSN-VM.C.7", isPrimary: true },
  { lessonSlug: "4-10-matrix-operations", standardCode: "HSN-VM.C.8", isPrimary: true },
  // 4-11 Matrix Transformations
  { lessonSlug: "4-11-matrix-transformations", standardCode: "HSN-VM.C.11", isPrimary: true },
  { lessonSlug: "4-11-matrix-transformations", standardCode: "HSN-VM.C.9", isPrimary: false },
  // 4-12 Matrix Systems
  { lessonSlug: "4-12-matrix-systems", standardCode: "HSA-REI.C.8", isPrimary: true },
  { lessonSlug: "4-12-matrix-systems", standardCode: "HSN-VM.C.10", isPrimary: false },
  // 4-13 Matrix Applications
  { lessonSlug: "4-13-matrix-applications", standardCode: "HSA-REI.C.9", isPrimary: true },
  { lessonSlug: "4-13-matrix-applications", standardCode: "HSN-VM.C.6", isPrimary: false },
  // 4-14 Matrix Inverses
  { lessonSlug: "4-14-matrix-inverses", standardCode: "HSA-REI.C.9", isPrimary: true },
  { lessonSlug: "4-14-matrix-inverses", standardCode: "HSN-VM.C.10", isPrimary: true },
];

export const seedLessonStandards = internalMutation({
  args: {},
  handler: async (ctx) => {
    const allLinks = [
      ...unit1LessonStandards,
      ...unit2LessonStandards,
      ...unit3LessonStandards,
      ...unit4LessonStandards,
    ];

    const results: {
      lessonSlug: string;
      standardCode: string;
      success: boolean;
      error?: string;
    }[] = [];

    for (const link of allLinks) {
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
