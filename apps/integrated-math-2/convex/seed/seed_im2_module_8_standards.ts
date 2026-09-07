import { internalMutation } from "../_generated/server";
import { seedLessonStandards, type LessonStandardLink } from "./lesson_standards";

const module8LessonStandards: LessonStandardLink[] = [
  {
    lessonSlug: "module-8-lesson-1",
    standardCode: "F-IF.A.1",
    isPrimary: true,
  },
  {
    lessonSlug: "module-8-lesson-1",
    standardCode: "F-IF.A.2",
    isPrimary: false,
  },
  {
    lessonSlug: "module-8-lesson-2",
    standardCode: "F-IF.C.9",
    isPrimary: true,
  },
  {
    lessonSlug: "module-8-lesson-2",
    standardCode: "F-IF.B.4",
    isPrimary: false,
  },
  {
    lessonSlug: "module-8-lesson-3",
    standardCode: "F-IF.B.4",
    isPrimary: true,
  },
  {
    lessonSlug: "module-8-lesson-3",
    standardCode: "F-IF.B.5",
    isPrimary: false,
  },
  {
    lessonSlug: "module-8-lesson-4",
    standardCode: "F-IF.C.7",
    isPrimary: true,
  },
  {
    lessonSlug: "module-8-lesson-4",
    standardCode: "F-IF.B.6",
    isPrimary: false,
  },
  {
    lessonSlug: "module-8-lesson-5",
    standardCode: "A-CED.A.2",
    isPrimary: true,
  },
  {
    lessonSlug: "module-8-lesson-5",
    standardCode: "A-CED.A.3",
    isPrimary: false,
  },
  {
    lessonSlug: "module-8-lesson-6",
    standardCode: "F-IF.C.7b",
    isPrimary: true,
  },
  {
    lessonSlug: "module-8-lesson-6",
    standardCode: "F-IF.A.2",
    isPrimary: false,
  },
  {
    lessonSlug: "module-8-lesson-7",
    standardCode: "F-BF.B.3",
    isPrimary: true,
  },
];

export const seedModule8LessonStandards = internalMutation({
  args: {},
  handler: (ctx) => seedLessonStandards(ctx, module8LessonStandards),
});
