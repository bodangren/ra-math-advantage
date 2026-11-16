import { internalMutation } from "../_generated/server";
import { seedLessonStandards, type LessonStandardLink } from "./lesson_standards";

const module13LessonStandards: LessonStandardLink[] = [
  {
    lessonSlug: "module-13-lesson-1",
    standardCode: "F-TF.C.8",
    isPrimary: true,
  },
  {
    lessonSlug: "module-13-lesson-2",
    standardCode: "F-TF.C.8",
    isPrimary: true,
  },
  {
    lessonSlug: "module-13-lesson-2",
    standardCode: "A-SSE.A.2",
    isPrimary: false,
  },
  {
    lessonSlug: "module-13-lesson-3",
    standardCode: "F-TF.C.9",
    isPrimary: true,
  },
  {
    lessonSlug: "module-13-lesson-4",
    standardCode: "F-TF.C.9",
    isPrimary: true,
  },
  {
    lessonSlug: "module-13-lesson-5",
    standardCode: "F-TF.B.7",
    isPrimary: true,
  },
  {
    lessonSlug: "module-13-lesson-5",
    standardCode: "F-TF.C.8",
    isPrimary: false,
  },
];

export const seedModule13LessonStandards = internalMutation({
  args: {},
  handler: (ctx) => seedLessonStandards(ctx, module13LessonStandards),
});
