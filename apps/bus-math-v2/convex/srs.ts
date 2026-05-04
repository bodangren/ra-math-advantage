import { internalQuery, mutation, query } from './_generated/server';
import { v, ConvexError } from 'convex/values';
import type { Doc, Id } from './_generated/dataModel';
import {
  computeClassHealth,
  computeFamilyPerformance,
  computeStrugglingStudents,
  formatFamilyDisplayName,
} from '../lib/srs/teacher-analytics';
import { srsCardStateValidator, srsRatingValidator } from './srs_validators';
import { createCard } from '@math-platform/srs-engine';

// COPIED from packages/srs-engine/src/srs/transition-validator.ts — DO NOT EDIT WITHOUT SYNCING
function validateSrsTransition(
  stateBefore: {
    stability: number;
    difficulty: number;
    state: 'new' | 'learning' | 'review' | 'relearning';
    reps: number;
    lapses: number;
  },
  stateAfter: {
    stability: number;
    difficulty: number;
    state: 'new' | 'learning' | 'review' | 'relearning';
    reps: number;
    lapses: number;
  },
): void {
  if (stateAfter.reps !== stateBefore.reps + 1) {
    throw new Error(
      `reps must increase by exactly 1 (before: ${stateBefore.reps}, after: ${stateAfter.reps})`
    );
  }
  if (stateAfter.lapses < stateBefore.lapses) {
    throw new Error(
      `lapses cannot decrease (before: ${stateBefore.lapses}, after: ${stateAfter.lapses})`
    );
  }
  const validNext: Record<string, string[]> = {
    new: ['learning', 'review'],
    learning: ['learning', 'review'],
    review: ['learning', 'review'],
    relearning: ['learning', 'review'],
  };
  if (!validNext[stateBefore.state]?.includes(stateAfter.state)) {
    throw new Error(
      `invalid state transition: ${stateBefore.state} → ${stateAfter.state}`
    );
  }
}

async function verifyStudentIdentity(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ctx: { db: { query: (table: 'profiles') => any } },
  identity: { email?: string | null },
  studentId: Id<'profiles'>
): Promise<void> {
  const profile = await ctx.db
    .query('profiles')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .withIndex('by_username', (q: any) => q.eq('username', identity.email!))
    .unique();
  if (!profile || profile._id !== studentId) {
    throw new ConvexError('Unauthorized: studentId does not match authenticated user');
  }
}

export const upsertSrsCard = mutation({
  args: {
    studentId: v.id('profiles'),
    objectiveId: v.string(),
    problemFamilyId: v.string(),
    card: srsCardStateValidator,
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError('Unauthenticated');

    await verifyStudentIdentity(ctx, identity, args.studentId);

    const existing = await ctx.db
      .query('srs_cards')
      .withIndex('by_student_family', (q) =>
        q.eq('studentId', args.studentId).eq('problemFamilyId', args.problemFamilyId)
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        cardId: args.card.cardId,
        objectiveId: args.card.objectiveId,
        problemFamilyId: args.card.problemFamilyId,
        stability: args.card.stability,
        difficulty: args.card.difficulty,
        state: args.card.state,
        dueDate: args.card.dueDate,
        elapsedDays: args.card.elapsedDays,
        scheduledDays: args.card.scheduledDays,
        reps: args.card.reps,
        lapses: args.card.lapses,
        lastReview: args.card.lastReview,
        updatedAt: args.card.updatedAt,
      });
      return existing._id;
    } else {
      return await ctx.db.insert('srs_cards', {
        cardId: args.card.cardId,
        studentId: args.studentId,
        objectiveId: args.card.objectiveId,
        problemFamilyId: args.card.problemFamilyId,
        stability: args.card.stability,
        difficulty: args.card.difficulty,
        state: args.card.state,
        dueDate: args.card.dueDate,
        elapsedDays: args.card.elapsedDays,
        scheduledDays: args.card.scheduledDays,
        reps: args.card.reps,
        lapses: args.card.lapses,
        lastReview: args.card.lastReview,
        createdAt: args.card.createdAt,
        updatedAt: args.card.updatedAt,
      });
    }
  },
});

