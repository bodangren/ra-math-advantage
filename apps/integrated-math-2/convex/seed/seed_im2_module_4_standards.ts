import { internalMutation } from "../_generated/server";
import { seedLessonStandards, type LessonStandardLink } from "./lesson_standards";

const module4LessonStandards: LessonStandardLink[] = [
  // 4-1 Geometric Mean
  {
    lessonSlug: "module-4-lesson-1",
    standardCode: "G-SRT.B.4",
    isPrimary: true,
  },
  {
    lessonSlug: "module-4-lesson-1",
    standardCode: "G-SRT.B.5",
    isPrimary: false,
  },
  // 4-2 Pythagorean Theorem and Its Converse
  {
    lessonSlug: "module-4-lesson-2",
    standardCode: "8.G.B.6",
    isPrimary: true,
  },
  {
    lessonSlug: "module-4-lesson-2",
    standardCode: "8.G.B.7",
    isPrimary: false,
  },
  // 4-3 Coordinates in Space
  {
    lessonSlug: "module-4-lesson-3",
    standardCode: "G-GPE.B.4",
    isPrimary: true,
  },
  {
    lessonSlug: "module-4-lesson-3",
    standardCode: "G-GPE.B.5",
    isPrimary: false,
  },
  // 4-4 Special Right Triangles
  {
    lessonSlug: "module-4-lesson-4",
    standardCode: "G-SRT.C.6",
    isPrimary: true,
  },
  {
    lessonSlug: "module-4-lesson-4",
    standardCode: "G-SRT.C.8",
    isPrimary: false,
  },
  // 4-5 Trigonometry
  {
    lessonSlug: "module-4-lesson-5",
    standardCode: "G-SRT.C.6",
    isPrimary: true,
  },
  {
    lessonSlug: "module-4-lesson-5",
    standardCode: "G-SRT.C.7",
    isPrimary: true,
  },
  // 4-6 Applying Trigonometry
  {
    lessonSlug: "module-4-lesson-6",
    standardCode: "G-SRT.C.8",
    isPrimary: true,
  },
  {
    lessonSlug: "module-4-lesson-6",
    standardCode: "G-MG.A.1",
    isPrimary: false,
  },
  // 4-7 The Law of Sines
  {
    lessonSlug: "module-4-lesson-7",
    standardCode: "G-SRT.D.11",
    isPrimary: true,
  },
  // 4-8 The Law of Cosines
  {
    lessonSlug: "module-4-lesson-8",
    standardCode: "G-SRT.D.11",
    isPrimary: true,
  },
];

export const seedModule4LessonStandards = internalMutation({
  args: {},
  handler: (ctx) => seedLessonStandards(ctx, module4LessonStandards),
});
