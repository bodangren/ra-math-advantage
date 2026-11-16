import { NextResponse } from "next/server";
import { requireRequestSessionClaims } from "@/lib/auth/server";
import { fetchInternalMutation, internal } from "@/lib/convex/server";

export async function POST(request: Request) {
  const claims = await requireRequestSessionClaims(request);
  if (claims instanceof Response) return claims;
  if (claims.role !== "teacher") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const key = request.headers.get("Idempotency-Key")?.trim();
  if (!key) return NextResponse.json({ error: "Idempotency-Key is required" }, { status: 400 });
  const body = await request.json().catch(() => null) as { studentId?: unknown; classId?: unknown; submissionId?: unknown } | null;
  if (!body || typeof body.studentId !== "string" || typeof body.classId !== "string" || typeof body.submissionId !== "string") return NextResponse.json({ error: "Invalid exposure" }, { status: 400 });
  try {
    const result = await fetchInternalMutation(internal.activities.recordTeacherTranslationExposure, { teacherId: claims.sub, studentId: body.studentId, classId: body.classId, submissionId: body.submissionId, idempotencyKey: key });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error && error.message.includes("idempotency_conflict")) return NextResponse.json({ error: "Idempotency key conflict" }, { status: 409 });
    return NextResponse.json({ error: "Unable to record exposure" }, { status: 403 });
  }
}
