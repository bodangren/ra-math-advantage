import { v } from 'convex/values';
import { internalQuery, internalMutation, type QueryCtx, type MutationCtx } from './_generated/server';
import type { Id } from './_generated/dataModel';
import {
  PRECALCULUS_PILOT_NODE_ID,
  PRECALCULUS_TOPIC_11_SOURCE_ACTIVITY_ID,
} from '../lib/learning-evidence/precalc-pilot';
import {
  getApprovedTopic11WorkedSourceHandler,
  hasCurrentTopic11Source,
  isStoredTopic11Acknowledgement,
  isTopic11TeacherConfirmationForSubmission,
  type SelectedPilotPublication,
} from './activities';
import nodesDocument from '../curriculum/skill-graph/nodes.json';
import blueprintsDocument from '../curriculum/skill-graph/blueprints.json';

const topic11TeacherCandidateValidator = v.object({
  learnerId: v.id('profiles'),
  learnerName: v.string(),
  submissionId: v.id('activity_submissions'),
  acknowledgedAt: v.number(),
  lessonLabel: v.string(),
  classChoices: v.array(v.object({ classId: v.id('classes'), className: v.string() })),
});

const topic11Publication: SelectedPilotPublication = {
  nodes: nodesDocument.nodes,
  blueprints: blueprintsDocument.blueprints,
};

function hasActiveCredential(profile: Record<string, unknown>, credential: Record<string, unknown> | null): boolean {
  return Boolean(credential?.isActive)
    && credential?.profileId === profile._id
    && credential?.username === profile.username
    && credential?.role === profile.role
    && credential?.organizationId === profile.organizationId;
}

/** Derives exact Topic 1.1 acknowledgement candidates for one teacher. */
export async function getTopic11TeacherCandidatesHandler(
  ctx: QueryCtx,
  args: { teacherId: Id<'profiles'> },
  publication: SelectedPilotPublication = topic11Publication,
) {
  const teacher = await ctx.db.get('profiles', args.teacherId);
  const teacherCredential = teacher ? await ctx.db.query('auth_credentials')
    .withIndex('by_username', query => query.eq('username', teacher.username)).unique() : null;
  if (!teacher || teacher.role !== 'teacher' || !hasActiveCredential(teacher, teacherCredential)) {
    throw new Error('Forbidden');
  }
  const source = await getApprovedTopic11WorkedSourceHandler(ctx, publication);
  if (!source) return [];
  const [activity, lessons, classes] = await Promise.all([
    ctx.db.get('activities', source.activityId),
    ctx.db.query('lessons').withIndex('by_unit_and_order', query => query.eq('unitNumber', 1).eq('orderIndex', 1)).collect(),
    ctx.db.query('classes').withIndex('by_teacher', query => query.eq('teacherId', args.teacherId)).collect(),
  ]);
  if (!activity || lessons.length !== 1) return [];
  const lesson = lessons[0]!;
  const publishedVersions = (await ctx.db.query('lesson_versions')
    .withIndex('by_lesson', query => query.eq('lessonId', lesson._id)).collect())
    .filter(version => version.status === 'published')
    .sort((left, right) => right.version - left.version);
  if (publishedVersions.length === 0 || (publishedVersions[1]?.version === publishedVersions[0]!.version)) return [];
  const lessonLabel = publishedVersions[0]!.title ?? lesson.title;
  const now = Date.now();
  const classContexts = (await Promise.all(classes.filter(classroom => !classroom.archived).map(async classroom => ({
    classroom,
    enrollments: await ctx.db.query('class_enrollments').withIndex('by_class', query => query.eq('classId', classroom._id)).collect(),
    assignments: await ctx.db.query('class_lessons').withIndex('by_class_and_lesson', query => query.eq('classId', classroom._id).eq('lessonId', lesson._id)).collect(),
  }))));
  const learnerIds = [...new Set(classContexts.flatMap(({ enrollments }) => enrollments
    .filter(enrollment => enrollment.status === 'active').map(enrollment => enrollment.studentId)))];
  const candidates = [];
  for (const learnerId of learnerIds) {
    const learner = await ctx.db.get('profiles', learnerId);
    const credential = learner ? await ctx.db.query('auth_credentials')
      .withIndex('by_username', query => query.eq('username', learner.username)).unique() : null;
    if (!learner || learner.role !== 'student' || learner.organizationId !== teacher.organizationId
      || !hasActiveCredential(learner, credential)) continue;
    const submissions = await ctx.db.query('activity_submissions')
      .withIndex('by_user_and_activity', query => query.eq('userId', learnerId).eq('activityId', source.activityId)).collect();
    for (const submission of submissions) {
      const reviewedAt = activity.approval?.reviewedAt;
      if (!isStoredTopic11Acknowledgement(submission, learnerId, source.activityId, now)
        || !Number.isFinite(activity.createdAt) || activity.createdAt > submission.submittedAt
        || !Number.isFinite(reviewedAt) || Number(reviewedAt) > submission.submittedAt
        || !await hasCurrentTopic11Source(ctx, lesson._id, source.activityId, submission.submittedAt)) continue;
      const confirmation = await ctx.db.query('learning_evidence')
        .withIndex('by_learner_and_idempotency_key', query => query
          .eq('learnerId', learnerId)
          .eq('idempotencyKey', `precalc:teacher-led:submission:${String(submission._id)}`)).unique();
      if (confirmation && isTopic11TeacherConfirmationForSubmission(confirmation, submission)) continue;
      const classChoices = classContexts.flatMap(({ classroom, enrollments, assignments }) => {
        const enrollment = enrollments.filter(row => row.studentId === learnerId);
        return enrollment.length === 1 && enrollment[0]!.status === 'active'
          && enrollment[0]!.enrolledAt <= submission.submittedAt
          && assignments.length === 1 && assignments[0]!.assignedAt <= submission.submittedAt
          ? [{ classId: classroom._id, className: classroom.name }]
          : [];
      });
      if (classChoices.length > 0) candidates.push({
        learnerId,
        learnerName: learner.displayName ?? learner.username,
        submissionId: submission._id,
        acknowledgedAt: submission.submittedAt,
        lessonLabel,
        classChoices,
      });
    }
  }
  return candidates;
}

