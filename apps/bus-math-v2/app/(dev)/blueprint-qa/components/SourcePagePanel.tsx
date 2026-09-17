'use client';

import { ExternalLink, FileWarning } from 'lucide-react';
import type { ReviewDecision, SkillNode, SourceDocument } from '../types';
import { ReviewDecisionControls } from './ReviewDecisionControls';

interface SourcePagePanelProps {
  example: SkillNode | null;
  documents: SourceDocument[];
  documentKey: string | null;
  page: number;
  hasExactPageReference: boolean;
  decision: ReviewDecision | undefined;
  onDocumentChange: (documentKey: string) => void;
  onPageChange: (page: number) => void;
  onDecisionChange: (decision: ReviewDecision) => void;
}

function sourceReferenceText(node: SkillNode): string[] {
  return (node.sourceRefs ?? []).map((reference) => {
    if (typeof reference === 'string') return reference;
    return reference.url ?? [reference.source, reference.location].filter(Boolean).join(' — ');
  });
}

export function SourcePagePanel({
  example,
  documents,
  documentKey,
  page,
  hasExactPageReference,
  decision,
  onDocumentChange,
  onPageChange,
  onDecisionChange,
}: SourcePagePanelProps) {
  const document = documents.find((candidate) => candidate.key === documentKey) ?? null;
  const pdfUrl = document ? `/api/dev/curriculum-source?document=${encodeURIComponent(document.key)}` : null;

  return (
    <section className="min-w-0 border border-[#C9C4B5] bg-[#FDFCF5]">
      <div className="border-b border-[#C9C4B5] bg-[#EEEADF] px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#365451]">Source page</p>
        <h2 className="mt-1 font-serif text-xl text-[#0A1C1A]">
          {example?.title ?? 'No worked example is available'}
        </h2>
        {example && <code className="mt-1 block break-all text-xs text-[#365451]">{example.id}</code>}
      </div>

      <div className="space-y-4 p-4">
        {documents.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-[1fr_8rem_auto] sm:items-end">
            <label className="text-xs font-semibold text-[#365451]">
              PDF document
              <select
                value={documentKey ?? ''}
                onChange={(event) => onDocumentChange(event.target.value)}
                className="mt-1 block w-full border border-[#8A958E] bg-white px-2 py-2 text-sm text-[#0A1C1A]"
              >
                {documents.map((candidate) => (
                  <option key={candidate.key} value={candidate.key}>{candidate.title}</option>
                ))}
              </select>
            </label>
            <label className="text-xs font-semibold text-[#365451]">
              PDF page
              <input
                type="number"
                min={1}
                value={page}
                onChange={(event) => onPageChange(Math.max(1, Number(event.target.value) || 1))}
                className="mt-1 block w-full border border-[#8A958E] bg-white px-2 py-2 text-sm text-[#0A1C1A]"
              />
            </label>
            {pdfUrl && (
              <a
                href={`${pdfUrl}#page=${page}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 border border-[#2D7D46] px-3 py-2 text-sm font-semibold text-[#2D7D46]"
              >
                Open <ExternalLink className="size-4" aria-hidden="true" />
              </a>
            )}
          </div>
        ) : (
          <div className="flex gap-2 border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">
            <FileWarning className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <p>No approved curriculum PDF is configured for this module or unit.</p>
          </div>
        )}

        {example && !hasExactPageReference && (
          <div role="status" className="border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">
            <p className="font-semibold">Page reference missing</p>
            <p className="mt-1">Use the page control to inspect the PDF. This manual page does not change the graph.</p>
          </div>
        )}

        {pdfUrl && (
          <iframe
            key={`${documentKey}-${page}`}
            title={`${document?.title ?? 'Curriculum PDF'} page ${page}`}
            src={`${pdfUrl}#page=${page}&zoom=page-width`}
            className="h-[58vh] min-h-[34rem] w-full border border-[#8A958E] bg-white"
          />
        )}

        {example && (
          <div className="space-y-3 border-t border-[#C9C4B5] pt-4 text-sm text-[#0A1C1A]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#365451]">Graph source references</p>
              {sourceReferenceText(example).length > 0 ? (
                <ul className="mt-1 list-disc space-y-1 pl-5 font-mono text-xs">
                  {sourceReferenceText(example).map((reference) => <li key={reference} className="break-all">{reference}</li>)}
                </ul>
              ) : <p className="mt-1 text-amber-800">Missing</p>}
            </div>
            {typeof example.metadata.rawText === 'string' && (
              <details>
                <summary className="cursor-pointer font-semibold">Existing extracted text</summary>
                <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap bg-[#EEEADF] p-3 text-xs">{example.metadata.rawText}</pre>
              </details>
            )}
          </div>
        )}

        {example && (
          <ReviewDecisionControls
            label="Source alignment"
            decision={decision}
            onChange={onDecisionChange}
          />
        )}
      </div>
    </section>
  );
}
