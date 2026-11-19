import { NextResponse } from "next/server";
import { requireActiveRequestSessionClaims } from "@/lib/auth/server";
import { fetchInternalQuery, fetchInternalMutation, internal } from "@/lib/convex/server";
import type { Id } from "@/convex/_generated/dataModel";
import type { FunctionArgs } from "convex/server";

const reads = {
  getStudyPreferences: internal.study.getStudyPreferences,
  getTermMasteryByUnit: internal.study.getTermMasteryByUnit,
  getDueTerms: internal.study.getDueTerms,
  getRecentSessions: internal.study.getRecentSessions,
  getExportData: internal.study.getExportData,
  getPracticeTestResults: internal.study.getPracticeTestResults,
};
const writes = {
  updatePreferences: internal.study.updatePreferences,
  processReview: internal.study.processReview,
  recordSession: internal.study.recordSession,
  savePracticeTestResult: internal.study.savePracticeTestResult,
};

/** Run a study operation for the current account. Convex validates operation arguments. */
async function handle(request: Request) {
  const claims = await requireActiveRequestSessionClaims(request);
  if (claims instanceof Response) return claims;
  try {
    const body =
      request.method === "GET"
        ? JSON.parse(new URL(request.url).searchParams.get("request") ?? "{}")
        : await request.json();
    if (
      !body ||
      typeof body.operation !== "string" ||
      !body.args ||
      typeof body.args !== "object" ||
      Array.isArray(body.args)
    ) {
      return NextResponse.json({ error: "Invalid study request." }, { status: 400 });
    }
    const args = { ...body.args, userId: claims.sub as Id<"profiles"> };
    let result;
    if (request.method === "GET" && Object.hasOwn(reads, body.operation)) {
      const operation = reads[body.operation as keyof typeof reads];
      result = await fetchInternalQuery(operation, args as FunctionArgs<typeof operation>);
    } else if (request.method === "POST" && Object.hasOwn(writes, body.operation)) {
      const operation = writes[body.operation as keyof typeof writes];
      result = await fetchInternalMutation(operation, args as FunctionArgs<typeof operation>);
    } else return NextResponse.json({ error: "Unknown study operation." }, { status: 400 });
    return NextResponse.json(result, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("Study request failed", error);
    return NextResponse.json({ error: "Unable to process the study request." }, { status: 400 });
  }
}
export const GET = handle;
export const POST = handle;
