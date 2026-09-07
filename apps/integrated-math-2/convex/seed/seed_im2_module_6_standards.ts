import { internalMutation } from "../_generated/server";
import { seedLessonStandards, type LessonStandardLink } from "./lesson_standards";

const module6LessonStandards: LessonStandardLink[] = [
  {
    lessonSlug: "module-6-lesson-1",
    standardCode: "G-GPE.B.4",
    isPrimary: true,
  },
  {
    lessonSlug: "module-6-lesson-1",
    standardCode: "G-MG.A.1",
    isPrimary: false,
  },
  {
    lessonSlug: "module-6-lesson-2",
    standardCode: "G-SRT.C.6",
    isPrimary: true,
  },
  {
    lessonSlug: "module-6-lesson-2",
    standardCode: "G-GMD.A.1",
    isPrimary: false,
  },
  {
    lessonSlug: "module-6-lesson-3",
    standardCode: "G-C.B.5",
    isPrimary: true,
  },
  {
    lessonSlug: "module-6-lesson-3",
    standardCode: "G-GMD.A.1",
    isPrimary: false,
  },
  {
    lessonSlug: "module-6-lesson-4",
    standardCode: "G-GMD.A.3",
    isPrimary: true,
  },
  {
    lessonSlug: "module-6-lesson-4",
    standardCode: "G-GMD.A.1",
    isPrimary: false,
  },
  {
    lessonSlug: "module-6-lesson-5",
    standardCode: "G-GMD.B.4",
    isPrimary: true,
  },
  {
    lessonSlug: "module-6-lesson-6",
    standardCode: "G-GMD.A.1",
    isPrimary: true,
  },
  {
    lessonSlug: "module-6-lesson-7",
    standardCode: "G-GMD.A.2",
    isPrimary: true,
  },
  {
    lessonSlug: "module-6-lesson-8",
    standardCode: "G-MG.A.1",
    isPrimary: true,
  },
  {
    lessonSlug: "module-6-lesson-8",
    standardCode: "G-MG.A.3",
    isPrimary: false,
  },
  {
    lessonSlug: "module-6-lesson-9",
    standardCode: "G-MG.A.2",
    isPrimary: true,
  },
];

export const seedModule6LessonStandards = internalMutation({
  args: {},
  handler: (ctx) => seedLessonStandards(ctx, module6LessonStandards),
});