export const getTopic11TeacherCandidates = internalQuery({
  args: { teacherId: v.id('profiles') },
  returns: v.array(topic11TeacherCandidateValidator),
  handler: (ctx, args) => getTopic11TeacherCandidatesHandler(ctx, args),
});

async function requireRole(ctx: QueryCtx | MutationCtx, id: Id<'profiles'>, role: 'student' | 'teacher') {
  const profile = await ctx.db.get(id);
  if (!profile || (profile.role !== role && !(role === 'teacher' && profile.role === 'admin'))) throw new Error('Forbidden');
  return profile;
}
async function roster(ctx: QueryCtx | MutationCtx, teacherId: Id<'profiles'>) {
  await requireRole(ctx, teacherId, 'teacher');
  const classes = await ctx.db.query('classes').withIndex('by_teacher', q => q.eq('teacherId', teacherId)).take(100);
  const enrollments = (await Promise.all(classes.filter(c => !c.archived).map(c => ctx.db.query('class_enrollments')
    .withIndex('by_class', q => q.eq('classId', c._id)).take(200)))).flat().filter(e => e.status === 'active');
  return { classes, enrollments };
}
async function publishedVersion(ctx: QueryCtx | MutationCtx, lessonId: Id<'lessons'>) {
  const versions = await ctx.db.query('lesson_versions').withIndex('by_lesson_and_version', q => q.eq('lessonId', lessonId)).order('desc').take(20);
  return versions.find(version => version.status === 'published') ?? null;
}