export const recordSrsReview = mutation({
  args: {
    studentId: v.id('profiles'),
    problemFamilyId: v.string(),
    rating: srsRatingValidator,
    scheduledAt: v.number(),
    reviewedAt: v.number(),
    elapsedDays: v.number(),
    scheduledDays: v.number(),
    reviewDurationMs: v.optional(v.number()),
    timingConfidence: v.optional(v.string()),
    card: srsCardStateValidator,
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError('Unauthenticated');

    await verifyStudentIdentity(ctx, identity, args.studentId);

    const existing = await ctx.db
      .query('srs_cards')
      .withIndex('by_student_family', (q) =>
        q.eq('studentId', args.studentId).eq('problemFamilyId', args.problemFamilyId)
      )
      .unique();

    const stateBefore = existing
      ? {
          stability: existing.stability,
          difficulty: existing.difficulty,
          state: existing.state,
          reps: existing.reps,
          lapses: existing.lapses,
        }
      : {
          stability: 0,
          difficulty: 0,
          state: 'new' as const,
          reps: 0,
          lapses: 0,
        };

    const stateAfter = {
      stability: args.card.stability,
      difficulty: args.card.difficulty,
      state: args.card.state,
      reps: args.card.reps,
      lapses: args.card.lapses,
    };

    validateSrsTransition(stateBefore, stateAfter);

    await ctx.db.insert('srs_review_log', {
      studentId: args.studentId,
      problemFamilyId: args.problemFamilyId,
      rating: args.rating,
      scheduledAt: args.scheduledAt,
      reviewedAt: args.reviewedAt,
      elapsedDays: args.elapsedDays,
      scheduledDays: args.scheduledDays,
      reviewDurationMs: args.reviewDurationMs,
      timingConfidence: args.timingConfidence,
      stateBefore,
      stateAfter,
    });

    if (existing) {
      await ctx.db.patch(existing._id, {
        cardId: args.card.cardId,
        objectiveId: args.card.objectiveId,
        problemFamilyId: args.card.problemFamilyId,
        stability: args.card.stability,
        difficulty: args.card.difficulty,
        state: args.card.state,
        dueDate: args.card.dueDate,
        elapsedDays: args.card.elapsedDays,
        scheduledDays: args.card.scheduledDays,
        reps: args.card.reps,
        lapses: args.card.lapses,
        lastReview: args.card.lastReview,
        updatedAt: args.card.updatedAt,
      });
    } else {
      await ctx.db.insert('srs_cards', {
        cardId: args.card.cardId,
        studentId: args.studentId,
        objectiveId: args.card.objectiveId,
        problemFamilyId: args.card.problemFamilyId,
        stability: args.card.stability,
        difficulty: args.card.difficulty,
        state: args.card.state,
        dueDate: args.card.dueDate,
        elapsedDays: args.card.elapsedDays,
        scheduledDays: args.card.scheduledDays,
        reps: args.card.reps,
        lapses: args.card.lapses,
        lastReview: args.card.lastReview,
        createdAt: args.card.createdAt,
        updatedAt: args.card.updatedAt,
      });
    }
  },
});

export const getDueCards = query({
  args: {
    studentId: v.id('profiles'),
    now: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError('Unauthenticated');

    await verifyStudentIdentity(ctx, identity, args.studentId);

    const cutoff = args.now ?? new Date().toISOString();
    const cards: Doc<'srs_cards'>[] = [];

    for await (const card of ctx.db.query('srs_cards').withIndex('by_student', (q) => q.eq('studentId', args.studentId))) {
      if (card.dueDate <= cutoff) {
        cards.push(card);
      }
    }

    return cards.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  },
});

