import { NextResponse } from 'next/server';
import { requireDanielsonApiSession } from '@/lib/auth/server';
import { fetchInternalQuery, internal } from '@/lib/convex/server';

export async function GET(request: Request) {
  const claimsOrResponse = await requireDanielsonApiSession(request);
  if (claimsOrResponse instanceof Response) return claimsOrResponse;
  const account = await fetchInternalQuery(internal.auth.getAccountById, { accountId: claimsOrResponse.sub });
  if (!account) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const context = await fetchInternalQuery(internal.foundation.resolveAccessContext, { actorAccountId: claimsOrResponse.sub });
  if (!context.roleAssignments.some((assignment: { role: string }) => assignment.role === 'sysadmin')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const cursor = new URL(request.url).searchParams.get('cursor');
  const events = await fetchInternalQuery(internal.foundation.listAccessAuditEvents, {
    organizationId: account.organizationId,
    paginationOpts: { numItems: 100, cursor },
  });
  return NextResponse.json(events);
}
