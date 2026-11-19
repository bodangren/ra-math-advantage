import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { CoachingForm } from "@/components/coaching-form";
import { requireDanielsonSession } from "@/lib/auth/server";
import { fetchInternalQuery, internal } from "@/lib/convex/server";
import { buildDanielsonGraph } from "@/lib/proficiency/graph";
import type { CoachingCycle, CoachingEvidence } from "@/lib/coaching/contracts";

export default async function CoachingPage({
  params,
  searchParams,
}: {
  params: Promise<{ teacherProfileId: string }>;
  searchParams: Promise<{ cursor?: string; evidenceCursor?: string }>;
}) {
  const { teacherProfileId } = await params;
  const cursors = await searchParams;
  const path = `/coaching/${encodeURIComponent(teacherProfileId)}`;
  const session = await requireDanielsonSession(path);
  const result = await fetchInternalQuery(internal.coaching.readCycles, {
    actorAccountId: session.claims.sub,
    teacherProfileId,
    cursor: cursors.cursor ?? null,
  });
  if (result.kind !== "allowed") redirect("/unauthorized");
  const history = await fetchInternalQuery(
    result.isSelf
      ? internal.reporting.listMyEvidenceHistory
      : internal.reporting.listLeadershipEvidenceHistory,
    {
      actorAccountId: session.claims.sub,
      ...(!result.isSelf ? { teacherProfileId } : {}),
      paginationOpts: { cursor: cursors.evidenceCursor ?? null, numItems: 20 },
    },
  );
  if (history.kind !== "allowed") throw new Error("Coaching evidence is not available.");
  const cycles = result.page.page as CoachingCycle[];
  const evidence = history.page.page as CoachingEvidence[];
  const skills = buildDanielsonGraph()
    .graph.nodes.filter((n) => n.kind === "skill")
    .map((n) => ({ id: n.id, title: n.title }));
  const ids = [
    ...new Set(
      cycles.flatMap((c) => [
        c.baselineObservationId,
        ...(c.followUpObservationId ? [c.followUpObservationId] : []),
      ]),
    ),
  ];
  const sources = await Promise.all(
    ids.map(async (observationId) => {
      const source = await fetchInternalQuery(internal.observations.readPublishedObservation, {
        actorAccountId: session.claims.sub,
        observationId,
      });
      if (source.kind !== "allowed")
        throw new Error("A coaching evidence source is not available.");
      return [observationId, source.record as CoachingEvidence] as const;
    }),
  );
  const byId = new Map(sources);
  const pageHref = (key: string, value: string) =>
    `${path}?${new URLSearchParams({ ...cursors, [key]: value } as Record<string, string>)}`;
  return (
    <>
      <SiteHeader isAuthenticated showReports={!result.isSelf} showMyReport={result.isSelf} />
      <main id="main-content" className="page-shell report-stack">
        <h1>Coaching: {result.teacherName}</h1>
        <p>
          Agree on one action. Model it. Rehearse it. Use it in class. Review new evidence together.
        </p>
        <Link
          href={
            result.isSelf
              ? "/my-report"
              : `/reports/teachers/${encodeURIComponent(teacherProfileId)}`
          }
        >
          Open teacher report
        </Link>
        {!result.isSelf ? (
          <details className="card">
            <summary>Start a coaching cycle</summary>
            <CoachingForm
              teacherProfileId={teacherProfileId}
              evidence={evidence}
              skills={skills.filter((skill) =>
                evidence.some((row) => row.items.some((item) => item.skillId === skill.id)),
              )}
            />
          </details>
        ) : null}
        {cycles.length === 0 ? <p>No coaching cycles on this page.</p> : null}
        {cycles.map((cycle) => (
          <section className="card" key={cycle._id}>
            <h2>{skills.find((s) => s.id === cycle.skillId)?.title ?? cycle.skillId}</h2>
            <p>
              {cycle.state === "complete" ? "Review complete" : "Active"} · Follow-up:{" "}
              {cycle.followUpDate}
              {cycle.state === "active" &&
              cycle.followUpDate < new Date().toISOString().slice(0, 10)
                ? " · Follow-up overdue"
                : ""}
            </p>
            <p>
              <strong>Agreed action:</strong> {cycle.action}
            </p>
            <p>
              <strong>School support:</strong> {cycle.support}
            </p>
            <p>
              <strong>Teacher reflection:</strong> {cycle.reflection || "No reflection yet."}
            </p>
            <div className="card-grid">
              {(
                [
                  ["Baseline", cycle.baselineObservationId],
                  ["Follow-up", cycle.followUpObservationId],
                ] as const
              ).map(([label, id]) => {
                const record = id ? byId.get(id) : null;
                const item = record?.items.find((i) => i.skillId === cycle.skillId);
                return (
                  <div key={label}>
                    <h3>{label}</h3>
                    {id && record ? (
                      <>
                        <p>{new Date(record.observedAt).toLocaleString()}</p>
                        <p>
                          {item?.outcome?.kind === "rated"
                            ? `Rating ${item.outcome.rating}`
                            : "Not enough evidence"}
                        </p>
                        <p>{item?.evidenceNote ?? "No evidence note."}</p>
                        <Link href={`/observations/records/${encodeURIComponent(id)}`}>
                          Open {label.toLowerCase()} evidence and feedback
                        </Link>
                      </>
                    ) : (
                      <p>No follow-up evidence linked.</p>
                    )}
                  </div>
                );
              })}
            </div>
            <p>
              These are direct records for the selected technique. They do not establish all
              component requirements.
            </p>
            {cycle.conclusion ? (
              <p>
                <strong>Evidence review:</strong> {cycle.conclusion}
              </p>
            ) : null}
            {cycle.state === "active" ? (
              <details>
                <summary>
                  {result.isSelf ? "Add teacher reflection" : "Update coaching cycle"}
                </summary>
                <CoachingForm
                  key={`${cycle._id}-${cycle.revision}`}
                  teacherProfileId={teacherProfileId}
                  cycle={cycle}
                  isSelf={result.isSelf}
                  evidence={evidence}
                  skills={skills}
                />
              </details>
            ) : null}
          </section>
        ))}
        {!result.page.isDone ? (
          <Link href={pageHref("cursor", result.page.continueCursor)}>Next coaching page</Link>
        ) : null}
        <section className="card">
          <h2>Published evidence available for selection</h2>
          <ul>
            {evidence.map((row) => (
              <li key={row.observationId}>
                <Link href={`/observations/records/${encodeURIComponent(row.observationId)}`}>
                  {new Date(row.observedAt).toLocaleString()}
                </Link>
              </li>
            ))}
          </ul>
          {!history.page.isDone ? (
            <Link href={pageHref("evidenceCursor", history.page.continueCursor)}>
              Next evidence page
            </Link>
          ) : null}
        </section>
      </main>
    </>
  );
}