export const getStudentSrsSummary = query({
  args: {
    studentId: v.id('profiles'),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError('Unauthenticated');

    await verifyStudentIdentity(ctx, identity, args.studentId);

    const now = new Date().toISOString();
    let totalCards = 0;
    let dueCount = 0;
    const byFamily: Record<string, { total: number; due: number }> = {};

    for await (const card of ctx.db.query('srs_cards').withIndex('by_student', (q) => q.eq('studentId', args.studentId))) {
      totalCards++;
      if (card.dueDate <= now) dueCount++;
      const family = card.problemFamilyId;
      if (!byFamily[family]) byFamily[family] = { total: 0, due: 0 };
      byFamily[family].total++;
      if (card.dueDate <= now) byFamily[family].due++;
    }

    return { totalCards, dueCount, byFamily };
  },
});

export const getSrsCard = query({
  args: {
    studentId: v.id('profiles'),
    problemFamilyId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError('Unauthenticated');

    await verifyStudentIdentity(ctx, identity, args.studentId);

    return await ctx.db
      .query('srs_cards')
      .withIndex('by_student_family', (q) =>
        q.eq('studentId', args.studentId).eq('problemFamilyId', args.problemFamilyId)
      )
      .unique();
  },
});

async function getAuthorizedTeacher(
  ctx: { db: { get: (id: Id<'profiles'>) => Promise<Doc<'profiles'> | null> } },
  userId: Id<'profiles'>
): Promise<Doc<'profiles'> | null> {
  const profile = await ctx.db.get(userId);
  if (!profile || (profile.role !== 'teacher' && profile.role !== 'admin')) {
    return null;
  }
  return profile;
}

export const getClassSrsHealth = query({
  args: {
    classId: v.id('classes'),
    now: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError('Unauthenticated');

    const profile = await ctx.db
      .query('profiles')
      .withIndex('by_username', (q) => q.eq('username', identity.email!))
      .unique();
    if (!profile) throw new ConvexError('Profile not found');

    const teacher = await getAuthorizedTeacher(ctx, profile._id);
    if (!teacher) throw new ConvexError('Unauthorized');

    const cls = await ctx.db.get(args.classId);
    if (!cls) throw new ConvexError('Class not found');
    if (cls.teacherId !== teacher._id) throw new ConvexError('Unauthorized');

    const enrollments = await ctx.db
      .query('class_enrollments')
      .withIndex('by_class', (q) => q.eq('classId', args.classId))
      .collect();

    const activeStudentIds = enrollments
      .filter((e) => e.status === 'active')
      .map((e) => e.studentId);

    const students: Doc<'profiles'>[] = [];
    for (const studentId of activeStudentIds) {
      const student = await ctx.db.get(studentId);
      if (student) students.push(student);
    }

    const cards: Doc<'srs_cards'>[] = [];
    for (const studentId of activeStudentIds) {
      const studentCards = await ctx.db
        .query('srs_cards')
        .withIndex('by_student', (q) => q.eq('studentId', studentId))
        .collect();
      cards.push(...studentCards);
    }

    const now = args.now ?? Date.now();
    const d = new Date(now);
    const startOfDay = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0);
    const endOfDay = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 23, 59, 59, 999);

    const health = computeClassHealth(students, cards, now, startOfDay, endOfDay);

    return {
      ...health,
      classId: args.classId,
    };
  },
});

export const getWeakFamilies = query({
  args: {
    classId: v.id('classes'),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError('Unauthenticated');

    const profile = await ctx.db
      .query('profiles')
      .withIndex('by_username', (q) => q.eq('username', identity.email!))
      .unique();
    if (!profile) throw new ConvexError('Profile not found');

    const teacher = await getAuthorizedTeacher(ctx, profile._id);
    if (!teacher) throw new ConvexError('Unauthorized');

    const cls = await ctx.db.get(args.classId);
    if (!cls) throw new ConvexError('Class not found');
    if (cls.teacherId !== teacher._id) throw new ConvexError('Unauthorized');

    const enrollments = await ctx.db
      .query('class_enrollments')
      .withIndex('by_class', (q) => q.eq('classId', args.classId))
      .collect();

    const activeStudentIds = enrollments
      .filter((e) => e.status === 'active')
      .map((e) => e.studentId);

    const reviews: Doc<'srs_review_log'>[] = [];
    for (const studentId of activeStudentIds) {
      const studentReviews = await ctx.db
        .query('srs_review_log')
        .withIndex('by_student', (q) => q.eq('studentId', studentId))
        .collect();
      reviews.push(...studentReviews);
    }

    const performance = computeFamilyPerformance(reviews);

    return performance.map((p) => ({
      ...p,
      displayName: formatFamilyDisplayName(p.problemFamilyId),
    }));
  },
});

