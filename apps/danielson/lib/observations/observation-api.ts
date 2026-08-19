import { NextResponse } from 'next/server';

type ObservationResult = { kind?: string; reason?: string; [key: string]: unknown };

/** Convert one internal observation result to a stable HTTP response. */
export function observationResultResponse(result: ObservationResult) {
  const success = new Set(['allowed', 'created', 'saved', 'discarded', 'submitted', 'replayed', 'amended']);
  if (result.kind && success.has(result.kind)) return NextResponse.json(result);
  if (result.kind === 'not_found') return NextResponse.json({ error: 'Observation not found' }, { status: 404 });
  if (result.kind === 'denied') {
    return NextResponse.json({ error: result.reason ?? 'Access denied' }, { status: 403 });
  }
  const conflicts = new Set([
    'revision_conflict',
    'version_conflict',
    'idempotency_conflict',
    'submitted_immutable',
    'formal_observation_exists',
  ]);
  if (result.kind && conflicts.has(result.kind)) {
    return NextResponse.json({ error: result.kind }, { status: 409 });
  }
  return NextResponse.json({ error: result.kind ?? 'Observation request failed' }, { status: 400 });
}

export async function safeObservationMutation(run: () => Promise<ObservationResult>) {
  try {
    return observationResultResponse(await run());
  } catch {
    return NextResponse.json({ error: 'Invalid observation request' }, { status: 400 });
  }
}
