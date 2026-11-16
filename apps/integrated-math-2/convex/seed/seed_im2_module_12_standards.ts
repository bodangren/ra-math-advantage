import { internalMutation } from "../_generated/server";
import { seedLessonStandards, type LessonStandardLink } from "./lesson_standards";

const module12LessonStandards: LessonStandardLink[] = [
  {
    lessonSlug: "module-12-lesson-1",
    standardCode: "F-IF.C.7",
    isPrimary: true,
  },
  {
    lessonSlug: "module-12-lesson-1",
    standardCode: "F-IF.B.4",
    isPrimary: false,
  },
  {
    lessonSlug: "module-12-lesson-2",
    standardCode: "F-BF.B.3",
    isPrimary: true,
  },
  {
    lessonSlug: "module-12-lesson-2",
    standardCode: "F-IF.C.7",
    isPrimary: false,
  },
  {
    lessonSlug: "module-12-lesson-3",
    standardCode: "A-REI.D.11",
    isPrimary: true,
  },
  {
    lessonSlug: "module-12-lesson-3",
    standardCode: "F-IF.C.7",
    isPrimary: false,
  },
  {
    lessonSlug: "module-12-lesson-4",
    standardCode: "A-APR.B.3",
    isPrimary: true,
  },
  {
    lessonSlug: "module-12-lesson-4",
    standardCode: "A-REI.B.4",
    isPrimary: false,
  },
  {
    lessonSlug: "module-12-lesson-5",
    standardCode: "A-REI.B.4",
    isPrimary: true,
  },
  {
    lessonSlug: "module-12-lesson-5",
    standardCode: "A-SSE.B.3",
    isPrimary: false,
  },
  {
    lessonSlug: "module-12-lesson-6",
    standardCode: "A-REI.B.4",
    isPrimary: true,
  },
  {
    lessonSlug: "module-12-lesson-6",
    standardCode: "A-CED.A.1",
    isPrimary: false,
  },
  {
    lessonSlug: "module-12-lesson-7",
    standardCode: "A-REI.C.7",
    isPrimary: true,
  },
  {
    lessonSlug: "module-12-lesson-7",
    standardCode: "A-REI.D.10",
    isPrimary: false,
  },
  {
    lessonSlug: "module-12-lesson-8",
    standardCode: "F-IF.C.9",
    isPrimary: true,
  },
  {
    lessonSlug: "module-12-lesson-8",
    standardCode: "F-BF.A.1",
    isPrimary: false,
  },
  {
    lessonSlug: "module-12-lesson-9",
    standardCode: "F-BF.A.1",
    isPrimary: true,
  },
];

export const seedModule12LessonStandards = internalMutation({
  args: {},
  handler: (ctx) => seedLessonStandards(ctx, module12LessonStandards),
});
