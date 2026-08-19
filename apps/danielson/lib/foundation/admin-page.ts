import { redirect } from 'next/navigation';
import { requireDanielsonSession } from '@/lib/auth/server';
import { fetchInternalQuery, internal } from '@/lib/convex/server';

export type AdministrationDirectory = {
  accountPage: {
    items: Array<{
      accountId: string;
      username: string;
      displayName: string;
      isActive: boolean;
      isTeacher: boolean;
      roles: string[];
    }>;
    nextCursor: string | null;
  };
  departmentPage: {
    items: Array<{
      departmentId: string;
      key: string;
      name: string;
      isActive: boolean;
    }>;
    nextCursor: string | null;
  };
};

export type AdministrationDirectoryCursors = {
  accountCursor?: string | null;
  departmentCursor?: string | null;
};

export async function requireSysadminPage(path: string) {
  const session = await requireDanielsonSession(path);
  if (!session.account.danielsonRoles.includes('sysadmin')) redirect('/unauthorized');
  return session;
}

export function getDirectoryPageHref(path: string, cursors: AdministrationDirectoryCursors) {
  const parameters = new URLSearchParams();
  if (cursors.accountCursor) parameters.set('accountCursor', cursors.accountCursor);
  if (cursors.departmentCursor) parameters.set('departmentCursor', cursors.departmentCursor);
  const query = parameters.toString();
  return query ? `${path}?${query}` : path;
}

export async function getAdministrationDirectory(
  path: string,
  cursors: AdministrationDirectoryCursors = {},
): Promise<AdministrationDirectory> {
  const session = await requireSysadminPage(path);
  const result = await fetchInternalQuery(internal.foundation.listAdministrationDirectory, {
    actorAccountId: session.claims.sub,
    accountPaginationOpts: { cursor: cursors.accountCursor ?? null, numItems: 100 },
    departmentPaginationOpts: { cursor: cursors.departmentCursor ?? null, numItems: 100 },
  });
  if (result.kind !== 'allowed') redirect('/unauthorized');
  return result;
}
