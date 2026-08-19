import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { getAdministrationDirectory } from '@/lib/foundation/admin-page';
import { AdminChangeForm } from '@/components/admin-change-form';

export default async function CoachesPage() {
  const directory = await getAdministrationDirectory('/admin/coaches');
  const accountOptions = directory.accounts.map((account) => ({
    value: account.accountId,
    label: `${account.displayName} (${account.username})`,
  }));
  const teacherOptions = directory.accounts.filter((account) => account.isTeacher).map((account) => ({
    value: account.accountId,
    label: `${account.displayName} (${account.username})`,
  }));
  return (
    <>
      <SiteHeader isAuthenticated showAdministration />
      <main id="main-content" className="page-shell">
        <p className="eyebrow">Administration / coaches</p>
        <h1>Coach assignments</h1>
        <p className="lede">Assign a coach account to a teacher account. Both accounts must be active members of this organization.</p>
        <div className="card narrow">
          <AdminChangeForm endpoint="/api/admin/coaches" title="Manage coach assignment" submitLabel="Save assignment" fields={[
            { name: 'kind', label: 'Action', type: 'select', required: true, options: [{ value: 'coach_assignment.assign', label: 'Assign coach' }, { value: 'coach_assignment.revoke', label: 'Revoke coach' }] },
            { name: 'coachAccountId', label: 'Coach account', type: 'select', required: true, options: accountOptions },
            { name: 'teacherAccountId', label: 'Teacher', type: 'select', required: true, options: teacherOptions },
          ]} />
        </div>
        <p><Link href="/admin">Back to administration</Link></p>
      </main>
    </>
  );
}