export const getLessons = internalQuery({
  args: { learnerId: v.id('profiles') }, returns: v.any(),
  handler: async (ctx, { learnerId }) => {
    await requireRole(ctx, learnerId, 'student');
    const lessons = (await Promise.all([1, 2, 3, 4].map(unit => ctx.db.query('lessons')
      .withIndex('by_unit_and_order', q => q.eq('unitNumber', unit)).take(30)))).flat();
    const result = [];
    for (const lesson of lessons) {
      const version = await publishedVersion(ctx, lesson._id);
      if (version) result.push({ id: lesson._id, topic: `${lesson.unitNumber}.${lesson.orderIndex}`, title: version.title ?? lesson.title });
    }
    return result;
  },
});
export const getLesson = internalQuery({
  args: { learnerId: v.id('profiles'), unit: v.number(), topic: v.number() }, returns: v.any(),
  handler: async (ctx, { learnerId, unit, topic }) => {
    await requireRole(ctx, learnerId, 'student');
    const lesson = await ctx.db.query('lessons').withIndex('by_unit_and_order', q => q.eq('unitNumber', unit).eq('orderIndex', topic)).unique();
    if (!lesson) return null;
    const version = await publishedVersion(ctx, lesson._id);
    if (!version) return null;
    const phases = await ctx.db.query('phase_versions').withIndex('by_lesson_version_and_phase', q => q.eq('lessonVersionId', version._id)).take(20);
    return { title: version.title ?? lesson.title, topic: `${unit}.${topic}`, phases: await Promise.all(phases.map(async phase => ({
      ...phase,
      sections: await ctx.db.query('phase_sections').withIndex('by_phase_version_and_sequence', q => q.eq('phaseVersionId', phase._id)).take(50),
      responses: await ctx.db.query('lesson_responses').withIndex('by_learner_and_phase', q => q.eq('learnerId', learnerId).eq('phaseId', phase._id)).order('desc').take(10),
    }))) };
  },
});
export const saveResponse = internalMutation({
  args: { learnerId: v.id('profiles'), phaseId: v.id('phase_versions'), response: v.string() },
  returns: v.id('lesson_responses'),
  handler: async (ctx, { learnerId, phaseId, response }) => {
    await requireRole(ctx, learnerId, 'student');
    if (!response.trim() || response.length > 10000) throw new Error('Write 1 to 10000 characters');
    const phase = await ctx.db.get(phaseId);
    if (!phase) throw new Error('Phase not found');
    const version = await ctx.db.get(phase.lessonVersionId);
    if (version?.status !== 'published') throw new Error('Lesson is not published');
    const now = Date.now();
    const id = await ctx.db.insert('lesson_responses', { learnerId, phaseId, response: response.trim(), createdAt: now });
    const progress = await ctx.db.query('student_progress').withIndex('by_user_and_phase', q => q.eq('userId', learnerId).eq('phaseId', phaseId)).unique();
    if (progress) await ctx.db.patch(progress._id, { status: 'completed', completedAt: now, updatedAt: now });
    else await ctx.db.insert('student_progress', { userId: learnerId, phaseId, status: 'completed', startedAt: now, completedAt: now, createdAt: now, updatedAt: now });
    return id;
  },
});
export const getTeacherData = internalQuery({
  args: { teacherId: v.id('profiles') }, returns: v.any(),
  handler: async (ctx, { teacherId }) => {
    const { classes, enrollments } = await roster(ctx, teacherId);
    const studentIds = [...new Set(enrollments.map(e => e.studentId))];
    const students = await Promise.all(studentIds.map(async id => {
      const profile = await ctx.db.get(id);
      const responses = await ctx.db.query('lesson_responses').withIndex('by_learner', q => q.eq('learnerId', id)).order('desc').take(100);
      const submissions = await ctx.db.query('activity_submissions').withIndex('by_user', q => q.eq('userId', id)).order('desc').take(100);
      const responsesWithPhase = await Promise.all(responses.map(async response => {
        const phase = await ctx.db.get(response.phaseId);
        const version = phase ? await ctx.db.get(phase.lessonVersionId) : null;
        return { ...response, phaseTitle: phase?.title ?? 'Lesson phase', lessonTitle: version?.title ?? 'Lesson' };
      }));
      const competencies = await ctx.db.query('student_competency').withIndex('by_student', q => q.eq('studentId', id)).take(100);
      const submissionsWithTeacherState = await Promise.all(submissions.map(async submission => {
        const evidence = submission.stableActivityId === PRECALCULUS_TOPIC_11_SOURCE_ACTIVITY_ID
          ? await ctx.db.query('learning_evidence').withIndex('by_learner_and_submission_id', q => (
            q.eq('learnerId', id).eq('submissionId', submission._id)
          )).take(2)
          : [];
        return {
          ...submission,
          topic11TeacherConfirmed: evidence.some(row => (
            row.nodeId === PRECALCULUS_PILOT_NODE_ID
            && row.activityId === PRECALCULUS_TOPIC_11_SOURCE_ACTIVITY_ID
            && row.origin === 'teacher_led'
          )),
        };
      }));
      return { id, username: profile?.username, name: profile?.displayName ?? profile?.username, responses: responsesWithPhase, submissions: submissionsWithTeacherState, competencies };
    }));
    const assignments = (await Promise.all(classes.map(c => ctx.db.query('class_lessons').withIndex('by_class_and_lesson', q => q.eq('classId', c._id)).take(100)))).flat();
    const lessons = (await Promise.all([1, 2, 3, 4].map(unit => ctx.db.query('lessons').withIndex('by_unit_and_order', q => q.eq('unitNumber', unit)).take(30)))).flat();
    const standards = await ctx.db.query('competency_standards').withIndex('by_code').take(100);
    return { classes, enrollments, students, assignments, lessons, standards: standards.filter(s => s.isActive) };
  },
});
export const createClass = internalMutation({
  args: { teacherId: v.id('profiles'), name: v.string() }, returns: v.id('classes'),
  handler: async (ctx, { teacherId, name }) => {
    await requireRole(ctx, teacherId, 'teacher');
    if (!name.trim() || name.length > 100) throw new Error('Enter a class name of 1 to 100 characters');
    const now = Date.now();
    return ctx.db.insert('classes', { teacherId, name: name.trim(), archived: false, createdAt: now, updatedAt: now });
  },
});
export const enrollStudent = internalMutation({
  args: { teacherId: v.id('profiles'), classId: v.id('classes'), username: v.string() }, returns: v.null(),
  handler: async (ctx, { teacherId, classId, username }) => {
    const teacher = await requireRole(ctx, teacherId, 'teacher');
    const classroom = await ctx.db.get(classId);
    if (!classroom || classroom.teacherId !== teacherId || classroom.archived) throw new Error('Class not found');
    const student = await ctx.db.query('profiles').withIndex('by_username', q => q.eq('username', username.trim())).unique();
    if (!student || student.role !== 'student' || student.organizationId !== teacher.organizationId) throw new Error('Student not found in this organization');
    const existing = await ctx.db.query('class_enrollments').withIndex('by_class_and_student', q => q.eq('classId', classId).eq('studentId', student._id)).unique();
    const now = Date.now();
    if (existing) await ctx.db.patch(existing._id, { status: 'active', updatedAt: now });
    else await ctx.db.insert('class_enrollments', { classId, studentId: student._id, enrolledAt: now, status: 'active', createdAt: now, updatedAt: now });
    return null;
  },
});
export const assignLesson = internalMutation({
  args: { teacherId: v.id('profiles'), classId: v.id('classes'), lessonId: v.id('lessons') }, returns: v.null(),
  handler: async (ctx, { teacherId, classId, lessonId }) => {
    await requireRole(ctx, teacherId, 'teacher');
    const classroom = await ctx.db.get(classId);
    if (!classroom || classroom.teacherId !== teacherId || classroom.archived) throw new Error('Class not found');
    if (!await publishedVersion(ctx, lessonId)) throw new Error('Lesson is not published');
    const existing = await ctx.db.query('class_lessons').withIndex('by_class_and_lesson', q => q.eq('classId', classId).eq('lessonId', lessonId)).unique();
    if (!existing) await ctx.db.insert('class_lessons', { classId, lessonId, assignedAt: Date.now(), createdAt: Date.now() });
    return null;
  },
});
export const gradeResponse = internalMutation({
  args: { teacherId: v.id('profiles'), responseId: v.id('lesson_responses'), score: v.number(), maxScore: v.number(), feedback: v.string() }, returns: v.null(),
  handler: async (ctx, { teacherId, responseId, score, maxScore, feedback }) => {
    const { enrollments } = await roster(ctx, teacherId);
    const response = await ctx.db.get(responseId);
    if (!response || !enrollments.some(e => e.studentId === response.learnerId)) throw new Error('Response not found');
    if (!Number.isFinite(score) || !Number.isFinite(maxScore) || maxScore <= 0 || score < 0 || score > maxScore || feedback.length > 5000) throw new Error('Invalid grade');
    await ctx.db.patch(responseId, { score, maxScore, feedback: feedback.trim(), gradedBy: teacherId, gradedAt: Date.now() });
    return null;
  },
});

