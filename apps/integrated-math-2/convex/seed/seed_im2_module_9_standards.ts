import { internalMutation } from "../_generated/server";
import { seedLessonStandards, type LessonStandardLink } from "./lesson_standards";

const module9LessonStandards: LessonStandardLink[] = [
  {
    lessonSlug: "module-9-lesson-1",
    standardCode: "A-REI.A.1",
    isPrimary: true,
  },
  {
    lessonSlug: "module-9-lesson-2",
    standardCode: "A-REI.B.3",
    isPrimary: true,
  },
  {
    lessonSlug: "module-9-lesson-3",
    standardCode: "A-CED.A.2",
    isPrimary: true,
  },
  {
    lessonSlug: "module-9-lesson-4",
    standardCode: "A-REI.D.10",
    isPrimary: true,
  },
  {
    lessonSlug: "module-9-lesson-5",
    standardCode: "A-REI.C.6",
    isPrimary: true,
  },
  {
    lessonSlug: "module-9-lesson-6",
    standardCode: "A-REI.D.12",
    isPrimary: true,
  },
  {
    lessonSlug: "module-9-lesson-7",
    standardCode: "A-CED.A.3",
    isPrimary: true,
  },
  {
    lessonSlug: "module-9-lesson-8",
    standardCode: "A-REI.C.9",
    isPrimary: true,
  },
  {
    lessonSlug: "module-9-lesson-9",
    standardCode: "A-REI.D.11",
    isPrimary: true,
  },
];

export const seedModule9LessonStandards = internalMutation({
  args: {},
  handler: (ctx) => seedLessonStandards(ctx, module9LessonStandards),
});
