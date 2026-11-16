import { internalQuery } from './_generated/server';
import { v } from 'convex/values';
import nodes from '../curriculum/skill-graph/nodes.json';
export const getDashboardData = internalQuery({
  args: { userId: v.id('profiles') }, returns: v.any(),
  handler: async (ctx, { userId }) => {
    const profile = await ctx.db.get(userId);
    if (profile?.role !== 'student') throw new Error('Forbidden');
    const now = new Date().toISOString();
    const dueCards = await ctx.db.query('srs_cards').withIndex('by_student_and_due', q => q.eq('studentId', userId).lte('dueDate', now)).take(100);
    const enrollments = await ctx.db.query('class_enrollments').withIndex('by_student', q => q.eq('studentId', userId)).take(100);
    const assignments = [];
    for (const enrollment of enrollments.filter(e => e.status === 'active')) {
      const classroom = await ctx.db.get(enrollment.classId);
      if (!classroom || classroom.archived) continue;
      const rows = await ctx.db.query('class_lessons').withIndex('by_class_and_lesson', q => q.eq('classId', enrollment.classId)).take(100);
      for (const row of rows) {
        const lesson = await ctx.db.get(row.lessonId);
        if (lesson) assignments.push({ id: row._id, className: classroom.name, title: lesson.title, topic: `${lesson.unitNumber}.${lesson.orderIndex}` });
      }
    }
    return { assignments, dueReviews: dueCards.map(card => ({ id: card._id, title: nodes.nodes.find(n => n.id === card.objectiveId)?.title ?? card.objectiveId, nodeId: card.objectiveId,
      mode: card.problemFamilyId.endsWith('.independent_practice') ? 'independent_practice' : 'guided_practice', dueDate: card.dueDate })) };
  },
});
