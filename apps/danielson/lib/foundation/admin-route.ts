import { requireDanielsonApiSession } from '@/lib/auth/server';
import { fetchInternalMutation, fetchInternalQuery, internal } from '@/lib/convex/server';

export type FoundationChange = {
  kind: string;
  [key: string]: unknown;
};

type AdminResult = { kind: 'allowed' | 'applied'; targetId?: string; [key: string]: unknown };

export async function readAdminChange(request: Request): Promise<{ claims: Extract<Awaited<ReturnType<typeof requireDanielsonApiSession>>, { sub: string }>; change: FoundationChange } | Response> {
  const claimsOrResponse = await requireDanielsonApiSession(request);
  if (claimsOrResponse instanceof Response) return claimsOrResponse;
  let body: Record<string, unknown>;
  try {
    if (request.headers.get('content-type')?.includes('application/json')) {
      const value: unknown = await request.json();
      body = value && typeof value === 'object' ? value as Record<string, unknown> : {};
    } else {
      const form = await request.formData();
      body = Object.fromEntries(form.entries());
    }
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), { status: 400 });
  }
  const change = Object.fromEntries(
    Object.entries(body).filter(([, value]) => typeof value !== 'string' || value.trim() !== ''),
  ) as FoundationChange;
  delete change.requestId;
  delete change.organizationId;
  delete (change as Record<string, unknown>).actorAccountId;
  return { claims: claimsOrResponse, change };
}

export async function applyAdminChange(prepared: Awaited<ReturnType<typeof readAdminChange>>): Promise<AdminResult | Response> {
  if (prepared instanceof Response) return prepared;
  const account = await fetchInternalQuery(internal.auth.getAccountById, {
    accountId: prepared.claims.sub,
  });
  if (!account?.isActive) {
    return new Response(JSON.stringify({ error: 'account_inactive' }), { status: 401 });
  }
  const result = await fetchInternalMutation(internal.foundation.applyAdministrationChange, {
    actorAccountId: account.accountId,
    organizationId: account.organizationId,
    change: prepared.change,
  });
  if (typeof result === 'object' && result !== null && 'kind' in result && (result.kind === 'allowed' || result.kind === 'applied')) {
    return result as AdminResult;
  }
  const deniedResult = result as { reason?: string };
  const status = deniedResult.reason === 'capability_not_granted' ? 403 : 400;
  return new Response(JSON.stringify({ error: deniedResult.reason ?? 'Administration change failed' }), { status });
}
