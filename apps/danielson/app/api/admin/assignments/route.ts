import { NextResponse } from 'next/server';
import { applyAdminChange, readAdminChange } from '@/lib/foundation/admin-route';

const ALLOWED_ACTIONS = new Set([
  'role.assign', 'role.revoke',
  'department_membership.assign', 'department_membership.revoke',
  'hod_assignment.assign', 'hod_assignment.revoke',
  'coach_assignment.assign', 'coach_assignment.revoke',
]);

export async function POST(request: Request) {
  const prepared = await readAdminChange(request);
  if (prepared instanceof Response) return prepared;
  if (!ALLOWED_ACTIONS.has(prepared.change.kind)) return NextResponse.json({ error: 'Unsupported assignment action' }, { status: 400 });
  const result = await applyAdminChange(prepared);
  if (result instanceof Response) return result;
  return NextResponse.json({ ok: true, targetId: result.targetId });
}

export async function PATCH(request: Request) {
  return POST(request);
}
