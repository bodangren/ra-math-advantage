import { internalMutation } from "../_generated/server";
import { seedLessonStandards, type LessonStandardLink } from "./lesson_standards";

const module3LessonStandards: LessonStandardLink[] = [
  {
    lessonSlug: "module-3-lesson-1",
    standardCode: "G-SRT.A.1",
    isPrimary: true,
  },
  {
    lessonSlug: "module-3-lesson-1",
    standardCode: "G-CO.A.2",
    isPrimary: false,
  },
  {
    lessonSlug: "module-3-lesson-2",
    standardCode: "G-SRT.A.2",
    isPrimary: true,
  },
  {
    lessonSlug: "module-3-lesson-2",
    standardCode: "G-SRT.B.5",
    isPrimary: false,
  },
  {
    lessonSlug: "module-3-lesson-3",
    standardCode: "G-SRT.A.3",
    isPrimary: true,
  },
  {
    lessonSlug: "module-3-lesson-3",
    standardCode: "G-SRT.B.5",
    isPrimary: false,
  },
  {
    lessonSlug: "module-3-lesson-4",
    standardCode: "G-SRT.A.3",
    isPrimary: true,
  },
  {
    lessonSlug: "module-3-lesson-4",
    standardCode: "G-SRT.B.4",
    isPrimary: false,
  },
  {
    lessonSlug: "module-3-lesson-5",
    standardCode: "G-SRT.B.4",
    isPrimary: true,
  },
  {
    lessonSlug: "module-3-lesson-5",
    standardCode: "G-SRT.B.5",
    isPrimary: false,
  },
  {
    lessonSlug: "module-3-lesson-6",
    standardCode: "G-SRT.B.5",
    isPrimary: true,
  },
  {
    lessonSlug: "module-3-lesson-6",
    standardCode: "G-SRT.A.2",
    isPrimary: false,
  },
];

export const seedModule3LessonStandards = internalMutation({
  args: {},
  handler: (ctx) => seedLessonStandards(ctx, module3LessonStandards),
});
