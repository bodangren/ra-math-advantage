import { internalMutation } from "../_generated/server";
import { seedLessonStandards, type LessonStandardLink } from "./lesson_standards";

const module10LessonStandards: LessonStandardLink[] = [
  {
    lessonSlug: "module-10-lesson-1",
    standardCode: "8.EE.A.1",
    isPrimary: true,
  },
  {
    lessonSlug: "module-10-lesson-1",
    standardCode: "N-RN.A.2",
    isPrimary: false,
  },
  {
    lessonSlug: "module-10-lesson-2",
    standardCode: "8.EE.A.1",
    isPrimary: true,
  },
  {
    lessonSlug: "module-10-lesson-2",
    standardCode: "N-RN.A.2",
    isPrimary: false,
  },
  {
    lessonSlug: "module-10-lesson-3",
    standardCode: "8.EE.A.1",
    isPrimary: true,
  },
  {
    lessonSlug: "module-10-lesson-3",
    standardCode: "8.EE.A.2",
    isPrimary: false,
  },
  {
    lessonSlug: "module-10-lesson-4",
    standardCode: "N-RN.A.1",
    isPrimary: true,
  },
  {
    lessonSlug: "module-10-lesson-4",
    standardCode: "N-RN.A.2",
    isPrimary: false,
  },
  {
    lessonSlug: "module-10-lesson-5",
    standardCode: "N-RN.A.2",
    isPrimary: true,
  },
  {
    lessonSlug: "module-10-lesson-5",
    standardCode: "8.EE.A.2",
    isPrimary: false,
  },
  {
    lessonSlug: "module-10-lesson-6",
    standardCode: "N-RN.A.2",
    isPrimary: true,
  },
  {
    lessonSlug: "module-10-lesson-7",
    standardCode: "F-LE.A.2",
    isPrimary: true,
  },
  {
    lessonSlug: "module-10-lesson-7",
    standardCode: "F-LE.B.5",
    isPrimary: false,
  },
];

export const seedModule10LessonStandards = internalMutation({
  args: {},
  handler: (ctx) => seedLessonStandards(ctx, module10LessonStandards),
});
