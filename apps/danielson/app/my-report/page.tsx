import { SiteHeader } from '@/components/site-header';
import { TeacherReportView } from '@/components/teacher-report-view';
import { getMyTeacherReport } from '@/lib/reporting/reporting-page';

export default async function MyReportPage() {
  const { session, report } = await getMyTeacherReport();
  const roles = session.account.danielsonRoles as string[];
  const canReport = roles.some((role) => ['hod', 'coach', 'school_head', 'slt'].includes(role));
  return (
    <>
      <SiteHeader isAuthenticated showReports={canReport} showMyReport />
      <main id="main-content" className="page-shell report-stack">
        <p className="eyebrow">Teacher report</p>
        <h1>My Danielson report</h1>
        <p className="lede">Review published results, public comments, and your optional final responses.</p>
        <TeacherReportView report={report} canComment={false} canRespond />
      </main>
    </>
  );
}