export const getStrugglingStudents = query({
  args: {
    classId: v.id('classes'),
    now: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError('Unauthenticated');

    const profile = await ctx.db
      .query('profiles')
      .withIndex('by_username', (q) => q.eq('username', identity.email!))
      .unique();
    if (!profile) throw new ConvexError('Profile not found');

    const teacher = await getAuthorizedTeacher(ctx, profile._id);
    if (!teacher) throw new ConvexError('Unauthorized');

    const cls = await ctx.db.get(args.classId);
    if (!cls) throw new ConvexError('Class not found');
    if (cls.teacherId !== teacher._id) throw new ConvexError('Unauthorized');

    const enrollments = await ctx.db
      .query('class_enrollments')
      .withIndex('by_class', (q) => q.eq('classId', args.classId))
      .collect();

    const activeStudentIds = enrollments
      .filter((e) => e.status === 'active')
      .map((e) => e.studentId);

    const students: Doc<'profiles'>[] = [];
    for (const studentId of activeStudentIds) {
      const student = await ctx.db.get(studentId);
      if (student) students.push(student);
    }

    const cards: Doc<'srs_cards'>[] = [];
    const reviews: Doc<'srs_review_log'>[] = [];
    for (const studentId of activeStudentIds) {
      const [studentCards, studentReviews] = await Promise.all([
        ctx.db.query('srs_cards').withIndex('by_student', (q) => q.eq('studentId', studentId)).collect(),
        ctx.db.query('srs_review_log').withIndex('by_student', (q) => q.eq('studentId', studentId)).collect(),
      ]);
      cards.push(...studentCards);
      reviews.push(...studentReviews);
    }

    const now = args.now ?? Date.now();
    const metrics = computeStrugglingStudents(students, cards, reviews, now);

    return {
      classId: args.classId,
      students: metrics,
    };
  },
});

