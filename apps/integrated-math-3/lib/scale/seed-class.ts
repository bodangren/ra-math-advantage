/**
 * Deterministic 30-student class seed generator for load/scale testing.
 *
 * Pure function — no Convex, no network, no Date. The output is
 * JSON-serializable and idempotent given the same RNG seed.
 */

import {
  SCALE_STUDENT_COUNT_CLASS,
} from '@/__tests__/_fixtures/scale/student-roster';
import {
  SCALE_CARDS_PER_STUDENT,
  SCALE_REVIEWS_PER_CARD,
  SCALE_SUBMISSIONS_PER_STUDENT,
} from '@/__tests__/_fixtures/scale/density';

export const SCALE_RNG_SEED = 'load-2026' as const;

export interface ClassSeedInput {
  organizationSlug: string;
  className: string;
  teacherUsername: string;
  rngSeed?: string;
}

export interface ClassSeedResult {
  organization: { slug: string };
  classRoom: { id: string; name: string; teacherId: string };
  teacher: { id: string; username: string };
  students: Array<{ id: string; username: string; organizationSlug: string }>;
  enrollments: Array<{ id: string; studentId: string; classId: string; status: string }>;
  srsCards: Array<{ id: string; studentId: string }>;
  reviewLog: Array<{ id: string; studentId: string; cardId: string }>;
  submissions: Array<{ id: string; studentId: string }>;
  counts: {
    enrollments: number;
    reviewLog: number;
    srsCards: number;
    students: number;
    submissions: number;
  };
}

function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (Math.imul(hash, 31) + str.charCodeAt(i)) | 0;
  }
  return hash;
}

export function generateClassSeed(input: ClassSeedInput): ClassSeedResult {
  const seedNum = hashString(input.rngSeed ?? SCALE_RNG_SEED);
  const rng = mulberry32(seedNum);
  // Derive a short salt from the seed so different seeds produce different IDs.
  const salt = (seedNum >>> 0).toString(36);
  let seq = 0;
  const id = (prefix: string) => `${prefix}${salt}${(seq++).toString(36)}`;

  const org = { slug: input.organizationSlug };
  const teacher = { id: id('t'), username: input.teacherUsername };
  const classRoom = {
    id: id('c'),
    name: input.className,
    teacherId: teacher.id,
  };

  const students = Array.from({ length: SCALE_STUDENT_COUNT_CLASS }, (_, i) => ({
    id: id('s'),
    username: `student${i}@${input.organizationSlug}`,
    organizationSlug: input.organizationSlug,
  }));

  const enrollments = students.map((s) => ({
    id: id('e'),
    studentId: s.id,
    classId: classRoom.id,
    status: 'active',
  }));

  const srsCards: ClassSeedResult['srsCards'] = [];
  for (let i = 0; i < students.length; i++) {
    const sid = students[i].id;
    for (let j = 0; j < SCALE_CARDS_PER_STUDENT; j++) {
      srsCards.push({ id: id('k'), studentId: sid });
    }
  }

  const reviewLog: ClassSeedResult['reviewLog'] = [];
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

  const submissions: ClassSeedResult['submissions'] = [];
  for (let i = 0; i < students.length; i++) {
    const sid = students[i].id;
    for (let m = 0; m < SCALE_SUBMISSIONS_PER_STUDENT; m++) {
      submissions.push({ id: id('b'), studentId: sid });
    }
  }

  return {
    organization: org,
    classRoom,
    teacher,
    students,
    enrollments,
    srsCards,
    reviewLog,
    submissions,
    counts: {
      enrollments: enrollments.length,
      reviewLog: reviewLog.length,
      srsCards: srsCards.length,
      students: students.length,
      submissions: submissions.length,
    },
  };
}
