import { SiteHeader } from '@/components/site-header';
import { TeacherReportView } from '@/components/teacher-report-view';
import { getLeadershipTeacherReport } from '@/lib/reporting/reporting-page';

export default async function LeadershipTeacherReportPage({
  params,
  searchParams,
}: {
  params: Promise<{ teacherProfileId: string }>;
  searchParams: Promise<{
    historyCursor?: string;
    publicCommentCursor?: string;
    privateCommentCursor?: string;
  }>;
}) {
  const { teacherProfileId } = await params;
  const cursors = await searchParams;
  const { session, report, visibility, nextHrefs } = await getLeadershipTeacherReport(
    teacherProfileId,
    cursors,
  );
  const roles = session.account.danielsonRoles as string[];
  return (
    <>
      <SiteHeader isAuthenticated showReports showMyReport={roles.includes('teacher')} />
      <main id="main-content" className="page-shell report-stack">
        <p className="eyebrow">Leadership teacher report</p>
        <h1>{report.displayName}</h1>
        <p className="lede">Official evaluations stay separate from current proficiency evidence.</p>
        <TeacherReportView
          report={report}
          canComment={visibility === 'private'}
          canRespond={false}
          canAssignGbf={visibility === 'private' && (roles.includes('school_head') || roles.includes('slt'))}
          isSubjectTeacher={visibility !== 'private'}
          evidenceHistoryNextHref={nextHrefs.evidenceHistory}
          publicCommentsNextHref={nextHrefs.publicComments}
          privateCommentsNextHref={nextHrefs.privateComments}
        />
      </main>
    </>
  );
}
