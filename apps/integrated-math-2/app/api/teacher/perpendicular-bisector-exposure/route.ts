import { NextResponse } from "next/server";
import { requireRequestSessionClaims } from "@/lib/auth/server";
import type { Id } from "@/convex/_generated/dataModel";
import { fetchInternalMutation, internal } from "@/lib/convex/server";
import { z } from "zod";

const bodySchema = z.object({
  studentId: z.string().trim().min(1),
  classId: z.string().trim().min(1),
  submissionId: z.string().trim().min(1),
}).strict();

export async function POST(request: Request) {
  const claims = await requireRequestSessionClaims(request); if (claims instanceof Response) return claims;
  if (claims.role !== "teacher") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const key = request.headers.get("Idempotency-Key")?.trim(); if (!key || key.length > 80) return NextResponse.json({ error: "Idempotency-Key is required" }, { status: 400 });
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid exposure" }, { status: 400 });
  const body = parsed.data;
  try { return NextResponse.json(await fetchInternalMutation(internal.activities.recordTeacherPerpendicularBisectorExposure, { teacherId: claims.sub as Id<"profiles">, studentId: body.studentId as Id<"profiles">, classId: body.classId as Id<"classes">, submissionId: body.submissionId as Id<"activity_submissions">, idempotencyKey: key })); }
  catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("idempotency_conflict")) return NextResponse.json({ error: "This teacher action conflicts with the saved action." }, { status: 409 });
    if (message.includes("unauthorized_exposure")) return NextResponse.json({ error: "Teacher access is required." }, { status: 403 });
    if (message.includes("unpublished_curriculum") || message.includes("invalid_exposure") || message.includes("invalid_source_submission") || message.includes("invalid_source_assignment")) return NextResponse.json({ error: "This teacher action is not available." }, { status: 400 });
    return NextResponse.json({ error: "Unable to record exposure. Try again." }, { status: 503 });
  }
}