export const setEnrollmentStatus = internalMutation({
  args: { teacherId: v.id('profiles'), enrollmentId: v.id('class_enrollments'), status: v.union(v.literal('active'), v.literal('withdrawn')) }, returns: v.null(),
  handler: async (ctx, { teacherId, enrollmentId, status }) => {
    await requireRole(ctx, teacherId, 'teacher');
    const enrollment = await ctx.db.get(enrollmentId);
    const classroom = enrollment ? await ctx.db.get(enrollment.classId) : null;
    if (!classroom || classroom.teacherId !== teacherId) throw new Error('Forbidden');
    await ctx.db.patch(enrollmentId, { status, updatedAt: Date.now() }); return null;
  },
});
export const recordCompetency = internalMutation({
  args: { teacherId: v.id('profiles'), studentId: v.id('profiles'), standardId: v.id('competency_standards'), masteryLevel: v.number() }, returns: v.null(),
  handler: async (ctx, { teacherId, studentId, standardId, masteryLevel }) => {
    const { enrollments } = await roster(ctx, teacherId);
    if (!enrollments.some(e => e.studentId === studentId)) throw new Error('Forbidden');
    const standard = await ctx.db.get(standardId);
    if (!standard?.isActive || !Number.isInteger(masteryLevel) || masteryLevel < 0 || masteryLevel > 4) throw new Error('Invalid competency level');
    const previous = await ctx.db.query('student_competency').withIndex('by_student_and_standard', q => q.eq('studentId', studentId).eq('standardId', standardId)).unique();
    const now = Date.now();
    if (previous) await ctx.db.patch(previous._id, { masteryLevel, updatedBy: teacherId, lastUpdated: now });
    else await ctx.db.insert('student_competency', { studentId, standardId, masteryLevel, updatedBy: teacherId, createdAt: now, lastUpdated: now });
    return null;
  },
});
