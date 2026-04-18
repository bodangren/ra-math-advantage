'use client';

import { cn } from '@/lib/utils';
import type { StudentProficiencyView } from '@/lib/practice/objective-proficiency';

export interface ObjectiveProficiencyBadgeProps {
  view: StudentProficiencyView;
}

const LABEL_CLASSES: Record<StudentProficiencyView['proficiencyLabel'], string> = {
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

export function ObjectiveProficiencyBadge({ view }: ObjectiveProficiencyBadgeProps) {
  const labelText = view.proficiencyLabel
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  const fluencyText =
    view.fluencyConfidence === 'none'
      ? 'Not enough data'
      : view.fluencyConfidence.charAt(0).toUpperCase() + view.fluencyConfidence.slice(1);

  return (
    <div
      data-testid="proficiency-badge"
      className="rounded-lg border border-border bg-card p-4 shadow-sm"
    >
      <div className="flex items-center gap-3 mb-3">
        <span
          className={cn(
            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
            LABEL_CLASSES[view.proficiencyLabel],
          )}
        >
          {labelText}
        </span>
        <span
          className={cn(
            'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
            FLUENCY_CLASSES[view.fluencyConfidence] ?? FLUENCY_CLASSES.none,
          )}
          aria-label={`Fluency: ${fluencyText.toLowerCase()}`}
        >
          Fluency: {fluencyText}
        </span>
      </div>

      <p className="text-sm text-foreground">{view.guidance}</p>
    </div>
  );
}
