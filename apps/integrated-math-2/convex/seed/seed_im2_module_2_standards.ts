import { internalMutation } from "../_generated/server";
import { seedLessonStandards, type LessonStandardLink } from "./lesson_standards";

const module2LessonStandards: LessonStandardLink[] = [
  {
    lessonSlug: "module-2-lesson-1",
    standardCode: "G-CO.C.10",
    isPrimary: true,
  },
  {
    lessonSlug: "module-2-lesson-2",
    standardCode: "G-CO.C.11",
    isPrimary: true,
  },
  {
    lessonSlug: "module-2-lesson-2",
    standardCode: "G-CO.A.1",
    isPrimary: false,
  },
  {
    lessonSlug: "module-2-lesson-3",
    standardCode: "G-GPE.B.4",
    isPrimary: true,
  },
  {
    lessonSlug: "module-2-lesson-3",
    standardCode: "G-CO.C.11",
    isPrimary: false,
  },
  {
    lessonSlug: "module-2-lesson-4",
    standardCode: "G-CO.C.11",
    isPrimary: true,
  },
  {
    lessonSlug: "module-2-lesson-5",
    standardCode: "G-CO.C.11",
    isPrimary: true,
  },
  {
    lessonSlug: "module-2-lesson-6",
    standardCode: "G-CO.C.9",
    isPrimary: true,
  },
];

export const seedModule2LessonStandards = internalMutation({
  args: {},
  handler: (ctx) => seedLessonStandards(ctx, module2LessonStandards),
});
