'use client';

import { cn } from '@/lib/utils';
import type { TeacherProficiencyView } from '@/lib/practice/objective-proficiency';

export interface TeacherObjectiveDiagnosticCardProps {
  view: TeacherProficiencyView;
}

const LABEL_CLASSES: Record<TeacherProficiencyView['proficiencyLabel'], string> = {
  not_started: 'bg-muted text-muted-foreground',
  in_progress: 'bg-yellow-100 text-yellow-800',
  proficient: 'bg-green-100 text-green-800',
  mastered: 'bg-blue-100 text-blue-800',
};

const FLUENCY_CLASSES: Record<string, string> = {
  none: 'bg-gray-100 text-gray-600',
  low: 'bg-orange-100 text-orange-700',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-green-100 text-green-700',
};

export function TeacherObjectiveDiagnosticCard({ view }: TeacherObjectiveDiagnosticCardProps) {
  const labelText = view.proficiencyLabel
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  const fluencyText =
    view.fluencyConfidence === 'none'
      ? 'Not enough data'
      : view.fluencyConfidence.charAt(0).toUpperCase() + view.fluencyConfidence.slice(1);

  const hasBaselineGap = view.missingBaselines.length > 0;
  const hasLowConfidence = view.lowConfidenceReasons.length > 0;

  return (
    <div
      data-testid="teacher-objective-diagnostic"
      className="rounded-lg border border-border bg-card p-5 shadow-sm space-y-4"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-muted-foreground">{view.standardCode}</span>
            <span
              className={cn(
                'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                LABEL_CLASSES[view.proficiencyLabel],
              )}
            >
              {labelText}
            </span>
          </div>
          <h3 className="text-sm font-medium text-foreground truncate">{view.standardDescription}</h3>
        </div>
      </div>

      {/* Three dimensions */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-md bg-muted/50 p-3 text-center">
          <p className="text-lg font-bold font-mono-num text-foreground">
            {Math.round(view.retentionStrength * 100)}%
          </p>
          <p className="text-xs text-muted-foreground">Retention</p>
        </div>
        <div className="rounded-md bg-muted/50 p-3 text-center">
          <p className="text-lg font-bold font-mono-num text-foreground">
            {Math.round(view.practiceCoverage * 100)}%
          </p>
          <p className="text-xs text-muted-foreground">Coverage</p>
        </div>
        <div className="rounded-md bg-muted/50 p-3 text-center">
          <span
            className={cn(
              'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
              FLUENCY_CLASSES[view.fluencyConfidence] ?? FLUENCY_CLASSES.none,
            )}
          >
            {fluencyText}
          </span>
          <p className="text-xs text-muted-foreground mt-1">Fluency</p>
        </div>
      </div>

      {/* Baseline gap warning */}
      {hasBaselineGap && (
        <div className="rounded-md border border-orange-200 bg-orange-50 p-3 text-sm text-orange-800">
          <p className="font-medium">Baseline gap</p>
          <p className="text-orange-700">
            Missing baseline data for: {view.missingBaselines.join(', ')}
          </p>
        </div>
      )}

      {/* Low confidence reasons */}
      {hasLowConfidence && (
        <div data-testid="low-confidence-reasons" className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">Diagnostic notes</p>
          <ul className="list-disc list-inside text-sm text-foreground space-y-0.5">
            {view.lowConfidenceReasons.map((reason, idx) => (
              <li key={idx}>{reason}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Problem families */}
      {view.problemFamilyDetails.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Problem families</p>
          <div className="flex flex-wrap gap-2">
            {view.problemFamilyDetails.map((family) => (
              <span
                key={family.problemFamilyId}
                className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md border border-border bg-background text-xs text-foreground"
                title={`Sample count: ${family.baselineSampleCount}`}
              >
                <span className="font-mono">{family.problemFamilyId}</span>
                {family.baselineSampleCount === 0 && (
                  <span className="text-orange-600">*</span>
                )}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Guidance */}
      <p className="text-sm text-foreground border-t border-border pt-3">{view.guidance}</p>
    </div>
  );
}
