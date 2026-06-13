/**
 * Deterministic 1,020-student school seed generator for load/scale testing.
 *
 * Pure function — no Convex, no network, no Date. The output is
 * JSON-serializable and idempotent given the same RNG seed.
 *
 * 1,020 students distributed across SCALE_CLASSES_PER_SCHOOL (34) classes,
 * each a full SCALE_STUDENT_COUNT_CLASS (30) section. Each student belongs
 * to exactly one class (single-enrollment invariant).
 */

import {
  SCALE_CARDS_PER_STUDENT,
  SCALE_CLASSES_PER_SCHOOL,
  SCALE_REVIEWS_PER_CARD,
  SCALE_STUDENT_COUNT_CLASS,
  SCALE_SUBMISSIONS_PER_STUDENT,
  SCALE_TEACHERS_PER_SCHOOL,
} from '@/lib/scale/constants';

export const SCALE_RNG_SEED = 'load-2026' as const;

export interface SchoolSeedInput {
  organizationSlug: string;
  rngSeed?: string;
}

export interface SchoolSeedResult {
  organization: { slug: string };
  teachers: Array<{ id: string; username: string }>;
  classes: Array<{ id: string; name: string; teacherId: string }>;
  students: Array<{ id: string; username: string; organizationSlug: string }>;
  enrollments: Array<{ id: string; studentId: string; classId: string; status: string }>;
  srsCards: Array<{ id: string; studentId: string }>;
  reviewLog: Array<{ id: string; studentId: string; cardId: string }>;
  submissions: Array<{ id: string; studentId: string }>;
  counts: {
    classes: number;
    enrollments: number;
    reviewLog: number;
    srsCards: number;
    students: number;
    submissions: number;
    teachers: number;
  };
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (Math.imul(hash, 31) + str.charCodeAt(i)) | 0;
  }
  return hash;
}

export function generateSchoolSeed(input: SchoolSeedInput): SchoolSeedResult {
  const scopeNum = hashString([
    input.rngSeed ?? SCALE_RNG_SEED,
    input.organizationSlug,
  ].join('|'));
  const salt = (scopeNum >>> 0).toString(36);
  let seq = 0;
  const id = (prefix: string) => `${prefix}${salt}${(seq++).toString(36)}`;

  const org = { slug: input.organizationSlug };

  const teachers = Array.from({ length: SCALE_TEACHERS_PER_SCHOOL }, (_, i) => ({
    id: id('t'),
    username: `teacher${i}@${input.organizationSlug}`,
  }));

  const classes = Array.from({ length: SCALE_CLASSES_PER_SCHOOL }, (_, i) => ({
    id: id('c'),
    name: `Class ${i + 1}`,
    teacherId: teachers[i].id,
  }));

  // 34 classes × 30 students = 1,020 — every class is a full section.
  const students: SchoolSeedResult['students'] = [];
  const enrollments: SchoolSeedResult['enrollments'] = [];

  let studentIdx = 0;
  for (let ci = 0; ci < classes.length; ci++) {
    const classRoom = classes[ci];
    for (let si = 0; si < SCALE_STUDENT_COUNT_CLASS; si++) {
      const sid = id('s');
      students.push({
        id: sid,
        username: `student${studentIdx}@${input.organizationSlug}`,
        organizationSlug: input.organizationSlug,
      });
      enrollments.push({
        id: id('e'),
        studentId: sid,
        classId: classRoom.id,
        status: 'active',
      });
      studentIdx++;
    }
  }

  const srsCards: SchoolSeedResult['srsCards'] = [];
  for (let i = 0; i < students.length; i++) {
    const sid = students[i].id;
    for (let j = 0; j < SCALE_CARDS_PER_STUDENT; j++) {
      srsCards.push({ id: id('k'), studentId: sid });
    }
  }

  const reviewLog: SchoolSeedResult['reviewLog'] = [];
  for (let i = 0; i < srsCards.length; i++) {
    const card = srsCards[i];
    for (let k = 0; k < SCALE_REVIEWS_PER_CARD; k++) {
      reviewLog.push({
        id: id('r'),
        studentId: card.studentId,
        cardId: card.id,
      });
    }
  }

  const submissions: SchoolSeedResult['submissions'] = [];
  for (let i = 0; i < students.length; i++) {
    const sid = students[i].id;
    for (let m = 0; m < SCALE_SUBMISSIONS_PER_STUDENT; m++) {
      submissions.push({ id: id('b'), studentId: sid });
    }
  }

  return {
    organization: org,
    teachers,
    classes,
    students,
    enrollments,
    srsCards,
    reviewLog,
    submissions,
    counts: {
      classes: classes.length,
      enrollments: enrollments.length,
      reviewLog: reviewLog.length,
      srsCards: srsCards.length,
      students: students.length,
      submissions: submissions.length,
      teachers: teachers.length,
    },
  };
}
