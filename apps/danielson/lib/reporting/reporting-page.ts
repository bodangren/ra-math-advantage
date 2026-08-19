import { redirect } from 'next/navigation';

import { requireDanielsonSession } from '@/lib/auth/server';
import { fetchInternalQuery, internal } from '@/lib/convex/server';
import type {
  PrivateTeacherReport,
  PublicTeacherReport,
  ReportingPortfolioPage,
} from '@/lib/reporting/contracts';

export async function getLeadershipPortfolio(cursor: string | null) {
  const session = await requireDanielsonSession('/reports');
  const result = await fetchInternalQuery(internal.reporting.readLeadershipPortfolio, {
    actorAccountId: session.claims.sub,
    now: new Date().toISOString(),
    cursor,
    pageSize: 25,
  });
  if (result.kind === 'portfolio_capacity_exceeded') {
    throw new Error('The reporting portfolio exceeded its safe capacity.');
  }
  if (result.kind === 'invalid_cursor') redirect('/reports');
  if (result.kind !== 'allowed') redirect('/unauthorized');
  return { session, page: result.page as ReportingPortfolioPage };
}

export async function getLeadershipTeacherReport(teacherProfileId: string) {
  const path = `/reports/teachers/${encodeURIComponent(teacherProfileId)}`;
  const session = await requireDanielsonSession(path);
  const result = await fetchInternalQuery(internal.reporting.readLeadershipTeacherReport, {
    actorAccountId: session.claims.sub,
    teacherProfileId,
    now: new Date().toISOString(),
  });
  if (result.kind === 'teacher_report_capacity_exceeded') {
    throw new Error('The teacher report exceeded its safe capacity.');
  }
  if (result.kind !== 'allowed') redirect('/unauthorized');
  return {
    session,
    visibility: result.visibility as 'public' | 'private',
    report: result.report as PublicTeacherReport | PrivateTeacherReport,
  };
}

export async function getMyTeacherReport() {
  const session = await requireDanielsonSession('/my-report');
  const result = await fetchInternalQuery(internal.reporting.readMyTeacherReport, {
    actorAccountId: session.claims.sub,
    now: new Date().toISOString(),
  });
  if (result.kind === 'teacher_report_capacity_exceeded') {
    throw new Error('The teacher report exceeded its safe capacity.');
  }
  if (result.kind !== 'allowed') redirect('/unauthorized');
  return { session, report: result.report as PublicTeacherReport };
}
