import { LearnIndex } from "@/components/learn-index";
import { SiteHeader } from "@/components/site-header";
import { requireDanielsonSession } from "@/lib/auth/server";
import { LEARN_TECHNIQUES } from "@/lib/learn/catalog";

export default async function LearnPage() {
  const { account } = await requireDanielsonSession("/learn");
  const roles = account.danielsonRoles as string[];
  const canObserve = roles.some((role) => ["hod", "coach", "school_head", "slt"].includes(role));
  const isTeacher = roles.includes("teacher");
  return (
    <>
      <SiteHeader
        isAuthenticated
        showAdministration={roles.includes("sysadmin")}
        showObservations={canObserve}
        showMyObservations={isTeacher}
        showReports={canObserve}
        showMyReport={isTeacher}
        showImprovementPlans={canObserve}
      />
      <main id="main-content" className="page-shell learn-page-shell">
        <LearnIndex techniques={LEARN_TECHNIQUES} />
      </main>
    </>
  );
}
