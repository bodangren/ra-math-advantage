import { NextResponse } from "next/server";
import { applyAdminChange, readAdminChange } from "@/lib/foundation/admin-route";

export async function POST(request: Request) {
  const prepared = await readAdminChange(request);
  if (prepared instanceof Response) return prepared;
  if (
    prepared.change.kind &&
    !["coach_assignment.assign", "coach_assignment.revoke"].includes(prepared.change.kind)
  ) {
    return NextResponse.json({ error: "Unsupported coach action" }, { status: 400 });
  }
  const coachAccountId = prepared.change.coachAccountId;
  delete prepared.change.coachAccountId;
  prepared.change = {
    ...prepared.change,
    kind: prepared.change.kind || "coach_assignment.assign",
    accountId: prepared.change.accountId ?? coachAccountId,
  };
  const result = await applyAdminChange(prepared);
  if (result instanceof Response) return result;
  return NextResponse.json({ ok: true, targetId: result.targetId });
}

export async function PATCH(request: Request) {
  return POST(request);
}
