import { redirect } from 'next/navigation';
import { requireDanielsonSession } from '@/lib/auth/server';
import { fetchInternalQuery, internal } from '@/lib/convex/server';

export type AdministrationDirectory = {
  accounts: Array<{
    accountId: string;
    username: string;
    displayName: string;
    isActive: boolean;
    isTeacher: boolean;
    roles: string[];
  }>;
  departments: Array<{
    departmentId: string;
    key: string;
    name: string;
    isActive: boolean;
  }>;
};

export async function requireSysadminPage(path: string) {
  const session = await requireDanielsonSession(path);
  if (!session.account.danielsonRoles.includes('sysadmin')) redirect('/unauthorized');
  return session;
}

export async function getAdministrationDirectory(path: string): Promise<AdministrationDirectory> {
  const session = await requireSysadminPage(path);
  const result = await fetchInternalQuery(internal.foundation.listAdministrationDirectory, {
    actorAccountId: session.claims.sub,
  });
  if (result.kind !== 'allowed') redirect('/unauthorized');
  return result;
}
