import { notFound } from 'next/navigation';

import { LearnTechniqueView } from '@/components/learn-technique-view';
import { SiteHeader } from '@/components/site-header';
import { requireDanielsonSession } from '@/lib/auth/server';
import { getLearnTechnique, getLearnTechniqueNavigation } from '@/lib/learn/catalog';

export default async function LearnTechniquePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const path = `/learn/${encodeURIComponent(slug)}`;
  const { account } = await requireDanielsonSession(path);
  const technique = getLearnTechnique(slug);
  if (!technique) notFound();
  const roles = account.danielsonRoles as string[];
  const canObserve = roles.some((role) => ['hod', 'coach', 'school_head', 'slt'].includes(role));
  const isTeacher = roles.includes('teacher');
  return (
    <>
      <SiteHeader
        isAuthenticated
        showAdministration={roles.includes('sysadmin')}
        showObservations={canObserve}
        showMyObservations={isTeacher}
        showReports={canObserve}
        showMyReport={isTeacher}
        showImprovementPlans={canObserve}
      />
      <main id="main-content" className="page-shell learn-page-shell">
        <LearnTechniqueView
          technique={technique}
          navigation={getLearnTechniqueNavigation(technique.id)}
        />
      </main>
    </>
  );
}
