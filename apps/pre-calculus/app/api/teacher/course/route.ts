import { NextResponse } from 'next/server';
import { requireTeacherRequestClaims } from '@/lib/auth/server';
import { fetchInternalMutation, internal } from '@/lib/convex/server';
import { z } from 'zod';
const schema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('setEnrollmentStatus'), enrollmentId: z.string().min(1), status: z.enum(['active', 'withdrawn']) }),
  z.object({ action: z.literal('recordCompetency'), studentId: z.string().min(1), standardId: z.string().min(1), masteryLevel: z.number().int().min(0).max(4) }),
  z.object({ action: z.literal('createClass'), name: z.string().trim().min(1).max(100) }),
  z.object({ action: z.literal('enrollStudent'), classId: z.string().min(1), username: z.string().trim().min(1).max(255) }),
  z.object({ action: z.literal('assignLesson'), classId: z.string().min(1), lessonId: z.string().min(1) }),
  z.object({ action: z.literal('gradeResponse'), responseId: z.string().min(1), score: z.number().min(0), maxScore: z.number().positive(), feedback: z.string().max(5000) }),
  z.object({ action: z.literal('recordTopic11Exposure'), classId: z.string().min(1), studentId: z.string().min(1), submissionId: z.string().min(1) }).strict(),
]);
const topic11DecisionSchema = z.object({
  idempotency: z.enum(['new', 'replay', 'conflict']), exposureState: z.enum(['awaiting_teacher_exposure', 'introduced']),
  eligible: z.boolean(), reason: z.enum(['node_not_enabled', 'idempotency_conflict', 'teacher_led', 'awaiting_teacher_exposure', 'ungraded_evidence', 'eligible']), masteryBearing: z.boolean(),
}).strict();
const topic11TeacherResultSchema = z.union([
  z.object({ persisted: z.boolean(), masteryApplied: z.literal(false), kstApplied: z.literal(false), delivery: z.enum(['new', 'replay']), decision: topic11DecisionSchema }).strict(),
  z.object({ accepted: z.literal(false), reason: z.literal('submission_not_found') }).strict(),
]).refine((result) => 'accepted' in result || (
  result.decision.exposureState === 'introduced'
  && result.decision.eligible === false
  && result.decision.reason === 'teacher_led'
  && result.decision.masteryBearing === false
  && result.decision.idempotency === result.delivery
  && result.persisted === (result.delivery === 'new')
), 'Invalid Topic 1.1 teacher result');
export async function POST(request: Request) {
  const claims = await requireTeacherRequestClaims(request);
  if (claims instanceof Response) return claims;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  const requestData = parsed.data;
  try {
    if (requestData.action === 'recordTopic11Exposure') {
      const result = await fetchInternalMutation(internal.learningEvidence.submitTopic11TeacherSubmission, { teacherId: claims.sub, learnerId: requestData.studentId, classId: requestData.classId, submissionId: requestData.submissionId });
      const safeResult = topic11TeacherResultSchema.safeParse(result);
      if (!safeResult.success || 'accepted' in safeResult.data) throw new Error('Invalid Topic 1.1 exposure');
      return NextResponse.json({ delivery: safeResult.data.delivery });
    }
    const { action, ...args } = requestData;
    await fetchInternalMutation(internal.course[action], { ...args, teacherId: claims.sub });
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: 'Could not complete this action. Check the selected class, student, and lesson.' }, { status: 400 }); }
}
