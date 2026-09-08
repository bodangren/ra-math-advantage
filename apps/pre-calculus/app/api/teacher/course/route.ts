import { NextResponse } from "next/server";
import { z } from "zod";
import { requireTeacherRequestClaims } from "@/lib/auth/server";
import { fetchInternalMutation, internal } from "@/lib/convex/server";

const requestSchema = z.object({ action: z.literal("recordTopic11Exposure"), classId: z.string().min(1), studentId: z.string().min(1), submissionId: z.string().min(1) }).strict();
const decisionSchema = z.object({ idempotency: z.enum(["new", "replay", "conflict"]), exposureState: z.enum(["awaiting_teacher_exposure", "introduced"]), eligible: z.boolean(), reason: z.enum(["node_not_enabled", "idempotency_conflict", "teacher_led", "awaiting_teacher_exposure", "ungraded_evidence", "eligible"]), masteryBearing: z.boolean() }).strict();
const resultSchema = z.object({ persisted: z.boolean(), masteryApplied: z.literal(false), kstApplied: z.literal(false), delivery: z.enum(["new", "replay"]), decision: decisionSchema }).strict().refine((result) => result.decision.exposureState === "introduced" && result.decision.eligible === false && result.decision.reason === "teacher_led" && result.decision.masteryBearing === false && result.decision.idempotency === result.delivery && result.persisted === (result.delivery === "new"), "Invalid Topic 1.1 teacher result");

export async function POST(request: Request) {
  const claims = await requireTeacherRequestClaims(request);
  if (claims instanceof Response) return claims;
  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  try {
    const result = await fetchInternalMutation(internal.selectedLearningEvidence.submitTopic11TeacherSubmission, { teacherId: claims.sub, learnerId: parsed.data.studentId, classId: parsed.data.classId, submissionId: parsed.data.submissionId });
    const safeResult = resultSchema.safeParse(result);
    if (!safeResult.success) throw new Error("Invalid Topic 1.1 exposure");
    return NextResponse.json({ delivery: safeResult.data.delivery });
  } catch {
    return NextResponse.json({ error: "Could not complete this action. Check the selected class, student, and lesson." }, { status: 400 });
  }
}