export const resetStudentCard = mutation({
  args: {
    studentId: v.id('profiles'),
    problemFamilyId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError('Unauthenticated');

    const profile = await ctx.db
      .query('profiles')
      .withIndex('by_username', (q) => q.eq('username', identity.email!))
      .unique();
    if (!profile) throw new ConvexError('Profile not found');

    const teacher = await getAuthorizedTeacher(ctx, profile._id);
    if (!teacher) throw new ConvexError('Unauthorized');

    const enrollments = await ctx.db
      .query('class_enrollments')
      .withIndex('by_student', (q) => q.eq('studentId', args.studentId))
      .collect();

    let isAuthorizedStudent = false;
    let classId: Id<'classes'> | null = null;
    for (const enrollment of enrollments) {
      if (enrollment.status !== 'active') continue;
      const cls = await ctx.db.get(enrollment.classId);
      if (cls && cls.teacherId === teacher._id) {
        isAuthorizedStudent = true;
        classId = enrollment.classId;
        break;
      }
    }

    if (!isAuthorizedStudent) throw new ConvexError('Unauthorized');

    const existing = await ctx.db
      .query('srs_cards')
      .withIndex('by_student_family', (q) =>
        q.eq('studentId', args.studentId).eq('problemFamilyId', args.problemFamilyId)
      )
      .unique();

    const now = new Date().toISOString();
    const newCard = createCard({
      studentId: args.studentId,
      objectiveId: args.problemFamilyId,
      problemFamilyId: args.problemFamilyId,
      now,
    });

    if (existing) {
      await ctx.db.patch(existing._id, {
        cardId: newCard.cardId,
        objectiveId: newCard.objectiveId,
        problemFamilyId: newCard.problemFamilyId,
        stability: newCard.stability,
        difficulty: newCard.difficulty,
        state: newCard.state,
        dueDate: newCard.dueDate,
        elapsedDays: newCard.elapsedDays,
        scheduledDays: newCard.scheduledDays,
        reps: newCard.reps,
        lapses: newCard.lapses,
        lastReview: newCard.lastReview,
        updatedAt: newCard.updatedAt,
      });
    } else {
      await ctx.db.insert('srs_cards', {
        cardId: newCard.cardId,
        studentId: args.studentId,
        objectiveId: newCard.objectiveId,
        problemFamilyId: newCard.problemFamilyId,
        stability: newCard.stability,
        difficulty: newCard.difficulty,
        state: newCard.state,
        dueDate: newCard.dueDate,
        elapsedDays: newCard.elapsedDays,
        scheduledDays: newCard.scheduledDays,
        reps: newCard.reps,
        lapses: newCard.lapses,
        lastReview: newCard.lastReview,
        createdAt: newCard.createdAt,
        updatedAt: newCard.updatedAt,
      });
    }

    if (!classId) throw new ConvexError('No valid class found for intervention');

    await ctx.db.insert('srs_interventions', {
      teacherId: teacher._id,
      studentId: args.studentId,
      classId,
      problemFamilyId: args.problemFamilyId,
      interventionType: 'reset_card',
      createdAt: Date.now(),
    });

    return { success: true };
  },
});

export const bumpFamilyPriority = mutation({
  args: {
    classId: v.id('classes'),
    problemFamilyId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError('Unauthenticated');

    const profile = await ctx.db
      .query('profiles')
      .withIndex('by_username', (q) => q.eq('username', identity.email!))
      .unique();
    if (!profile) throw new ConvexError('Profile not found');

    const teacher = await getAuthorizedTeacher(ctx, profile._id);
    if (!teacher) throw new ConvexError('Unauthorized');

    const cls = await ctx.db.get(args.classId);
    if (!cls) throw new ConvexError('Class not found');
    if (cls.teacherId !== teacher._id) throw new ConvexError('Unauthorized');

    const enrollments = await ctx.db
      .query('class_enrollments')
      .withIndex('by_class', (q) => q.eq('classId', args.classId))
      .collect();

    const activeStudentIds = enrollments
      .filter((e) => e.status === 'active')
      .map((e) => e.studentId);

    const now = new Date().toISOString();
    let affectedCount = 0;

    for (const studentId of activeStudentIds) {
      const card = await ctx.db
        .query('srs_cards')
        .withIndex('by_student_family', (q) =>
          q.eq('studentId', studentId).eq('problemFamilyId', args.problemFamilyId)
        )
        .unique();

      if (card) {
        await ctx.db.patch(card._id, { dueDate: now, updatedAt: now });
        affectedCount++;
      }
    }

    await ctx.db.insert('srs_interventions', {
      teacherId: teacher._id,
      classId: args.classId,
      problemFamilyId: args.problemFamilyId,
      interventionType: 'bump_priority',
      createdAt: Date.now(),
    });

    return { success: true, affectedCount };
  },
});

export const getTeacherClasses = internalQuery({
  args: {
    userId: v.id("profiles"),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db.get(args.userId);
    if (!profile || (profile.role !== "teacher" && profile.role !== "admin")) {
      return [];
    }

    const classes = await ctx.db
      .query("classes")
      .withIndex("by_teacher", (q) => q.eq("teacherId", args.userId))
      .collect();

    return classes
      .filter((c) => !c.archived)
      .map((cls) => ({
        id: cls._id,
        name: cls.name,
        description: cls.description ?? null,
        academicYear: cls.academicYear ?? null,
      }));
  },
});