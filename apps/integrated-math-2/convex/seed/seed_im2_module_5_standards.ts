import { internalMutation } from "../_generated/server";
import { seedLessonStandards, type LessonStandardLink } from "./lesson_standards";

const module5LessonStandards: LessonStandardLink[] = [
  {
    lessonSlug: "module-5-lesson-1",
    standardCode: "G-C.A.1",
    isPrimary: true,
  },
  {
    lessonSlug: "module-5-lesson-2",
    standardCode: "G-C.A.2",
    isPrimary: true,
  },
  {
    lessonSlug: "module-5-lesson-2",
    standardCode: "G-C.B.5",
    isPrimary: false,
  },
  {
    lessonSlug: "module-5-lesson-3",
    standardCode: "G-C.A.2",
    isPrimary: true,
  },
  {
    lessonSlug: "module-5-lesson-3",
    standardCode: "G-C.B.5",
    isPrimary: false,
  },
  {
    lessonSlug: "module-5-lesson-4",
    standardCode: "G-C.A.2",
    isPrimary: true,
  },
  {
    lessonSlug: "module-5-lesson-4",
    standardCode: "G-C.A.3",
    isPrimary: false,
  },
  {
    lessonSlug: "module-5-lesson-5",
    standardCode: "G-C.A.3",
    isPrimary: true,
  },
  {
    lessonSlug: "module-5-lesson-5",
    standardCode: "G-C.A.4",
    isPrimary: false,
  },
  {
    lessonSlug: "module-5-lesson-6",
    standardCode: "G-C.A.3",
    isPrimary: true,
  },
  {
    lessonSlug: "module-5-lesson-6",
    standardCode: "G-C.A.4",
    isPrimary: false,
  },
  {
    lessonSlug: "module-5-lesson-7",
    standardCode: "G-GPE.A.1",
    isPrimary: true,
  },
  {
    lessonSlug: "module-5-lesson-7",
    standardCode: "G-GPE.B.4",
    isPrimary: false,
  },
  {
    lessonSlug: "module-5-lesson-8",
    standardCode: "G-GPE.A.2",
    isPrimary: true,
  },
  {
    lessonSlug: "module-5-lesson-8",
    standardCode: "A-REI.C.7",
    isPrimary: false,
  },
];

export const seedModule5LessonStandards = internalMutation({
  args: {},
  handler: (ctx) => seedLessonStandards(ctx, module5LessonStandards),
});
