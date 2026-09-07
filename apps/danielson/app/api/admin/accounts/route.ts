import { NextResponse } from 'next/server';
import {
  generatePasswordSalt,
  generateRandomPassword,
  hashPassword,
  PASSWORD_HASH_ITERATIONS,
} from '@/lib/auth/session';
import { applyAdminChange, readAdminChange } from '@/lib/foundation/admin-route';

export async function POST(request: Request) {
  const prepared = await readAdminChange(request);
  if (prepared instanceof Response) return prepared;
  if (prepared.change.kind && prepared.change.kind !== 'account.create') {
    return NextResponse.json({ error: 'Only account creation is allowed on this route' }, { status: 400 });
  }
  const temporaryPassword = generateRandomPassword(16);
  const salt = generatePasswordSalt();
  const passwordHash = await hashPassword(temporaryPassword, salt, PASSWORD_HASH_ITERATIONS);
  prepared.change = {
    ...prepared.change,
    kind: 'account.create',
    passwordHash,
    passwordSalt: salt,
    passwordHashIterations: PASSWORD_HASH_ITERATIONS,
    mustChangePassword: true,
  };
  const result = await applyAdminChange(prepared);
  if (result instanceof Response) return result;
  return NextResponse.json({ ok: true, temporaryPassword, targetId: result.targetId });
}

export async function PATCH(request: Request) {
  const prepared = await readAdminChange(request);
  if (prepared instanceof Response) return prepared;
  const allowed = new Set(['account.reset_password', 'account.update', 'account.activate', 'account.deactivate', 'role.assign', 'role.revoke']);
  if (!allowed.has(prepared.change.kind)) return NextResponse.json({ error: 'Unsupported account action' }, { status: 400 });
  let temporaryPassword: string | undefined;
  if (prepared.change.kind === 'account.reset_password') {
    temporaryPassword = generateRandomPassword(16);
    const salt = generatePasswordSalt();
    prepared.change = {
      ...prepared.change,
      passwordHash: await hashPassword(temporaryPassword, salt, PASSWORD_HASH_ITERATIONS),
      passwordSalt: salt, passwordHashIterations: PASSWORD_HASH_ITERATIONS,
    };
  }
  const result = await applyAdminChange(prepared);
  if (result instanceof Response) return result;
  return NextResponse.json({ ok: true, targetId: result.targetId, temporaryPassword });
}
