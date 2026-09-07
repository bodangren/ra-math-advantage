import { internalMutation } from "../_generated/server";
import { seedLessonStandards, type LessonStandardLink } from "./lesson_standards";

const module1LessonStandards: LessonStandardLink[] = [
  {
    lessonSlug: "module-1-lesson-1",
    standardCode: "G-CO.C.9",
    isPrimary: true,
  },
  {
    lessonSlug: "module-1-lesson-1",
    standardCode: "G-GPE.B.4",
    isPrimary: false,
  },
  {
    lessonSlug: "module-1-lesson-2",
    standardCode: "G-CO.C.9",
    isPrimary: true,
  },
  {
    lessonSlug: "module-1-lesson-2",
    standardCode: "G-GPE.B.4",
    isPrimary: false,
  },
  {
    lessonSlug: "module-1-lesson-3",
    standardCode: "G-CO.C.10",
    isPrimary: true,
  },
  {
    lessonSlug: "module-1-lesson-3",
    standardCode: "G-GPE.B.4",
    isPrimary: false,
  },
  {
    lessonSlug: "module-1-lesson-4",
    standardCode: "G-CO.B.7",
    isPrimary: true,
  },
  {
    lessonSlug: "module-1-lesson-5",
    standardCode: "G-CO.A.3",
    isPrimary: true,
  },
  {
    lessonSlug: "module-1-lesson-6",
    standardCode: "G-CO.B.7",
    isPrimary: true,
  },
  {
    lessonSlug: "module-1-lesson-7",
    standardCode: "G-CO.B.8",
    isPrimary: true,
  },
];

export const seedModule1LessonStandards = internalMutation({
  args: {},
  handler: (ctx) => seedLessonStandards(ctx, module1LessonStandards),
});
