import Link from "next/link";
import { requireAdminSessionClaims } from "@/lib/auth/server";
import { fetchInternalQuery, internal } from "@/lib/convex/server";
import type { Id } from "@/convex/_generated/dataModel";
export default async function CurriculumReview({
  searchParams,
}: {
  searchParams: Promise<{ cursor?: string }>;
}) {
  const claims = await requireAdminSessionClaims("/admin/curriculum");
  const { cursor } = await searchParams;
  const data = await fetchInternalQuery(internal.publication.listDrafts, {
    adminId: claims.sub as Id<"profiles">,
    ...(cursor ? { cursor } : {}),
  });
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-6">
      <h1 className="text-3xl font-display">Curriculum drafts</h1>
      <p>
        Review the lesson text, questions, and answers before publication.
        Published lessons become available for class assignments.
      </p>
      {data.drafts.length === 0 ? (
        <p>No drafts are available on this page.</p>
      ) : (
        <ul className="space-y-4">
          {data.drafts.map((draft) => (
            <li key={draft.id} className="card-surface p-5">
              <Link href={`/admin/curriculum/${draft.id}`}>
                Module {draft.unitNumber}: {draft.title}
              </Link>
              <p>Revision {draft.version}</p>
            </li>
          ))}
        </ul>
      )}
      {data.nextCursor && (
        <Link
          href={`/admin/curriculum?cursor=${encodeURIComponent(data.nextCursor)}`}
        >
          Next drafts
        </Link>
      )}
      <p>
        <Link href="/teacher/dashboard">Return to my classes</Link>
      </p>
    </div>
  );
}
