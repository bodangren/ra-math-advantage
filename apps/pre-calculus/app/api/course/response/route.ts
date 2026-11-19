import { NextResponse } from "next/server";
import { requireStudentRequestClaims } from "@/lib/auth/server";
import { fetchInternalMutation, internal } from "@/lib/convex/server";
export async function POST(request: Request) {
  const claims = await requireStudentRequestClaims(request);
  if (claims instanceof Response) return claims;
  const body = await request.json().catch(() => null);
  if (
    typeof body?.phaseId !== "string" ||
    typeof body?.response !== "string" ||
    !body.response.trim() ||
    body.response.length > 10000
  )
    return NextResponse.json({ error: "Invalid response" }, { status: 400 });
  try {
    const id = await fetchInternalMutation(internal.course.saveResponse, {
      learnerId: claims.sub,
      phaseId: body.phaseId,
      response: body.response,
    });
    return NextResponse.json({ id });
  } catch {
    return NextResponse.json({ error: "Could not save response" }, { status: 400 });
  }
}
