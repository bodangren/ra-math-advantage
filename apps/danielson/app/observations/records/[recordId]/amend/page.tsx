import { redirect } from 'next/navigation';

import { ObservationAmendmentForm } from '@/components/observation-amendment-form';
import { SiteHeader } from '@/components/site-header';
import {
  canAmendPublishedObservation,
  getPublishedObservationPage,
} from '@/lib/observations/observation-page';
import { buildDanielsonGraph } from '@/lib/proficiency/graph';

export default async function AmendObservationPage({
  params,
}: {
  params: Promise<{ recordId: string }>;
}) {
  const { recordId } = await params;
  const result = await getPublishedObservationPage(
    `/observations/records/${encodeURIComponent(recordId)}/amend`,
    recordId,
  );
  const roles = result.session.account.danielsonRoles as string[];
  const titleById = new Map(buildDanielsonGraph().graph.nodes.map((node) => [node.id, node.title]));
  const record = result.record as {
    observationType: string;
    items: Array<{ itemId: string; componentId: string; skillId?: string; evidenceNote: string | null }>;
  };
  if (!canAmendPublishedObservation(roles, record.observationType, result.isSelf)) {
    redirect('/unauthorized');
  }
  return (
    <>
      <SiteHeader isAuthenticated showObservations />
      <main id="main-content" className="page-shell">
        <p className="eyebrow">Observation amendment</p>
        <h1>Correct the published record</h1>
        <p className="lede">The original record stays unchanged. Give a reason and select only the fields that must change.</p>
        <ObservationAmendmentForm
          observationId={recordId}
          expectedVersion={result.amendmentCount}
          items={record.items.map((item) => ({
            itemId: item.itemId,
            label: (item.skillId ? titleById.get(item.skillId) : titleById.get(item.componentId)) ?? item.itemId,
            evidenceNote: item.evidenceNote,
          }))}
        />
      </main>
    </>
  );
}
