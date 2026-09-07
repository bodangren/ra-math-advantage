import { redirect } from 'next/navigation';
import { requireDanielsonSession } from '@/lib/auth/server';
import { fetchInternalQuery, internal } from '@/lib/convex/server';

export type AdministrationDirectory = {
  actorAccountId?: string;
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
  coachCursor?: string | null;
  teacherCursor?: string | null;
};

export type CoachAssignmentDirectory = {
  coachPage: AdministrationDirectory['accountPage'];
  teacherPage: AdministrationDirectory['accountPage'];
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
  if (cursors.coachCursor) parameters.set('coachCursor', cursors.coachCursor);
  if (cursors.teacherCursor) parameters.set('teacherCursor', cursors.teacherCursor);
  const query = parameters.toString();
  return query ? `${path}?${query}` : path;
}

export async function getCoachAssignmentDirectory(
  path: string,
  cursors: Pick<AdministrationDirectoryCursors, 'coachCursor' | 'teacherCursor'> = {},
): Promise<CoachAssignmentDirectory> {
  const session = await requireSysadminPage(path);
  const [coachResult, teacherResult] = await Promise.all([
    fetchInternalQuery(internal.foundation.listAdministrationAccounts, {
      actorAccountId: session.claims.sub,
      paginationOpts: { cursor: cursors.coachCursor ?? null, numItems: 100 },
    }),
    fetchInternalQuery(internal.foundation.listAdministrationAccounts, {
      actorAccountId: session.claims.sub,
      paginationOpts: { cursor: cursors.teacherCursor ?? null, numItems: 100 },
    }),
  ]);
  if (coachResult.kind !== 'allowed' || teacherResult.kind !== 'allowed') {
    redirect('/unauthorized');
  }
  return {
    coachPage: coachResult.accountPage,
    teacherPage: teacherResult.accountPage,
  };
}

export async function getAdministrationDirectory(
  path: string,
  cursors: AdministrationDirectoryCursors = {},
): Promise<AdministrationDirectory> {
  const session = await requireSysadminPage(path);
  const [accountResult, departmentResult] = await Promise.all([
    fetchInternalQuery(internal.foundation.listAdministrationAccounts, {
      actorAccountId: session.claims.sub,
      paginationOpts: { cursor: cursors.accountCursor ?? null, numItems: 100 },
    }),
    fetchInternalQuery(internal.foundation.listAdministrationDepartments, {
      actorAccountId: session.claims.sub,
      paginationOpts: { cursor: cursors.departmentCursor ?? null, numItems: 100 },
    }),
  ]);
  if (accountResult.kind !== 'allowed' || departmentResult.kind !== 'allowed') {
    redirect('/unauthorized');
  }
  return {
    actorAccountId: session.claims.sub,
    accountPage: accountResult.accountPage,
    departmentPage: departmentResult.departmentPage,
  };
}
