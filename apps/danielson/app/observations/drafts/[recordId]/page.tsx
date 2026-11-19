import { ObservationDraftClient } from "@/components/observation-draft-client";
import { SiteHeader } from "@/components/site-header";
import { getObservationDraftPage } from "@/lib/observations/observation-page";

export default async function ObservationDraftPage({
  params,
}: {
  params: Promise<{ recordId: string }>;
}) {
  const { recordId } = await params;
  const { draft } = await getObservationDraftPage(
    `/observations/drafts/${encodeURIComponent(recordId)}`,
    recordId,
  );
  return (
    <>
      <SiteHeader isAuthenticated showObservations />
      <main id="main-content" className="page-shell">
        <ObservationDraftClient draft={draft} />
      </main>
    </>
  );
}
