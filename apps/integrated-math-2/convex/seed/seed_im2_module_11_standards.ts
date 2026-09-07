import { internalMutation } from "../_generated/server";
import { seedLessonStandards, type LessonStandardLink } from "./lesson_standards";

const module11LessonStandards: LessonStandardLink[] = [
  {
    lessonSlug: "module-11-lesson-1",
    standardCode: "A-APR.A.1",
    isPrimary: true,
  },
  {
    lessonSlug: "module-11-lesson-1",
    standardCode: "A-SSE.A.2",
    isPrimary: false,
  },
  {
    lessonSlug: "module-11-lesson-2",
    standardCode: "A-APR.A.1",
    isPrimary: true,
  },
  {
    lessonSlug: "module-11-lesson-3",
    standardCode: "A-APR.A.1",
    isPrimary: true,
  },
  {
    lessonSlug: "module-11-lesson-3",
    standardCode: "A-APR.C.4",
    isPrimary: false,
  },
  {
    lessonSlug: "module-11-lesson-4",
    standardCode: "A-APR.C.4",
    isPrimary: true,
  },
  {
    lessonSlug: "module-11-lesson-4",
    standardCode: "A-APR.B.3",
    isPrimary: false,
  },
  {
    lessonSlug: "module-11-lesson-5",
    standardCode: "A-APR.A.1",
    isPrimary: true,
  },
  {
    lessonSlug: "module-11-lesson-5",
    standardCode: "A-SSE.A.2",
    isPrimary: false,
  },
  {
    lessonSlug: "module-11-lesson-6",
    standardCode: "A-SSE.A.2",
    isPrimary: true,
  },
  {
    lessonSlug: "module-11-lesson-6",
    standardCode: "A-SSE.B.3",
    isPrimary: false,
  },
  {
    lessonSlug: "module-11-lesson-7",
    standardCode: "A-SSE.A.2",
    isPrimary: true,
  },
  {
    lessonSlug: "module-11-lesson-7",
    standardCode: "A-APR.C.4",
    isPrimary: false,
  },
];

export const seedModule11LessonStandards = internalMutation({
  args: {},
  handler: (ctx) => seedLessonStandards(ctx, module11LessonStandards),
});
