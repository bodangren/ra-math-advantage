import Link from 'next/link';

import { SiteHeader } from '@/components/site-header';
import { getMyPublishedObservations } from '@/lib/observations/observation-page';

export default async function MyObservationsPage({
  searchParams,
}: {
  searchParams: Promise<{ cursor?: string }>;
}) {
  const parameters = await searchParams;
  const { page } = await getMyPublishedObservations('/my-observations', parameters.cursor ?? null);
  return (
    <>
      <SiteHeader isAuthenticated showMyObservations />
      <main id="main-content" className="page-shell narrow">
        <p className="eyebrow">Teacher record</p>
        <h1>My published observations</h1>
        <p className="lede">Open a record to see its current published outcome and evidence notes.</p>
        <ul className="record-list">
          {page.page.map((record: { observationId: string; observationType: string; observedAt: string; observerDisplayName: string }) => (
            <li className="card" key={record.observationId}>
              <Link href={`/observations/records/${encodeURIComponent(record.observationId)}`}>
                {record.observationType.replaceAll('_', ' ')} — {new Date(record.observedAt).toLocaleString()}
              </Link>
              <p>Observer: {record.observerDisplayName}</p>
            </li>
          ))}
        </ul>
        {page.page.length === 0 ? <p className="card">No observation has been published yet.</p> : null}
        {!page.isDone ? <Link href={`/my-observations?cursor=${encodeURIComponent(page.continueCursor)}`}>Next page</Link> : null}
      </main>
    </>
  );
}
