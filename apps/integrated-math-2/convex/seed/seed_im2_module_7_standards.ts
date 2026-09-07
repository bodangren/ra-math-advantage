import { internalMutation } from "../_generated/server";
import { seedLessonStandards, type LessonStandardLink } from "./lesson_standards";

const module7LessonStandards: LessonStandardLink[] = [
  {
    lessonSlug: "module-7-lesson-1",
    standardCode: "S-CP.A.1",
    isPrimary: true,
  },
  {
    lessonSlug: "module-7-lesson-2",
    standardCode: "S-CP.A.1",
    isPrimary: true,
  },
  {
    lessonSlug: "module-7-lesson-2",
    standardCode: "S-CP.B.7",
    isPrimary: false,
  },
  {
    lessonSlug: "module-7-lesson-3",
    standardCode: "7.SP.C.5",
    isPrimary: true,
  },
  {
    lessonSlug: "module-7-lesson-4",
    standardCode: "S-CP.B.9",
    isPrimary: true,
  },
  {
    lessonSlug: "module-7-lesson-5",
    standardCode: "S-CP.B.8",
    isPrimary: true,
  },
  {
    lessonSlug: "module-7-lesson-6",
    standardCode: "S-CP.B.7",
    isPrimary: true,
  },
  {
    lessonSlug: "module-7-lesson-7",
    standardCode: "S-CP.B.6",
    isPrimary: true,
  },
  {
    lessonSlug: "module-7-lesson-8",
    standardCode: "S-CP.A.4",
    isPrimary: true,
  },
];

export const seedModule7LessonStandards = internalMutation({
  args: {},
  handler: (ctx) => seedLessonStandards(ctx, module7LessonStandards),
});
