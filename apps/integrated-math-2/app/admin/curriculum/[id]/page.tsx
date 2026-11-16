import Link from "next/link";
import { notFound } from "next/navigation";
import { MarkdownRenderer } from "@math-platform/lesson-renderer";
import { requireAdminSessionClaims } from "@/lib/auth/server";
import { fetchInternalQuery, internal } from "@/lib/convex/server";
import type { Id } from "@/convex/_generated/dataModel";
import { publishDraft } from "../actions";
export default async function DraftPreview({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; published?: string }>;
}) {
  const { id } = await params;
  const claims = await requireAdminSessionClaims(`/admin/curriculum/${id}`);
  const data = await fetchInternalQuery(internal.publication.previewDraft, {
    adminId: claims.sub as Id<"profiles">,
    versionId: id,
  });
  if (!data) notFound();
  const query = await searchParams;
  const match = /^module-(\d+)-lesson-(\d+)$/.exec(data.slug);
  const worksheet = match
    ? `/curriculum/worksheets/Int2_${match[1].padStart(2, "0")}${match[2].padStart(2, "0")}_practice.pdf`
    : null;
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-6">
      <p>
        <Link href="/admin/curriculum">All curriculum drafts</Link>
      </p>
      <h1 className="text-3xl font-display">{data.title}</h1>
      {worksheet && (
        <p>
          <a href={worksheet} target="_blank" rel="noreferrer">
            Open the original worksheet and figures (PDF)
          </a>
        </p>
      )}
      <p>
        Revision {data.version}. Status: {data.status}.
      </p>
      {query.published && data.status === "published" && (
        <p role="status">
          The lesson is published. Teachers can now assign it to a class.
        </p>
      )}
      {query.error && (
        <p role="alert">
          {query.error === "invalid_content"
            ? "Publication failed. Check phase order, lesson text, and question data."
            : "Publication is unavailable. Try again later."}
        </p>
      )}
      <p>
        This preview includes answers. Check the mathematics, wording, and
        required figures. Publication checks the content structure. It does not
        establish mathematical correctness.
      </p>
      {data.phases.length === 0 && (
        <p>This revision has no phases. It cannot be published.</p>
      )}
      {data.phases.map((phase) => (
        <section key={phase.id} className="card-surface p-6 space-y-4">
          <h2 className="text-2xl font-display">
            {phase.phaseNumber}. {phase.title}
          </h2>
          {phase.sections.map((section, index) => (
            <div key={index}>
              <h3 className="font-semibold">{section.kind}</h3>
              <MarkdownRenderer content={section.body} />
            </div>
          ))}
        </section>
      ))}
      {data.status === "draft" && data.phases.length > 0 && (
        <form action={publishDraft} className="card-surface p-6 space-y-4">
          <input type="hidden" name="versionId" value={data.id} />
          <p>
            Publish this revision after you finish the content review. The
            previous published revision will be archived. Its saved student
            evidence will remain stored.
          </p>
          <button className="btn-primary">
            Publish revision {data.version}
          </button>
        </form>
      )}
    </div>
  );
}
