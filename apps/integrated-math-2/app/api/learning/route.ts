import { NextResponse } from "next/server";
import { z } from "zod";
import { ConvexError } from "convex/values";
import { requireRequestSessionClaims } from "@/lib/auth/server";
import { fetchInternalMutation, internal } from "@/lib/convex/server";
import type { Id } from "@/convex/_generated/dataModel";
const input = z.discriminatedUnion("operation", [
  z.object({
    operation: z.literal("complete"),
    phaseId: z.string().min(1).max(100),
  }),
  z.object({
    operation: z.literal("submit"),
    phaseId: z.string().min(1).max(100),
    activityId: z.string().min(1).max(100),
    answer: z.string().max(128),
    submissionKey: z.string().min(1).max(80),
  }),
]);
export async function POST(request: Request) {
  const claims = await requireRequestSessionClaims(request);
  if (claims instanceof Response) return claims;
  if (claims.role !== "student")
    return NextResponse.json(
      { error: "Student access is required." },
      { status: 403 },
    );
  const parsed = input.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json(
      { error: "Check the submitted answer." },
      { status: 400 },
    );
  const args = {
    userId: claims.sub as Id<"profiles">,
    phaseId: parsed.data.phaseId as Id<"phase_versions">,
  };
  try {
    if (parsed.data.operation === "complete") {
      await fetchInternalMutation(internal.learning.completePhase, args);
      return NextResponse.json({ success: true });
    }
    return NextResponse.json(
      await fetchInternalMutation(internal.learning.submitAnswer, {
        ...args,
        activityId: parsed.data.activityId as Id<"activities">,
        answer: parsed.data.answer,
        submissionKey: parsed.data.submissionKey,
      }),
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof ConvexError
            ? "Complete the required work before you continue."
            : "Could not save your work. Try again.",
      },
      { status: error instanceof ConvexError ? 400 : 503 },
    );
  }
}
