import { NextResponse } from "next/server";
import { applyAdminChange, readAdminChange } from "@/lib/foundation/admin-route";

export async function POST(request: Request) {
  const prepared = await readAdminChange(request);
  if (prepared instanceof Response) return prepared;
  if (!prepared.change.kind) prepared.change.kind = "department.create";
  const allowed = new Set([
    "department.create",
    "department.update",
    "department.activate",
    "department.deactivate",
    "department_membership.assign",
    "department_membership.revoke",
    "hod_assignment.assign",
    "hod_assignment.revoke",
  ]);
  if (!allowed.has(prepared.change.kind))
    return NextResponse.json({ error: "Unsupported department action" }, { status: 400 });
  const result = await applyAdminChange(prepared);
  if (result instanceof Response) return result;
  return NextResponse.json({ ok: true, targetId: result.targetId });
}

export async function PATCH(request: Request) {
  return POST(request);
}
