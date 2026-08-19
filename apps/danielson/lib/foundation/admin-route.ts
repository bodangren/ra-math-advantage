import { requireDanielsonApiSession } from '@/lib/auth/server';
import { createDanielsonConvexRepository } from './convex-repository';
import { createDanielsonFoundationService, type FoundationChange } from './server-access';

type AdminResult = { kind: 'allowed' | 'applied'; targetId?: string; [key: string]: unknown };

export async function readAdminChange(request: Request): Promise<{ claims: Extract<Awaited<ReturnType<typeof requireDanielsonApiSession>>, { sub: string }>; requestId: string; change: FoundationChange } | Response> {
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
  const requestId = typeof body.requestId === 'string' ? body.requestId.trim() : '';
  if (!requestId || requestId.length > 128) {
    return new Response(JSON.stringify({ error: 'A valid request ID is required' }), { status: 400 });
  }
  const change = Object.fromEntries(
    Object.entries(body).filter(([, value]) => typeof value !== 'string' || value.trim() !== ''),
  ) as FoundationChange;
  delete change.requestId;
  delete change.organizationId;
  delete (change as Record<string, unknown>).actorAccountId;
  return { claims: claimsOrResponse, requestId, change };
}

export async function applyAdminChange(prepared: Awaited<ReturnType<typeof readAdminChange>>): Promise<AdminResult | Response> {
  if (prepared instanceof Response) return prepared;
  const service = createDanielsonFoundationService(createDanielsonConvexRepository());
  const result = await service.applyAdministrationChange({
    sessionToken: prepared.claims.sub,
    requestId: prepared.requestId,
    change: prepared.change,
  });
  if (typeof result === 'object' && result !== null && 'kind' in result && (result.kind === 'allowed' || result.kind === 'applied')) {
    return result as AdminResult;
  }
  const deniedResult = result as { reason?: string };
  const status = deniedResult.reason === 'capability_not_granted' ? 403 : deniedResult.reason === 'duplicate_request' ? 409 : 400;
  return new Response(JSON.stringify({ error: deniedResult.reason ?? 'Administration change failed' }), { status });
}
