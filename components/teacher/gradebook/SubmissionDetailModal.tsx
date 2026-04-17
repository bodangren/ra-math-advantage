'use client';

import { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import type { SubmissionEvidence, DeterministicErrorSummary } from '@/lib/practice/error-analysis';

interface PhaseData {
  phaseNumber: number;
  phaseId: string;
  title: string;
  status: string;
  completedAt: number | null;
  spreadsheetData: unknown | null;
  evidence: SubmissionEvidence[];
}

interface SubmissionDetailData {
  studentName: string;
  lessonTitle: string;
  phases: PhaseData[];
  studentErrorSummary: DeterministicErrorSummary | null;
}

interface SubmissionDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: SubmissionDetailData | null;
}

type FilterKind = 'all' | 'practice' | 'spreadsheet';

function statusBadgeClass(status: string): string {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'in_progress':
      return 'bg-yellow-100 text-yellow-800';
    case 'skipped':
      return 'bg-blue-100 text-blue-800';
    case 'not_started':
    default:
      return 'bg-muted/30 text-muted-foreground';
  }
}

function formatDate(timestamp: number | null): string {
  if (timestamp === null) return '—';
  return new Date(timestamp).toLocaleDateString();
}

export function SubmissionDetailModal({ open, onOpenChange, data }: SubmissionDetailModalProps) {
  const [filterKind, setFilterKind] = useState<FilterKind>('all');
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set());

  if (!open || !data) {
    return null;
  }

  const togglePhase = (phaseId: string) => {
    setExpandedPhases((prev) => {
      const next = new Set(prev);
      if (next.has(phaseId)) {
        next.delete(phaseId);
      } else {
        next.add(phaseId);
      }
      return next;
    });
  };

  const filteredPhases = data.phases.filter((phase) => {
    if (filterKind === 'all') return true;
    if (filterKind === 'practice') {
      return phase.evidence.some((e) => e.kind === 'practice');
    }
    if (filterKind === 'spreadsheet') {
      return phase.evidence.some((e) => e.kind === 'spreadsheet');
    }
    return true;
  });

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={data.lessonTitle}
      description={`Student: ${data.studentName}`}
    >
      <div className="space-y-4">
        {data.phases.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No phases found for this lesson.
          </p>
        ) : (
          <>
            <div className="flex gap-2 border-b border-border pb-2">
              {(['all', 'practice', 'spreadsheet'] as FilterKind[]).map((kind) => (
                <button
                  key={kind}
                  onClick={() => setFilterKind(kind)}
                  className={[
                    'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                    filterKind === kind
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted/40',
                  ].join(' ')}
                >
                  {kind.charAt(0).toUpperCase() + kind.slice(1)}
                </button>
              ))}
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredPhases.map((phase) => {
                const isExpanded = expandedPhases.has(phase.phaseId);
                const hasEvidence = phase.evidence.length > 0;

                return (
                  <div
                    key={phase.phaseId}
                    className="border border-border rounded-lg overflow-hidden"
                  >
                    <div
                      className="flex items-center justify-between px-4 py-3 bg-muted/30 cursor-pointer"
                      onClick={() => hasEvidence && togglePhase(phase.phaseId)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono-num text-sm font-medium text-muted-foreground">
                          {phase.phaseNumber}.
                        </span>
                        <span className="font-medium text-foreground">{phase.title}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${statusBadgeClass(phase.status)}`}
                        >
                          {phase.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        {phase.completedAt && (
                          <span className="text-xs text-muted-foreground">
                            {formatDate(phase.completedAt)}
                          </span>
                        )}
                        {hasEvidence && (
                          <span className="text-xs text-muted-foreground">
                            {phase.evidence.length} submission{phase.evidence.length !== 1 ? 's' : ''}
                          </span>
                        )}
                        {hasEvidence && (
                          <svg
                            className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        )}
                      </div>
                    </div>

                    {isExpanded && hasEvidence && (
                      <div className="p-4 space-y-4 border-t border-border">
                        {phase.evidence.map((evidence, idx) => (
                          <div key={idx} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="font-medium text-foreground">
                                  {evidence.activityTitle}
                                </span>
                                <span className="text-sm text-muted-foreground ml-2">
                                  {evidence.kind === 'practice' && evidence.score !== null && evidence.maxScore !== null && (
                                    <span className="font-mono-num">
                                      Score: {evidence.score}/{evidence.maxScore}
                                    </span>
                                  )}
                                </span>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {new Date(evidence.submittedAt).toLocaleDateString()}
                              </span>
                            </div>

                            {evidence.kind === 'practice' && evidence.submissionData && (
                              <div className="pl-4 border-l-2 border-border space-y-2">
                                {renderPracticeEvidence(evidence)}
                              </div>
                            )}

                            {evidence.kind === 'spreadsheet' && evidence.spreadsheetData && (
                              <div className="pl-4 border-l-2 border-border">
                                <p className="text-sm text-muted-foreground">
                                  Spreadsheet submission data available
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {filteredPhases.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No evidence matches the current filter.
                </p>
              )}
            </div>

            {data.studentErrorSummary && (
              <div className="mt-4 p-4 bg-muted/50 rounded-lg border border-border">
                <h4 className="text-sm font-semibold text-foreground mb-2">Error Analysis</h4>
                <div className="text-sm">
                  <span className="text-muted-foreground">Class Average: </span>
                  <span className="font-mono-num font-medium">
                    {Math.round(data.studentErrorSummary.averageAccuracy * 100)}% accuracy
                  </span>
                </div>
                {data.studentErrorSummary.topMisconceptions.length > 0 && (
                  <div className="mt-2">
                    <span className="text-sm text-muted-foreground">Top Misconceptions: </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {data.studentErrorSummary.topMisconceptions.slice(0, 5).map((m) => (
                        <span
                          key={m.tag}
                          className="px-2 py-0.5 bg-orange-100 text-orange-800 rounded text-xs"
                          title={`Affects ${m.affectedStudents.length} students`}
                        >
                          {m.tag} ({m.count})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </Dialog>
  );
}

function renderPracticeEvidence(evidence: SubmissionEvidence): React.ReactNode {
  if (evidence.kind !== 'practice' || !evidence.submissionData) {
    return null;
  }

  const data = evidence.submissionData as {
    parts?: Array<{
      partId: string;
      rawAnswer: unknown;
      isCorrect?: boolean;
      hintsUsed?: number;
      misconceptionTags?: string[];
    }>;
  };

  if (!data.parts) {
    return null;
  }

  return (
    <div className="space-y-2">
      <h5 className="text-sm font-medium text-foreground">Student Answers</h5>
      {data.parts.map((part, index) => (
        <div
          key={part.partId}
          className={[
            'p-3 rounded-lg border',
            part.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50',
          ].join(' ')}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Part {index + 1}</span>
            <div className="flex items-center gap-2">
              {part.hintsUsed !== undefined && part.hintsUsed > 0 && (
                <span className="text-xs text-muted-foreground">
                  Hints used: {part.hintsUsed}
                </span>
              )}
              <span
                className={[
                  'px-2 py-0.5 rounded text-xs font-medium',
                  part.isCorrect ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800',
                ].join(' ')}
              >
                {part.isCorrect ? 'Correct' : 'Incorrect'}
              </span>
            </div>
          </div>
          <p className="text-sm mt-1 font-mono-num">
            {String(part.rawAnswer)}
          </p>
          {part.misconceptionTags && part.misconceptionTags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {part.misconceptionTags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 bg-orange-100 text-orange-800 rounded text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}