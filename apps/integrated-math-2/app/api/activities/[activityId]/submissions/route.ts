import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRequestSessionClaims } from "@/lib/auth/server";
import { fetchInternalMutation, internal } from "@/lib/convex/server";
import type { Id } from "@/convex/_generated/dataModel";

const bodySchema = z.object({ rawResponse: z.string().max(128), hintsUsed: z.number().int().nonnegative(), revealStepsSeen: z.number().int().nonnegative() }).strict();
export async function POST(request: Request, context: { params: Promise<{ activityId: string }> }) {
  const claims = await requireRequestSessionClaims(request);
  if (claims instanceof Response) return claims;
  if (claims.role !== "student") return NextResponse.json({ error: "Student access is required." }, { status: 403 });
  const key = request.headers.get("Idempotency-Key")?.trim();
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!key || key.length > 80 || !parsed.success) return NextResponse.json({ error: "Check the submitted answer." }, { status: 400 });
  const { activityId } = await context.params;
  try {
    return NextResponse.json(await fetchInternalMutation(internal.activities.submitPerpendicularBisectorPilot, { userId: claims.sub as Id<"profiles">, activityId: activityId as Id<"activities">, idempotencyKey: key, ...parsed.data }));
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("idempotency_conflict")) return NextResponse.json({ error: "This attempt conflicts with the saved response." }, { status: 409 });
    if (message.includes("inactive_student")) return NextResponse.json({ error: "Student access is required." }, { status: 403 });
    if (message.includes("unpublished_curriculum") || message.includes("unsupported_activity") || message.includes("invalid_submission")) return NextResponse.json({ error: "This activity is not available." }, { status: 400 });
    return NextResponse.json({ error: "Could not save your work. Try again." }, { status: 503 });
  }
}
